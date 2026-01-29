
// // src/components/AdminCategoriesPage.tsx

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   getCategories,
//   adminCreateCategory,
//   adminUpdateCategory,
//   adminDeleteCategory,
// } from "../../api/Springboot/backendCategoryService";

// import type { CategoryDto } from "../../api/Springboot/backendCategoryService";

// interface AdminCategoriesPageProps {
//   onBack?: () => void;
// }

// type MessageType = "success" | "error" | null;

// const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ onBack }) => {
//   const [categories, setCategories] = useState<CategoryDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Create
//   const [newCategoryName, setNewCategoryName] = useState<string>("");

//   // Update
//   const [selectedUpdateId, setSelectedUpdateId] = useState<number | "">("");
//   const [updateName, setUpdateName] = useState<string>("");

//   // Delete
//   const [selectedDeleteId, setSelectedDeleteId] = useState<number | "">("");

//   // Search (UX boost, μικρή αλλαγή)
//   const [search, setSearch] = useState("");

//   // Toast / μήνυμα
//   const [message, setMessage] = useState<string | null>(null);
//   const [messageType, setMessageType] = useState<MessageType>(null);

//   const showMessage = (type: MessageType, msg: string) => {
//     setMessageType(type);
//     setMessage(msg);
//     window.setTimeout(() => {
//       setMessage(null);
//       setMessageType(null);
//     }, 3500);
//   };

//   const loadCategories = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getCategories();
//       setCategories(data);
//     } catch (err: unknown) {
//       console.error(err);
//       let msg = "Κάτι πήγε στραβά στο φόρτωμα των κατηγοριών.";
//       if (err instanceof Error && err.message) msg = err.message;
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   const filteredCategories = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return categories;
//     return categories.filter((c) => c.name.toLowerCase().includes(q) || String(c.id).includes(q));
//   }, [categories, search]);

//   // CREATE
//   const handleCreate = async () => {
//     const trimmed = newCategoryName.trim();
//     if (!trimmed) {
//       showMessage("error", "Γράψε ένα όνομα κατηγορίας.");
//       return;
//     }

//     try {
//       const created = await adminCreateCategory(trimmed);
//       showMessage("success", `Η κατηγορία "${created.name}" δημιουργήθηκε.`);
//       setNewCategoryName("");
//       setCategories((prev) => [...prev, created]);
//     } catch (err: unknown) {
//       console.error(err);
//       let msg = "Κάτι πήγε στραβά στη δημιουργία κατηγορίας.";
//       if (err instanceof Error && err.message) msg = err.message;
//       showMessage("error", msg);
//     }
//   };

//   // UPDATE
//   const handleUpdate = async () => {
//     if (selectedUpdateId === "") {
//       showMessage("error", "Επέλεξε κατηγορία για αλλαγή.");
//       return;
//     }
//     const trimmed = updateName.trim();
//     if (!trimmed) {
//       showMessage("error", "Γράψε το νέο όνομα κατηγορίας.");
//       return;
//     }

//     try {
//       const updated = await adminUpdateCategory(selectedUpdateId, trimmed);
//       showMessage("success", `Η κατηγορία ενημερώθηκε σε "${updated.name}".`);

//       setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

//       setUpdateName("");
//       setSelectedUpdateId("");
//     } catch (err: unknown) {
//       console.error(err);
//       let msg = "Κάτι πήγε στραβά στο update της κατηγορίας.";
//       if (err instanceof Error && err.message) msg = err.message;
//       showMessage("error", msg);
//     }
//   };

//   // DELETE
//   const handleDelete = async () => {
//     if (selectedDeleteId === "") {
//       showMessage("error", "Επέλεξε κατηγορία για διαγραφή.");
//       return;
//     }

//     const cat = categories.find((c) => c.id === selectedDeleteId);
//     const confirm = window.confirm(`Σίγουρα θέλεις να διαγράψεις την κατηγορία "${cat?.name}" ;`);
//     if (!confirm) return;

//     try {
//       await adminDeleteCategory(selectedDeleteId);
//       showMessage("success", `Η κατηγορία "${cat?.name}" διαγράφηκε.`);
//       setCategories((prev) => prev.filter((c) => c.id !== selectedDeleteId));
//       setSelectedDeleteId("");
//     } catch (err: unknown) {
//       console.error(err);
//       let msg = "Κάτι πήγε στραβά στη διαγραφή κατηγορίας.";
//       if (err instanceof Error && err.message) msg = err.message;
//       showMessage("error", msg);
//     }
//   };

//   return (
//     <div style={styles.page}>
//       {/* Toast */}
//       {message && (
//         <div
//           style={{
//             ...styles.toast,
//             ...(messageType === "error" ? styles.toastError : styles.toastSuccess),
//           }}
//           role="status"
//           aria-live="polite"
//         >
//           {message}
//         </div>
//       )}

//       {/* Header */}
//       <div style={styles.header}>
//         <button type="button" onClick={onBack} style={styles.backBtn}>
//           ← Back to auctions
//         </button>

//         <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//           <h1 style={styles.title}>Διαχείριση Κατηγοριών</h1>
//         </div>
//       </div>

//       {/* Status */}
//       {error && <div style={styles.alertError}>{error}</div>}

//       {/* Main grid */}
//       <div style={styles.grid}>
//         {/* LEFT: List */}
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <div>
//               <div style={styles.cardTitle}>Υπάρχουσες κατηγορίες</div>
//               <div style={styles.cardHint}>
//                 Σύνολο: <strong>{categories.length}</strong>
//               </div>
//             </div>

//             <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Αναζήτηση (id ή όνομα)…"
//                 style={{ ...styles.input, width: 240 }}
//               />
//               <button
//                 type="button"
//                 onClick={loadCategories}
//                 style={styles.secondaryBtn}
//                 disabled={loading}
//                 title="Refresh"
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>

//           {loading ? (
//             <div style={styles.skeleton}>Φόρτωση κατηγοριών…</div>
//           ) : filteredCategories.length === 0 ? (
//             <div style={styles.emptyState}>
//               <div style={styles.emptyTitle}>Δεν βρέθηκαν κατηγορίες</div>
//               <div style={styles.emptyText}>Δοκίμασε άλλη αναζήτηση ή δημιούργησε μια νέα κατηγορία.</div>
//             </div>
//           ) : (
//             <div style={{ overflowX: "auto" }}>
//               <table style={styles.table}>
//                 <thead>
//                   <tr>
//                     <th style={styles.th}>ID</th>
//                     <th style={styles.th}>Όνομα</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredCategories
//                     .slice()
//                     .sort((a, b) => a.id - b.id)
//                     .map((c) => (
//                       <tr key={c.id} style={styles.tr}>
//                         <td style={styles.tdMono}>#{c.id}</td>
//                         <td style={styles.td}>
//                           <strong>{c.name}</strong>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* RIGHT: Actions */}
//         <div style={styles.stack}>
//           {/* CREATE */}
//           <div style={styles.card}>
//             <div style={styles.cardHeader}>
//               <div>
//                 <div style={styles.cardTitle}>Δημιουργία</div>
//                 <div style={styles.cardHint}>Πρόσθεσε νέα κατηγορία που θα εμφανίζεται στο φίλτρο.</div>
//               </div>
//             </div>

//             <div style={styles.formRow}>
//               <input
//                 type="text"
//                 value={newCategoryName}
//                 onChange={(e) => setNewCategoryName(e.target.value)}
//                 placeholder="π.χ. Electronics"
//                 style={styles.input}
//               />
//               <button type="button" onClick={handleCreate} style={styles.primaryBtn}>
//                 Create
//               </button>
//             </div>
//           </div>

//           {/* UPDATE */}
//           <div style={styles.card}>
//             <div style={styles.cardHeader}>
//               <div>
//                 <div style={styles.cardTitle}>Ενημέρωση</div>
//                 <div style={styles.cardHint}>Επίλεξε κατηγορία και δώσε νέο όνομα.</div>
//               </div>
//             </div>

//             <div style={styles.formCol}>
//               <label style={styles.label}>Κατηγορία</label>
//               <select
//                 value={selectedUpdateId}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (!val) {
//                     setSelectedUpdateId("");
//                     setUpdateName("");
//                     return;
//                   }
//                   const id = Number(val);
//                   setSelectedUpdateId(id);
//                   const cat = categories.find((c) => c.id === id);
//                   setUpdateName(cat?.name ?? "");
//                 }}
//                 style={styles.select}
//               >
//                 <option value="">-- διάλεξε --</option>
//                 {categories
//                   .slice()
//                   .sort((a, b) => a.name.localeCompare(b.name))
//                   .map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name}
//                     </option>
//                   ))}
//               </select>

//               <label style={styles.label}>Νέο όνομα</label>
//               <div style={styles.formRow}>
//                 <input
//                   type="text"
//                   value={updateName}
//                   onChange={(e) => setUpdateName(e.target.value)}
//                   placeholder="Νέο όνομα κατηγορίας"
//                   style={styles.input}
//                 />
//                 <button type="button" onClick={handleUpdate} style={styles.primaryBtn}>
//                   Update
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* DELETE */}
//           <div style={styles.card}>
//             <div style={styles.cardHeader}>
//               <div>
//                 <div style={styles.cardTitle}>Διαγραφή</div>
//                 <div style={styles.cardHint}>
//                   Προσοχή: η διαγραφή είναι μόνιμη. (Θα σου ζητηθεί επιβεβαίωση.)
//                 </div>
//               </div>
//             </div>

//             <div style={styles.formCol}>
//               <label style={styles.label}>Κατηγορία</label>
//               <div style={styles.formRow}>
//                 <select
//                   value={selectedDeleteId}
//                   onChange={(e) => setSelectedDeleteId(e.target.value ? Number(e.target.value) : "")}
//                   style={styles.select}
//                 >
//                   <option value="">-- διάλεξε --</option>
//                   {categories
//                     .slice()
//                     .sort((a, b) => a.name.localeCompare(b.name))
//                     .map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.name}
//                       </option>
//                     ))}
//                 </select>

//                 <button type="button" onClick={handleDelete} style={styles.dangerBtn}>
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* small helper footer */}
//           <div style={styles.helperNote}>
//             Tip: κράτα τις κατηγορίες σε “Title Case” για πιο καθαρό UI στο main page (π.χ. “Home & Furniture”).
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminCategoriesPage;

// const styles: Record<string, React.CSSProperties> = {
//   page: {
//     maxWidth: 1100,
//     margin: "0 auto",
//     padding: "20px 16px 28px",
//     background: "#f6f7fb",
//     minHeight: "100vh",
//     position: "relative",
//   },

//   header: {
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     gap: 16,
//     marginBottom: 16,
//   },

//   title: {
//     margin: 0,
//     fontSize: 24,
//     letterSpacing: -0.2,
//     color: "#0f172a",
//   },
//   subtitle: {
//     margin: 0,
//     fontSize: 14,
//     color: "#64748b",
//     lineHeight: 1.5,
//     maxWidth: 720,
//   },

//   backBtn: {
//     background: "#ffffff",
//     border: "1px solid #e5e7eb",
//     borderRadius: 10,
//     padding: "10px 12px",
//     cursor: "pointer",
//     color: "#0f172a",
//     fontWeight: 600,
//     boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
//     whiteSpace: "nowrap",
//   },

//   grid: {
//     display: "grid",
//     gridTemplateColumns: "1.25fr 0.85fr",
//     gap: 16,
//   },

//   // stack column
//   stack: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 16,
//   },

//   card: {
//     background: "#ffffff",
//     border: "1px solid #e5e7eb",
//     borderRadius: 16,
//     boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
//     padding: 16,
//   },

//   cardHeader: {
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     gap: 12,
//     marginBottom: 12,
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: 800,
//     color: "#0f172a",
//     marginBottom: 4,
//   },

//   cardHint: {
//     fontSize: 13,
//     color: "#64748b",
//     lineHeight: 1.4,
//   },

//   alertError: {
//     background: "#fff1f2",
//     border: "1px solid #fecdd3",
//     color: "#9f1239",
//     borderRadius: 12,
//     padding: "10px 12px",
//     marginBottom: 14,
//     fontWeight: 600,
//   },

//   // inputs
//   input: {
//     height: 40,
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     padding: "0 12px",
//     outline: "none",
//     fontSize: 14,
//     color: "#0f172a",
//     background: "#ffffff",
//     width: "100%",
//   },

//   select: {
//     height: 40,
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     padding: "0 12px",
//     outline: "none",
//     fontSize: 14,
//     color: "#0f172a",
//     background: "#ffffff",
//     width: "100%",
//   },

//   label: {
//     fontSize: 12,
//     fontWeight: 800,
//     color: "#334155",
//     marginBottom: 6,
//   },

//   formRow: {
//     display: "flex",
//     gap: 10,
//     alignItems: "center",
//   },

//   formCol: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 10,
//   },

//   // buttons
//   primaryBtn: {
//     height: 40,
//     padding: "0 14px",
//     borderRadius: 12,
//     border: "1px solid #0f172a",
//     background: "#0f172a",
//     color: "#ffffff",
//     cursor: "pointer",
//     fontWeight: 800,
//     whiteSpace: "nowrap",
//     boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
//   },

//   secondaryBtn: {
//     height: 40,
//     padding: "0 12px",
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     color: "#0f172a",
//     cursor: "pointer",
//     fontWeight: 800,
//     whiteSpace: "nowrap",
//   },

//   dangerBtn: {
//     height: 40,
//     padding: "0 14px",
//     borderRadius: 12,
//     border: "1px solid #ef4444",
//     background: "#ef4444",
//     color: "#ffffff",
//     cursor: "pointer",
//     fontWeight: 800,
//     whiteSpace: "nowrap",
//     boxShadow: "0 1px 2px rgba(239, 68, 68, 0.18)",
//   },

//   // table
//   table: {
//     width: "100%",
//     borderCollapse: "separate",
//     borderSpacing: 0,
//     border: "1px solid #e5e7eb",
//     borderRadius: 12,
//     overflow: "hidden",
//   },

//   th: {
//     textAlign: "left",
//     fontSize: 12,
//     fontWeight: 900,
//     color: "#334155",
//     background: "#f8fafc",
//     padding: "10px 12px",
//     borderBottom: "1px solid #e5e7eb",
//   },

//   tr: {
//     background: "#ffffff",
//   },

//   td: {
//     padding: "10px 12px",
//     borderBottom: "1px solid #f1f5f9",
//     fontSize: 14,
//     color: "#0f172a",
//   },

//   tdMono: {
//     padding: "10px 12px",
//     borderBottom: "1px solid #f1f5f9",
//     fontSize: 13,
//     color: "#64748b",
//     fontFamily:
//       'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
//     whiteSpace: "nowrap",
//   },

//   skeleton: {
//     padding: "14px 12px",
//     borderRadius: 12,
//     border: "1px dashed #e5e7eb",
//     color: "#64748b",
//     background: "#fbfdff",
//     fontWeight: 700,
//   },

//   emptyState: {
//     padding: "18px 12px",
//     borderRadius: 12,
//     border: "1px dashed #e5e7eb",
//     background: "#fbfdff",
//   },
//   emptyTitle: {
//     fontWeight: 900,
//     color: "#0f172a",
//     marginBottom: 6,
//   },
//   emptyText: {
//     color: "#64748b",
//     fontSize: 13,
//     lineHeight: 1.5,
//   },

//   helperNote: {
//     fontSize: 12,
//     color: "#64748b",
//     lineHeight: 1.5,
//     padding: "0 4px",
//   },

//   // toast
//   toast: {
//     position: "fixed",
//     top: 16,
//     right: 16,
//     maxWidth: 420,
//     zIndex: 9999,
//     padding: "10px 12px",
//     borderRadius: 14,
//     fontWeight: 800,
//     boxShadow: "0 8px 20px rgba(15, 23, 42, 0.15)",
//     border: "1px solid transparent",
//   },
//   toastSuccess: {
//     background: "#ecfdf5",
//     borderColor: "#a7f3d0",
//     color: "#065f46",
//   },
//   toastError: {
//     background: "#fff1f2",
//     borderColor: "#fecdd3",
//     color: "#9f1239",
//   },
// };
// src/components/AdminCategoriesPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../../api/Springboot/backendCategoryService";

import type { CategoryDto } from "../../api/Springboot/backendCategoryService";

interface AdminCategoriesPageProps {
  onBack?: () => void;
}

type MessageType = "success" | "error" | null;

const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // Update
  const [selectedUpdateId, setSelectedUpdateId] = useState<number | "">("");
  const [updateName, setUpdateName] = useState<string>("");

  // Delete
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | "">("");

  // Search
  const [search, setSearch] = useState("");

  // Toast / μήνυμα
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>(null);

  const showMessage = (type: MessageType, msg: string) => {
    setMessageType(type);
    setMessage(msg);
    window.setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3500);
  };

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: unknown) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά στο φόρτωμα των κατηγοριών.";
      if (err instanceof Error && err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q) || String(c.id).includes(q));
  }, [categories, search]);

  // CREATE
  const handleCreate = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showMessage("error", "Γράψε ένα όνομα κατηγορίας.");
      return;
    }

    try {
      const created = await adminCreateCategory(trimmed);
      showMessage("success", `Η κατηγορία "${created.name}" δημιουργήθηκε.`);
      setNewCategoryName("");
      setCategories((prev) => [...prev, created]);
    } catch (err: unknown) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά στη δημιουργία κατηγορίας.";
      if (err instanceof Error && err.message) msg = err.message;
      showMessage("error", msg);
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (selectedUpdateId === "") {
      showMessage("error", "Επέλεξε κατηγορία για αλλαγή.");
      return;
    }
    const trimmed = updateName.trim();
    if (!trimmed) {
      showMessage("error", "Γράψε το νέο όνομα κατηγορίας.");
      return;
    }

    try {
      const updated = await adminUpdateCategory(selectedUpdateId, trimmed);
      showMessage("success", `Η κατηγορία ενημερώθηκε σε "${updated.name}".`);

      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

      setUpdateName("");
      setSelectedUpdateId("");
    } catch (err: unknown) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά στο update της κατηγορίας.";
      if (err instanceof Error && err.message) msg = err.message;
      showMessage("error", msg);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (selectedDeleteId === "") {
      showMessage("error", "Επέλεξε κατηγορία για διαγραφή.");
      return;
    }

    const cat = categories.find((c) => c.id === selectedDeleteId);
    const ok = window.confirm(`Σίγουρα θέλεις να διαγράψεις την κατηγορία "${cat?.name}" ;`);
    if (!ok) return;

    try {
      await adminDeleteCategory(selectedDeleteId);
      showMessage("success", `Η κατηγορία "${cat?.name}" διαγράφηκε.`);
      setCategories((prev) => prev.filter((c) => c.id !== selectedDeleteId));
      setSelectedDeleteId("");
    } catch (err: unknown) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά στη διαγραφή κατηγορίας.";
      if (err instanceof Error && err.message) msg = err.message;
      showMessage("error", msg);
    }
  };

  return (
    <div style={styles.page} className="bn-cat-page">
      <style>{`
        .bn-cat-page * { box-sizing: border-box; }
        .bn-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .bn-input, .bn-select {
          color: #0f172a !important;
          -webkit-text-fill-color: #0f172a !important;
          background: #fff !important;
        }

        /* ✅ Tablet: 1 στήλη */
        @media (max-width: 980px) {
          .bn-cat-grid { grid-template-columns: 1fr !important; }
          .bn-cat-header { flex-direction: column !important; align-items: flex-start !important; }
          .bn-cat-toast { left: 16px !important; right: 16px !important; max-width: none !important; }
        }

        /* ✅ Mobile: search row σε column + buttons full width */
        @media (max-width: 620px) {
          .bn-search-row {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .bn-form-row {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            align-items: stretch !important;
          }

          .bn-btn-wide { width: 100% !important; }
        }

        /* iOS zoom prevention */
        @media (max-width: 620px) {
          .bn-input, .bn-select { font-size: 16px !important; }
        }

        /* Extra small */
        @media (max-width: 420px) {
          .bn-cat-page { padding-left: 12px !important; padding-right: 12px !important; }
          .bn-cat-title { font-size: 20px !important; }
          .bn-table th, .bn-table td { padding: 9px 10px !important; }
        }
      `}</style>

      {/* Toast */}
      {message && (
        <div
          className="bn-cat-toast"
          style={{
            ...styles.toast,
            ...(messageType === "error" ? styles.toastError : styles.toastSuccess),
          }}
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header} className="bn-cat-header">
        <button type="button" onClick={onBack} style={styles.backBtn}>
          ← Back to auctions
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={styles.title} className="bn-cat-title">
            Διαχείριση Κατηγοριών
          </h1>
        </div>
      </div>

      {/* Status */}
      {error && <div style={styles.alertError}>{error}</div>}

      {/* Main grid */}
      <div style={styles.grid} className="bn-cat-grid">
        {/* LEFT: List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>Υπάρχουσες κατηγορίες</div>
              <div style={styles.cardHint}>
                Σύνολο: <strong>{categories.length}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="bn-search-row">
              <input
                className="bn-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Αναζήτηση (id ή όνομα)…"
                style={{ ...styles.input, width: 240 }}
              />
              <button
                type="button"
                onClick={loadCategories}
                style={styles.secondaryBtn}
                className="bn-btn-wide"
                disabled={loading}
                title="Refresh"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.skeleton}>Φόρτωση κατηγοριών…</div>
          ) : filteredCategories.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>Δεν βρέθηκαν κατηγορίες</div>
              <div style={styles.emptyText}>
                Δοκίμασε άλλη αναζήτηση ή δημιούργησε μια νέα κατηγορία.
              </div>
            </div>
          ) : (
            <div className="bn-table-wrap">
              <table style={styles.table} className="bn-table">
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Όνομα</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories
                    .slice()
                    .sort((a, b) => a.id - b.id)
                    .map((c) => (
                      <tr key={c.id} style={styles.tr}>
                        <td style={styles.tdMono}>#{c.id}</td>
                        <td style={styles.td}>
                          <strong>{c.name}</strong>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div style={styles.stack}>
          {/* CREATE */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitle}>Δημιουργία</div>
                <div style={styles.cardHint}>Πρόσθεσε νέα κατηγορία που θα εμφανίζεται στο φίλτρο.</div>
              </div>
            </div>

            <div style={styles.formRow} className="bn-form-row">
              <input
                className="bn-input"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="π.χ. Electronics"
                style={styles.input}
              />
              <button type="button" onClick={handleCreate} style={styles.primaryBtn} className="bn-btn-wide">
                Create
              </button>
            </div>
          </div>

          {/* UPDATE */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitle}>Ενημέρωση</div>
                <div style={styles.cardHint}>Επίλεξε κατηγορία και δώσε νέο όνομα.</div>
              </div>
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Κατηγορία</label>
              <select
                className="bn-select"
                value={selectedUpdateId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSelectedUpdateId("");
                    setUpdateName("");
                    return;
                  }
                  const id = Number(val);
                  setSelectedUpdateId(id);
                  const cat = categories.find((c) => c.id === id);
                  setUpdateName(cat?.name ?? "");
                }}
                style={styles.select}
              >
                <option value="">-- διάλεξε --</option>
                {categories
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>

              <label style={styles.label}>Νέο όνομα</label>
              <div style={styles.formRow} className="bn-form-row">
                <input
                  className="bn-input"
                  type="text"
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                  placeholder="Νέο όνομα κατηγορίας"
                  style={styles.input}
                />
                <button type="button" onClick={handleUpdate} style={styles.primaryBtn} className="bn-btn-wide">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* DELETE */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitle}>Διαγραφή</div>
                <div style={styles.cardHint}>
                  Προσοχή: η διαγραφή είναι μόνιμη. (Θα σου ζητηθεί επιβεβαίωση.)
                </div>
              </div>
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Κατηγορία</label>
              <div style={styles.formRow} className="bn-form-row">
                <select
                  className="bn-select"
                  value={selectedDeleteId}
                  onChange={(e) => setSelectedDeleteId(e.target.value ? Number(e.target.value) : "")}
                  style={styles.select}
                >
                  <option value="">-- διάλεξε --</option>
                  {categories
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>

                <button type="button" onClick={handleDelete} style={styles.dangerBtn} className="bn-btn-wide">
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* small helper footer */}
          <div style={styles.helperNote}>
            Tip: κράτα τις κατηγορίες σε “Title Case” για πιο καθαρό UI στο main page (π.χ. “Home & Furniture”).
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "20px 16px 28px",
    background: "#f6f7fb",
    minHeight: "100vh",
    position: "relative",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: 24,
    letterSpacing: -0.2,
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.5,
    maxWidth: 720,
  },

  backBtn: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    color: "#0f172a",
    fontWeight: 600,
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.85fr",
    gap: 16,
    alignItems: "start",
  },

  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    padding: 16,
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 4,
  },

  cardHint: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.4,
  },

  alertError: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 14,
    fontWeight: 600,
  },

  input: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#ffffff",
    width: "100%",
    minWidth: 0,
  },

  select: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#ffffff",
    width: "100%",
    minWidth: 0,
  },

  label: {
    fontSize: 12,
    fontWeight: 800,
    color: "#334155",
    marginBottom: 6,
  },

  formRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  primaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
    whiteSpace: "nowrap",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
  },

  secondaryBtn: {
    height: 40,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  dangerBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #ef4444",
    background: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
    whiteSpace: "nowrap",
    boxShadow: "0 1px 2px rgba(239, 68, 68, 0.18)",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
    background: "#f8fafc",
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  tr: { background: "#ffffff" },

  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
    color: "#0f172a",
  },

  tdMono: {
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    color: "#64748b",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    whiteSpace: "nowrap",
  },

  skeleton: {
    padding: "14px 12px",
    borderRadius: 12,
    border: "1px dashed #e5e7eb",
    color: "#64748b",
    background: "#fbfdff",
    fontWeight: 700,
  },

  emptyState: {
    padding: "18px 12px",
    borderRadius: 12,
    border: "1px dashed #e5e7eb",
    background: "#fbfdff",
  },
  emptyTitle: { fontWeight: 900, color: "#0f172a", marginBottom: 6 },
  emptyText: { color: "#64748b", fontSize: 13, lineHeight: 1.5 },

  helperNote: { fontSize: 12, color: "#64748b", lineHeight: 1.5, padding: "0 4px" },

  toast: {
    position: "fixed",
    top: 16,
    right: 16,
    maxWidth: 420,
    zIndex: 9999,
    padding: "10px 12px",
    borderRadius: 14,
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.15)",
    border: "1px solid transparent",
  },
  toastSuccess: { background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" },
  toastError: { background: "#fff1f2", borderColor: "#fecdd3", color: "#9f1239" },
};
