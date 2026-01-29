// // src/admin/components/CreateReferralCodePage.tsx

// import React, { useMemo, useState } from "react";
// import { createReferralCodeApi } from "../../api/Springboot/ReferralCodeService";
// import type {
//   ReferralCodeRequest,
//   ReferralCodeResponse,
// } from "../../models/Springboot/ReferralCode";

// const ACCENT = "#0090FF";

// const CreateReferralCodePage: React.FC = () => {
//   const [code, setCode] = useState("KEN123");
//   const [creatorId, setCreatorId] = useState<number>(1);
//   const [rewardPoints, setRewardPoints] = useState<number>(100);
//   const [creatorRewardPoints, setCreatorRewardPoints] = useState<number>(50);
//   const [maxUses, setMaxUses] = useState<number>(10);
//   const [isDisabled, setIsDisabled] = useState<boolean>(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [response, setResponse] = useState<ReferralCodeResponse | null>(null);

//   const disabledLabel = useMemo(() => (isDisabled ? "ON" : "OFF"), [isDisabled]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setResponse(null);
//     setLoading(true);

//     try {
//       const body: ReferralCodeRequest = {
//         code: code.trim(),
//         ownerId: Number(creatorId),
//         rewardPoints: Number(rewardPoints),
//         ownerRewardPoints: Number(creatorRewardPoints),
//         maxUses: Number(maxUses),
//         isDisabled,
//       };

//       if (!body.code) throw new Error("Το code είναι υποχρεωτικό.");
//       if (body.ownerId <= 0) throw new Error("OwnerId πρέπει να είναι > 0.");
//       if (body.rewardPoints < 0 || body.ownerRewardPoints < 0) {
//         throw new Error("Reward points πρέπει να είναι >= 0.");
//       }
//       if (body.maxUses < 0) throw new Error("Max uses πρέπει να είναι >= 0.");

//       const res = await createReferralCodeApi(body);
//       setResponse(res);
//       setSuccess(`Ο referral code δημιουργήθηκε: ${res.name}`);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setCode("KEN123");
//     setCreatorId(1);
//     setRewardPoints(100);
//     setCreatorRewardPoints(50);
//     setMaxUses(10);
//     setIsDisabled(false);
//     setError(null);
//     setSuccess(null);
//     setResponse(null);
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.header}>
//         <div>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//             <h1 style={styles.title}>Create Referral Code</h1>
//             <span style={styles.badge}>Admin</span>
//           </div>
//           <p style={styles.subtitle}>
//             Δημιούργησε referral code με rewards για χρήστη και creator.
//           </p>
//         </div>
//       </div>

//       <div style={styles.grid}>
//         {/* FORM CARD */}
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <div>
//               <div style={styles.cardTitle}>Details</div>
//               <div style={styles.cardHint}>
//                 Συμπλήρωσε τα πεδία και πάτα Create.
//               </div>
//             </div>
//           </div>

//           {error && (
//             <div style={styles.alertError}>
//               <strong>Σφάλμα:</strong> {error}
//             </div>
//           )}
//           {success && (
//             <div style={styles.alertSuccess}>
//               <strong>OK:</strong> {success}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} style={styles.form}>
//             <Field label="Code" required>
//               <input
//                 type="text"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 required
//                 style={styles.input}
//                 placeholder="π.χ. KEN123"
//                 disabled={loading}
//               />
//               <div style={styles.helperText}>Tip: κεφαλαία γράμματα & αριθμοί (π.χ. “WELCOME25”).</div>
//             </Field>

//             <div style={styles.twoCol}>
//               <Field label="Creator ID" required>
//                 <input
//                   type="number"
//                   value={creatorId}
//                   onChange={(e) => setCreatorId(Number(e.target.value))}
//                   min={1}
//                   required
//                   style={styles.input}
//                   disabled={loading}
//                 />
//               </Field>

//               <Field label="Max Uses" required>
//                 <input
//                   type="number"
//                   value={maxUses}
//                   onChange={(e) => setMaxUses(Number(e.target.value))}
//                   min={0}
//                   required
//                   style={styles.input}
//                   disabled={loading}
//                 />
//               </Field>

//               <Field label="Reward Points (user)" required>
//                 <input
//                   type="number"
//                   value={rewardPoints}
//                   onChange={(e) => setRewardPoints(Number(e.target.value))}
//                   min={0}
//                   required
//                   style={styles.input}
//                   disabled={loading}
//                 />
//               </Field>

//               <Field label="Creator Reward Points" required>
//                 <input
//                   type="number"
//                   value={creatorRewardPoints}
//                   onChange={(e) => setCreatorRewardPoints(Number(e.target.value))}
//                   min={0}
//                   required
//                   style={styles.input}
//                   disabled={loading}
//                 />
//               </Field>
//             </div>

//             {/* ✅ Nice disabled row */}
//             <div style={styles.toggleRow}>
//               <div>
//                 <div style={styles.toggleTitle}>Disabled</div>
//                 <div style={styles.cardHint}>Αν ενεργοποιηθεί, ο κωδικός δεν μπορεί να χρησιμοποιηθεί.</div>
//               </div>

//               {/* Switch */}
//               <button
//                 type="button"
//                 disabled={loading}
//                 onClick={() => setIsDisabled((v) => !v)}
//                 style={{
//                   ...styles.switchBtn,
//                   ...(loading ? styles.switchDisabled : null),
//                 }}
//                 aria-pressed={isDisabled}
//                 aria-label="Toggle disabled"
//               >
//                 <span
//                   style={{
//                     ...styles.switchTrack,
//                     backgroundColor: isDisabled ? ACCENT : "#e5e7eb",
//                   }}
//                 >
//                   {/* label inside track */}
//                   <span
//                     style={{
//                       ...styles.switchText,
//                       opacity: isDisabled ? 1 : 0.8,
//                       justifyContent: isDisabled ? "flex-start" : "flex-end",
//                     }}
//                   >
//                     {disabledLabel}
//                   </span>

//                   {/* thumb */}
//                   <span
//                     style={{
//                       ...styles.switchThumb,
//                       transform: isDisabled ? "translateX(22px)" : "translateX(0px)",
//                     }}
//                   />
//                 </span>
//               </button>
//             </div>

//             <div style={styles.actions}>
//               <button type="submit" disabled={loading} style={styles.primaryBtn}>
//                 {loading ? "Δημιουργία..." : "Create Referral Code"}
//               </button>
//               <button type="button" onClick={handleReset} disabled={loading} style={styles.secondaryBtn}>
//                 Reset
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* RESPONSE CARD */}
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <div>
//               <div style={styles.cardTitle}>Backend Response</div>
//               <div style={styles.cardHint}>Εμφανίζεται μετά από επιτυχία.</div>
//             </div>
//           </div>

//           {!response ? (
//             <div style={styles.emptyState}>
//               <div style={styles.emptyTitle}>No response yet</div>
//               <div style={styles.emptyText}>Δημιούργησε referral code για να εμφανιστεί το JSON.</div>
//             </div>
//           ) : (
//             <pre style={styles.pre}>{JSON.stringify(response, null, 2)}</pre>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateReferralCodePage;

// /* ---------- helper ---------- */
// const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
//   label,
//   required,
//   children,
// }) => (
//   <div style={styles.field}>
//     <label style={styles.label}>
//       {label} {required ? <span style={styles.req}>*</span> : null}
//     </label>
//     {children}
//   </div>
// );

// const styles: Record<string, React.CSSProperties> = {
//   page: {
//     maxWidth: 1100,
//     margin: "0 auto",
//     padding: "20px 16px 28px",
//     background: "#f6f7fb",
//     minHeight: "100vh",
//   },

//   header: { display: "flex", gap: 16, marginBottom: 16 },
//   title: { margin: 0, fontSize: 24, letterSpacing: -0.2, color: "#0f172a" },
//   subtitle: { margin: "8px 0 0", fontSize: 14, color: "#64748b", lineHeight: 1.5 },

//   badge: {
//     fontSize: 12,
//     fontWeight: 900,
//     padding: "6px 10px",
//     borderRadius: 999,
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     color: "#0f172a",
//   },

//   grid: {
//     display: "grid",
//     gridTemplateColumns: "1.1fr 0.9fr",
//     gap: 16,
//     alignItems: "start",
//   },

//   card: {
//     background: "#ffffff",
//     border: "1px solid #e5e7eb",
//     borderRadius: 18,
//     boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
//     padding: 16,
//   },

//   cardHeader: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 },
//   cardTitle: { fontSize: 16, fontWeight: 950, color: "#0f172a", marginBottom: 4 },
//   cardHint: { fontSize: 13, color: "#64748b", lineHeight: 1.4 },

//   alertError: {
//     background: "#fff1f2",
//     border: "1px solid #fecdd3",
//     color: "#9f1239",
//     borderRadius: 14,
//     padding: "10px 12px",
//     fontWeight: 800,
//     marginBottom: 12,
//   },

//   alertSuccess: {
//     background: "#eff6ff",
//     border: `1px solid ${ACCENT}33`,
//     color: "#0b3b7a",
//     borderRadius: 14,
//     padding: "10px 12px",
//     fontWeight: 800,
//     marginBottom: 12,
//   },

//   form: { display: "flex", flexDirection: "column", gap: 14 },

//   field: { display: "flex", flexDirection: "column", gap: 6 },
//   label: { fontSize: 12, fontWeight: 900, color: "#334155" },
//   req: { color: "#ef4444", fontWeight: 900 },

//   input: {
//     height: 42,
//     width: "100%",
//     borderRadius: 14,
//     border: "1px solid #e5e7eb",
//     padding: "0 12px",
//     outline: "none",
//     fontSize: 14,
//     color: "#0f172a",
//     background: "#ffffff",
//   },

//   helperText: { fontSize: 12, color: "#64748b", lineHeight: 1.5 },

//   twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

//   toggleRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     gap: 12,
//     padding: "12px 12px",
//     borderRadius: 16,
//     border: "1px solid #e5e7eb",
//     background: "#fbfdff",
//   },

//   toggleTitle: { fontSize: 13, fontWeight: 950, color: "#0f172a", marginBottom: 2 },

//   actions: { display: "flex", gap: 10, marginTop: 4 },

//   primaryBtn: {
//     height: 42,
//     padding: "0 14px",
//     borderRadius: 14,
//     border: `1px solid ${ACCENT}`,
//     background: ACCENT,
//     color: "#ffffff",
//     cursor: "pointer",
//     fontWeight: 950,
//     whiteSpace: "nowrap",
//     flex: 1,
//     boxShadow: "0 8px 18px rgba(0, 144, 255, 0.18)",
//   },

//   secondaryBtn: {
//     height: 42,
//     padding: "0 14px",
//     borderRadius: 14,
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     color: "#0f172a",
//     cursor: "pointer",
//     fontWeight: 900,
//     whiteSpace: "nowrap",
//   },

//   // ✅ switch
//   switchBtn: {
//     border: "none",
//     background: "transparent",
//     padding: 0,
//     cursor: "pointer",
//     display: "inline-flex",
//     alignItems: "center",
//   },

//   switchDisabled: {
//     cursor: "not-allowed",
//     opacity: 0.7,
//   },

//   switchTrack: {
//     width: 56,
//     height: 32,
//     borderRadius: 999,
//     position: "relative",
//     display: "inline-block",
//     transition: "background-color 160ms ease",
//     boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.08)",
//   },

//   switchThumb: {
//     width: 26,
//     height: 26,
//     borderRadius: 999,
//     background: "#ffffff",
//     position: "absolute",
//     top: 3,
//     left: 3,
//     transition: "transform 180ms ease",
//     boxShadow: "0 6px 16px rgba(15, 23, 42, 0.18)",
//   },

//   switchText: {
//     position: "absolute",
//     inset: 0,
//     display: "flex",
//     alignItems: "center",
//     padding: "0 10px",
//     fontSize: 11,
//     fontWeight: 950,
//     color: "#ffffff",
//     letterSpacing: 0.6,
//     textTransform: "uppercase",
//     pointerEvents: "none",
//     transition: "opacity 160ms ease",
//   },

//   emptyState: {
//     padding: "18px 12px",
//     borderRadius: 14,
//     border: "1px dashed #e5e7eb",
//     background: "#fbfdff",
//   },
//   emptyTitle: { fontWeight: 950, color: "#0f172a", marginBottom: 6 },
//   emptyText: { color: "#64748b", fontSize: 13, lineHeight: 1.5 },

//   pre: {
//     background: "#0b1220",
//     color: "#e5e7eb",
//     padding: 14,
//     borderRadius: 14,
//     overflowX: "auto",
//     fontSize: 12,
//     lineHeight: 1.55,
//     border: "1px solid rgba(148,163,184,0.25)",
//     fontFamily:
//       'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
//   },
// };
  
// src/admin/components/CreateReferralCodePage.tsx
// src/admin/components/CreateReferralCodePage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { createReferralCodeApi } from "../../api/Springboot/ReferralCodeService";
import type { ReferralCodeRequest, ReferralCodeResponse } from "../../models/Springboot/ReferralCode";

const ACCENT = "#0090FF";

// ✅ Responsive helper (UI only — no business logic)
const useBreakpoints = () => {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  return { width, isMobile, isTablet };
};

const CreateReferralCodePage: React.FC = () => {
  const { isMobile, isTablet } = useBreakpoints();
  const isNarrow = isMobile || isTablet;

  const [code, setCode] = useState("KEN123");
  const [creatorId, setCreatorId] = useState<number>(1);
  const [rewardPoints, setRewardPoints] = useState<number>(100);
  const [creatorRewardPoints, setCreatorRewardPoints] = useState<number>(50);
  const [maxUses, setMaxUses] = useState<number>(10);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [response, setResponse] = useState<ReferralCodeResponse | null>(null);

  const disabledLabel = useMemo(() => (isDisabled ? "ON" : "OFF"), [isDisabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResponse(null);
    setLoading(true);

    try {
      const body: ReferralCodeRequest = {
        code: code.trim(),
        ownerId: Number(creatorId),
        rewardPoints: Number(rewardPoints),
        ownerRewardPoints: Number(creatorRewardPoints),
        maxUses: Number(maxUses),
        isDisabled,
      };

      if (!body.code) throw new Error("Το code είναι υποχρεωτικό.");
      if (body.ownerId <= 0) throw new Error("OwnerId πρέπει να είναι > 0.");
      if (body.rewardPoints < 0 || body.ownerRewardPoints < 0) {
        throw new Error("Reward points πρέπει να είναι >= 0.");
      }
      if (body.maxUses < 0) throw new Error("Max uses πρέπει να είναι >= 0.");

      const res = await createReferralCodeApi(body);
      setResponse(res);
      setSuccess(`Ο referral code δημιουργήθηκε: ${res.name}`);
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά.";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode("KEN123");
    setCreatorId(1);
    setRewardPoints(100);
    setCreatorRewardPoints(50);
    setMaxUses(10);
    setIsDisabled(false);
    setError(null);
    setSuccess(null);
    setResponse(null);
  };

  return (
    <div style={{ ...styles.page, ...(isNarrow ? { padding: "14px 12px 20px" } : {}) }}>
      <div style={{ ...styles.header, ...(isNarrow ? { flexDirection: "column", gap: 10 } : {}) }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ ...styles.title, ...(isMobile ? { fontSize: 20 } : {}) }}>Create Referral Code</h1>
            <span style={styles.badge}>Admin</span>
          </div>
          <p style={styles.subtitle}>Δημιούργησε referral code με rewards για χρήστη και creator.</p>
        </div>
      </div>

      <div style={{ ...styles.grid, ...(isNarrow ? { gridTemplateColumns: "1fr", gap: 12 } : {}) }}>
        {/* FORM CARD */}
        <div style={{ ...styles.card, ...(isMobile ? { padding: 14 } : {}) }}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>Details</div>
              <div style={styles.cardHint}>Συμπλήρωσε τα πεδία και πάτα Create.</div>
            </div>
          </div>

          {error && (
            <div style={styles.alertError}>
              <strong>Σφάλμα:</strong> {error}
            </div>
          )}
          {success && (
            <div style={styles.alertSuccess}>
              <strong>OK:</strong> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <Field label="Code" required>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                style={styles.input}
                placeholder="π.χ. KEN123"
                disabled={loading}
              />
              <div style={styles.helperText}>Tip: κεφαλαία γράμματα & αριθμοί (π.χ. “WELCOME25”).</div>
            </Field>

            <div style={{ ...styles.twoCol, ...(isMobile ? { gridTemplateColumns: "1fr" } : {}) }}>
              <Field label="Creator ID" required>
                <input
                  type="number"
                  value={creatorId}
                  onChange={(e) => setCreatorId(Number(e.target.value))}
                  min={1}
                  required
                  style={styles.input}
                  disabled={loading}
                />
              </Field>

              <Field label="Max Uses" required>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  min={0}
                  required
                  style={styles.input}
                  disabled={loading}
                />
              </Field>

              <Field label="Reward Points (user)" required>
                <input
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(Number(e.target.value))}
                  min={0}
                  required
                  style={styles.input}
                  disabled={loading}
                />
              </Field>

              <Field label="Creator Reward Points" required>
                <input
                  type="number"
                  value={creatorRewardPoints}
                  onChange={(e) => setCreatorRewardPoints(Number(e.target.value))}
                  min={0}
                  required
                  style={styles.input}
                  disabled={loading}
                />
              </Field>
            </div>

            {/* Disabled row */}
            <div style={{ ...styles.toggleRow, ...(isNarrow ? { flexDirection: "column", alignItems: "stretch" } : {}) }}>
              <div>
                <div style={styles.toggleTitle}>Disabled</div>
                <div style={styles.cardHint}>Αν ενεργοποιηθεί, ο κωδικός δεν μπορεί να χρησιμοποιηθεί.</div>
              </div>

              {/* Switch */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsDisabled((v) => !v)}
                style={{
                  ...styles.switchBtn,
                  ...(loading ? styles.switchDisabled : {}),
                  ...(isNarrow ? { alignSelf: "flex-end" } : {}),
                }}
                aria-pressed={isDisabled}
                aria-label="Toggle disabled"
              >
                <span
                  style={{
                    ...styles.switchTrack,
                    backgroundColor: isDisabled ? ACCENT : "#e5e7eb",
                  }}
                >
                  <span
                    style={{
                      ...styles.switchText,
                      opacity: isDisabled ? 1 : 0.8,
                      justifyContent: isDisabled ? "flex-start" : "flex-end",
                    }}
                  >
                    {disabledLabel}
                  </span>

                  <span
                    style={{
                      ...styles.switchThumb,
                      transform: isDisabled ? "translateX(22px)" : "translateX(0px)",
                    }}
                  />
                </span>
              </button>
            </div>

            <div style={{ ...styles.actions, ...(isMobile ? { flexDirection: "column", alignItems: "stretch" } : {}) }}>
              {/* ✅ Bigger on mobile */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.primaryBtn,
                  ...(isMobile ? { width: "100%", height: 50, fontSize: 15, borderRadius: 16 } : {}),
                }}
              >
                {loading ? "Δημιουργία..." : "Create Referral Code"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  ...styles.secondaryBtn,
                  ...(isMobile ? { width: "100%", height: 46, borderRadius: 16 } : {}),
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* RESPONSE CARD */}
        <div style={{ ...styles.card, ...(isMobile ? { padding: 14 } : {}) }}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>Backend Response</div>
              <div style={styles.cardHint}>Εμφανίζεται μετά από επιτυχία.</div>
            </div>
          </div>

          {!response ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>No response yet</div>
              <div style={styles.emptyText}>Δημιούργησε referral code για να εμφανιστεί το JSON.</div>
            </div>
          ) : (
            <pre style={{ ...styles.pre, ...(isMobile ? { fontSize: 11, padding: 12, borderRadius: 12 } : {}) }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateReferralCodePage;

/* ---------- helper ---------- */
const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <div style={styles.field}>
    <label style={styles.label}>
      {label} {required ? <span style={styles.req}>*</span> : null}
    </label>
    {children}
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "20px 16px 28px",
    background: "#f6f7fb",
    minHeight: "100vh",
  },

  header: { display: "flex", gap: 16, marginBottom: 16 },
  title: { margin: 0, fontSize: 24, letterSpacing: -0.2, color: "#0f172a" },
  subtitle: { margin: "8px 0 0", fontSize: 14, color: "#64748b", lineHeight: 1.5 },

  badge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 16,
    alignItems: "start",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    padding: 16,
  },

  cardHeader: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 950, color: "#0f172a", marginBottom: 4 },
  cardHint: { fontSize: 13, color: "#64748b", lineHeight: 1.4 },

  alertError: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 800,
    marginBottom: 12,
  },

  alertSuccess: {
    background: "#eff6ff",
    border: `1px solid ${ACCENT}33`,
    color: "#0b3b7a",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 800,
    marginBottom: 12,
  },

  form: { display: "flex", flexDirection: "column", gap: 14 },

  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: "#334155" },
  req: { color: "#ef4444", fontWeight: 900 },

  input: {
    height: 42,
    width: "100%",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#ffffff",
  },

  helperText: { fontSize: 12, color: "#64748b", lineHeight: 1.5 },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "12px 12px",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#fbfdff",
  },

  toggleTitle: { fontSize: 13, fontWeight: 950, color: "#0f172a", marginBottom: 2 },

  actions: { display: "flex", gap: 10, marginTop: 4 },

  primaryBtn: {
    height: 42,
    padding: "0 14px",
    borderRadius: 14,
    border: `1px solid ${ACCENT}`,
    background: ACCENT,
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 950,
    whiteSpace: "nowrap",
    flex: 1,
    boxShadow: "0 8px 18px rgba(0, 144, 255, 0.18)",
  },

  secondaryBtn: {
    height: 42,
    padding: "0 14px",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  // ✅ switch
  switchBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },

  switchDisabled: {
    cursor: "not-allowed",
    opacity: 0.7,
  },

  switchTrack: {
    width: 56,
    height: 32,
    borderRadius: 999,
    position: "relative",
    display: "inline-block",
    transition: "background-color 160ms ease",
    boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.08)",
  },

  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 999,
    background: "#ffffff",
    position: "absolute",
    top: 3,
    left: 3,
    transition: "transform 180ms ease",
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.18)",
  },

  switchText: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    padding: "0 10px",
    fontSize: 11,
    fontWeight: 950,
    color: "#ffffff",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    pointerEvents: "none",
    transition: "opacity 160ms ease",
  },

  emptyState: {
    padding: "18px 12px",
    borderRadius: 14,
    border: "1px dashed #e5e7eb",
    background: "#fbfdff",
  },
  emptyTitle: { fontWeight: 950, color: "#0f172a", marginBottom: 6 },
  emptyText: { color: "#64748b", fontSize: 13, lineHeight: 1.5 },

  pre: {
    background: "#0b1220",
    color: "#e5e7eb",
    padding: 14,
    borderRadius: 14,
    overflowX: "auto",
    fontSize: 12,
    lineHeight: 1.55,
    border: "1px solid rgba(148,163,184,0.25)",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};

