// // export default SignUpStep1;


// import React, { useState } from "react";
// import type { Region, Country } from "../models/Springboot/UserEntity";
// import {
//   fullEmailPhoneRegistrationFlowWithRollback,
//   signInWithEmailAndInitSession,
//   isExistingFirebaseUserError,
// } from "../api/Firebase/firebaseIdentityService";
// import {
//   setFirebaseAuthToken,
//   getFirebaseAuthToken,
// } from "../api/Springboot/backendClient";
// import { checkUsernameAvailable, checkUserAvailability } from "../api/Springboot/backendUserService";
// import { clearRefreshToken } from "../api/Firebase/authStorage"; // ✅ ΝΕΟ import

// interface SignUpStep1Props {
//   onCompleted: (data: {
//     region: Region;
//     country: Country;
//     firebaseUserId: string;
//   }) => void;
// }

// const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
// const defaultCountry: Country = "Cyprus";

// type ExistingUserAuth = {
//   firebaseUserId: string;
// };

// const SignUpStep1: React.FC<SignUpStep1Props> = ({ onCompleted }) => {
//   const [displayName, setDisplayName] = useState("ken");
//   const [email, setEmail] = useState("ken@example.com");
//   const [password, setPassword] = useState("Password123");
//   const [phoneNumber, setPhoneNumber] = useState("+35799666666");
//   const [smsCode, setSmsCode] = useState("666666");
//   const [region, setRegion] = useState<Region | null>(null);

//   const [rememberMe, setRememberMe] = useState(false); // ✅ ΝΕΟ state

//   const [loading, setLoading] = useState(false);
//   const [existingUserAuth, setExistingUserAuth] =
//     useState<ExistingUserAuth | null>(null);

//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   /**
//    * Κοινό helper για το "existing user" flow:
//    * - Προσπαθεί sign-in στο Firebase με email/κωδικό
//    * - Αν πετύχει: αποθηκεύει token + userId και ανοίγει δρόμο για Step 2
//    * - Αν αποτύχει: εμφανίζει "User with username X already exists"
//    */
//   const handleExistingUserSignIn = async (trimmedUsername: string) => {
//     try {
//       // 1️⃣ Προσπαθούμε να κάνουμε sign-in στο Firebase
//       const signinRes = await signInWithEmailAndInitSession({
//         email,
//         password,
//       });

//       const firebaseUserId = signinRes.localId;

//       if (!firebaseUserId || !signinRes.idToken) {
//         throw new Error(
//           "signInWithEmailAndInitSession δεν επέστρεψε firebaseUserId / idToken."
//         );
//       }

//       // Αποθήκευση token + userId global
//       setFirebaseAuthToken(signinRes.idToken, firebaseUserId);

//       // ✅ Remember me logic όπως στο SignInForm
//       if (!rememberMe) {
//         clearRefreshToken();
//       }

//       // 2️⃣ ΤΩΡΑ ελέγχουμε στο Spring Boot DB αν:
//       //    - υπάρχει ήδη user με email/phone (άρα έχει ολοκληρώσει και backend signup)
//       //    - ή δεν υπάρχει ακόμα -> μόνο Firebase account -> πάμε Step 2

//       try {
//         const availability = await checkUserAvailability(email, phoneNumber);

//         console.log("User availability:", availability.response);

//         setExistingUserAuth({ firebaseUserId });

//         setError(null);
//         setSuccess(
//           availability.response ||
//             "Ο λογαριασμός υπάρχει ήδη. Συνδέθηκες και μπορείς να συνεχίσεις στο Βήμα 2."
//         );
//       } catch (availabilityErr) {
//         console.error("User availability check failed:", availabilityErr);

//         setExistingUserAuth(null);
//         setSuccess(null);

//         if (availabilityErr instanceof Error) {
//           setError(availabilityErr.message);
//         } else {
//           setError(`User with username "${trimmedUsername}" already exists`);
//         }
//       }
//     } catch (signinErr) {
//       console.error("Existing user sign-in failed:", signinErr);
//       setExistingUserAuth(null);
//       setSuccess(null);
//       setError(`User with username "${trimmedUsername}" already exists`);
//     }
//   };

//   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!region) {
//       setError("Παρακαλώ επίλεξε περιοχή.");
//       return;
//     }

//     setLoading(true);
//     const trimmedUsername = displayName.trim();

//     try {
//       // 1️⃣ ΠΡΩΤΑ: Έλεγχος username στο backend (8080)
//       const available = await checkUsernameAvailable(trimmedUsername);

//       if (available) {
//         // ✅ ΖΗΤΟΥΜΕΝΟ: ΑΝ ΔΕΝ ΕΙΝΑΙ ΔΙΑΘΕΣΙΜΟ, ΜΟΝΟ ΜΗΝΥΜΑ, ΚΑΘΟΛΟΥ handleExistingUserSignIn
//         setError(
//           `Το username "${trimmedUsername}" είναι ήδη πιασμένο. ` +
//             "Παρακαλώ επίλεξε ένα άλλο username."
//         );
//         setLoading(false);
//         return;
//       }

//       // 2️⃣ Αν το username είναι διαθέσιμο → Firebase full registration flow
//       const result = await fullEmailPhoneRegistrationFlowWithRollback({
//         email,
//         password,
//         displayName,
//         phoneNumber,
//         smsCode,
//       });

//       // ✅ Remember me logic και για το full registration flow
//       if (!rememberMe) {
//         clearRefreshToken();
//       }

//       setSuccess("Ο λογαριασμός δημιουργήθηκε επιτυχώς.");

//       onCompleted({
//         region,
//         country: defaultCountry,
//         firebaseUserId: result.firebaseUserId,
//       });
//     } catch (err: unknown) {
//       console.error("SignUpStep1 submit error:", err);

//       if (isExistingFirebaseUserError(err)) {
//         await handleExistingUserSignIn(displayName.trim());
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Παρουσιάστηκε σφάλμα κατά την εγγραφή.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleContinueExistingUser = () => {
//     setError(null);
//     setSuccess(null);

//     if (!region) {
//       setError("Παρακαλώ επίλεξε περιοχή πριν συνεχίσεις στο Βήμα 2.");
//       return;
//     }

//     if (!existingUserAuth) {
//       setError("Δεν βρέθηκαν στοιχεία υπάρχοντος χρήστη.");
//       return;
//     }

//     const token = getFirebaseAuthToken();
//     if (!token) {
//       setError(
//         "Δεν βρέθηκε Firebase token στη μνήμη. Προσπάθησε να συνδεθείς ξανά."
//       );
//       return;
//     }

//     onCompleted({
//       region,
//       country: defaultCountry,
//       firebaseUserId: existingUserAuth.firebaseUserId,
//     });
//   };

//   return (
//     <div>
//       <h2>Βήμα 1: Στοιχεία λογαριασμού</h2>

//       {error && (
//         <p style={{ color: "red", marginBottom: "0.5rem" }}>{error}</p>
//       )}
//       {success && (
//         <p style={{ color: "green", marginBottom: "0.5rem" }}>{success}</p>
//       )}

//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>
//             Username
//             <input
//               type="text"
//               value={displayName}
//               onChange={(e) => setDisplayName(e.target.value)}
//               required
//             />
//           </label>
//         </div>

//         <div>
//           <label>
//             Email
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </label>
//         </div>

//         <div>
//           <label>
//             Κωδικός
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </label>
//         </div>

//         <div>
//           <label>
//             Τηλέφωνο
//             <input
//               type="tel"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               required
//             />
//           </label>
//         </div>

//         <div>
//           <label>
//             SMS Code
//             <input
//               type="text"
//               value={smsCode}
//               onChange={(e) => setSmsCode(e.target.value)}
//               required
//             />
//           </label>
//         </div>

//         <div>
//           <label>
//             Περιοχή
//             <select
//               value={region ?? ""}
//               onChange={(e) => setRegion(e.target.value as Region)}
//               required
//             >
//               <option value="" disabled>
//                 Επίλεξε περιοχή
//               </option>
//               {regions.map((r) => (
//                 <option key={r} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>

//         {/* ✅ Remember me, όπως στο SignInForm */}
//         <div style={{ margin: "0.5rem 0" }}>
//           <label>
//             <input
//               type="checkbox"
//               checked={rememberMe}
//               onChange={(e) => setRememberMe(e.target.checked)}
//             />{" "}
//             Remember me for 1 month
//           </label>
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? "Γίνεται εγγραφή..." : "Συνέχεια στο Βήμα 2"}
//         </button>
//       </form>

//       {existingUserAuth && (
//         <div style={{ marginTop: "1rem" }}>
//           <p>
//             Ο λογαριασμός σου υπάρχει ήδη και έχεις συνδεθεί. Μπορείς να
//             προχωρήσεις κατευθείαν στο Βήμα 2 χωρίς νέα εγγραφή.
//           </p>
//           <button type="button" onClick={handleContinueExistingUser}>
//             Συνέχεια στο Βήμα 2 (υπάρχων χρήστης)
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SignUpStep1;



// src/pages/SignUpStep1.tsx

// src/pages/SignUpStep1.tsx
import React, { useState } from "react";
import type { Region, Country } from "../models/Springboot/UserEntity";
import {
  fullEmailPhoneRegistrationFlowWithRollback,
  signInWithEmailAndInitSession,
  isExistingFirebaseUserError,
  fetchFirebaseUserInfo,
  deleteFirebaseUser,
} from "../api/Firebase/firebaseIdentityService";
import {
  setFirebaseAuthToken,
  getFirebaseAuthToken,
} from "../api/Springboot/backendClient";
import { checkUsernameAvailable } from "../api/Springboot/backendUserService";
import { clearRefreshToken } from "../api/Firebase/authStorage";

interface SignUpStep1Props {
  onCompleted: (data: {
    region: Region;
    country: Country;
    firebaseUserId: string;
  }) => void;
}

const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
const defaultCountry: Country = "Cyprus";

type ExistingUserAuth = {
  firebaseUserId: string;
};

const SignUpStep1: React.FC<SignUpStep1Props> = ({ onCompleted }) => {
  const [displayName, setDisplayName] = useState("ken");
  const [email, setEmail] = useState("ken@example.com");
  const [password, setPassword] = useState("Password123");
  const [phoneNumber, setPhoneNumber] = useState("+35799666666");
  const [smsCode, setSmsCode] = useState("666666");
  const [region, setRegion] = useState<Region | null>(null);

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);

  // state για existing Firebase user (popup)
  const [existingUserAuth, setExistingUserAuth] =
    useState<ExistingUserAuth | null>(null);
  const [existingUserEmail, setExistingUserEmail] = useState<string | null>(
    null
  );
  const [existingUserPhone, setExistingUserPhone] = useState<string | null>(
    null
  );
  const [showExistingUserPopup, setShowExistingUserPopup] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Flow όταν το Firebase μας πει ότι υπάρχει ήδη λογαριασμός με αυτό το email:
   * 1) Κάνουμε sign-in με email/κωδικό
   * 2) Καλούμε accounts:lookup (fetchFirebaseUserInfo) για να δούμε αν έχει phoneNumber
   * 3) Αν ΔΕΝ έχει phoneNumber:
   *      - διαγράφουμε αυτόματα το Firebase account
   *      - καθαρίζουμε tokens
   *      - δείχνουμε error "δοκίμασε ξανά"
   * 4) Αν έχει phoneNumber -> popup με στοιχεία
   */
  const handleExistingUserSignInAndLookup = async () => {
    try {
      const signinRes = await signInWithEmailAndInitSession({
        email,
        password,
      });

      const firebaseUserId = signinRes.localId;
      const idToken = signinRes.idToken;

      if (!firebaseUserId || !idToken) {
        throw new Error(
          "signInWithEmailAndInitSession δεν επέστρεψε firebaseUserId / idToken."
        );
      }

      // Αποθήκευση token + userId στη μνήμη
      setFirebaseAuthToken(idToken, firebaseUserId);

      // Remember me logic
      if (!rememberMe) {
        clearRefreshToken();
      }

      // 🔁 2ο call -> accounts:lookup
      const info = await fetchFirebaseUserInfo(idToken);

      // 🚨 ΝΕΟ: Αν δεν έχει phoneNumber → αυτόματη διαγραφή account + error
      if (!info || !info.phoneNumber) {
        try {
          await deleteFirebaseUser({ idToken });
        } catch (delErr) {
          console.error("Failed to auto-delete Firebase user:", delErr);
          // αν αποτύχει η διαγραφή, πάλι θα βγάλουμε error στον χρήστη
        }

        // καθαρισμός tokens
        clearRefreshToken();
        setFirebaseAuthToken(null);

        setExistingUserAuth(null);
        setShowExistingUserPopup(false);
        setSuccess(null);
        setError(
          "Υπήρχε παλιός λογαριασμός στο Firebase χωρίς αποθηκευμένο τηλέφωνο. " +
            "Τον διαγράψαμε. Παρακαλώ δοκίμασε ξανά την εγγραφή σου."
        );
        return;
      }

      // ✅ Έχει και phoneNumber -> ανοίγουμε popup
      setExistingUserAuth({ firebaseUserId });
      setExistingUserEmail(info.email ?? signinRes.email ?? email);
      setExistingUserPhone(info.phoneNumber);
      setShowExistingUserPopup(true);

      setError(null);
      setSuccess(null);
    } catch (signinErr) {
      console.error("Existing user sign-in/lookup failed:", signinErr);
      setExistingUserAuth(null);
      setShowExistingUserPopup(false);
      setSuccess(null);
      setError(
        "Υπάρχει ήδη λογαριασμός με αυτό το email, αλλά τα στοιχεία σύνδεσης δεν είναι σωστά. " +
          "Χρησιμοποίησε τη σελίδα Sign In ή το Forgot password."
      );
    }
  };

  /**
   * Συνέχεια με τον υπάρχοντα Firebase λογαριασμό:
   * - Προχωράμε στο Βήμα 2 με το firebaseUserId, region, country
   */
  const handleExistingUserContinue = async () => {
    if (!region) {
      setError("Παρακαλώ επίλεξε περιοχή πριν συνεχίσεις στο Βήμα 2.");
      return;
    }
    if (!existingUserAuth) {
      setError("Δεν βρέθηκαν στοιχεία υπάρχοντος λογαριασμού.");
      return;
    }

    setPopupLoading(true);
    setError(null);
    setSuccess(null);

    try {
      setShowExistingUserPopup(false);
      onCompleted({
        region,
        country: defaultCountry,
        firebaseUserId: existingUserAuth.firebaseUserId,
      });
    } finally {
      setPopupLoading(false);
    }
  };

  /**
   * Διαγραφή υπάρχοντος Firebase account από το popup (αν ο χρήστης το ζητήσει).
   */
  const handleExistingUserDelete = async () => {
    setPopupLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getFirebaseAuthToken();
      if (!token) {
        setError(
          "Δεν βρέθηκε ενεργό Firebase session για διαγραφή. Προσπάθησε ξανά."
        );
        return;
      }

      await deleteFirebaseUser({ idToken: token });
      clearRefreshToken();
      setFirebaseAuthToken(null);

      setExistingUserAuth(null);
      setShowExistingUserPopup(false);

      setSuccess(
        "Ο υπάρχων λογαριασμός σου στο Firebase διαγράφηκε. " +
          "Μπορείς τώρα να προχωρήσεις σε νέα εγγραφή."
      );
    } catch (err) {
      console.error("Delete existing Firebase user failed:", err);
      let message = "Αποτυχία διαγραφής λογαριασμού.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setPopupLoading(false);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!region) {
      setError("Παρακαλώ επίλεξε περιοχή.");
      return;
    }

    setLoading(true);
    const trimmedUsername = displayName.trim();

    try {
      // 1️⃣ Έλεγχος username στο backend
      const notExists = await checkUsernameAvailable(trimmedUsername);

      // ✅ Σωστή λογική: αν ΔΕΝ είναι διαθέσιμο -> μήνυμα
      if (notExists) {
        setError(
          `Το username "${trimmedUsername}" είναι ήδη πιασμένο. ` +
            "Παρακαλώ επίλεξε ένα άλλο username."
        );
        return;
      }

      // 2️⃣ Αν το username είναι διαθέσιμο → Firebase full registration
      const result = await fullEmailPhoneRegistrationFlowWithRollback({
        email,
        password,
        displayName,
        phoneNumber,
        smsCode,
      });

      if (!rememberMe) {
        clearRefreshToken();
      }

      setSuccess("Ο λογαριασμός δημιουργήθηκε επιτυχώς.");

      onCompleted({
        region,
        country: defaultCountry,
        firebaseUserId: result.firebaseUserId,
      });
    } catch (err: unknown) {
      console.error("SignUpStep1 submit error:", err);

      // 👉 Περίπτωση: EMAIL_EXISTS, EMAIL_ALREADY_IN_USE κλπ
      if (isExistingFirebaseUserError(err)) {
        await handleExistingUserSignInAndLookup();
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Παρουσιάστηκε σφάλμα κατά την εγγραφή.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <h2>Βήμα 1: Στοιχεία λογαριασμού</h2>

      {error && (
        <p style={{ color: "red", marginBottom: "0.5rem" }}>{error}</p>
      )}
      {success && (
        <p style={{ color: "green", marginBottom: "0.5rem" }}>{success}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Κωδικός
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Τηλέφωνο
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            SMS Code
            <input
              type="text"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Περιοχή
            <select
              value={region ?? ""}
              onChange={(e) => setRegion(e.target.value as Region)}
              required
            >
              <option value="" disabled>
                Επίλεξε περιοχή
              </option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ margin: "0.5rem 0" }}>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />{" "}
            Remember me for 1 month
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Γίνεται εγγραφή..." : "Συνέχεια στο Βήμα 2"}
        </button>
      </form>

      {/* Popup για existing Firebase user με phoneNumber */}
      {showExistingUserPopup && existingUserAuth && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h3>Έχετε ήδη λογαριασμό</h3>
            <p>
              Βρέθηκε ήδη Pending λογαριασμός με αυτά τα στοιχεία.
            </p>
            <p>
              Αν θέλεις να συνεχίσεις με αυτόν πατα συνεχεια.
            </p>
            <p>
              Αν θέλεις να γραφτεις με αλλο λογαριασμό πάτα Διαγραφή.
            </p>

            <p>
              <strong>Email:</strong> {existingUserEmail}
            </p>
            <p>
              <strong>Τηλέφωνο (Firebase):</strong>{" "}
              {existingUserPhone ?? "—"}
            </p>
            <p>
              <strong>Region (φόρμα):</strong> {region ?? "—"}
            </p>
            <p>
              <strong>Display name (φόρμα):</strong> {displayName}
            </p>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleExistingUserContinue}
                disabled={popupLoading}
              >
                Συνέχεια
              </button>
              <button
                type="button"
                onClick={handleExistingUserDelete}
                disabled={popupLoading}
                style={{ color: "darkred", borderColor: "darkred" }}
              >
                Διαγραφή λογαριασμού
              </button>
              <button
                type="button"
                onClick={() => setShowExistingUserPopup(false)}
                disabled={popupLoading}
              >
                Άκυρο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpStep1;
