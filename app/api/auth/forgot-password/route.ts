import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { generateOTP, getOTPExpiration } from "@/lib/otpUtils";
import { sendOTPEmail } from "@/lib/emailUtils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find doctor
    const doctor = await Doctor.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!doctor) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        { message: "If email exists, OTP will be sent shortly" },
        { status: 200 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiration();

    // Save OTP to database
    await Doctor.updateOne(
      { _id: doctor._id },
      {
        resetOTP: otp,
        resetOTPExpiry: otpExpiry,
      }
    );

    // Send email with OTP
    try {
      await sendOTPEmail(doctor.email, otp, doctor.name);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP. Please check your email configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "OTP sent to registered email",
        email: doctor.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
