// // src/components/AdminPendingAuctionsPage.tsx

// import React, { useEffect, useState } from "react";
// import type { AuctionDetails } from "../../models/Springboot/Auction";
// import { approveAuction,getAdminPendingAuctions} from "../../api/admin/backendAdminAuctionService";

// interface AdminPendingAuctionsPageProps {
//   onBack?: () => void;
// }

// const AdminPendingAuctionsPage: React.FC<AdminPendingAuctionsPageProps> = ({
//   onBack,
// }) => {
//   const [auctions, setAuctions] = useState<AuctionDetails[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   useEffect(() => {
//     void loadPending();
//   }, []);

//   const loadPending = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const result = await getAdminPendingAuctions();
//       setAuctions(result);
//     } catch (err: unknown) {
//       console.error(err);
//       let msg = "Κάτι πήγε στραβά κατά τη φόρτωση των pending auctions.";
//       if (err instanceof Error) msg = err.message;
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async (auctionId: number) => {
//   if (!window.confirm("Σίγουρα θέλεις να εγκρίνεις αυτή τη δημοπρασία;")) {
//     return;
//   }

//   try {
//     await approveAuction(auctionId);          // ✅ τώρα δεν σκάει

//     // 🔹 Εξαφανίζεται αμέσως από τη λίστα
//     setAuctions((prev) => prev.filter((a) => a.id !== auctionId));

//     // 🔹 Μήνυμα επιτυχίας
//     setError(null);
//     setSuccess(`Η δημοπρασία #${auctionId} εγκρίθηκε με επιτυχία.`);

//     // προαιρετικά: κρύψε το μήνυμα μετά από 4s
//     window.setTimeout(() => {
//       setSuccess(null);
//     }, 4000);
//   } catch (err: unknown) {
//     console.error(err);
//     let msg = "Κάτι πήγε στραβά κατά την έγκριση.";
//     if (err instanceof Error) msg = err.message;
//     setSuccess(null);
//     setError(msg);
//   }
//   };

//   const formatDateTime = (iso: string): string => {
//     if (!iso) return "-";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     return d.toLocaleString();
//   };

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   return (
//     <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
//       <div style={{ marginBottom: "1rem" }}>
//         <button type="button" onClick={onBack}>
//           ← Back to all auctions
//         </button>
//       </div>

//       <h1>Admin – Pending Auctions</h1>

//       {loading && <p>Φόρτωση...</p>}
//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
//       {success && <p style={{ color: "green" }}>{success}</p>}

//       {!loading && auctions.length === 0 && (
//         <p>Δεν υπάρχουν δημοπρασίες σε κατάσταση PENDING_APPROVAL.</p>
//       )}

//       <ul style={{ listStyle: "none", paddingLeft: 0 }}>
//         {auctions.map((auction) => (
//           <li
//             key={auction.id}
//             style={{
//               marginBottom: "1.5rem",
//               border: "1px solid #ddd",
//               borderRadius: 4,
//               padding: "1rem",
//               display: "flex",
//               gap: "1rem",
//             }}
//           >
//             {/* Εικόνες */}
//             <div style={{ minWidth: 220 }}>
//               {auction.imageUrls && auction.imageUrls.length > 0 ? (
//                 <>
//                   {/* Κύρια εικόνα */}
//                   <img
//                     src={auction.imageUrls[0]}
//                     alt={auction.title}
//                     style={{
//                       maxWidth: 220,
//                       maxHeight: 220,
//                       display: "block",
//                       marginBottom: "0.5rem",
//                     }}
//                   />
//                   {/* Μικρά thumbnails για τις υπόλοιπες */}
//                   {auction.imageUrls.length > 1 && (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexWrap: "wrap",
//                         gap: "0.25rem",
//                       }}
//                     >
//                       {auction.imageUrls.slice(1).map((url, idx) => (
//                         <img
//                           key={idx}
//                           src={url}
//                           alt={`Extra image ${idx + 2}`}
//                           style={{
//                             width: 60,
//                             height: 60,
//                             objectFit: "cover",
//                             border: "1px solid #ccc",
//                           }}
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <p>Δεν υπάρχουν εικόνες.</p>
//               )}
//             </div>

//             {/* Λεπτομέρειες δημοπρασίας */}
//             <div style={{ flex: 1 }}>
//               <h3>
//                 {auction.title} — {auction.categoryName} —{" "}
//                 {auction.startingAmount}€
//               </h3>

//               <p>
//                 Πωλητής: <strong>{auction.sellerUsername}</strong> (
//                 {getCityFromLocation(auction.sellerLocation)})
//               </p>

//               <p>
//                 Κατάσταση: <strong>{auction.status}</strong>
//               </p>

//               <p>
//                 Starting amount: <strong>{auction.startingAmount}€</strong>
//               </p>

//               <p>
//                 Min bid increment: <strong>{auction.minBidIncrement}€</strong>
//               </p>

//               <p>
//                 Από: <strong>{formatDateTime(auction.startDate)}</strong> έως:{" "}
//                 <strong>{formatDateTime(auction.endDate)}</strong>
//               </p>

//               <p style={{ marginTop: "0.5rem" }}>
//                 <strong>Short description:</strong> {auction.shortDescription}
//               </p>

//               <p>
//                 <strong>Full description:</strong> {auction.description}
//               </p>

//               {auction.shippingCostPayer && (
//                 <p>
//                   <strong>Ποιος πληρώνει τα μεταφορικά:</strong>{" "}
//                   {auction.shippingCostPayer}
//                 </p>
//               )}

//               {/* Bids */}
//               <div style={{ marginTop: "0.75rem" }}>
//                 <h4>Bids</h4>
//                 {auction.bids.length === 0 ? (
//                   <p>Δεν υπάρχουν bids ακόμη.</p>
//                 ) : (
//                   <ul>
//                     {auction.bids.map((b) => (
//                       <li key={b.id}>
//                         {b.amount}€ από {b.bidderUsername} ({b.createdAt})
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {/* Chat messages */}
//               <div style={{ marginTop: "0.75rem" }}>
//                 <h4>Chat messages</h4>
//                 {auction.chat.length === 0 ? (
//                   <p>Δεν υπάρχουν μηνύματα στο chat.</p>
//                 ) : (
//                   <ul>
//                     {auction.chat.map((m) => (
//                       <li key={m.id}>
//                         <strong>{m.senderDisplayName}</strong>: {m.content} (
//                         {m.createdAt})
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               <div style={{ marginTop: "1rem" }}>
//                 <button
//                   type="button"
//                   onClick={() => handleApprove(auction.id)}
//                 >
//                   Approve
//                 </button>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default AdminPendingAuctionsPage;


// src/admin/components/AdminPendingAuctionsPage.tsx

import React, { useEffect, useState } from "react";
import type { AuctionDetails } from "../../models/Springboot/Auction";
import {
  approveAuction,
  getAdminPendingAuctions,
  cancelAuction,
} from "../../api/admin/backendAdminAuctionService";

interface AdminPendingAuctionsPageProps {
  onBack?: () => void;
}

const AdminPendingAuctionsPage: React.FC<AdminPendingAuctionsPageProps> = ({
  onBack,
}) => {
  const [auctions, setAuctions] = useState<AuctionDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPending = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await getAdminPendingAuctions();
      setAuctions(result);
    } catch (err) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά κατά τη φόρτωση των pending auctions.";
      if (err instanceof Error) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (auctionId: number) => {
    if (!window.confirm("Σίγουρα θέλεις να εγκρίνεις αυτή τη δημοπρασία;")) {
      return;
    }

    try {
      await approveAuction(auctionId);

      setAuctions((prev) => prev.filter((a) => a.id !== auctionId));

      setError(null);
      setSuccess(`Η δημοπρασία #${auctionId} εγκρίθηκε με επιτυχία.`);

      window.setTimeout(() => {
        setSuccess(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά κατά την έγκριση.";
      if (err instanceof Error) msg = err.message;
      setSuccess(null);
      setError(msg);
    }
  };

  const handleCancel = async (auctionId: number) => {
    if (!window.confirm("Σίγουρα θέλεις να ακυρώσεις αυτή τη δημοπρασία;")) {
      return;
    }

    try {
      await cancelAuction(auctionId);

      setAuctions((prev) => prev.filter((a) => a.id !== auctionId));

      setError(null);
      setSuccess(`Η δημοπρασία #${auctionId} ακυρώθηκε με επιτυχία.`);

      window.setTimeout(() => {
        setSuccess(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά κατά την ακύρωση.";
      if (err instanceof Error) msg = err.message;
      setSuccess(null);
      setError(msg);
    }
  };

  const formatDateTime = (iso: string): string => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <button type="button" onClick={onBack}>
          ← Back to all auctions
        </button>
      </div>

      <h1>Admin – Pending Auctions</h1>

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {!loading && auctions.length === 0 && (
        <p>Δεν υπάρχουν δημοπρασίες σε κατάσταση PENDING_APPROVAL.</p>
      )}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {auctions.map((auction) => (
          <li
            key={auction.id}
            style={{
              marginBottom: "1.5rem",
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: "1rem",
              display: "flex",
              gap: "1rem",
            }}
          >
            {/* Εικόνες */}
            <div style={{ minWidth: 220 }}>
              {auction.imageUrls && auction.imageUrls.length > 0 ? (
                <>
                  {/* Κύρια εικόνα */}
                  <img
                    src={auction.imageUrls[0]}
                    alt={auction.title}
                    style={{
                      maxWidth: 220,
                      maxHeight: 220,
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  />
                  {/* Μικρά thumbnails για τις υπόλοιπες */}
                  {auction.imageUrls.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.25rem",
                      }}
                    >
                      {auction.imageUrls.slice(1).map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Extra image ${idx + 2}`}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            border: "1px solid #ccc",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p>Δεν υπάρχουν εικόνες.</p>
              )}
            </div>

            {/* Λεπτομέρειες δημοπρασίας */}
            <div style={{ flex: 1 }}>
              <h3>
                {auction.title} — {auction.categoryName} —{" "}
                {auction.startingAmount}€
              </h3>

              <p>
                Πωλητής: <strong>{auction.sellerUsername}</strong> (
                {getCityFromLocation(auction.sellerLocation)})
              </p>

              <p>
                Κατάσταση: <strong>{auction.status}</strong>
              </p>

              <p>
                Starting amount: <strong>{auction.startingAmount}€</strong>
              </p>

              <p>
                Min bid increment: <strong>{auction.minBidIncrement}€</strong>
              </p>

              <p>
                Από: <strong>{formatDateTime(auction.startDate)}</strong> έως:{" "}
                <strong>{formatDateTime(auction.endDate)}</strong>
              </p>

              <p style={{ marginTop: "0.5rem" }}>
                <strong>Short description:</strong> {auction.shortDescription}
              </p>

              <p>
                <strong>Full description:</strong> {auction.description}
              </p>

              {auction.shippingCostPayer && (
                <p>
                  <strong>Ποιος πληρώνει τα μεταφορικά:</strong>{" "}
                  {auction.shippingCostPayer}
                </p>
              )}

              {/* Bids */}
              <div style={{ marginTop: "0.75rem" }}>
                <h4>Bids</h4>
                {auction.bids.length === 0 ? (
                  <p>Δεν υπάρχουν bids ακόμη.</p>
                ) : (
                  <ul>
                    {auction.bids.map((b) => (
                      <li key={b.id}>
                        {b.amount}€ από {b.bidderUsername} ({b.createdAt})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Chat messages */}
              <div style={{ marginTop: "0.75rem" }}>
                <h4>Chat messages</h4>
                {auction.chat.length === 0 ? (
                  <p>Δεν υπάρχουν μηνύματα στο chat.</p>
                ) : (
                  <ul>
                    {auction.chat.map((m) => (
                      <li key={m.id}>
                        <strong>{m.senderDisplayName}</strong>: {m.content} (
                        {m.createdAt})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Actions */}
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleApprove(auction.id)}
                >
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() => handleCancel(auction.id)}
                  style={{
                    backgroundColor: "#fee2e2",
                    borderColor: "#dc2626",
                    color: "#b91c1c",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPendingAuctionsPage;
