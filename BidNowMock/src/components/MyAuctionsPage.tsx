
// // src/components/MyAuctionsPage.tsx

// import React, { useEffect, useState } from "react";
// import { getMyAuctions } from "../api/Springboot/backendAuctionService";
// import type {
//   AuctionListItem,
//   SpringPage,
//   AuctionStatus,
// } from "../models/Springboot/Auction";

// type SortBy = "startDate" | "endDate";
// type Direction = "asc" | "desc";

// interface MyAuctionsPageProps {
//   onOpenDetails?: (auctionId: number) => void; // 👈 όπως AuctionsPage
//   onBack?: () => void;
// }

// const MyAuctionsPage: React.FC<MyAuctionsPageProps> = ({
//   onOpenDetails,
//   onBack,
// }) => {
//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] =
//     useState<SpringPage<AuctionListItem> | null>(null);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // filters (type-safe)
//   const [statusGroup, setStatusGroup] = useState<AuctionStatus>("ACTIVE");
//   const [sortBy, setSortBy] = useState<SortBy>("endDate");
//   const [direction, setDirection] = useState<Direction>("desc");

//   const loadMyAuctions = async (pageOverride?: number) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const pageToLoad =
//         typeof pageOverride === "number" ? pageOverride : page;

//       const result = await getMyAuctions({
//         page: pageToLoad,
//         size: 30,
//         sortBy,
//         direction,
//         statusGroup,
//       });

//       setPageData(result);
//       setPage(pageToLoad);
//     } catch (err: unknown) {
//       console.error(err);
//       const message =
//         err instanceof Error
//           ? err.message
//           : "Κάτι πήγε στραβά κατά τη φόρτωση των auctions σου.";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // load on mount + when filters change (reset page)
//   useEffect(() => {
//     loadMyAuctions(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [statusGroup, sortBy, direction]);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     loadMyAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     loadMyAuctions(page + 1);
//   };

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
//       <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
//         {onBack && (
//           <button type="button" onClick={onBack}>
//             ← Back
//           </button>
//         )}
//         <h1 style={{ margin: 0 }}>My Auctions</h1>
//       </div>

//       {/* Filters */}
//       <div
//         style={{
//           marginTop: "12px",
//           padding: "10px",
//           border: "1px solid #ddd",
//           borderRadius: 6,
//           display: "grid",
//           gap: "10px",
//         }}
//       >
//         <label>
//           Status group:
//           <select
//             value={statusGroup}
//             onChange={(e) => setStatusGroup(e.target.value as AuctionStatus)}
//             style={{ marginLeft: "8px" }}
//           >
//             <option value="ACTIVE">ACTIVE</option>
//             <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
//             <option value="EXPIRED">EXPIRED</option>
//             <option value="CANCELLED">CANCELLED</option>
//           </select>
//         </label>

//         <label>
//           Sort by:
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value as SortBy)}
//             style={{ marginLeft: "8px" }}
//           >
//             <option value="endDate">endDate</option>
//             <option value="startDate">startDate</option>
//           </select>
//         </label>

//         <label>
//           Direction:
//           <select
//             value={direction}
//             onChange={(e) => setDirection(e.target.value as Direction)}
//             style={{ marginLeft: "8px" }}
//           >
//             <option value="desc">desc</option>
//             <option value="asc">asc</option>
//           </select>
//         </label>

//         <div>
//           <button
//             type="button"
//             onClick={() => loadMyAuctions(0)}
//             disabled={loading}
//           >
//             {loading ? "Φόρτωση..." : "Reload"}
//           </button>
//         </div>
//       </div>

//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
//       {loading && <p>Φόρτωση...</p>}

//       {pageData && (
//         <div style={{ marginTop: "12px" }}>
//           <p>
//             Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
//             {pageData.totalElements} auctions
//           </p>

//           {pageData.content.length === 0 ? (
//             <p>Δεν υπάρχουν auctions σε αυτή την κατηγορία.</p>
//           ) : (
//             <ul style={{ paddingLeft: "18px" }}>
//               {pageData.content.map((auction) => (
//                 <li key={auction.id} style={{ marginBottom: "14px" }}>
//                   {auction.mainImageUrl && (
//                     <div style={{ marginBottom: "6px" }}>
//                       <img
//                         src={auction.mainImageUrl}
//                         alt={auction.title}
//                         style={{
//                           maxWidth: 180,
//                           maxHeight: 180,
//                           display: "block",
//                         }}
//                       />
//                     </div>
//                   )}

//                   <div>
//                     <strong>{auction.title}</strong> —{" "}
//                     <span>{auction.categoryName}</span> —{" "}
//                     <span>{auction.startingAmount}€</span>
//                   </div>

//                   <div style={{ marginTop: "4px" }}>
//                     <strong>Status:</strong> {auction.status}
//                   </div>

//                   <div>
//                     <strong>Τοποθεσία:</strong>{" "}
//                     {getCityFromLocation(auction.sellerLocation)}
//                   </div>

//                   <div>
//                     <strong>End date:</strong> {auction.endDate}
//                   </div>

//                   <div>
//                     <strong>Min bid increment:</strong> {auction.minBidIncrement}€
//                   </div>

//                   <div>
//                     {auction.topBidAmount != null ? (
//                       <>
//                         <strong>Top bid:</strong> {auction.topBidAmount}€ από{" "}
//                         <strong>{auction.topBidderUsername ?? "άγνωστο"}</strong>
//                       </>
//                     ) : (
//                       <span>Δεν υπάρχουν προσφορές ακόμη.</span>
//                     )}
//                   </div>

//                   <div style={{ marginTop: "4px" }}>
//                     <strong>Short desc:</strong> {auction.shortDescription}
//                   </div>

//                   {/* ✅ ΝΕΟ: κουμπί Details όπως στο AuctionsPage */}
//                   {(statusGroup != "PENDING_APPROVAL" && statusGroup != "CANCELLED")  && onOpenDetails && (
//                     <button
//                       type="button"
//                       style={{ marginTop: "6px" }}
//                       onClick={() => onOpenDetails(auction.id)}
//                     >
//                       Details
//                     </button>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           )}

//           {/* Pagination */}
//           <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
//             <button
//               type="button"
//               onClick={handlePrevPage}
//               disabled={loading || !pageData || pageData.first}
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

// export default MyAuctionsPage;

// src/components/MyAuctionsPage.tsx

// src/components/MyAuctionsPage.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom"; // ✅ NEW
import { getMyAuctions } from "../api/Springboot/backendAuctionService";
import { uploadVerificationVideo } from "../api/Springboot/backendVerificationService";
import type {
  AuctionListItem,
  SpringPage,
  AuctionStatus,
  VerificationStatus,
} from "../models/Springboot/Auction";

import AuctionDetailsPage from "./AuctionDetailsPage";
import type { AuthUserDto } from "../models/Springboot/UserEntity";

type SortBy = "startDate" | "endDate";
type Direction = "asc" | "desc";

interface LocalVerificationInstruction {
  code: string;
  maxDurationSeconds: number;
  text: string;
}

const makeInstructionText = (durationText: string): string =>
  `Send a video of ${durationText} clearly showing that the product is authentic and working properly.

• If it’s an electronic device (e.g., PC, console, phone), open a few apps or games and show the screen working.
• If it’s a collectible item, show it from all sides (front, back, top, bottom) and do close-ups of key areas, any serial numbers, or signs of wear.
• Make sure the lighting and audio are as clear as possible.`;

const VERIFICATION_INSTRUCTIONS: LocalVerificationInstruction[] = [
  { code: "VID_20S", maxDurationSeconds: 20, text: makeInstructionText("20 δευτερόλεπτα") },
  { code: "VID_30S", maxDurationSeconds: 30, text: makeInstructionText("30 δευτερόλεπτα") },
  { code: "VID_40S", maxDurationSeconds: 40, text: makeInstructionText("40 δευτερόλεπτα") },
  { code: "VID_50S", maxDurationSeconds: 50, text: makeInstructionText("50 δευτερόλεπτα") },
  { code: "VID_60S", maxDurationSeconds: 60, text: makeInstructionText("1 λεπτό") },
];

function pickRandomInstruction(): LocalVerificationInstruction {
  const idx = Math.floor(Math.random() * VERIFICATION_INSTRUCTIONS.length);
  return VERIFICATION_INSTRUCTIONS[idx];
}

interface MyAuctionsPageProps {
  currentUser?: AuthUserDto | null;
  onSignIn?: () => void;

  // compatibility
  onOpenDetails?: (auctionId: number) => void;

  onBack?: () => void;
}

const MyAuctionsPage: React.FC<MyAuctionsPageProps> = ({
  currentUser = null,
  onSignIn,
  onBack,
}) => {
  const navigate = useNavigate(); // ✅ NEW

  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] = useState<SpringPage<AuctionListItem> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [statusGroup, setStatusGroup] = useState<AuctionStatus>("ACTIVE");
  const [sortBy, setSortBy] = useState<SortBy>("endDate");
  const [direction, setDirection] = useState<Direction>("desc");

  // ✅ Filters dropdown (same logic as AuctionsPage)
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const filtersAnchorRef = useRef<HTMLDivElement | null>(null);
  const filtersBtnRef = useRef<HTMLButtonElement | null>(null);
  const filtersDropdownRef = useRef<HTMLDivElement | null>(null);
  const [filtersPos, setFiltersPos] = useState<{ top: number; left: number; width: number } | null>(null);

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

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // ✅ Details modal (popup)
  const [detailsAuctionId, setDetailsAuctionId] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setShowFilters(false);
      setDetailsAuctionId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ Lock body scroll while modal open (prevents layout shifting)
  useEffect(() => {
    if (detailsAuctionId === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailsAuctionId]);

  // ✅ Verification UI state (μόνο για panel upload)
  const [verifyingAuctionId, setVerifyingAuctionId] = useState<number | null>(null);
  const [verificationInstruction, setVerificationInstruction] =
    useState<LocalVerificationInstruction | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const loadMyAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

      const result = await getMyAuctions({
        page: pageToLoad,
        size: 30,
        sortBy,
        direction,
        statusGroup,
      });

      setPageData(result);
      setPage(pageToLoad);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Κάτι πήγε στραβά κατά τη φόρτωση των auctions σου.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMyAuctions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusGroup, sortBy, direction]);

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    void loadMyAuctions(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    void loadMyAuctions(page + 1);
  };

  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
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

  const formatStatusLabel = (s: string) => (s ?? "").replaceAll("_", " ");

  const statusBadge = (s: AuctionStatus | string) => {
    const base: React.CSSProperties = {
      padding: isMobile ? "5px 8px" : "6px 10px",
      borderRadius: 999,
      fontWeight: 950,
      fontSize: isMobile ? 11 : 12,
      color: "#FFFFFF",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      boxShadow: "0 8px 18px rgba(16,24,40,0.18)",
      border: "1px solid rgba(255,255,255,0.25)",

      // ✅ mobile: να φαίνεται όλο το label (wrap αντί για ellipsis)
      whiteSpace: isMobile ? "normal" : "nowrap",
      overflow: "hidden",
      textOverflow: isMobile ? "clip" : "ellipsis",
      lineHeight: 1.1,
      textAlign: "center",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
      maxWidth: isMobile ? "min(220px, 100%)" : undefined,
    };

    if (s === "ACTIVE") return { ...base, background: "#16A34A" };
    if (s === "PENDING_APPROVAL") return { ...base, background: "#F59E0B" };
    if (s === "EXPIRED") return { ...base, background: "#6B7280" };
    if (s === "CANCELLED") return { ...base, background: "#DC2626" };
    return { ...base, background: "#111827" };
  };

  const formatVerificationStatus = (s: VerificationStatus): string => {
    if (s === "PENDING_UPLOAD") return "Please upload your video";
    if (s === "PENDING_REVIEW") return "Under review";
    if (s === "VERIFIED") return "Verified ✅";
    return "Rejected ❌";
  };

  const verificationHelperText = (s: VerificationStatus): string => {
    if (s === "PENDING_REVIEW") return "Το βίντεο έχει σταλεί και είναι υπό έλεγχο από τον admin.";
    if (s === "VERIFIED") return "Έχει ήδη γίνει verification για αυτό το auction.";
    if (s === "REJECTED") return "Το verification απορρίφθηκε. Μπορείς να κάνεις re-upload.";
    return "Δεν έχει σταλεί verification video ακόμη.";
  };

  const handleStartVerification = (auctionId: number) => {
    const instr = pickRandomInstruction();
    setVerifyingAuctionId(auctionId);
    setVerificationInstruction(instr);
    setVerificationFile(null);
    setVerificationError(null);
    setVerificationMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setVerificationFile(file);
  };

  const handleUploadVerification = async () => {
    if (!verifyingAuctionId || !verificationInstruction) return;

    if (!verificationFile) {
      setVerificationError("Επίλεξε πρώτα ένα video αρχείο.");
      return;
    }

    setVerificationLoading(true);
    setVerificationError(null);
    setVerificationMessage(null);

    try {
      await uploadVerificationVideo(verifyingAuctionId, verificationFile);

      setVerificationMessage("Το verification video ανέβηκε επιτυχώς. Το status είναι πλέον 'Under review'.");

      setVerifyingAuctionId(null);
      setVerificationInstruction(null);
      setVerificationFile(null);

      // ✅ backend-driven refresh
      await loadMyAuctions(page);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      let msg = "Κάτι πήγε στραβά κατά το upload του βίντεο.";
      if (err instanceof Error && err.message) msg = err.message;
      setVerificationError(msg);
    } finally {
      setVerificationLoading(false);
    }
  };

  // -------------------- Filters dropdown positioning --------------------
  const computeFiltersPos = (): { top: number; left: number; width: number } | null => {
    if (typeof window === "undefined") return null;
    const btn = filtersBtnRef.current;
    if (!btn) return null;

    const r = btn.getBoundingClientRect();
    const margin = 12;

    const desiredWidth = isMobile
      ? Math.min(window.innerWidth - margin * 2, 560)
      : 560;

    let left = r.left + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - margin - desiredWidth;
    left = Math.min(left, maxLeft);
    left = Math.max(left, window.scrollX + margin);

    const top = r.bottom + window.scrollY + 8;
    return { top, left, width: desiredWidth };
  };

  useEffect(() => {
    if (!showFilters) {
      setFiltersPos(null);
      return;
    }

    setFiltersPos(computeFiltersPos());

    const onResize = () => setFiltersPos(computeFiltersPos());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters, vw]);

  useEffect(() => {
    if (!showFilters) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      const anchor = filtersAnchorRef.current;
      if (anchor && anchor.contains(target)) return;

      const dd = filtersDropdownRef.current;
      if (dd && dd.contains(target)) return;

      setShowFilters(false);
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [showFilters]);

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
    fontSize: isMobile ? 24 : isTablet ? 28 : 32,
    fontWeight: 950,
    color: "#111827",
    margin: 0,
    lineHeight: 1.1,
  };

  const metaText: React.CSSProperties = {
    color: "#6B7280",
    fontWeight: 800,
    fontSize: 13,
  };

  const filterCard: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 18,
    boxShadow: "0 10px 24px rgba(16,24,40,0.08)",
    border: "1px solid rgba(17,24,39,0.06)",
    padding: isMobile ? 12 : 14,
    display: "grid",
    gap: 10,
  };

  const filtersHeaderRow: React.CSSProperties = {
    display: "flex",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    gap: 10,
    flexDirection: isMobile ? "column" : "row",
  };

  const filtersBtn: React.CSSProperties = {
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#FFFFFF",
    fontWeight: 950,
    cursor: "pointer",
    whiteSpace: "nowrap",
    width: isMobile ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  const filterRowDropdown: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    alignItems: "end",
    width: "100%",
  };

  const label: React.CSSProperties = {
    display: "grid",
    gap: 6,
    fontWeight: 900,
    color: "#111827",
    fontSize: 13,
  };

  const select: React.CSSProperties = {
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#FFFFFF",
    fontWeight: 900,
    padding: "0 10px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const reloadBtn: React.CSSProperties = {
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#FFFFFF",
    fontWeight: 950,
    cursor: "pointer",
    whiteSpace: "nowrap",
    width: isMobile ? "100%" : "auto",
  };

  const dropdownShell = (pos: { top: number; left: number; width: number }): React.CSSProperties => ({
    position: "absolute",
    top: pos.top,
    left: pos.left,
    width: pos.width,
    zIndex: 9999,
    borderRadius: 18,
    overflow: "auto",
    maxHeight: "min(520px, calc(100vh - 24px))",
    boxShadow: "0 18px 40px rgba(17,24,39,0.16)",
  });

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
    gap: isMobile ? 12 : 18,
    alignItems: "start",
    marginTop: 14,
    width: "100%",
  };

  const card: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 18,
    boxShadow: "0 10px 24px rgba(16,24,40,0.08)",
    border: "1px solid rgba(17,24,39,0.06)",
    overflow: "hidden",
    display: "grid",
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

  const statusChipPos: React.CSSProperties = {
    position: "absolute",
    top: isMobile ? 10 : 12,
    right: isMobile ? 10 : 12,
    // ✅ σε mobile κάνε το container full-width για σωστό maxWidth υπολογισμό
    left: isMobile ? 10 : undefined,
    zIndex: 5,
    display: "flex",
    justifyContent: "flex-end",
    pointerEvents: "none",
  };

  const content: React.CSSProperties = {
    padding: isMobile ? 12 : 14,
    display: "grid",
    gap: 10,
  };

  // ✅ CHANGED: allow wrapping so long titles don't break the card
  const titleRow: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  };

  // ✅ CHANGED: title wraps to new line (even for long/unbroken strings)
  const auctionTitle: React.CSSProperties = {
    fontWeight: 950,
    fontSize: 18,
    color: "#111827",
    margin: 0,
    minWidth: 0,
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "clip",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    lineHeight: 1.2,
    flex: "1 1 auto",
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

  const verifyBtn: React.CSSProperties = {
    height: 40,
    borderRadius: 12,
    border: "1px solid #0B1220",
    background: "#0B1220",
    color: "#FFFFFF",
    fontWeight: 950,
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
    whiteSpace: "nowrap",
  };

  const verifyBtnDisabled: React.CSSProperties = {
    ...verifyBtn,
    opacity: 0.55,
    cursor: "not-allowed",
  };

  const verificationBox: React.CSSProperties = {
    border: "1px solid rgba(99,102,241,0.22)",
    background: "rgba(99,102,241,0.06)",
    borderRadius: 14,
    padding: "10px 12px",
    display: "grid",
    gap: 8,
  };

  const statusPill = (bg: string, color: string): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    background: bg,
    color,
    border: "1px solid rgba(17, 24, 39, 0.10)",
    width: "fit-content",
    whiteSpace: "nowrap",
  });

  const verificationPillStyle = useMemo(() => {
    return (s: VerificationStatus) => {
      if (s === "VERIFIED") return statusPill("#ECFDF5", "#065F46");
      if (s === "PENDING_REVIEW") return statusPill("#EFF6FF", "#1D4ED8");
      if (s === "REJECTED") return statusPill("#FEF2F2", "#991B1B");
      return statusPill("#F3F4F6", "#374151");
    };
  }, []);

  const toastBox = (type: "error" | "success"): React.CSSProperties => ({
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 14,
    fontWeight: 900,
    fontSize: 13,
    border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
    background: type === "error" ? "#FEF2F2" : "#F0FDF4",
    color: type === "error" ? "#991B1B" : "#166534",
  });

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

  const modalPad = isMobile ? 12 : isTablet ? 16 : 18;

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
            <h1 style={title}>My Auctions</h1>
          </div>
        </div>

        {/* Filters (button + dropdown like AuctionsPage) */}
        <div style={filterCard}>
          <div ref={filtersAnchorRef} style={filtersHeaderRow}>
            <button
              ref={filtersBtnRef}
              type="button"
              style={filtersBtn}
              onClick={() => setShowFilters((v) => !v)}
            >
              Filters <span style={{ opacity: 0.75 }}>{showFilters ? "▲" : "▼"}</span>
            </button>

            <button
              type="button"
              onClick={() => void loadMyAuctions(0)}
              disabled={loading}
              style={{ ...reloadBtn, opacity: loading ? 0.7 : 1 }}
              title="Reload"
            >
              {loading ? "Φόρτωση..." : "Reload"}
            </button>
          </div>

          {error && <div style={{ ...metaText, color: "#B91C1C" }}>Σφάλμα: {error}</div>}
          {loading && <div style={metaText}>Φόρτωση...</div>}
        </div>

        {/* Dropdown rendered in document.body so it never gets clipped */}
        {showFilters &&
          filtersPos &&
          typeof document !== "undefined" &&
          createPortal(
            <div ref={filtersDropdownRef} style={dropdownShell(filtersPos)}>
              <div style={filterCard}>
                <div style={filterRowDropdown}>
                  <label style={label}>
                    Status group
                    <select
                      value={statusGroup}
                      onChange={(e) => setStatusGroup(e.target.value as AuctionStatus)}
                      style={select}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </label>

                  <label style={label}>
                    Sort by
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} style={select}>
                      <option value="endDate">End Date</option>
                      <option value="startDate">Start Date</option>
                    </select>
                  </label>

                  <label style={label}>
                    Direction
                    <select
                      value={direction}
                      onChange={(e) => setDirection(e.target.value as Direction)}
                      style={select}
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>,
            document.body
          )}

        {pageData && (
          <>
            {pageData.content.length === 0 ? (
              <div style={emptyCard}>
                Δεν υπάρχουν auctions σε αυτή την κατηγορία.
                <div style={{ marginTop: 6, fontWeight: 800, color: "#6B7280", fontSize: 13 }}>
                  Δοκίμασε να αλλάξεις το Status ή το sorting.
                </div>
              </div>
            ) : (
              <div style={grid}>
                {pageData.content.map((auction) => {
                  const remaining = formatTimeRemaining(auction.endDate, now);
                  const ended = remaining === "Ended";
                  const city = getCityFromLocation(auction.sellerLocation ?? null);

                  const hasLeading =
                    auction.topBidAmount != null && (auction.topBidderUsername ?? "").trim().length > 0;

                  const verificationStatus: VerificationStatus =
                    auction.verificationStatus ?? "NOT_VERIFIED";

                  const isCancelledOrExpired =
                    auction.status === "CANCELLED" || auction.status === "EXPIRED" || ended;

                  const canStartVerification =
                    !isCancelledOrExpired &&
                    (verificationStatus === "PENDING_UPLOAD" || verificationStatus === "REJECTED");

                  const isThisVerifying = verifyingAuctionId === auction.id;

                  const showDetailsButton = (auction.status==="ACTIVE" || auction.status==="EXPIRED");

                  // ✅ NEW: show black button only for pending approval auctions
                  const showGoToVerifyBtn = auction.status === "PENDING_APPROVAL";

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

                        <div style={statusChipPos}>
                          <div style={statusBadge(auction.status)}>
                            {formatStatusLabel(auction.status)}
                          </div>
                        </div>
                      </div>

                      <div style={content}>
                        <div style={titleRow}>
                          <p style={auctionTitle} title={auction.title}>
                            {auction.title}
                          </p>
                        </div>

                        <div style={row}></div>

                        <div style={row}>
                          <span style={subtle}>Category: {auction.categoryName ?? "—"}</span>
                          <span style={subtle}>📍 {city}</span>
                        </div>
                        <div style={row}></div>

                        <div style={row}>
                          <span style={subtle}>Starting price: {formatMoneyEUR(auction.startingAmount)}</span>
                          <span style={subtle} title={auction.endDate}>
                            Ends:{" "}
                            {new Date(auction.endDate).toLocaleString("el-GR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div style={row}>
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
                                  <div style={leadingLabel}>Top bidder</div>
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
                                🏷️
                              </div>
                              <div style={{ display: "grid", gap: 2 }}>
                                <div style={{ fontWeight: 950, color: "#111827" }}>No bids yet</div>
                                <div style={leadingLabel}>Δεν υπάρχουν προσφορές ακόμη.</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {auction.status == "PENDING_UPLOAD" && (
                          <div style={verificationBox}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                                alignItems: isMobile ? "stretch" : "center",
                                flexDirection: isMobile ? "column" : "row",
                              }}
                            >
                              <div style={{ display: "grid", gap: 4 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div style={{ fontWeight: 950, color: "#111827" }}>Verification</div>
                                  <span style={verificationPillStyle(verificationStatus)}>
                                    {formatVerificationStatus(verificationStatus)}
                                  </span>
                                </div>

                                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
                                  {isCancelledOrExpired
                                    ? "Verification δεν είναι διαθέσιμο για expired/cancelled auctions."
                                    : verificationHelperText(verificationStatus)}
                                </div>
                              </div>

                              {canStartVerification ? (
                                <button
                                  type="button"
                                  style={verifyBtn}
                                  onClick={() => handleStartVerification(auction.id)}
                                >
                                  {verificationStatus === "REJECTED" ? "Re-upload verification" : "Start verification"}
                                </button>
                              ) : (
                                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>
                                  {verificationStatus === "PENDING_REVIEW"
                                    ? "Under review"
                                    : verificationStatus === "VERIFIED"
                                    ? "Verified"
                                    : "—"}
                                </div>
                              )}
                            </div>

                            {isThisVerifying && verificationInstruction && canStartVerification && (
                              <div
                                style={{
                                  marginTop: 8,
                                  background: "rgba(255,255,255,0.85)",
                                  borderRadius: 14,
                                  border: "1px dashed rgba(17,24,39,0.18)",
                                  padding: 12,
                                  display: "grid",
                                  gap: 10,
                                }}
                              >
                                <div style={{ fontWeight: 950, color: "#111827" }}>Instructions</div>

                                <div
                                  style={{
                                    whiteSpace: "pre-wrap",
                                    fontSize: 12,
                                    color: "#374151",
                                    fontWeight: 700,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {verificationInstruction.text}
                                </div>

                                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>
                                  Max duration: {verificationInstruction.maxDurationSeconds}s
                                </div>

                                <div style={{ display: "grid", gap: 6 }}>
                                  <div style={{ fontSize: 12, color: "#111827", fontWeight: 900 }}>
                                    Select video file
                                  </div>
                                  <input type="file" accept="video/*" onChange={handleFileChange} />
                                </div>

                                <button
                                  type="button"
                                  onClick={handleUploadVerification}
                                  disabled={verificationLoading || !verificationFile}
                                  style={
                                    verificationLoading || !verificationFile
                                      ? verifyBtnDisabled
                                      : { ...verifyBtn, width: "100%" }
                                  }
                                >
                                  {verificationLoading ? "Uploading..." : "Upload video"}
                                </button>

                                {verificationError && <div style={toastBox("error")}>{verificationError}</div>}
                                {verificationMessage && <div style={toastBox("success")}>{verificationMessage}</div>}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ✅ NEW BUTTON: only for PENDING_APPROVAL -> goes to MyPendingAuctionsPage */}
                        {showGoToVerifyBtn && (
                          <button
                            type="button"
                            style={{ ...verifyBtn, width: "100%" }}
                            onClick={() => navigate("/me/auctions/pending")}
                          >
                            Go to verify your product
                          </button>
                        )}

                        {showDetailsButton && (
                          <button type="button" style={detailsBtn} onClick={() => setDetailsAuctionId(auction.id)}>
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
      </div>

      {/* -------------------- DETAILS MODAL (POPUP) -------------------- */}
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAuctionsPage;
