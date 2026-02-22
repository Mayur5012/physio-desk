import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token" },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    await connectDB();
    const doctor = await Doctor.findById(payload.doctorId).lean() as any;

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 401 }
      );
    }

    const newToken = signToken({
      doctorId:   doctor._id.toString(),
      email:      doctor.email,
      clinicName: doctor.clinicName,
    });

    const response = NextResponse.json({ message: "Token refreshed" });

    response.cookies.set("accessToken", newToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24,
      path:     "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }
}
