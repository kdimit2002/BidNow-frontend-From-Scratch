// // src/components/UserProfilePage.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
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
//   AuthUserDto,
// } from "../models/Springboot/UserEntity";

// import {
//   redeemReferralCodeApi,
//   fetchReferralCodeUser,
// } from "../api/Springboot/ReferralCodeService";

// interface UserProfilePageProps {
//   onShowReferralCodeUsage: () => void;
//   onAuthUserUpdated?: (patch: Partial<AuthUserDto>) => void;
//   onSignedOut?: () => void;
// }

// const selectableAvatars: Avatar[] = [
//   "BEARD_MAN_AVATAR",
//   "MAN_AVATAR",
//   "BLONDE_GIRL_AVATAR",
//   "GIRL_AVATAR",
//   "DEFAULT_AVATAR",
// ];

// const avatarImageMap: Record<Avatar, string> = {
//   BEARD_MAN_AVATAR: "/images/BEARD_MAN_AVATAR.png",
//   MAN_AVATAR: "/images/MAN_AVATAR.png",
//   BLONDE_GIRL_AVATAR: "/images/BLONDE_GIRL_AVATAR.png",
//   GIRL_AVATAR: "/images/GIRL_AVATAR.png",
//   DEFAULT_AVATAR: "/images/DEFAULT_AVATAR.png",
//   DEFAULT: "/images/DEFAULT_AVATAR.png",
// };

// const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
// const countries: Country[] = ["Cyprus"];

// type Notice = { type: "success" | "error"; text: string } | null;
// type DialogState = { kind: "upgrade" } | { kind: "delete" } | null;

// const getRolePillStyle = (isAuctioneer: boolean): React.CSSProperties => ({
//   padding: "6px 10px",
//   borderRadius: 999,
//   background: isAuctioneer ? "rgba(42,124,255,0.12)" : "rgba(0,0,0,0.06)",
//   border: isAuctioneer
//     ? "1px solid rgba(42,124,255,0.25)"
//     : "1px solid rgba(0,0,0,0.10)",
//   color: isAuctioneer ? "#1a57d6" : "#333",
//   fontWeight: 900,
//   fontSize: "0.9rem",
// });

// function ConfirmDialog({
//   open,
//   title,
//   description,
//   confirmText,
//   confirmTone,
//   loading,
//   onClose,
//   onConfirm,
// }: {
//   open: boolean;
//   title: string;
//   description: string;
//   confirmText: string;
//   confirmTone: "primary" | "danger";
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
// }) {
//   if (!open) return null;

//   const btnStyleBase: React.CSSProperties = {
//     padding: "10px 12px",
//     borderRadius: 12,
//     fontWeight: 900,
//     cursor: loading ? "not-allowed" : "pointer",
//     border: "1px solid rgba(15,23,42,0.12)",
//     background: "#fff",
//     color: "#0f172a",
//   };

//   const confirmStyle: React.CSSProperties =
//     confirmTone === "danger"
//       ? {
//           ...btnStyleBase,
//           border: "1px solid rgba(220,38,38,0.35)",
//           color: "#b91c1c",
//           background: "rgba(220,38,38,0.06)",
//         }
//       : {
//           ...btnStyleBase,
//           border: "1px solid rgba(11,92,255,0.25)",
//           color: "#0b5cff",
//           background: "rgba(11,92,255,0.08)",
//         };

//   return (
//     <div
//       role="dialog"
//       aria-modal="true"
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(2,6,23,0.55)",
//         display: "grid",
//         placeItems: "center",
//         padding: 14,
//         zIndex: 9999,
//       }}
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div
//         style={{
//           width: "min(520px, 96vw)",
//           borderRadius: 16,
//           background: "#fff",
//           border: "1px solid rgba(15,23,42,0.10)",
//           boxShadow: "0 24px 70px rgba(2,6,23,0.35)",
//           padding: 16,
//         }}
//       >
//         <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#0f172a" }}>
//           {title}
//         </div>
//         <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.45 }}>
//           {description}
//         </div>

//         <div
//           style={{
//             marginTop: 14,
//             display: "flex",
//             justifyContent: "flex-end",
//             gap: 10,
//             flexWrap: "wrap",
//           }}
//         >
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={loading}
//             style={btnStyleBase}
//           >
//             Άκυρο
//           </button>
//           <button
//             type="button"
//             onClick={onConfirm}
//             disabled={loading}
//             style={confirmStyle}
//           >
//             {loading ? "Παρακαλώ περίμενε…" : confirmText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const UserProfilePage: React.FC<UserProfilePageProps> = ({
//   onShowReferralCodeUsage,
//   onAuthUserUpdated,
//   onSignedOut,
// }) => {
//   const [profile, setProfile] = useState<ProfileUserEntity | null>(null);
//   const [loading, setLoading] = useState(true);

//   // editable
//   const [username, setUsername] = useState("");
//   const [selectedAvatar, setSelectedAvatar] =
//     useState<Avatar>("DEFAULT_AVATAR");
//   const [country, setCountry] = useState<Country>("Cyprus");
//   const [region, setRegion] = useState<Region>("NICOSIA");

//   // referral
//   const [referralCode, setReferralCode] = useState("");
//   const [referralOwnerCode, setReferralOwnerCode] = useState<string | null>(
//     null
//   );

//   const [saving, setSaving] = useState(false);

//   // notices
//   const [accountNotice, setAccountNotice] = useState<Notice>(null);
//   const [roleNotice, setRoleNotice] = useState<Notice>(null);
//   const [avatarNotice, setAvatarNotice] = useState<Notice>(null);
//   const [locationNotice, setLocationNotice] = useState<Notice>(null);
//   const [referralNotice, setReferralNotice] = useState<Notice>(null);
//   const [dangerNotice, setDangerNotice] = useState<Notice>(null);

//   const [pageError, setPageError] = useState<string | null>(null);

//   // dialogs
//   const [dialog, setDialog] = useState<DialogState>(null);

//   // ✅ Chat eligibility tooltip
//   const [chatInfoOpen, setChatInfoOpen] = useState(false);
//   const chatInfoRef = useRef<HTMLDivElement | null>(null);

//   const styles: Record<string, React.CSSProperties> = useMemo(
//     () => ({
//       page: { maxWidth: 1100, margin: "0 auto", padding: "20px 14px 40px" },
//       topbar: {
//         display: "flex",
//         alignItems: "flex-end",
//         justifyContent: "space-between",
//         gap: 12,
//         flexWrap: "wrap",
//         marginBottom: 14,
//       },
//       h2: { margin: 0, fontSize: "1.55rem", fontWeight: 900, color: "#0f172a" },
//       sub: { margin: 0, color: "#475569", fontSize: "0.95rem" },

//       grid: {
//         display: "grid",
//         gridTemplateColumns: "1.1fr 0.9fr",
//         gap: 14,
//         alignItems: "start",
//       },

//       card: {
//         background: "#fff",
//         border: "1px solid rgba(15,23,42,0.08)",
//         borderRadius: 16,
//         boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
//         padding: 16,
//       },
//       cardTitle: {
//         margin: 0,
//         fontSize: "1.05rem",
//         fontWeight: 900,
//         color: "#0f172a",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//       },
//       cardHint: {
//         marginTop: 6,
//         marginBottom: 0,
//         color: "#64748b",
//         fontSize: "0.9rem",
//       },

//       row: {
//         display: "grid",
//         gridTemplateColumns: "1fr auto",
//         gap: 10,
//         marginTop: 12,
//       },
//       label: {
//         fontSize: "0.88rem",
//         fontWeight: 900,
//         color: "#334155",
//         marginBottom: 6,
//       },
//       input: {
//         width: "100%",
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.14)",
//         outline: "none",
//         fontSize: "0.95rem",
//         background: "#fff",
//       },
//       select: {
//         width: "100%",
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.14)",
//         outline: "none",
//         fontSize: "0.95rem",
//         background: "#fff",
//       },

//       btn: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "#0b5cff",
//         color: "#fff",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//       },
//       btnGhost: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.14)",
//         background: "#fff",
//         color: "#0f172a",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//       },
//       btnDanger: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(220,38,38,0.35)",
//         background: "#fff",
//         color: "#b91c1c",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//       },

//       kv: { margin: "10px 0 0", color: "#334155", fontSize: "0.95rem" },
//       pill: {
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//         padding: "6px 10px",
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "rgba(11,92,255,0.06)",
//         color: "#0f172a",
//         fontWeight: 900,
//         fontSize: "0.86rem",
//       },

//       // ✅ Chat pill + tooltip styles
//       statusDot: {
//         width: 10,
//         height: 10,
//         borderRadius: 999,
//         boxShadow: "0 8px 16px rgba(15,23,42,0.12)",
//         flex: "0 0 auto",
//       },
//       infoBtn: {
//         width: 22,
//         height: 22,
//         borderRadius: 999,
//         border: "1px solid rgba(0,0,0,0.18)",
//         background: "rgba(255,255,255,0.92)",
//         cursor: "pointer",
//         fontWeight: 900,
//         lineHeight: "22px",
//         display: "inline-grid",
//         placeItems: "center",
//         padding: 0,
//       },
//       tooltip: {
//         position: "absolute",
//         top: "calc(100% + 10px)",
//         left: 0,
//         zIndex: 50,
//         width: "min(360px, 86vw)",
//         padding: "12px 12px",
//         borderRadius: 14,
//         background: "rgba(20, 20, 20, 0.92)",
//         color: "rgba(255,255,255,0.92)",
//         border: "1px solid rgba(255,255,255,0.12)",
//         boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
//         backdropFilter: "blur(10px)",
//       },
//       tooltipArrow: {
//         position: "absolute",
//         top: -7,
//         left: 18,
//         width: 12,
//         height: 12,
//         background: "rgba(20, 20, 20, 0.92)",
//         transform: "rotate(45deg)",
//         borderLeft: "1px solid rgba(255,255,255,0.12)",
//         borderTop: "1px solid rgba(255,255,255,0.12)",
//       },
//       tooltipClose: {
//         border: "none",
//         background: "transparent",
//         color: "rgba(255,255,255,0.85)",
//         cursor: "pointer",
//         fontSize: "1.05rem",
//         fontWeight: 900,
//         lineHeight: 1,
//       },

//       roleBox: {
//         marginTop: 14,
//         padding: "0.9rem 1rem",
//         border: "1px solid rgba(0,0,0,0.08)",
//         borderRadius: 12,
//         background: "#fff",
//         boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
//       },

//       avatarRow: {
//         display: "grid",
//         gridTemplateColumns: "120px 1fr",
//         gap: 14,
//         alignItems: "start",
//         marginTop: 12,
//       },
//       avatarBig: {
//         width: 110,
//         height: 110,
//         borderRadius: "50%",
//         objectFit: "cover",
//         border: "1px solid rgba(15,23,42,0.12)",
//         boxShadow: "0 12px 24px rgba(15,23,42,0.10)",
//         background: "#f1f5f9",
//       },
//       avatarGrid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
//         gap: 10,
//       },
//       avatarBtn: {
//         borderRadius: 14,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "#fff",
//         padding: 10,
//         cursor: "pointer",
//         display: "grid",
//         placeItems: "center",
//         position: "relative",
//       },
//       avatarBtnActive: {
//         border: "2px solid rgba(11,92,255,0.65)",
//         background: "rgba(11,92,255,0.06)",
//         boxShadow: "0 14px 28px rgba(11,92,255,0.12)",
//       },
//       avatarImg: {
//         width: 52,
//         height: 52,
//         borderRadius: "50%",
//         objectFit: "cover",
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f1f5f9",
//       },
//       checkDot: {
//         position: "absolute",
//         top: 8,
//         right: 8,
//         width: 18,
//         height: 18,
//         borderRadius: 999,
//         background: "#0b5cff",
//         color: "#fff",
//         fontSize: 12,
//         display: "grid",
//         placeItems: "center",
//         boxShadow: "0 10px 18px rgba(11,92,255,0.22)",
//       },

//       alertTop: {
//         marginTop: 10,
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f8fafc",
//         color: "#0f172a",
//         fontSize: "0.92rem",
//         whiteSpace: "pre-line",
//       },

//       notice: {
//         marginTop: 10,
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f8fafc",
//         color: "#0f172a",
//         fontSize: "0.92rem",
//         whiteSpace: "pre-line",
//       },

//       dangerCard: {
//         background: "linear-gradient(180deg, rgba(255, 235, 235, 0.80), #fff)",
//         border: "1px solid rgba(220,38,38,0.22)",
//         borderRadius: 16,
//         padding: 16,
//       },
//     }),
//     []
//   );

//   const noticeStyle = (n: Notice): React.CSSProperties => {
//     if (!n) return styles.notice;
//     if (n.type === "success") {
//       return {
//         ...styles.notice,
//         borderColor: "rgba(16,185,129,0.25)",
//         background: "rgba(16,185,129,0.06)",
//       };
//     }
//     return {
//       ...styles.notice,
//       borderColor: "rgba(220,38,38,0.25)",
//       background: "rgba(220,38,38,0.06)",
//     };
//   };

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const data = await fetchUserProfile();
//         setProfile(data);

//         setUsername(data.username);
//         setCountry(data.locationDto.country);
//         setRegion(data.locationDto.region);
//         setSelectedAvatar(data.avatarName);

//         if (data.isReferralCodeOwner) {
//           try {
//             const rcUser = await fetchReferralCodeUser();
//             if (rcUser && rcUser.code) setReferralOwnerCode(rcUser.code);
//             else setReferralOwnerCode(null);
//           } catch (err) {
//             console.log("Failed to fetch owner referral code:", err);
//             setReferralOwnerCode(null);
//           }
//         } else {
//           setReferralOwnerCode(null);
//         }

//         setPageError(null);
//       } catch (err: unknown) {
//         console.error(err);
//         setPageError(
//           err instanceof Error ? err.message : "Αποτυχία φόρτωσης προφίλ."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, []);

//   // ✅ close tooltip on outside click + Escape
//   useEffect(() => {
//     if (!chatInfoOpen) return;

//     const onMouseDown = (e: MouseEvent) => {
//       const el = chatInfoRef.current;
//       if (!el) return;
//       if (el.contains(e.target as Node)) return;
//       setChatInfoOpen(false);
//     };

//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setChatInfoOpen(false);
//     };

//     window.addEventListener("mousedown", onMouseDown);
//     window.addEventListener("keydown", onKeyDown);
//     return () => {
//       window.removeEventListener("mousedown", onMouseDown);
//       window.removeEventListener("keydown", onKeyDown);
//     };
//   }, [chatInfoOpen]);

//   const withUiState = async (fn: () => Promise<void>) => {
//     setSaving(true);
//     setPageError(null);

//     try {
//       await fn();
//     } catch (err: unknown) {
//       console.error(err);
//       throw err;
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveUsername = async () => {
//     if (!profile) return;

//     setAccountNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateUsername(username);
//         setProfile({ ...profile, username });

//         // ✅ ενημέρωση header (Logged in as ...)
//         onAuthUserUpdated?.({ username });
//       });

//       setAccountNotice({ type: "success", text: "Το username αποθηκεύτηκε." });
//     } catch (err: unknown) {
//       setAccountNotice({
//         type: "error",
//         text:
//           err instanceof Error ? err.message : "Αποτυχία αποθήκευσης username.",
//       });
//     }
//   };

//   const handleConfirmUpgrade = async () => {
//     if (!profile) return;
//     setRoleNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateRole("Auctioneer");

//         // ✅ local profile update
//         setProfile({ ...profile, role: "Auctioneer" });

//         // ✅ header update (Logged in as ... (Auctioneer))
//         onAuthUserUpdated?.({ roleName: "Auctioneer" });
//       });

//       setRoleNotice({ type: "success", text: "Έγινε upgrade σε Auctioneer." });
//       setDialog(null);
//     } catch (err: unknown) {
//       setRoleNotice({
//         type: "error",
//         text:
//           err instanceof Error ? err.message : "Αποτυχία upgrade σε Auctioneer.",
//       });
//       setDialog(null);
//     }
//   };

//   const handleSaveAvatar = async () => {
//     if (!profile) return;

//     setAvatarNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateAvatar(selectedAvatar);

//         // ✅ κάνε το αμέσως current
//         setProfile({
//           ...profile,
//           avatarName: selectedAvatar,
//           avatarUrl: avatarImageMap[selectedAvatar],
//         });
//       });

//       setAvatarNotice({ type: "success", text: "Το avatar αποθηκεύτηκε." });
//     } catch (err: unknown) {
//       setAvatarNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Αποτυχία αποθήκευσης avatar.",
//       });
//     }
//   };

//   const handleSaveLocation = async () => {
//     if (!profile) return;

//     setLocationNotice(null);

//     try {
//       await withUiState(async () => {
//         const location: LocationDto = { country, region };
//         await updateLocation(location);
//         setProfile({ ...profile, locationDto: location });
//       });

//       setLocationNotice({ type: "success", text: "Η τοποθεσία αποθηκεύτηκε." });
//     } catch (err: unknown) {
//       setLocationNotice({
//         type: "error",
//         text:
//           err instanceof Error
//             ? err.message
//             : "Αποτυχία αποθήκευσης τοποθεσίας.",
//       });
//     }
//   };

//   const handleUseReferralCode = async () => {
//     if (!profile) return;

//     setReferralNotice(null);

//     if (!referralCode.trim()) {
//       setReferralNotice({ type: "error", text: "Γράψε πρώτα ένα referral code." });
//       return;
//     }

//     try {
//       await withUiState(async () => {
//         await redeemReferralCodeApi(referralCode.trim());

//         const updated = await fetchUserProfile();
//         setProfile(updated);

//         setReferralCode("");
//       });

//       setReferralNotice({ type: "success", text: "Το referral code εφαρμόστηκε!" });
//     } catch (err: unknown) {
//       setReferralNotice({
//         type: "error",
//         text:
//           err instanceof Error ? err.message : "Αποτυχία χρήσης referral code.",
//       });
//     }
//   };

//   const handleConfirmDeleteAccount = async () => {
//     if (!profile) return;

//     setDangerNotice(null);

//     try {
//       await withUiState(async () => {
//         await deleteUserAccount();

//         logout();
//         setProfile(null);

//         onSignedOut?.();
//       });

//       setDialog(null);
//     } catch (err: unknown) {
//       setDangerNotice({
//         type: "error",
//         text:
//           err instanceof Error ? err.message : "Αποτυχία διαγραφής λογαριασμού.",
//       });
//       setDialog(null);
//     }
//   };

//   const showUseReferralInput =
//     profile && !profile.isReferralCodeOwner && !profile.hasUsedReferralCode;

//   const currentAvatarSrc =
//     (profile?.avatarUrl as string | undefined) ||
//     (profile ? avatarImageMap[profile.avatarName] : undefined) ||
//     avatarImageMap.DEFAULT_AVATAR;

//   const isAuctioneer = profile?.role === "Auctioneer";
//   const isBidder = profile?.role === "Bidder";

//   const chatEligible = profile?.eligibleForChat === true;

//   if (loading) return <p style={{ padding: "1rem" }}>Φόρτωση προφίλ...</p>;
//   if (!profile) return <p style={{ padding: "1rem" }}>Δεν βρέθηκε προφίλ χρήστη.</p>;

//   return (
//     <div className="bn-profile-page" style={styles.page}>
//       <style>{`
//         /* --- Base interactions --- */
//         .bn-btn { transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease; }
//         .bn-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }
//         .bn-input:focus { box-shadow: 0 0 0 4px rgba(11,92,255,0.12); border-color: rgba(11,92,255,0.45); }
//         .bn-avatar-btn { transition: transform 160ms ease, box-shadow 160ms ease; }
//         .bn-avatar-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 22px rgba(15,23,42,0.08); }
//         .bn-info-btn:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(11,92,255,0.18); }

//         /* --- Responsive grid --- */
//         @media (max-width: 920px) {
//           .bn-profile-grid { grid-template-columns: 1fr !important; }
//         }

//         /* --- Tablet tweaks --- */
//         @media (max-width: 820px) {
//           .bn-profile-page { padding: 18px 12px 34px !important; }
//           .bn-topbar { align-items: flex-start !important; }
//           .bn-title { font-size: 1.35rem !important; }
//           .bn-card { padding: 14px !important; border-radius: 14px !important; }
//         }

//         /* --- Mobile: stack rows + full width buttons --- */
//         @media (max-width: 520px) {
//           .bn-profile-page {
//             padding: 16px 12px calc(28px + env(safe-area-inset-bottom)) !important;
//           }

//           /* iOS zoom fix */
//           .bn-input, .bn-select { font-size: 16px !important; }

//           .bn-row {
//             grid-template-columns: 1fr !important;
//           }
//           .bn-row .bn-row-btn,
//           .bn-save-right .bn-btn,
//           .bn-danger-btn,
//           .bn-ref-btn {
//             width: 100% !important;
//           }

//           .bn-location-grid {
//             grid-template-columns: 1fr !important;
//           }

//           .bn-ref-row {
//             grid-template-columns: 1fr !important;
//           }

//           .bn-avatar-row { grid-template-columns: 1fr !important; }
//           .bn-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }

//           .bn-avatar-big { width: 96px !important; height: 96px !important; }

//           /* Tooltip πιο safe στο κινητό */
//           .bn-tooltip {
//             width: min(360px, 92vw) !important;
//             left: 50% !important;
//             transform: translateX(-50%) !important;
//           }
//           .bn-tooltip-arrow { left: 50% !important; transform: translateX(-50%) rotate(45deg) !important; }
//         }

//         @media (max-width: 380px) {
//           .bn-avatar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
//         }
//       `}</style>

//       <ConfirmDialog
//         open={dialog?.kind === "upgrade"}
//         title="Upgrade σε Auctioneer"
//         description="Είσαι σίγουρος ότι θέλεις να κάνεις upgrade σε Auctioneer;"
//         confirmText="Ναι, upgrade"
//         confirmTone="primary"
//         loading={saving}
//         onClose={() => setDialog(null)}
//         onConfirm={handleConfirmUpgrade}
//       />

//       <ConfirmDialog
//         open={dialog?.kind === "delete"}
//         title="Διαγραφή λογαριασμού"
//         description="Είσαι σίγουρος; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
//         confirmText="Ναι, διαγραφή"
//         confirmTone="danger"
//         loading={saving}
//         onClose={() => setDialog(null)}
//         onConfirm={handleConfirmDeleteAccount}
//       />

//       <div className="bn-topbar" style={styles.topbar}>
//         <div>
//           <h2 className="bn-title" style={styles.h2}>
//             Το προφίλ μου
//           </h2>
//         </div>

//         <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
//           {saving && <span style={styles.pill}>Αποθήκευση…</span>}

//           {/* ✅ Chat eligibility pill + info tooltip */}
//           <div
//             ref={chatInfoRef}
//             style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
//           >
//             <span
//               style={{
//                 ...styles.pill,
//                 background: chatEligible ? "rgba(16,185,129,0.08)" : "rgba(220,38,38,0.06)",
//                 borderColor: chatEligible ? "rgba(16,185,129,0.25)" : "rgba(220,38,38,0.22)",
//               }}
//             >
//               <span
//                 style={{
//                   ...styles.statusDot,
//                   background: chatEligible ? "#10b981" : "#ef4444",
//                 }}
//               />
//               <span style={{ opacity: 0.9 }}>Chat πρόσβαση:</span>
//               <strong style={{ color: chatEligible ? "#0b7a2a" : "#b00020" }}>
//                 {chatEligible ? "Ενεργό" : "Κλειστό"}
//               </strong>

//               <button
//                 type="button"
//                 className="bn-info-btn"
//                 onClick={() => setChatInfoOpen((v) => !v)}
//                 aria-label="Πληροφορίες για το chat"
//                 aria-expanded={chatInfoOpen}
//                 style={{
//                   ...styles.infoBtn,
//                   opacity: saving ? 0.7 : 1,
//                   cursor: saving ? "not-allowed" : "pointer",
//                 }}
//                 disabled={saving}
//               >
//                 i
//               </button>
//             </span>

//             {chatInfoOpen && (
//               <div
//                 role="dialog"
//                 aria-label="Λεπτομέρειες Chat"
//                 className="bn-tooltip"
//                 style={styles.tooltip}
//               >
//                 <div className="bn-tooltip-arrow" style={styles.tooltipArrow} />

//                 <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
//                   <strong style={{ fontSize: "0.95rem" }}>Πότε μπορείς να κάνεις chat</strong>
//                   <button
//                     type="button"
//                     onClick={() => setChatInfoOpen(false)}
//                     aria-label="Κλείσιμο"
//                     style={styles.tooltipClose}
//                   >
//                     ×
//                   </button>
//                 </div>

//                 <div style={{ marginTop: 8, fontSize: "0.88rem", color: "rgba(255,255,255,0.82)" }}>
//                   {chatEligible
//                     ? "Έχεις ήδη πρόσβαση στο chat."
//                     : "Δεν έχεις ακόμα πρόσβαση στο chat. Θα ανοίξει όταν συμβεί ένα από τα παρακάτω:"}
//                 </div>

//                 <ol
//                   style={{
//                     margin: "10px 0 0",
//                     paddingLeft: 18,
//                     fontSize: "0.88rem",
//                     lineHeight: 1.55,
//                   }}
//                 >
//                   <li>
//                     Κάνεις <strong>bid</strong> σε ένα auction{" "}
//                     <span style={{ opacity: 0.85 }}>(chat μόνο σε αυτό)</span>
//                   </li>
//                   <li>
//                     <strong>Κερδίσεις</strong> ένα auction{" "}
//                     <span style={{ opacity: 0.85 }}>(chat σε όλα)</span>
//                   </li>
//                   <li>
//                     Βάλεις <strong>δικό σου</strong> auction{" "}
//                     <span style={{ opacity: 0.85 }}>(chat σε όλα)</span>
//                   </li>
//                 </ol>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {pageError && (
//         <div
//           style={{
//             ...styles.alertTop,
//             borderColor: "rgba(220,38,38,0.25)",
//             background: "rgba(220,38,38,0.06)",
//           }}
//         >
//           <strong>Σφάλμα:</strong> {pageError}
//         </div>
//       )}

//       <div className="bn-profile-grid" style={styles.grid}>
//         {/* LEFT */}
//         <div style={{ display: "grid", gap: 14 }}>
//           {/* Account */}
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Λογαριασμός</div>

//             <div className="bn-row" style={styles.row}>
//               <div>
//                 <div style={styles.label}>Username</div>
//                 <input
//                   className="bn-input"
//                   style={styles.input}
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   disabled={saving}
//                 />
//               </div>

//               <button
//                 className="bn-btn bn-row-btn"
//                 style={{ ...styles.btn, opacity: saving ? 0.78 : 1 }}
//                 onClick={handleSaveUsername}
//                 disabled={saving}
//                 type="button"
//               >
//                 Αποθήκευση
//               </button>
//             </div>

//             {accountNotice && (
//               <div style={noticeStyle(accountNotice)}>
//                 {accountNotice.type === "success" ? "✅ " : "❌ "}
//                 {accountNotice.text}
//               </div>
//             )}

//             <div style={styles.kv}>
//               <strong>Email:</strong> {profile.email}
//             </div>
//             <div style={styles.kv}>
//               <strong>Τηλέφωνο:</strong> {profile.phoneNumber}
//             </div>

//             {/* Role */}
//             <div style={styles.roleBox}>
//               <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//                 <strong>Ρόλος:</strong>
//                 <span style={getRolePillStyle(isAuctioneer)}>{profile.role}</span>
//               </div>

//               {isBidder ? (
//                 <>
//                   <p style={{ margin: "10px 0 0" }} />
//                   <button
//                     type="button"
//                     onClick={() => setDialog({ kind: "upgrade" })}
//                     disabled={saving}
//                     className="bn-btn"
//                     style={{
//                       padding: "0.55rem 0.95rem",
//                       borderRadius: 10,
//                       border: "1px solid rgba(42,124,255,0.25)",
//                       background: "rgba(42,124,255,0.12)",
//                       color: "#1a57d6",
//                       fontWeight: 900,
//                       cursor: saving ? "not-allowed" : "pointer",
//                       width: "fit-content",
//                     }}
//                   >
//                     Upgrade σε Auctioneer
//                   </button>

//                   <div style={{ marginTop: 8, fontSize: "0.86rem", color: "#666" }}>
//                     Tip: Αν θέλεις να δημιουργείς auctions και να πουλάς items, μπορείς να
//                     κάνεις upgrade σε <strong>Auctioneer</strong>.
//                   </div>
//                 </>
//               ) : null}

//               {roleNotice && (
//                 <div style={noticeStyle(roleNotice)}>
//                   {roleNotice.type === "success" ? "✅ " : "❌ "}
//                   {roleNotice.text}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Location */}
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Τοποθεσία</div>

//             <div
//               className="bn-location-grid"
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 10,
//                 marginTop: 12,
//               }}
//             >
//               <div>
//                 <div style={styles.label}>Country</div>
//                 <select
//                   className="bn-select"
//                   style={styles.select}
//                   value={country}
//                   onChange={(e) => setCountry(e.target.value as Country)}
//                   disabled={saving}
//                 >
//                   {countries.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <div style={styles.label}>Region</div>
//                 <select
//                   className="bn-select"
//                   style={styles.select}
//                   value={region}
//                   onChange={(e) => setRegion(e.target.value as Region)}
//                   disabled={saving}
//                 >
//                   {regions.map((r) => (
//                     <option key={r} value={r}>
//                       {r}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div className="bn-save-right" style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//               <button
//                 className="bn-btn"
//                 style={{ ...styles.btn, opacity: saving ? 0.78 : 1 }}
//                 onClick={handleSaveLocation}
//                 disabled={saving}
//                 type="button"
//               >
//                 Αποθήκευση τοποθεσίας
//               </button>
//             </div>

//             {locationNotice && (
//               <div style={noticeStyle(locationNotice)}>
//                 {locationNotice.type === "success" ? "✅ " : "❌ "}
//                 {locationNotice.text}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div style={{ display: "grid", gap: 14 }}>
//           {/* Avatar */}
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Avatar</div>

//             <div className="bn-avatar-row" style={styles.avatarRow}>
//               <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
//                 <img
//                   className="bn-avatar-big"
//                   src={currentAvatarSrc}
//                   alt="Current avatar"
//                   style={styles.avatarBig}
//                 />
//                 <span style={{ color: "#64748b", fontSize: "0.86rem", fontWeight: 900 }}>
//                   Τρέχον
//                 </span>
//               </div>

//               <div>
//                 <div className="bn-avatar-grid" style={styles.avatarGrid}>
//                   {selectableAvatars.map((av) => {
//                     const isSelected = selectedAvatar === av;
//                     const imgSrc = avatarImageMap[av];

//                     return (
//                       <button
//                         key={av}
//                         type="button"
//                         className="bn-avatar-btn"
//                         onClick={() => setSelectedAvatar(av)}
//                         disabled={saving}
//                         aria-pressed={isSelected}
//                         style={{
//                           ...styles.avatarBtn,
//                           ...(isSelected ? styles.avatarBtnActive : {}),
//                           opacity: saving ? 0.7 : 1,
//                         }}
//                         title={av.replace("_AVATAR", "").replace(/_/g, " ")}
//                       >
//                         {isSelected && <div style={styles.checkDot}>✓</div>}
//                         <img src={imgSrc} alt={av} style={styles.avatarImg} />
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <div className="bn-save-right" style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//                   <button
//                     className="bn-btn"
//                     style={{ ...styles.btn, opacity: saving ? 0.78 : 1 }}
//                     onClick={handleSaveAvatar}
//                     disabled={saving}
//                     type="button"
//                   >
//                     Αποθήκευση Avatar
//                   </button>
//                 </div>

//                 {avatarNotice && (
//                   <div style={noticeStyle(avatarNotice)}>
//                     {avatarNotice.type === "success" ? "✅ " : "❌ "}
//                     {avatarNotice.text}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Rewards */}
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Reward Points</div>
//             <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
//               <div style={styles.kv}>
//                 <strong>Reward Points:</strong> {profile.rewardPoints}
//               </div>
//               <div style={styles.kv}>
//                 <strong>All time Reward Points:</strong> {profile.allTimeRewardPoints}
//               </div>
//             </div>
//           </div>

//           {/* Referral */}
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Referral</div>
//             <p style={styles.cardHint}>Κέρδισε πόντους με referral codes.</p>

//             {profile.isReferralCodeOwner && referralOwnerCode && (
//               <div
//                 style={{
//                   marginTop: 12,
//                   padding: 12,
//                   borderRadius: 14,
//                   border: "1px solid rgba(15,23,42,0.10)",
//                   background: "rgba(11,92,255,0.05)",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     gap: 10,
//                     flexWrap: "wrap",
//                     alignItems: "center",
//                   }}
//                 >
//                   <span style={styles.pill}>Referral Owner: Ναι</span>

//                   <span style={{ ...styles.pill, background: "#fff" }}>
//                     Code: <code style={{ fontWeight: 900 }}>{referralOwnerCode}</code>
//                   </span>
//                 </div>

//                 <div
//                   style={{
//                     marginTop: 10,
//                     display: "flex",
//                     justifyContent: "flex-end",
//                     gap: 10,
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <button
//                     type="button"
//                     className="bn-btn bn-ref-btn"
//                     onClick={onShowReferralCodeUsage}
//                     disabled={saving}
//                     style={styles.btnGhost}
//                   >
//                     Δες ποιοι χρησιμοποίησαν τον κωδικό σου
//                   </button>
//                 </div>
//               </div>
//             )}

//             {showUseReferralInput && (
//               <div style={{ marginTop: 12 }}>
//                 <div style={styles.label}>Χρήση referral code</div>
//                 <div
//                   className="bn-ref-row"
//                   style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}
//                 >
//                   <input
//                     className="bn-input"
//                     style={styles.input}
//                     type="text"
//                     value={referralCode}
//                     onChange={(e) => setReferralCode(e.target.value)}
//                     placeholder="Γράψε εδώ τον referral code"
//                     disabled={saving}
//                   />
//                   <button
//                     className="bn-btn bn-row-btn"
//                     style={{ ...styles.btn, opacity: saving ? 0.78 : 1 }}
//                     onClick={handleUseReferralCode}
//                     disabled={saving}
//                     type="button"
//                   >
//                     Χρήση
//                   </button>
//                 </div>
//               </div>
//             )}

//             {profile.hasUsedReferralCode && profile.referralCodeUsed && (
//               <div style={{ marginTop: 12 }}>
//                 <span style={styles.pill}>
//                   Referral used: <strong>{profile.referralCodeUsed}</strong>
//                 </span>
//               </div>
//             )}

//             {referralNotice && (
//               <div style={noticeStyle(referralNotice)}>
//                 {referralNotice.type === "success" ? "✅ " : "❌ "}
//                 {referralNotice.text}
//               </div>
//             )}
//           </div>

//           {/* Danger */}
//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//               <button
//                 type="button"
//                 className="bn-btn bn-danger-btn"
//                 onClick={() => setDialog({ kind: "delete" })}
//                 disabled={saving}
//                 style={{ ...styles.btnDanger, opacity: saving ? 0.78 : 1 }}
//               >
//                 Διαγραφή λογαριασμού
//               </button>
//             </div>

//             {dangerNotice && (
//               <div style={noticeStyle(dangerNotice)}>
//                 {dangerNotice.type === "success" ? "✅ " : "❌ "}
//                 {dangerNotice.text}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//   );
// };

// export default UserProfilePage;
// src/components/UserProfilePage.tsx

//////////////////// VERSION 1 /////////////////

// src/components/UserProfilePage.tsx



// import React, { useEffect, useMemo, useRef, useState } from "react";
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
//   AuthUserDto,
// } from "../models/Springboot/UserEntity";

// import {
//   redeemReferralCodeApi,
//   fetchReferralCodeUser,
// } from "../api/Springboot/ReferralCodeService";

// interface UserProfilePageProps {
//   onShowReferralCodeUsage: () => void;
//   onAuthUserUpdated?: (patch: Partial<AuthUserDto>) => void;
//   onSignedOut?: () => void;
// }

// const selectableAvatars: Avatar[] = [
//   "BEARD_MAN_AVATAR",
//   "MAN_AVATAR",
//   "BLONDE_GIRL_AVATAR",
//   "GIRL_AVATAR",
//   "DEFAULT_AVATAR",
// ];

// const avatarImageMap: Record<Avatar, string> = {
//   BEARD_MAN_AVATAR: "/images/BEARD_MAN_AVATAR.png",
//   MAN_AVATAR: "/images/MAN_AVATAR.png",
//   BLONDE_GIRL_AVATAR: "/images/BLONDE_GIRL_AVATAR.png",
//   GIRL_AVATAR: "/images/GIRL_AVATAR.png",
//   DEFAULT_AVATAR: "/images/DEFAULT_AVATAR.png",
//   DEFAULT: "/images/DEFAULT_AVATAR.png",
// };

// const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
// const countries: Country[] = ["Cyprus"];

// type Notice = { type: "success" | "error"; text: string } | null;
// type DialogState = { kind: "upgrade" } | { kind: "delete" } | null;

// const getRolePillStyle = (isAuctioneer: boolean): React.CSSProperties => ({
//   padding: "6px 10px",
//   borderRadius: 999,
//   background: isAuctioneer ? "rgba(42,124,255,0.12)" : "rgba(0,0,0,0.06)",
//   border: isAuctioneer
//     ? "1px solid rgba(42,124,255,0.25)"
//     : "1px solid rgba(0,0,0,0.10)",
//   color: isAuctioneer ? "#1a57d6" : "#333",
//   fontWeight: 900,
//   fontSize: "0.9rem",
// });

// function ConfirmDialog({
//   open,
//   title,
//   description,
//   confirmText,
//   confirmTone,
//   loading,
//   onClose,
//   onConfirm,
// }: {
//   open: boolean;
//   title: string;
//   description: string;
//   confirmText: string;
//   confirmTone: "primary" | "danger";
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
// }) {
//   if (!open) return null;

//   const btnStyleBase: React.CSSProperties = {
//     padding: "10px 12px",
//     borderRadius: 12,
//     fontWeight: 900,
//     cursor: loading ? "not-allowed" : "pointer",
//     border: "1px solid rgba(15,23,42,0.12)",
//     background: "#fff",
//     color: "#0f172a",
//     maxWidth: "100%",
//     boxSizing: "border-box",
//   };

//   const confirmStyle: React.CSSProperties =
//     confirmTone === "danger"
//       ? {
//           ...btnStyleBase,
//           border: "1px solid rgba(220,38,38,0.35)",
//           color: "#b91c1c",
//           background: "rgba(220,38,38,0.06)",
//         }
//       : {
//           ...btnStyleBase,
//           border: "1px solid rgba(11,92,255,0.25)",
//           color: "#0b5cff",
//           background: "rgba(11,92,255,0.08)",
//         };

//   return (
//     <div
//       role="dialog"
//       aria-modal="true"
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(2,6,23,0.55)",
//         display: "grid",
//         placeItems: "center",
//         padding: 14,
//         paddingBottom: `calc(14px + env(safe-area-inset-bottom))`,
//         zIndex: 9999,
//       }}
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div
//         style={{
//           width: "min(520px, 96vw)",
//           borderRadius: 16,
//           background: "#fff",
//           border: "1px solid rgba(15,23,42,0.10)",
//           boxShadow: "0 24px 70px rgba(2,6,23,0.35)",
//           padding: 16,
//           boxSizing: "border-box",
//         }}
//       >
//         <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#0f172a" }}>
//           {title}
//         </div>
//         <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.45 }}>
//           {description}
//         </div>

//         <div
//           style={{
//             marginTop: 14,
//             display: "flex",
//             justifyContent: "flex-end",
//             gap: 10,
//             flexWrap: "wrap",
//           }}
//         >
//           <button type="button" onClick={onClose} disabled={loading} style={btnStyleBase}>
//             Άκυρο
//           </button>
//           <button type="button" onClick={onConfirm} disabled={loading} style={confirmStyle}>
//             {loading ? "Παρακαλώ περίμενε…" : confirmText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function clamp(n: number, min: number, max: number) {
//   return Math.max(min, Math.min(max, n));
// }

// const UserProfilePage: React.FC<UserProfilePageProps> = ({
//   onShowReferralCodeUsage,
//   onAuthUserUpdated,
//   onSignedOut,
// }) => {
//   const [profile, setProfile] = useState<ProfileUserEntity | null>(null);
//   const [loading, setLoading] = useState(true);

//   // editable
//   const [username, setUsername] = useState("");
//   const [selectedAvatar, setSelectedAvatar] = useState<Avatar>("DEFAULT_AVATAR");
//   const [country, setCountry] = useState<Country>("Cyprus");
//   const [region, setRegion] = useState<Region>("NICOSIA");

//   // referral
//   const [referralCode, setReferralCode] = useState("");
//   const [referralOwnerCode, setReferralOwnerCode] = useState<string | null>(null);

//   const [saving, setSaving] = useState(false);

//   // notices
//   const [accountNotice, setAccountNotice] = useState<Notice>(null);
//   const [roleNotice, setRoleNotice] = useState<Notice>(null);
//   const [avatarNotice, setAvatarNotice] = useState<Notice>(null);
//   const [locationNotice, setLocationNotice] = useState<Notice>(null);
//   const [referralNotice, setReferralNotice] = useState<Notice>(null);
//   const [dangerNotice, setDangerNotice] = useState<Notice>(null);

//   const [pageError, setPageError] = useState<string | null>(null);

//   // dialogs
//   const [dialog, setDialog] = useState<DialogState>(null);

//   // ✅ Chat tooltip anchored στο i icon
//   const [chatInfoOpen, setChatInfoOpen] = useState(false);
//   const chatInfoWrapRef = useRef<HTMLDivElement | null>(null);
//   const chatInfoBtnRef = useRef<HTMLButtonElement | null>(null);
//   const tooltipRef = useRef<HTMLDivElement | null>(null);

//   const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>({});
//   const [tooltipArrowLeft, setTooltipArrowLeft] = useState<number>(18);
//   const [tooltipPlacement, setTooltipPlacement] = useState<"below" | "above">("below");

//   const styles: Record<string, React.CSSProperties> = useMemo(
//     () => ({
//       page: {
//         maxWidth: 1100,
//         margin: "0 auto",
//         padding: "20px 14px 40px",
//         width: "100%",
//         overflowX: "hidden",
//         boxSizing: "border-box",
//       },
//       topbar: {
//         display: "flex",
//         alignItems: "flex-end",
//         justifyContent: "space-between",
//         gap: 12,
//         flexWrap: "wrap",
//         marginBottom: 14,
//       },
//       h2: { margin: 0, fontSize: "1.55rem", fontWeight: 900, color: "#0f172a" },

//       grid: {
//         display: "grid",
//         gridTemplateColumns: "1.1fr 0.9fr",
//         gap: 14,
//         alignItems: "start",
//         minWidth: 0,
//       },

//       card: {
//         background: "#fff",
//         border: "1px solid rgba(15,23,42,0.08)",
//         borderRadius: 16,
//         boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
//         padding: 16,
//         width: "100%",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//       },
//       cardTitle: {
//         margin: 0,
//         fontSize: "1.05rem",
//         fontWeight: 900,
//         color: "#0f172a",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//       },
//       cardHint: {
//         marginTop: 6,
//         marginBottom: 0,
//         color: "#64748b",
//         fontSize: "0.9rem",
//       },

//       row: {
//         display: "grid",
//         gridTemplateColumns: "1fr auto",
//         gap: 10,
//         marginTop: 12,
//         minWidth: 0,
//       },
//       label: {
//         fontSize: "0.88rem",
//         fontWeight: 900,
//         color: "#334155",
//         marginBottom: 6,
//       },

//       input: {
//         width: "100%",
//         maxWidth: "100%",
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.14)",
//         outline: "none",
//         fontSize: "0.95rem",
//         background: "#fff",
//         color: "#0f172a",
//         WebkitTextFillColor: "#0f172a",
//         caretColor: "#0b5cff",
//         boxSizing: "border-box",
//       },
//       select: {
//         width: "100%",
//         maxWidth: "100%",
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.14)",
//         outline: "none",
//         fontSize: "0.95rem",
//         background: "#fff",
//         color: "#0f172a",
//         WebkitTextFillColor: "#0f172a",
//         boxSizing: "border-box",
//       },

//       btn: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "#0b5cff",
//         color: "#fff",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//       },
// btnGhost: {
//   padding: "10px 12px",
//   borderRadius: 12,
//   border: "1px solid rgba(15,23,42,0.14)",
//   background: "#fff",
//   color: "#0f172a",
//   fontWeight: 900,
//   cursor: "pointer",
//   whiteSpace: "normal",        // ✅ να σπάει γραμμή
//   lineHeight: 1.2,
//   maxWidth: "100%",            // ✅ να μην ξεπερνά το κουτί
//   width: "100%",               // ✅ σε κινητό να πιάνει όλο το διαθέσιμο
//   textAlign: "center",
//   wordBreak: "break-word",     // ✅ αν χρειαστεί
// },

//       btnDanger: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(220,38,38,0.35)",
//         background: "#fff",
//         color: "#b91c1c",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//       },

//       kv: { margin: "10px 0 0", color: "#334155", fontSize: "0.95rem" },
//       pill: {
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//         padding: "6px 10px",
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "rgba(11,92,255,0.06)",
//         color: "#0f172a",
//         fontWeight: 900,
//         fontSize: "0.86rem",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//       },

//       statusDot: {
//         width: 10,
//         height: 10,
//         borderRadius: 999,
//         boxShadow: "0 8px 16px rgba(15,23,42,0.12)",
//         flex: "0 0 auto",
//       },
//       infoBtn: {
//         width: 22,
//         height: 22,
//         borderRadius: 999,
//         border: "1px solid rgba(0,0,0,0.18)",
//         background: "rgba(255,255,255,0.92)",
//         cursor: "pointer",
//         fontWeight: 900,
//         lineHeight: "22px",
//         display: "inline-grid",
//         placeItems: "center",
//         padding: 0,
//         boxSizing: "border-box",
//       },
//       tooltip: {
//         position: "fixed",
//         zIndex: 9999,
//         width: "min(360px, calc(100vw - 28px))",
//         maxHeight: "min(60vh, 340px)",
//         overflow: "auto",
//         padding: "12px 12px",
//         borderRadius: 14,
//         background: "rgba(20, 20, 20, 0.92)",
//         color: "rgba(255,255,255,0.92)",
//         border: "1px solid rgba(255,255,255,0.12)",
//         boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
//         backdropFilter: "blur(10px)",
//         boxSizing: "border-box",
//       },
//       tooltipArrow: {
//         position: "absolute",
//         width: 12,
//         height: 12,
//         background: "rgba(20, 20, 20, 0.92)",
//         transform: "rotate(45deg)",
//         borderLeft: "1px solid rgba(255,255,255,0.12)",
//         borderTop: "1px solid rgba(255,255,255,0.12)",
//       },
//       tooltipClose: {
//         border: "none",
//         background: "transparent",
//         color: "rgba(255,255,255,0.85)",
//         cursor: "pointer",
//         fontSize: "1.05rem",
//         fontWeight: 900,
//         lineHeight: 1,
//       },

//       roleBox: {
//         marginTop: 14,
//         padding: "0.9rem 1rem",
//         border: "1px solid rgba(0,0,0,0.08)",
//         borderRadius: 12,
//         background: "#fff",
//         boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
//         boxSizing: "border-box",
//       },

//       avatarRow: {
//         display: "grid",
//         gridTemplateColumns: "120px 1fr",
//         gap: 14,
//         alignItems: "start",
//         marginTop: 12,
//         minWidth: 0,
//       },
//       avatarBig: {
//         width: 110,
//         height: 110,
//         borderRadius: "50%",
//         objectFit: "cover",
//         border: "1px solid rgba(15,23,42,0.12)",
//         boxShadow: "0 12px 24px rgba(15,23,42,0.10)",
//         background: "#f1f5f9",
//       },
//       avatarGrid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
//         gap: 10,
//         minWidth: 0,
//       },
//       avatarBtn: {
//         borderRadius: 14,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "#fff",
//         padding: 10,
//         cursor: "pointer",
//         display: "grid",
//         placeItems: "center",
//         position: "relative",
//         boxSizing: "border-box",
//       },
//       avatarBtnActive: {
//         border: "2px solid rgba(11,92,255,0.65)",
//         background: "rgba(11,92,255,0.06)",
//         boxShadow: "0 14px 28px rgba(11,92,255,0.12)",
//       },
//       avatarImg: {
//         width: 52,
//         height: 52,
//         borderRadius: "50%",
//         objectFit: "cover",
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f1f5f9",
//       },
//       checkDot: {
//         position: "absolute",
//         top: 8,
//         right: 8,
//         width: 18,
//         height: 18,
//         borderRadius: 999,
//         background: "#0b5cff",
//         color: "#fff",
//         fontSize: 12,
//         display: "grid",
//         placeItems: "center",
//         boxShadow: "0 10px 18px rgba(11,92,255,0.22)",
//       },

//       alertTop: {
//         marginTop: 10,
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f8fafc",
//         color: "#0f172a",
//         fontSize: "0.92rem",
//         whiteSpace: "pre-line",
//         boxSizing: "border-box",
//       },

//       notice: {
//         marginTop: 10,
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f8fafc",
//         color: "#0f172a",
//         fontSize: "0.92rem",
//         whiteSpace: "pre-line",
//         boxSizing: "border-box",
//       },
//     }),
//     []
//   );

//   const noticeStyle = (n: Notice): React.CSSProperties => {
//     if (!n) return styles.notice;
//     if (n.type === "success") {
//       return {
//         ...styles.notice,
//         borderColor: "rgba(16,185,129,0.25)",
//         background: "rgba(16,185,129,0.06)",
//       };
//     }
//     return {
//       ...styles.notice,
//       borderColor: "rgba(220,38,38,0.25)",
//       background: "rgba(220,38,38,0.06)",
//     };
//   };

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const data = await fetchUserProfile();
//         setProfile(data);

//         setUsername(data.username);
//         setCountry(data.locationDto.country);
//         setRegion(data.locationDto.region);
//         setSelectedAvatar(data.avatarName);

//         if (data.isReferralCodeOwner) {
//           try {
//             const rcUser = await fetchReferralCodeUser();
//             if (rcUser && rcUser.code) setReferralOwnerCode(rcUser.code);
//             else setReferralOwnerCode(null);
//           } catch (err) {
//             console.log("Failed to fetch owner referral code:", err);
//             setReferralOwnerCode(null);
//           }
//         } else {
//           setReferralOwnerCode(null);
//         }

//         setPageError(null);
//       } catch (err: unknown) {
//         console.error(err);
//         setPageError(err instanceof Error ? err.message : "Αποτυχία φόρτωσης προφίλ.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, []);

//   // close tooltip on outside click + Escape
//   useEffect(() => {
//     if (!chatInfoOpen) return;

//     const onMouseDown = (e: MouseEvent) => {
//       const el = chatInfoWrapRef.current;
//       if (!el) return;
//       if (el.contains(e.target as Node)) return;
//       setChatInfoOpen(false);
//     };

//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setChatInfoOpen(false);
//     };

//     window.addEventListener("mousedown", onMouseDown);
//     window.addEventListener("keydown", onKeyDown);
//     return () => {
//       window.removeEventListener("mousedown", onMouseDown);
//       window.removeEventListener("keydown", onKeyDown);
//     };
//   }, [chatInfoOpen]);

//   const computeTooltipPosition = () => {
//     const btn = chatInfoBtnRef.current;
//     if (!btn) return;

//     const rect = btn.getBoundingClientRect();
//     const vw = window.innerWidth;
//     const vh = window.innerHeight;

//     const sidePad = 14;
//     const gap = 10;

//     const width = Math.min(360, vw - sidePad * 2);
//     const left = clamp(rect.left + rect.width / 2 - width / 2, sidePad, vw - width - sidePad);

//     const centerX = rect.left + rect.width / 2;
//     const arrowLeft = clamp(centerX - left, 14, width - 14);
//     setTooltipArrowLeft(arrowLeft);

//     const tip = tooltipRef.current;
//     const h = tip ? tip.getBoundingClientRect().height : 260;

//     let placement: "below" | "above" = "below";
//     let top = rect.bottom + gap;

//     if (top + h + sidePad > vh) {
//       placement = "above";
//       top = rect.top - gap - h;
//     }

//     top = clamp(top, sidePad, vh - h - sidePad);

//     setTooltipPlacement(placement);
//     setTooltipPos({
//       position: "fixed",
//       zIndex: 9999,
//       width,
//       left,
//       top,
//     });
//   };

//   useEffect(() => {
//     if (!chatInfoOpen) return;

//     const r1 = window.requestAnimationFrame(() => {
//       computeTooltipPosition();
//     });
//     const r2 = window.requestAnimationFrame(() => {
//       computeTooltipPosition();
//     });

//     const onResize = () => computeTooltipPosition();
//     const onScroll = () => computeTooltipPosition();

//     window.addEventListener("resize", onResize);
//     window.addEventListener("scroll", onScroll, true);

//     return () => {
//       window.cancelAnimationFrame(r1);
//       window.cancelAnimationFrame(r2);
//       window.removeEventListener("resize", onResize);
//       window.removeEventListener("scroll", onScroll, true);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [chatInfoOpen]);

//   const withUiState = async (fn: () => Promise<void>) => {
//     setSaving(true);
//     setPageError(null);
//     try {
//       await fn();
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveUsername = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setAccountNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateUsername(username);
//         setProfile({ ...p0, username });
//         onAuthUserUpdated?.({ username });
//       });

//       setAccountNotice({ type: "success", text: "Το username αποθηκεύτηκε." });
//     } catch (err: unknown) {
//       setAccountNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Αποτυχία αποθήκευσης username.",
//       });
//     }
//   };

//   const handleConfirmUpgrade = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setRoleNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateRole("Auctioneer");
//         setProfile({ ...p0, role: "Auctioneer" });
//         onAuthUserUpdated?.({ roleName: "Auctioneer" });
//       });

//       setRoleNotice({ type: "success", text: "Έγινε upgrade σε Auctioneer." });
//       setDialog(null);
//     } catch (err: unknown) {
//       setRoleNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Αποτυχία upgrade σε Auctioneer.",
//       });
//       setDialog(null);
//     }
//   };

//   const handleSaveAvatar = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setAvatarNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateAvatar(selectedAvatar);
//         setProfile({
//           ...p0,
//           avatarName: selectedAvatar,
//           avatarUrl: avatarImageMap[selectedAvatar],
//         });
//       });

//       setAvatarNotice({ type: "success", text: "Το avatar αποθηκεύτηκε." });
//     } catch (err: unknown) {
//       setAvatarNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Αποτυχία αποθήκευσης avatar.",
//       });
//     }
//   };

//   const handleSaveLocation = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setLocationNotice(null);

//     try {
//       await withUiState(async () => {
//         const location: LocationDto = { country, region };
//         await updateLocation(location);
//         setProfile({ ...p0, locationDto: location });
//       });

//       setLocationNotice({ type: "success", text: "Η τοποθεσία αποθηκεύτηκε." });
//     } catch (err: unknown) {
//       setLocationNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Αποτυχία αποθήκευσης τοποθεσίας.",
//       });
//     }
//   };

//   const handleUseReferralCode = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setReferralNotice(null);

//     if (!referralCode.trim()) {
//       setReferralNotice({ type: "error", text: "Γράψε πρώτα ένα referral code." });
//       return;
//     }

//     try {
//       await withUiState(async () => {
//         await redeemReferralCodeApi(referralCode.trim());
//         const updated = await fetchUserProfile();
//         setProfile(updated);
//         setReferralCode("");
//       });

//       setReferralNotice({ type: "success", text: "Το referral code εφαρμόστηκε!" });
//     } catch (err: unknown) {
//       setReferralNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Αποτυχία χρήσης referral code.",
//       });
//     }
//   };

//   const handleConfirmDeleteAccount = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setDangerNotice(null);

//     try {
//       await withUiState(async () => {
//         await deleteUserAccount();
//         logout();
//         setProfile(null);
//         onSignedOut?.();
//       });

//       setDialog(null);
//     } catch (err: unknown) {
//       setDangerNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Αποτυχία διαγραφής λογαριασμού.",
//       });
//       setDialog(null);
//     }
//   };

//   if (loading) return <p style={{ padding: "1rem" }}>Φόρτωση προφίλ...</p>;
//   if (!profile) return <p style={{ padding: "1rem" }}>Δεν βρέθηκε προφίλ χρήστη.</p>;

//   const p = profile;

//   const showUseReferralInput = !p.isReferralCodeOwner && !p.hasUsedReferralCode;
//   const currentAvatarSrc =
//     (p.avatarUrl && p.avatarUrl.trim() ? p.avatarUrl : "") ||
//     avatarImageMap[p.avatarName] ||
//     avatarImageMap.DEFAULT_AVATAR;

//   const isAuctioneer = p.role === "Auctioneer";
//   const isBidder = p.role === "Bidder";
//   const chatEligible = p.eligibleForChat === true;

//   return (
//     <div className="bn-profile-page" style={styles.page}>
//       <style>{`
//         /* Lock box-sizing locally (fix overflow) */
//         .bn-profile-page, .bn-profile-page * { box-sizing: border-box !important; }
//         .bn-profile-page { overflow-x: hidden !important; }

//         /* prevent grid children from forcing width */
//         .bn-profile-grid, .bn-profile-grid * { min-width: 0; }

//         @media (max-width: 920px) {
//           .bn-profile-grid { grid-template-columns: 1fr !important; }
//         }

//         @media (max-width: 520px) {
//           .bn-profile-page { padding: 14px 12px 28px !important; }
//           .bn-card { padding: 14px !important; border-radius: 14px !important; }
//           .bn-topbar { align-items: flex-start !important; }

//           .bn-row { grid-template-columns: 1fr !important; }
//           .bn-row .bn-btn-wide { width: 100% !important; justify-self: stretch !important; }
//           .bn-two-col { grid-template-columns: 1fr !important; }
//           .bn-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
//           .bn-avatar-row { grid-template-columns: 1fr !important; }

//           .bn-delete-row { justify-content: center !important; }
//           .bn-pill { flex-wrap: wrap !important; }
//         }

//         @media (max-width: 360px) {
//           .bn-avatar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
//         }

//         /* text visibility on mobile + iOS autofill */
//         .bn-input, .bn-select {
//           color: #0f172a !important;
//           -webkit-text-fill-color: #0f172a !important;
//           background: #fff !important;
//         }
//         .bn-input::placeholder { color: rgba(51,65,85,0.55) !important; }
//         .bn-input:-webkit-autofill {
//           -webkit-text-fill-color: #0f172a !important;
//           box-shadow: 0 0 0 1000px #fff inset !important;
//         }

//         @media (max-width: 520px) { .bn-input, .bn-select { font-size: 16px !important; } }

//         .bn-btn { transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease; }
//         .bn-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }

//         .bn-input:focus, .bn-select:focus {
//           box-shadow: 0 0 0 4px rgba(11,92,255,0.12);
//           border-color: rgba(11,92,255,0.45);
//         }

//         .bn-avatar-btn { transition: transform 160ms ease, box-shadow 160ms ease; }
//         .bn-avatar-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 22px rgba(15,23,42,0.08); }

//         .bn-info-btn:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(11,92,255,0.18); }
//       `}</style>

//       <ConfirmDialog
//         open={dialog?.kind === "upgrade"}
//         title="Upgrade σε Auctioneer"
//         description="Είσαι σίγουρος ότι θέλεις να κάνεις upgrade σε Auctioneer;"
//         confirmText="Ναι, upgrade"
//         confirmTone="primary"
//         loading={saving}
//         onClose={() => setDialog(null)}
//         onConfirm={handleConfirmUpgrade}
//       />

//       <ConfirmDialog
//         open={dialog?.kind === "delete"}
//         title="Διαγραφή λογαριασμού"
//         description="Είσαι σίγουρος; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
//         confirmText="Ναι, διαγραφή"
//         confirmTone="danger"
//         loading={saving}
//         onClose={() => setDialog(null)}
//         onConfirm={handleConfirmDeleteAccount}
//       />

//       <div className="bn-topbar" style={styles.topbar}>
//         <div>
//           <h2 style={styles.h2}>Το προφίλ μου</h2>
//         </div>

//         <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
//           {saving && <span style={styles.pill}>Αποθήκευση…</span>}

//           <div ref={chatInfoWrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
//             <span
//               className="bn-pill"
//               style={{
//                 ...styles.pill,
//                 background: chatEligible ? "rgba(16,185,129,0.08)" : "rgba(220,38,38,0.06)",
//                 borderColor: chatEligible ? "rgba(16,185,129,0.25)" : "rgba(220,38,38,0.22)",
//               }}
//             >
//               <span style={{ ...styles.statusDot, background: chatEligible ? "#10b981" : "#ef4444" }} />
//               <span style={{ opacity: 0.9 }}>Chat πρόσβαση:</span>
//               <strong style={{ color: chatEligible ? "#0b7a2a" : "#b00020" }}>
//                 {chatEligible ? "Ενεργό" : "Κλειστό"}
//               </strong>

//               <button
//                 ref={chatInfoBtnRef}
//                 type="button"
//                 className="bn-info-btn"
//                 onClick={() => setChatInfoOpen((v) => !v)}
//                 aria-label="Πληροφορίες για το chat"
//                 aria-expanded={chatInfoOpen}
//                 style={{
//                   ...styles.infoBtn,
//                   opacity: saving ? 0.7 : 1,
//                   cursor: saving ? "not-allowed" : "pointer",
//                 }}
//                 disabled={saving}
//               >
//                 i
//               </button>
//             </span>

//             {chatInfoOpen && (
//               <div ref={tooltipRef} role="dialog" aria-label="Λεπτομέρειες Chat" style={{ ...styles.tooltip, ...tooltipPos }}>
//                 <div
//                   style={{
//                     ...styles.tooltipArrow,
//                     left: tooltipArrowLeft - 6,
//                     ...(tooltipPlacement === "below" ? { top: -7 } : { bottom: -7 }),
//                   }}
//                 />

//                 <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
//                   <strong style={{ fontSize: "0.95rem" }}>Chat πληροφορίες</strong>
//                   <button
//                     type="button"
//                     onClick={() => setChatInfoOpen(false)}
//                     aria-label="Κλείσιμο"
//                     style={styles.tooltipClose}
//                   >
//                     ×
//                   </button>
//                 </div>

//                 <div style={{ marginTop: 8, fontSize: "0.88rem", color: "rgba(255,255,255,0.82)" }}>
//                   {chatEligible ? (
//                     <>
//                       ✅ <strong style={{ color: "#a7f3d0" }}>Η πρόσβαση στο chat είναι ενεργή.</strong>
//                       <div style={{ marginTop: 8, lineHeight: 1.55 }}>
//                         Μπορείς να κάνεις chat σε <strong>κάθε auction</strong> χωρίς περιορισμούς.
//                         <div style={{ marginTop: 6, opacity: 0.9 }}>
//                           Tip: Χρησιμοποίησέ το για γρήγορη συνεννόηση και διευκρινίσεις.
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       Δεν έχεις ακόμα πρόσβαση στο chat. Θα ανοίξει όταν συμβεί ένα από τα παρακάτω:
//                       <ol style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: "0.88rem", lineHeight: 1.55 }}>
//                         <li>
//                           Κάνεις <strong>bid</strong> σε ένα auction <span style={{ opacity: 0.85 }}>(chat μόνο σε αυτό)</span>
//                         </li>
//                         <li>
//                           <strong>Κερδίσεις</strong> ένα auction <span style={{ opacity: 0.85 }}>(chat σε όλα)</span>
//                         </li>
//                         <li>
//                           Βάλεις <strong>δικό σου</strong> auction <span style={{ opacity: 0.85 }}>(chat σε όλα)</span>
//                         </li>
//                       </ol>
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {pageError && (
//         <div
//           style={{
//             ...styles.alertTop,
//             borderColor: "rgba(220,38,38,0.25)",
//             background: "rgba(220,38,38,0.06)",
//           }}
//         >
//           <strong>Σφάλμα:</strong> {pageError}
//         </div>
//       )}

//       <div className="bn-profile-grid" style={styles.grid}>
//         {/* LEFT */}
//         <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Λογαριασμός</div>

//             <div className="bn-row" style={styles.row}>
//               <div style={{ minWidth: 0 }}>
//                 <div style={styles.label}>Username</div>
//                 <input
//                   className="bn-input"
//                   style={styles.input}
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   disabled={saving}
//                 />
//               </div>

//               <button
//                 className="bn-btn bn-btn-wide"
//                 style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
//                 onClick={handleSaveUsername}
//                 disabled={saving}
//                 type="button"
//               >
//                 Αποθήκευση
//               </button>
//             </div>

//             {accountNotice && (
//               <div style={noticeStyle(accountNotice)}>
//                 {accountNotice.type === "success" ? "✅ " : "❌ "}
//                 {accountNotice.text}
//               </div>
//             )}

//             <div style={styles.kv}>
//               <strong>Email:</strong> {p.email}
//             </div>
//             <div style={styles.kv}>
//               <strong>Τηλέφωνο:</strong> {p.phoneNumber}
//             </div>

//             <div style={styles.roleBox}>
//               <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//                 <strong>Ρόλος:</strong>
//                 <span style={getRolePillStyle(isAuctioneer)}>{p.role}</span>
//               </div>

//               {isBidder ? (
//                 <>
//                   <p style={{ margin: "10px 0 0" }} />
//                   <button
//                     type="button"
//                     onClick={() => setDialog({ kind: "upgrade" })}
//                     disabled={saving}
//                     className="bn-btn"
//                     style={{
//                       padding: "0.55rem 0.95rem",
//                       borderRadius: 10,
//                       border: "1px solid rgba(42,124,255,0.25)",
//                       background: "rgba(42,124,255,0.12)",
//                       color: "#1a57d6",
//                       fontWeight: 900,
//                       cursor: saving ? "not-allowed" : "pointer",
//                       maxWidth: "100%",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     Upgrade σε Auctioneer
//                   </button>

//                   <div style={{ marginTop: 8, fontSize: "0.86rem", color: "#666" }}>
//                     Tip: Αν θέλεις να δημιουργείς auctions και να πουλάς items, μπορείς να
//                     κάνεις upgrade σε <strong>Auctioneer</strong>.
//                   </div>
//                 </>
//               ) : null}

//               {roleNotice && (
//                 <div style={noticeStyle(roleNotice)}>
//                   {roleNotice.type === "success" ? "✅ " : "❌ "}
//                   {roleNotice.text}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Τοποθεσία</div>

//             <div
//               className="bn-two-col"
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 10,
//                 marginTop: 12,
//                 minWidth: 0,
//               }}
//             >
//               <div style={{ minWidth: 0 }}>
//                 <div style={styles.label}>Country</div>
//                 <select
//                   className="bn-select"
//                   style={styles.select}
//                   value={country}
//                   onChange={(e) => setCountry(e.target.value as Country)}
//                   disabled={saving}
//                 >
//                   {countries.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div style={{ minWidth: 0 }}>
//                 <div style={styles.label}>Region</div>
//                 <select
//                   className="bn-select"
//                   style={styles.select}
//                   value={region}
//                   onChange={(e) => setRegion(e.target.value as Region)}
//                   disabled={saving}
//                 >
//                   {regions.map((r) => (
//                     <option key={r} value={r}>
//                       {r}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//               <button
//                 className="bn-btn bn-btn-wide"
//                 style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
//                 onClick={handleSaveLocation}
//                 disabled={saving}
//                 type="button"
//               >
//                 Αποθήκευση τοποθεσίας
//               </button>
//             </div>

//             {locationNotice && (
//               <div style={noticeStyle(locationNotice)}>
//                 {locationNotice.type === "success" ? "✅ " : "❌ "}
//                 {locationNotice.text}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Avatar</div>

//             <div className="bn-avatar-row" style={styles.avatarRow}>
//               <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
//                 <img src={currentAvatarSrc} alt="Current avatar" style={styles.avatarBig} />
//                 <span style={{ color: "#64748b", fontSize: "0.86rem", fontWeight: 900 }}>
//                   Τρέχον
//                 </span>
//               </div>

//               <div style={{ minWidth: 0 }}>
//                 <div className="bn-avatar-grid" style={styles.avatarGrid}>
//                   {selectableAvatars.map((av) => {
//                     const isSelected = selectedAvatar === av;
//                     const imgSrc = avatarImageMap[av];

//                     return (
//                       <button
//                         key={av}
//                         type="button"
//                         className="bn-avatar-btn"
//                         onClick={() => setSelectedAvatar(av)}
//                         disabled={saving}
//                         aria-pressed={isSelected}
//                         style={{
//                           ...styles.avatarBtn,
//                           ...(isSelected ? styles.avatarBtnActive : {}),
//                           opacity: saving ? 0.7 : 1,
//                         }}
//                         title={av.replace("_AVATAR", "").replace(/_/g, " ")}
//                       >
//                         {isSelected && <div style={styles.checkDot}>✓</div>}
//                         <img src={imgSrc} alt={av} style={styles.avatarImg} />
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//                   <button
//                     className="bn-btn bn-btn-wide"
//                     style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
//                     onClick={handleSaveAvatar}
//                     disabled={saving}
//                     type="button"
//                   >
//                     Αποθήκευση Avatar
//                   </button>
//                 </div>

//                 {avatarNotice && (
//                   <div style={noticeStyle(avatarNotice)}>
//                     {avatarNotice.type === "success" ? "✅ " : "❌ "}
//                     {avatarNotice.text}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Reward Points</div>
//             <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
//               <div style={styles.kv}>
//                 <strong>Reward Points:</strong> {p.rewardPoints}
//               </div>
//               <div style={styles.kv}>
//                 <strong>All time Reward Points:</strong> {p.allTimeRewardPoints}
//               </div>
//             </div>
//           </div>

//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Referral</div>
//             <p style={styles.cardHint}>Κέρδισε πόντους με referral codes.</p>

//             {p.isReferralCodeOwner && referralOwnerCode && (
//               <div
//                 style={{
//                   marginTop: 12,
//                   padding: 12,
//                   borderRadius: 14,
//                   border: "1px solid rgba(15,23,42,0.10)",
//                   background: "rgba(11,92,255,0.05)",
//                 }}
//               >
//                 <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
//                   <span style={styles.pill}>Referral Owner: Ναι</span>

//                   <span style={{ ...styles.pill, background: "#fff" }}>
//                     Code: <code style={{ fontWeight: 900 }}>{referralOwnerCode}</code>
//                   </span>
//                 </div>

//                 <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
//                   <button
//                     type="button"
//                     className="bn-btn"
//                     onClick={onShowReferralCodeUsage}
//                     disabled={saving}
//                     style={styles.btnGhost}
//                   >
//                     Δες ποιοι χρησιμοποίησαν τον κωδικό σου
//                   </button>
//                 </div>
//               </div>
//             )}

//             {showUseReferralInput && (
//               <div style={{ marginTop: 12 }}>
//                 <div style={styles.label}>Χρήση referral code</div>
//                 <div className="bn-row" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
//                   <input
//                     className="bn-input"
//                     style={styles.input}
//                     type="text"
//                     value={referralCode}
//                     onChange={(e) => setReferralCode(e.target.value)}
//                     placeholder="Γράψε εδώ τον referral code"
//                     disabled={saving}
//                   />
//                   <button
//                     className="bn-btn bn-btn-wide"
//                     style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
//                     onClick={handleUseReferralCode}
//                     disabled={saving}
//                     type="button"
//                   >
//                     Χρήση
//                   </button>
//                 </div>
//               </div>
//             )}

//             {p.hasUsedReferralCode && p.referralCodeUsed && (
//               <div style={{ marginTop: 12 }}>
//                 <span style={styles.pill}>
//                   Referral used: <strong>{p.referralCodeUsed}</strong>
//                 </span>
//               </div>
//             )}

//             {referralNotice && (
//               <div style={noticeStyle(referralNotice)}>
//                 {referralNotice.type === "success" ? "✅ " : "❌ "}
//                 {referralNotice.text}
//               </div>
//             )}
//           </div>

//           {/* ONE delete button: δεξιά κάτω σε 2 στήλες, κέντρο κάτω σε 1 στήλη */}
//           <div className="bn-delete-row" style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//             <div style={{ display: "grid", gap: 10, width: "min(520px, 100%)" }}>
//               <button
//                 type="button"
//                 className="bn-btn"
//                 onClick={() => setDialog({ kind: "delete" })}
//                 disabled={saving}
//                 style={{ ...styles.btnDanger, opacity: saving ? 0.78 : 1, width: "100%" }}
//               >
//                 Διαγραφή λογαριασμού
//               </button>

//               {dangerNotice && (
//                 <div style={noticeStyle(dangerNotice)}>
//                   {dangerNotice.type === "success" ? "✅ " : "❌ "}
//                   {dangerNotice.text}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfilePage;











// src/components/UserProfilePage.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
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
//   AuthUserDto,
// } from "../models/Springboot/UserEntity";

// import {
//   redeemReferralCodeApi,
//   fetchReferralCodeUser,
// } from "../api/Springboot/ReferralCodeService";

// interface UserProfilePageProps {
//   onShowReferralCodeUsage: () => void;
//   onAuthUserUpdated?: (patch: Partial<AuthUserDto>) => void;
//   onSignedOut?: () => void;
// }

// const selectableAvatars: Avatar[] = [
//   "BEARD_MAN_AVATAR",
//   "MAN_AVATAR",
//   "BLONDE_GIRL_AVATAR",
//   "GIRL_AVATAR",
//   "DEFAULT_AVATAR",
// ];

// const avatarImageMap: Record<Avatar, string> = {
//   BEARD_MAN_AVATAR: "/images/BEARD_MAN_AVATAR.png",
//   MAN_AVATAR: "/images/MAN_AVATAR.png",
//   BLONDE_GIRL_AVATAR: "/images/BLONDE_GIRL_AVATAR.png",
//   GIRL_AVATAR: "/images/GIRL_AVATAR.png",
//   DEFAULT_AVATAR: "/images/DEFAULT_AVATAR.png",
//   DEFAULT: "/images/DEFAULT_AVATAR.png",
// };

// const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
// const countries: Country[] = ["Cyprus"];

// type Notice = { type: "success" | "error"; text: string } | null;
// type DialogState = { kind: "upgrade" } | { kind: "delete" } | null;

// const getRolePillStyle = (isAuctioneer: boolean): React.CSSProperties => ({
//   padding: "6px 10px",
//   borderRadius: 999,
//   background: isAuctioneer ? "rgba(42,124,255,0.12)" : "rgba(0,0,0,0.06)",
//   border: isAuctioneer
//     ? "1px solid rgba(42,124,255,0.25)"
//     : "1px solid rgba(0,0,0,0.10)",
//   color: isAuctioneer ? "#1a57d6" : "#333",
//   fontWeight: 900,
//   fontSize: "0.9rem",
// });

// function ConfirmDialog({
//   open,
//   title,
//   description,
//   confirmText,
//   confirmTone,
//   loading,
//   onClose,
//   onConfirm,
// }: {
//   open: boolean;
//   title: string;
//   description: string;
//   confirmText: string;
//   confirmTone: "primary" | "danger";
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
// }) {
//   if (!open) return null;

//   const btnStyleBase: React.CSSProperties = {
//     padding: "10px 12px",
//     borderRadius: 12,
//     fontWeight: 900,
//     cursor: loading ? "not-allowed" : "pointer",
//     border: "1px solid rgba(15,23,42,0.12)",
//     background: "#fff",
//     color: "#0f172a",
//     maxWidth: "100%",
//     boxSizing: "border-box",
//   };

//   const confirmStyle: React.CSSProperties =
//     confirmTone === "danger"
//       ? {
//           ...btnStyleBase,
//           border: "1px solid rgba(220,38,38,0.35)",
//           color: "#b91c1c",
//           background: "rgba(220,38,38,0.06)",
//         }
//       : {
//           ...btnStyleBase,
//           border: "1px solid rgba(11,92,255,0.25)",
//           color: "#0b5cff",
//           background: "rgba(11,92,255,0.08)",
//         };

//   return (
//     <div
//       role="dialog"
//       aria-modal="true"
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(2,6,23,0.55)",
//         display: "grid",
//         placeItems: "center",
//         padding: 14,
//         paddingBottom: `calc(14px + env(safe-area-inset-bottom))`,
//         zIndex: 9999,
//       }}
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div
//         style={{
//           width: "min(520px, 96vw)",
//           borderRadius: 16,
//           background: "#fff",
//           border: "1px solid rgba(15,23,42,0.10)",
//           boxShadow: "0 24px 70px rgba(2,6,23,0.35)",
//           padding: 16,
//           boxSizing: "border-box",
//         }}
//       >
//         <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#0f172a" }}>
//           {title}
//         </div>
//         <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.45 }}>
//           {description}
//         </div>

//         <div
//           style={{
//             marginTop: 14,
//             display: "flex",
//             justifyContent: "flex-end",
//             gap: 10,
//             flexWrap: "wrap",
//           }}
//         >
//           <button type="button" onClick={onClose} disabled={loading} style={btnStyleBase}>
//             Cancel
//           </button>
//           <button type="button" onClick={onConfirm} disabled={loading} style={confirmStyle}>
//             {loading ? "Please wait…" : confirmText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function clamp(n: number, min: number, max: number) {
//   return Math.max(min, Math.min(max, n));
// }

// const UserProfilePage: React.FC<UserProfilePageProps> = ({
//   onShowReferralCodeUsage,
//   onAuthUserUpdated,
//   onSignedOut,
// }) => {
//   const [profile, setProfile] = useState<ProfileUserEntity | null>(null);
//   const [loading, setLoading] = useState(true);

//   // editable
//   const [username, setUsername] = useState("");
//   const [selectedAvatar, setSelectedAvatar] = useState<Avatar>("DEFAULT_AVATAR");
//   const [country, setCountry] = useState<Country>("Cyprus");
//   const [region, setRegion] = useState<Region>("NICOSIA");

//   // referral
//   const [referralCode, setReferralCode] = useState("");
//   const [referralOwnerCode, setReferralOwnerCode] = useState<string | null>(null);

//   const [saving, setSaving] = useState(false);

//   // notices
//   const [accountNotice, setAccountNotice] = useState<Notice>(null);
//   const [roleNotice, setRoleNotice] = useState<Notice>(null);
//   const [avatarNotice, setAvatarNotice] = useState<Notice>(null);
//   const [locationNotice, setLocationNotice] = useState<Notice>(null);
//   const [referralNotice, setReferralNotice] = useState<Notice>(null);
//   const [dangerNotice, setDangerNotice] = useState<Notice>(null);

//   const [pageError, setPageError] = useState<string | null>(null);

//   // dialogs
//   const [dialog, setDialog] = useState<DialogState>(null);

//   // ✅ Chat tooltip anchored στο i icon
//   const [chatInfoOpen, setChatInfoOpen] = useState(false);
//   const chatInfoWrapRef = useRef<HTMLDivElement | null>(null);
//   const chatInfoBtnRef = useRef<HTMLButtonElement | null>(null);
//   const tooltipRef = useRef<HTMLDivElement | null>(null);

//   const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>({});
//   const [tooltipArrowLeft, setTooltipArrowLeft] = useState<number>(18);
//   const [tooltipPlacement, setTooltipPlacement] = useState<"below" | "above">("below");

//   const styles: Record<string, React.CSSProperties> = useMemo(
//     () => ({
//       page: {
//         maxWidth: 1100,
//         margin: "0 auto",
//         padding: "20px 14px 40px",
//         width: "100%",
//         overflowX: "hidden",
//         boxSizing: "border-box",
//       },
//       topbar: {
//         display: "flex",
//         alignItems: "flex-end",
//         justifyContent: "space-between",
//         gap: 12,
//         flexWrap: "wrap",
//         marginBottom: 14,
//       },
//       h2: { margin: 0, fontSize: "1.55rem", fontWeight: 900, color: "#0f172a" },

//       grid: {
//         display: "grid",
//         gridTemplateColumns: "1.1fr 0.9fr",
//         gap: 14,
//         alignItems: "start",
//         minWidth: 0,
//       },

//       card: {
//         background: "#fff",
//         border: "1px solid rgba(15,23,42,0.08)",
//         borderRadius: 16,
//         boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
//         padding: 16,
//         width: "100%",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//       },
//       cardTitle: {
//         margin: 0,
//         fontSize: "1.05rem",
//         fontWeight: 900,
//         color: "#0f172a",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 10,
//       },
//       cardHint: {
//         marginTop: 6,
//         marginBottom: 0,
//         color: "#64748b",
//         fontSize: "0.9rem",
//       },

//       row: {
//         display: "grid",
//         gridTemplateColumns: "1fr auto",
//         gap: 10,
//         marginTop: 12,
//         minWidth: 0,
//       },
//       label: {
//         fontSize: "0.88rem",
//         fontWeight: 900,
//         color: "#334155",
//         marginBottom: 6,
//       },

//       input: {
//         width: "100%",
//         maxWidth: "100%",
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.14)",
//         outline: "none",
//         fontSize: "0.95rem",
//         background: "#fff",
//         color: "#0f172a",
//         WebkitTextFillColor: "#0f172a",
//         caretColor: "#0b5cff",
//         boxSizing: "border-box",
//       },
//       select: {
//         width: "100%",
//         maxWidth: "100%",
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.14)",
//         outline: "none",
//         fontSize: "0.95rem",
//         background: "#fff",
//         color: "#0f172a",
//         WebkitTextFillColor: "#0f172a",
//         boxSizing: "border-box",
//       },

//       btn: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "#0b5cff",
//         color: "#fff",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//       },
//       btnGhost: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.14)",
//         background: "#fff",
//         color: "#0f172a",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "normal", // ✅ να σπάει γραμμή
//         lineHeight: 1.2,
//         maxWidth: "100%", // ✅ να μην ξεπερνά το κουτί
//         width: "100%", // ✅ σε κινητό να πιάνει όλο το διαθέσιμο
//         textAlign: "center",
//         wordBreak: "break-word", // ✅ αν χρειαστεί
//       },

//       btnDanger: {
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(220,38,38,0.35)",
//         background: "#fff",
//         color: "#b91c1c",
//         fontWeight: 900,
//         cursor: "pointer",
//         whiteSpace: "nowrap",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//       },

//       kv: { margin: "10px 0 0", color: "#334155", fontSize: "0.95rem" },
//       pill: {
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//         padding: "6px 10px",
//         borderRadius: 999,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "rgba(11,92,255,0.06)",
//         color: "#0f172a",
//         fontWeight: 900,
//         fontSize: "0.86rem",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//       },

//       statusDot: {
//         width: 10,
//         height: 10,
//         borderRadius: 999,
//         boxShadow: "0 8px 16px rgba(15,23,42,0.12)",
//         flex: "0 0 auto",
//       },
//       infoBtn: {
//         width: 22,
//         height: 22,
//         borderRadius: 999,
//         border: "1px solid rgba(0,0,0,0.18)",
//         background: "rgba(255,255,255,0.92)",
//         cursor: "pointer",
//         fontWeight: 900,
//         lineHeight: "22px",
//         display: "inline-grid",
//         placeItems: "center",
//         padding: 0,
//         boxSizing: "border-box",
//       },
//       tooltip: {
//         position: "fixed",
//         zIndex: 9999,
//         width: "min(360px, calc(100vw - 28px))",
//         maxHeight: "min(60vh, 340px)",
//         overflow: "auto",
//         padding: "12px 12px",
//         borderRadius: 14,
//         background: "rgba(20, 20, 20, 0.92)",
//         color: "rgba(255,255,255,0.92)",
//         border: "1px solid rgba(255,255,255,0.12)",
//         boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
//         backdropFilter: "blur(10px)",
//         boxSizing: "border-box",
//       },
//       tooltipArrow: {
//         position: "absolute",
//         width: 12,
//         height: 12,
//         background: "rgba(20, 20, 20, 0.92)",
//         transform: "rotate(45deg)",
//         borderLeft: "1px solid rgba(255,255,255,0.12)",
//         borderTop: "1px solid rgba(255,255,255,0.12)",
//       },
//       tooltipClose: {
//         border: "none",
//         background: "transparent",
//         color: "rgba(255,255,255,0.85)",
//         cursor: "pointer",
//         fontSize: "1.05rem",
//         fontWeight: 900,
//         lineHeight: 1,
//       },

//       roleBox: {
//         marginTop: 14,
//         padding: "0.9rem 1rem",
//         border: "1px solid rgba(0,0,0,0.08)",
//         borderRadius: 12,
//         background: "#fff",
//         boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
//         boxSizing: "border-box",
//       },

//       avatarRow: {
//         display: "grid",
//         gridTemplateColumns: "120px 1fr",
//         gap: 14,
//         alignItems: "start",
//         marginTop: 12,
//         minWidth: 0,
//       },
//       avatarBig: {
//         width: 110,
//         height: 110,
//         borderRadius: "50%",
//         objectFit: "cover",
//         border: "1px solid rgba(15,23,42,0.12)",
//         boxShadow: "0 12px 24px rgba(15,23,42,0.10)",
//         background: "#f1f5f9",
//       },
//       avatarGrid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
//         gap: 10,
//         minWidth: 0,
//       },
//       avatarBtn: {
//         borderRadius: 14,
//         border: "1px solid rgba(15,23,42,0.12)",
//         background: "#fff",
//         padding: 10,
//         cursor: "pointer",
//         display: "grid",
//         placeItems: "center",
//         position: "relative",
//         boxSizing: "border-box",
//       },
//       avatarBtnActive: {
//         border: "2px solid rgba(11,92,255,0.65)",
//         background: "rgba(11,92,255,0.06)",
//         boxShadow: "0 14px 28px rgba(11,92,255,0.12)",
//       },
//       avatarImg: {
//         width: 52,
//         height: 52,
//         borderRadius: "50%",
//         objectFit: "cover",
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f1f5f9",
//       },
//       checkDot: {
//         position: "absolute",
//         top: 8,
//         right: 8,
//         width: 18,
//         height: 18,
//         borderRadius: 999,
//         background: "#0b5cff",
//         color: "#fff",
//         fontSize: 12,
//         display: "grid",
//         placeItems: "center",
//         boxShadow: "0 10px 18px rgba(11,92,255,0.22)",
//       },

//       alertTop: {
//         marginTop: 10,
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f8fafc",
//         color: "#0f172a",
//         fontSize: "0.92rem",
//         whiteSpace: "pre-line",
//         boxSizing: "border-box",
//       },

//       notice: {
//         marginTop: 10,
//         padding: "10px 12px",
//         borderRadius: 12,
//         border: "1px solid rgba(15,23,42,0.10)",
//         background: "#f8fafc",
//         color: "#0f172a",
//         fontSize: "0.92rem",
//         whiteSpace: "pre-line",
//         boxSizing: "border-box",
//       },
//     }),
//     []
//   );

//   const noticeStyle = (n: Notice): React.CSSProperties => {
//     if (!n) return styles.notice;
//     if (n.type === "success") {
//       return {
//         ...styles.notice,
//         borderColor: "rgba(16,185,129,0.25)",
//         background: "rgba(16,185,129,0.06)",
//       };
//     }
//     return {
//       ...styles.notice,
//       borderColor: "rgba(220,38,38,0.25)",
//       background: "rgba(220,38,38,0.06)",
//     };
//   };

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const data = await fetchUserProfile();
//         setProfile(data);

//         setUsername(data.username);
//         setCountry(data.locationDto.country);
//         setRegion(data.locationDto.region);
//         setSelectedAvatar(data.avatarName);

//         if (data.isReferralCodeOwner) {
//           try {
//             const rcUser = await fetchReferralCodeUser();
//             if (rcUser && rcUser.code) setReferralOwnerCode(rcUser.code);
//             else setReferralOwnerCode(null);
//           } catch (err) {
//             console.log("Failed to fetch owner referral code:", err);
//             setReferralOwnerCode(null);
//           }
//         } else {
//           setReferralOwnerCode(null);
//         }

//         setPageError(null);
//       } catch (err: unknown) {
//         console.error(err);
//         setPageError(err instanceof Error ? err.message : "Failed to load your profile.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, []);

//   // close tooltip on outside click + Escape
//   useEffect(() => {
//     if (!chatInfoOpen) return;

//     const onMouseDown = (e: MouseEvent) => {
//       const el = chatInfoWrapRef.current;
//       if (!el) return;
//       if (el.contains(e.target as Node)) return;
//       setChatInfoOpen(false);
//     };

//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setChatInfoOpen(false);
//     };

//     window.addEventListener("mousedown", onMouseDown);
//     window.addEventListener("keydown", onKeyDown);
//     return () => {
//       window.removeEventListener("mousedown", onMouseDown);
//       window.removeEventListener("keydown", onKeyDown);
//     };
//   }, [chatInfoOpen]);

//   const computeTooltipPosition = () => {
//     const btn = chatInfoBtnRef.current;
//     if (!btn) return;

//     const rect = btn.getBoundingClientRect();
//     const vw = window.innerWidth;
//     const vh = window.innerHeight;

//     const sidePad = 14;
//     const gap = 10;

//     const width = Math.min(360, vw - sidePad * 2);
//     const left = clamp(rect.left + rect.width / 2 - width / 2, sidePad, vw - width - sidePad);

//     const centerX = rect.left + rect.width / 2;
//     const arrowLeft = clamp(centerX - left, 14, width - 14);
//     setTooltipArrowLeft(arrowLeft);

//     const tip = tooltipRef.current;
//     const h = tip ? tip.getBoundingClientRect().height : 260;

//     let placement: "below" | "above" = "below";
//     let top = rect.bottom + gap;

//     if (top + h + sidePad > vh) {
//       placement = "above";
//       top = rect.top - gap - h;
//     }

//     top = clamp(top, sidePad, vh - h - sidePad);

//     setTooltipPlacement(placement);
//     setTooltipPos({
//       position: "fixed",
//       zIndex: 9999,
//       width,
//       left,
//       top,
//     });
//   };

//   useEffect(() => {
//     if (!chatInfoOpen) return;

//     const r1 = window.requestAnimationFrame(() => {
//       computeTooltipPosition();
//     });
//     const r2 = window.requestAnimationFrame(() => {
//       computeTooltipPosition();
//     });

//     const onResize = () => computeTooltipPosition();
//     const onScroll = () => computeTooltipPosition();

//     window.addEventListener("resize", onResize);
//     window.addEventListener("scroll", onScroll, true);

//     return () => {
//       window.cancelAnimationFrame(r1);
//       window.cancelAnimationFrame(r2);
//       window.removeEventListener("resize", onResize);
//       window.removeEventListener("scroll", onScroll, true);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [chatInfoOpen]);

//   const withUiState = async (fn: () => Promise<void>) => {
//     setSaving(true);
//     setPageError(null);
//     try {
//       await fn();
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveUsername = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setAccountNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateUsername(username);
//         setProfile({ ...p0, username });
//         onAuthUserUpdated?.({ username });
//       });

//       setAccountNotice({ type: "success", text: "Your username has been saved." });
//     } catch (err: unknown) {
//       setAccountNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Couldn’t save your username. Please try again.",
//       });
//     }
//   };

//   const handleConfirmUpgrade = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setRoleNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateRole("Auctioneer");
//         setProfile({ ...p0, role: "Auctioneer" });
//         onAuthUserUpdated?.({ roleName: "Auctioneer" });
//       });

//       setRoleNotice({ type: "success", text: "You’re now an Auctioneer." });
//       setDialog(null);
//     } catch (err: unknown) {
//       setRoleNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Upgrade failed. Please try again.",
//       });
//       setDialog(null);
//     }
//   };

//   const handleSaveAvatar = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setAvatarNotice(null);

//     try {
//       await withUiState(async () => {
//         await updateAvatar(selectedAvatar);
//         setProfile({
//           ...p0,
//           avatarName: selectedAvatar,
//           avatarUrl: avatarImageMap[selectedAvatar],
//         });
//       });

//       setAvatarNotice({ type: "success", text: "Your avatar has been saved." });
//     } catch (err: unknown) {
//       setAvatarNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Couldn’t save your avatar. Please try again.",
//       });
//     }
//   };

//   const handleSaveLocation = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setLocationNotice(null);

//     try {
//       await withUiState(async () => {
//         const location: LocationDto = { country, region };
//         await updateLocation(location);
//         setProfile({ ...p0, locationDto: location });
//       });

//       setLocationNotice({ type: "success", text: "Your location has been saved." });
//     } catch (err: unknown) {
//       setLocationNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Couldn’t save your location. Please try again.",
//       });
//     }
//   };

//   const handleUseReferralCode = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setReferralNotice(null);

//     if (!referralCode.trim()) {
//       setReferralNotice({ type: "error", text: "Please enter a referral code first." });
//       return;
//     }

//     try {
//       await withUiState(async () => {
//         await redeemReferralCodeApi(referralCode.trim());
//         const updated = await fetchUserProfile();
//         setProfile(updated);
//         setReferralCode("");
//       });

//       setReferralNotice({ type: "success", text: "Referral code applied successfully!" });
//     } catch (err: unknown) {
//       setReferralNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Couldn’t apply that referral code. Please try again.",
//       });
//     }
//   };

//   const handleConfirmDeleteAccount = async () => {
//     const p0 = profile;
//     if (!p0) return;

//     setDangerNotice(null);

//     try {
//       await withUiState(async () => {
//         await deleteUserAccount();
//         logout();
//         setProfile(null);
//         onSignedOut?.();
//       });

//       setDialog(null);
//     } catch (err: unknown) {
//       setDangerNotice({
//         type: "error",
//         text: err instanceof Error ? err.message : "Couldn’t delete your account. Please try again.",
//       });
//       setDialog(null);
//     }
//   };

//   if (loading) return <p style={{ padding: "1rem" }}>Loading profile…</p>;
//   if (!profile) return <p style={{ padding: "1rem" }}>We couldn’t find your profile.</p>;

//   const p = profile;

//   const showUseReferralInput = !p.isReferralCodeOwner && !p.hasUsedReferralCode;
//   const currentAvatarSrc =
//     (p.avatarUrl && p.avatarUrl.trim() ? p.avatarUrl : "") ||
//     avatarImageMap[p.avatarName] ||
//     avatarImageMap.DEFAULT_AVATAR;

//   const isAuctioneer = p.role === "Auctioneer";
//   const isBidder = p.role === "Bidder";
//   const chatEligible = p.eligibleForChat === true;

//   return (
//     <div className="bn-profile-page" style={styles.page}>
//       <style>{`
//         /* Lock box-sizing locally (fix overflow) */
//         .bn-profile-page, .bn-profile-page * { box-sizing: border-box !important; }
//         .bn-profile-page { overflow-x: hidden !important; }

//         /* prevent grid children from forcing width */
//         .bn-profile-grid, .bn-profile-grid * { min-width: 0; }

//         @media (max-width: 920px) {
//           .bn-profile-grid { grid-template-columns: 1fr !important; }
//         }

//         @media (max-width: 520px) {
//           .bn-profile-page { padding: 14px 12px 28px !important; }
//           .bn-card { padding: 14px !important; border-radius: 14px !important; }
//           .bn-topbar { align-items: flex-start !important; }

//           .bn-row { grid-template-columns: 1fr !important; }
//           .bn-row .bn-btn-wide { width: 100% !important; justify-self: stretch !important; }
//           .bn-two-col { grid-template-columns: 1fr !important; }
//           .bn-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
//           .bn-avatar-row { grid-template-columns: 1fr !important; }

//           .bn-delete-row { justify-content: center !important; }
//           .bn-pill { flex-wrap: wrap !important; }
//         }

//         @media (max-width: 360px) {
//           .bn-avatar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
//         }

//         /* text visibility on mobile + iOS autofill */
//         .bn-input, .bn-select {
//           color: #0f172a !important;
//           -webkit-text-fill-color: #0f172a !important;
//           background: #fff !important;
//         }
//         .bn-input::placeholder { color: rgba(51,65,85,0.55) !important; }
//         .bn-input:-webkit-autofill {
//           -webkit-text-fill-color: #0f172a !important;
//           box-shadow: 0 0 0 1000px #fff inset !important;
//         }

//         @media (max-width: 520px) { .bn-input, .bn-select { font-size: 16px !important; } }

//         .bn-btn { transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease; }
//         .bn-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }

//         .bn-input:focus, .bn-select:focus {
//           box-shadow: 0 0 0 4px rgba(11,92,255,0.12);
//           border-color: rgba(11,92,255,0.45);
//         }

//         .bn-avatar-btn { transition: transform 160ms ease, box-shadow 160ms ease; }
//         .bn-avatar-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 22px rgba(15,23,42,0.08); }

//         .bn-info-btn:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(11,92,255,0.18); }
//       `}</style>

//       <ConfirmDialog
//         open={dialog?.kind === "upgrade"}
//         title="Upgrade to Auctioneer"
//         description="Are you sure you want to upgrade to Auctioneer?"
//         confirmText="Yes, upgrade"
//         confirmTone="primary"
//         loading={saving}
//         onClose={() => setDialog(null)}
//         onConfirm={handleConfirmUpgrade}
//       />

//       <ConfirmDialog
//         open={dialog?.kind === "delete"}
//         title="Delete account"
//         description="Are you sure? This action can’t be undone."
//         confirmText="Yes, delete"
//         confirmTone="danger"
//         loading={saving}
//         onClose={() => setDialog(null)}
//         onConfirm={handleConfirmDeleteAccount}
//       />

//       <div className="bn-topbar" style={styles.topbar}>
//         <div>
//           <h2 style={styles.h2}>My Profile</h2>
//         </div>

//         <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
//           {saving && <span style={styles.pill}>Saving…</span>}

//           <div ref={chatInfoWrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
//             <span
//               className="bn-pill"
//               style={{
//                 ...styles.pill,
//                 background: chatEligible ? "rgba(16,185,129,0.08)" : "rgba(220,38,38,0.06)",
//                 borderColor: chatEligible ? "rgba(16,185,129,0.25)" : "rgba(220,38,38,0.22)",
//               }}
//             >
//               <span style={{ ...styles.statusDot, background: chatEligible ? "#10b981" : "#ef4444" }} />
//               <span style={{ opacity: 0.9 }}>Chat access:</span>
//               <strong style={{ color: chatEligible ? "#0b7a2a" : "#b00020" }}>
//                 {chatEligible ? "Enabled" : "Locked"}
//               </strong>

//               <button
//                 ref={chatInfoBtnRef}
//                 type="button"
//                 className="bn-info-btn"
//                 onClick={() => setChatInfoOpen((v) => !v)}
//                 aria-label="Chat info"
//                 aria-expanded={chatInfoOpen}
//                 style={{
//                   ...styles.infoBtn,
//                   opacity: saving ? 0.7 : 1,
//                   cursor: saving ? "not-allowed" : "pointer",
//                 }}
//                 disabled={saving}
//               >
//                 i
//               </button>
//             </span>

//             {chatInfoOpen && (
//               <div ref={tooltipRef} role="dialog" aria-label="Chat details" style={{ ...styles.tooltip, ...tooltipPos }}>
//                 <div
//                   style={{
//                     ...styles.tooltipArrow,
//                     left: tooltipArrowLeft - 6,
//                     ...(tooltipPlacement === "below" ? { top: -7 } : { bottom: -7 }),
//                   }}
//                 />

//                 <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
//                   <strong style={{ fontSize: "0.95rem" }}>Chat info</strong>
//                   <button
//                     type="button"
//                     onClick={() => setChatInfoOpen(false)}
//                     aria-label="Close"
//                     style={styles.tooltipClose}
//                   >
//                     ×
//                   </button>
//                 </div>

//                 <div style={{ marginTop: 8, fontSize: "0.88rem", color: "rgba(255,255,255,0.82)" }}>
//                   {chatEligible ? (
//                     <>
//                       ✅ <strong style={{ color: "#a7f3d0" }}>Chat access is enabled.</strong>
//                       <div style={{ marginTop: 8, lineHeight: 1.55 }}>
//                         You can chat in <strong>any auction</strong> with no restrictions.
//                         <div style={{ marginTop: 6, opacity: 0.9 }}>
//                           Tip: Use chat for quick coordination and clarifications.
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       You don’t have chat access yet. It will unlock when one of the following happens:
//                       <ol style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: "0.88rem", lineHeight: 1.55 }}>
//                         <li>
//                           You place a <strong>bid</strong> in an auction{" "}
//                           <span style={{ opacity: 0.85 }}>(chat in that auction only)</span>
//                         </li>
//                         <li>
//                           You <strong>win</strong> an auction{" "}
//                           <span style={{ opacity: 0.85 }}>(chat in all auctions)</span>
//                         </li>
//                         <li>
//                           You create <strong>your own</strong> auction{" "}
//                           <span style={{ opacity: 0.85 }}>(chat in all auctions)</span>
//                         </li>
//                       </ol>
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {pageError && (
//         <div
//           style={{
//             ...styles.alertTop,
//             borderColor: "rgba(220,38,38,0.25)",
//             background: "rgba(220,38,38,0.06)",
//           }}
//         >
//           <strong>Error:</strong> {pageError}
//         </div>
//       )}

//       <div className="bn-profile-grid" style={styles.grid}>
//         {/* LEFT */}
//         <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Account</div>

//             <div className="bn-row" style={styles.row}>
//               <div style={{ minWidth: 0 }}>
//                 <div style={styles.label}>Username</div>
//                 <input
//                   className="bn-input"
//                   style={styles.input}
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   disabled={saving}
//                 />
//               </div>

//               <button
//                 className="bn-btn bn-btn-wide"
//                 style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
//                 onClick={handleSaveUsername}
//                 disabled={saving}
//                 type="button"
//               >
//                 Save
//               </button>
//             </div>

//             {accountNotice && (
//               <div style={noticeStyle(accountNotice)}>
//                 {accountNotice.type === "success" ? "✅ " : "❌ "}
//                 {accountNotice.text}
//               </div>
//             )}

//             <div style={styles.kv}>
//               <strong>Email:</strong> {p.email}
//             </div>
//             <div style={styles.kv}>
//               <strong>Phone:</strong> {p.phoneNumber}
//             </div>

//             <div style={styles.roleBox}>
//               <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//                 <strong>Role:</strong>
//                 <span style={getRolePillStyle(isAuctioneer)}>{p.role}</span>
//               </div>

//               {isBidder ? (
//                 <>
//                   <p style={{ margin: "10px 0 0" }} />
//                   <button
//                     type="button"
//                     onClick={() => setDialog({ kind: "upgrade" })}
//                     disabled={saving}
//                     className="bn-btn"
//                     style={{
//                       padding: "0.55rem 0.95rem",
//                       borderRadius: 10,
//                       border: "1px solid rgba(42,124,255,0.25)",
//                       background: "rgba(42,124,255,0.12)",
//                       color: "#1a57d6",
//                       fontWeight: 900,
//                       cursor: saving ? "not-allowed" : "pointer",
//                       maxWidth: "100%",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     Upgrade to Auctioneer
//                   </button>

//                   <div style={{ marginTop: 8, fontSize: "0.86rem", color: "#666" }}>
//                     Tip: If you want to create auctions and sell items, you can upgrade to{" "}
//                     <strong>Auctioneer</strong>.
//                   </div>
//                 </>
//               ) : null}

//               {roleNotice && (
//                 <div style={noticeStyle(roleNotice)}>
//                   {roleNotice.type === "success" ? "✅ " : "❌ "}
//                   {roleNotice.text}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Location</div>

//             <div
//               className="bn-two-col"
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 10,
//                 marginTop: 12,
//                 minWidth: 0,
//               }}
//             >
//               <div style={{ minWidth: 0 }}>
//                 <div style={styles.label}>Country</div>
//                 <select
//                   className="bn-select"
//                   style={styles.select}
//                   value={country}
//                   onChange={(e) => setCountry(e.target.value as Country)}
//                   disabled={saving}
//                 >
//                   {countries.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div style={{ minWidth: 0 }}>
//                 <div style={styles.label}>Region</div>
//                 <select
//                   className="bn-select"
//                   style={styles.select}
//                   value={region}
//                   onChange={(e) => setRegion(e.target.value as Region)}
//                   disabled={saving}
//                 >
//                   {regions.map((r) => (
//                     <option key={r} value={r}>
//                       {r}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//               <button
//                 className="bn-btn bn-btn-wide"
//                 style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
//                 onClick={handleSaveLocation}
//                 disabled={saving}
//                 type="button"
//               >
//                 Save location
//               </button>
//             </div>

//             {locationNotice && (
//               <div style={noticeStyle(locationNotice)}>
//                 {locationNotice.type === "success" ? "✅ " : "❌ "}
//                 {locationNotice.text}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Avatar</div>

//             <div className="bn-avatar-row" style={styles.avatarRow}>
//               <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
//                 <img src={currentAvatarSrc} alt="Current avatar" style={styles.avatarBig} />
//                 <span style={{ color: "#64748b", fontSize: "0.86rem", fontWeight: 900 }}>
//                   Current
//                 </span>
//               </div>

//               <div style={{ minWidth: 0 }}>
//                 <div className="bn-avatar-grid" style={styles.avatarGrid}>
//                   {selectableAvatars.map((av) => {
//                     const isSelected = selectedAvatar === av;
//                     const imgSrc = avatarImageMap[av];

//                     return (
//                       <button
//                         key={av}
//                         type="button"
//                         className="bn-avatar-btn"
//                         onClick={() => setSelectedAvatar(av)}
//                         disabled={saving}
//                         aria-pressed={isSelected}
//                         style={{
//                           ...styles.avatarBtn,
//                           ...(isSelected ? styles.avatarBtnActive : {}),
//                           opacity: saving ? 0.7 : 1,
//                         }}
//                         title={av.replace("_AVATAR", "").replace(/_/g, " ")}
//                       >
//                         {isSelected && <div style={styles.checkDot}>✓</div>}
//                         <img src={imgSrc} alt={av} style={styles.avatarImg} />
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//                   <button
//                     className="bn-btn bn-btn-wide"
//                     style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
//                     onClick={handleSaveAvatar}
//                     disabled={saving}
//                     type="button"
//                   >
//                     Save avatar
//                   </button>
//                 </div>

//                 {avatarNotice && (
//                   <div style={noticeStyle(avatarNotice)}>
//                     {avatarNotice.type === "success" ? "✅ " : "❌ "}
//                     {avatarNotice.text}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Reward Points</div>
//             <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
//               <div style={styles.kv}>
//                 <strong>Reward Points:</strong> {p.rewardPoints}
//               </div>
//               <div style={styles.kv}>
//                 <strong>All time Reward Points:</strong> {p.allTimeRewardPoints}
//               </div>
//             </div>
//           </div>

//           <div className="bn-card" style={styles.card}>
//             <div style={styles.cardTitle}>Referral</div>
//             <p style={styles.cardHint}>Earn points with referral codes.</p>

//             {p.isReferralCodeOwner && referralOwnerCode && (
//               <div
//                 style={{
//                   marginTop: 12,
//                   padding: 12,
//                   borderRadius: 14,
//                   border: "1px solid rgba(15,23,42,0.10)",
//                   background: "rgba(11,92,255,0.05)",
//                 }}
//               >
//                 <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
//                   <span style={styles.pill}>Referral Owner: Yes</span>

//                   <span style={{ ...styles.pill, background: "#fff" }}>
//                     Code: <code style={{ fontWeight: 900 }}>{referralOwnerCode}</code>
//                   </span>
//                 </div>

//                 <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
//                   <button
//                     type="button"
//                     className="bn-btn"
//                     onClick={onShowReferralCodeUsage}
//                     disabled={saving}
//                     style={styles.btnGhost}
//                   >
//                     See who used your code
//                   </button>
//                 </div>
//               </div>
//             )}

//             {showUseReferralInput && (
//               <div style={{ marginTop: 12 }}>
//                 <div style={styles.label}>Use a referral code</div>
//                 <div className="bn-row" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
//                   <input
//                     className="bn-input"
//                     style={styles.input}
//                     type="text"
//                     value={referralCode}
//                     onChange={(e) => setReferralCode(e.target.value)}
//                     placeholder="Enter your referral code"
//                     disabled={saving}
//                   />
//                   <button
//                     className="bn-btn bn-btn-wide"
//                     style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
//                     onClick={handleUseReferralCode}
//                     disabled={saving}
//                     type="button"
//                   >
//                     Apply
//                   </button>
//                 </div>
//               </div>
//             )}

//             {p.hasUsedReferralCode && p.referralCodeUsed && (
//               <div style={{ marginTop: 12 }}>
//                 <span style={styles.pill}>
//                   Referral used: <strong>{p.referralCodeUsed}</strong>
//                 </span>
//               </div>
//             )}

//             {referralNotice && (
//               <div style={noticeStyle(referralNotice)}>
//                 {referralNotice.type === "success" ? "✅ " : "❌ "}
//                 {referralNotice.text}
//               </div>
//             )}
//           </div>

//           {/* ONE delete button: δεξιά κάτω σε 2 στήλες, κέντρο κάτω σε 1 στήλη */}
//           <div className="bn-delete-row" style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//             <div style={{ display: "grid", gap: 10, width: "min(520px, 100%)" }}>
//               <button
//                 type="button"
//                 className="bn-btn"
//                 onClick={() => setDialog({ kind: "delete" })}
//                 disabled={saving}
//                 style={{ ...styles.btnDanger, opacity: saving ? 0.78 : 1, width: "100%" }}
//               >
//                 Delete account
//               </button>

//               {dangerNotice && (
//                 <div style={noticeStyle(dangerNotice)}>
//                   {dangerNotice.type === "success" ? "✅ " : "❌ "}
//                   {dangerNotice.text}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfilePage;


// src/components/UserProfilePage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  AuthUserDto,
} from "../models/Springboot/UserEntity";

import {
  redeemReferralCodeApi,
  fetchReferralCodeUser,
} from "../api/Springboot/ReferralCodeService";

interface UserProfilePageProps {
  onShowReferralCodeUsage: () => void;
  onAuthUserUpdated?: (patch: Partial<AuthUserDto>) => void;
  onSignedOut?: () => void;

  // ✅ NEW: Back to all auctions (όπως NotificationsPage)
  onBack?: () => void;
}

const selectableAvatars: Avatar[] = [
  "BEARD_MAN_AVATAR",
  "MAN_AVATAR",
  "BLONDE_GIRL_AVATAR",
  "GIRL_AVATAR",
  "DEFAULT_AVATAR",
];

const avatarImageMap: Record<Avatar, string> = {
  BEARD_MAN_AVATAR: "/images/BEARD_MAN_AVATAR.png",
  MAN_AVATAR: "/images/MAN_AVATAR.png",
  BLONDE_GIRL_AVATAR: "/images/BLONDE_GIRL_AVATAR.png",
  GIRL_AVATAR: "/images/GIRL_AVATAR.png",
  DEFAULT_AVATAR: "/images/DEFAULT_AVATAR.png",
  DEFAULT: "/images/DEFAULT_AVATAR.png",
};

const regions: Region[] = ["NICOSIA", "FAMAGUSTA", "LIMASSOL", "PAPHOS"];
const countries: Country[] = ["Cyprus"];

type Notice = { type: "success" | "error"; text: string } | null;
type DialogState = { kind: "upgrade" } | { kind: "delete" } | null;

const getRolePillStyle = (isAuctioneer: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 999,
  background: isAuctioneer ? "rgba(42,124,255,0.12)" : "rgba(0,0,0,0.06)",
  border: isAuctioneer
    ? "1px solid rgba(42,124,255,0.25)"
    : "1px solid rgba(0,0,0,0.10)",
  color: isAuctioneer ? "#1a57d6" : "#333",
  fontWeight: 900,
  fontSize: "0.9rem",
});

function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  confirmTone,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  confirmTone: "primary" | "danger";
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const btnStyleBase: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: loading ? "not-allowed" : "pointer",
    border: "1px solid rgba(15,23,42,0.12)",
    background: "#fff",
    color: "#0f172a",
    maxWidth: "100%",
    boxSizing: "border-box",
  };

  const confirmStyle: React.CSSProperties =
    confirmTone === "danger"
      ? {
          ...btnStyleBase,
          border: "1px solid rgba(220,38,38,0.35)",
          color: "#b91c1c",
          background: "rgba(220,38,38,0.06)",
        }
      : {
          ...btnStyleBase,
          border: "1px solid rgba(11,92,255,0.25)",
          color: "#0b5cff",
          background: "rgba(11,92,255,0.08)",
        };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,0.55)",
        display: "grid",
        placeItems: "center",
        padding: 14,
        paddingBottom: `calc(14px + env(safe-area-inset-bottom))`,
        zIndex: 9999,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(520px, 96vw)",
          borderRadius: 16,
          background: "#fff",
          border: "1px solid rgba(15,23,42,0.10)",
          boxShadow: "0 24px 70px rgba(2,6,23,0.35)",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#0f172a" }}>
          {title}
        </div>
        <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.45 }}>
          {description}
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button type="button" onClick={onClose} disabled={loading} style={btnStyleBase}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} style={confirmStyle}>
            {loading ? "Please wait…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onShowReferralCodeUsage,
  onAuthUserUpdated,
  onSignedOut,
  onBack,
}) => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileUserEntity | null>(null);
  const [loading, setLoading] = useState(true);

  // editable
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>("DEFAULT_AVATAR");
  const [country, setCountry] = useState<Country>("Cyprus");
  const [region, setRegion] = useState<Region>("NICOSIA");

  // referral
  const [referralCode, setReferralCode] = useState("");
  const [referralOwnerCode, setReferralOwnerCode] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  // notices
  const [accountNotice, setAccountNotice] = useState<Notice>(null);
  const [roleNotice, setRoleNotice] = useState<Notice>(null);
  const [avatarNotice, setAvatarNotice] = useState<Notice>(null);
  const [locationNotice, setLocationNotice] = useState<Notice>(null);
  const [referralNotice, setReferralNotice] = useState<Notice>(null);
  const [dangerNotice, setDangerNotice] = useState<Notice>(null);

  const [pageError, setPageError] = useState<string | null>(null);

  // dialogs
  const [dialog, setDialog] = useState<DialogState>(null);

  // ✅ Chat tooltip anchored στο i icon
  const [chatInfoOpen, setChatInfoOpen] = useState(false);
  const chatInfoWrapRef = useRef<HTMLDivElement | null>(null);
  const chatInfoBtnRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>({});
  const [tooltipArrowLeft, setTooltipArrowLeft] = useState<number>(18);
  const [tooltipPlacement, setTooltipPlacement] = useState<"below" | "above">("below");

  const styles: Record<string, React.CSSProperties> = useMemo(
    () => ({
      page: {
        maxWidth: 1100,
        margin: "0 auto",
        padding: "20px 14px 40px",
        width: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      },
      topbar: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 14,
      },
      h2: { margin: 0, fontSize: "1.55rem", fontWeight: 900, color: "#0f172a" },

      grid: {
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: 14,
        alignItems: "start",
        minWidth: 0,
      },

      card: {
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 16,
        boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
        padding: 16,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      },
      cardTitle: {
        margin: 0,
        fontSize: "1.05rem",
        fontWeight: 900,
        color: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      },
      cardHint: {
        marginTop: 6,
        marginBottom: 0,
        color: "#64748b",
        fontSize: "0.9rem",
      },

      row: {
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 10,
        marginTop: 12,
        minWidth: 0,
      },
      label: {
        fontSize: "0.88rem",
        fontWeight: 900,
        color: "#334155",
        marginBottom: 6,
      },

      input: {
        width: "100%",
        maxWidth: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.14)",
        outline: "none",
        fontSize: "0.95rem",
        background: "#fff",
        color: "#0f172a",
        WebkitTextFillColor: "#0f172a",
        caretColor: "#0b5cff",
        boxSizing: "border-box",
      },
      select: {
        width: "100%",
        maxWidth: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.14)",
        outline: "none",
        fontSize: "0.95rem",
        background: "#fff",
        color: "#0f172a",
        WebkitTextFillColor: "#0f172a",
        boxSizing: "border-box",
      },

      btn: {
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "#0b5cff",
        color: "#fff",
        fontWeight: 900,
        cursor: "pointer",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        boxSizing: "border-box",
      },
      btnGhost: {
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.14)",
        background: "#fff",
        color: "#0f172a",
        fontWeight: 900,
        cursor: "pointer",
        whiteSpace: "normal",
        lineHeight: 1.2,
        maxWidth: "100%",
        width: "100%",
        textAlign: "center",
        wordBreak: "break-word",
      },

      btnDanger: {
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(220,38,38,0.35)",
        background: "#fff",
        color: "#b91c1c",
        fontWeight: 900,
        cursor: "pointer",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        boxSizing: "border-box",
      },

      kv: { margin: "10px 0 0", color: "#334155", fontSize: "0.95rem" },
      pill: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(11,92,255,0.06)",
        color: "#0f172a",
        fontWeight: 900,
        fontSize: "0.86rem",
        maxWidth: "100%",
        boxSizing: "border-box",
      },

      statusDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
        boxShadow: "0 8px 16px rgba(15,23,42,0.12)",
        flex: "0 0 auto",
      },
      infoBtn: {
        width: 22,
        height: 22,
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.18)",
        background: "rgba(255,255,255,0.92)",
        cursor: "pointer",
        fontWeight: 900,
        lineHeight: "22px",
        display: "inline-grid",
        placeItems: "center",
        padding: 0,
        boxSizing: "border-box",
      },
      tooltip: {
        position: "fixed",
        zIndex: 9999,
        width: "min(360px, calc(100vw - 28px))",
        maxHeight: "min(60vh, 340px)",
        overflow: "auto",
        padding: "12px 12px",
        borderRadius: 14,
        background: "rgba(20, 20, 20, 0.92)",
        color: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
        backdropFilter: "blur(10px)",
        boxSizing: "border-box",
      },
      tooltipArrow: {
        position: "absolute",
        width: 12,
        height: 12,
        background: "rgba(20, 20, 20, 0.92)",
        transform: "rotate(45deg)",
        borderLeft: "1px solid rgba(255,255,255,0.12)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
      },
      tooltipClose: {
        border: "none",
        background: "transparent",
        color: "rgba(255,255,255,0.85)",
        cursor: "pointer",
        fontSize: "1.05rem",
        fontWeight: 900,
        lineHeight: 1,
      },

      roleBox: {
        marginTop: 14,
        padding: "0.9rem 1rem",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        boxSizing: "border-box",
      },

      avatarRow: {
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 14,
        alignItems: "start",
        marginTop: 12,
        minWidth: 0,
      },
      avatarBig: {
        width: 110,
        height: 110,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid rgba(15,23,42,0.12)",
        boxShadow: "0 12px 24px rgba(15,23,42,0.10)",
        background: "#f1f5f9",
      },
      avatarGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 10,
        minWidth: 0,
      },
      avatarBtn: {
        borderRadius: 14,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "#fff",
        padding: 10,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        position: "relative",
        boxSizing: "border-box",
      },
      avatarBtnActive: {
        border: "2px solid rgba(11,92,255,0.65)",
        background: "rgba(11,92,255,0.06)",
        boxShadow: "0 14px 28px rgba(11,92,255,0.12)",
      },
      avatarImg: {
        width: 52,
        height: 52,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid rgba(15,23,42,0.10)",
        background: "#f1f5f9",
      },
      checkDot: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 999,
        background: "#0b5cff",
        color: "#fff",
        fontSize: 12,
        display: "grid",
        placeItems: "center",
        boxShadow: "0 10px 18px rgba(11,92,255,0.22)",
      },

      alertTop: {
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "#f8fafc",
        color: "#0f172a",
        fontSize: "0.92rem",
        whiteSpace: "pre-line",
        boxSizing: "border-box",
      },

      notice: {
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "#f8fafc",
        color: "#0f172a",
        fontSize: "0.92rem",
        whiteSpace: "pre-line",
        boxSizing: "border-box",
      },
    }),
    []
  );

  // ✅ Back button style (ίδιο pattern με NotificationsPage)
  const backBtn: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    fontWeight: 900,
    cursor: "pointer",
    margin: "0 0 12px 0",
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/auctions"); // ✅ main auctions page
  };

  const noticeStyle = (n: Notice): React.CSSProperties => {
    if (!n) return styles.notice;
    if (n.type === "success") {
      return {
        ...styles.notice,
        borderColor: "rgba(16,185,129,0.25)",
        background: "rgba(16,185,129,0.06)",
      };
    }
    return {
      ...styles.notice,
      borderColor: "rgba(220,38,38,0.25)",
      background: "rgba(220,38,38,0.06)",
    };
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile(data);

        setUsername(data.username);
        setCountry(data.locationDto.country);
        setRegion(data.locationDto.region);
        setSelectedAvatar(data.avatarName);

        if (data.isReferralCodeOwner) {
          try {
            const rcUser = await fetchReferralCodeUser();
            if (rcUser && rcUser.code) setReferralOwnerCode(rcUser.code);
            else setReferralOwnerCode(null);
          } catch (err) {
            console.log("Failed to fetch owner referral code:", err);
            setReferralOwnerCode(null);
          }
        } else {
          setReferralOwnerCode(null);
        }

        setPageError(null);
      } catch (err: unknown) {
        console.error(err);
        setPageError(err instanceof Error ? err.message : "Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // close tooltip on outside click + Escape
  useEffect(() => {
    if (!chatInfoOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const el = chatInfoWrapRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setChatInfoOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChatInfoOpen(false);
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [chatInfoOpen]);

  const computeTooltipPosition = () => {
    const btn = chatInfoBtnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const sidePad = 14;
    const gap = 10;

    const width = Math.min(360, vw - sidePad * 2);
    const left = clamp(rect.left + rect.width / 2 - width / 2, sidePad, vw - width - sidePad);

    const centerX = rect.left + rect.width / 2;
    const arrowLeft = clamp(centerX - left, 14, width - 14);
    setTooltipArrowLeft(arrowLeft);

    const tip = tooltipRef.current;
    const h = tip ? tip.getBoundingClientRect().height : 260;

    let placement: "below" | "above" = "below";
    let top = rect.bottom + gap;

    if (top + h + sidePad > vh) {
      placement = "above";
      top = rect.top - gap - h;
    }

    top = clamp(top, sidePad, vh - h - sidePad);

    setTooltipPlacement(placement);
    setTooltipPos({
      position: "fixed",
      zIndex: 9999,
      width,
      left,
      top,
    });
  };

  useEffect(() => {
    if (!chatInfoOpen) return;

    const r1 = window.requestAnimationFrame(() => {
      computeTooltipPosition();
    });
    const r2 = window.requestAnimationFrame(() => {
      computeTooltipPosition();
    });

    const onResize = () => computeTooltipPosition();
    const onScroll = () => computeTooltipPosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.cancelAnimationFrame(r1);
      window.cancelAnimationFrame(r2);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatInfoOpen]);

  const withUiState = async (fn: () => Promise<void>) => {
    setSaving(true);
    setPageError(null);
    try {
      await fn();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUsername = async () => {
    const p0 = profile;
    if (!p0) return;

    setAccountNotice(null);

    try {
      await withUiState(async () => {
        await updateUsername(username);
        setProfile({ ...p0, username });
        onAuthUserUpdated?.({ username });
      });

      setAccountNotice({ type: "success", text: "Your username has been saved." });
    } catch (err: unknown) {
      setAccountNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Couldn’t save your username. Please try again.",
      });
    }
  };

  const handleConfirmUpgrade = async () => {
    const p0 = profile;
    if (!p0) return;

    setRoleNotice(null);

    try {
      await withUiState(async () => {
        await updateRole("Auctioneer");
        setProfile({ ...p0, role: "Auctioneer" });
        onAuthUserUpdated?.({ roleName: "Auctioneer" });
      });

      setRoleNotice({ type: "success", text: "You’re now an Auctioneer." });
      setDialog(null);
    } catch (err: unknown) {
      setRoleNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Upgrade failed. Please try again.",
      });
      setDialog(null);
    }
  };

  const handleSaveAvatar = async () => {
    const p0 = profile;
    if (!p0) return;

    setAvatarNotice(null);

    try {
      await withUiState(async () => {
        await updateAvatar(selectedAvatar);
        setProfile({
          ...p0,
          avatarName: selectedAvatar,
          avatarUrl: avatarImageMap[selectedAvatar],
        });
      });

      setAvatarNotice({ type: "success", text: "Your avatar has been saved." });
    } catch (err: unknown) {
      setAvatarNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Couldn’t save your avatar. Please try again.",
      });
    }
  };

  const handleSaveLocation = async () => {
    const p0 = profile;
    if (!p0) return;

    setLocationNotice(null);

    try {
      await withUiState(async () => {
        const location: LocationDto = { country, region };
        await updateLocation(location);
        setProfile({ ...p0, locationDto: location });
      });

      setLocationNotice({ type: "success", text: "Your location has been saved." });
    } catch (err: unknown) {
      setLocationNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Couldn’t save your location. Please try again.",
      });
    }
  };

  const handleUseReferralCode = async () => {
    const p0 = profile;
    if (!p0) return;

    setReferralNotice(null);

    if (!referralCode.trim()) {
      setReferralNotice({ type: "error", text: "Please enter a referral code first." });
      return;
    }

    try {
      await withUiState(async () => {
        await redeemReferralCodeApi(referralCode.trim());
        const updated = await fetchUserProfile();
        setProfile(updated);
        setReferralCode("");
      });

      setReferralNotice({ type: "success", text: "Referral code applied successfully!" });
    } catch (err: unknown) {
      setReferralNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Couldn’t apply that referral code. Please try again.",
      });
    }
  };

  const handleConfirmDeleteAccount = async () => {
    const p0 = profile;
    if (!p0) return;

    setDangerNotice(null);

    try {
      await withUiState(async () => {
        await deleteUserAccount();
        logout();
        setProfile(null);
        onSignedOut?.();
      });

      setDialog(null);
    } catch (err: unknown) {
      setDangerNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Couldn’t delete your account. Please try again.",
      });
      setDialog(null);
    }
  };

  if (loading) return <p style={{ padding: "1rem" }}>Loading profile…</p>;
  if (!profile) return <p style={{ padding: "1rem" }}>We couldn’t find your profile.</p>;

  const p = profile;

  const showUseReferralInput = !p.isReferralCodeOwner && !p.hasUsedReferralCode;
  const currentAvatarSrc =
    (p.avatarUrl && p.avatarUrl.trim() ? p.avatarUrl : "") ||
    avatarImageMap[p.avatarName] ||
    avatarImageMap.DEFAULT_AVATAR;

  const isAuctioneer = p.role === "Auctioneer";
  const isBidder = p.role === "Bidder";
  const chatEligible = p.eligibleForChat === true;

  return (
    <div className="bn-profile-page" style={styles.page}>
      <style>{`
        /* Lock box-sizing locally (fix overflow) */
        .bn-profile-page, .bn-profile-page * { box-sizing: border-box !important; }
        .bn-profile-page { overflow-x: hidden !important; }

        /* prevent grid children from forcing width */
        .bn-profile-grid, .bn-profile-grid * { min-width: 0; }

        @media (max-width: 920px) {
          .bn-profile-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 520px) {
          .bn-profile-page { padding: 14px 12px 28px !important; }
          .bn-card { padding: 14px !important; border-radius: 14px !important; }
          .bn-topbar { align-items: flex-start !important; }

          .bn-row { grid-template-columns: 1fr !important; }
          .bn-row .bn-btn-wide { width: 100% !important; justify-self: stretch !important; }
          .bn-two-col { grid-template-columns: 1fr !important; }
          .bn-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .bn-avatar-row { grid-template-columns: 1fr !important; }

          .bn-delete-row { justify-content: center !important; }
          .bn-pill { flex-wrap: wrap !important; }
        }

        @media (max-width: 360px) {
          .bn-avatar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }

        /* text visibility on mobile + iOS autofill */
        .bn-input, .bn-select {
          color: #0f172a !important;
          -webkit-text-fill-color: #0f172a !important;
          background: #fff !important;
        }
        .bn-input::placeholder { color: rgba(51,65,85,0.55) !important; }
        .bn-input:-webkit-autofill {
          -webkit-text-fill-color: #0f172a !important;
          box-shadow: 0 0 0 1000px #fff inset !important;
        }

        @media (max-width: 520px) { .bn-input, .bn-select { font-size: 16px !important; } }

        .bn-btn { transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease; }
        .bn-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }

        .bn-input:focus, .bn-select:focus {
          box-shadow: 0 0 0 4px rgba(11,92,255,0.12);
          border-color: rgba(11,92,255,0.45);
        }

        .bn-avatar-btn { transition: transform 160ms ease, box-shadow 160ms ease; }
        .bn-avatar-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 22px rgba(15,23,42,0.08); }

        .bn-info-btn:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(11,92,255,0.18); }
      `}</style>

      <ConfirmDialog
        open={dialog?.kind === "upgrade"}
        title="Upgrade to Auctioneer"
        description="Are you sure you want to upgrade to Auctioneer?"
        confirmText="Yes, upgrade"
        confirmTone="primary"
        loading={saving}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirmUpgrade}
      />

      <ConfirmDialog
        open={dialog?.kind === "delete"}
        title="Delete account"
        description="Are you sure? This action can’t be undone."
        confirmText="Yes, delete"
        confirmTone="danger"
        loading={saving}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirmDeleteAccount}
      />

      {/* ✅ NEW: Back κουμπί */}
      <button type="button" onClick={handleBack} style={backBtn}>
        ← Back to all auctions
      </button>

      <div className="bn-topbar" style={styles.topbar}>
        <div>
          <h2 style={styles.h2}>My Profile</h2>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {saving && <span style={styles.pill}>Saving…</span>}

          <div ref={chatInfoWrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <span
              className="bn-pill"
              style={{
                ...styles.pill,
                background: chatEligible ? "rgba(16,185,129,0.08)" : "rgba(220,38,38,0.06)",
                borderColor: chatEligible ? "rgba(16,185,129,0.25)" : "rgba(220,38,38,0.22)",
              }}
            >
              <span style={{ ...styles.statusDot, background: chatEligible ? "#10b981" : "#ef4444" }} />
              <span style={{ opacity: 0.9 }}>Chat access:</span>
              <strong style={{ color: chatEligible ? "#0b7a2a" : "#b00020" }}>
                {chatEligible ? "Enabled" : "Locked"}
              </strong>

              <button
                ref={chatInfoBtnRef}
                type="button"
                className="bn-info-btn"
                onClick={() => setChatInfoOpen((v) => !v)}
                aria-label="Chat info"
                aria-expanded={chatInfoOpen}
                style={{
                  ...styles.infoBtn,
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                disabled={saving}
              >
                i
              </button>
            </span>

            {chatInfoOpen && (
              <div ref={tooltipRef} role="dialog" aria-label="Chat details" style={{ ...styles.tooltip, ...tooltipPos }}>
                <div
                  style={{
                    ...styles.tooltipArrow,
                    left: tooltipArrowLeft - 6,
                    ...(tooltipPlacement === "below" ? { top: -7 } : { bottom: -7 }),
                  }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <strong style={{ fontSize: "0.95rem" }}>Chat info</strong>
                  <button
                    type="button"
                    onClick={() => setChatInfoOpen(false)}
                    aria-label="Close"
                    style={styles.tooltipClose}
                  >
                    ×
                  </button>
                </div>

                <div style={{ marginTop: 8, fontSize: "0.88rem", color: "rgba(255,255,255,0.82)" }}>
                  {chatEligible ? (
                    <>
                      ✅ <strong style={{ color: "#a7f3d0" }}>Chat access is enabled.</strong>
                      <div style={{ marginTop: 8, lineHeight: 1.55 }}>
                        You can chat in <strong>any auction</strong> with no restrictions.
                        <div style={{ marginTop: 6, opacity: 0.9 }}>
                          Tip: Use chat for quick coordination and clarifications.
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      You don’t have chat access yet. It will unlock when one of the following happens:
                      <ol style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: "0.88rem", lineHeight: 1.55 }}>
                        <li>
                          You place a <strong>bid</strong> in an auction{" "}
                          <span style={{ opacity: 0.85 }}>(chat in that auction only)</span>
                        </li>
                        <li>
                          You <strong>win</strong> an auction{" "}
                          <span style={{ opacity: 0.85 }}>(chat in all auctions)</span>
                        </li>
                        <li>
                          You create <strong>your own</strong> auction{" "}
                          <span style={{ opacity: 0.85 }}>(chat in all auctions)</span>
                        </li>
                      </ol>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {pageError && (
        <div
          style={{
            ...styles.alertTop,
            borderColor: "rgba(220,38,38,0.25)",
            background: "rgba(220,38,38,0.06)",
          }}
        >
          <strong>Error:</strong> {pageError}
        </div>
      )}

      <div className="bn-profile-grid" style={styles.grid}>
        {/* LEFT */}
        <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
          <div className="bn-card" style={styles.card}>
            <div style={styles.cardTitle}>Account</div>

            <div className="bn-row" style={styles.row}>
              <div style={{ minWidth: 0 }}>
                <div style={styles.label}>Username</div>
                <input
                  className="bn-input"
                  style={styles.input}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={saving}
                />
              </div>

              <button
                className="bn-btn bn-btn-wide"
                style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
                onClick={handleSaveUsername}
                disabled={saving}
                type="button"
              >
                Save
              </button>
            </div>

            {accountNotice && (
              <div style={noticeStyle(accountNotice)}>
                {accountNotice.type === "success" ? "✅ " : "❌ "}
                {accountNotice.text}
              </div>
            )}

            <div style={styles.kv}>
              <strong>Email:</strong> {p.email}
            </div>
            <div style={styles.kv}>
              <strong>Phone:</strong> {p.phoneNumber}
            </div>

            <div style={styles.roleBox}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <strong>Role:</strong>
                <span style={getRolePillStyle(isAuctioneer)}>{p.role}</span>
              </div>

              {isBidder ? (
                <>
                  <p style={{ margin: "10px 0 0" }} />
                  <button
                    type="button"
                    onClick={() => setDialog({ kind: "upgrade" })}
                    disabled={saving}
                    className="bn-btn"
                    style={{
                      padding: "0.55rem 0.95rem",
                      borderRadius: 10,
                      border: "1px solid rgba(42,124,255,0.25)",
                      background: "rgba(42,124,255,0.12)",
                      color: "#1a57d6",
                      fontWeight: 900,
                      cursor: saving ? "not-allowed" : "pointer",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    Upgrade to Auctioneer
                  </button>

                  <div style={{ marginTop: 8, fontSize: "0.86rem", color: "#666" }}>
                    Tip: If you want to create auctions and sell items, you can upgrade to{" "}
                    <strong>Auctioneer</strong>.
                  </div>
                </>
              ) : null}

              {roleNotice && (
                <div style={noticeStyle(roleNotice)}>
                  {roleNotice.type === "success" ? "✅ " : "❌ "}
                  {roleNotice.text}
                </div>
              )}
            </div>
          </div>

          <div className="bn-card" style={styles.card}>
            <div style={styles.cardTitle}>Location</div>

            <div
              className="bn-two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 12,
                minWidth: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={styles.label}>Country</div>
                <select
                  className="bn-select"
                  style={styles.select}
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  disabled={saving}
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={styles.label}>Region</div>
                <select
                  className="bn-select"
                  style={styles.select}
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  disabled={saving}
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button
                className="bn-btn bn-btn-wide"
                style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
                onClick={handleSaveLocation}
                disabled={saving}
                type="button"
              >
                Save location
              </button>
            </div>

            {locationNotice && (
              <div style={noticeStyle(locationNotice)}>
                {locationNotice.type === "success" ? "✅ " : "❌ "}
                {locationNotice.text}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
          <div className="bn-card" style={styles.card}>
            <div style={styles.cardTitle}>Avatar</div>

            <div className="bn-avatar-row" style={styles.avatarRow}>
              <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
                <img src={currentAvatarSrc} alt="Current avatar" style={styles.avatarBig} />
                <span style={{ color: "#64748b", fontSize: "0.86rem", fontWeight: 900 }}>
                  Current
                </span>
              </div>

              <div style={{ minWidth: 0 }}>
                <div className="bn-avatar-grid" style={styles.avatarGrid}>
                  {selectableAvatars.map((av) => {
                    const isSelected = selectedAvatar === av;
                    const imgSrc = avatarImageMap[av];

                    return (
                      <button
                        key={av}
                        type="button"
                        className="bn-avatar-btn"
                        onClick={() => setSelectedAvatar(av)}
                        disabled={saving}
                        aria-pressed={isSelected}
                        style={{
                          ...styles.avatarBtn,
                          ...(isSelected ? styles.avatarBtnActive : {}),
                          opacity: saving ? 0.7 : 1,
                        }}
                        title={av.replace("_AVATAR", "").replace(/_/g, " ")}
                      >
                        {isSelected && <div style={styles.checkDot}>✓</div>}
                        <img src={imgSrc} alt={av} style={styles.avatarImg} />
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button
                    className="bn-btn bn-btn-wide"
                    style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
                    onClick={handleSaveAvatar}
                    disabled={saving}
                    type="button"
                  >
                    Save avatar
                  </button>
                </div>

                {avatarNotice && (
                  <div style={noticeStyle(avatarNotice)}>
                    {avatarNotice.type === "success" ? "✅ " : "❌ "}
                    {avatarNotice.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bn-card" style={styles.card}>
            <div style={styles.cardTitle}>Reward Points</div>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              <div style={styles.kv}>
                <strong>Reward Points:</strong> {p.rewardPoints}
              </div>
              <div style={styles.kv}>
                <strong>All time Reward Points:</strong> {p.allTimeRewardPoints}
              </div>
            </div>
          </div>

          <div className="bn-card" style={styles.card}>
            <div style={styles.cardTitle}>Referral</div>
            <p style={styles.cardHint}>Earn points with referral codes.</p>

            {p.isReferralCodeOwner && referralOwnerCode && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(11,92,255,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={styles.pill}>Referral Owner: Yes</span>

                  <span style={{ ...styles.pill, background: "#fff" }}>
                    Code: <code style={{ fontWeight: 900 }}>{referralOwnerCode}</code>
                  </span>
                </div>

                <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="bn-btn"
                    onClick={onShowReferralCodeUsage}
                    disabled={saving}
                    style={styles.btnGhost}
                  >
                    See who used your code
                  </button>
                </div>
              </div>
            )}

            {showUseReferralInput && (
              <div style={{ marginTop: 12 }}>
                <div style={styles.label}>Use a referral code</div>
                <div className="bn-row" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                  <input
                    className="bn-input"
                    style={styles.input}
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter your referral code"
                    disabled={saving}
                  />
                  <button
                    className="bn-btn bn-btn-wide"
                    style={{ ...styles.btn, opacity: saving ? 0.78 : 1, width: "100%" }}
                    onClick={handleUseReferralCode}
                    disabled={saving}
                    type="button"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {p.hasUsedReferralCode && p.referralCodeUsed && (
              <div style={{ marginTop: 12 }}>
                <span style={styles.pill}>
                  Referral used: <strong>{p.referralCodeUsed}</strong>
                </span>
              </div>
            )}

            {referralNotice && (
              <div style={noticeStyle(referralNotice)}>
                {referralNotice.type === "success" ? "✅ " : "❌ "}
                {referralNotice.text}
              </div>
            )}
          </div>

          <div className="bn-delete-row" style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <div style={{ display: "grid", gap: 10, width: "min(520px, 100%)" }}>
              <button
                type="button"
                className="bn-btn"
                onClick={() => setDialog({ kind: "delete" })}
                disabled={saving}
                style={{ ...styles.btnDanger, opacity: saving ? 0.78 : 1, width: "100%" }}
              >
                Delete account
              </button>

              {dangerNotice && (
                <div style={noticeStyle(dangerNotice)}>
                  {dangerNotice.type === "success" ? "✅ " : "❌ "}
                  {dangerNotice.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
