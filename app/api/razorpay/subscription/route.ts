import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAuthDoctor } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import UserSubscription from "@/models/UserSubscription";
import { getPricingForCountry } from "@/lib/pricing";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { planId, countryCode } = await req.json();

    const pricing = getPricingForCountry(countryCode);
    const planKey = planId.replace("plan_", ""); // "1", "6", "12"
    const planData = pricing.plans[planKey];

    if (!planData) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Resolve Razorpay Plan ID from environment or naming convention
    // Format: RAZORPAY_PLAN_INR_1, RAZORPAY_PLAN_USD_6, etc.
    const envPlanId = process.env[`RAZORPAY_PLAN_${pricing.currency}_${planKey}`];
    const rzpPlanId = envPlanId || `plan_${pricing.currency}_${planKey}`;

    // Create Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: rzpPlanId,
      customer_notify: 1,
      total_count: planKey === "12" ? 12 : (planKey === "6" ? 6 : 12), // Adjust as needed
      notes: {
        doctorId: doctorId,
        planId: planId,
        country: countryCode,
        currency: pricing.currency,
      },
    });

    // Create UserSubscription log
    await UserSubscription.create({
      doctorId: doctor._id,
      planId: planId,
      razorpaySubscriptionId: subscription.id,
      status: "pending",
      amount: planData.amount,
      currency: pricing.currency,
    });

    // Update doctor with subscription ID and chosen currency/region
    doctor.razorpaySubscriptionId = subscription.id;
    doctor.razorpayPlanId = planId;
    // We can also store the currency in the doctor model if needed
    await doctor.save();

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error: any) {
    console.error("Razorpay subscription error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

