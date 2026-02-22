import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Client from "@/models/Client";
import Appointment from "@/models/Appointment";
import Session from "@/models/Session";
import Billing from "@/models/Billing";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Run all queries in parallel
    const [
      totalClients,
      activeClients,
      inactiveClients,
      dischargedClients,
      todayAppointments,
      sessionsThisMonth,
      newClientsThisMonth,
      revenueResult,
      pendingResult,
      noShowsThisWeek,
    ] = await Promise.all([
      // Total clients
      Client.countDocuments({ doctorId }),

      // Active clients
      Client.countDocuments({ doctorId, status: "ACTIVE" }),

      // Inactive clients
      Client.countDocuments({ doctorId, status: "INACTIVE" }),

      // Discharged clients
      Client.countDocuments({ doctorId, status: "DISCHARGED" }),

      // Today's appointments
      Appointment.countDocuments({
        doctorId,
        date: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999)),
        },
        status: { $nin: ["CANCELLED"] },
      }),

      // Sessions this month
      Session.countDocuments({
        doctorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),

      // New clients this month
      Client.countDocuments({
        doctorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),

      // Revenue collected this month
      Billing.aggregate([
        {
          $match: {
            doctorId: doctorId,
            date: { $gte: monthStart, $lte: monthEnd },
            status: { $in: ["PAID", "PARTIAL"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]),

      // Pending dues this month
      Billing.aggregate([
        {
          $match: {
            doctorId: doctorId,
            status: { $in: ["PENDING", "PARTIAL"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $subtract: ["$totalFee", "$amountPaid"] } },
          },
        },
      ]),

      // No-shows this week
      Appointment.countDocuments({
        doctorId,
        status: "NO_SHOW",
        date: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return NextResponse.json({
      totalClients,
      activeClients,
      inactiveClients,
      dischargedClients,
      todayAppointments,
      sessionsThisMonth,
      newClientsThisMonth,
      revenueThisMonth: revenueResult[0]?.total || 0,
      pendingDues: pendingResult[0]?.total || 0,
      noShowsThisWeek,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
