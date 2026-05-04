import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import UserSubscription from "@/models/UserSubscription";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    await connectDB();

    console.log(`Razorpay Webhook: ${event.event}`, event.payload);

    switch (event.event) {
      case "subscription.activated":
      case "subscription.charged": {
        const rzpSubscription = event.payload.subscription.entity;
        const payment = event.payload.payment?.entity;

        const sub = await UserSubscription.findOneAndUpdate(
          { razorpaySubscriptionId: rzpSubscription.id },
          {
            status: "active",
            currentStart: new Date(rzpSubscription.current_start * 1000),
            currentEnd: new Date(rzpSubscription.current_end * 1000),
            nextBillingDate: new Date(rzpSubscription.current_end * 1000),
            billingAmount: payment ? payment.amount / 100 : 0,
            $push: payment ? {
              payments: {
                paymentId: payment.id,
                amount: payment.amount / 100,
                status: payment.status,
                method: payment.method,
                capturedAt: new Date(),
                rawResponse: event,
              }
            } : {},
          },
          { upsert: true, new: true }
        );

        // Update Doctor status
        await Doctor.findByIdAndUpdate(sub.doctorId, {
          subscriptionStatus: "active",
          subscriptionExpiry: new Date(rzpSubscription.current_end * 1000),
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        const rzpSubscription = event.payload.subscription.entity;
        const sub = await UserSubscription.findOneAndUpdate(
          { razorpaySubscriptionId: rzpSubscription.id },
          { status: event.event === "subscription.cancelled" ? "cancelled" : "expired" }
        );

        if (sub) {
          await Doctor.findByIdAndUpdate(sub.doctorId, {
            subscriptionStatus: event.event === "subscription.cancelled" ? "canceled" : "expired",
          });
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        // Log failure for the subscription
        if (payment.subscription_id) {
          await UserSubscription.findOneAndUpdate(
            { razorpaySubscriptionId: payment.subscription_id },
            {
              $push: {
                payments: {
                  paymentId: payment.id,
                  amount: payment.amount / 100,
                  status: "failed",
                  method: payment.method,
                  capturedAt: new Date(),
                  rawResponse: event,
                }
              }
            }
          );
        }
        break;
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
