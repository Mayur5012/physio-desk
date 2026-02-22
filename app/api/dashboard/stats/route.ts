import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Client from "@/models/Client";
import Appointment from "@/models/Appointment";
import Session from "@/models/Session";
import Billing from "@/models/Billing";
import mongoose from "mongoose";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId    = await getAuthDoctor(req);
    const doctorObjId = new mongoose.Types.ObjectId(doctorId); // ← cast once

    const now        = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd   = endOfMonth(now);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

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

      Client.countDocuments({ doctorId }),

      Client.countDocuments({ doctorId, status: "ACTIVE" }),

      Client.countDocuments({ doctorId, status: "INACTIVE" }),

      Client.countDocuments({ doctorId, status: "DISCHARGED" }),

      Appointment.countDocuments({
        doctorId,
        date:   { $gte: todayStart, $lte: todayEnd },
        status: { $nin: ["CANCELLED"] },
      }),

      Session.countDocuments({
        doctorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),

      Client.countDocuments({
        doctorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),

      // ✅ Revenue — ObjectId cast fixes ₹0 bug
      Billing.aggregate([
        {
          $match: {
            doctorId: doctorObjId,
            date:     { $gte: monthStart, $lte: monthEnd },
            status:   { $in: ["PAID", "PARTIAL"] },
          },
        },
        {
          $group: {
            _id:   null,
            total: { $sum: "$amountPaid" },
          },
        },
      ]),

      // ✅ Pending dues — ObjectId cast fixes ₹0 bug
      Billing.aggregate([
        {
          $match: {
            doctorId: doctorObjId,
            status:   { $in: ["PENDING", "PARTIAL"] },
          },
        },
        {
          $group: {
            _id:   null,
            total: {
              $sum: { $subtract: ["$totalFee", "$amountPaid"] },
            },
          },
        },
      ]),

      Appointment.countDocuments({
        doctorId,
        status: "NO_SHOW",
        date:   { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
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
      revenueThisMonth:  revenueResult[0]?.total  || 0,
      pendingDues:       pendingResult[0]?.total   || 0,
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
