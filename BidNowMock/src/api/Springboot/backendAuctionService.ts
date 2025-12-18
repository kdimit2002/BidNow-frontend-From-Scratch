// src/api/Springboot/backendAuctionService.ts

import {
  backendGet,
  backendPost,
  BACKEND_BASE_URL,
  getFirebaseAuthToken,
} from "./backendClient";

import type {
  AuctionListItem,
  AuctionDetails,
  SpringPage,
  AuctionCreateRequest,
} from "../../models/Springboot/Auction";

export interface GetAuctionsParams {
  search?: string;
  sortBy?: string;
  direction?: string;
  region?: string;
  country?: string;
  categoryId?: number;
  page?: number;
  expiredLast7Days?: boolean;
}

/**
 * GET /auctions με φίλτρα και paging.
 */
export function getAuctions(
  params: GetAuctionsParams
): Promise<SpringPage<AuctionListItem>> {
  const {
    search,
    sortBy,
    direction,
    region,
    country,
    categoryId,
    page = 0,
    expiredLast7Days = false,
  } = params;

  const query = new URLSearchParams();

  query.set("page", String(page));
  query.set("size", "30"); // backend θέλει size=30
  query.set("expiredLast7Days", String(expiredLast7Days));

  if (search) query.set("search", search);
  if (sortBy) query.set("sortBy", sortBy);
  if (direction) query.set("direction", direction);
  if (region) query.set("region", region);
  if (country) query.set("country", country);
  if (typeof categoryId === "number") {
    query.set("categoryId", String(categoryId));
  }

  const qs = query.toString();
  const path = `/auctions${qs ? `?${qs}` : ""}`;

  return backendGet<SpringPage<AuctionListItem>>(path);
}

/**
 * GET /auctions/{id} – full details
 */
export function getAuctionById(id: number): Promise<AuctionDetails> {
  return backendGet<AuctionDetails>(`/auctions/${id}`);
}

/**
 * POST /auctions – δημιουργία auction (χωρίς εικόνες).
 */
export function createAuction(
  request: AuctionCreateRequest
): Promise<AuctionDetails> {
  return backendPost<AuctionDetails, AuctionCreateRequest>("/auctions", request);
}

/**
 * POST /api/files/{auctionId}/image
 * multipart/form-data με field "file".
 * Επιστρέφει ένα string (το URL).
 */
export async function uploadAuctionMainImage(
  auctionId: number,
  file: File
): Promise<string> {
  const token = getFirebaseAuthToken();

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BACKEND_BASE_URL}/api/files/${auctionId}/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const url = await res.text();
  return url;
}

/**
 * POST /api/files/{auctionId}/images
 * multipart/form-data με field "files" (multiple).
 * Επιστρέφει λίστα από URLs (string[]).
 */
export async function uploadAuctionImages(
  auctionId: number,
  files: File[]
): Promise<string[]> {
  if (files.length === 0) return [];

  const token = getFirebaseAuthToken();

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const res = await fetch(
    `${BACKEND_BASE_URL}/api/files/${auctionId}/images`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    }
  );

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const urls = (await res.json()) as string[];
  return urls;
}



export async function getMyPendingAuctions(params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}): Promise<SpringPage<AuctionListItem>> {
  const query = new URLSearchParams();

  if (params?.page !== undefined) {
    query.set("page", String(params.page));
  }
  if (params?.size !== undefined) {
    query.set("size", String(params.size));
  }
  if (params?.sortBy) {
    query.set("sortBy", params.sortBy);
  }
  if (params?.direction) {
    query.set("direction", params.direction);
  }

  const qs = query.toString();
  const path = qs ? `/auctions/my-pending?${qs}` : "/auctions/my-pending";

  return backendGet<SpringPage<AuctionListItem>>(path);
}



export interface MyAuctionsQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

/**
 * GET /api/auctions/my-bids
 * Επιστρέφει auctions στα οποία ο τρέχων user έχει ενεργό bid.
 */
export async function getMyActiveBidAuctions(
  params: MyAuctionsQuery = {}
): Promise<SpringPage<AuctionListItem>> {
  const {
    page = 0,
    size = 30,
    sortBy,
    direction,
  } = params;

  return backendGet<SpringPage<AuctionListItem>>(
    "/auctions/my-bids",
    {
      params: {
        page,
        size,
        sortBy,
        direction,
      },
    }
  );
}

/**
 * GET /api/auctions/my-wins
 * Επιστρέφει auctions που έχει κερδίσει ο τρέχων user.
 */
export async function getMyWonAuctions(
  params: MyAuctionsQuery = {}
): Promise<SpringPage<AuctionListItem>> {
  const {
    page = 0,
    size = 30,
    sortBy,
    direction,
  } = params;

  return backendGet<SpringPage<AuctionListItem>>(
    "/auctions/my-wins",
    {
      params: {
        page,
        size,
        sortBy,
        direction,
      },
    }
)
}


// src/api/Springboot/backendAuctionService.ts

// import { SPRINGBOOT_API_BASE_URL } from "../config"; // προσαρμόζεις στο δικό σου base URL

import type { AuctionStatus } from "../../models/Springboot/Auction";

export interface GetMyAuctionsParams {
  page?: number;
  size?: number;
  sortBy?: "startDate" | "endDate";
  direction?: "asc" | "desc";
  statusGroup?: AuctionStatus; // ACTIVE | EXPIRED | CANCELLED | PENDING_APPROVAL
}

/**
 * GET /auctions/my
 * Οι δημοπρασίες που έχω δημιουργήσει (owner = current user).
 */
export function getMyAuctions(
  params: GetMyAuctionsParams = {}
): Promise<SpringPage<AuctionListItem>> {
  const {
    page = 0,
    size = 30,
    sortBy,
    direction,
    statusGroup = "ACTIVE",
  } = params;

  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("size", String(size));
  query.set("statusGroup", statusGroup);

  if (sortBy) query.set("sortBy", sortBy);
  if (direction) query.set("direction", direction);

  const qs = query.toString();
  const path = qs ? `/auctions/my?${qs}` : "/auctions/my";

  return backendGet<SpringPage<AuctionListItem>>(path);
}