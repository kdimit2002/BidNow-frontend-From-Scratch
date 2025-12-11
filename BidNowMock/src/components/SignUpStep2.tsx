// // src/components/SignUpStep2.tsx
// import React, { useState } from "react";
// import { sendSignUpRequest } from "../api/Springboot/backendUserService";
// import type {
//   Avatar,
//   Country,
//   Region,
//   SignUpRequest,
//   RoleApiName,
//   AuthUserDto,
// } from "../models/Springboot/UserEntity";

// interface SignUpStep2Props {
//   region: Region;
//   country: Country;
//   firebaseUserId: string;
//   onCompleted: (auth: AuthUserDto) => void;
// }

// // 5 avatars, χωρίς το "DEFAULT"
// const selectableAvatars: Avatar[] = [
//   "BEARD_MAN_AVATAR",
//   "MAN_AVATAR",
//   "BLONDE_GIRL_AVATAR",
//   "GIRL_AVATAR",
//   "DEFAULT_AVATAR",
// ];

// const SignUpStep2: React.FC<SignUpStep2Props> = ({
//   region,
//   country,
//   onCompleted,
// }) => {
//   const [roleName, setRoleName] = useState<RoleApiName>("Bidder");
//   const [avatar, setAvatar] = useState<Avatar>("MAN_AVATAR");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setLoading(true);

//     try {
//       const request: SignUpRequest = {
//         roleName,
//         avatar,
//         locationDto: {
//           country,
//           region,
//         },
//       };

//       // 🔹 ΠΛΕΟΝ επιστρέφει AuthUserDto
//       const authUser = await sendSignUpRequest(request);

//       setSuccess("Η εγγραφή στο backend ολοκληρώθηκε επιτυχώς!");
//       onCompleted(authUser);
//     } catch (err: unknown) {
//       console.error(err);
//       let message =
//         "Κάτι πήγε στραβά κατά την αποστολή των στοιχείων στο backend.";
//       if (err instanceof Error) {
//         message = err.message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Βήμα 2: Ρόλος & Avatar</h2>

//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
//       {success && <p style={{ color: "green" }}>{success}</p>}

//       <p>
//         Τοποθεσία: {country} / {region}
//       </p>

//       <div style={{ marginBottom: "0.5rem" }}>
//         <span>Ρόλος:</span>
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
//       </div>

//       <div style={{ marginBottom: "0.5rem" }}>
//         <span>Avatar (επίλεξε 1 από τα 5):</span>
//         <div
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "0.5rem",
//             marginTop: "0.5rem",
//           }}
//         >
//           {selectableAvatars.map((av) => (
//             <button
//               key={av}
//               type="button"
//               onClick={() => setAvatar(av)}
//               style={{
//                 padding: "0.5rem",
//                 border:
//                   avatar === av ? "2px solid blue" : "1px solid #ccc",
//                 borderRadius: "4px",
//                 cursor: "pointer",
//                 backgroundColor: avatar === av ? "#e0f0ff" : "white",
//               }}
//             >
//               {av}
//             </button>
//           ))}
//         </div>
//       </div>

//       <button type="submit" disabled={loading}>
//         {loading ? "Αποστολή..." : "Ολοκλήρωση Εγγραφής"}
//       </button>
//     </form>
//   );
// };

// export default SignUpStep2;



// src/components/SignUpStep2.tsx
import React, { useState } from "react";
import { sendSignUpRequest } from "../api/Springboot/backendUserService";
import type {
  Avatar,
  Country,
  Region,
  SignUpRequest,
  RoleApiName,
  AuthUserDto,
} from "../models/Springboot/UserEntity";

interface SignUpStep2Props {
  region: Region;
  country: Country;
  firebaseUserId: string;
  onCompleted: (auth: AuthUserDto) => void;
}

// 🔹 Mapping Avatar enum -> εικόνα (βάλε εδώ τα σωστά URLs αν τα αλλάξεις στο backend)
const avatarImageMap: Record<Avatar, string> = {
  BEARD_MAN_AVATAR:
    "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/BEARD_MAN_AVATAR.png",
  MAN_AVATAR:
    "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/MAN_AVATAR.png",
  BLONDE_GIRL_AVATAR:
    "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/BLONDE_GIRL_AVATAR.png",
  GIRL_AVATAR:
    "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/GIRL_AVATAR.png",
  DEFAULT_AVATAR:
    "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/DEFAULT_AVATAR.png",
  DEFAULT:
    "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/DEFAULT_AVATAR.png",
  // αν υπάρχει και "DEFAULT" στο TS type σου, πρόσθεσέ το εδώ:
  // DEFAULT:
  //   "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/DEFAULT_AVATAR.png",
};

// 5 avatars, χωρίς το "DEFAULT"
const selectableAvatars: Avatar[] = [
  "BEARD_MAN_AVATAR",
  "MAN_AVATAR",
  "BLONDE_GIRL_AVATAR",
  "GIRL_AVATAR",
  "DEFAULT_AVATAR",
];

const SignUpStep2: React.FC<SignUpStep2Props> = ({
  region,
  country,
  onCompleted,
}) => {
  const [roleName, setRoleName] = useState<RoleApiName>("Bidder");
  const [avatar, setAvatar] = useState<Avatar>("MAN_AVATAR");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const request: SignUpRequest = {
        roleName,
        avatar,
        locationDto: {
          country,
          region,
        },
      };

      // 🔹 ΠΛΕΟΝ επιστρέφει AuthUserDto
      const authUser = await sendSignUpRequest(request);

      setSuccess("Η εγγραφή στο backend ολοκληρώθηκε επιτυχώς!");
      onCompleted(authUser);
    } catch (err: unknown) {
      console.error(err);
      let message =
        "Κάτι πήγε στραβά κατά την αποστολή των στοιχείων στο backend.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Βήμα 2: Ρόλος & Avatar</h2>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <p>
        Τοποθεσία: {country} / {region}
      </p>

      <div style={{ marginBottom: "0.5rem" }}>
        <span>Ρόλος:</span>
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
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <span>Avatar (επίλεξε 1 από τα 5):</span>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginTop: "0.75rem",
          }}
        >
          {selectableAvatars.map((av) => {
            const imgSrc = avatarImageMap[av];
            const isSelected = avatar === av;

            return (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                style={{
                  padding: "0.4rem",
                  border: isSelected ? "2px solid blue" : "1px solid #ccc",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#e0f0ff" : "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 90,
                }}
              >
                <img
                  src={imgSrc}
                  alt={av}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "0.25rem",
                  }}
                />
                <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                  {av.replace("_AVATAR", "").replace(/_/g, " ")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Αποστολή..." : "Ολοκλήρωση Εγγραφής"}
      </button>
    </form>
  );
};

export default SignUpStep2;
