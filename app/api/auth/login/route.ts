import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find doctor
    const doctor = await Doctor.findOne({
      email: email.toLowerCase().trim(),
    }).lean() as any;

    if (!doctor) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password — using passwordHash field
    const isValid = await bcrypt.compare(password, doctor.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = signToken({
      doctorId:   doctor._id.toString(),
      email:      doctor.email,
      clinicName: doctor.clinicName,
    });

    // Build response and set cookie
    const response = NextResponse.json({
      message: "Login successful",
      doctor: {
        id:         doctor._id,
        name:       doctor.name,
        email:      doctor.email,
        clinicName: doctor.clinicName,
      },
    });

    response.cookies.set("accessToken", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24,  // 24 hours
      path:     "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
