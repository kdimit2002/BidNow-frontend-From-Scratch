// // src/components/MyPendingAuctionsPage.tsx

// import React, { useEffect, useState } from "react";
// import type { AuctionListItem, SpringPage, VerificationStatus } from "../models/Springboot/Auction";
// import { getMyPendingAuctions } from "../api/Springboot/backendAuctionService";
// import {
//   uploadVerificationVideo,
//   deleteVerificationVideo,
//   getVerificationVideoDuration,
// } from "../api/Springboot/backendVerificationService";

// type SortDirection = "asc" | "desc";

// // Αν το backend επιστρέφει verificationStatus μαζί με το list item, το κρατάμε optional
// type AuctionWithVerification = AuctionListItem & {
//   verificationStatus?: VerificationStatus;
//   verificationVideoUrl?: string | null;
// };

// interface MyPendingAuctionsPageProps {
//   onBack?: () => void;
// }

// // Τοπικός τύπος για οδηγίες verification (UI μόνο)
// interface LocalVerificationInstruction {
//   maxDurationSeconds: number;
//   text: string;
// }

// const makeInstructionText = (durationText: string): string =>
//   `Στείλε ένα βίντεο διάρκειας ${durationText} που να δείχνει ξεκάθαρα ότι το προϊόν είναι αυθεντικό και λειτουργεί κανονικά.

// • Αν πρόκειται για ηλεκτρονική συσκευή (π.χ. PC, κονσόλα, κινητό), άνοιξε μερικές εφαρμογές ή παιχνίδια και δείξε την οθόνη σε λειτουργία.
// • Αν πρόκειται για συλλεκτικό αντικείμενο, δείξε το προϊόν από όλες τις πλευρές (μπροστά, πίσω, πάνω, κάτω) και κάνε κοντινά στα σημαντικά σημεία, τυχόν σειριακούς αριθμούς ή σημάδια φθοράς.
// • Φρόντισε ο φωτισμός και ο ήχος να είναι όσο γίνεται καθαρά.
// • Το βίντεο να μήν κόβετε και ούτε να είναι edited.
// • Η περιγραφή στην δημοπρασία σας να αντιστοιχούν με το βίντεο.`;


// const durationToText = (seconds: number): string => {
//   if (seconds === 60) return "1 λεπτό";
//   return `${seconds} δευτερολέπτων`;
// };

// const MyPendingAuctionsPage: React.FC<MyPendingAuctionsPageProps> = ({ onBack }) => {
//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] = useState<SpringPage<AuctionWithVerification> | null>(null);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Sort state
//   const [sortBy, setSortBy] = useState<string>("endDate");
//   const [direction, setDirection] = useState<SortDirection>("asc");

//   // real-time time remaining
//   const [now, setNow] = useState<Date>(new Date());
//   useEffect(() => {
//     const id = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(id);
//   }, []);

//   // ---------- Verification state ----------
//   const [verifyingAuctionId, setVerifyingAuctionId] = useState<number | null>(null);
//   const [verificationInstruction, setVerificationInstruction] =
//     useState<LocalVerificationInstruction | null>(null);
//   const [verificationFile, setVerificationFile] = useState<File | null>(null);

//   const [instructionLoading, setInstructionLoading] = useState<boolean>(false);
//   const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
//   const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
//   const [verificationError, setVerificationError] = useState<string | null>(null);

//   // optimistic map (για να φαίνεται άμεσα το status μετά από upload/delete)
//   const [optimisticVerificationStatus, setOptimisticVerificationStatus] =
//     useState<Record<number, VerificationStatus>>({});

//   const formatTimeRemaining = (endDateStr: string): string => {
//     const end = new Date(endDateStr);
//     const diffMs = end.getTime() - now.getTime();

//     if (Number.isNaN(end.getTime()) || diffMs <= 0) return "Expired";

//     let totalSeconds = Math.floor(diffMs / 1000);

//     const days = Math.floor(totalSeconds / (24 * 3600));
//     totalSeconds -= days * 24 * 3600;

//     const hours = Math.floor(totalSeconds / 3600);
//     totalSeconds -= hours * 3600;

//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds - minutes * 60;

//     const parts: string[] = [];
//     if (days > 0) parts.push(`${days}d`);
//     if (hours > 0 || days > 0) parts.push(`${hours}h`);
//     if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
//     parts.push(`${seconds}s`);

//     return parts.join(" ");
//   };

//   const formatVerificationStatus = (status: VerificationStatus): string => {
//     switch (status) {
//       case "PENDING_UPLOAD":
//         return "Pending upload";
//       case "PENDING_REVIEW":
//         return "Pending review";
//       case "VERIFIED":
//         return "Verified ✅";
//       case "REJECTED":
//         return "Rejected ❌";
//       default:
//         return status;
//     }
//   };

//   const extractCity = (sellerLocation: string): string => {
//     const parts = sellerLocation.split(",").map((p) => p.trim());
//     if (parts.length === 0) return "";
//     return parts[0] ?? "";
//   };

//   const loadAuctions = async (pageOverride?: number) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

//       const result = await getMyPendingAuctions({
//         page: pageToLoad,
//         size: 30,
//         sortBy: sortBy || undefined,
//         direction: direction || undefined,
//       });

//       setPageData(result as SpringPage<AuctionWithVerification>);
//       setPage(pageToLoad);
//     } catch (err) {
//       console.error(err);
//       const msg = err instanceof Error ? err.message : "Κάτι πήγε στραβά στο backend.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // αρχικό load
//   useEffect(() => {
//     void loadAuctions(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleApplySort = () => {
//     void loadAuctions(0);
//   };

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     void loadAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     void loadAuctions(page + 1);
//   };

//   // ---------- Verification handlers ----------
//   const handleStartVerification = async (auctionId: number) => {
//     setVerifyingAuctionId(auctionId);

//     // reset UI
//     setVerificationFile(null);
//     setVerificationInstruction(null);
//     setVerificationError(null);
//     setVerificationMessage(null);

//     setInstructionLoading(true);
//     try {
//       const dto = await getVerificationVideoDuration(auctionId);
//       const seconds = Number(dto.duration);

//       if (!Number.isFinite(seconds) || seconds <= 0) {
//         throw new Error("Μη έγκυρη διάρκεια από το backend.");
//       }

//       const durationText = durationToText(seconds);
//       setVerificationInstruction({
//         maxDurationSeconds: seconds,
//         text: makeInstructionText(durationText),
//       });
//     } catch (err) {
//       console.error(err);
//       const msg =
//         err instanceof Error && err.message
//           ? err.message
//           : "Δεν μπόρεσα να πάρω τη διάρκεια βίντεο από το backend.";
//       setVerificationError(msg);
//     } finally {
//       setInstructionLoading(false);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] ?? null;
//     setVerificationFile(file);
//   };

//   const handleUploadVerification = async () => {
//     if (verifyingAuctionId === null) return;

//     if (verificationFile === null) {
//       setVerificationError("Επίλεξε πρώτα ένα video αρχείο.");
//       return;
//     }

//     setVerificationLoading(true);
//     setVerificationError(null);
//     setVerificationMessage(null);

//     try {
//       await uploadVerificationVideo(verifyingAuctionId, verificationFile);

//       setVerificationMessage(
//         "Το βίντεο ανέβηκε επιτυχώς. Η δημοπρασία σου θα ελεγχθεί από τον διαχειριστή."
//       );

//       // optimistic -> PENDING_REVIEW
//       setOptimisticVerificationStatus((prev) => ({
//         ...prev,
//         [verifyingAuctionId]: "PENDING_REVIEW",
//       }));

//       setVerifyingAuctionId(null);
//       setVerificationInstruction(null);
//       setVerificationFile(null);

//       void loadAuctions(page);
//     } catch (err) {
//       console.error(err);
//       const msg =
//         err instanceof Error && err.message
//           ? err.message
//           : "Κάτι πήγε στραβά κατά το upload του βίντεο.";
//       setVerificationError(msg);
//     } finally {
//       setVerificationLoading(false);
//     }
//   };

//   const handleDeleteVerification = async (auctionId: number) => {
//     setVerificationLoading(true);
//     setVerificationError(null);
//     setVerificationMessage(null);

//     try {
//       await deleteVerificationVideo(auctionId);

//       setVerificationMessage("Το βίντεο διαγράφηκε. Μπορείς να κάνεις νέο upload.");

//       // optimistic -> PENDING_UPLOAD
//       setOptimisticVerificationStatus((prev) => ({
//         ...prev,
//         [auctionId]: "PENDING_UPLOAD",
//       }));

//       // κλείσε τυχόν ανοιχτό panel
//       setVerifyingAuctionId(null);
//       setVerificationInstruction(null);
//       setVerificationFile(null);

//       void loadAuctions(page);
//     } catch (err) {
//       console.error(err);
//       const msg =
//         err instanceof Error && err.message
//           ? err.message
//           : "Κάτι πήγε στραβά κατά το delete του βίντεο.";
//       setVerificationError(msg);
//     } finally {
//       setVerificationLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: 950, margin: "0 auto", padding: "1rem" }}>
//       <h1>My Pending Auctions</h1>

//       {onBack && (
//         <button type="button" onClick={onBack} style={{ marginBottom: "1rem" }}>
//           ← Back
//         </button>
//       )}

//       {/* Sort controls */}
//       <div style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
//         <label>
//           Sort by:{" "}
//           <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
//             <option value="endDate">End date</option>
//             <option value="startingAmount">Starting amount</option>
//             <option value="minBidIncrement">Min bid increment</option>
//             <option value="title">Title</option>
//           </select>
//         </label>

//         <label>
//           Direction:{" "}
//           <select
//             value={direction}
//             onChange={(e) => setDirection(e.target.value === "desc" ? "desc" : "asc")}
//           >
//             <option value="asc">ASC</option>
//             <option value="desc">DESC</option>
//           </select>
//         </label>

//         <button type="button" onClick={handleApplySort} disabled={loading}>
//           {loading ? "Loading..." : "Apply sort"}
//         </button>

//         <button type="button" onClick={() => loadAuctions(page)} disabled={loading}>
//           Refresh
//         </button>
//       </div>

//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

//       {pageData && (
//         <div>
//           <p>
//             Σελίδα {page + 1} από {pageData.totalPages} — Σύνολο {pageData.totalElements} pending
//             auctions
//           </p>

//           <ul style={{ listStyle: "none", paddingLeft: 0 }}>
//             {pageData.content.map((auction) => {
//               const city = extractCity(auction.sellerLocation);
//               const timeRemaining = formatTimeRemaining(auction.endDate);

//               const verificationStatus: VerificationStatus =
//                 auction.verificationStatus ??
//                 optimisticVerificationStatus[auction.id] ??
//                 "PENDING_UPLOAD";

//               const canUpload = verificationStatus === "PENDING_UPLOAD";
//               const canDelete = verificationStatus === "PENDING_REVIEW";
//               const isThisVerifying = verifyingAuctionId === auction.id;

//               return (
//                 <li
//                   key={auction.id}
//                   style={{
//                     marginBottom: "1rem",
//                     border: "1px solid #ddd",
//                     borderRadius: 6,
//                     padding: "0.75rem",
//                     display: "flex",
//                     gap: "0.75rem",
//                   }}
//                 >
//                   {/* Image */}
//                   <div style={{ minWidth: 180 }}>
//                     {auction.mainImageUrl ? (
//                       <img
//                         src={auction.mainImageUrl}
//                         alt={auction.title}
//                         style={{ width: 180, height: 140, objectFit: "cover", borderRadius: 4 }}
//                       />
//                     ) : (
//                       <div
//                         style={{
//                           width: 180,
//                           height: 140,
//                           border: "1px dashed #ccc",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           color: "#888",
//                           borderRadius: 4,
//                         }}
//                       >
//                         No image
//                       </div>
//                     )}
//                   </div>

//                   {/* Info */}
//                   <div style={{ flex: 1 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
//                       <div>
//                         <strong style={{ fontSize: "1.05rem" }}>{auction.title}</strong>
//                         <div style={{ color: "#555" }}>
//                           {auction.categoryName} — {auction.startingAmount}€
//                         </div>
//                       </div>

//                       <div style={{ textAlign: "right", color: "#555" }}>
//                         <div>Location: {city || "N/A"}</div>
//                         <div>Time remaining: {timeRemaining}</div>
//                       </div>
//                     </div>

//                     <div style={{ marginTop: "0.25rem" }}>
//                       Min bid increment: <strong>{auction.minBidIncrement}€</strong>
//                     </div>

//                     <div style={{ marginTop: "0.25rem" }}>
//                       Status: <strong>{auction.status}</strong>
//                     </div>

//                     <div style={{ marginTop: "0.25rem" }}>Short desc: {auction.shortDescription}</div>

//                     <hr style={{ margin: "0.75rem 0" }} />

//                     {/* Verification */}
//                     <div>
//                       Verification status:{" "}
//                       <strong>{formatVerificationStatus(verificationStatus)}</strong>
//                       {verificationStatus === "PENDING_REVIEW" && (
//                         <span style={{ marginLeft: "0.5rem", color: "#555" }}>(υπό έλεγχο)</span>
//                       )}
//                     </div>

//                     {/* DELETE: μόνο όταν είναι PENDING_REVIEW */}
//                     {canDelete && (
//                       <div style={{ marginTop: "0.5rem" }}>
//                         <button
//                           type="button"
//                           onClick={() => void handleDeleteVerification(auction.id)}
//                           disabled={verificationLoading || instructionLoading}
//                         >
//                           {verificationLoading ? "Deleting..." : "Delete verification video"}
//                         </button>
//                       </div>
//                     )}

//                     {/* UPLOAD: μόνο όταν είναι PENDING_UPLOAD */}
//                     {canUpload && (
//                       <div style={{ marginTop: "0.5rem" }}>
//                         <button
//                           type="button"
//                           onClick={() => void handleStartVerification(auction.id)}
//                           disabled={verificationLoading || instructionLoading}
//                         >
//                           {instructionLoading ? "Loading..." : "Start verification"}
//                         </button>

//                         {isThisVerifying && (
//                           <div
//                             style={{
//                               marginTop: "0.5rem",
//                               padding: "0.75rem",
//                               border: "1px dashed #bbb",
//                               borderRadius: 6,
//                             }}
//                           >
//                             {instructionLoading && <p>Φόρτωση διάρκειας...</p>}

//                             {!instructionLoading && verificationInstruction && (
//                               <>
//                                 <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>
//                                   {verificationInstruction.text}
//                                 </p>

//                                 <p style={{ fontStyle: "italic", marginTop: 0 }}>
//                                   Μέγιστη διάρκεια: {verificationInstruction.maxDurationSeconds}s
//                                 </p>

//                                 <label>
//                                   Διάλεξε αρχείο βίντεο:
//                                   <input
//                                     type="file"
//                                     accept="video/*"
//                                     onChange={handleFileChange}
//                                     style={{ display: "block", marginTop: "0.25rem" }}
//                                     disabled={verificationLoading}
//                                   />
//                                 </label>

//                                 <button
//                                   type="button"
//                                   onClick={handleUploadVerification}
//                                   disabled={verificationLoading || verificationFile === null}
//                                   style={{ marginTop: "0.5rem" }}
//                                 >
//                                   {verificationLoading ? "Uploading..." : "Upload verification video"}
//                                 </button>
//                               </>
//                             )}

//                             {verificationError && (
//                               <p style={{ color: "red", marginTop: "0.5rem" }}>
//                                 {verificationError}
//                               </p>
//                             )}
//                             {verificationMessage && (
//                               <p style={{ color: "green", marginTop: "0.5rem" }}>
//                                 {verificationMessage}
//                               </p>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {/* VERIFIED */}
//                     {verificationStatus === "VERIFIED" && (
//                       <p style={{ marginTop: "0.5rem", color: "green", fontWeight: 700 }}>
//                         Verified ✅
//                       </p>
//                     )}
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>

//           {/* Pagination */}
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

// export default MyPendingAuctionsPage;








// ///////////////////////// SIMANTIKO POLI ///////////////////////////////

// // src/components/MyPendingAuctionsPage.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import type { AuctionListItem, SpringPage, VerificationStatus } from "../models/Springboot/Auction";
// import { getMyPendingAuctions } from "../api/Springboot/backendAuctionService";
// import {
//   uploadVerificationVideo,
//   deleteVerificationVideo,
//   getVerificationVideoDuration,
// } from "../api/Springboot/backendVerificationService";

// type SortDirection = "asc" | "desc";

// // Αν το backend επιστρέφει verificationStatus μαζί με το list item, το κρατάμε optional
// type AuctionWithVerification = AuctionListItem & {
//   verificationStatus?: VerificationStatus;
//   verificationVideoUrl?: string | null;
// };

// interface MyPendingAuctionsPageProps {
//   onBack?: () => void;
// }

// // Τοπικός τύπος για οδηγίες verification (UI μόνο)
// interface LocalVerificationInstruction {
//   maxDurationSeconds: number;
//   text: string;
// }

// const makeInstructionText = (durationText: string): string =>
//   `Send a video of duration ${durationText} that clearly shows the product is authentic and works properly.

// • If it’s an electronic device (e.g., PC, console, phone), open a few apps or games and show the screen working.
// • If it’s a collectible item, show the product from all sides (front, back, top, bottom) and zoom in on key details such as serial numbers or signs of wear.
// • Make sure the lighting and audio are as clear as possible.
// • The video must not be cut or edited.
// • The auction description must match what is shown in the video.`;

// const durationToText = (seconds: number): string => {
//   if (seconds === 60) return "1 minute";
//   return `${seconds} seconds`;
// };

// const extractCity = (sellerLocation: string): string => {
//   const parts = sellerLocation.split(",").map((p) => p.trim());
//   if (parts.length === 0) return "";
//   return parts[0] ?? "";
// };

// // ✅ Smart truncate για μεγάλα filenames (χωρίς αλλαγή λογικής upload)
// const formatFileNameForUI = (name: string, maxLen = 26): string => {
//   const clean = (name ?? "").trim();
//   if (!clean) return "No file selected";

//   const dot = clean.lastIndexOf(".");
//   const hasExt = dot > 0 && dot < clean.length - 1;
//   const ext = hasExt ? clean.slice(dot) : "";
//   const base = hasExt ? clean.slice(0, dot) : clean;

//   if (clean.length <= maxLen) return clean;

//   const extLen = ext.length;
//   const available = Math.max(10, maxLen - extLen);

//   const head = Math.max(6, Math.floor(available * 0.55));
//   const tail = Math.max(4, available - head - 1);

//   const left = base.slice(0, head);
//   const right = base.slice(-tail);

//   return `${left}…${right}${ext}`;
// };

// const MyPendingAuctionsPage: React.FC<MyPendingAuctionsPageProps> = ({ onBack }) => {
//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] = useState<SpringPage<AuctionWithVerification> | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Sort state
//   const [sortBy, setSortBy] = useState<string>("endDate");
//   const [direction, setDirection] = useState<SortDirection>("asc");

//   // ✅ Responsive breakpoints (design του 1ου)
//   const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1280));
//   useEffect(() => {
//     const onResize = () => setVw(window.innerWidth);
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);
//   const isMobile = vw <= 640;
//   const isTablet = vw > 640 && vw <= 1024;

//   const CARD_MIN_WIDTH = isTablet ? 320 : 340;
//   const CARD_IMAGE_HEIGHT = isMobile ? 190 : isTablet ? 220 : 240;

//   // real-time time remaining
//   const [now, setNow] = useState<Date>(new Date());
//   useEffect(() => {
//     const id = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(id);
//   }, []);

//   // ---------- SORT dropdown (design του 1ου) ----------
//   const [sortOpen, setSortOpen] = useState<boolean>(false);
//   const [sortFlip, setSortFlip] = useState<boolean>(false);
//   const [sortMaxH, setSortMaxH] = useState<number>(520);
//   const sortBtnRef = useRef<HTMLButtonElement | null>(null);

//   const computeSortLayout = (rect: DOMRect) => {
//     const margin = 12;
//     const gap = 10;

//     const belowTop = rect.bottom + gap;
//     const availableBelow = window.innerHeight - belowTop - margin;
//     const availableAbove = rect.top - gap - margin;

//     const flip = availableBelow < 260 && availableAbove > availableBelow;

//     const rawMax = Math.max(220, Math.floor(flip ? availableAbove : availableBelow));
//     const maxH = Math.min(rawMax, Math.floor(window.innerHeight * 0.82));

//     return { flip, maxH };
//   };

//   const toggleSort = (btnEl: HTMLButtonElement | null) => {
//     if (!btnEl) return;
//     sortBtnRef.current = btnEl;

//     setSortOpen((prev) => {
//       const next = !prev;
//       if (next) {
//         const r = btnEl.getBoundingClientRect();
//         const layout = computeSortLayout(r);
//         setSortFlip(layout.flip);
//         setSortMaxH(layout.maxH);
//       }
//       return next;
//     });
//   };

//   const closeSort = () => setSortOpen(false);

//   // outside click + esc
//   useEffect(() => {
//     const onDocClick = (e: MouseEvent) => {
//       if (!sortOpen) return;
//       const target = e.target as HTMLElement | null;
//       if (!target) return;

//       const insideDrop = target.closest("[data-sort-dd='true']");
//       const insideBtn = target.closest("[data-sort-btn='true']");
//       if (insideDrop || insideBtn) return;

//       closeSort();
//     };

//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") closeSort();
//     };

//     document.addEventListener("mousedown", onDocClick);
//     window.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onDocClick);
//       window.removeEventListener("keydown", onKey);
//     };
//   }, [sortOpen]);

//   // ✅ Recompute ONLY on resize (not on scroll) -> no shaking
//   useEffect(() => {
//     if (!sortOpen) return;

//     const onResize = () => {
//       const btn = sortBtnRef.current;
//       if (!btn) return;
//       const r = btn.getBoundingClientRect();
//       const layout = computeSortLayout(r);
//       setSortFlip(layout.flip);
//       setSortMaxH(layout.maxH);
//     };

//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, [sortOpen]);

//   // ---------- VERIFICATION (λογική του 2ου) ----------
//   const [verifyingAuctionId, setVerifyingAuctionId] = useState<number | null>(null);
//   const [verificationInstruction, setVerificationInstruction] = useState<LocalVerificationInstruction | null>(null);
//   const [verificationFile, setVerificationFile] = useState<File | null>(null);

//   const [instructionLoading, setInstructionLoading] = useState<boolean>(false);
//   const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
//   const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
//   const [verificationError, setVerificationError] = useState<string | null>(null);

//   // optimistic map (για να φαίνεται άμεσα το status μετά από upload/delete)
//   const [optimisticVerificationStatus, setOptimisticVerificationStatus] =
//     useState<Record<number, VerificationStatus>>({});

//   // ✅ Custom file picker (hide native "Choose file")
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const openFilePicker = () => {
//     if (verificationLoading) return;
//     fileInputRef.current?.click();
//   };

//   // ✅ Cancel selected file BEFORE upload (X κάτω από το filename)
//   const clearSelectedFile = () => {
//     setVerificationFile(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     setVerificationError(null);
//     setVerificationMessage(null);
//   };

//   const formatTimeRemaining = (endDateStr: string): string => {
//     const end = new Date(endDateStr);
//     const diffMs = end.getTime() - now.getTime();

//     if (Number.isNaN(end.getTime()) || diffMs <= 0) return "Expired";

//     let totalSeconds = Math.floor(diffMs / 1000);

//     const days = Math.floor(totalSeconds / (24 * 3600));
//     totalSeconds -= days * 24 * 3600;

//     const hours = Math.floor(totalSeconds / 3600);
//     totalSeconds -= hours * 3600;

//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds - minutes * 60;

//     const parts: string[] = [];
//     if (days > 0) parts.push(`${days}d`);
//     if (hours > 0 || days > 0) parts.push(`${hours}h`);
//     if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
//     parts.push(`${seconds}s`);

//     return parts.join(" ");
//   };

//   const formatVerificationStatus = (status: VerificationStatus): string => {
//     switch (status) {
//       case "PENDING_UPLOAD":
//         return "Pending upload";
//       case "PENDING_REVIEW":
//         return "Pending review";
//       case "VERIFIED":
//         return "Verified ✅";
//       case "REJECTED":
//         return "Rejected ❌";
//       default:
//         return status;
//     }
//   };

//   const verificationHelperText = (status: VerificationStatus): string => {
//     if (status === "PENDING_REVIEW") return "The video has been submitted and is under review by the admin.";
//     if (status === "VERIFIED") return "This auction has already been verified.";
//     if (status === "REJECTED") return "Verification was rejected. You can upload a new video.";
//     return "No verification video has been uploaded yet.";
//   };

//   const loadAuctions = async (pageOverride?: number) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

//       const result = await getMyPendingAuctions({
//         page: pageToLoad,
//         size: 30,
//         sortBy: sortBy || undefined,
//         direction: direction || undefined,
//       });

//       setPageData(result as SpringPage<AuctionWithVerification>);
//       setPage(pageToLoad);
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.error(err);
//       const msg = err instanceof Error ? err.message : "Something went wrong.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // αρχικό load
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

//   const handleSortApply = async () => {
//     await loadAuctions(0);
//     closeSort();
//   };

//   const handleStartVerification = async (auctionId: number) => {
//     setVerifyingAuctionId(auctionId);

//     // reset UI
//     setVerificationFile(null);
//     setVerificationInstruction(null);
//     setVerificationError(null);
//     setVerificationMessage(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";

//     setInstructionLoading(true);
//     try {
//       const dto = await getVerificationVideoDuration(auctionId);
//       const seconds = Number((dto as { duration?: unknown }).duration);

//       if (!Number.isFinite(seconds) || seconds <= 0) {
//         throw new Error("Invalid duration returned. Please contact BidNow");
//       }

//       const durationText = durationToText(seconds);
//       setVerificationInstruction({
//         maxDurationSeconds: seconds,
//         text: makeInstructionText(durationText),
//       });
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.error(err);
//       const msg =
//         err instanceof Error && err.message
//           ? err.message
//           : "Could not retrieve the required video duration. Please contact Bidnow.";
//       setVerificationError(msg);
//     } finally {
//       setInstructionLoading(false);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] ?? null;
//     setVerificationFile(file);
//   };

//   const handleUploadVerification = async () => {
//     if (verifyingAuctionId === null) return;

//     if (verificationFile === null) {
//       setVerificationError("Please select a video file first.");
//       return;
//     }

//     setVerificationLoading(true);
//     setVerificationError(null);
//     setVerificationMessage(null);

//     try {
//       await uploadVerificationVideo(verifyingAuctionId, verificationFile);

//       setVerificationMessage("The video was uploaded successfully. Your auction will be reviewed by the administrator.");

//       // optimistic -> PENDING_REVIEW
//       setOptimisticVerificationStatus((prev) => ({
//         ...prev,
//         [verifyingAuctionId]: "PENDING_REVIEW",
//       }));

//       setVerifyingAuctionId(null);
//       setVerificationInstruction(null);
//       setVerificationFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";

//       void loadAuctions(page);
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.error(err);
//       const msg =
//         err instanceof Error && err.message ? err.message : "Something went wrong while uploading the video.";
//       setVerificationError(msg);
//     } finally {
//       setVerificationLoading(false);
//     }
//   };

//   const handleDeleteVerification = async (auctionId: number) => {
//     setVerificationLoading(true);
//     setVerificationError(null);
//     setVerificationMessage(null);

//     try {
//       await deleteVerificationVideo(auctionId);

//       setVerificationMessage("The video was deleted. You can upload a new one.");

//       // optimistic -> PENDING_UPLOAD
//       setOptimisticVerificationStatus((prev) => ({
//         ...prev,
//         [auctionId]: "PENDING_UPLOAD",
//       }));

//       // κλείσε τυχόν ανοιχτό panel
//       setVerifyingAuctionId(null);
//       setVerificationInstruction(null);
//       setVerificationFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";

//       void loadAuctions(page);
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.error(err);
//       const msg =
//         err instanceof Error && err.message ? err.message : "Something went wrong while deleting the video.";
//       setVerificationError(msg);
//     } finally {
//       setVerificationLoading(false);
//     }
//   };

//   // -----------------------------
//   // ✅ Styles (design του 1ου)
//   // -----------------------------
//   const pageOuter: React.CSSProperties = {
//     width: "100%",
//     minHeight: "100vh",
//     background: "#F5F6F8",
//   };

//   const container: React.CSSProperties = {
//     width: "100%",
//     maxWidth: 1400,
//     margin: "0 auto",
//     padding: isMobile ? "12px 12px 22px" : isTablet ? "16px 16px 28px" : "18px 24px 40px",
//     boxSizing: "border-box",
//   };

//   const topBar: React.CSSProperties = {
//     display: "flex",
//     alignItems: isMobile ? "stretch" : "center",
//     justifyContent: "space-between",
//     gap: isMobile ? 10 : 16,
//     padding: "8px 0 12px",
//     flexDirection: isMobile ? "column" : "row",
//   };

//   const titleStyle: React.CSSProperties = {
//     margin: 0,
//     fontSize: isMobile ? 24 : isTablet ? 28 : 32,
//     fontWeight: 900,
//     color: "#111827",
//     lineHeight: 1.05,
//   };

//   const btnBase: React.CSSProperties = {
//     height: 40,
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 900,
//     fontSize: 13,
//     cursor: "pointer",
//     padding: "0 12px",
//   };

//   const btn: React.CSSProperties = { ...btnBase, width: isMobile ? "100%" : "auto" };

//   const pillBtn: React.CSSProperties = {
//     ...btnBase,
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 8,
//     whiteSpace: "nowrap",
//     width: isMobile ? "100%" : "auto",
//   };

//   const primaryBtn: React.CSSProperties = {
//     ...btnBase,
//     height: 44,
//     background: "#0B1220",
//     color: "#FFFFFF",
//     border: "1px solid #0B1220",
//     whiteSpace: "nowrap",
//   };

//   const dangerBtn: React.CSSProperties = {
//     ...btnBase,
//     height: 44,
//     background: "#FFFFFF",
//     color: "#991B1B",
//     border: "1px solid rgba(220, 38, 38, 0.35)",
//     whiteSpace: "nowrap",
//   };

//   const primaryBtnFull: React.CSSProperties = { ...primaryBtn, width: "100%" };
//   const disabledPrimaryBtnFull: React.CSSProperties = { ...primaryBtnFull, opacity: 0.55, cursor: "not-allowed" };
//   const dangerBtnFull: React.CSSProperties = { ...dangerBtn, width: "100%" };
//   const disabledDangerBtnFull: React.CSSProperties = { ...dangerBtnFull, opacity: 0.55, cursor: "not-allowed" };

//   // --- Wrap-safe buttons (για verification / στενές κάρτες) ---
//   const primaryBtnWrap: React.CSSProperties = {
//     ...primaryBtn,
//     height: "auto",
//     padding: "10px 12px",
//     whiteSpace: "normal",
//     lineHeight: 1.15,
//     maxWidth: "100%",
//     boxSizing: "border-box",
//   };

//   const dangerBtnWrap: React.CSSProperties = {
//     ...dangerBtn,
//     height: "auto",
//     padding: "10px 12px",
//     whiteSpace: "normal",
//     lineHeight: 1.15,
//     maxWidth: "100%",
//     boxSizing: "border-box",
//   };

//   const primaryBtnFullWrap: React.CSSProperties = { ...primaryBtnWrap, width: "100%" };
//   const disabledPrimaryBtnFullWrap: React.CSSProperties = {
//     ...primaryBtnFullWrap,
//     opacity: 0.55,
//     cursor: "not-allowed",
//   };

//   const dangerBtnFullWrap: React.CSSProperties = { ...dangerBtnWrap, width: "100%" };
//   const disabledDangerBtnFullWrap: React.CSSProperties = {
//     ...dangerBtnFullWrap,
//     opacity: 0.55,
//     cursor: "not-allowed",
//   };

//   // --- Title χωρίς ellipsis + safe wrapping ---
//   const auctionTitleText: React.CSSProperties = {
//     fontSize: 18,
//     fontWeight: 950,
//     color: "#111827",
//     lineHeight: 1.2,
//     whiteSpace: "normal",
//     overflowWrap: "anywhere",
//     wordBreak: "break-word",
//   };

//   const startingPriceLine: React.CSSProperties = {
//     marginTop: 4,
//     fontSize: 12.5,
//     color: "#6B7280",
//     fontWeight: 900,
//     overflowWrap: "anywhere",
//     wordBreak: "break-word",
//   };

//   // --- Verification top row να μη overflow ---
//   const verificationHeaderRow: React.CSSProperties = {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: isMobile ? "stretch" : "center",
//     gap: 10,
//     flexDirection: isMobile ? "column" : "row",
//     flexWrap: isMobile ? "nowrap" : "wrap",
//   };

//   // --- Custom file picker (ίδιο design, μόνο fix overflow + X κάτω) ---
//   const filePickerRow: React.CSSProperties = {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: 10,
//     flexWrap: isMobile ? "wrap" : "nowrap",
//     width: "100%",
//     maxWidth: "100%",
//   };

//   const filePickBtn: React.CSSProperties = {
//     ...btnBase,
//     height: 42,
//     borderRadius: 12,
//     fontWeight: 950,
//     whiteSpace: "nowrap",
//     flex: "0 0 auto",
//     maxWidth: "100%",
//   };

//   const fileNameStack: React.CSSProperties = {
//     flex: "1 1 0",
//     minWidth: 0,
//     display: "grid",
//     gap: 6,
//     width: "100%",
//     maxWidth: "100%",
//   };

//   const fileNamePill: React.CSSProperties = {
//     width: "100%",
//     maxWidth: "100%",
//     minWidth: 0,
//     padding: "10px 12px",
//     borderRadius: 12,
//     border: "1px solid rgba(17,24,39,0.12)",
//     background: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: 900,
//     color: "#111827",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     whiteSpace: "nowrap",
//     boxSizing: "border-box",
//   };

//   const fileClearUnderBtn: React.CSSProperties = {
//     height: 36,
//     borderRadius: 12,
//     border: "1px solid rgba(220, 38, 38, 0.35)",
//     background: "#FFFFFF",
//     color: "#991B1B",
//     fontWeight: 950,
//     fontSize: 12,
//     padding: "0 10px",
//     cursor: "pointer",
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 8,
//     width: "fit-content",
//     maxWidth: "100%",
//     boxSizing: "border-box",
//   };

//   const topRight: React.CSSProperties = {
//     display: "flex",
//     gap: 10,
//     alignItems: "center",
//     justifyContent: isMobile ? "space-between" : "flex-end",
//     width: isMobile ? "100%" : "auto",
//     flexWrap: "wrap",
//   };

//   const ddWrap: React.CSSProperties = {
//     position: "relative",
//     display: "inline-flex",
//     alignItems: "center",
//     width: isMobile ? "100%" : "auto",
//   };

//   const ddPanelStyle = (): React.CSSProperties => {
//     const base: React.CSSProperties = {
//       position: "absolute",
//       zIndex: 5000,
//       borderRadius: 14,
//       background: "#FFFFFF",
//       border: "1px solid rgba(17,24,39,0.12)",
//       boxShadow: "0 22px 70px rgba(0,0,0,0.22)",
//       padding: 12,
//       overflowY: "auto",
//       maxHeight: sortMaxH,
//       boxSizing: "border-box",
//     };

//     if (isMobile) {
//       return {
//         ...base,
//         left: 0,
//         right: 0,
//         width: "100%",
//         ...(sortFlip ? { bottom: "calc(100% + 10px)" } : { top: "calc(100% + 10px)" }),
//       };
//     }

//     return {
//       ...base,
//       right: 0,
//       width: "min(420px, 92vw)",
//       ...(sortFlip ? { bottom: "calc(100% + 10px)" } : { top: "calc(100% + 10px)" }),
//     };
//   };

//   const selectWrap: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     background: "#F3F4F6",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     borderRadius: 12,
//     padding: "10px 12px",
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const selectStyle: React.CSSProperties = {
//     width: "100%",
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#111827",
//   };

//   const stickyFooter: React.CSSProperties = {
//     position: "sticky",
//     bottom: 0,
//     background: "#FFFFFF",
//     paddingTop: 10,
//     marginTop: 10,
//     borderTop: "1px solid rgba(17,24,39,0.08)",
//   };

//   const grid: React.CSSProperties = {
//     marginTop: 18,
//     display: "grid",
//     gridTemplateColumns: isMobile ? "1fr" : `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
//     gap: isMobile ? 12 : 16,
//   };

//   const card: React.CSSProperties = {
//     background: "#FFFFFF",
//     borderRadius: 16,
//     border: "1px solid rgba(17, 24, 39, 0.08)",
//     overflow: "hidden",
//     boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
//     display: "flex",
//     flexDirection: "column",
//   };

//   const imgWrap: React.CSSProperties = {
//     position: "relative",
//     height: CARD_IMAGE_HEIGHT,
//     background: "#E5E7EB",
//   };

//   const badgeLeft: React.CSSProperties = {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 6,
//     padding: isMobile ? "5px 9px" : "6px 10px",
//     borderRadius: 999,
//     background: "rgba(255,255,255,0.92)",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     fontSize: isMobile ? 11.5 : 12,
//     fontWeight: 900,
//     color: "#111827",
//     maxWidth: "calc(100% - 20px)",
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const badgeRight: React.CSSProperties = {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     padding: isMobile ? "5px 9px" : "6px 10px",
//     borderRadius: 999,
//     background: "rgba(255,255,255,0.92)",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     fontSize: isMobile ? 11.5 : 12,
//     fontWeight: 900,
//     color: "#111827",
//     maxWidth: "calc(100% - 20px)",
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const body: React.CSSProperties = {
//     padding: isMobile ? 12 : 14,
//     display: "flex",
//     flexDirection: "column",
//     gap: 10,
//   };

//   const metaRow: React.CSSProperties = {
//     display: "flex",
//     justifyContent: "space-between",
//     gap: 10,
//     fontSize: 12,
//     color: "#6B7280",
//     fontWeight: 900,
//     flexWrap: "wrap",
//   };

//   const line: React.CSSProperties = {
//     height: 1,
//     background: "rgba(17,24,39,0.06)",
//     margin: "2px 0",
//   };

//   const smallBox: React.CSSProperties = {
//     marginTop: 2,
//     background: "#EEF2FF",
//     border: "1px solid rgba(37, 99, 235, 0.20)",
//     borderRadius: 14,
//     padding: 10,
//     display: "grid",
//     gap: 8,
//   };

//   const statusPill = (bg: string, color: string): React.CSSProperties => ({
//     display: "inline-flex",
//     alignItems: "center",
//     padding: "6px 10px",
//     borderRadius: 999,
//     fontSize: 12,
//     fontWeight: 950,
//     background: bg,
//     color,
//     border: "1px solid rgba(17, 24, 39, 0.08)",
//     width: "fit-content",
//     whiteSpace: "nowrap",
//   });

//   const verificationPillStyle = useMemo(() => {
//     return (s: VerificationStatus) => {
//       if (s === "VERIFIED") return statusPill("#ECFDF5", "#065F46");
//       if (s === "PENDING_REVIEW") return statusPill("#EFF6FF", "#1D4ED8");
//       if (s === "REJECTED") return statusPill("#FEF2F2", "#991B1B");
//       return statusPill("#F3F4F6", "#374151"); // PENDING_UPLOAD / default
//     };
//   }, []);

//   const toastBox = (type: "error" | "success"): React.CSSProperties => ({
//     marginTop: 8,
//     padding: "10px 12px",
//     borderRadius: 14,
//     fontWeight: 900,
//     fontSize: 13,
//     border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//     background: type === "error" ? "#FEF2F2" : "#F0FDF4",
//     color: type === "error" ? "#991B1B" : "#166534",
//     overflowWrap: "anywhere",
//     wordBreak: "break-word",
//   });

//   const paginationWrap: React.CSSProperties = {
//     marginTop: 18,
//     display: "grid",
//     justifyItems: "center",
//     gap: 8,
//   };

//   const paginationRow: React.CSSProperties = {
//     display: "flex",
//     justifyContent: "center",
//     gap: 10,
//     flexDirection: isMobile ? "column" : "row",
//     width: isMobile ? "100%" : "auto",
//   };

//   const totalResults = pageData?.totalElements ?? 0;

//   return (
//     <div style={pageOuter}>
//       <div style={container}>
//         <div style={topBar}>
//           {onBack && (
//             <button type="button" onClick={onBack} style={btn}>
//               ← Back to all auctions
//             </button>
//           )}

//           <div style={{ display: "grid", gap: 6, width: isMobile ? "100%" : "auto" }}>
//             <h1 style={titleStyle}>My Pending Auctions</h1>
//           </div>

//           <div style={topRight}>
//             <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>
//               {loading ? "Loading..." : `${totalResults} results`}
//             </span>

//             <div style={ddWrap}>
//               <button
//                 type="button"
//                 data-sort-btn="true"
//                 ref={sortBtnRef}
//                 onClick={(e) => toggleSort(e.currentTarget)}
//                 style={pillBtn}
//                 title="Sort"
//               >
//                 ↕ Sort
//               </button>

//               {sortOpen && (
//                 <div data-sort-dd="true" style={ddPanelStyle()} role="dialog" aria-modal="false">
//                   <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
//                     <div style={{ fontWeight: 950, color: "#111827" }}>Sort</div>
//                     <button
//                       type="button"
//                       onClick={closeSort}
//                       style={{
//                         width: 36,
//                         height: 36,
//                         borderRadius: 10,
//                         border: "1px solid rgba(17,24,39,0.12)",
//                         background: "#FFFFFF",
//                         cursor: "pointer",
//                         fontWeight: 950,
//                       }}
//                       aria-label="Close sort"
//                     >
//                       ✕
//                     </button>
//                   </div>

//                   <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
//                     <div style={selectWrap}>
//                       <span style={{ fontSize: 14, opacity: 0.7 }}>🗂</span>
//                       <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
//                         <option value="endDate">End date</option>
//                         <option></option>
//                         <option value="startingAmount">Starting amount</option>
//                         <option value="minBidIncrement">Min bid increment</option>
//                         <option value="title">Title</option>
//                       </select>
//                     </div>

//                     <div style={selectWrap}>
//                       <span style={{ fontSize: 14, opacity: 0.7 }}>↕</span>
//                       <select
//                         value={direction}
//                         onChange={(e) => setDirection(e.target.value === "desc" ? "desc" : "asc")}
//                         style={selectStyle}
//                       >
//                         <option value="asc">Ascending</option>
//                         <option value="desc">Descending</option>
//                       </select>
//                     </div>

//                     <div style={stickyFooter}>
//                       <button
//                         type="button"
//                         onClick={() => void handleSortApply()}
//                         disabled={loading}
//                         style={loading ? disabledPrimaryBtnFull : primaryBtnFull}
//                       >
//                         Apply sort
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <button
//               type="button"
//               onClick={() => void loadAuctions(page)}
//               disabled={loading}
//               style={loading ? { ...btnBase, opacity: 0.6, cursor: "not-allowed" } : btnBase}
//               title="Refresh"
//             >
//               ↻
//             </button>
//           </div>
//         </div>

//         {error && <div style={toastBox("error")}>Error: {error}</div>}

//         {pageData && (
//           <>
//             <div style={grid}>
//               {pageData.content.map((auction) => {
//                 const timeRemaining = formatTimeRemaining(auction.endDate);
//                 const city = extractCity(auction.sellerLocation ?? "");
//                 const optimistic = optimisticVerificationStatus[auction.id];

//                 const verificationStatus: VerificationStatus =
//                   (optimistic ?? auction.verificationStatus ?? "PENDING_UPLOAD") as VerificationStatus;

//                 const canUpload = verificationStatus === "PENDING_UPLOAD" || verificationStatus === "REJECTED";
//                 const canDelete = verificationStatus === "PENDING_REVIEW";
//                 const isThisVerifying = verifyingAuctionId === auction.id;

//                 return (
//                   <div key={auction.id} style={card}>
//                     <div style={imgWrap}>
//                       {auction.mainImageUrl ? (
//                         <img
//                           src={auction.mainImageUrl}
//                           alt={auction.title}
//                           style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
//                         />
//                       ) : (
//                         <div
//                           style={{
//                             width: "100%",
//                             height: "100%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: "#6B7280",
//                             fontWeight: 900,
//                           }}
//                         >
//                           No image
//                         </div>
//                       )}

//                       <div style={badgeLeft}>
//                         <span style={{ opacity: 0.85 }}>⏱</span>
//                         <span style={{ color: timeRemaining === "Expired" ? "#DC2626" : "#111827" }}>
//                           {timeRemaining}
//                         </span>
//                       </div>

//                       {auction.categoryName ? <div style={badgeRight}>{auction.categoryName}</div> : null}
//                     </div>

//                     <div style={body}>
//                       <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
//                         <div style={auctionTitleText} title={auction.title}>
//                           {auction.title}
//                         </div>

//                         <div style={startingPriceLine}>
//                           Starting price:{" "}
//                           <span style={{ fontWeight: 950, color: "#111827" }}>{auction.startingAmount}€</span>
//                         </div>
//                       </div>

//                       <div style={metaRow}>
//                         <span>
//                           📍 <span style={{ fontWeight: 950, color: "#111827" }}>{city || "N/A"}</span>
//                         </span>

//                         <span>
//                           Min bid increment:{" "}
//                           <span style={{ fontWeight: 950, color: "#111827" }}>{auction.minBidIncrement}€</span>
//                         </span>

//                         <span style={statusPill("#F3F4F6", "#111827")}>{auction.status}</span>
//                       </div>

//                       <div style={line} />

//                       <div style={{ fontSize: 13, color: "#4B5563", fontWeight: 800, lineHeight: 1.35 }}>
//                         {auction.shortDescription}
//                       </div>

//                       <div style={smallBox}>
//                         <div style={verificationHeaderRow}>
//                           <div style={{ display: "grid", gap: 6, minWidth: 0, flex: "1 1 220px" }}>
//                             <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//                               <div style={{ fontWeight: 950, color: "#111827" }}>Verification</div>
//                               <span style={verificationPillStyle(verificationStatus)}>
//                                 {formatVerificationStatus(verificationStatus)}
//                               </span>
//                             </div>

//                             <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                               {verificationHelperText(verificationStatus)}
//                             </div>
//                           </div>

//                           {canUpload ? (
//                             <button
//                               type="button"
//                               onClick={() => void handleStartVerification(auction.id)}
//                               disabled={verificationLoading || instructionLoading}
//                               style={
//                                 isMobile
//                                   ? verificationLoading || instructionLoading
//                                     ? disabledPrimaryBtnFullWrap
//                                     : primaryBtnFullWrap
//                                   : verificationLoading || instructionLoading
//                                     ? { ...primaryBtnWrap, opacity: 0.55, cursor: "not-allowed" }
//                                     : primaryBtnWrap
//                               }
//                             >
//                               {verificationStatus === "REJECTED" ? "Re-upload verification" : "Start verification"}
//                             </button>
//                           ) : canDelete ? (
//                             <button
//                               type="button"
//                               onClick={() => void handleDeleteVerification(auction.id)}
//                               disabled={verificationLoading || instructionLoading}
//                               style={
//                                 isMobile
//                                   ? verificationLoading || instructionLoading
//                                     ? disabledDangerBtnFullWrap
//                                     : dangerBtnFullWrap
//                                   : verificationLoading || instructionLoading
//                                     ? { ...dangerBtnWrap, opacity: 0.55, cursor: "not-allowed" }
//                                     : dangerBtnWrap
//                               }
//                             >
//                               {verificationLoading ? "Deleting..." : "Delete verification video"}
//                             </button>
//                           ) : (
//                             <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>Verified</div>
//                           )}
//                         </div>

//                         {isThisVerifying && canUpload && (
//                           <div
//                             style={{
//                               marginTop: 10,
//                               background: "rgba(255,255,255,0.75)",
//                               borderRadius: 14,
//                               border: "1px dashed rgba(17,24,39,0.18)",
//                               padding: 12,
//                               display: "grid",
//                               gap: 10,
//                             }}
//                           >
//                             <div style={{ fontWeight: 950, color: "#111827" }}>Instructions</div>

//                             {instructionLoading && (
//                               <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>
//                                 Loading duration...
//                               </div>
//                             )}

//                             {!instructionLoading && verificationInstruction && (
//                               <>
//                                 <div
//                                   style={{
//                                     whiteSpace: "pre-wrap",
//                                     fontSize: 12,
//                                     color: "#374151",
//                                     fontWeight: 800,
//                                     lineHeight: 1.5,
//                                   }}
//                                 >
//                                   {verificationInstruction.text}
//                                 </div>

//                                 <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>
//                                   Duration must be exactly: {verificationInstruction.maxDurationSeconds}s
//                                 </div>

//                                 <div style={{ display: "grid", gap: 6 }}>
//                                   <div style={{ fontSize: 12, color: "#111827", fontWeight: 900 }}>
//                                     Select video file
//                                   </div>

//                                   {/* ✅ Hidden real input */}
//                                   <input
//                                     ref={fileInputRef}
//                                     type="file"
//                                     accept="video/*"
//                                     onChange={handleFileChange}
//                                     disabled={verificationLoading}
//                                     style={{ display: "none" }}
//                                   />

//                                   {/* ✅ Custom UI: filename safe + X κάτω από το filename */}
//                                   <div style={filePickerRow}>
//                                     <button
//                                       type="button"
//                                       onClick={openFilePicker}
//                                       disabled={verificationLoading}
//                                       style={
//                                         verificationLoading
//                                           ? { ...filePickBtn, opacity: 0.55, cursor: "not-allowed" }
//                                           : filePickBtn
//                                       }
//                                     >
//                                       Choose file
//                                     </button>

//                                     <div style={fileNameStack}>
//                                       <div
//                                         style={fileNamePill}
//                                         title={verificationFile?.name ?? "No file selected"}
//                                       >
//                                         {verificationFile
//                                           ? formatFileNameForUI(verificationFile.name, 26)
//                                           : "No file selected"}
//                                       </div>

//                                       {verificationFile && (
//                                         <button
//                                           type="button"
//                                           onClick={clearSelectedFile}
//                                           disabled={verificationLoading}
//                                           aria-label="Cancel selected video"
//                                           title="Cancel selected video"
//                                           style={
//                                             verificationLoading
//                                               ? { ...fileClearUnderBtn, opacity: 0.55, cursor: "not-allowed" }
//                                               : fileClearUnderBtn
//                                           }
//                                         >
//                                           ✕ Cancel video
//                                         </button>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>

//                                 <button
//                                   type="button"
//                                   onClick={() => void handleUploadVerification()}
//                                   disabled={verificationLoading || verificationFile === null}
//                                   style={
//                                     verificationLoading || verificationFile === null
//                                       ? disabledPrimaryBtnFullWrap
//                                       : primaryBtnFullWrap
//                                   }
//                                 >
//                                   {verificationLoading ? "Uploading..." : "Upload verification video"}
//                                 </button>
//                               </>
//                             )}

//                             {verificationError && <div style={toastBox("error")}>{verificationError}</div>}
//                             {verificationMessage && <div style={toastBox("success")}>{verificationMessage}</div>}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div style={paginationWrap}>
//               <div style={paginationRow}>
//                 <button type="button" onClick={handlePrevPage} disabled={loading || !pageData || pageData.first} style={btn}>
//                   ← Previous
//                 </button>
//                 <button type="button" onClick={handleNextPage} disabled={loading || !pageData || pageData.last} style={btn}>
//                   Next →
//                 </button>
//               </div>

//               <div style={{ color: "#6B7280", fontWeight: 900, fontSize: 12, textAlign: "center" }}>
//                 Page <strong style={{ color: "#111827" }}>{page + 1}</strong> of{" "}
//                 <strong style={{ color: "#111827" }}>{Math.max(pageData.totalPages, 1)}</strong>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyPendingAuctionsPage;

// src/components/MyPendingAuctionsPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AuctionListItem, SpringPage, VerificationStatus } from "../models/Springboot/Auction";
import { getMyPendingAuctions } from "../api/Springboot/backendAuctionService";
import {
  uploadVerificationVideo,
  deleteVerificationVideo,
  getVerificationVideoDuration,
} from "../api/Springboot/backendVerificationService";

type SortDirection = "asc" | "desc";
type PageToastType = "success" | "error";

type PendingNavState = {
  pageToast?: { type: PageToastType; msg: string };
  createdAuctionId?: number;
};

// Αν το backend επιστρέφει verificationStatus μαζί με το list item, το κρατάμε optional
type AuctionWithVerification = AuctionListItem & {
  verificationStatus?: VerificationStatus;
  verificationVideoUrl?: string | null;
};

interface MyPendingAuctionsPageProps {
  onBack?: () => void;
}

// Τοπικός τύπος για οδηγίες verification (UI μόνο)
interface LocalVerificationInstruction {
  maxDurationSeconds: number;
  text: string;
}

const makeInstructionText = (durationText: string): string =>
  `Send a video of duration ${durationText} that clearly shows the product is authentic and works properly.

• If it’s an electronic device (e.g., PC, console, phone), open a few apps or games and show the screen working.
• If it’s a collectible item, show the product from all sides (front, back, top, bottom) and zoom in on key details such as serial numbers or signs of wear.
• Make sure the lighting and audio are as clear as possible.
• The video must not be cut or edited.
• The auction description must match what is shown in the video.`;

const durationToText = (seconds: number): string => {
  if (seconds === 60) return "1 minute";
  return `${seconds} seconds`;
};

const extractCity = (sellerLocation: string): string => {
  const parts = sellerLocation.split(",").map((p) => p.trim());
  if (parts.length === 0) return "";
  return parts[0] ?? "";
};

// ✅ Smart truncate για μεγάλα filenames (χωρίς αλλαγή λογικής upload)
const formatFileNameForUI = (name: string, maxLen = 26): string => {
  const clean = (name ?? "").trim();
  if (!clean) return "No file selected";

  const dot = clean.lastIndexOf(".");
  const hasExt = dot > 0 && dot < clean.length - 1;
  const ext = hasExt ? clean.slice(dot) : "";
  const base = hasExt ? clean.slice(0, dot) : clean;

  if (clean.length <= maxLen) return clean;

  const extLen = ext.length;
  const available = Math.max(10, maxLen - extLen);

  const head = Math.max(6, Math.floor(available * 0.55));
  const tail = Math.max(4, available - head - 1);

  const left = base.slice(0, head);
  const right = base.slice(-tail);

  return `${left}…${right}${ext}`;
};

const MyPendingAuctionsPage: React.FC<MyPendingAuctionsPageProps> = ({ onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // -----------------------------
  // ✅ LOCAL TOAST (ΜΕΣΑ στη σελίδα, όχι overlay)
  // -----------------------------
  const [pageToast, setPageToast] = useState<{ type: PageToastType; msg: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const clearToastTimer = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  const closeLocalToast = () => {
    clearToastTimer();
    setPageToast(null);
  };

  const showLocalToast = (type: PageToastType, msg: string, autoMs = 4500) => {
    clearToastTimer();
    setPageToast({ type, msg });
    toastTimerRef.current = window.setTimeout(() => closeLocalToast(), autoMs);
  };

  useEffect(() => {
    return () => clearToastTimer();
  }, []);

  // ✅ Αν ήρθαμε από App.tsx με toast state, δείξ’ το εδώ (μια φορά)
  const consumedNavStateRef = useRef(false);
  useEffect(() => {
    if (consumedNavStateRef.current) return;
    consumedNavStateRef.current = true;

    const state = (location.state as PendingNavState | null) ?? null;
    if (state?.pageToast?.msg) {
      showLocalToast(state.pageToast.type ?? "success", state.pageToast.msg);

      // καθάρισε το state για να μην ξαναεμφανιστεί
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navigate]);

  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] = useState<SpringPage<AuctionWithVerification> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sort state
  const [sortBy, setSortBy] = useState<string>("endDate");
  const [direction, setDirection] = useState<SortDirection>("asc");

  // ✅ Responsive breakpoints (design του 1ου)
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

  // real-time time remaining
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // ---------- SORT dropdown (design του 1ου) ----------
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [sortFlip, setSortFlip] = useState<boolean>(false);
  const [sortMaxH, setSortMaxH] = useState<number>(520);
  const sortBtnRef = useRef<HTMLButtonElement | null>(null);

  const computeSortLayout = (rect: DOMRect) => {
    const margin = 12;
    const gap = 10;

    const belowTop = rect.bottom + gap;
    const availableBelow = window.innerHeight - belowTop - margin;
    const availableAbove = rect.top - gap - margin;

    const flip = availableBelow < 260 && availableAbove > availableBelow;

    const rawMax = Math.max(220, Math.floor(flip ? availableAbove : availableBelow));
    const maxH = Math.min(rawMax, Math.floor(window.innerHeight * 0.82));

    return { flip, maxH };
  };

  const toggleSort = (btnEl: HTMLButtonElement | null) => {
    if (!btnEl) return;
    sortBtnRef.current = btnEl;

    setSortOpen((prev) => {
      const next = !prev;
      if (next) {
        const r = btnEl.getBoundingClientRect();
        const layout = computeSortLayout(r);
        setSortFlip(layout.flip);
        setSortMaxH(layout.maxH);
      }
      return next;
    });
  };

  const closeSort = () => setSortOpen(false);

  // outside click + esc
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!sortOpen) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const insideDrop = target.closest("[data-sort-dd='true']");
      const insideBtn = target.closest("[data-sort-btn='true']");
      if (insideDrop || insideBtn) return;

      closeSort();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSort();
    };

    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [sortOpen]);

  // ✅ Recompute ONLY on resize (not on scroll) -> no shaking
  useEffect(() => {
    if (!sortOpen) return;

    const onResize = () => {
      const btn = sortBtnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const layout = computeSortLayout(r);
      setSortFlip(layout.flip);
      setSortMaxH(layout.maxH);
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [sortOpen]);

  // ---------- VERIFICATION (λογική του 2ου) ----------
  const [verifyingAuctionId, setVerifyingAuctionId] = useState<number | null>(null);
  const [verificationInstruction, setVerificationInstruction] = useState<LocalVerificationInstruction | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const [instructionLoading, setInstructionLoading] = useState<boolean>(false);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // optimistic map (για να φαίνεται άμεσα το status μετά από upload/delete)
  const [optimisticVerificationStatus, setOptimisticVerificationStatus] =
    useState<Record<number, VerificationStatus>>({});

  // ✅ Custom file picker (hide native "Choose file")
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openFilePicker = () => {
    if (verificationLoading) return;
    fileInputRef.current?.click();
  };

  // ✅ Cancel selected file BEFORE upload (X κάτω από το filename)
  const clearSelectedFile = () => {
    setVerificationFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setVerificationError(null);
    setVerificationMessage(null);
  };

  const formatTimeRemaining = (endDateStr: string): string => {
    const end = new Date(endDateStr);
    const diffMs = end.getTime() - now.getTime();

    if (Number.isNaN(end.getTime()) || diffMs <= 0) return "Expired";

    let totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds -= days * 24 * 3600;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  };

  const formatVerificationStatus = (status: VerificationStatus): string => {
    switch (status) {
      case "PENDING_UPLOAD":
        return "Pending upload";
      case "PENDING_REVIEW":
        return "Pending review";
      case "VERIFIED":
        return "Verified ✅";
      case "REJECTED":
        return "Rejected ❌";
      default:
        return status;
    }
  };

  const verificationHelperText = (status: VerificationStatus): string => {
    if (status === "PENDING_REVIEW") return "The video has been submitted and is under review by the admin.";
    if (status === "VERIFIED") return "This auction has already been verified.";
    if (status === "REJECTED") return "Verification was rejected. You can upload a new video.";
    return "No verification video has been uploaded yet.";
  };

  const loadAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

      const result = await getMyPendingAuctions({
        page: pageToLoad,
        size: 30,
        sortBy: sortBy || undefined,
        direction: direction || undefined,
      });

      setPageData(result as SpringPage<AuctionWithVerification>);
      setPage(pageToLoad);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // αρχικό load
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

  const handleSortApply = async () => {
    await loadAuctions(0);
    closeSort();
  };

  const handleStartVerification = async (auctionId: number) => {
    setVerifyingAuctionId(auctionId);

    // reset UI
    setVerificationFile(null);
    setVerificationInstruction(null);
    setVerificationError(null);
    setVerificationMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setInstructionLoading(true);
    try {
      const dto = await getVerificationVideoDuration(auctionId);
      const seconds = Number((dto as { duration?: unknown }).duration);

      if (!Number.isFinite(seconds) || seconds <= 0) {
        throw new Error("Invalid duration returned. Please contact BidNow");
      }

      const durationText = durationToText(seconds);
      setVerificationInstruction({
        maxDurationSeconds: seconds,
        text: makeInstructionText(durationText),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Could not retrieve the required video duration. Please contact Bidnow.";
      setVerificationError(msg);
    } finally {
      setInstructionLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setVerificationFile(file);
  };

  const handleUploadVerification = async () => {
    if (verifyingAuctionId === null) return;

    if (verificationFile === null) {
      setVerificationError("Please select a video file first.");
      return;
    }

    setVerificationLoading(true);
    setVerificationError(null);
    setVerificationMessage(null);

    try {
      await uploadVerificationVideo(verifyingAuctionId, verificationFile);

      setVerificationMessage("The video was uploaded successfully. Your auction will be reviewed by the administrator.");

      // optimistic -> PENDING_REVIEW
      setOptimisticVerificationStatus((prev) => ({
        ...prev,
        [verifyingAuctionId]: "PENDING_REVIEW",
      }));

      setVerifyingAuctionId(null);
      setVerificationInstruction(null);
      setVerificationFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      void loadAuctions(page);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const msg =
        err instanceof Error && err.message ? err.message : "Something went wrong while uploading the video.";
      setVerificationError(msg);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleDeleteVerification = async (auctionId: number) => {
    setVerificationLoading(true);
    setVerificationError(null);
    setVerificationMessage(null);

    try {
      await deleteVerificationVideo(auctionId);

      setVerificationMessage("The video was deleted. You can upload a new one.");

      // optimistic -> PENDING_UPLOAD
      setOptimisticVerificationStatus((prev) => ({
        ...prev,
        [auctionId]: "PENDING_UPLOAD",
      }));

      // κλείσε τυχόν ανοιχτό panel
      setVerifyingAuctionId(null);
      setVerificationInstruction(null);
      setVerificationFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      void loadAuctions(page);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const msg =
        err instanceof Error && err.message ? err.message : "Something went wrong while deleting the video.";
      setVerificationError(msg);
    } finally {
      setVerificationLoading(false);
    }
  };

  // -----------------------------
  // ✅ Styles (design του 1ου)
  // -----------------------------
  const pageOuter: React.CSSProperties = {
    width: "100%",
    minHeight: "100vh",
    background: "#F5F6F8",
  };

  const container: React.CSSProperties = {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    padding: isMobile ? "12px 12px 22px" : isTablet ? "16px 16px 28px" : "18px 24px 40px",
    boxSizing: "border-box",
  };

  const topBar: React.CSSProperties = {
    display: "flex",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    gap: isMobile ? 10 : 16,
    padding: "8px 0 12px",
    flexDirection: isMobile ? "column" : "row",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: isMobile ? 24 : isTablet ? 28 : 32,
    fontWeight: 900,
    color: "#111827",
    lineHeight: 1.05,
  };

  const btnBase: React.CSSProperties = {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    padding: "0 12px",
  };

  const btn: React.CSSProperties = { ...btnBase, width: isMobile ? "100%" : "auto" };

  const pillBtn: React.CSSProperties = {
    ...btnBase,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
    width: isMobile ? "100%" : "auto",
  };

  const primaryBtn: React.CSSProperties = {
    ...btnBase,
    height: 44,
    background: "#0B1220",
    color: "#FFFFFF",
    border: "1px solid #0B1220",
    whiteSpace: "nowrap",
  };

  const dangerBtn: React.CSSProperties = {
    ...btnBase,
    height: 44,
    background: "#FFFFFF",
    color: "#991B1B",
    border: "1px solid rgba(220, 38, 38, 0.35)",
    whiteSpace: "nowrap",
  };

  const primaryBtnFull: React.CSSProperties = { ...primaryBtn, width: "100%" };
  const disabledPrimaryBtnFull: React.CSSProperties = { ...primaryBtnFull, opacity: 0.55, cursor: "not-allowed" };
  const dangerBtnFull: React.CSSProperties = { ...dangerBtn, width: "100%" };
  const disabledDangerBtnFull: React.CSSProperties = { ...dangerBtnFull, opacity: 0.55, cursor: "not-allowed" };

  // --- Wrap-safe buttons (για verification / στενές κάρτες) ---
  const primaryBtnWrap: React.CSSProperties = {
    ...primaryBtn,
    height: "auto",
    padding: "10px 12px",
    whiteSpace: "normal",
    lineHeight: 1.15,
    maxWidth: "100%",
    boxSizing: "border-box",
  };

  const dangerBtnWrap: React.CSSProperties = {
    ...dangerBtn,
    height: "auto",
    padding: "10px 12px",
    whiteSpace: "normal",
    lineHeight: 1.15,
    maxWidth: "100%",
    boxSizing: "border-box",
  };

  const primaryBtnFullWrap: React.CSSProperties = { ...primaryBtnWrap, width: "100%" };
  const disabledPrimaryBtnFullWrap: React.CSSProperties = {
    ...primaryBtnFullWrap,
    opacity: 0.55,
    cursor: "not-allowed",
  };

  const dangerBtnFullWrap: React.CSSProperties = { ...dangerBtnWrap, width: "100%" };
  const disabledDangerBtnFullWrap: React.CSSProperties = {
    ...dangerBtnFullWrap,
    opacity: 0.55,
    cursor: "not-allowed",
  };

  // --- Title χωρίς ellipsis + safe wrapping ---
  const auctionTitleText: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 950,
    color: "#111827",
    lineHeight: 1.2,
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  };

  const startingPriceLine: React.CSSProperties = {
    marginTop: 4,
    fontSize: 12.5,
    color: "#6B7280",
    fontWeight: 900,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  };

  // --- Verification top row να μη overflow ---
  const verificationHeaderRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    gap: 10,
    flexDirection: isMobile ? "column" : "row",
    flexWrap: isMobile ? "nowrap" : "wrap",
  };

  // --- Custom file picker (ίδιο design, μόνο fix overflow + X κάτω) ---
  const filePickerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: isMobile ? "wrap" : "nowrap",
    width: "100%",
    maxWidth: "100%",
  };

  const filePickBtn: React.CSSProperties = {
    ...btnBase,
    height: 42,
    borderRadius: 12,
    fontWeight: 950,
    whiteSpace: "nowrap",
    flex: "0 0 auto",
    maxWidth: "100%",
  };

  const fileNameStack: React.CSSProperties = {
    flex: "1 1 0",
    minWidth: 0,
    display: "grid",
    gap: 6,
    width: "100%",
    maxWidth: "100%",
  };

  const fileNamePill: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#FFFFFF",
    fontSize: 12,
    fontWeight: 900,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };

  const fileClearUnderBtn: React.CSSProperties = {
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(220, 38, 38, 0.35)",
    background: "#FFFFFF",
    color: "#991B1B",
    fontWeight: 950,
    fontSize: 12,
    padding: "0 10px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    width: "fit-content",
    maxWidth: "100%",
    boxSizing: "border-box",
  };

  const topRight: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: isMobile ? "space-between" : "flex-end",
    width: isMobile ? "100%" : "auto",
    flexWrap: "wrap",
  };

  const ddWrap: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    width: isMobile ? "100%" : "auto",
  };

  const ddPanelStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      zIndex: 5000,
      borderRadius: 14,
      background: "#FFFFFF",
      border: "1px solid rgba(17,24,39,0.12)",
      boxShadow: "0 22px 70px rgba(0,0,0,0.22)",
      padding: 12,
      overflowY: "auto",
      maxHeight: sortMaxH,
      boxSizing: "border-box",
    };

    if (isMobile) {
      return {
        ...base,
        left: 0,
        right: 0,
        width: "100%",
        ...(sortFlip ? { bottom: "calc(100% + 10px)" } : { top: "calc(100% + 10px)" }),
      };
    }

    return {
      ...base,
      right: 0,
      width: "min(420px, 92vw)",
      ...(sortFlip ? { bottom: "calc(100% + 10px)" } : { top: "calc(100% + 10px)" }),
    };
  };

  const selectWrap: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#F3F4F6",
    border: "1px solid rgba(17, 24, 39, 0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13,
    fontWeight: 800,
    color: "#111827",
  };

  const stickyFooter: React.CSSProperties = {
    position: "sticky",
    bottom: 0,
    background: "#FFFFFF",
    paddingTop: 10,
    marginTop: 10,
    borderTop: "1px solid rgba(17,24,39,0.08)",
  };

  const grid: React.CSSProperties = {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
    gap: isMobile ? 12 : 16,
  };

  const card: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid rgba(17, 24, 39, 0.08)",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
    display: "flex",
    flexDirection: "column",
  };

  const imgWrap: React.CSSProperties = {
    position: "relative",
    height: CARD_IMAGE_HEIGHT,
    background: "#E5E7EB",
  };

  const badgeLeft: React.CSSProperties = {
    position: "absolute",
    top: 10,
    left: 10,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: isMobile ? "5px 9px" : "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(17, 24, 39, 0.10)",
    fontSize: isMobile ? 11.5 : 12,
    fontWeight: 900,
    color: "#111827",
    maxWidth: "calc(100% - 20px)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const badgeRight: React.CSSProperties = {
    position: "absolute",
    top: 10,
    right: 10,
    padding: isMobile ? "5px 9px" : "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(17, 24, 39, 0.10)",
    fontSize: isMobile ? 11.5 : 12,
    fontWeight: 900,
    color: "#111827",
    maxWidth: "calc(100% - 20px)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const body: React.CSSProperties = {
    padding: isMobile ? 12 : 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  const metaRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: 900,
    flexWrap: "wrap",
  };

  const line: React.CSSProperties = {
    height: 1,
    background: "rgba(17,24,39,0.06)",
    margin: "2px 0",
  };

  const smallBox: React.CSSProperties = {
    marginTop: 2,
    background: "#EEF2FF",
    border: "1px solid rgba(37, 99, 235, 0.20)",
    borderRadius: 14,
    padding: 10,
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
    border: "1px solid rgba(17, 24, 39, 0.08)",
    width: "fit-content",
    whiteSpace: "nowrap",
  });

  const verificationPillStyle = useMemo(() => {
    return (s: VerificationStatus) => {
      if (s === "VERIFIED") return statusPill("#ECFDF5", "#065F46");
      if (s === "PENDING_REVIEW") return statusPill("#EFF6FF", "#1D4ED8");
      if (s === "REJECTED") return statusPill("#FEF2F2", "#991B1B");
      return statusPill("#F3F4F6", "#374151"); // PENDING_UPLOAD / default
    };
  }, []);

  const toastBox = (type: "error" | "success"): React.CSSProperties => ({
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 14,
    fontWeight: 900,
    fontSize: 13,
    border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
    background: type === "error" ? "#FEF2F2" : "#F0FDF4",
    color: type === "error" ? "#991B1B" : "#166534",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  });

  const paginationWrap: React.CSSProperties = {
    marginTop: 18,
    display: "grid",
    justifyItems: "center",
    gap: 8,
  };

  const paginationRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexDirection: isMobile ? "column" : "row",
    width: isMobile ? "100%" : "auto",
  };

  const totalResults = pageData?.totalElements ?? 0;

  return (
    <div style={pageOuter}>
      <div style={container}>
        <div style={topBar}>
          {onBack && (
            <button type="button" onClick={onBack} style={btn}>
              ← Back to all auctions
            </button>
          )}

          <div style={{ display: "grid", gap: 6, width: isMobile ? "100%" : "auto" }}>
            <h1 style={titleStyle}>My Pending Auctions</h1>
          </div>

          <div style={topRight}>
            <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>
              {loading ? "Loading..." : `${totalResults} results`}
            </span>

            <div style={ddWrap}>
              <button
                type="button"
                data-sort-btn="true"
                ref={sortBtnRef}
                onClick={(e) => toggleSort(e.currentTarget)}
                style={pillBtn}
                title="Sort"
              >
                ↕ Sort
              </button>

              {sortOpen && (
                <div data-sort-dd="true" style={ddPanelStyle()} role="dialog" aria-modal="false">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div style={{ fontWeight: 950, color: "#111827" }}>Sort</div>
                    <button
                      type="button"
                      onClick={closeSort}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        border: "1px solid rgba(17,24,39,0.12)",
                        background: "#FFFFFF",
                        cursor: "pointer",
                        fontWeight: 950,
                      }}
                      aria-label="Close sort"
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                    <div style={selectWrap}>
                      <span style={{ fontSize: 14, opacity: 0.7 }}>🗂</span>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
                        <option value="endDate">End date</option>
                        <option></option>
                        <option value="startingAmount">Starting amount</option>
                        <option value="minBidIncrement">Min bid increment</option>
                        <option value="title">Title</option>
                      </select>
                    </div>

                    <div style={selectWrap}>
                      <span style={{ fontSize: 14, opacity: 0.7 }}>↕</span>
                      <select
                        value={direction}
                        onChange={(e) => setDirection(e.target.value === "desc" ? "desc" : "asc")}
                        style={selectStyle}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>

                    <div style={stickyFooter}>
                      <button
                        type="button"
                        onClick={() => void handleSortApply()}
                        disabled={loading}
                        style={loading ? disabledPrimaryBtnFull : primaryBtnFull}
                      >
                        Apply sort
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => void loadAuctions(page)}
              disabled={loading}
              style={loading ? { ...btnBase, opacity: 0.6, cursor: "not-allowed" } : btnBase}
              title="Refresh"
            >
              ↻
            </button>
          </div>
        </div>

        {/* ✅ Local toast banner (ΔΕΝ καλύπτει header / κουμπιά) */}
        {pageToast && (
          <div
            style={{
              marginTop: 10,
              marginBottom: 10,
              padding: "12px 12px",
              borderRadius: 16,
              border: `1px solid ${pageToast.type === "error" ? "#FCA5A5" : "#86EFAC"}`,
              background: pageToast.type === "error" ? "#FEF2F2" : "#F0FDF4",
              color: pageToast.type === "error" ? "#991B1B" : "#166534",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
            role="status"
            aria-live="polite"
          >
            <div
              style={{
                lineHeight: 1.35,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap", // ✅ για να δουλεύουν τα \n και να φαίνονται bullets σε νέες γραμμές
              }}
            >
                {pageToast.msg}
            </div>

            <button
              type="button"
              onClick={closeLocalToast}
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                border: "1px solid rgba(17,24,39,0.12)",
                background: "rgba(255,255,255,0.8)",
                cursor: "pointer",
                fontWeight: 950,
                fontSize: 18,
                display: "grid",
                placeItems: "center",
                padding: 0,
                lineHeight: 1,
                flex: "0 0 auto",
              }}
              aria-label="Close"
              title="Close"
            >
              <span style={{ display: "block", lineHeight: 1, transform: "translateY(-1px)" }}>✕</span>
            </button>
          </div>
        )}

        {error && <div style={toastBox("error")}>Error: {error}</div>}

        {pageData && (
          <>
            <div style={grid}>
              {pageData.content.map((auction) => {
                const timeRemaining = formatTimeRemaining(auction.endDate);
                const city = extractCity(auction.sellerLocation ?? "");
                const optimistic = optimisticVerificationStatus[auction.id];

                const verificationStatus: VerificationStatus =
                  (optimistic ?? auction.verificationStatus ?? "PENDING_UPLOAD") as VerificationStatus;

                const canUpload = verificationStatus === "PENDING_UPLOAD" || verificationStatus === "REJECTED";
                const canDelete = verificationStatus === "PENDING_REVIEW";
                const isThisVerifying = verifyingAuctionId === auction.id;

                return (
                  <div key={auction.id} style={card}>
                    <div style={imgWrap}>
                      {auction.mainImageUrl ? (
                        <img
                          src={auction.mainImageUrl}
                          alt={auction.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#6B7280",
                            fontWeight: 900,
                          }}
                        >
                          No image
                        </div>
                      )}

                      <div style={badgeLeft}>
                        <span style={{ opacity: 0.85 }}>⏱</span>
                        <span style={{ color: timeRemaining === "Expired" ? "#DC2626" : "#111827" }}>
                          {timeRemaining}
                        </span>
                      </div>

                      {auction.categoryName ? <div style={badgeRight}>{auction.categoryName}</div> : null}
                    </div>

                    <div style={body}>
                      <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                        <div style={auctionTitleText} title={auction.title}>
                          {auction.title}
                        </div>

                        <div style={startingPriceLine}>
                          Starting price:{" "}
                          <span style={{ fontWeight: 950, color: "#111827" }}>{auction.startingAmount}€</span>
                        </div>
                      </div>

                      <div style={metaRow}>
                        <span>
                          📍 <span style={{ fontWeight: 950, color: "#111827" }}>{city || "N/A"}</span>
                        </span>

                        <span>
                          Min bid increment:{" "}
                          <span style={{ fontWeight: 950, color: "#111827" }}>{auction.minBidIncrement}€</span>
                        </span>

                        <span style={statusPill("#F3F4F6", "#111827")}>{auction.status}</span>
                      </div>

                      <div style={line} />

                      <div style={{ fontSize: 13, color: "#4B5563", fontWeight: 800, lineHeight: 1.35 }}>
                        {auction.shortDescription}
                      </div>

                      <div style={smallBox}>
                        <div style={verificationHeaderRow}>
                          <div style={{ display: "grid", gap: 6, minWidth: 0, flex: "1 1 220px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              <div style={{ fontWeight: 950, color: "#111827" }}>Verification</div>
                              <span style={verificationPillStyle(verificationStatus)}>
                                {formatVerificationStatus(verificationStatus)}
                              </span>
                            </div>

                            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
                              {verificationHelperText(verificationStatus)}
                            </div>
                          </div>

                          {canUpload ? (
                            <button
                              type="button"
                              onClick={() => void handleStartVerification(auction.id)}
                              disabled={verificationLoading || instructionLoading}
                              style={
                                isMobile
                                  ? verificationLoading || instructionLoading
                                    ? disabledPrimaryBtnFullWrap
                                    : primaryBtnFullWrap
                                  : verificationLoading || instructionLoading
                                    ? { ...primaryBtnWrap, opacity: 0.55, cursor: "not-allowed" }
                                    : primaryBtnWrap
                              }
                            >
                              {verificationStatus === "REJECTED" ? "Re-upload verification" : "Start verification"}
                            </button>
                          ) : canDelete ? (
                            <button
                              type="button"
                              onClick={() => void handleDeleteVerification(auction.id)}
                              disabled={verificationLoading || instructionLoading}
                              style={
                                isMobile
                                  ? verificationLoading || instructionLoading
                                    ? disabledDangerBtnFullWrap
                                    : dangerBtnFullWrap
                                  : verificationLoading || instructionLoading
                                    ? { ...dangerBtnWrap, opacity: 0.55, cursor: "not-allowed" }
                                    : dangerBtnWrap
                              }
                            >
                              {verificationLoading ? "Deleting..." : "Delete verification video"}
                            </button>
                          ) : (
                            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>Verified</div>
                          )}
                        </div>

                        {isThisVerifying && canUpload && (
                          <div
                            style={{
                              marginTop: 10,
                              background: "rgba(255,255,255,0.75)",
                              borderRadius: 14,
                              border: "1px dashed rgba(17,24,39,0.18)",
                              padding: 12,
                              display: "grid",
                              gap: 10,
                            }}
                          >
                            <div style={{ fontWeight: 950, color: "#111827" }}>Instructions</div>

                            {instructionLoading && (
                              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>
                                Loading duration...
                              </div>
                            )}

                            {!instructionLoading && verificationInstruction && (
                              <>
                                <div
                                  style={{
                                    whiteSpace: "pre-wrap",
                                    fontSize: 12,
                                    color: "#374151",
                                    fontWeight: 800,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {verificationInstruction.text}
                                </div>

                                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 900 }}>
                                  Duration must be exactly: {verificationInstruction.maxDurationSeconds}s
                                </div>

                                <div style={{ display: "grid", gap: 6 }}>
                                  <div style={{ fontSize: 12, color: "#111827", fontWeight: 900 }}>
                                    Select video file
                                  </div>

                                  {/* ✅ Hidden real input */}
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    disabled={verificationLoading}
                                    style={{ display: "none" }}
                                  />

                                  {/* ✅ Custom UI: filename safe + X κάτω από το filename */}
                                  <div style={filePickerRow}>
                                    <button
                                      type="button"
                                      onClick={openFilePicker}
                                      disabled={verificationLoading}
                                      style={
                                        verificationLoading
                                          ? { ...filePickBtn, opacity: 0.55, cursor: "not-allowed" }
                                          : filePickBtn
                                      }
                                    >
                                      Choose file
                                    </button>

                                    <div style={fileNameStack}>
                                      <div style={fileNamePill} title={verificationFile?.name ?? "No file selected"}>
                                        {verificationFile
                                          ? formatFileNameForUI(verificationFile.name, 26)
                                          : "No file selected"}
                                      </div>

                                      {verificationFile && (
                                        <button
                                          type="button"
                                          onClick={clearSelectedFile}
                                          disabled={verificationLoading}
                                          aria-label="Cancel selected video"
                                          title="Cancel selected video"
                                          style={
                                            verificationLoading
                                              ? { ...fileClearUnderBtn, opacity: 0.55, cursor: "not-allowed" }
                                              : fileClearUnderBtn
                                          }
                                        >
                                          ✕ Cancel video
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => void handleUploadVerification()}
                                  disabled={verificationLoading || verificationFile === null}
                                  style={
                                    verificationLoading || verificationFile === null
                                      ? disabledPrimaryBtnFullWrap
                                      : primaryBtnFullWrap
                                  }
                                >
                                  {verificationLoading ? "Uploading..." : "Upload verification video"}
                                </button>
                              </>
                            )}

                            {verificationError && <div style={toastBox("error")}>{verificationError}</div>}
                            {verificationMessage && <div style={toastBox("success")}>{verificationMessage}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={paginationWrap}>
              <div style={paginationRow}>
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={loading || !pageData || pageData.first}
                  style={btn}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={loading || !pageData || pageData.last}
                  style={btn}
                >
                  Next →
                </button>
              </div>

              <div style={{ color: "#6B7280", fontWeight: 900, fontSize: 12, textAlign: "center" }}>
                Page <strong style={{ color: "#111827" }}>{page + 1}</strong> of{" "}
                <strong style={{ color: "#111827" }}>{Math.max(pageData.totalPages, 1)}</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPendingAuctionsPage;
