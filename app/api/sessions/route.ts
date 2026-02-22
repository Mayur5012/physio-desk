import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthDoctor } from "@/lib/auth";
import Session from "@/models/Session";
import Client from "@/models/Client";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const doctorId = await getAuthDoctor(req);
        const { searchParams } = new URL(req.url);

        const clientId = searchParams.get("clientId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const filter: any = { doctorId };
        if (clientId) filter.clientId = clientId;

        const [sessions, total] = await Promise.all([
            Session.find(filter)
                .populate("clientId", "name phone therapyType")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Session.countDocuments(filter),
        ]);

        return NextResponse.json({
            sessions, total, page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Get sessions error:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const doctorId = await getAuthDoctor(req);
        const body = await req.json();

        const {
            clientId, appointmentId,
            sessionNumber, date,
            chiefComplaint, subjective, objective,
            assessment, plan, therapyType,    
            bodyAreaTreated,
            techniques, exercises,
            painBefore, painAfter,
            durationMins, notes,
        } = body;

        if (!clientId || !sessionNumber || !date) {
            return NextResponse.json(
                { error: "Client, session number and date are required" },
                { status: 400 }
            );
        }

        const sessionData = {
            doctorId,
            clientId,
            appointmentId: appointmentId || undefined,
            sessionNumber: Number(sessionNumber),
            therapyType: therapyType || undefined,
            bodyAreaTreated: bodyAreaTreated || undefined,
            techniquesUsed: techniques || [],        // ← was: techniques
            durationMins: durationMins ? Number(durationMins) : 60,
            painBefore: painBefore !== undefined  // ← was: painBefore
                ? Number(painBefore) : undefined,
            painAfter: painAfter !== undefined   // ← was: painAfter
                ? Number(painAfter) : undefined,
            subjective: subjective || undefined,
            objective: objective || undefined,
            assessment: assessment || undefined,
            plan: plan || undefined,
            privateNote: notes || undefined,  // ← was: notes
            progress: "STABLE",
        };

        const session = await Session.create(sessionData as any);


        // Update client's session count
        await Client.findByIdAndUpdate(clientId, {
            $inc: { sessionsCompleted: 1 },
        });

        return NextResponse.json(
            { message: "Session recorded", session },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create session error:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}
