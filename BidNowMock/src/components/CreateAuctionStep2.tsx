

// // export default CreateAuctionStep2;
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { uploadAuctionMainImage, uploadAuctionImages } from "../api/Springboot/backendAuctionService";

// interface CreateAuctionStep2Props {
//   auctionId: number;
//   onCompleted?: () => void;
// }

// type ToastType = "success" | "error";

// const CreateAuctionStep2: React.FC<CreateAuctionStep2Props> = ({ auctionId, onCompleted }) => {
//   const [mainImage, setMainImage] = useState<File | null>(null);
//   const [extraImages, setExtraImages] = useState<File[]>([]);

//   const [loading, setLoading] = useState<boolean>(false);

//   // inline errors (κοντά στο σημείο που έγινε το λάθος)
//   const [mainImageError, setMainImageError] = useState<string | null>(null);
//   const [submitError, setSubmitError] = useState<string | null>(null);

//   // toast popup (για errors)
//   const [toast, setToast] = useState<{ type: ToastType; msg: string } | null>(null);
//   const toastTimerRef = useRef<number | null>(null);

//   const clearToastTimer = () => {
//     if (toastTimerRef.current) {
//       window.clearTimeout(toastTimerRef.current);
//       toastTimerRef.current = null;
//     }
//   };

//   const closeToast = useCallback(() => {
//     clearToastTimer();
//     setToast(null);
//   }, []);

//   const showToast = useCallback(
//     (type: ToastType, msg: string, autoMs = 4500) => {
//       clearToastTimer();
//       setToast({ type, msg });
//       toastTimerRef.current = window.setTimeout(() => {
//         closeToast();
//       }, autoMs);
//     },
//     [closeToast]
//   );

//   useEffect(() => {
//     return () => {
//       clearToastTimer();
//     };
//   }, []);

//   const handleMainImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const file = e.target.files?.[0] ?? null;
//     setMainImage(file);
//     setMainImageError(null);
//     setSubmitError(null);
//   };

//   const handleExtraImagesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const files = e.target.files ? Array.from(e.target.files) : [];
//     setExtraImages(files);
//     setSubmitError(null);
//   };

//   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
//     e.preventDefault();

//     setSubmitError(null);
//     setMainImageError(null);

//     if (!mainImage) {
//       setMainImageError("Πρέπει να επιλέξεις τουλάχιστον μία main image.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const mainUrl = await uploadAuctionMainImage(auctionId, mainImage);
//       // eslint-disable-next-line no-console
//       console.log("Main image uploaded:", mainUrl);

//       if (extraImages.length > 0) {
//         const extraUrls = await uploadAuctionImages(auctionId, extraImages);
//         // eslint-disable-next-line no-console
//         console.log("Extra images uploaded:", extraUrls);
//       }

//       // ✅ Μόλις ολοκληρωθεί επιτυχώς, γυρνάμε στο AuctionsPage.
//       // Το success μήνυμα θα εμφανιστεί στην AuctionsPage (μέσω App.tsx).
//       onCompleted?.();
//     } catch (err: unknown) {
//       // eslint-disable-next-line no-console
//       console.error(err);
//       let message = "Κάτι πήγε στραβά στο upload των φωτογραφιών.";
//       if (err instanceof Error && err.message) {
//         message = err.message;
//       }

//       setSubmitError(message);
//       showToast("error", message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // UI styles (full-bleed)
//   const pageOuter: React.CSSProperties = {
//     width: "100vw",
//     marginLeft: "calc(50% - 50vw)",
//     minHeight: "100vh",
//     background: "#F2F4F7",
//     padding: "22px 18px 34px",
//     boxSizing: "border-box",
//   };

//   const wrap: React.CSSProperties = { maxWidth: 1080, margin: "0 auto" };

//   const topHint: React.CSSProperties = {
//     textAlign: "center",
//     color: "#6B7280",
//     fontWeight: 700,
//     fontSize: 13,
//     marginTop: 4,
//   };

//   const stepperRow: React.CSSProperties = {
//     marginTop: 14,
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 12,
//   };

//   const stepCircle = (active: boolean): React.CSSProperties => ({
//     width: 28,
//     height: 28,
//     borderRadius: 999,
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//     fontSize: 13,
//     background: active ? "#2563EB" : "#E5E7EB",
//     color: active ? "white" : "#6B7280",
//     border: active ? "2px solid #2563EB" : "2px solid #E5E7EB",
//   });

//   const stepLine: React.CSSProperties = {
//     width: 62,
//     height: 2,
//     background: "#E5E7EB",
//     borderRadius: 999,
//   };

//   const stepLabel: React.CSSProperties = { fontSize: 13, fontWeight: 800, color: "#111827" };
//   const stepLabelMuted: React.CSSProperties = { fontSize: 13, fontWeight: 800, color: "#9CA3AF" };

//   const card: React.CSSProperties = {
//     marginTop: 18,
//     background: "white",
//     borderRadius: 16,
//     boxShadow: "0 14px 30px rgba(16,24,40,0.12)",
//     border: "1px solid rgba(17,24,39,0.08)",
//     padding: 24,
//   };

//   const cardTitle: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: 14,
//     marginBottom: 12,
//   };

//   const label: React.CSSProperties = { fontWeight: 800, fontSize: 12, color: "#111827" };

//   const input: React.CSSProperties = {
//     width: "100%",
//     border: "1px solid #E5E7EB",
//     borderRadius: 12,
//     padding: "10px 12px",
//     outline: "none",
//     background: "white",
//     fontSize: 13,
//     boxSizing: "border-box",
//   };

//   const inlineError: React.CSSProperties = {
//     marginTop: 8,
//     padding: "10px 12px",
//     borderRadius: 12,
//     border: "1px solid #FCA5A5",
//     background: "#FEF2F2",
//     color: "#991B1B",
//     fontWeight: 800,
//     fontSize: 13,
//   };

//   const primaryBtn: React.CSSProperties = {
//     padding: "10px 14px",
//     borderRadius: 12,
//     border: "1px solid #2563EB",
//     background: "#2563EB",
//     color: "white",
//     fontWeight: 900,
//     cursor: "pointer",
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 8,
//   };

//   const primaryBtnDisabled: React.CSSProperties = {
//     ...primaryBtn,
//     opacity: 0.65,
//     cursor: "not-allowed",
//   };

//   // Toast styles (popup on screen)
//   const toastWrap = (type: ToastType): React.CSSProperties => ({
//     position: "fixed",
//     top: 18,
//     left: "50%",
//     transform: "translateX(-50%)",
//     zIndex: 9999,
//     width: "min(720px, 92vw)",
//     borderRadius: 16,
//     border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//     background: type === "error" ? "#FEF2F2" : "#F0FDF4",
//     boxShadow: "0 14px 35px rgba(17, 24, 39, 0.12)",
//     padding: "12px 12px",
//     boxSizing: "border-box",
//   });

//   const toastRow: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 12,
//   };

//   const toastText = (type: ToastType): React.CSSProperties => ({
//     fontWeight: 900,
//     fontSize: 14,
//     color: type === "error" ? "#991B1B" : "#166534",
//     lineHeight: 1.35,
//     overflowWrap: "anywhere",
//     wordBreak: "break-word",
//   });

//   const closeBtn: React.CSSProperties = {
//     flex: "0 0 auto",
//     width: 30,
//     height: 30,
//     padding: 0,
//     borderRadius: 10,
//     border: "1px solid rgba(17,24,39,0.12)",
//     background: "rgba(255,255,255,0.75)",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontWeight: 950,
//     fontSize: 16,
//     lineHeight: 1,
//   };

//   return (
//     <div style={pageOuter}>
//       {toast && (
//         <div style={toastWrap(toast.type)} role="status" aria-live="polite">
//           <div style={toastRow}>
//             <div style={toastText(toast.type)}>{toast.msg}</div>

//             <button
//               type="button"
//               onClick={closeToast}
//               aria-label="Close message"
//               style={closeBtn}
//               title="Close"
//             >
//               <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
//             </button>
//           </div>
//         </div>
//       )}

//       <div style={wrap}>
//         <div style={topHint}>Create your auction listing</div>

//         <div style={stepperRow}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(false)}>1</div>
//             <div style={stepLabelMuted}>Auction Details</div>
//           </div>

//           <div style={stepLine} />

//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(true)}>2</div>
//             <div style={stepLabel}>Product Images</div>
//           </div>
//         </div>

//         <div style={card}>
//           <div style={cardTitle}>Step 2: Product Images</div>

//           {submitError && <div style={inlineError}>Σφάλμα: {submitError}</div>}

//           <form onSubmit={handleSubmit} style={{ marginTop: 14, display: "grid", gap: 14 }}>
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Main image (η πρώτη φωτογραφία) *</div>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleMainImageChange}
//                 style={input}
//                 disabled={loading}
//               />
//               {mainImageError && <div style={inlineError}>{mainImageError}</div>}
//             </div>

//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Extra images (πολλαπλές)</div>
//               <input
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 onChange={handleExtraImagesChange}
//                 style={input}
//                 disabled={loading}
//               />
//             </div>

//             <div style={{ display: "flex", justifyContent: "flex-end" }}>
//               <button type="submit" disabled={loading} style={loading ? primaryBtnDisabled : primaryBtn}>
//                 {loading ? "Uploading..." : "Finish"} <span aria-hidden>✓</span>
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAuctionStep2;


// src/components/CreateAuctionStep2.tsx
// src/components/CreateAuctionStep2.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  uploadAuctionMainImage,
  uploadAuctionImages,
  deleteAuction, // ✅ ΝΕΟ
} from "../api/Springboot/backendAuctionService";

interface CreateAuctionStep2Props {
  auctionId: number;
  onCompleted?: () => void;
  onBack?: () => void; // back προς Step1
}

type ToastType = "success" | "error";

const CreateAuctionStep2: React.FC<CreateAuctionStep2Props> = ({ auctionId, onCompleted, onBack }) => {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);

  const [loading, setLoading] = useState<boolean>(false); // για upload
  const [deleting, setDeleting] = useState<boolean>(false); // ✅ για delete

  // inline errors
  const [mainImageError, setMainImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // toast popup
  const [toast, setToast] = useState<{ type: ToastType; msg: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const clearToastTimer = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  const closeToast = useCallback(() => {
    clearToastTimer();
    setToast(null);
  }, []);

  const showToast = useCallback(
    (type: ToastType, msg: string, autoMs = 4500) => {
      clearToastTimer();
      setToast({ type, msg });
      toastTimerRef.current = window.setTimeout(() => closeToast(), autoMs);
    },
    [closeToast]
  );

  useEffect(() => {
    return () => clearToastTimer();
  }, []);

  const handleMainImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setMainImage(file);
    setMainImageError(null);
    setSubmitError(null);
  };

  const handleExtraImagesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setExtraImages(files);
    setSubmitError(null);
  };

  // ✅ Back confirm -> DELETE auction -> back στο Step1
  const handleBackClick = async () => {
    if (loading || deleting) return;

     const ok = window.confirm(
      "Go back to Step 1? Your current auction will be deleted."
    );
    if (!ok) return;

    setSubmitError(null);
    setDeleting(true);
    try {
      await deleteAuction(auctionId);
      onBack?.();
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      let message = "Something went wrong while deleting the auction. Please try again.";      if (err instanceof Error && err.message) message = err.message;

      setSubmitError(message);
      showToast("error", message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setSubmitError(null);
    setMainImageError(null);

    if (!mainImage) {
      setMainImageError("Please select a main image to continue.");
      return;
    }

    // ✅ Upload confirm popup
    const ok = window.confirm(
       "Your auction will be submitted for review. Do you want to continue?"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const mainUrl = await uploadAuctionMainImage(auctionId, mainImage);
      // eslint-disable-next-line no-console
      console.log("Main image uploaded:", mainUrl);

      if (extraImages.length > 0) {
        const extraUrls = await uploadAuctionImages(auctionId, extraImages);
        // eslint-disable-next-line no-console
        console.log("Extra images uploaded:", extraUrls);
      }

      onCompleted?.();
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      let message = "Something went wrong while uploading your images. Please try again.";
      if (err instanceof Error && err.message) message = err.message;

      setSubmitError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // UI styles
  // ----------------------------
  const pageOuter: React.CSSProperties = {
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    minHeight: "100vh",
    background: "#F2F4F7",
    padding: "22px 18px 34px",
    boxSizing: "border-box",
  };

  const wrap: React.CSSProperties = { maxWidth: 1080, margin: "0 auto" };

  const topHint: React.CSSProperties = {
    textAlign: "center",
    color: "#6B7280",
    fontWeight: 700,
    fontSize: 13,
    marginTop: 4,
  };

  const stepperRow: React.CSSProperties = {
    marginTop: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  };

  const stepCircle = (active: boolean): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 13,
    background: active ? "#2563EB" : "#E5E7EB",
    color: active ? "white" : "#6B7280",
    border: active ? "2px solid #2563EB" : "2px solid #E5E7EB",
  });

  const stepLine: React.CSSProperties = {
    width: 62,
    height: 2,
    background: "#E5E7EB",
    borderRadius: 999,
  };

  const stepLabel: React.CSSProperties = { fontSize: 13, fontWeight: 800, color: "#111827" };
  const stepLabelMuted: React.CSSProperties = { fontSize: 13, fontWeight: 800, color: "#9CA3AF" };

  const card: React.CSSProperties = {
    marginTop: 18,
    background: "white",
    borderRadius: 16,
    boxShadow: "0 14px 30px rgba(16,24,40,0.12)",
    border: "1px solid rgba(17,24,39,0.08)",
    padding: 24,
  };

  const cardTitle: React.CSSProperties = {
    fontWeight: 900,
    color: "#111827",
    fontSize: 14,
    marginBottom: 12,
  };

  const label: React.CSSProperties = { fontWeight: 800, fontSize: 12, color: "#111827" };

  const input: React.CSSProperties = {
    width: "100%",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    background: "white",
    fontSize: 13,
    boxSizing: "border-box",
  };

  const inlineError: React.CSSProperties = {
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #FCA5A5",
    background: "#FEF2F2",
    color: "#991B1B",
    fontWeight: 800,
    fontSize: 13,
  };

  const primaryBtn: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #2563EB",
    background: "#2563EB",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const primaryBtnDisabled: React.CSSProperties = { ...primaryBtn, opacity: 0.65, cursor: "not-allowed" };

  const backBtnInCard: React.CSSProperties = {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const backBtnInCardDisabled: React.CSSProperties = {
    ...backBtnInCard,
    opacity: 0.65,
    cursor: "not-allowed",
  };

  // Toast styles
  const toastWrap = (type: ToastType): React.CSSProperties => ({
    position: "fixed",
    top: 18,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    width: "min(720px, 92vw)",
    borderRadius: 16,
    border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
    background: type === "error" ? "#FEF2F2" : "#F0FDF4",
    boxShadow: "0 14px 35px rgba(17, 24, 39, 0.12)",
    padding: "12px 12px",
    boxSizing: "border-box",
  });

  const toastRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const toastText = (type: ToastType): React.CSSProperties => ({
    fontWeight: 900,
    fontSize: 14,
    color: type === "error" ? "#991B1B" : "#166534",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  });

  const closeBtn: React.CSSProperties = {
    flex: "0 0 auto",
    width: 30,
    height: 30,
    padding: 0,
    borderRadius: 10,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 950,
    fontSize: 16,
    lineHeight: 1,
  };

  return (
    <div style={pageOuter}>
      {toast && (
        <div style={toastWrap(toast.type)} role="status" aria-live="polite">
          <div style={toastRow}>
            <div style={toastText(toast.type)}>{toast.msg}</div>
            <button type="button" onClick={closeToast} aria-label="Close message" style={closeBtn} title="Close">
              <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
            </button>
          </div>
        </div>
      )}

      <div style={wrap}>
        <div style={topHint}>Create your auction listing</div>

        <div style={stepperRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={stepCircle(false)}>1</div>
            <div style={stepLabelMuted}>Auction Details</div>
          </div>

          <div style={stepLine} />

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={stepCircle(true)}>2</div>
            <div style={stepLabel}>Product Images</div>
          </div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Step 2: Product Images</div>

          {submitError && <div style={inlineError}>Σφάλμα: {submitError}</div>}

          <form onSubmit={handleSubmit} style={{ marginTop: 14, display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={label}>Main image (η πρώτη φωτογραφία) *</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                style={input}
                disabled={loading || deleting}
              />
              {mainImageError && <div style={inlineError}>{mainImageError}</div>}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={label}>Extra images (πολλαπλές)</div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleExtraImagesChange}
                style={input}
                disabled={loading || deleting}
              />
            </div>

            {/* ✅ Κάτω μέσα στο card: Back αριστερά, Finish δεξιά */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              {onBack ? (
                <button
                  type="button"
                  onClick={handleBackClick}
                  disabled={loading || deleting}
                  style={loading || deleting ? backBtnInCardDisabled : backBtnInCard}
                  title={deleting ? "Deleting..." : "Back"}
                >
                  {deleting ? "Deleting..." : "← Back"}
                </button>
              ) : (
                <span />
              )}

              <button type="submit" disabled={loading || deleting} style={loading || deleting ? primaryBtnDisabled : primaryBtn}>
                {loading ? "Uploading..." : "Finish"} <span aria-hidden>✓</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuctionStep2;
