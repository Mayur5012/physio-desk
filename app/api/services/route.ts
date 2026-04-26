import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ServiceType from "@/models/ServiceType";
import { getAuthDoctor } from "@/lib/auth";

/**
 * GET /api/services
 * List services for the authenticated doctor
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);

    const { searchParams } = new URL(req.url);
    const practiceType = searchParams.get("practiceType");
    const isActive = searchParams.get("isActive") !== "false";

    const query: any = { doctorId: doctorId };
    if (practiceType) query.practiceType = practiceType;
    if (isActive) query.isActive = true;

    const services = await ServiceType.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ services }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch services" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services
 * Create a new service
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const body = await req.json();

    const service = new ServiceType({
      ...body,
      doctorId: doctorId,
    });

    await service.save();
    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create service" },
      { status: 500 }
    );
  }
}
