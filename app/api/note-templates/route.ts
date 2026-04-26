import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import NoteTemplate from "@/models/NoteTemplate";
import { getAuthenticatedDoctor } from "@/lib/auth";

/**
 * GET /api/note-templates
 * List note templates for the authenticated doctor
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctor = await getAuthenticatedDoctor(req);

    const { searchParams } = new URL(req.url);
    const practiceType = searchParams.get("practiceType");

    const query: any = { doctorId: doctor._id };
    if (practiceType) query.practiceType = practiceType;

    const templates = await NoteTemplate.find(query).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/note-templates
 * Create a new note template
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctor = await getAuthenticatedDoctor(req);
    const body = await req.json();

    // If this is marked as default, unset others for this practice type
    if (body.isDefault) {
      await NoteTemplate.updateMany(
        { doctorId: doctor._id, practiceType: body.practiceType, isDefault: true },
        { isDefault: false }
      );
    }

    const template = new NoteTemplate({
      ...body,
      doctorId: doctor._id,
    });

    await template.save();
    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create template" },
      { status: 500 }
    );
  }
}
