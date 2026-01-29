// // src/admin/components/ActiveUsersAllMonthsPage.tsx
// import React, { useEffect, useState } from "react";
// import { getDailyActiveUsersAllMonths } from "../../api/admin/UserStats";
// import type { MonthlyDailyActiveUsersDto } from "../models/UserStats";

// const thStyle: React.CSSProperties = {
//   borderBottom: "1px solid #ddd",
//   textAlign: "left",
//   padding: "6px",
// };

// const tdStyle: React.CSSProperties = {
//   borderBottom: "1px solid #eee",
//   padding: "6px",
// };

// const ActiveUsersAllMonthsPage: React.FC = () => {
//   const [data, setData] = useState<MonthlyDailyActiveUsersDto[] | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchStats = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await getDailyActiveUsersAllMonths();
//         if (!cancelled) {
//           setData(res);
//         }
//       } catch (err: unknown) {
//         if (!cancelled) {
//           const msg =
//             err instanceof Error ? err.message : "Failed to load stats.";
//           setError(msg);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchStats();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   if (loading) {
//     return <p>Φόρτωση στατιστικών ενεργών χρηστών...</p>;
//   }

//   if (error) {
//     return <p style={{ color: "red" }}>Σφάλμα: {error}</p>;
//   }

//   if (!data || data.length === 0) {
//     return <p>Δεν βρέθηκαν δεδομένα ενεργών χρηστών.</p>;
//   }

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h2>Ημερήσιοι ενεργοί χρήστες (ανά μήνα)</h2>

//       {data.map((monthBlock) => {
//         const { year, month, days } = monthBlock;

//         // μικρό summary
//         const total = days.reduce((sum, d) => sum + (d.activeUsers ?? 0), 0);
//         const avg =
//           days.length > 0 ? Math.round((total / days.length) * 10) / 10 : 0;

//         return (
//           <div
//             key={`${year}-${month}`}
//             style={{
//               marginTop: "1.5rem",
//               padding: "1rem",
//               border: "1px solid #ddd",
//               borderRadius: "8px",
//             }}
//           >
//             <h3>
//               Μήνας: {year}-{String(month).padStart(2, "0")}
//             </h3>
//             <p style={{ fontSize: "0.9rem", color: "#555" }}>
//               Συνολικοί ενεργοί χρήστες στον μήνα: <strong>{total}</strong> –{" "}
//               Μέσος όρος ανά ημέρα: <strong>{avg}</strong>
//             </p>

//             <table
//               style={{
//                 width: "100%",
//                 borderCollapse: "collapse",
//                 marginTop: "0.5rem",
//               }}
//             >
//               <thead>
//                 <tr>
//                   <th style={thStyle}>Ημέρα</th>
//                   <th style={thStyle}>Ενεργοί χρήστες</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {days.map((d) => (
//                   <tr key={`${year}-${month}-${d.dayOfMonth}`}>
//                     <td style={tdStyle}>{d.dayOfMonth}</td>
//                     <td style={tdStyle}>{d.activeUsers}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default ActiveUsersAllMonthsPage;
// src/admin/components/ActiveUsersAllMonthsPage.tsx
// src/admin/components/ActiveUsersAllMonthsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getDailyActiveUsersAllMonths } from "../../api/admin/UserStats";
import type { MonthlyDailyActiveUsersDto } from "../models/UserStats";

// function clamp(n: number, min: number, max: number) {
//   return Math.max(min, Math.min(max, n));
// }

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);

    update();

    // Modern browsers
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    // Fallback (older Safari etc.) - FIXED typings (no any)
    type LegacyMql = MediaQueryList & {
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };

    const legacy = mql as LegacyMql;

    if (typeof legacy.addListener === "function") {
      legacy.addListener(update);
      return () => {
        if (typeof legacy.removeListener === "function") legacy.removeListener(update);
      };
    }

    return;
  }, [query]);

  return matches;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type MonthKey = `${number}-${number}`;

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px 16px 32px",
    background: "#f6f7fb",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14,
    flexWrap: "wrap",
  },

  title: { margin: 0, fontSize: 24, color: "#0f172a", letterSpacing: -0.2 },
  subtitle: { margin: "6px 0 0", fontSize: 14, color: "#64748b", lineHeight: 1.5, maxWidth: 880 },

  alertError: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    marginTop: 10,
  },

  skeleton: {
    marginTop: 14,
    padding: "14px 12px",
    borderRadius: 12,
    border: "1px dashed #e5e7eb",
    color: "#64748b",
    background: "#fbfdff",
    fontWeight: 800,
  },

  monthsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    marginTop: 14,
    alignItems: "start",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    padding: 14,
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  monthTitle: { margin: 0, fontSize: 16, fontWeight: 950, color: "#0f172a" },

  chips: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: 12,
    fontWeight: 900,
    color: "#0f172a",
    whiteSpace: "nowrap",
  },
  chipMuted: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
    whiteSpace: "nowrap",
  },

  btn: {
    height: 36,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  tableWrap: { marginTop: 12, overflowX: "auto" },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 360,
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    fontWeight: 950,
    color: "#334155",
    background: "#f8fafc",
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

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

  // mobile list
  mobileList: {
    marginTop: 12,
    display: "grid",
    gap: 8,
  },
  mobileRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  mobileDay: { fontWeight: 900, color: "#0f172a" },
  mobileValue: {
    fontWeight: 950,
    color: "#0f172a",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};

const ActiveUsersAllMonthsPage: React.FC = () => {
  const [data, setData] = useState<MonthlyDailyActiveUsersDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // open/close months (ιδιαίτερα χρήσιμο σε κινητό)
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDailyActiveUsersAllMonths();
        if (!cancelled) {
          setData(res);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load stats.";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    const arr = (data ?? []).slice();
    // πιο πρόσφατα πρώτα (αν είναι σωστά τα year/month)
    arr.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return arr;
  }, [data]);

  // default open state: desktop -> όλα ανοιχτά, mobile -> άνοιξε μόνο το πιο πρόσφατο
  useEffect(() => {
    if (!sorted.length) return;

    setOpen((prev) => {
      if (Object.keys(prev).length > 0) return prev;

      const next: Record<string, boolean> = {};
      if (isMobile) {
        const first = sorted[0];
        const key = `${first.year}-${first.month}` as MonthKey;
        next[key] = true;
      } else {
        for (const m of sorted) {
          const key = `${m.year}-${m.month}` as MonthKey;
          next[key] = true;
        }
      }
      return next;
    });
  }, [sorted, isMobile]);

  if (loading) return <div style={styles.page}><div style={styles.skeleton}>Φόρτωση στατιστικών ενεργών χρηστών…</div></div>;
  if (error) return <div style={styles.page}><div style={styles.alertError}>Σφάλμα: {error}</div></div>;
  if (!data || data.length === 0) return <div style={styles.page}><div style={styles.skeleton}>Δεν βρέθηκαν δεδομένα ενεργών χρηστών.</div></div>;

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 980px) {
          .au-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .au-table { display: none !important; }
          .au-mobile { display: grid !important; }
        }
        @media (min-width: 641px) {
          .au-table { display: block !important; }
          .au-mobile { display: none !important; }
        }
      `}</style>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Ημερήσιοι ενεργοί χρήστες</h1>
          <p style={styles.subtitle}>
            Προβολή ενεργών χρηστών ανά ημέρα για κάθε μήνα. Σε κινητό μπορείς να ανοίγεις/κλείνεις τους μήνες για να είναι πιο καθαρό.
          </p>
        </div>
      </div>

      <div className="au-grid" style={styles.monthsGrid}>
        {sorted.map((monthBlock) => {
          const { year, month, days } = monthBlock;
          const key = `${year}-${month}` as MonthKey;

          const cleanDays = days.slice().sort((a, b) => a.dayOfMonth - b.dayOfMonth);

          const total = cleanDays.reduce((sum, d) => sum + (d.activeUsers ?? 0), 0);
          const avgRaw = cleanDays.length > 0 ? total / cleanDays.length : 0;
          const avg = Math.round(avgRaw * 10) / 10;

          let maxVal = -1;
          let maxDay = 0;
          for (const d of cleanDays) {
            const v = d.activeUsers ?? 0;
            if (v > maxVal) {
              maxVal = v;
              maxDay = d.dayOfMonth;
            }
          }

          const isOpen = open[key] === true;

          return (
            <div key={key} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={styles.monthTitle}>
                    {year}-{pad2(month)}
                  </h3>

                  <div style={styles.chips}>
                    <span style={styles.chip}>Σύνολο: {total}</span>
                    <span style={styles.chipMuted}>Μ.Ο./ημέρα: {avg}</span>
                    <span style={styles.chipMuted}>
                      Peak: {maxVal >= 0 ? maxVal : 0} (ημ. {maxDay})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  style={styles.btn}
                  onClick={() => setOpen((prev) => ({ ...prev, [key]: !isOpen }))}
                >
                  {isOpen ? "Απόκρυψη" : "Προβολή"}
                </button>
              </div>

              {isOpen && (
                <>
                  {/* Desktop/tablet table */}
                  <div className="au-table" style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Ημέρα</th>
                          <th style={styles.th}>Ενεργοί χρήστες</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cleanDays.map((d) => (
                          <tr key={`${key}-${d.dayOfMonth}`}>
                            <td style={styles.tdMono}>{d.dayOfMonth}</td>
                            <td style={styles.td}>{d.activeUsers ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile list */}
                  <div className="au-mobile" style={styles.mobileList}>
                    {cleanDays.map((d) => (
                      <div key={`${key}-m-${d.dayOfMonth}`} style={styles.mobileRow}>
                        <div style={styles.mobileDay}>Ημέρα {d.dayOfMonth}</div>
                        <div style={styles.mobileValue}>{d.activeUsers ?? 0}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveUsersAllMonthsPage;
