import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";
import { sendPasswordResetConfirmation } from "@/lib/emailUtils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, resetToken, newPassword, confirmPassword } = await req.json();

    // Validate inputs
    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex = {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      number: /[0-9]/,
      special: /[^A-Za-z0-9]/,
    };

    if (!passwordRegex.uppercase.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }
    if (!passwordRegex.lowercase.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400 }
      );
    }
    if (!passwordRegex.number.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      );
    }
    if (!passwordRegex.special.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character" },
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

    // Verify reset token
    if (doctor.resetToken !== resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset fields
    await Doctor.updateOne(
      { _id: doctor._id },
      {
        passwordHash: hashedPassword,
        resetToken: null,
        resetOTP: null,
        resetOTPExpiry: null,
      }
    );

    // Send confirmation email
    try {
      await sendPasswordResetConfirmation(doctor.email, doctor.name);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue anyway as password is already reset
    }

    return NextResponse.json(
      {
        message: "Password reset successful",
        email: doctor.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
