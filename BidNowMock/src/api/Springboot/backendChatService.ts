// src/api/Springboot/backendChatService.ts
import { backendPost } from "./backendClient";

export interface ChatMessageRequest {
  content: string;
}

export interface ChatMessageResponse {
  id: number;
  senderDisplayName: string;
  senderFirebaseId: string;
  content: string;
  createdAt: string;
}

export async function sendChatMessage(
  auctionId: number,
  content: string
): Promise<ChatMessageResponse> {
  const body: ChatMessageRequest = { content };
  return backendPost<ChatMessageResponse>(
    `/api/auctions/chat/${auctionId}/sendMessage`,
    body
  );
}


//Get chat
