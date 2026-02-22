import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Client from "@/models/Client";

// GET — List all clients with search, filter, pagination
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);

    const { searchParams } = new URL(req.url);
    const search  = searchParams.get("search")  || "";
    const status  = searchParams.get("status")  || "ALL";
    const sort    = searchParams.get("sort")    || "createdAt";
    const order   = searchParams.get("order")   || "desc";
    const page    = parseInt(searchParams.get("page")  || "1");
    const limit   = parseInt(searchParams.get("limit") || "10");
    const skip    = (page - 1) * limit;

    // Build filter
    const filter: any = { doctorId };

    if (status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { chiefComplaint: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj: any = { [sort]: order === "asc" ? 1 : -1 };

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Client.countDocuments(filter),
    ]);

    return NextResponse.json({
      clients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST — Create new client
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const body = await req.json();

    const {
      name, age, gender, phone, email, address,
      emergencyContact, referralSource,
      chiefComplaint, bodyPart, bodySide,
      medicalHistory, diagnosis,
      therapyType, clientType,
      totalSessionsPlanned, sessionFee,
      reminderEnabled,
    } = body;

    // Validate required fields
    if (!name || !age || !gender || !phone || !chiefComplaint ||
        !bodyPart || !therapyType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await Client.create({
      doctorId,
      name, age: Number(age), gender, phone,
      email:            email || undefined,
      address:          address || undefined,
      emergencyContact: emergencyContact || undefined,
      referralSource:   referralSource || undefined,
      chiefComplaint, bodyPart,
      bodySide:         bodySide || "BOTH",
      medicalHistory:   medicalHistory || undefined,
      diagnosis:        diagnosis || undefined,
      therapyType,
      clientType:       clientType || "NEW",
      totalSessionsPlanned: totalSessionsPlanned
        ? Number(totalSessionsPlanned) : undefined,
      sessionFee:       sessionFee ? Number(sessionFee) : 0,
      reminderEnabled:  reminderEnabled !== false,
    });

    return NextResponse.json(
      { message: "Client created successfully", client },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
