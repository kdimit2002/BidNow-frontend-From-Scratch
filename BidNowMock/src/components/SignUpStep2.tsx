// // // src/components/SignUpStep2.tsx
// // import React, { useState } from "react";
// // import AuthScaffold from "./AuthScaffold";
// // import { sendSignUpRequest, deleteUserAccount, logout } from "../api/Springboot/backendUserService";
// // import type {
// //   Avatar,
// //   Country,
// //   Region,
// //   SignUpRequest,
// //   RoleApiName,
// //   AuthUserDto,
// // } from "../models/Springboot/UserEntity";

// // interface SignUpStep2Props {
// //   region: Region;
// //   country: Country;
// //   firebaseUserId: string;
// //   displayName: string;
// //   onCompleted: (auth: AuthUserDto) => void;
// //   onBack: () => void;
// // }

// // const avatarImageMap: Record<Avatar, string> = {
// //   BEARD_MAN_AVATAR:
// //     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/BEARD_MAN_AVATAR.png",
// //   MAN_AVATAR:
// //     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/MAN_AVATAR.png",
// //   BLONDE_GIRL_AVATAR:
// //     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/BLONDE_GIRL_AVATAR.png",
// //   GIRL_AVATAR:
// //     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/GIRL_AVATAR.png",
// //   DEFAULT_AVATAR:
// //     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/DEFAULT_AVATAR.png",
// //   DEFAULT:
// //     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/DEFAULT_AVATAR.png",
// // };

// // const selectableAvatars: Avatar[] = [
// //   "BEARD_MAN_AVATAR",
// //   "MAN_AVATAR",
// //   "BLONDE_GIRL_AVATAR",
// //   "GIRL_AVATAR",
// //   "DEFAULT_AVATAR",
// // ];

// // const SignUpStep2: React.FC<SignUpStep2Props> = ({
// //   region,
// //   country,
// //   displayName,
// //   onCompleted,
// //   onBack,
// // }) => {
// //   const [roleName, setRoleName] = useState<RoleApiName>("Bidder");
// //   const [avatar, setAvatar] = useState<Avatar>("MAN_AVATAR");

// //   const [loading, setLoading] = useState(false);
// //   const [backLoading, setBackLoading] = useState(false);

// //   const [error, setError] = useState<string | null>(null);
// //   const [success, setSuccess] = useState<string | null>(null);

// //   const [showBackPopup, setShowBackPopup] = useState(false);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setError(null);
// //     setSuccess(null);
// //     setLoading(true);

// //     try {
// //       const request: SignUpRequest = {
// //         roleName,
// //         avatar,
// //         locationDto: { country, region },
// //       };

// //       const authUser = await sendSignUpRequest(request);

// //       setSuccess("Η εγγραφή στο backend ολοκληρώθηκε επιτυχώς!");
// //       onCompleted(authUser);
// //     } catch (err: unknown) {
// //       console.error(err);
// //       let message = "Κάτι πήγε στραβά κατά την αποστολή των στοιχείων στο backend.";
// //       if (err instanceof Error) message = err.message;
// //       setError(message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleConfirmBackAndDelete = async () => {
// //     setBackLoading(true);
// //     setError(null);
// //     setSuccess(null);

// //     try {
// //       // ✅ Ζήτησες: κάλεσε Springboot delete αντί Firebase delete
// //       await deleteUserAccount();

// //       // καθαρίζουμε session/tokens
// //       logout();

// //       // πίσω στο step 1
// //       setShowBackPopup(false);
// //       onBack();
// //     } catch (err: unknown) {
// //       console.error(err);
// //       let message = "Αποτυχία διαγραφής λογαριασμού.";
// //       if (err instanceof Error) message = err.message;
// //       setError(message);
// //     } finally {
// //       setBackLoading(false);
// //     }
// //   };

// //   const styles: Record<string, React.CSSProperties> = {
// //     card: {
// //       width: "min(560px, 92vw)",
// //       borderRadius: 22,
// //       padding: "clamp(18px, 3vw, 28px)",
// //       background: "rgba(173, 170, 170, 0.68)",
// //       border: "1px solid rgba(255, 255, 255, 0.14)",
// //       boxShadow: "0 20px 65px rgba(0,0,0,0.38)",
// //       backdropFilter: "blur(22px) saturate(135%)",
// //       WebkitBackdropFilter: "blur(22px) saturate(135%)",
// //       color: "rgba(242, 251, 255, 0.96)",
// //       position: "relative",
// //       overflow: "hidden",
// //     },
// //     headerRow: {
// //       display: "flex",
// //       alignItems: "center",
// //       justifyContent: "space-between",
// //       gap: 10,
// //       marginBottom: 10,
// //       flexWrap: "wrap",
// //     },
// //     backBtn: {
// //       padding: "10px 12px",
// //       borderRadius: 12,
// //       border: "1px solid rgba(255,255,255,0.16)",
// //       background: "rgba(255,255,255,0.08)",
// //       color: "rgba(244,252,255,0.92)",
// //       fontWeight: 900,
// //       cursor: "pointer",
// //     },
// //     logo: {
// //       height: 80,
// //       width: "auto",
// //       objectFit: "contain",
// //       filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
// //     },
// //     title: {
// //       margin: "6px 0 6px",
// //       fontSize: "clamp(22px, 2.2vw, 30px)",
// //       fontWeight: 900,
// //       color: "rgba(255,255,255,0.95)",
// //       textAlign: "center",
// //     },
// //     alert: {
// //       whiteSpace: "pre-line",
// //       padding: "10px 12px",
// //       borderRadius: 12,
// //       marginBottom: 12,
// //       fontSize: "0.92rem",
// //       border: "1px solid rgba(255,255,255,0.16)",
// //       background: "rgba(0,0,0,0.20)",
// //     },
// //     sectionTitle: {
// //       margin: "14px 0 10px",
// //       fontWeight: 900,
// //       color: "rgba(255,255,255,0.92)",
// //       fontSize: "1.05rem",
// //     },
// //     roleGrid: {
// //       display: "grid",
// //       gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
// //       gap: 14,
// //     },
// //     choiceCard: {
// //       textAlign: "left",
// //       borderRadius: 18,
// //       padding: 16,
// //       background: "rgba(255,255,255,0.08)",
// //       border: "1px solid rgba(255,255,255,0.14)",
// //       color: "rgba(244,252,255,0.95)",
// //       cursor: "pointer",
// //       width: "100%",
// //     },
// //     badge: {
// //       fontSize: "0.72rem",
// //       padding: "4px 10px",
// //       borderRadius: 999,
// //       background: "rgba(255,255,255,0.10)",
// //       border: "1px solid rgba(255,255,255,0.16)",
// //       color: "rgba(240,250,255,0.85)",
// //       fontWeight: 800,
// //     },
// //     choiceName: {
// //       margin: "0 0 6px",
// //       fontWeight: 900,
// //       fontSize: "1rem",
// //       color: "rgba(255,255,255,0.95)",
// //     },
// //     bullets: {
// //       margin: 0,
// //       paddingLeft: 18,
// //       color: "rgba(235, 248, 255, 0.78)",
// //       fontSize: "0.9rem",
// //       lineHeight: 1.55,
// //     },
// //     avatarGrid: {
// //       display: "grid",
// //       gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
// //       gap: 10,
// //       marginTop: 10,
// //     },
// //     avatarBtn: {
// //       borderRadius: 16,
// //       padding: 10,
// //       background: "rgba(255,255,255,0.07)",
// //       border: "1px solid rgba(255,255,255,0.14)",
// //       cursor: "pointer",
// //       display: "flex",
// //       flexDirection: "column",
// //       alignItems: "center",
// //       gap: 8,
// //       width: "100%",
// //     },
// //     avatarImg: {
// //       width: 56,
// //       height: 56,
// //       borderRadius: "50%",
// //       objectFit: "cover",
// //       boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
// //       border: "1px solid rgba(255,255,255,0.14)",
// //       background: "rgba(0,0,0,0.15)",
// //     },
// //     footer: {
// //       marginTop: 18,
// //       display: "flex",
// //       flexDirection: "column",
// //       gap: 10,
// //       alignItems: "center",
// //     },
// //     primaryBtn: {
// //       width: "min(520px, 100%)",
// //       padding: "12px 14px",
// //       borderRadius: 12,
// //       border: "1px solid rgba(255,255,255,0.16)",
// //       background: "#2a7cff",
// //       color: "white",
// //       fontWeight: 900,
// //       fontSize: "1rem",
// //       cursor: "pointer",
// //       boxShadow: "0 10px 22px rgba(42,124,255,0.30)",
// //     },

// //     // popup
// //     overlay: {
// //       position: "fixed",
// //       inset: 0,
// //       backgroundColor: "rgba(0,0,0,0.55)",
// //       backdropFilter: "blur(6px)",
// //       display: "flex",
// //       alignItems: "center",
// //       justifyContent: "center",
// //       zIndex: 999,
// //       padding: 16,
// //     },
// //     popup: {
// //       width: "min(560px, 92vw)",
// //       borderRadius: 18,
// //       padding: "18px 18px",
// //       background: "rgba(18, 86, 108, 0.55)",
// //       border: "1px solid rgba(255,255,255,0.16)",
// //       boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
// //       color: "rgba(242, 251, 255, 0.96)",
// //       backdropFilter: "blur(18px) saturate(130%)",
// //       WebkitBackdropFilter: "blur(18px) saturate(130%)",
// //     },
// //     popupRow: {
// //       marginTop: 14,
// //       display: "flex",
// //       gap: 10,
// //       justifyContent: "flex-end",
// //       flexWrap: "wrap",
// //     },
// //     dangerBtn: {
// //       padding: "10px 14px",
// //       borderRadius: 12,
// //       border: "1px solid rgba(255,80,80,0.35)",
// //       background: "rgba(255,80,80,0.10)",
// //       color: "rgba(255,210,210,0.95)",
// //       fontWeight: 900,
// //       cursor: "pointer",
// //     },
// //     ghostBtn: {
// //       padding: "10px 14px",
// //       borderRadius: 12,
// //       border: "1px solid rgba(255,255,255,0.16)",
// //       background: "rgba(255,255,255,0.08)",
// //       color: "rgba(244,252,255,0.92)",
// //       fontWeight: 900,
// //       cursor: "pointer",
// //     },
// //   };

// //   const roleIsBidder = roleName === "Bidder";
// //   const roleIsAuctioneer = roleName === "Auctioneer";

// //   return (
// //     <AuthScaffold>
// //       <style>{`
// //         @media (max-width: 780px) {
// //           .bn-role-grid { grid-template-columns: 1fr; }
// //           .bn-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
// //         }
// //         @media (max-width: 420px) {
// //           .bn-avatar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
// //         }
// //       `}</style>

// //       <div style={styles.card}>
// //         <div style={styles.headerRow}>
// //           <button
// //             type="button"
// //             style={{ ...styles.backBtn, opacity: backLoading ? 0.7 : 1, cursor: backLoading ? "not-allowed" : "pointer" }}
// //             disabled={backLoading || loading}
// //             onClick={() => setShowBackPopup(true)}
// //           >
// //             ← Back
// //           </button>

// //           <img src="/images/websiteLogoFinal.png" alt="BidNow" style={styles.logo} />
// //         </div>

// //         <h2 style={styles.title}>Welcome {displayName || "there"}</h2>

// //         {error && (
// //           <div style={{ ...styles.alert, borderColor: "rgba(255,80,80,0.35)" }}>
// //             <strong>Σφάλμα:</strong> {error}
// //           </div>
// //         )}
// //         {success && (
// //           <div style={{ ...styles.alert, borderColor: "rgba(80,255,170,0.28)" }}>
// //             <strong>OK:</strong> {success}
// //           </div>
// //         )}

// //         <div style={styles.sectionTitle}>Select a role</div>

// //         <div className="bn-role-grid" style={styles.roleGrid}>
// //           <button
// //             type="button"
// //             onClick={() => setRoleName("Bidder")}
// //             aria-pressed={roleIsBidder}
// //             style={{
// //               ...styles.choiceCard,
// //               border: roleIsBidder ? "2px solid rgba(42,124,255,0.75)" : styles.choiceCard.border,
// //               background: roleIsBidder ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.08)",
// //             }}
// //           >
// //             <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
// //               <div style={styles.badge}>Recommended for buyers</div>
// //             </div>
// //             <div style={styles.choiceName}>Bidder</div>
// //             <ul style={styles.bullets}>
// //               <li>Bid on auctions</li>
// //               <li>Chat in auctions</li>
// //               <li>Upgrade to auctioneer later</li>
// //             </ul>
// //           </button>

// //           <button
// //             type="button"
// //             onClick={() => setRoleName("Auctioneer")}
// //             aria-pressed={roleIsAuctioneer}
// //             style={{
// //               ...styles.choiceCard,
// //               border: roleIsAuctioneer ? "2px solid rgba(42,124,255,0.75)" : styles.choiceCard.border,
// //               background: roleIsAuctioneer ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.08)",
// //             }}
// //           >
// //             <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
// //               <div style={styles.badge}>For sellers & buyers</div>
// //             </div>
// //             <div style={styles.choiceName}>Auctioneer</div>
// //             <ul style={styles.bullets}>
// //               <li>Create auctions</li>
// //               <li>Also bid on other auctions</li>
// //               <li style={{ listStyle: "none", opacity: 0.0 }}>.</li>
// //             </ul>
// //           </button>
// //         </div>

// //         <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Choose an avatar</div>

// //         <div className="bn-avatar-grid" style={styles.avatarGrid}>
// //           {selectableAvatars.map((av) => {
// //             const imgSrc = avatarImageMap[av];
// //             const isSelected = avatar === av;

// //             return (
// //               <button
// //                 key={av}
// //                 type="button"
// //                 onClick={() => setAvatar(av)}
// //                 aria-pressed={isSelected}
// //                 style={{
// //                   ...styles.avatarBtn,
// //                   border: isSelected ? "2px solid rgba(42,124,255,0.78)" : "1px solid rgba(255,255,255,0.14)",
// //                   background: isSelected ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.07)",
// //                 }}
// //               >
// //                 <img src={imgSrc} alt={av} style={styles.avatarImg} />
// //               </button>
// //             );
// //           })}
// //         </div>

// //         <form onSubmit={handleSubmit} style={styles.footer}>
// //           <button
// //             type="submit"
// //             disabled={loading || backLoading}
// //             style={{
// //               ...styles.primaryBtn,
// //               opacity: loading ? 0.78 : 1,
// //               cursor: loading ? "not-allowed" : "pointer",
// //             }}
// //           >
// //             {loading ? "Αποστολή..." : "Complete Sign Up"}
// //           </button>
// //         </form>
// //       </div>

// //       {/* ✅ Back popup */}
// //       {showBackPopup && (
// //         <div style={styles.overlay}>
// //           <div style={styles.popup}>
// //             <h3 style={{ margin: "0 0 8px" }}>Είσαι σίγουρος;</h3>
// //             <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)" }}>
// //               Αν πατήσεις <strong>Yes</strong>, θα επιστρέψεις στο Step 1.
// //             </p>

// //             <div style={styles.popupRow}>
// //               <button
// //                 type="button"
// //                 onClick={() => setShowBackPopup(false)}
// //                 disabled={backLoading}
// //                 style={{
// //                   ...styles.ghostBtn,
// //                   opacity: backLoading ? 0.75 : 1,
// //                   cursor: backLoading ? "not-allowed" : "pointer",
// //                 }}
// //               >
// //                 Cancel
// //               </button>

// //               <button
// //                 type="button"
// //                 onClick={handleConfirmBackAndDelete}
// //                 disabled={backLoading}
// //                 style={{
// //                   ...styles.dangerBtn,
// //                   opacity: backLoading ? 0.75 : 1,
// //                   cursor: backLoading ? "not-allowed" : "pointer",
// //                 }}
// //               >
// //                 {backLoading ? "Returning..." : "Yes, return"}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </AuthScaffold>
// //   );
// // };

// // export default SignUpStep2;
// // src/components/SignUpStep2.tsx
// // src/components/SignUpStep2.tsx
// import React, { useState } from "react";
// import AuthScaffold from "./AuthScaffold";
// import { sendSignUpRequest, deleteUserAccount, logout } from "../api/Springboot/backendUserService";

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
//   firebaseUserId: string; // (κρατιέται για συμβατότητα, δεν χρησιμοποιείται εδώ)
//   displayName: string;
//   onCompleted: (auth: AuthUserDto) => void;
//   onBack: () => void;
// }

// const avatarImageMap: Record<Avatar, string> = {
//   BEARD_MAN_AVATAR:
//     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/BEARD_MAN_AVATAR.png",
//   MAN_AVATAR:
//     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/MAN_AVATAR.png",
//   BLONDE_GIRL_AVATAR:
//     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/BLONDE_GIRL_AVATAR.png",
//   GIRL_AVATAR:
//     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/GIRL_AVATAR.png",
//   DEFAULT_AVATAR:
//     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/DEFAULT_AVATAR.png",
//   DEFAULT:
//     "https://pub-6cd4fca3122d4e93bf79326e6762f99e.r2.dev/images/Avatars/DEFAULT_AVATAR.png",
// };

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
//   displayName,
//   onCompleted,
//   onBack,
// }) => {
//   const [roleName, setRoleName] = useState<RoleApiName>("Bidder");
//   const [avatar, setAvatar] = useState<Avatar>("MAN_AVATAR");

//   const [loading, setLoading] = useState(false);
//   const [backLoading, setBackLoading] = useState(false);

//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const [showBackPopup, setShowBackPopup] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setLoading(true);

//     try {
//       const request: SignUpRequest = {
//         roleName,
//         avatar,
//         locationDto: { country, region },
//       };

//       const authUser = await sendSignUpRequest(request);

//       setSuccess("Η εγγραφή στο backend ολοκληρώθηκε επιτυχώς!");
//       onCompleted(authUser);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά την αποστολή των στοιχείων στο backend.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBackClick = () => {
//     if (loading || backLoading) return;
//     setShowBackPopup(true);
//   };

//   const handleBackCancel = () => {
//     if (backLoading) return;
//     setShowBackPopup(false);
//   };

//   const handleConfirmBackAndDelete = async () => {
//     setBackLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       // ✅ delete μέσω Springboot
//       await deleteUserAccount();

//       // καθαρίζουμε session/tokens
//       logout();

//       setShowBackPopup(false);
//       onBack();
//     } catch (err: unknown) {
//       console.error("Delete user account on back failed:", err);
//       let message = "Αποτυχία διαγραφής λογαριασμού.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setBackLoading(false);
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
//     header: { textAlign: "center", marginBottom: 14 },
//     logo: {
//       height: 80,
//       width: "auto",
//       objectFit: "contain",
//       filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
//       marginBottom: 10,
//     },
//     title: {
//       margin: "6px 0 6px",
//       fontSize: "clamp(22px, 2.2vw, 30px)",
//       fontWeight: 900,
//       color: "rgba(255,255,255,0.95)",
//     },
//     subtitle: {
//       margin: 0,
//       fontSize: "0.98rem",
//       color: "rgba(255,255,255,0.72)",
//     },
//     alert: {
//       whiteSpace: "pre-line",
//       padding: "10px 12px",
//       borderRadius: 12,
//       marginBottom: 12,
//       fontSize: "0.92rem",
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "rgba(0,0,0,0.20)",
//     },
//     sectionTitle: {
//       margin: "14px 0 10px",
//       fontWeight: 900,
//       color: "rgba(255,255,255,0.92)",
//       fontSize: "1.05rem",
//     },
//     roleGrid: {
//       display: "grid",
//       gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//       gap: 14,
//     },
//     choiceCard: {
//       textAlign: "left",
//       borderRadius: 18,
//       padding: 16,
//       background: "rgba(255,255,255,0.08)",
//       border: "1px solid rgba(255,255,255,0.14)",
//       color: "rgba(244,252,255,0.95)",
//       cursor: "pointer",
//       width: "100%",
//     },

//     // ✅ icon + title row
//     roleTitleRow: {
//       display: "flex",
//       alignItems: "center",
//       gap: 10,
//       marginBottom: 6,
//     },
//     roleIcon: {
//       width: 22,
//       height: 22,
//       objectFit: "contain",
//       filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
//     },

//     choiceName: {
//       margin: 0,
//       fontWeight: 900,
//       fontSize: "1rem",
//       color: "rgba(255,255,255,0.95)",
//     },
//     bullets: {
//       margin: 0,
//       paddingLeft: 18,
//       color: "rgba(235, 248, 255, 0.78)",
//       fontSize: "0.9rem",
//       lineHeight: 1.55,
//     },
//     avatarGrid: {
//       display: "grid",
//       gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
//       gap: 10,
//       marginTop: 10,
//     },
//     avatarBtn: {
//       borderRadius: 16,
//       padding: 10,
//       background: "rgba(255,255,255,0.07)",
//       border: "1px solid rgba(255,255,255,0.14)",
//       cursor: "pointer",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       gap: 8,
//       width: "100%",
//     },
//     avatarImg: {
//       width: 56,
//       height: 56,
//       borderRadius: "50%",
//       objectFit: "cover",
//       boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
//       border: "1px solid rgba(255,255,255,0.14)",
//       background: "rgba(0,0,0,0.15)",
//     },
//     footer: {
//       marginTop: 0,
//       display: "flex",
//       flexDirection: "column",
//       gap: 10,
//       alignItems: "center",
//     },
//     primaryBtn: {
//       width: "min(520px, 100%)",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "#2a7cff",
//       color: "white",
//       fontWeight: 900,
//       fontSize: "1rem",
//       cursor: "pointer",
//       boxShadow: "0 10px 22px rgba(42,124,255,0.30)",
//     },
//     secondaryBtn: {
//       width: "min(520px, 100%)",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "rgba(255,255,255,0.08)",
//       color: "rgba(244, 252, 255, 0.92)",
//       fontWeight: 900,
//       fontSize: "0.98rem",
//       cursor: "pointer",
//     },

//     // popup
//     overlay: {
//       position: "fixed",
//       inset: 0,
//       backgroundColor: "rgba(0,0,0,0.55)",
//       backdropFilter: "blur(6px)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 999,
//       padding: 16,
//     },
//     popup: {
//       width: "min(520px, 92vw)",
//       borderRadius: 18,
//       padding: 18,
//       background: "rgba(18, 86, 108, 0.55)",
//       border: "1px solid rgba(255,255,255,0.16)",
//       boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
//       color: "rgba(242, 251, 255, 0.96)",
//       backdropFilter: "blur(18px) saturate(130%)",
//       WebkitBackdropFilter: "blur(18px) saturate(130%)",
//     },
//     popupRow: {
//       marginTop: 14,
//       display: "flex",
//       gap: 10,
//       justifyContent: "flex-end",
//       flexWrap: "wrap",
//     },
//     dangerBtn: {
//       padding: "10px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,80,80,0.35)",
//       background: "rgba(255,80,80,0.10)",
//       color: "rgba(255,210,210,0.95)",
//       fontWeight: 900,
//       cursor: "pointer",
//     },
//     ghostBtn: {
//       padding: "10px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "rgba(255,255,255,0.08)",
//       color: "rgba(244,252,255,0.92)",
//       fontWeight: 900,
//       cursor: "pointer",
//     },
//   };

//   const roleIsBidder = roleName === "Bidder";
//   const roleIsAuctioneer = roleName === "Auctioneer";

//   return (
//     <AuthScaffold>
//       <style>{`
//         @media (max-width: 780px) {
//           .bn-role-grid { grid-template-columns: 1fr; }
//           .bn-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
//         }
//         @media (max-width: 420px) {
//           .bn-avatar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
//         }
//       `}</style>

//       <div style={styles.card}>
//         <div style={styles.header}>
//           <img src="/images/websiteLogoFinal.png" alt="BidNow" style={styles.logo} />
//           <h2 style={styles.title}>Welcome {displayName || "there"}!</h2>
//         </div>

//         {error && (
//           <div style={{ ...styles.alert, borderColor: "rgba(255,80,80,0.35)" }}>
//             <strong>Σφάλμα:</strong> {error}
//           </div>
//         )}
//         {success && (
//           <div style={{ ...styles.alert, borderColor: "rgba(80,255,170,0.28)" }}>
//             <strong>OK:</strong> {success}
//           </div>
//         )}

//         <div style={styles.sectionTitle}>Select a role</div>
//         <div className="bn-role-grid" style={styles.roleGrid}>
//           <button
//             type="button"
//             onClick={() => setRoleName("Bidder")}
//             aria-pressed={roleIsBidder}
//             style={{
//               ...styles.choiceCard,
//               border: roleIsBidder ? "2px solid rgba(42,124,255,0.75)" : styles.choiceCard.border,
//               background: roleIsBidder ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.08)",
//             }}
//           >
//             <div style={styles.roleTitleRow}>
//               <img src="/images/bid.png" alt="Bidder icon" style={styles.roleIcon} />
//               <div style={styles.choiceName}>Bidder</div>
//             </div>
//             <ul style={styles.bullets}>
//               <li>Bid on auctions</li>
//               <li>Chat in auctions</li>
//               <li>Upgrade to auctioneer later</li>
//             </ul>
//           </button>

//           <button
//             type="button"
//             onClick={() => setRoleName("Auctioneer")}
//             aria-pressed={roleIsAuctioneer}
//             style={{
//               ...styles.choiceCard,
//               border: roleIsAuctioneer ? "2px solid rgba(42,124,255,0.75)" : styles.choiceCard.border,
//               background: roleIsAuctioneer ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.08)",
//             }}
//           >
//             <div style={styles.roleTitleRow}>
//               <img src="/images/auction.png" alt="Auctioneer icon" style={styles.roleIcon} />
//               <div style={styles.choiceName}>Auctioneer</div>
//             </div>
//             <ul style={styles.bullets}>
//               <li>Create auctions</li>
//               <li>Also bid on other auctions</li>
//               <li style={{ listStyle: "none", opacity: 0.0 }}>.</li>
//             </ul>
//           </button>
//         </div>

//         <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Choose an avatar</div>
//         <div className="bn-avatar-grid" style={styles.avatarGrid}>
//           {selectableAvatars.map((av) => {
//             const imgSrc = avatarImageMap[av];
//             const isSelected = avatar === av;

//             return (
//               <button
//                 key={av}
//                 type="button"
//                 onClick={() => setAvatar(av)}
//                 aria-pressed={isSelected}
//                 style={{
//                   ...styles.avatarBtn,
//                   border: isSelected ? "2px solid rgba(42,124,255,0.78)" : "1px solid rgba(255,255,255,0.14)",
//                   background: isSelected ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.07)",
//                 }}
//               >
//                 <img src={imgSrc} alt={av} style={styles.avatarImg} />
//               </button>
//             );
//           })}
//         </div>

//         {/* ✅ Back κουμπί πάνω από το Complete Sign Up */}
//         <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
//           <button
//             type="button"
//             onClick={handleBackClick}
//             disabled={loading || backLoading}
//             style={{
//               ...styles.secondaryBtn,
//               opacity: loading || backLoading ? 0.75 : 1,
//               cursor: loading || backLoading ? "not-allowed" : "pointer",
//             }}
//           >
//             Back
//           </button>

//           <form onSubmit={handleSubmit} style={styles.footer}>
//             <button
//               type="submit"
//               disabled={loading || backLoading}
//               style={{
//                 ...styles.primaryBtn,
//                 opacity: loading || backLoading ? 0.78 : 1,
//                 cursor: loading || backLoading ? "not-allowed" : "pointer",
//               }}
//             >
//               {loading ? "Αποστολή..." : "Complete Sign Up"}
//             </button>
//           </form>
//         </div>

//         {/* ✅ Popup confirm για Back + delete (Springboot) */}
//         {showBackPopup && (
//           <div style={styles.overlay}>
//             <div style={styles.popup}>
//               <h3 style={{ margin: "0 0 8px" }}>Είσαι σίγουρος;</h3>
//               <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)" }}>
//                 Αν πατήσεις <strong>Yes</strong>, θα διαγράψουμε τον λογαριασμό από το backend και θα σε γυρίσουμε στο Step 1.
//               </p>

//               <div style={styles.popupRow}>
//                 <button
//                   type="button"
//                   onClick={handleBackCancel}
//                   disabled={backLoading}
//                   style={{
//                     ...styles.ghostBtn,
//                     opacity: backLoading ? 0.75 : 1,
//                     cursor: backLoading ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleConfirmBackAndDelete}
//                   disabled={backLoading}
//                   style={{
//                     ...styles.dangerBtn,
//                     opacity: backLoading ? 0.75 : 1,
//                     cursor: backLoading ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   {backLoading ? "Returning..." : "Yes, return"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </AuthScaffold>
//   );
// };

// export default SignUpStep2;
// // src/components/SignUpStep2.tsx
// import React, { useState } from "react";
// import AuthScaffold from "./AuthScaffold";
// import { sendSignUpRequest, deleteUserAccount, logout } from "../api/Springboot/backendUserService";

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
//   firebaseUserId: string; // (κρατιέται για συμβατότητα, δεν χρησιμοποιείται εδώ)
//   displayName: string;
//   onCompleted: (auth: AuthUserDto) => void;
//   onBack: () => void;
// }

// const avatarImageMap: Record<Avatar, string> = {
//   BEARD_MAN_AVATAR:
//     "/images/BEARD_MAN_AVATAR.png",
//   MAN_AVATAR:
//     "/images/MAN_AVATAR.png",
//   BLONDE_GIRL_AVATAR:
//     "/images/BLONDE_GIRL_AVATAR.png",
//   GIRL_AVATAR:
//     "/images/GIRL_AVATAR.png",
//   DEFAULT_AVATAR:
//     "/images/DEFAULT_AVATAR.png",
//   DEFAULT:
//     "/images/DEFAULT_AVATAR.png",
// };

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
//   displayName,
//   onCompleted,
//   onBack,
// }) => {
//   const [roleName, setRoleName] = useState<RoleApiName>("Bidder");
//   const [avatar, setAvatar] = useState<Avatar>("MAN_AVATAR");

//   const [loading, setLoading] = useState(false);
//   const [backLoading, setBackLoading] = useState(false);

//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const [showBackPopup, setShowBackPopup] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setLoading(true);

//     try {
//       const request: SignUpRequest = {
//         roleName,
//         avatar,
//         locationDto: { country, region },
//       };

//       const authUser = await sendSignUpRequest(request);

//       setSuccess("Η εγγραφή στο backend ολοκληρώθηκε επιτυχώς!");
//       onCompleted(authUser);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά την αποστολή των στοιχείων στο backend.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBackClick = () => {
//     if (loading || backLoading) return;
//     setShowBackPopup(true);
//   };

//   const handleBackCancel = () => {
//     if (backLoading) return;
//     setShowBackPopup(false);
//   };

//   const handleConfirmBackAndDelete = async () => {
//     setBackLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       // ✅ delete μέσω Springboot
//       await deleteUserAccount();

//       // καθαρίζουμε session/tokens
//       logout();

//       setShowBackPopup(false);
//       onBack();
//     } catch (err: unknown) {
//       console.error("Delete user account on back failed:", err);
//       let message = "Αποτυχία διαγραφής λογαριασμού.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setBackLoading(false);
//     }
//   };

//   const styles: Record<string, React.CSSProperties> = {
//     card: {
//       width: "min(560px, 92vw)", // ✅ desktop/laptop μένει ίδιο
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
//     header: { textAlign: "center", marginBottom: 14 },
//     logo: {
//       height: 80,
//       width: "auto",
//       objectFit: "contain",
//       filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
//       marginBottom: 10,
//     },
//     title: {
//       margin: "6px 0 6px",
//       fontSize: "clamp(22px, 2.2vw, 30px)",
//       fontWeight: 900,
//       color: "rgba(255,255,255,0.95)",
//     },
//     subtitle: {
//       margin: 0,
//       fontSize: "0.98rem",
//       color: "rgba(255,255,255,0.72)",
//     },
//     alert: {
//       whiteSpace: "pre-line",
//       padding: "10px 12px",
//       borderRadius: 12,
//       marginBottom: 12,
//       fontSize: "0.92rem",
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "rgba(0,0,0,0.20)",
//     },
//     sectionTitle: {
//       margin: "14px 0 10px",
//       fontWeight: 900,
//       color: "rgba(255,255,255,0.92)",
//       fontSize: "1.05rem",
//     },
//     roleGrid: {
//       display: "grid",
//       gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//       gap: 14,
//     },
//     choiceCard: {
//       textAlign: "left",
//       borderRadius: 18,
//       padding: 16,
//       background: "rgba(255,255,255,0.08)",
//       border: "1px solid rgba(255,255,255,0.14)",
//       color: "rgba(244,252,255,0.95)",
//       cursor: "pointer",
//       width: "100%",
//       transition: "transform 140ms ease, background 140ms ease, border-color 140ms ease",
//     },
//     roleTitleRow: {
//       display: "flex",
//       alignItems: "center",
//       gap: 10,
//       marginBottom: 6,
//     },
//     roleIcon: {
//       width: 22,
//       height: 22,
//       objectFit: "contain",
//       filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
//     },
//     choiceName: {
//       margin: 0,
//       fontWeight: 900,
//       fontSize: "1rem",
//       color: "rgba(255,255,255,0.95)",
//     },
//     bullets: {
//       margin: 0,
//       paddingLeft: 18,
//       color: "rgba(235, 248, 255, 0.78)",
//       fontSize: "0.9rem",
//       lineHeight: 1.55,
//     },
//     avatarGrid: {
//       display: "grid",
//       gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
//       gap: 10,
//       marginTop: 10,
//     },
//     avatarBtn: {
//       borderRadius: 16,
//       padding: 10,
//       background: "rgba(255,255,255,0.07)",
//       border: "1px solid rgba(255,255,255,0.14)",
//       cursor: "pointer",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       gap: 8,
//       width: "100%",
//       transition: "transform 140ms ease, background 140ms ease, border-color 140ms ease",
//     },
//     avatarImg: {
//       width: 56,
//       height: 56,
//       borderRadius: "50%",
//       objectFit: "cover",
//       boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
//       border: "1px solid rgba(255,255,255,0.14)",
//       background: "rgba(0,0,0,0.15)",
//     },
//     footer: {
//       marginTop: 0,
//       display: "flex",
//       flexDirection: "column",
//       gap: 10,
//       alignItems: "center",
//     },
//     primaryBtn: {
//       width: "min(520px, 100%)",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "#2a7cff",
//       color: "white",
//       fontWeight: 900,
//       fontSize: "1rem",
//       cursor: "pointer",
//       boxShadow: "0 10px 22px rgba(42,124,255,0.30)",
//       transition: "transform 140ms ease, filter 140ms ease, box-shadow 140ms ease",
//     },
//     secondaryBtn: {
//       width: "min(520px, 100%)",
//       padding: "12px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "rgba(255,255,255,0.08)",
//       color: "rgba(244, 252, 255, 0.92)",
//       fontWeight: 900,
//       fontSize: "0.98rem",
//       cursor: "pointer",
//       transition: "transform 140ms ease, background 140ms ease, border-color 140ms ease",
//     },

//     overlay: {
//       position: "fixed",
//       inset: 0,
//       backgroundColor: "rgba(0,0,0,0.55)",
//       backdropFilter: "blur(6px)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 999,
//       padding: 16,
//     },
//     popup: {
//       width: "min(520px, 92vw)",
//       borderRadius: 18,
//       padding: 18,
//       background: "rgba(18, 86, 108, 0.55)",
//       border: "1px solid rgba(255,255,255,0.16)",
//       boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
//       color: "rgba(242, 251, 255, 0.96)",
//       backdropFilter: "blur(18px) saturate(130%)",
//       WebkitBackdropFilter: "blur(18px) saturate(130%)",
//     },
//     popupRow: {
//       marginTop: 14,
//       display: "flex",
//       gap: 10,
//       justifyContent: "flex-end",
//       flexWrap: "wrap",
//     },
//     dangerBtn: {
//       padding: "10px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,80,80,0.35)",
//       background: "rgba(255,80,80,0.10)",
//       color: "rgba(255,210,210,0.95)",
//       fontWeight: 900,
//       cursor: "pointer",
//     },
//     ghostBtn: {
//       padding: "10px 14px",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.16)",
//       background: "rgba(255,255,255,0.08)",
//       color: "rgba(244,252,255,0.92)",
//       fontWeight: 900,
//       cursor: "pointer",
//     },
//   };

//   const roleIsBidder = roleName === "Bidder";
//   const roleIsAuctioneer = roleName === "Auctioneer";

//   return (
//     <AuthScaffold>
//       <style>{`
//         /* ✅ Outer padding για να φαίνεται το background σε κινητό/tablet */
//         .bn-auth-outer{
//           padding: 24px 16px;
//           display:flex;
//           justify-content:center;
//           align-items:flex-start;
//         }
//         .bn-auth-card, .bn-auth-choice, .bn-auth-avatar { box-sizing: border-box; }

//         /* Hover/active feel (desktop) */
//         .bn-auth-choice:hover,
//         .bn-auth-avatar:hover{
//           transform: translateY(-1px);
//         }

//         /* ✅ Tablet */
//         @media (max-width: 900px) {
//           .bn-auth-outer{ padding: 22px 14px; }
//           .bn-auth-logo{ height: 72px !important; }
//           .bn-avatar-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
//         }

//         /* ✅ Small tablet / big phones */
//         @media (max-width: 780px) {
//           .bn-role-grid { grid-template-columns: 1fr !important; }
//           .bn-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
//         }

//         /* ✅ Mobile: πιο στενή κάρτα + πιο “glass” για να φαίνεται background */
//         @media (max-width: 520px) {
//           .bn-auth-outer{
//             padding: 18px 14px calc(18px + env(safe-area-inset-bottom));
//           }

//           .bn-auth-card{
//             width: min(440px, 86vw) !important;
//             border-radius: 18px !important;
//             padding: 16px !important;
//             background: rgba(173, 170, 170, 0.52) !important;
//             box-shadow: 0 18px 55px rgba(0,0,0,0.42) !important;
//           }

//           .bn-auth-logo{ height: 62px !important; }
//           .bn-avatar-grid { gap: 10px !important; }
//           .bn-auth-avatar{ padding: 12px !important; border-radius: 16px !important; }
//           .bn-auth-avatar img{ width: 60px !important; height: 60px !important; }
//         }

//         @media (max-width: 420px) {
//           .bn-avatar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
//         }

//         /* ✅ Scroll ΜΟΝΟ σε mobile + μικρό ύψος (keyboard). ΟΧΙ σε laptop */
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

//         /* ✅ Popup overlay πιο safe σε mobile */
//         @media (max-width: 520px) {
//           .bn-auth-overlay{
//             padding: 14px !important;
//             padding-bottom: calc(14px + env(safe-area-inset-bottom)) !important;
//           }
//         }
//       `}</style>

//       <div className="bn-auth-outer">
//         <div className="bn-auth-card" style={styles.card}>
//           <div style={styles.header}>
//             <img
//               className="bn-auth-logo"
//               src="/images/websiteLogoFinal.png"
//               alt="BidNow"
//               style={styles.logo}
//             />
//             <h2 style={styles.title}>Welcome {displayName || "there"}!</h2>
//             <p style={styles.subtitle}>Finish setup to start using BidNow</p>
//           </div>

//           {error && (
//             <div style={{ ...styles.alert, borderColor: "rgba(255,80,80,0.35)" }}>
//               <strong>Σφάλμα:</strong> {error}
//             </div>
//           )}
//           {success && (
//             <div style={{ ...styles.alert, borderColor: "rgba(80,255,170,0.28)" }}>
//               <strong>OK:</strong> {success}
//             </div>
//           )}

//           <div style={styles.sectionTitle}>Select a role</div>
//           <div className="bn-role-grid" style={styles.roleGrid}>
//             <button
//               type="button"
//               onClick={() => setRoleName("Bidder")}
//               aria-pressed={roleIsBidder}
//               className="bn-auth-choice"
//               style={{
//                 ...styles.choiceCard,
//                 border: roleIsBidder ? "2px solid rgba(42,124,255,0.75)" : styles.choiceCard.border,
//                 background: roleIsBidder ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.08)",
//               }}
//             >
//               <div style={styles.roleTitleRow}>
//                 <img src="/images/bid.png" alt="Bidder icon" style={styles.roleIcon} />
//                 <div style={styles.choiceName}>Bidder</div>
//               </div>
//               <ul style={styles.bullets}>
//                 <li>Bid on auctions</li>
//                 <li>Chat in auctions</li>
//                 <li>Upgrade to auctioneer later</li>
//               </ul>
//             </button>

//             <button
//               type="button"
//               onClick={() => setRoleName("Auctioneer")}
//               aria-pressed={roleIsAuctioneer}
//               className="bn-auth-choice"
//               style={{
//                 ...styles.choiceCard,
//                 border: roleIsAuctioneer ? "2px solid rgba(42,124,255,0.75)" : styles.choiceCard.border,
//                 background: roleIsAuctioneer ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.08)",
//               }}
//             >
//               <div style={styles.roleTitleRow}>
//                 <img src="/images/auction.png" alt="Auctioneer icon" style={styles.roleIcon} />
//                 <div style={styles.choiceName}>Auctioneer</div>
//               </div>
//               <ul style={styles.bullets}>
//                 <li>Create auctions</li>
//                 <li>Also bid on other auctions</li>
//                 <li style={{ listStyle: "none", opacity: 0.0 }}>.</li>
//               </ul>
//             </button>
//           </div>

//           <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Choose an avatar</div>
//           <div className="bn-avatar-grid bn-avatar-grid" style={styles.avatarGrid}>
//             {selectableAvatars.map((av) => {
//               const imgSrc = avatarImageMap[av];
//               const isSelected = avatar === av;

//               return (
//                 <button
//                   key={av}
//                   type="button"
//                   onClick={() => setAvatar(av)}
//                   aria-pressed={isSelected}
//                   className="bn-auth-avatar"
//                   style={{
//                     ...styles.avatarBtn,
//                     border: isSelected ? "2px solid rgba(42,124,255,0.78)" : "1px solid rgba(255,255,255,0.14)",
//                     background: isSelected ? "rgba(42,124,255,0.14)" : "rgba(255,255,255,0.07)",
//                   }}
//                 >
//                   <img src={imgSrc} alt={av} style={styles.avatarImg} />
//                 </button>
//               );
//             })}
//           </div>

//           {/* ✅ Back πάνω από Complete */}
//           <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
//             <button
//               type="button"
//               onClick={handleBackClick}
//               disabled={loading || backLoading}
//               style={{
//                 ...styles.secondaryBtn,
//                 opacity: loading || backLoading ? 0.75 : 1,
//                 cursor: loading || backLoading ? "not-allowed" : "pointer",
//               }}
//             >
//               Back
//             </button>

//             <form onSubmit={handleSubmit} style={styles.footer}>
//               <button
//                 type="submit"
//                 disabled={loading || backLoading}
//                 style={{
//                   ...styles.primaryBtn,
//                   opacity: loading || backLoading ? 0.78 : 1,
//                   cursor: loading || backLoading ? "not-allowed" : "pointer",
//                 }}
//               >
//                 {loading ? "Αποστολή..." : "Complete Sign Up"}
//               </button>
//             </form>
//           </div>

//           {/* ✅ Popup confirm για Back + delete */}
//           {showBackPopup && (
//             <div className="bn-auth-overlay" style={styles.overlay}>
//               <div className="bn-auth-modal" style={styles.popup}>
//                 <h3 style={{ margin: "0 0 8px" }}>Είσαι σίγουρος;</h3>
//                 <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)" }}>
//                   Αν πατήσεις <strong>Yes</strong>, θα διαγράψουμε τον λογαριασμό από το backend και θα σε γυρίσουμε στο Step 1.
//                 </p>

//                 <div style={styles.popupRow}>
//                   <button
//                     type="button"
//                     onClick={handleBackCancel}
//                     disabled={backLoading}
//                     style={{
//                       ...styles.ghostBtn,
//                       opacity: backLoading ? 0.75 : 1,
//                       cursor: backLoading ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="button"
//                     onClick={handleConfirmBackAndDelete}
//                     disabled={backLoading}
//                     style={{
//                       ...styles.dangerBtn,
//                       opacity: backLoading ? 0.75 : 1,
//                       cursor: backLoading ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     {backLoading ? "Returning..." : "Yes, return"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </AuthScaffold>
//   );
// };

// export default SignUpStep2;
import React, { useState } from "react";
import AuthScaffold from "./AuthScaffold";
import { sendSignUpRequest, deleteUserAccount, logout } from "../api/Springboot/backendUserService";

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
  firebaseUserId: string; // (kept for compatibility, not used here)
  displayName: string;
  onCompleted: (auth: AuthUserDto) => void;
  onBack: () => void;
}

const avatarImageMap: Record<Avatar, string> = {
  BEARD_MAN_AVATAR: "/images/BEARD_MAN_AVATAR.png",
  MAN_AVATAR: "/images/MAN_AVATAR.png",
  BLONDE_GIRL_AVATAR: "/images/BLONDE_GIRL_AVATAR.png",
  GIRL_AVATAR: "/images/GIRL_AVATAR.png",
  DEFAULT_AVATAR: "/images/DEFAULT_AVATAR.png",
  DEFAULT: "/images/DEFAULT_AVATAR.png",
};

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
  displayName,
  onCompleted,
  onBack,
}) => {
  const [roleName, setRoleName] = useState<RoleApiName>("Bidder");
  const [avatar, setAvatar] = useState<Avatar>("MAN_AVATAR");

  const [loading, setLoading] = useState(false);
  const [backLoading, setBackLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showBackPopup, setShowBackPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const request: SignUpRequest = {
        roleName,
        avatar,
        locationDto: { country, region },
      };

      const authUser = await sendSignUpRequest(request);

      setSuccess("All set! Your account is ready.");
      onCompleted(authUser);
    } catch (err: unknown) {
      console.error(err);
      let message = "We couldn’t finish setting up your account. Please try again.";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (loading || backLoading) return;
    setShowBackPopup(true);
  };

  const handleBackCancel = () => {
    if (backLoading) return;
    setShowBackPopup(false);
  };

  const handleConfirmBackAndDelete = async () => {
    setBackLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteUserAccount();
      logout();

      setShowBackPopup(false);
      onBack();
    } catch (err: unknown) {
      console.error("Delete user account on back failed:", err);
      let message = "We couldn’t go back right now. Please try again.";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setBackLoading(false);
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    card: {
      width: "min(560px, 92vw)", // ✅ desktop/laptop stays the same
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
    header: { textAlign: "center", marginBottom: 14 },
    logo: {
      height: 80,
      width: "auto",
      objectFit: "contain",
      filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
      marginBottom: 10,
    },
    title: {
      margin: "6px 0 6px",
      fontSize: "clamp(22px, 2.2vw, 30px)",
      fontWeight: 900,
      color: "rgba(255,255,255,0.95)",
    },
    subtitle: {
      margin: 0,
      fontSize: "0.98rem",
      color: "rgba(255,255,255,0.72)",
    },
    alert: {
      whiteSpace: "pre-line",
      padding: "10px 12px",
      borderRadius: 12,
      marginBottom: 12,
      fontSize: "0.92rem",
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(0,0,0,0.20)",
    },
    sectionTitle: {
      margin: "14px 0 10px",
      fontWeight: 900,
      color: "rgba(255,255,255,0.92)",
      fontSize: "1.05rem",
    },
    roleGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 14,
    },
    choiceCard: {
      textAlign: "left",
      borderRadius: 18,
      padding: 16,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.14)",
      color: "rgba(244,252,255,0.95)",
      cursor: "pointer",
      width: "100%",
      transition: "transform 140ms ease, background 140ms ease, border-color 140ms ease",
    },
    roleTitleRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 6,
    },
    roleIcon: {
      width: 22,
      height: 22,
      objectFit: "contain",
      filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
    },
    choiceName: {
      margin: 0,
      fontWeight: 900,
      fontSize: "1rem",
      color: "rgba(255,255,255,0.95)",
    },
    bullets: {
      margin: 0,
      paddingLeft: 18,
      color: "rgba(235, 248, 255, 0.78)",
      fontSize: "0.9rem",
      lineHeight: 1.55,
    },
    avatarGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
      gap: 10,
      marginTop: 10,
    },
    avatarBtn: {
      borderRadius: 16,
      padding: 10,
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.14)",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      width: "100%",
      transition: "transform 140ms ease, background 140ms ease, border-color 140ms ease",
    },
    avatarImg: {
      width: 56,
      height: 56,
      borderRadius: "50%",
      objectFit: "cover",
      boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.15)",
    },
    footer: {
      marginTop: 0,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      alignItems: "center",
    },
    primaryBtn: {
      width: "min(520px, 100%)",
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.16)",
      background: "#2a7cff",
      color: "white",
      fontWeight: 900,
      fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 10px 22px rgba(42,124,255,0.30)",
      transition: "transform 140ms ease, filter 140ms ease, box-shadow 140ms ease",
    },
    secondaryBtn: {
      width: "min(520px, 100%)",
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.08)",
      color: "rgba(244, 252, 255, 0.92)",
      fontWeight: 900,
      fontSize: "0.98rem",
      cursor: "pointer",
      transition: "transform 140ms ease, background 140ms ease, border-color 140ms ease",
    },

    overlay: {
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
    popup: {
      width: "min(520px, 92vw)",
      borderRadius: 18,
      padding: 18,
      background: "rgba(18, 86, 108, 0.55)",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
      color: "rgba(242, 251, 255, 0.96)",
      backdropFilter: "blur(18px) saturate(130%)",
      WebkitBackdropFilter: "blur(18px) saturate(130%)",
    },
    popupRow: {
      marginTop: 14,
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      flexWrap: "wrap",
    },
    dangerBtn: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,80,80,0.35)",
      background: "rgba(255,80,80,0.10)",
      color: "rgba(255,210,210,0.95)",
      fontWeight: 900,
      cursor: "pointer",
    },
    ghostBtn: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.08)",
      color: "rgba(244,252,255,0.92)",
      fontWeight: 900,
      cursor: "pointer",
    },
  };

  const roleIsBidder = roleName === "Bidder";
  const roleIsAuctioneer = roleName === "Auctioneer";

  return (
    <AuthScaffold>
      <style>{`
        /* ✅ Outer padding so the background shows on mobile/tablet */
        .bn-auth-outer{
          padding: 24px 16px;
          display:flex;
          justify-content:center;
          align-items:flex-start;
        }
        .bn-auth-card, .bn-auth-choice, .bn-auth-avatar { box-sizing: border-box; }

        /* Hover/active feel (desktop) */
        .bn-auth-choice:hover,
        .bn-auth-avatar:hover{
          transform: translateY(-1px);
        }

        /* ✅ Tablet */
        @media (max-width: 900px) {
          .bn-auth-outer{ padding: 22px 14px; }
          .bn-auth-logo{ height: 72px !important; }
          .bn-avatar-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        }

        /* ✅ Small tablet / big phones */
        @media (max-width: 780px) {
          .bn-role-grid { grid-template-columns: 1fr !important; }
          .bn-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }

        /* ✅ Mobile: narrower card + more glass to show background */
        @media (max-width: 520px) {
          .bn-auth-outer{
            padding: 18px 14px calc(18px + env(safe-area-inset-bottom));
          }

          .bn-auth-card{
            width: min(440px, 86vw) !important;
            border-radius: 18px !important;
            padding: 16px !important;
            background: rgba(173, 170, 170, 0.52) !important;
            box-shadow: 0 18px 55px rgba(0,0,0,0.42) !important;
          }

          .bn-auth-logo{ height: 62px !important; }
          .bn-avatar-grid { gap: 10px !important; }
          .bn-auth-avatar{ padding: 12px !important; border-radius: 16px !important; }
          .bn-auth-avatar img{ width: 60px !important; height: 60px !important; }
        }

        @media (max-width: 420px) {
          .bn-avatar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }

        /* ✅ Scroll ONLY on mobile + small height (keyboard). NOT on laptop */
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

        /* ✅ Popup overlay safer on mobile */
        @media (max-width: 520px) {
          .bn-auth-overlay{
            padding: 14px !important;
            padding-bottom: calc(14px + env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>

      <div className="bn-auth-outer">
        <div className="bn-auth-card" style={styles.card}>
          <div style={styles.header}>
            <img
              className="bn-auth-logo"
              src="/images/websiteLogoFinal.png"
              alt="BidNow"
              style={styles.logo}
            />
            <h2 style={styles.title}>Welcome {displayName || "there"}!</h2>
            <p style={styles.subtitle}>Finish setup to start using BidNow</p>
          </div>

          {error && (
            <div style={{ ...styles.alert, borderColor: "rgba(255,80,80,0.35)" }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          {success && (
            <div style={{ ...styles.alert, borderColor: "rgba(80,255,170,0.28)" }}>
              <strong>Success:</strong> {success}
            </div>
          )}

          <div style={styles.sectionTitle}>Select a role</div>
          <div className="bn-role-grid" style={styles.roleGrid}>
            <button
              type="button"
              onClick={() => setRoleName("Bidder")}
              aria-pressed={roleIsBidder}
              className="bn-auth-choice"
              style={{
                ...styles.choiceCard,
                border: roleIsBidder
                  ? "2px solid rgba(42,124,255,0.75)"
                  : styles.choiceCard.border,
                background: roleIsBidder
                  ? "rgba(42,124,255,0.14)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              <div style={styles.roleTitleRow}>
                <img src="/images/bid.png" alt="Bidder icon" style={styles.roleIcon} />
                <div style={styles.choiceName}>Bidder</div>
              </div>
              <ul style={styles.bullets}>
                <li>Bid on auctions</li>
                <li>Chat during auctions</li>
                <li>Upgrade to auctioneer later</li>
              </ul>
            </button>

            <button
              type="button"
              onClick={() => setRoleName("Auctioneer")}
              aria-pressed={roleIsAuctioneer}
              className="bn-auth-choice"
              style={{
                ...styles.choiceCard,
                border: roleIsAuctioneer
                  ? "2px solid rgba(42,124,255,0.75)"
                  : styles.choiceCard.border,
                background: roleIsAuctioneer
                  ? "rgba(42,124,255,0.14)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              <div style={styles.roleTitleRow}>
                <img
                  src="/images/auction.png"
                  alt="Auctioneer icon"
                  style={styles.roleIcon}
                />
                <div style={styles.choiceName}>Auctioneer</div>
              </div>
              <ul style={styles.bullets}>
                <li>Create and manage auctions</li>
                <li>You can still bid on other auctions</li>
                <li style={{ listStyle: "none", opacity: 0.0 }}>.</li>
              </ul>
            </button>
          </div>

          <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Choose an avatar</div>
          <div className="bn-avatar-grid" style={styles.avatarGrid}>
            {selectableAvatars.map((av) => {
              const imgSrc = avatarImageMap[av];
              const isSelected = avatar === av;

              return (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  aria-pressed={isSelected}
                  className="bn-auth-avatar"
                  style={{
                    ...styles.avatarBtn,
                    border: isSelected
                      ? "2px solid rgba(42,124,255,0.78)"
                      : "1px solid rgba(255,255,255,0.14)",
                    background: isSelected
                      ? "rgba(42,124,255,0.14)"
                      : "rgba(255,255,255,0.07)",
                  }}
                >
                  <img src={imgSrc} alt={av} style={styles.avatarImg} />
                </button>
              );
            })}
          </div>

          {/* ✅ Complete Sign Up TOP, Back BOTTOM */}
          <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
            <form onSubmit={handleSubmit} style={styles.footer}>
              <button
                type="submit"
                disabled={loading || backLoading}
                style={{
                  ...styles.primaryBtn,
                  opacity: loading || backLoading ? 0.78 : 1,
                  cursor: loading || backLoading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Finishing..." : "Complete Sign Up"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleBackClick}
              disabled={loading || backLoading}
              style={{
                ...styles.secondaryBtn,
                opacity: loading || backLoading ? 0.75 : 1,
                cursor: loading || backLoading ? "not-allowed" : "pointer",
              }}
            >
              Back
            </button>
          </div>

          {/* ✅ Popup confirm for Back + delete */}
          {showBackPopup && (
            <div className="bn-auth-overlay" style={styles.overlay}>
              <div className="bn-auth-modal" style={styles.popup}>
                <h3 style={{ margin: "0 0 8px" }}>Are you sure?</h3>
                <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)" }}>
                  If you continue, we’ll remove your sign-up details and take you back to Step 1.
                </p>

                <div style={styles.popupRow}>
                  <button
                    type="button"
                    onClick={handleBackCancel}
                    disabled={backLoading}
                    style={{
                      ...styles.ghostBtn,
                      opacity: backLoading ? 0.75 : 1,
                      cursor: backLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmBackAndDelete}
                    disabled={backLoading}
                    style={{
                      ...styles.dangerBtn,
                      opacity: backLoading ? 0.75 : 1,
                      cursor: backLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {backLoading ? "Returning..." : "Yes, go back"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthScaffold>
  );
};

export default SignUpStep2;
