import { backendPostFormData, backendGet, backendPatch } from "./backendClient";
import type { SpringPage } from "../../models/Springboot/Auction";

export type ProblemReportStatus = "OPEN" | "RESOLVED";

export interface ProblemReportResponse {
  id: number;
  auctionId: number;
  title: string;
  description: string;
  videoUrl: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
}

export async function reportProblemForWonAuction(
  auctionId: number,
  data: { title: string; description: string },
  file: File
): Promise<ProblemReportResponse> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("file", file);

  return backendPostFormData<ProblemReportResponse>(
    `/api/auctions/${auctionId}/problem-reports`,
    formData
  );
}

export function getMyReportedProblemAuctionIds(): Promise<number[]> {
  return backendGet<number[]>(
    "/api/auctions/problem-reports/mine/auction-ids"
  );
}

export interface LocationDto {
  country: string;
  region: string;
  city: string;
  addressLine: string;
  postalCode: string;
}

export interface AdminUserEntityDto {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  firebaseId: string;
  rewardPoints: number;
  avatar: unknown; // δεν ξέρουμε αν είναι enum/object -> κρατάμε unknown
  role: string;
  isBanned: boolean;
  isAnonymized: boolean;
  eligibleForChat: boolean;
  locationDto: LocationDto | null;
}

export interface AdminProblemReport {
  id: number;
  auctionId: number;
  auctionTitle: string;
  title: string;
  description: string;
  videoUrl: string;
  status: ProblemReportStatus;
  createdAt: string;
  reporter: AdminUserEntityDto;
  auction: AdminAuctionDetailsDto; // ✅ NEW
}


export function adminGetProblemReports(params?: {
  status?: "ALL" | ProblemReportStatus;
  page?: number;
  size?: number;
}): Promise<SpringPage<AdminProblemReport>> {
  const q = new URLSearchParams();
  q.set("status", params?.status ?? "ALL");
  q.set("page", String(params?.page ?? 0));
  q.set("size", String(params?.size ?? 20));

  return backendGet<SpringPage<AdminProblemReport>>(
    `/api/admin/problem-reports?${q.toString()}`
  );
}

export function adminResolveProblemReport(reportId: number): Promise<void> {
  return backendPatch<void>(`/api/admin/problem-reports/${reportId}/resolve`);
}

export interface AdminAuctionDetailsDto {
  id: number;
  title: string;
  categoryName: string | null;
  status: string;
  shippingCostPayer: string;
  shortDescription: string | null;
  description: string | null;
  startingAmount: number;
  minBidIncrement: number;
  startDate: string;
  endDate: string;
  imageUrls: string[];
  seller: AdminUserEntityDto; // ✅ full seller
}

