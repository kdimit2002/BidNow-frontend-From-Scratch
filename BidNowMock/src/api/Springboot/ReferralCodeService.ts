import { backendPost,backendGet } from "./backendClient";
import type { ReferralCodeResponse,  ReferralCodeUsageResponse} from "../../models/Springboot/ReferralCode";




/////////////////// ADMIN APIS ///////////////////


export function redeemReferralCodeApi(code: string): Promise<ReferralCodeResponse> {
  return backendPost<ReferralCodeResponse>(
    `/referralCode/useReferralCode/${encodeURIComponent(code)}`
  );
}

// src/api/Springboot/ReferralCodeService.ts
import type {
  ReferralCodeRequest, ReferralCodeUserResponse,
} from "../../models/Springboot/ReferralCode";

// POST /api/admin/createReferralCode
export async function createReferralCodeApi(
  body: ReferralCodeRequest
): Promise<ReferralCodeResponse> {
  return backendPost<ReferralCodeResponse, ReferralCodeRequest>(
    "/api/admin/createReferralCode",
    body
  );
}



/////////////////// USER APIS ///////////////////

// 👇 ΝΕΟ: GET /referralCode/isReferralCodeUser
export async function fetchReferralCodeUser(): Promise<ReferralCodeUserResponse> {
  return backendGet<ReferralCodeUserResponse>("/referralCode/isReferralCodeUser");
}


import type { PageResponse } from "../../admin/models/AdminResponseUser";


// 🔹 ποιοι χρησιμοποίησαν τον κωδικό του;
export async function fetchReferralCodeUsage(
  page = 0,
  size = 10
): Promise<PageResponse<ReferralCodeUsageResponse>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  // Αν το controller είναι @RequestMapping("/referralCode")
  // τότε το full path είναι /referralCode/getCodeUsage
  return backendGet<PageResponse<ReferralCodeUsageResponse>>(
    `/referralCode/getCodeUsage?${params.toString()}`
  );
}


// src/api/admin/ReferralCodes.ts
import type { ReferralCodeDtoAdminResponse } from "../../models/Springboot/ReferralCode";

/**
 * Φέρνει μία σελίδα με referral codes για το admin.
 */
export async function getReferralCodes(
  page: number,
  size: number
): Promise<PageResponse<ReferralCodeDtoAdminResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  // Υποθέτω ότι το endpoint είναι /api/admin/referralCodes
  return backendGet<PageResponse<ReferralCodeDtoAdminResponse>>(
    `/api/admin/referralCodes?${params.toString()}`
  );
}



import { backendPatch } from "./backendClient";

/**
 * Κάνει PATCH /editReferralCode/{id} για update υπάρχοντος referral code.
 */
export async function editReferralCode(
  id: number,
  body: ReferralCodeRequest
): Promise<ReferralCodeDtoAdminResponse> {
  return backendPatch<ReferralCodeDtoAdminResponse, ReferralCodeRequest>(
    `/api/admin/editReferralCode/${id}`,
    body
  );
}




export async function getReferralCodeByCode(
  code: string
): Promise<ReferralCodeDtoAdminResponse> {
  return backendGet<ReferralCodeDtoAdminResponse>(
    `/api/admin/referralCodes/${encodeURIComponent(code)}`
  );
}

export interface ReferralCodeDetailsDto {
  code: string;
  points: number; // backend Long
  disabled: boolean; // backend Boolean
  remainingUsages: number; // backend Integer
}

const OWNER_DETAILS_ENDPOINT = "/referralCode/ownerReferralCodeDetails";

export async function fetchOwnerReferralCodeDetails(): Promise<ReferralCodeDetailsDto> {
  return backendGet<ReferralCodeDetailsDto>(OWNER_DETAILS_ENDPOINT);
}