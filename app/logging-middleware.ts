export type LogLevel = "info" | "warn" | "error";

export type LogEvent = {
  level: LogLevel;
  action: string;
  message: string;
  context?: Record<string, string | number | boolean>;
};

export type StoredLogEvent = LogEvent & {
  at: string;
};

const LOG_STORAGE_KEY = "affordmed-notification-logs";
const MAX_LOGS = 80;

export function writeLog(event: LogEvent) {
  if (typeof window === "undefined") {
    return;
  }

  const entry: StoredLogEvent = {
    ...event,
    at: new Date().toISOString()
  };

  try {
    const saved = window.localStorage.getItem(LOG_STORAGE_KEY);
    const logs = saved ? (JSON.parse(saved) as StoredLogEvent[]) : [];
    const nextLogs = [entry, ...logs].slice(0, MAX_LOGS);

    window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(nextLogs));
  } catch {
    window.localStorage.removeItem(LOG_STORAGE_KEY);
    window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify([entry]));
  }
}

export function readLogs() {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = window.localStorage.getItem(LOG_STORAGE_KEY);
  return saved ? (JSON.parse(saved) as StoredLogEvent[]) : [];
}
