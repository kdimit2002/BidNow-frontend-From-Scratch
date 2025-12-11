import React, { useState, useEffect } from "react";
import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
import { getMyActiveBidAuctions } from "../api/Springboot/backendAuctionService";

interface MyBidAuctionsPageProps {
  onOpenDetails?: (auctionId: number) => void;
  onBack?: () => void; //tora to evala
}


const MyBidAuctionsPage: React.FC<MyBidAuctionsPageProps> = ({
  onOpenDetails, onBack
}) => {
  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] =
    useState<SpringPage<AuctionListItem> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad =
        typeof pageOverride === "number" ? pageOverride : page;

      const result = await getMyActiveBidAuctions({
        page: pageToLoad,
      });

      setPageData(result);
      setPage(pageToLoad);
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά κατά τη φόρτωση των δημοπρασιών.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
    const end = new Date(endDateIso);
    const diffMs = end.getTime() - nowValue.getTime();

    if (Number.isNaN(end.getTime())) {
      return endDateIso;
    }

    if (diffMs <= 0) {
      return "Έληξε";
    }

    let totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds -= days * 24 * 3600;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>

      {onBack && (
      <div style={{ marginBottom: "1rem" }}>
        <button type="button" onClick={onBack}>
          ← Back to all auctions
        </button>
      </div>
      )}
      <h1>My Active Bids</h1>

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {pageData && (
        <div>
          <p>
            Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
            {pageData.totalElements} auctions
          </p>

          <ul>
            {pageData.content.map((auction) => (
              <li key={auction.id} style={{ marginBottom: "0.75rem" }}>
                main image:{" "}
                {auction.mainImageUrl && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    <img
                      src={auction.mainImageUrl}
                      alt={auction.title}
                      style={{
                        maxWidth: 200,
                        maxHeight: 200,
                        display: "block",
                      }}
                    />
                  </div>
                )}

                <strong>{auction.title}</strong> — {auction.categoryName} —{" "}
                {auction.startingAmount}€
                <br />
                Τοποθεσία: {getCityFromLocation(auction.sellerLocation)}
                <br />
                Χρόνος που απομένει:{" "}
                {formatTimeRemaining(auction.endDate, now)}
                <br />
                Ελάχιστη αύξηση προσφοράς: {auction.minBidIncrement}€
                <br />
                {auction.topBidAmount != null ? (
                  <span>
                    Τρέχουσα υψηλότερη προσφορά:{" "}
                    <strong>{auction.topBidAmount}€</strong> από{" "}
                    <strong>
                      {auction.topBidderUsername ?? "άγνωστο χρήστη"}
                    </strong>
                  </span>
                ) : (
                  <span>Δεν υπάρχουν προσφορές ακόμη.</span>
                )}
                <br />
                Short desc: {auction.shortDescription}
                <br />
                <button
                  type="button"
                  style={{ marginTop: "0.25rem" }}
                  onClick={() => onOpenDetails?.(auction.id)}
                >
                  Details
                </button>
              </li>
            ))}
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

export default MyBidAuctionsPage;
