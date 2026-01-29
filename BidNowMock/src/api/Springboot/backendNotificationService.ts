// src/api/Springboot/backendNotificationService.ts

import { backendGet,backendPatch } from "./backendClient";
import type { NotificationPage } from "../../models/Springboot/Notification";

export async function getMyNotifications(
  page = 0,
  size = 20
): Promise<NotificationPage> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  return backendGet<NotificationPage>(
    `/api/notifications/getNotifications?${params.toString()}`
  );
}


/**
 * Mark as read (PATCH)
 * Σημείωση: ΔΕΝ το καλούμε για announcements (έχουν αρνητικό id).
 */
export async function markNotificationAsRead(id: number): Promise<void> {
  if (id <= 0) return; // announcements: -id
  // ✅ το πιο “λογικό” endpoint: /api/notifications/{id}/markAsRead
  await backendPatch<void>(`/api/notifications/${id}/markAsRead`);
}


export type NotificationsCountDto = { count: number };

export async function getMyUnreadNotificationsCount(): Promise<number> {
  const dto = await backendGet<NotificationsCountDto>("/api/notifications/my/unread/count");
  return Number(dto?.count ?? 0);
}
