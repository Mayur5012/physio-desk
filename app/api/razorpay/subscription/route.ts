import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAuthDoctor } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import UserSubscription from "@/models/UserSubscription";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PLAN_ID_MAP: Record<string, { id: string; amount: number }> = {
  "plan_monthly_1": { id: process.env.RAZORPAY_PLAN_MONTHLY || "plan_M1", amount: 999 },
  "plan_quarterly_3": { id: process.env.RAZORPAY_PLAN_QUARTERLY || "plan_Q3", amount: 2499 },
  "plan_halfyearly_6": { id: process.env.RAZORPAY_PLAN_HALFYEARLY || "plan_H6", amount: 4499 },
  "plan_yearly_12": { id: process.env.RAZORPAY_PLAN_YEARLY || "plan_Y12", amount: 7999 },
};

export async function POST(req: NextRequest) {
  console.log("Subscription request received");
  console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...` : "MISSING");
  console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "PRESENT (MASKED)" : "MISSING");

  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { planId } = await req.json();

    const rzpPlan = PLAN_ID_MAP[planId];
    if (!rzpPlan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Create Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: rzpPlan.id,
      customer_notify: 1,
      total_count: 12,
      notes: {
        doctorId: doctorId,
        planId: planId,
      },
    });

    // Create UserSubscription log
    await UserSubscription.create({
      doctorId: doctor._id,
      planId: planId,
      razorpaySubscriptionId: subscription.id,
      status: "pending",
      amount: rzpPlan.amount,
      currency: "INR",
    });

    // Update doctor with subscription ID
    doctor.razorpaySubscriptionId = subscription.id;
    doctor.razorpayPlanId = planId;
    await doctor.save();

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error: any) {
    console.error("Razorpay subscription error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
