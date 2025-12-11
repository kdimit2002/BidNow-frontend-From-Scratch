
// // src/components/SignInForm.tsx
// import React, { useState } from "react";
// import { signInWithEmailAndInitSession } from "../api/Firebase/firebaseIdentityService";
// import { callBackendLogin } from "../api/Springboot/backendUserService";
// import { clearRefreshToken } from "../api/Firebase/authStorage";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// interface SignInFormProps {
//   // γυρνάμε πίσω το AuthUserDto που έστειλε ο backend
//   onSignedIn?: (auth: AuthUserDto) => void;
// }

// const SignInForm: React.FC<SignInFormProps> = ({ onSignedIn }) => {
//   const [email, setEmail] = useState("ken@example.com");
//   const [password, setPassword] = useState("Password123");
//   const [rememberMe, setRememberMe] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setLoading(true);

//     try {
//       // 1️⃣ Firebase sign-in + αποθήκευση idToken (μέσα στο signInWithEmailAndInitSession)
//       const result = await signInWithEmailAndInitSession({
//         email,
//         password,
//       });

//       // 2️⃣ Backend login -> επιστρέφει AuthUserDto
//       const authUser = await callBackendLogin();

//       // 3️⃣ Αν ΔΕΝ θέλει rememberMe, καθαρίζουμε το stored refresh token
//       if (!rememberMe) {
//         clearRefreshToken();
//       }

//       setSuccess(`Συνδέθηκες επιτυχώς ως ${result.email ?? email}`);

//       // 4️⃣ Ενημερώνουμε το App με τα στοιχεία του χρήστη
//       if (onSignedIn) {
//         onSignedIn(authUser);
//       }
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Αποτυχία σύνδεσης.";
//       if (err instanceof Error) {
//         message = err.message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2>Sign In</h2>

//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {success && <p style={{ color: "green" }}>{success}</p>}

//       <form onSubmit={handleSubmit}>
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
//           {loading ? "Γίνεται σύνδεση..." : "Sign In"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SignInForm;





// src/components/SignInForm.tsx
import React, { useState } from "react";
import {
  signInWithEmailAndInitSession,
  sendPasswordResetEmail,
} from "../api/Firebase/firebaseIdentityService";
import { callBackendLogin } from "../api/Springboot/backendUserService";
import { clearRefreshToken } from "../api/Firebase/authStorage";
import type { AuthUserDto } from "../models/Springboot/UserEntity";

interface SignInFormProps {
  // γυρνάμε πίσω το AuthUserDto που έστειλε ο backend
  onSignedIn?: (auth: AuthUserDto) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSignedIn }) => {
  const [email, setEmail] = useState("ken@example.com");
  const [password, setPassword] = useState("Password123");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);          // για login
  const [resetLoading, setResetLoading] = useState(false); // για forgot password

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // 1️⃣ Firebase sign-in + αποθήκευση idToken (μέσα στο signInWithEmailAndInitSession)
      const result = await signInWithEmailAndInitSession({
        email,
        password,
      });

      // 2️⃣ Backend login -> επιστρέφει AuthUserDto
      const authUser = await callBackendLogin();

      // 3️⃣ Αν ΔΕΝ θέλει rememberMe, καθαρίζουμε το stored refresh token
      if (!rememberMe) {
        clearRefreshToken();
      }

      setSuccess(`Συνδέθηκες επιτυχώς ως ${result.email ?? email}`);

      // 4️⃣ Ενημερώνουμε το App με τα στοιχεία του χρήστη
      if (onSignedIn) {
        onSignedIn(authUser);
      }
    } catch (err: unknown) {
      console.error(err);
      let message = "Αποτυχία σύνδεσης.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };



const handleForgotPassword = async () => {
  setError(null);
  setSuccess(null);

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    setError(
      "Συμπλήρωσε πρώτα το email σου για να σου στείλουμε link επαναφοράς."
    );
    return;
  }

  setResetLoading(true);
  try {
    await sendPasswordResetEmail(trimmedEmail);
    // Αν όλα πάνε καλά, απλά συνεχίζουμε στο setSuccess πιο κάτω
  } catch (err: unknown) {
    console.error("Forgot password error:", err);

    if (err instanceof Error) {
      // 1️⃣ ΜΗΝ κάνεις enumeration: αν είναι EMAIL_NOT_FOUND,
      // απλά προσποιούμαστε ότι όλα είναι ΟΚ.
      if (err.message === "EMAIL_NOT_FOUND") {
        // σκόπιμα δεν κάνουμε setError
        // και αφήνουμε να πέσει στο success μήνυμα
      } else if (err.message === "INVALID_EMAIL") {
        setError("Το email δεν είναι έγκυρο.");
        setResetLoading(false);
        return;
      } else {
        setError("Αποτυχία αποστολής email επαναφοράς. Προσπάθησε ξανά αργότερα.");
        setResetLoading(false);
        return;
      }
    } else {
      setError("Αποτυχία αποστολής email επαναφοράς. Προσπάθησε ξανά αργότερα.");
      setResetLoading(false);
      return;
    }
  } finally {
    setResetLoading(false);
  }

  // 2️⃣ Εδώ θα φτάνουμε:
  // - είτε αν η κλήση πέτυχε
  // - είτε αν πέταξε EMAIL_NOT_FOUND (και το αγνοήσαμε)
  setSuccess(
    "Στάλθηκε μήνυμα επαναφοράς κωδικού.\n" +
      "📬 Έλεγξε και τον φάκελο Spam / Junk.\n" +
      " Αν δεν λάβεις τίποτα μέσα στα επόμενα λεπτά, επικοινώνησε στο bidnow@gmail.com.cy."
  );
};



  return (
    <div>
      <h2>Sign In</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
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

        <div
          style={{
            margin: "0.5rem 0",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />{" "}
            Remember me for 1 month
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            style={{
              border: "none",
              background: "none",
              color: "#007bff",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              fontSize: "0.9rem",
            }}
          >
            {resetLoading ? "Αποστολή..." : "Forgot password?"}
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Γίνεται σύνδεση..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default SignInForm;
