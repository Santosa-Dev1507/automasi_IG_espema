import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Middleware: enforce authentication for /dashboard routes.
 * In dev mode with DEV_BYPASS_AUTH=true, skip the auth check.
 */
export default auth((req) => {
  const isDevBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_AUTH === "true";

  if (isDevBypass) return NextResponse.next();

  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
