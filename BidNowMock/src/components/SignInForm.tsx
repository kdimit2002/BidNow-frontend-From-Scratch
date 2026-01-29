// // src/components/SignInForm.tsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// import AuthScaffold from "./AuthScaffold";

// import {
//   signInWithEmailAndInitSession,
//   sendPasswordResetEmail,
// } from "../api/Firebase/firebaseIdentityService";
// import { callBackendLogin } from "../api/Springboot/backendUserService";
// import { clearRefreshToken } from "../api/Firebase/authStorage";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// import { getAuthErrorCode, toGreekAuthMessage } from "../utils/authErrorMessages";

// interface SignInFormProps {
//   onSignedIn?: (auth: AuthUserDto) => void;
// }

// const SignInForm: React.FC<SignInFormProps> = ({ onSignedIn }) => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("ken@example.com");
//   const [password, setPassword] = useState("Password123");
//   const [rememberMe, setRememberMe] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [resetLoading, setResetLoading] = useState(false);

//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setLoading(true);

//     try {
//       const result = await signInWithEmailAndInitSession({ email, password });
//       const authUser = await callBackendLogin();

//       if (!rememberMe) clearRefreshToken();

//       setSuccess(`Συνδέθηκες επιτυχώς ως ${result.email ?? email}`);

//       if (onSignedIn) onSignedIn(authUser);
//       navigate("/", { replace: true });
//     } catch (err: unknown) {
//       console.error(err);
//       setError(toGreekAuthMessage(err, "SIGN_IN"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     setError(null);
//     setSuccess(null);

//     const trimmedEmail = email.trim();
//     if (!trimmedEmail) {
//       setError("Συμπλήρωσε πρώτα το email σου για να σου στείλουμε link επαναφοράς.");
//       return;
//     }

//     setResetLoading(true);

//     const successText =
//       "Αν το email υπάρχει στο σύστημα, θα λάβεις μήνυμα επαναφοράς κωδικού.\n" +
//       "📬 Έλεγξε και τον φάκελο Spam / Junk.\n" +
//       "Αν δεν λάβεις τίποτα μέσα στα επόμενα λεπτά, επικοινώνησε στο bidnow@gmail.com.cy.";

//     try {
//       await sendPasswordResetEmail(trimmedEmail);
//       setSuccess(successText);
//     } catch (err: unknown) {
//       console.error("Forgot password error:", err);

//       const code = getAuthErrorCode(err).toUpperCase();

//       if (code.includes("INVALID_EMAIL") || code.includes("AUTH/INVALID-EMAIL")) {
//         setError(toGreekAuthMessage(err, "RESET_PASSWORD"));
//         setResetLoading(false);
//         return;
//       }

//       if (
//         code.includes("NETWORK") ||
//         code.includes("ERR_NETWORK") ||
//         code.includes("TIMEOUT") ||
//         code.includes("TOO_MANY") ||
//         code.includes("RATE_LIMIT") ||
//         code.includes("TRY_LATER")
//       ) {
//         setError(toGreekAuthMessage(err, "RESET_PASSWORD"));
//         setResetLoading(false);
//         return;
//       }

//       setSuccess(successText);
//     } finally {
//       setResetLoading(false);
//     }
//   };

//   const styles: Record<string, React.CSSProperties> = {
//     card: {
//       width: "min(560px, 92vw)",
//       borderRadius: 22,
//       padding: "clamp(18px, 3vw, 28px)",
//       background: "rgba(173, 170, 170, 0.68)",
//       border: "1px solid rgba(255, 255, 255, 0.14)",
//       boxShadow: "0 20px 65px rgba(0,0,0,0.38)",
//       backdropFilter: "blur(22px) saturate(135%)",
//       WebkitBackdropFilter: "blur(22px) saturate(135%)",
//       color: "rgba(242, 251, 255, 0.96)",
//       position: "relative",
//       overflow: "hidden",
//     },
//     topGlow: {
//       content: '""',
//       position: "absolute",
//       inset: "0 0 auto 0",
//       height: 90,
//       background:
//         "radial-gradient(600px 90px at 50% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)",
//       pointerEvents: "none",
//     },
//     logoWrap: { display: "flex", justifyContent: "center", marginBottom: 14 },
//     logo: {
//       height: 90,
//       width: "auto",
//       objectFit: "contain",
//       filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.45))",
//     },
//     title: {
//       margin: "8px 0 6px",
//       textAlign: "center",
//       fontSize: "clamp(22px, 2.2vw, 30px)",
//       fontWeight: 900,
//       color: "rgba(255,255,255,0.95)",
//     },
//     subtitle: {
//       margin: "0 0 18px",
//       textAlign: "center",
//       fontSize: "0.95rem",
//       color: "rgba(230, 248, 255, 0.80)",
//     },

//     // ✅ ίδιο message styling όπως SignUpStep1
//     msgWrap: { display: "grid", gap: 10, margin: "10px 0 14px" },
//     msgBox: {
//       padding: "10px 12px",
//       borderRadius: 14,
//       border: "1px solid rgba(255,255,255,0.18)",
//       background: "rgba(0,0,0,0.18)",
//       backdropFilter: "blur(10px)",
//       WebkitBackdropFilter: "blur(10px)",
//       boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
//       display: "flex",
//       gap: 10,
//       alignItems: "flex-start",
//       whiteSpace: "pre-line",
//     },
//     msgIcon: { fontSize: 18, lineHeight: 1.2 },
//     msgText: { fontSize: "0.92rem", color: "rgba(242, 251, 255, 0.96)" },

//     field: {
//       display: "flex",
//       flexDirection: "column",
//       gap: 8,
//       marginBottom: 12,
//     },
//     label: {
//       fontSize: "0.85rem",
//       color: "rgba(235, 250, 255, 0.86)",
//       fontWeight: 800,
//     },
//     input: {
//       width: "100%",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.18)",
//       background: "rgba(255,255,255,0.10)",
//       color: "rgba(244, 252, 255, 0.96)",
//       outline: "none",
//       fontSize: "1rem",
//       transition:
//         "box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, transform 180ms ease",
//     },
//     row: {
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       gap: 10,
//       flexWrap: "wrap",
//       margin: "10px 0 14px",
//     },
//     checkboxLabel: {
//       display: "flex",
//       alignItems: "center",
//       gap: 10,
//       fontSize: "0.92rem",
//       color: "rgba(240, 252, 255, 0.84)",
//       userSelect: "none",
//     },
//     checkbox: { width: 18, height: 18, accentColor: "#1b63ff" },
//     linkBtn: {
//       border: "none",
//       background: "transparent",
//       color: "rgba(175, 235, 255, 0.95)",
//       cursor: "pointer",
//       padding: 0,
//       fontSize: "0.92rem",
//       textDecoration: "underline",
//       fontWeight: 800,
//     },
//     primaryBtn: {
//       width: "100%",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.18)",
//       background: "linear-gradient(90deg, #1b63ff, #00b3ff)",
//       color: "white",
//       fontWeight: 900,
//       fontSize: "1rem",
//       cursor: "pointer",
//       boxShadow: "0 14px 30px rgba(0, 150, 255, 0.30)",
//       transition: "transform 140ms ease, filter 140ms ease, box-shadow 140ms ease",
//     },
//     divider: {
//       display: "flex",
//       alignItems: "center",
//       gap: 12,
//       margin: "16px 0",
//       color: "rgba(255,255,255,0.65)",
//       fontSize: "0.85rem",
//     },
//     line: { height: 1, flex: 1, background: "rgba(255,255,255,0.22)" },
//     secondaryBtn: {
//       width: "100%",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "rgba(255,255,255,0.08)",
//       color: "rgba(244, 252, 255, 0.92)",
//       fontWeight: 900,
//       fontSize: "0.98rem",
//       cursor: "pointer",
//       transition: "background 140ms ease, border-color 140ms ease, transform 140ms ease",
//     },
//     bottomText: {
//       marginTop: 14,
//       textAlign: "center",
//       color: "rgba(240, 252, 255, 0.78)",
//       fontSize: "0.92rem",
//     },
//   };

//   return (
//     <AuthScaffold>
//       <style>{`
//         .bn-auth-input::placeholder { color: rgba(224, 246, 255, 0.56); }

//         .bn-auth-input:focus {
//           border-color: rgba(0, 195, 255, 0.55);
//           background: rgba(255,255,255,0.12);
//           box-shadow: 0 0 0 4px rgba(0, 195, 255, 0.18);
//         }

//         .bn-primary:not(:disabled):hover {
//           transform: translateY(-1px);
//           filter: brightness(1.05);
//           box-shadow: 0 18px 36px rgba(0,150,255,0.34);
//         }

//         .bn-secondary:not(:disabled):hover {
//           transform: translateY(-1px);
//           background: rgba(255,255,255,0.10);
//           border-color: rgba(255,255,255,0.22);
//         }
//       `}</style>

//       <div style={styles.card}>
//         <div style={styles.topGlow as React.CSSProperties} />

//         <div style={styles.logoWrap}>
//           <img
//             src="/images/websiteLogoFinal.png"
//             alt="BidNow Logo"
//             style={styles.logo}
//           />
//         </div>

//         <h2 style={styles.title}>Welcome Back</h2>
//         <p style={styles.subtitle}>Sign in to continue to Live Auction House</p>

//         <form onSubmit={handleSubmit}>
//           <div style={styles.field}>
//             <label style={styles.label}>Email</label>
//             <input
//               className="bn-auth-input"
//               style={styles.input}
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder="your.email@example.com"
//               autoComplete="email"
//             />
//           </div>

//           <div style={styles.field}>
//             <label style={styles.label}>Password</label>
//             <input
//               className="bn-auth-input"
//               style={styles.input}
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               placeholder="Enter your password"
//               autoComplete="current-password"
//             />
//           </div>

//           <div style={styles.row}>
//             <label style={styles.checkboxLabel}>
//               <input
//                 style={styles.checkbox}
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//               />
//               Remember me for 1 month
//             </label>

//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               disabled={resetLoading}
//               style={{
//                 ...styles.linkBtn,
//                 opacity: resetLoading ? 0.7 : 1,
//                 cursor: resetLoading ? "not-allowed" : "pointer",
//               }}
//             >
//               {resetLoading ? "Αποστολή..." : "Forgot password?"}
//             </button>
//           </div>

//           {/* ✅ ΕΔΩ: ίδιο error/success box όπως SignUpStep1 */}
//           {(error || success) && (
//             <div style={styles.msgWrap}>
//               {error && (
//                 <div style={{ ...styles.msgBox, borderColor: "rgba(255,80,80,0.35)" }}>
//                   <div style={styles.msgIcon}>⚠️</div>
//                   <div style={styles.msgText}>
//                     <strong>Σφάλμα:</strong> {error}
//                   </div>
//                 </div>
//               )}
//               {success && (
//                 <div style={{ ...styles.msgBox, borderColor: "rgba(80,255,170,0.28)" }}>
//                   <div style={styles.msgIcon}>✅</div>
//                   <div style={styles.msgText}>
//                     <strong>OK:</strong> {success}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <button
//             className="bn-primary"
//             type="submit"
//             disabled={loading}
//             style={{
//               ...styles.primaryBtn,
//               opacity: loading ? 0.75 : 1,
//               cursor: loading ? "not-allowed" : "pointer",
//             }}
//           >
//             {loading ? "Γίνεται σύνδεση..." : "Sign In"}
//           </button>

//           <div style={styles.bottomText}>Don't have an account?</div>

//           <button
//             className="bn-secondary"
//             type="button"
//             style={{ ...styles.secondaryBtn, marginTop: 10 }}
//             onClick={() => navigate("/signup")}
//           >
//             Create an Account
//           </button>

//           <div style={styles.divider}>
//             <div style={styles.line} />
//             <div>Or</div>
//             <div style={styles.line} />
//           </div>

//           <button
//             className="bn-secondary"
//             type="button"
//             style={styles.secondaryBtn}
//             onClick={() => navigate("/")}
//           >
//             Continue as Guest
//           </button>
//         </form>
//       </div>
//     </AuthScaffold>
//   );
// };

// export default SignInForm;
// // src/components/SignInForm.tsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// import AuthScaffold from "./AuthScaffold";

// import {
//   signInWithEmailAndInitSession,
//   sendPasswordResetEmail,
// } from "../api/Firebase/firebaseIdentityService";
// import { callBackendLogin } from "../api/Springboot/backendUserService";
// import { clearRefreshToken } from "../api/Firebase/authStorage";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// import { getAuthErrorCode, toGreekAuthMessage } from "../utils/authErrorMessages";

// interface SignInFormProps {
//   onSignedIn?: (auth: AuthUserDto) => void;
// }

// const SignInForm: React.FC<SignInFormProps> = ({ onSignedIn }) => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("ken@example.com");
//   const [password, setPassword] = useState("Password123");
//   const [rememberMe, setRememberMe] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [resetLoading, setResetLoading] = useState(false);

//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setLoading(true);

//     try {
//       const result = await signInWithEmailAndInitSession({ email, password });
//       const authUser = await callBackendLogin();

//       if (!rememberMe) clearRefreshToken();

//       setSuccess(`Συνδέθηκες επιτυχώς ως ${result.email ?? email}`);

//       if (onSignedIn) onSignedIn(authUser);
//       navigate("/", { replace: true });
//     } catch (err: unknown) {
//       console.error(err);
//       setError(toGreekAuthMessage(err, "SIGN_IN"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     setError(null);
//     setSuccess(null);

//     const trimmedEmail = email.trim();
//     if (!trimmedEmail) {
//       setError("Συμπλήρωσε πρώτα το email σου για να σου στείλουμε link επαναφοράς.");
//       return;
//     }

//     setResetLoading(true);

//     const successText =
//       "Αν το email υπάρχει στο σύστημα, θα λάβεις μήνυμα επαναφοράς κωδικού.\n" +
//       "📬 Έλεγξε και τον φάκελο Spam / Junk.\n" +
//       "Αν δεν λάβεις τίποτα μέσα στα επόμενα λεπτά, επικοινώνησε στο bidnow@gmail.com.cy.";

//     try {
//       await sendPasswordResetEmail(trimmedEmail);
//       setSuccess(successText);
//     } catch (err: unknown) {
//       console.error("Forgot password error:", err);

//       const code = getAuthErrorCode(err).toUpperCase();

//       if (code.includes("INVALID_EMAIL") || code.includes("AUTH/INVALID-EMAIL")) {
//         setError(toGreekAuthMessage(err, "RESET_PASSWORD"));
//         setResetLoading(false);
//         return;
//       }

//       if (
//         code.includes("NETWORK") ||
//         code.includes("ERR_NETWORK") ||
//         code.includes("TIMEOUT") ||
//         code.includes("TOO_MANY") ||
//         code.includes("RATE_LIMIT") ||
//         code.includes("TRY_LATER")
//       ) {
//         setError(toGreekAuthMessage(err, "RESET_PASSWORD"));
//         setResetLoading(false);
//         return;
//       }

//       setSuccess(successText);
//     } finally {
//       setResetLoading(false);
//     }
//   };

//   const styles: Record<string, React.CSSProperties> = {
//     card: {
//       width: "min(560px, 92vw)", // ✅ Desktop/Laptop: ΜΗΝ το πειράξουμε
//       borderRadius: 22,
//       padding: "clamp(18px, 3vw, 28px)",
//       background: "rgba(173, 170, 170, 0.68)",
//       border: "1px solid rgba(255, 255, 255, 0.14)",
//       boxShadow: "0 20px 65px rgba(0,0,0,0.38)",
//       backdropFilter: "blur(22px) saturate(135%)",
//       WebkitBackdropFilter: "blur(22px) saturate(135%)",
//       color: "rgba(242, 251, 255, 0.96)",
//       position: "relative",
//       overflow: "hidden",
//     },
//     topGlow: {
//       content: '""',
//       position: "absolute",
//       inset: "0 0 auto 0",
//       height: 90,
//       background:
//         "radial-gradient(600px 90px at 50% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)",
//       pointerEvents: "none",
//     },
//     logoWrap: { display: "flex", justifyContent: "center", marginBottom: 14 },
//     logo: {
//       height: 90,
//       width: "auto",
//       objectFit: "contain",
//       filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.45))",
//     },
//     title: {
//       margin: "8px 0 6px",
//       textAlign: "center",
//       fontSize: "clamp(22px, 2.2vw, 30px)",
//       fontWeight: 900,
//       color: "rgba(255,255,255,0.95)",
//     },
//     subtitle: {
//       margin: "0 0 18px",
//       textAlign: "center",
//       fontSize: "0.95rem",
//       color: "rgba(230, 248, 255, 0.80)",
//     },

//     msgWrap: { display: "grid", gap: 10, margin: "10px 0 14px" },
//     msgBox: {
//       padding: "10px 12px",
//       borderRadius: 14,
//       border: "1px solid rgba(255,255,255,0.18)",
//       background: "rgba(0,0,0,0.18)",
//       backdropFilter: "blur(10px)",
//       WebkitBackdropFilter: "blur(10px)",
//       boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
//       display: "flex",
//       gap: 10,
//       alignItems: "flex-start",
//       whiteSpace: "pre-line",
//     },
//     msgIcon: { fontSize: 18, lineHeight: 1.2 },
//     msgText: { fontSize: "0.92rem", color: "rgba(242, 251, 255, 0.96)" },

//     field: {
//       display: "flex",
//       flexDirection: "column",
//       gap: 8,
//       marginBottom: 12,
//     },
//     label: {
//       fontSize: "0.85rem",
//       color: "rgba(235, 250, 255, 0.86)",
//       fontWeight: 800,
//     },
//     input: {
//       width: "100%",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.18)",
//       background: "rgba(255,255,255,0.10)",
//       color: "rgba(244, 252, 255, 0.96)",
//       outline: "none",
//       fontSize: "1rem",
//       transition:
//         "box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, transform 180ms ease",
//     },
//     row: {
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       gap: 10,
//       flexWrap: "wrap",
//       margin: "10px 0 14px",
//     },
//     checkboxLabel: {
//       display: "flex",
//       alignItems: "center",
//       gap: 10,
//       fontSize: "0.92rem",
//       color: "rgba(240, 252, 255, 0.84)",
//       userSelect: "none",
//     },
//     checkbox: { width: 18, height: 18, accentColor: "#1b63ff" },
//     linkBtn: {
//       border: "none",
//       background: "transparent",
//       color: "rgba(175, 235, 255, 0.95)",
//       cursor: "pointer",
//       padding: 0,
//       fontSize: "0.92rem",
//       textDecoration: "underline",
//       fontWeight: 800,
//     },
//     primaryBtn: {
//       width: "100%",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.18)",
//       background: "linear-gradient(90deg, #1b63ff, #00b3ff)",
//       color: "white",
//       fontWeight: 900,
//       fontSize: "1rem",
//       cursor: "pointer",
//       boxShadow: "0 14px 30px rgba(0, 150, 255, 0.30)",
//       transition: "transform 140ms ease, filter 140ms ease, box-shadow 140ms ease",
//     },
//     divider: {
//       display: "flex",
//       alignItems: "center",
//       gap: 12,
//       margin: "16px 0",
//       color: "rgba(255,255,255,0.65)",
//       fontSize: "0.85rem",
//     },
//     line: { height: 1, flex: 1, background: "rgba(255,255,255,0.22)" },
//     secondaryBtn: {
//       width: "100%",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "rgba(255,255,255,0.08)",
//       color: "rgba(244, 252, 255, 0.92)",
//       fontWeight: 900,
//       fontSize: "0.98rem",
//       cursor: "pointer",
//       transition: "background 140ms ease, border-color 140ms ease, transform 140ms ease",
//     },
//     bottomText: {
//       marginTop: 14,
//       textAlign: "center",
//       color: "rgba(240, 252, 255, 0.78)",
//       fontSize: "0.92rem",
//     },
//   };

//   return (
//     <AuthScaffold>
//       <style>{`
//         .bn-auth-outer{
//           padding: 24px 16px;
//           display:flex;
//           justify-content:center;
//           /* αφήνουμε το AuthScaffold background να φαίνεται */
//         }

//         .bn-auth-card { box-sizing: border-box; }
//         .bn-auth-input { box-sizing: border-box; }
//         .bn-auth-input::placeholder { color: rgba(224, 246, 255, 0.56); }

//         .bn-auth-input:focus {
//           border-color: rgba(0, 195, 255, 0.55);
//           background: rgba(255,255,255,0.12);
//           box-shadow: 0 0 0 4px rgba(0, 195, 255, 0.18);
//         }

//         .bn-primary:not(:disabled):hover {
//           transform: translateY(-1px);
//           filter: brightness(1.05);
//           box-shadow: 0 18px 36px rgba(0,150,255,0.34);
//         }

//         .bn-secondary:not(:disabled):hover {
//           transform: translateY(-1px);
//           background: rgba(255,255,255,0.10);
//           border-color: rgba(255,255,255,0.22);
//         }

//         /* ✅ Tablet (λίγο tighter, αλλά κρατάει το desktop size logic) */
//         @media (max-width: 900px) {
//           .bn-auth-outer{ padding: 22px 14px; }
//           .bn-auth-logo { height: 82px !important; }
//           .bn-auth-subtitle { margin-bottom: 14px !important; }
//         }

//         /* ✅ Mobile: αφήνουμε “αέρα” να φαίνεται background + πιο glass card */
//         @media (max-width: 520px) {
//           .bn-auth-outer{
//             padding: 18px 14px calc(18px + env(safe-area-inset-bottom));
//           }

//           .bn-auth-card{
//             width: min(420px, 86vw) !important;          /* ⬅️ πιο στενό για να φαίνεται background */
//             border-radius: 18px !important;
//             padding: 16px !important;
//             background: rgba(173, 170, 170, 0.52) !important; /* ⬅️ πιο διαφανές */
//             box-shadow: 0 18px 55px rgba(0,0,0,0.42) !important;
//           }

//           .bn-auth-logoWrap { margin-bottom: 10px !important; }
//           .bn-auth-logo { height: 64px !important; }

//           .bn-auth-title {
//             font-size: 24px !important;
//             margin: 6px 0 4px !important;
//           }
//           .bn-auth-subtitle {
//             font-size: 0.9rem !important;
//             margin-bottom: 12px !important;
//           }

//           .bn-auth-row {
//             flex-direction: column !important;
//             align-items: stretch !important;
//             justify-content: flex-start !important;
//             gap: 12px !important;
//           }

//           .bn-auth-linkBtn { align-self: flex-start !important; }
//           .bn-auth-divider { margin: 14px 0 !important; }
//         }

//         /* ✅ ΜΟΝΟ για mobile με μικρό ύψος (π.χ. keyboard) — ΟΧΙ laptop */
//         @media (max-width: 520px) and (max-height: 740px) {
//           .bn-auth-card{
//             max-height: calc(100vh - 28px) !important;
//             overflow: auto !important;
//           }
//         }
//       `}</style>

//       <div className="bn-auth-outer">
//         <div className="bn-auth-card" style={styles.card}>
//           <div style={styles.topGlow as React.CSSProperties} />

//           <div className="bn-auth-logoWrap" style={styles.logoWrap}>
//             <img
//               className="bn-auth-logo"
//               src="/images/websiteLogoFinal.png"
//               alt="BidNow Logo"
//               style={styles.logo}
//             />
//           </div>

//           <h2 className="bn-auth-title" style={styles.title}>
//             Welcome Back
//           </h2>
//           <p className="bn-auth-subtitle" style={styles.subtitle}>
//             Sign in to continue to Live Auction House
//           </p>

//           <form onSubmit={handleSubmit}>
//             <div style={styles.field}>
//               <label style={styles.label}>Email</label>
//               <input
//                 className="bn-auth-input"
//                 style={styles.input}
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="your.email@example.com"
//                 autoComplete="email"
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
//                 required
//                 placeholder="Enter your password"
//                 autoComplete="current-password"
//               />
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

//               <button
//                 className="bn-auth-linkBtn"
//                 type="button"
//                 onClick={handleForgotPassword}
//                 disabled={resetLoading}
//                 style={{
//                   ...styles.linkBtn,
//                   opacity: resetLoading ? 0.7 : 1,
//                   cursor: resetLoading ? "not-allowed" : "pointer",
//                 }}
//               >
//                 {resetLoading ? "Αποστολή..." : "Forgot password?"}
//               </button>
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

//             <button
//               className="bn-primary"
//               type="submit"
//               disabled={loading}
//               style={{
//                 ...styles.primaryBtn,
//                 opacity: loading ? 0.75 : 1,
//                 cursor: loading ? "not-allowed" : "pointer",
//               }}
//             >
//               {loading ? "Γίνεται σύνδεση..." : "Sign In"}
//             </button>

//             <div style={styles.bottomText}>Don't have an account?</div>

//             <button
//               className="bn-secondary"
//               type="button"
//               style={{ ...styles.secondaryBtn, marginTop: 10 }}
//               onClick={() => navigate("/signup")}
//             >
//               Create an Account
//             </button>

//             <div className="bn-auth-divider" style={styles.divider}>
//               <div style={styles.line} />
//               <div>Or</div>
//               <div style={styles.line} />
//             </div>

//             <button
//               className="bn-secondary"
//               type="button"
//               style={styles.secondaryBtn}
//               onClick={() => navigate("/")}
//             >
//               Continue as Guest
//             </button>
//           </form>
//         </div>
//       </div>
//     </AuthScaffold>
//   );
// };

// export default SignInForm;
// src/components/SignInForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthScaffold from "./AuthScaffold";

import {
  signInWithEmailAndInitSession,
  sendPasswordResetEmail,
} from "../api/Firebase/firebaseIdentityService";
import { callBackendLogin } from "../api/Springboot/backendUserService";
//import { clearRefreshToken } from "../api/Firebase/authStorage";
import type { AuthUserDto } from "../models/Springboot/UserEntity";

import { getAuthErrorCode, toGreekAuthMessage } from "../utils/authErrorMessages";

interface SignInFormProps {
  onSignedIn?: (auth: AuthUserDto) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSignedIn }) => {
  const navigate = useNavigate();

  // ✅ No prefilled values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await signInWithEmailAndInitSession({ email, password });
      const authUser = await callBackendLogin();

      //if (!rememberMe) clearRefreshToken();

      setSuccess(`Signed in successfully as ${result.email ?? email}`);

      if (onSignedIn) onSignedIn(authUser);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      console.error(err);
      setError(toGreekAuthMessage(err, "SIGN_IN")); // returns English now
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email first so we can send you a password reset link.");
      return;
    }

    setResetLoading(true);

    const successText =
      "If this email exists in our system, you’ll receive a password reset link shortly.\n" +
      "📬 Please also check your Spam / Junk folder.\n" +
      "If you don’t receive anything within a few minutes, contact support at bidnow@gmail.com.cy.";

    try {
      await sendPasswordResetEmail(trimmedEmail);
      setSuccess(successText);
    } catch (err: unknown) {
      console.error("Forgot password error:", err);

      const code = getAuthErrorCode(err).toUpperCase();

      // Invalid email / network / rate limit -> show friendly error
      if (code.includes("INVALID_EMAIL") || code.includes("AUTH/INVALID-EMAIL")) {
        setError(toGreekAuthMessage(err, "RESET_PASSWORD"));
        setResetLoading(false);
        return;
      }

      if (
        code.includes("NETWORK") ||
        code.includes("ERR_NETWORK") ||
        code.includes("TIMEOUT") ||
        code.includes("TOO_MANY") ||
        code.includes("RATE_LIMIT") ||
        code.includes("TRY_LATER")
      ) {
        setError(toGreekAuthMessage(err, "RESET_PASSWORD"));
        setResetLoading(false);
        return;
      }

      // Otherwise: keep privacy-friendly success
      setSuccess(successText);
    } finally {
      setResetLoading(false);
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    card: {
      width: "min(560px, 92vw)",
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
    topGlow: {
      content: '""',
      position: "absolute",
      inset: "0 0 auto 0",
      height: 90,
      background:
        "radial-gradient(600px 90px at 50% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)",
      pointerEvents: "none",
    },
    logoWrap: { display: "flex", justifyContent: "center", marginBottom: 14 },
    logo: {
      height: 90,
      width: "auto",
      objectFit: "contain",
      filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.45))",
    },
    title: {
      margin: "8px 0 6px",
      textAlign: "center",
      fontSize: "clamp(22px, 2.2vw, 30px)",
      fontWeight: 900,
      color: "rgba(255,255,255,0.95)",
    },
    subtitle: {
      margin: "0 0 18px",
      textAlign: "center",
      fontSize: "0.95rem",
      color: "rgba(230, 248, 255, 0.80)",
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

    field: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginBottom: 12,
    },
    label: {
      fontSize: "0.85rem",
      color: "rgba(235, 250, 255, 0.86)",
      fontWeight: 800,
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.10)",
      color: "rgba(244, 252, 255, 0.96)",
      outline: "none",
      fontSize: "1rem",
      transition:
        "box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, transform 180ms ease",
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
      color: "rgba(240, 252, 255, 0.84)",
      userSelect: "none",
    },
    checkbox: { width: 18, height: 18, accentColor: "#1b63ff" },
    linkBtn: {
      border: "none",
      background: "transparent",
      color: "rgba(175, 235, 255, 0.95)",
      cursor: "pointer",
      padding: 0,
      fontSize: "0.92rem",
      textDecoration: "underline",
      fontWeight: 800,
    },
    primaryBtn: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "linear-gradient(90deg, #1b63ff, #00b3ff)",
      color: "white",
      fontWeight: 900,
      fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 14px 30px rgba(0, 150, 255, 0.30)",
      transition: "transform 140ms ease, filter 140ms ease, box-shadow 140ms ease",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "16px 0",
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
      transition: "background 140ms ease, border-color 140ms ease, transform 140ms ease",
    },
    bottomText: {
      marginTop: 14,
      textAlign: "center",
      color: "rgba(240, 252, 255, 0.78)",
      fontSize: "0.92rem",
    },
  };

  return (
    <AuthScaffold>
      <style>{`
        .bn-auth-outer{
          padding: 24px 16px;
          display:flex;
          justify-content:center;
        }

        .bn-auth-card { box-sizing: border-box; }
        .bn-auth-input { box-sizing: border-box; }
        .bn-auth-input::placeholder { color: rgba(224, 246, 255, 0.56); }

        .bn-auth-input:focus {
          border-color: rgba(0, 195, 255, 0.55);
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 0 4px rgba(0, 195, 255, 0.18);
        }

        .bn-primary:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 18px 36px rgba(0,150,255,0.34);
        }

        .bn-secondary:not(:disabled):hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.22);
        }

        @media (max-width: 900px) {
          .bn-auth-outer{ padding: 22px 14px; }
          .bn-auth-logo { height: 82px !important; }
          .bn-auth-subtitle { margin-bottom: 14px !important; }
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

          .bn-auth-logoWrap { margin-bottom: 10px !important; }
          .bn-auth-logo { height: 64px !important; }

          .bn-auth-title {
            font-size: 24px !important;
            margin: 6px 0 4px !important;
          }
          .bn-auth-subtitle {
            font-size: 0.9rem !important;
            margin-bottom: 12px !important;
          }

          .bn-auth-row {
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            gap: 12px !important;
          }

          .bn-auth-linkBtn { align-self: flex-start !important; }
          .bn-auth-divider { margin: 14px 0 !important; }
        }

        @media (max-width: 520px) and (max-height: 740px) {
          .bn-auth-card{
            max-height: calc(100vh - 28px) !important;
            overflow: auto !important;
          }
        }
      `}</style>

      <div className="bn-auth-outer">
        <div className="bn-auth-card" style={styles.card}>
          <div style={styles.topGlow as React.CSSProperties} />

          <div className="bn-auth-logoWrap" style={styles.logoWrap}>
            <img
              className="bn-auth-logo"
              src="/images/websiteLogoFinal.png"
              alt="BidNow Logo"
              style={styles.logo}
            />
          </div>

          <h2 className="bn-auth-title" style={styles.title}>
            Welcome Back
          </h2>
          <p className="bn-auth-subtitle" style={styles.subtitle}>
            Sign in to continue to Live Auction House
          </p>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                className="bn-auth-input"
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                autoComplete="email"
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
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <div className="bn-auth-row" style={styles.row}>
              <label style={styles.checkboxLabel}>
                <input
                  style={styles.checkbox}
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me for 1 month
              </label>

              <button
                className="bn-auth-linkBtn"
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                style={{
                  ...styles.linkBtn,
                  opacity: resetLoading ? 0.7 : 1,
                  cursor: resetLoading ? "not-allowed" : "pointer",
                }}
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
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

            <button
              className="bn-primary"
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryBtn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div style={styles.bottomText}>Don't have an account?</div>

            <button
              className="bn-secondary"
              type="button"
              style={{ ...styles.secondaryBtn, marginTop: 10 }}
              onClick={() => navigate("/signup")}
            >
              Create an Account
            </button>

            <div className="bn-auth-divider" style={styles.divider}>
              <div style={styles.line} />
              <div>Or</div>
              <div style={styles.line} />
            </div>

            <button
              className="bn-secondary"
              type="button"
              style={styles.secondaryBtn}
              onClick={() => navigate("/")}
            >
              Continue as Guest
            </button>
          </form>
        </div>
      </div>
    </AuthScaffold>
  );
};

export default SignInForm;
