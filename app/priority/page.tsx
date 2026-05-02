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
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TuneIcon from "@mui/icons-material/Tune";
import { NotificationCard, SummaryBar } from "../components";
import { writeLog } from "../logging-middleware";
import { fetchNotifications } from "../notification-service";
import type { AppNotification, TypeFilter } from "../types";

const VIEWED_KEY = "affordmed-viewed-notifications";
const typeOptions: TypeFilter[] = ["All", "Event", "Result", "Placement"];

export default function PriorityPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [type, setType] = useState<TypeFilter>("All");
  const [limit, setLimit] = useState(5);
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

    fetchNotifications({ limit, page: 1, type })
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
  }, [limit, type]);

  const priorityItems = useMemo(() => {
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
        action: "priority.viewed.toggle",
        message: wasViewed ? "Priority notification marked as new" : "Priority notification marked as viewed",
        context: {
          notificationId: id
        }
      });
      return next;
    });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
              <Box>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                  Priority View
                </Typography>
                <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 38 }, lineHeight: 1.1 }}>
                  Top Notifications
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Limit the newest notifications and narrow them by type.
                </Typography>
              </Box>
              <Button component={Link} href="/" variant="outlined" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start" }}>
                All notifications
              </Button>
            </Stack>
          </Paper>

          <SummaryBar notifications={notifications} viewedIds={viewedIds} />

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
              <TuneIcon color="primary" />
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="priority-type-label">Type</InputLabel>
                <Select
                  labelId="priority-type-label"
                  label="Type"
                  value={type}
                  onChange={(event) => {
                    const nextType = event.target.value as TypeFilter;
                    setType(nextType);
                    writeLog({
                      level: "info",
                      action: "priority.filter.type",
                      message: "Priority type filter changed",
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
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="priority-limit-label">Top n</InputLabel>
                <Select
                  labelId="priority-limit-label"
                  label="Top n"
                  value={String(limit)}
                  onChange={(event) => {
                    const nextLimit = Number(event.target.value);
                    setLimit(nextLimit);
                    writeLog({
                      level: "info",
                      action: "priority.filter.limit",
                      message: "Priority limit changed",
                      context: {
                        limit: nextLimit
                      }
                    });
                  }}
                >
                  {[5, 8, 10].map((item) => (
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
          ) : (
            <Stack spacing={1.5}>
              {priorityItems.map((notification) => (
                <NotificationCard
                  key={notification.ID}
                  notification={notification}
                  viewed={viewedIds.has(notification.ID)}
                  onToggleViewed={toggleViewed}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
