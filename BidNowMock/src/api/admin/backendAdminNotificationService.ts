// src/api/Springboot/backendAdminNotificationService.ts

import { backendPost } from "../Springboot/backendClient";
import type { AdminBroadcastNotificationRequest,AdminBroadcastNotificationResponse } from "../../admin/models/AdminNotificationRequest";

export async function broadcastAdminNotification(
  request: AdminBroadcastNotificationRequest
): Promise<AdminBroadcastNotificationResponse> {
  return backendPost<
    AdminBroadcastNotificationResponse,
    AdminBroadcastNotificationRequest
  >("/api/admin/notifications/broadcast", request);
}
