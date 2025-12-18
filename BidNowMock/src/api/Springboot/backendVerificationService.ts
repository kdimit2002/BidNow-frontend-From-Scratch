// src/api/Springboot/backendVerificationService.ts

import { backendGet, backendPatch, backendPostFormData } from "./backendClient";
import type { VerificationStatus, AuctionStatus, ShippingCostPayer } from "../../models/Springboot/Auction";


export interface AdminVerificationAuction {
  id: number;

  // Βασικά στοιχεία δημοπρασίας
  title: string | null;
  status: AuctionStatus | null;

  categoryName?: string | null;

  // Πληροφορίες τιμής / αποστολής
  startingAmount?: number | null;
  minBidIncrement?: number | null;
  shippingCostPayer?: ShippingCostPayer | null;

  startDate?: string | null;
  endDate?: string | null;

  // Πληροφορίες πωλητή
  sellerUsername?: string | null;
  sellerLocation?: string | null;

  // Verification info
  verificationStatus?: VerificationStatus | null;
  verificationVideoUrl?: string | null;
  imageUrls?: string[] | null;
}

/**
 * User: upload verification video για auction.
 * POST /api/auctions/{auctionId}/verification/video (multipart)
 */
export async function uploadVerificationVideo(
  auctionId: number,
    instructionCode: string,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("instructionCode", instructionCode);

  await backendPostFormData<void>(
    `/api/auctions/${auctionId}/verification/video`,
    formData
  );
}

/**
 * Admin: GET /api/admin/verifications
 * Επιστρέφει auctions που έχουν verificationVideoUrl != null
 */
export function adminGetVerificationVideos(): Promise<AdminVerificationAuction[]> {
  return backendGet<AdminVerificationAuction[]>("/api/admin/verifications/pending");
}

export function adminApproveVerification(auctionId: number): Promise<void> {
  return backendPatch<void>(`/api/admin/verifications/${auctionId}/approve`);
}

export function adminRejectVerification(auctionId: number): Promise<void> {
  return backendPatch<void>(`/api/admin/verifications/${auctionId}/reject`);
}

