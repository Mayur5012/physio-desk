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
    const startDate = new Date(searchParams.get("startDate") || "");
    const endDate = new Date(searchParams.get("endDate") || "");

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
      bills
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
      
      Session.find({ doctorId, createdAt: { $gte: startDate, $lte: endDate } }).select("durationMins progress").lean(),
      Billing.find({ doctorId, createdAt: { $gte: startDate, $lte: endDate } }).select("totalFee amountPaid status").lean(),
    ]);

    // ── SESSION CALCULATIONS ──────────────────────────────
    const totalSessions = sessions.length;
    const avgSessionDuration =
      totalSessions > 0
        ? sessions.reduce((sum, s) => sum + (s.durationMins || 0), 0) / totalSessions
        : 0;

    const sessionsImproving = sessions.filter((s) => s.progress === "IMPROVING").length;

    // ── BILLING CALCULATIONS ──────────────────────────────
    const totalRevenue = bills.reduce((sum, b) => sum + (b.totalFee || 0), 0);
    const totalPaid = bills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const pendingDues = totalRevenue - totalPaid;

    const totalBills = bills.length;
    const pendingBills = bills.filter((b) => b.status === "PENDING").length;

    // ── ANALYTICS BREAKDOWN (Monthly Revenue & Acquisition) ──
    const monthlyRevenue: Record<string, number> = {};
    const acquisitionTrends: Record<string, number> = {};

    bills.forEach((b) => {
      const month = format(new Date(b.createdAt), "MMM yyyy");
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.amountPaid || 0);
    });

    const clientsForAcquisition = await Client.find({ 
      doctorId, 
      createdAt: { $gte: startDate, $lte: endDate } 
    }).select("createdAt").lean();

    clientsForAcquisition.forEach((c) => {
      const month = format(new Date(c.createdAt), "MMM yyyy");
      acquisitionTrends[month] = (acquisitionTrends[month] || 0) + 1;
    });

    return NextResponse.json(
      {
        totalClients,
        activeClients,
        inactiveClients,
        dischargedClients,
        newClients,
        totalAppointments,
        appointmentsCompleted,
        appointmentsNoShow,
        appointmentsCancelled,
        totalSessions,
        avgSessionDuration,
        sessionsImproving,
        sessionNoShows: sessions.filter((s) => s.progress === "WORSENING").length,
        totalRevenue,
        totalPaid,
        pendingDues,
        totalBills,
        pendingBills,
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


