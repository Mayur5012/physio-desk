import PageWrapper from "@/components/layout/PageWrapper";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import SubscriptionWall from "@/components/subscription/SubscriptionWall";
import Script from "next/script";

async function getDoctor() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return undefined;

    const payload = verifyToken(token);
    await connectDB();

    const doctor = await Doctor.findById(payload.doctorId)
      .select("name email clinicName subscriptionStatus subscriptionExpiry createdAt")
      .lean() as any;

    if (!doctor) return undefined;

    return {
      id:         doctor._id.toString(),
      name:       doctor.name,
      email:      doctor.email,
      clinicName: doctor.clinicName,
      subscriptionStatus: doctor.subscriptionStatus || 'trial',
      subscriptionExpiry: doctor.subscriptionExpiry ? new Date(doctor.subscriptionExpiry).toISOString() : null,
      createdAt: doctor.createdAt ? new Date(doctor.createdAt).toISOString() : null,
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
  
  const now = new Date();
  const trialDays = 3;
  
  // Calculate if expired
  let isExpired = false;
  if (doctor) {
    if (doctor.subscriptionStatus === 'active') {
      isExpired = false;
    } else if (doctor.subscriptionStatus === 'expired') {
      isExpired = true;
    } else {
      // It's 'trial' or missing (for old accounts)
      const expiry = doctor.subscriptionExpiry ? new Date(doctor.subscriptionExpiry) : null;
      const created = doctor.createdAt ? new Date(doctor.createdAt) : null;
      
      if (expiry) {
        isExpired = expiry < now;
      } else if (created) {
        // Fallback for accounts created before this update
        const fallbackExpiry = new Date(created.getTime() + trialDays * 24 * 60 * 60 * 1000);
        isExpired = fallbackExpiry < now;
      }
    }
  }

  if (isExpired) {
    return (
      <PageWrapper doctor={doctor}>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <SubscriptionWall doctorId={doctor.id} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper doctor={doctor}>
      {children}
    </PageWrapper>
  );
}
