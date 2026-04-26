/**
 * Practice Types - Generic categories for all healthcare practitioners
 * Supports: Physiotherapists, Psychiatrists, Dentists, Nutritionists, etc.
 */

export const PRACTICE_TYPES = {
  // Manual Therapies
  PHYSIOTHERAPY: "PHYSIOTHERAPY",
  ACUPRESSURE: "ACUPRESSURE",
  CHIROPRACTIC: "CHIROPRACTIC",
  MASSAGE_THERAPY: "MASSAGE_THERAPY",
  OCCUPATIONAL_THERAPY: "OCCUPATIONAL_THERAPY",

  // Mental Health
  COUNSELING: "COUNSELING",
  PSYCHIATRY: "PSYCHIATRY",
  PSYCHOLOGY: "PSYCHOLOGY",
  THERAPY: "THERAPY",

  // Medical
  GENERAL_PRACTICE: "GENERAL_PRACTICE",
  DENTISTRY: "DENTISTRY",
  ORTHOPEDIC: "ORTHOPEDIC",
  CARDIOLOGY: "CARDIOLOGY",
  DERMATOLOGY: "DERMATOLOGY",

  // Wellness
  NUTRITION: "NUTRITION",
  DIETITIAN: "DIETITIAN",
  AYURVEDA: "AYURVEDA",
  HOMEOPATHY: "HOMEOPATHY",

  // Speech & Hearing
  SPEECH_THERAPY: "SPEECH_THERAPY",
  AUDIOLOGY: "AUDIOLOGY",

  // Other
  SPORTS_MEDICINE: "SPORTS_MEDICINE",
  VETERINARY: "VETERINARY",
  CUSTOM: "CUSTOM",
} as const;

export type PracticeType = typeof PRACTICE_TYPES[keyof typeof PRACTICE_TYPES];

/**
 * Practice Type Colors for UI
 */
export const PRACTICE_TYPE_COLORS: Record<PracticeType, string> = {
  PHYSIOTHERAPY: "text-blue-600 bg-blue-50",
  ACUPRESSURE: "text-green-600 bg-green-50",
  CHIROPRACTIC: "text-purple-600 bg-purple-50",
  MASSAGE_THERAPY: "text-pink-600 bg-pink-50",
  OCCUPATIONAL_THERAPY: "text-cyan-600 bg-cyan-50",
  COUNSELING: "text-indigo-600 bg-indigo-50",
  PSYCHIATRY: "text-violet-600 bg-violet-50",
  PSYCHOLOGY: "text-fuchsia-600 bg-fuchsia-50",
  THERAPY: "text-violet-600 bg-violet-50",
  GENERAL_PRACTICE: "text-orange-600 bg-orange-50",
  DENTISTRY: "text-red-600 bg-red-50",
  ORTHOPEDIC: "text-amber-600 bg-amber-50",
  CARDIOLOGY: "text-red-600 bg-red-50",
  DERMATOLOGY: "text-rose-600 bg-rose-50",
  NUTRITION: "text-lime-600 bg-lime-50",
  DIETITIAN: "text-lime-600 bg-lime-50",
  AYURVEDA: "text-yellow-600 bg-yellow-50",
  HOMEOPATHY: "text-emerald-600 bg-emerald-50",
  SPEECH_THERAPY: "text-sky-600 bg-sky-50",
  AUDIOLOGY: "text-blue-600 bg-blue-50",
  SPORTS_MEDICINE: "text-orange-600 bg-orange-50",
  VETERINARY: "text-teal-600 bg-teal-50",
  CUSTOM: "text-gray-600 bg-gray-50",
};

/**
 * Practice Categories for grouping in UI
 */
export const PRACTICE_CATEGORIES = {
  MANUAL_THERAPIES: [
    PRACTICE_TYPES.PHYSIOTHERAPY,
    PRACTICE_TYPES.ACUPRESSURE,
    PRACTICE_TYPES.CHIROPRACTIC,
    PRACTICE_TYPES.MASSAGE_THERAPY,
    PRACTICE_TYPES.OCCUPATIONAL_THERAPY,
  ],
  MENTAL_HEALTH: [
    PRACTICE_TYPES.COUNSELING,
    PRACTICE_TYPES.PSYCHIATRY,
    PRACTICE_TYPES.PSYCHOLOGY,
    PRACTICE_TYPES.THERAPY,
  ],
  MEDICAL: [
    PRACTICE_TYPES.GENERAL_PRACTICE,
    PRACTICE_TYPES.DENTISTRY,
    PRACTICE_TYPES.ORTHOPEDIC,
    PRACTICE_TYPES.CARDIOLOGY,
    PRACTICE_TYPES.DERMATOLOGY,
  ],
  WELLNESS: [
    PRACTICE_TYPES.NUTRITION,
    PRACTICE_TYPES.DIETITIAN,
    PRACTICE_TYPES.AYURVEDA,
    PRACTICE_TYPES.HOMEOPATHY,
  ],
  SPEECH_AND_HEARING: [
    PRACTICE_TYPES.SPEECH_THERAPY,
    PRACTICE_TYPES.AUDIOLOGY,
  ],
};

/**
 * Default fields for each practice type (determines what's mandatory/optional)
 */
export const PRACTICE_TYPE_CONFIG: Record<
  PracticeType,
  {
    label: string;
    requiresBodyPart: boolean;
    requiresDiagnosis: boolean;
    requiresPainTracking: boolean;
    defaultSlotMins: number;
    icon: string;
  }
> = {
  PHYSIOTHERAPY: {
    label: "Physiotherapy",
    requiresBodyPart: true,
    requiresDiagnosis: true,
    requiresPainTracking: true,
    defaultSlotMins: 60,
    icon: "Heart",
  },
  ACUPRESSURE: {
    label: "Acupressure",
    requiresBodyPart: true,
    requiresDiagnosis: false,
    requiresPainTracking: true,
    defaultSlotMins: 60,
    icon: "Activity",
  },
  CHIROPRACTIC: {
    label: "Chiropractic",
    requiresBodyPart: true,
    requiresDiagnosis: true,
    requiresPainTracking: true,
    defaultSlotMins: 45,
    icon: "Spine",
  },
  MASSAGE_THERAPY: {
    label: "Massage Therapy",
    requiresBodyPart: true,
    requiresDiagnosis: false,
    requiresPainTracking: false,
    defaultSlotMins: 60,
    icon: "Hands",
  },
  OCCUPATIONAL_THERAPY: {
    label: "Occupational Therapy",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 60,
    icon: "Briefcase",
  },
  COUNSELING: {
    label: "Counseling",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 60,
    icon: "MessageSquare",
  },
  PSYCHIATRY: {
    label: "Psychiatry",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 45,
    icon: "Brain",
  },
  PSYCHOLOGY: {
    label: "Psychology",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 60,
    icon: "Brain",
  },
  THERAPY: {
    label: "Therapy",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 60,
    icon: "MessageSquare",
  },
  GENERAL_PRACTICE: {
    label: "General Practice",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 30,
    icon: "Heart",
  },
  DENTISTRY: {
    label: "Dentistry",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 30,
    icon: "Smile",
  },
  ORTHOPEDIC: {
    label: "Orthopedic",
    requiresBodyPart: true,
    requiresDiagnosis: true,
    requiresPainTracking: true,
    defaultSlotMins: 45,
    icon: "Bones",
  },
  CARDIOLOGY: {
    label: "Cardiology",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 30,
    icon: "Heart",
  },
  DERMATOLOGY: {
    label: "Dermatology",
    requiresBodyPart: true,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 30,
    icon: "Zap",
  },
  NUTRITION: {
    label: "Nutrition",
    requiresBodyPart: false,
    requiresDiagnosis: false,
    requiresPainTracking: false,
    defaultSlotMins: 45,
    icon: "Apple",
  },
  DIETITIAN: {
    label: "Dietitian",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 45,
    icon: "Apple",
  },
  AYURVEDA: {
    label: "Ayurveda",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 60,
    icon: "Leaf",
  },
  HOMEOPATHY: {
    label: "Homeopathy",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 45,
    icon: "Droplet",
  },
  SPEECH_THERAPY: {
    label: "Speech Therapy",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 45,
    icon: "Mic",
  },
  AUDIOLOGY: {
    label: "Audiology",
    requiresBodyPart: false,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 30,
    icon: "Ear",
  },
  SPORTS_MEDICINE: {
    label: "Sports Medicine",
    requiresBodyPart: true,
    requiresDiagnosis: true,
    requiresPainTracking: true,
    defaultSlotMins: 45,
    icon: "Zap",
  },
  VETERINARY: {
    label: "Veterinary",
    requiresBodyPart: true,
    requiresDiagnosis: true,
    requiresPainTracking: false,
    defaultSlotMins: 30,
    icon: "Heart",
  },
  CUSTOM: {
    label: "Custom",
    requiresBodyPart: false,
    requiresDiagnosis: false,
    requiresPainTracking: false,
    defaultSlotMins: 60,
    icon: "Settings",
  },
};


// Safe lookup helper — use this everywhere instead of PRACTICE_TYPE_CONFIG[x]
export function getPracticeConfig(type: string) {
  return PRACTICE_TYPE_CONFIG[type as PracticeType] ?? PRACTICE_TYPE_CONFIG.CUSTOM;
}

export function getPracticeColor(type: string) {
  return PRACTICE_TYPE_COLORS[type as PracticeType] ?? "text-gray-600 bg-gray-50";
}