
// // export default SignUpStep1;
// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AuthScaffold from "../components/AuthScaffold";

// import type { Region, Country } from "../models/Springboot/UserEntity";
// import { clearRefreshToken } from "../api/Firebase/authStorage";

// import { checkUsernameAvailable, checkUserExistence } from "../api/Springboot/backendUserService";
// import { setFirebaseAuthToken } from "../api/Springboot/backendClient";

// import { auth } from "../config/firebase";
// import {
//   createUserWithEmailAndPassword,
//   updateProfile,
//   deleteUser,
//   signInWithEmailAndPassword,
//   signOut,
//   type User,
// } from "firebase/auth";

// import type { ConfirmationResult } from "firebase/auth";
// import { sendOtpAndGetConfirmation, confirmOtp, clearRecaptchaVerifier } from "../api/Firebase/phoneOtpService";

// interface SignUpStep1Props {
//   onCompleted: (data: {
//     region: Region;
//     country: Country;
//     firebaseUserId: string;
//     displayName: string;
//   }) => void;
// }

// const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
// const defaultCountry: Country = "Cyprus";

// const prettyRegion = (r: Region) =>
//   r.charAt(0) + r.slice(1).toLowerCase().replace(/_/g, " ");

// const getAuthCode = (err: unknown): string | null => {
//   if (typeof err === "object" && err !== null && "code" in err) {
//     const c = (err as { code?: unknown }).code;
//     return typeof c === "string" ? c : null;
//   }
//   return null;
// };

// const SignUpStep1: React.FC<SignUpStep1Props> = ({ onCompleted }) => {
//   const navigate = useNavigate();

//   const [displayName, setDisplayName] = useState("ken");
//   const [email, setEmail] = useState("ken@example.com");
//   const [password, setPassword] = useState("Password123");
//   const [phoneNumber, setPhoneNumber] = useState("+35799666666");
//   const [region, setRegion] = useState<Region | null>(null);

//   const [rememberMe, setRememberMe] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // OTP modal state
//   const [otpOpen, setOtpOpen] = useState(false);
//   const [otpCode, setOtpCode] = useState("");
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [otpError, setOtpError] = useState<string | null>(null);
//   const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

//   // created user (μόνο αν δημιουργήθηκε σε αυτό το attempt)
//   const [pendingUid, setPendingUid] = useState<string | null>(null);
//   const [createdThisSession, setCreatedThisSession] = useState(false);

//   // ✅ Pending DB popup
//   const [pendingDbPopupOpen, setPendingDbPopupOpen] = useState(false);
//   const [pendingDbUser, setPendingDbUser] = useState<User | null>(null);
//   const [pendingDbLoading, setPendingDbLoading] = useState(false);

//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const styles: Record<string, React.CSSProperties> = useMemo(
//     () => ({
//       card: {
//         width: "min(560px, 92vw)", // ✅ desktop/laptop ΜΗΝ αλλάξει
//         borderRadius: 22,
//         padding: "clamp(18px, 3vw, 28px)",
//         background: "rgba(173, 170, 170, 0.68)",
//         border: "1px solid rgba(255, 255, 255, 0.14)",
//         boxShadow: "0 20px 65px rgba(0,0,0,0.38)",
//         backdropFilter: "blur(22px) saturate(135%)",
//         WebkitBackdropFilter: "blur(22px) saturate(135%)",
//         color: "rgba(242, 251, 255, 0.96)",
//         position: "relative",
//         overflow: "hidden",
//       },
//       logoWrap: { display: "flex", justifyContent: "center", marginBottom: 10 },
//       logo: {
//         height: 80,
//         width: "auto",
//         objectFit: "contain",
//         filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
//       },
//       title: {
//         margin: "8px 0 4px",
//         textAlign: "center",
//         fontSize: "clamp(20px, 2.1vw, 26px)",
//         fontWeight: 900,
//         color: "rgba(255,255,255,0.95)",
//       },
//       subtitle: {
//         margin: "0 0 14px",
//         textAlign: "center",
//         fontSize: "0.95rem",
//         color: "rgba(235, 250, 255, 0.82)",
//       },
//       progressRow: { display: "flex", gap: 10, margin: "12px 0 18px" },
//       progressSeg: {
//         height: 6,
//         borderRadius: 999,
//         flex: 1,
//         background: "rgba(255,255,255,0.22)",
//         boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
//       },
//       progressActive: {
//         background: "#1b63ff",
//         boxShadow: "0 10px 18px rgba(27,99,255,0.35)",
//       },

//       msgWrap: { display: "grid", gap: 10, margin: "10px 0 14px" },
//       msgBox: {
//         padding: "10px 12px",
//         borderRadius: 14,
//         border: "1px solid rgba(255,255,255,0.18)",
//         background: "rgba(0,0,0,0.18)",
//         backdropFilter: "blur(10px)",
//         WebkitBackdropFilter: "blur(10px)",
//         boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
//         display: "flex",
//         gap: 10,
//         alignItems: "flex-start",
//         whiteSpace: "pre-line",
//       },
//       msgIcon: { fontSize: 18, lineHeight: 1.2 },
//       msgText: { fontSize: "0.92rem", color: "rgba(242, 251, 255, 0.96)" },

//       field: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
//       label: { fontSize: "0.85rem", color: "rgba(255,255,255,0.82)", fontWeight: 800 },
//       input: {
//         width: "100%",
//         padding: "12px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(255,255,255,0.12)",
//         color: "rgba(244, 252, 255, 0.96)",
//         outline: "none",
//         fontSize: "1rem",
//       },
//       select: {
//         width: "100%",
//         padding: "12px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(255,255,255,0.12)",
//         color: "rgba(244, 252, 255, 0.96)",
//         outline: "none",
//         fontSize: "1rem",
//       },
//       row: {
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//         flexWrap: "wrap",
//         margin: "10px 0 14px",
//       },
//       checkboxLabel: {
//         display: "flex",
//         alignItems: "center",
//         gap: 10,
//         fontSize: "0.92rem",
//         color: "rgba(255,255,255,0.82)",
//         userSelect: "none",
//       },
//       checkbox: { width: 18, height: 18, accentColor: "#1b63ff" },

//       primaryBtn: {
//         width: "100%",
//         padding: "12px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.18)",
//         background: "#1b63ff",
//         color: "white",
//         fontWeight: 900,
//         fontSize: "1rem",
//         cursor: "pointer",
//         boxShadow: "0 10px 22px rgba(27,99,255,0.35)",
//       },
//       divider: {
//         display: "flex",
//         alignItems: "center",
//         gap: 12,
//         margin: "16px 0 10px",
//         color: "rgba(255,255,255,0.65)",
//         fontSize: "0.85rem",
//       },
//       line: { height: 1, flex: 1, background: "rgba(255,255,255,0.22)" },
//       secondaryBtn: {
//         width: "100%",
//         padding: "12px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(255,255,255,0.08)",
//         color: "rgba(244, 252, 255, 0.92)",
//         fontWeight: 900,
//         fontSize: "0.98rem",
//         cursor: "pointer",
//       },

//       modalOverlay: {
//         position: "fixed",
//         inset: 0,
//         backgroundColor: "rgba(0,0,0,0.55)",
//         backdropFilter: "blur(6px)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 999,
//         padding: 16,
//       },
//       modal: {
//         width: "min(520px, 92vw)",
//         borderRadius: 18,
//         padding: "18px 18px",
//         background: "rgba(18, 86, 108, 0.55)",
//         border: "1px solid rgba(255,255,255,0.16)",
//         boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
//         color: "rgba(242, 251, 255, 0.96)",
//         backdropFilter: "blur(18px) saturate(130%)",
//         WebkitBackdropFilter: "blur(18px) saturate(130%)",
//       },
//       actionRow: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
//       btn: {
//         padding: "10px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.18)",
//         background: "#1b63ff",
//         color: "white",
//         fontWeight: 900,
//         cursor: "pointer",
//       },
//       btnGhost: {
//         padding: "10px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(255,255,255,0.08)",
//         color: "rgba(244, 252, 255, 0.92)",
//         fontWeight: 900,
//         cursor: "pointer",
//       },
//       infoList: {
//         marginTop: 10,
//         padding: 12,
//         borderRadius: 14,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(0,0,0,0.18)",
//       },
//       infoItem: { margin: "6px 0", color: "rgba(240,250,255,0.9)" },
//       infoLabel: { opacity: 0.75, fontWeight: 800, marginRight: 6 },
//     }),
//     []
//   );

//   // 204 => OK (NOT in DB). error => exists in DB
//   const dbUserDoesNotExist = async (emailVal: string, phoneVal: string): Promise<boolean> => {
//     try {
//       await checkUserExistence({ Email: emailVal.trim(), PhoneNumber: phoneVal.trim() });
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   const ensureUserNotInDb = async (emailVal: string, phoneVal: string): Promise<boolean> => {
//     const ok = await dbUserDoesNotExist(emailVal, phoneVal);
//     if (!ok) {
//       setError("Υπάρχει ήδη λογαριασμός με αυτά τα στοιχεία.");
//       setSuccess(null);
//       return false;
//     }
//     return true;
//   };

//   // 204 => διαθέσιμο, error => πιασμένο
//   const ensureUsernameAvailable = async (username: string): Promise<boolean> => {
//     try {
//       await checkUsernameAvailable(username.trim());
//       return true;
//     } catch (err: unknown) {
//       const fallback = `Το username "${username.trim()}" είναι ήδη πιασμένο. Παρακαλώ επίλεξε ένα άλλο username.`;
//       setError(err instanceof Error ? (err.message || fallback) : fallback);
//       setSuccess(null);
//       return false;
//     }
//   };

//   const rollbackPendingFirebaseUser = async (): Promise<void> => {
//     try {
//       const u = auth.currentUser;
//       if (createdThisSession && u && pendingUid && u.uid === pendingUid) {
//         await deleteUser(u);
//       }
//     } catch (e) {
//       console.error("Rollback deleteUser failed:", e);
//     } finally {
//       try {
//         await signOut(auth);
//       } catch {
//         // ignore
//       }
//       clearRecaptchaVerifier();
//       setPendingUid(null);
//       setCreatedThisSession(false);
//       clearRefreshToken();
//       setFirebaseAuthToken(null as unknown as string, null as unknown as string);
//     }
//   };

//   const openOtpModal = (conf: ConfirmationResult) => {
//     setConfirmation(conf);
//     setOtpCode("");
//     setOtpError(null);
//     setOtpOpen(true);
//   };

//   const sendOtpForUser = async (user: User) => {
//     const conf = await sendOtpAndGetConfirmation({
//       user,
//       phoneNumber: phoneNumber.trim(),
//       recaptchaContainerId: "recaptcha-container",
//     });
//     openOtpModal(conf);
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

//     const emailVal = email.trim();
//     const phoneVal = phoneNumber.trim();
//     const usernameVal = displayName.trim();

//     try {
//       // 0) DB pre-check με τα input (για να μπλοκάρεις duplicates)
//       const okDb = await ensureUserNotInDb(emailVal, phoneVal);
//       if (!okDb) return;

//       // 1) username check (όπως είπες)
//       const okUsername = await ensureUsernameAvailable(usernameVal);
//       if (!okUsername) return;

//       let user: User | null = null;

//       // 2) try create, else sign-in
//       try {
//         const cred = await createUserWithEmailAndPassword(auth, emailVal, password);
//         await updateProfile(cred.user, { displayName: usernameVal });

//         setPendingUid(cred.user.uid);
//         setCreatedThisSession(true);
//         user = cred.user;
//       } catch (err: unknown) {
//         const code = getAuthCode(err);

//         if (code === "auth/email-already-in-use") {
//           const cred = await signInWithEmailAndPassword(auth, emailVal, password);
//           user = cred.user;

//           // αν δεν έχει phone linked => resume OTP link
//           if (!user.phoneNumber) {
//             setPendingUid(null);
//             setCreatedThisSession(false);
//             await sendOtpForUser(user);
//             return;
//           }

//           // ✅ έχει phone linked => complete Firebase account
//           // check αν υπάρχει στη DB με πραγματικά email/phone από Firebase
//           const realEmail = user.email ?? emailVal;
//           const realPhone = user.phoneNumber ?? phoneVal;

//           const notInDb = await dbUserDoesNotExist(realEmail, realPhone);
//           if (!notInDb) {
//             setError("Υπάρχει ήδη ολοκληρωμένος λογαριασμός. Κάνε Sign In.");
//             return;
//           }

//           // ✅ δεν είναι στη DB => pending signup -> popup
//           setPendingDbUser(user);
//           setPendingDbPopupOpen(true);
//           return;
//         }

//         throw err;
//       }

//       if (!user) throw new Error("Δεν βρέθηκε Firebase user.");

//       // 3) νέο account -> OTP link
//       await sendOtpForUser(user);
//     } catch (err: unknown) {
//       console.error("SignUp submit error:", err);
//       setError(err instanceof Error ? err.message : "Παρουσιάστηκε σφάλμα κατά την εγγραφή.");
//       setSuccess(null);
//       await rollbackPendingFirebaseUser();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleConfirmOtp = async () => {
//     if (!confirmation) return;
//     if (!otpCode.trim()) {
//       setOtpError("Βάλε τον κωδικό OTP.");
//       return;
//     }
//     if (!region) {
//       setOtpError("Λείπει το region.");
//       return;
//     }

//     setOtpLoading(true);
//     setOtpError(null);

//     try {
//       const user = await confirmOtp({ confirmation, code: otpCode.trim() });

//       const token = await user.getIdToken(true);
//       setFirebaseAuthToken(token, user.uid);

//       if (!rememberMe) clearRefreshToken();

//       setOtpOpen(false);
//       setSuccess("Ο λογαριασμός δημιουργήθηκε επιτυχώς.");
//       setError(null);

//       setPendingUid(null);
//       setCreatedThisSession(false);
//       clearRecaptchaVerifier();

//       onCompleted({
//         region,
//         country: defaultCountry,
//         firebaseUserId: user.uid,
//         displayName: displayName.trim(),
//       });
//     } catch (err: unknown) {
//       console.error("OTP confirm failed:", err);
//       setOtpError(err instanceof Error ? err.message : "Λάθος OTP ή αποτυχία επιβεβαίωσης.");
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   const handleCancelOtp = async () => {
//     setOtpOpen(false);
//     setConfirmation(null);
//     setOtpCode("");
//     setOtpError(null);

//     await rollbackPendingFirebaseUser();
//     setError("Ακύρωσες την επιβεβαίωση OTP. Δοκίμασε ξανά.");
//   };

//   // ✅ Confirm pending DB signup -> πάει Step2
//   const handleConfirmPendingDb = async () => {
//     if (!pendingDbUser || !region) return;

//     setPendingDbLoading(true);
//     setError(null);

//     try {
//       const token = await pendingDbUser.getIdToken(true);
//       setFirebaseAuthToken(token, pendingDbUser.uid);
//       if (!rememberMe) clearRefreshToken();

//       const name = pendingDbUser.displayName ?? displayName.trim();

//       setPendingDbPopupOpen(false);
//       setPendingDbUser(null);

//       onCompleted({
//         region,
//         country: defaultCountry,
//         firebaseUserId: pendingDbUser.uid,
//         displayName: name,
//       });
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Αποτυχία συνέχισης εγγραφής.");
//     } finally {
//       setPendingDbLoading(false);
//     }
//   };

//   const handleCancelPendingDb = async () => {
//     setPendingDbPopupOpen(false);
//     setPendingDbUser(null);

//     try {
//       await signOut(auth);
//     } catch {
//       // ignore
//     }
//     clearRecaptchaVerifier();
//     setFirebaseAuthToken(null as unknown as string, null as unknown as string);

//     setError("Δεν συνέχισες, Ο λογαρισμός σου θα αφαιρεθεί σε σύντομο χρονικό διάστημα απο τους pending λογαριασμούς .");
//   };

//   return (
//     <AuthScaffold>
//       <style>{`
//         /* ✅ Outer padding για να φαίνεται το background σε mobile */
//         .bn-auth-outer{
//           padding: 24px 16px;
//           display:flex;
//           justify-content:center;
//         }

//         .bn-auth-card, .bn-auth-input { box-sizing: border-box; }

//         .bn-auth-input::placeholder { color: rgba(224, 246, 255, 0.56); }
//         .bn-auth-input:focus {
//           border-color: rgba(0, 195, 255, 0.55);
//           background: rgba(255,255,255,0.14);
//           box-shadow: 0 0 0 4px rgba(0, 195, 255, 0.16);
//         }

//         /* ✅ Tablet */
//         @media (max-width: 900px) {
//           .bn-auth-outer{ padding: 22px 14px; }
//           .bn-auth-logo{ height: 72px !important; }
//         }

//         /* ✅ Mobile: πιο στενή κάρτα + πιο διαφανές glass για να φαίνεται το background */
//         @media (max-width: 520px) {
//           .bn-auth-outer{
//             padding: 18px 14px calc(18px + env(safe-area-inset-bottom));
//           }

//           .bn-auth-card{
//             width: min(420px, 86vw) !important;
//             border-radius: 18px !important;
//             padding: 16px !important;
//             background: rgba(173, 170, 170, 0.52) !important;
//             box-shadow: 0 18px 55px rgba(0,0,0,0.42) !important;
//           }

//           .bn-auth-logo{ height: 62px !important; }
//           .bn-auth-row{
//             flex-direction: column !important;
//             align-items: stretch !important;
//             justify-content: flex-start !important;
//             gap: 12px !important;
//           }
//         }

//         /* ✅ Scroll μόνο σε mobile + μικρό ύψος (keyboard), ΟΧΙ σε laptop */
//         @media (max-width: 520px) and (max-height: 740px) {
//           .bn-auth-card{
//             max-height: calc(100vh - 28px) !important;
//             overflow: auto !important;
//           }
//           .bn-auth-modal{
//             max-height: 82vh !important;
//             overflow: auto !important;
//           }
//         }

//         /* ✅ Modals πιο safe σε mobile */
//         @media (max-width: 520px) {
//           .bn-auth-overlay{
//             padding: 14px !important;
//             padding-bottom: calc(14px + env(safe-area-inset-bottom)) !important;
//           }
//           .bn-auth-modal{
//             width: min(520px, 92vw) !important;
//           }
//         }
//       `}</style>

//       <div className="bn-auth-outer">
//         <div className="bn-auth-card" style={styles.card}>
//           <div id="recaptcha-container" style={{ position: "absolute", left: -9999, top: -9999 }} />

//           <div style={styles.logoWrap}>
//             <img
//               className="bn-auth-logo"
//               src="/images/websiteLogoFinal.png"
//               alt="BidNow Logo"
//               style={styles.logo}
//             />
//           </div>

//           <h2 style={styles.title}>Create Account</h2>
//           <p style={styles.subtitle}>Join Live Auction House today</p>

//           {/* <div style={styles.progressRow}>
//             <div style={{ ...styles.progressSeg, ...styles.progressActive }} />
//             <div style={styles.progressSeg} />
//           </div> */}

//           <form onSubmit={handleSubmit}>
//             <div style={styles.field}>
//               <label style={styles.label}>Username</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 value={displayName}
//                 onChange={(e) => setDisplayName(e.target.value)}
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>Email</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>Password</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>Phone Number</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 type="tel"
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>Region</label>
//               <select
//                 className="bn-auth-input"
//                 style={styles.select}
//                 value={region ?? ""}
//                 onChange={(e) => setRegion(e.target.value as Region)}
//               >
//                 <option value="" disabled>
//                   Select region
//                 </option>
//                 {regions.map((r) => (
//                   <option key={r} value={r} style={{ color: "#111" }}>
//                     {prettyRegion(r)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="bn-auth-row" style={styles.row}>
//               <label style={styles.checkboxLabel}>
//                 <input
//                   style={styles.checkbox}
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                 />
//                 Remember me for 1 month
//               </label>
//             </div>

//             {(error || success) && (
//               <div style={styles.msgWrap}>
//                 {error && (
//                   <div style={{ ...styles.msgBox, borderColor: "rgba(255,80,80,0.35)" }}>
//                     <div style={styles.msgIcon}>⚠️</div>
//                     <div style={styles.msgText}>
//                       <strong>Σφάλμα:</strong> {error}
//                     </div>
//                   </div>
//                 )}
//                 {success && (
//                   <div style={{ ...styles.msgBox, borderColor: "rgba(80,255,170,0.28)" }}>
//                     <div style={styles.msgIcon}>✅</div>
//                     <div style={styles.msgText}>
//                       <strong>OK:</strong> {success}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, opacity: loading ? 0.75 : 1 }}>
//               {loading ? "Γίνεται εγγραφή..." : "Next"}
//             </button>

//             <div style={styles.divider}>
//               <div style={styles.line} />
//               <div>Already have an account?</div>
//               <div style={styles.line} />
//             </div>

//             <button type="button" style={styles.secondaryBtn} onClick={() => navigate("/signin")}>
//               Sign In
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* OTP MODAL */}
//       {otpOpen && (
//         <div className="bn-auth-overlay" style={styles.modalOverlay}>
//           <div className="bn-auth-modal" style={styles.modal}>
//             <h3 style={{ margin: "0 0 6px" }}>Επιβεβαίωση OTP</h3>

//             {otpError && (
//               <div style={{ ...styles.msgBox, borderColor: "rgba(255,80,80,0.35)" }}>
//                 <div style={styles.msgIcon}>⚠️</div>
//                 <div style={styles.msgText}>{otpError}</div>
//               </div>
//             )}

//             <div style={{ marginTop: 10 }}>
//               <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "rgba(255,255,255,0.82)" }}>
//                 OTP Code
//               </label>
//               <input
//                 className="bn-auth-input"
//                 style={{ ...styles.input, marginTop: 6 }}
//                 value={otpCode}
//                 onChange={(e) => setOtpCode(e.target.value)}
//               />
//             </div>

//             <div style={styles.actionRow}>
//               <button type="button" onClick={handleConfirmOtp} disabled={otpLoading} style={{ ...styles.btn, opacity: otpLoading ? 0.75 : 1 }}>
//                 {otpLoading ? "Επιβεβαίωση..." : "Confirm"}
//               </button>

//               <button type="button" onClick={handleCancelOtp} disabled={otpLoading} style={{ ...styles.btnGhost, opacity: otpLoading ? 0.75 : 1 }}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* PENDING DB POPUP */}
//       {pendingDbPopupOpen && pendingDbUser && (
//         <div className="bn-auth-overlay" style={styles.modalOverlay}>
//           <div className="bn-auth-modal" style={styles.modal}>
//             <h3 style={{ margin: "0 0 6px" }}>Ημιτελής εγγραφή</h3>
//             <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)" }}>
//               Βρήκαμε λογαριασμό που έχει ήδη επιβεβαιωμένο τηλέφωνο στο Firebase, αλλά δεν ολοκληρώθηκε η εγγραφή στη DB.
//               Θες να συνεχίσεις στο Step 2;
//             </p>

//             <div style={styles.infoList}>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Display name:</span>
//                 {pendingDbUser.displayName ?? displayName.trim()}
//               </div>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Email:</span>
//                 {pendingDbUser.email ?? email.trim()}
//               </div>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Phone:</span>
//                 {pendingDbUser.phoneNumber ?? "—"}
//               </div>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Region:</span>
//                 {region ? prettyRegion(region) : "—"}
//               </div>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Country:</span>
//                 {defaultCountry}
//               </div>
//             </div>

//             <div style={styles.actionRow}>
//               <button type="button" onClick={handleConfirmPendingDb} disabled={pendingDbLoading} style={{ ...styles.btn, opacity: pendingDbLoading ? 0.75 : 1 }}>
//                 {pendingDbLoading ? "Συνέχεια..." : "Ναι, συνέχισε"}
//               </button>

//               <button type="button" onClick={handleCancelPendingDb} disabled={pendingDbLoading} style={{ ...styles.btnGhost, opacity: pendingDbLoading ? 0.75 : 1 }}>
//                 Όχι τώρα
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AuthScaffold>
//   );
// };

// export default SignUpStep1;
// // src/components/SignUpStep1.tsx
// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AuthScaffold from "../components/AuthScaffold";

// import type { Region, Country } from "../models/Springboot/UserEntity";
// import { clearRefreshToken } from "../api/Firebase/authStorage";

// import { checkUsernameAvailable, checkUserExistence } from "../api/Springboot/backendUserService";
// import { setFirebaseAuthToken } from "../api/Springboot/backendClient";


// import { auth } from "../config/firebase";
// import {
//   createUserWithEmailAndPassword,
//   updateProfile,
//   deleteUser,
//   signInWithEmailAndPassword,
//   signOut,
//   type User,
// } from "firebase/auth";

// import type { ConfirmationResult } from "firebase/auth";
// import { sendOtpAndGetConfirmation, confirmOtp, clearRecaptchaVerifier } from "../api/Firebase/phoneOtpService";

// interface SignUpStep1Props {
//   onCompleted: (data: {
//     region: Region;
//     country: Country;
//     firebaseUserId: string;
//     displayName: string;
//   }) => void;
// }

// const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
// const defaultCountry: Country = "Cyprus";

// const prettyRegion = (r: Region) => r.charAt(0) + r.slice(1).toLowerCase().replace(/_/g, " ");

// const getAuthCode = (err: unknown): string | null => {
//   if (typeof err === "object" && err !== null && "code" in err) {
//     const c = (err as { code?: unknown }).code;
//     return typeof c === "string" ? c : null;
//   }
//   return null;
// };

// const SignUpStep1: React.FC<SignUpStep1Props> = ({ onCompleted }) => {
//   const navigate = useNavigate();

//   // ✅ NOT prefilled
//   const [displayName, setDisplayName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   // ✅ NEW: confirm password
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [region, setRegion] = useState<Region | null>(null);

//   const [rememberMe, setRememberMe] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // OTP modal state
//   const [otpOpen, setOtpOpen] = useState(false);
//   const [otpCode, setOtpCode] = useState("");
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [otpError, setOtpError] = useState<string | null>(null);
//   const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

//   // created user (only if created in this attempt)
//   const [pendingUid, setPendingUid] = useState<string | null>(null);
//   const [createdThisSession, setCreatedThisSession] = useState(false);

//   // Pending DB popup
//   const [pendingDbPopupOpen, setPendingDbPopupOpen] = useState(false);
//   const [pendingDbUser, setPendingDbUser] = useState<User | null>(null);
//   const [pendingDbLoading, setPendingDbLoading] = useState(false);

//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const styles: Record<string, React.CSSProperties> = useMemo(
//     () => ({
//       card: {
//         width: "min(560px, 92vw)", // ✅ desktop/laptop DO NOT change
//         borderRadius: 22,
//         padding: "clamp(18px, 3vw, 28px)",
//         background: "rgba(173, 170, 170, 0.68)",
//         border: "1px solid rgba(255, 255, 255, 0.14)",
//         boxShadow: "0 20px 65px rgba(0,0,0,0.38)",
//         backdropFilter: "blur(22px) saturate(135%)",
//         WebkitBackdropFilter: "blur(22px) saturate(135%)",
//         color: "rgba(242, 251, 255, 0.96)",
//         position: "relative",
//         overflow: "hidden",
//       },
//       logoWrap: { display: "flex", justifyContent: "center", marginBottom: 10 },
//       logo: {
//         height: 80,
//         width: "auto",
//         objectFit: "contain",
//         filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
//       },
//       title: {
//         margin: "8px 0 4px",
//         textAlign: "center",
//         fontSize: "clamp(20px, 2.1vw, 26px)",
//         fontWeight: 900,
//         color: "rgba(255,255,255,0.95)",
//       },
//       subtitle: {
//         margin: "0 0 14px",
//         textAlign: "center",
//         fontSize: "0.95rem",
//         color: "rgba(235, 250, 255, 0.82)",
//       },

//       msgWrap: { display: "grid", gap: 10, margin: "10px 0 14px" },
//       msgBox: {
//         padding: "10px 12px",
//         borderRadius: 14,
//         border: "1px solid rgba(255,255,255,0.18)",
//         background: "rgba(0,0,0,0.18)",
//         backdropFilter: "blur(10px)",
//         WebkitBackdropFilter: "blur(10px)",
//         boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
//         display: "flex",
//         gap: 10,
//         alignItems: "flex-start",
//         whiteSpace: "pre-line",
//       },
//       msgIcon: { fontSize: 18, lineHeight: 1.2 },
//       msgText: { fontSize: "0.92rem", color: "rgba(242, 251, 255, 0.96)" },

//       field: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
//       label: { fontSize: "0.85rem", color: "rgba(255,255,255,0.82)", fontWeight: 800 },
//       input: {
//         width: "100%",
//         padding: "12px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(255,255,255,0.12)",
//         color: "rgba(244, 252, 255, 0.96)",
//         outline: "none",
//         fontSize: "1rem",
//       },
//       select: {
//         width: "100%",
//         padding: "12px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(255,255,255,0.12)",
//         color: "rgba(244, 252, 255, 0.96)",
//         outline: "none",
//         fontSize: "1rem",
//       },
//       row: {
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//         flexWrap: "wrap",
//         margin: "10px 0 14px",
//       },
//       checkboxLabel: {
//         display: "flex",
//         alignItems: "center",
//         gap: 10,
//         fontSize: "0.92rem",
//         color: "rgba(255,255,255,0.82)",
//         userSelect: "none",
//       },
//       checkbox: { width: 18, height: 18, accentColor: "#1b63ff" },

//       primaryBtn: {
//         width: "100%",
//         padding: "12px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.18)",
//         background: "#1b63ff",
//         color: "white",
//         fontWeight: 900,
//         fontSize: "1rem",
//         cursor: "pointer",
//         boxShadow: "0 10px 22px rgba(27,99,255,0.35)",
//       },
//       divider: {
//         display: "flex",
//         alignItems: "center",
//         gap: 12,
//         margin: "16px 0 10px",
//         color: "rgba(255,255,255,0.65)",
//         fontSize: "0.85rem",
//       },
//       line: { height: 1, flex: 1, background: "rgba(255,255,255,0.22)" },
//       secondaryBtn: {
//         width: "100%",
//         padding: "12px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(255,255,255,0.08)",
//         color: "rgba(244, 252, 255, 0.92)",
//         fontWeight: 900,
//         fontSize: "0.98rem",
//         cursor: "pointer",
//       },

//       modalOverlay: {
//         position: "fixed",
//         inset: 0,
//         backgroundColor: "rgba(0,0,0,0.55)",
//         backdropFilter: "blur(6px)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 999,
//         padding: 16,
//       },
//       modal: {
//         width: "min(520px, 92vw)",
//         borderRadius: 18,
//         padding: "18px 18px",
//         background: "rgba(18, 86, 108, 0.55)",
//         border: "1px solid rgba(255,255,255,0.16)",
//         boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
//         color: "rgba(242, 251, 255, 0.96)",
//         backdropFilter: "blur(18px) saturate(130%)",
//         WebkitBackdropFilter: "blur(18px) saturate(130%)",
//       },
//       actionRow: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
//       btn: {
//         padding: "10px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.18)",
//         background: "#1b63ff",
//         color: "white",
//         fontWeight: 900,
//         cursor: "pointer",
//       },
//       btnGhost: {
//         padding: "10px 14px",
//         borderRadius: 12,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(255,255,255,0.08)",
//         color: "rgba(244, 252, 255, 0.92)",
//         fontWeight: 900,
//         cursor: "pointer",
//       },
//       infoList: {
//         marginTop: 10,
//         padding: 12,
//         borderRadius: 14,
//         border: "1px solid rgba(255,255,255,0.16)",
//         background: "rgba(0,0,0,0.18)",
//       },
//       infoItem: { margin: "6px 0", color: "rgba(240,250,255,0.9)" },
//       infoLabel: { opacity: 0.75, fontWeight: 800, marginRight: 6 },
//     }),
//     []
//   );

//   // 204 => OK (NOT in DB). error => exists in DB
//   const dbUserDoesNotExist = async (emailVal: string, phoneVal: string): Promise<boolean> => {
//     try {
//       await checkUserExistence({ Email: emailVal.trim(), PhoneNumber: phoneVal.trim() });
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   const ensureUserNotInDb = async (emailVal: string, phoneVal: string): Promise<boolean> => {
//     const ok = await dbUserDoesNotExist(emailVal, phoneVal);
//     if (!ok) {
//       setError("Υπάρχει ήδη λογαριασμός με αυτά τα στοιχεία.");
//       setSuccess(null);
//       return false;
//     }
//     return true;
//   };

//   // 204 => available, error => taken
//   const ensureUsernameAvailable = async (username: string): Promise<boolean> => {
//     try {
//       await checkUsernameAvailable(username.trim());
//       return true;
//     } catch (err: unknown) {
//       const fallback = `Το username "${username.trim()}" είναι ήδη πιασμένο. Παρακαλώ επίλεξε ένα άλλο username.`;
//       setError(err instanceof Error ? err.message || fallback : fallback);
//       setSuccess(null);
//       return false;
//     }
//   };

//   const rollbackPendingFirebaseUser = async (): Promise<void> => {
//     try {
//       const u = auth.currentUser;
//       if (createdThisSession && u && pendingUid && u.uid === pendingUid) {
//         await deleteUser(u);
//       }
//     } catch (e) {
//       console.error("Rollback deleteUser failed:", e);
//     } finally {
//       try {
//         await signOut(auth);
//       } catch {
//         // ignore
//       }
//       clearRecaptchaVerifier();
//       setPendingUid(null);
//       setCreatedThisSession(false);
//       clearRefreshToken();
//       setFirebaseAuthToken(null as unknown as string, null as unknown as string);
//     }
//   };

//   const openOtpModal = (conf: ConfirmationResult) => {
//     setConfirmation(conf);
//     setOtpCode("");
//     setOtpError(null);
//     setOtpOpen(true);
//   };

//   const sendOtpForUser = async (user: User) => {
//     const conf = await sendOtpAndGetConfirmation({
//       user,
//       phoneNumber: phoneNumber.trim(),
//       recaptchaContainerId: "recaptcha-container",
//     });
//     openOtpModal(conf);
//   };

//   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!region) {
//       setError("Παρακαλώ επίλεξε περιοχή.");
//       return;
//     }

//     // ✅ ONLY NEW: confirm password match check
//     if (password !== confirmPassword) {
//       setError("Οι κωδικοί δεν ταιριάζουν.");
//       return;
//     }

//     setLoading(true);

//     const emailVal = email.trim();
//     const phoneVal = phoneNumber.trim();
//     const usernameVal = displayName.trim();

//     try {
//       const okDb = await ensureUserNotInDb(emailVal, phoneVal);
//       if (!okDb) return;

//       const okUsername = await ensureUsernameAvailable(usernameVal);
//       if (!okUsername) return;

//       let user: User | null = null;

//       try {
//         const cred = await createUserWithEmailAndPassword(auth, emailVal, password);
//         await updateProfile(cred.user, { displayName: usernameVal });

//         setPendingUid(cred.user.uid);
//         setCreatedThisSession(true);
//         user = cred.user;
//       } catch (err: unknown) {
//         const code = getAuthCode(err);

//         if (code === "auth/email-already-in-use") {
//           const cred = await signInWithEmailAndPassword(auth, emailVal, password);
//           user = cred.user;

//           if (!user.phoneNumber) {
//             setPendingUid(null);
//             setCreatedThisSession(false);
//             await sendOtpForUser(user);
//             return;
//           }

//           const realEmail = user.email ?? emailVal;
//           const realPhone = user.phoneNumber ?? phoneVal;

//           const notInDb = await dbUserDoesNotExist(realEmail, realPhone);
//           if (!notInDb) {
//             setError("Υπάρχει ήδη ολοκληρωμένος λογαριασμός. Κάνε Sign In.");
//             return;
//           }

//           setPendingDbUser(user);
//           setPendingDbPopupOpen(true);
//           return;
//         }

//         throw err;
//       }

//       if (!user) throw new Error("Δεν βρέθηκε Firebase user.");

//       await sendOtpForUser(user);
//     } catch (err: unknown) {
//       console.error("SignUp submit error:", err);
//       setError(err instanceof Error ? err.message : "Παρουσιάστηκε σφάλμα κατά την εγγραφή.");
//       setSuccess(null);
//       await rollbackPendingFirebaseUser();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleConfirmOtp = async () => {
//     if (!confirmation) return;
//     if (!otpCode.trim()) {
//       setOtpError("Βάλε τον κωδικό OTP.");
//       return;
//     }
//     if (!region) {
//       setOtpError("Λείπει το region.");
//       return;
//     }

//     setOtpLoading(true);
//     setOtpError(null);

//     try {
//       const user = await confirmOtp({ confirmation, code: otpCode.trim() });

//       const token = await user.getIdToken(true);
//       setFirebaseAuthToken(token, user.uid);

//       if (!rememberMe) clearRefreshToken();

//       setOtpOpen(false);
//       setSuccess("Ο λογαριασμός δημιουργήθηκε επιτυχώς.");
//       setError(null);

//       setPendingUid(null);
//       setCreatedThisSession(false);
//       clearRecaptchaVerifier();

//       onCompleted({
//         region,
//         country: defaultCountry,
//         firebaseUserId: user.uid,
//         displayName: displayName.trim(),
//       });
//     } catch (err: unknown) {
//       console.error("OTP confirm failed:", err);
//       setOtpError(err instanceof Error ? err.message : "Λάθος OTP ή αποτυχία επιβεβαίωσης.");
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // const handleCancelOtp = async () => {
//   //   setOtpOpen(false);
//   //   setConfirmation(null);
//   //   setOtpCode("");
//   //   setOtpError(null);

//   //   await rollbackPendingFirebaseUser();
//   //   setError("Ακύρωσες την επιβεβαίωση OTP. Δοκίμασε ξανά.");
//   // };

//   const handleConfirmPendingDb = async () => {
//     if (!pendingDbUser || !region) return;

//     setPendingDbLoading(true);
//     setError(null);

//     try {
//       const token = await pendingDbUser.getIdToken(true);
//       setFirebaseAuthToken(token, pendingDbUser.uid);
//       if (!rememberMe) clearRefreshToken();

//       const name = pendingDbUser.displayName ?? displayName.trim();

//       setPendingDbPopupOpen(false);
//       setPendingDbUser(null);

//       onCompleted({
//         region,
//         country: defaultCountry,
//         firebaseUserId: pendingDbUser.uid,
//         displayName: name,
//       });
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Αποτυχία συνέχισης εγγραφής.");
//     } finally {
//       setPendingDbLoading(false);
//     }
//   };

//   const handleCancelPendingDb = async () => {
//     setPendingDbPopupOpen(false);
//     setPendingDbUser(null);

//     try {
//       await signOut(auth);
//     } catch {
//       // ignore
//     }
//     clearRecaptchaVerifier();
//     setFirebaseAuthToken(null as unknown as string, null as unknown as string);

//     setError("Δεν συνέχισες, Ο λογαρισμός σου θα αφαιρεθεί σε σύντομο χρονικό διάστημα απο τους pending λογαριασμούς .");
//   };

//   return (
//     <AuthScaffold>
//       <style>{`
//         .bn-auth-outer{
//           padding: 24px 16px;
//           display:flex;
//           justify-content:center;
//         }

//         .bn-auth-card, .bn-auth-input { box-sizing: border-box; }

//         .bn-auth-input::placeholder { color: rgba(224, 246, 255, 0.56); }
//         .bn-auth-input:focus {
//           border-color: rgba(0, 195, 255, 0.55);
//           background: rgba(255,255,255,0.14);
//           box-shadow: 0 0 0 4px rgba(0, 195, 255, 0.16);
//         }

//         @media (max-width: 900px) {
//           .bn-auth-outer{ padding: 22px 14px; }
//           .bn-auth-logo{ height: 72px !important; }
//         }

//         @media (max-width: 520px) {
//           .bn-auth-outer{
//             padding: 18px 14px calc(18px + env(safe-area-inset-bottom));
//           }

//           .bn-auth-card{
//             width: min(420px, 86vw) !important;
//             border-radius: 18px !important;
//             padding: 16px !important;
//             background: rgba(173, 170, 170, 0.52) !important;
//             box-shadow: 0 18px 55px rgba(0,0,0,0.42) !important;
//           }

//           .bn-auth-logo{ height: 62px !important; }
//           .bn-auth-row{
//             flex-direction: column !important;
//             align-items: stretch !important;
//             justify-content: flex-start !important;
//             gap: 12px !important;
//           }
//         }

//         @media (max-width: 520px) and (max-height: 740px) {
//           .bn-auth-card{
//             max-height: calc(100vh - 28px) !important;
//             overflow: auto !important;
//           }
//           .bn-auth-modal{
//             max-height: 82vh !important;
//             overflow: auto !important;
//           }
//         }

//         @media (max-width: 520px) {
//           .bn-auth-overlay{
//             padding: 14px !important;
//             padding-bottom: calc(14px + env(safe-area-inset-bottom)) !important;
//           }
//           .bn-auth-modal{
//             width: min(520px, 92vw) !important;
//           }
//         }
//       `}</style>

//       <div className="bn-auth-outer">
//         <div className="bn-auth-card" style={styles.card}>
//           <div id="recaptcha-container" style={{ position: "absolute", left: -9999, top: -9999 }} />

//           <div style={styles.logoWrap}>
//             <img
//               className="bn-auth-logo"
//               src="/images/websiteLogoFinal.png"
//               alt="BidNow Logo"
//               style={styles.logo}
//             />
//           </div>

//           <h2 style={styles.title}>Create Account</h2>
//           <p style={styles.subtitle}>Join Live Auction House today</p>

//           <form onSubmit={handleSubmit}>
//             <div style={styles.field}>
//               <label style={styles.label}>Username</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 value={displayName}
//                 onChange={(e) => setDisplayName(e.target.value)}
//                 placeholder="Choose a username"
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>Email</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>Password</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Create a password"
//               />
//             </div>

//             {/* ✅ NEW: Confirm Password */}
//             <div style={styles.field}>
//               <label style={styles.label}>Confirm Password</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 type="password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="Re-enter your password"
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>Phone Number</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 type="tel"
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//                 placeholder="+357 99 123456"
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>Region</label>
//               <select
//                 className="bn-auth-input"
//                 style={styles.select}
//                 value={region ?? ""}
//                 onChange={(e) => setRegion(e.target.value as Region)}
//               >
//                 <option value="" disabled>
//                   Select region
//                 </option>
//                 {regions.map((r) => (
//                   <option key={r} value={r} style={{ color: "#111" }}>
//                     {prettyRegion(r)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="bn-auth-row" style={styles.row}>
//               <label style={styles.checkboxLabel}>
//                 <input
//                   style={styles.checkbox}
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                 />
//                 Remember me for 1 month
//               </label>
//             </div>

//             {(error || success) && (
//               <div style={styles.msgWrap}>
//                 {error && (
//                   <div style={{ ...styles.msgBox, borderColor: "rgba(255,80,80,0.35)" }}>
//                     <div style={styles.msgIcon}>⚠️</div>
//                     <div style={styles.msgText}>
//                       <strong>Σφάλμα:</strong> {error}
//                     </div>
//                   </div>
//                 )}
//                 {success && (
//                   <div style={{ ...styles.msgBox, borderColor: "rgba(80,255,170,0.28)" }}>
//                     <div style={styles.msgIcon}>✅</div>
//                     <div style={styles.msgText}>
//                       <strong>OK:</strong> {success}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, opacity: loading ? 0.75 : 1 }}>
//               {loading ? "Γίνεται εγγραφή..." : "Next"}
//             </button>

//             <div style={styles.divider}>
//               <div style={styles.line} />
//               <div>Already have an account?</div>
//               <div style={styles.line} />
//             </div>

//             <button type="button" style={styles.secondaryBtn} onClick={() => navigate("/signin")}>
//               Sign In
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* OTP MODAL */}
//       {otpOpen && (
//         <div className="bn-auth-overlay" style={styles.modalOverlay}>
//           <div className="bn-auth-modal" style={styles.modal}>
//             <h3 style={{ margin: "0 0 6px" }}>Επιβεβαίωση OTP</h3>

//             {otpError && (
//               <div style={{ ...styles.msgBox, borderColor: "rgba(255,80,80,0.35)" }}>
//                 <div style={styles.msgIcon}>⚠️</div>
//                 <div style={styles.msgText}>{otpError}</div>
//               </div>
//             )}

//             <div style={{ marginTop: 10 }}>
//               <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "rgba(255,255,255,0.82)" }}>
//                 OTP Code
//               </label>
//               <input
//                 className="bn-auth-input"
//                 style={{ ...styles.input, marginTop: 6 }}
//                 value={otpCode}
//                 onChange={(e) => setOtpCode(e.target.value)}
//               />
//             </div>

//             <div style={styles.actionRow}>
//               <button type="button" onClick={handleConfirmOtp} disabled={otpLoading} style={{ ...styles.btn, opacity: otpLoading ? 0.75 : 1 }}>
//                 {otpLoading ? "Επιβεβαίωση..." : "Confirm"}
//               </button>
// {/* 
//               <button type="button" onClick={handleCancelOtp} disabled={otpLoading} style={{ ...styles.btnGhost, opacity: otpLoading ? 0.75 : 1 }}>
//                 Cancel
//               </button> */}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* PENDING DB POPUP */}
//       {pendingDbPopupOpen && pendingDbUser && (
//         <div className="bn-auth-overlay" style={styles.modalOverlay}>
//           <div className="bn-auth-modal" style={styles.modal}>
//             <h3 style={{ margin: "0 0 6px" }}>Ημιτελής εγγραφή</h3>
//             <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)" }}>
//               Βρήκαμε λογαριασμό που έχει ήδη επιβεβαιωμένο τηλέφωνο στο Firebase, αλλά δεν ολοκληρώθηκε η εγγραφή στη DB.
//               Θες να συνεχίσεις στο Step 2;
//             </p>

//             <div style={styles.infoList}>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Display name:</span>
//                 {pendingDbUser.displayName ?? displayName.trim()}
//               </div>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Email:</span>
//                 {pendingDbUser.email ?? email.trim()}
//               </div>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Phone:</span>
//                 {pendingDbUser.phoneNumber ?? "—"}
//               </div>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Region:</span>
//                 {region ? prettyRegion(region) : "—"}
//               </div>
//               <div style={styles.infoItem}>
//                 <span style={styles.infoLabel}>Country:</span>
//                 {defaultCountry}
//               </div>
//             </div>

//             <div style={styles.actionRow}>
//               <button type="button" onClick={handleConfirmPendingDb} disabled={pendingDbLoading} style={{ ...styles.btn, opacity: pendingDbLoading ? 0.75 : 1 }}>
//                 {pendingDbLoading ? "Συνέχεια..." : "Ναι, συνέχισε"}
//               </button>

//               <button type="button" onClick={handleCancelPendingDb} disabled={pendingDbLoading} style={{ ...styles.btnGhost, opacity: pendingDbLoading ? 0.75 : 1 }}>
//                 Όχι τώρα
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AuthScaffold>
//   );
// };

// export default SignUpStep1;
// src/components/SignUpStep1.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthScaffold from "../components/AuthScaffold";

import type { Region, Country } from "../models/Springboot/UserEntity";
import { clearRefreshToken } from "../api/Firebase/authStorage";

import { checkUsernameAvailable, checkUserExistence } from "../api/Springboot/backendUserService";
import { setFirebaseAuthToken } from "../api/Springboot/backendClient";

import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import type { ConfirmationResult } from "firebase/auth";
import { sendOtpAndGetConfirmation, confirmOtp, clearRecaptchaVerifier } from "../api/Firebase/phoneOtpService";

interface SignUpStep1Props {
  onCompleted: (data: {
    region: Region;
    country: Country;
    firebaseUserId: string;
    displayName: string;
  }) => void;
}

const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
const defaultCountry: Country = "Cyprus";

const prettyRegion = (r: Region) => r.charAt(0) + r.slice(1).toLowerCase().replace(/_/g, " ");

const getAuthCode = (err: unknown): string | null => {
  if (typeof err === "object" && err !== null && "code" in err) {
    const c = (err as { code?: unknown }).code;
    return typeof c === "string" ? c : null;
  }
  return null;
};

const SignUpStep1: React.FC<SignUpStep1Props> = ({ onCompleted }) => {
  const navigate = useNavigate();

  // ✅ NOT prefilled
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // ✅ NEW: confirm password
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [region, setRegion] = useState<Region | null>(null);

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP modal state
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // created user (only if created in this attempt)
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [createdThisSession, setCreatedThisSession] = useState(false);

  // Pending DB popup
  const [pendingDbPopupOpen, setPendingDbPopupOpen] = useState(false);
  const [pendingDbUser, setPendingDbUser] = useState<User | null>(null);
  const [pendingDbLoading, setPendingDbLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const styles: Record<string, React.CSSProperties> = useMemo(
    () => ({
      card: {
        width: "min(560px, 92vw)", // ✅ desktop/laptop DO NOT change
        borderRadius: 22,
        padding: "clamp(18px, 3vw, 28px)",
        background: "rgba(173, 170, 170, 0.68)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 20px 65px rgba(0,0,0,0.38)",
        backdropFilter: "blur(22px) saturate(135%)",
        WebkitBackdropFilter: "blur(22px) saturate(135%)",
        color: "rgba(242, 251, 255, 0.96)",
        position: "relative",
        overflow: "hidden",
      },
      logoWrap: { display: "flex", justifyContent: "center", marginBottom: 10 },
      logo: {
        height: 80,
        width: "auto",
        objectFit: "contain",
        filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
      },
      title: {
        margin: "8px 0 4px",
        textAlign: "center",
        fontSize: "clamp(20px, 2.1vw, 26px)",
        fontWeight: 900,
        color: "rgba(255,255,255,0.95)",
      },
      subtitle: {
        margin: "0 0 14px",
        textAlign: "center",
        fontSize: "0.95rem",
        color: "rgba(235, 250, 255, 0.82)",
      },

      msgWrap: { display: "grid", gap: 10, margin: "10px 0 14px" },
      msgBox: {
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(0,0,0,0.18)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        whiteSpace: "pre-line",
      },
      msgIcon: { fontSize: 18, lineHeight: 1.2 },
      msgText: { fontSize: "0.92rem", color: "rgba(242, 251, 255, 0.96)" },

      field: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
      label: { fontSize: "0.85rem", color: "rgba(255,255,255,0.82)", fontWeight: 800 },
      input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.12)",
        color: "rgba(244, 252, 255, 0.96)",
        outline: "none",
        fontSize: "1rem",
      },
      select: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.12)",
        color: "rgba(244, 252, 255, 0.96)",
        outline: "none",
        fontSize: "1rem",
      },
      row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        margin: "10px 0 14px",
      },
      checkboxLabel: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: "0.92rem",
        color: "rgba(255,255,255,0.82)",
        userSelect: "none",
      },
      checkbox: { width: 18, height: 18, accentColor: "#1b63ff" },

      primaryBtn: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "#1b63ff",
        color: "white",
        fontWeight: 900,
        fontSize: "1rem",
        cursor: "pointer",
        boxShadow: "0 10px 22px rgba(27,99,255,0.35)",
      },
      divider: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "16px 0 10px",
        color: "rgba(255,255,255,0.65)",
        fontSize: "0.85rem",
      },
      line: { height: 1, flex: 1, background: "rgba(255,255,255,0.22)" },
      secondaryBtn: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        color: "rgba(244, 252, 255, 0.92)",
        fontWeight: 900,
        fontSize: "0.98rem",
        cursor: "pointer",
      },

      modalOverlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: 16,
      },
      modal: {
        width: "min(520px, 92vw)",
        borderRadius: 18,
        padding: "18px 18px",
        background: "rgba(18, 86, 108, 0.55)",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
        color: "rgba(242, 251, 255, 0.96)",
        backdropFilter: "blur(18px) saturate(130%)",
        WebkitBackdropFilter: "blur(18px) saturate(130%)",
      },
      actionRow: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
      btn: {
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "#1b63ff",
        color: "white",
        fontWeight: 900,
        cursor: "pointer",
      },
      btnGhost: {
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        color: "rgba(244, 252, 255, 0.92)",
        fontWeight: 900,
        cursor: "pointer",
      },
      infoList: {
        marginTop: 10,
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(0,0,0,0.18)",
      },
      infoItem: { margin: "6px 0", color: "rgba(240,250,255,0.9)" },
      infoLabel: { opacity: 0.75, fontWeight: 800, marginRight: 6 },
    }),
    []
  );

  // 204 => OK (NOT in DB). error => exists in DB
  const dbUserDoesNotExist = async (emailVal: string, phoneVal: string): Promise<boolean> => {
    try {
      await checkUserExistence({ Email: emailVal.trim(), PhoneNumber: phoneVal.trim() });
      return true;
    } catch {
      return false;
    }
  };

  const ensureUserNotInDb = async (emailVal: string, phoneVal: string): Promise<boolean> => {
    const ok = await dbUserDoesNotExist(emailVal, phoneVal);
    if (!ok) {
      setError("An account already exists with these details. Try signing in instead.");
      setSuccess(null);
      return false;
    }
    return true;
  };

  // 204 => available, error => taken
  const ensureUsernameAvailable = async (username: string): Promise<boolean> => {
    try {
      await checkUsernameAvailable(username.trim());
      return true;
    } catch (err: unknown) {
      const fallback = `That username is already taken. Please choose a different one.`;
      setError(err instanceof Error ? err.message || fallback : fallback);
      setSuccess(null);
      return false;
    }
  };

  const rollbackPendingFirebaseUser = async (): Promise<void> => {
    try {
      const u = auth.currentUser;
      if (createdThisSession && u && pendingUid && u.uid === pendingUid) {
        await deleteUser(u);
      }
    } catch (e) {
      console.error("Rollback deleteUser failed:", e);
    } finally {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
      clearRecaptchaVerifier();
      setPendingUid(null);
      setCreatedThisSession(false);
      clearRefreshToken();
      setFirebaseAuthToken(null as unknown as string, null as unknown as string);
    }
  };

  const openOtpModal = (conf: ConfirmationResult) => {
    setConfirmation(conf);
    setOtpCode("");
    setOtpError(null);
    setOtpOpen(true);
  };

  const sendOtpForUser = async (user: User) => {
    const conf = await sendOtpAndGetConfirmation({
      user,
      phoneNumber: phoneNumber.trim(),
      recaptchaContainerId: "recaptcha-container",
    });
    openOtpModal(conf);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!region) {
      setError("Please choose a region to continue.");
      return;
    }

    // ✅ ONLY NEW: confirm password match check
    if (password !== confirmPassword) {
      setError("Passwords don’t match. Please try again.");
      return;
    }

    setLoading(true);

    const emailVal = email.trim();
    const phoneVal = phoneNumber.trim();
    const usernameVal = displayName.trim();

    try {
      const okDb = await ensureUserNotInDb(emailVal, phoneVal);
      if (!okDb) return;

      const okUsername = await ensureUsernameAvailable(usernameVal);
      if (!okUsername) return;

      let user: User | null = null;

      try {
        const cred = await createUserWithEmailAndPassword(auth, emailVal, password);
        await updateProfile(cred.user, { displayName: usernameVal });

        setPendingUid(cred.user.uid);
        setCreatedThisSession(true);
        user = cred.user;
      } catch (err: unknown) {
        const code = getAuthCode(err);

        if (code === "auth/email-already-in-use") {
          const cred = await signInWithEmailAndPassword(auth, emailVal, password);
          user = cred.user;

          if (!user.phoneNumber) {
            setPendingUid(null);
            setCreatedThisSession(false);
            await sendOtpForUser(user);
            return;
          }

          const realEmail = user.email ?? emailVal;
          const realPhone = user.phoneNumber ?? phoneVal;

          const notInDb = await dbUserDoesNotExist(realEmail, realPhone);
          if (!notInDb) {
            setError("This account is already set up. Please sign in.");
            return;
          }

          setPendingDbUser(user);
          setPendingDbPopupOpen(true);
          return;
        }

        throw err;
      }

      if (!user) throw new Error("We couldn’t start your sign-up. Please try again.");

      await sendOtpForUser(user);
    } catch (err: unknown) {
      console.error("SignUp submit error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while creating your account. Please try again.");
      setSuccess(null);
      await rollbackPendingFirebaseUser();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (!confirmation) return;
    if (!otpCode.trim()) {
      setOtpError("Enter the verification code.");
      return;
    }
    if (!region) {
      setOtpError("Please choose your region first.");
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const user = await confirmOtp({ confirmation, code: otpCode.trim() });

      const token = await user.getIdToken(true);
      setFirebaseAuthToken(token, user.uid);

      //if (!rememberMe) clearRefreshToken();

      setOtpOpen(false);
      setSuccess("Your account was created successfully.");
      setError(null);

      setPendingUid(null);
      setCreatedThisSession(false);
      clearRecaptchaVerifier();

      onCompleted({
        region,
        country: defaultCountry,
        firebaseUserId: user.uid,
        displayName: displayName.trim(),
      });
    } catch (err: unknown) {
      console.error("OTP confirm failed:", err);
      setOtpError(err instanceof Error ? err.message : "That code is incorrect or expired. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCancelOtp = async () => {
    setOtpOpen(false);
    setConfirmation(null);
    setOtpCode("");
    setOtpError(null);

    await rollbackPendingFirebaseUser();
    setError("You cancelled phone verification. Please try again.");
  };

  const handleConfirmPendingDb = async () => {
    if (!pendingDbUser || !region) return;

    setPendingDbLoading(true);
    setError(null);

    try {
      const token = await pendingDbUser.getIdToken(true);
      setFirebaseAuthToken(token, pendingDbUser.uid);
      //if (!rememberMe) clearRefreshToken();

      const name = pendingDbUser.displayName ?? displayName.trim();

      setPendingDbPopupOpen(false);
      setPendingDbUser(null);

      onCompleted({
        region,
        country: defaultCountry,
        firebaseUserId: pendingDbUser.uid,
        displayName: name,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Couldn’t continue your sign-up. Please try again.");
    } finally {
      setPendingDbLoading(false);
    }
  };

  const handleCancelPendingDb = async () => {
    setPendingDbPopupOpen(false);
    setPendingDbUser(null);

    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    clearRecaptchaVerifier();
    setFirebaseAuthToken(null as unknown as string, null as unknown as string);

    setError("You didn’t continue. Your pending sign-up will be removed shortly.");
  };

  return (
    <AuthScaffold>
      <style>{`
        .bn-auth-outer{
          padding: 24px 16px;
          display:flex;
          justify-content:center;
        }

        .bn-auth-card, .bn-auth-input { box-sizing: border-box; }

        .bn-auth-input::placeholder { color: rgba(224, 246, 255, 0.56); }
        .bn-auth-input:focus {
          border-color: rgba(0, 195, 255, 0.55);
          background: rgba(255,255,255,0.14);
          box-shadow: 0 0 0 4px rgba(0, 195, 255, 0.16);
        }

        @media (max-width: 900px) {
          .bn-auth-outer{ padding: 22px 14px; }
          .bn-auth-logo{ height: 72px !important; }
        }

        @media (max-width: 520px) {
          .bn-auth-outer{
            padding: 18px 14px calc(18px + env(safe-area-inset-bottom));
          }

          .bn-auth-card{
            width: min(420px, 86vw) !important;
            border-radius: 18px !important;
            padding: 16px !important;
            background: rgba(173, 170, 170, 0.52) !important;
            box-shadow: 0 18px 55px rgba(0,0,0,0.42) !important;
          }

          .bn-auth-logo{ height: 62px !important; }
          .bn-auth-row{
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 520px) and (max-height: 740px) {
          .bn-auth-card{
            max-height: calc(100vh - 28px) !important;
            overflow: auto !important;
          }
          .bn-auth-modal{
            max-height: 82vh !important;
            overflow: auto !important;
          }
        }

        @media (max-width: 520px) {
          .bn-auth-overlay{
            padding: 14px !important;
            padding-bottom: calc(14px + env(safe-area-inset-bottom)) !important;
          }
          .bn-auth-modal{
            width: min(520px, 92vw) !important;
          }
        }
      `}</style>

      <div className="bn-auth-outer">
        <div className="bn-auth-card" style={styles.card}>
          <div id="recaptcha-container" style={{ position: "absolute", left: -9999, top: -9999 }} />

          <div style={styles.logoWrap}>
            <img
              className="bn-auth-logo"
              src="/images/websiteLogoFinal.png"
              alt="BidNow Logo"
              style={styles.logo}
            />
          </div>

          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.subtitle}>Join Live Auction House in minutes.</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                className="bn-auth-input"
                style={styles.input}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Choose a username"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                className="bn-auth-input"
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                className="bn-auth-input"
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>

            {/* ✅ NEW: Confirm Password */}
            <div style={styles.field}>
              <label style={styles.label}>Confirm password</label>
              <input
                className="bn-auth-input"
                style={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone number</label>
              <input
                className="bn-auth-input"
                style={styles.input}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +357 99 123456"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Region</label>
              <select
                className="bn-auth-input"
                style={styles.select}
                value={region ?? ""}
                onChange={(e) => setRegion(e.target.value as Region)}
              >
                <option value="" disabled>
                  Choose your region
                </option>
                {regions.map((r) => (
                  <option key={r} value={r} style={{ color: "#111" }}>
                    {prettyRegion(r)}
                  </option>
                ))}
              </select>
            </div>

            <div className="bn-auth-row" style={styles.row}>
              <label style={styles.checkboxLabel}>
                <input
                  style={styles.checkbox}
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Keep me signed in for 30 days
              </label>
            </div>

            {(error || success) && (
              <div style={styles.msgWrap}>
                {error && (
                  <div style={{ ...styles.msgBox, borderColor: "rgba(255,80,80,0.35)" }}>
                    <div style={styles.msgIcon}>⚠️</div>
                    <div style={styles.msgText}>
                      <strong>Error:</strong> {error}
                    </div>
                  </div>
                )}
                {success && (
                  <div style={{ ...styles.msgBox, borderColor: "rgba(80,255,170,0.28)" }}>
                    <div style={styles.msgIcon}>✅</div>
                    <div style={styles.msgText}>
                      <strong>Success:</strong> {success}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, opacity: loading ? 0.75 : 1 }}>
              {loading ? "Creating account..." : "Continue"}
            </button>

            <div style={styles.divider}>
              <div style={styles.line} />
              <div>Already have an account?</div>
              <div style={styles.line} />
            </div>

            <button type="button" style={styles.secondaryBtn} onClick={() => navigate("/signin")}>
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* OTP MODAL */}
      {otpOpen && (
        <div className="bn-auth-overlay" style={styles.modalOverlay}>
          <div className="bn-auth-modal" style={styles.modal}>
            <h3 style={{ margin: "0 0 6px" }}>Phone verification</h3>

            {otpError && (
              <div style={{ ...styles.msgBox, borderColor: "rgba(255,80,80,0.35)" }}>
                <div style={styles.msgIcon}>⚠️</div>
                <div style={styles.msgText}>{otpError}</div>
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "rgba(255,255,255,0.82)" }}>
                Verification code
              </label>
              <input
                className="bn-auth-input"
                style={{ ...styles.input, marginTop: 6 }}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>

            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={handleConfirmOtp}
                disabled={otpLoading}
                style={{ ...styles.btn, opacity: otpLoading ? 0.75 : 1 }}
              >
                {otpLoading ? "Verifying..." : "Verify"}
              </button>

              <button
                type="button"
                onClick={handleCancelOtp}
                disabled={otpLoading}
                style={{ ...styles.btnGhost, opacity: otpLoading ? 0.75 : 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING DB POPUP */}
      {pendingDbPopupOpen && pendingDbUser && (
        <div className="bn-auth-overlay" style={styles.modalOverlay}>
          <div className="bn-auth-modal" style={styles.modal}>
            <h3 style={{ margin: "0 0 6px" }}>Incomplete sign-up</h3>
            <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)" }}>
              We found a pending account with the details below. Tap Continue to finish your registration.
            </p>

            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Display name:</span>
                {pendingDbUser.displayName ?? displayName.trim()}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email:</span>
                {pendingDbUser.email ?? email.trim()}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Phone:</span>
                {pendingDbUser.phoneNumber ?? "—"}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Region:</span>
                {region ? prettyRegion(region) : "—"}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Country:</span>
                {defaultCountry}
              </div>
            </div>

            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={handleConfirmPendingDb}
                disabled={pendingDbLoading}
                style={{ ...styles.btn, opacity: pendingDbLoading ? 0.75 : 1 }}
              >
                {pendingDbLoading ? "Continuing..." : "Continue"}
              </button>

              <button
                type="button"
                onClick={handleCancelPendingDb}
                disabled={pendingDbLoading}
                style={{ ...styles.btnGhost, opacity: pendingDbLoading ? 0.75 : 1 }}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthScaffold>
  );
};

export default SignUpStep1;
