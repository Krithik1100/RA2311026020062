"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import RefreshIcon from "@mui/icons-material/Refresh";
import { EmptyState, NotificationCard, SummaryBar } from "./components";
import { writeLog } from "./logging-middleware";
import { fetchNotifications } from "./notification-service";
import type { AppNotification, TypeFilter } from "./types";

const VIEWED_KEY = "affordmed-viewed-notifications";
const typeOptions: TypeFilter[] = ["All", "Event", "Result", "Placement"];

export default function Home() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [type, setType] = useState<TypeFilter>("All");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEWED_KEY);
    if (saved) setViewedIds(new Set(JSON.parse(saved) as string[]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchNotifications({ limit, page, type })
      .then((items) => {
        if (active) setNotifications(items);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [limit, page, type]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.Timestamp.replace(" ", "T")).getTime() - new Date(a.Timestamp.replace(" ", "T")).getTime()
    );
  }, [notifications]);

  function toggleViewed(id: string) {
    setViewedIds((current) => {
      const next = new Set(current);
      const wasViewed = next.has(id);
      if (wasViewed) next.delete(id);
      else next.add(id);
      window.localStorage.setItem(VIEWED_KEY, JSON.stringify([...next]));
      writeLog({
        level: "info",
        action: "notification.viewed.toggle",
        message: wasViewed ? "Notification marked as new" : "Notification marked as viewed",
        context: {
          notificationId: id
        }
      });
      return next;
    });
  }

  function resetFilters() {
    setType("All");
    setLimit(10);
    setPage(1);
    writeLog({
      level: "info",
      action: "notifications.filters.reset",
      message: "Notification filters reset"
    });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
              <Box>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                  Affordmed
                </Typography>
                <Typography variant="h1" sx={{ fontSize: { xs: 30, md: 42 }, lineHeight: 1.1 }}>
                  Notification Center
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }}>
                  Track events, result updates, and placement alerts from the notification service.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Button component={Link} href="/priority" variant="contained" startIcon={<PriorityHighIcon />}>
                  Priority
                </Button>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => setPage((value) => value)}>
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <SummaryBar notifications={notifications} viewedIds={viewedIds} />

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
              <FilterAltIcon color="primary" />
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  label="Type"
                  value={type}
                  onChange={(event) => {
                    const nextType = event.target.value as TypeFilter;
                    setType(nextType);
                    setPage(1);
                    writeLog({
                      level: "info",
                      action: "notifications.filter.type",
                      message: "Notification type filter changed",
                      context: {
                        type: nextType
                      }
                    });
                  }}
                >
                  {typeOptions.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel id="limit-label">Limit</InputLabel>
                <Select
                  labelId="limit-label"
                  label="Limit"
                  value={String(limit)}
                  onChange={(event) => {
                    const nextLimit = Number(event.target.value);
                    setLimit(nextLimit);
                    setPage(1);
                    writeLog({
                      level: "info",
                      action: "notifications.filter.limit",
                      message: "Notification page limit changed",
                      context: {
                        limit: nextLimit
                      }
                    });
                  }}
                >
                  {[5, 10, 15, 20].map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Stack sx={{ alignItems: "center", py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : sortedNotifications.length ? (
            <Stack spacing={1.5}>
              {sortedNotifications.map((notification) => (
                <NotificationCard
                  key={notification.ID}
                  notification={notification}
                  viewed={viewedIds.has(notification.ID)}
                  onToggleViewed={toggleViewed}
                />
              ))}
              <Stack sx={{ alignItems: "center", pt: 1 }}>
                <Pagination
                  count={5}
                  page={page}
                  onChange={(_, value) => {
                    setPage(value);
                    writeLog({
                      level: "info",
                      action: "notifications.page.change",
                      message: "Notification page changed",
                      context: {
                        page: value
                      }
                    });
                  }}
                  color="primary"
                />
              </Stack>
            </Stack>
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
