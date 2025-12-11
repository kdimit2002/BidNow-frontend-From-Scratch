
// export type Avatar =
//   | "BEARD_MAN_AVATAR"
//   | "MAN_AVATAR"
//   | "BLONDE_GIRL_AVATAR"
//   | "GIRL_AVATAR"
//   | "DEFAULT_AVATAR"
//   | "DEFAULT";


// export type Country = "Cyprus";


// // models/Region.ts
// export type Region =
//   | "NICOSIA"
//   | "FAMAGUSTA"
//   | "LIMASSOL"
//   | "PAPHOS";
//     // ↑ εδώ βάλε ακριβώς τις τιμές που έχει το Java enum Region


// export interface LocationDto {
//   country: Country;
//   region: Region;
// }


// // Spring boot request for signup
// export interface SignUpRequest {
//   roleName: string;
//   avatar: Avatar;
//   locationDto: LocationDto;
// }



// //////////////////////// GET USER PROFILE ////////////////////////

// export interface ProfileUserEntity {
//   username: string;
//   email: string;
//   phoneNumber: string;
//   avatarUrl: string;
//   avatarName: Avatar; // 👈 νέο πεδίο
//   rewardPoints: number;
//   role: string;
//   eligibleForChat: boolean;
//   locationDto: LocationDto;
// }

// src/models/Springboot/UserEntity.ts

export type Avatar =
  | "BEARD_MAN_AVATAR"
  | "MAN_AVATAR"
  | "BLONDE_GIRL_AVATAR"
  | "GIRL_AVATAR"
  | "DEFAULT_AVATAR"
  | "DEFAULT";

export type Country = "Cyprus";

export type Region =
  | "NICOSIA"
  | "FAMAGUSTA"
  | "LIMASSOL"
  | "PAPHOS";
// Αν στο Java enum έχεις και LARNACA, πρόσθεσέ το εδώ:
//  | "LARNACA";

/**
 * Location DTO όπως το περιμένει το backend.
 */
export interface LocationDto {
  country: Country;
  region: Region;
}

/**
 * API-level ονόματα ρόλων (όπως το Java enum στο backend).
 */
export type RoleApiName = "Admin" | "Auctioneer" | "Bidder";

/**
 * Request σώμα για το /api/auth/signup.
 */
export interface SignUpRequest {
  roleName: RoleApiName;
  avatar: Avatar;
  locationDto: LocationDto;
}



export interface ProfileUserEntity {
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  avatarName: Avatar;
  role: RoleApiName;
  rewardPoints: number;
  eligibleForChat: boolean;
  locationDto: LocationDto;
  allTimeRewardPoints: number;

  // 👇 νέα πεδία από το UserEntityDto του backend
  isReferralCodeOwner: boolean;
  hasUsedReferralCode: boolean;
  // Προσοχή στο κεφαλαίο R – να ταιριάζει με το JSON
  referralCodeUsed: string | null;
}

/**
 * DTO που επιστρέφεται από /api/auth/profile.
 */
// export interface ProfileUserEntity {
//   username: string;
//   email: string;
//   phoneNumber: string;
//   avatarUrl: string;
//   avatarName: Avatar;
//   role: RoleApiName;
//   rewardPoints: number;
//   eligibleForChat: boolean;
//   locationDto: LocationDto;
//   allTimeRewardPoints: number;
//   isReferralCodeOwner: boolean;
//   hasUsedReferralCode: boolean;
//   ReferralCodeUsed: string;
// }

export interface AuthUserDto {
  username: string;
  roleName: RoleApiName;
  isReferralCodeOwner: boolean;
}