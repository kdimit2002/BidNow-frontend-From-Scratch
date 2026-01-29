// src/models/Springboot/Notification.ts
import type { SpringPage } from "./Auction";

// Πρέπει να ταιριάζει με το NotificationType enum του backend
export type NotificationType =
  | "OUTBID"
  | "AUCTION_ENDING_SOON"
  | "AUCTION_WON"
  | "AUCTION_LOST"
  | "AUCTION_APPROVED"
  | "NEW_BID_ON_MY_AUCTION"
  | "AUCTION_ENDED_FOR_OWNER"
  | "REFERRAL_CODE_USE"
  | "GENERAL";

export interface NotificationDto {
  id: number;
  notificationType: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string; // LocalDateTime -> ISO string
  metadataJson: string | null;
}

export type NotificationPage = SpringPage<NotificationDto>;
