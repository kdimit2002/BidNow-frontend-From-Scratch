// // src/components/ReferralCodeUsagePage.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   fetchReferralCodeUsage,
//   fetchOwnerReferralCodeDetails,
//   type ReferralCodeDetailsDto,
// } from "../api/Springboot/ReferralCodeService";
// import type { ReferralCodeUsageResponse } from "../models/Springboot/ReferralCode";
// import type { PageResponse } from "../admin/models/AdminResponseUser";

// const ReferralCodeUsagePage: React.FC = () => {
//   const [page, setPage] = useState<number>(0);

//   const [data, setData] = useState<PageResponse<ReferralCodeUsageResponse> | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [details, setDetails] = useState<ReferralCodeDetailsDto | null>(null);
//   const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

//   const [copied, setCopied] = useState<boolean>(false);

//   const styles: Record<string, React.CSSProperties> = useMemo(
//     () => ({
//       page: { maxWidth: 1100, margin: "0 auto", padding: "20px 14px 40px" },

//       topbar: {
//         display: "flex",
//         alignItems: "flex-end",
//         justifyContent: "space-between",
//         gap: 12,
//         flexWrap: "wrap",
//         marginBottom: 14,
//       },
//       h2: { margin: 0, fontSize: "1.55rem", fontWeight: 900, color: "#0f172a" },
//       sub: { margin: "6px 0 0", color: "#475569", fontSize: "0.95rem" },

//       card: {
//         background: "#fff",
//         border: "1px solid rgba(15,23,42,0.08)",
//         borderRadius: 16,
//         boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
//         padding: 16,
//       },

//       pillsRow: {
//         display: "flex",
//         gap: 10,
//         flexWrap: "wrap",
//         alignItems: "center",
//       },

//       pill: {
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//         padding: "7px 10px",
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "rgba(11,92,255,0.06)",
//         color: "#0f172a",
//         fontWeight: 900,
//         fontSize: "0.86rem",
//         whiteSpace: "nowrap",
//       },

//       pillCodeBtn: {
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//         padding: "7px 10px",
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.14)",
//         background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,1))",
//         color: "#0f172a",
//         fontWeight: 900,
//         fontSize: "0.86rem",
//         whiteSpace: "nowrap",
//       },

//       codeBox: {
//         fontFamily:
//           "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
//         fontWeight: 900,
//         fontSize: "0.9rem",
//         padding: "3px 8px",
//         borderRadius: 10,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "rgba(11,92,255,0.06)",
//         display: "inline-block",
//       },

//       alert: {
//         marginTop: 10,
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f8fafc",
//         color: "#0f172a",
//         fontSize: "0.92rem",
//         whiteSpace: "pre-line",
//       },

//       alertDanger: {
//         borderColor: "rgba(220,38,38,0.25)",
//         background: "rgba(220,38,38,0.06)",
//       },

//       listWrap: {
//         marginTop: 12,
//         borderRadius: 14,
//         border: "1px solid rgba(15,23,42,0.10)",
//         overflow: "hidden",
//       },

//       listHeader: {
//         padding: "12px 14px",
//         borderBottom: "1px solid rgba(15,23,42,0.08)",
//         background: "linear-gradient(180deg, rgba(248,250,252,1), rgba(255,255,255,1))",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//       },

//       listTitle: { margin: 0, fontWeight: 900, color: "#0f172a" },
//       listSub: { margin: 0, color: "#475569", fontSize: "0.9rem" },

//       ul: { listStyle: "none", margin: 0, padding: 0, background: "#fff" },

//       li: {
//         display: "flex",
//         gap: 12,
//         alignItems: "center",
//         padding: "12px 14px",
//         borderBottom: "1px solid rgba(15,23,42,0.06)",
//       },

//       avatar: {
//         width: 38,
//         height: 38,
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "rgba(11,92,255,0.06)",
//         display: "grid",
//         placeItems: "center",
//         fontWeight: 900,
//         color: "#0f172a",
//         flex: "0 0 auto",
//       },

//       userText: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
//       userRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
//       userName: { fontWeight: 900, color: "#0f172a" },
//       userHint: { color: "#64748b", fontSize: "0.88rem" },

//       pager: {
//         marginTop: 14,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//         flexWrap: "wrap",
//       },
//       pagerLeft: {
//         display: "flex",
//         alignItems: "center",
//         gap: 10,
//         flexWrap: "wrap",
//       },

//       btn: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "#0b5cff",
//         color: "#fff",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//       },
//       btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

//       meta: { color: "#475569", fontSize: "0.92rem", fontWeight: 800 },

//       emptyBox: {
//         marginTop: 12,
//         borderRadius: 16,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "linear-gradient(180deg, rgba(248,250,252,1), rgba(255,255,255,1))",
//         padding: 16,
//         color: "#0f172a",
//       },
//       emptyTitle: { margin: 0, fontWeight: 900, fontSize: "1.02rem" },
//       emptyText: { margin: "6px 0 0", color: "#475569", lineHeight: 1.45 },
//     }),
//     []
//   );

//   // Load usage
//   useEffect(() => {
//     let cancelled = false;

//     const loadUsage = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const result = await fetchReferralCodeUsage(page, 10);
//         if (!cancelled) setData(result);
//       } catch (err: unknown) {
//         console.error("Failed to load referral code usage:", err);
//         if (!cancelled) {
//           setError(err instanceof Error ? err.message : "Αποτυχία φόρτωσης χρήσης referral code.");
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     void loadUsage();
//     return () => {
//       cancelled = true;
//     };
//   }, [page]);

//   // Load owner details (code + points + disabled + remaining)
//   useEffect(() => {
//     let cancelled = false;

//     const loadDetails = async () => {
//       try {
//         setDetailsLoading(true);
//         const res = await fetchOwnerReferralCodeDetails();
//         if (!cancelled) setDetails(res);
//       } catch (err: unknown) {
//         console.error("Failed to load owner referral code details:", err);
//         if (!cancelled) setDetails(null);
//       } finally {
//         if (!cancelled) setDetailsLoading(false);
//       }
//     };

//     void loadDetails();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const handlePrev = () => {
//     if (page > 0) setPage((p) => p - 1);
//   };

//   const handleNext = () => {
//     if (data && !data.last) setPage((p) => p + 1);
//   };

//   const copyCode = async () => {
//     if (!details?.code) return;

//     try {
//       await navigator.clipboard.writeText(details.code);
//       setCopied(true);
//       window.setTimeout(() => setCopied(false), 1200);
//     } catch (err: unknown) {
//       console.error("Clipboard failed", err);
//     }
//   };

//   const totalEntries = data?.totalElements ?? 0;

//   return (
//     <div style={styles.page}>
//       <style>{`
//         .bn-btn { transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease; }
//         .bn-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }
//         .bn-li:hover { background: rgba(11,92,255,0.03); }
//       `}</style>

//       <div style={styles.topbar}>
//         <div>
//           <h2 style={styles.h2}>Χρήση του referral code μου</h2>

//         </div>

//         <div style={styles.pillsRow}>
//           <span style={styles.pill}>
//             Σύνολο χρήσεων: <strong>{loading ? "…" : totalEntries}</strong>
//           </span>

//           <span style={styles.pill}>
//             Remaining uses:{" "}
//             <strong>{detailsLoading ? "…" : details ? details.remainingUsages : "-"}</strong>
//           </span>

//           <span style={styles.pill}>
//             Points ανά χρήση: <strong>{detailsLoading ? "…" : details ? details.points : "-"}</strong>
//           </span>


//           <span style={styles.pill}>
//             Συνολικά Points: <strong>{detailsLoading ? "…" : details ? details.points* totalEntries  : "-"}</strong>
//           </span>

//           <button
//             type="button"
//             onClick={copyCode}
//             disabled={detailsLoading || !details?.code}
//             style={{
//               ...styles.pillCodeBtn,
//               cursor: detailsLoading || !details?.code ? "not-allowed" : "pointer",
//               opacity: detailsLoading || !details?.code ? 0.6 : 1,
//             }}
//             className="bn-btn"
//             title="Copy referral code"
//           >
//             Code:{" "}
//             <span style={styles.codeBox}>
//               {detailsLoading ? "…" : details?.code ? details.code : "-"}
//             </span>
//             {copied ? <span style={{ color: "#16a34a", fontWeight: 900 }}>Copied!</span> : null}
//           </button>
//         </div>
//       </div>

//       {details?.disabled && (
//         <div style={{ ...styles.alert, ...styles.alertDanger }}>
//           <strong>⚠️ Disabled:</strong> Δεν μπορούν να χρησιμοποιηθούν άλλο τα referral codes σου — είναι disabled.
//         </div>
//       )}

//       {error && (
//         <div style={{ ...styles.alert, ...styles.alertDanger }}>
//           <strong>Σφάλμα:</strong> {error}
//         </div>
//       )}

//       <div style={styles.card}>
//         {loading && !data && <p style={{ margin: 0, color: "#475569" }}>Φόρτωση…</p>}

//         {data && data.content.length === 0 && !loading && (
//           <div style={styles.emptyBox}>
//             <p style={styles.emptyTitle}>Δεν υπάρχει ακόμα χρήση</p>
//             <p style={styles.emptyText}>
//               Κανένας χρήστης δεν έχει χρησιμοποιήσει τον referral code σου μέχρι στιγμής.
//             </p>
//           </div>
//         )}

//         {data && data.content.length > 0 && (
//           <>
//             <div style={styles.listWrap}>
//               <div style={styles.listHeader}>
//                 <div>
//                   <p style={styles.listTitle}>Χρήστες που χρησιμοποίησαν τον κωδικό σου</p>
//                 </div>

//               </div>

//               <ul style={styles.ul}>
//                 {data.content.map((item, idx) => {
//                   const username = item.username;
//                   // const usedCode = item.code; // ✅ δείχνουμε και το code στο entry
//                   const letter = username ? username[0].toUpperCase() : "?";

//                   return (
//                     <li key={`${username}-${idx}`} style={styles.li} className="bn-li">
//                       <div style={styles.avatar}>{letter}</div>

//                       <div style={styles.userText}>
//                           <div style={styles.userName}>{username}</div>
//                         <div style={styles.userHint}>Used your referral code</div>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>

//             <div style={styles.pager}>
//               <div style={styles.pagerLeft}>
//                 <button
//                   type="button"
//                   onClick={handlePrev}
//                   disabled={page === 0 || loading}
//                   style={{
//                     ...styles.btn,
//                     ...(page === 0 || loading ? styles.btnDisabled : {}),
//                   }}
//                   className="bn-btn"
//                 >
//                   ← Previous
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleNext}
//                   disabled={!!data.last || loading}
//                   style={{
//                     ...styles.btn,
//                     ...(data.last || loading ? styles.btnDisabled : {}),
//                   }}
//                   className="bn-btn"
//                 >
//                   Next →
//                 </button>

//                 <span style={styles.meta}>
//                   Σελίδα <strong>{data.number + 1}</strong> / {data.totalPages}
//                 </span>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReferralCodeUsagePage;
// // src/components/ReferralCodeUsagePage.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   fetchReferralCodeUsage,
//   fetchOwnerReferralCodeDetails,
//   type ReferralCodeDetailsDto,
// } from "../api/Springboot/ReferralCodeService";
// import type { ReferralCodeUsageResponse } from "../models/Springboot/ReferralCode";
// import type { PageResponse } from "../admin/models/AdminResponseUser";

// const ReferralCodeUsagePage: React.FC = () => {
//   const [page, setPage] = useState<number>(0);

//   const [data, setData] = useState<PageResponse<ReferralCodeUsageResponse> | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [details, setDetails] = useState<ReferralCodeDetailsDto | null>(null);
//   const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

//   const [copied, setCopied] = useState<boolean>(false);

//   const styles = useMemo<Record<string, React.CSSProperties>>(
//     () => ({
//       page: { maxWidth: 1100, margin: "0 auto", padding: "20px 14px 40px" },

//       topbar: {
//         display: "flex",
//         alignItems: "flex-end",
//         justifyContent: "space-between",
//         gap: 12,
//         flexWrap: "wrap",
//         marginBottom: 14,
//       },
//       h2: { margin: 0, fontSize: "1.55rem", fontWeight: 900, color: "#0f172a" },

//       card: {
//         background: "#fff",
//         border: "1px solid rgba(15,23,42,0.08)",
//         borderRadius: 16,
//         boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
//         padding: 16,
//       },

//       pillsRow: {
//         display: "flex",
//         gap: 10,
//         flexWrap: "wrap",
//         alignItems: "center",
//       },

//       pill: {
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//         padding: "7px 10px",
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "rgba(11,92,255,0.06)",
//         color: "#0f172a",
//         fontWeight: 900,
//         fontSize: "0.86rem",
//         whiteSpace: "nowrap",
//       },

//       pillCodeBtn: {
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//         padding: "7px 10px",
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.14)",
//         background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,1))",
//         color: "#0f172a",
//         fontWeight: 900,
//         fontSize: "0.86rem",
//         whiteSpace: "nowrap",
//       },

//       codeBox: {
//         fontFamily:
//           "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
//         fontWeight: 900,
//         fontSize: "0.9rem",
//         padding: "3px 8px",
//         borderRadius: 10,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "rgba(11,92,255,0.06)",
//         display: "inline-block",
//       },

//       alert: {
//         marginTop: 10,
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f8fafc",
//         color: "#0f172a",
//         fontSize: "0.92rem",
//         whiteSpace: "pre-line",
//       },

//       alertDanger: {
//         borderColor: "rgba(220,38,38,0.25)",
//         background: "rgba(220,38,38,0.06)",
//       },

//       listWrap: {
//         marginTop: 12,
//         borderRadius: 14,
//         border: "1px solid rgba(15,23,42,0.10)",
//         overflow: "hidden",
//       },

//       listHeader: {
//         padding: "12px 14px",
//         borderBottom: "1px solid rgba(15,23,42,0.08)",
//         background: "linear-gradient(180deg, rgba(248,250,252,1), rgba(255,255,255,1))",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//       },

//       listTitle: { margin: 0, fontWeight: 900, color: "#0f172a" },

//       ul: { listStyle: "none", margin: 0, padding: 0, background: "#fff" },

//       li: {
//         display: "flex",
//         gap: 12,
//         alignItems: "center",
//         padding: "12px 14px",
//         borderBottom: "1px solid rgba(15,23,42,0.06)",
//       },

//       // ✅ avatar container (κύκλος)
//       avatar: {
//         width: 38,
//         height: 38,
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "rgba(11,92,255,0.06)",
//         display: "grid",
//         placeItems: "center",
//         fontWeight: 900,
//         color: "#0f172a",
//         flex: "0 0 auto",
//         overflow: "hidden",
//       },

//       // ✅ avatar img
//       avatarImg: {
//         width: "100%",
//         height: "100%",
//         objectFit: "cover",
//         display: "block",
//       },

//       userText: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
//       userName: { fontWeight: 900, color: "#0f172a" },
//       userHint: { color: "#64748b", fontSize: "0.88rem" },

//       pager: {
//         marginTop: 14,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//         flexWrap: "wrap",
//       },
//       pagerLeft: {
//         display: "flex",
//         alignItems: "center",
//         gap: 10,
//         flexWrap: "wrap",
//       },

//       btn: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "#0b5cff",
//         color: "#fff",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//       },
//       btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

//       meta: { color: "#475569", fontSize: "0.92rem", fontWeight: 800 },

//       emptyBox: {
//         marginTop: 12,
//         borderRadius: 16,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "linear-gradient(180deg, rgba(248,250,252,1), rgba(255,255,255,1))",
//         padding: 16,
//         color: "#0f172a",
//       },
//       emptyTitle: { margin: 0, fontWeight: 900, fontSize: "1.02rem" },
//       emptyText: { margin: "6px 0 0", color: "#475569", lineHeight: 1.45 },
//     }),
//     []
//   );

//   // Load usage
//   useEffect(() => {
//     let cancelled = false;

//     const loadUsage = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const result = await fetchReferralCodeUsage(page, 10);
//         if (!cancelled) setData(result);
//       } catch (err: unknown) {
//         console.error("Failed to load referral code usage:", err);
//         if (!cancelled) {
//           setError(err instanceof Error ? err.message : "Failed to load referral code usage.");
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     void loadUsage();
//     return () => {
//       cancelled = true;
//     };
//   }, [page]);

//   // Load owner details
//   useEffect(() => {
//     let cancelled = false;

//     const loadDetails = async () => {
//       try {
//         setDetailsLoading(true);
//         const res = await fetchOwnerReferralCodeDetails();
//         if (!cancelled) setDetails(res);
//       } catch (err: unknown) {
//         console.error("Failed to load owner referral code details:", err);
//         if (!cancelled) setDetails(null);
//       } finally {
//         if (!cancelled) setDetailsLoading(false);
//       }
//     };

//     void loadDetails();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const handlePrev = () => {
//     if (page > 0) setPage((p) => p - 1);
//   };

//   const handleNext = () => {
//     if (data && !data.last) setPage((p) => p + 1);
//   };

//   const copyCode = async () => {
//     if (!details?.code) return;

//     try {
//       await navigator.clipboard.writeText(details.code);
//       setCopied(true);
//       window.setTimeout(() => setCopied(false), 1200);
//     } catch (err: unknown) {
//       console.error("Clipboard failed", err);
//     }
//   };

//   const totalEntries = data?.totalElements ?? 0;

//   return (
//     <div style={styles.page}>
//       <style>{`
//         .bn-btn { transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease; }
//         .bn-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }
//         .bn-li:hover { background: rgba(11,92,255,0.03); }
//       `}</style>

//       <div style={styles.topbar}>
//         <div>
//          <h2 style={styles.h2}>My referral code usage</h2>
//         </div>

//         <div style={styles.pillsRow}>
//           <span style={styles.pill}>
//             Total uses: <strong>{loading ? "…" : totalEntries}</strong>
//           </span>

//           <span style={styles.pill}>
//             Remaining uses:{" "}
//             <strong>{detailsLoading ? "…" : details ? details.remainingUsages : "-"}</strong>
//           </span>

//           <span style={styles.pill}>
//             Points per use: <strong>{detailsLoading ? "…" : details ? details.points : "-"}</strong>
//           </span>

//           <span style={styles.pill}>
//             Total points:{" "}
//             <strong>{detailsLoading ? "…" : details ? details.points * totalEntries : "-"}</strong>
//           </span>

//           <button
//             type="button"
//             onClick={copyCode}
//             disabled={detailsLoading || !details?.code}
//             style={{
//               ...styles.pillCodeBtn,
//               cursor: detailsLoading || !details?.code ? "not-allowed" : "pointer",
//               opacity: detailsLoading || !details?.code ? 0.6 : 1,
//             }}
//             className="bn-btn"
//             title="Copy referral code"
//           >
//             Code:{" "}
//             <span style={styles.codeBox}>
//               {detailsLoading ? "…" : details?.code ? details.code : "-"}
//             </span>
//             {copied ? <span style={{ color: "#16a34a", fontWeight: 900 }}>Copied!</span> : null}
//           </button>
//         </div>
//       </div>

//       {details?.disabled && (
//         <div style={{ ...styles.alert, ...styles.alertDanger }}>
//           <strong>⚠️ Disabled:</strong> Your referral codes can no longer be used — they are disabled.
//         </div>
//       )}

//       {error && (
//         <div style={{ ...styles.alert, ...styles.alertDanger }}>
//           <strong>Error:</strong> {error}
//         </div>
//       )}

//       <div style={styles.card}>
//        {loading && !data && <p style={{ margin: 0, color: "#475569" }}>Loading...</p>}

//         {data && data.content.length === 0 && !loading && (
//           <div style={styles.emptyBox}>
//             <p style={styles.emptyTitle}>No usage yet</p>
//             <p style={styles.emptyText}>
//               No one has used your referral code yet.
//             </p>
//           </div>
//         )}

//         {data && data.content.length > 0 && (
//           <>
//             <div style={styles.listWrap}>
//               <div style={styles.listHeader}>
//                 <div>
//                   <p style={styles.listTitle}>Users who used your code</p>
//                 </div>
//               </div>

//               <ul style={styles.ul}>
//                 {data.content.map((item, idx) => {
//                   const username = item.username || "";
//                   const letter = username ? username[0].toUpperCase() : "?";

//                   // ✅ avatar url από backend (π.χ. "/images/BEARD_MAN_AVATAR.png")
//                   const avatarSrc =
//                     item.avatarUrl && item.avatarUrl.trim().length > 0
//                       ? item.avatarUrl
//                       : "/images/DEFAULT_AVATAR.png";

//                   return (
//                     <li key={`${username || "user"}-${idx}`} style={styles.li} className="bn-li">
//                       <div style={styles.avatar}>
//                         <img
//                           src={avatarSrc}
//                           alt={`${username || "User"} avatar`}
//                           style={styles.avatarImg}
//                           onError={(e) => {
//                             e.currentTarget.src = "/images/DEFAULT_AVATAR.png";
//                           }}
//                         />
//                       </div>

//                       <div style={styles.userText}>
//                         <div style={styles.userName}>{username || letter}</div>
//                         <div style={styles.userHint}>Used your referral code</div>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>

//             <div style={styles.pager}>
//               <div style={styles.pagerLeft}>
//                 <button
//                   type="button"
//                   onClick={handlePrev}
//                   disabled={page === 0 || loading}
//                   style={{
//                     ...styles.btn,
//                     ...(page === 0 || loading ? styles.btnDisabled : {}),
//                   }}
//                   className="bn-btn"
//                 >
//                   ← Previous
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleNext}
//                   disabled={!!data.last || loading}
//                   style={{
//                     ...styles.btn,
//                     ...(data.last || loading ? styles.btnDisabled : {}),
//                   }}
//                   className="bn-btn"
//                 >
//                   Next →
//                 </button>

//                 <span style={styles.meta}>
//                    Page <strong>{data.number + 1}</strong> / {data.totalPages}
//                 </span>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReferralCodeUsagePage;
// src/components/ReferralCodeUsagePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchReferralCodeUsage,
  fetchOwnerReferralCodeDetails,
  type ReferralCodeDetailsDto,
} from "../api/Springboot/ReferralCodeService";
import type { ReferralCodeUsageResponse } from "../models/Springboot/ReferralCode";
import type { PageResponse } from "../admin/models/AdminResponseUser";

interface ReferralCodeUsagePageProps {
  onBack?: () => void; // ✅ NEW: Back to all auctions
}

const ReferralCodeUsagePage: React.FC<ReferralCodeUsagePageProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(0);

  const [data, setData] = useState<PageResponse<ReferralCodeUsageResponse> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [details, setDetails] = useState<ReferralCodeDetailsDto | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/");
  };

  const styles = useMemo<Record<string, React.CSSProperties>>(
    () => ({
      page: { maxWidth: 1100, margin: "0 auto", padding: "20px 14px 40px" },

      topbar: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 14,
      },
      h2: { margin: 0, fontSize: "1.55rem", fontWeight: 900, color: "#0f172a" },

      card: {
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 16,
        boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
        padding: 16,
      },

      pillsRow: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
      },

      pill: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(11,92,255,0.06)",
        color: "#0f172a",
        fontWeight: 900,
        fontSize: "0.86rem",
        whiteSpace: "nowrap",
      },

      pillCodeBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,0.14)",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,1))",
        color: "#0f172a",
        fontWeight: 900,
        fontSize: "0.86rem",
        whiteSpace: "nowrap",
      },

      codeBox: {
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        fontWeight: 900,
        fontSize: "0.9rem",
        padding: "3px 8px",
        borderRadius: 10,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(11,92,255,0.06)",
        display: "inline-block",
      },

      alert: {
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "#f8fafc",
        color: "#0f172a",
        fontSize: "0.92rem",
        whiteSpace: "pre-line",
      },

      alertDanger: {
        borderColor: "rgba(220,38,38,0.25)",
        background: "rgba(220,38,38,0.06)",
      },

      listWrap: {
        marginTop: 12,
        borderRadius: 14,
        border: "1px solid rgba(15,23,42,0.10)",
        overflow: "hidden",
      },

      listHeader: {
        padding: "12px 14px",
        borderBottom: "1px solid rgba(15,23,42,0.08)",
        background: "linear-gradient(180deg, rgba(248,250,252,1), rgba(255,255,255,1))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      },

      listTitle: { margin: 0, fontWeight: 900, color: "#0f172a" },

      ul: { listStyle: "none", margin: 0, padding: 0, background: "#fff" },

      li: {
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "12px 14px",
        borderBottom: "1px solid rgba(15,23,42,0.06)",
      },

      // ✅ avatar container (κύκλος)
      avatar: {
        width: 38,
        height: 38,
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(11,92,255,0.06)",
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
        color: "#0f172a",
        flex: "0 0 auto",
        overflow: "hidden",
      },

      // ✅ avatar img
      avatarImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      },

      userText: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
      userName: { fontWeight: 900, color: "#0f172a" },
      userHint: { color: "#64748b", fontSize: "0.88rem" },

      pager: {
        marginTop: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
      },
      pagerLeft: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      },

      btn: {
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "#0b5cff",
        color: "#fff",
        fontWeight: 900,
        cursor: "pointer",
        whiteSpace: "nowrap",
      },
      btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

      meta: { color: "#475569", fontSize: "0.92rem", fontWeight: 800 },

      emptyBox: {
        marginTop: 12,
        borderRadius: 16,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "linear-gradient(180deg, rgba(248,250,252,1), rgba(255,255,255,1))",
        padding: 16,
        color: "#0f172a",
      },
      emptyTitle: { margin: 0, fontWeight: 900, fontSize: "1.02rem" },
      emptyText: { margin: "6px 0 0", color: "#475569", lineHeight: 1.45 },
    }),
    []
  );

  // ✅ Back button style (ίδιο pattern με NotificationsPage)
  const backBtn: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    fontWeight: 900,
    cursor: "pointer",
    margin: "0 0 12px 0",
  };

  // Load usage
  useEffect(() => {
    let cancelled = false;

    const loadUsage = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchReferralCodeUsage(page, 10);
        if (!cancelled) setData(result);
      } catch (err: unknown) {
        console.error("Failed to load referral code usage:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load referral code usage.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadUsage();
    return () => {
      cancelled = true;
    };
  }, [page]);

  // Load owner details
  useEffect(() => {
    let cancelled = false;

    const loadDetails = async () => {
      try {
        setDetailsLoading(true);
        const res = await fetchOwnerReferralCodeDetails();
        if (!cancelled) setDetails(res);
      } catch (err: unknown) {
        console.error("Failed to load owner referral code details:", err);
        if (!cancelled) setDetails(null);
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    };

    void loadDetails();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (data && !data.last) setPage((p) => p + 1);
  };

  const copyCode = async () => {
    if (!details?.code) return;

    try {
      await navigator.clipboard.writeText(details.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err: unknown) {
      console.error("Clipboard failed", err);
    }
  };

  const totalEntries = data?.totalElements ?? 0;

  return (
    <div style={styles.page}>
      <style>{`
        .bn-btn { transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease; }
        .bn-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }
        .bn-li:hover { background: rgba(11,92,255,0.03); }
      `}</style>

      {/* ✅ NEW: Back κουμπί (ίδιο pattern με NotificationsPage) */}
      <button type="button" onClick={handleBack} style={backBtn}>
        ← Back to all auctions
      </button>

      <div style={styles.topbar}>
        <div>
          <h2 style={styles.h2}>My referral code usage</h2>
        </div>

        <div style={styles.pillsRow}>
          <span style={styles.pill}>
            Total uses: <strong>{loading ? "…" : totalEntries}</strong>
          </span>

          <span style={styles.pill}>
            Remaining uses: <strong>{detailsLoading ? "…" : details ? details.remainingUsages : "-"}</strong>
          </span>

          <span style={styles.pill}>
            Points per use: <strong>{detailsLoading ? "…" : details ? details.points : "-"}</strong>
          </span>

          <span style={styles.pill}>
            Total points: <strong>{detailsLoading ? "…" : details ? details.points * totalEntries : "-"}</strong>
          </span>

          <button
            type="button"
            onClick={copyCode}
            disabled={detailsLoading || !details?.code}
            style={{
              ...styles.pillCodeBtn,
              cursor: detailsLoading || !details?.code ? "not-allowed" : "pointer",
              opacity: detailsLoading || !details?.code ? 0.6 : 1,
            }}
            className="bn-btn"
            title="Copy referral code"
          >
            Code:{" "}
            <span style={styles.codeBox}>
              {detailsLoading ? "…" : details?.code ? details.code : "-"}
            </span>
            {copied ? <span style={{ color: "#16a34a", fontWeight: 900 }}>Copied!</span> : null}
          </button>
        </div>
      </div>

      {details?.disabled && (
        <div style={{ ...styles.alert, ...styles.alertDanger }}>
          <strong>⚠️ Disabled:</strong> Your referral codes can no longer be used — they are disabled.
        </div>
      )}

      {error && (
        <div style={{ ...styles.alert, ...styles.alertDanger }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={styles.card}>
        {loading && !data && <p style={{ margin: 0, color: "#475569" }}>Loading...</p>}

        {data && data.content.length === 0 && !loading && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No usage yet</p>
            <p style={styles.emptyText}>No one has used your referral code yet.</p>
          </div>
        )}

        {data && data.content.length > 0 && (
          <>
            <div style={styles.listWrap}>
              <div style={styles.listHeader}>
                <div>
                  <p style={styles.listTitle}>Users who used your code</p>
                </div>
              </div>

              <ul style={styles.ul}>
                {data.content.map((item, idx) => {
                  const username = item.username || "";
                  const letter = username ? username[0].toUpperCase() : "?";

                  // ✅ avatar url από backend (π.χ. "/images/BEARD_MAN_AVATAR.png")
                  const avatarSrc =
                    item.avatarUrl && item.avatarUrl.trim().length > 0
                      ? item.avatarUrl
                      : "/images/DEFAULT_AVATAR.png";

                  return (
                    <li key={`${username || "user"}-${idx}`} style={styles.li} className="bn-li">
                      <div style={styles.avatar}>
                        <img
                          src={avatarSrc}
                          alt={`${username || "User"} avatar`}
                          style={styles.avatarImg}
                          onError={(e) => {
                            e.currentTarget.src = "/images/DEFAULT_AVATAR.png";
                          }}
                        />
                      </div>

                      <div style={styles.userText}>
                        <div style={styles.userName}>{username || letter}</div>
                        <div style={styles.userHint}>Used your referral code</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div style={styles.pager}>
              <div style={styles.pagerLeft}>
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={page === 0 || loading}
                  style={{
                    ...styles.btn,
                    ...(page === 0 || loading ? styles.btnDisabled : {}),
                  }}
                  className="bn-btn"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!!data.last || loading}
                  style={{
                    ...styles.btn,
                    ...(data.last || loading ? styles.btnDisabled : {}),
                  }}
                  className="bn-btn"
                >
                  Next →
                </button>

                <span style={styles.meta}>
                  Page <strong>{data.number + 1}</strong> / {data.totalPages}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralCodeUsagePage;
