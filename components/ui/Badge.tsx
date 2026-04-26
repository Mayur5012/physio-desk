type BadgeVariant =
  | "active" | "inactive" | "discharged"
  | "paid" | "pending" | "partial"
  | "scheduled" | "present" | "absent"
  | "cancelled" | "no_show" | "rescheduled"
  | "improving" | "stable" | "worsening"
  | "new" | "regular" | "one_time"
  | "blue" | "gray";

const styles: Record<BadgeVariant, string> = {
  active:      "bg-green-100 text-green-700",
  inactive:    "bg-yellow-100 text-yellow-700",
  discharged:  "bg-gray-100 text-gray-600",
  paid:        "bg-green-100 text-green-700",
  pending:     "bg-red-100 text-red-600",
  partial:     "bg-orange-100 text-orange-600",
  scheduled:   "bg-blue-100 text-blue-700",
  present:     "bg-green-100 text-green-700",
  absent:      "bg-red-100 text-red-600",
  cancelled:   "bg-gray-100 text-gray-500",
  no_show:     "bg-orange-100 text-orange-600",
  rescheduled: "bg-purple-100 text-purple-700",
  improving:   "bg-green-100 text-green-700",
  stable:      "bg-blue-100 text-blue-700",
  worsening:   "bg-red-100 text-red-600",
  new:         "bg-purple-100 text-purple-700",
  regular:     "bg-blue-100 text-blue-700",
  one_time:    "bg-gray-100 text-gray-600",
  blue:        "bg-blue-100 text-blue-700",
  gray:        "bg-gray-100 text-gray-600",
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;  // ← added
}

export default function Badge({
  variant, label, children, className = "", onClose,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
                  text-xs font-medium ${styles[variant]} ${className}`}
    >
      {label || children}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-0.5 hover:opacity-70 transition-opacity leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
}