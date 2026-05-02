"use client";

import type { AppNotification, NotificationResponse, TypeFilter } from "./types";
import { writeLog } from "./logging-middleware";

const API_PATH = "/api/notifications";

type FetchOptions = {
  limit?: number;
  page?: number;
  type?: TypeFilter;
};

export async function fetchNotifications({
  limit,
  page,
  type
}: FetchOptions): Promise<AppNotification[]> {
  const params = new URLSearchParams();

  if (limit) params.set("limit", String(limit));
  if (page) params.set("page", String(page));
  if (type && type !== "All") params.set("notification_type", type);

  const url = params.size ? `${API_PATH}?${params.toString()}` : API_PATH;
  writeLog({
    level: "info",
    action: "notifications.fetch.start",
    message: "Fetching notifications",
    context: {
      limit: limit ?? "default",
      page: page ?? "default",
      type: type ?? "All"
    }
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    writeLog({
      level: "error",
      action: "notifications.fetch.failed",
      message: "Notification API returned an error",
      context: {
        status: response.status,
        route: url
      }
    });
    throw new Error(`Notification service returned ${response.status}`);
  }

  const data = (await response.json()) as NotificationResponse;
  const notifications = Array.isArray(data.notifications) ? data.notifications : [];

  writeLog({
    level: "info",
    action: "notifications.fetch.success",
    message: "Notifications loaded",
    context: {
      count: notifications.length,
      route: url
    }
  });

  return notifications;
}

export function notificationTime(value: string) {
  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
