/**
 * OTP Utilities for Password Reset
 * Generates secure OTPs and manages expiration
 */

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get OTP expiration time (5 minutes from now)
 */
export function getOTPExpiration(): Date {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 5);
  return expiration;
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(expirationTime: Date): boolean {
  return new Date() > expirationTime;
}

/**
 * Verify OTP matches and hasn't expired
 */
export function verifyOTP(
  providedOTP: string,
  storedOTP: string,
  expirationTime: Date
): boolean {
  if (isOTPExpired(expirationTime)) {
    return false;
  }
  return providedOTP === storedOTP;
}

/**
 * Generate password reset token (for DB storage)
 */
export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
