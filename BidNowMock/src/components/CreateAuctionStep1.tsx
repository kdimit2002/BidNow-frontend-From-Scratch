
// // src/components/CreateAuctionStep1.tsx

// import React, { useState, useEffect } from "react";
// import type {
//   AuctionCreateRequest,
//   AuctionDetails,
//   ShippingCostPayer,
// } from "../models/Springboot/Auction";
// import { createAuction } from "../api/Springboot/backendAuctionService";

// import { getCategories } from "../api/Springboot/backendCategoryService";
// import type { CategoryDto } from "../api/Springboot/backendCategoryService";

// interface CreateAuctionStep1Props {
//   onCompleted: (data: { auctionId: number; createdAuction: AuctionDetails }) => void;
// }

// // helper: φτιάχνει LocalDateTime string τύπου "YYYY-MM-DDTHH:mm:ss"
// // εδώ βάζω now + 10 seconds για να περάσει το @Future
// function buildStartDateNowPlus10Seconds(): string {
//   const now = new Date();
//   const future = new Date(now.getTime() + 10 * 1000); // +10s
//   const pad = (n: number) => n.toString().padStart(2, "0");

//   const year = future.getFullYear();
//   const month = pad(future.getMonth() + 1);
//   const day = pad(future.getDate());
//   const hours = pad(future.getHours());
//   const minutes = pad(future.getMinutes());
//   const seconds = pad(future.getSeconds());

//   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
// }

// const CreateAuctionStep1: React.FC<CreateAuctionStep1Props> = ({ onCompleted }) => {
//   const [categoryId, setCategoryId] = useState<string>("");

//   const [title, setTitle] = useState<string>("PS4");
//   const [shortDescription, setShortDescription] = useState<string>("Playstation 4 with game");
//   const [description, setDescription] = useState<string>("Playstation 4 in good condition with FC26");
//   const [startingAmount, setStartingAmount] = useState<string>("50");
//   const [minBidIncrement, setMinBidIncrement] = useState<string>("1");
//   const [shippingCostPayer, setShippingCostPayer] =
//     useState<ShippingCostPayer>("BUYER");
//   const [endDate, setEndDate] = useState<string>("");

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const [categories, setCategories] = useState<CategoryDto[]>([]);
//   const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
//   const [categoriesError, setCategoriesError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadCategories = async () => {
//       setCategoriesLoading(true);
//       setCategoriesError(null);
//       try {
//         const result = await getCategories();
//         setCategories(result);

//         if (result.length > 0) {
//           setCategoryId(result[0].id.toString());
//         }
//       } catch (err: unknown) {
//         console.error(err);
//         let message = "Κάτι πήγε στραβά κατά τη φόρτωση των κατηγοριών.";
//         if (err instanceof Error) {
//           message = err.message;
//         }
//         setCategoriesError(message);
//       } finally {
//         setCategoriesLoading(false);
//       }
//     };

//     loadCategories();
//   }, []);

//   const handleSubmit: React.FormEventHandler = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!categoryId) {
//       setError("Επίλεξε κατηγορία πριν δημιουργήσεις τη δημοπρασία.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const startDate = buildStartDateNowPlus10Seconds();

//       const request: AuctionCreateRequest = {
//         categoryId: Number(categoryId),
//         title,
//         shortDescription,
//         description,
//         startingAmount: Number(startingAmount),
//         minBidIncrement: Number(minBidIncrement),
//         startDate, // ✅ auto (now + 10s)
//         endDate,   // ✅ user input
//         shippingCostPayer,
//       };

//       const created = await createAuction(request);
//       setSuccess(`Auction created with id=${created.id}`);

//       onCompleted({ auctionId: created.id, createdAuction: created });
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη δημιουργία της δημοπρασίας.";
//       if (err instanceof Error) {
//         message = err.message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------
//   // 🎨 Styles (μόνο UI)
//   // ----------------------------
//   // ✅ Full-bleed background (για να καλύπτει όλο το viewport ακόμα κι αν ο parent έχει maxWidth)
//   const pageOuter: React.CSSProperties = {
//     width: "100vw",
//     marginLeft: "calc(50% - 50vw)",
//     minHeight: "100vh",
//     background: "#F2F4F7",
//     padding: "22px 18px 34px",
//     boxSizing: "border-box",
//   };

//   const wrap: React.CSSProperties = {
//     maxWidth: 1080, // ✅ πιο μεγάλο
//     margin: "0 auto",
//   };

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

//   const stepLabel: React.CSSProperties = {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#111827",
//   };

//   const stepLabelMuted: React.CSSProperties = {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#9CA3AF",
//   };

//   const card: React.CSSProperties = {
//     marginTop: 18,
//     background: "white",
//     borderRadius: 16,
//     boxShadow: "0 14px 30px rgba(16,24,40,0.12)",
//     border: "1px solid rgba(17,24,39,0.08)",
//     padding: 24, // ✅ λίγο πιο ψηλό/άνετο
//   };

//   const cardTitle: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: 14,
//     marginBottom: 12,
//   };

//   const alertBox = (type: "error" | "success"): React.CSSProperties => ({
//     marginTop: 10,
//     padding: "10px 12px",
//     borderRadius: 12,
//     border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//     background: type === "error" ? "#FEF2F2" : "#F0FDF4",
//     color: type === "error" ? "#991B1B" : "#166534",
//     fontWeight: 800,
//     fontSize: 13,
//   });

//   const formGrid: React.CSSProperties = {
//     marginTop: 14,
//     display: "grid",
//     gap: 14,
//   };

//   const label: React.CSSProperties = {
//     fontWeight: 800,
//     fontSize: 12,
//     color: "#111827",
//   };

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

//   const textarea: React.CSSProperties = {
//     ...input,
//     minHeight: 90,
//     resize: "vertical",
//   };

//   const helper: React.CSSProperties = {
//     color: "#9CA3AF",
//     fontWeight: 800,
//     fontSize: 12,
//   };

//   const row3: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
//     gap: 12,
//   };

//   const row2: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//     gap: 12,
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

//   const tipsCard: React.CSSProperties = {
//     marginTop: 14,
//     background: "#EAF2FF",
//     border: "1px solid rgba(37,99,235,0.18)",
//     borderRadius: 16,
//     padding: 14,
//   };

//   const tipsTitle: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: 13,
//     marginBottom: 8,
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//   };

//   const tipsList: React.CSSProperties = {
//     margin: 0,
//     paddingLeft: 18,
//     color: "#1F2937",
//     fontWeight: 700,
//     fontSize: 12,
//     lineHeight: 1.55,
//   };

//   return (
//     <div style={pageOuter}>
//       <div style={wrap}>
//         <div style={topHint}>Create your auction listing</div>

//         {/* stepper */}
//         <div style={stepperRow}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(true)}>1</div>
//             <div style={stepLabel}>Auction Details</div>
//           </div>

//           <div style={stepLine} />

//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(false)}>2</div>
//             <div style={stepLabelMuted}>Product Images</div>
//           </div>
//         </div>

//         <div style={card}>
//           <div style={cardTitle}>Step 1: Auction Details</div>

//           {error && <div style={alertBox("error")}>Σφάλμα: {error}</div>}
//           {success && <div style={alertBox("success")}>{success}</div>}
//           {categoriesError && <div style={alertBox("error")}>{categoriesError}</div>}

//           <form onSubmit={handleSubmit} style={formGrid}>
//             {/* Title */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Auction Title *</div>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 required
//                 placeholder="e.g. Vintage Camera, Designer Watch"
//                 style={input}
//               />
//             </div>

//             {/* Category */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Category *</div>
//               <select
//                 value={categoryId}
//                 onChange={(e) => setCategoryId(e.target.value)}
//                 required
//                 style={input}
//                 disabled={categoriesLoading || categories.length === 0}
//               >
//                 {categoriesLoading && <option>Φόρτωση κατηγοριών...</option>}
//                 {!categoriesLoading && categories.length === 0 && (
//                   <option value="">Δεν υπάρχουν διαθέσιμες κατηγορίες</option>
//                 )}
//                 {!categoriesLoading &&
//                   categories.length > 0 &&
//                   categories.map((c) => (
//                     <option key={c.id} value={c.id.toString()}>
//                       {c.name}
//                     </option>
//                   ))}
//               </select>
//             </div>

//             {/* Short Description */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Short Description *</div>
//               <input
//                 type="text"
//                 value={shortDescription}
//                 onChange={(e) => setShortDescription(e.target.value)}
//                 required
//                 placeholder="Brief overview of your item (max 200 characters)"
//                 style={input}
//               />
//               <div style={helper}>{shortDescription.length}/200 characters</div>
//             </div>

//             {/* Full Description */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Full Description *</div>
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 required
//                 placeholder="Detailed description including condition, features, specifications, etc."
//                 style={textarea}
//               />
//             </div>

//             {/* Prices row */}
//             {/* ✅ ΔΕΝ βάζω “Starting Bid” (δεν υπάρχει καν στο functionality) */}
//             <div style={row3}>
//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Starting Price (€) *</div>
//                 <input
//                   type="number"
//                   value={startingAmount}
//                   onChange={(e) => setStartingAmount(e.target.value)}
//                   required
//                   step="0.01"
//                   style={input}
//                 />
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Minimum Raise (€) *</div>
//                 <input
//                   type="number"
//                   value={minBidIncrement}
//                   onChange={(e) => setMinBidIncrement(e.target.value)}
//                   required
//                   step="0.01"
//                   style={input}
//                 />
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Shipping Cost Payer *</div>
//                 <select
//                   value={shippingCostPayer}
//                   onChange={(e) => setShippingCostPayer(e.target.value as ShippingCostPayer)}
//                   style={input}
//                 >
//                   <option value="SELLER">Seller pays shipping</option>
//                   <option value="BUYER">Buyer pays shipping</option>
//                   <option value="SPLIT">Split 50 / 50</option>
//                 </select>
//               </div>
//             </div>

//             {/* Dates row */}
//             {/* ✅ ΔΕΝ δείχνω Start date input (startDate = now+10s στο backend request όπως πριν) */}
//             <div style={row2}>
//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>End Date *</div>
//                 <input
//                   type="datetime-local"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                   required
//                   style={input}
//                 />
//               </div>
//             </div>

//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
//               <button
//                 type="submit"
//                 disabled={loading || categoriesLoading}
//                 style={loading || categoriesLoading ? primaryBtnDisabled : primaryBtn}
//               >
//                 {loading ? "Creating..." : "Next: Add images"} <span aria-hidden>→</span>
//               </button>
//             </div>
//           </form>
//         </div>

//         <div style={tipsCard}>
//           <div style={tipsTitle}>
//             <span aria-hidden>💡</span>
//             <span>Tips for a Successful Auction</span>
//           </div>
//           <ul style={tipsList}>
//             <li>Use clear, high-quality images from multiple angles</li>
//             <li>Write detailed, accurate descriptions</li>
//             <li>Set a competitive starting price</li>
//             <li>Be responsive to questions in the chat</li>
//             <li>Choose appropriate auction end date</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAuctionStep1;
// src/components/CreateAuctionStep1.tsx

// import React, { useEffect, useState } from "react";
// import type {
//   AuctionCreateRequest,
//   AuctionDetails,
//   ShippingCostPayer,
// } from "../models/Springboot/Auction";
// import { createAuction } from "../api/Springboot/backendAuctionService";
// import { getCategories } from "../api/Springboot/backendCategoryService";
// import type { CategoryDto } from "../api/Springboot/backendCategoryService";

// // ✅ draft type για να κρατάμε τα πεδία όταν κάνουμε back από Step2
// export type AuctionDraft = {
//   categoryId: string;
//   title: string;
//   shortDescription: string;
//   description: string;
//   startingAmount: string;
//   minBidIncrement: string;
//   shippingCostPayer: ShippingCostPayer;
//   endDate: string;
// };

// interface CreateAuctionStep1Props {
//   draft: AuctionDraft;
//   onDraftChange: (patch: Partial<AuctionDraft>) => void;
//   onCompleted: (data: { auctionId: number; createdAuction: AuctionDetails }) => void;
// }

// // helper: φτιάχνει LocalDateTime string τύπου "YYYY-MM-DDTHH:mm:ss"
// function buildStartDateNowPlus10Seconds(): string {
//   const now = new Date();
//   const future = new Date(now.getTime() + 10 * 1000);
//   const pad = (n: number) => n.toString().padStart(2, "0");

//   const year = future.getFullYear();
//   const month = pad(future.getMonth() + 1);
//   const day = pad(future.getDate());
//   const hours = pad(future.getHours());
//   const minutes = pad(future.getMinutes());
//   const seconds = pad(future.getSeconds());

//   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
// }

// const CreateAuctionStep1: React.FC<CreateAuctionStep1Props> = ({ draft, onDraftChange, onCompleted }) => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const [categories, setCategories] = useState<CategoryDto[]>([]);
//   const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
//   const [categoriesError, setCategoriesError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadCategories = async () => {
//       setCategoriesLoading(true);
//       setCategoriesError(null);
//       try {
//         const result = await getCategories();
//         setCategories(result);

//         // ✅ αν δεν έχει επιλεγεί τίποτα, βάλε default την πρώτη κατηγορία
//         // ✅ ΜΗΝ κάνεις override αν υπάρχει ήδη draft.categoryId
//         if (!draft.categoryId && result.length > 0) {
//           onDraftChange({ categoryId: result[0].id.toString() });
//         }
//       } catch (err: unknown) {
//         console.error(err);
//         let message = "Κάτι πήγε στραβά κατά τη φόρτωση των κατηγοριών.";
//         if (err instanceof Error) {
//           message = err.message;
//         }
//         setCategoriesError(message);
//       } finally {
//         setCategoriesLoading(false);
//       }
//     };

//     loadCategories();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleSubmit: React.FormEventHandler = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!draft.categoryId) {
//       setError("Επίλεξε κατηγορία πριν δημιουργήσεις τη δημοπρασία.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const startDate = buildStartDateNowPlus10Seconds();

//       const request: AuctionCreateRequest = {
//         categoryId: Number(draft.categoryId),
//         title: draft.title,
//         shortDescription: draft.shortDescription,
//         description: draft.description,
//         startingAmount: Number(draft.startingAmount),
//         minBidIncrement: Number(draft.minBidIncrement),
//         startDate, // ✅ auto (now + 10s)
//         endDate: draft.endDate, // ✅ user input
//         shippingCostPayer: draft.shippingCostPayer,
//       };

//       const created = await createAuction(request);
//       setSuccess(`Auction created with id=${created.id}`);

//       onCompleted({ auctionId: created.id, createdAuction: created });
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη δημιουργία της δημοπρασίας.";
//       if (err instanceof Error) {
//         message = err.message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------
//   // 🎨 Styles (μόνο UI)
//   // ----------------------------
//   const pageOuter: React.CSSProperties = {
//     width: "100vw",
//     marginLeft: "calc(50% - 50vw)",
//     minHeight: "100vh",
//     background: "#F2F4F7",
//     padding: "22px 18px 34px",
//     boxSizing: "border-box",
//   };

//   const wrap: React.CSSProperties = {
//     maxWidth: 1080,
//     margin: "0 auto",
//   };

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

//   const stepLabel: React.CSSProperties = {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#111827",
//   };

//   const stepLabelMuted: React.CSSProperties = {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#9CA3AF",
//   };

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

//   const alertBox = (type: "error" | "success"): React.CSSProperties => ({
//     marginTop: 10,
//     padding: "10px 12px",
//     borderRadius: 12,
//     border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//     background: type === "error" ? "#FEF2F2" : "#F0FDF4",
//     color: type === "error" ? "#991B1B" : "#166534",
//     fontWeight: 800,
//     fontSize: 13,
//   });

//   const formGrid: React.CSSProperties = {
//     marginTop: 14,
//     display: "grid",
//     gap: 14,
//   };

//   const label: React.CSSProperties = {
//     fontWeight: 800,
//     fontSize: 12,
//     color: "#111827",
//   };

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

//   const textarea: React.CSSProperties = {
//     ...input,
//     minHeight: 90,
//     resize: "vertical",
//   };

//   const helper: React.CSSProperties = {
//     color: "#9CA3AF",
//     fontWeight: 800,
//     fontSize: 12,
//   };

//   const row3: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
//     gap: 12,
//   };

//   const row2: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//     gap: 12,
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

//   const tipsCard: React.CSSProperties = {
//     marginTop: 14,
//     background: "#EAF2FF",
//     border: "1px solid rgba(37,99,235,0.18)",
//     borderRadius: 16,
//     padding: 14,
//   };

//   const tipsTitle: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: 13,
//     marginBottom: 8,
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//   };

//   const tipsList: React.CSSProperties = {
//     margin: 0,
//     paddingLeft: 18,
//     color: "#1F2937",
//     fontWeight: 700,
//     fontSize: 12,
//     lineHeight: 1.55,
//   };

//   return (
//     <div style={pageOuter}>
//       <div style={wrap}>
//         <div style={topHint}>Create your auction listing</div>

//         {/* stepper */}
//         <div style={stepperRow}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(true)}>1</div>
//             <div style={stepLabel}>Auction Details</div>
//           </div>

//           <div style={stepLine} />

//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(false)}>2</div>
//             <div style={stepLabelMuted}>Product Images</div>
//           </div>
//         </div>

//         <div style={card}>
//           <div style={cardTitle}>Step 1: Auction Details</div>

//           {error && <div style={alertBox("error")}>Σφάλμα: {error}</div>}
//           {success && <div style={alertBox("success")}>{success}</div>}
//           {categoriesError && <div style={alertBox("error")}>{categoriesError}</div>}

//           <form onSubmit={handleSubmit} style={formGrid}>
//             {/* Title */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Auction Title *</div>
//               <input
//                 type="text"
//                 value={draft.title}
//                 onChange={(e) => onDraftChange({ title: e.target.value })}
//                 required
//                 placeholder="e.g. Vintage Camera, Designer Watch"
//                 style={input}
//               />
//             </div>

//             {/* Category */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Category *</div>
//               <select
//                 value={draft.categoryId}
//                 onChange={(e) => onDraftChange({ categoryId: e.target.value })}
//                 required
//                 style={input}
//                 disabled={categoriesLoading || categories.length === 0}
//               >
//                 {categoriesLoading && <option>Φόρτωση κατηγοριών...</option>}
//                 {!categoriesLoading && categories.length === 0 && (
//                   <option value="">Δεν υπάρχουν διαθέσιμες κατηγορίες</option>
//                 )}
//                 {!categoriesLoading &&
//                   categories.length > 0 &&
//                   categories.map((c) => (
//                     <option key={c.id} value={c.id.toString()}>
//                       {c.name}
//                     </option>
//                   ))}
//               </select>
//             </div>

//             {/* Short Description */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Short Description *</div>
//               <input
//                 type="text"
//                 value={draft.shortDescription}
//                 onChange={(e) => onDraftChange({ shortDescription: e.target.value })}
//                 required
//                 placeholder="Brief overview of your item (max 200 characters)"
//                 style={input}
//               />
//               <div style={helper}>{draft.shortDescription.length}/200 characters</div>
//             </div>

//             {/* Full Description */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Full Description *</div>
//               <textarea
//                 value={draft.description}
//                 onChange={(e) => onDraftChange({ description: e.target.value })}
//                 required
//                 placeholder="Detailed description including condition, features, specifications, etc."
//                 style={textarea}
//               />
//             </div>

//             {/* Prices row */}
//             <div style={row3}>
//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Starting Price (€) *</div>
//                 <input
//                   type="number"
//                   value={draft.startingAmount}
//                   onChange={(e) => onDraftChange({ startingAmount: e.target.value })}
//                   required
//                   step="0.01"
//                   style={input}
//                 />
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Minimum Raise (€) *</div>
//                 <input
//                   type="number"
//                   value={draft.minBidIncrement}
//                   onChange={(e) => onDraftChange({ minBidIncrement: e.target.value })}
//                   required
//                   step="0.01"
//                   style={input}
//                 />
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Shipping Cost Payer *</div>
//                 <select
//                   value={draft.shippingCostPayer}
//                   onChange={(e) =>
//                     onDraftChange({ shippingCostPayer: e.target.value as ShippingCostPayer })
//                   }
//                   style={input}
//                 >
//                   <option value="SELLER">Seller pays shipping</option>
//                   <option value="BUYER">Buyer pays shipping</option>
//                   <option value="SPLIT">Split 50 / 50</option>
//                 </select>
//               </div>
//             </div>

//             {/* Dates row */}
//             <div style={row2}>
//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>End Date *</div>
//                 <input
//                   type="datetime-local"
//                   value={draft.endDate}
//                   onChange={(e) => onDraftChange({ endDate: e.target.value })}
//                   required
//                   style={input}
//                 />
//               </div>
//             </div>

//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
//               <button
//                 type="submit"
//                 disabled={loading || categoriesLoading}
//                 style={loading || categoriesLoading ? primaryBtnDisabled : primaryBtn}
//               >
//                 {loading ? "Creating..." : "Next: Add images"} <span aria-hidden>→</span>
//               </button>
//             </div>
//           </form>
//         </div>

//         <div style={tipsCard}>
//           <div style={tipsTitle}>
//             <span aria-hidden>💡</span>
//             <span>Tips for a Successful Auction</span>
//           </div>
//           <ul style={tipsList}>
//             <li>Use clear, high-quality images from multiple angles</li>
//             <li>Write detailed, accurate descriptions</li>
//             <li>Set a competitive starting price</li>
//             <li>Be responsive to questions in the chat</li>
//             <li>Choose appropriate auction end date</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAuctionStep1;

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import type {
//   AuctionCreateRequest,
//   AuctionDetails,
//   ShippingCostPayer,
// } from "../models/Springboot/Auction";
// import { createAuction } from "../api/Springboot/backendAuctionService";
// import { getCategories } from "../api/Springboot/backendCategoryService";
// import type { CategoryDto } from "../api/Springboot/backendCategoryService";

// // ✅ draft type για να κρατάμε τα πεδία όταν κάνουμε back από Step2
// export type AuctionDraft = {
//   categoryId: string;
//   title: string;
//   shortDescription: string;
//   description: string;
//   startingAmount: string;
//   minBidIncrement: string;
//   shippingCostPayer: ShippingCostPayer;
//   endDate: string;
// };

// interface CreateAuctionStep1Props {
//   draft: AuctionDraft;
//   onDraftChange: (patch: Partial<AuctionDraft>) => void;
//   onCompleted: (data: { auctionId: number; createdAuction: AuctionDetails }) => void;
//   onBack?: () => void; // ✅ NEW: Back to all auctions
// }

// // helper: φτιάχνει LocalDateTime string τύπου "YYYY-MM-DDTHH:mm:ss"
// function buildStartDateNowPlus10Seconds(): string {
//   const now = new Date();
//   const future = new Date(now.getTime() + 10 * 1000);
//   const pad = (n: number) => n.toString().padStart(2, "0");

//   const year = future.getFullYear();
//   const month = pad(future.getMonth() + 1);
//   const day = pad(future.getDate());
//   const hours = pad(future.getHours());
//   const minutes = pad(future.getMinutes());
//   const seconds = pad(future.getSeconds());

//   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
// }

// // ✅ format για input type="datetime-local" → "YYYY-MM-DDTHH:mm"
// function toDateTimeLocalValue(d: Date): string {
//   const pad = (n: number) => n.toString().padStart(2, "0");
//   const year = d.getFullYear();
//   const month = pad(d.getMonth() + 1);
//   const day = pad(d.getDate());
//   const hours = pad(d.getHours());
//   const minutes = pad(d.getMinutes());
//   return `${year}-${month}-${day}T${hours}:${minutes}`;
// }

// const CreateAuctionStep1: React.FC<CreateAuctionStep1Props> = ({
//   draft,
//   onDraftChange,
//   onCompleted,
//   onBack,
// }) => {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const [categories, setCategories] = useState<CategoryDto[]>([]);
//   const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
//   const [categoriesError, setCategoriesError] = useState<string | null>(null);

//   // ✅ FIX: αποφεύγουμε override του category αν ο χρήστης το άλλαξε πριν τελειώσει το fetch
//   const latestCategoryIdRef = useRef<string>(draft.categoryId);
//   const userTouchedCategoryRef = useRef<boolean>(false);

//   useEffect(() => {
//     latestCategoryIdRef.current = draft.categoryId;
//   }, [draft.categoryId]);

//   useEffect(() => {
//     const loadCategories = async () => {
//       setCategoriesLoading(true);
//       setCategoriesError(null);
//       try {
//         const result = await getCategories();
//         setCategories(result);

//         // ✅ default μόνο αν δεν έχει category ΚΑΙ ο χρήστης δεν “άγγιξε” το select
//         if (
//           !userTouchedCategoryRef.current &&
//           !latestCategoryIdRef.current &&
//           result.length > 0
//         ) {
//           onDraftChange({ categoryId: result[0].id.toString() });
//         }
//       } catch (err: unknown) {
//         console.error(err);
//         let message = "Something went wrong while loading categories. Please try again.";
//         if (err instanceof Error) message = err.message;
//         setCategoriesError(message);
//       } finally {
//         setCategoriesLoading(false);
//       }
//     };

//     loadCategories();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleBack = () => {
//     if (onBack) onBack();
//     else navigate("/");
//   };

//   const handleSubmit: React.FormEventHandler = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!draft.categoryId) {
//       setError("Please choose a category before creating your auction.");      return;
//     }

//     setLoading(true);

//     try {
//       const startDate = buildStartDateNowPlus10Seconds();

//       const request: AuctionCreateRequest = {
//         categoryId: Number(draft.categoryId),
//         title: draft.title,
//         shortDescription: draft.shortDescription,
//         description: draft.description,
//         startingAmount: Number(draft.startingAmount),
//         minBidIncrement: Number(draft.minBidIncrement),
//         startDate, // ✅ auto (now + 10s)
//         endDate: draft.endDate, // ✅ user input
//         shippingCostPayer: draft.shippingCostPayer,
//       };

//       const created = await createAuction(request);
//       setSuccess(`Auction created with id=${created.id}`);

//       onCompleted({ auctionId: created.id, createdAuction: created });
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Something went wrong while creating your auction. Please try again.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------
//   // 🎨 Styles (μόνο UI)
//   // ----------------------------
//   const pageOuter: React.CSSProperties = {
//     width: "100vw",
//     marginLeft: "calc(50% - 50vw)",
//     minHeight: "100vh",
//     background: "#F2F4F7",
//     padding: "22px 18px 34px",
//     boxSizing: "border-box",
//   };

//   const wrap: React.CSSProperties = {
//     maxWidth: 1080,
//     margin: "0 auto",
//   };

//   const backBtn: React.CSSProperties = {
//     height: 40,
//     padding: "0 14px",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 900,
//     cursor: "pointer",
//     margin: "0 0 12px 0",
//   };

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

//   const stepLabel: React.CSSProperties = {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#111827",
//   };

//   const stepLabelMuted: React.CSSProperties = {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#9CA3AF",
//   };

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

//   const alertBox = (type: "error" | "success"): React.CSSProperties => ({
//     marginTop: 10,
//     padding: "10px 12px",
//     borderRadius: 12,
//     border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//     background: type === "error" ? "#FEF2F2" : "#F0FDF4",
//     color: type === "error" ? "#991B1B" : "#166534",
//     fontWeight: 800,
//     fontSize: 13,
//   });

//   const formGrid: React.CSSProperties = {
//     marginTop: 14,
//     display: "grid",
//     gap: 14,
//   };

//   const label: React.CSSProperties = {
//     fontWeight: 800,
//     fontSize: 12,
//     color: "#111827",
//   };

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

//   const textarea: React.CSSProperties = {
//     ...input,
//     minHeight: 90,
//     resize: "vertical",
//   };

//   const helper: React.CSSProperties = {
//     color: "#9CA3AF",
//     fontWeight: 800,
//     fontSize: 12,
//   };

//   const row3: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
//     gap: 12,
//   };

//   const row2: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//     gap: 12,
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

//   const tipsCard: React.CSSProperties = {
//     marginTop: 14,
//     background: "#EAF2FF",
//     border: "1px solid rgba(37,99,235,0.18)",
//     borderRadius: 16,
//     padding: 14,
//   };

//   const tipsTitle: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: 13,
//     marginBottom: 8,
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//   };

//   const tipsList: React.CSSProperties = {
//     margin: 0,
//     paddingLeft: 18,
//     color: "#1F2937",
//     fontWeight: 700,
//     fontSize: 12,
//     lineHeight: 1.55,
//   };

//   // ✅ min / max endDate (σταθερά, να μην αλλάζουν σε κάθε render)
//   const minEndDate = useMemo(() => {
//     const n = new Date();
//     const rounded = new Date(n);
//     rounded.setSeconds(0, 0);
//     if (rounded.getTime() <= n.getTime()) {
//       rounded.setMinutes(rounded.getMinutes() + 1);
//     }
//     return toDateTimeLocalValue(rounded);
//   }, []);

//   const maxEndDate = useMemo(() => {
//     const d = new Date();
//     d.setDate(d.getDate() + 21);
//     return toDateTimeLocalValue(d);
//   }, []);

//   return (
//     <div style={pageOuter}>
//       <div style={wrap}>
//         {/* ✅ NEW: Back κουμπί */}
//         <button type="button" onClick={handleBack} style={backBtn}>
//           ← Back to all auctions
//         </button>

//         <div style={topHint}>Create your auction listing</div>

//         {/* stepper */}
//         <div style={stepperRow}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(true)}>1</div>
//             <div style={stepLabel}>Auction Details</div>
//           </div>

//           <div style={stepLine} />

//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(false)}>2</div>
//             <div style={stepLabelMuted}>Product Images</div>
//           </div>
//         </div>

//         <div style={card}>
//           <div style={cardTitle}>Step 1: Auction Details</div>

//           {error && <div style={alertBox("error")}>Error: {error}</div>}
//           {success && <div style={alertBox("success")}>{success}</div>}
//           {categoriesError && <div style={alertBox("error")}>{categoriesError}</div>}

//           <form onSubmit={handleSubmit} style={formGrid}>
//             {/* Title */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Auction Title *</div>
//               <input
//                 type="text"
//                 value={draft.title}
//                 onChange={(e) => onDraftChange({ title: e.target.value })}
//                 required
//                 placeholder="e.g. Vintage Camera, Designer Watch"
//                 style={input}
//               />
//             </div>

//             {/* Category */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Category *</div>
//               <select
//                 value={draft.categoryId}
//                 onChange={(e) => {
//                   userTouchedCategoryRef.current = true;
//                   onDraftChange({ categoryId: e.target.value });
//                 }}
//                 required
//                 style={input}
//                 disabled={categoriesLoading || categories.length === 0}
//               >
//                 {categoriesLoading && <option>Loading categories...</option>}
//                 {!categoriesLoading && categories.length === 0 && (
//                   <option value="">No categories available</option>
//                 )}
//                 {!categoriesLoading &&
//                   categories.length > 0 &&
//                   categories.map((c) => (
//                     <option key={c.id} value={c.id.toString()}>
//                       {c.name}
//                     </option>
//                   ))}
//               </select>
//             </div>

//             {/* Short Description */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Short Description *</div>
//               <input
//                 type="text"
//                 value={draft.shortDescription}
//                 onChange={(e) => onDraftChange({ shortDescription: e.target.value })}
//                 required
//                 placeholder="Brief overview of your item (max 200 characters)"
//                 style={input}
//               />
//               <div style={helper}>{draft.shortDescription.length}/200 characters</div>
//             </div>

//             {/* Full Description */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Full Description *</div>
//               <textarea
//                 value={draft.description}
//                 onChange={(e) => onDraftChange({ description: e.target.value })}
//                 required
//                 placeholder="Detailed description including condition, features, specifications, etc."
//                 style={textarea}
//               />
//             </div>

//             {/* Prices row */}
//             <div style={row3}>
//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Starting Price (€) *</div>
//                 <input
//                   type="number"
//                   value={draft.startingAmount}
//                   onChange={(e) => onDraftChange({ startingAmount: e.target.value })}
//                   required
//                   step="0.01"
//                   style={input}
//                 />
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Minimum Raise (€) *</div>
//                 <input
//                   type="number"
//                   value={draft.minBidIncrement}
//                   onChange={(e) => onDraftChange({ minBidIncrement: e.target.value })}
//                   required
//                   step="0.01"
//                   style={input}
//                 />
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Shipping Cost Payer *</div>
//                 <select
//                   value={draft.shippingCostPayer}
//                   onChange={(e) =>
//                     onDraftChange({ shippingCostPayer: e.target.value as ShippingCostPayer })
//                   }
//                   style={input}
//                 >
//                   <option value="SELLER">Seller pays shipping</option>
//                   <option value="BUYER">Buyer pays shipping</option>
//                   <option value="SPLIT">Split 50 / 50</option>
//                 </select>
//               </div>
//             </div>

//             {/* Dates row */}
//             <div style={row2}>
//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>End Date *</div>
//                 <input
//                   type="datetime-local"
//                   value={draft.endDate}
//                   onChange={(e) => onDraftChange({ endDate: e.target.value })}
//                   required
//                   style={input}
//                   min={minEndDate}
//                   max={maxEndDate}
//                 />
//               </div>
//             </div>

//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
//               <button
//                 type="submit"
//                 disabled={loading || categoriesLoading}
//                 style={loading || categoriesLoading ? primaryBtnDisabled : primaryBtn}
//               >
//                 {loading ? "Creating..." : "Next: Add images"} <span aria-hidden>→</span>
//               </button>
//             </div>
//           </form>
//         </div>

//         <div style={tipsCard}>
//           <div style={tipsTitle}>
//             <span aria-hidden>💡</span>
//             <span>Tips for a Successful Auction</span>
//           </div>
//           <ul style={tipsList}>
//             <li>Use clear, high-quality images from multiple angles</li>
//             <li>Write detailed, accurate descriptions</li>
//             <li>Set a competitive starting price</li>
//             <li>Be responsive to questions in the chat</li>
//             <li>Choose appropriate auction end date</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAuctionStep1;


// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import type {
//   AuctionCreateRequest,
//   AuctionDetails,
//   ShippingCostPayer,
// } from "../models/Springboot/Auction";
// import { createAuction } from "../api/Springboot/backendAuctionService";
// import { getCategories } from "../api/Springboot/backendCategoryService";
// import type { CategoryDto } from "../api/Springboot/backendCategoryService";

// // ✅ draft type για να κρατάμε τα πεδία όταν κάνουμε back από Step2
// export type AuctionDraft = {
//   categoryId: string;
//   title: string;
//   shortDescription: string;
//   description: string;
//   startingAmount: string;
//   minBidIncrement: string;
//   shippingCostPayer: ShippingCostPayer;
//   endDate: string;
// };

// interface CreateAuctionStep1Props {
//   draft: AuctionDraft;
//   onDraftChange: (patch: Partial<AuctionDraft>) => void;
//   onCompleted: (data: { auctionId: number; createdAuction: AuctionDetails }) => void;
//   onBack?: () => void; // ✅ NEW: Back to all auctions
// }

// // ✅ NEW: Limits
// const TITLE_MAX = 45;
// const SHORT_DESC_MAX = 110;

// // helper: φτιάχνει LocalDateTime string τύπου "YYYY-MM-DDTHH:mm:ss"
// function buildStartDateNowPlus10Seconds(): string {
//   const now = new Date();
//   const future = new Date(now.getTime() + 10 * 1000);
//   const pad = (n: number) => n.toString().padStart(2, "0");

//   const year = future.getFullYear();
//   const month = pad(future.getMonth() + 1);
//   const day = pad(future.getDate());
//   const hours = pad(future.getHours());
//   const minutes = pad(future.getMinutes());
//   const seconds = pad(future.getSeconds());

//   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
// }

// // ✅ format για input type="datetime-local" → "YYYY-MM-DDTHH:mm"
// function toDateTimeLocalValue(d: Date): string {
//   const pad = (n: number) => n.toString().padStart(2, "0");
//   const year = d.getFullYear();
//   const month = pad(d.getMonth() + 1);
//   const day = pad(d.getDate());
//   const hours = pad(d.getHours());
//   const minutes = pad(d.getMinutes());
//   return `${year}-${month}-${day}T${hours}:${minutes}`;
// }

// const CreateAuctionStep1: React.FC<CreateAuctionStep1Props> = ({
//   draft,
//   onDraftChange,
//   onCompleted,
//   onBack,
// }) => {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const [categories, setCategories] = useState<CategoryDto[]>([]);
//   const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
//   const [categoriesError, setCategoriesError] = useState<string | null>(null);

//   // ✅ FIX: αποφεύγουμε override του category αν ο χρήστης το άλλαξε πριν τελειώσει το fetch
//   const latestCategoryIdRef = useRef<string>(draft.categoryId);
//   const userTouchedCategoryRef = useRef<boolean>(false);

//   useEffect(() => {
//     latestCategoryIdRef.current = draft.categoryId;
//   }, [draft.categoryId]);

//   useEffect(() => {
//     const loadCategories = async () => {
//       setCategoriesLoading(true);
//       setCategoriesError(null);
//       try {
//         const result = await getCategories();
//         setCategories(result);

//         // ✅ default μόνο αν δεν έχει category ΚΑΙ ο χρήστης δεν “άγγιξε” το select
//         if (
//           !userTouchedCategoryRef.current &&
//           !latestCategoryIdRef.current &&
//           result.length > 0
//         ) {
//           onDraftChange({ categoryId: result[0].id.toString() });
//         }
//       } catch (err: unknown) {
//         console.error(err);
//         let message = "Something went wrong while loading categories. Please try again.";
//         if (err instanceof Error) message = err.message;
//         setCategoriesError(message);
//       } finally {
//         setCategoriesLoading(false);
//       }
//     };

//     loadCategories();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleBack = () => {
//     if (onBack) onBack();
//     else navigate("/");
//   };

//   const handleSubmit: React.FormEventHandler = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!draft.categoryId) {
//       setError("Please choose a category before creating your auction.");
//       return;
//     }

//     // ✅ NEW: Hard validation for lengths (backend-safe)
//     if (draft.title.length > TITLE_MAX) {
//       setError(`Title must be up to ${TITLE_MAX} characters.`);
//       return;
//     }

//     if (draft.shortDescription.length > SHORT_DESC_MAX) {
//       setError(`Short Description must be up to ${SHORT_DESC_MAX} characters.`);
//       return;
//     }

//     setLoading(true);

//     try {
//       const startDate = buildStartDateNowPlus10Seconds();

//       const request: AuctionCreateRequest = {
//         categoryId: Number(draft.categoryId),
//         title: draft.title,
//         shortDescription: draft.shortDescription,
//         description: draft.description,
//         startingAmount: Number(draft.startingAmount),
//         minBidIncrement: Number(draft.minBidIncrement),
//         startDate, // ✅ auto (now + 10s)
//         endDate: draft.endDate, // ✅ user input
//         shippingCostPayer: draft.shippingCostPayer,
//       };

//       const created = await createAuction(request);
//       setSuccess(`Auction created with id=${created.id}`);

//       onCompleted({ auctionId: created.id, createdAuction: created });
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Something went wrong while creating your auction. Please try again.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------
//   // 🎨 Styles (μόνο UI)
//   // ----------------------------
//   const pageOuter: React.CSSProperties = {
//     width: "100vw",
//     marginLeft: "calc(50% - 50vw)",
//     minHeight: "100vh",
//     background: "#F2F4F7",
//     padding: "22px 18px 34px",
//     boxSizing: "border-box",
//   };

//   const wrap: React.CSSProperties = {
//     maxWidth: 1080,
//     margin: "0 auto",
//   };

//   const backBtn: React.CSSProperties = {
//     height: 40,
//     padding: "0 14px",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 900,
//     cursor: "pointer",
//     margin: "0 0 12px 0",
//   };

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

//   const stepLabel: React.CSSProperties = {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#111827",
//   };

//   const stepLabelMuted: React.CSSProperties = {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#9CA3AF",
//   };

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

//   const alertBox = (type: "error" | "success"): React.CSSProperties => ({
//     marginTop: 10,
//     padding: "10px 12px",
//     borderRadius: 12,
//     border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//     background: type === "error" ? "#FEF2F2" : "#F0FDF4",
//     color: type === "error" ? "#991B1B" : "#166534",
//     fontWeight: 800,
//     fontSize: 13,
//   });

//   const formGrid: React.CSSProperties = {
//     marginTop: 14,
//     display: "grid",
//     gap: 14,
//   };

//   const label: React.CSSProperties = {
//     fontWeight: 800,
//     fontSize: 12,
//     color: "#111827",
//   };

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

//   const textarea: React.CSSProperties = {
//     ...input,
//     minHeight: 90,
//     resize: "vertical",
//   };

//   const helper: React.CSSProperties = {
//     color: "#9CA3AF",
//     fontWeight: 800,
//     fontSize: 12,
//   };

//   const row3: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
//     gap: 12,
//   };

//   const row2: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//     gap: 12,
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

//   const tipsCard: React.CSSProperties = {
//     marginTop: 14,
//     background: "#EAF2FF",
//     border: "1px solid rgba(37,99,235,0.18)",
//     borderRadius: 16,
//     padding: 14,
//   };

//   const tipsTitle: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: 13,
//     marginBottom: 8,
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//   };

//   const tipsList: React.CSSProperties = {
//     margin: 0,
//     paddingLeft: 18,
//     color: "#1F2937",
//     fontWeight: 700,
//     fontSize: 12,
//     lineHeight: 1.55,
//   };

//   // ✅ min / max endDate (σταθερά, να μην αλλάζουν σε κάθε render)
//   const minEndDate = useMemo(() => {
//     const n = new Date();
//     const rounded = new Date(n);
//     rounded.setSeconds(0, 0);
//     if (rounded.getTime() <= n.getTime()) {
//       rounded.setMinutes(rounded.getMinutes() + 1);
//     }
//     return toDateTimeLocalValue(rounded);
//   }, []);

//   const maxEndDate = useMemo(() => {
//     const d = new Date();
//     d.setDate(d.getDate() + 21);
//     return toDateTimeLocalValue(d);
//   }, []);

//   return (
//     <div style={pageOuter}>
//       <div style={wrap}>
//         {/* ✅ NEW: Back κουμπί */}
//         <button type="button" onClick={handleBack} style={backBtn}>
//           ← Back to all auctions
//         </button>

//         <div style={topHint}>Create your auction listing</div>

//         {/* stepper */}
//         <div style={stepperRow}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(true)}>1</div>
//             <div style={stepLabel}>Auction Details</div>
//           </div>

//           <div style={stepLine} />

//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={stepCircle(false)}>2</div>
//             <div style={stepLabelMuted}>Product Images</div>
//           </div>
//         </div>

//         <div style={card}>
//           <div style={cardTitle}>Step 1: Auction Details</div>

//           {error && <div style={alertBox("error")}>Error: {error}</div>}
//           {success && <div style={alertBox("success")}>{success}</div>}
//           {categoriesError && <div style={alertBox("error")}>{categoriesError}</div>}

//           <form onSubmit={handleSubmit} style={formGrid}>
//             {/* Title */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Auction Title *</div>
//               <input
//                 type="text"
//                 value={draft.title}
//                 onChange={(e) =>
//                   onDraftChange({ title: e.target.value.slice(0, TITLE_MAX) })
//                 }
//                 required
//                 maxLength={TITLE_MAX}
//                 placeholder="e.g. Vintage Camera, Designer Watch"
//                 style={input}
//               />
//               <div style={helper}>
//                 {draft.title.length}/{TITLE_MAX} characters
//               </div>
//             </div>

//             {/* Category */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Category *</div>
//               <select
//                 value={draft.categoryId}
//                 onChange={(e) => {
//                   userTouchedCategoryRef.current = true;
//                   onDraftChange({ categoryId: e.target.value });
//                 }}
//                 required
//                 style={input}
//                 disabled={categoriesLoading || categories.length === 0}
//               >
//                 {categoriesLoading && <option>Loading categories...</option>}
//                 {!categoriesLoading && categories.length === 0 && (
//                   <option value="">No categories available</option>
//                 )}
//                 {!categoriesLoading &&
//                   categories.length > 0 &&
//                   categories.map((c) => (
//                     <option key={c.id} value={c.id.toString()}>
//                       {c.name}
//                     </option>
//                   ))}
//               </select>
//             </div>

//             {/* Short Description */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Short Description *</div>
//               <input
//                 type="text"
//                 value={draft.shortDescription}
//                 onChange={(e) =>
//                   onDraftChange({
//                     shortDescription: e.target.value.slice(0, SHORT_DESC_MAX),
//                   })
//                 }
//                 required
//                 maxLength={SHORT_DESC_MAX}
//                 placeholder="Brief overview of your item (max 110 characters)"
//                 style={input}
//               />
//               <div style={helper}>
//                 {draft.shortDescription.length}/{SHORT_DESC_MAX} characters
//               </div>
//             </div>

//             {/* Full Description */}
//             <div style={{ display: "grid", gap: 8 }}>
//               <div style={label}>Full Description *</div>
//               <textarea
//                 value={draft.description}
//                 onChange={(e) => onDraftChange({ description: e.target.value })}
//                 required
//                 placeholder="Detailed description including condition, features, specifications, etc."
//                 style={textarea}
//               />
//             </div>

//             {/* Prices row */}
//             <div style={row3}>
//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Starting Price (€) *</div>
//                 <input
//                   type="number"
//                   value={draft.startingAmount}
//                   onChange={(e) => onDraftChange({ startingAmount: e.target.value })}
//                   required
//                   step="0.01"
//                   style={input}
//                 />
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Minimum Raise (€) *</div>
//                 <input
//                   type="number"
//                   value={draft.minBidIncrement}
//                   onChange={(e) => onDraftChange({ minBidIncrement: e.target.value })}
//                   required
//                   step="0.01"
//                   style={input}
//                 />
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>Shipping Cost Payer *</div>
//                 <select
//                   value={draft.shippingCostPayer}
//                   onChange={(e) =>
//                     onDraftChange({ shippingCostPayer: e.target.value as ShippingCostPayer })
//                   }
//                   style={input}
//                 >
//                   <option value="SELLER">Seller pays shipping</option>
//                   <option value="BUYER">Buyer pays shipping</option>
//                   <option value="SPLIT">Split 50 / 50</option>
//                 </select>
//               </div>
//             </div>

//             {/* Dates row */}
//             <div style={row2}>
//               <div style={{ display: "grid", gap: 8 }}>
//                 <div style={label}>End Date *</div>
//                 <input
//                   type="datetime-local"
//                   lang="en-GB"
//                   value={draft.endDate}
//                   onChange={(e) => onDraftChange({ endDate: e.target.value })}
//                   required
//                   style={input}
//                   min={minEndDate}
//                   max={maxEndDate}
//                 />
//               </div>
//             </div>

//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
//               <button
//                 type="submit"
//                 disabled={loading || categoriesLoading}
//                 style={loading || categoriesLoading ? primaryBtnDisabled : primaryBtn}
//               >
//                 {loading ? "Creating..." : "Next: Add images"} <span aria-hidden>→</span>
//               </button>
//             </div>
//           </form>
//         </div>

//         <div style={tipsCard}>
//           <div style={tipsTitle}>
//             <span aria-hidden>💡</span>
//             <span>Tips for a Successful Auction</span>
//           </div>
//           <ul style={tipsList}>
//             <li>Use clear, high-quality images from multiple angles</li>
//             <li>Write detailed, accurate descriptions</li>
//             <li>Set a competitive starting price</li>
//             <li>Be responsive to questions in the chat</li>
//             <li>Choose appropriate auction end date</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAuctionStep1;


import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  AuctionCreateRequest,
  AuctionDetails,
  ShippingCostPayer,
} from "../models/Springboot/Auction";
import { createAuction } from "../api/Springboot/backendAuctionService";
import { getCategories } from "../api/Springboot/backendCategoryService";
import type { CategoryDto } from "../api/Springboot/backendCategoryService";

// ✅ NEW: react-datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ✅ NEW: date-fns helpers
import { parse, format, isValid, isSameDay } from "date-fns";

// ✅ draft type για να κρατάμε τα πεδία όταν κάνουμε back από Step2
export type AuctionDraft = {
  categoryId: string;
  title: string;
  shortDescription: string;
  description: string;
  startingAmount: string;
  minBidIncrement: string;
  shippingCostPayer: ShippingCostPayer;
  endDate: string;
};

interface CreateAuctionStep1Props {
  draft: AuctionDraft;
  onDraftChange: (patch: Partial<AuctionDraft>) => void;
  onCompleted: (data: { auctionId: number; createdAuction: AuctionDetails }) => void;
  onBack?: () => void; // ✅ NEW: Back to all auctions
}

// ✅ NEW: Limits
const TITLE_MAX = 45;
const SHORT_DESC_MAX = 110;

// helper: φτιάχνει LocalDateTime string τύπου "YYYY-MM-DDTHH:mm:ss"
function buildStartDateNowPlus10Seconds(): string {
  const now = new Date();
  const future = new Date(now.getTime() + 10 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = future.getFullYear();
  const month = pad(future.getMonth() + 1);
  const day = pad(future.getDate());
  const hours = pad(future.getHours());
  const minutes = pad(future.getMinutes());
  const seconds = pad(future.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// ✅ format για input type="datetime-local" → "YYYY-MM-DDTHH:mm"
function toDateTimeLocalValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ✅ NEW: parse/format για react-datepicker (κρατάμε το draft.endDate ως "YYYY-MM-DDTHH:mm")
function parseLocalDateTime(s: string): Date | null {
  if (!s) return null;
  const d = parse(s, "yyyy-MM-dd'T'HH:mm", new Date());
  return isValid(d) ? d : null;
}

function formatLocalDateTime(d: Date | null): string {
  return d ? format(d, "yyyy-MM-dd'T'HH:mm") : "";
}

const CreateAuctionStep1: React.FC<CreateAuctionStep1Props> = ({
  draft,
  onDraftChange,
  onCompleted,
  onBack,
}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // ✅ FIX: αποφεύγουμε override του category αν ο χρήστης το άλλαξε πριν τελειώσει το fetch
  const latestCategoryIdRef = useRef<string>(draft.categoryId);
  const userTouchedCategoryRef = useRef<boolean>(false);

  useEffect(() => {
    latestCategoryIdRef.current = draft.categoryId;
  }, [draft.categoryId]);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const result = await getCategories();
        setCategories(result);

        // ✅ default μόνο αν δεν έχει category ΚΑΙ ο χρήστης δεν “άγγιξε” το select
        if (
          !userTouchedCategoryRef.current &&
          !latestCategoryIdRef.current &&
          result.length > 0
        ) {
          onDraftChange({ categoryId: result[0].id.toString() });
        }
      } catch (err: unknown) {
        console.error(err);
        let message = "Something went wrong while loading categories. Please try again.";
        if (err instanceof Error) message = err.message;
        setCategoriesError(message);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/");
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!draft.categoryId) {
      setError("Please choose a category before creating your auction.");
      return;
    }

    // ✅ NEW: Hard validation for lengths (backend-safe)
    if (draft.title.length > TITLE_MAX) {
      setError(`Title must be up to ${TITLE_MAX} characters.`);
      return;
    }

    if (draft.shortDescription.length > SHORT_DESC_MAX) {
      setError(`Short Description must be up to ${SHORT_DESC_MAX} characters.`);
      return;
    }

    setLoading(true);

    try {
      const startDate = buildStartDateNowPlus10Seconds();

      const request: AuctionCreateRequest = {
        categoryId: Number(draft.categoryId),
        title: draft.title,
        shortDescription: draft.shortDescription,
        description: draft.description,
        startingAmount: Number(draft.startingAmount),
        minBidIncrement: Number(draft.minBidIncrement),
        startDate, // ✅ auto (now + 10s)
        endDate: draft.endDate, // ✅ user input
        shippingCostPayer: draft.shippingCostPayer,
      };

      const created = await createAuction(request);
      setSuccess(`Auction created with id=${created.id}`);

      onCompleted({ auctionId: created.id, createdAuction: created });
    } catch (err: unknown) {
      console.error(err);
      let message = "Something went wrong while creating your auction. Please try again.";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // 🎨 Styles (μόνο UI)
  // ----------------------------
  const pageOuter: React.CSSProperties = {
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    minHeight: "100vh",
    background: "#F2F4F7",
    padding: "22px 18px 34px",
    boxSizing: "border-box",
  };

  const wrap: React.CSSProperties = {
    maxWidth: 1080,
    margin: "0 auto",
  };

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

  const stepLabel: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 800,
    color: "#111827",
  };

  const stepLabelMuted: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 800,
    color: "#9CA3AF",
  };

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

  const alertBox = (type: "error" | "success"): React.CSSProperties => ({
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
    background: type === "error" ? "#FEF2F2" : "#F0FDF4",
    color: type === "error" ? "#991B1B" : "#166534",
    fontWeight: 800,
    fontSize: 13,
  });

  const formGrid: React.CSSProperties = {
    marginTop: 14,
    display: "grid",
    gap: 14,
  };

  const label: React.CSSProperties = {
    fontWeight: 800,
    fontSize: 12,
    color: "#111827",
  };

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

  const textarea: React.CSSProperties = {
    ...input,
    minHeight: 90,
    resize: "vertical",
  };

  const helper: React.CSSProperties = {
    color: "#9CA3AF",
    fontWeight: 800,
    fontSize: 12,
  };

  const row3: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  };

  const row2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  };

  const primaryBtn: React.CSSProperties = {
    padding: "10px 14px",
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

  const primaryBtnDisabled: React.CSSProperties = {
    ...primaryBtn,
    opacity: 0.65,
    cursor: "not-allowed",
  };

  const tipsCard: React.CSSProperties = {
    marginTop: 14,
    background: "#EAF2FF",
    border: "1px solid rgba(37,99,235,0.18)",
    borderRadius: 16,
    padding: 14,
  };

  const tipsTitle: React.CSSProperties = {
    fontWeight: 900,
    color: "#111827",
    fontSize: 13,
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const tipsList: React.CSSProperties = {
    margin: 0,
    paddingLeft: 18,
    color: "#1F2937",
    fontWeight: 700,
    fontSize: 12,
    lineHeight: 1.55,
  };

  // ✅ min / max endDate (σταθερά, να μην αλλάζουν σε κάθε render)
  const minEndDate = useMemo(() => {
    const n = new Date();
    const rounded = new Date(n);
    rounded.setSeconds(0, 0);
    if (rounded.getTime() <= n.getTime()) {
      rounded.setMinutes(rounded.getMinutes() + 1);
    }
    return toDateTimeLocalValue(rounded);
  }, []);

  const maxEndDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return toDateTimeLocalValue(d);
  }, []);

  // ✅ NEW: Date objects για το react-datepicker
  const selectedEnd = useMemo(() => parseLocalDateTime(draft.endDate), [draft.endDate]);
  const minEndObj = useMemo(() => parseLocalDateTime(minEndDate), [minEndDate]);
  const maxEndObj = useMemo(() => parseLocalDateTime(maxEndDate), [maxEndDate]);

  // ✅ NEW: σωστά time limits (μόνο όταν είσαι στην ίδια μέρα με min/max)
  const minTime = useMemo(() => {
    if (selectedEnd && minEndObj && isSameDay(selectedEnd, minEndObj)) return minEndObj;
    return new Date(0, 0, 0, 0, 0);
  }, [selectedEnd, minEndObj]);

  const maxTime = useMemo(() => {
    if (selectedEnd && maxEndObj && isSameDay(selectedEnd, maxEndObj)) return maxEndObj;
    return new Date(0, 0, 0, 23, 59);
  }, [selectedEnd, maxEndObj]);

  return (
    <div style={pageOuter}>
      <div style={wrap}>
        {/* ✅ NEW: Back κουμπί */}
        <button type="button" onClick={handleBack} style={backBtn}>
          ← Back to all auctions
        </button>

        <div style={topHint}>Create your auction listing</div>

        {/* stepper */}
        <div style={stepperRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={stepCircle(true)}>1</div>
            <div style={stepLabel}>Auction Details</div>
          </div>

          <div style={stepLine} />

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={stepCircle(false)}>2</div>
            <div style={stepLabelMuted}>Product Images</div>
          </div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Step 1: Auction Details</div>

          {error && <div style={alertBox("error")}>Error: {error}</div>}
          {success && <div style={alertBox("success")}>{success}</div>}
          {categoriesError && <div style={alertBox("error")}>{categoriesError}</div>}

          <form onSubmit={handleSubmit} style={formGrid}>
            {/* Title */}
            <div style={{ display: "grid", gap: 8 }}>
              <div style={label}>Auction Title *</div>
              <input
                type="text"
                value={draft.title}
                onChange={(e) =>
                  onDraftChange({ title: e.target.value.slice(0, TITLE_MAX) })
                }
                required
                maxLength={TITLE_MAX}
                placeholder="e.g. Vintage Camera, Designer Watch"
                style={input}
              />
              <div style={helper}>
                {draft.title.length}/{TITLE_MAX} characters
              </div>
            </div>

            {/* Category */}
            <div style={{ display: "grid", gap: 8 }}>
              <div style={label}>Category *</div>
              <select
                value={draft.categoryId}
                onChange={(e) => {
                  userTouchedCategoryRef.current = true;
                  onDraftChange({ categoryId: e.target.value });
                }}
                required
                style={input}
                disabled={categoriesLoading || categories.length === 0}
              >
                {categoriesLoading && <option>Loading categories...</option>}
                {!categoriesLoading && categories.length === 0 && (
                  <option value="">No categories available</option>
                )}
                {!categoriesLoading &&
                  categories.length > 0 &&
                  categories.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Short Description */}
            <div style={{ display: "grid", gap: 8 }}>
              <div style={label}>Short Description *</div>
              <input
                type="text"
                value={draft.shortDescription}
                onChange={(e) =>
                  onDraftChange({
                    shortDescription: e.target.value.slice(0, SHORT_DESC_MAX),
                  })
                }
                required
                maxLength={SHORT_DESC_MAX}
                placeholder="Brief overview of your item (max 110 characters)"
                style={input}
              />
              <div style={helper}>
                {draft.shortDescription.length}/{SHORT_DESC_MAX} characters
              </div>
            </div>

            {/* Full Description */}
            <div style={{ display: "grid", gap: 8 }}>
              <div style={label}>Full Description *</div>
              <textarea
                value={draft.description}
                onChange={(e) => onDraftChange({ description: e.target.value })}
                required
                placeholder="Detailed description including condition, features, specifications, etc."
                style={textarea}
              />
            </div>

            {/* Prices row */}
            <div style={row3}>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={label}>Starting Price (€) *</div>
                <input
                  type="number"
                  value={draft.startingAmount}
                  onChange={(e) => onDraftChange({ startingAmount: e.target.value })}
                  required
                  step="0.01"
                  style={input}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <div style={label}>Minimum Raise (€) *</div>
                <input
                  type="number"
                  value={draft.minBidIncrement}
                  onChange={(e) => onDraftChange({ minBidIncrement: e.target.value })}
                  required
                  step="0.01"
                  style={input}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <div style={label}>Shipping Cost Payer *</div>
                <select
                  value={draft.shippingCostPayer}
                  onChange={(e) =>
                    onDraftChange({ shippingCostPayer: e.target.value as ShippingCostPayer })
                  }
                  style={input}
                >
                  <option value="SELLER">Seller pays shipping</option>
                  <option value="BUYER">Buyer pays shipping</option>
                  <option value="SPLIT">Split 50 / 50</option>
                </select>
              </div>
            </div>

            {/* Dates row */}
            <div style={row2}>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={label}>End Date *</div>

                {/* ✅ CHANGED: react-datepicker με dd/MM/yyyy HH:mm */}
                <DatePicker
                  selected={selectedEnd}
                  onChange={(date: Date | null) =>
                    onDraftChange({ endDate: formatLocalDateTime(date) })
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={5}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="dd/MM/yyyy HH:mm"
                  minDate={minEndObj ?? undefined}
                  maxDate={maxEndObj ?? undefined}
                  minTime={minTime}
                  maxTime={maxTime}
                  customInput={<input style={input} required />}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <button
                type="submit"
                disabled={loading || categoriesLoading}
                style={loading || categoriesLoading ? primaryBtnDisabled : primaryBtn}
              >
                {loading ? "Creating..." : "Next: Add images"} <span aria-hidden>→</span>
              </button>
            </div>
          </form>
        </div>

        <div style={tipsCard}>
          <div style={tipsTitle}>
            <span aria-hidden>💡</span>
            <span>Tips for a Successful Auction</span>
          </div>
          <ul style={tipsList}>
            <li>Use clear, high-quality images from multiple angles</li>
            <li>Write detailed, accurate descriptions</li>
            <li>Set a competitive starting price</li>
            <li>Be responsive to questions in the chat</li>
            <li>Choose appropriate auction end date</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateAuctionStep1;
