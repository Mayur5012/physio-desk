import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Doctor from "@/models/Doctor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const doctorId = await getAuthDoctor(req);
    
    if (!doctorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Doctor.findByIdAndUpdate(doctorId, { hasSeenTour: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tour complete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
