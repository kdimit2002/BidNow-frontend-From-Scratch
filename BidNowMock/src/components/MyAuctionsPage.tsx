
// import React, { useEffect, useState } from "react";
// import { getMyAuctions } from "../api/Springboot/backendAuctionService";
// import type {
//   AuctionListItem,
//   SpringPage,
//   AuctionStatus,
// } from "../models/Springboot/Auction";

// type SortBy = "startDate" | "endDate";
// type Direction = "asc" | "desc";

// interface MyAuctionsPageProps {
//   onOpenDetails?: (auctionId: number) => void;
//   onBack?: () => void;
// }

// const MyAuctionsPage: React.FC<MyAuctionsPageProps> = ({
//   onOpenDetails,
//   onBack,
// }) => {
//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] =
//     useState<SpringPage<AuctionListItem> | null>(null);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // filters (type-safe)
//   const [statusGroup, setStatusGroup] = useState<AuctionStatus>("ACTIVE");
//   const [sortBy, setSortBy] = useState<SortBy>("endDate");
//   const [direction, setDirection] = useState<Direction>("desc");

//   const loadMyAuctions = async (pageOverride?: number) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const pageToLoad =
//         typeof pageOverride === "number" ? pageOverride : page;

//       const result = await getMyAuctions({
//         page: pageToLoad,
//         size: 30,
//         sortBy,
//         direction,
//         statusGroup,
//       });

//       setPageData(result);
//       setPage(pageToLoad);
//     } catch (err: unknown) {
//       console.error(err);
//       const message =
//         err instanceof Error
//           ? err.message
//           : "Κάτι πήγε στραβά κατά τη φόρτωση των auctions σου.";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // load on mount + when filters change (reset page)
//   useEffect(() => {
//     loadMyAuctions(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [statusGroup, sortBy, direction]);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     loadMyAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     loadMyAuctions(page + 1);
//   };

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
//       <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
//         {onBack && (
//           <button type="button" onClick={onBack}>
//             ← Back
//           </button>
//         )}
//         <h1 style={{ margin: 0 }}>My Auctions</h1>
//       </div>

//       {/* Filters */}
//       <div
//         style={{
//           marginTop: "12px",
//           padding: "10px",
//           border: "1px solid #ddd",
//           borderRadius: 6,
//           display: "grid",
//           gap: "10px",
//         }}
//       >
//         <label>
//           Status group:
//           <select
//             value={statusGroup}
//             onChange={(e) => setStatusGroup(e.target.value as AuctionStatus)}
//             style={{ marginLeft: "8px" }}
//           >
//             <option value="ACTIVE">ACTIVE</option>
//             <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
//             <option value="EXPIRED">EXPIRED</option>
//             <option value="CANCELLED">CANCELLED</option>
//           </select>
//         </label>

//         <label>
//           Sort by:
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value as SortBy)}
//             style={{ marginLeft: "8px" }}
//           >
//             <option value="endDate">endDate</option>
//             <option value="startDate">startDate</option>
//           </select>
//         </label>

//         <label>
//           Direction:
//           <select
//             value={direction}
//             onChange={(e) => setDirection(e.target.value as Direction)}
//             style={{ marginLeft: "8px" }}
//           >
//             <option value="desc">desc</option>
//             <option value="asc">asc</option>
//           </select>
//         </label>

//         <div>
//           <button type="button" onClick={() => loadMyAuctions(0)} disabled={loading}>
//             {loading ? "Φόρτωση..." : "Reload"}
//           </button>
//         </div>
//       </div>

//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
//       {loading && <p>Φόρτωση...</p>}

//       {pageData && (
//         <div style={{ marginTop: "12px" }}>
//           <p>
//             Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
//             {pageData.totalElements} auctions
//           </p>

//           {pageData.content.length === 0 ? (
//             <p>Δεν υπάρχουν auctions σε αυτή την κατηγορία.</p>
//           ) : (
//             <ul style={{ paddingLeft: "18px" }}>
//               {pageData.content.map((auction) => (
//                 <li key={auction.id} style={{ marginBottom: "14px" }}>
//                   {auction.mainImageUrl && (
//                     <div style={{ marginBottom: "6px" }}>
//                       <img
//                         src={auction.mainImageUrl}
//                         alt={auction.title}
//                         style={{
//                           maxWidth: 180,
//                           maxHeight: 180,
//                           display: "block",
//                         }}
//                       />
//                     </div>
//                   )}

//                   <div>
//                     <strong>{auction.title}</strong> —{" "}
//                     <span>{auction.categoryName}</span> —{" "}
//                     <span>{auction.startingAmount}€</span>
//                   </div>

//                   <div style={{ marginTop: "4px" }}>
//                     <strong>Status:</strong> {auction.status}
//                   </div>

//                   <div>
//                     <strong>Τοποθεσία:</strong>{" "}
//                     {getCityFromLocation(auction.sellerLocation)}
//                   </div>

//                   <div>
//                     <strong>End date:</strong> {auction.endDate}
//                   </div>

//                   <div>
//                     <strong>Min bid increment:</strong> {auction.minBidIncrement}€
//                   </div>

//                   <div>
//                     {auction.topBidAmount != null ? (
//                       <>
//                         <strong>Top bid:</strong> {auction.topBidAmount}€ από{" "}
//                         <strong>{auction.topBidderUsername ?? "άγνωστο"}</strong>
//                       </>
//                     ) : (
//                       <span>Δεν υπάρχουν προσφορές ακόμη.</span>
//                     )}
//                   </div>

//                   <div style={{ marginTop: "4px" }}>
//                     <strong>Short desc:</strong> {auction.shortDescription}
//                   </div>

//                   {onOpenDetails && (
//                     <button
//                       type="button"
//                       style={{ marginTop: "6px" }}
//                       onClick={() => onOpenDetails(auction.id)}
//                     >
//                       Details
//                     </button>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           )}

//           {/* Pagination */}
//           <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
//             <button
//               type="button"
//               onClick={handlePrevPage}
//               disabled={loading || !pageData || pageData.first}
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

// export default MyAuctionsPage;


// src/components/MyAuctionsPage.tsx

import React, { useEffect, useState } from "react";
import { getMyAuctions } from "../api/Springboot/backendAuctionService";
import type {
  AuctionListItem,
  SpringPage,
  AuctionStatus,
} from "../models/Springboot/Auction";

type SortBy = "startDate" | "endDate";
type Direction = "asc" | "desc";

interface MyAuctionsPageProps {
  onOpenDetails?: (auctionId: number) => void; // 👈 όπως AuctionsPage
  onBack?: () => void;
}

const MyAuctionsPage: React.FC<MyAuctionsPageProps> = ({
  onOpenDetails,
  onBack,
}) => {
  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] =
    useState<SpringPage<AuctionListItem> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // filters (type-safe)
  const [statusGroup, setStatusGroup] = useState<AuctionStatus>("ACTIVE");
  const [sortBy, setSortBy] = useState<SortBy>("endDate");
  const [direction, setDirection] = useState<Direction>("desc");

  const loadMyAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad =
        typeof pageOverride === "number" ? pageOverride : page;

      const result = await getMyAuctions({
        page: pageToLoad,
        size: 30,
        sortBy,
        direction,
        statusGroup,
      });

      setPageData(result);
      setPage(pageToLoad);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Κάτι πήγε στραβά κατά τη φόρτωση των auctions σου.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // load on mount + when filters change (reset page)
  useEffect(() => {
    loadMyAuctions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusGroup, sortBy, direction]);

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    loadMyAuctions(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    loadMyAuctions(page + 1);
  };

  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {onBack && (
          <button type="button" onClick={onBack}>
            ← Back
          </button>
        )}
        <h1 style={{ margin: 0 }}>My Auctions</h1>
      </div>

      {/* Filters */}
      <div
        style={{
          marginTop: "12px",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: 6,
          display: "grid",
          gap: "10px",
        }}
      >
        <label>
          Status group:
          <select
            value={statusGroup}
            onChange={(e) => setStatusGroup(e.target.value as AuctionStatus)}
            style={{ marginLeft: "8px" }}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>

        <label>
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{ marginLeft: "8px" }}
          >
            <option value="endDate">endDate</option>
            <option value="startDate">startDate</option>
          </select>
        </label>

        <label>
          Direction:
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            style={{ marginLeft: "8px" }}
          >
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>
        </label>

        <div>
          <button
            type="button"
            onClick={() => loadMyAuctions(0)}
            disabled={loading}
          >
            {loading ? "Φόρτωση..." : "Reload"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
      {loading && <p>Φόρτωση...</p>}

      {pageData && (
        <div style={{ marginTop: "12px" }}>
          <p>
            Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
            {pageData.totalElements} auctions
          </p>

          {pageData.content.length === 0 ? (
            <p>Δεν υπάρχουν auctions σε αυτή την κατηγορία.</p>
          ) : (
            <ul style={{ paddingLeft: "18px" }}>
              {pageData.content.map((auction) => (
                <li key={auction.id} style={{ marginBottom: "14px" }}>
                  {auction.mainImageUrl && (
                    <div style={{ marginBottom: "6px" }}>
                      <img
                        src={auction.mainImageUrl}
                        alt={auction.title}
                        style={{
                          maxWidth: 180,
                          maxHeight: 180,
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <strong>{auction.title}</strong> —{" "}
                    <span>{auction.categoryName}</span> —{" "}
                    <span>{auction.startingAmount}€</span>
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    <strong>Status:</strong> {auction.status}
                  </div>

                  <div>
                    <strong>Τοποθεσία:</strong>{" "}
                    {getCityFromLocation(auction.sellerLocation)}
                  </div>

                  <div>
                    <strong>End date:</strong> {auction.endDate}
                  </div>

                  <div>
                    <strong>Min bid increment:</strong> {auction.minBidIncrement}€
                  </div>

                  <div>
                    {auction.topBidAmount != null ? (
                      <>
                        <strong>Top bid:</strong> {auction.topBidAmount}€ από{" "}
                        <strong>{auction.topBidderUsername ?? "άγνωστο"}</strong>
                      </>
                    ) : (
                      <span>Δεν υπάρχουν προσφορές ακόμη.</span>
                    )}
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    <strong>Short desc:</strong> {auction.shortDescription}
                  </div>

                  {/* ✅ ΝΕΟ: κουμπί Details όπως στο AuctionsPage */}
                  {(statusGroup != "PENDING_APPROVAL" && statusGroup != "CANCELLED")  && onOpenDetails && (
                    <button
                      type="button"
                      style={{ marginTop: "6px" }}
                      onClick={() => onOpenDetails(auction.id)}
                    >
                      Details
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={loading || !pageData || pageData.first}
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

export default MyAuctionsPage;
