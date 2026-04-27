"use client";
import React, { useState } from "react";
import { COUNTRY_CODES, getCountryByCode, validatePhoneForCountry, cleanPhoneNumber } from "@/lib/phoneValidation";
import { ChevronDown } from "lucide-react";

interface PhoneInputProps {
  phoneCode: string;
  phone: string;
  onPhoneCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function PhoneInput({
  phoneCode,
  phone,
  onPhoneCodeChange,
  onPhoneChange,
  error,
  placeholder = "1234567890",
  disabled = false,
}: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const country = getCountryByCode(phoneCode);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and common separators
    const cleaned = value.replace(/[^\d\s\-().]/g, "");
    onPhoneChange(cleaned);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-3">
        {/* Country Code Dropdown */}
        <div className="relative w-32">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={disabled}
            className="w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold italic focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
          >
            <span>{country?.dialCode || "+91"}</span>
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 max-h-64 overflow-y-auto">
              {COUNTRY_CODES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onPhoneCodeChange(c.code);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold italic hover:bg-blue-50 transition-colors flex justify-between items-center border-b border-gray-50 last:border-b-0"
                >
                  <span>{c.name}</span>
                  <span className="text-gray-400 text-xs">{c.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1">
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all italic disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs font-bold italic ml-4">{error}</p>
      )}

      {/* Helper Text */}
      {country && (
        <p className="text-[10px] text-gray-400 font-bold italic ml-4">
          {country.minLength === country.maxLength
            ? `${country.minLength} digits`
            : `${country.minLength}-${country.maxLength} digits`}
        </p>
      )}
    </div>
  );
}
