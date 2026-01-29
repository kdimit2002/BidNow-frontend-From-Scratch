

// // src/admin/components/AdminReferralCodesPage.tsx
// import React, { useEffect, useState } from "react";
// import { getReferralCodes,editReferralCode } from "../../api/Springboot/ReferralCodeService";
// import type {
//   PageResponse,
// } from "../models/AdminResponseUser";

// import type { ReferralCodeDtoAdminResponse,ReferralCodeRequest } from "../../models/Springboot/ReferralCode";

// const PAGE_SIZE = 20;

// const thStyle: React.CSSProperties = {
//   borderBottom: "1px solid #ddd",
//   textAlign: "left",
//   padding: "8px",
// };

// const tdStyle: React.CSSProperties = {
//   borderBottom: "1px solid #eee",
//   padding: "8px",
// };

// const AdminReferralCodesPage: React.FC = () => {
//   const [page, setPage] = useState(0);
//   const [data, setData] =
//     useState<PageResponse<ReferralCodeDtoAdminResponse> | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // 👉 selected + editing state
//   const [selectedCode, setSelectedCode] =
//     useState<ReferralCodeDtoAdminResponse | null>(null);
//   const [editForm, setEditForm] = useState<ReferralCodeRequest | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [saveError, setSaveError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchCodes = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const result = await getReferralCodes(page, PAGE_SIZE);
//         if (!cancelled) {
//           setData(result);
//         }
//       } catch (err: unknown) {
//         if (!cancelled) {
//           const message =
//             err instanceof Error ? err.message : "Failed to load referral codes";
//           setError(message);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchCodes();

//     return () => {
//       cancelled = true;
//     };
//   }, [page]);

//   const handlePrev = () => {
//     if (page > 0) setPage((p) => p - 1);
//   };

//   const handleNext = () => {
//     if (data && !data.last) {
//       setPage((p) => p + 1);
//     }
//   };

//   const handleSelectRow = (code: ReferralCodeDtoAdminResponse) => {
//     setSelectedCode(code);
//     setIsEditing(false);
//     setSaveError(null);

//     // προετοιμάζουμε edit form
//     setEditForm({
//       code: code.code,
//       ownerId: code.ownerId,
//       rewardPoints: code.rewardPoints,
//       ownerRewardPoints: code.ownerRewardPoints,
//       maxUses: code.maxUses,
//       isDisabled: code.isDisabled,
//     });
//   };

//   const handleEditChange = <K extends keyof ReferralCodeRequest>(
//     field: K,
//     value: ReferralCodeRequest[K]
//   ) => {
//     setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
//   };

//   const handleStartEdit = () => {
//     if (!selectedCode || !editForm) return;
//     setIsEditing(true);
//     setSaveError(null);
//   };

//   const handleCancelEdit = () => {
//     if (!selectedCode) {
//       setIsEditing(false);
//       setEditForm(null);
//       return;
//     }

//     // reset στα original values
//     setEditForm({
//       code: selectedCode.code,
//       ownerId: selectedCode.ownerId,
//       rewardPoints: selectedCode.rewardPoints,
//       ownerRewardPoints: selectedCode.ownerRewardPoints,
//       maxUses: selectedCode.maxUses,
//       isDisabled: selectedCode.isDisabled,
//     });
//     setIsEditing(false);
//     setSaveError(null);
//   };

//   const handleSubmitEdit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedCode || !editForm) return;

//     setSaving(true);
//     setSaveError(null);

//     // little cleaning (να είμαστε σίγουροι ότι είναι αριθμοί)
//     const cleanForm: ReferralCodeRequest = {
//       ...editForm,
//       ownerId: Number(editForm.ownerId),
//       rewardPoints: Number(editForm.rewardPoints),
//       ownerRewardPoints: Number(editForm.ownerRewardPoints),
//       maxUses: Number(editForm.maxUses),
//     };

//     try {
//       const updated = await editReferralCode(selectedCode.id, cleanForm);

//       // update selected
//       setSelectedCode(updated);
//       setIsEditing(false);

//       // update list
//       setData((prev) =>
//         prev
//           ? {
//               ...prev,
//               content: prev.content.map((c) =>
//                 c.id === updated.id ? updated : c
//               ),
//             }
//           : prev
//       );
//     } catch (err: unknown) {
//       const message =
//         err instanceof Error ? err.message : "Failed to update referral code";
//       setSaveError(message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h2>Admin – Referral Codes</h2>

//       {loading && <p>Loading referral codes...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {data && data.content.length === 0 && !loading && (
//         <p>No referral codes found.</p>
//       )}

//       {data && data.content.length > 0 && (
//         <>
//           <table
//             style={{
//               width: "100%",
//               borderCollapse: "collapse",
//               marginTop: "8px",
//             }}
//           >
//             <thead>
//               <tr>
//                 <th style={thStyle}>ID</th>
//                 <th style={thStyle}>Code</th>
//                 <th style={thStyle}>Owner ID</th>
//                 <th style={thStyle}>Reward Points (User)</th>
//                 <th style={thStyle}>Reward Points (Owner)</th>
//                 <th style={thStyle}>Max Uses</th>
//                 <th style={thStyle}>Uses so far</th>
//                 <th style={thStyle}>Remaining</th>
//                 <th style={thStyle}>Disabled</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.content.map((refCode) => {
//                 const remaining =
//                   refCode.maxUses != null && refCode.usesSoFar != null
//                     ? refCode.maxUses - refCode.usesSoFar
//                     : undefined;

//                 return (
//                   <tr
//                     key={refCode.id}
//                     onClick={() => handleSelectRow(refCode)}
//                     style={{ cursor: "pointer" }}
//                   >
//                     <td style={tdStyle}>{refCode.id}</td>
//                     <td style={tdStyle}>
//                       <code>{refCode.code}</code>
//                     </td>
//                     <td style={tdStyle}>{refCode.ownerId}</td>
//                     <td style={tdStyle}>{refCode.rewardPoints}</td>
//                     <td style={tdStyle}>{refCode.ownerRewardPoints}</td>
//                     <td style={tdStyle}>{refCode.maxUses}</td>
//                     <td style={tdStyle}>{refCode.usesSoFar}</td>
//                     <td style={tdStyle}>
//                       {remaining != null ? remaining : "-"}
//                     </td>
//                     <td style={tdStyle}>
//                       {refCode.isDisabled ? "Yes" : "No"}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div
//             style={{
//               marginTop: "16px",
//               display: "flex",
//               alignItems: "center",
//               gap: "12px",
//             }}
//           >
//             <button onClick={handlePrev} disabled={page === 0 || loading}>
//               Previous
//             </button>
//             <span>
//               Page {data.number + 1} of {data.totalPages}
//             </span>
//             <button onClick={handleNext} disabled={data.last || loading}>
//               Next
//             </button>
//             <span>({data.totalElements} referral codes total)</span>
//           </div>

//           {/* Details + Edit */}
//           <div style={{ marginTop: "24px" }}>
//             <h3>Referral code details</h3>

//             {selectedCode ? (
//               <div
//                 style={{
//                   marginTop: "12px",
//                   padding: "16px",
//                   border: "1px solid #ddd",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <div>
//                     <strong>ID:</strong> {selectedCode.id} |{" "}
//                     <strong>Code:</strong>{" "}
//                     <code>{selectedCode.code}</code>
//                   </div>

//                   {!isEditing ? (
//                     <button onClick={handleStartEdit}>Edit</button>
//                   ) : (
//                     <div style={{ display: "flex", gap: "8px" }}>
//                       <button onClick={handleCancelEdit} disabled={saving}>
//                         Cancel
//                       </button>
//                       <button
//                         form="edit-referral-form"
//                         type="submit"
//                         disabled={saving}
//                       >
//                         {saving ? "Saving..." : "Save"}
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Read-only info */}
//                 <div style={{ marginBottom: "8px", fontSize: "0.9rem" }}>
//                   <p style={{ margin: 0 }}>
//                     <strong>Uses so far:</strong> {selectedCode.usesSoFar}
//                   </p>
//                   <p style={{ margin: "4px 0 0" }}>
//                     <strong>Current max uses:</strong> {selectedCode.maxUses}
//                   </p>
//                 </div>

//                 {!isEditing && (
//                   <>
//                     <p>
//                       <strong>Owner ID:</strong> {selectedCode.ownerId}
//                     </p>
//                     <p>
//                       <strong>Reward points (user):</strong>{" "}
//                       {selectedCode.rewardPoints}
//                     </p>
//                     <p>
//                       <strong>Reward points (owner):</strong>{" "}
//                       {selectedCode.ownerRewardPoints}
//                     </p>
//                     <p>
//                       <strong>Max uses:</strong> {selectedCode.maxUses}
//                     </p>
//                     <p>
//                       <strong>Uses so far:</strong>{" "}
//                       {selectedCode.usesSoFar}
//                     </p>
//                     <p>
//                       <strong>Disabled:</strong>{" "}
//                       {selectedCode.isDisabled ? "Yes" : "No"}
//                     </p>
//                   </>
//                 )}

//                 {isEditing && editForm && (
//                   <form
//                     id="edit-referral-form"
//                     onSubmit={handleSubmitEdit}
//                     style={{
//                       marginTop: "8px",
//                       display: "grid",
//                       gap: "8px",
//                       maxWidth: "360px",
//                     }}
//                   >
//                     {saveError && (
//                       <p style={{ color: "red" }}>{saveError}</p>
//                     )}

//                     <label>
//                       Code:
//                       <input
//                         type="text"
//                         value={editForm.code}
//                         onChange={(e) =>
//                           handleEditChange("code", e.target.value)
//                         }
//                         required
//                       />
//                     </label>

//                     <label>
//                       Owner ID:
//                       <input
//                         type="number"
//                         value={editForm.ownerId}
//                         onChange={(e) =>
//                           handleEditChange(
//                             "ownerId",
//                             Number(e.target.value)
//                           )
//                         }
//                         required
//                       />
//                     </label>

//                     <label>
//                       Reward points (user):
//                       <input
//                         type="number"
//                         min={0}
//                         value={editForm.rewardPoints}
//                         onChange={(e) =>
//                           handleEditChange(
//                             "rewardPoints",
//                             Number(e.target.value)
//                           )
//                         }
//                         required
//                       />
//                     </label>

//                     <label>
//                       Reward points (owner):
//                       <input
//                         type="number"
//                         min={0}
//                         value={editForm.ownerRewardPoints}
//                         onChange={(e) =>
//                           handleEditChange(
//                             "ownerRewardPoints",
//                             Number(e.target.value)
//                           )
//                         }
//                         required
//                       />
//                     </label>

//                     <label>
//                       Max uses:
//                       <input
//                         type="number"
//                         min={0}
//                         value={editForm.maxUses}
//                         onChange={(e) =>
//                           handleEditChange(
//                             "maxUses",
//                             Number(e.target.value)
//                           )
//                         }
//                         required
//                       />
//                     </label>

//                     <label>
//                       Disabled:
//                       <input
//                         type="checkbox"
//                         checked={editForm.isDisabled}
//                         onChange={(e) =>
//                           handleEditChange("isDisabled", e.target.checked)
//                         }
//                       />
//                     </label>
//                   </form>
//                 )}
//               </div>
//             ) : (
//               <p>Select a referral code row to see details.</p>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminReferralCodesPage;
// src/admin/components/AdminReferralCodesPage.tsx


/// src/admin/components/AdminReferralCodesPage.tsx
// src/admin/components/AdminReferralCodesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getReferralCodes, editReferralCode } from "../../api/Springboot/ReferralCodeService";

import type { PageResponse } from "../models/AdminResponseUser";
import type { ReferralCodeDtoAdminResponse, ReferralCodeRequest } from "../../models/Springboot/ReferralCode";

const PAGE_SIZE = 20;

type MessageType = "success" | "error" | null;

const AdminReferralCodesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<ReferralCodeDtoAdminResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // selected + editing
  const [selectedCode, setSelectedCode] = useState<ReferralCodeDtoAdminResponse | null>(null);
  const [editForm, setEditForm] = useState<ReferralCodeRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // toast
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>(null);
  const showMessage = (type: MessageType, msg: string) => {
    setMessageType(type);
    setMessage(msg);
    window.setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3500);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchCodes = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getReferralCodes(page, PAGE_SIZE);
        if (!cancelled) {
          setData(result);
          // reset selection on page change
          setSelectedCode(null);
          setIsEditing(false);
          setEditForm(null);
          setSaveError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load referral codes";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCodes();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const rows = useMemo(() => data?.content ?? [], [data]);
  const selectedId = selectedCode?.id;

  const remainingOf = (c: ReferralCodeDtoAdminResponse): number | null => {
    if (c.maxUses == null || c.usesSoFar == null) return null;
    return c.maxUses - c.usesSoFar;
  };

  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (data && !data.last) setPage((p) => p + 1);
  };

  const handleFirst = () => setPage(0);

  const handleSelectRow = (code: ReferralCodeDtoAdminResponse) => {
    setSelectedCode(code);
    setIsEditing(false);
    setSaveError(null);

    setEditForm({
      code: code.code,
      ownerId: code.ownerId,
      rewardPoints: code.rewardPoints,
      ownerRewardPoints: code.ownerRewardPoints,
      maxUses: code.maxUses,
      isDisabled: code.isDisabled,
    });
  };

  const handleEditChange = <K extends keyof ReferralCodeRequest>(field: K, value: ReferralCodeRequest[K]) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleStartEdit = () => {
    if (!selectedCode || !editForm) return;
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    if (!selectedCode) {
      setIsEditing(false);
      setEditForm(null);
      return;
    }
    setEditForm({
      code: selectedCode.code,
      ownerId: selectedCode.ownerId,
      rewardPoints: selectedCode.rewardPoints,
      ownerRewardPoints: selectedCode.ownerRewardPoints,
      maxUses: selectedCode.maxUses,
      isDisabled: selectedCode.isDisabled,
    });
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCode || !editForm) return;

    setSaving(true);
    setSaveError(null);

    const cleanForm: ReferralCodeRequest = {
      ...editForm,
      ownerId: Number(editForm.ownerId),
      rewardPoints: Number(editForm.rewardPoints),
      ownerRewardPoints: Number(editForm.ownerRewardPoints),
      maxUses: Number(editForm.maxUses),
    };

    try {
      const updated = await editReferralCode(selectedCode.id, cleanForm);

      setSelectedCode(updated);
      setIsEditing(false);

      setData((prev) =>
        prev ? { ...prev, content: prev.content.map((c) => (c.id === updated.id ? updated : c)) } : prev
      );

      showMessage("success", "Το referral code ενημερώθηκε επιτυχώς.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update referral code";
      setSaveError(msg);
      showMessage("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page} className="bn-ref-page">
      <style>{`
        .bn-ref-page * { box-sizing: border-box; }

        /* ✅ Responsive grid */
        @media (max-width: 980px) {
          .bn-ref-grid { grid-template-columns: 1fr !important; }
          .bn-ref-header { flex-direction: column !important; align-items: flex-start !important; }
          .bn-ref-toast { left: 16px !important; right: 16px !important; max-width: none !important; }
        }

        @media (max-width: 620px) {
          .bn-form-grid { grid-template-columns: 1fr !important; }
          .bn-btn-wide { width: 100% !important; }
          .bn-input { font-size: 16px !important; } /* iOS zoom prevention */
        }
      `}</style>

      {/* Toast */}
      {message && (
        <div
          className="bn-ref-toast"
          style={{
            ...styles.toast,
            ...(messageType === "error" ? styles.toastError : styles.toastSuccess),
          }}
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header} className="bn-ref-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={styles.title}>Admin – Referral Codes</h1>
            <span style={styles.badge}>Management</span>
          </div>
          <p style={styles.subtitle}>Κάνε click σε μια κάρτα για να ανοίξει το panel δεξιά.</p>
        </div>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      <div style={styles.grid} className="bn-ref-grid">
        {/* LEFT: List (ΜΟΝΟ οι κάρτες — αφαιρέθηκε ο πάνω πίνακας) */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>Referral codes</div>
              <div style={styles.cardHint}>
                {data ? (
                  <>
                    Σύνολο: <strong>{data.totalElements}</strong> • Σελίδα <strong>{data.number + 1}</strong> /{" "}
                    <strong>{data.totalPages}</strong>
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={handleFirst} disabled={loading || page === 0} style={styles.secondaryBtn}>
                First
              </button>
              <button type="button" onClick={handlePrev} disabled={loading || page === 0} style={styles.secondaryBtn}>
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || Boolean(data?.last)}
                style={styles.secondaryBtn}
              >
                Next
              </button>
            </div>
          </div>

          {loading && <div style={styles.skeleton}>Loading referral codes…</div>}

          {!loading && data && data.content.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>No referral codes found</div>
              <div style={styles.emptyText}>Δεν βρέθηκαν referral codes.</div>
            </div>
          )}

          {data && data.content.length > 0 && (
            <>
              <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                {rows.map((c) => {
                  const active = selectedId != null && c.id === selectedId;
                  const remaining = remainingOf(c);

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectRow(c)}
                      style={{
                        ...styles.mobileCard,
                        ...(active ? styles.mobileCardActive : null),
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={styles.chip}>#{c.id}</span>

                            <span style={styles.codePill}>
                              <code style={styles.mono}>{c.code}</code>
                            </span>

                            <span style={c.isDisabled ? styles.badChip : styles.goodChip}>
                              {c.isDisabled ? "Disabled" : "Active"}
                            </span>
                          </div>

                          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={styles.neutralChip}>
                              Owner: <span style={styles.mono}>{c.ownerId}</span>
                            </span>

                            <span style={styles.neutralChip}>
                              Remaining: <span style={styles.mono}>{remaining != null ? remaining : "-"}</span>
                            </span>

                            <span style={styles.neutralChip}>
                              Used: <span style={styles.mono}>{c.usesSoFar}</span> /{" "}
                              <span style={styles.mono}>{c.maxUses}</span>
                            </span>
                          </div>
                        </div>

                        <span style={{ color: "#94a3b8", fontWeight: 900, alignSelf: "center" }}>›</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {data && (
                <div style={{ marginTop: 12, color: "#334155", fontSize: 13 }}>
                  Page <strong>{data.number + 1}</strong> of <strong>{data.totalPages}</strong> •{" "}
                  <strong>{data.totalElements}</strong> total
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Details */}
        <div style={styles.stack}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitle}>Referral code details</div>
                <div style={styles.cardHint}>Δες λεπτομέρειες και κάνε edit.</div>
              </div>

              {selectedCode && !loading &&
                (!isEditing ? (
                  <button type="button" onClick={handleStartEdit} style={styles.primaryBtn}>
                    Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button type="button" onClick={handleCancelEdit} disabled={saving} style={styles.secondaryBtn}>
                      Cancel
                    </button>
                    <button
                      className="bn-btn-wide"
                      form="edit-referral-form"
                      type="submit"
                      disabled={saving}
                      style={styles.primaryBtn}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                ))}
            </div>

            {!selectedCode && !loading && (
              <div style={styles.emptyState}>
                <div style={styles.emptyTitle}>No code selected</div>
                <div style={styles.emptyText}>Κάνε click σε ένα referral code για να ανοίξει το panel.</div>
              </div>
            )}

            {selectedCode && (
              <>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={styles.chip}>#{selectedCode.id}</span>
                  <span style={styles.codePill}>
                    <code style={styles.mono}>{selectedCode.code}</code>
                  </span>
                  <span style={selectedCode.isDisabled ? styles.badChip : styles.goodChip}>
                    {selectedCode.isDisabled ? "Disabled" : "Active"}
                  </span>
                </div>

                {!isEditing && (
                  <div style={styles.infoGrid}>
                    <Info label="Owner ID" value={<span style={styles.mono}>{selectedCode.ownerId}</span>} />
                    <Info label="Reward (user)" value={<span style={styles.mono}>{selectedCode.rewardPoints}</span>} />
                    <Info
                      label="Reward (owner)"
                      value={<span style={styles.mono}>{selectedCode.ownerRewardPoints}</span>}
                    />
                    <Info label="Max uses" value={<span style={styles.mono}>{selectedCode.maxUses}</span>} />
                    <Info label="Uses so far" value={<span style={styles.mono}>{selectedCode.usesSoFar}</span>} />
                    <Info
                      label="Remaining"
                      value={
                        <span style={styles.mono}>
                          {remainingOf(selectedCode) != null ? remainingOf(selectedCode) : "-"}
                        </span>
                      }
                    />
                  </div>
                )}

                {isEditing && editForm && (
                  <form id="edit-referral-form" onSubmit={handleSubmitEdit} style={{ marginTop: 12 }}>
                    {saveError && <div style={styles.alertError}>{saveError}</div>}

                    <div style={styles.formGrid} className="bn-form-grid">
                      <Field label="Code">
                        <input
                          className="bn-input"
                          type="text"
                          value={editForm.code}
                          onChange={(e) => handleEditChange("code", e.target.value)}
                          required
                          style={styles.input}
                          disabled={saving}
                        />
                      </Field>

                      <Field label="Owner ID">
                        <input
                          className="bn-input"
                          type="number"
                          value={editForm.ownerId}
                          onChange={(e) => handleEditChange("ownerId", Number(e.target.value))}
                          required
                          style={styles.input}
                          disabled={saving}
                        />
                      </Field>

                      <Field label="Reward points (user)">
                        <input
                          className="bn-input"
                          type="number"
                          min={0}
                          value={editForm.rewardPoints}
                          onChange={(e) => handleEditChange("rewardPoints", Number(e.target.value))}
                          required
                          style={styles.input}
                          disabled={saving}
                        />
                      </Field>

                      <Field label="Reward points (owner)">
                        <input
                          className="bn-input"
                          type="number"
                          min={0}
                          value={editForm.ownerRewardPoints}
                          onChange={(e) => handleEditChange("ownerRewardPoints", Number(e.target.value))}
                          required
                          style={styles.input}
                          disabled={saving}
                        />
                      </Field>

                      <Field label="Max uses">
                        <input
                          className="bn-input"
                          type="number"
                          min={0}
                          value={editForm.maxUses}
                          onChange={(e) => handleEditChange("maxUses", Number(e.target.value))}
                          required
                          style={styles.input}
                          disabled={saving}
                        />
                      </Field>

                      <div style={styles.checkGroup}>
                        <label style={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={Boolean(editForm.isDisabled)}
                            onChange={(e) => handleEditChange("isDisabled", e.target.checked)}
                            disabled={saving}
                          />
                          <span style={styles.checkLabel}>Disabled</span>
                        </label>
                      </div>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          <div style={styles.helperNote}>Tip: Οι κάρτες είναι πιο “safe” για όλα τα μεγέθη οθόνης (χωρίς διπλά UI).</div>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralCodesPage;

/* ---------- small presentational helpers ---------- */

const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={styles.infoItem}>
    <div style={styles.infoLabel}>{label}</div>
    <div style={styles.infoValue}>{value}</div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={styles.field}>
    <div style={styles.label}>{label}</div>
    {children}
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px 16px 28px",
    background: "#f6f7fb",
    minHeight: "100vh",
    position: "relative",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },

  title: { margin: 0, fontSize: 24, letterSpacing: -0.2, color: "#0f172a" },
  subtitle: { margin: "8px 0 0", fontSize: 14, color: "#64748b", lineHeight: 1.5, maxWidth: 900 },

  badge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.95fr",
    gap: 16,
    alignItems: "start",
  },

  stack: { display: "flex", flexDirection: "column", gap: 16 },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    padding: 16,
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  cardTitle: { fontSize: 16, fontWeight: 900, color: "#0f172a", marginBottom: 4 },
  cardHint: { fontSize: 13, color: "#64748b", lineHeight: 1.4 },

  alertError: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    marginBottom: 14,
  },

  skeleton: {
    padding: "14px 12px",
    borderRadius: 12,
    border: "1px dashed #e5e7eb",
    color: "#64748b",
    background: "#fbfdff",
    fontWeight: 800,
  },

  emptyState: { padding: "18px 12px", borderRadius: 12, border: "1px dashed #e5e7eb", background: "#fbfdff" },
  emptyTitle: { fontWeight: 900, color: "#0f172a", marginBottom: 6 },
  emptyText: { color: "#64748b", fontSize: 13, lineHeight: 1.5 },

  primaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
  },

  secondaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  // cards list styles
  mobileCard: {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    padding: 12,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  },
  mobileCardActive: { borderColor: "#c7d2fe", background: "#f1f5ff" },

  codePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontWeight: 900,
    maxWidth: 260,
  },

  chip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: 12,
    fontWeight: 900,
    color: "#0f172a",
    whiteSpace: "nowrap",
  },

  goodChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #a7f3d0",
    background: "#ecfdf5",
    fontSize: 12,
    fontWeight: 900,
    color: "#065f46",
    whiteSpace: "nowrap",
  },

  badChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #fecdd3",
    background: "#fff1f2",
    fontSize: 12,
    fontWeight: 900,
    color: "#9f1239",
    whiteSpace: "nowrap",
  },

  neutralChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
    whiteSpace: "nowrap",
  },

  // details
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 },
  infoItem: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "#ffffff" },
  infoLabel: { fontSize: 12, fontWeight: 900, color: "#334155", marginBottom: 4 },
  infoValue: { fontSize: 13, color: "#0f172a", lineHeight: 1.45, overflowWrap: "anywhere" },

  // form
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: "#334155" },

  input: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#ffffff",
    width: "100%",
    minWidth: 0,
  },

  checkGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fbfdff",
    justifyContent: "center",
  },
  checkRow: { display: "flex", alignItems: "center", gap: 10 },
  checkLabel: { fontSize: 13, fontWeight: 800, color: "#0f172a" },

  helperNote: { fontSize: 12, color: "#64748b", lineHeight: 1.5, padding: "0 4px" },

  // toast
  toast: {
    position: "fixed",
    top: 16,
    right: 16,
    maxWidth: 520,
    zIndex: 9999,
    padding: "10px 12px",
    borderRadius: 14,
    fontWeight: 900,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.15)",
    border: "1px solid transparent",
  },
  toastSuccess: { background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" },
  toastError: { background: "#fff1f2", borderColor: "#fecdd3", color: "#9f1239" },

  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};
