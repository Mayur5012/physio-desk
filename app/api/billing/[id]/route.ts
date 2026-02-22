import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Billing from "@/models/Billing";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { id }   = await params;

    const bill = await Billing.findOne({ _id: id, doctorId })
      .populate("clientId",  "name phone email")
      .populate("sessionId", "sessionNumber createdAt")
      .lean();

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ bill });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bill" },
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
    const { id }   = await params;
    const body     = await req.json();

    // Recalculate status if fee/paid changed
    if (body.totalFee !== undefined || body.amountPaid !== undefined) {
      const existing = await Billing.findOne({ _id: id, doctorId });
      if (!existing) {
        return NextResponse.json(
          { error: "Bill not found" },
          { status: 404 }
        );
      }
      const total = Number(body.totalFee  ?? existing.totalFee);
      const paid  = Number(body.amountPaid ?? existing.amountPaid);
      body.status =
        paid >= total ? "PAID" :
        paid > 0      ? "PARTIAL" :
                        "PENDING";
    }

    const bill = await Billing.findOneAndUpdate(
      { _id: id, doctorId },
      { $set: body },
      { new: true }
    );

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Bill updated", bill });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update bill" },
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
    const { id }   = await params;

    const bill = await Billing.findOneAndDelete({ _id: id, doctorId });

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Bill deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete bill" },
      { status: 500 }
    );
  }
}
