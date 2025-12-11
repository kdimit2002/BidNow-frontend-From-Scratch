import { backendPost } from "./backendClient";

export async function placeBid(
  auctionId: number,
  amount: number
): Promise<void> {
  // το backend περιμένει απλά ένα BigDecimal στο σώμα, π.χ. 550
  return backendPost<void>(`/api/auctions/${auctionId}/bids`, amount);
}