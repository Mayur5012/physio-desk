interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "white" | "gray" | "indigo" | "purple" | "emerald" | "red" | "orange" | "pink";
}

const sizes = {
  sm:  "w-4 h-4",
  md:  "w-6 h-6",
  lg:  "w-8 h-8",
};

const colors = {
  blue:    "border-t-blue-600",
  white:   "border-t-white",
  gray:    "border-t-gray-600",
  indigo:  "border-t-indigo-600",
  purple:  "border-t-purple-600",
  emerald: "border-t-emerald-600",
  red:     "border-t-red-600",
  orange:  "border-t-orange-600",
  pink:    "border-t-pink-600",
};

export default function Spinner({ size = "md", color = "blue" }: SpinnerProps) {
  return (
    <div
      className={`${sizes[size]} border-2 border-gray-200
                  ${colors[color]} rounded-full animate-spin`}
    />
  );
}