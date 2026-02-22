import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "physio-desk-secret-key";
const JWT_EXPIRES_IN = "24h";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "physio-desk-refresh-secret";
const REFRESH_EXPIRES_IN = "7d";

export interface JWTPayload {
  doctorId:   string;
  email:      string;
  clinicName: string;
}

// ── Sign access token ──────────────────────────────────────
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ── Verify access token ────────────────────────────────────
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

// ── Sign refresh token ─────────────────────────────────────
export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// ── Verify refresh token ───────────────────────────────────
export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
}
