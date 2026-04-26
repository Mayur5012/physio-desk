import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full py-2.5 border rounded-lg text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-transparent transition
                        placeholder:text-gray-400
                        ${icon ? "pl-9 pr-4" : "px-4"}
                        ${error
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-white"
                        }
                        disabled:bg-gray-50 disabled:text-gray-400
                        ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
        {hint && !error && (
          <p className="text-gray-400 text-xs mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;