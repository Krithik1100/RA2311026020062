export type NotificationType = "Event" | "Result" | "Placement";

export type AppNotification = {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
};

export type NotificationResponse = {
  notifications: AppNotification[];
};

export type TypeFilter = NotificationType | "All";
