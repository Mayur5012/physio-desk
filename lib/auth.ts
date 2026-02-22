import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";  // ← was verifyAccessToken, now verifyToken

export async function getAuthDoctor(req: NextRequest): Promise<string> {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const payload = verifyToken(token);  // ← was verifyAccessToken
    return payload.doctorId;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
