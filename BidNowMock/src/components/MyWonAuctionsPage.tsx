// src/components/MyWonAuctionsPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
import { getMyWonAuctions } from "../api/Springboot/backendAuctionService";
import {
  reportProblemForWonAuction,
  getMyReportedProblemAuctionIds,
} from "../api/Springboot/backendProblemReportService";

interface MyWonAuctionsPageProps {
  onOpenDetails?: (auctionId: number) => void;
  onBack?: () => void;
}

const MyWonAuctionsPage: React.FC<MyWonAuctionsPageProps> = ({
  onOpenDetails,
  onBack,
}) => {
  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] = useState<SpringPage<AuctionListItem> | null>(
    null
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // (προαιρετικό) live "now" αν θες time-since-ended
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // Reported auctions (για να δείχνεις “Report has been sent ✅”)
  const [reportedAuctionIds, setReportedAuctionIds] = useState<Set<number>>(
    () => new Set()
  );

  useEffect(() => {
    (async () => {
      try {
        const ids = await getMyReportedProblemAuctionIds();
        setReportedAuctionIds(new Set(ids));
      } catch (e) {
        console.error("Failed to load reported auction ids", e);
      }
    })();
  }, []);

  const loadAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

      const result = await getMyWonAuctions({
        page: pageToLoad,
      });

      setPageData(result);
      setPage(pageToLoad);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Κάτι πήγε στραβά κατά τη φόρτωση των δημοπρασιών.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAuctions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    void loadAuctions(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    void loadAuctions(page + 1);
  };

  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  const formatEndedAt = (endDateIso: string): string => {
    const d = new Date(endDateIso);
    if (Number.isNaN(d.getTime())) return endDateIso;
    return d.toLocaleString();
  };

  const formatTimeSinceEnded = (endDateIso: string, nowValue: Date): string => {
    const end = new Date(endDateIso);
    if (Number.isNaN(end.getTime())) return "";

    const diffMs = nowValue.getTime() - end.getTime();
    if (diffMs < 0) return ""; // δεν έχει λήξει ακόμη

    let totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds -= days * 24 * 3600;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;

    const minutes = Math.floor(totalSeconds / 60);

    if (days > 0) return `${days}d ${hours}h ago`;
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `just now`;
  };

  // ----------------------------
  // Report Problem modal state
  // ----------------------------
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [reportAuctionId, setReportAuctionId] = useState<number | null>(null);
  const [reportAuctionTitle, setReportAuctionTitle] = useState<string>("");

  const [reportTitle, setReportTitle] = useState<string>("");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportVideoFile, setReportVideoFile] = useState<File | null>(null);

  const [submittingReport, setSubmittingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const videoPreviewUrl = useMemo<string | null>(() => {
    if (!reportVideoFile) return null;
    return URL.createObjectURL(reportVideoFile);
  }, [reportVideoFile]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const openReportModal = (auction: AuctionListItem) => {
    setReportError(null);
    setIsReportOpen(true);

    setReportAuctionId(auction.id);
    setReportAuctionTitle(auction.title);

    setReportTitle("");
    setReportDescription("");
    setReportVideoFile(null);
  };

  const closeReportModal = () => {
    if (submittingReport) return;
    setIsReportOpen(false);

    setReportAuctionId(null);
    setReportAuctionTitle("");

    setReportError(null);
    setReportTitle("");
    setReportDescription("");
    setReportVideoFile(null);
  };

  const submitReport = async () => {
    if (reportAuctionId === null) return;

    const t = reportTitle.trim();
    const d = reportDescription.trim();

    if (!t) {
      setReportError("Συμπλήρωσε τίτλο.");
      return;
    }
    if (!d) {
      setReportError("Συμπλήρωσε περιγραφή.");
      return;
    }
    if (reportVideoFile === null) {
      setReportError("Ανέβασε ένα βίντεο.");
      return;
    }
    if (!reportVideoFile.type.startsWith("video/")) {
      setReportError("Το αρχείο πρέπει να είναι βίντεο.");
      return;
    }

    setSubmittingReport(true);
    setReportError(null);

    try {
      await reportProblemForWonAuction(
        reportAuctionId,
        { title: t, description: d },
        reportVideoFile
      );

      setReportedAuctionIds((prev) => {
        const next = new Set(prev);
        next.add(reportAuctionId);
        return next;
      });

      window.alert("Το report καταχωρήθηκε με επιτυχία.");
      closeReportModal();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Απέτυχε η αποστολή report.";

      // Αν backend απαντά 409 / already exists, κάνε το optimistic “sent”
      if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        setReportedAuctionIds((prev) => {
          const next = new Set(prev);
          next.add(reportAuctionId);
          return next;
        });
        closeReportModal();
        return;
      }

      setReportError(msg);
    } finally {
      setSubmittingReport(false);
    }
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

      <h1>My Won Auctions</h1>

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {pageData && (
        <div>
          <p>
            Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
            {pageData.totalElements} auctions
          </p>

          <ul>
            {pageData.content.map((auction) => {
              const endedAt = formatEndedAt(auction.endDate);
              const sinceEnded = formatTimeSinceEnded(auction.endDate, now);
              const alreadyReported = reportedAuctionIds.has(auction.id);

              return (
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
                  Τοποθεσία:{" "}
                  {getCityFromLocation(
                    (auction.sellerLocation ?? null) as string | null
                  )}
                  <br />
                  Η δημοπρασία έληξε: <strong>{endedAt}</strong>{" "}
                  {sinceEnded ? <span style={{ color: "#666" }}>({sinceEnded})</span> : null}{" "}
                  (status: {auction.status})
                  <br />
                  Τελική υψηλότερη προσφορά:{" "}
                  {auction.topBidAmount != null ? (
                    <strong>{auction.topBidAmount}€</strong>
                  ) : (
                    <span>—</span>
                  )}{" "}
                  από{" "}
                  <strong>{auction.topBidderUsername ?? "άγνωστο χρήστη"}</strong>
                  <br />
                  Short desc: {auction.shortDescription}
                  <br />

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <button type="button" onClick={() => onOpenDetails?.(auction.id)}>
                      Details
                    </button>

                    {alreadyReported ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        Report has been sent ✅
                      </span>
                    ) : (
                      <button type="button" onClick={() => openReportModal(auction)}>
                        Report a problem
                      </button>
                    )}
                  </div>
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

      {/* ----------------------------
          Report a problem modal
         ---------------------------- */}
      {isReportOpen && (
        <div
          onClick={closeReportModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 500,
              maxHeight: 500,
              background: "white",
              borderRadius: 8,
              padding: "1rem",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            }}
          >
            <h2>Report a problem</h2>
            <p style={{ marginTop: 0 }}>
              Auction #{reportAuctionId} — <strong>{reportAuctionTitle}</strong>
            </p>

            {reportError && <p style={{ color: "red" }}>Σφάλμα: {reportError}</p>}

            <div style={{ marginBottom: "0.75rem" }}>
              <label>
                Title:
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
                  disabled={submittingReport}
                />
              </label>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>
                Description:
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
                  disabled={submittingReport}
                />
              </label>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>
                Video (show the issue):
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setReportVideoFile(f);
                  }}
                  style={{ display: "block", marginTop: "0.25rem" }}
                  disabled={submittingReport}
                />
              </label>
            </div>

            {videoPreviewUrl && (
              <div style={{ marginBottom: "0.75rem" }}>
                <video
                  src={videoPreviewUrl}
                  controls
                  preload="metadata"
                  style={{ width: "100%", maxHeight: 100 }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" onClick={submitReport} disabled={submittingReport}>
                {submittingReport ? "Submitting..." : "Submit"}
              </button>
              <button type="button" onClick={closeReportModal} disabled={submittingReport}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWonAuctionsPage;
