// // src/components/ConfirmBidPopover.tsx
// import React from "react";

// export type ConfirmPlacement = "top" | "bottom";

// export type ConfirmBidState = {
//   auctionId: number;
//   amount: number;
//   title: string;
//   pos: { top: number; left: number; width: number; placement: ConfirmPlacement };
// };

// export const ConfirmBidPopover = React.memo(
//   ({
//     state,
//     onCancel,
//     onConfirm,
//     busy,
//   }: {
//     state: ConfirmBidState;
//     onCancel: () => void;
//     onConfirm: () => void;
//     busy: boolean;
//   }) => {
//     const { pos, amount } = state;

//     const shell: React.CSSProperties = {
//       position: "absolute",
//       top: pos.top,
//       left: pos.left,
//       width: pos.width,
//       zIndex: 10000,
//       borderRadius: 16,
//       overflow: "hidden",
//       background: "#FFFFFF",
//       border: "1px solid rgba(17,24,39,0.10)",
//       boxShadow: "0 22px 55px rgba(17,24,39,0.22)",
//       transform: pos.placement === "top" ? "translateY(-100%)" : "none",
//     };

//     const header: React.CSSProperties = {
//       padding: "12px 14px",
//       borderBottom: "1px solid rgba(17,24,39,0.08)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       gap: 10,
//     };

//     const body: React.CSSProperties = {
//       padding: "12px 14px 14px",
//       display: "grid",
//       gap: 10,
//     };

//     const subtle: React.CSSProperties = {
//       color: "#6B7280",
//       fontWeight: 700,
//       fontSize: 12.5,
//       lineHeight: 1.25,
//     };

//     const amountBox: React.CSSProperties = {
//       borderRadius: 14,
//       background: "rgba(59,130,246,0.08)",
//       border: "1px solid rgba(59,130,246,0.22)",
//       padding: "10px 12px",
//       display: "flex",
//       alignItems: "baseline",
//       justifyContent: "space-between",
//       gap: 10,
//     };

//     const amountLabel: React.CSSProperties = {
//       fontWeight: 900,
//       color: "#1D4ED8",
//       fontSize: 12.5,
//     };

//     const amountValue: React.CSSProperties = {
//       fontWeight: 950,
//       color: "#111827",
//       fontSize: 16,
//       whiteSpace: "nowrap",
//     };

//     const actions: React.CSSProperties = {
//       display: "grid",
//       gridTemplateColumns: "1fr 1fr",
//       gap: 10,
//       marginTop: 2,
//     };

//     const btnBase: React.CSSProperties = {
//       height: 38,
//       borderRadius: 12,
//       border: "1px solid rgba(17, 24, 39, 0.12)",
//       background: "#FFFFFF",
//       fontWeight: 900,
//       fontSize: 13,
//       cursor: "pointer",
//       display: "inline-flex",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 8,
//       userSelect: "none",
//     };

//     const btnCancel: React.CSSProperties = { ...btnBase };
//     const btnConfirm: React.CSSProperties = {
//       ...btnBase,
//       background: "#0B1220",
//       color: "#FFFFFF",
//       border: "1px solid #0B1220",
//       opacity: busy ? 0.65 : 1,
//       cursor: busy ? "not-allowed" : "pointer",
//     };

//     return (
//       <div style={shell} role="dialog" aria-modal="false" aria-label="Confirm bid">
//         <div style={header}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//             <div style={{ minWidth: 0 }}>
//               <div style={{ fontWeight: 950, color: "#111827", fontSize: 13.5 }}>Confirm your bid</div>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={onCancel}
//             aria-label="Close"
//             style={{
//               width: 30,
//               height: 30,
//               borderRadius: 10,
//               border: "none",
//               background: "rgba(255,255,255,0.85)",
//               cursor: "pointer",
//               display: "grid",
//               placeItems: "center",
//               fontWeight: 950,
//               lineHeight: 1,
//               color: "red",
//             }}
//             title="Close"
//           >
//             ✕
//           </button>
//         </div>

//         <div style={body}>
//           <div style={subtle}>Are you sure you want to place this bid?</div>

//           <div style={amountBox}>
//             <div style={amountLabel}>Bid amount</div>
//             <div style={amountValue}>{amount.toFixed(2)} €</div>
//           </div>

//           <div style={actions}>
//             <button type="button" style={btnCancel} onClick={onCancel} disabled={busy}>
//               Cancel
//             </button>
//             <button type="button" style={btnConfirm} onClick={onConfirm} disabled={busy}>
//               {busy ? "Placing..." : "Yes, place bid"}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// ConfirmBidPopover.displayName = "ConfirmBidPopover";


// // src/components/ConfirmBidPopover.tsx
// import React from "react";

// export type ConfirmPlacement = "top" | "bottom" | "center";

// export type ConfirmBidState = {
//   auctionId: number;
//   amount: number;
//   title: string;
//   pos: { top: number; left: number; width: number; placement: ConfirmPlacement };
// };

// export const ConfirmBidPopover = React.memo(
//   ({
//     state,
//     onCancel,
//     onConfirm,
//     busy,
//   }: {
//     state: ConfirmBidState;
//     onCancel: () => void;
//     onConfirm: () => void;
//     busy: boolean;
//   }) => {
//     const { pos, amount } = state;

//     const shell: React.CSSProperties = {
//       position: "absolute",
//       top: pos.top,
//       left: pos.left,
//       width: pos.width,
//       zIndex: 4900,
//       borderRadius: 16,
//       overflow: "hidden",
//       background: "#FFFFFF",
//       border: "1px solid rgba(17,24,39,0.10)",
//       boxShadow: "0 22px 55px rgba(17,24,39,0.22)",
//       transform:
//         pos.placement === "top"
//           ? "translateY(-100%)"
//           : pos.placement === "center"
//           ? "translate(-50%, -50%)"
//           : "none",
//     };

//     const header: React.CSSProperties = {
//       padding: "12px 14px",
//       borderBottom: "1px solid rgba(17,24,39,0.08)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       gap: 10,
//     };

//     const body: React.CSSProperties = {
//       padding: "12px 14px 14px",
//       display: "grid",
//       gap: 10,
//     };

//     const subtle: React.CSSProperties = {
//       color: "#6B7280",
//       fontWeight: 700,
//       fontSize: 12.5,
//       lineHeight: 1.25,
//     };

//     const amountBox: React.CSSProperties = {
//       borderRadius: 14,
//       background: "rgba(59,130,246,0.08)",
//       border: "1px solid rgba(59,130,246,0.22)",
//       padding: "10px 12px",
//       display: "flex",
//       alignItems: "baseline",
//       justifyContent: "space-between",
//       gap: 10,
//     };

//     const amountLabel: React.CSSProperties = {
//       fontWeight: 900,
//       color: "#1D4ED8",
//       fontSize: 12.5,
//     };

//     const amountValue: React.CSSProperties = {
//       fontWeight: 950,
//       color: "#111827",
//       fontSize: 16,
//       whiteSpace: "nowrap",
//     };

//     const actions: React.CSSProperties = {
//       display: "grid",
//       gridTemplateColumns: "1fr 1fr",
//       gap: 10,
//       marginTop: 2,
//     };

//     const btnBase: React.CSSProperties = {
//       height: 38,
//       borderRadius: 12,
//       border: "1px solid rgba(17, 24, 39, 0.12)",
//       background: "#FFFFFF",
//       fontWeight: 900,
//       fontSize: 13,
//       cursor: "pointer",
//       display: "inline-flex",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 8,
//       userSelect: "none",
//     };

//     const btnCancel: React.CSSProperties = { ...btnBase };
//     const btnConfirm: React.CSSProperties = {
//       ...btnBase,
//       background: "#0B1220",
//       color: "#FFFFFF",
//       border: "1px solid #0B1220",
//       opacity: busy ? 0.65 : 1,
//       cursor: busy ? "not-allowed" : "pointer",
//     };

//     return (
//       <div style={shell} role="dialog" aria-modal="false" aria-label="Confirm bid">
//         <div style={header}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//             <div style={{ minWidth: 0 }}>
//               <div style={{ fontWeight: 950, color: "#111827", fontSize: 13.5 }}>Confirm your bid</div>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={onCancel}
//             aria-label="Close"
//             style={{
//               width: 30,
//               height: 30,
//               borderRadius: 10,
//               border: "none",
//               background: "rgba(255,255,255,0.85)",
//               cursor: "pointer",
//               display: "grid",
//               placeItems: "center",
//               fontWeight: 950,
//               lineHeight: 1,
//               color: "red",
//             }}
//             title="Close"
//           >
//             ✕
//           </button>
//         </div>

//         <div style={body}>
//           <div style={subtle}>Are you sure you want to place this bid?</div>

//           <div style={amountBox}>
//             <div style={amountLabel}>Bid amount</div>
//             <div style={amountValue}>{amount.toFixed(2)} €</div>
//           </div>

//           <div style={actions}>
//             <button type="button" style={btnCancel} onClick={onCancel} disabled={busy}>
//               Cancel
//             </button>
//             <button type="button" style={btnConfirm} onClick={onConfirm} disabled={busy}>
//               {busy ? "Placing..." : "Yes, place bid"}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// ConfirmBidPopover.displayName = "ConfirmBidPopover";

// src/components/ConfirmBidPopover.tsx
import React from "react";

export type ConfirmPlacement = "top" | "bottom" | "center";

export type ConfirmBidState = {
  auctionId: number;
  amount: number;
  title: string;

  // ✅ NEW: show previous bid (top bid) or fallback to starting price
  lastAmount?: number | null;
  startingAmount?: number | null;

  pos: { top: number; left: number; width: number; placement: ConfirmPlacement };
};

export const ConfirmBidPopover = React.memo(
  ({
    state,
    onCancel,
    onConfirm,
    busy,
  }: {
    state: ConfirmBidState;
    onCancel: () => void;
    onConfirm: () => void;
    busy: boolean;
  }) => {
    const { pos, amount, title, lastAmount, startingAmount } = state;

    // ✅ normalize numbers (so toFixed() never crashes)
    const prevRaw = lastAmount;
    const startRaw = startingAmount;

    const prevNum =
      typeof prevRaw === "number"
        ? prevRaw
        : typeof prevRaw === "string"
        ? Number(prevRaw)
        : null;

    const startNum =
      typeof startRaw === "number"
        ? startRaw
        : typeof startRaw === "string"
        ? Number(startRaw)
        : null;

    const hasPrev = prevNum != null && Number.isFinite(prevNum);
    const prevLabel = hasPrev ? "Previous bid:" : "Starting price:";
    const prevValue = hasPrev ? prevNum! : startNum != null && Number.isFinite(startNum) ? startNum : 0;

    // Βάλε εδώ το σωστό public path
    const bgUrl = "/images/authentication_background.png";

    const shell: React.CSSProperties = {
      position: "absolute",
      top: pos.top,
      left: pos.left,
      width: pos.width,
      zIndex: 4900,
      borderRadius: 18,
      overflow: "hidden",
      background: "rgba(255,255,255,0.96)",
      border: "1px solid rgba(17,24,39,0.10)",
      boxShadow: "0 26px 70px rgba(17,24,39,0.24)",
      transform:
        pos.placement === "top"
          ? "translateY(-100%)"
          : pos.placement === "center"
          ? "translate(-50%, -50%)"
          : "none",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    };

    const hero: React.CSSProperties = {
      position: "relative",
      padding: "14px 14px 12px",
      backgroundImage: `linear-gradient(135deg, rgba(2,6,23,0.70), rgba(37,99,235,0.28)), url(${bgUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "#FFFFFF",
    };

    const heroTitle: React.CSSProperties = {
      marginTop: 10,
      fontWeight: 950,
      fontSize: 16,
      lineHeight: 1.15,
      textShadow: "0 2px 10px rgba(0,0,0,0.25)",
    };

    const heroSubtitle: React.CSSProperties = {
      marginTop: 6,
      fontWeight: 800,
      fontSize: 12.5,
      color: "rgba(255,255,255,0.88)",
      lineHeight: 1.2,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: "100%",
    };

    const body: React.CSSProperties = {
      padding: "14px",
      display: "grid",
      gap: 12,
    };

    const infoCard: React.CSSProperties = {
      borderRadius: 16,
      padding: "12px 12px",
      border: "1px solid rgba(17,24,39,0.12)",
      background: "linear-gradient(180deg, rgba(17,24,39,0.04), rgba(17,24,39,0.02))",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    };

    const amountCard: React.CSSProperties = {
      borderRadius: 16,
      padding: "12px 12px",
      border: "1px solid rgba(37,99,235,0.20)",
      background: "linear-gradient(180deg, rgba(37,99,235,0.08), rgba(37,99,235,0.04))",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    };

    const amountMeta: React.CSSProperties = {
      display: "grid",
      gap: 2,
      minWidth: 0,
    };

    const labelText: React.CSSProperties = {
      fontWeight: 950,
      color: "#111827",
      fontSize: 12.5,
      letterSpacing: 0.2,
      opacity: 0.9,
    };

    const amountLabel: React.CSSProperties = {
      fontWeight: 950,
      color: "#1D4ED8",
      fontSize: 12.5,
      letterSpacing: 0.2,
    };

    const amountValue: React.CSSProperties = {
      fontWeight: 950,
      color: "#0B1220",
      fontSize: 20,
      whiteSpace: "nowrap",
      fontVariantNumeric: "tabular-nums",
    };

    const actions: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginTop: 2,
    };

    const btnBase: React.CSSProperties = {
      height: 40,
      borderRadius: 14,
      border: "1px solid rgba(17, 24, 39, 0.12)",
      background: "#FFFFFF",
      fontWeight: 950,
      fontSize: 13.5,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      userSelect: "none",
      transition: "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
    };

    const btnCancel: React.CSSProperties = {
      ...btnBase,
      color: "rgb(246, 85, 85)",
      border: "1px solid rgb(246, 85, 85)",
      background: "#FFFFFF",
      opacity: busy ? 0.75 : 1,
      cursor: busy ? "not-allowed" : "pointer",
    };

    const btnConfirm: React.CSSProperties = {
      ...btnBase,
      border: "1px solid rgba(37,99,235,0.25)",
      background: "linear-gradient(135deg, #2563EB, #0B1220)",
      color: "#FFFFFF",
      boxShadow: "0 12px 22px rgba(37,99,235,0.18)",
      opacity: busy ? 0.7 : 1,
      cursor: busy ? "not-allowed" : "pointer",
    };

    return (
      <div style={shell} role="dialog" aria-modal="false" aria-label="Confirm bid">
        {/* HERO HEADER με background */}
        <div style={hero}>
          <div style={heroTitle}>Confirm your bid</div>
          <div style={heroSubtitle} title={title}>
            {title || "Auction item"}
          </div>
        </div>

        {/* BODY */}
        <div style={body}>
          {/* ✅ Previous bid / Starting price */}
          <div style={infoCard}>
            <div style={amountMeta}>
              <div style={labelText}>{prevLabel}</div>
            </div>
            <div style={{ ...amountValue, fontSize: 18 }}>{prevValue.toFixed(2)} €</div>
          </div>

          {/* Bid amount */}
          <div style={amountCard}>
            <div style={amountMeta}>
              <div style={amountLabel}>Your Bid amount:</div>
            </div>
            <div style={amountValue}>{Number.isFinite(amount) ? amount.toFixed(2) : "0.00"} €</div>
          </div>

          <div style={actions}>
            <button type="button" style={btnCancel} onClick={onCancel} disabled={busy}>
              Cancel
            </button>

            <button type="button" style={btnConfirm} onClick={onConfirm} disabled={busy}>
              {busy ? "Placing..." : "Yes, place bid"}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ConfirmBidPopover.displayName = "ConfirmBidPopover";
