import { forwardRef } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?:    "sm" | "md" | "lg";
  loading?: boolean;
  icon?:    React.ReactNode;
}

const variants = {
  primary:   "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
  danger:    "bg-red-600 hover:bg-red-700 text-white",
  ghost:     "bg-transparent hover:bg-gray-100 text-gray-600",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-5 py-3 text-sm gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary", size = "md", loading = false,
      icon, children, disabled, className = "", ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium 
                    rounded-lg transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading
          ? <Spinner size="sm" />
          : icon && <span className="shrink-0">{icon}</span>
        }
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
