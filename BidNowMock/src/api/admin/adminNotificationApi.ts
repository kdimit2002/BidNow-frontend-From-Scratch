import { backendPost } from "../Springboot/backendClient";


export type AdminToUserNotificationDto = {
  userId: number;
  notificationType: NotificationType;
  title: string;
  body: string;
  /**
   * Can be empty string or null/undefined.
   * Backend stores it as provided.
   */
  metadataJson?: string | null;
};

export type SendNotificationResponse = {
  notificationId: number;
};

export async function sendAdminToUserNotification(
  dto: AdminToUserNotificationDto
): Promise<SendNotificationResponse> {
  return backendPost<SendNotificationResponse, AdminToUserNotificationDto>(
    "/api/admin/notifications/send",
    dto
  );
}
