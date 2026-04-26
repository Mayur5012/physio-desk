import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import { calcEndTime } from "@/lib/appointmentUtils";
import { createBillingFromAppointment } from "@/lib/billingUtils";

// ── GET — Single appointment ───────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id } = await params;

    const appointment = await Appointment.findOne({ _id: id, doctorId })
      .populate("clientId", "name phone email therapyType")
      .lean();

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Get appointment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// ── PUT — Update appointment ───────────────────────────────
// scope: "single" | "future" | "all"
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id } = await params;
    const body = await req.json();
    const { scope = "single", ...updates } = body;

    // Recalculate endTime if startTime or duration changed
    if (updates.startTime && updates.durationMins) {
      updates.endTime = calcEndTime(
        updates.startTime,
        Number(updates.durationMins)
      );
    }

    // ── Single update ────────────────────────────────────
    if (scope === "single") {
      const currentAppt = await Appointment.findOne({ _id: id, doctorId });
      if (!currentAppt) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      const appt = await Appointment.findOneAndUpdate(
        { _id: id, doctorId },
        { $set: updates },
        { new: true }
      );

      if (!appt) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Auto-create billing if status changes to PRESENT
      let autoBillingCreated = false;
      if (
        updates.status === "PRESENT" &&
        currentAppt.status !== "PRESENT"
      ) {
        try {
          await createBillingFromAppointment({
            doctorId: new mongoose.Types.ObjectId(doctorId),
            clientId: appt.clientId,
            appointmentId: appt._id,
            date: appt.date,
          });
          autoBillingCreated = true;
        } catch (billingError) {
          console.error("Auto-billing failed:", billingError);
          // Don't fail the appointment update if billing fails
        }
      }

      return NextResponse.json({
        message: "Appointment updated",
        appointment: appt,
        autoBillingCreated,
      });
    }

    // ── Future or all in recurrence group ────────────────
    if (scope === "future" || scope === "all") {
      const current = await Appointment.findOne({ _id: id, doctorId });
      if (!current?.recurrenceGroupId) {
        return NextResponse.json(
          { error: "No recurrence group found" },
          { status: 400 }
        );
      }

      const dateFilter = scope === "future"
        ? { date: { $gte: current.date } }
        : {};

      await Appointment.updateMany(
        {
          recurrenceGroupId: current.recurrenceGroupId,
          doctorId,
          ...dateFilter,
        },
        { $set: updates }
      );

      return NextResponse.json({
        message: `Updated ${scope} appointments in series`,
      });
    }

    return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// ── DELETE — Cancel appointment ────────────────────────────
// scope query param: "single" | "future" | "all"
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "single";

    if (scope === "single") {
      await Appointment.findOneAndUpdate(
        { _id: id, doctorId },
        { $set: { status: "CANCELLED" } }
      );
      return NextResponse.json({ message: "Appointment cancelled" });
    }

    const current = await Appointment.findOne({ _id: id, doctorId });
    if (!current?.recurrenceGroupId) {
      return NextResponse.json(
        { error: "No recurrence group found" },
        { status: 400 }
      );
    }

    const dateFilter = scope === "future"
      ? { date: { $gte: current.date } }
      : {};

    await Appointment.updateMany(
      {
        recurrenceGroupId: current.recurrenceGroupId,
        doctorId,
        ...dateFilter,
      },
      { $set: { status: "CANCELLED" } }
    );

    return NextResponse.json({
      message: `Cancelled ${scope} appointments in series`,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}