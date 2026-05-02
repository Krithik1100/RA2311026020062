import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const startedAt = Date.now();
  const { pathname, search } = request.nextUrl;

  const response = NextResponse.next();
  const elapsedMs = Date.now() - startedAt;
  const route = `${pathname}${search}`;
  const method = request.method;

  response.headers.set("x-affordmed-log-action", "request");
  response.headers.set("x-affordmed-log-method", method);
  response.headers.set("x-affordmed-log-route", route);
  response.headers.set("x-affordmed-log-status", String(response.status));
  response.headers.set("x-affordmed-log-duration-ms", String(elapsedMs));

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
