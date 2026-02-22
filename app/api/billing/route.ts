import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Billing from "@/models/Billing";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const { searchParams } = new URL(req.url);

    const clientId = searchParams.get("clientId");
    const status   = searchParams.get("status");
    const page     = parseInt(searchParams.get("page")  || "1");
    const limit    = parseInt(searchParams.get("limit") || "10");
    const skip     = (page - 1) * limit;

    const filter: any = { doctorId };
    if (clientId) filter.clientId = clientId;
    if (status && status !== "ALL") filter.status = status;

    const [bills, total, summary] = await Promise.all([
      Billing.find(filter)
        .populate("clientId", "name phone")
        .populate("sessionId", "sessionNumber")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Billing.countDocuments(filter),
      Billing.aggregate([
        { $match: { doctorId: new (require("mongoose").Types.ObjectId)(doctorId) } },
        {
          $group: {
            _id:          null,
            totalRevenue: { $sum: "$amountPaid" },
            totalPending: { $sum: { $subtract: ["$totalFee", "$amountPaid"] } },
            totalBills:   { $sum: 1 },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      bills,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: summary[0] || {
        totalRevenue: 0,
        totalPending: 0,
        totalBills:   0,
      },
    });
  } catch (error) {
    console.error("Get billing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    const body     = await req.json();

    const {
      clientId, sessionId,
      totalFee, amountPaid,
      paymentMode, notes, date,
    } = body;

    if (!clientId || totalFee === undefined) {
      return NextResponse.json(
        { error: "Client and total fee are required" },
        { status: 400 }
      );
    }

    const paid   = Number(amountPaid ?? 0);
    const total  = Number(totalFee);
    const status =
      paid >= total ? "PAID" :
      paid > 0      ? "PARTIAL" :
                      "PENDING";

    const bill = await Billing.create({
      doctorId,
      clientId,
      sessionId:   sessionId   || undefined,
      date:        date ? new Date(date) : new Date(),
      totalFee:    total,
      amountPaid:  paid,
      paymentMode: paymentMode || "CASH",
      status,
      notes:       notes       || undefined,
    } as any);

    return NextResponse.json(
      { message: "Bill created", bill },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create bill error:", error);
    return NextResponse.json(
      { error: "Failed to create bill" },
      { status: 500 }
    );
  }
}
