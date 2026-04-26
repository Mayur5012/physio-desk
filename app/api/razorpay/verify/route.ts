import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import UserSubscription from "@/models/UserSubscription";
import { getAuthDoctor } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_payment_id + "|" + razorpay_subscription_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update doctor status
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Determine expiry based on plan
    let monthsToAdd = 1;
    if (doctor.razorpayPlanId === "plan_quarterly_3") monthsToAdd = 3;
    if (doctor.razorpayPlanId === "plan_halfyearly_6") monthsToAdd = 6;
    if (doctor.razorpayPlanId === "plan_yearly_12") monthsToAdd = 12;

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

    doctor.subscriptionStatus = "active";
    doctor.subscriptionExpiry = expiryDate;
    await doctor.save();

    // Update UserSubscription log
    await UserSubscription.findOneAndUpdate(
      { razorpaySubscriptionId: razorpay_subscription_id },
      {
        status: "active",
        currentStart: new Date(),
        currentEnd: expiryDate,
      }
    );

    return NextResponse.json({ message: "Subscription activated successfully" });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
