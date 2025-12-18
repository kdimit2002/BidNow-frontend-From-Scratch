// // src/components/MyPendingAuctionsPage.tsx

// import React, { useEffect, useState } from "react";
// import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
// import { getMyPendingAuctions } from "../api/Springboot/backendAuctionService";

// interface MyPendingAuctionsPageProps {
//   onBack?: () => void;
// }

// const MyPendingAuctionsPage: React.FC<MyPendingAuctionsPageProps> = ({
//   onBack,
// }) => {
//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] =
//     useState<SpringPage<AuctionListItem> | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [sortBy, setSortBy] = useState<string>("endDate");
//   const [direction, setDirection] = useState<string>("asc");

//   // για real-time time remaining (ανά δευτερόλεπτο)
//   const [now, setNow] = useState<Date>(new Date());
//   useEffect(() => {
//     const id = window.setInterval(() => {
//       setNow(new Date());
//     }, 1000);
//     return () => window.clearInterval(id);
//   }, []);

//   const formatTimeRemaining = (endDateStr: string): string => {
//     const end = new Date(endDateStr);
//     const diffMs = end.getTime() - now.getTime();
//     if (Number.isNaN(diffMs) || diffMs <= 0) {
//       return "Expired";
//     }

//     const totalSeconds = Math.floor(diffMs / 1000);
//     const days = Math.floor(totalSeconds / (24 * 3600));
//     const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;

//     const parts: string[] = [];
//     if (days > 0) parts.push(`${days}d`);
//     if (hours > 0 || days > 0) parts.push(`${hours}h`);
//     if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
//     parts.push(`${seconds}s`);

//     return parts.join(" ");
//   };

//   const loadAuctions = async (pageOverride?: number) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

//       const result = await getMyPendingAuctions({
//         page: pageToLoad,
//         size: 30,
//         sortBy: sortBy || undefined,
//         direction: direction || undefined,
//       });

//       setPageData(result);
//       setPage(pageToLoad);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των pending auctions.";
//       if (err instanceof Error) {
//         message = err.message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Φόρτωσε αυτόματα στην αρχή
//   useEffect(() => {
//     loadAuctions(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     loadAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     loadAuctions(page + 1);
//   };

//   const extractCity = (sellerLocation?: string | null) => {
//     if (!sellerLocation) return "";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
//       <h1>My Pending Auctions</h1>

//       {onBack && (
//         <button
//           type="button"
//           onClick={onBack}
//           style={{ marginBottom: "1rem" }}
//         >
//           ← Back to all auctions
//         </button>
//       )}

//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           loadAuctions(0);
//         }}
//         style={{ marginBottom: "1rem" }}
//       >
//         <div style={{ marginBottom: "0.5rem" }}>
//           <label>
//             Sort By:
//             <input
//               type="text"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               placeholder="π.χ. endDate"
//               style={{ marginLeft: "0.5rem" }}
//             />
//           </label>
//         </div>

//         <div style={{ marginBottom: "0.5rem" }}>
//           <label>
//             Direction:
//             <input
//               type="text"
//               value={direction}
//               onChange={(e) => setDirection(e.target.value)}
//               placeholder="asc / desc"
//               style={{ marginLeft: "0.5rem" }}
//             />
//           </label>
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? "Φόρτωση..." : "Φόρτωσε pending auctions"}
//         </button>
//       </form>

//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

//       {pageData && (
//         <div>
//           <p>
//             Σελίδα {page + 1} από {pageData.totalPages} — Σύνολο{" "}
//             {pageData.totalElements} pending auctions
//            </p>


//           <ul>
//             {pageData.content.map((auction) => {
//               const city = extractCity(auction.sellerLocation);
//               const timeRemaining = formatTimeRemaining(auction.endDate);

//               return (
//                 <li key={auction.id} style={{ marginBottom: "0.75rem" }}>
//                   <strong>{auction.title}</strong> — {auction.categoryName} —{" "}
//                   {auction.startingAmount}€
//                   <br />
//                   Location: {city || "N/A"}
//                   <br />
//                   Min bid increment: {auction.minBidIncrement}€
//                   <br />
//                   Time remaining: {timeRemaining}
//                   <br />
//                   Status: {auction.status} {/* εδώ θα είναι PENDING_APPROVAL */}
//                   <br />
//                   Short desc: {auction.shortDescription}
//                 </li>
//               );
//             })}
//           </ul>

//           <div style={{ marginTop: "1rem" }}>
//             <button
//               type="button"
//               onClick={handlePrevPage}
//               disabled={loading || !pageData || pageData.first}
//               style={{ marginRight: "0.5rem" }}
//             >
//               Προηγούμενη
//             </button>
//             <button
//               type="button"
//               onClick={handleNextPage}
//               disabled={loading || !pageData || pageData.last}
//             >
//               Επόμενη
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyPendingAuctionsPage;


// src/components/MyPendingAuctionsPage.tsx

import React, { useEffect, useState } from "react";
import type {
  AuctionListItem,
  SpringPage,
  VerificationStatus,
  VerificationInstructionCode,
} from "../models/Springboot/Auction";
import { getMyPendingAuctions } from "../api/Springboot/backendAuctionService";
import { uploadVerificationVideo } from "../api/Springboot/backendVerificationService";

type SortDirection = "asc" | "desc";

// Αν το backend επιστρέφει verificationStatus μαζί με το list item, το κρατάμε optional
type AuctionWithVerification = AuctionListItem & {
  verificationStatus?: VerificationStatus;
  verificationVideoUrl?: string | null;
};

interface MyPendingAuctionsPageProps {
  onBack?: () => void;
}

// Τοπικός τύπος για οδηγίες verification
interface LocalVerificationInstruction {
  code: VerificationInstructionCode;
  maxDurationSeconds: number;
  text: string;
}

const makeInstructionText = (durationText: string): string =>
  `Στείλε ένα βίντεο διάρκειας ${durationText} που να δείχνει ξεκάθαρα ότι το προϊόν είναι αυθεντικό και λειτουργεί κανονικά.

• Αν πρόκειται για ηλεκτρονική συσκευή (π.χ. PC, κονσόλα, κινητό), άνοιξε μερικές εφαρμογές ή παιχνίδια και δείξε την οθόνη σε λειτουργία.
• Αν πρόκειται για συλλεκτικό αντικείμενο, δείξε το προϊόν από όλες τις πλευρές (μπροστά, πίσω, πάνω, κάτω) και κάνε κοντινά στα σημαντικά σημεία, τυχόν σειριακούς αριθμούς ή σημάδια φθοράς.
• Φρόντισε ο φωτισμός και ο ήχος να είναι όσο γίνεται καθαρά.`;

const VERIFICATION_INSTRUCTIONS: LocalVerificationInstruction[] = [
  { code: "VID_20S", maxDurationSeconds: 20, text: makeInstructionText("20 δευτερόλεπτα") },
  { code: "VID_30S", maxDurationSeconds: 30, text: makeInstructionText("30 δευτερόλεπτα") },
  { code: "VID_40S", maxDurationSeconds: 40, text: makeInstructionText("40 δευτερόλεπτα") },
  { code: "VID_50S", maxDurationSeconds: 50, text: makeInstructionText("50 δευτερόλεπτα") },
  { code: "VID_60S", maxDurationSeconds: 60, text: makeInstructionText("1 λεπτό") },
];

function pickRandomInstruction(): LocalVerificationInstruction {
  const idx = Math.floor(Math.random() * VERIFICATION_INSTRUCTIONS.length);
  return VERIFICATION_INSTRUCTIONS[idx];
}

const MyPendingAuctionsPage: React.FC<MyPendingAuctionsPageProps> = ({ onBack }) => {
  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] = useState<SpringPage<AuctionWithVerification> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sort state
  const [sortBy, setSortBy] = useState<string>("endDate");
  const [direction, setDirection] = useState<SortDirection>("asc");

  // real-time time remaining
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // ---------- Verification state ----------
  const [verifyingAuctionId, setVerifyingAuctionId] = useState<number | null>(null);
  const [verificationInstruction, setVerificationInstruction] =
    useState<LocalVerificationInstruction | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // optimistic map (για να φαίνεται άμεσα PENDING_REVIEW μετά από upload)
  const [optimisticVerificationStatus, setOptimisticVerificationStatus] =
    useState<Record<number, VerificationStatus>>({});

  const formatTimeRemaining = (endDateStr: string): string => {
    const end = new Date(endDateStr);
    const diffMs = end.getTime() - now.getTime();

    if (Number.isNaN(end.getTime()) || diffMs <= 0) return "Expired";

    let totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds -= days * 24 * 3600;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  };

  const formatVerificationStatus = (status: VerificationStatus): string => {
    switch (status) {
      case "NOT_VERIFIED":
        return "Not verified";
      case "PENDING_REVIEW":
        return "Pending review";
      case "VERIFIED":
        return "Verified ✅";
      case "REJECTED":
        return "Rejected ❌";
      default:
        return status;
    }
  };

  const extractCity = (sellerLocation: string): string => {
    const parts = sellerLocation.split(",").map((p) => p.trim());
    if (parts.length === 0) return "";
    return parts[0] ?? "";
  };

  const loadAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

      // NOTE: Αν η getMyPendingAuctions είναι typed ως SpringPage<AuctionListItem>,
      // μπορείς να την αλλάξεις να επιστρέφει SpringPage<AuctionWithVerification>.
      const result = await getMyPendingAuctions({
        page: pageToLoad,
        size: 30,
        sortBy: sortBy || undefined,
        direction: direction || undefined,
      });

      setPageData(result as SpringPage<AuctionWithVerification>);
      setPage(pageToLoad);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Κάτι πήγε στραβά στο backend.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // αρχικό load
  useEffect(() => {
    void loadAuctions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplySort = () => {
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

  // ---------- Verification handlers ----------
  const handleStartVerification = (auctionId: number) => {
    const instr = pickRandomInstruction();

    setVerifyingAuctionId(auctionId);
    setVerificationInstruction(instr);
    setVerificationFile(null);

    setVerificationError(null);
    setVerificationMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setVerificationFile(file);
  };

  const handleUploadVerification = async () => {
    if (verifyingAuctionId === null || verificationInstruction === null) return;

    if (verificationFile === null) {
      setVerificationError("Επίλεξε πρώτα ένα video αρχείο.");
      return;
    }

    setVerificationLoading(true);
    setVerificationError(null);
    setVerificationMessage(null);

    try {
      await uploadVerificationVideo(
        verifyingAuctionId,
        verificationInstruction.code,
        verificationFile
      );

      setVerificationMessage(
        "Το βίντεο ανέβηκε επιτυχώς. Η δημοπρασία σου θα ελεγχθεί από τον διαχειριστή."
      );

      setOptimisticVerificationStatus((prev) => ({
        ...prev,
        [verifyingAuctionId]: "PENDING_REVIEW",
      }));

      setVerifyingAuctionId(null);
      setVerificationInstruction(null);
      setVerificationFile(null);

      void loadAuctions(page);
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Κάτι πήγε στραβά κατά το upload του βίντεο.";
      setVerificationError(msg);
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 950, margin: "0 auto", padding: "1rem" }}>
      <h1>My Pending Auctions</h1>

      {onBack && (
        <button type="button" onClick={onBack} style={{ marginBottom: "1rem" }}>
          ← Back
        </button>
      )}

      {/* Sort controls */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <label>
          Sort by:{" "}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="endDate">End date</option>
            <option value="startingAmount">Starting amount</option>
            <option value="minBidIncrement">Min bid increment</option>
            <option value="title">Title</option>
          </select>
        </label>

        <label>
          Direction:{" "}
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value === "desc" ? "desc" : "asc")}
          >
            <option value="asc">ASC</option>
            <option value="desc">DESC</option>
          </select>
        </label>

        <button type="button" onClick={handleApplySort} disabled={loading}>
          {loading ? "Loading..." : "Apply sort"}
        </button>

        <button type="button" onClick={() => loadAuctions(page)} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {pageData && (
        <div>
          <p>
            Σελίδα {page + 1} από {pageData.totalPages} — Σύνολο{" "}
            {pageData.totalElements} pending auctions
          </p>

          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {pageData.content.map((auction) => {
              const city = extractCity(auction.sellerLocation);
              const timeRemaining = formatTimeRemaining(auction.endDate);

              const verificationStatus: VerificationStatus =
                auction.verificationStatus ??
                optimisticVerificationStatus[auction.id] ??
                "NOT_VERIFIED";

              const canStartVerification =
                verificationStatus === "NOT_VERIFIED" || verificationStatus === "REJECTED";

              const isThisVerifying = verifyingAuctionId === auction.id;

              return (
                <li
                  key={auction.id}
                  style={{
                    marginBottom: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: "0.75rem",
                    display: "flex",
                    gap: "0.75rem",
                  }}
                >
                  {/* Image */}
                  <div style={{ minWidth: 180 }}>
                    {auction.mainImageUrl ? (
                      <img
                        src={auction.mainImageUrl}
                        alt={auction.title}
                        style={{ width: 180, height: 140, objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 180,
                          height: 140,
                          border: "1px dashed #ccc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#888",
                          borderRadius: 4,
                        }}
                      >
                        No image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                      <div>
                        <strong style={{ fontSize: "1.05rem" }}>{auction.title}</strong>
                        <div style={{ color: "#555" }}>
                          {auction.categoryName} — {auction.startingAmount}€
                        </div>
                      </div>

                      <div style={{ textAlign: "right", color: "#555" }}>
                        <div>Location: {city || "N/A"}</div>
                        <div>Time remaining: {timeRemaining}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: "0.25rem" }}>
                      Min bid increment: <strong>{auction.minBidIncrement}€</strong>
                    </div>

                    <div style={{ marginTop: "0.25rem" }}>
                      Status: <strong>{auction.status}</strong>
                    </div>

                    <div style={{ marginTop: "0.25rem" }}>
                      Short desc: {auction.shortDescription}
                    </div>

                    <hr style={{ margin: "0.75rem 0" }} />

                    {/* Verification */}
                    <div>
                      Verification status:{" "}
                      <strong>{formatVerificationStatus(verificationStatus)}</strong>
                      {verificationStatus === "PENDING_REVIEW" && (
                        <span style={{ marginLeft: "0.5rem", color: "#555" }}>
                          (υπό έλεγχο)
                        </span>
                      )}
                    </div>

                    {canStartVerification && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <button type="button" onClick={() => handleStartVerification(auction.id)}>
                          {verificationStatus === "REJECTED"
                            ? "Re-upload verification video"
                            : "Start verification"}
                        </button>

                        {isThisVerifying && verificationInstruction && (
                          <div
                            style={{
                              marginTop: "0.5rem",
                              padding: "0.75rem",
                              border: "1px dashed #bbb",
                              borderRadius: 6,
                            }}
                          >
                            <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>
                              {verificationInstruction.text}
                            </p>

                            <p style={{ fontStyle: "italic", marginTop: 0 }}>
                              Μέγιστη διάρκεια: {verificationInstruction.maxDurationSeconds}s
                            </p>

                            <label>
                              Διάλεξε αρχείο βίντεο:
                              <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                style={{ display: "block", marginTop: "0.25rem" }}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={handleUploadVerification}
                              disabled={verificationLoading || verificationFile === null}
                              style={{ marginTop: "0.5rem" }}
                            >
                              {verificationLoading ? "Uploading..." : "Upload verification video"}
                            </button>

                            {verificationError && (
                              <p style={{ color: "red", marginTop: "0.5rem" }}>
                                {verificationError}
                              </p>
                            )}
                            {verificationMessage && (
                              <p style={{ color: "green", marginTop: "0.5rem" }}>
                                {verificationMessage}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {!canStartVerification && verificationStatus === "VERIFIED" && (
                      <p style={{ marginTop: "0.5rem", color: "green", fontWeight: 700 }}>
                        Verified ✅
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
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
