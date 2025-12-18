// src/api/Springboot/backendAdminAuctionService.ts

import { backendGet,backendPatch} from "../Springboot/backendClient";
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



import type { AdminAuctionUpdateRequest } from "../../models/Springboot/Auction";
/**
 * Κάνει edit μια δημοπρασία (ADMIN).
 *
 * PATCH /api/admin/auctions/{id}
 */
export async function adminEditAuction(
  auctionId: number,
  payload: AdminAuctionUpdateRequest
): Promise<AuctionDetails> {
  return backendPatch<AuctionDetails>(
    `/api/admin/auctions/${auctionId}`,
    payload
  );
}


// cancel auction
export async function cancelAuction(auctionId: number): Promise<void> {
  await backendPatch<void>(`/api/admin/auctions/${auctionId}/cancel`);
}




import type { AuctionListItem } from "../../models/Springboot/Auction";

/**
 * Ταιριάζει με το PageResponse<T> του backend
 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Backend DTO: AuctionListItemDto + status
 */
export interface AdminAuctionListItem extends AuctionListItem {
  status: string; // AuctionStatus enum στο backend, αλλά εδώ αρκεί string
}

export type AdminAuctionListPage = PageResponse<AdminAuctionListItem>;

export type StatusGroup = "EXPIRED" | "CANCELLED" | "PENDING_APPROVAL";

export interface AdminNonActiveAuctionsQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
  statusGroup?: StatusGroup;
}

export async function adminGetNonActiveAuctions(
  params: AdminNonActiveAuctionsQuery
): Promise<AdminAuctionListPage> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 0));
  searchParams.set("size", String(params.size ?? 30));

  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.direction) searchParams.set("direction", params.direction);
  if (params.statusGroup) searchParams.set("statusGroup", params.statusGroup);

  return backendGet<AdminAuctionListPage>(
    `/api/admin/auctions/adminGetNonActiveAuctions?${searchParams.toString()}`
  );
}