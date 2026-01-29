// // src/components/MyWonAuctionsPage.tsx

// import React, { useEffect, useMemo, useState } from "react";
// import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
// import { getMyWonAuctions } from "../api/Springboot/backendAuctionService";
// import {
//   reportProblemForWonAuction,
//   getMyReportedProblemAuctionIds,
// } from "../api/Springboot/backendProblemReportService";

// interface MyWonAuctionsPageProps {
//   onOpenDetails?: (auctionId: number) => void;
//   onBack?: () => void;
// }

// const MyWonAuctionsPage: React.FC<MyWonAuctionsPageProps> = ({
//   onOpenDetails,
//   onBack,
// }) => {
//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] = useState<SpringPage<AuctionListItem> | null>(
//     null
//   );

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // (προαιρετικό) live "now" αν θες time-since-ended
//   const [now, setNow] = useState<Date>(new Date());
//   useEffect(() => {
//     const t = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(t);
//   }, []);

//   // Reported auctions (για να δείχνεις “Report has been sent ✅”)
//   const [reportedAuctionIds, setReportedAuctionIds] = useState<Set<number>>(
//     () => new Set()
//   );

//   useEffect(() => {
//     (async () => {
//       try {
//         const ids = await getMyReportedProblemAuctionIds();
//         setReportedAuctionIds(new Set(ids));
//       } catch (e) {
//         console.error("Failed to load reported auction ids", e);
//       }
//     })();
//   }, []);

//   const loadAuctions = async (pageOverride?: number) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

//       const result = await getMyWonAuctions({
//         page: pageToLoad,
//       });

//       setPageData(result);
//       setPage(pageToLoad);
//     } catch (err) {
//       console.error(err);
//       const message =
//         err instanceof Error
//           ? err.message
//           : "Κάτι πήγε στραβά κατά τη φόρτωση των δημοπρασιών.";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadAuctions(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     void loadAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     void loadAuctions(page + 1);
//   };

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   const formatEndedAt = (endDateIso: string): string => {
//     const d = new Date(endDateIso);
//     if (Number.isNaN(d.getTime())) return endDateIso;
//     return d.toLocaleString();
//   };

//   const formatTimeSinceEnded = (endDateIso: string, nowValue: Date): string => {
//     const end = new Date(endDateIso);
//     if (Number.isNaN(end.getTime())) return "";

//     const diffMs = nowValue.getTime() - end.getTime();
//     if (diffMs < 0) return ""; // δεν έχει λήξει ακόμη

//     let totalSeconds = Math.floor(diffMs / 1000);

//     const days = Math.floor(totalSeconds / (24 * 3600));
//     totalSeconds -= days * 24 * 3600;

//     const hours = Math.floor(totalSeconds / 3600);
//     totalSeconds -= hours * 3600;

//     const minutes = Math.floor(totalSeconds / 60);

//     if (days > 0) return `${days}d ${hours}h ago`;
//     if (hours > 0) return `${hours}h ${minutes}m ago`;
//     if (minutes > 0) return `${minutes}m ago`;
//     return `just now`;
//   };

//   // ----------------------------
//   // Report Problem modal state
//   // ----------------------------
//   const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
//   const [reportAuctionId, setReportAuctionId] = useState<number | null>(null);
//   const [reportAuctionTitle, setReportAuctionTitle] = useState<string>("");

//   const [reportTitle, setReportTitle] = useState<string>("");
//   const [reportDescription, setReportDescription] = useState<string>("");
//   const [reportVideoFile, setReportVideoFile] = useState<File | null>(null);

//   const [submittingReport, setSubmittingReport] = useState<boolean>(false);
//   const [reportError, setReportError] = useState<string | null>(null);

//   const videoPreviewUrl = useMemo<string | null>(() => {
//     if (!reportVideoFile) return null;
//     return URL.createObjectURL(reportVideoFile);
//   }, [reportVideoFile]);

//   useEffect(() => {
//     return () => {
//       if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
//     };
//   }, [videoPreviewUrl]);

//   const openReportModal = (auction: AuctionListItem) => {
//     setReportError(null);
//     setIsReportOpen(true);

//     setReportAuctionId(auction.id);
//     setReportAuctionTitle(auction.title);

//     setReportTitle("");
//     setReportDescription("");
//     setReportVideoFile(null);
//   };

//   const closeReportModal = () => {
//     if (submittingReport) return;
//     setIsReportOpen(false);

//     setReportAuctionId(null);
//     setReportAuctionTitle("");

//     setReportError(null);
//     setReportTitle("");
//     setReportDescription("");
//     setReportVideoFile(null);
//   };

//   const submitReport = async () => {
//     if (reportAuctionId === null) return;

//     const t = reportTitle.trim();
//     const d = reportDescription.trim();

//     if (!t) {
//       setReportError("Συμπλήρωσε τίτλο.");
//       return;
//     }
//     if (!d) {
//       setReportError("Συμπλήρωσε περιγραφή.");
//       return;
//     }
//     if (reportVideoFile === null) {
//       setReportError("Please upload a video.");
//       return;
//     }
//     if (!reportVideoFile.type.startsWith("video/")) {
//       setReportError("Το αρχείο πρέπει να είναι βίντεο.");
//       return;
//     }

//     setSubmittingReport(true);
//     setReportError(null);

//     try {
//       await reportProblemForWonAuction(
//         reportAuctionId,
//         { title: t, description: d },
//         reportVideoFile
//       );

//       setReportedAuctionIds((prev) => {
//         const next = new Set(prev);
//         next.add(reportAuctionId);
//         return next;
//       });

//       window.alert("Το report καταχωρήθηκε με επιτυχία.");
//       closeReportModal();
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Απέτυχε η αποστολή report.";

//       // Αν backend απαντά 409 / already exists, κάνε το optimistic “sent”
//       if (msg.includes("409") || msg.toLowerCase().includes("already")) {
//         setReportedAuctionIds((prev) => {
//           const next = new Set(prev);
//           next.add(reportAuctionId);
//           return next;
//         });
//         closeReportModal();
//         return;
//       }

//       setReportError(msg);
//     } finally {
//       setSubmittingReport(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
//       {onBack && (
//         <div style={{ marginBottom: "1rem" }}>
//           <button type="button" onClick={onBack}>
//             ← Back to all auctions
//           </button>
//         </div>
//       )}

//       <h1>My Won Auctions</h1>

//       {loading && <p>Φόρτωση...</p>}
//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

//       {pageData && (
//         <div>
//           <p>
//             Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
//             {pageData.totalElements} auctions
//           </p>

//           <ul>
//             {pageData.content.map((auction) => {
//               const endedAt = formatEndedAt(auction.endDate);
//               const sinceEnded = formatTimeSinceEnded(auction.endDate, now);
//               const alreadyReported = reportedAuctionIds.has(auction.id);

//               return (
//                 <li key={auction.id} style={{ marginBottom: "0.75rem" }}>
//                   main image:{" "}
//                   {auction.mainImageUrl && (
//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <img
//                         src={auction.mainImageUrl}
//                         alt={auction.title}
//                         style={{
//                           maxWidth: 200,
//                           maxHeight: 200,
//                           display: "block",
//                         }}
//                       />
//                     </div>
//                   )}

//                   <strong>{auction.title}</strong> — {auction.categoryName} —{" "}
//                   {auction.startingAmount}€
//                   <br />
//                   Τοποθεσία:{" "}
//                   {getCityFromLocation(
//                     (auction.sellerLocation ?? null) as string | null
//                   )}
//                   <br />
//                   Η δημοπρασία έληξε: <strong>{endedAt}</strong>{" "}
//                   {sinceEnded ? <span style={{ color: "#666" }}>({sinceEnded})</span> : null}{" "}
//                   (status: {auction.status})
//                   <br />
//                   Τελική υψηλότερη προσφορά:{" "}
//                   {auction.topBidAmount != null ? (
//                     <strong>{auction.topBidAmount}€</strong>
//                   ) : (
//                     <span>—</span>
//                   )}{" "}
//                   από{" "}
//                   <strong>{auction.topBidderUsername ?? "άγνωστο χρήστη"}</strong>
//                   <br />
//                   Short desc: {auction.shortDescription}
//                   <br />

//                   <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
//                     <button type="button" onClick={() => onOpenDetails?.(auction.id)}>
//                       Details
//                     </button>

//                     {alreadyReported ? (
//                       <span style={{ color: "green", fontWeight: "bold" }}>
//                         Report has been sent ✅
//                       </span>
//                     ) : (
//                       <button type="button" onClick={() => openReportModal(auction)}>
//                         Report a problem
//                       </button>
//                     )}
//                   </div>
//                 </li>
//               );
//             })}
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

//       {/* ----------------------------
//           Report a problem modal
//          ---------------------------- */}
//       {isReportOpen && (
//         <div
//           onClick={closeReportModal}
//           style={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(0,0,0,0.55)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 3000,
//             padding: "1rem",
//           }}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               width: "100%",
//               maxWidth: 500,
//               maxHeight: 500,
//               background: "white",
//               borderRadius: 8,
//               padding: "1rem",
//               boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
//             }}
//           >
//             <h2>Report a problem</h2>
//             <p style={{ marginTop: 0 }}>
//               Auction #{reportAuctionId} — <strong>{reportAuctionTitle}</strong>
//             </p>

//             {reportError && <p style={{ color: "red" }}>Σφάλμα: {reportError}</p>}

//             <div style={{ marginBottom: "0.75rem" }}>
//               <label>
//                 Title:
//                 <input
//                   type="text"
//                   value={reportTitle}
//                   onChange={(e) => setReportTitle(e.target.value)}
//                   style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
//                   disabled={submittingReport}
//                 />
//               </label>
//             </div>

//             <div style={{ marginBottom: "0.75rem" }}>
//               <label>
//                 Description:
//                 <textarea
//                   value={reportDescription}
//                   onChange={(e) => setReportDescription(e.target.value)}
//                   rows={4}
//                   style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
//                   disabled={submittingReport}
//                 />
//               </label>
//             </div>

//             <div style={{ marginBottom: "0.75rem" }}>
//               <label>
//                 Video (show the issue):
//                 <input
//                   type="file"
//                   accept="video/*"
//                   onChange={(e) => {
//                     const f = e.target.files?.[0] ?? null;
//                     setReportVideoFile(f);
//                   }}
//                   style={{ display: "block", marginTop: "0.25rem" }}
//                   disabled={submittingReport}
//                 />
//               </label>
//             </div>

//             {videoPreviewUrl && (
//               <div style={{ marginBottom: "0.75rem" }}>
//                 <video
//                   src={videoPreviewUrl}
//                   controls
//                   preload="metadata"
//                   style={{ width: "100%", maxHeight: 100 }}
//                 />
//               </div>
//             )}

//             <div style={{ display: "flex", gap: "0.5rem" }}>
//               <button type="button" onClick={submitReport} disabled={submittingReport}>
//                 {submittingReport ? "Submitting..." : "Submit"}
//               </button>
//               <button type="button" onClick={closeReportModal} disabled={submittingReport}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyWonAuctionsPage;
// src/components/MyWonAuctionsPage.tsx
// src/components/MyWonAuctionsPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
import { getMyWonAuctions } from "../api/Springboot/backendAuctionService";
import { reportProblemForWonAuction } from "../api/Springboot/backendProblemReportService";

interface MyWonAuctionsPageProps {
  onOpenDetails?: (auctionId: number) => void;
  onBack?: () => void;
}

type InfoPopupState = {
  open: boolean;
  anchorRect: DOMRect | null;
  auctionId: number | null;
};

const MyWonAuctionsPage: React.FC<MyWonAuctionsPageProps> = ({ onOpenDetails, onBack }) => {
  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] = useState<SpringPage<AuctionListItem> | null>(null);

  // ✅ track broken images (Cloudflare expiry etc.)
  const [brokenImageByAuctionId, setBrokenImageByAuctionId] = useState<Record<number, boolean>>({});

  // -----------------------------
  // ✅ Responsive breakpoints
  // -----------------------------
  const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1280));
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = vw <= 640;
  const isTablet = vw > 640 && vw <= 1024;

  const CARD_MIN_WIDTH = isTablet ? 320 : 360;
  const CARD_IMAGE_HEIGHT = isMobile ? 190 : isTablet ? 220 : 240;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // live "now"
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const loadAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

      const result = await getMyWonAuctions({
        page: pageToLoad,
      });

      setPageData(result);
      setPage(pageToLoad);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Something went wrong while loading the auctions.";
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

  const formatEndedAt = (endDateIso: string): string => {
    const d = new Date(endDateIso);
    if (Number.isNaN(d.getTime())) return endDateIso;
    return d.toLocaleString();
  };

  const formatTimeSinceEnded = (endDateIso: string, nowValue: Date): string => {
    const end = new Date(endDateIso);
    if (Number.isNaN(end.getTime())) return "";

    const diffMs = nowValue.getTime() - end.getTime();
    if (diffMs < 0) return "";

    let totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds -= days * 24 * 3600;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;

    const minutes = Math.floor(totalSeconds / 60);

    if (days > 0) return `${days}d ${hours}h ago`;
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `just now`;
  };

  // ----------------------------
  // Report Problem modal state
  // ----------------------------
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [reportAuctionId, setReportAuctionId] = useState<number | null>(null);
  const [reportAuctionTitle, setReportAuctionTitle] = useState<string>("");

  const [reportTitle, setReportTitle] = useState<string>("");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportVideoFile, setReportVideoFile] = useState<File | null>(null);

  const [submittingReport, setSubmittingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const videoPreviewUrl = useMemo<string | null>(() => {
    if (!reportVideoFile) return null;
    return URL.createObjectURL(reportVideoFile);
  }, [reportVideoFile]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const openReportModal = (auction: AuctionListItem) => {
    setReportError(null);
    setIsReportOpen(true);

    setReportAuctionId(auction.id);
    setReportAuctionTitle(auction.title);

    setReportTitle("");
    setReportDescription("");
    setReportVideoFile(null);
  };

  const closeReportModal = () => {
    if (submittingReport) return;
    setIsReportOpen(false);

    setReportAuctionId(null);
    setReportAuctionTitle("");

    setReportError(null);
    setReportTitle("");
    setReportDescription("");
    setReportVideoFile(null);
  };

  const markAuctionProblemStatus = (auctionId: number, status: "OPEN" | "RESOLVED") => {
    setPageData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        content: prev.content.map((a) => (a.id === auctionId ? { ...a, problemReportStatus: status } : a)),
      };
    });
  };

  const submitReport = async () => {
    if (reportAuctionId === null) return;

    const t = reportTitle.trim();
    const d = reportDescription.trim();

    if (!t) {
      setReportError("Please enter a title.");
      return;
    }
    if (!d) {
       setReportError("Please enter a description.");
      return;
    }
    if (reportVideoFile === null) {
      setReportError("Please upload a video.");
      return;
    }
    if (!reportVideoFile.type.startsWith("video/")) {
      setReportError("The file must be a video.");
      return;
    }

    setSubmittingReport(true);
    setReportError(null);

    try {
      await reportProblemForWonAuction(reportAuctionId, { title: t, description: d }, reportVideoFile);

      markAuctionProblemStatus(reportAuctionId, "OPEN");

      window.alert("Your report was submitted successfully.");
      closeReportModal();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to submit the report.";

      if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        markAuctionProblemStatus(reportAuctionId, "OPEN");
        closeReportModal();
        return;
      }

      setReportError(msg);
    } finally {
      setSubmittingReport(false);
    }
  };

  // ----------------------------
  // Info popup state
  // ----------------------------
  const [infoPopup, setInfoPopup] = useState<InfoPopupState>({
    open: false,
    anchorRect: null,
    auctionId: null,
  });

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!infoPopup.open) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const insidePopup = target.closest("[data-info-popup='true']");
      const insideBtn = target.closest("[data-info-btn='true']");
      if (insidePopup || insideBtn) return;

      setInfoPopup({ open: false, anchorRect: null, auctionId: null });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInfoPopup({ open: false, anchorRect: null, auctionId: null });
      }
    };

    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [infoPopup.open]);

  const toggleInfo = (auctionId: number, btnEl: HTMLButtonElement | null) => {
    if (!btnEl) return;

    const rect = btnEl.getBoundingClientRect();

    setInfoPopup((prev) => {
      if (prev.open && prev.auctionId === auctionId) {
        return { open: false, anchorRect: null, auctionId: null };
      }
      return { open: true, anchorRect: rect, auctionId };
    });
  };

  // ----------------------------
  // UI styles
  // ----------------------------
  const pageWrap: React.CSSProperties = {
    minHeight: "100vh",
    background: "#F6F8FB",
  };

  const container: React.CSSProperties = {
    width: "100%",
    maxWidth: 1200,
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
    cursor: "pointer",
    fontWeight: 900,
    width: isMobile ? "100%" : "auto",
    textAlign: "center",
  };

  const title: React.CSSProperties = {
    fontSize: isMobile ? 24 : isTablet ? 32 : 40,
    fontWeight: 950,
    color: "#111827",
    letterSpacing: -0.6,
    margin: 0,
    lineHeight: 1.05,
  };

  const cardsGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
    gap: isMobile ? 12 : 16,
    alignItems: "stretch",
    width: "100%",
  };

  const card: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 18,
    boxShadow: "0 10px 24px rgba(16,24,40,0.08)",
    overflow: "visible",
    border: "1px solid rgba(17, 24, 39, 0.06)",
    display: "grid",
    gridTemplateRows: `${CARD_IMAGE_HEIGHT}px 1fr`,
    minHeight: CARD_IMAGE_HEIGHT + (isMobile ? 200 : 220),
    position: "relative",
    zIndex: 1,
  };

  const imgWrap: React.CSSProperties = {
    position: "relative",
    background: "#EEF2F7",
    overflow: "hidden",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
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
    maxWidth: "calc(100% - 20px)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const body: React.CSSProperties = {
    padding: isMobile ? 12 : 14,
    display: "grid",
    gap: isMobile ? 9 : 10,
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

  const cardTitle: React.CSSProperties = {
    fontSize: isMobile ? 16 : 18,
    fontWeight: 950,
    color: "#111827",
    margin: 0,
    lineHeight: 1.15,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  };

  const metaRow: React.CSSProperties = {
    display: "flex",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: "space-between",
    gap: 10,
    color: "#6B7280",
    fontWeight: 800,
    fontSize: isMobile ? 12 : 13,
    flexWrap: isMobile ? "wrap" : "nowrap",
  };

  const infoBox: React.CSSProperties = {
    borderRadius: 14,
    background: "#F9FAFB",
    border: "1px solid #EEF2F7",
    padding: isMobile ? 10 : 12,
    display: "grid",
    gap: 6,
    color: "#111827",
  };

  const descStyle: React.CSSProperties = {
    color: "#6B7280",
    fontWeight: 900,
    fontSize: isMobile ? 12.5 : 13,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: isMobile ? 2 : 3,
    overflow: "hidden",
  };

  // ✅ Actions responsive
  const actionsCol: React.CSSProperties = {
    display: "grid",
    gap: 10,
    marginTop: 4,
  };

  const actionRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    width: "100%",
  };

  const primaryBtn: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 950,
    width: "100%",
    textAlign: "center",
  };

  const secondaryBtn: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 950,
  };

  const successBadge: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #86EFAC",
    background: "#F0FDF4",
    color: "#166534",
    fontWeight: 950,
    fontSize: 13,
    width: isMobile ? "100%" : "auto",
  };

  const pager: React.CSSProperties = {
    marginTop: 18,
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
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 950,
    width: isMobile ? "100%" : "auto",
  };

  const disabledBtn: React.CSSProperties = {
    opacity: 0.55,
    cursor: "not-allowed",
  };

  const infoBtnStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.14)",
    background: "#FFFFFF",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    padding: 0,
    flex: "0 0 auto",
  };

  // ----------------------------
  // Info popup positioning
  // ----------------------------
  const infoPopupStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "fixed",
      zIndex: 9999,
      width: "min(420px, 92vw)",
      borderRadius: 14,
      background: "#FFFFFF",
      border: "1px solid rgba(17,24,39,0.12)",
      boxShadow: "0 22px 70px rgba(0,0,0,0.28)",
      padding: 12,
      maxHeight: "60vh",
      overflowY: "auto",
    };

    if (!infoPopup.anchorRect) {
      return {
        ...base,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = infoPopup.anchorRect;
    const viewportW = window.innerWidth;
    const margin = 12;

    const centerX = rect.left + rect.width / 2;
    const left = Math.max(margin, Math.min(viewportW - margin, centerX));

    const preferTop = rect.top - 10;
    const shouldFlipBelow = rect.top < 220;

    if (shouldFlipBelow) {
      return {
        ...base,
        top: rect.bottom + 10,
        left,
        transform: "translateX(-50%)",
      };
    }

    return {
      ...base,
      top: preferTop,
      left,
      transform: "translate(-50%, -100%)",
    };
  };

  return (
    <div style={pageWrap}>
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
            <h1 style={title}>My Won Auctions</h1>
          </div>
        </div>

        {loading && <p style={{ fontWeight: 800, color: "#6B7280" }}>Loading...</p>}
        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid #FCA5A5",
              background: "#FEF2F2",
              color: "#991B1B",
              fontWeight: 900,
              marginBottom: 14,
            }}
          >
            Error: {error}
          </div>
        )}

        {pageData && (
          <>
            {pageData.content.length === 0 ? (
              <div style={emptyCard}>
                No won auctions
                <div style={{ marginTop: 6, fontWeight: 800, color: "#6B7280", fontSize: 13 }}>
                  You don't have any won auctions.
                </div>
              </div>
            ) : (
              <div style={cardsGrid}>
                {pageData.content.map((auction) => {
                  const endedAt = formatEndedAt(auction.endDate);
                  const sinceEnded = formatTimeSinceEnded(auction.endDate, now);

                  const reportStatus = auction.problemReportStatus ?? null;
                  const showResolved = reportStatus === "RESOLVED";
                  const showReportSent = reportStatus === "OPEN";
                  const showReportButton = reportStatus === null;

                  const imageAvailable = !!auction.mainImageUrl && !brokenImageByAuctionId[auction.id];

                  return (
                    <div
                      key={auction.id}
                      style={
                        imageAvailable
                          ? card
                          : {
                              ...card,
                              gridTemplateRows: "1fr",
                            }
                      }
                    >
                      {/* Image */}
                      {imageAvailable ? (
                        <div style={imgWrap}>
                          <img
                            src={auction.mainImageUrl as string}
                            alt={auction.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            onError={() => {
                              setBrokenImageByAuctionId((p) => ({ ...p, [auction.id]: true }));
                            }}
                          />

                          {auction.categoryName && <div style={chip}>{auction.categoryName}</div>}
                        </div>
                      ) : null}

                      {/* Body */}
                      <div style={body}>
                        {!imageAvailable && (
                          <div style={{ color: "#6B7280", fontWeight: 900 }}>Image is not available</div>
                        )}

                        <div style={{ display: "grid", gap: 6 }}>
                          <h3 style={cardTitle}>{auction.title}</h3>

                          <div style={metaRow}>
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                                minWidth: 0,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={auction.sellerLocation ?? ""}
                            >
                              <span>📍</span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                {getCityFromLocation(auction.sellerLocation ?? null)}
                              </span>
                            </div>

                            <div style={{ fontWeight: 950, color: "#111827", whiteSpace: "nowrap" }}>
                              {auction.startingAmount}€
                            </div>
                          </div>
                        </div>

                        <div style={infoBox}>
                          <div style={{ fontWeight: 950, color: "#111827" }}>Auction ended</div>
                          <div style={{ color: "#374151", fontWeight: 900, lineHeight: 1.25 }}>
                            {endedAt}{" "}
                            {sinceEnded ? (
                              <span style={{ color: "#6B7280", fontWeight: 900 }}>({sinceEnded})</span>
                            ) : null}
                          </div>

                          <div style={{ marginTop: 4, display: "grid", gap: 4 }}>
                            <div style={{ color: "#111827", fontWeight: 900, fontSize: 13 }}>Winner</div>

                            <div
                              style={{
                                fontWeight: 950,
                                color: "#6B7280",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {auction.topBidderUsername}
                            </div>

                            <div style={{ color: "#111827", fontWeight: 900, fontSize: 13 }}>Final highest bid</div>
                            <div style={{ fontWeight: 950, color: "#6B7280" }}>
                              {auction.topBidAmount != null ? <>{auction.topBidAmount}€</> : <span>—</span>}
                            </div>
                          </div>
                        </div>

                        <div style={descStyle}>{auction.shortDescription}</div>

                        {/* ✅ Actions (mobile friendly) */}
                        <div style={actionsCol}>
                          <button type="button" onClick={() => onOpenDetails?.(auction.id)} style={primaryBtn}>
                            Details
                          </button>

                          {showResolved ? (
                            <span style={successBadge}>Resolved ✅</span>
                          ) : showReportSent ? (
                            <span style={successBadge}>Report has been sent ✅</span>
                          ) : showReportButton ? (
                            <div style={actionRow}>
                              <button
                                type="button"
                                onClick={() => openReportModal(auction)}
                                style={{
                                  ...secondaryBtn,
                                  flex: isMobile ? "1 1 auto" : "0 0 auto",
                                }}
                              >
                                Report a problem
                              </button>

                              <button
                                type="button"
                                data-info-btn="true"
                                style={infoBtnStyle}
                                aria-label="When to report a problem"
                                title="Info"
                                onClick={(e) => toggleInfo(auction.id, e.currentTarget as HTMLButtonElement)}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="12" cy="12" r="10" stroke="#111827" strokeWidth="2" />
                                  <path d="M12 10.5v6" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
                                  <circle cx="12" cy="7.5" r="1.2" fill="#111827" />
                                </svg>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div style={{ marginTop: 18, display: "grid", justifyItems: "center", gap: 8 }}>
              <div style={pager}>
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={loading || !pageData || pageData.first}
                  style={{
                    ...pagerBtn,
                    ...(loading || !pageData || pageData.first ? disabledBtn : null),
                  }}
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={loading || !pageData || pageData.last}
                  style={{
                    ...pagerBtn,
                    ...(loading || !pageData || pageData.last ? disabledBtn : null),
                  }}
                >
                  Next
                </button>
              </div>

              <div style={{ color: "#6B7280", fontWeight: 900, textAlign: "center" }}>
                Page <strong style={{ color: "#111827" }}>{page + 1}</strong> of{" "}
                <strong style={{ color: "#111827" }}>{pageData.totalPages}</strong>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ✅ Info popup */}
      {infoPopup.open && (
        <div data-info-popup="true" style={infoPopupStyle()} role="dialog" aria-modal="false">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontWeight: 950, color: "#111827" }}>When to report a problem</div>
            <button
              type="button"
              onClick={() => setInfoPopup({ open: false, anchorRect: null, auctionId: null })}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid rgba(17,24,39,0.12)",
                background: "#FFFFFF",
                cursor: "pointer",
                fontWeight: 950,
              }}
              aria-label="Close info"
            >
              ✕
            </button>
          </div>

          <div style={{ marginTop: 10, color: "#374151", fontWeight: 800, fontSize: 13, lineHeight: 1.5 }}>
            Use <strong>Report a problem</strong> after you receive the package if there is an issue, e.g.:
            <ul style={{ marginTop: 8, paddingLeft: 18, display: "grid", gap: 6 }}>
              <li>Items are missing from the package</li>
              <li>The product is different from the description</li>
              <li>The product is damaged/defective</li>
            </ul>

            <div style={{ marginTop: 10 }}>
              Include a <strong>video</strong> showing you opening the package and clearly demonstrating the issue.
            </div>
          </div>
        </div>
      )}

      {/* Report a problem modal */}
      {isReportOpen && (
        <div
          onClick={closeReportModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: isMobile ? "92vw" : 560,
              maxHeight: "82vh",
              overflow: "auto",
              background: "white",
              borderRadius: 16,
              padding: "14px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              border: "1px solid rgba(17,24,39,0.10)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 950, color: "#111827" }}>Report a problem</div>
                <div style={{ color: "#6B7280", fontWeight: 900, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis" }}>
                  Auction #{reportAuctionId} — <strong>{reportAuctionTitle}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={closeReportModal}
                disabled={submittingReport}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "#FFFFFF",
                  cursor: submittingReport ? "not-allowed" : "pointer",
                  fontWeight: 950,
                  flex: "0 0 auto",
                }}
              >
                ✕
              </button>
            </div>

            {reportError && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #FCA5A5",
                  background: "#FEF2F2",
                  color: "#991B1B",
                  fontWeight: 950,
                  marginBottom: 12,
                }}
              >
                Error: {reportError}
              </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 6, fontWeight: 950, color: "#111827" }}>
                Title
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  disabled={submittingReport}
                  style={{
                    height: 44,
                    padding: "0 12px",
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6, fontWeight: 950, color: "#111827" }}>
                Description
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={5}
                  disabled={submittingReport}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6, fontWeight: 950, color: "#111827" }}>
                Video (show the issue)
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setReportVideoFile(f);
                  }}
                  disabled={submittingReport}
                  style={{ padding: "10px 0" }}
                />
              </label>

              {videoPreviewUrl && (
                <div style={{ borderRadius: 14, border: "1px solid #E5E7EB", background: "#F9FAFB", padding: 10 }}>
                  <video
                    src={videoPreviewUrl}
                    controls
                    preload="metadata"
                    style={{ width: "100%", maxHeight: 160, borderRadius: 12 }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={closeReportModal}
                disabled={submittingReport}
                style={{
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(17, 24, 39, 0.12)",
                  background: "#FFFFFF",
                  cursor: submittingReport ? "not-allowed" : "pointer",
                  fontWeight: 950,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitReport}
                disabled={submittingReport}
                style={{
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "#FFFFFF",
                  cursor: submittingReport ? "not-allowed" : "pointer",
                  fontWeight: 950,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {submittingReport ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWonAuctionsPage;
