// src/admin/components/AdminMyAuctionsPage.tsx

import React, { useEffect, useState } from "react";
import type { AdminAuctionListItem,AdminAuctionListPage,StatusGroup } from "../../api/admin/backendAdminAuctionService";

import { adminGetNonActiveAuctions } from "../../api/admin/backendAdminAuctionService";

interface AdminMyAuctionsPageProps {
  onBack?: () => void;
}

const AdminMyAuctionsPage: React.FC<AdminMyAuctionsPageProps> = ({ onBack }) => {
  const [statusGroup, setStatusGroup] = useState<StatusGroup>("EXPIRED");
  const [sortBy, setSortBy] = useState<string>("endDate");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const [pageData, setPageData] = useState<AdminAuctionListPage | null>(null);
  const [page, setPage] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 30;

  const loadAuctions = async (pageOverride?: number) => {
    const targetPage = typeof pageOverride === "number" ? pageOverride : page;

    setLoading(true);
    setError(null);

    try {
      const result = await adminGetNonActiveAuctions({
        page: targetPage,
        size: pageSize,
        sortBy,
        direction,
        statusGroup,
      });

      setPageData(result);
      setPage(targetPage);
    } catch (err) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά κατά τη φόρτωση των δημοπρασιών.";
      if (err instanceof Error) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAuctions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusGroup, sortBy, direction]);

  const handleSubmitFilters: React.FormEventHandler = (e) => {
    e.preventDefault();
    void loadAuctions(0);
  };

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    void loadAuctions(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    void loadAuctions(page + 1);
  };

  const getCityFromLocation = (
    sellerLocation: string | null | undefined
  ): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  const formatDateTime = (iso: string | null | undefined): string => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const statusColor = (status: string): string => {
    switch (status) {
      case "EXPIRED":
        return "#6b7280"; // gray
      case "CANCELLED":
        return "#b91c1c"; // red
      case "PENDING_APPROVAL":
        return "#92400e"; // amber
      default:
        return "#374151";
    }
  };

  const statusLabel = (status: string): string => {
    switch (status) {
      case "EXPIRED":
        return "Expired";
      case "CANCELLED":
        return "Cancelled";
      case "PENDING_APPROVAL":
        return "Pending Approval";
      default:
        return status;
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <button type="button" onClick={onBack}>
          ← Back
        </button>
      </div>

      <h1>Admin – Non-active Auctions</h1>
      <p style={{ color: "#555" }}>
        Εδώ μπορείς να δεις δημοπρασίες με status{" "}
        <code>EXPIRED</code>, <code>CANCELLED</code> ή{" "}
        <code>PENDING_APPROVAL</code>.  
        Στις <strong>EXPIRED</strong> αν υπάρχει top bid, ο top bidder θεωρείται winner.
      </p>

      <form
        onSubmit={handleSubmitFilters}
        style={{
          margin: "1rem 0",
          padding: "0.75rem",
          border: "1px solid #ddd",
          borderRadius: 4,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <div>
          <label>
            Status group:{" "}
            <select
              value={statusGroup}
              onChange={(e) => setStatusGroup(e.target.value as StatusGroup)}
            >
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Sort by:{" "}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="endDate">endDate</option>
              <option value="startDate">startDate</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Direction:{" "}
            <select
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value === "asc" ? "asc" : "desc")
              }
            >
              <option value="desc">desc</option>
              <option value="asc">asc</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Φόρτωση..." : "Εφαρμογή φίλτρων"}
        </button>
      </form>

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {pageData && (
        <>
          <p style={{ marginBottom: "0.5rem" }}>
            Σελίδα {pageData.pageNumber + 1} από {pageData.totalPages} — Σύνολο{" "}
            {pageData.totalElements} δημοπρασίες
          </p>

          {pageData.content.length === 0 ? (
            <p>Δεν βρέθηκαν δημοπρασίες για τα επιλεγμένα φίλτρα.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {pageData.content.map((auction: AdminAuctionListItem) => {
                const isExpired = auction.status === "EXPIRED";
                const hasWinner =
                  isExpired &&
                  auction.topBidAmount != null &&
                  auction.topBidderUsername != null;

                return (
                  <li
                    key={auction.id}
                    style={{
                      marginBottom: "1rem",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      padding: "0.75rem",
                      display: "flex",
                      gap: "0.75rem",
                    }}
                  >
                    {/* Εικόνα */}
                    <div style={{ minWidth: 180 }}>
                      {auction.mainImageUrl ? (
                        <img
                          src={auction.mainImageUrl}
                          alt={auction.title}
                          style={{
                            maxWidth: 180,
                            maxHeight: 180,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 180,
                            height: 120,
                            border: "1px dashed #ccc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            color: "#999",
                          }}
                        >
                          No image
                        </div>
                      )}
                    </div>

                    {/* Στοιχεία */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0 }}>
                            {auction.title} — {auction.categoryName}
                          </h3>
                          <p style={{ margin: "0.25rem 0" }}>
                            Seller:{" "}
                            <strong>{auction.sellerUsername}</strong> (
                            {getCityFromLocation(auction.sellerLocation)})
                          </p>
                        </div>

                        <div
                          style={{
                            textAlign: "right",
                            minWidth: 120,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.15rem 0.5rem",
                              borderRadius: 999,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "white",
                              backgroundColor: statusColor(auction.status),
                            }}
                          >
                            {statusLabel(auction.status)}
                          </span>
                          <div
                            style={{
                              marginTop: "0.25rem",
                              fontSize: "0.8rem",
                              color: "#555",
                            }}
                          >
                            Ends: {formatDateTime(auction.endDate)}
                          </div>
                        </div>
                      </div>

                      <p
                        style={{
                          marginTop: "0.5rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <strong>Short description:</strong>{" "}
                        {auction.shortDescription}
                      </p>

                      <p style={{ margin: 0 }}>
                        Starting:{" "}
                        <strong>{auction.startingAmount}€</strong> — Min
                        increment:{" "}
                        <strong>{auction.minBidIncrement}€</strong>
                      </p>

                      <p style={{ margin: 0 }}>
                        Current top bid:{" "}
                        {auction.topBidAmount != null ? (
                          <>
                            <strong>{auction.topBidAmount}€</strong> από{" "}
                            <strong>
                              {auction.topBidderUsername ??
                                "άγνωστο χρήστη"}
                            </strong>
                          </>
                        ) : (
                          "καμία προσφορά"
                        )}
                      </p>

                      {/* 👇 Winner info για EXPIRED με top bid */}
                      {hasWinner && (
                        <p
                          style={{
                            margin: 0,
                            marginTop: "0.25rem",
                            fontWeight: 600,
                            color: "#166534",
                          }}
                        >
                          Winner:{" "}
                          <strong>{auction.topBidderUsername}</strong> με{" "}
                          <strong>{auction.topBidAmount}€</strong>
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={loading || (pageData && pageData.first)}
              style={{ marginRight: "0.5rem" }}
            >
              Προηγούμενη
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={loading || (pageData && pageData.last)}
            >
              Επόμενη
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminMyAuctionsPage;
