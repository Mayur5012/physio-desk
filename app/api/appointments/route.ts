import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import Client from "@/models/Client";
import {
  calcEndTime, timesOverlap,
  generateRecurringDates,
} from "@/lib/appointmentUtils";
import { v4 as uuidv4 } from "uuid";
import { sendAppointmentReminderEmail } from "@/lib/emailUtils";
import { format } from "date-fns";

// GET — List appointments (by date range or clientId)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { searchParams } = new URL(req.url);

    const clientId  = searchParams.get("clientId");
    const dateFrom  = searchParams.get("dateFrom");
    const dateTo    = searchParams.get("dateTo");
    const status    = searchParams.get("status");
    const page      = parseInt(searchParams.get("page")  || "1");
    const limit     = parseInt(searchParams.get("limit") || "50");
    const skip      = (page - 1) * limit;

    const filter: any = { doctorId };

    if (clientId) filter.clientId = clientId;

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo)   filter.date.$lte = new Date(dateTo);
    }

    if (status && status !== "ALL") filter.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("clientId", "name phone therapyType")
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return NextResponse.json({ appointments, total, page });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}


// POST — Create appointment (single or recurring)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const body = await req.json();

    const {
      clientId, date, startTime, durationMins,
      type, practiceType, notes,
      isRecurring, recurrencePattern,
      recurrenceEveryN, recurrenceEndDate,
      endAfterSessions, customDays,
    } = body;

    if (!clientId || !date || !startTime || !durationMins || !practiceType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const endTime = calcEndTime(startTime, Number(durationMins));

    // Fetch doctor and client settings
    const [doctor, client] = await Promise.all([
      Doctor.findById(doctorId).lean(),
      Client.findById(clientId).lean(),
    ]) as [any, any];

    if (!doctor || !client) {
      return NextResponse.json({ error: "Doctor or Client not found" }, { status: 404 });
    }

    const workStart = doctor?.workStartTime || "07:00";
    const workEnd   = doctor?.workEndTime   || "21:00";

    const { timeToMinutes } = await import("@/lib/appointmentUtils");
    if (
      timeToMinutes(startTime) < timeToMinutes(workStart) ||
      timeToMinutes(endTime)   > timeToMinutes(workEnd)
    ) {
      return NextResponse.json(
        { error: `Appointment must be within working hours (${workStart} – ${workEnd})` },
        { status: 400 }
      );
    }

    // Helper for sending reminders
    const triggerReminders = async (appts: any[]) => {
      if (client.email && client.reminderEnabled) {
        // Send reminder for the first/upcoming appointment
        const firstAppt = appts[0];
        await sendAppointmentReminderEmail({
          toEmail: client.email,
          patientName: client.name,
          doctorName: doctor.name,
          clinicName: doctor.clinicName || "Our Clinic",
          appointmentDate: format(new Date(firstAppt.date), "EEEE, dd MMM yyyy"),
          appointmentTime: firstAppt.startTime,
        });
      }
    };

    // ── Single Appointment ──────────────────────────────────
    if (!isRecurring) {
      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);

      const conflict = await Appointment.findOne({
        doctorId,
        date: {
          $gte: appointmentDate,
          $lt:  new Date(appointmentDate.getTime() + 86400000),
        },
        status: { $nin: ["CANCELLED", "RESCHEDULED"] },
      });

      if (
        conflict &&
        timesOverlap(startTime, endTime, conflict.startTime, conflict.endTime)
      ) {
        return NextResponse.json(
          { error: `Slot conflict with ${conflict.startTime}–${conflict.endTime}`, conflict: true },
          { status: 409 }
        );
      }

      const appointment = await Appointment.create({
        doctorId, clientId,
        date: appointmentDate,
        startTime, endTime,
        durationMins: Number(durationMins),
        type: type || "FOLLOWUP",
        practiceType,
        notes: notes || undefined,
        isRecurring: false,
      });

      await triggerReminders([appointment]);

      return NextResponse.json({ message: "Appointment booked", appointment }, { status: 201 });
    }

    // ── Recurring Appointments ──────────────────────────────
    const groupId = uuidv4();
    const startDate = new Date(date);

    const dates = generateRecurringDates({
      startDate,
      pattern:           recurrencePattern,
      everyN:            recurrenceEveryN ? Number(recurrenceEveryN) : 1,
      customDays:        customDays || [],
      endAfterSessions:  endAfterSessions ? Number(endAfterSessions) : undefined,
      endDate:           recurrenceEndDate ? new Date(recurrenceEndDate) : undefined,
    });

    if (dates.length === 0) {
      return NextResponse.json({ error: "No valid dates generated" }, { status: 400 });
    }

    const appointments = await Appointment.insertMany(
      dates.map((d) => ({
        doctorId, clientId,
        date: d,
        startTime, endTime,
        durationMins: Number(durationMins),
        type: type || "FOLLOWUP",
        practiceType,
        notes: notes || undefined,
        isRecurring: true,
        recurrenceGroupId: groupId,
        recurrencePattern,
        recurrenceEveryN:   recurrenceEveryN ? Number(recurrenceEveryN) : undefined,
        recurrenceEndDate:  recurrenceEndDate ? new Date(recurrenceEndDate) : undefined,
      }))
    );

    await triggerReminders(appointments);

    return NextResponse.json({ message: `${appointments.length} appointments created`, count: appointments.length, groupId }, { status: 201 });
  } catch (error: any) {
    console.error("Create appointment error:", error);
    return NextResponse.json({ error: error.message || "Failed to create appointment" }, { status: 500 });
  }
}

