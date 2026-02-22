import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import { getAvailableSlots } from "@/lib/appointmentUtils";

// GET — Available slots for a given date
// Query: ?date=2026-02-21&duration=60
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { searchParams } = new URL(req.url);

    const date     = searchParams.get("date");
    const duration = parseInt(searchParams.get("duration") || "60");

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const doctor = await Doctor.findById(doctorId).lean() as any;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate.getTime() + 86400000);

    // Get already booked slots
    const booked = await Appointment.find({
      doctorId,
      date: { $gte: targetDate, $lt: nextDate },
      status: { $nin: ["CANCELLED", "RESCHEDULED"] },
    })
      .select("startTime endTime")
      .lean();

    const slots = getAvailableSlots({
      date: targetDate,
      workStart:     doctor?.workStartTime || "07:00",
      workEnd:       doctor?.workEndTime   || "21:00",
      breakStart:    doctor?.breakStartTime,
      breakEnd:      doctor?.breakEndTime,
      slotDuration:  duration,
      bookedSlots:   booked.map((b) => ({
        startTime: b.startTime,
        endTime:   b.endTime,
      })),
    });

    return NextResponse.json({ slots, date, duration });
  } catch (error) {
    console.error("Get slots error:", error);
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}
