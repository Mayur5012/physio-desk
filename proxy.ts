import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes — no auth needed
  const publicRoutes = [
    "/login",
    "/signup",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/refresh",
  ];

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublic) return NextResponse.next();

  // Check for auth token
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
