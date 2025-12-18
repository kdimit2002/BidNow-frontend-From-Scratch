// import React, { useEffect, useState } from "react";
// import { getAdminUserByUsername } from "../../api/admin/Users";
// import type { AdminUserEntityDto } from "../models/AdminResponseUser";

// interface AdminUserDetailsPageProps {
//   username: string;
//   onBack: () => void;
// }

// const AdminUserDetailsPage: React.FC<AdminUserDetailsPageProps> = ({
//   username,
//   onBack,
// }) => {
//   const [user, setUser] = useState<AdminUserEntityDto | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchUser = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await getAdminUserByUsername(username);
//         if (!cancelled) {
//           setUser(data);
//         }
//       } catch (err: unknown) {
//         if (!cancelled) {
//           console.error(err);
//           let message = "Αποτυχία φόρτωσης στοιχείων χρήστη.";
//           if (err instanceof Error) message = err.message;
//           setError(message);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUser();

//     return () => {
//       cancelled = true;
//     };
//   }, [username]);

//   return (
//     <div style={{ padding: "1rem" }}>
//       <button type="button" onClick={onBack} style={{ marginBottom: "1rem" }}>
//         ← Πίσω στη λίστα χρηστών
//       </button>

//       <h2>Admin – User details</h2>

//       {loading && <p>Φόρτωση...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {!loading && !error && !user && <p>Δεν βρέθηκε χρήστης.</p>}

//       {user && (
//         <div
//           style={{
//             marginTop: "12px",
//             padding: "16px",
//             border: "1px solid #ddd",
//             borderRadius: "8px",
//             display: "flex",
//             gap: "16px",
//             alignItems: "flex-start",
//           }}
//         >
//           <div>
//             <img
//               src={user.avatarUrl}
//               alt={user.username}
//               style={{
//                 width: 96,
//                 height: 96,
//                 borderRadius: "50%",
//                 objectFit: "cover",
//               }}
//             />
//           </div>

//           <div style={{ flex: 1 }}>
//             <h3 style={{ marginTop: 0 }}>{user.username}</h3>
//             <p>
//               <strong>ID:</strong> {user.id}
//             </p>
//             <p>
//               <strong>Firebase ID:</strong> {user.firebaseId}
//             </p>
//             <p>
//               <strong>Email:</strong> {user.email}
//             </p>
//             <p>
//               <strong>Phone:</strong> {user.phoneNumber}
//             </p>
//             <p>
//               <strong>Role:</strong> {user.role}
//             </p>

//             <p>
//               <strong>Reward Points (current):</strong> {user.rewardPoints}
//             </p>
//             <p>
//               <strong>All Time Reward Points:</strong>{" "}
//               {user.allTimeRewardPoints ?? 0}
//             </p>

//             <p>
//               <strong>Banned:</strong> {user.isBanned ? "Yes" : "No"}
//             </p>
//             <p>
//               <strong>Anonymized:</strong>{" "}
//               {user.isAnonymized ? "Yes" : "No"}
//             </p>
//             <p>
//               <strong>Eligible for chat:</strong>{" "}
//               {user.eligibleForChat ? "Yes" : "No"}
//             </p>

//             <p>
//               <strong>Location:</strong>{" "}
//               {user.locationDto
//                 ? `${user.locationDto.country} (${user.locationDto.region})`
//                 : "-"}
//             </p>

//             <hr style={{ margin: "12px 0" }} />

//             <p>
//               <strong>Referral code owner:</strong>{" "}
//               {user.isReferralCodeOwner ? "Yes" : "No"}
//             </p>
//             {user.isReferralCodeOwner && (
//               <p>
//                 <strong>Referral code name:</strong>{" "}
//                 {user.referralCodeName ?? "-"}
//               </p>
//             )}

//             <p>
//               <strong>Has used referral code:</strong>{" "}
//               {user.hasUsedReferralCode ? "Yes" : "No"}
//             </p>
//             {user.hasUsedReferralCode && (
//               <p>
//                 <strong>Referral code used:</strong>{" "}
//                 {user.referralCodeUsed ?? "-"}
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminUserDetailsPage;


// src/admin/components/AdminUserDetailsPage.tsx

import React, { useEffect, useState } from "react";
import { getAdminUserByUsername, updateAdminUser } from "../../api/admin/Users";
import type { Avatar } from "../../models/Springboot/UserEntity";
import type {
  AdminUserEntityDto,
  UserEntityUpdateAdmin,
  Region,
} from "../models/AdminResponseUser";

interface AdminUserDetailsPageProps {
  username: string;
  onBack: () => void;
}

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

// helper για Avatar από URL (ίδιο με AdminUsersPage)
const detectAvatarFromUrl = (avatarUrl?: string | null): Avatar => {
  if (!avatarUrl) return "DEFAULT_AVATAR";
  if (avatarUrl.includes("BEARD_MAN_AVATAR")) return "BEARD_MAN_AVATAR";
  if (avatarUrl.includes("BLONDE_GIRL_AVATAR")) return "BLONDE_GIRL_AVATAR";
  if (avatarUrl.includes("GIRL_AVATAR")) return "GIRL_AVATAR";
  if (avatarUrl.includes("MAN_AVATAR")) return "MAN_AVATAR";
  return "DEFAULT_AVATAR";
};

const AdminUserDetailsPage: React.FC<AdminUserDetailsPageProps> = ({
  username,
  onBack,
}) => {
  const [user, setUser] = useState<AdminUserEntityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // state για edit
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserEntityUpdateAdmin | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        setSaveError(null);
        setIsEditing(false);
        setEditForm(null);

        const data = await getAdminUserByUsername(username);
        if (!cancelled) {
          setUser(data);

          const avatar = detectAvatarFromUrl(data.avatarUrl);
          const location =
            data.locationDto ?? { country: "", region: "NICOSIA" as Region };

          // γεμίζουμε το edit form με τα editable fields
          setEditForm({
            username: data.username,
            email: data.email,
            rewardPoints: data.rewardPoints,
            avatar,
            role: data.role,
            isBanned: data.isBanned,
            isAnonymized: data.isAnonymized,
            eligibleForChat: data.eligibleForChat,
            locationDto: location,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error(err);
          let message = "Αποτυχία φόρτωσης στοιχείων χρήστη.";
          if (err instanceof Error) message = err.message;
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [username]);

  // γενικό handler για edit πεδία
  const handleEditChange = <K extends keyof UserEntityUpdateAdmin>(
    field: K,
    value: UserEntityUpdateAdmin[K]
  ) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // ειδικό για locationDto
  const handleEditLocationChange = (
    field: "country" | "region",
    value: string
  ) => {
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            locationDto: {
              ...(prev.locationDto ?? {
                country: "",
                region: "NICOSIA" as Region,
              }),
              [field]: value,
            },
          }
        : prev
    );
  };

  const handleStartEdit = () => {
    if (!user || !editForm) return;
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    if (!user) {
      setIsEditing(false);
      setEditForm(null);
      return;
    }

    const avatar = detectAvatarFromUrl(user.avatarUrl);
    const location =
      user.locationDto ?? { country: "", region: "NICOSIA" as Region };

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
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editForm) return;

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
      // Χρησιμοποιούμε το firebaseId από το user που φορτώσαμε
      const updated = await updateAdminUser(user.firebaseId, cleanForm);

      setUser(updated);
      setIsEditing(false);

      // ανανέωση editForm με τα ενημερωμένα δεδομένα
      const avatar = detectAvatarFromUrl(updated.avatarUrl);
      const location =
        updated.locationDto ?? { country: "", region: "NICOSIA" as Region };

      setEditForm({
        username: updated.username,
        email: updated.email,
        rewardPoints: updated.rewardPoints,
        avatar,
        role: updated.role,
        isBanned: updated.isBanned,
        isAnonymized: updated.isAnonymized,
        eligibleForChat: updated.eligibleForChat,
        locationDto: location,
      });
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Αποτυχία ενημέρωσης χρήστη.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <button type="button" onClick={onBack} style={{ marginBottom: "1rem" }}>
        ← Πίσω στη λίστα χρηστών
      </button>

      <h2>Admin – User details</h2>

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && !user && <p>Δεν βρέθηκε χρήστης.</p>}

      {user && (
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
              src={user.avatarUrl}
              alt={user.username}
              style={{
                width: 96,
                height: 96,
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
              <h3 style={{ margin: 0 }}>{user.username}</h3>

              {!isEditing ? (
                <button type="button" onClick={handleStartEdit}>
                  Edit user
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="edit-user-form"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            {/* READ-ONLY VIEW */}
            {!isEditing && (
              <>
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Firebase ID:</strong> {user.firebaseId}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phoneNumber}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>

                <p>
                  <strong>Reward Points (current):</strong> {user.rewardPoints}
                </p>
                <p>
                  <strong>All Time Reward Points:</strong>{" "}
                  {user.allTimeRewardPoints ?? 0}
                </p>

                <p>
                  <strong>Banned:</strong> {user.isBanned ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Anonymized:</strong>{" "}
                  {user.isAnonymized ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Eligible for chat:</strong>{" "}
                  {user.eligibleForChat ? "Yes" : "No"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {user.locationDto
                    ? `${user.locationDto.country} (${user.locationDto.region})`
                    : "-"}
                </p>

                <hr style={{ margin: "12px 0" }} />

                <p>
                  <strong>Referral code owner:</strong>{" "}
                  {user.isReferralCodeOwner ? "Yes" : "No"}
                </p>
                {user.isReferralCodeOwner && (
                  <p>
                    <strong>Referral code name:</strong>{" "}
                    {user.referralCodeName ?? "-"}
                  </p>
                )}

                <p>
                  <strong>Has used referral code:</strong>{" "}
                  {user.hasUsedReferralCode ? "Yes" : "No"}
                </p>
                {user.hasUsedReferralCode && (
                  <p>
                    <strong>Referral code used:</strong>{" "}
                    {user.referralCodeUsed ?? "-"}
                  </p>
                )}
              </>
            )}

            {/* EDIT VIEW – μόνο UserEntityUpdateAdmin fields */}
            {isEditing && editForm && (
              <form
                id="edit-user-form"
                onSubmit={handleSubmitEdit}
                style={{ marginTop: "8px", display: "grid", gap: "8px" }}
              >
                {saveError && (
                  <p style={{ color: "red", marginTop: 0 }}>{saveError}</p>
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
                      handleEditChange("rewardPoints", Number(e.target.value))
                    }
                    required
                  />
                </label>

                <label>
                  Avatar:
                  <select
                    value={editForm.avatar}
                    onChange={(e) =>
                      handleEditChange("avatar", e.target.value as Avatar)
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
                      handleEditChange("eligibleForChat", e.target.checked)
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
                        handleEditLocationChange("country", e.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Region:
                    <select
                      value={editForm.locationDto.region}
                      onChange={(e) =>
                        handleEditLocationChange("region", e.target.value)
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
  );
};

export default AdminUserDetailsPage;
