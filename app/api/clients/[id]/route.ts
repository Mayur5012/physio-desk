import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Client from "@/models/Client";
import Session from "@/models/Session";
import Appointment from "@/models/Appointment";
import Billing from "@/models/Billing";
import mongoose from "mongoose"; // ← added

// GET — Single client
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id }   = await params;

    const client = await Client.findOne({ _id: id, doctorId }).lean();

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const clientObjId = new mongoose.Types.ObjectId(id); // ← cast once

    const [
      sessionsCompleted,
      lastSession,
      nextAppointment,
      totalPaid,
      totalPending,
    ] = await Promise.all([

      Session.countDocuments({ clientId: id }),

      Session.findOne({ clientId: id })
        .sort({ createdAt: -1 })
        .lean(),

      Appointment.findOne({
        clientId: id,
        date:     { $gte: new Date() },
        status:   "SCHEDULED",
      })
        .sort({ date: 1 })
        .lean(),

      // ✅ ObjectId cast — was always returning 0
      Billing.aggregate([
        {
          $match: { clientId: clientObjId },
        },
        {
          $group: { _id: null, total: { $sum: "$amountPaid" } },
        },
      ]),

      // ✅ ObjectId cast — was always returning 0
      Billing.aggregate([
        {
          $match: { clientId: clientObjId },
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
    ]);

    return NextResponse.json({
      client: {
        ...client,
        practiceTypes: (client.practiceTypes && client.practiceTypes.length > 0)
          ? client.practiceTypes
          : (client.practiceType ? [client.practiceType] : (client.therapyType ? [client.therapyType] : []))
      },
      summary: {
        sessionsCompleted,
        lastVisit:       lastSession?.createdAt    || null,
        nextAppointment: nextAppointment            || null,
        totalPaid:       totalPaid[0]?.total        || 0,
        totalPending:    totalPending[0]?.total     || 0,
      },
    });
  } catch (error) {
    console.error("Get client error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PUT — Update client
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id }   = await params;
    const body     = await req.json();

    console.log("[PUT /clients] body.practiceTypes:", JSON.stringify(body.practiceTypes));

    const updateData = { ...body };
    
    // Normalize practiceTypes to array for safety
    if (body.practiceTypes) {
      const types = Array.isArray(body.practiceTypes) ? body.practiceTypes : [body.practiceTypes];
      updateData.practiceTypes = types;
      if (types.length > 0) {
        updateData.practiceType = types[0];
      }
    }

    const client = await Client.findOneAndUpdate(
      { _id: id, doctorId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE — Soft delete (discharge)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id }   = await params;

    const client = await Client.findOneAndUpdate(
      { _id: id, doctorId },
      { $set: { status: "DISCHARGED" } },
      { new: true }
    );

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Client discharged successfully" });
  } catch (error) {
    console.error("Delete client error:", error);
    return NextResponse.json(
      { error: "Failed to discharge client" },
      { status: 500 }
    );
  }
}
