import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Doctor, { IDoctor } from "@/models/Doctor";

/**
 * GET /api/auth/profile
 * Returns the authenticated doctor's full profile
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);

    const doctor = await Doctor.findById(doctorId).select("-passwordHash");

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error: any) {
    console.error("GET Profile Error:", error);
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * PUT /api/auth/profile
 * Updates the authenticated doctor's profile
 */
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);

    const body = await req.json();

    // Prevent sensitive fields from being updated directly thru this endpoint if needed
    // For now, we allow general updates excluding password
    const { passwordHash, email, ...updates } = body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error: any) {
    console.error("PUT Profile Error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json({ error: messages[0] }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 400 }
    );
  }
}
