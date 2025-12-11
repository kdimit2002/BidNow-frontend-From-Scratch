// src/components/MyPendingAuctionsPage.tsx

import React, { useEffect, useState } from "react";
import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
import { getMyPendingAuctions } from "../api/Springboot/backendAuctionService";

interface MyPendingAuctionsPageProps {
  onBack?: () => void;
}

const MyPendingAuctionsPage: React.FC<MyPendingAuctionsPageProps> = ({
  onBack,
}) => {
  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] =
    useState<SpringPage<AuctionListItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>("endDate");
  const [direction, setDirection] = useState<string>("asc");

  // για real-time time remaining (ανά δευτερόλεπτο)
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const formatTimeRemaining = (endDateStr: string): string => {
    const end = new Date(endDateStr);
    const diffMs = end.getTime() - now.getTime();
    if (Number.isNaN(diffMs) || diffMs <= 0) {
      return "Expired";
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  };

  const loadAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

      const result = await getMyPendingAuctions({
        page: pageToLoad,
        size: 30,
        sortBy: sortBy || undefined,
        direction: direction || undefined,
      });

      setPageData(result);
      setPage(pageToLoad);
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά κατά τη φόρτωση των pending auctions.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Φόρτωσε αυτόματα στην αρχή
  useEffect(() => {
    loadAuctions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    loadAuctions(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    loadAuctions(page + 1);
  };

  const extractCity = (sellerLocation?: string | null) => {
    if (!sellerLocation) return "";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      <h1>My Pending Auctions</h1>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{ marginBottom: "1rem" }}
        >
          ← Back to all auctions
        </button>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadAuctions(0);
        }}
        style={{ marginBottom: "1rem" }}
      >
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Sort By:
            <input
              type="text"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              placeholder="π.χ. endDate"
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Direction:
            <input
              type="text"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="asc / desc"
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Φόρτωση..." : "Φόρτωσε pending auctions"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {pageData && (
        <div>
          <p>
            Σελίδα {page + 1} από {pageData.totalPages} — Σύνολο{" "}
            {pageData.totalElements} pending auctions
           </p>


          <ul>
            {pageData.content.map((auction) => {
              const city = extractCity(auction.sellerLocation);
              const timeRemaining = formatTimeRemaining(auction.endDate);

              return (
                <li key={auction.id} style={{ marginBottom: "0.75rem" }}>
                  <strong>{auction.title}</strong> — {auction.categoryName} —{" "}
                  {auction.startingAmount}€
                  <br />
                  Location: {city || "N/A"}
                  <br />
                  Min bid increment: {auction.minBidIncrement}€
                  <br />
                  Time remaining: {timeRemaining}
                  <br />
                  Status: {auction.status} {/* εδώ θα είναι PENDING_APPROVAL */}
                  <br />
                  Short desc: {auction.shortDescription}
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={loading || !pageData || pageData.first}
              style={{ marginRight: "0.5rem" }}
            >
              Προηγούμενη
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={loading || !pageData || pageData.last}
            >
              Επόμενη
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPendingAuctionsPage;
