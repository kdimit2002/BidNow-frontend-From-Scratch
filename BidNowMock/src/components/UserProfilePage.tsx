
// // src/pages/UserProfilePage.tsx
// import React, { useEffect, useState } from "react";
// import {
//   fetchUserProfile,
//   updateAvatar,
//   updateUsername,
//   updateLocation,
//   updateRole,
//   deleteUserAccount,
//   logout,
// } from "../api/Springboot/backendUserService";
// import type {
//   ProfileUserEntity,
//   Avatar,
//   Country,
//   Region,
//   LocationDto,
//   RoleApiName,
// } from "../models/Springboot/UserEntity";

// import {
//   redeemReferralCodeApi,
//   fetchReferralCodeUser,
// } from "../api/Springboot/ReferralCodeService";

// type RoleUiName = "Bidder" | "Auctioneer";

// interface UserProfilePageProps {
//   onShowReferralCodeUsage: () => void;
// }

// // τι έρχεται από API -> τι δείχνουμε στο UI
// const apiToUiRole: Partial<Record<RoleApiName, RoleUiName>> = {
//   Bidder: "Bidder",
//   Auctioneer: "Auctioneer",
// };

// // τι διαλέγει ο χρήστης στο UI -> τι στέλνουμε στο API
// const uiToApiRole: Record<RoleUiName, RoleApiName> = {
//   Bidder: "Bidder",
//   Auctioneer: "Auctioneer",
// };

// const selectableAvatars: Avatar[] = [
//   "BEARD_MAN_AVATAR",
//   "MAN_AVATAR",
//   "BLONDE_GIRL_AVATAR",
//   "GIRL_AVATAR",
//   "DEFAULT_AVATAR",
// ];

// const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
// const countries: Country[] = ["Cyprus"];

// const UserProfilePage: React.FC<UserProfilePageProps> = ({
//   onShowReferralCodeUsage,
// }) => {
//   const [profile, setProfile] = useState<ProfileUserEntity | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // editable state
//   const [username, setUsername] = useState("");
//   const [roleName, setRoleName] = useState<RoleUiName>("Bidder");
//   const [selectedAvatar, setSelectedAvatar] =
//     useState<Avatar>("DEFAULT_AVATAR");
//   const [country, setCountry] = useState<Country>("Cyprus");
//   const [region, setRegion] = useState<Region>("NICOSIA");

//   const [referralCode, setReferralCode] = useState("");

//   // 👉 αν είναι referral code owner, εδώ θα μπει ο κωδικός του
//   const [referralOwnerCode, setReferralOwnerCode] =
//     useState<string | null>(null);

//   const [saving, setSaving] = useState(false);
//   const [success, setSuccess] = useState<string | null>(null);

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const data = await fetchUserProfile();
//         setProfile(data);

//         setUsername(data.username);

//         console.log("ROLE FROM API:", data.role);

//         const uiRole = apiToUiRole[data.role] ?? "Bidder";
//         setRoleName(uiRole);

//         setCountry(data.locationDto.country);
//         setRegion(data.locationDto.region);
//         setSelectedAvatar(data.avatarName);

//         // 👇 έλεγχος αν είναι referral code user
//         try {
//           const rcUser = await fetchReferralCodeUser();
//           if (rcUser && rcUser.code) {
//             setReferralOwnerCode(rcUser.code);
//           } else {
//             setReferralOwnerCode(null);
//           }
//         } catch (err) {
//           console.log("User is not referral code owner or error:", err);
//           setReferralOwnerCode(null);
//         }
//       } catch (err: unknown) {
//         console.error(err);
//         let message = "Αποτυχία φόρτωσης προφίλ.";
//         if (err instanceof Error) {
//           message = err.message;
//         }
//         setError(message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, []);

//   const withUiState = async (fn: () => Promise<void>) => {
//     setSaving(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       await fn();
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//       return;
//     } finally {
//       setSaving(false);
//     }
//     setSuccess("Οι αλλαγές αποθηκεύτηκαν επιτυχώς.");
//   };

//   const handleSaveUsername = async () => {
//     if (!profile) return;
//     await withUiState(async () => {
//       await updateUsername(username);
//       setProfile({ ...profile, username });
//     });
//   };

//   const handleSaveRole = async () => {
//     if (!profile) return;

//     const apiRole = uiToApiRole[roleName];

//     await withUiState(async () => {
//       await updateRole(apiRole);
//       setProfile({ ...profile, role: apiRole });
//     });
//   };

//   const handleSaveAvatar = async () => {
//     if (!profile) return;
//     await withUiState(async () => {
//       await updateAvatar(selectedAvatar);
//     });
//   };

//   const handleSaveLocation = async () => {
//     if (!profile) return;
//     await withUiState(async () => {
//       const location: LocationDto = {
//         country,
//         region,
//       };
//       await updateLocation(location);
//       setProfile({ ...profile, locationDto: location });
//     });
//   };

//   const handleUseReferralCode = async () => {
//     if (!profile) return;

//     if (!referralCode.trim()) {
//       setError("Παρακαλώ εισάγετε ένα referral code.");
//       return;
//     }

//     await withUiState(async () => {
//       await redeemReferralCodeApi(referralCode.trim());

//       const updatedProfile = await fetchUserProfile();
//       setProfile(updatedProfile);
//       setReferralCode("");
//     });
//   };

//   const handleDeleteAccount = async () => {
//     if (!profile) return;

//     const confirmed = window.confirm(
//       "Είσαι σίγουρος ότι θέλεις να διαγράψεις / ανωνυμοποιήσεις τον λογαριασμό σου; Η ενέργεια δεν μπορεί να αναιρεθεί."
//     );
//     if (!confirmed) return;

//     await withUiState(async () => {
//       await deleteUserAccount();
//       logout();
//       setProfile(null);
//     });

//     setSuccess(
//       "Ο λογαριασμός σου ανωνυμοποιήθηκε / διαγράφηκε. Θα χρειαστεί να συνδεθείς ξανά αν θέλεις να χρησιμοποιήσεις την εφαρμογή."
//     );
//   };

//   if (loading) {
//     return <p>Φόρτωση προφίλ...</p>;
//   }

//   if (!profile) {
//     return <p>Δεν βρέθηκε προφίλ χρήστη.</p>;
//   }

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h2>Το προφίλ μου</h2>

//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
//       {success && <p style={{ color: "green" }}>{success}</p>}
//       {saving && <p>Αποθήκευση...</p>}

//       {/* 👉 Block για referral code owners */}
//       {referralOwnerCode && (
//         <div
//           style={{
//             margin: "1rem 0",
//             padding: "0.75rem 1rem",
//             border: "1px solid #ccc",
//             borderRadius: "6px",
//             backgroundColor: "#f8f8f8",
//           }}
//         >
//           <p style={{ margin: 0 }}>
//             <strong>Referral Code Owner:</strong> Ναι
//           </p>
//           <p style={{ margin: "0.25rem 0 0" }}>
//             <strong>Ο κωδικός σου:</strong>{" "}
//             <code style={{ fontSize: "0.95rem" }}>{referralOwnerCode}</code>
//           </p>
//           <button
//             type="button"
//             onClick={onShowReferralCodeUsage}
//             style={{
//               marginTop: "0.5rem",
//               padding: "0.35rem 0.75rem",
//               borderRadius: "4px",
//               border: "1px solid #888",
//               backgroundColor: "white",
//               cursor: "pointer",
//             }}
//           >
//             Δες ποιοι χρησιμοποίησαν τον κωδικό σου
//           </button>
//         </div>
//       )}

//       {/* Username editable */}
//       <div style={{ marginBottom: "1rem" }}>
//         <label>
//           <strong>Username:</strong>{" "}
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//         </label>
//         <button onClick={handleSaveUsername} disabled={saving}>
//           Αποθήκευση
//         </button>
//       </div>

//       <p>
//         <strong>Email:</strong> {profile.email}
//       </p>

//       <p>
//         <strong>Τηλέφωνο:</strong> {profile.phoneNumber}
//       </p>

//       <div style={{ margin: "1rem 0" }}>
//         <strong>Ρόλος:</strong>{" "}
//         <label style={{ marginLeft: "0.5rem" }}>
//           <input
//             type="radio"
//             name="role"
//             value="Bidder"
//             checked={roleName === "Bidder"}
//             onChange={() => setRoleName("Bidder")}
//           />
//           Bidder
//         </label>
//         <label style={{ marginLeft: "0.5rem" }}>
//           <input
//             type="radio"
//             name="role"
//             value="Auctioneer"
//             checked={roleName === "Auctioneer"}
//             onChange={() => setRoleName("Auctioneer")}
//           />
//           Auctioneer
//         </label>
//         <button onClick={handleSaveRole} disabled={saving}>
//           Αποθήκευση
//         </button>
//       </div>

//       <p>
//         <strong>Reward Points:</strong> {profile.rewardPoints}
//       </p>

//       <p>
//         <strong>All time Reward Points:</strong> {profile.allTimeRewardPoints}
//       </p>

//       {!referralOwnerCode || profile.hasUsedReferralCode && (
//         <div style={{ margin: "1rem 0" }}>
//         <strong>Χρήση referral code για πόντους:</strong>
//         <div style={{ marginTop: "0.5rem" }}>
//           <input
//             type="text"
//             value={referralCode}
//             onChange={(e) => setReferralCode(e.target.value)}
//             placeholder="Γράψε εδώ τον referral code"
//             disabled={saving}
//           />
//           <button
//             onClick={handleUseReferralCode}
//             disabled={saving}
//             style={{ marginLeft: "0.5rem" }}
//           >
//             Χρήση referral code
//           </button>
//         </div>
//       </div>
//       )}

//       <p>
//         <strong>Eligible for chat:</strong>{" "}
//         {profile.eligibleForChat ? "Ναι" : "Όχι"}
//       </p>

//       <div style={{ margin: "1rem 0" }}>
//         <strong>Τοποθεσία:</strong>
//         <div>
//           <label>
//             Country:
//             <select
//               value={country}
//               onChange={(e) => setCountry(e.target.value as Country)}
//             >
//               {countries.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>
//         <div>
//           <label>
//             Region:
//             <select
//               value={region}
//               onChange={(e) => setRegion(e.target.value as Region)}
//             >
//               {regions.map((r) => (
//                 <option key={r} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>
//         <button onClick={handleSaveLocation} disabled={saving}>
//           Αποθήκευση
//         </button>
//       </div>

//       <div style={{ marginTop: "1rem" }}>
//         <strong>Τρέχον avatar:</strong>
//         {profile.avatarUrl && (
//           <div>
//             <img
//               src={profile.avatarUrl}
//               alt="Avatar"
//               style={{ width: 96, height: 96, borderRadius: "50%" }}
//             />
//           </div>
//         )}

//         <div style={{ marginTop: "0.5rem" }}>
//           <strong>Επιλογή νέου avatar:</strong>
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: "0.5rem",
//               marginTop: "0.5rem",
//             }}
//           >
//             {selectableAvatars.map((av) => (
//               <button
//                 key={av}
//                 type="button"
//                 onClick={() => setSelectedAvatar(av)}
//                 style={{
//                   padding: "0.5rem",
//                   border:
//                     selectedAvatar === av
//                       ? "2px solid blue"
//                       : "1px solid #ccc",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   backgroundColor:
//                     selectedAvatar === av ? "#e0f0ff" : "white",
//                 }}
//               >
//                 {av}
//               </button>
//             ))}
//           </div>
//           <button onClick={handleSaveAvatar} disabled={saving}>
//             Αποθήκευση Avatar
//           </button>
//         </div>
//       </div>

//       <div
//         style={{
//           marginTop: "2rem",
//           paddingTop: "1rem",
//           borderTop: "1px solid #ddd",
//         }}
//       >
//         <p style={{ fontWeight: "bold", color: "darkred" }}>
//           Διαγραφή / Ανωνυμοποίηση λογαριασμού
//         </p>
//         <p style={{ fontSize: "0.9rem", color: "#555" }}>
//           Αυτή η ενέργεια θα ανωνυμοποιήσει τα προσωπικά σου δεδομένα στο
//           σύστημα και δεν μπορεί να αναιρεθεί.
//         </p>
//         <button
//           type="button"
//           onClick={handleDeleteAccount}
//           disabled={saving}
//           style={{
//             marginTop: "0.5rem",
//             padding: "0.5rem 1rem",
//             borderRadius: "4px",
//             border: "1px solid darkred",
//             backgroundColor: "white",
//             color: "darkred",
//             cursor: "pointer",
//           }}
//         >
//           Διαγραφή λογαριασμού
//         </button>
//       </div>
//     </div>
//   );
// };

// export default UserProfilePage;



// src/pages/UserProfilePage.tsx
import React, { useEffect, useState } from "react";
import {
  fetchUserProfile,
  updateAvatar,
  updateUsername,
  updateLocation,
  updateRole,
  deleteUserAccount,
  logout,
} from "../api/Springboot/backendUserService";
import type {
  ProfileUserEntity,
  Avatar,
  Country,
  Region,
  LocationDto,
  RoleApiName,
} from "../models/Springboot/UserEntity";

import {
  redeemReferralCodeApi,
  fetchReferralCodeUser,
} from "../api/Springboot/ReferralCodeService";

type RoleUiName = "Bidder" | "Auctioneer";

interface UserProfilePageProps {
  onShowReferralCodeUsage: () => void;
}

// τι έρχεται από API -> τι δείχνουμε στο UI
const apiToUiRole: Partial<Record<RoleApiName, RoleUiName>> = {
  Bidder: "Bidder",
  Auctioneer: "Auctioneer",
};

// τι διαλέγει ο χρήστης στο UI -> τι στέλνουμε στο API
const uiToApiRole: Record<RoleUiName, RoleApiName> = {
  Bidder: "Bidder",
  Auctioneer: "Auctioneer",
};

const selectableAvatars: Avatar[] = [
  "BEARD_MAN_AVATAR",
  "MAN_AVATAR",
  "BLONDE_GIRL_AVATAR",
  "GIRL_AVATAR",
  "DEFAULT_AVATAR",
];

const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
const countries: Country[] = ["Cyprus"];

const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onShowReferralCodeUsage,
}) => {
  const [profile, setProfile] = useState<ProfileUserEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // editable state
  const [username, setUsername] = useState("");
  const [roleName, setRoleName] = useState<RoleUiName>("Bidder");
  const [selectedAvatar, setSelectedAvatar] =
    useState<Avatar>("DEFAULT_AVATAR");
  const [country, setCountry] = useState<Country>("Cyprus");
  const [region, setRegion] = useState<Region>("NICOSIA");

  const [referralCode, setReferralCode] = useState("");

  // 👉 αν είναι referral code owner, εδώ θα μπει ο κωδικός του (αυτός που δημιούργησε ο ίδιος)
  const [referralOwnerCode, setReferralOwnerCode] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile(data);

        setUsername(data.username);

        console.log("ROLE FROM API:", data.role);

        const uiRole = apiToUiRole[data.role] ?? "Bidder";
        setRoleName(uiRole);

        setCountry(data.locationDto.country);
        setRegion(data.locationDto.region);
        setSelectedAvatar(data.avatarName);

        // 👇 μόνο αν είναι owner θα δοκιμάσουμε να πάρουμε τον κωδικό του
        if (data.isReferralCodeOwner) {
          try {
            const rcUser = await fetchReferralCodeUser();
            if (rcUser && rcUser.code) {
              setReferralOwnerCode(rcUser.code);
            } else {
              setReferralOwnerCode(null);
            }
          } catch (err) {
            console.log("Failed to fetch owner referral code:", err);
            setReferralOwnerCode(null);
          }
        } else {
          setReferralOwnerCode(null);
        }
      } catch (err: unknown) {
        console.error(err);
        let message = "Αποτυχία φόρτωσης προφίλ.";
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const withUiState = async (fn: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await fn();
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά.";
      if (err instanceof Error) message = err.message;
      setError(message);
      return;
    } finally {
      setSaving(false);
    }
    setSuccess("Οι αλλαγές αποθηκεύτηκαν επιτυχώς.");
  };

  const handleSaveUsername = async () => {
    if (!profile) return;
    await withUiState(async () => {
      await updateUsername(username);
      setProfile({ ...profile, username });
    });
  };

  const handleSaveRole = async () => {
    if (!profile) return;

    const apiRole = uiToApiRole[roleName];

    await withUiState(async () => {
      await updateRole(apiRole);
      setProfile({ ...profile, role: apiRole });
    });
  };

  const handleSaveAvatar = async () => {
    if (!profile) return;
    await withUiState(async () => {
      await updateAvatar(selectedAvatar);
    });
  };

  const handleSaveLocation = async () => {
    if (!profile) return;
    await withUiState(async () => {
      const location: LocationDto = {
        country,
        region,
      };
      await updateLocation(location);
      setProfile({ ...profile, locationDto: location });
    });
  };

  const handleUseReferralCode = async () => {
    if (!profile) return;

    if (!referralCode.trim()) {
      setError("Παρακαλώ εισάγετε ένα referral code.");
      return;
    }

    await withUiState(async () => {
      await redeemReferralCodeApi(referralCode.trim());

      // Μετά τη χρήση του code, ξαναφορτώνουμε το προφίλ
      const updatedProfile = await fetchUserProfile();
      setProfile(updatedProfile);
      setReferralCode("");
    });
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;

    const confirmed = window.confirm(
      "Είσαι σίγουρος ότι θέλεις να διαγράψεις / ανωνυμοποιήσεις τον λογαριασμό σου; Η ενέργεια δεν μπορεί να αναιρεθεί."
    );
    if (!confirmed) return;

    await withUiState(async () => {
      await deleteUserAccount();
      logout();
      setProfile(null);
    });

    setSuccess(
      "Ο λογαριασμός σου ανωνυμοποιήθηκε / διαγράφηκε. Θα χρειαστεί να συνδεθείς ξανά αν θέλεις να χρησιμοποιήσεις την εφαρμογή."
    );
  };

  if (loading) {
    return <p>Φόρτωση προφίλ...</p>;
  }

  if (!profile) {
    return <p>Δεν βρέθηκε προφίλ χρήστη.</p>;
  }

  const showUseReferralInput =
    !profile.isReferralCodeOwner && !profile.hasUsedReferralCode;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Το προφίλ μου</h2>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      {saving && <p>Αποθήκευση...</p>}

      {/* 👉 Block για referral code owners */}
      {profile.isReferralCodeOwner && referralOwnerCode && (
        <div
          style={{
            margin: "1rem 0",
            padding: "0.75rem 1rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#f8f8f8",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Referral Code Owner:</strong> Ναι
          </p>
          <p style={{ margin: "0.25rem 0 0" }}>
            <strong>Ο κωδικός σου:</strong>{" "}
            <code style={{ fontSize: "0.95rem" }}>{referralOwnerCode}</code>
          </p>
          <button
            type="button"
            onClick={onShowReferralCodeUsage}
            style={{
              marginTop: "0.5rem",
              padding: "0.35rem 0.75rem",
              borderRadius: "4px",
              border: "1px solid #888",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            Δες ποιοι χρησιμοποίησαν τον κωδικό σου
          </button>
        </div>
      )}

      {/* Username editable */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <strong>Username:</strong>{" "}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <button onClick={handleSaveUsername} disabled={saving}>
          Αποθήκευση
        </button>
      </div>

      <p>
        <strong>Email:</strong> {profile.email}
      </p>

      <p>
        <strong>Τηλέφωνο:</strong> {profile.phoneNumber}
      </p>

      <div style={{ margin: "1rem 0" }}>
        <strong>Ρόλος:</strong>{" "}
        <label style={{ marginLeft: "0.5rem" }}>
          <input
            type="radio"
            name="role"
            value="Bidder"
            checked={roleName === "Bidder"}
            onChange={() => setRoleName("Bidder")}
          />
          Bidder
        </label>
        <label style={{ marginLeft: "0.5rem" }}>
          <input
            type="radio"
            name="role"
            value="Auctioneer"
            checked={roleName === "Auctioneer"}
            onChange={() => setRoleName("Auctioneer")}
          />
          Auctioneer
        </label>
        <button onClick={handleSaveRole} disabled={saving}>
          Αποθήκευση
        </button>
      </div>

      <p>
        <strong>Reward Points:</strong> {profile.rewardPoints}
      </p>

      <p>
        <strong>All time Reward Points:</strong> {profile.allTimeRewardPoints}
      </p>

      {/* 🔹 Αν ΔΕΝ είναι owner ΚΑΙ δεν έχει χρησιμοποιήσει κωδικό → δείξε input */}
      {showUseReferralInput && (
        <div style={{ margin: "1rem 0" }}>
          <strong>Χρήση referral code για πόντους:</strong>
          <div style={{ marginTop: "0.5rem" }}>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Γράψε εδώ τον referral code"
              disabled={saving}
            />
            <button
              onClick={handleUseReferralCode}
              disabled={saving}
              style={{ marginLeft: "0.5rem" }}
            >
              Χρήση referral code
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Αν έχει χρησιμοποιήσει referral code → δείξε το */}
      {profile.hasUsedReferralCode && profile.referralCodeUsed && (
        <p>
          <strong>Referral code used:</strong>{" "}
          {profile.referralCodeUsed}
        </p>
      )}

      <p>
        <strong>Eligible for chat:</strong>{" "}
        {profile.eligibleForChat ? "Ναι" : "Όχι"}
      </p>

      <div style={{ margin: "1rem 0" }}>
        <strong>Τοποθεσία:</strong>
        <div>
          <label>
            Country:
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as Country)}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Region:
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={handleSaveLocation} disabled={saving}>
          Αποθήκευση
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <strong>Τρέχον avatar:</strong>
        {profile.avatarUrl && (
          <div>
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              style={{ width: 96, height: 96, borderRadius: "50%" }}
            />
          </div>
        )}

        <div style={{ marginTop: "0.5rem" }}>
          <strong>Επιλογή νέου avatar:</strong>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {selectableAvatars.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                style={{
                  padding: "0.5rem",
                  border:
                    selectedAvatar === av
                      ? "2px solid blue"
                      : "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedAvatar === av ? "#e0f0ff" : "white",
                }}
              >
                {av}
              </button>
            ))}
          </div>
          <button onClick={handleSaveAvatar} disabled={saving}>
            Αποθήκευση Avatar
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid #ddd",
        }}
      >
        <p style={{ fontWeight: "bold", color: "darkred" }}>
          Διαγραφή / Ανωνυμοποίηση λογαριασμού
        </p>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Αυτή η ενέργεια θα ανωνυμοποιήσει τα προσωπικά σου δεδομένα στο
          σύστημα και δεν μπορεί να αναιρεθεί.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={saving}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "1px solid darkred",
            backgroundColor: "white",
            color: "darkred",
            cursor: "pointer",
          }}
        >
          Διαγραφή λογαριασμού
        </button>
      </div>
    </div>
  );
};

export default UserProfilePage;
