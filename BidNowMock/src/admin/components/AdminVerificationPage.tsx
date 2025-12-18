// src/components/AdminVerificationPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { VerificationStatus } from "../../models/Springboot/Auction";
import { 
  adminGetVerificationVideos,
  adminApproveVerification,
  adminRejectVerification,
  type AdminVerificationAuction, 
} from "../../api/Springboot/backendVerificationService";

interface AdminVerificationPageProps {
  onBack?: () => void;
}

const AdminVerificationPage: React.FC<AdminVerificationPageProps> = ({
  onBack,
}) => {
  const [items, setItems] = useState<AdminVerificationAuction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<VerificationStatus | "ALL">(
    "PENDING_REVIEW"
  );
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetVerificationVideos();
      setItems(res);
    } catch (e: unknown) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Failed to load verifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items
      .filter((x) =>
        filter === "ALL"
          ? true
          : (x.verificationStatus ?? "NOT_VERIFIED") === filter
      )
      .filter((x) => {
        if (!q) return true;
        const title = (x.title ?? "").toLowerCase();
        const idStr = String(x.id);
        return title.includes(q) || idStr.includes(q);
      });
  }, [items, filter, search]);

  const label = (s?: VerificationStatus) => {
    const v = s ?? "NOT_VERIFIED";
    if (v === "PENDING_REVIEW") return "Pending review";
    if (v === "VERIFIED") return "Verified ✅";
    if (v === "REJECTED") return "Rejected ❌";
    return "Not verified";
  };

  const doApprove = async (auctionId: number) => {
    const ok = window.confirm(
      `Approve verification for auction #${auctionId}?`
    );
    if (!ok) return;

    try {
      await adminApproveVerification(auctionId);
      setItems((prev) =>
        prev.map((x) =>
          x.id === auctionId ? { ...x, verificationStatus: "VERIFIED" } : x
        )
      );
    } catch (e: unknown) {
      console.error(e);
      window.alert(
        e instanceof Error ? e.message : "Failed to approve verification"
      );
    }
  };

  const doReject = async (auctionId: number) => {
    const ok = window.confirm(
      `Reject verification for auction #${auctionId}?`
    ); 
    if (!ok) return;

    try {
      await adminRejectVerification(auctionId);
      setItems((prev) =>
        prev.map((x) =>
          x.id === auctionId ? { ...x, verificationStatus: "REJECTED" } : x
        )
      );
    } catch (e: unknown) {
      console.error(e);
      window.alert(
        e instanceof Error ? e.message : "Failed to reject verification"
      );
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <h1>Admin – Verification Reviews</h1>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{ marginBottom: "1rem" }}
        >
          ← Back
        </button>
      )}

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <label>
          Filter:
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as VerificationStatus | "ALL")
            }
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="ALL">ALL</option>
            <option value="PENDING_REVIEW">PENDING_REVIEW</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="NOT_VERIFIED">NOT_VERIFIED</option>
          </select>
        </label>

        <label>
          Search:
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="title ή auction id"
            style={{ marginLeft: "0.5rem" }}
          />
        </label>

        <button type="button" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {filtered.length === 0 && !loading && (
        <p>No verification videos found.</p>
      )}

      {filtered.map((a) => {
        const vStatus = (a.verificationStatus ??
          "NOT_VERIFIED") as VerificationStatus;

        return (
          <div
            key={a.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>
                  #{a.id} — {a.title ?? "(no title)"}
                </div>
                <div>
                  Auction status: <strong>{a.status ?? "N/A"}</strong>
                </div>
                <div>
                  Verification: <strong>{label(vStatus)}</strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <button type="button" onClick={() => doApprove(a.id)}>
                  Approve
                </button>
                <button type="button" onClick={() => doReject(a.id)}>
                  Reject
                </button>
              </div>
            </div>

            {/* 🔹 Auction details */}
            <div style={{ marginTop: "0.75rem" }}>
              <div style={{ fontWeight: "bold" }}>Auction details</div>
              <div>Category: {a.categoryName ?? "—"}</div>
              <div>
                Starting amount:{" "}
                {a.startingAmount != null ? `${a.startingAmount}€` : "—"}
              </div>
              <div>
                Min bid increment:{" "}
                {a.minBidIncrement != null ? `${a.minBidIncrement}€` : "—"}
              </div>
              <div>Shipping: {a.shippingCostPayer ?? "—"}</div>
              <div>Start date: {a.startDate ?? "—"}</div>
              <div>End date: {a.endDate ?? "—"}</div>
              <div>
                Seller: {a.sellerUsername ? a.sellerUsername : "(no seller)"}
              </div>
            </div>

            {/* 🔹 Auction images */}
            <div style={{ marginTop: "0.75rem" }}>
              <div style={{ fontWeight: "bold" }}>Auction images</div>
              {a.imageUrls && a.imageUrls.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {a.imageUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={url}
                        alt={`auction-${a.id}-img-${idx}`}
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          border: "1px solid #ddd",
                        }}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#666" }}>No images.</p>
              )}
            </div>

            {/* 🔹 Video preview */}
            <div style={{ marginTop: "0.75rem" }}>
              {a.verificationVideoUrl ? (
                <>
                  <video
                    src={a.verificationVideoUrl}
                    controls
                    preload="metadata"
                    style={{ width: "100%", maxHeight: 420 }}
                  />
                  <div style={{ marginTop: "0.25rem" }}>
                    <a
                      href={a.verificationVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open video in new tab
                    </a>
                  </div>
                </>
              ) : (
                <p style={{ color: "#666" }}>No video URL.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminVerificationPage;
