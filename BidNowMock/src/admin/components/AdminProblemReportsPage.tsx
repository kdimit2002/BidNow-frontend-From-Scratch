// src/components/AdminProblemReportsPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { adminGetProblemReports,  adminResolveProblemReport,
  type AdminProblemReport,
  type ProblemReportStatus,
 } from "../../api/Springboot/backendProblemReportService";

interface AdminProblemReportsPageProps {
  onBack?: () => void;
}

export const AdminProblemReportsPage: React.FC<AdminProblemReportsPageProps> = ({
  onBack,
}) => {
  const [items, setItems] = useState<AdminProblemReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"ALL" | ProblemReportStatus>("OPEN");
  const [search, setSearch] = useState("");

  // 🔹 ΝΕΟ: state για popup (auction ή seller details)
  const [detailsPopup, setDetailsPopup] = useState<{
    type: "auction" | "seller";
    report: AdminProblemReport;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetProblemReports({
        status: filter,
        page: 0,
        size: 50,
      });
      setItems(res.content);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((r) => {
      const u = r.reporter;
      const a = r.auction;
      const seller = a?.seller;

      return (
        String(r.id).includes(q) ||
        String(r.auctionId).includes(q) ||
        (r.auctionTitle ?? "").toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.phoneNumber ?? "").toLowerCase().includes(q) ||
        (u.firebaseId ?? "").toLowerCase().includes(q) ||
        (a?.title ?? "").toLowerCase().includes(q) ||
        (a?.categoryName ?? "").toLowerCase().includes(q) ||
        (seller?.username ?? "").toLowerCase().includes(q) ||
        (seller?.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const doResolve = async (reportId: number) => {
    const ok = window.confirm(`Mark report #${reportId} as RESOLVED?`);
    if (!ok) return;

    try {
      await adminResolveProblemReport(reportId);
      setItems((prev) =>
        prev.map((x) => (x.id === reportId ? { ...x, status: "RESOLVED" } : x))
      );
    } catch (e: unknown) {
      console.error(e);
      window.alert(e instanceof Error ? e.message : "Failed to resolve report");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>
      <h1>Admin – Problem Reports</h1>

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
              setFilter(e.target.value as "ALL" | ProblemReportStatus)
            }
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="ALL">ALL</option>
            <option value="OPEN">OPEN</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </label>

        <label>
          Search:
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="auction id/title, report title, username, email, phone..."
            style={{ marginLeft: "0.5rem", width: 420 }}
          />
        </label>

        <button type="button" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
      {!loading && filtered.length === 0 && <p>No reports found.</p>}

      {filtered.map((r) => {
        const u = r.reporter;
        const loc = u.locationDto;

        //const a = r.auction;

        return (
          <div
            key={r.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
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
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>
                  Report #{r.id} — {r.title}
                </div>

                <div>
                  Auction: <strong>#{r.auctionId}</strong> — {r.auctionTitle}
                </div>

                <div>
                  Status: <strong>{r.status}</strong> — Created: {r.createdAt}
                </div>

                <hr style={{ margin: "0.75rem 0" }} />

                <div style={{ fontWeight: "bold" }}>Reporter details</div>
                <div>id: {u.id}</div>
                <div>username: {u.username}</div>
                <div>email: {u.email}</div>
                <div>phoneNumber: {u.phoneNumber}</div>
                <div>firebaseId: {u.firebaseId}</div>
                <div>rewardPoints: {u.rewardPoints}</div>
                <div>role: {u.role}</div>
                <div>isBanned: {String(u.isBanned)}</div>
                <div>isAnonymized: {String(u.isAnonymized)}</div>
                <div>eligibleForChat: {String(u.eligibleForChat)}</div>
                <div>
                  location:{" "}
                  {loc
                    ? `${loc.region}, ${loc.country}, ${loc.city}, ${loc.addressLine}, ${loc.postalCode}`
                    : "—"}
                </div>

                {/* 🔹 Αντί για inline auction/seller details, βάζουμε κουμπιά */}
                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setDetailsPopup({ type: "auction", report: r })
                    }
                  >
                    Auction details
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDetailsPopup({ type: "seller", report: r })
                    }
                  >
                    Seller details
                  </button>
                </div>

                <hr style={{ margin: "0.75rem 0" }} />

                <div style={{ fontWeight: "bold" }}>Report description</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{r.description}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => doResolve(r.id)}
                  disabled={r.status === "RESOLVED"}
                >
                  {r.status === "RESOLVED" ? "Resolved" : "Mark as resolved"}
                </button>
              </div>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              {r.videoUrl ? (
                <>
                  <video
                    src={r.videoUrl}
                    controls
                    preload="metadata"
                    style={{ width: "100%", maxHeight: 420 }}
                  />
                  <div style={{ marginTop: "0.25rem" }}>
                    <a href={r.videoUrl} target="_blank" rel="noreferrer">
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

      {/* 🔹 Popup overlay για Auction / Seller details */}
      {detailsPopup &&
        (() => {
          const r = detailsPopup.report;
          const a = r.auction;
          const seller = a?.seller;
          const sellerLoc = seller?.locationDto;

          return (
            <div
              onClick={() => setDetailsPopup(null)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: "white",
                  padding: "1rem",
                  borderRadius: 8,
                  maxWidth: 800,
                  width: "90vw",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  {detailsPopup.type === "auction"
                    ? `Auction #${r.auctionId} details`
                    : "Seller (auction owner) details"}
                </h2>

                {detailsPopup.type === "auction" && (
                  <div>
                    <div style={{ fontWeight: "bold" }}>Auction details</div>
                    <div>id: {a?.id ?? r.auctionId}</div>
                    <div>title: {a?.title ?? r.auctionTitle}</div>
                    <div>category: {a?.categoryName ?? "—"}</div>
                    <div>status: {a?.status ?? "—"}</div>
                    <div>shipping: {a?.shippingCostPayer ?? "—"}</div>
                    <div>
                      startingAmount: {a?.startingAmount ?? "—"}
                      {a?.startingAmount != null && "€"}
                    </div>
                    <div>
                      minBidIncrement: {a?.minBidIncrement ?? "—"}
                      {a?.minBidIncrement != null && "€"}
                    </div>
                    <div>startDate: {a?.startDate ?? "—"}</div>
                    <div>endDate: {a?.endDate ?? "—"}</div>
                    <div style={{ marginTop: "0.25rem" }}>
                      shortDescription: {a?.shortDescription ?? "—"}
                    </div>
                    <div style={{ marginTop: "0.25rem" }}>
                      description:{" "}
                      <span style={{ whiteSpace: "pre-wrap" }}>
                        {a?.description ?? "—"}
                      </span>
                    </div>

                    <div
                      style={{ marginTop: "0.75rem", fontWeight: "bold" }}
                    >
                      Auction images
                    </div>
                    {a?.imageUrls?.length ? (
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
                      <p style={{ color: "#666" }}>No auction images.</p>
                    )}
                  </div>
                )}

                {detailsPopup.type === "seller" && (
                  <div>
                    <div style={{ fontWeight: "bold" }}>
                      Seller (auction owner)
                    </div>
                    {seller ? (
                      <>
                        <div>id: {seller.id}</div>
                        <div>username: {seller.username}</div>
                        <div>email: {seller.email}</div>
                        <div>phoneNumber: {seller.phoneNumber}</div>
                        <div>firebaseId: {seller.firebaseId}</div>
                        <div>rewardPoints: {seller.rewardPoints}</div>
                        <div>role: {seller.role}</div>
                        <div>isBanned: {String(seller.isBanned)}</div>
                        <div>isAnonymized: {String(seller.isAnonymized)}</div>
                        <div>
                          eligibleForChat: {String(seller.eligibleForChat)}
                        </div>
                        <div>
                          location:{" "}
                          {sellerLoc
                            ? `${sellerLoc.region}, ${sellerLoc.country}, ${sellerLoc.city}, ${sellerLoc.addressLine}, ${sellerLoc.postalCode}`
                            : "—"}
                        </div>
                      </>
                    ) : (
                      <p style={{ color: "#666" }}>No seller info.</p>
                    )}
                  </div>
                )}

                <div
                  style={{ marginTop: "0.75rem", textAlign: "right" }}
                >
                  <button type="button" onClick={() => setDetailsPopup(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default AdminProblemReportsPage;
