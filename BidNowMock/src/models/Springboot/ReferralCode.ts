
// src/models/Springboot/ReferralCode.ts

////////////// ADMIN DTO //////////////
export interface ReferralCodeRequest {
  code: string;
  ownerId: number;
  rewardPoints: number;
  ownerRewardPoints: number;
  maxUses: number;
  isDisabled: boolean;
}


////////////// USER DTO //////////////


// 👇 ΝΕΟ: response για isReferralCodeUser
export interface ReferralCodeUserResponse {
  code: string;
}



// 👇 από /referralCode/getCodeUsage
export interface ReferralCodeUsageResponse {
  username: string;
  code: string;
}



////// ADMIN //////////

// 👇 ΠΡΟΣΘΕΣΕ ΑΥΤΟ
export interface ReferralCodeDtoAdminResponse {
  id: number;
  code: string;
  ownerId: number;
  rewardPoints: number;
  ownerRewardPoints: number;
  maxUses: number;
  usesSoFar: number;
  isDisabled: boolean;
}



  // src/models/Springboot/ReferralCode.ts

export interface ReferralCodeRequest {
  code: string;
  ownerId: number;
  rewardPoints: number;
  ownerRewardPoints: number;
  maxUses: number;
  isDisabled: boolean;
}

// Backend record:
// public record ReferralCodeResponse(String name) {}
// Άρα το JSON είναι { "name": "..." }
export interface ReferralCodeResponse {
  name: string;
}





// 👇 ΝΕΟ: το request που στέλνουμε στο PATCH /editReferralCode/{id}
export interface ReferralCodeRequest {
  code: string;
  ownerId: number;
  rewardPoints: number;
  ownerRewardPoints: number;
  maxUses: number;
  isDisabled: boolean;
}