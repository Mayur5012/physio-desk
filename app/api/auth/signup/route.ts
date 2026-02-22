import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const {
            name,
            email,
            password,
            clinicName,
            phone,
            specialization,
            address,
        } = body;

        // ── Validate required fields ───────────────────────────
        if (!name || !email || !password || !clinicName) {
            return NextResponse.json(
                { error: "Name, email, password and clinic name are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        // ── Check duplicate email ──────────────────────────────
        const existing = await Doctor.findOne({
            email: email.toLowerCase().trim(),
        });

        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // ── Hash password ──────────────────────────────────────
        const hashedPassword = await bcrypt.hash(password, 12);

        // ── Create doctor ──────────────────────────────────────
        const doctor = await Doctor.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash: hashedPassword,
            clinicName: clinicName.trim(),
            phone: phone?.trim() || undefined,
            specialization: specialization?.trim() || undefined,
            address: address?.trim() || undefined,
        } as any) as any;


        // ── Return success (never return password) ─────────────
        return NextResponse.json(
            {
                message: "Account created successfully",
                doctor: {
                    id: doctor._id,
                    name: doctor.name,
                    email: doctor.email,
                    clinicName: doctor.clinicName,
                    phone: doctor.phone,
                    specialization: doctor.specialization,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Signup error:", error);

        // Mongoose duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // Mongoose validation error
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (e: any) => e.message
            );
            return NextResponse.json(
                { error: messages[0] || "Validation failed" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error. Please try again." },
            { status: 500 }
        );
    }
}
