"use client";

import { useMemo, type ReactNode } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { AppNotification } from "./types";
import { notificationTime } from "./notification-service";

const typeIcons = {
  Event: <EventIcon fontSize="small" />,
  Result: <CheckCircleIcon fontSize="small" />,
  Placement: <BusinessCenterIcon fontSize="small" />
};

const typeColors = {
  Event: "secondary",
  Result: "primary",
  Placement: "warning"
} as const;

type CardProps = {
  notification: AppNotification;
  viewed: boolean;
  onToggleViewed: (id: string) => void;
};

export function NotificationCard({ notification, viewed, onToggleViewed }: CardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderColor: viewed ? "divider" : "primary.main",
        bgcolor: viewed ? "background.paper" : "#f7fbff"
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            {!viewed && <FiberManualRecordIcon color="primary" sx={{ fontSize: 12, flexShrink: 0 }} />}
            <Typography variant="h6" component="h2" sx={{ fontSize: { xs: 17, sm: 19 }, overflowWrap: "anywhere" }}>
              {notification.Message}
            </Typography>
          </Stack>
          <Tooltip title={viewed ? "Mark as new" : "Mark as viewed"}>
            <IconButton
              aria-label={viewed ? "Mark notification as new" : "Mark notification as viewed"}
              onClick={() => onToggleViewed(notification.ID)}
              size="small"
            >
              {viewed ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Chip
            icon={typeIcons[notification.Type]}
            color={typeColors[notification.Type]}
            label={notification.Type}
            size="small"
            variant={viewed ? "outlined" : "filled"}
          />
          <Chip
            icon={<AccessTimeIcon />}
            label={notificationTime(notification.Timestamp)}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
          ID: {notification.ID}
        </Typography>
      </Stack>
    </Paper>
  );
}

type SummaryProps = {
  notifications: AppNotification[];
  viewedIds: Set<string>;
};

export function SummaryBar({ notifications, viewedIds }: SummaryProps) {
  const counts = useMemo(() => {
    return notifications.reduce(
      (acc, item) => {
        acc[item.Type] += 1;
        if (!viewedIds.has(item.ID)) acc.newItems += 1;
        return acc;
      },
      { Event: 0, Result: 0, Placement: 0, newItems: 0 }
    );
  }, [notifications, viewedIds]);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} divider={<Divider flexItem orientation="vertical" />}>
        <Metric label="Total" value={notifications.length} icon={<NotificationsActiveIcon />} />
        <Metric label="New" value={counts.newItems} icon={<FiberManualRecordIcon />} />
        <Metric label="Events" value={counts.Event} icon={<EventIcon />} />
        <Metric label="Results" value={counts.Result} icon={<CheckCircleIcon />} />
        <Metric label="Placements" value={counts.Placement} icon={<BusinessCenterIcon />} />
      </Stack>
    </Paper>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <Box sx={{ minWidth: { sm: 104 }, flex: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
        {icon}
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
      <NotificationsActiveIcon color="disabled" sx={{ fontSize: 44 }} />
      <Typography variant="h6" sx={{ mt: 1 }}>
        No notifications found
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Change the filter or page limit to view more items.
      </Typography>
      <Button variant="contained" onClick={onReset}>
        Reset filters
      </Button>
    </Paper>
  );
}
