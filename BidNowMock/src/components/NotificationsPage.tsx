// // src/components/NotificationsPage.tsx

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getMyNotifications,
//   markNotificationAsRead,
// } from "../api/Springboot/backendNotificationService";

// import type {
//   NotificationDto,
//   NotificationPage,
// } from "../models/Springboot/Notification";

// interface NotificationsPageProps {
//   pageSize?: number;
// }

// type NotificationMetadata = {
//   auctionId?: number | string;
// };

// const safeParseJson = (s?: string | null): NotificationMetadata | null => {
//   if (!s) return null;
//   try {
//     const parsed: unknown = JSON.parse(s);
//     if (typeof parsed === "object" && parsed !== null) {
//       return parsed as NotificationMetadata;
//     }
//     return null;
//   } catch {
//     return null;
//   }
// };

// // ✅ Παίρνει το πρώτο κείμενο μέσα σε "..." ή “...”
// const extractQuotedText = (text: string): string | null => {
//   const m = text.match(/["“”]([^"“”]+)["“”]/);
//   if (!m) return null;
//   const v = m[1]?.trim();
//   return v && v.length > 0 ? v : null;
// };

// const NotificationsPage: React.FC<NotificationsPageProps> = ({ pageSize = 20 }) => {
//   const navigate = useNavigate();

//   const [pageData, setPageData] = useState<NotificationPage | null>(null);
//   const [page, setPage] = useState<number>(0);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const loadNotifications = async (pageOverride?: number) => {
//     const targetPage = typeof pageOverride === "number" ? pageOverride : page;

//     setLoading(true);
//     setError(null);

//     try {
//       const data = await getMyNotifications(targetPage, pageSize);
//       setPageData(data);
//       setPage(targetPage);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των ειδοποιήσεων.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadNotifications(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pageSize]);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     void loadNotifications(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     void loadNotifications(page + 1);
//   };

//   const formatDateTime = (iso: string): string => {
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     return d.toLocaleString();
//   };

//   const getAuctionIdFromNotification = (n: NotificationDto): number | null => {
//     const meta = safeParseJson(n.metadataJson);
//     const auctionId = meta?.auctionId;

//     if (auctionId === undefined || auctionId === null) return null;

//     const num = typeof auctionId === "number" ? auctionId : Number(auctionId);
//     return Number.isFinite(num) ? num : null;
//   };

//   const handleMarkAsRead = async (id: number) => {
//     try {
//       await markNotificationAsRead(id);

//       setPageData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           content: prev.content.map((n) => (n.id === id ? { ...n, read: true } : n)),
//         };
//       });
//     } catch (err: unknown) {
//       console.error(err);
//     }
//   };

//   // ✅ Buttons (όπως ζήτησες)
//   const btn = useMemo<React.CSSProperties>(
//     () => ({
//       height: 34,
//       borderRadius: 12,
//       border: "1px solid rgba(17, 24, 39, 0.12)",
//       background: "#FFFFFF",
//       fontWeight: 800,
//       fontSize: 13,
//       cursor: "pointer",
//       padding: "0 12px",
//       lineHeight: 1,
//       whiteSpace: "nowrap",
//       appearance: "none",
//     }),
//     []
//   );

//   const primaryBtn = useMemo<React.CSSProperties>(
//     () => ({
//       ...btn,
//       background: "#0B1220",
//       color: "#FFFFFF",
//       border: "1px solid #0B1220",
//     }),
//     [btn]
//   );

//   const ghostBtn = useMemo<React.CSSProperties>(
//     () => ({
//       ...btn,
//       background: "#FFFFFF",
//       color: "#0f172a",
//       border: "1px solid #e6e8ee",
//       fontWeight: 700,
//     }),
//     [btn]
//   );

//   return (
//     <div style={{ maxWidth: 860, margin: "0 auto", padding: "1rem" }}>
//       {/* ✅ CSS (πιο μικρές + πιο “3D/interactive” κάρτες) */}
//       <style>{`
//         .bn-card {
//           border-radius: 14px;
//           padding: 12px 14px;
//           margin-bottom: 10px;
//           border: 1px solid #e6e8ee;
//           background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
//           box-shadow: 0 2px 10px rgba(16,24,40,0.06);
//           display: flex;
//           justify-content: space-between;
//           gap: 12px;
//           transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, filter 160ms ease;
//           will-change: transform, box-shadow;
//         }

//         .bn-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 14px 30px rgba(16,24,40,0.12);
//           filter: saturate(1.02);
//         }

//         .bn-unread {
//           border-color: #ffd58a;
//           background: linear-gradient(180deg, #fffaf0 0%, #fff3df 100%);
//           box-shadow: 0 8px 18px rgba(255,173,51,0.14);
//         }

//         .bn-unread:hover {
//           box-shadow: 0 18px 36px rgba(255,173,51,0.18);
//         }

//         .bn-tag {
//           font-size: 12px;
//           font-weight: 900;
//           letter-spacing: 0.08em;
//           color: #475467;
//         }

//         .bn-title {
//           font-size: 16px;
//           font-weight: 900;
//           margin: 0 0 6px 0;
//           color: #0f172a;
//         }

//         .bn-body {
//           margin: 0;
//           color: #0f172a;
//           white-space: pre-line;
//           font-size: 14px;
//           line-height: 1.35;
//         }

//         .bn-actions {
//           margin-top: 10px;
//           display: flex;
//           gap: 10px;
//           flex-wrap: wrap;
//           align-items: center;
//         }

//         .bn-btn {
//           transition: transform 140ms ease, filter 140ms ease, box-shadow 140ms ease;
//         }

//         .bn-btn:hover {
//           transform: translateY(-1px);
//           filter: brightness(0.98);
//         }

//         .bn-btn:active {
//           transform: translateY(0px);
//           filter: brightness(0.96);
//         }
//       `}</style>

//       <div style={{ marginBottom: 12 }}>
//         <h1 style={{ margin: 0 }}>Notifications</h1>
//       </div>

//       {loading && <p>Φόρτωση...</p>}
//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

//       {pageData && (
//         <>
//           {pageData.content.length === 0 ? (
//             <p>Δεν υπάρχουν ειδοποιήσεις.</p>
//           ) : (
//             <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
//               {pageData.content.map((n) => {
//                 const announcement = n.notificationType === "GENERAL";
//                 const unread = !announcement && !n.read;

//                 // ✅ Announcement (μπλε)
//                 if (announcement) {
//                   return (
//                     <li
//                       key={n.id}
//                       className="bn-card"
//                       style={{
//                         border: "1px solid #cfe2ff",
//                         background: "linear-gradient(180deg, #eef4ff 0%, #f7faff 100%)",
//                       }}
//                     >
//                       <div style={{ flex: 1 }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
//                           <div
//                             style={{
//                               fontSize: 12,
//                               fontWeight: 900,
//                               letterSpacing: "0.08em",
//                               color: "#1d4ed8",
//                             }}
//                           >
//                             ANNOUNCEMENT
//                           </div>
//                         </div>

//                         <div className="bn-title">{n.title}</div>
//                         <p className="bn-body">{n.body}</p>
//                       </div>

//                       <div style={{ minWidth: 140, textAlign: "right", color: "#475467", fontSize: 12 }}>
//                         {formatDateTime(n.createdAt)}
//                       </div>
//                     </li>
//                   );
//                 }

//                 // ✅ Notification
//                 const auctionId = getAuctionIdFromNotification(n);
//                 const auctionTitle = extractQuotedText(n.body); // <-- αυτό που είναι μέσα στα ""

//                 return (
//                   <li key={n.id} className={`bn-card ${unread ? "bn-unread" : ""}`}>
//                     <div style={{ flex: 1 }}>
//                       <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
//                         <div className="bn-tag" style={{ color: unread ? "#b45309" : "#475467" }}>
//                           NOTIFICATION
//                         </div>

//                         {unread && (
//                           <span
//                             style={{
//                               fontSize: 12,
//                               padding: "3px 10px",
//                               borderRadius: 999,
//                               background: "#ffedd5",
//                               color: "#b45309",
//                               fontWeight: 900,
//                               border: "1px solid #fed7aa",
//                             }}
//                           >
//                             UNREAD
//                           </span>
//                         )}
//                       </div>

//                       <div className="bn-title">{n.title}</div>
//                       <p className="bn-body">{n.body}</p>

//                       <div className="bn-actions">
//                         {auctionId !== null && (
//                           <button
//                             type="button"
//                             style={primaryBtn}
//                             className="bn-btn"
//                             onClick={() => navigate(`/auction/${auctionId}`)}
//                           >
//                             {auctionTitle ? `View Auction: ${auctionTitle}` : "View Auction"}
//                           </button>
//                         )}

//                         {!n.read && (
//                           <button
//                             type="button"
//                             style={ghostBtn}
//                             className="bn-btn"
//                             onClick={() => void handleMarkAsRead(n.id)}
//                           >
//                             Mark as read
//                           </button>
//                         )}
//                       </div>
//                     </div>

//                     <div style={{ minWidth: 140, textAlign: "right", color: "#475467", fontSize: 12 }}>
//                       {formatDateTime(n.createdAt)}
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}

//           {/* Pagination */}
//           <div
//             style={{
//               marginTop: "1rem",
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               gap: 12,
//               flexWrap: "wrap",
//             }}
//           >
//             <button
//               type="button"
//               onClick={handlePrevPage}
//               disabled={loading || !pageData || pageData.first}
//               style={{
//                 ...ghostBtn,
//                 opacity: loading || !pageData || pageData.first ? 0.6 : 1,
//                 cursor: loading || !pageData || pageData.first ? "not-allowed" : "pointer",
//               }}
//               className="bn-btn"
//             >
//               Προηγούμενη
//             </button>

//             <span style={{ color: "#475467", fontWeight: 700 }}>
//               Page {pageData.number + 1} / {pageData.totalPages}
//             </span>

//             <button
//               type="button"
//               onClick={handleNextPage}
//               disabled={loading || !pageData || pageData.last}
//               style={{
//                 ...ghostBtn,
//                 opacity: loading || !pageData || pageData.last ? 0.6 : 1,
//                 cursor: loading || !pageData || pageData.last ? "not-allowed" : "pointer",
//               }}
//               className="bn-btn"
//             >
//               Επόμενη
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default NotificationsPage;


// src/components/NotificationsPage.tsx
// src/components/NotificationsPage.tsx

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getMyNotifications,
//   markNotificationAsRead,
// } from "../api/Springboot/backendNotificationService";

// import type {
//   NotificationDto,
//   NotificationPage,
// } from "../models/Springboot/Notification";

// interface NotificationsPageProps {
//   pageSize?: number;
// }

// type NotificationMetadata = {
//   auctionId?: number | string;
//   type?: string; // ✅ για metadata όπως {"type":"OUTBID"} (δεν σπάει κάτι)
// };

// const safeParseJson = (s?: string | null): NotificationMetadata | null => {
//   if (!s) return null;
//   try {
//     const parsed: unknown = JSON.parse(s);
//     if (typeof parsed === "object" && parsed !== null) {
//       return parsed as NotificationMetadata;
//     }
//     return null;
//   } catch {
//     return null;
//   }
// };

// const extractAnyQuotedText = (text: string): string | null => {
//   const m = text.match(/["“”']([^"“”']+)["“”']/);
//   if (!m) return null;
//   const v = m[1]?.trim();
//   return v && v.length > 0 ? v : null;
// };

// const extractTitleFromDescription = (text: string): string | null => {
//   const m = text.match(/title\s*:\s*(?:"([^"]*)"|“([^”]*)”|'([^']*)')/i);
//   const v = (m?.[1] ?? m?.[2] ?? m?.[3])?.trim();
//   if (v && v.length > 0) return v;
//   return extractAnyQuotedText(text);
// };

// const NotificationsPage: React.FC<NotificationsPageProps> = ({ pageSize = 20 }) => {
//   const navigate = useNavigate();

//   const [pageData, setPageData] = useState<NotificationPage | null>(null);
//   const [page, setPage] = useState<number>(0);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const loadNotifications = async (pageOverride?: number) => {
//     const targetPage = typeof pageOverride === "number" ? pageOverride : page;

//     setLoading(true);
//     setError(null);

//     try {
//       const data = await getMyNotifications(targetPage, pageSize);
//       setPageData(data);
//       setPage(targetPage);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των ειδοποιήσεων.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadNotifications(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pageSize]);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     void loadNotifications(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     void loadNotifications(page + 1);
//   };

//   const formatDateTime = (iso: string): string => {
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     return d.toLocaleString();
//   };

//   const getAuctionIdFromNotification = (n: NotificationDto): number | null => {
//     const meta = safeParseJson(n.metadataJson);
//     const auctionId = meta?.auctionId;

//     if (auctionId === undefined || auctionId === null) return null;

//     const num = typeof auctionId === "number" ? auctionId : Number(auctionId);
//     return Number.isFinite(num) ? num : null;
//   };

//   const handleMarkAsRead = async (id: number) => {
//     try {
//       await markNotificationAsRead(id);

//       setPageData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           content: prev.content.map((n) => (n.id === id ? { ...n, read: true } : n)),
//         };
//       });
//     } catch (err: unknown) {
//       console.error(err);
//     }
//   };

//   // ✅ κουμπιά (μένουν όπως τα είχες)
//   const chipBtn = useMemo<React.CSSProperties>(
//     () => ({
//       height: 22,
//       borderRadius: 8,
//       border: "1px solid rgba(2, 6, 23, 0.08)",
//       background: "rgba(255,255,255,0.62)",
//       fontWeight: 900,
//       fontSize: 10.2,
//       cursor: "pointer",
//       padding: "0 8px",
//       lineHeight: 1,
//       whiteSpace: "nowrap",
//       appearance: "none",
//       transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
//       boxShadow: "0 1px 4px rgba(2,6,23,0.045)",
//       backdropFilter: "blur(10px) saturate(1.12)",
//       WebkitBackdropFilter: "blur(10px) saturate(1.12)",
//     }),
//     []
//   );

//   const primaryChip = useMemo<React.CSSProperties>(
//     () => ({
//       ...chipBtn,
//       background: "rgba(15, 23, 42, 0.82)",
//       color: "#FFFFFF",
//       border: "1px solid rgba(15, 23, 42, 0.18)",
//       boxShadow: "0 6px 14px rgba(2,6,23,0.09)",
//     }),
//     [chipBtn]
//   );

//   const ghostChip = useMemo<React.CSSProperties>(
//     () => ({
//       ...chipBtn,
//       background: "rgba(255,255,255,0.50)",
//       color: "rgba(15, 23, 42, 0.86)",
//       border: "1px solid rgba(2, 6, 23, 0.08)",
//       boxShadow: "0 1px 4px rgba(2,6,23,0.04)",
//     }),
//     [chipBtn]
//   );

//   return (
//     <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0.8rem 1rem" }}>
//       <style>{`
//         .bn-wrap {
//           background:
//             radial-gradient(1200px 420px at 10% 0%, rgba(59,130,246,0.06), transparent 62%),
//             radial-gradient(900px 320px at 85% 5%, rgba(245,158,11,0.04), transparent 58%),
//             linear-gradient(180deg, rgba(248,250,252,0.72) 0%, rgba(255,255,255,0.84) 100%);
//           border-radius: 16px;
//           padding: 10px;
//           border: 1px solid rgba(2,6,23,0.045);
//           backdrop-filter: blur(16px) saturate(1.12);
//           -webkit-backdrop-filter: blur(16px) saturate(1.12);
//         }

//         .bn-list {
//           list-style: none;
//           padding: 0;
//           margin: 0;
//           display: flex;
//           flex-direction: column;
//           gap: 6px;
//         }

//         .bn-card {
//           width: 100%;
//           border-radius: 14px;
//           padding: 12px 14px;
//           border: 1px solid rgba(2, 6, 23, 0.055);
//           background: rgba(255,255,255,0.56);
//           box-shadow: 0 1px 8px rgba(2,6,23,0.035);
//           backdrop-filter: blur(16px) saturate(1.12);
//           -webkit-backdrop-filter: blur(16px) saturate(1.12);
//           display: grid;
//           grid-template-columns: 1fr 220px;
//           gap: 14px;
//           transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;
//         }

//         .bn-card:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 18px 34px rgba(2,6,23,0.065);
//           border-color: rgba(2, 6, 23, 0.085);
//           background: rgba(255,255,255,0.68);
//         }

//         .bn-unread {
//           border-color: rgba(245, 158, 11, 0.16);
//           background: rgba(255, 247, 237, 0.60);
//         }
//         .bn-unread:hover {
//           border-color: rgba(245, 158, 11, 0.22);
//           background: rgba(255, 247, 237, 0.72);
//         }

//         .bn-ann {
//           border-color: rgba(59,130,246,0.14);
//           background: rgba(239, 246, 255, 0.62);
//         }
//         .bn-ann:hover {
//           border-color: rgba(59,130,246,0.20);
//           background: rgba(239, 246, 255, 0.74);
//         }

//         .bn-leftTop {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 6px;
//           flex-wrap: wrap;
//         }

//         .bn-tag {
//           font-size: 10.2px;
//           font-weight: 900;
//           letter-spacing: 0.12em;
//           color: rgba(71, 84, 103, 0.82);
//           text-transform: uppercase;
//         }

//         .bn-pill {
//           font-size: 10.2px;
//           padding: 2px 8px;
//           border-radius: 999px;
//           font-weight: 900;
//           border: 1px solid rgba(245, 158, 11, 0.20);
//           background: rgba(255, 237, 213, 0.52);
//           color: rgba(180, 83, 9, 0.84);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//         }

//         .bn-title {
//           font-size: 14.6px;
//           font-weight: 900;
//           margin: 0 0 4px 0;
//           color: rgba(15, 23, 42, 0.92);
//         }

//         .bn-body {
//           margin: 0;
//           color: rgba(15, 23, 42, 0.76);
//           white-space: pre-line;
//           font-size: 13.1px;
//           line-height: 1.32;
//         }

//         .bn-actions {
//           margin-top: 8px;
//           display: flex;
//           gap: 8px;
//           flex-wrap: wrap;
//           align-items: center;
//         }

//         .bn-date {
//           min-width: 220px;
//           text-align: right;
//           color: rgba(71, 84, 103, 0.80);
//           font-size: 11.2px;
//           padding-top: 2px;
//           white-space: nowrap;
//         }

//         .bn-actions button:hover {
//           transform: translateY(-1px);
//           filter: brightness(0.995);
//         }
//         .bn-actions button:active {
//           transform: translateY(0px);
//           filter: brightness(0.98);
//         }

//         @media (max-width: 720px) {
//           .bn-card { grid-template-columns: 1fr; }
//           .bn-date { text-align: left; padding-top: 8px; }
//         }
//       `}</style>

//       <div className="bn-wrap">

//         {loading && <p style={{ margin: "10px 0" }}>Φόρτωση...</p>}
//         {error && <p style={{ color: "red", margin: "10px 0" }}>Σφάλμα: {error}</p>}

//         {pageData && (
//           <>
//             {pageData.content.length === 0 ? (
//               <p style={{ margin: "10px 0" }}>Δεν υπάρχουν ειδοποιήσεις.</p>
//             ) : (
//               <ul className="bn-list">
//                 {pageData.content.map((n) => {
//                   const announcement = n.notificationType === "GENERAL";
//                   const unread = !announcement && !n.read;

//                   const auctionId = announcement ? null : getAuctionIdFromNotification(n);
//                   const auctionTitle = extractTitleFromDescription(n.body);

//                   // ✅ ΝΕΟ: Referral Code Usage notification
//                   const isReferralCodeUse = !announcement && n.notificationType === "REFERRAL_CODE_USE";

//                   return (
//                     <li key={n.id}>
//                       <div className={["bn-card", unread ? "bn-unread" : "", announcement ? "bn-ann" : ""].join(" ")}>
//                         <div style={{ minWidth: 0 }}>
//                           <div className="bn-leftTop">
//                             <span
//                               className="bn-tag"
//                               style={{
//                                 color: announcement
//                                   ? "rgba(29, 78, 216, 0.82)"
//                                   : unread
//                                   ? "rgba(180, 83, 9, 0.82)"
//                                   : "rgba(71, 84, 103, 0.82)",
//                               }}
//                             >
//                               {announcement ? "Announcement" : "Notification"}
//                             </span>

//                             {unread && <span className="bn-pill">Unread</span>}
//                           </div>

//                           <div className="bn-title">{n.title}</div>
//                           <p className="bn-body">{n.body}</p>

//                           {!announcement && (
//                             <div className="bn-actions">
//                               {/* ✅ Referral Code Usage button */}
//                               {isReferralCodeUse && (
//                                 <button
//                                   type="button"
//                                   style={primaryChip}
//                                   onClick={() => navigate("/referral-code-usage")}
//                                 >
//                                   Referral Code Usage
//                                 </button>
//                               )}

//                               {/* ✅ View Auction (όπως πριν) */}
//                               {auctionId !== null && (
//                                 <button
//                                   type="button"
//                                   style={primaryChip}
//                                   onClick={() => navigate(`/auction/${auctionId}`)}
//                                 >
//                                   {auctionTitle ? `View Auction: ${auctionTitle}` : "View Auction"}
//                                 </button>
//                               )}

//                               {/* ✅ Mark as read */}
//                               {!n.read && (
//                                 <button
//                                   type="button"
//                                   style={ghostChip}
//                                   onClick={() => void handleMarkAsRead(n.id)}
//                                 >
//                                   Mark as read
//                                 </button>
//                               )}
//                             </div>
//                           )}
//                         </div>

//                         <div className="bn-date">{formatDateTime(n.createdAt)}</div>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             )}

//             {/* Pagination */}
//             <div
//               style={{
//                 marginTop: "0.9rem",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 gap: 10,
//                 flexWrap: "wrap",
//               }}
//             >
//               <button
//                 type="button"
//                 onClick={handlePrevPage}
//                 disabled={loading || !pageData || pageData.first}
//                 style={{
//                   ...ghostChip,
//                   opacity: loading || !pageData || pageData.first ? 0.55 : 1,
//                   cursor: loading || !pageData || pageData.first ? "not-allowed" : "pointer",
//                 }}
//               >
//                 Προηγούμενη
//               </button>

//               <span style={{ color: "rgba(71, 84, 103, 0.82)", fontWeight: 800, fontSize: 11.0 }}>
//                 Page {pageData.number + 1} / {pageData.totalPages}
//               </span>

//               <button
//                 type="button"
//                 onClick={handleNextPage}
//                 disabled={loading || !pageData || pageData.last}
//                 style={{
//                   ...ghostChip,
//                   opacity: loading || !pageData || pageData.last ? 0.55 : 1,
//                   cursor: loading || !pageData || pageData.last ? "not-allowed" : "pointer",
//                 }}
//               >
//                 Επόμενη
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationsPage;


/////////////////// VERSION 1 ////////////////////////////////

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getMyNotifications,
//   markNotificationAsRead,
// } from "../api/Springboot/backendNotificationService";

// import type {
//   NotificationDto,
//   NotificationPage,
// } from "../models/Springboot/Notification";

// interface NotificationsPageProps {
//   pageSize?: number;
// }

// type NotificationMetadata = {
//   auctionId?: number | string;
//   type?: string; // ✅ για metadata όπως {"type":"OUTBID"} (δεν σπάει κάτι)
// };

// const safeParseJson = (s?: string | null): NotificationMetadata | null => {
//   if (!s) return null;
//   try {
//     const parsed: unknown = JSON.parse(s);
//     if (typeof parsed === "object" && parsed !== null) {
//       return parsed as NotificationMetadata;
//     }
//     return null;
//   } catch {
//     return null;
//   }
// };

// const extractAnyQuotedText = (text: string): string | null => {
//   const m = text.match(/["“”']([^"“”']+)["“”']/);
//   if (!m) return null;
//   const v = m[1]?.trim();
//   return v && v.length > 0 ? v : null;
// };

// const extractTitleFromDescription = (text: string): string | null => {
//   const m = text.match(/title\s*:\s*(?:"([^"]*)"|“([^”]*)”|'([^']*)')/i);
//   const v = (m?.[1] ?? m?.[2] ?? m?.[3])?.trim();
//   if (v && v.length > 0) return v;
//   return extractAnyQuotedText(text);
// };

// const NotificationsPage: React.FC<NotificationsPageProps> = ({ pageSize = 20 }) => {
//   const navigate = useNavigate();

//   const [pageData, setPageData] = useState<NotificationPage | null>(null);
//   const [page, setPage] = useState<number>(0);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const loadNotifications = async (pageOverride?: number) => {
//     const targetPage = typeof pageOverride === "number" ? pageOverride : page;

//     setLoading(true);
//     setError(null);

//     try {
//       const data = await getMyNotifications(targetPage, pageSize);
//       setPageData(data);
//       setPage(targetPage);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των ειδοποιήσεων.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadNotifications(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pageSize]);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     void loadNotifications(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     void loadNotifications(page + 1);
//   };

//   const formatDateTime = (iso: string): string => {
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     return d.toLocaleString();
//   };

//   const getAuctionIdFromNotification = (n: NotificationDto): number | null => {
//     const meta = safeParseJson(n.metadataJson);
//     const auctionId = meta?.auctionId;

//     if (auctionId === undefined || auctionId === null) return null;

//     const num = typeof auctionId === "number" ? auctionId : Number(auctionId);
//     return Number.isFinite(num) ? num : null;
//   };

//   // ✅ UPDATED: Instant update στο καμπανάκι (dispatch event)
//   const handleMarkAsRead = async (id: number) => {
//     // αν πριν ήταν unread, τότε μετά το markAsRead θέλουμε να ενημερώσουμε instant το badge
//     const wasUnread = !!pageData?.content?.some((n) => n.id === id && !n.read);

//     try {
//       await markNotificationAsRead(id);

//       setPageData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           content: prev.content.map((n) => (n.id === id ? { ...n, read: true } : n)),
//         };
//       });

//       // ✅ Instant ενημέρωση για το App.tsx badge (το App.tsx ακούει "notifications:changed")
//       if (wasUnread) {
//         window.dispatchEvent(new CustomEvent("notifications:changed"));
//       }
//     } catch (err: unknown) {
//       console.error(err);
//     }
//   };

//   // ✅ κουμπιά (μένουν όπως τα είχες)
//   const chipBtn = useMemo<React.CSSProperties>(
//     () => ({
//       height: 22,
//       borderRadius: 8,
//       border: "1px solid rgba(2, 6, 23, 0.08)",
//       background: "rgba(255,255,255,0.62)",
//       fontWeight: 900,
//       fontSize: 10.2,
//       cursor: "pointer",
//       padding: "0 8px",
//       lineHeight: 1,
//       whiteSpace: "nowrap",
//       appearance: "none",
//       transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
//       boxShadow: "0 1px 4px rgba(2,6,23,0.045)",
//       backdropFilter: "blur(10px) saturate(1.12)",
//       WebkitBackdropFilter: "blur(10px) saturate(1.12)",
//     }),
//     []
//   );

//   const primaryChip = useMemo<React.CSSProperties>(
//     () => ({
//       ...chipBtn,
//       background: "rgba(15, 23, 42, 0.82)",
//       color: "#FFFFFF",
//       border: "1px solid rgba(15, 23, 42, 0.18)",
//       boxShadow: "0 6px 14px rgba(2,6,23,0.09)",
//     }),
//     [chipBtn]
//   );

//   const ghostChip = useMemo<React.CSSProperties>(
//     () => ({
//       ...chipBtn,
//       background: "rgba(255,255,255,0.50)",
//       color: "rgba(15, 23, 42, 0.86)",
//       border: "1px solid rgba(2, 6, 23, 0.08)",
//       boxShadow: "0 1px 4px rgba(2,6,23,0.04)",
//     }),
//     [chipBtn]
//   );

//   return (
//     <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0.8rem 1rem" }}>
//       <style>{`
//         .bn-wrap {
//           background:
//             radial-gradient(1200px 420px at 10% 0%, rgba(59,130,246,0.06), transparent 62%),
//             radial-gradient(900px 320px at 85% 5%, rgba(245,158,11,0.04), transparent 58%),
//             linear-gradient(180deg, rgba(248,250,252,0.72) 0%, rgba(255,255,255,0.84) 100%);
//           border-radius: 16px;
//           padding: 10px;
//           border: 1px solid rgba(2,6,23,0.045);
//           backdrop-filter: blur(16px) saturate(1.12);
//           -webkit-backdrop-filter: blur(16px) saturate(1.12);
//         }

//         .bn-list {
//           list-style: none;
//           padding: 0;
//           margin: 0;
//           display: flex;
//           flex-direction: column;
//           gap: 6px;
//         }

//         .bn-card {
//           width: 100%;
//           border-radius: 14px;
//           padding: 12px 14px;
//           border: 1px solid rgba(2, 6, 23, 0.055);
//           background: rgba(255,255,255,0.56);
//           box-shadow: 0 1px 8px rgba(2,6,23,0.035);
//           backdrop-filter: blur(16px) saturate(1.12);
//           -webkit-backdrop-filter: blur(16px) saturate(1.12);
//           display: grid;
//           grid-template-columns: 1fr 220px;
//           gap: 14px;
//           transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;
//         }

//         .bn-card:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 18px 34px rgba(2,6,23,0.065);
//           border-color: rgba(2, 6, 23, 0.085);
//           background: rgba(255,255,255,0.68);
//         }

//         .bn-unread {
//           border-color: rgba(245, 158, 11, 0.16);
//           background: rgba(255, 247, 237, 0.60);
//         }
//         .bn-unread:hover {
//           border-color: rgba(245, 158, 11, 0.22);
//           background: rgba(255, 247, 237, 0.72);
//         }

//         .bn-ann {
//           border-color: rgba(59,130,246,0.14);
//           background: rgba(239, 246, 255, 0.62);
//         }
//         .bn-ann:hover {
//           border-color: rgba(59,130,246,0.20);
//           background: rgba(239, 246, 255, 0.74);
//         }

//         .bn-leftTop {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 6px;
//           flex-wrap: wrap;
//         }

//         .bn-tag {
//           font-size: 10.2px;
//           font-weight: 900;
//           letter-spacing: 0.12em;
//           color: rgba(71, 84, 103, 0.82);
//           text-transform: uppercase;
//         }

//         .bn-pill {
//           font-size: 10.2px;
//           padding: 2px 8px;
//           border-radius: 999px;
//           font-weight: 900;
//           border: 1px solid rgba(245, 158, 11, 0.20);
//           background: rgba(255, 237, 213, 0.52);
//           color: rgba(180, 83, 9, 0.84);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//         }

//         .bn-title {
//           font-size: 14.6px;
//           font-weight: 900;
//           margin: 0 0 4px 0;
//           color: rgba(15, 23, 42, 0.92);
//         }

//         .bn-body {
//           margin: 0;
//           color: rgba(15, 23, 42, 0.76);
//           white-space: pre-line;
//           font-size: 13.1px;
//           line-height: 1.32;
//         }

//         .bn-actions {
//           margin-top: 8px;
//           display: flex;
//           gap: 8px;
//           flex-wrap: wrap;
//           align-items: center;
//         }

//         .bn-date {
//           min-width: 220px;
//           text-align: right;
//           color: rgba(71, 84, 103, 0.80);
//           font-size: 11.2px;
//           padding-top: 2px;
//           white-space: nowrap;
//         }

//         .bn-actions button:hover {
//           transform: translateY(-1px);
//           filter: brightness(0.995);
//         }
//         .bn-actions button:active {
//           transform: translateY(0px);
//           filter: brightness(0.98);
//         }

//         @media (max-width: 720px) {
//           .bn-card { grid-template-columns: 1fr; }
//           .bn-date { text-align: left; padding-top: 8px; }
//         }
//       `}</style>

//       <div className="bn-wrap">
//         {loading && <p style={{ margin: "10px 0" }}>Φόρτωση...</p>}
//         {error && <p style={{ color: "red", margin: "10px 0" }}>Σφάλμα: {error}</p>}

//         {pageData && (
//           <>
//             {pageData.content.length === 0 ? (
//               <p style={{ margin: "10px 0" }}>Δεν υπάρχουν ειδοποιήσεις.</p>
//             ) : (
//               <ul className="bn-list">
//                 {pageData.content.map((n) => {
//                   const announcement = n.notificationType === "GENERAL";
//                   const unread = !announcement && !n.read;

//                   const auctionId = announcement ? null : getAuctionIdFromNotification(n);
//                   const auctionTitle = extractTitleFromDescription(n.body);

//                   // ✅ ΝΕΟ: Referral Code Usage notification
//                   const isReferralCodeUse = !announcement && n.notificationType === "REFERRAL_CODE_USE";

//                   return (
//                     <li key={n.id}>
//                       <div className={["bn-card", unread ? "bn-unread" : "", announcement ? "bn-ann" : ""].join(" ")}>
//                         <div style={{ minWidth: 0 }}>
//                           <div className="bn-leftTop">
//                             <span
//                               className="bn-tag"
//                               style={{
//                                 color: announcement
//                                   ? "rgba(29, 78, 216, 0.82)"
//                                   : unread
//                                   ? "rgba(180, 83, 9, 0.82)"
//                                   : "rgba(71, 84, 103, 0.82)",
//                               }}
//                             >
//                               {announcement ? "Announcement" : "Notification"}
//                             </span>

//                             {unread && <span className="bn-pill">Unread</span>}
//                           </div>

//                           <div className="bn-title">{n.title}</div>
//                           <p className="bn-body">{n.body}</p>

//                           {!announcement && (
//                             <div className="bn-actions">
//                               {/* ✅ Referral Code Usage button */}
//                               {isReferralCodeUse && (
//                                 <button
//                                   type="button"
//                                   style={primaryChip}
//                                   onClick={() => navigate("/referral-code-usage")}
//                                 >
//                                   Referral Code Usage
//                                 </button>
//                               )}

//                               {/* ✅ View Auction (όπως πριν) */}
//                               {auctionId !== null && (
//                                 <button
//                                   type="button"
//                                   style={primaryChip}
//                                   onClick={() => navigate(`/auction/${auctionId}`)}
//                                 >
//                                   {auctionTitle ? `View Auction: ${auctionTitle}` : "View Auction"}
//                                 </button>
//                               )}

//                               {/* ✅ Mark as read */}
//                               {!n.read && (
//                                 <button
//                                   type="button"
//                                   style={ghostChip}
//                                   onClick={() => void handleMarkAsRead(n.id)}
//                                 >
//                                   Mark as read
//                                 </button>
//                               )}
//                             </div>
//                           )}
//                         </div>

//                         <div className="bn-date">{formatDateTime(n.createdAt)}</div>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             )}

//             {/* Pagination */}
//             <div
//               style={{
//                 marginTop: "0.9rem",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 gap: 10,
//                 flexWrap: "wrap",
//               }}
//             >
//               <button
//                 type="button"
//                 onClick={handlePrevPage}
//                 disabled={loading || !pageData || pageData.first}
//                 style={{
//                   ...ghostChip,
//                   opacity: loading || !pageData || pageData.first ? 0.55 : 1,
//                   cursor: loading || !pageData || pageData.first ? "not-allowed" : "pointer",
//                 }}
//               >
//                 Προηγούμενη
//               </button>

//               <span style={{ color: "rgba(71, 84, 103, 0.82)", fontWeight: 800, fontSize: 11.0 }}>
//                 Page {pageData.number + 1} / {pageData.totalPages}
//               </span>

//               <button
//                 type="button"
//                 onClick={handleNextPage}
//                 disabled={loading || !pageData || pageData.last}
//                 style={{
//                   ...ghostChip,
//                   opacity: loading || !pageData || pageData.last ? 0.55 : 1,
//                   cursor: loading || !pageData || pageData.last ? "not-allowed" : "pointer",
//                 }}
//               >
//                 Επόμενη
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationsPage;


// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getMyNotifications,
//   markNotificationAsRead,
// } from "../api/Springboot/backendNotificationService";

// import type {
//   NotificationDto,
//   NotificationPage,
// } from "../models/Springboot/Notification";

// interface NotificationsPageProps {
//   pageSize?: number;
//   onBack?: () => void; // ✅ NEW: Back to auctions
// }

// type NotificationMetadata = {
//   auctionId?: number | string;
//   type?: string; // ✅ για metadata όπως {"type":"OUTBID"} (δεν σπάει κάτι)
// };

// const safeParseJson = (s?: string | null): NotificationMetadata | null => {
//   if (!s) return null;
//   try {
//     const parsed: unknown = JSON.parse(s);
//     if (typeof parsed === "object" && parsed !== null) {
//       return parsed as NotificationMetadata;
//     }
//     return null;
//   } catch {
//     return null;
//   }
// };

// const extractAnyQuotedText = (text: string): string | null => {
//   const m = text.match(/["“”']([^"“”']+)["“”']/);
//   if (!m) return null;
//   const v = m[1]?.trim();
//   return v && v.length > 0 ? v : null;
// };

// const extractTitleFromDescription = (text: string): string | null => {
//   const m = text.match(/title\s*:\s*(?:"([^"]*)"|“([^”]*)”|'([^']*)')/i);
//   const v = (m?.[1] ?? m?.[2] ?? m?.[3])?.trim();
//   if (v && v.length > 0) return v;
//   return extractAnyQuotedText(text);
// };

// const truncateTitle = (s: string, max = 8): string => {
//   const t = s.trim();
//   if (t.length <= max) return t;
//   return `${t.slice(0, max)}...`;
// };


// const NotificationsPage: React.FC<NotificationsPageProps> = ({ pageSize = 20, onBack }) => {
//   const navigate = useNavigate();

//   const [pageData, setPageData] = useState<NotificationPage | null>(null);
//   const [page, setPage] = useState<number>(0);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleBack = () => {
//     if (onBack) onBack();
//     else navigate("/");
//   };

//   const loadNotifications = async (pageOverride?: number) => {
//     const targetPage = typeof pageOverride === "number" ? pageOverride : page;

//     setLoading(true);
//     setError(null);

//     try {
//       const data = await getMyNotifications(targetPage, pageSize);
//       setPageData(data);
//       setPage(targetPage);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Something went wrong while loading your notifications.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadNotifications(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pageSize]);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     void loadNotifications(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     void loadNotifications(page + 1);
//   };

//   const formatDateTime = (iso: string): string => {
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     return d.toLocaleString();
//   };

//   const getAuctionIdFromNotification = (n: NotificationDto): number | null => {
//     const meta = safeParseJson(n.metadataJson);
//     const auctionId = meta?.auctionId;

//     if (auctionId === undefined || auctionId === null) return null;

//     const num = typeof auctionId === "number" ? auctionId : Number(auctionId);
//     return Number.isFinite(num) ? num : null;
//   };

//   // ✅ UPDATED: Instant update στο καμπανάκι (dispatch event)
//   const handleMarkAsRead = async (id: number) => {
//     const wasUnread = !!pageData?.content?.some((n) => n.id === id && !n.read);

//     try {
//       await markNotificationAsRead(id);

//       setPageData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           content: prev.content.map((n) => (n.id === id ? { ...n, read: true } : n)),
//         };
//       });

//       // ✅ Instant ενημέρωση για το App.tsx badge (το App.tsx ακούει "notifications:changed")
//       if (wasUnread) {
//         window.dispatchEvent(new CustomEvent("notifications:changed"));
//       }
//     } catch (err: unknown) {
//       console.error(err);
//     }
//   };

//   // ✅ κουμπιά (μένουν όπως τα είχες)
//   const chipBtn = useMemo<React.CSSProperties>(
//     () => ({
//       height: 22,
//       borderRadius: 8,
//       border: "1px solid rgba(2, 6, 23, 0.08)",
//       background: "rgba(255,255,255,0.62)",
//       fontWeight: 900,
//       fontSize: 10.2,
//       cursor: "pointer",
//       padding: "0 8px",
//       lineHeight: 1,
//       whiteSpace: "nowrap",
//       appearance: "none",
//       transition: "transform 120ms ease, filter 120ms ease, box-shadow 120ms ease",
//       boxShadow: "0 1px 4px rgba(2,6,23,0.045)",
//       backdropFilter: "blur(10px) saturate(1.12)",
//       WebkitBackdropFilter: "blur(10px) saturate(1.12)",
//     }),
//     []
//   );

//   const primaryChip = useMemo<React.CSSProperties>(
//     () => ({
//       ...chipBtn,
//       background: "rgba(10, 11, 14, 0.85)",
//       color: "#FFFFFF",
//       border: "1px solid rgba(15, 23, 42, 0.18)",
//       boxShadow: "0 6px 14px rgba(2,6,23,0.09)",
//     }),
//     [chipBtn]
//   );

//   const ghostChip = useMemo<React.CSSProperties>(
//     () => ({
//       ...chipBtn,
//       background: "rgba(255,255,255,0.50)",
//       color: "rgba(15, 23, 42, 0.86)",
//       border: "1px solid rgba(2, 6, 23, 0.08)",
//       boxShadow: "0 1px 4px rgba(2,6,23,0.04)",
//     }),
//     [chipBtn]
//   );

//   // ✅ Back button style (ίδιο στυλ φιλοσοφία με CreateAuctionFlowPage)
//   const backBtn: React.CSSProperties = {
//     height: 40,
//     padding: "0 14px",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 900,
//     cursor: "pointer",
//     margin: "0 0 12px 0",
//   };

//   return (
//     <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0.8rem 1rem" }}>
//       <style>{`
//         .bn-wrap {
//           background:
//             radial-gradient(1200px 420px at 10% 0%, rgba(59,130,246,0.06), transparent 62%),
//             radial-gradient(900px 320px at 85% 5%, rgba(245,158,11,0.04), transparent 58%),
//             linear-gradient(180deg, rgba(248,250,252,0.72) 0%, rgba(255,255,255,0.84) 100%);
//           border-radius: 16px;
//           padding: 10px;
//           border: 1px solid rgba(2,6,23,0.045);
//           backdrop-filter: blur(16px) saturate(1.12);
//           -webkit-backdrop-filter: blur(16px) saturate(1.12);
//         }

//         .bn-list {
//           list-style: none;
//           padding: 0;
//           margin: 0;
//           display: flex;
//           flex-direction: column;
//           gap: 6px;
//         }

//         .bn-card {
//           width: 100%;
//           border-radius: 14px;
//           padding: 12px 14px;
//           border: 1px solid rgba(2, 6, 23, 0.055);
//           background: rgba(255,255,255,0.56);
//           box-shadow: 0 1px 8px rgba(2,6,23,0.035);
//           backdrop-filter: blur(16px) saturate(1.12);
//           -webkit-backdrop-filter: blur(16px) saturate(1.12);
//           display: grid;
//           grid-template-columns: 1fr 220px;
//           gap: 14px;
//           transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;
//         }

//         .bn-card:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 18px 34px rgba(2,6,23,0.065);
//           border-color: rgba(2, 6, 23, 0.085);
//           background: rgba(255,255,255,0.68);
//         }

//         .bn-unread {
//           border-color: rgba(245, 158, 11, 0.16);
//           background: rgba(255, 247, 237, 0.60);
//         }
//         .bn-unread:hover {
//           border-color: rgba(245, 158, 11, 0.22);
//           background: rgba(255, 247, 237, 0.72);
//         }

//         .bn-ann {
//           border-color: rgba(59,130,246,0.14);
//           background: rgba(239, 246, 255, 0.62);
//         }
//         .bn-ann:hover {
//           border-color: rgba(59,130,246,0.20);
//           background: rgba(239, 246, 255, 0.74);
//         }

//         .bn-leftTop {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 6px;
//           flex-wrap: wrap;
//         }

//         .bn-tag {
//           font-size: 10.2px;
//           font-weight: 900;
//           letter-spacing: 0.12em;
//           color: rgba(71, 84, 103, 0.82);
//           text-transform: uppercase;
//         }

//         .bn-pill {
//           font-size: 10.2px;
//           padding: 2px 8px;
//           border-radius: 999px;
//           font-weight: 900;
//           border: 1px solid rgba(245, 158, 11, 0.20);
//           background: rgba(255, 237, 213, 0.52);
//           color: rgba(180, 83, 9, 0.84);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//         }

//         .bn-title {
//           font-size: 14.6px;
//           font-weight: 900;
//           margin: 0 0 4px 0;
//           color: rgba(15, 23, 42, 0.92);
//         }

//         .bn-body {
//           margin: 0;
//           color: rgba(15, 23, 42, 0.76);
//           white-space: pre-line;
//           font-size: 13.1px;
//           line-height: 1.32;
//         }

//         .bn-actions {
//           margin-top: 8px;
//           display: flex;
//           gap: 8px;
//           flex-wrap: wrap;
//           align-items: center;
//         }

//         .bn-date {
//           min-width: 220px;
//           text-align: right;
//           color: rgba(71, 84, 103, 0.80);
//           font-size: 11.2px;
//           padding-top: 2px;
//           white-space: nowrap;
//         }

//         .bn-actions button:hover {
//           transform: translateY(-1px);
//           filter: brightness(0.995);
//         }
//         .bn-actions button:active {
//           transform: translateY(0px);
//           filter: brightness(0.98);
//         }

//         @media (max-width: 720px) {
//           .bn-card { grid-template-columns: 1fr; }
//           .bn-date { text-align: left; padding-top: 8px; }
//         }
//       `}</style>

//       {/* ✅ NEW: Back κουμπί */}
//       <button type="button" onClick={handleBack} style={backBtn}>
//         ← Back to all auctions
//       </button>

//       <div className="bn-wrap">
//         {loading && <p style={{ margin: "10px 0" }}>Loading...</p>}
//         {error && <p style={{ color: "red", margin: "10px 0" }}>Error: {error}</p>}

//         {pageData && (
//           <>
//             {pageData.content.length === 0 ? (
//                     <p style={{ margin: "10px 0" }}>No notifications.</p>
//             ) : (
//               <ul className="bn-list">
//                 {pageData.content.map((n) => {
//                   const announcement = n.notificationType === "GENERAL";
//                   const unread = !announcement && !n.read;

//                   const auctionId = announcement ? null : getAuctionIdFromNotification(n);
//                   const auctionTitleRaw = extractTitleFromDescription(n.body);
//                   const auctionTitle = auctionTitleRaw ? truncateTitle(auctionTitleRaw, 8) : null;

//                   // ✅ Referral Code Usage notification
//                   const isReferralCodeUse = !announcement && n.notificationType === "REFERRAL_CODE_USE";

//                   return (
//                     <li key={n.id}>
//                       <div className={["bn-card", unread ? "bn-unread" : "", announcement ? "bn-ann" : ""].join(" ")}>
//                         <div style={{ minWidth: 0 }}>
//                           <div className="bn-leftTop">
//                             <span
//                               className="bn-tag"
//                               style={{
//                                 color: announcement
//                                   ? "rgba(29, 78, 216, 0.82)"
//                                   : unread
//                                   ? "rgba(180, 83, 9, 0.82)"
//                                   : "rgba(71, 84, 103, 0.82)",
//                               }}
//                             >
//                               {announcement ? "Announcement" : "Notification"}
//                             </span>

//                             {unread && <span className="bn-pill">Unread</span>}
//                           </div>

//                           <div className="bn-title">{n.title}</div>
//                           <p className="bn-body">{n.body}</p>

//                           {!announcement && (
//                             <div className="bn-actions">
//                               {/* ✅ Referral Code Usage */}
//                               {isReferralCodeUse && (
//                                 <button
//                                   type="button"
//                                   style={primaryChip}
//                                   onClick={() => navigate("/me/referrals")}  // ✅ matches App.tsx route
//                                 >
//                                   Referral Code Usage
//                                 </button>
//                               )}

//                               {/* ✅ View Auction */}
//                               {auctionId !== null && (
//                                 <button
//                                   type="button"
//                                   style={primaryChip}
//                                   onClick={() => navigate(`/auction/${auctionId}`)}
//                                 >
//                                   {auctionTitle ? `View Auction: ${auctionTitle}` : "View Auction"}
//                                 </button>
//                               )}

//                               {/* ✅ Mark as read */}
//                               {!n.read && (
//                                 <button
//                                   type="button"
//                                   style={ghostChip}
//                                   onClick={() => void handleMarkAsRead(n.id)}
//                                 >
//                                   Mark as read
//                                 </button>
//                               )}
//                             </div>
//                           )}
//                         </div>

//                         <div className="bn-date">{formatDateTime(n.createdAt)}</div>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             )}

//             {/* Pagination */}
//             <div
//               style={{
//                 marginTop: "0.9rem",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 gap: 10,
//                 flexWrap: "wrap",
//               }}
//             >
//               <button
//                 type="button"
//                 onClick={handlePrevPage}
//                 disabled={loading || !pageData || pageData.first}
//                 style={{
//                   ...ghostChip,
//                   opacity: loading || !pageData || pageData.first ? 0.55 : 1,
//                   cursor: loading || !pageData || pageData.first ? "not-allowed" : "pointer",
//                 }}
//               >
//                 Previous
//               </button>

//               <span style={{ color: "rgba(71, 84, 103, 0.82)", fontWeight: 800, fontSize: 11.0 }}>
//                 Page {pageData.number + 1} / {pageData.totalPages}
//               </span>

//               <button
//                 type="button"
//                 onClick={handleNextPage}
//                 disabled={loading || !pageData || pageData.last}
//                 style={{
//                   ...ghostChip,
//                   opacity: loading || !pageData || pageData.last ? 0.55 : 1,
//                   cursor: loading || !pageData || pageData.last ? "not-allowed" : "pointer",
//                 }}
//               >
//                 Next
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationsPage;
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../api/Springboot/backendNotificationService";

import type {
  NotificationDto,
  NotificationPage,
} from "../models/Springboot/Notification";

interface NotificationsPageProps {
  pageSize?: number;
  onBack?: () => void;
}

type NotificationMetadata = {
  auctionId?: number | string;
  type?: string;
};

const safeParseJson = (s?: string | null): NotificationMetadata | null => {
  if (!s) return null;
  try {
    const parsed: unknown = JSON.parse(s);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as NotificationMetadata;
    }
    return null;
  } catch {
    return null;
  }
};

const extractAnyQuotedText = (text: string): string | null => {
  const m = text.match(/["“”']([^"“”']+)["“”']/);
  if (!m) return null;
  const v = m[1]?.trim();
  return v && v.length > 0 ? v : null;
};

const extractTitleFromDescription = (text: string): string | null => {
  const m = text.match(/title\s*:\s*(?:"([^"]*)"|“([^”]*)”|'([^']*)')/i);
  const v = (m?.[1] ?? m?.[2] ?? m?.[3])?.trim();
  if (v && v.length > 0) return v;
  return extractAnyQuotedText(text);
};

const truncateTitle = (s: string, max = 8): string => {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}...`;
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({
  pageSize = 20,
  onBack,
}) => {
  const navigate = useNavigate();

  const [pageData, setPageData] = useState<NotificationPage | null>(null);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/");
  };

  const loadNotifications = async (pageOverride?: number) => {
    const targetPage = typeof pageOverride === "number" ? pageOverride : page;
    setLoading(true);
    setError(null);
    try {
      const data = await getMyNotifications(targetPage, pageSize);
      setPageData(data);
      setPage(targetPage);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    void loadNotifications(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    void loadNotifications(page + 1);
  };

  const formatDateTime = (iso: string): string => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  };

  const getAuctionIdFromNotification = (n: NotificationDto): number | null => {
    const meta = safeParseJson(n.metadataJson);
    const auctionId = meta?.auctionId;
    if (auctionId == null) return null;
    const num = typeof auctionId === "number" ? auctionId : Number(auctionId);
    return Number.isFinite(num) ? num : null;
  };

  const handleMarkAsRead = async (id: number) => {
    const wasUnread = !!pageData?.content?.some(
      (n) => n.id === id && !n.read
    );

    try {
      await markNotificationAsRead(id);
      setPageData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
            }
          : prev
      );

      if (wasUnread) {
        window.dispatchEvent(new CustomEvent("notifications:changed"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- Buttons ---------- */
  const chipBtn = useMemo<React.CSSProperties>(
    () => ({
      height: 22,
      borderRadius: 10,
      border: "1px solid rgba(2, 6, 23, 0.12)",
      background: "rgba(255,255,255,0.72)",
      fontWeight: 900,
      fontSize: 10.4,
      cursor: "pointer",
      padding: "0 9px",
      boxShadow: "0 1px 4px rgba(2,6,23,0.05)",
      transition: "all 120ms ease",
      backdropFilter: "blur(10px)",
    }),
    []
  );

  const primaryChip = {
    ...chipBtn,
    background: "rgba(2,6,23,0.88)",
    color: "#fff",
    border: "1px solid rgba(2,6,23,0.22)",
    boxShadow: "0 10px 24px rgba(2,6,23,0.20)",
  };

  const ghostChip = {
    ...chipBtn,
    background: "rgba(255,255,255,0.55)",
    color: "rgba(2,6,23,0.88)",
  };

  const backBtn: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.14)",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    marginBottom: 12,
    boxShadow: "0 6px 18px rgba(2,6,23,0.08)",
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0.8rem 1rem" }}>
      {/* ===================== STYLES ===================== */}
 <style>{`
  :root{
    --bg: rgba(255,255,255,0.70);
    --border: rgba(2,6,23,0.08);
    --text: rgba(15, 23, 42, 0.92);
    --muted: rgba(71, 84, 103, 0.82);

    /* Modern accent palette */
    --accent-amber: 245, 158, 11;
    --accent-blue: 59, 130, 246;

    /* Unread "dark" feel */
    --unread-ink: rgba(2, 6, 23, 0.92);
    --unread-bg: rgba(2, 6, 23, 0.04);
    --unread-border: rgba(2, 6, 23, 0.16);
    --unread-glow: rgba(245, 158, 11, 0.20);
  }

  .bn-wrap {
    background:
      radial-gradient(1100px 460px at 12% 0%, rgba(var(--accent-blue), 0.08), transparent 60%),
      radial-gradient(900px 340px at 88% 8%, rgba(var(--accent-amber), 0.06), transparent 55%),
      linear-gradient(180deg, rgba(248,250,252,0.78) 0%, rgba(255,255,255,0.92) 100%);
    border-radius: 18px;
    padding: 12px;
    border: 1px solid rgba(2,6,23,0.06);
    backdrop-filter: blur(18px) saturate(1.18);
    -webkit-backdrop-filter: blur(18px) saturate(1.18);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.55) inset,
      0 10px 30px rgba(2,6,23,0.05);
  }

  .bn-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bn-card {
    width: 100%;
    border-radius: 16px;
    padding: 13px 14px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.62);
    box-shadow:
      0 1px 10px rgba(2,6,23,0.045),
      0 1px 0 rgba(255,255,255,0.55) inset;
    backdrop-filter: blur(16px) saturate(1.12);
    -webkit-backdrop-filter: blur(16px) saturate(1.12);
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 14px;
    transition:
      transform 140ms ease,
      box-shadow 140ms ease,
      border-color 140ms ease,
      background 140ms ease,
      filter 140ms ease;
    position: relative;
    overflow: hidden;
  }

  .bn-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 22px 46px rgba(2,6,23,0.08),
      0 1px 0 rgba(255,255,255,0.6) inset;
    border-color: rgba(2, 6, 23, 0.12);
    background: rgba(255,255,255,0.74);
  }

  /* ✅ Unread: πιο σκούρο + έντονο "premium" highlight */
  .bn-unread {
    border-color: var(--unread-border);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.58) 100%),
      radial-gradient(900px 220px at 20% 0%, rgba(var(--accent-amber), 0.14), transparent 55%);
    box-shadow:
      0 16px 42px rgba(2,6,23,0.10),
      0 1px 0 rgba(255,255,255,0.62) inset,
      0 0 0 1px rgba(var(--accent-amber), 0.10);
  }

  /* Accent bar στην αριστερή πλευρά για unread */
  .bn-unread::before{
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 4px;
    border-radius: 999px;
    background: linear-gradient(180deg,
      rgba(var(--accent-amber), 0.95) 0%,
      rgba(var(--accent-amber), 0.45) 100%);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.35) inset,
      0 10px 22px rgba(var(--accent-amber), 0.22);
  }

  .bn-unread:hover {
    border-color: rgba(2, 6, 23, 0.22);
    filter: saturate(1.02);
  }

  /* Announcements πιο “καθαρό” blue */
  .bn-ann {
    border-color: rgba(var(--accent-blue), 0.18);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.76) 0%, rgba(255,255,255,0.60) 100%),
      radial-gradient(900px 240px at 20% 0%, rgba(var(--accent-blue), 0.12), transparent 56%);
  }
  .bn-ann:hover {
    border-color: rgba(var(--accent-blue), 0.26);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.66) 100%),
      radial-gradient(900px 240px at 20% 0%, rgba(var(--accent-blue), 0.16), transparent 56%);
  }

  .bn-leftTop {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  .bn-tag {
    font-size: 10.4px;
    font-weight: 950;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  /* ✅ Unread pill πιο μοντέρνο, πιο “σκούρο” */
  .bn-pill {
    font-size: 10.2px;
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 950;
    border: 1px solid rgba(2, 6, 23, 0.22);
    background: rgba(2, 6, 23, 0.86);
    color: rgba(255,255,255,0.94);
    box-shadow: 0 10px 22px rgba(2,6,23,0.16);
  }

  .bn-title {
    font-size: 15.2px;
    font-weight: 950;
    margin: 0 0 4px 0;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .bn-body {
    margin: 0;
    color: rgba(15, 23, 42, 0.78);
    white-space: pre-line;
    font-size: 13.2px;
    line-height: 1.38;
  }

  .bn-actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .bn-date {
    min-width: 220px;
    text-align: right;
    color: rgba(71, 84, 103, 0.84);
    font-size: 11.3px;
    padding-top: 2px;
    white-space: nowrap;
    font-weight: 800;
  }

  /* Buttons micro-interactions πιο crisp */
  .bn-actions button:hover {
    transform: translateY(-1px);
    filter: brightness(1.01);
  }
  .bn-actions button:active {
    transform: translateY(0px);
    filter: brightness(0.98);
  }

  /* Focus states για accessibility */
  .bn-actions button:focus-visible,
  button:focus-visible{
    outline: 2px solid rgba(var(--accent-blue), 0.55);
    outline-offset: 2px;
  }

  @media (max-width: 720px) {
    .bn-card { grid-template-columns: 1fr; }
    .bn-date { text-align: left; padding-top: 8px; }
  }
.bn-dot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.95);
  box-shadow: 0 8px 18px rgba(245, 158, 11, 0.25);
}

      `}</style>

      <button type="button" onClick={handleBack} style={backBtn}>
        ← Back to all auctions
      </button>

      <div className="bn-wrap">
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {pageData && (
          <>
            {pageData.content.length === 0 ? (
              <p>No notifications.</p>
            ) : (
              <ul className="bn-list">
                {pageData.content.map((n) => {
                  const announcement = n.notificationType === "GENERAL";
                  const unread = !announcement && !n.read;
                  const auctionId = announcement ? null : getAuctionIdFromNotification(n);
                  const auctionTitleRaw = extractTitleFromDescription(n.body);
                  const auctionTitle = auctionTitleRaw
                    ? truncateTitle(auctionTitleRaw, 8)
                    : null;

                  const isReferralCodeUse =
                    !announcement && n.notificationType === "REFERRAL_CODE_USE";

                  return (
                    <li key={n.id}>
                      <div
                        className={[
                          "bn-card",
                          unread ? "bn-unread" : "",
                          announcement ? "bn-ann" : "",
                        ].join(" ")}
                      >
                        <div>
                          <div className="bn-leftTop">
                            <span
                              className="bn-tag"
                              style={{
                                color: announcement
                                  ? "rgba(29,78,216,0.86)"
                                  : unread
                                  ? "rgba(2,6,23,0.86)"
                                  : "rgba(71,84,103,0.82)",
                              }}
                            >
                              {announcement ? "Announcement" : "Notification"}
                            </span>
                          {unread && <span className="bn-dot" aria-label="New notification" />}
                         
                          </div>

                          <div className="bn-title">{n.title}</div>
                          <p className="bn-body">{n.body}</p>

                          {!announcement && (
                            <div className="bn-actions">
                              {isReferralCodeUse && (
                                <button
                                  style={primaryChip}
                                  onClick={() => navigate("/me/referrals")}
                                >
                                  Referral Code Usage
                                </button>
                              )}

                              {auctionId !== null && (
                                <button
                                  style={primaryChip}
                                  onClick={() =>
                                    navigate(`/auction/${auctionId}`)
                                  }
                                >
                                  {auctionTitle
                                    ? `View Auction: ${auctionTitle}`
                                    : "View Auction"}
                                </button>
                              )}

                              {!n.read && (
                                <button
                                  style={ghostChip}
                                  onClick={() =>
                                    void handleMarkAsRead(n.id)
                                  }
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="bn-date">
                          {formatDateTime(n.createdAt)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pagination */}
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                style={ghostChip}
                disabled={loading || pageData.first}
                onClick={handlePrevPage}
              >
                Previous
              </button>

              <span style={{ fontSize: 11.4, fontWeight: 800 }}>
                Page {pageData.number + 1} / {pageData.totalPages}
              </span>

              <button
                style={ghostChip}
                disabled={loading || pageData.last}
                onClick={handleNextPage}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
