// // src/components/AdminVerificationPage.tsx

// import React, { useEffect, useMemo, useState } from "react";
// import type { VerificationStatus } from "../../models/Springboot/Auction";
// import { 
//   adminGetVerificationVideos,
//   adminApproveVerification,
//   adminRejectVerification,
//   type AdminVerificationAuction, 
// } from "../../api/Springboot/backendVerificationService";

// interface AdminVerificationPageProps {
//   onBack?: () => void;
// }

// const AdminVerificationPage: React.FC<AdminVerificationPageProps> = ({
//   onBack,
// }) => {
//   const [items, setItems] = useState<AdminVerificationAuction[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [filter, setFilter] = useState<VerificationStatus | "ALL">(
//     "PENDING_REVIEW"
//   );
//   const [search, setSearch] = useState("");

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await adminGetVerificationVideos();
//       setItems(res);
//     } catch (e: unknown) {
//       console.error(e);
//       setError(
//         e instanceof Error ? e.message : "Failed to load verifications"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     return items
//       .filter((x) =>
//         filter === "ALL"
//           ? true
//           : (x.verificationStatus ?? "NOT_VERIFIED") === filter
//       )
//       .filter((x) => {
//         if (!q) return true;
//         const title = (x.title ?? "").toLowerCase();
//         const idStr = String(x.id);
//         return title.includes(q) || idStr.includes(q);
//       });
//   }, [items, filter, search]);

//   const label = (s?: VerificationStatus) => {
//     const v = s ?? "NOT_VERIFIED";
//     if (v === "PENDING_REVIEW") return "Pending review";
//     if (v === "VERIFIED") return "Verified ✅";
//     if (v === "REJECTED") return "Rejected ❌";
//     return "Not verified";
//   };

//   const doApprove = async (auctionId: number) => {
//     const ok = window.confirm(
//       `Approve verification for auction #${auctionId}?`
//     );
//     if (!ok) return;

//     try {
//       await adminApproveVerification(auctionId);
//       setItems((prev) =>
//         prev.map((x) =>
//           x.id === auctionId ? { ...x, verificationStatus: "VERIFIED" } : x
//         )
//       );
//     } catch (e: unknown) {
//       console.error(e);
//       window.alert(
//         e instanceof Error ? e.message : "Failed to approve verification"
//       );
//     }
//   };

//   const doReject = async (auctionId: number) => {
//     const ok = window.confirm(
//       `Reject verification for auction #${auctionId}?`
//     ); 
//     if (!ok) return;

//     try {
//       await adminRejectVerification(auctionId);
//       setItems((prev) =>
//         prev.map((x) =>
//           x.id === auctionId ? { ...x, verificationStatus: "REJECTED" } : x
//         )
//       );
//     } catch (e: unknown) {
//       console.error(e);
//       window.alert(
//         e instanceof Error ? e.message : "Failed to reject verification"
//       );
//     }
//   };

//   return (
//     <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
//       <h1>Admin – Verification Reviews</h1>

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
//               setFilter(e.target.value as VerificationStatus | "ALL")
//             }
//             style={{ marginLeft: "0.5rem" }}
//           >
//             <option value="ALL">ALL</option>
//             <option value="PENDING_REVIEW">PENDING_REVIEW</option>
//             <option value="VERIFIED">VERIFIED</option>
//             <option value="REJECTED">REJECTED</option>
//             <option value="NOT_VERIFIED">NOT_VERIFIED</option>
//           </select>
//         </label>

//         <label>
//           Search:
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="title ή auction id"
//             style={{ marginLeft: "0.5rem" }}
//           />
//         </label>

//         <button type="button" onClick={load} disabled={loading}>
//           {loading ? "Loading..." : "Refresh"}
//         </button>
//       </div>

//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

//       {filtered.length === 0 && !loading && (
//         <p>No verification videos found.</p>
//       )}

//       {filtered.map((a) => {
//         const vStatus = (a.verificationStatus ??
//           "NOT_VERIFIED") as VerificationStatus;

//         return (
//           <div
//             key={a.id}
//             style={{
//               border: "1px solid #ddd",
//               borderRadius: 6,
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
//               <div>
//                 <div style={{ fontWeight: "bold" }}>
//                   #{a.id} — {a.title ?? "(no title)"}
//                 </div>
//                 <div>
//                   Auction status: <strong>{a.status ?? "N/A"}</strong>
//                 </div>
//                 <div>
//                   Verification: <strong>{label(vStatus)}</strong>
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: "flex",
//                   gap: "0.5rem",
//                   alignItems: "center",
//                 }}
//               >
//                 <button type="button" onClick={() => doApprove(a.id)}>
//                   Approve
//                 </button>
//                 <button type="button" onClick={() => doReject(a.id)}>
//                   Reject
//                 </button>
//               </div>
//             </div>

//             {/* 🔹 Auction details */}
//             <div style={{ marginTop: "0.75rem" }}>
//               <div style={{ fontWeight: "bold" }}>Auction details</div>
//               <div>Category: {a.categoryName ?? "—"}</div>
//               <div>
//                 Starting amount:{" "}
//                 {a.startingAmount != null ? `${a.startingAmount}€` : "—"}
//               </div>
//               <div>
//                 Min bid increment:{" "}
//                 {a.minBidIncrement != null ? `${a.minBidIncrement}€` : "—"}
//               </div>
//               <div>Shipping: {a.shippingCostPayer ?? "—"}</div>
//               <div>Start date: {a.startDate ?? "—"}</div>
//               <div>End date: {a.endDate ?? "—"}</div>
//               <div>
//                 Seller: {a.sellerUsername ? a.sellerUsername : "(no seller)"}
//               </div>
//             </div>

//             {/* 🔹 Auction images */}
//             <div style={{ marginTop: "0.75rem" }}>
//               <div style={{ fontWeight: "bold" }}>Auction images</div>
//               {a.imageUrls && a.imageUrls.length > 0 ? (
//                 <div
//                   style={{
//                     display: "flex",
//                     flexWrap: "wrap",
//                     gap: "0.5rem",
//                     marginTop: "0.5rem",
//                   }}
//                 >
//                   {a.imageUrls.map((url, idx) => (
//                     <a
//                       key={idx}
//                       href={url}
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       <img
//                         src={url}
//                         alt={`auction-${a.id}-img-${idx}`}
//                         style={{
//                           width: 120,
//                           height: 120,
//                           objectFit: "cover",
//                           border: "1px solid #ddd",
//                         }}
//                       />
//                     </a>
//                   ))}
//                 </div>
//               ) : (
//                 <p style={{ color: "#666" }}>No images.</p>
//               )}
//             </div>

//             {/* 🔹 Video preview */}
//             <div style={{ marginTop: "0.75rem" }}>
//               {a.verificationVideoUrl ? (
//                 <>
//                   <video
//                     src={a.verificationVideoUrl}
//                     controls
//                     preload="metadata"
//                     style={{ width: "100%", maxHeight: 420 }}
//                   />
//                   <div style={{ marginTop: "0.25rem" }}>
//                     <a
//                       href={a.verificationVideoUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                     >
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
//     </div>
//   );
// };

// export default AdminVerificationPage;
// src/components/AdminVerificationPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { VerificationStatus } from "../../models/Springboot/Auction";
import {
  adminGetVerificationVideos,
  adminApproveVerification,
  adminRejectVerification,
  type AdminVerificationAuction,
} from "../../api/Springboot/backendVerificationService";

interface AdminVerificationPageProps {
  onBack?: () => void;
}

const AdminVerificationPage: React.FC<AdminVerificationPageProps> = ({
  onBack,
}) => {
  const [items, setItems] = useState<AdminVerificationAuction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<VerificationStatus | "ALL">(
    "PENDING_REVIEW"
  );
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetVerificationVideos();
      setItems(res);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items
      .filter((x) =>
        filter === "ALL"
          ? true
          : (x.verificationStatus ?? "NOT_VERIFIED") === filter
      )
      .filter((x) => {
        if (!q) return true;
        const title = (x.title ?? "").toLowerCase();
        const idStr = String(x.id);
        return title.includes(q) || idStr.includes(q);
      });
  }, [items, filter, search]);

  const label = (s?: VerificationStatus) => {
    const v = s ?? "NOT_VERIFIED";
    if (v === "PENDING_REVIEW") return "Pending review";
    if (v === "VERIFIED") return "Verified";
    if (v === "REJECTED") return "Rejected";
    return "Not verified";
  };

  const statusTone = (s?: VerificationStatus) => {
    const v = s ?? "NOT_VERIFIED";
    if (v === "PENDING_REVIEW") return "warning";
    if (v === "VERIFIED") return "success";
    if (v === "REJECTED") return "danger";
    return "neutral";
  };

  const doApprove = async (auctionId: number) => {
    const ok = window.confirm(`Approve verification for auction #${auctionId}?`);
    if (!ok) return;

    try {
      await adminApproveVerification(auctionId);
      setItems((prev) =>
        prev.map((x) =>
          x.id === auctionId ? { ...x, verificationStatus: "VERIFIED" } : x
        )
      );
    } catch (e: unknown) {
      console.error(e);
      window.alert(
        e instanceof Error ? e.message : "Failed to approve verification"
      );
    }
  };

  const doReject = async (auctionId: number) => {
    const ok = window.confirm(`Reject verification for auction #${auctionId}?`);
    if (!ok) return;

    try {
      await adminRejectVerification(auctionId);
      setItems((prev) =>
        prev.map((x) =>
          x.id === auctionId ? { ...x, verificationStatus: "REJECTED" } : x
        )
      );
    } catch (e: unknown) {
      console.error(e);
      window.alert(
        e instanceof Error ? e.message : "Failed to reject verification"
      );
    }
  };

  const FILTERS: Array<{ value: VerificationStatus | "ALL"; text: string }> = [
    { value: "ALL", text: "All" },
    { value: "PENDING_REVIEW", text: "Pending" },
    { value: "VERIFIED", text: "Verified" },
    { value: "REJECTED", text: "Rejected" },
    { value: "PENDING_UPLOAD", text: "Not uploaded yet" },
  ];

  return (
    <div className="avp-page">
      <div className="avp-shell">
        {/* Header */}
        <div className="avp-header">
          <div className="avp-headerLeft">
            {onBack && (
              <button
                type="button"
                className="avp-backBtn"
                onClick={onBack}
                aria-label="Back"
              >
                ← Back
              </button>
            )}

            <div>
              <div className="avp-title">Verification reviews</div>
              <div className="avp-subtitle">
                Review seller verification videos and approve or reject them.
              </div>
            </div>
          </div>

          <div className="avp-headerRight">
            <button
              type="button"
              className="avp-btn avp-btnGhost"
              onClick={load}
              disabled={loading}
              title="Refresh list"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="avp-toolbar">
          <div className="avp-filters" role="tablist" aria-label="Filter">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={
                  "avp-pill " + (filter === f.value ? "is-active" : "")
                }
                onClick={() => setFilter(f.value)}
                role="tab"
                aria-selected={filter === f.value}
              >
                {f.text}
              </button>
            ))}
          </div>

          <div className="avp-searchWrap">
            <span className="avp-searchIcon" aria-hidden="true">
              🔎
            </span>
            <input
              className="avp-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or auction id…"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="avp-alert" role="alert">
            <div className="avp-alertTitle">Σφάλμα</div>
            <div className="avp-alertText">{error}</div>
          </div>
        )}

        {/* Empty */}
        {filtered.length === 0 && !loading && (
          <div className="avp-empty">
            <div className="avp-emptyTitle">No results</div>
            <div className="avp-emptyText">
              No verification videos found for the current filters.
            </div>
          </div>
        )}

        {/* List */}
        <div className="avp-list">
          {filtered.map((a) => {
            const vStatus = (a.verificationStatus ??
              "NOT_VERIFIED") as VerificationStatus;

            return (
              <div key={a.id} className="avp-card">
                <div className="avp-cardTop">
                  <div className="avp-cardHeading">
                    <div className="avp-cardTitle">
                      <span className="avp-cardId">#{a.id}</span>
                      <span className="avp-cardDash">—</span>
                      <span className="avp-cardName">
                        {a.title ?? "(no title)"}
                      </span>
                    </div>

                    <div className="avp-badges">
                      <span className={"avp-badge tone-" + statusTone(vStatus)}>
                        {label(vStatus)}
                      </span>
                      <span className="avp-badge tone-neutral">
                        Auction: {a.status ?? "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="avp-actions">
                    <button
                      type="button"
                      className="avp-btn avp-btnPrimary"
                      onClick={() => doApprove(a.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="avp-btn avp-btnDanger"
                      onClick={() => doReject(a.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="avp-cardBody">
                  {/* Left column */}
                  <div className="avp-col">
                    <div className="avp-section">
                      <div className="avp-sectionTitle">Auction details</div>

                      <dl className="avp-dl">
                        <div className="avp-dlRow">
                          <dt>Category</dt>
                          <dd>{a.categoryName ?? "—"}</dd>
                        </div>

                        <div className="avp-dlRow">
                          <dt>Starting amount</dt>
                          <dd>
                            {a.startingAmount != null
                              ? `${a.startingAmount}€`
                              : "—"}
                          </dd>
                        </div>

                        <div className="avp-dlRow">
                          <dt>Min bid increment</dt>
                          <dd>
                            {a.minBidIncrement != null
                              ? `${a.minBidIncrement}€`
                              : "—"}
                          </dd>
                        </div>

                        <div className="avp-dlRow">
                          <dt>Shipping</dt>
                          <dd>{a.shippingCostPayer ?? "—"}</dd>
                        </div>

                        <div className="avp-dlRow">
                          <dt>Start date</dt>
                          <dd>{a.startDate ?? "—"}</dd>
                        </div>

                        <div className="avp-dlRow">
                          <dt>End date</dt>
                          <dd>{a.endDate ?? "—"}</dd>
                        </div>

                        <div className="avp-dlRow">
                          <dt>Seller</dt>
                          <dd>{a.sellerUsername ? a.sellerUsername : "—"}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="avp-section">
                      <div className="avp-sectionTitle">Auction images</div>

                      {a.imageUrls && a.imageUrls.length > 0 ? (
                        <div className="avp-thumbGrid">
                          {a.imageUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="avp-thumbLink"
                              title="Open image"
                            >
                              <img
                                src={url}
                                alt={`auction-${a.id}-img-${idx}`}
                                className="avp-thumb"
                                loading="lazy"
                              />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="avp-muted">No images.</div>
                      )}
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="avp-col">
                    <div className="avp-section">
                      <div className="avp-sectionTitle">Verification video</div>

                      {a.verificationVideoUrl ? (
                        <>
                          <div className="avp-videoWrap">
                            <video
                              src={a.verificationVideoUrl}
                              controls
                              preload="metadata"
                              className="avp-video"
                            />
                          </div>
                          <div className="avp-linkRow">
                            <a
                              href={a.verificationVideoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="avp-link"
                            >
                              Open video in new tab →
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="avp-muted">No video URL.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Styles (brand primary: #0090FF) */}
      <style>{`
        .avp-page{
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
        .avp-shell{
          max-width:1100px;
          margin:0 auto;
          padding:24px 16px 48px;
        }

        /* Header */
        .avp-header{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:16px;
          margin-bottom:16px;
        }
        .avp-headerLeft{
          display:flex;
          align-items:flex-start;
          gap:12px;
        }
        .avp-title{
          font-size:22px;
          font-weight:800;
          letter-spacing:-0.02em;
        }
        .avp-subtitle{
          margin-top:4px;
          color:var(--muted);
          font-size:13px;
        }
        .avp-backBtn{
          border:1px solid var(--border);
          background:rgba(255,255,255,0.9);
          padding:8px 10px;
          border-radius:10px;
          cursor:pointer;
          transition:transform .12s ease, box-shadow .12s ease, background .12s ease;
          box-shadow:0 1px 0 rgba(15,23,42,0.04);
          white-space:nowrap;
        }
        .avp-backBtn:hover{ transform:translateY(-1px); box-shadow:var(--shadow2); background:#fff; }
        .avp-backBtn:active{ transform:translateY(0px); }

        /* Toolbar */
        .avp-toolbar{
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
        .avp-filters{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        }
        .avp-pill{
          border:1px solid var(--border);
          background:#fff;
          color:var(--text);
          padding:8px 10px;
          border-radius:999px;
          font-size:13px;
          cursor:pointer;
          transition:background .12s ease, transform .12s ease, border-color .12s ease;
        }
        .avp-pill:hover{ transform:translateY(-1px); border-color:rgba(0,144,255,0.35); }
        .avp-pill.is-active{
          background:rgba(0,144,255,0.10);
          border-color:rgba(0,144,255,0.45);
          color:var(--text);
          font-weight:700;
        }
        .avp-searchWrap{
          position:relative;
          min-width:240px;
          flex:1;
          max-width:380px;
        }
        .avp-searchIcon{
          position:absolute;
          left:12px;
          top:50%;
          transform:translateY(-50%);
          font-size:14px;
          opacity:0.7;
          pointer-events:none;
        }
        .avp-search{
          width:100%;
          border:1px solid var(--border);
          background:#fff;
          padding:10px 12px 10px 34px;
          border-radius:12px;
          outline:none;
          font-size:13px;
          transition:border-color .12s ease, box-shadow .12s ease;
        }
        .avp-search:focus{
          border-color:rgba(0,144,255,0.55);
          box-shadow:0 0 0 4px rgba(0,144,255,0.12);
        }

        /* Buttons */
        .avp-btn{
          border:1px solid var(--border);
          background:#fff;
          color:var(--text);
          padding:10px 12px;
          border-radius:12px;
          cursor:pointer;
          font-weight:700;
          font-size:13px;
          transition:transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease, color .12s ease;
          white-space:nowrap;
        }
        .avp-btn:disabled{
          opacity:.6;
          cursor:not-allowed;
          transform:none !important;
          box-shadow:none !important;
        }
        .avp-btn:hover{ transform:translateY(-1px); box-shadow:var(--shadow2); }
        .avp-btn:active{ transform:translateY(0px); }

        .avp-btnPrimary{
          background:var(--primary);
          border-color:rgba(0,144,255,0.55);
          color:#fff;
        }
        .avp-btnPrimary:hover{
          box-shadow:0 10px 26px rgba(0,144,255,0.20);
          border-color:rgba(0,144,255,0.75);
        }
        .avp-btnDanger{
          background:#fff;
          border-color:rgba(239,68,68,0.35);
          color:#B91C1C;
        }
        .avp-btnDanger:hover{
          box-shadow:0 10px 26px rgba(239,68,68,0.12);
          border-color:rgba(239,68,68,0.55);
        }
        .avp-btnGhost{
          background:rgba(255,255,255,0.85);
        }

        /* Alerts / empty */
        .avp-alert{
          border:1px solid rgba(239,68,68,0.25);
          background:rgba(239,68,68,0.06);
          border-radius:14px;
          padding:12px 14px;
          margin-bottom:16px;
        }
        .avp-alertTitle{ font-weight:900; color:#991B1B; }
        .avp-alertText{ margin-top:4px; color:#7F1D1D; font-size:13px; }

        .avp-empty{
          border:1px dashed rgba(15,23,42,0.18);
          background:rgba(255,255,255,0.65);
          border-radius:16px;
          padding:22px;
          text-align:center;
        }
        .avp-emptyTitle{ font-weight:900; font-size:16px; }
        .avp-emptyText{ margin-top:6px; color:var(--muted); font-size:13px; }

        /* Cards */
        .avp-list{ margin-top:16px; display:flex; flex-direction:column; gap:14px; }
        .avp-card{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:18px;
          box-shadow:var(--shadow);
          overflow:hidden;
        }
        .avp-cardTop{
          padding:14px 14px 12px;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          border-bottom:1px solid rgba(15,23,42,0.08);
          background:linear-gradient(180deg, rgba(0,144,255,0.06) 0%, rgba(255,255,255,1) 70%);
        }
        .avp-cardHeading{ min-width:0; }
        .avp-cardTitle{
          display:flex;
          gap:8px;
          align-items:baseline;
          flex-wrap:wrap;
          font-weight:900;
          letter-spacing:-0.015em;
        }
        .avp-cardId{
          color:var(--primary);
        }
        .avp-cardDash{ color:rgba(15,23,42,0.35); }
        .avp-cardName{
          color:var(--text);
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          max-width:680px;
        }
        .avp-badges{
          margin-top:8px;
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        }
        .avp-badge{
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:6px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:800;
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
        .tone-danger{
          background:rgba(239,68,68,0.10);
          border-color:rgba(239,68,68,0.25);
          color:#991B1B;
        }

        .avp-actions{
          display:flex;
          gap:10px;
          align-items:center;
        }

        .avp-cardBody{
          display:grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap:14px;
          padding:14px;
        }
        .avp-col{
          display:flex;
          flex-direction:column;
          gap:12px;
          min-width:0;
        }

        .avp-section{
          border:1px solid rgba(15,23,42,0.08);
          background:rgba(255,255,255,0.9);
          border-radius:16px;
          padding:12px;
        }
        .avp-sectionTitle{
          font-weight:900;
          margin-bottom:10px;
          letter-spacing:-0.01em;
        }
        .avp-muted{
          color:var(--muted);
          font-size:13px;
        }

        /* Details (DL) */
        .avp-dl{
          display:flex;
          flex-direction:column;
          gap:8px;
          margin:0;
        }
        .avp-dlRow{
          display:flex;
          justify-content:space-between;
          gap:12px;
          padding:8px 10px;
          border-radius:12px;
          background:rgba(15,23,42,0.03);
          border:1px solid rgba(15,23,42,0.06);
        }
        .avp-dlRow dt{
          margin:0;
          color:rgba(15,23,42,0.65);
          font-size:12px;
          font-weight:800;
        }
        .avp-dlRow dd{
          margin:0;
          font-size:13px;
          font-weight:800;
          color:rgba(15,23,42,0.90);
          text-align:right;
          word-break:break-word;
        }

        /* Thumbnails */
        .avp-thumbGrid{
          display:grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap:10px;
        }
        .avp-thumbLink{
          display:block;
          border-radius:14px;
          overflow:hidden;
          border:1px solid rgba(15,23,42,0.10);
          background:rgba(15,23,42,0.03);
          transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
        }
        .avp-thumbLink:hover{
          transform:translateY(-1px);
          box-shadow:var(--shadow2);
          border-color:rgba(0,144,255,0.35);
        }
        .avp-thumb{
          width:100%;
          height:86px;
          object-fit:cover;
          display:block;
        }

        /* Video */
        .avp-videoWrap{
          border-radius:16px;
          overflow:hidden;
          border:1px solid rgba(15,23,42,0.10);
          background:rgba(15,23,42,0.03);
        }
        .avp-video{
          width:100%;
          max-height:420px;
          display:block;
        }
        .avp-linkRow{
          margin-top:10px;
        }
        .avp-link{
          color:var(--primary);
          font-weight:900;
          text-decoration:none;
          font-size:13px;
        }
        .avp-link:hover{ text-decoration:underline; }

        /* Responsive */
        @media (max-width: 920px){
          .avp-cardBody{ grid-template-columns: 1fr; }
          .avp-searchWrap{ max-width:none; }
          .avp-cardName{ max-width: 100%; white-space:normal; }
          .avp-thumbGrid{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 520px){
          .avp-header{ flex-direction:column; align-items:stretch; }
          .avp-actions{ width:100%; }
          .avp-actions .avp-btn{ flex:1; }
          .avp-toolbar{ flex-direction:column; align-items:stretch; }
          .avp-searchWrap{ min-width:0; }
          .avp-thumbGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
};

export default AdminVerificationPage;
