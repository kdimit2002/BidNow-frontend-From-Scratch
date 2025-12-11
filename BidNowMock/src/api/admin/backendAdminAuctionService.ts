// src/api/Springboot/backendAdminAuctionService.ts

import { backendGet,backendPatch } from "../Springboot/backendClient";
import type { AuctionDetails } from "../../models/Springboot/Auction";
// 👆 Αν το path διαφέρει στο project σου, κάν' το ίδιο όπως στο backendAuctionService.ts

/**
 * Επιστρέφει ΟΛΕΣ τις δημοπρασίες με status PENDING_APPROVAL
 * για το admin panel.
 *
 * GET /api/admin/auctions/pending
 */
export async function getAdminPendingAuctions(): Promise<AuctionDetails[]> {
  return backendGet<AuctionDetails[]>("/api/admin/auctions/pending");
}

/**
 * Κάνει approve μια δημοπρασία (ADMIN).
 *
 * PATCH /api/admin/auctions/{id}/approve
 */
export async function approveAuction(auctionId: number): Promise<void> {
  await backendPatch<void>(`/api/admin/auctions/${auctionId}/approve`, {
    method: "PATCH",
  });
}
