// // src/admin/components/AdminUsersPage.tsx

// import React, { useEffect, useMemo, useState } from "react";
// import { getAdminUsers, getAdminUser, updateAdminUser } from "../../api/admin/Users";
// import { getReferralCodeByCode } from "../../api/Springboot/ReferralCodeService";

// import type { Avatar } from "../../models/Springboot/UserEntity";
// import type {
//   AdminUserEntityDto,
//   PageResponse,
//   UserEntityUpdateAdmin,
//   Region,
//   UserSearchBy,
// } from "../models/AdminResponseUser";

// import type { ReferralCodeDtoAdminResponse } from "../../models/Springboot/ReferralCode";

// const PAGE_SIZE = 20;

// const avatarOptions: { value: Avatar; label: string }[] = [
//   { value: "BEARD_MAN_AVATAR", label: "Beard Man" },
//   { value: "MAN_AVATAR", label: "Man" },
//   { value: "BLONDE_GIRL_AVATAR", label: "Blonde Girl" },
//   { value: "GIRL_AVATAR", label: "Girl" },
//   { value: "DEFAULT_AVATAR", label: "Default Avatar" },
//   { value: "DEFAULT", label: "Default" },
// ];

// const regionOptions: Region[] = ["NICOSIA", "LIMASSOL", "LARNACA", "PAPHOS", "FAMAGUSTA"];

// const searchByOptions: { value: UserSearchBy; label: string }[] = [
//   { value: "id", label: "ID" },
//   { value: "username", label: "Username" },
//   { value: "firebaseId", label: "Firebase ID" },
// ];

// // helper για Avatar από URL
// const detectAvatarFromUrl = (avatarUrl?: string | null): Avatar => {
//   if (!avatarUrl) return "DEFAULT_AVATAR";
//   if (avatarUrl.includes("BEARD_MAN_AVATAR")) return "BEARD_MAN_AVATAR";
//   if (avatarUrl.includes("BLONDE_GIRL_AVATAR")) return "BLONDE_GIRL_AVATAR";
//   if (avatarUrl.includes("GIRL_AVATAR")) return "GIRL_AVATAR";
//   if (avatarUrl.includes("MAN_AVATAR")) return "MAN_AVATAR";
//   return "DEFAULT_AVATAR";
// };

// type MessageType = "success" | "error" | null;

// const AdminUsersPage: React.FC = () => {
//   const [page, setPage] = useState(0);
//   const [data, setData] = useState<PageResponse<AdminUserEntityDto> | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [selectedUser, setSelectedUser] = useState<AdminUserEntityDto | null>(null);
//   const [selectedLoading, setSelectedLoading] = useState(false);
//   const [selectedError, setSelectedError] = useState<string | null>(null);

//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState<UserEntityUpdateAdmin | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [saveError, setSaveError] = useState<string | null>(null);

//   // 🔍 search state (UI)
//   const [search, setSearch] = useState("");
//   const [searchBy, setSearchBy] = useState<UserSearchBy>("username");

//   // 🔍 applied search (αυτά στέλνουμε στο backend)
//   const [appliedSearch, setAppliedSearch] = useState<string | undefined>();
//   const [appliedSearchBy, setAppliedSearchBy] = useState<UserSearchBy>("username");

//   // 👉 referral code details for owner
//   const [ownerReferralCode, setOwnerReferralCode] = useState<ReferralCodeDtoAdminResponse | null>(null);
//   const [ownerReferralLoading, setOwnerReferralLoading] = useState(false);
//   const [ownerReferralError, setOwnerReferralError] = useState<string | null>(null);

//   // toast (μικρή UX βελτίωση)
//   const [message, setMessage] = useState<string | null>(null);
//   const [messageType, setMessageType] = useState<MessageType>(null);
//   const showMessage = (type: MessageType, msg: string) => {
//     setMessageType(type);
//     setMessage(msg);
//     window.setTimeout(() => {
//       setMessage(null);
//       setMessageType(null);
//     }, 3500);
//   };

//   useEffect(() => {
//     let cancelled = false;

//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const result = await getAdminUsers(page, PAGE_SIZE, appliedSearch, appliedSearchBy);

//         if (!cancelled) {
//           setData(result);
//         }
//       } catch (err: unknown) {
//         if (!cancelled) {
//           const message = err instanceof Error ? err.message : "Failed to load users";
//           setError(message);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUsers();
//     return () => {
//       cancelled = true;
//     };
//   }, [page, appliedSearch, appliedSearchBy]);

//   const handlePrev = () => {
//     if (page > 0) setPage((p) => p - 1);
//   };

//   const handleNext = () => {
//     if (data && !data.last) setPage((p) => p + 1);
//   };

//   const handleApplySearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     const trimmed = search.trim();
//     setAppliedSearch(trimmed === "" ? undefined : trimmed);
//     setAppliedSearchBy(searchBy);
//     setPage(0);
//   };

//   const handleClearSearch = () => {
//     setSearch("");
//     setAppliedSearch(undefined);
//     setAppliedSearchBy("username");
//     setPage(0);
//   };

//   const selectedFirebaseId = selectedUser?.firebaseId;

//   const handleSelectUser = async (firebaseId: string) => {
//     if (!firebaseId) return;

//     setSelectedUser(null);
//     setSelectedError(null);
//     setSelectedLoading(true);
//     setIsEditing(false);
//     setEditForm(null);
//     setSaveError(null);

//     setOwnerReferralCode(null);
//     setOwnerReferralError(null);
//     setOwnerReferralLoading(false);

//     try {
//       const user = await getAdminUser(firebaseId);
//       setSelectedUser(user);

//       const avatar = detectAvatarFromUrl(user.avatarUrl);
//       const location = user.locationDto ?? { country: "", region: "NICOSIA" as Region };

//       setEditForm({
//         username: user.username,
//         email: user.email,
//         rewardPoints: user.rewardPoints,
//         avatar,
//         role: user.role,
//         isBanned: user.isBanned,
//         isAnonymized: user.isAnonymized,
//         eligibleForChat: user.eligibleForChat,
//         locationDto: location,
//       });
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : "Failed to load user details";
//       setSelectedError(message);
//     } finally {
//       setSelectedLoading(false);
//     }
//   };

//   const handleEditChange = <K extends keyof UserEntityUpdateAdmin>(field: K, value: UserEntityUpdateAdmin[K]) => {
//     setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
//   };

//   const handleEditLocationChange = (field: "country" | "region", value: string) => {
//     setEditForm((prev) =>
//       prev
//         ? {
//             ...prev,
//             locationDto: {
//               ...(prev.locationDto ?? { country: "", region: "NICOSIA" }),
//               [field]: value,
//             },
//           }
//         : prev
//     );
//   };

//   const handleStartEdit = () => {
//     if (!selectedUser || !editForm) return;
//     setIsEditing(true);
//     setSaveError(null);
//   };

//   const handleCancelEdit = () => {
//     if (!selectedUser) {
//       setIsEditing(false);
//       setEditForm(null);
//       return;
//     }
//     const avatar = detectAvatarFromUrl(selectedUser.avatarUrl);
//     const location = selectedUser.locationDto ?? { country: "", region: "NICOSIA" as Region };

//     setEditForm({
//       username: selectedUser.username,
//       email: selectedUser.email,
//       rewardPoints: selectedUser.rewardPoints,
//       avatar,
//       role: selectedUser.role,
//       isBanned: selectedUser.isBanned,
//       isAnonymized: selectedUser.isAnonymized,
//       eligibleForChat: selectedUser.eligibleForChat,
//       locationDto: location,
//     });
//     setIsEditing(false);
//     setSaveError(null);
//   };

//   const handleSubmitEdit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedUser || !editForm) return;

//     setSaving(true);
//     setSaveError(null);

//     const cleanForm: UserEntityUpdateAdmin = {
//       ...editForm,
//       rewardPoints: Number.isNaN(Number(editForm.rewardPoints)) ? 0 : Number(editForm.rewardPoints),
//       locationDto: {
//         country: editForm.locationDto.country,
//         region: editForm.locationDto.region,
//       },
//     };

//     try {
//       const updated = await updateAdminUser(selectedUser.firebaseId, cleanForm);
//       setSelectedUser(updated);
//       setIsEditing(false);

//       setData((prev) =>
//         prev
//           ? {
//               ...prev,
//               content: prev.content.map((u) => (u.firebaseId === updated.firebaseId ? updated : u)),
//             }
//           : prev
//       );

//       showMessage("success", "Ο χρήστης ενημερώθηκε επιτυχώς.");
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : "Failed to update user";
//       setSaveError(message);
//       showMessage("error", message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleViewOwnerReferralCode = async () => {
//     if (!selectedUser || !selectedUser.isReferralCodeOwner || !selectedUser.referralCodeName) return;

//     setOwnerReferralCode(null);
//     setOwnerReferralError(null);
//     setOwnerReferralLoading(true);

//     try {
//       const codeData = await getReferralCodeByCode(selectedUser.referralCodeName);
//       setOwnerReferralCode(codeData);
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : "Failed to load referral code details";
//       setOwnerReferralError(message);
//     } finally {
//       setOwnerReferralLoading(false);
//     }
//   };

//   const tableRows = useMemo(() => data?.content ?? [], [data]);

//   return (
//     <div style={styles.page}>
//       {/* Toast */}
//       {message && (
//         <div
//           style={{
//             ...styles.toast,
//             ...(messageType === "error" ? styles.toastError : styles.toastSuccess),
//           }}
//           role="status"
//           aria-live="polite"
//         >
//           {message}
//         </div>
//       )}

//       <div style={styles.header}>
//         <div>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//             <h1 style={styles.title}>Admin – Users</h1>
//             <span style={styles.badge}>Management</span>
//           </div>
//           <p style={styles.subtitle}>
//             Αναζήτηση, προβολή και επεξεργασία χρηστών. Κάνε click σε χρήστη για λεπτομέρειες.
//           </p>
//         </div>
//       </div>

//       <div style={styles.grid}>
//         {/* LEFT: list */}
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <div>
//               <div style={styles.cardTitle}>Users</div>
//               <div style={styles.cardHint}>
//                 {data ? (
//                   <>
//                     Εγγράφηκαν {data.totalElements} χρήστες
//                   </>
//                 ) : (
//                   "—"
//                 )}
//               </div>
//             </div>

//             {/* Search toolbar */}
//             <form onSubmit={handleApplySearch} style={styles.toolbar}>
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 style={{ ...styles.input, width: 220 }}
//                 disabled={loading}
//               />

//               <select
//                 value={searchBy}
//                 onChange={(e) => setSearchBy(e.target.value as UserSearchBy)}
//                 style={{ ...styles.select, width: 160 }}
//                 disabled={loading}
//               >
//                 {searchByOptions.map((opt) => (
//                   <option key={opt.value} value={opt.value}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>

//               <button type="submit" disabled={loading} style={styles.primaryBtn}>
//                 Search
//               </button>

//               <button
//                 type="button"
//                 onClick={handleClearSearch}
//                 disabled={loading && !appliedSearch}
//                 style={styles.secondaryBtn}
//               >
//                 Clear
//               </button>
//             </form>
//           </div>

//           {appliedSearch && (
//             <div style={styles.filterPill}>
//               Filtering by <strong>{appliedSearchBy}</strong>: <span style={styles.mono}>"{appliedSearch}"</span>
//             </div>
//           )}

//           {loading && <div style={styles.skeleton}>Loading users…</div>}
//           {error && <div style={styles.alertError}>{error}</div>}

//           {!loading && data && data.content.length === 0 && (
//             <div style={styles.emptyState}>
//               <div style={styles.emptyTitle}>No users found</div>
//               <div style={styles.emptyText}>Δοκίμασε άλλη αναζήτηση ή καθάρισε τα φίλτρα.</div>
//             </div>
//           )}

//           {data && data.content.length > 0 && (
//             <>
//               <div style={{ overflowX: "auto" }}>
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       <th style={styles.th}>User</th>
//                       <th style={styles.th}>Role</th>
//                       <th style={styles.th}>Rewards</th>
//                       <th style={styles.th}>Banned</th>
//                       <th style={styles.th}>Location</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {tableRows.map((user) => {
//                       const active = selectedFirebaseId && user.firebaseId === selectedFirebaseId;
//                       return (
//                         <tr
//                           key={user.id}
//                           onClick={() => handleSelectUser(user.firebaseId)}
//                           style={{
//                             ...styles.tr,
//                             ...(active ? styles.trActive : null),
//                           }}
//                         >
//                           <td style={styles.td}>
//                             <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                               <img
//                                 src={user.avatarUrl}
//                                 alt={user.username}
//                                 style={styles.avatarSm}
//                               />
//                               <div style={{ minWidth: 0 }}>
//                                 <div style={styles.userPrimary}>
//                                   {user.username}
//                                 </div>
//                                 <div style={styles.userSecondary}>
//                                   {user.email}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>

//                           <td style={styles.td}>
//                             <span style={styles.chip}>{user.role}</span>
//                           </td>

//                           <td style={styles.tdMono}>{user.rewardPoints}</td>

//                           <td style={styles.td}>
//                             <span style={user.isBanned ? styles.badChip : styles.goodChip}>
//                               {user.isBanned ? "Yes" : "No"}
//                             </span>
//                           </td>

//                           <td style={styles.td}>
//                             {user.locationDto ? `${user.locationDto.country} (${user.locationDto.region})` : "—"}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               <div style={styles.pagination}>
//                 <button onClick={handlePrev} disabled={page === 0 || loading} style={styles.secondaryBtn}>
//                   Previous
//                 </button>
//                 <div style={styles.paginationText}>
//                   Page <strong>{data.number + 1}</strong> of <strong>{data.totalPages}</strong>
//                   <span style={{ color: "#94a3b8" }}> • </span>
//                   <span>{data.totalElements} total</span>
//                 </div>
//                 <button onClick={handleNext} disabled={data.last || loading} style={styles.secondaryBtn}>
//                   Next
//                 </button>
//               </div>
//             </>
//           )}
//         </div>

//         {/* RIGHT: details */}
//         <div style={styles.stack}>
//           <div style={styles.card}>
//             <div style={styles.cardHeader}>
//               <div>
//                 <div style={styles.cardTitle}>User details</div>
//               </div>

//               {selectedUser && !selectedLoading && (
//                 !isEditing ? (
//                   <button onClick={handleStartEdit} style={styles.primaryBtn}>
//                     Edit
//                   </button>
//                 ) : (
//                   <div style={{ display: "flex", gap: 10 }}>
//                     <button onClick={handleCancelEdit} disabled={saving} style={styles.secondaryBtn}>
//                       Cancel
//                     </button>
//                     <button form="edit-user-form" type="submit" disabled={saving} style={styles.primaryBtn}>
//                       {saving ? "Saving..." : "Save"}
//                     </button>
//                   </div>
//                 )
//               )}
//             </div>

//             {selectedLoading && <div style={styles.skeleton}>Loading user details…</div>}
//             {selectedError && <div style={styles.alertError}>{selectedError}</div>}

//             {!selectedUser && !selectedLoading && (
//               <div style={styles.emptyState}>
//                 <div style={styles.emptyTitle}>No user selected</div>
//                 <div style={styles.emptyText}>Κάνε click σε έναν χρήστη για να ανοίξει το panel.</div>
//               </div>
//             )}

//             {selectedUser && (
//               <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
//                 <img src={selectedUser.avatarUrl} alt={selectedUser.username} style={styles.avatarLg} />

//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={styles.detailsHeader}>
//                     <div style={styles.detailsName}>{selectedUser.username}</div>
//                     <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                       <span style={styles.chip}>{selectedUser.role}</span>
//                       {selectedUser.isBanned ? <span style={styles.badChip}>Banned</span> : <span style={styles.goodChip}>Active</span>}
//                       {selectedUser.isAnonymized ? <span style={styles.neutralChip}>Anonymized</span> : null}
//                       {selectedUser.eligibleForChat ? <span style={styles.goodChip}>Chat OK</span> : <span style={styles.neutralChip}>Chat Off</span>}
//                     </div>
//                   </div>

//                   {/* READ ONLY */}
//                   {!isEditing && (
//                     <>
//                       <div style={styles.infoGrid}>
//                         <Info label="User ID" value={<span style={styles.mono}>{selectedUser.id}</span>} />
//                         <Info label="Firebase ID" value={<span style={styles.mono}>{selectedUser.firebaseId}</span>} />
//                         <Info label="Email" value={selectedUser.email || "—"} />
//                         <Info label="Phone" value={selectedUser.phoneNumber || "—"} />
//                         <Info label="Reward Points" value={<span style={styles.mono}>{selectedUser.rewardPoints}</span>} />
//                         <Info label="All-time Points" value={<span style={styles.mono}>{selectedUser.allTimeRewardPoints ?? 0}</span>} />
//                         <Info
//                           label="Location"
//                           value={
//                             selectedUser.locationDto
//                               ? `${selectedUser.locationDto.country} (${selectedUser.locationDto.region})`
//                               : "—"
//                           }
//                         />
//                       </div>

//                       {/* Referral */}
//                       <div style={{ marginTop: 14 }}>
//                         <div style={styles.sectionTitle}>Referral</div>

//                         <div style={styles.infoGrid}>
//                           <Info
//                             label="Owner"
//                             value={
//                               selectedUser.isReferralCodeOwner ? (
//                                 <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
//                                   <span style={styles.goodChip}>Yes</span>
//                                   <button
//                                     type="button"
//                                     onClick={handleViewOwnerReferralCode}
//                                     style={styles.secondaryBtn}
//                                     disabled={ownerReferralLoading}
//                                   >
//                                     {ownerReferralLoading ? "Loading..." : "View referral code"}
//                                   </button>
//                                 </div>
//                               ) : (
//                                 <span style={styles.neutralChip}>No</span>
//                               )
//                             }
//                           />
//                           <Info label="Referral code name" value={selectedUser.referralCodeName ?? "—"} />
//                           <Info label="Has used code" value={selectedUser.hasUsedReferralCode ? "Yes" : "No"} />
//                           <Info label="Code used" value={selectedUser.referralCodeUsed ?? "—"} />
//                         </div>

//                         {ownerReferralError && <div style={{ ...styles.alertError, marginTop: 10 }}>{ownerReferralError}</div>}

//                         {ownerReferralCode && (
//                           <div style={styles.subCard}>
//                             <div style={styles.subCardTitle}>
//                               Referral Code: <span style={styles.mono}>{ownerReferralCode.code}</span>
//                             </div>
//                             <div style={styles.subGrid}>
//                               <Mini label="Owner ID" value={ownerReferralCode.ownerId} />
//                               <Mini label="Reward (user)" value={ownerReferralCode.rewardPoints} />
//                               <Mini label="Reward (owner)" value={ownerReferralCode.ownerRewardPoints} />
//                               <Mini label="Max uses" value={ownerReferralCode.maxUses} />
//                               <Mini label="Uses so far" value={ownerReferralCode.usesSoFar} />
//                               <Mini label="Disabled" value={ownerReferralCode.isDisabled ? "Yes" : "No"} />
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </>
//                   )}

//                   {/* EDIT VIEW */}
//                   {isEditing && editForm && (
//                     <form id="edit-user-form" onSubmit={handleSubmitEdit} style={{ marginTop: 12 }}>
//                       {saveError && <div style={styles.alertError}>{saveError}</div>}

//                       <div style={styles.formGrid}>
//                         <Field label="Username">
//                           <input
//                             type="text"
//                             value={editForm.username}
//                             onChange={(e) => handleEditChange("username", e.target.value)}
//                             required
//                             style={styles.input}
//                             disabled={saving}
//                           />
//                         </Field>

//                         <Field label="Email">
//                           <input
//                             type="email"
//                             value={editForm.email}
//                             onChange={(e) => handleEditChange("email", e.target.value)}
//                             required
//                             style={styles.input}
//                             disabled={saving}
//                           />
//                         </Field>

//                         <Field label="Reward Points">
//                           <input
//                             type="number"
//                             min={0}
//                             value={editForm.rewardPoints}
//                             onChange={(e) => handleEditChange("rewardPoints", Number(e.target.value))}
//                             required
//                             style={styles.input}
//                             disabled={saving}
//                           />
//                         </Field>

//                         <Field label="Avatar">
//                           <select
//                             value={editForm.avatar}
//                             onChange={(e) => handleEditChange("avatar", e.target.value as Avatar)}
//                             style={styles.select}
//                             disabled={saving}
//                           >
//                             {avatarOptions.map((opt) => (
//                               <option key={opt.value} value={opt.value}>
//                                 {opt.label}
//                               </option>
//                             ))}
//                           </select>
//                         </Field>

//                         <Field label="Role">
//                           <input
//                             type="text"
//                             value={editForm.role}
//                             onChange={(e) => handleEditChange("role", e.target.value)}
//                             required
//                             style={styles.input}
//                             disabled={saving}
//                           />
//                         </Field>

//                         <div style={styles.checkGroup}>
//                           <label style={styles.checkRow}>
//                             <input
//                               type="checkbox"
//                               checked={editForm.isBanned}
//                               onChange={(e) => handleEditChange("isBanned", e.target.checked)}
//                               disabled={saving}
//                             />
//                             <span style={styles.checkLabel}>Banned</span>
//                           </label>

//                           <label style={styles.checkRow}>
//                             <input
//                               type="checkbox"
//                               checked={editForm.isAnonymized}
//                               onChange={(e) => handleEditChange("isAnonymized", e.target.checked)}
//                               disabled={saving}
//                             />
//                             <span style={styles.checkLabel}>Anonymized</span>
//                           </label>

//                           <label style={styles.checkRow}>
//                             <input
//                               type="checkbox"
//                               checked={editForm.eligibleForChat}
//                               onChange={(e) => handleEditChange("eligibleForChat", e.target.checked)}
//                               disabled={saving}
//                             />
//                             <span style={styles.checkLabel}>Eligible for chat</span>
//                           </label>
//                         </div>
//                       </div>

//                       <div style={{ marginTop: 14 }}>
//                         <div style={styles.sectionTitle}>Location</div>
//                         <div style={styles.formGrid}>
//                           <Field label="Country">
//                             <input
//                               type="text"
//                               value={editForm.locationDto.country}
//                               onChange={(e) => handleEditLocationChange("country", e.target.value)}
//                               required
//                               style={styles.input}
//                               disabled={saving}
//                             />
//                           </Field>

//                           <Field label="Region">
//                             <select
//                               value={editForm.locationDto.region}
//                               onChange={(e) => handleEditLocationChange("region", e.target.value)}
//                               style={styles.select}
//                               disabled={saving}
//                             >
//                               {regionOptions.map((r) => (
//                                 <option key={r} value={r}>
//                                   {r}
//                                 </option>
//                               ))}
//                             </select>
//                           </Field>
//                         </div>
//                       </div>
//                     </form>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* μικρή κάρτα βοήθειας */}
//           <div style={styles.helperNote}>
//             Tip: Στο table δείχνουμε “User / Role / Rewards / Banned / Location” για να μην είναι φορτωμένο.
//             Τα υπόλοιπα φαίνονται στο panel δεξιά.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminUsersPage;

// /* ---------- small presentational helpers (no logic change) ---------- */

// const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
//   <div style={styles.infoItem}>
//     <div style={styles.infoLabel}>{label}</div>
//     <div style={styles.infoValue}>{value}</div>
//   </div>
// );

// const Mini: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
//   <div style={styles.miniItem}>
//     <div style={styles.miniLabel}>{label}</div>
//     <div style={styles.miniValue}>{value}</div>
//   </div>
// );

// const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
//   <div style={styles.field}>
//     <div style={styles.label}>{label}</div>
//     {children}
//   </div>
// );

// const styles: Record<string, React.CSSProperties> = {
//   page: {
//     maxWidth: 1200,
//     margin: "0 auto",
//     padding: "20px 16px 28px",
//     background: "#f6f7fb",
//     minHeight: "100vh",
//     position: "relative",
//   },

//   header: {
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     gap: 16,
//     marginBottom: 16,
//   },

//   title: { margin: 0, fontSize: 24, letterSpacing: -0.2, color: "#0f172a" },
//   subtitle: { margin: "8px 0 0", fontSize: 14, color: "#64748b", lineHeight: 1.5, maxWidth: 840 },

//   badge: {
//     fontSize: 12,
//     fontWeight: 900,
//     padding: "6px 10px",
//     borderRadius: 999,
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     color: "#0f172a",
//   },

//   grid: {
//     display: "grid",
//     gridTemplateColumns: "1.35fr 0.95fr",
//     gap: 16,
//     alignItems: "start",
//   },

//   stack: { display: "flex", flexDirection: "column", gap: 16 },

//   card: {
//     background: "#ffffff",
//     border: "1px solid #e5e7eb",
//     borderRadius: 16,
//     boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
//     padding: 16,
//   },

//   cardHeader: {
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     gap: 12,
//     marginBottom: 12,
//   },

//   cardTitle: { fontSize: 16, fontWeight: 900, color: "#0f172a", marginBottom: 4 },
//   cardHint: { fontSize: 13, color: "#64748b", lineHeight: 1.4 },

//   toolbar: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

//   input: {
//     height: 40,
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     padding: "0 12px",
//     outline: "none",
//     fontSize: 14,
//     color: "#0f172a",
//     background: "#ffffff",
//   },

//   select: {
//     height: 40,
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     padding: "0 12px",
//     outline: "none",
//     fontSize: 14,
//     color: "#0f172a",
//     background: "#ffffff",
//   },

//   primaryBtn: {
//     height: 40,
//     padding: "0 14px",
//     borderRadius: 12,
//     border: "1px solid #0f172a",
//     background: "#0f172a",
//     color: "#ffffff",
//     cursor: "pointer",
//     fontWeight: 900,
//     whiteSpace: "nowrap",
//     boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
//   },

//   secondaryBtn: {
//     height: 40,
//     padding: "0 14px",
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     color: "#0f172a",
//     cursor: "pointer",
//     fontWeight: 900,
//     whiteSpace: "nowrap",
//   },

//   filterPill: {
//     marginTop: 10,
//     marginBottom: 10,
//     padding: "8px 10px",
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     background: "#fbfdff",
//     color: "#334155",
//     fontSize: 13,
//   },

//   // table
//   table: {
//     width: "100%",
//     borderCollapse: "separate",
//     borderSpacing: 0,
//     border: "1px solid #e5e7eb",
//     borderRadius: 12,
//     overflow: "hidden",
//   },

//   th: {
//     textAlign: "left",
//     fontSize: 12,
//     fontWeight: 900,
//     color: "#334155",
//     background: "#f8fafc",
//     padding: "10px 12px",
//     borderBottom: "1px solid #e5e7eb",
//     whiteSpace: "nowrap",
//   },

//   tr: { background: "#ffffff", cursor: "pointer" },
//   trActive: { background: "#f1f5ff" },

//   td: {
//     padding: "10px 12px",
//     borderBottom: "1px solid #f1f5f9",
//     fontSize: 14,
//     color: "#0f172a",
//     verticalAlign: "middle",
//   },

//   tdMono: {
//     padding: "10px 12px",
//     borderBottom: "1px solid #f1f5f9",
//     fontSize: 13,
//     color: "#64748b",
//     fontFamily:
//       'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
//     whiteSpace: "nowrap",
//   },

//   avatarSm: { width: 36, height: 36, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" },
//   avatarLg: { width: 76, height: 76, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" },

//   userPrimary: { fontWeight: 900, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
//   userSecondary: { fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

//   chip: {
//     display: "inline-flex",
//     alignItems: "center",
//     padding: "6px 10px",
//     borderRadius: 999,
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     fontSize: 12,
//     fontWeight: 900,
//     color: "#0f172a",
//     whiteSpace: "nowrap",
//   },

//   goodChip: {
//     display: "inline-flex",
//     alignItems: "center",
//     padding: "6px 10px",
//     borderRadius: 999,
//     border: "1px solid #a7f3d0",
//     background: "#ecfdf5",
//     fontSize: 12,
//     fontWeight: 900,
//     color: "#065f46",
//     whiteSpace: "nowrap",
//   },

//   badChip: {
//     display: "inline-flex",
//     alignItems: "center",
//     padding: "6px 10px",
//     borderRadius: 999,
//     border: "1px solid #fecdd3",
//     background: "#fff1f2",
//     fontSize: 12,
//     fontWeight: 900,
//     color: "#9f1239",
//     whiteSpace: "nowrap",
//   },

//   neutralChip: {
//     display: "inline-flex",
//     alignItems: "center",
//     padding: "6px 10px",
//     borderRadius: 999,
//     border: "1px solid #e5e7eb",
//     background: "#f8fafc",
//     fontSize: 12,
//     fontWeight: 900,
//     color: "#334155",
//     whiteSpace: "nowrap",
//   },

//   pagination: { marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
//   paginationText: { fontSize: 13, color: "#334155" },

//   skeleton: {
//     padding: "14px 12px",
//     borderRadius: 12,
//     border: "1px dashed #e5e7eb",
//     color: "#64748b",
//     background: "#fbfdff",
//     fontWeight: 800,
//   },

//   emptyState: { padding: "18px 12px", borderRadius: 12, border: "1px dashed #e5e7eb", background: "#fbfdff" },
//   emptyTitle: { fontWeight: 900, color: "#0f172a", marginBottom: 6 },
//   emptyText: { color: "#64748b", fontSize: 13, lineHeight: 1.5 },

//   alertError: {
//     background: "#fff1f2",
//     border: "1px solid #fecdd3",
//     color: "#9f1239",
//     borderRadius: 12,
//     padding: "10px 12px",
//     fontWeight: 800,
//   },

//   detailsHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10, flexWrap: "wrap" },
//   detailsName: { fontSize: 16, fontWeight: 950, color: "#0f172a" },

//   infoGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: 10,
//     marginTop: 10,
//   },

//   infoItem: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "#ffffff" },
//   infoLabel: { fontSize: 12, fontWeight: 900, color: "#334155", marginBottom: 4 },
//   infoValue: { fontSize: 13, color: "#0f172a", lineHeight: 1.45, overflowWrap: "anywhere" },

//   sectionTitle: { marginTop: 6, fontSize: 13, fontWeight: 950, color: "#0f172a", marginBottom: 8 },

//   subCard: { marginTop: 10, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fbfdff", padding: 12 },
//   subCardTitle: { fontSize: 13, fontWeight: 950, color: "#0f172a", marginBottom: 10 },
//   subGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

//   miniItem: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "#ffffff" },
//   miniLabel: { fontSize: 12, fontWeight: 900, color: "#334155", marginBottom: 4 },
//   miniValue: { fontSize: 13, color: "#0f172a" },

//   formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 6 },

//   field: { display: "flex", flexDirection: "column", gap: 6 },
//   label: { fontSize: 12, fontWeight: 900, color: "#334155" },

//   checkGroup: { display: "flex", flexDirection: "column", gap: 10, padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fbfdff" },
//   checkRow: { display: "flex", alignItems: "center", gap: 10 },
//   checkLabel: { fontSize: 13, fontWeight: 800, color: "#0f172a" },

//   helperNote: { fontSize: 12, color: "#64748b", lineHeight: 1.5, padding: "0 4px" },

//   toast: {
//     position: "fixed",
//     top: 16,
//     right: 16,
//     maxWidth: 520,
//     zIndex: 9999,
//     padding: "10px 12px",
//     borderRadius: 14,
//     fontWeight: 900,
//     boxShadow: "0 8px 20px rgba(15, 23, 42, 0.15)",
//     border: "1px solid transparent",
//   },
//   toastSuccess: { background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" },
//   toastError: { background: "#fff1f2", borderColor: "#fecdd3", color: "#9f1239" },

//   mono: {
//     fontFamily:
//       'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
//   },
// };


// src/admin/components/AdminUsersPage.tsx
// src/admin/components/AdminUsersPage.tsx

// src/admin/components/AdminUsersPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { getAdminUsers, getAdminUser, updateAdminUser } from "../../api/admin/Users";
import { getReferralCodeByCode } from "../../api/Springboot/ReferralCodeService";

import type { Avatar } from "../../models/Springboot/UserEntity";
import type {
  AdminUserEntityDto,
  PageResponse,
  UserEntityUpdateAdmin,
  Region,
  UserSearchBy,
} from "../models/AdminResponseUser";

import type { ReferralCodeDtoAdminResponse } from "../../models/Springboot/ReferralCode";

const PAGE_SIZE = 20;

const avatarOptions: { value: Avatar; label: string }[] = [
  { value: "BEARD_MAN_AVATAR", label: "Beard Man" },
  { value: "MAN_AVATAR", label: "Man" },
  { value: "BLONDE_GIRL_AVATAR", label: "Blonde Girl" },
  { value: "GIRL_AVATAR", label: "Girl" },
  { value: "DEFAULT_AVATAR", label: "Default Avatar" },
  { value: "DEFAULT", label: "Default" },
];

const regionOptions: Region[] = ["NICOSIA", "LIMASSOL", "LARNACA", "PAPHOS", "FAMAGUSTA"];

const searchByOptions: { value: UserSearchBy; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "username", label: "Username" },
  { value: "firebaseId", label: "Firebase ID" },
];

// helper για Avatar από URL
const detectAvatarFromUrl = (avatarUrl?: string | null): Avatar => {
  if (!avatarUrl) return "DEFAULT_AVATAR";
  if (avatarUrl.includes("BEARD_MAN_AVATAR")) return "BEARD_MAN_AVATAR";
  if (avatarUrl.includes("BLONDE_GIRL_AVATAR")) return "BLONDE_GIRL_AVATAR";
  if (avatarUrl.includes("GIRL_AVATAR")) return "GIRL_AVATAR";
  if (avatarUrl.includes("MAN_AVATAR")) return "MAN_AVATAR";
  return "DEFAULT_AVATAR";
};

// ✅ Responsive helper (UI only — no business logic)
const useBreakpoints = () => {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  return { width, isMobile, isTablet };
};

type MessageType = "success" | "error" | null;

const AdminUsersPage: React.FC = () => {
  const { isMobile, isTablet } = useBreakpoints();
  const isNarrow = isMobile || isTablet;

  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<AdminUserEntityDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<AdminUserEntityDto | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedError, setSelectedError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserEntityUpdateAdmin | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 🔍 search state (UI)
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState<UserSearchBy>("username");

  // 🔍 applied search (αυτά στέλνουμε στο backend)
  const [appliedSearch, setAppliedSearch] = useState<string | undefined>();
  const [appliedSearchBy, setAppliedSearchBy] = useState<UserSearchBy>("username");

  // 👉 referral code details for owner
  const [ownerReferralCode, setOwnerReferralCode] = useState<ReferralCodeDtoAdminResponse | null>(null);
  const [ownerReferralLoading, setOwnerReferralLoading] = useState(false);
  const [ownerReferralError, setOwnerReferralError] = useState<string | null>(null);

  // toast (μικρή UX βελτίωση)
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

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getAdminUsers(page, PAGE_SIZE, appliedSearch, appliedSearchBy);

        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load users";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [page, appliedSearch, appliedSearchBy]);

  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (data && !data.last) setPage((p) => p + 1);
  };

  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = search.trim();
    setAppliedSearch(trimmed === "" ? undefined : trimmed);
    setAppliedSearchBy(searchBy);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearch("");
    setAppliedSearch(undefined);
    setAppliedSearchBy("username");
    setPage(0);
  };

  const selectedFirebaseId = selectedUser?.firebaseId;

  const handleSelectUser = async (firebaseId: string) => {
    if (!firebaseId) return;

    setSelectedUser(null);
    setSelectedError(null);
    setSelectedLoading(true);
    setIsEditing(false);
    setEditForm(null);
    setSaveError(null);

    setOwnerReferralCode(null);
    setOwnerReferralError(null);
    setOwnerReferralLoading(false);

    try {
      const user = await getAdminUser(firebaseId);
      setSelectedUser(user);

      const avatar = detectAvatarFromUrl(user.avatarUrl);
      const location = user.locationDto ?? { country: "", region: "NICOSIA" as Region };

      setEditForm({
        username: user.username,
        email: user.email,
        rewardPoints: user.rewardPoints,
        avatar,
        role: user.role,
        isBanned: user.isBanned,
        isAnonymized: user.isAnonymized,
        eligibleForChat: user.eligibleForChat,
        locationDto: location,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load user details";
      setSelectedError(message);
    } finally {
      setSelectedLoading(false);
    }
  };

  const handleEditChange = <K extends keyof UserEntityUpdateAdmin>(field: K, value: UserEntityUpdateAdmin[K]) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleEditLocationChange = (field: "country" | "region", value: string) => {
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            locationDto: {
              ...(prev.locationDto ?? { country: "", region: "NICOSIA" }),
              [field]: value,
            },
          }
        : prev
    );
  };

  const handleStartEdit = () => {
    if (!selectedUser || !editForm) return;
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    if (!selectedUser) {
      setIsEditing(false);
      setEditForm(null);
      return;
    }
    const avatar = detectAvatarFromUrl(selectedUser.avatarUrl);
    const location = selectedUser.locationDto ?? { country: "", region: "NICOSIA" as Region };

    setEditForm({
      username: selectedUser.username,
      email: selectedUser.email,
      rewardPoints: selectedUser.rewardPoints,
      avatar,
      role: selectedUser.role,
      isBanned: selectedUser.isBanned,
      isAnonymized: selectedUser.isAnonymized,
      eligibleForChat: selectedUser.eligibleForChat,
      locationDto: location,
    });
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !editForm) return;

    setSaving(true);
    setSaveError(null);

    const cleanForm: UserEntityUpdateAdmin = {
      ...editForm,
      rewardPoints: Number.isNaN(Number(editForm.rewardPoints)) ? 0 : Number(editForm.rewardPoints),
      locationDto: {
        country: editForm.locationDto.country,
        region: editForm.locationDto.region,
      },
    };

    try {
      const updated = await updateAdminUser(selectedUser.firebaseId, cleanForm);
      setSelectedUser(updated);
      setIsEditing(false);

      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((u) => (u.firebaseId === updated.firebaseId ? updated : u)),
            }
          : prev
      );

      showMessage("success", "Ο χρήστης ενημερώθηκε επιτυχώς.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      setSaveError(message);
      showMessage("error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleViewOwnerReferralCode = async () => {
    if (!selectedUser || !selectedUser.isReferralCodeOwner || !selectedUser.referralCodeName) return;

    setOwnerReferralCode(null);
    setOwnerReferralError(null);
    setOwnerReferralLoading(true);

    try {
      const codeData = await getReferralCodeByCode(selectedUser.referralCodeName);
      setOwnerReferralCode(codeData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load referral code details";
      setOwnerReferralError(message);
    } finally {
      setOwnerReferralLoading(false);
    }
  };

  const tableRows = useMemo(() => data?.content ?? [], [data]);

  return (
    <div
      style={{
        ...styles.page,
        ...(isNarrow ? { padding: "14px 12px 20px" } : {}),
      }}
    >
      {/* Toast */}
      {message && (
        <div
          style={{
            ...styles.toast,
            ...(isMobile ? { left: 12, right: 12, maxWidth: "calc(100vw - 24px)" } : {}),
            ...(messageType === "error" ? styles.toastError : styles.toastSuccess),
          }}
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <div style={styles.header}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ ...styles.title, ...(isMobile ? { fontSize: 20 } : {}) }}>Admin – Users</h1>
            <span style={styles.badge}>Management</span>
          </div>
          <p style={styles.subtitle}>Αναζήτηση, προβολή και επεξεργασία χρηστών. Κάνε click σε χρήστη για λεπτομέρειες.</p>
        </div>
      </div>

      <div
        style={{
          ...styles.grid,
          ...(isNarrow ? { gridTemplateColumns: "1fr", gap: 12 } : {}),
        }}
      >
        {/* LEFT: list */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>Users</div>
              <div style={styles.cardHint}>{data ? <>Εγγράφηκαν {data.totalElements} χρήστες</> : "—"}</div>
            </div>

            {/* Search toolbar */}
            <form
              onSubmit={handleApplySearch}
              style={{
                ...styles.toolbar,
                ...(isNarrow ? { width: "100%", alignItems: "stretch" } : {}),
              }}
            >
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  ...styles.input,
                  width: isNarrow ? "100%" : 220,
                  flex: isNarrow ? "1 1 100%" : undefined,
                }}
                disabled={loading}
              />

              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value as UserSearchBy)}
                style={{
                  ...styles.select,
                  width: isNarrow ? "100%" : 160,
                  flex: isNarrow ? "1 1 100%" : undefined,
                }}
                disabled={loading}
              >
                {searchByOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, ...(isNarrow ? { width: "100%" } : {}) }}>
                Search
              </button>

              <button
                type="button"
                onClick={handleClearSearch}
                disabled={loading && !appliedSearch}
                style={{ ...styles.secondaryBtn, ...(isNarrow ? { width: "100%" } : {}) }}
              >
                Clear
              </button>
            </form>
          </div>

          {appliedSearch && (
            <div style={styles.filterPill}>
              Filtering by <strong>{appliedSearchBy}</strong>: <span style={styles.mono}>"{appliedSearch}"</span>
            </div>
          )}

          {loading && <div style={styles.skeleton}>Loading users…</div>}
          {error && <div style={styles.alertError}>{error}</div>}

          {!loading && data && data.content.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>No users found</div>
              <div style={styles.emptyText}>Δοκίμασε άλλη αναζήτηση ή καθάρισε τα φίλτρα.</div>
            </div>
          )}

          {data && data.content.length > 0 && (
            <>
              {/* ✅ Mobile: Cards (όλα τα στοιχεία φαίνονται) */}
              {isMobile ? (
                <div style={styles.mobileList}>
                  {tableRows.map((user) => {
                    const active = selectedFirebaseId && user.firebaseId === selectedFirebaseId;

                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user.firebaseId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectUser(user.firebaseId);
                          }
                        }}
                        style={{
                          ...styles.mobileCard,
                          ...(active ? styles.mobileCardActive : {}),
                        }}
                      >
                        <div style={styles.mobileCardTop}>
                          <img src={user.avatarUrl} alt={user.username} style={styles.mobileAvatar} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={styles.userPrimary}>{user.username}</div>
                            <div style={styles.userSecondary}>{user.email}</div>
                          </div>
                          <span style={styles.chip}>{user.role}</span>
                        </div>

                        <div style={styles.mobileMetaRow}>
                          {user.isBanned ? <span style={styles.badChip}>Banned</span> : <span style={styles.goodChip}>Active</span>}
                          <span style={styles.metaText}>
                            Rewards: <span style={styles.mono}>{user.rewardPoints}</span>
                          </span>
                        </div>

                        <div style={styles.mobileMetaRow}>
                          <span style={styles.metaText}>
                            Location:{" "}
                            {user.locationDto ? `${user.locationDto.country} (${user.locationDto.region})` : "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ✅ Tablet/Desktop: Table (κανένα “κρυφό” column) */
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>User</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Rewards</th>
                        <th style={styles.th}>Banned</th>
                        <th style={styles.th}>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((user) => {
                        const active = selectedFirebaseId && user.firebaseId === selectedFirebaseId;

                        return (
                          <tr
                            key={user.id}
                            onClick={() => handleSelectUser(user.firebaseId)}
                            style={{
                              ...styles.tr,
                              ...(active ? styles.trActive : {}),
                            }}
                          >
                            <td style={styles.td}>
                              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <img src={user.avatarUrl} alt={user.username} style={styles.avatarSm} />
                                <div style={{ minWidth: 0 }}>
                                  <div style={styles.userPrimary}>{user.username}</div>
                                  <div style={styles.userSecondary}>{user.email}</div>
                                </div>
                              </div>
                            </td>

                            <td style={styles.td}>
                              <span style={styles.chip}>{user.role}</span>
                            </td>

                            <td style={styles.tdMono}>{user.rewardPoints}</td>

                            <td style={styles.td}>
                              <span style={user.isBanned ? styles.badChip : styles.goodChip}>
                                {user.isBanned ? "Yes" : "No"}
                              </span>
                            </td>

                            <td style={styles.td}>
                              {user.locationDto ? `${user.locationDto.country} (${user.locationDto.region})` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div
                style={{
                  ...styles.pagination,
                  ...(isNarrow ? { flexDirection: "column", alignItems: "stretch", gap: 10 } : {}),
                }}
              >
                <button
                  onClick={handlePrev}
                  disabled={page === 0 || loading}
                  style={{ ...styles.secondaryBtn, ...(isNarrow ? { width: "100%" } : {}) }}
                >
                  Previous
                </button>
                <div style={{ ...styles.paginationText, ...(isNarrow ? { textAlign: "center" as const } : {}) }}>
                  Page <strong>{data.number + 1}</strong> of <strong>{data.totalPages}</strong>
                  <span style={{ color: "#94a3b8" }}> • </span>
                  <span>{data.totalElements} total</span>
                </div>
                <button
                  onClick={handleNext}
                  disabled={data.last || loading}
                  style={{ ...styles.secondaryBtn, ...(isNarrow ? { width: "100%" } : {}) }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: details */}
        <div style={styles.stack}>
          <div style={styles.card}>
            <div
              style={{
                ...styles.cardHeader,
                ...(isNarrow ? { flexDirection: "column", alignItems: "stretch" } : {}),
              }}
            >
              <div>
                <div style={styles.cardTitle}>User details</div>
              </div>

              {selectedUser &&
                !selectedLoading &&
                (!isEditing ? (
                  <button onClick={handleStartEdit} style={styles.primaryBtn}>
                    Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 10, ...(isNarrow ? { flexDirection: "column" as const } : {}) }}>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      style={{ ...styles.secondaryBtn, ...(isNarrow ? { width: "100%" } : {}) }}
                    >
                      Cancel
                    </button>
                    <button
                      form="edit-user-form"
                      type="submit"
                      disabled={saving}
                      style={{ ...styles.primaryBtn, ...(isNarrow ? { width: "100%" } : {}) }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                ))}
            </div>

            {selectedLoading && <div style={styles.skeleton}>Loading user details…</div>}
            {selectedError && <div style={styles.alertError}>{selectedError}</div>}

            {!selectedUser && !selectedLoading && (
              <div style={styles.emptyState}>
                <div style={styles.emptyTitle}>No user selected</div>
                <div style={styles.emptyText}>Κάνε click σε έναν χρήστη για να ανοίξει το panel.</div>
              </div>
            )}

            {selectedUser && (
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  ...(isNarrow ? { flexDirection: "column" as const } : {}),
                }}
              >
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.username}
                  style={{
                    ...styles.avatarLg,
                    ...(isMobile ? { width: 64, height: 64 } : {}),
                    ...(isNarrow ? { alignSelf: "center" as const } : {}),
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.detailsHeader}>
                    <div style={styles.detailsName}>{selectedUser.username}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={styles.chip}>{selectedUser.role}</span>
                      {selectedUser.isBanned ? <span style={styles.badChip}>Banned</span> : <span style={styles.goodChip}>Active</span>}
                      {selectedUser.isAnonymized ? <span style={styles.neutralChip}>Anonymized</span> : null}
                      {selectedUser.eligibleForChat ? <span style={styles.goodChip}>Chat OK</span> : <span style={styles.neutralChip}>Chat Off</span>}
                    </div>
                  </div>

                  {/* READ ONLY */}
                  {!isEditing && (
                    <>
                      <div style={{ ...styles.infoGrid, ...(isMobile ? { gridTemplateColumns: "1fr" } : {}) }}>
                        <Info label="User ID" value={<span style={styles.mono}>{selectedUser.id}</span>} />
                        <Info label="Firebase ID" value={<span style={styles.mono}>{selectedUser.firebaseId}</span>} />
                        <Info label="Email" value={selectedUser.email || "—"} />
                        <Info label="Phone" value={selectedUser.phoneNumber || "—"} />
                        <Info label="Reward Points" value={<span style={styles.mono}>{selectedUser.rewardPoints}</span>} />
                        <Info label="All-time Points" value={<span style={styles.mono}>{selectedUser.allTimeRewardPoints ?? 0}</span>} />
                        <Info
                          label="Location"
                          value={selectedUser.locationDto ? `${selectedUser.locationDto.country} (${selectedUser.locationDto.region})` : "—"}
                        />
                      </div>

                      {/* Referral */}
                      <div style={{ marginTop: 14 }}>
                        <div style={styles.sectionTitle}>Referral</div>

                        <div style={{ ...styles.infoGrid, ...(isMobile ? { gridTemplateColumns: "1fr" } : {}) }}>
                          <Info
                            label="Owner"
                            value={
                              selectedUser.isReferralCodeOwner ? (
                                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                  <span style={styles.goodChip}>Yes</span>
                                  <button
                                    type="button"
                                    onClick={handleViewOwnerReferralCode}
                                    style={styles.secondaryBtn}
                                    disabled={ownerReferralLoading}
                                  >
                                    {ownerReferralLoading ? "Loading..." : "View referral code"}
                                  </button>
                                </div>
                              ) : (
                                <span style={styles.neutralChip}>No</span>
                              )
                            }
                          />
                          <Info label="Referral code name" value={selectedUser.referralCodeName ?? "—"} />
                          <Info label="Has used code" value={selectedUser.hasUsedReferralCode ? "Yes" : "No"} />
                          <Info label="Code used" value={selectedUser.referralCodeUsed ?? "—"} />
                        </div>

                        {ownerReferralError && <div style={{ ...styles.alertError, marginTop: 10 }}>{ownerReferralError}</div>}

                        {ownerReferralCode && (
                          <div style={styles.subCard}>
                            <div style={styles.subCardTitle}>
                              Referral Code: <span style={styles.mono}>{ownerReferralCode.code}</span>
                            </div>
                            <div style={{ ...styles.subGrid, ...(isMobile ? { gridTemplateColumns: "1fr" } : {}) }}>
                              <Mini label="Owner ID" value={ownerReferralCode.ownerId} />
                              <Mini label="Reward (user)" value={ownerReferralCode.rewardPoints} />
                              <Mini label="Reward (owner)" value={ownerReferralCode.ownerRewardPoints} />
                              <Mini label="Max uses" value={ownerReferralCode.maxUses} />
                              <Mini label="Uses so far" value={ownerReferralCode.usesSoFar} />
                              <Mini label="Disabled" value={ownerReferralCode.isDisabled ? "Yes" : "No"} />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* EDIT VIEW */}
                  {isEditing && editForm && (
                    <form id="edit-user-form" onSubmit={handleSubmitEdit} style={{ marginTop: 12 }}>
                      {saveError && <div style={styles.alertError}>{saveError}</div>}

                      <div style={{ ...styles.formGrid, ...(isMobile ? { gridTemplateColumns: "1fr" } : {}) }}>
                        <Field label="Username">
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => handleEditChange("username", e.target.value)}
                            required
                            style={styles.input}
                            disabled={saving}
                          />
                        </Field>

                        <Field label="Email">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => handleEditChange("email", e.target.value)}
                            required
                            style={styles.input}
                            disabled={saving}
                          />
                        </Field>

                        <Field label="Reward Points">
                          <input
                            type="number"
                            min={0}
                            value={editForm.rewardPoints}
                            onChange={(e) => handleEditChange("rewardPoints", Number(e.target.value))}
                            required
                            style={styles.input}
                            disabled={saving}
                          />
                        </Field>

                        <Field label="Avatar">
                          <select
                            value={editForm.avatar}
                            onChange={(e) => handleEditChange("avatar", e.target.value as Avatar)}
                            style={styles.select}
                            disabled={saving}
                          >
                            {avatarOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Role">
                          <input
                            type="text"
                            value={editForm.role}
                            onChange={(e) => handleEditChange("role", e.target.value)}
                            required
                            style={styles.input}
                            disabled={saving}
                          />
                        </Field>

                        <div style={styles.checkGroup}>
                          <label style={styles.checkRow}>
                            <input
                              type="checkbox"
                              checked={editForm.isBanned}
                              onChange={(e) => handleEditChange("isBanned", e.target.checked)}
                              disabled={saving}
                            />
                            <span style={styles.checkLabel}>Banned</span>
                          </label>

                          <label style={styles.checkRow}>
                            <input
                              type="checkbox"
                              checked={editForm.isAnonymized}
                              onChange={(e) => handleEditChange("isAnonymized", e.target.checked)}
                              disabled={saving}
                            />
                            <span style={styles.checkLabel}>Anonymized</span>
                          </label>

                          <label style={styles.checkRow}>
                            <input
                              type="checkbox"
                              checked={editForm.eligibleForChat}
                              onChange={(e) => handleEditChange("eligibleForChat", e.target.checked)}
                              disabled={saving}
                            />
                            <span style={styles.checkLabel}>Eligible for chat</span>
                          </label>
                        </div>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <div style={styles.sectionTitle}>Location</div>
                        <div style={{ ...styles.formGrid, ...(isMobile ? { gridTemplateColumns: "1fr" } : {}) }}>
                          <Field label="Country">
                            <input
                              type="text"
                              value={editForm.locationDto.country}
                              onChange={(e) => handleEditLocationChange("country", e.target.value)}
                              required
                              style={styles.input}
                              disabled={saving}
                            />
                          </Field>

                          <Field label="Region">
                            <select
                              value={editForm.locationDto.region}
                              onChange={(e) => handleEditLocationChange("region", e.target.value)}
                              style={styles.select}
                              disabled={saving}
                            >
                              {regionOptions.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* μικρή κάρτα βοήθειας */}
          <div style={styles.helperNote}>
            Tip: Στο mobile δείχνουμε cards (όλα τα στοιχεία φαίνονται), ενώ σε tablet/desktop δείχνουμε table.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;

/* ---------- small presentational helpers (no logic change) ---------- */

const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={styles.infoItem}>
    <div style={styles.infoLabel}>{label}</div>
    <div style={styles.infoValue}>{value}</div>
  </div>
);

const Mini: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={styles.miniItem}>
    <div style={styles.miniLabel}>{label}</div>
    <div style={styles.miniValue}>{value}</div>
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
  },

  title: { margin: 0, fontSize: 24, letterSpacing: -0.2, color: "#0f172a" },
  subtitle: { margin: "8px 0 0", fontSize: 14, color: "#64748b", lineHeight: 1.5, maxWidth: 840 },

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
  },

  cardTitle: { fontSize: 16, fontWeight: 900, color: "#0f172a", marginBottom: 4 },
  cardHint: { fontSize: 13, color: "#64748b", lineHeight: 1.4 },

  toolbar: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

  input: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#ffffff",
  },

  select: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#ffffff",
  },

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

  filterPill: {
    marginTop: 10,
    marginBottom: 10,
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fbfdff",
    color: "#334155",
    fontSize: 13,
  },

  // table
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
    background: "#f8fafc",
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  tr: { background: "#ffffff", cursor: "pointer" },
  trActive: { background: "#f1f5ff" },

  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
    color: "#0f172a",
    verticalAlign: "middle",
  },

  tdMono: {
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    color: "#64748b",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    whiteSpace: "nowrap",
  },

  avatarSm: { width: 36, height: 36, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" },
  avatarLg: { width: 76, height: 76, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" },

  userPrimary: { fontWeight: 900, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userSecondary: { fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

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

  pagination: { marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  paginationText: { fontSize: 13, color: "#334155" },

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

  alertError: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
  },

  detailsHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10, flexWrap: "wrap" },
  detailsName: { fontSize: 16, fontWeight: 950, color: "#0f172a" },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 10,
  },

  infoItem: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "#ffffff" },
  infoLabel: { fontSize: 12, fontWeight: 900, color: "#334155", marginBottom: 4 },
  infoValue: { fontSize: 13, color: "#0f172a", lineHeight: 1.45, overflowWrap: "anywhere" },

  sectionTitle: { marginTop: 6, fontSize: 13, fontWeight: 950, color: "#0f172a", marginBottom: 8 },

  subCard: { marginTop: 10, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fbfdff", padding: 12 },
  subCardTitle: { fontSize: 13, fontWeight: 950, color: "#0f172a", marginBottom: 10 },
  subGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  miniItem: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "#ffffff" },
  miniLabel: { fontSize: 12, fontWeight: 900, color: "#334155", marginBottom: 4 },
  miniValue: { fontSize: 13, color: "#0f172a" },

  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 6 },

  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: "#334155" },

  checkGroup: { display: "flex", flexDirection: "column", gap: 10, padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fbfdff" },
  checkRow: { display: "flex", alignItems: "center", gap: 10 },
  checkLabel: { fontSize: 13, fontWeight: 800, color: "#0f172a" },

  helperNote: { fontSize: 12, color: "#64748b", lineHeight: 1.5, padding: "0 4px" },

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

  /* ✅ MOBILE LIST (cards) */
  mobileList: { display: "flex", flexDirection: "column", gap: 10 },

  mobileCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    background: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
    outline: "none",
  },

  mobileCardActive: {
    borderColor: "#c7d2fe",
    background: "#f1f5ff",
  },

  mobileCardTop: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },

  mobileAvatar: { width: 42, height: 42, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" },

  mobileMetaRow: {
    marginTop: 10,
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  metaText: { fontSize: 12, color: "#64748b", fontWeight: 800 },
};
