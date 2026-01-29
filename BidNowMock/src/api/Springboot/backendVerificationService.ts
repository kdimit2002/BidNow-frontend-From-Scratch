// // src/api/Springboot/backendVerificationService.ts

// import { backendGet, backendPatch, backendPostFormData } from "./backendClient";
// import type { VerificationStatus, AuctionStatus, ShippingCostPayer } from "../../models/Springboot/Auction";


// export interface AdminVerificationAuction {
//   id: number;

//   // Βασικά στοιχεία δημοπρασίας
//   title: string | null;
//   status: AuctionStatus | null;

//   categoryName?: string | null;

//   // Πληροφορίες τιμής / αποστολής
//   startingAmount?: number | null;
//   minBidIncrement?: number | null;
//   shippingCostPayer?: ShippingCostPayer | null;

//   startDate?: string | null;
//   endDate?: string | null;

//   // Πληροφορίες πωλητή
//   sellerUsername?: string | null;
//   sellerLocation?: string | null;

//   // Verification info
//   verificationStatus?: VerificationStatus | null;
//   verificationVideoUrl?: string | null;
//   imageUrls?: string[] | null;
// }

// /**
//  * User: upload verification video για auction.
//  * POST /api/auctions/{auctionId}/verification/video (multipart)
//  */
// export async function uploadVerificationVideo(
//   auctionId: number,
//     instructionCode: string,
//   file: File
// ): Promise<void> {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("instructionCode", instructionCode);

//   await backendPostFormData<void>(
//     `/api/auctions/${auctionId}/verification/video`,
//     formData
//   );
// }

// /**
//  * Admin: GET /api/admin/verifications
//  * Επιστρέφει auctions που έχουν verificationVideoUrl != null
//  */
// export function adminGetVerificationVideos(): Promise<AdminVerificationAuction[]> {
//   return backendGet<AdminVerificationAuction[]>("/api/admin/verifications/pending");
// }

// export function adminApproveVerification(auctionId: number): Promise<void> {
//   return backendPatch<void>(`/api/admin/verifications/${auctionId}/approve`);
// }

// export function adminRejectVerification(auctionId: number): Promise<void> {
//   return backendPatch<void>(`/api/admin/verifications/${auctionId}/reject`);
// }

///////////////////////////////////////// NEWWW ///////////////////////////////////////////////////

// // src/api/Springboot/backendVerificationService.ts

// import {
//   backendGet,
//   backendPatch,
//   backendDelete,
//   backendPostFormData,
// } from "./backendClient";

// import type {
//   VerificationStatus,
//   AuctionStatus,
//   ShippingCostPayer,
// } from "../../models/Springboot/Auction";

// export interface AdminVerificationAuction {
//   id: number;

//   // Βασικά στοιχεία δημοπρασίας
//   title: string | null;
//   status: AuctionStatus | null;

//   categoryName?: string | null;

//   // Πληροφορίες τιμής / αποστολής
//   startingAmount?: number | null;
//   minBidIncrement?: number | null;
//   shippingCostPayer?: ShippingCostPayer | null;

//   startDate?: string | null;
//   endDate?: string | null;

//   // Πληροφορίες πωλητή
//   sellerUsername?: string | null;
//   sellerLocation?: string | null;

//   // Verification info
//   verificationStatus?: VerificationStatus | null;
//   verificationVideoUrl?: string | null;
//   imageUrls?: string[] | null;
// }

// /**
//  * User: Upload verification video για auction.
//  * POST /api/auctions/{auctionId}/verification/video (multipart/form-data)
//  */
// export async function uploadVerificationVideo(
//   auctionId: number,
//   file: File
// ): Promise<void> {
//   const formData = new FormData();
//   formData.append("file", file);

//   // Αν backend δεν το χρειάζεται, μπορείς να το αφαιρέσεις.
//   // Αν το χρειάζεσαι, στο backend controller βάλε @RequestParam("instructionCode") String instructionCode

//   await backendPostFormData<void>(
//     `/api/auctions/${auctionId}/verification/video`,
//     formData
//   );
// }

// /**
//  * User: Delete/Reset verification video (γυρίζει σε PENDING_UPLOAD στο backend)
//  * DELETE /api/auctions/{auctionId}/verification/delete
//  */
// export function deleteVerificationVideo(auctionId: number): Promise<void> {
//   return backendDelete<void>(`/api/auctions/${auctionId}/verification/video/delete`);
// }

// /**
//  * Admin: GET /api/admin/verifications/pending
//  * Επιστρέφει auctions που έχουν verificationVideoUrl != null (ή pending review)
//  */
// export function adminGetVerificationVideos(): Promise<AdminVerificationAuction[]> {
//   return backendGet<AdminVerificationAuction[]>("/api/admin/verifications/pending");
// }

// export function adminApproveVerification(auctionId: number): Promise<void> {
//   return backendPatch<void>(`/api/admin/verifications/${auctionId}/approve`);
// }

// export function adminRejectVerification(auctionId: number): Promise<void> {
//   return backendPatch<void>(`/api/admin/verifications/${auctionId}/reject`);
// }

/////////////////////////////////// NEW 2 //////////////////////////////////////////
// src/api/Springboot/backendVerificationService.ts

import {
  backendGet,
  backendPatch,
  backendDelete,
  backendPostFormData,
} from "./backendClient";

import type {
  VerificationStatus,
  AuctionStatus,
  ShippingCostPayer,
} from "../../models/Springboot/Auction";

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

export interface VideoDurationDto {
  duration: number; // seconds
}

/**
 * User: Upload verification video για auction.
 * POST /api/auctions/{auctionId}/verification/video (multipart/form-data)
 * Στέλνουμε ΜΟΝΟ "file".
 */
export async function uploadVerificationVideo(auctionId: number, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await backendPostFormData<void>(
    `/api/auctions/${auctionId}/verification/video`,
    formData
  );
}

/**
 * User: Delete/Reset verification video (γυρίζει σε PENDING_UPLOAD στο backend)
 * DELETE /api/auctions/{auctionId}/verification/delete
 */
export function deleteVerificationVideo(auctionId: number): Promise<void> {
  return backendDelete<void>(`/api/auctions/${auctionId}/verification/delete`);
}

/**
 * User: Πάρε τη μέγιστη διάρκεια βίντεο που απαιτείται
 * GET /api/auctions/{auctionId}/verification/video/get/duration
 */
export function getVerificationVideoDuration(auctionId: number): Promise<VideoDurationDto> {
  return backendGet<VideoDurationDto>(
    `/api/auctions/${auctionId}/verification/video/get/duration`
  );
}

// -----------------------
// Admin endpoints (όπως τα είχες)
// -----------------------

export function adminGetVerificationVideos(): Promise<AdminVerificationAuction[]> {
  return backendGet<AdminVerificationAuction[]>("/api/admin/verifications/pending");
}

export function adminApproveVerification(auctionId: number): Promise<void> {
  return backendPatch<void>(`/api/admin/verifications/${auctionId}/approve`);
}

export function adminRejectVerification(auctionId: number): Promise<void> {
  return backendPatch<void>(`/api/admin/verifications/${auctionId}/reject`);
}
