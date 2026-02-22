import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Session from "@/models/Session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id } = await params;

    const session = await Session.findOne({ _id: id, doctorId })
      .populate("clientId", "name phone therapyType chiefComplaint")
      .lean();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id } = await params;
    const body = await req.json();

    const session = await Session.findOneAndUpdate(
      { _id: id, doctorId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Session updated", session });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id } = await params;

    const session = await Session.findOneAndDelete({ _id: id, doctorId });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Session deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
