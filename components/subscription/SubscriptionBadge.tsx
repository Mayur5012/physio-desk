"use client";
import { formatDistanceToNow, differenceInDays, differenceInMonths, parseISO } from "date-fns";

interface SubscriptionBadgeProps {
  doctor?: {
    subscriptionStatus?: string;
    subscriptionExpiry?: string | Date | null;
    createdAt?: string | Date | null;
  } | null;
}

export default function SubscriptionBadge({ doctor }: SubscriptionBadgeProps) {
  if (!doctor) return null;

  const status = doctor.subscriptionStatus || "trial";
  const expiry = doctor.subscriptionExpiry ? new Date(doctor.subscriptionExpiry) : null;
  const created = doctor.createdAt ? new Date(doctor.createdAt) : null;
  const now = new Date();

  let label = "Trial";
  let colorClass = "bg-blue-600";
  let subtitle = "";

  if (status === "active") {
    label = "Active";
    colorClass = "bg-emerald-600";
    if (expiry) {
      const monthsLeft = differenceInMonths(expiry, now);
      if (monthsLeft > 0) {
        subtitle = `(${monthsLeft} month${monthsLeft > 1 ? "s" : ""} left)`;
      } else {
        const daysLeft = differenceInDays(expiry, now);
        subtitle = `(${daysLeft} day${daysLeft > 1 ? "s" : ""} left)`;
      }
    }
  } else if (status === "expired") {
    label = "Expired";
    colorClass = "bg-red-600";
  } else {
    // Trial logic
    label = "Trial";
    colorClass = "bg-orange-600";
    const trialDays = 3;
    const fallbackExpiry = created 
      ? new Date(created.getTime() + trialDays * 24 * 60 * 60 * 1000)
      : null;
    
    const targetDate = expiry || fallbackExpiry;
    if (targetDate) {
      const daysLeft = differenceInDays(targetDate, now);
      subtitle = daysLeft > 0 ? `(${daysLeft} day${daysLeft > 1 ? "s" : ""} left)` : "(Ending soon)";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-0.5 ${colorClass} text-white text-[10px] font-black uppercase tracking-widest rounded-md italic shadow-sm`}>
        {label}
      </div>
      {subtitle && (
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
          {subtitle}
        </span>
      )}
    </div>
  );
}
