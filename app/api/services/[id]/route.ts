import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ServiceType from "@/models/ServiceType";
import { getAuthenticatedDoctor } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * GET /api/services/[id]
 * Get a specific service
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doctor = await getAuthenticatedDoctor(req);

    const service = await ServiceType.findById(params.id);
    if (!service || service.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(service, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch service" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/services/[id]
 * Update a service
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doctor = await getAuthenticatedDoctor(req);
    const body = await req.json();

    const service = await ServiceType.findById(params.id);
    if (!service || service.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    Object.assign(service, body);
    await service.save();

    return NextResponse.json(service, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update service" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/[id]
 * Delete a service
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doctor = await getAuthenticatedDoctor(req);

    const service = await ServiceType.findById(params.id);
    if (!service || service.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await ServiceType.deleteOne({ _id: params.id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete service" },
      { status: 500 }
    );
  }
}
