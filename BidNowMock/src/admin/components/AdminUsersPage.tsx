
// // src/admin/components/AdminUsersPage.tsx

// import React, { useEffect, useState } from "react";
// import { getAdminUsers,getAdminUser,updateAdminUser } from "../../api/admin/Users";
// import type { Avatar } from "../../models/Springboot/UserEntity";
// import type {
//   AdminUserEntityDto,
//   PageResponse,
//   UserEntityUpdateAdmin,
//   Region,
//   UserSearchBy,
// } from "../models/AdminResponseUser";

// import { getReferralCodeByCode } from "../../api/Springboot/ReferralCodeService";
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

// const avatarOptions: { value: Avatar; label: string }[] = [
//   { value: "BEARD_MAN_AVATAR", label: "Beard Man" },
//   { value: "MAN_AVATAR", label: "Man" },
//   { value: "BLONDE_GIRL_AVATAR", label: "Blonde Girl" },
//   { value: "GIRL_AVATAR", label: "Girl" },
//   { value: "DEFAULT_AVATAR", label: "Default Avatar" },
//   { value: "DEFAULT", label: "Default" },
// ];

// const regionOptions: Region[] = [
//   "NICOSIA",
//   "LIMASSOL",
//   "LARNACA",
//   "PAPHOS",
//   "FAMAGUSTA",
// ];

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

// const AdminUsersPage: React.FC = () => {
//   const [page, setPage] = useState(0);
//   const [data, setData] = useState<PageResponse<AdminUserEntityDto> | null>(
//     null
//   );





// const [ownerReferralCode, setOwnerReferralCode] =
//   useState<ReferralCodeDtoAdminResponse | null>(null);
// const [ownerReferralLoading, setOwnerReferralLoading] = useState(false);
// const [ownerReferralError, setOwnerReferralError] = useState<string | null>(null);






//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [selectedUser, setSelectedUser] = useState<AdminUserEntityDto | null>(
//     null
//   );
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
//   const [appliedSearchBy, setAppliedSearchBy] =
//     useState<UserSearchBy>("username");

//   useEffect(() => {
//     let cancelled = false;

//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const result = await getAdminUsers(
//           page,
//           PAGE_SIZE,
//           appliedSearch,
//           appliedSearchBy
//         );

//         if (!cancelled) {
//           setData(result);
//         }
//       } catch (err: unknown) {
//         if (!cancelled) {
//           const message =
//             err instanceof Error ? err.message : "Failed to load users";
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
//     if (data && !data.last) {
//       setPage((p) => p + 1);
//     }
//   };

//   const handleApplySearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     const trimmed = search.trim();
//     setAppliedSearch(trimmed === "" ? undefined : trimmed);
//     setAppliedSearchBy(searchBy);
//     setPage(0); // reset στην πρώτη σελίδα όταν αλλάζει search
//   };

//   const handleClearSearch = () => {
//     setSearch("");
//     setAppliedSearch(undefined);
//     setAppliedSearchBy("username");
//     setPage(0);
//   };

//   const handleSelectUser = async (firebaseId: string) => {
//     if (!firebaseId) return;

//     setSelectedUser(null);
//     setSelectedError(null);
//     setSelectedLoading(true);
//     setIsEditing(false);
//     setEditForm(null);
//     setSaveError(null);

    
//   // 👇 καθάρισε τα referral state
//   setOwnerReferralCode(null);
//   setOwnerReferralError(null);
//   setOwnerReferralLoading(false);

//     try {
//       const user = await getAdminUser(firebaseId);
//       setSelectedUser(user);

//       const avatar = detectAvatarFromUrl(user.avatarUrl);
//       const location =
//         user.locationDto ?? { country: "", region: "NICOSIA" as Region };

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
//       const message =
//         err instanceof Error ? err.message : "Failed to load user details";
//       setSelectedError(message);
//     } finally {
//       setSelectedLoading(false);
//     }
//   };

//   const handleEditChange = <K extends keyof UserEntityUpdateAdmin>(
//     field: K,
//     value: UserEntityUpdateAdmin[K]
//   ) => {
//     setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
//   };

//   const handleEditLocationChange = (
//     field: "country" | "region",
//     value: string
//   ) => {
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
//     const location =
//       selectedUser.locationDto ?? { country: "", region: "NICOSIA" as Region };

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
//       rewardPoints: Number.isNaN(Number(editForm.rewardPoints))
//         ? 0
//         : Number(editForm.rewardPoints),
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
//               content: prev.content.map((u) =>
//                 u.firebaseId === updated.firebaseId ? updated : u
//               ),
//             }
//           : prev
//       );
//     } catch (err: unknown) {
//       const message =
//         err instanceof Error ? err.message : "Failed to update user";
//       setSaveError(message);
//     } finally {
//       setSaving(false);
//     }
//   };




// const handleViewOwnerReferralCode = async () => {
//   if (
//     !selectedUser ||
//     !selectedUser.isReferralCodeOwner ||
//     !selectedUser.referralCodeName
//   ) {
//     return;
//   }

//   setOwnerReferralCode(null);
//   setOwnerReferralError(null);
//   setOwnerReferralLoading(true);

//   try {
//     const codeData = await getReferralCodeByCode(selectedUser.referralCodeName);
//     setOwnerReferralCode(codeData);
//   } catch (err: unknown) {
//     const message =
//       err instanceof Error ? err.message : "Failed to load referral code details";
//     setOwnerReferralError(message);
//   } finally {
//     setOwnerReferralLoading(false);
//   }
// };






//   return (
//     <div style={{ padding: "1rem" }}>
//       <h2>Admin – Users</h2>

//       {/* 🔍 Search bar */}
//       <form
//         onSubmit={handleApplySearch}
//         style={{
//           marginTop: "12px",
//           marginBottom: "12px",
//           display: "flex",
//           gap: "8px",
//           alignItems: "center",
//           flexWrap: "wrap",
//         }}
//       >
//         <input
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{ padding: "4px 8px", minWidth: "200px" }}
//         />

//         <select
//           value={searchBy}
//           onChange={(e) => setSearchBy(e.target.value as UserSearchBy)}
//           style={{ padding: "4px 8px" }}
//         >
//           {searchByOptions.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>

//         <button type="submit" disabled={loading}>
//           Search
//         </button>
//         <button
//           type="button"
//           onClick={handleClearSearch}
//           disabled={loading && !appliedSearch}
//         >
//           Clear
//         </button>

//         {appliedSearch && (
//           <span style={{ fontSize: "0.9rem", color: "#555" }}>
//             Filtering by <strong>{appliedSearchBy}</strong>: "
//             <strong>{appliedSearch}</strong>"
//           </span>
//         )}
//       </form>

//       {loading && <p>Loading users...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {data && data.content.length === 0 && !loading && (
//         <p>No users found.</p>
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
//                 <th style={thStyle}>Avatar</th>
//                 <th style={thStyle}>Username</th>
//                 <th style={thStyle}>Email</th>
//                 <th style={thStyle}>Phone</th>
//                 <th style={thStyle}>Role</th>
//                 <th style={thStyle}>Reward Points</th>
//                 <th style={thStyle}>Banned</th>
//                 <th style={thStyle}>Location</th>
//                     {/* 👇 ΝΕΕΣ στήλες */}
//                 <th style={thStyle}>Referral Owner</th>
//                 <th style={thStyle}>Used Referral</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.content.map((user) => (
//                 <tr
//                   key={user.id}
//                   onClick={() => handleSelectUser(user.firebaseId)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <td style={tdStyle}>
//                     <img
//                       src={user.avatarUrl}
//                       alt={user.username}
//                       style={{
//                         width: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         objectFit: "cover",
//                       }}
//                     />
//                   </td>
//                   {/* <td style={tdStyle}>{user.username}</td>
//                   <td style={tdStyle}>{user.email}</td>
//                   <td style={tdStyle}>{user.phoneNumber}</td>
//                   <td style={tdStyle}>{user.role}</td>
//                   <td style={tdStyle}>{user.rewardPoints}</td>
//                   <td style={tdStyle}>{user.isBanned ? "Yes" : "No"}</td>
//                   <td style={tdStyle}>
//                     {user.locationDto
//                       ? `${user.locationDto.country} (${user.locationDto.region})`
//                       : "-"}
//                   </td> */}
//                     <td style={tdStyle}>{user.username}</td>
//                     <td style={tdStyle}>{user.email}</td>
//                     <td style={tdStyle}>{user.phoneNumber}</td>
//                     <td style={tdStyle}>{user.role}</td>
//                     <td style={tdStyle}>{user.rewardPoints}</td>
//                     <td style={tdStyle}>{user.isBanned ? "Yes" : "No"}</td>
//                     <td style={tdStyle}>
//                         {user.locationDto
//                         ? `${user.locationDto.country} (${user.locationDto.region})`
//                         : "-"}
//                     </td>
//                     {/* 👇 Referral info */}
//                     <td style={tdStyle}>
//                         {user.isReferralCodeOwner ? "Yes" : "No"}
//                     </td>
//                     <td style={tdStyle}>
//                         {user.hasUsedReferralCode
//                         ? user.referralCodeName ?? "Yes"
//                         : "No"}
//                     </td>
//                 </tr>
//               ))}
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
//             <span>({data.totalElements} users total)</span>
//           </div>

//           {/* User details + edit (όπως πριν) */}
//           <div style={{ marginTop: "24px" }}>
//             <h3>User details</h3>

//             {selectedLoading && <p>Loading user details...</p>}
//             {selectedError && (
//               <p style={{ color: "red" }}>{selectedError}</p>
//             )}

//             {selectedUser && (
//               <div
//                 style={{
//                   marginTop: "12px",
//                   padding: "16px",
//                   border: "1px solid #ddd",
//                   borderRadius: "8px",
//                   display: "flex",
//                   gap: "16px",
//                   alignItems: "flex-start",
//                 }}
//               >
//                 <div>
//                   <img
//                     src={selectedUser.avatarUrl}
//                     alt={selectedUser.username}
//                     style={{
//                       width: 80,
//                       height: 80,
//                       borderRadius: "50%",
//                       objectFit: "cover",
//                     }}
//                   />
//                 </div>

//                 <div style={{ flex: 1 }}>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       marginBottom: "8px",
//                     }}
//                   >
//                     <strong>{selectedUser.username}</strong>

//                     {!isEditing ? (
//                       <button onClick={handleStartEdit}>Edit user</button>
//                     ) : (
//                       <div style={{ display: "flex", gap: "8px" }}>
//                         <button onClick={handleCancelEdit} disabled={saving}>
//                           Cancel
//                         </button>
//                         <button
//                           form="edit-user-form"
//                           type="submit"
//                           disabled={saving}
//                         >
//                           {saving ? "Saving..." : "Save"}
//                         </button>
//                       </div>
//                     )}
//                   </div>

//                   {!isEditing && (
//   <>
//     <p>
//       <strong>Username:</strong> {selectedUser.username}
//     </p>
//     <p>
//       <strong>Email:</strong> {selectedUser.email}
//     </p>
//     <p>
//       <strong>Phone:</strong> {selectedUser.phoneNumber}
//     </p>
//     <p>
//       <strong>Firebase ID:</strong> {selectedUser.firebaseId}
//     </p>
//     <p>
//       <strong>Role:</strong> {selectedUser.role}
//     </p>
//     <p>
//       <strong>Reward Points (current):</strong>{" "}
//       {selectedUser.rewardPoints}
//     </p>
//     <p>
//       <strong>All Time Reward Points:</strong>{" "}
//       {selectedUser.allTimeRewardPoints ?? 0}
//     </p>
//     <p>
//       <strong>Banned:</strong>{" "}
//       {selectedUser.isBanned ? "Yes" : "No"}
//     </p>
//     <p>
//       <strong>Anonymized:</strong>{" "}
//       {selectedUser.isAnonymized ? "Yes" : "No"}
//     </p>
//     <p>
//       <strong>Eligible for chat:</strong>{" "}
//       {selectedUser.eligibleForChat ? "Yes" : "No"}
//     </p>
//     <p>
//       <strong>Location:</strong>{" "}
//       {selectedUser.locationDto
//         ? `${selectedUser.locationDto.country} (${selectedUser.locationDto.region})`
//         : "-"}
//     </p>

//     {/* 👇 ΝΕΟ: referral info */}
//     <p>
//       <strong>Referral code owner:</strong>{" "}
//       {selectedUser.isReferralCodeOwner ? (
//         <button
//           type="button"
//           onClick={handleViewOwnerReferralCode}
//           style={{
//             padding: "2px 6px",
//             fontSize: "0.85rem",
//             cursor: "pointer",
//           }}
//         >
//           View referral code
//         </button>
//       ) : (
//         "No"
//       )}
//     </p>
//     <p>
//       <strong>Owner Referral code:</strong>{" "}
//       {selectedUser.referralCodeName ?? "-"}
//     </p>
//     <p>
//       <strong>Has used referral code:</strong>{" "}
//       {selectedUser.hasUsedReferralCode ? "Yes" : "No"}
//     </p>
//     <p>
//       <strong>Referral code used:</strong>{" "}
//       {selectedUser.hasUsedReferralCode
//         ? selectedUser.referralCodeName ?? "-"
//         : "-"}
//     </p>

//     {/* 👇 Panel με τα στοιχεία του referral code του owner */}
//     {ownerReferralLoading && <p>Loading referral code...</p>}
//     {ownerReferralError && (
//       <p style={{ color: "red" }}>{ownerReferralError}</p>
//     )}

//     {ownerReferralCode && (
//       <div
//         style={{
//           marginTop: "8px",
//           padding: "8px",
//           border: "1px solid #ccc",
//           borderRadius: "6px",
//           fontSize: "0.9rem",
//           backgroundColor: "#fafafa",
//         }}
//       >
//         <p style={{ margin: 0 }}>
//           <strong>Referral code:</strong>{" "}
//           <code>{ownerReferralCode.code}</code>
//         </p>
//         <p style={{ margin: "4px 0 0" }}>
//           <strong>Owner ID:</strong> {ownerReferralCode.ownerId}
//         </p>
//         <p style={{ margin: "4px 0 0" }}>
//           <strong>Reward points (user):</strong>{" "}
//           {ownerReferralCode.rewardPoints}
//         </p>
//         <p style={{ margin: "4px 0 0" }}>
//           <strong>Reward points (owner):</strong>{" "}
//           {ownerReferralCode.ownerRewardPoints}
//         </p>
//         <p style={{ margin: "4px 0 0" }}>
//           <strong>Max uses:</strong> {ownerReferralCode.maxUses}
//         </p>
//         <p style={{ margin: "4px 0 0" }}>
//           <strong>Uses so far:</strong>{" "}
//           {ownerReferralCode.usesSoFar}
//         </p>
//         <p style={{ margin: "4px 0 0" }}>
//           <strong>Disabled:</strong>{" "}
//           {ownerReferralCode.isDisabled ? "Yes" : "No"}
//         </p>
//       </div>
//     )}
//   </>
// )}


//                     {isEditing && editForm && (
//                     <>
//                         {/* 👇 Read-only πληροφορίες που ΔΕΝ είναι editable */}
//                         <div
//                         style={{
//                             marginBottom: "8px",
//                             padding: "8px",
//                             border: "1px dashed #ccc",
//                             borderRadius: "4px",
//                             fontSize: "0.9rem",
//                             backgroundColor: "#fafafa",
//                         }}
//                         >
//                         <p style={{ margin: 0 }}>
//                             <strong>ID:</strong> {selectedUser.id} |{" "}
//                             <strong>Firebase ID:</strong> {selectedUser.firebaseId}
//                         </p>
//                         <p style={{ margin: "4px 0 0" }}>
//                             <strong>All Time Reward Points:</strong>{" "}
//                             {selectedUser.allTimeRewardPoints ?? 0}
//                         </p>
//                         <p style={{ margin: "4px 0 0" }}>
//                             <strong>Referral code owner:</strong>{" "}
//                             {selectedUser.isReferralCodeOwner ? "Yes" : "No"}
//                         </p>
//                         <p style={{ margin: "4px 0 0" }}>
//                             <strong>Has used referral code:</strong>{" "}
//                             {selectedUser.hasUsedReferralCode ? "Yes" : "No"}
//                         </p>
//                         <p style={{ margin: "4px 0 0" }}>
//                             <strong>Referral code used:</strong>{" "}
//                             {selectedUser.hasUsedReferralCode
//                             ? selectedUser.referralCodeUsed ?? "-"
//                             : "-"}
//                         </p>
//                         </div>

//                         {/* 👉 ΕΔΩ είναι η φόρμα με ΜΟΝΟ τα editable πεδία */}
//                         <form
//                         id="edit-user-form"
//                         onSubmit={handleSubmitEdit}
//                         style={{ marginTop: "8px", display: "grid", gap: "8px" }}
//                         >
//                         {saveError && <p style={{ color: "red" }}>{saveError}</p>}

//                         <label>
//                             Username:
//                             <input
//                             type="text"
//                             value={editForm.username}
//                             onChange={(e) =>
//                                 handleEditChange("username", e.target.value)
//                             }
//                             required
//                             />
//                         </label>

//                         <label>
//                             Email:
//                             <input
//                             type="email"
//                             value={editForm.email}
//                             onChange={(e) =>
//                                 handleEditChange("email", e.target.value)
//                             }
//                             required
//                             />
//                         </label>

//                         <label>
//                             Reward Points:
//                             <input
//                             type="number"
//                             min={0}
//                             value={editForm.rewardPoints}
//                             onChange={(e) =>
//                                 handleEditChange(
//                                 "rewardPoints",
//                                 Number(e.target.value)
//                                 )
//                             }
//                             required
//                             />
//                         </label>

//                         <label>
//                             Avatar:
//                             <select
//                             value={editForm.avatar}
//                             onChange={(e) =>
//                                 handleEditChange("avatar", e.target.value as Avatar)
//                             }
//                             >
//                             {avatarOptions.map((opt) => (
//                                 <option key={opt.value} value={opt.value}>
//                                 {opt.label}
//                                 </option>
//                             ))}
//                             </select>
//                         </label>

//                         <label>
//                             Role:
//                             <input
//                             type="text"
//                             value={editForm.role}
//                             onChange={(e) =>
//                                 handleEditChange("role", e.target.value)
//                             }
//                             required
//                             />
//                         </label>

//                         <label>
//                             Banned:
//                             <input
//                             type="checkbox"
//                             checked={editForm.isBanned}
//                             onChange={(e) =>
//                                 handleEditChange("isBanned", e.target.checked)
//                             }
//                             />
//                         </label>

//                         <label>
//                             Anonymized:
//                             <input
//                             type="checkbox"
//                             checked={editForm.isAnonymized}
//                             onChange={(e) =>
//                                 handleEditChange("isAnonymized", e.target.checked)
//                             }
//                             />
//                         </label>

//                         <label>
//                             Eligible for chat:
//                             <input
//                             type="checkbox"
//                             checked={editForm.eligibleForChat}
//                             onChange={(e) =>
//                                 handleEditChange("eligibleForChat", e.target.checked)
//                             }
//                             />
//                         </label>

//                         <fieldset
//                             style={{
//                             border: "1px solid #ccc",
//                             borderRadius: "4px",
//                             padding: "8px",
//                             }}
//                         >
//                             <legend>Location</legend>

//                             <label>
//                             Country:
//                             <input
//                                 type="text"
//                                 value={editForm.locationDto.country}
//                                 onChange={(e) =>
//                                 handleEditLocationChange("country", e.target.value)
//                                 }
//                                 required
//                             />
//                             </label>

//                             <label>
//                             Region:
//                             <select
//                                 value={editForm.locationDto.region}
//                                 onChange={(e) =>
//                                 handleEditLocationChange("region", e.target.value)
//                                 }
//                             >
//                                 {regionOptions.map((r) => (
//                                 <option key={r} value={r}>
//                                     {r}
//                                 </option>
//                                 ))}
//                             </select>
//                             </label>
//                         </fieldset>
//                         </form>
//                     </>
//                     )}

//                 </div>
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminUsersPage;


// src/admin/components/AdminUsersPage.tsx

import React, { useEffect, useState } from "react";
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

const thStyle: React.CSSProperties = {
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  padding: "8px",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};

const avatarOptions: { value: Avatar; label: string }[] = [
  { value: "BEARD_MAN_AVATAR", label: "Beard Man" },
  { value: "MAN_AVATAR", label: "Man" },
  { value: "BLONDE_GIRL_AVATAR", label: "Blonde Girl" },
  { value: "GIRL_AVATAR", label: "Girl" },
  { value: "DEFAULT_AVATAR", label: "Default Avatar" },
  { value: "DEFAULT", label: "Default" },
];

const regionOptions: Region[] = [
  "NICOSIA",
  "LIMASSOL",
  "LARNACA",
  "PAPHOS",
  "FAMAGUSTA",
];

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

const AdminUsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<AdminUserEntityDto> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<AdminUserEntityDto | null>(
    null
  );
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
  const [appliedSearchBy, setAppliedSearchBy] =
    useState<UserSearchBy>("username");

  // 👉 referral code details for owner
  const [ownerReferralCode, setOwnerReferralCode] =
    useState<ReferralCodeDtoAdminResponse | null>(null);
  const [ownerReferralLoading, setOwnerReferralLoading] = useState(false);
  const [ownerReferralError, setOwnerReferralError] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getAdminUsers(
          page,
          PAGE_SIZE,
          appliedSearch,
          appliedSearchBy
        );

        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load users";
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
    if (data && !data.last) {
      setPage((p) => p + 1);
    }
  };

  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = search.trim();
    setAppliedSearch(trimmed === "" ? undefined : trimmed);
    setAppliedSearchBy(searchBy);
    setPage(0); // reset στην πρώτη σελίδα όταν αλλάζει search
  };

  const handleClearSearch = () => {
    setSearch("");
    setAppliedSearch(undefined);
    setAppliedSearchBy("username");
    setPage(0);
  };

  const handleSelectUser = async (firebaseId: string) => {
    if (!firebaseId) return;

    setSelectedUser(null);
    setSelectedError(null);
    setSelectedLoading(true);
    setIsEditing(false);
    setEditForm(null);
    setSaveError(null);

    // καθάρισμα referral state όταν αλλάζει user
    setOwnerReferralCode(null);
    setOwnerReferralError(null);
    setOwnerReferralLoading(false);

    try {
      const user = await getAdminUser(firebaseId);
      setSelectedUser(user);

      const avatar = detectAvatarFromUrl(user.avatarUrl);
      const location =
        user.locationDto ?? { country: "", region: "NICOSIA" as Region };

      // ΜΟΝΟ τα editable fields του UserEntityUpdateAdmin
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
      const message =
        err instanceof Error ? err.message : "Failed to load user details";
      setSelectedError(message);
    } finally {
      setSelectedLoading(false);
    }
  };

  const handleEditChange = <K extends keyof UserEntityUpdateAdmin>(
    field: K,
    value: UserEntityUpdateAdmin[K]
  ) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleEditLocationChange = (
    field: "country" | "region",
    value: string
  ) => {
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
    const location =
      selectedUser.locationDto ?? { country: "", region: "NICOSIA" as Region };

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
      rewardPoints: Number.isNaN(Number(editForm.rewardPoints))
        ? 0
        : Number(editForm.rewardPoints),
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
              content: prev.content.map((u) =>
                u.firebaseId === updated.firebaseId ? updated : u
              ),
            }
          : prev
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update user";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleViewOwnerReferralCode = async () => {
    if (
      !selectedUser ||
      !selectedUser.isReferralCodeOwner ||
      !selectedUser.referralCodeName
    ) {
      return;
    }

    setOwnerReferralCode(null);
    setOwnerReferralError(null);
    setOwnerReferralLoading(true);

    try {
      const codeData = await getReferralCodeByCode(
        selectedUser.referralCodeName
      );
      setOwnerReferralCode(codeData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load referral code details";
      setOwnerReferralError(message);
    } finally {
      setOwnerReferralLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin – Users</h2>

      {/* 🔍 Search bar */}
      <form
        onSubmit={handleApplySearch}
        style={{
          marginTop: "12px",
          marginBottom: "12px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "4px 8px", minWidth: "200px" }}
        />

        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value as UserSearchBy)}
          style={{ padding: "4px 8px" }}
        >
          {searchByOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          Search
        </button>
        <button
          type="button"
          onClick={handleClearSearch}
          disabled={loading && !appliedSearch}
        >
          Clear
        </button>

        {appliedSearch && (
          <span style={{ fontSize: "0.9rem", color: "#555" }}>
            Filtering by <strong>{appliedSearchBy}</strong>: "
            <strong>{appliedSearch}</strong>"
          </span>
        )}
      </form>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && data.content.length === 0 && !loading && (
        <p>No users found.</p>
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
                <th style={thStyle}>Avatar</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Reward Points</th>
                <th style={thStyle}>Banned</th>
                <th style={thStyle}>Location</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleSelectUser(user.firebaseId)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={tdStyle}>
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  
                  <td style={tdStyle}>{user.username}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>{user.phoneNumber}</td>
                  <td style={tdStyle}>{user.role}</td>
                  <td style={tdStyle}>{user.rewardPoints}</td>
                  <td style={tdStyle}>{user.isBanned ? "Yes" : "No"}</td>
                  <td style={tdStyle}>
                    {user.locationDto
                      ? `${user.locationDto.country} (${user.locationDto.region})`
                      : "-"}
                  </td>
                </tr>
              ))}
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
            <span>({data.totalElements} users total)</span>
          </div>

          {/* User details + edit */}
          <div style={{ marginTop: "24px" }}>
            <h3>User details</h3>

            {selectedLoading && <p>Loading user details...</p>}
            {selectedError && (
              <p style={{ color: "red" }}>{selectedError}</p>
            )}

            {selectedUser && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.username}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>{selectedUser.username}</strong>

                    {!isEditing ? (
                      <button onClick={handleStartEdit}>Edit user</button>
                    ) : (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={handleCancelEdit} disabled={saving}>
                          Cancel
                        </button>
                        <button
                          form="edit-user-form"
                          type="submit"
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* READ-ONLY VIEW (όλα τα fields, συμπεριλ. referral) */}
                  {!isEditing && (
                    <>
                      <p>
                        <strong>Username:</strong> {selectedUser.username}
                      </p>
                      <p>
                        <strong>User Id:</strong> {selectedUser.id}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedUser.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedUser.phoneNumber}
                      </p>
                      <p>
                        <strong>Firebase ID:</strong>{" "}
                        {selectedUser.firebaseId}
                      </p>
                      <p>
                        <strong>Role:</strong> {selectedUser.role}
                      </p>
                      <p>
                        <strong>Reward Points (current):</strong>{" "}
                        {selectedUser.rewardPoints}
                      </p>
                      <p>
                        <strong>All Time Reward Points:</strong>{" "}
                        {selectedUser.allTimeRewardPoints ?? 0}
                      </p>
                      <p>
                        <strong>Banned:</strong>{" "}
                        {selectedUser.isBanned ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Anonymized:</strong>{" "}
                        {selectedUser.isAnonymized ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Eligible for chat:</strong>{" "}
                        {selectedUser.eligibleForChat ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Location:</strong>{" "}
                        {selectedUser.locationDto
                          ? `${selectedUser.locationDto.country} (${selectedUser.locationDto.region})`
                          : "-"}
                      </p>

                      {/* 👉 Referral fields */}
                      <p>
                        <strong>Referral code owner:</strong>{" "}
                        {selectedUser.isReferralCodeOwner ? (
                          <button
                            type="button"
                            onClick={handleViewOwnerReferralCode}
                            style={{
                              padding: "2px 6px",
                              fontSize: "0.85rem",
                              cursor: "pointer",
                            }}
                          >
                            View referral code
                          </button>
                        ) : (
                          "No"
                        )}
                      </p>
                      <p>
                        <strong>Referral code name:</strong>{" "}
                        {selectedUser.referralCodeName ?? "-"}
                      </p>
                      <p>
                        <strong>Has used referral code:</strong>{" "}
                        {selectedUser.hasUsedReferralCode ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Referral code used:</strong>{" "}
                        {selectedUser.hasUsedReferralCode
                          ? selectedUser.referralCodeUsed ?? "-"
                          : "-"}
                      </p>

                      {ownerReferralLoading && (
                        <p>Loading referral code...</p>
                      )}
                      {ownerReferralError && (
                        <p style={{ color: "red" }}>{ownerReferralError}</p>
                      )}

                      {ownerReferralCode && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <p style={{ margin: 0 }}>
                            <strong>Referral code:</strong>{" "}
                            <code>{ownerReferralCode.code}</code>
                          </p>
                          <p style={{ margin: "4px 0 0" }}>
                            <strong>Owner ID:</strong>{" "}
                            {ownerReferralCode.ownerId}
                          </p>
                          <p style={{ margin: "4px 0 0" }}>
                            <strong>Reward points (user):</strong>{" "}
                            {ownerReferralCode.rewardPoints}
                          </p>
                          <p style={{ margin: "4px 0 0" }}>
                            <strong>Reward points (owner):</strong>{" "}
                            {ownerReferralCode.ownerRewardPoints}
                          </p>
                          <p style={{ margin: "4px 0 0" }}>
                            <strong>Max uses:</strong>{" "}
                            {ownerReferralCode.maxUses}
                          </p>
                          <p style={{ margin: "4px 0 0" }}>
                            <strong>Uses so far:</strong>{" "}
                            {ownerReferralCode.usesSoFar}
                          </p>
                          <p style={{ margin: "4px 0 0" }}>
                            <strong>Disabled:</strong>{" "}
                            {ownerReferralCode.isDisabled ? "Yes" : "No"}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* EDIT VIEW – μόνο τα fields του UserEntityUpdateAdmin είναι editable */}
                  {isEditing && editForm && (
                    <form
                      id="edit-user-form"
                      onSubmit={handleSubmitEdit}
                      style={{ marginTop: "8px", display: "grid", gap: "8px" }}
                    >
                      {saveError && (
                        <p style={{ color: "red" }}>{saveError}</p>
                      )}

                      <label>
                        Username:
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) =>
                            handleEditChange("username", e.target.value)
                          }
                          required
                        />
                      </label>

                      <label>
                        Email:
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            handleEditChange("email", e.target.value)
                          }
                          required
                        />
                      </label>

                      <label>
                        Reward Points:
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
                        Avatar:
                        <select
                          value={editForm.avatar}
                          onChange={(e) =>
                            handleEditChange(
                              "avatar",
                              e.target.value as Avatar
                            )
                          }
                        >
                          {avatarOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Role:
                        <input
                          type="text"
                          value={editForm.role}
                          onChange={(e) =>
                            handleEditChange("role", e.target.value)
                          }
                          required
                        />
                      </label>

                      <label>
                        Banned:
                        <input
                          type="checkbox"
                          checked={editForm.isBanned}
                          onChange={(e) =>
                            handleEditChange("isBanned", e.target.checked)
                          }
                        />
                      </label>

                      <label>
                        Anonymized:
                        <input
                          type="checkbox"
                          checked={editForm.isAnonymized}
                          onChange={(e) =>
                            handleEditChange("isAnonymized", e.target.checked)
                          }
                        />
                      </label>

                      <label>
                        Eligible for chat:
                        <input
                          type="checkbox"
                          checked={editForm.eligibleForChat}
                          onChange={(e) =>
                            handleEditChange(
                              "eligibleForChat",
                              e.target.checked
                            )
                          }
                        />
                      </label>

                      <fieldset
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "8px",
                        }}
                      >
                        <legend>Location</legend>

                        <label>
                          Country:
                          <input
                            type="text"
                            value={editForm.locationDto.country}
                            onChange={(e) =>
                              handleEditLocationChange(
                                "country",
                                e.target.value
                              )
                            }
                            required
                          />
                        </label>

                        <label>
                          Region:
                          <select
                            value={editForm.locationDto.region}
                            onChange={(e) =>
                              handleEditLocationChange(
                                "region",
                                e.target.value
                              )
                            }
                          >
                            {regionOptions.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </label>
                      </fieldset>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;
