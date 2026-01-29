// // src/components/AdminProblemReportsPage.tsx

// import React, { useEffect, useMemo, useState } from "react";
// import { adminGetProblemReports,  adminResolveProblemReport,
//   type AdminProblemReport,
//   type ProblemReportStatus,
//  } from "../../api/Springboot/backendProblemReportService";

// interface AdminProblemReportsPageProps {
//   onBack?: () => void;
// }

// export const AdminProblemReportsPage: React.FC<AdminProblemReportsPageProps> = ({
//   onBack,
// }) => {
//   const [items, setItems] = useState<AdminProblemReport[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [filter, setFilter] = useState<"ALL" | ProblemReportStatus>("OPEN");
//   const [search, setSearch] = useState("");

//   // 🔹 ΝΕΟ: state για popup (auction ή seller details)
//   const [detailsPopup, setDetailsPopup] = useState<{
//     type: "auction" | "seller";
//     report: AdminProblemReport;
//   } | null>(null);

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await adminGetProblemReports({
//         status: filter,
//         page: 0,
//         size: 50,
//       });
//       setItems(res.content);
//     } catch (e: unknown) {
//       console.error(e);
//       setError(e instanceof Error ? e.message : "Failed to load reports");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filter]);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return items;

//     return items.filter((r) => {
//       const u = r.reporter;
//       const a = r.auction;
//       const seller = a?.seller;

//       return (
//         String(r.id).includes(q) ||
//         String(r.auctionId).includes(q) ||
//         (r.auctionTitle ?? "").toLowerCase().includes(q) ||
//         (r.title ?? "").toLowerCase().includes(q) ||
//         (u.username ?? "").toLowerCase().includes(q) ||
//         (u.email ?? "").toLowerCase().includes(q) ||
//         (u.phoneNumber ?? "").toLowerCase().includes(q) ||
//         (u.firebaseId ?? "").toLowerCase().includes(q) ||
//         (a?.title ?? "").toLowerCase().includes(q) ||
//         (a?.categoryName ?? "").toLowerCase().includes(q) ||
//         (seller?.username ?? "").toLowerCase().includes(q) ||
//         (seller?.email ?? "").toLowerCase().includes(q)
//       );
//     });
//   }, [items, search]);

//   const doResolve = async (reportId: number) => {
//     const ok = window.confirm(`Mark report #${reportId} as RESOLVED?`);
//     if (!ok) return;

//     try {
//       await adminResolveProblemReport(reportId);
//       setItems((prev) =>
//         prev.map((x) => (x.id === reportId ? { ...x, status: "RESOLVED" } : x))
//       );
//     } catch (e: unknown) {
//       console.error(e);
//       window.alert(e instanceof Error ? e.message : "Failed to resolve report");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>
//       <h1>Admin – Problem Reports</h1>

//       {onBack && (
//         <button
//           type="button"
//           onClick={onBack}
//           style={{ marginBottom: "1rem" }}
//         >
//           ← Back
//         </button>
//       )}

//       <div
//         style={{
//           display: "flex",
//           gap: "0.75rem",
//           alignItems: "center",
//           marginBottom: "1rem",
//         }}
//       >
//         <label>
//           Filter:
//           <select
//             value={filter}
//             onChange={(e) =>
//               setFilter(e.target.value as "ALL" | ProblemReportStatus)
//             }
//             style={{ marginLeft: "0.5rem" }}
//           >
//             <option value="ALL">ALL</option>
//             <option value="OPEN">OPEN</option>
//             <option value="RESOLVED">RESOLVED</option>
//           </select>
//         </label>

//         <label>
//           Search:
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="auction id/title, report title, username, email, phone..."
//             style={{ marginLeft: "0.5rem", width: 420 }}
//           />
//         </label>

//         <button type="button" onClick={load} disabled={loading}>
//           {loading ? "Loading..." : "Refresh"}
//         </button>
//       </div>

//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
//       {!loading && filtered.length === 0 && <p>No reports found.</p>}

//       {filtered.map((r) => {
//         const u = r.reporter;
//         const loc = u.locationDto;

//         //const a = r.auction;

//         return (
//           <div
//             key={r.id}
//             style={{
//               border: "1px solid #ddd",
//               borderRadius: 8,
//               padding: "1rem",
//               marginBottom: "1rem",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 gap: "1rem",
//               }}
//             >
//               <div style={{ flex: 1 }}>
//                 <div style={{ fontWeight: "bold" }}>
//                   Report #{r.id} — {r.title}
//                 </div>

//                 <div>
//                   Auction: <strong>#{r.auctionId}</strong> — {r.auctionTitle}
//                 </div>

//                 <div>
//                   Status: <strong>{r.status}</strong> — Created: {r.createdAt}
//                 </div>

//                 <hr style={{ margin: "0.75rem 0" }} />

//                 <div style={{ fontWeight: "bold" }}>Reporter details</div>
//                 <div>id: {u.id}</div>
//                 <div>username: {u.username}</div>
//                 <div>email: {u.email}</div>
//                 <div>phoneNumber: {u.phoneNumber}</div>
//                 <div>firebaseId: {u.firebaseId}</div>
//                 <div>rewardPoints: {u.rewardPoints}</div>
//                 <div>role: {u.role}</div>
//                 <div>isBanned: {String(u.isBanned)}</div>
//                 <div>isAnonymized: {String(u.isAnonymized)}</div>
//                 <div>eligibleForChat: {String(u.eligibleForChat)}</div>
//                 <div>
//                   location:{" "}
//                   {loc
//                     ? `${loc.region}, ${loc.country}, ${loc.city}, ${loc.addressLine}, ${loc.postalCode}`
//                     : "—"}
//                 </div>

//                 {/* 🔹 Αντί για inline auction/seller details, βάζουμε κουμπιά */}
//                 <div
//                   style={{
//                     marginTop: "0.75rem",
//                     display: "flex",
//                     gap: "0.5rem",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setDetailsPopup({ type: "auction", report: r })
//                     }
//                   >
//                     Auction details
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setDetailsPopup({ type: "seller", report: r })
//                     }
//                   >
//                     Seller details
//                   </button>
//                 </div>

//                 <hr style={{ margin: "0.75rem 0" }} />

//                 <div style={{ fontWeight: "bold" }}>Report description</div>
//                 <div style={{ whiteSpace: "pre-wrap" }}>{r.description}</div>
//               </div>

//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "0.5rem",
//                 }}
//               >
//                 <button
//                   type="button"
//                   onClick={() => doResolve(r.id)}
//                   disabled={r.status === "RESOLVED"}
//                 >
//                   {r.status === "RESOLVED" ? "Resolved" : "Mark as resolved"}
//                 </button>
//               </div>
//             </div>

//             <div style={{ marginTop: "0.75rem" }}>
//               {r.videoUrl ? (
//                 <>
//                   <video
//                     src={r.videoUrl}
//                     controls
//                     preload="metadata"
//                     style={{ width: "100%", maxHeight: 420 }}
//                   />
//                   <div style={{ marginTop: "0.25rem" }}>
//                     <a href={r.videoUrl} target="_blank" rel="noreferrer">
//                       Open video in new tab
//                     </a>
//                   </div>
//                 </>
//               ) : (
//                 <p style={{ color: "#666" }}>No video URL.</p>
//               )}
//             </div>
//           </div>
//         );
//       })}

//       {/* 🔹 Popup overlay για Auction / Seller details */}
//       {detailsPopup &&
//         (() => {
//           const r = detailsPopup.report;
//           const a = r.auction;
//           const seller = a?.seller;
//           const sellerLoc = seller?.locationDto;

//           return (
//             <div
//               onClick={() => setDetailsPopup(null)}
//               style={{
//                 position: "fixed",
//                 inset: 0,
//                 backgroundColor: "rgba(0,0,0,0.5)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 zIndex: 2000,
//               }}
//             >
//               <div
//                 onClick={(e) => e.stopPropagation()}
//                 style={{
//                   backgroundColor: "white",
//                   padding: "1rem",
//                   borderRadius: 8,
//                   maxWidth: 800,
//                   width: "90vw",
//                   maxHeight: "80vh",
//                   overflowY: "auto",
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                 }}
//               >
//                 <h2 style={{ marginTop: 0 }}>
//                   {detailsPopup.type === "auction"
//                     ? `Auction #${r.auctionId} details`
//                     : "Seller (auction owner) details"}
//                 </h2>

//                 {detailsPopup.type === "auction" && (
//                   <div>
//                     <div style={{ fontWeight: "bold" }}>Auction details</div>
//                     <div>id: {a?.id ?? r.auctionId}</div>
//                     <div>title: {a?.title ?? r.auctionTitle}</div>
//                     <div>category: {a?.categoryName ?? "—"}</div>
//                     <div>status: {a?.status ?? "—"}</div>
//                     <div>shipping: {a?.shippingCostPayer ?? "—"}</div>
//                     <div>
//                       startingAmount: {a?.startingAmount ?? "—"}
//                       {a?.startingAmount != null && "€"}
//                     </div>
//                     <div>
//                       minBidIncrement: {a?.minBidIncrement ?? "—"}
//                       {a?.minBidIncrement != null && "€"}
//                     </div>
//                     <div>startDate: {a?.startDate ?? "—"}</div>
//                     <div>endDate: {a?.endDate ?? "—"}</div>
//                     <div style={{ marginTop: "0.25rem" }}>
//                       shortDescription: {a?.shortDescription ?? "—"}
//                     </div>
//                     <div style={{ marginTop: "0.25rem" }}>
//                       description:{" "}
//                       <span style={{ whiteSpace: "pre-wrap" }}>
//                         {a?.description ?? "—"}
//                       </span>
//                     </div>

//                     <div
//                       style={{ marginTop: "0.75rem", fontWeight: "bold" }}
//                     >
//                       Auction images
//                     </div>
//                     {a?.imageUrls?.length ? (
//                       <div
//                         style={{
//                           display: "flex",
//                           flexWrap: "wrap",
//                           gap: "0.5rem",
//                           marginTop: "0.5rem",
//                         }}
//                       >
//                         {a.imageUrls.map((url, idx) => (
//                           <a
//                             key={idx}
//                             href={url}
//                             target="_blank"
//                             rel="noreferrer"
//                           >
//                             <img
//                               src={url}
//                               alt={`auction-${a.id}-img-${idx}`}
//                               style={{
//                                 width: 120,
//                                 height: 120,
//                                 objectFit: "cover",
//                                 border: "1px solid #ddd",
//                               }}
//                             />
//                           </a>
//                         ))}
//                       </div>
//                     ) : (
//                       <p style={{ color: "#666" }}>No auction images.</p>
//                     )}
//                   </div>
//                 )}

//                 {detailsPopup.type === "seller" && (
//                   <div>
//                     <div style={{ fontWeight: "bold" }}>
//                       Seller (auction owner)
//                     </div>
//                     {seller ? (
//                       <>
//                         <div>id: {seller.id}</div>
//                         <div>username: {seller.username}</div>
//                         <div>email: {seller.email}</div>
//                         <div>phoneNumber: {seller.phoneNumber}</div>
//                         <div>firebaseId: {seller.firebaseId}</div>
//                         <div>rewardPoints: {seller.rewardPoints}</div>
//                         <div>role: {seller.role}</div>
//                         <div>isBanned: {String(seller.isBanned)}</div>
//                         <div>isAnonymized: {String(seller.isAnonymized)}</div>
//                         <div>
//                           eligibleForChat: {String(seller.eligibleForChat)}
//                         </div>
//                         <div>
//                           location:{" "}
//                           {sellerLoc
//                             ? `${sellerLoc.region}, ${sellerLoc.country}, ${sellerLoc.city}, ${sellerLoc.addressLine}, ${sellerLoc.postalCode}`
//                             : "—"}
//                         </div>
//                       </>
//                     ) : (
//                       <p style={{ color: "#666" }}>No seller info.</p>
//                     )}
//                   </div>
//                 )}

//                 <div
//                   style={{ marginTop: "0.75rem", textAlign: "right" }}
//                 >
//                   <button type="button" onClick={() => setDetailsPopup(null)}>
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })()}
//     </div>
//   );
// };

// export default AdminProblemReportsPage;
// src/components/AdminProblemReportsPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  adminGetProblemReports,
  adminResolveProblemReport,
  type AdminProblemReport,
  type ProblemReportStatus,
} from "../../api/Springboot/backendProblemReportService";

interface AdminProblemReportsPageProps {
  onBack?: () => void;
}

export const AdminProblemReportsPage: React.FC<AdminProblemReportsPageProps> = ({
  onBack,
}) => {
  const [items, setItems] = useState<AdminProblemReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"ALL" | ProblemReportStatus>("OPEN");
  const [search, setSearch] = useState("");

  // 🔹 state για popup (auction ή seller details) — ίδιο business logic
  const [detailsPopup, setDetailsPopup] = useState<{
    type: "auction" | "seller";
    report: AdminProblemReport;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetProblemReports({
        status: filter,
        page: 0,
        size: 50,
      });
      setItems(res.content);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((r) => {
      const u = r.reporter;
      const a = r.auction;
      const seller = a?.seller;

      return (
        String(r.id).includes(q) ||
        String(r.auctionId).includes(q) ||
        (r.auctionTitle ?? "").toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.phoneNumber ?? "").toLowerCase().includes(q) ||
        (u.firebaseId ?? "").toLowerCase().includes(q) ||
        (a?.title ?? "").toLowerCase().includes(q) ||
        (a?.categoryName ?? "").toLowerCase().includes(q) ||
        (seller?.username ?? "").toLowerCase().includes(q) ||
        (seller?.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const badgeTone = (s?: ProblemReportStatus) => {
    const v = s ?? "OPEN";
    if (v === "OPEN") return "warning";
    if (v === "RESOLVED") return "success";
    return "neutral";
  };

  const doResolve = async (reportId: number) => {
    const ok = window.confirm(`Mark report #${reportId} as RESOLVED?`);
    if (!ok) return;

    try {
      await adminResolveProblemReport(reportId);
      setItems((prev) =>
        prev.map((x) => (x.id === reportId ? { ...x, status: "RESOLVED" } : x))
      );
    } catch (e: unknown) {
      console.error(e);
      window.alert(e instanceof Error ? e.message : "Failed to resolve report");
    }
  };

  return (
    <div className="apr-page">
      <div className="apr-shell">
        {/* Header */}
        <div className="apr-header">
          <div className="apr-headerLeft">
            {onBack && (
              <button
                type="button"
                className="apr-backBtn"
                onClick={onBack}
                aria-label="Back"
              >
                ← Back
              </button>
            )}

            <div>
              <div className="apr-title">Problem reports</div>
              <div className="apr-subtitle">
                Review user reports, inspect auction/seller info, and resolve issues.
              </div>
            </div>
          </div>

          <div className="apr-headerRight">
            <button
              type="button"
              className="apr-btn apr-btnGhost"
              onClick={load}
              disabled={loading}
              title="Refresh list"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="apr-toolbar">
          <div className="apr-filters" role="tablist" aria-label="Filter">
            {(
              [
                { value: "ALL", text: "All" },
                { value: "OPEN", text: "Open" },
                { value: "RESOLVED", text: "Resolved" },
              ] as Array<{ value: "ALL" | ProblemReportStatus; text: string }>
            ).map((f) => (
              <button
                key={f.value}
                type="button"
                className={"apr-pill " + (filter === f.value ? "is-active" : "")}
                onClick={() => setFilter(f.value)}
                role="tab"
                aria-selected={filter === f.value}
              >
                {f.text}
              </button>
            ))}
          </div>

          <div className="apr-searchWrap">
            <span className="apr-searchIcon" aria-hidden="true">
              🔎
            </span>
            <input
              className="apr-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by auction id/title, report title, username, email, phone…"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="apr-alert" role="alert">
            <div className="apr-alertTitle">Σφάλμα</div>
            <div className="apr-alertText">{error}</div>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="apr-empty">
            <div className="apr-emptyTitle">No results</div>
            <div className="apr-emptyText">
              No reports found for the current filter/search.
            </div>
          </div>
        )}

        {/* List */}
        <div className="apr-list">
          {filtered.map((r) => {
            const u = r.reporter;
            const loc = u.locationDto;

            return (
              <div key={r.id} className="apr-card">
                <div className="apr-cardTop">
                  <div className="apr-cardHeading">
                    <div className="apr-cardTitle">
                      <span className="apr-cardId">Report #{r.id}</span>
                      <span className="apr-cardDash">—</span>
                      <span className="apr-cardName">{r.title ?? "(no title)"}</span>
                    </div>

                    <div className="apr-badges">
                      <span className={"apr-badge tone-" + badgeTone(r.status)}>
                        {r.status}
                      </span>
                      <span className="apr-badge tone-neutral">
                        Created: {r.createdAt ?? "—"}
                      </span>
                      <span className="apr-badge tone-neutral">
                        Auction #{r.auctionId} — {r.auctionTitle ?? "—"}
                      </span>
                    </div>
                  </div>

                  <div className="apr-actions">
                    <button
                      type="button"
                      className="apr-btn apr-btnPrimary"
                      onClick={() => setDetailsPopup({ type: "auction", report: r })}
                      title="Open auction details"
                    >
                      Auction
                    </button>
                    <button
                      type="button"
                      className="apr-btn apr-btnGhost"
                      onClick={() => setDetailsPopup({ type: "seller", report: r })}
                      title="Open seller details"
                    >
                      Seller
                    </button>
                    <button
                      type="button"
                      className="apr-btn apr-btnSuccess"
                      onClick={() => doResolve(r.id)}
                      disabled={r.status === "RESOLVED"}
                      title="Mark as resolved"
                    >
                      {r.status === "RESOLVED" ? "Resolved" : "Resolve"}
                    </button>
                  </div>
                </div>

                <div className="apr-cardBody">
                  {/* Left */}
                  <div className="apr-col">
                    <div className="apr-section">
                      <div className="apr-sectionTitle">Reporter</div>

                      <dl className="apr-dl">
                        <div className="apr-dlRow">
                          <dt>id</dt>
                          <dd>{u.id ?? "—"}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>username</dt>
                          <dd>{u.username ?? "—"}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>email</dt>
                          <dd>{u.email ?? "—"}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>phone</dt>
                          <dd>{u.phoneNumber ?? "—"}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>firebaseId</dt>
                          <dd>{u.firebaseId ?? "—"}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>role</dt>
                          <dd>{u.role ?? "—"}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>rewardPoints</dt>
                          <dd>{u.rewardPoints ?? "—"}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>isBanned</dt>
                          <dd>{String(u.isBanned)}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>isAnonymized</dt>
                          <dd>{String(u.isAnonymized)}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>eligibleForChat</dt>
                          <dd>{String(u.eligibleForChat)}</dd>
                        </div>
                        <div className="apr-dlRow">
                          <dt>location</dt>
                          <dd>
                            {loc
                              ? `${loc.region}, ${loc.country}, ${loc.city}, ${loc.addressLine}, ${loc.postalCode}`
                              : "—"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="apr-section">
                      <div className="apr-sectionTitle">Report description</div>
                      <div className="apr-desc">
                        {r.description ? r.description : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="apr-col">
                    <div className="apr-section">
                      <div className="apr-sectionTitle">Evidence video</div>

                      {r.videoUrl ? (
                        <>
                          <div className="apr-videoWrap">
                            <video
                              src={r.videoUrl}
                              controls
                              preload="metadata"
                              className="apr-video"
                            />
                          </div>
                          <div className="apr-linkRow">
                            <a
                              href={r.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="apr-link"
                            >
                              Open video in new tab →
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="apr-muted">No video URL.</div>
                      )}
                    </div>

                    <div className="apr-section">
                      <div className="apr-sectionTitle">Quick actions</div>
                      <div className="apr-quick">
                        <button
                          type="button"
                          className="apr-btn apr-btnPrimary"
                          onClick={() => setDetailsPopup({ type: "auction", report: r })}
                        >
                          View auction details
                        </button>
                        <button
                          type="button"
                          className="apr-btn apr-btnGhost"
                          onClick={() => setDetailsPopup({ type: "seller", report: r })}
                        >
                          View seller details
                        </button>
                        <button
                          type="button"
                          className="apr-btn apr-btnSuccess"
                          onClick={() => doResolve(r.id)}
                          disabled={r.status === "RESOLVED"}
                        >
                          {r.status === "RESOLVED" ? "Already resolved" : "Mark as resolved"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Auction / Seller details — ίδιο state, ίδιο content */}
      {detailsPopup &&
        (() => {
          const r = detailsPopup.report;
          const a = r.auction;
          const seller = a?.seller;
          const sellerLoc = seller?.locationDto;

          return (
            <div
              className="apr-modalOverlay"
              onClick={() => setDetailsPopup(null)}
              role="dialog"
              aria-modal="true"
            >
              <div className="apr-modal" onClick={(e) => e.stopPropagation()}>
                <div className="apr-modalHeader">
                  <div>
                    <div className="apr-modalTitle">
                      {detailsPopup.type === "auction"
                        ? `Auction #${r.auctionId} details`
                        : "Seller (auction owner) details"}
                    </div>
                    <div className="apr-modalSubtitle">
                      Report #{r.id} — {r.title ?? "(no title)"}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="apr-iconBtn"
                    onClick={() => setDetailsPopup(null)}
                    aria-label="Close"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="apr-modalBody">
                  {detailsPopup.type === "auction" && (
                    <div className="apr-modalGrid">
                      <div className="apr-section">
                        <div className="apr-sectionTitle">Auction details</div>

                        <dl className="apr-dl">
                          <div className="apr-dlRow">
                            <dt>id</dt>
                            <dd>{a?.id ?? r.auctionId}</dd>
                          </div>
                          <div className="apr-dlRow">
                            <dt>title</dt>
                            <dd>{a?.title ?? r.auctionTitle ?? "—"}</dd>
                          </div>
                          <div className="apr-dlRow">
                            <dt>category</dt>
                            <dd>{a?.categoryName ?? "—"}</dd>
                          </div>
                          <div className="apr-dlRow">
                            <dt>status</dt>
                            <dd>{a?.status ?? "—"}</dd>
                          </div>
                          <div className="apr-dlRow">
                            <dt>shipping</dt>
                            <dd>{a?.shippingCostPayer ?? "—"}</dd>
                          </div>
                          <div className="apr-dlRow">
                            <dt>startingAmount</dt>
                            <dd>
                              {a?.startingAmount ?? "—"}
                              {a?.startingAmount != null && "€"}
                            </dd>
                          </div>
                          <div className="apr-dlRow">
                            <dt>minBidIncrement</dt>
                            <dd>
                              {a?.minBidIncrement ?? "—"}
                              {a?.minBidIncrement != null && "€"}
                            </dd>
                          </div>
                          <div className="apr-dlRow">
                            <dt>startDate</dt>
                            <dd>{a?.startDate ?? "—"}</dd>
                          </div>
                          <div className="apr-dlRow">
                            <dt>endDate</dt>
                            <dd>{a?.endDate ?? "—"}</dd>
                          </div>
                        </dl>

                        <div className="apr-divider" />

                        <div className="apr-subBlock">
                          <div className="apr-miniTitle">shortDescription</div>
                          <div className="apr-muted">
                            {a?.shortDescription ?? "—"}
                          </div>
                        </div>

                        <div className="apr-subBlock">
                          <div className="apr-miniTitle">description</div>
                          <div className="apr-desc">
                            {a?.description ?? "—"}
                          </div>
                        </div>
                      </div>

                      <div className="apr-section">
                        <div className="apr-sectionTitle">Auction images</div>
                        {a?.imageUrls?.length ? (
                          <div className="apr-thumbGrid">
                            {a.imageUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="apr-thumbLink"
                                title="Open image"
                              >
                                <img
                                  src={url}
                                  alt={`auction-${a.id}-img-${idx}`}
                                  className="apr-thumb"
                                  loading="lazy"
                                />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="apr-muted">No auction images.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {detailsPopup.type === "seller" && (
                    <div className="apr-modalGrid">
                      <div className="apr-section">
                        <div className="apr-sectionTitle">Seller</div>
                        {seller ? (
                          <dl className="apr-dl">
                            <div className="apr-dlRow">
                              <dt>id</dt>
                              <dd>{seller.id ?? "—"}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>username</dt>
                              <dd>{seller.username ?? "—"}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>email</dt>
                              <dd>{seller.email ?? "—"}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>phone</dt>
                              <dd>{seller.phoneNumber ?? "—"}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>firebaseId</dt>
                              <dd>{seller.firebaseId ?? "—"}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>rewardPoints</dt>
                              <dd>{seller.rewardPoints ?? "—"}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>role</dt>
                              <dd>{seller.role ?? "—"}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>isBanned</dt>
                              <dd>{String(seller.isBanned)}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>isAnonymized</dt>
                              <dd>{String(seller.isAnonymized)}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>eligibleForChat</dt>
                              <dd>{String(seller.eligibleForChat)}</dd>
                            </div>
                            <div className="apr-dlRow">
                              <dt>location</dt>
                              <dd>
                                {sellerLoc
                                  ? `${sellerLoc.region}, ${sellerLoc.country}, ${sellerLoc.city}, ${sellerLoc.addressLine}, ${sellerLoc.postalCode}`
                                  : "—"}
                              </dd>
                            </div>
                          </dl>
                        ) : (
                          <div className="apr-muted">No seller info.</div>
                        )}
                      </div>

                      <div className="apr-section">
                        <div className="apr-sectionTitle">Context</div>
                        <div className="apr-muted">
                          Auction #{r.auctionId} — {r.auctionTitle ?? "—"}
                        </div>
                        <div className="apr-divider" />
                        <div className="apr-quick">
                          <button
                            type="button"
                            className="apr-btn apr-btnPrimary"
                            onClick={() =>
                              setDetailsPopup({ type: "auction", report: r })
                            }
                          >
                            View auction details
                          </button>
                          <button
                            type="button"
                            className="apr-btn apr-btnSuccess"
                            onClick={() => doResolve(r.id)}
                            disabled={r.status === "RESOLVED"}
                          >
                            {r.status === "RESOLVED"
                              ? "Already resolved"
                              : "Mark as resolved"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="apr-modalFooter">
                  <button
                    type="button"
                    className="apr-btn apr-btnGhost"
                    onClick={() => setDetailsPopup(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Styles (brand primary: #0090FF) */}
      <style>{`
        .apr-page{
          --primary:#0090FF;
          --bg:#F6F8FC;
          --card:#FFFFFF;
          --text:#0F172A;
          --muted:#64748B;
          --border:rgba(15,23,42,0.10);
          --shadow:0 10px 30px rgba(15,23,42,0.08);
          --shadow2:0 6px 18px rgba(15,23,42,0.08);
          min-height:100vh;
          background:var(--bg);
          color:var(--text);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        }
        .apr-shell{
          max-width:1100px;
          margin:0 auto;
          padding:24px 16px 48px;
        }

        /* Header */
        .apr-header{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:16px;
          margin-bottom:16px;
        }
        .apr-headerLeft{
          display:flex;
          align-items:flex-start;
          gap:12px;
        }
        .apr-title{
          font-size:22px;
          font-weight:800;
          letter-spacing:-0.02em;
        }
        .apr-subtitle{
          margin-top:4px;
          color:var(--muted);
          font-size:13px;
        }
        .apr-backBtn{
          border:1px solid var(--border);
          background:rgba(255,255,255,0.9);
          padding:8px 10px;
          border-radius:10px;
          cursor:pointer;
          transition:transform .12s ease, box-shadow .12s ease, background .12s ease;
          box-shadow:0 1px 0 rgba(15,23,42,0.04);
          white-space:nowrap;
        }
        .apr-backBtn:hover{ transform:translateY(-1px); box-shadow:var(--shadow2); background:#fff; }
        .apr-backBtn:active{ transform:translateY(0px); }

        /* Toolbar */
        .apr-toolbar{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:12px;
          background:rgba(255,255,255,0.85);
          border:1px solid var(--border);
          border-radius:14px;
          box-shadow:0 1px 0 rgba(15,23,42,0.04);
          margin-bottom:16px;
          backdrop-filter: blur(10px);
        }
        .apr-filters{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        }
        .apr-pill{
          border:1px solid var(--border);
          background:#fff;
          color:var(--text);
          padding:8px 10px;
          border-radius:999px;
          font-size:13px;
          cursor:pointer;
          transition:background .12s ease, transform .12s ease, border-color .12s ease;
        }
        .apr-pill:hover{ transform:translateY(-1px); border-color:rgba(0,144,255,0.35); }
        .apr-pill.is-active{
          background:rgba(0,144,255,0.10);
          border-color:rgba(0,144,255,0.45);
          color:var(--text);
          font-weight:800;
        }

        .apr-searchWrap{
          position:relative;
          min-width:260px;
          flex:1;
          max-width:520px;
        }
        .apr-searchIcon{
          position:absolute;
          left:12px;
          top:50%;
          transform:translateY(-50%);
          font-size:14px;
          opacity:0.7;
          pointer-events:none;
        }
        .apr-search{
          width:100%;
          border:1px solid var(--border);
          background:#fff;
          padding:10px 12px 10px 34px;
          border-radius:12px;
          outline:none;
          font-size:13px;
          transition:border-color .12s ease, box-shadow .12s ease;
        }
        .apr-search:focus{
          border-color:rgba(0,144,255,0.55);
          box-shadow:0 0 0 4px rgba(0,144,255,0.12);
        }

        /* Buttons */
        .apr-btn{
          border:1px solid var(--border);
          background:#fff;
          color:var(--text);
          padding:10px 12px;
          border-radius:12px;
          cursor:pointer;
          font-weight:800;
          font-size:13px;
          transition:transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease, color .12s ease;
          white-space:nowrap;
        }
        .apr-btn:disabled{
          opacity:.6;
          cursor:not-allowed;
          transform:none !important;
          box-shadow:none !important;
        }
        .apr-btn:hover{ transform:translateY(-1px); box-shadow:var(--shadow2); }
        .apr-btn:active{ transform:translateY(0px); }

        .apr-btnPrimary{
          background:var(--primary);
          border-color:rgba(0,144,255,0.55);
          color:#fff;
        }
        .apr-btnPrimary:hover{
          box-shadow:0 10px 26px rgba(0,144,255,0.20);
          border-color:rgba(0,144,255,0.75);
        }
        .apr-btnSuccess{
          background:rgba(34,197,94,0.12);
          border-color:rgba(34,197,94,0.28);
          color:#166534;
        }
        .apr-btnSuccess:hover{
          box-shadow:0 10px 26px rgba(34,197,94,0.14);
          border-color:rgba(34,197,94,0.45);
        }
        .apr-btnGhost{
          background:rgba(255,255,255,0.85);
        }

        /* Alerts / empty */
        .apr-alert{
          border:1px solid rgba(239,68,68,0.25);
          background:rgba(239,68,68,0.06);
          border-radius:14px;
          padding:12px 14px;
          margin-bottom:16px;
        }
        .apr-alertTitle{ font-weight:900; color:#991B1B; }
        .apr-alertText{ margin-top:4px; color:#7F1D1D; font-size:13px; }

        .apr-empty{
          border:1px dashed rgba(15,23,42,0.18);
          background:rgba(255,255,255,0.65);
          border-radius:16px;
          padding:22px;
          text-align:center;
        }
        .apr-emptyTitle{ font-weight:900; font-size:16px; }
        .apr-emptyText{ margin-top:6px; color:var(--muted); font-size:13px; }

        /* Cards */
        .apr-list{ margin-top:16px; display:flex; flex-direction:column; gap:14px; }
        .apr-card{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:18px;
          box-shadow:var(--shadow);
          overflow:hidden;
        }
        .apr-cardTop{
          padding:14px 14px 12px;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          border-bottom:1px solid rgba(15,23,42,0.08);
          background:linear-gradient(180deg, rgba(0,144,255,0.06) 0%, rgba(255,255,255,1) 70%);
        }
        .apr-cardHeading{ min-width:0; flex:1; }
        .apr-cardTitle{
          display:flex;
          gap:8px;
          align-items:baseline;
          flex-wrap:wrap;
          font-weight:900;
          letter-spacing:-0.015em;
        }
        .apr-cardId{ color:var(--primary); }
        .apr-cardDash{ color:rgba(15,23,42,0.35); }
        .apr-cardName{
          color:var(--text);
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          max-width:680px;
        }
        .apr-badges{
          margin-top:8px;
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        }
        .apr-badge{
          display:inline-flex;
          align-items:center;
          padding:6px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:900;
          border:1px solid var(--border);
          background:#fff;
        }
        .tone-neutral{
          background:rgba(15,23,42,0.04);
          border-color:rgba(15,23,42,0.10);
          color:rgba(15,23,42,0.80);
        }
        .tone-warning{
          background:rgba(245,158,11,0.10);
          border-color:rgba(245,158,11,0.25);
          color:#92400E;
        }
        .tone-success{
          background:rgba(34,197,94,0.10);
          border-color:rgba(34,197,94,0.25);
          color:#166534;
        }

        .apr-actions{
          display:flex;
          gap:10px;
          align-items:center;
          flex-wrap:wrap;
          justify-content:flex-end;
        }

        .apr-cardBody{
          display:grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap:14px;
          padding:14px;
        }
        .apr-col{
          display:flex;
          flex-direction:column;
          gap:12px;
          min-width:0;
        }
        .apr-section{
          border:1px solid rgba(15,23,42,0.08);
          background:rgba(255,255,255,0.9);
          border-radius:16px;
          padding:12px;
        }
        .apr-sectionTitle{
          font-weight:900;
          margin-bottom:10px;
          letter-spacing:-0.01em;
        }
        .apr-muted{
          color:var(--muted);
          font-size:13px;
        }
        .apr-desc{
          white-space:pre-wrap;
          font-size:13px;
          color:rgba(15,23,42,0.85);
          background:rgba(15,23,42,0.03);
          border:1px solid rgba(15,23,42,0.06);
          border-radius:12px;
          padding:10px;
          line-height:1.45;
        }

        /* DL */
        .apr-dl{
          display:flex;
          flex-direction:column;
          gap:8px;
          margin:0;
        }
        .apr-dlRow{
          display:flex;
          justify-content:space-between;
          gap:12px;
          padding:8px 10px;
          border-radius:12px;
          background:rgba(15,23,42,0.03);
          border:1px solid rgba(15,23,42,0.06);
        }
        .apr-dlRow dt{
          margin:0;
          color:rgba(15,23,42,0.65);
          font-size:12px;
          font-weight:900;
        }
        .apr-dlRow dd{
          margin:0;
          font-size:13px;
          font-weight:900;
          color:rgba(15,23,42,0.90);
          text-align:right;
          word-break:break-word;
        }

        /* Video */
        .apr-videoWrap{
          border-radius:16px;
          overflow:hidden;
          border:1px solid rgba(15,23,42,0.10);
          background:rgba(15,23,42,0.03);
        }
        .apr-video{
          width:100%;
          max-height:420px;
          display:block;
        }
        .apr-linkRow{ margin-top:10px; }
        .apr-link{
          color:var(--primary);
          font-weight:900;
          text-decoration:none;
          font-size:13px;
        }
        .apr-link:hover{ text-decoration:underline; }

        .apr-quick{
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        /* Modal */
        .apr-modalOverlay{
          position:fixed;
          inset:0;
          background:rgba(2,6,23,0.55);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:16px;
          z-index:2000;
        }
        .apr-modal{
          width:min(980px, 96vw);
          max-height:86vh;
          overflow:hidden;
          border-radius:18px;
          border:1px solid rgba(255,255,255,0.18);
          background:rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          box-shadow:0 24px 70px rgba(0,0,0,0.35);
          display:flex;
          flex-direction:column;
        }
        .apr-modalHeader{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          padding:14px 14px 12px;
          border-bottom:1px solid rgba(15,23,42,0.10);
          background:linear-gradient(180deg, rgba(0,144,255,0.10) 0%, rgba(255,255,255,1) 70%);
        }
        .apr-modalTitle{
          font-weight:950;
          letter-spacing:-0.02em;
          font-size:16px;
        }
        .apr-modalSubtitle{
          margin-top:4px;
          color:var(--muted);
          font-size:12px;
        }
        .apr-iconBtn{
          border:1px solid rgba(15,23,42,0.12);
          background:#fff;
          width:38px;
          height:38px;
          border-radius:12px;
          cursor:pointer;
          font-weight:900;
          transition:transform .12s ease, box-shadow .12s ease;
        }
        .apr-iconBtn:hover{ transform:translateY(-1px); box-shadow:var(--shadow2); }
        .apr-modalBody{
          padding:14px;
          overflow:auto;
        }
        .apr-modalFooter{
          padding:12px 14px;
          border-top:1px solid rgba(15,23,42,0.10);
          display:flex;
          justify-content:flex-end;
          background:rgba(255,255,255,0.75);
        }
        .apr-modalGrid{
          display:grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap:14px;
        }
        .apr-divider{
          height:1px;
          background:rgba(15,23,42,0.10);
          margin:12px 0;
        }
        .apr-subBlock{ margin-top:10px; }
        .apr-miniTitle{
          font-weight:900;
          font-size:12px;
          color:rgba(15,23,42,0.75);
          margin-bottom:6px;
        }

        /* Thumbnails in modal */
        .apr-thumbGrid{
          display:grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap:10px;
        }
        .apr-thumbLink{
          display:block;
          border-radius:14px;
          overflow:hidden;
          border:1px solid rgba(15,23,42,0.10);
          background:rgba(15,23,42,0.03);
          transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
        }
        .apr-thumbLink:hover{
          transform:translateY(-1px);
          box-shadow:var(--shadow2);
          border-color:rgba(0,144,255,0.35);
        }
        .apr-thumb{
          width:100%;
          height:92px;
          object-fit:cover;
          display:block;
        }

        /* Responsive */
        @media (max-width: 980px){
          .apr-cardBody{ grid-template-columns: 1fr; }
          .apr-searchWrap{ max-width:none; }
          .apr-cardName{ max-width: 100%; white-space:normal; }
          .apr-modalGrid{ grid-template-columns: 1fr; }
          .apr-thumbGrid{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 520px){
          .apr-header{ flex-direction:column; align-items:stretch; }
          .apr-toolbar{ flex-direction:column; align-items:stretch; }
          .apr-searchWrap{ min-width:0; }
          .apr-actions{ width:100%; justify-content:stretch; }
          .apr-actions .apr-btn{ flex:1; }
          .apr-thumbGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
};

export default AdminProblemReportsPage;
