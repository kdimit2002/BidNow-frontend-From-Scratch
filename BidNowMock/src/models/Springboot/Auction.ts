// // src/models/Springboot/Auction.ts

// // Ένα auction όπως έρχεται από το AuctionListItemDto (Spring)
// export interface AuctionListItem {
//   id: number;
//   title: string;
//   categoryName: string;
//   sellerUsername: string;
//   sellerLocation: string;
//   shortDescription: string;
//   startingAmount: number;
//   minBidIncrement: number;
//   topBidAmount: number | null;
//   topBidderUsername: string | null;
//   mainImageUrl: string | null;
//   endDate: string; // ISO datetime string, π.χ. "2025-12-26T15:19:00"
//   status: string;  // AuctionStatus enum στο backend, εδώ το κρατάμε ως string
//   eligibleForBid: boolean;
// }

// // Γενικό Spring Page<T> για τα paginated responses
// export interface SpringPage<T> {
//   content: T[];
//   totalElements: number;
//   totalPages: number;
//   size: number;
//   number: number;
//   first: boolean;
//   last: boolean;
//   // αν το Spring σου στέλνει και άλλα (sort, empty, pageable κτλ.) τα αγνοούμε
// }


// export interface ChatMessageResponse {
//   id: number;
//   senderDisplayName: string;
//   senderFirebaseId: string;
//   content: string;
//   createdAt: string; // LocalDateTime → ISO string
//   remainingMessages?: number;
// }

// // 👇 BidResponseDto όπως στο backend
// export interface BidResponseDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string; // LocalDateTime → ISO string
//   auctionId: number;
// }

// // 👇 Full AuctionResponseDto → AuctionDetails
// export interface AuctionDetails {
//   id: number;
//   title: string;
//   categoryName: string;
//   sellerUsername: string;
//   sellerLocation: string;
//   shortDescription: string;
//   description: string;
//   startingAmount: number;
//   minBidIncrement: number;
//   startDate: string;
//   endDate: string;
//   status: string;
//   shippingCostPayer: ShippingCostPayer; 
//   imageUrls: string[];
//   chat: ChatMessageResponse[];
//   bids: BidResponseDto[];
//   eligibleForBid: boolean;
//   eligibleForChat: boolean;
// }


// export interface AuctionCreateRequest {
//   categoryId: number;
//   title: string;
//   shortDescription: string;
//   description: string;
//   startingAmount: number;
//   minBidIncrement: number;
//   startDate: string; // ISO local datetime π.χ. "2025-12-05T14:00"
//   endDate: string;   // ίδιο format
//   shippingCostPayer: ShippingCostPayer; 
// }


// export type ShippingCostPayer = "SELLER" | "BUYER" | "SPLIT";


// src/models/Springboot/Auction.ts

// -----------------------------
// Core enums / unions
// -----------------------------

export type AuctionStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

export type ShippingCostPayer = "SELLER" | "BUYER" | "SPLIT";

// -----------------------------
// Pagination shapes
// -----------------------------

// Spring Page<T> (αν κάποια endpoints σου γυρίζουν Spring Data Page)
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// PageResponse<T> (αν κάποια endpoints γυρίζουν το δικό σου PageResponse DTO)
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// -----------------------------
// Auction list item (AuctionListItemDto)
// -----------------------------

export interface AuctionListItem {
  id: number;
  title: string;
  categoryName: string;

  sellerUsername: string;
  sellerLocation: string;

  shortDescription: string;

  startingAmount: number;
  minBidIncrement: number;

  topBidAmount: number | null;
  topBidderUsername: string | null;

  mainImageUrl: string | null;

  endDate: string; // ISO datetime string
  status: AuctionStatus | string; // κρατάμε και string για συμβατότητα αν backend στείλει κάτι έξτρα

  eligibleForBid: boolean;
}

// -----------------------------
// Chat / bids
// -----------------------------

export interface ChatMessageResponse {
  id: number;
  senderDisplayName: string;
  senderFirebaseId: string;
  content: string;
  createdAt: string; // LocalDateTime -> ISO string
  remainingMessages?: number;
}

export interface BidResponseDto {
  id: number;
  amount: number;
  bidderUsername: string;
  createdAt: string; // LocalDateTime -> ISO string
  auctionId: number;
}

// -----------------------------
// Verification
// -----------------------------

export type VerificationStatus =
  | "NOT_VERIFIED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type VerificationInstructionCode =
  | "VID_20S"
  | "VID_30S"
  | "VID_40S"
  | "VID_50S"
  | "VID_60S"
  | (string & {}); // επιτρέπει και μελλοντικές τιμές χωρίς να σπάει το TS

export interface VerificationUploadResponse {
  id: number;
  fileUrl: string;
  instructionCode: VerificationInstructionCode;
  createdAt: string;
}

// -----------------------------
// Auction details (AuctionResponseDto -> AuctionDetails)
// -----------------------------

export interface AuctionDetails {
  id: number;
  title: string;
  categoryName: string;

  sellerUsername: string;
  sellerLocation: string;

  shortDescription: string;
  description: string;

  startingAmount: number;
  minBidIncrement: number;

  startDate: string; // ISO datetime string
  endDate: string; // ISO datetime string

  status: AuctionStatus | string;

  verificationStatus?: VerificationStatus;

  shippingCostPayer: ShippingCostPayer;

  imageUrls: string[];

  chat: ChatMessageResponse[];
  bids: BidResponseDto[];

  eligibleForBid: boolean;
  eligibleForChat: boolean;
}

// -----------------------------
// Create / admin update
// -----------------------------

export interface AuctionCreateRequest {
  categoryId: number;
  title: string;
  shortDescription: string;
  description: string;

  startingAmount: number;
  minBidIncrement: number;

  startDate: string; // ISO local datetime π.χ. "2025-12-05T14:00"
  endDate: string; // ίδιο format

  shippingCostPayer: ShippingCostPayer;
}

export interface AdminAuctionUpdateRequest {
  categoryId?: number;
  title?: string;
  shortDescription?: string;
  description?: string;

  startingAmount?: number;
  minBidIncrement?: number;

  startDate?: string;
  endDate?: string;

  shippingCostPayer?: ShippingCostPayer;

  auctionStatus?: AuctionStatus;
}

// -----------------------------
// Uploads (π.χ. Cloudflare R2 / Stream)
// -----------------------------

export interface DirectUploadResponse {
  uploadURL: string;
  streamUid: string;
}
