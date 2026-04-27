/**
 * International Phone Validation
 * Supports multiple country codes with proper validation
 */

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  format: string; // Regex pattern for validation
  minLength: number;
  maxLength: number;
}

/**
 * Comprehensive list of country codes with phone validation rules
 */
export const COUNTRY_CODES: CountryCode[] = [
  // India
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    format: "[6-9]\\d{9}",
    minLength: 10,
    maxLength: 10,
  },
  // United States
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    format: "[2-9]\\d{9}",
    minLength: 10,
    maxLength: 10,
  },
  // Canada
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    format: "[2-9]\\d{9}",
    minLength: 10,
    maxLength: 10,
  },
  // United Kingdom
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    format: "[1-9]\\d{9,10}",
    minLength: 10,
    maxLength: 11,
  },
  // Australia
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    format: "[2-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // New Zealand
  {
    code: "NZ",
    name: "New Zealand",
    dialCode: "+64",
    format: "[2-9]\\d{7,9}",
    minLength: 8,
    maxLength: 10,
  },
  // Singapore
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    format: "[6-9]\\d{7}",
    minLength: 8,
    maxLength: 8,
  },
  // Malaysia
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    format: "[1-9]\\d{8,9}",
    minLength: 9,
    maxLength: 10,
  },
  // Thailand
  {
    code: "TH",
    name: "Thailand",
    dialCode: "+66",
    format: "[2-9]\\d{7,8}",
    minLength: 8,
    maxLength: 9,
  },
  // Indonesia
  {
    code: "ID",
    name: "Indonesia",
    dialCode: "+62",
    format: "[2-9]\\d{7,9}",
    minLength: 8,
    maxLength: 10,
  },
  // Philippines
  {
    code: "PH",
    name: "Philippines",
    dialCode: "+63",
    format: "[2-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // Vietnam
  {
    code: "VN",
    name: "Vietnam",
    dialCode: "+84",
    format: "[2-9]\\d{8,9}",
    minLength: 9,
    maxLength: 10,
  },
  // Bangladesh
  {
    code: "BD",
    name: "Bangladesh",
    dialCode: "+880",
    format: "[1-9]\\d{8}",
    minLength: 10,
    maxLength: 10,
  },
  // Pakistan
  {
    code: "PK",
    name: "Pakistan",
    dialCode: "+92",
    format: "[1-9]\\d{9}",
    minLength: 10,
    maxLength: 10,
  },
  // Sri Lanka
  {
    code: "LK",
    name: "Sri Lanka",
    dialCode: "+94",
    format: "[1-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // Nepal
  {
    code: "NP",
    name: "Nepal",
    dialCode: "+977",
    format: "[1-9]\\d{9}",
    minLength: 10,
    maxLength: 10,
  },
  // United Arab Emirates
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    format: "[1-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // Saudi Arabia
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    format: "[1-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // Germany
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    format: "[1-9]\\d{3,10}",
    minLength: 4,
    maxLength: 11,
  },
  // France
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    format: "[1-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // Italy
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    format: "[1-9]\\d{8,9}",
    minLength: 9,
    maxLength: 10,
  },
  // Spain
  {
    code: "ES",
    name: "Spain",
    dialCode: "+34",
    format: "[1-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // Netherlands
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    format: "[1-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // Belgium
  {
    code: "BE",
    name: "Belgium",
    dialCode: "+32",
    format: "[1-9]\\d{7,9}",
    minLength: 8,
    maxLength: 10,
  },
  // Switzerland
  {
    code: "CH",
    name: "Switzerland",
    dialCode: "+41",
    format: "[1-9]\\d{8}",
    minLength: 9,
    maxLength: 9,
  },
  // Sweden
  {
    code: "SE",
    name: "Sweden",
    dialCode: "+46",
    format: "[1-9]\\d{8,9}",
    minLength: 9,
    maxLength: 10,
  },
  // Norway
  {
    code: "NO",
    name: "Norway",
    dialCode: "+47",
    format: "[2-9]\\d{7}",
    minLength: 8,
    maxLength: 8,
  },
  // Denmark
  {
    code: "DK",
    name: "Denmark",
    dialCode: "+45",
    format: "[1-9]\\d{7}",
    minLength: 8,
    maxLength: 8,
  },
  // Japan
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    format: "[1-9]\\d{9}",
    minLength: 10,
    maxLength: 10,
  },
  // South Korea
  {
    code: "KR",
    name: "South Korea",
    dialCode: "+82",
    format: "[1-9]\\d{8,9}",
    minLength: 9,
    maxLength: 10,
  },
  // China
  {
    code: "CN",
    name: "China",
    dialCode: "+86",
    format: "[1-9]\\d{10}",
    minLength: 11,
    maxLength: 11,
  },
  // Hong Kong
  {
    code: "HK",
    name: "Hong Kong",
    dialCode: "+852",
    format: "[1-9]\\d{7}",
    minLength: 8,
    maxLength: 8,
  },
  // Brazil
  {
    code: "BR",
    name: "Brazil",
    dialCode: "+55",
    format: "[1-9]\\d{9,10}",
    minLength: 10,
    maxLength: 11,
  },
  // Mexico
  {
    code: "MX",
    name: "Mexico",
    dialCode: "+52",
    format: "[1-9]\\d{9}",
    minLength: 10,
    maxLength: 10,
  },
  // Argentina
  {
    code: "AR",
    name: "Argentina",
    dialCode: "+54",
    format: "[1-9]\\d{8,9}",
    minLength: 9,
    maxLength: 10,
  },
];

/**
 * Get country code by dial code
 */
export function getCountryByDialCode(dialCode: string): CountryCode | undefined {
  return COUNTRY_CODES.find((c) => c.dialCode === dialCode);
}

/**
 * Get country code by country code
 */
export function getCountryByCode(code: string): CountryCode | undefined {
  return COUNTRY_CODES.find((c) => c.code === code);
}

/**
 * Validate phone number for given country
 */
export function validatePhoneForCountry(
  phoneNumber: string,
  country: CountryCode
): boolean {
  // Remove common separators
  const cleanedNumber = phoneNumber.replace(/[\s\-().]/g, "");

  // Check length
  if (
    cleanedNumber.length < country.minLength ||
    cleanedNumber.length > country.maxLength
  ) {
    return false;
  }

  // Check format
  const regex = new RegExp(`^${country.format}$`);
  return regex.test(cleanedNumber);
}

/**
 * Format phone number with country code
 */
export function formatPhoneWithCountry(
  phoneNumber: string,
  country: CountryCode
): string {
  const cleanedNumber = phoneNumber.replace(/[\s\-().]/g, "");
  return `${country.dialCode}${cleanedNumber}`;
}

/**
 * Remove common separators from phone number
 */
export function cleanPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s\-().]/g, "");
}

/**
 * Get default country (India)
 */
export function getDefaultCountry(): CountryCode {
  return getCountryByCode("IN")!;
}

/**
 * Create Zod schema for phone validation with country code
 */
export function createPhoneValidationSchema() {
  return {
    phoneCode: "IN",
    phone: "",
  };
}
