// // src/admin/components/AdminReferralCodesPage.tsx
// import React, { useEffect, useState } from "react";
// import { getReferralCodes } from "../../api/Springboot/ReferralCodeService";
// import type {
//   PageResponse
// } from "../models/AdminResponseUser";

// import type { ReferralCodeDtoAdminResponse } from "../../models/Springboot/ReferralCode";

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
//   const [data, setData] = useState<PageResponse<ReferralCodeDtoAdminResponse> | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

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
//                   <tr key={refCode.id}>
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
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminReferralCodesPage;



// src/admin/components/AdminReferralCodesPage.tsx
import React, { useEffect, useState } from "react";
import { getReferralCodes,editReferralCode } from "../../api/Springboot/ReferralCodeService";
import type {
  PageResponse,
} from "../models/AdminResponseUser";

import type { ReferralCodeDtoAdminResponse,ReferralCodeRequest } from "../../models/Springboot/ReferralCode";

const PAGE_SIZE = 20;

const thStyle: React.CSSProperties = {
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  padding: "8px",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};

const AdminReferralCodesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [data, setData] =
    useState<PageResponse<ReferralCodeDtoAdminResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 👉 selected + editing state
  const [selectedCode, setSelectedCode] =
    useState<ReferralCodeDtoAdminResponse | null>(null);
  const [editForm, setEditForm] = useState<ReferralCodeRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCodes = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getReferralCodes(page, PAGE_SIZE);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load referral codes";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCodes();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (data && !data.last) {
      setPage((p) => p + 1);
    }
  };

  const handleSelectRow = (code: ReferralCodeDtoAdminResponse) => {
    setSelectedCode(code);
    setIsEditing(false);
    setSaveError(null);

    // προετοιμάζουμε edit form
    setEditForm({
      code: code.code,
      ownerId: code.ownerId,
      rewardPoints: code.rewardPoints,
      ownerRewardPoints: code.ownerRewardPoints,
      maxUses: code.maxUses,
      isDisabled: code.isDisabled,
    });
  };

  const handleEditChange = <K extends keyof ReferralCodeRequest>(
    field: K,
    value: ReferralCodeRequest[K]
  ) => {
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

    // reset στα original values
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

    // little cleaning (να είμαστε σίγουροι ότι είναι αριθμοί)
    const cleanForm: ReferralCodeRequest = {
      ...editForm,
      ownerId: Number(editForm.ownerId),
      rewardPoints: Number(editForm.rewardPoints),
      ownerRewardPoints: Number(editForm.ownerRewardPoints),
      maxUses: Number(editForm.maxUses),
    };

    try {
      const updated = await editReferralCode(selectedCode.id, cleanForm);

      // update selected
      setSelectedCode(updated);
      setIsEditing(false);

      // update list
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((c) =>
                c.id === updated.id ? updated : c
              ),
            }
          : prev
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update referral code";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin – Referral Codes</h2>

      {loading && <p>Loading referral codes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && data.content.length === 0 && !loading && (
        <p>No referral codes found.</p>
      )}

      {data && data.content.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "8px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Owner ID</th>
                <th style={thStyle}>Reward Points (User)</th>
                <th style={thStyle}>Reward Points (Owner)</th>
                <th style={thStyle}>Max Uses</th>
                <th style={thStyle}>Uses so far</th>
                <th style={thStyle}>Remaining</th>
                <th style={thStyle}>Disabled</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((refCode) => {
                const remaining =
                  refCode.maxUses != null && refCode.usesSoFar != null
                    ? refCode.maxUses - refCode.usesSoFar
                    : undefined;

                return (
                  <tr
                    key={refCode.id}
                    onClick={() => handleSelectRow(refCode)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={tdStyle}>{refCode.id}</td>
                    <td style={tdStyle}>
                      <code>{refCode.code}</code>
                    </td>
                    <td style={tdStyle}>{refCode.ownerId}</td>
                    <td style={tdStyle}>{refCode.rewardPoints}</td>
                    <td style={tdStyle}>{refCode.ownerRewardPoints}</td>
                    <td style={tdStyle}>{refCode.maxUses}</td>
                    <td style={tdStyle}>{refCode.usesSoFar}</td>
                    <td style={tdStyle}>
                      {remaining != null ? remaining : "-"}
                    </td>
                    <td style={tdStyle}>
                      {refCode.isDisabled ? "Yes" : "No"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button onClick={handlePrev} disabled={page === 0 || loading}>
              Previous
            </button>
            <span>
              Page {data.number + 1} of {data.totalPages}
            </span>
            <button onClick={handleNext} disabled={data.last || loading}>
              Next
            </button>
            <span>({data.totalElements} referral codes total)</span>
          </div>

          {/* Details + Edit */}
          <div style={{ marginTop: "24px" }}>
            <h3>Referral code details</h3>

            {selectedCode ? (
              <div
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <strong>ID:</strong> {selectedCode.id} |{" "}
                    <strong>Code:</strong>{" "}
                    <code>{selectedCode.code}</code>
                  </div>

                  {!isEditing ? (
                    <button onClick={handleStartEdit}>Edit</button>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={handleCancelEdit} disabled={saving}>
                        Cancel
                      </button>
                      <button
                        form="edit-referral-form"
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Read-only info */}
                <div style={{ marginBottom: "8px", fontSize: "0.9rem" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Uses so far:</strong> {selectedCode.usesSoFar}
                  </p>
                  <p style={{ margin: "4px 0 0" }}>
                    <strong>Current max uses:</strong> {selectedCode.maxUses}
                  </p>
                </div>

                {!isEditing && (
                  <>
                    <p>
                      <strong>Owner ID:</strong> {selectedCode.ownerId}
                    </p>
                    <p>
                      <strong>Reward points (user):</strong>{" "}
                      {selectedCode.rewardPoints}
                    </p>
                    <p>
                      <strong>Reward points (owner):</strong>{" "}
                      {selectedCode.ownerRewardPoints}
                    </p>
                    <p>
                      <strong>Max uses:</strong> {selectedCode.maxUses}
                    </p>
                    <p>
                      <strong>Uses so far:</strong>{" "}
                      {selectedCode.usesSoFar}
                    </p>
                    <p>
                      <strong>Disabled:</strong>{" "}
                      {selectedCode.isDisabled ? "Yes" : "No"}
                    </p>
                  </>
                )}

                {isEditing && editForm && (
                  <form
                    id="edit-referral-form"
                    onSubmit={handleSubmitEdit}
                    style={{
                      marginTop: "8px",
                      display: "grid",
                      gap: "8px",
                      maxWidth: "360px",
                    }}
                  >
                    {saveError && (
                      <p style={{ color: "red" }}>{saveError}</p>
                    )}

                    <label>
                      Code:
                      <input
                        type="text"
                        value={editForm.code}
                        onChange={(e) =>
                          handleEditChange("code", e.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Owner ID:
                      <input
                        type="number"
                        value={editForm.ownerId}
                        onChange={(e) =>
                          handleEditChange(
                            "ownerId",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      Reward points (user):
                      <input
                        type="number"
                        min={0}
                        value={editForm.rewardPoints}
                        onChange={(e) =>
                          handleEditChange(
                            "rewardPoints",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      Reward points (owner):
                      <input
                        type="number"
                        min={0}
                        value={editForm.ownerRewardPoints}
                        onChange={(e) =>
                          handleEditChange(
                            "ownerRewardPoints",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      Max uses:
                      <input
                        type="number"
                        min={0}
                        value={editForm.maxUses}
                        onChange={(e) =>
                          handleEditChange(
                            "maxUses",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      Disabled:
                      <input
                        type="checkbox"
                        checked={editForm.isDisabled}
                        onChange={(e) =>
                          handleEditChange("isDisabled", e.target.checked)
                        }
                      />
                    </label>
                  </form>
                )}
              </div>
            ) : (
              <p>Select a referral code row to see details.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReferralCodesPage;
