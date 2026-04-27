import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { verifyOTP, generateResetToken } from "@/lib/otpUtils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find doctor
    const doctor = await Doctor.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify OTP
    if (!doctor.resetOTP || !doctor.resetOTPExpiry) {
      return NextResponse.json(
        { error: "No OTP request found. Please request a new OTP." },
        { status: 400 }
      );
    }

    const isValid = verifyOTP(otp, doctor.resetOTP, doctor.resetOTPExpiry);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Clear OTP and save reset token
    await Doctor.updateOne(
      { _id: doctor._id },
      {
        resetOTP: null,
        resetOTPExpiry: null,
        resetToken: resetToken,
      }
    );

    return NextResponse.json(
      {
        message: "OTP verified successfully",
        resetToken: resetToken,
        email: doctor.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
