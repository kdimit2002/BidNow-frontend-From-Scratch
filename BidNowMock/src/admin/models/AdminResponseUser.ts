// src/types/adminUser.ts

export type Region = 'NICOSIA' | 'LIMASSOL' | 'LARNACA' | 'PAPHOS' | 'FAMAGUSTA';

export interface LocationDto {
  country: string;
  region: Region;
}


// Generic Spring Page<T>
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;   // page size
  number: number; // current page (0-based)
  first: boolean;
  last: boolean;
}

import type { Avatar } from "../../models/Springboot/UserEntity";


// DTO για το PUT toy admin /editUser/{firebaseId}
export interface UserEntityUpdateAdmin {
  username: string;
  email: string;
  rewardPoints: number;
  avatar: Avatar;
  role: string;
  isBanned: boolean;
  isAnonymized: boolean;
  eligibleForChat: boolean;
  locationDto: LocationDto;
}


// 👇 SearchBy όπως το backend (id, username κτλ)
export type UserSearchBy =
  | "id"
  | "username"
  | "email"
  | "phoneNumber"
  | "firebaseId"
  | "role";


export interface AdminUserEntityDto {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  firebaseId: string;
  rewardPoints: number;
  allTimeRewardPoints: number;
  avatarUrl: string;
  role: string;
  isBanned: boolean;
  isAnonymized: boolean;
  eligibleForChat: boolean;
  locationDto?: LocationDto | null;

  // 👇 Νέα πεδία από backend
  isReferralCodeOwner: boolean;
  referralCodeName: string | null;
  hasUsedReferralCode: boolean;
  referralCodeUsed: string | null;
}


// export interface AdminUserEntityDto {
//   id: number;
//   username: string;
//   email: string;
//   phoneNumber: string;
//   firebaseId: string;
//   rewardPoints: number;
//   allTimeRewardPoints: number;
//   avatarUrl: string;
//   role: string;
//   isBanned: boolean;
//   isAnonymized: boolean;
//   eligibleForChat: boolean;
//   locationDto?: LocationDto | null; // το κάνω optional/null-safe για να μην σπάει αν λείπει
// }
