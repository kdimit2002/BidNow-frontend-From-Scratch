// src/api/Springboot/backendNotificationService.ts

import { backendGet } from "./backendClient";
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
