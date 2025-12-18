// src/models/Springboot/AdminNotification.ts

export interface AdminBroadcastNotificationRequest {
  title: string;
  body: string;
  metadataJson: string; // μπορεί να είναι κενό string αν δεν θέλεις metadata
}

export interface AdminBroadcastNotificationResponse {
  announcementId: number;
}
