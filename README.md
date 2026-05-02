# RA2311026020062

Campus hiring evaluation frontend built with Next.js, React, and Material UI.

## Requirement Coverage

- Fetches notifications from `http://20.207.122.201/evaluation-service/notifications` through the local `/api/notifications` rewrite.
- Supports `limit`, `page`, and `notification_type` query parameters.
- Displays all notifications on the home page.
- Provides a separate priority page for top `n` notifications with type filtering.
- Distinguishes new and viewed notifications using frontend state persisted in local storage.
- Uses Material UI for layout, controls, cards, chips, icons, loading states, and alerts.
- Uses project logging middleware/helpers instead of console logging.
- Runs on `http://localhost:3000` with `npm run dev`.
