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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    if (!doctorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.razorpaySubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Cancel in Razorpay
    // cancel_at_cycle_end: 1 ensures the user keeps access until their paid period ends
    // and only stops future autopay/renewals.
    await razorpay.subscriptions.cancel(doctor.razorpaySubscriptionId, {
      cancel_at_cycle_end: 1,
    });

    // Update locally
    doctor.subscriptionStatus = "canceled";
    await doctor.save();

    await UserSubscription.findOneAndUpdate(
      { razorpaySubscriptionId: doctor.razorpaySubscriptionId },
      { status: "cancelled", cancelAtPeriodEnd: true }
    );

    return NextResponse.json({ message: "Subscription cancelled successfully. You will have access until the end of your billing cycle." });
  } catch (error: any) {
    console.error("Cancellation error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel subscription" }, { status: 500 });
  }
}
