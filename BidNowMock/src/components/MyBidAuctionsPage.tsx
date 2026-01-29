// import React, { useState, useEffect } from "react";
// import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
// import { getMyActiveBidAuctions } from "../api/Springboot/backendAuctionService";

// interface MyBidAuctionsPageProps {
//   onOpenDetails?: (auctionId: number) => void;
//   onBack?: () => void; //tora to evala
// }


// const MyBidAuctionsPage: React.FC<MyBidAuctionsPageProps> = ({
//   onOpenDetails, onBack
// }) => {
//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] =
//     useState<SpringPage<AuctionListItem> | null>(null);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [now, setNow] = useState<Date>(new Date());
//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const loadAuctions = async (pageOverride?: number) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const pageToLoad =
//         typeof pageOverride === "number" ? pageOverride : page;

//       const result = await getMyActiveBidAuctions({
//         page: pageToLoad,
//       });

//       setPageData(result);
//       setPage(pageToLoad);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των δημοπρασιών.";
//       if (err instanceof Error) {
//         message = err.message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAuctions(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     loadAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     loadAuctions(page + 1);
//   };

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
//     const end = new Date(endDateIso);
//     const diffMs = end.getTime() - nowValue.getTime();

//     if (Number.isNaN(end.getTime())) {
//       return endDateIso;
//     }

//     if (diffMs <= 0) {
//       return "Έληξε";
//     }

//     let totalSeconds = Math.floor(diffMs / 1000);

//     const days = Math.floor(totalSeconds / (24 * 3600));
//     totalSeconds -= days * 24 * 3600;

//     const hours = Math.floor(totalSeconds / 3600);
//     totalSeconds -= hours * 3600;

//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds - minutes * 60;

//     if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
//     if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
//     if (minutes > 0) return `${minutes}m ${seconds}s`;
//     return `${seconds}s`;
//   };

//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>

//       {onBack && (
//       <div style={{ marginBottom: "1rem" }}>
//         <button type="button" onClick={onBack}>
//           ← Back to all auctions
//         </button>
//       </div>
//       )}
//       <h1>My Active Bids</h1>

//       {loading && <p>Φόρτωση...</p>}
//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

//       {pageData && (
//         <div>
//           <p>
//             Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
//             {pageData.totalElements} auctions
//           </p>

//           <ul>
//             {pageData.content.map((auction) => (
//               <li key={auction.id} style={{ marginBottom: "0.75rem" }}>
//                 main image:{" "}
//                 {auction.mainImageUrl && (
//                   <div style={{ marginBottom: "0.5rem" }}>
//                     <img
//                       src={auction.mainImageUrl}
//                       alt={auction.title}
//                       style={{
//                         maxWidth: 200,
//                         maxHeight: 200,
//                         display: "block",
//                       }}
//                     />
//                   </div>
//                 )}

//                 <strong>{auction.title}</strong> — {auction.categoryName} —{" "}
//                 {auction.startingAmount}€
//                 <br />
//                 Τοποθεσία: {getCityFromLocation(auction.sellerLocation)}
//                 <br />
//                 Χρόνος που απομένει:{" "}
//                 {formatTimeRemaining(auction.endDate, now)}
//                 <br />
//                 Ελάχιστη αύξηση προσφοράς: {auction.minBidIncrement}€
//                 <br />
//                 {auction.topBidAmount != null ? (
//                   <span>
//                     Τρέχουσα υψηλότερη προσφορά:{" "}
//                     <strong>{auction.topBidAmount}€</strong> από{" "}
//                     <strong>
//                       {auction.topBidderUsername ?? "άγνωστο χρήστη"}
//                     </strong>
//                   </span>
//                 ) : (
//                   <span>Δεν υπάρχουν προσφορές ακόμη.</span>
//                 )}
//                 <br />
//                 Short desc: {auction.shortDescription}
//                 <br />
//                 <button
//                   type="button"
//                   style={{ marginTop: "0.25rem" }}
//                   onClick={() => onOpenDetails?.(auction.id)}
//                 >
//                   Details
//                 </button>
//               </li>
//             ))}
//           </ul>

//           <div style={{ marginTop: "1rem" }}>
//             <button
//               type="button"
//               onClick={handlePrevPage}
//               disabled={loading || !pageData || pageData.first}
//               style={{ marginRight: "0.5rem" }}
//             >
//               Προηγούμενη
//             </button>
//             <button
//               type="button"
//               onClick={handleNextPage}
//               disabled={loading || !pageData || pageData.last}
//             >
//               Επόμενη
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyBidAuctionsPage;
// src/components/MyBidAuctionsPage.tsx

import React, { useEffect, useState } from "react";
import type { AuctionDetails, AuctionListItem, SpringPage } from "../models/Springboot/Auction";
import { getMyActiveBidAuctions } from "../api/Springboot/backendAuctionService";

import AuctionDetailsPage from "./AuctionDetailsPage";
import type { AuthUserDto } from "../models/Springboot/UserEntity";

interface MyBidAuctionsPageProps {
  currentUser: AuthUserDto | null;
  onSignIn?: () => void;
  onBack?: () => void;
}

const MyBidAuctionsPage: React.FC<MyBidAuctionsPageProps> = ({ currentUser, onSignIn, onBack }) => {
  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] = useState<SpringPage<AuctionListItem> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Responsive
  const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1280));
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = vw <= 640;
  const isTablet = vw > 640 && vw <= 1024;

  const CARD_MIN_WIDTH = isTablet ? 320 : 340;
  const CARD_IMAGE_HEIGHT = isMobile ? 190 : isTablet ? 220 : 240;

  // live "now"
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // ✅ Details modal
  const [detailsAuctionId, setDetailsAuctionId] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailsAuctionId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ Lock body scroll while modal is open (prevents layout shifting)
  useEffect(() => {
    if (detailsAuctionId === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailsAuctionId]);

  const loadAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

      const result = await getMyActiveBidAuctions({
        page: pageToLoad,
      });

      setPageData(result);
      setPage(pageToLoad);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Something went wrong while loading your auctions.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAuctions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    void loadAuctions(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    void loadAuctions(page + 1);
  };

  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
    const end = new Date(endDateIso);
    const diffMs = end.getTime() - nowValue.getTime();

    if (Number.isNaN(end.getTime())) return endDateIso;
    if (diffMs <= 0) return "Ended";

    let totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds -= days * 24 * 3600;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatMoneyEUR = (v: number): string => {
    try {
      return new Intl.NumberFormat("el-GR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(v);
    } catch {
      return `${v}€`;
    }
  };

  // ----- live update hooks from AuctionDetailsPage -----
  type BidUpdate = {
    auctionId: number;
    amount: number;
    bidderUsername: string;
    newEndDate: string;
  };

  const applyBidUpdateToList = (u: BidUpdate) => {
    setPageData((prev) => {
      if (!prev) return prev;

      const nextContent = prev.content.map((a) => {
        if (a.id !== u.auctionId) return a;

        const currentTop = a.topBidAmount ?? null;
        const incoming = u.amount;
        const shouldReplace = currentTop == null || incoming >= currentTop;

        return {
          ...a,
          endDate: u.newEndDate ?? a.endDate,
          topBidAmount: shouldReplace ? incoming : a.topBidAmount,
          topBidderUsername: shouldReplace ? u.bidderUsername : a.topBidderUsername,
        };
      });

      return { ...prev, content: nextContent };
    });
  };

  const handleAuctionLoadedSnapshot = (a: AuctionDetails) => {
    const top =
      (a.bids ?? []).reduce<{ amount: number; bidderUsername: string } | null>((best, b) => {
        const amount = Number(b.amount ?? 0);
        const username = (b.bidderUsername ?? "").toString();
        if (!best) return { amount, bidderUsername: username };
        return amount > best.amount ? { amount, bidderUsername: username } : best;
      }, null) ?? null;

    setPageData((prev) => {
      if (!prev) return prev;

      const nextContent = prev.content.map((x) =>
        x.id === a.id
          ? {
              ...x,
              endDate: a.endDate,
              topBidAmount: top ? top.amount : null,
              topBidderUsername: top ? top.bidderUsername : null,
            }
          : x
      );

      return { ...prev, content: nextContent };
    });
  };

  // -------------------- styles --------------------
  const pageBg: React.CSSProperties = {
    minHeight: "100vh",
    background: "#F6F8FB",
  };

  const container: React.CSSProperties = {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    padding: isMobile ? "12px 12px 22px" : isTablet ? "16px 16px 28px" : "18px",
    boxSizing: "border-box",
  };

  const topRow: React.CSSProperties = {
    display: "flex",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    gap: isMobile ? 10 : 12,
    marginBottom: 14,
    flexDirection: isMobile ? "column" : "row",
  };

  const backBtn: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    fontWeight: 900,
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
    textAlign: "center",
  };

  const title: React.CSSProperties = {
    fontSize: isMobile ? 24 : isTablet ? 26 : 28,
    fontWeight: 950,
    color: "#111827",
    margin: 0,
  };

  const metaText: React.CSSProperties = {
    color: "#6B7280",
    fontWeight: 800,
    fontSize: 13,
  };

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
    gap: isMobile ? 12 : 18,
    alignItems: "start",
    marginTop: 14,
    width: "100%",
    maxWidth : "100%",
    boxSizing: "border-box",
  };

  const card: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 18,
    boxShadow: "0 10px 24px rgba(16,24,40,0.08)",
    border: "1px solid rgba(17,24,39,0.06)",
    overflow: "hidden",
    display: "grid",
    minWidth : "100%",
    boxSizing : "border-box",
  };

  const imgWrap: React.CSSProperties = {
    position: "relative",
    height: CARD_IMAGE_HEIGHT,
    background: "#EEF2F7",
  };

  const img: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const chip: React.CSSProperties = {
    position: "absolute",
    top: isMobile ? 10 : 12,
    right: isMobile ? 10 : 12,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(229,231,235,0.9)",
    borderRadius: 999,
    padding: isMobile ? "5px 9px" : "6px 10px",
    fontWeight: 900,
    fontSize: isMobile ? 12 : 13,
    color: "#111827",
    maxWidth: "calc(100% - 20px)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const timePill: React.CSSProperties = {
    position: "absolute",
    top: isMobile ? 10 : 12,
    left: isMobile ? 10 : 12,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(229,231,235,0.9)",
    borderRadius: 999,
    padding: isMobile ? "5px 9px" : "6px 10px",
    fontWeight: 950,
    fontSize: isMobile ? 12 : 13,
    color: "#111827",
    display: "flex",
    alignItems: "center",
    gap: 8,
    maxWidth: "calc(100% - 20px)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const content: React.CSSProperties = {
    padding: isMobile ? 12 : 14,
    display: "grid",
    gap: 10,
  };

  const titleRow: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  };

const auctionTitle: React.CSSProperties = {
  fontWeight: 950,
  fontSize: 18,
  color: "#111827",
  margin: 0,
  minWidth: 0,

  // ✅ wrap σε νέο line
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  lineHeight: 1.2,
};

  const price: React.CSSProperties = {
    fontWeight: 950,
    color: "#111827",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
  };

  const row: React.CSSProperties = {
    display: "flex",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: "space-between",
    gap: 12,
    color: "#374151",
    fontWeight: 800,
    fontSize: 13,
    flexWrap: isMobile ? "wrap" : "nowrap",
  };

  const subtle: React.CSSProperties = {
    color: "#6B7280",
    fontWeight: 800,
    fontSize: 13,
  };

  const leadingBox: React.CSSProperties = {
    border: "1px solid rgba(59,130,246,0.35)",
    background: "rgba(59,130,246,0.06)",
    borderRadius: 14,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const leadingLeft: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  };

  const leadingRank: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: 999,
    background: "#2563EB",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    flex: "0 0 auto",
  };

  const leadingName: React.CSSProperties = {
    fontWeight: 950,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: isMobile ? 220 : 260,
  };

  const leadingLabel: React.CSSProperties = {
    color: "#6B7280",
    fontWeight: 800,
    fontSize: 12,
  };

  const detailsBtn: React.CSSProperties = {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#FFFFFF",
    fontWeight: 950,
    cursor: "pointer",
    width: "100%",
  };

  const pagerWrap: React.CSSProperties = {
    marginTop: "1rem",
    display: "grid",
    justifyItems: "center",
    gap: 8,
  };

  const pagerRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexDirection: isMobile ? "column" : "row",
    width: isMobile ? "100%" : "auto",
  };

  const pagerBtn: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#FFFFFF",
    fontWeight: 950,
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
  };

  const emptyCard: React.CSSProperties = {
    marginTop: 14,
    background: "#FFFFFF",
    borderRadius: 18,
    boxShadow: "0 10px 24px rgba(16,24,40,0.08)",
    border: "1px solid rgba(17,24,39,0.06)",
    padding: 18,
    fontWeight: 950,
    color: "#111827",
  };

  const modalPad = isMobile ? 12 : 18;

  // -------------------- render --------------------
  return (
    <div style={pageBg}>
      <div style={container}>
        <div style={topRow}>
          <div
            style={{
              display: "flex",
              alignItems: isMobile ? "stretch" : "center",
              gap: 12,
              width: "100%",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            {onBack && (
              <button type="button" onClick={onBack} style={backBtn}>
                ← Back to all auctions
              </button>
            )}
            <h1 style={title}>My Active Bids</h1>
          </div>
        </div>


        {loading && <div style={metaText}>Loading...</div>}
        {error && <div style={{ ...metaText, color: "#B91C1C" }}>Error: {error}</div>}
        {pageData && (
          <>
            {pageData.content.length === 0 ? (
              <div style={emptyCard}>
                No active bids
                <div style={{ marginTop: 6, fontWeight: 800, color: "#6B7280", fontSize: 13 }}>
                  You have not placed a bid in an active auction.                </div>
              </div>
            ) : (
              <>
                <div style={grid}>
                  {pageData.content.map((auction) => {
                    const remaining = formatTimeRemaining(auction.endDate, now);
                    const ended = remaining === "Ended";
                    const city = getCityFromLocation(auction.sellerLocation ?? null);

                    const hasLeading =
                      auction.topBidAmount != null && (auction.topBidderUsername ?? "").trim().length > 0;

                    return (
                      <div key={auction.id} style={card}>
                        <div style={imgWrap}>
                          {auction.mainImageUrl ? (
                            <img src={auction.mainImageUrl} alt={auction.title} style={img} />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "grid",
                                placeItems: "center",
                                color: "#6B7280",
                                fontWeight: 900,
                              }}
                            >
                              No image
                            </div>
                          )}

                          <div style={timePill}>
                            <span style={{ opacity: 0.8 }}>🕒</span>
                            <span style={{ color: ended ? "#DC2626" : "#111827" }}>{remaining}</span>
                          </div>

                          {auction.categoryName && <div style={chip}>{auction.categoryName}</div>}
                        </div>

                        <div style={content}>
                          <div style={titleRow}>
                            <p style={auctionTitle} title={auction.title}>
                              {auction.title}
                            </p>
                            <div style={price}>{formatMoneyEUR(auction.startingAmount)}</div>
                          </div>

                          <div style={row}>
                            <span style={subtle}>📍 {city}</span>
                            <span style={subtle}>Min raise: {formatMoneyEUR(auction.minBidIncrement)}</span>
                          </div>

                          <div style={leadingBox}>
                            {hasLeading ? (
                              <>
                                <div style={leadingLeft}>
                                  <div style={leadingRank}>#1</div>
                                  <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                                    <div style={leadingName} title={auction.topBidderUsername ?? ""}>
                                      {auction.topBidderUsername}
                                    </div>
                                    <div style={leadingLabel}>Leading bidder</div>
                                  </div>
                                </div>

                                <div style={{ fontWeight: 950, color: "#2563EB", whiteSpace: "nowrap" }}>
                                  {formatMoneyEUR(auction.topBidAmount as number)}
                                </div>
                              </>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div
                                  style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 999,
                                    background: "#E5E7EB",
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: 950,
                                    color: "#6B7280",
                                    flex: "0 0 auto",
                                  }}
                                >
                                  🔨
                                </div>
                                <div style={{ display: "grid", gap: 2 }}>
                                  <div style={{ fontWeight: 950, color: "#111827" }}>Be the first one to bid</div>
                                  <div style={leadingLabel}>No bids yet.</div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div style={subtle} title={auction.shortDescription ?? ""}>
                            {auction.shortDescription}
                          </div>

                          <button type="button" style={detailsBtn} onClick={() => setDetailsAuctionId(auction.id)}>
                            More details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={pagerWrap}>
                  <div style={pagerRow}>
                    <button
                      type="button"
                      onClick={handlePrevPage}
                      disabled={loading || !pageData || pageData.first}
                      style={{ ...pagerBtn, opacity: pageData.first ? 0.55 : 1 }}
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={loading || !pageData || pageData.last}
                      style={{ ...pagerBtn, opacity: pageData.last ? 0.55 : 1 }}
                    >
                      Next
                    </button>
                  </div>

                  <div style={{ color: "#6B7280", fontWeight: 800, textAlign: "center" }}>
                    Page <strong style={{ color: "#111827" }}>{page + 1}</strong> of{" "}
                    <strong style={{ color: "#111827" }}>{Math.max(pageData.totalPages, 1)}</strong>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* -------------------- DETAILS MODAL -------------------- */}
      {detailsAuctionId !== null && (
        <div
          onClick={() => setDetailsAuctionId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17,24,39,0.65)",
            zIndex: 5000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: modalPad,
            overflowX: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: `min(1200px, calc(100vw - ${modalPad * 2}px))`,
              maxWidth: "100%",
              maxHeight: `calc(100vh - ${modalPad * 2}px)`,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
              background: "#F6F8FB",
              borderRadius: 18,
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={() => setDetailsAuctionId(null)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 10,
                width: 42,
                height: 42,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(17,24,39,0.72)",
                color: "white",
                fontWeight: 950,
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <AuctionDetailsPage
              auctionId={detailsAuctionId}
              currentUser={currentUser}
              variant="modal"
              onSignIn={onSignIn}
              onBidUpdate={applyBidUpdateToList}
              onAuctionLoaded={handleAuctionLoadedSnapshot}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBidAuctionsPage;
