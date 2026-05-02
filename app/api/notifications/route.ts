import { NextRequest, NextResponse } from "next/server";

const NOTIFICATION_API_URL = "http://20.207.122.201/evaluation-service/notifications";

export async function GET(request: NextRequest) {
  const upstreamUrl = new URL(NOTIFICATION_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  const headers = new Headers({
    Accept: "application/json"
  });

  const accessToken = process.env.AFFORDMED_ACCESS_TOKEN;
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const startedAt = Date.now();
  const upstreamResponse = await fetch(upstreamUrl, {
    headers,
    cache: "no-store"
  });

  const payload = await upstreamResponse.text();
  const response = new NextResponse(payload, {
    status: upstreamResponse.status,
    headers: {
      "content-type": upstreamResponse.headers.get("content-type") ?? "application/json",
      "x-affordmed-log-action": "notifications.proxy",
      "x-affordmed-log-status": String(upstreamResponse.status),
      "x-affordmed-log-duration-ms": String(Date.now() - startedAt)
    }
  });

  return response;
}
