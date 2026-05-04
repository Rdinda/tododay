import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "tododay_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = pathname.startsWith("/app");
  const isAuthPage = pathname.startsWith("/login");
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === "1";

  if (needsAuth && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
