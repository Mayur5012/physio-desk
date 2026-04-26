import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import NoteTemplate from "@/models/NoteTemplate";
import { getAuthenticatedDoctor } from "@/lib/auth";

/**
 * GET /api/note-templates/[id]
 * Get a specific template
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doctor = await getAuthenticatedDoctor(req);

    const template = await NoteTemplate.findById(params.id);
    if (!template || template.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(template, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch template" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/note-templates/[id]
 * Update a template
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doctor = await getAuthenticatedDoctor(req);
    const body = await req.json();

    const template = await NoteTemplate.findById(params.id);
    if (!template || template.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If this is marked as default, unset others for this practice type
    if (body.isDefault && !template.isDefault) {
      await NoteTemplate.updateMany(
        { doctorId: doctor._id, practiceType: template.practiceType, isDefault: true },
        { isDefault: false }
      );
    }

    Object.assign(template, body);
    await template.save();

    return NextResponse.json(template, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/note-templates/[id]
 * Delete a template
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doctor = await getAuthenticatedDoctor(req);

    const template = await NoteTemplate.findById(params.id);
    if (!template || template.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await NoteTemplate.deleteOne({ _id: params.id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}
