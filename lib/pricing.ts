export const PRICING_TIERS: Record<string, any> = {
  IN: {
    currency: "INR",
    symbol: "₹",
    name: "India",
    plans: {
      "1": { amount: 1680, label: "1 Month" },
      "6": { amount: 9173, label: "6 Months" },
      "12": { amount: 17741, label: "12 Months" },
      "test": { amount: 1, label: "Test Plan (₹1)" },
    },
  },
  US: {
    currency: "USD",
    symbol: "$",
    name: "USA / Global",
    plans: {
      "1": { amount: 19, label: "1 Month" },
      "6": { amount: 103, label: "6 Months" },
      "12": { amount: 199, label: "12 Months" },
      "test": { amount: 1, label: "Test Plan ($1)" },
    },
  },
  EU: {
    currency: "EUR",
    symbol: "€",
    name: "Europe",
    plans: {
      "1": { amount: 18, label: "1 Month" },
      "6": { amount: 98, label: "6 Months" },
      "12": { amount: 189, label: "12 Months" },
      "test": { amount: 1, label: "Test Plan (€1)" },
    },
  },
};

// List of major EU country codes to map to the EUR tier
const EU_COUNTRY_CODES = [
  "AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"
];

export const DEFAULT_TIER = PRICING_TIERS.US;

export async function detectCountry(): Promise<string> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data.country_code || "US";
  } catch (error) {
    console.error("Country detection failed:", error);
    return "US";
  }
}

export function getPricingForCountry(countryCode: string) {
  if (countryCode === "IN") return PRICING_TIERS.IN;
  if (EU_COUNTRY_CODES.includes(countryCode)) return PRICING_TIERS.EU;
  
  // Default to US for everything else
  return PRICING_TIERS.US;
}

