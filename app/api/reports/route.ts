import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Client from "@/models/Client";
import Appointment from "@/models/Appointment";
import Session from "@/models/Session";
import Billing from "@/models/Billing";
import { format } from "date-fns";

/**
 * GET /api/reports
 * Get analytics and reports for the authenticated doctor
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);

    const { searchParams } = new URL(req.url);

    // ── Safe date parsing ─────────────────────────────────
    const rawStart = searchParams.get("startDate");
    const rawEnd   = searchParams.get("endDate");

    const startDate = rawStart ? new Date(rawStart) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate   = rawEnd   ? new Date(rawEnd)   : new Date();

    // Guard: reject invalid dates before hitting DB
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid startDate or endDate query param" },
        { status: 400 }
      );
    }

    const [
      totalClients,
      activeClients,
      inactiveClients,
      dischargedClients,
      newClients,
      totalAppointments,
      appointmentsCompleted,
      appointmentsNoShow,
      appointmentsCancelled,
      sessions,
      bills,
      clientsForAcquisition,
    ] = await Promise.all([
      Client.countDocuments({ doctorId }),
      Client.countDocuments({ doctorId, status: "ACTIVE" }),
      Client.countDocuments({ doctorId, status: "INACTIVE" }),
      Client.countDocuments({ doctorId, status: "DISCHARGED" }),
      Client.countDocuments({ doctorId, createdAt: { $gte: startDate, $lte: endDate } }),

      Appointment.countDocuments({ doctorId, date: { $gte: startDate, $lte: endDate } }),
      Appointment.countDocuments({ doctorId, date: { $gte: startDate, $lte: endDate }, status: "PRESENT" }),
      Appointment.countDocuments({ doctorId, date: { $gte: startDate, $lte: endDate }, status: "NO_SHOW" }),
      Appointment.countDocuments({ doctorId, date: { $gte: startDate, $lte: endDate }, status: "CANCELLED" }),

      Session.find({ doctorId, createdAt: { $gte: startDate, $lte: endDate } })
        .select("durationMins progress createdAt")
        .lean(),

      Billing.find({ doctorId, createdAt: { $gte: startDate, $lte: endDate } })
        .select("totalFee amountPaid status createdAt")
        .lean(),

      // Moved here to run in parallel instead of a second await
      Client.find({ doctorId, createdAt: { $gte: startDate, $lte: endDate } })
        .select("createdAt")
        .lean(),
    ]);

    // ── SESSION CALCULATIONS ──────────────────────────────
    const totalSessions      = sessions.length;
    const avgSessionDuration = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.durationMins || 0), 0) / totalSessions
      : 0;
    const sessionsImproving  = sessions.filter((s) => s.progress === "IMPROVING").length;
    const sessionsWorsening  = sessions.filter((s) => s.progress === "WORSENING").length;

    // ── BILLING CALCULATIONS ──────────────────────────────
    const totalRevenue = bills.reduce((sum, b) => sum + (b.totalFee    || 0), 0);
    const totalPaid    = bills.reduce((sum, b) => sum + (b.amountPaid  || 0), 0);
    const pendingDues  = totalRevenue - totalPaid;
    const totalBills   = bills.length;
    const pendingBills = bills.filter((b) => b.status === "PENDING").length;

    // ── MONTHLY REVENUE BREAKDOWN ─────────────────────────
    const monthlyRevenue: Record<string, number> = {};

    bills.forEach((b) => {
      // Guard: skip if createdAt is missing or invalid
      if (!b.createdAt) return;
      const date = new Date(b.createdAt as any);
      if (isNaN(date.getTime())) return;
      const month = format(date, "MMM yyyy");
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.amountPaid || 0);
    });

    // ── ACQUISITION TRENDS ────────────────────────────────
    const acquisitionTrends: Record<string, number> = {};

    clientsForAcquisition.forEach((c) => {
      // Guard: skip if createdAt is missing or invalid
      if (!c.createdAt) return;
      const date = new Date(c.createdAt as any);
      if (isNaN(date.getTime())) return;
      const month = format(date, "MMM yyyy");
      acquisitionTrends[month] = (acquisitionTrends[month] || 0) + 1;
    });

    return NextResponse.json(
      {
        // Client metrics
        totalClients,
        activeClients,
        inactiveClients,
        dischargedClients,
        newClients,

        // Appointment metrics
        totalAppointments,
        appointmentsCompleted,
        appointmentsNoShow,
        appointmentsCancelled,

        // Session metrics
        totalSessions,
        avgSessionDuration,
        sessionsImproving,
        sessionNoShows: sessionsWorsening,

        // Billing metrics
        totalRevenue,
        totalPaid,
        pendingDues,
        totalBills,
        pendingBills,

        // Trend data
        monthlyRevenue,
        acquisitionTrends,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}