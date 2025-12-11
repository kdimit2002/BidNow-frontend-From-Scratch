// src/admin/components/ActiveUsersAllMonthsPage.tsx
import React, { useEffect, useState } from "react";
import { getDailyActiveUsersAllMonths } from "../../api/admin/UserStats";
import type { MonthlyDailyActiveUsersDto } from "../models/UserStats";

const thStyle: React.CSSProperties = {
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  padding: "6px",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "6px",
};

const ActiveUsersAllMonthsPage: React.FC = () => {
  const [data, setData] = useState<MonthlyDailyActiveUsersDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          const msg =
            err instanceof Error ? err.message : "Failed to load stats.";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p>Φόρτωση στατιστικών ενεργών χρηστών...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Σφάλμα: {error}</p>;
  }

  if (!data || data.length === 0) {
    return <p>Δεν βρέθηκαν δεδομένα ενεργών χρηστών.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Ημερήσιοι ενεργοί χρήστες (ανά μήνα)</h2>

      {data.map((monthBlock) => {
        const { year, month, days } = monthBlock;

        // μικρό summary
        const total = days.reduce((sum, d) => sum + (d.activeUsers ?? 0), 0);
        const avg =
          days.length > 0 ? Math.round((total / days.length) * 10) / 10 : 0;

        return (
          <div
            key={`${year}-${month}`}
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>
              Μήνας: {year}-{String(month).padStart(2, "0")}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#555" }}>
              Συνολικοί ενεργοί χρήστες στον μήνα: <strong>{total}</strong> –{" "}
              Μέσος όρος ανά ημέρα: <strong>{avg}</strong>
            </p>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "0.5rem",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Ημέρα</th>
                  <th style={thStyle}>Ενεργοί χρήστες</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={`${year}-${month}-${d.dayOfMonth}`}>
                    <td style={tdStyle}>{d.dayOfMonth}</td>
                    <td style={tdStyle}>{d.activeUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveUsersAllMonthsPage;
