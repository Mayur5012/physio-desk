import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";  // ← was verifyAccessToken, now verifyToken

export async function getAuthDoctor(req: NextRequest): Promise<string> {
  let token = req.cookies.get("accessToken")?.value;

  // Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const payload = verifyToken(token);
    return payload.doctorId;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
