import PageWrapper from "@/components/layout/PageWrapper";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

async function getDoctor() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return undefined;

    const payload = verifyToken(token);
    await connectDB();

    const doctor = await Doctor.findById(payload.doctorId)
      .select("name email clinicName")
      .lean() as any;

    if (!doctor) return undefined;

    return {
      name:       doctor.name,
      email:      doctor.email,
      clinicName: doctor.clinicName,
    };
  } catch {
    return undefined;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const doctor = await getDoctor();

  return (
    <PageWrapper doctor={doctor}>
      {children}
    </PageWrapper>
  );
}
