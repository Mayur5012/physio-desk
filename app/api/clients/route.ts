import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Client from "@/models/Client";
import { createInitialBillingForClient } from "@/lib/billingUtils";

// ── GET — List all clients ─────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { doctorId };

    if (status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
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
        .lean()
        .then(docs =>
          docs.map((c: any) => ({
            ...c,
            practiceTypes:
              c.practiceTypes && c.practiceTypes.length > 0
                ? c.practiceTypes
                : [],
          }))
        ),
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

// ── POST — Create new client ───────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const body = await req.json();

    const {
      name, age, gender, phoneCode, phone, email, address,
      emergencyContact, referralSource,
      chiefComplaint, bodyPart, bodySide,
      medicalHistory, diagnosis,
      therapyType, practiceType, practiceTypes, clientType,
      totalSessionsPlanned, sessionFee,
      reminderEnabled,
    } = body;

    // Resolve practiceTypes from whichever field is provided
    let finalPracticeTypes: string[] = [];
    if (Array.isArray(practiceTypes)) {
      finalPracticeTypes = practiceTypes;
    } else if (practiceTypes) {
      finalPracticeTypes = [practiceTypes];
    } else if (practiceType) {
      finalPracticeTypes = [practiceType];
    } else if (therapyType) {
      finalPracticeTypes = [therapyType];
    }

    console.log(
      "[POST /clients] body.practiceTypes:",
      JSON.stringify(practiceTypes),
      "| finalPracticeTypes:",
      JSON.stringify(finalPracticeTypes)
    );

    // Validate required fields
    if (
      !name || !age || !gender || !phone || !chiefComplaint ||
      finalPracticeTypes.length === 0
    ) {
      return NextResponse.json(
        { error: "Please select at least one service category" },
        { status: 400 }
      );
    }

    const client = await Client.create({
      doctorId,
      name,
      age: Number(age),
      gender,
      phoneCode: phoneCode || "IN",
      phone,
      email: email || undefined,
      address: address || undefined,
      emergencyContact: emergencyContact || undefined,
      referralSource: referralSource || undefined,
      chiefComplaint,
      bodyPart: bodyPart || undefined,
      bodySide: bodySide || "BOTH",
      medicalHistory: medicalHistory || undefined,
      diagnosis: diagnosis || undefined,
      practiceTypes: finalPracticeTypes,
      therapyType: therapyType || undefined,
      clientType: clientType || "NEW",
      totalSessionsPlanned: totalSessionsPlanned
        ? Number(totalSessionsPlanned)
        : undefined,
      sessionFee: sessionFee ? Number(sessionFee) : 0,
      reminderEnabled: reminderEnabled !== false,
    });

    // Auto-create initial billing entry
    let billingCreated = false;
    if (sessionFee && Number(sessionFee) > 0) {
      try {
        await createInitialBillingForClient(
          new mongoose.Types.ObjectId(doctorId),
          client._id,
          Number(sessionFee)
        );
        billingCreated = true;
      } catch (billingError) {
        console.error("Auto-billing creation failed:", billingError);
        // Don't fail the client creation if billing fails
      }
    }

    return NextResponse.json(
      {
        message: "Client created successfully",
        client,
        billingCreated,
      },
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