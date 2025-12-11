import React, { useEffect, useState } from "react";
import { fetchReferralCodeUsage } from "../api/Springboot/ReferralCodeService";
import type { ReferralCodeUsageResponse } from "../models/Springboot/ReferralCode";
import type { PageResponse } from "../admin/models/AdminResponseUser";

interface ReferralCodeUsagePageProps {
  onBack: () => void;
}

const thStyle: React.CSSProperties = {
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  padding: "8px",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};

const ReferralCodeUsagePage: React.FC<ReferralCodeUsagePageProps> = ({
  onBack,
}) => {
  const [page, setPage] = useState(0);
  const [data, setData] =
    useState<PageResponse<ReferralCodeUsageResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadUsage = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchReferralCodeUsage(page, 10);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        console.error("Failed to load referral code usage:", err);
        if (!cancelled) {
          let message = "Αποτυχία φόρτωσης χρήσης referral code.";
          if (err instanceof Error) message = err.message;
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUsage();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (data && !data.last) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={onBack} style={{ marginBottom: "1rem" }}>
        ⬅ Πίσω στο προφίλ
      </button>

      <h2>Χρήση του referral code μου</h2>

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && data.content.length === 0 && !loading && (
        <p>Δεν έχει χρησιμοποιηθεί ακόμα ο referral code σου.</p>
      )}

      {data && data.content.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "12px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Χρήστης</th>
                <th style={thStyle}>Code</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((item, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{item.username}</td>
                  <td style={tdStyle}>
                    <code>{item.code}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button onClick={handlePrev} disabled={page === 0 || loading}>
              Previous
            </button>
            <span>
              Page {data.number + 1} of {data.totalPages}
            </span>
            <button onClick={handleNext} disabled={data.last || loading}>
              Next
            </button>
            <span>({data.totalElements} entries total)</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralCodeUsagePage;
