import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Appointment from "@/models/Appointment";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip  = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate("clientId", "name phone therapyType")
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
    ]);

    return NextResponse.json({ 
      appointments,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    });
  } catch (error) {
    console.error("Today's schedule error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
