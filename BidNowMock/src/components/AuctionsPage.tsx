// // src/components/AuctionsPage.tsx

// import React, { useState, useEffect, useRef } from "react";
// import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
// import { getAuctions } from "../api/Springboot/backendAuctionService";
// import { placeBid } from "../api/Springboot/BackendBidService";

// import { Client } from "@stomp/stompjs";
// import type {
//   IMessage,
//   StompSubscription,
//   IStompSocket,
// } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// // 👇 ΝΕΟ: service για categories
// import {
//   getCategories,
//   type CategoryDto,
// } from "../api/Springboot/backendCategoryService";

// interface AuctionsPageProps {
//   onOpenDetails?: (auctionId: number) => void;
// }

// // DTO που στέλνει το backend στο /topic/auctions/{id}
// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
// }

// const AuctionsPage: React.FC<AuctionsPageProps> = ({ onOpenDetails }) => {
//   const [search, setSearch] = useState<string>("");
//   const [categoryId, setCategoryId] = useState<string>(""); // κρατάμε id ως string
//   const [sortBy, setSortBy] = useState<string>("");
//   const [direction, setDirection] = useState<string>("");
//   const [region, setRegion] = useState<string>("");
//   const [country, setCountry] = useState<string>("");

//   const [expiredLast7Days, setExpiredLast7Days] = useState<boolean>(false);

//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] =
//     useState<SpringPage<AuctionListItem> | null>(null);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // 🔹 Bid feedback (success / error)
//   const [bidMessage, setBidMessage] = useState<string | null>(null);
//   const [bidMessageType, setBidMessageType] =
//     useState<"success" | "error" | null>(null);

//   // 🔹 Τι πληκτρολογεί ο χρήστης για κάθε auction (input ποσού)
//   const [bidInputs, setBidInputs] = useState<Record<number, string>>({});

//   // 🔹 ΝΕΟ: λίστα κατηγοριών (id + name)
//   const [categories, setCategories] = useState<CategoryDto[]>([]);

//   // real-time countdown
//   const [now, setNow] = useState<Date>(new Date());

//   // STOMP client + subscriptions
//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const subscriptionsRef = useRef<Record<number, StompSubscription>>({});

//   // ⏱ update "now" κάθε 1s
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setNow(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // 👇 Φόρτωση κατηγοριών ΜΙΑ φορά
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const data = await getCategories();
//         setCategories(data);
//       } catch (err) {
//         console.error("Failed to load categories", err);
//       }
//     };
//     loadCategories();
//   }, []);

//   // 🧠 WebSocket/STOMP σύνδεση ΜΙΑ φορά
//   useEffect(() => {
//     const socket = new SockJS("http://localhost:8080/ws");
//     const client = new Client({
//       webSocketFactory: () => socket as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {
//         // βάλε console.log αν θες logs
//       },
//     });

//     client.onConnect = () => {
//       console.log("STOMP connected");
//       setStompClient(client);
//     };

//     client.onStompError = (frame) => {
//       console.error("STOMP error:", frame.headers["message"], frame.body);
//     };

//     client.activate();

//     return () => {
//       Object.values(subscriptionsRef.current).forEach((sub) => sub.unsubscribe());
//       subscriptionsRef.current = {};
//       client.deactivate();
//     };
//   }, []);

//   // 🧠 Subscribe στα topics των auctions της τρέχουσας σελίδας
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected || !pageData) {
//       return;
//     }

//     const subs = subscriptionsRef.current;
//     const currentIds = new Set(pageData.content.map((a) => a.id));

//     pageData.content.forEach((auction) => {
//       if (subs[auction.id]) return;

//       const destination = `/topic/auctions/${auction.id}`;
//       const sub = stompClient.subscribe(
//         destination,
//         (message: IMessage) => {
//           try {
//             const payload: BidEventDto = JSON.parse(message.body);

//             setPageData((prev) => {
//               if (!prev) return prev;
//               if (!prev.content.some((a) => a.id === payload.auctionId)) {
//                 return prev;
//               }

//               return {
//                 ...prev,
//                 content: prev.content.map((a) =>
//                   a.id === payload.auctionId
//                     ? {
//                         ...a,
//                         topBidAmount: payload.amount,
//                         topBidderUsername: payload.bidderUsername,
//                         endDate: payload.newEndDate,
//                       }
//                     : a
//                 ),
//               };
//             });
//           } catch (err) {
//             console.error("Failed to parse BidEventDto", err);
//           }
//         }
//       );

//       subs[auction.id] = sub;
//     });

//     // Unsubscribe για auctions που δεν είναι πια στη σελίδα
//     Object.entries(subs).forEach(([idStr, sub]) => {
//       const id = Number(idStr);
//       if (!currentIds.has(id)) {
//         sub.unsubscribe();
//         delete subs[id];
//       }
//     });
//   }, [stompClient, pageData]);

//   const loadAuctions = async (pageOverride?: number) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

//       const result = await getAuctions({
//         search,
//         sortBy: sortBy || undefined,
//         direction: direction || undefined,
//         region: region || undefined,
//         country: country || undefined,
//         categoryId: categoryId ? Number(categoryId) : undefined,
//         page: pageToLoad,
//         expiredLast7Days,
//       });

//       setPageData(result);
//       setPage(pageToLoad);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των auctions.";
//       if (err instanceof Error) {
//         message = err.message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit: React.FormEventHandler = (e) => {
//     e.preventDefault();
//     loadAuctions(0);
//   };

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     loadAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     loadAuctions(page + 1);
//   };

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
//     const end = new Date(endDateIso);
//     const diffMs = end.getTime() - nowValue.getTime();

//     if (Number.isNaN(end.getTime())) {
//       return endDateIso;
//     }

//     if (diffMs <= 0) {
//       return "Έληξε";
//     }

//     let totalSeconds = Math.floor(diffMs / 1000);

//     const days = Math.floor(totalSeconds / (24 * 3600));
//     totalSeconds -= days * 24 * 3600;

//     const hours = Math.floor(totalSeconds / 3600);
//     totalSeconds -= hours * 3600;

//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds - minutes * 60;

//     if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
//     if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
//     if (minutes > 0) return `${minutes}m ${seconds}s`;
//     return `${seconds}s`;
//   };

//   const isAuctionActive = (endDateIso: string, nowValue: Date): boolean => {
//     const end = new Date(endDateIso);
//     if (Number.isNaN(end.getTime())) return false;
//     return end.getTime() - nowValue.getTime() > 0;
//   };

//   const showBidMessage = (type: "success" | "error", message: string) => {
//     setBidMessageType(type);
//     setBidMessage(message);
//     setTimeout(() => {
//       setBidMessage(null);
//       setBidMessageType(null);
//     }, 5000);
//   };

//   const handleBidClick = async (auction: AuctionListItem) => {
//     const raw = bidInputs[auction.id];

//     if (!raw || raw.trim() === "") {
//       window.alert("Συμπλήρωσε ποσό προσφοράς.");
//       return;
//     }

//     const amount = Number(raw);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       window.alert("Μη έγκυρο ποσό.");
//       return;
//     }

//     try {
//       await placeBid(auction.id, amount);

//       // 🔹 Optimistic update
//       setPageData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           content: prev.content.map((a) =>
//             a.id === auction.id
//               ? {
//                   ...a,
//                   topBidAmount:
//                     a.topBidAmount != null && a.topBidAmount > amount
//                       ? a.topBidAmount
//                       : amount,
//                 }
//               : a
//           ),
//         };
//       });

//       // καθάρισε το input
//       setBidInputs((prev) => ({ ...prev, [auction.id]: "" }));

//       showBidMessage("success", "Η προσφορά καταχωρήθηκε με επιτυχία!");
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά την προσφορά.";
//       if (err instanceof Error && err.message) {
//         message = err.message;
//       }
//       showBidMessage("error", message);
//     }
//   };

//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
//       <h1>Auctions</h1>

//       {/* 🔹 Μήνυμα για bid (success / error) */}
//       {bidMessage && (
//         <p
//           style={{
//             color: bidMessageType === "error" ? "red" : "green",
//             fontWeight: "bold",
//           }}
//         >
//           {bidMessage}
//         </p>
//       )}

//       <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
//         <div style={{ marginBottom: "0.5rem" }}>
//           <label>
//             Search:
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               style={{ marginLeft: "0.5rem" }}
//             />
//           </label>
//         </div>

//         {/* 👇 Dropdown με ονόματα κατηγοριών, αλλά value = id */}
//         <div style={{ marginBottom: "0.5rem" }}>
//           <label>
//             Category:
//             <select
//               value={categoryId}
//               onChange={(e) => setCategoryId(e.target.value)}
//               style={{ marginLeft: "0.5rem" }}
//             >
//               <option value="">All categories</option>
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.id.toString()}>
//                   {cat.name}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>

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

//         <div style={{ marginBottom: "0.5rem" }}>
//           <label>
//             Region:
//             <input
//               type="text"
//               value={region}
//               onChange={(e) => setRegion(e.target.value)}
//               placeholder="π.χ. NICOSIA"
//               style={{ marginLeft: "0.5rem" }}
//             />
//           </label>
//         </div>

//         <div style={{ marginBottom: "0.5rem" }}>
//           <label>
//             Country:
//             <input
//               type="text"
//               value={country}
//               onChange={(e) => setCountry(e.target.value)}
//               placeholder="π.χ. Cyprus"
//               style={{ marginLeft: "0.5rem" }}
//             />
//           </label>
//         </div>

//         <div style={{ marginBottom: "0.5rem" }}>
//           <label>
//             Expired last 7 days:
//             <input
//               type="checkbox"
//               checked={expiredLast7Days}
//               onChange={(e) => setExpiredLast7Days(e.target.checked)}
//               style={{ marginLeft: "0.5rem" }}
//             />
//           </label>
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? "Φόρτωση..." : "Φόρτωσε Auctions"}
//         </button>
//       </form>

//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

//       {pageData && (
//         <div>
//           <p>
//             Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
//             {pageData.totalElements} auctions
//           </p>

//           <ul>
//             {pageData.content.map((auction) => {
//               const canBid =
//                 auction.eligibleForBid && isAuctionActive(auction.endDate, now);

//               return (
//                 <li key={auction.id} style={{ marginBottom: "0.75rem" }}>
//                   {/* Main image αν υπάρχει */}
//                   main image:{" "}
//                   {auction.mainImageUrl && (
//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <img
//                         src={auction.mainImageUrl}
//                         alt={auction.title}
//                         style={{
//                           maxWidth: 200,
//                           maxHeight: 200,
//                           display: "block",
//                         }}
//                       />
//                     </div>
//                   )}

//                   <strong>{auction.title}</strong> — {auction.categoryName} —{" "}
//                   {auction.startingAmount}€
//                   <br />
//                   Τοποθεσία: {getCityFromLocation(auction.sellerLocation)}
//                   <br />
//                   Χρόνος που απομένει:{" "}
//                   {formatTimeRemaining(auction.endDate, now)}
//                   <br />
//                   Ελάχιστη αύξηση προσφοράς: {auction.minBidIncrement}€
//                   <br />
//                   {auction.topBidAmount != null ? (
//                     <span>
//                       Τρέχουσα υψηλότερη προσφορά:{" "}
//                       <strong>{auction.topBidAmount}€</strong> από{" "}
//                       <strong>
//                         {auction.topBidderUsername ?? "άγνωστο χρήστη"}
//                       </strong>
//                     </span>
//                   ) : (
//                     <span>Δεν υπάρχουν προσφορές ακόμη.</span>
//                   )}
//                   <br />
//                   Short desc: {auction.shortDescription}
//                   <br />
//                   {canBid && (
//                     <div
//                       style={{
//                         marginTop: "0.25rem",
//                         display: "flex",
//                         gap: "0.5rem",
//                         alignItems: "center",
//                       }}
//                     >
//                       <input
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         placeholder="Ποσό (€)"
//                         value={bidInputs[auction.id] ?? ""}
//                         onChange={(e) =>
//                           setBidInputs((prev) => ({
//                             ...prev,
//                             [auction.id]: e.target.value,
//                           }))
//                         }
//                         style={{ width: "100px" }}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => handleBidClick(auction)}
//                       >
//                         Bid
//                       </button>
//                     </div>
//                   )}
//                   <button
//                     type="button"
//                     style={{ marginTop: "0.25rem", marginLeft: "0.5rem" }}
//                     onClick={() => onOpenDetails?.(auction.id)}
//                   >
//                     Details
//                   </button>
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

// export default AuctionsPage;


// src/components/AuctionsPage.tsx

import React, { useState, useEffect, useRef } from "react";
import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
import { getAuctions } from "../api/Springboot/backendAuctionService";
import { placeBid } from "../api/Springboot/BackendBidService";

import { Client } from "@stomp/stompjs";
import type {
  IMessage,
  StompSubscription,
  IStompSocket,
} from "@stomp/stompjs";
import SockJS from "sockjs-client";

// 👇 ΝΕΟ: AuthUser τύπος
import type { AuthUserDto } from "../models/Springboot/UserEntity";

// 👇 ΝΕΟ: service για categories
import {
  getCategories,
  type CategoryDto,
} from "../api/Springboot/backendCategoryService";

interface AuctionsPageProps {
  onOpenDetails?: (auctionId: number) => void;
  currentUser: AuthUserDto | null;
  onOpenUserDetailsAsAdmin?: (username: string) => void;
}

// DTO που στέλνει το backend στο /topic/auctions/{id}
interface BidEventDto {
  id: number;
  amount: number;
  bidderUsername: string;
  createdAt: string;
  auctionId: number;
  newEndDate: string;
}

const AuctionsPage: React.FC<AuctionsPageProps> = ({
  onOpenDetails,
  currentUser,
  onOpenUserDetailsAsAdmin,
}) => {
  const [search, setSearch] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(""); // κρατάμε id ως string
  const [sortBy, setSortBy] = useState<string>("");
  const [direction, setDirection] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  const [expiredLast7Days, setExpiredLast7Days] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] =
    useState<SpringPage<AuctionListItem> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Bid feedback (success / error)
  const [bidMessage, setBidMessage] = useState<string | null>(null);
  const [bidMessageType, setBidMessageType] =
    useState<"success" | "error" | null>(null);

  // 🔹 Τι πληκτρολογεί ο χρήστης για κάθε auction (input ποσού)
  const [bidInputs, setBidInputs] = useState<Record<number, string>>({});

  // 🔹 ΝΕΟ: λίστα κατηγοριών (id + name)
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  // real-time countdown
  const [now, setNow] = useState<Date>(new Date());

  // STOMP client + subscriptions
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const subscriptionsRef = useRef<Record<number, StompSubscription>>({});

  // 🔹 Admin flag
  const isAdmin = currentUser?.roleName === "Admin";

  // ⏱ update "now" κάθε 1s
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 👇 Φόρτωση κατηγοριών ΜΙΑ φορά
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  // 🧠 WebSocket/STOMP σύνδεση ΜΙΑ φορά
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket as IStompSocket,
      reconnectDelay: 5000,

      debug: () => {
        // βάλε console.log αν θες logs
      },
    });

    client.onConnect = () => {
      console.log("STOMP connected");
      setStompClient(client);
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"], frame.body);
    };

    client.activate();

    return () => {
      Object.values(subscriptionsRef.current).forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = {};
      client.deactivate();
    };
  }, []);

  // 🧠 Subscribe στα topics των auctions της τρέχουσας σελίδας
  useEffect(() => {
    if (!stompClient || !stompClient.connected || !pageData) {
      return;
    }

    const subs = subscriptionsRef.current;
    const currentIds = new Set(pageData.content.map((a) => a.id));

    pageData.content.forEach((auction) => {
      if (subs[auction.id]) return;

      const destination = `/topic/auctions/${auction.id}`;
      const sub = stompClient.subscribe(
        destination,
        (message: IMessage) => {
          try {
            const payload: BidEventDto = JSON.parse(message.body);

            setPageData((prev) => {
              if (!prev) return prev;
              if (!prev.content.some((a) => a.id === payload.auctionId)) {
                return prev;
              }

              return {
                ...prev,
                content: prev.content.map((a) =>
                  a.id === payload.auctionId
                    ? {
                        ...a,
                        topBidAmount: payload.amount,
                        topBidderUsername: payload.bidderUsername,
                        endDate: payload.newEndDate,
                      }
                    : a
                ),
              };
            });
          } catch (err) {
            console.error("Failed to parse BidEventDto", err);
          }
        }
      );

      subs[auction.id] = sub;
    });

    // Unsubscribe για auctions που δεν είναι πια στη σελίδα
    Object.entries(subs).forEach(([idStr, sub]) => {
      const id = Number(idStr);
      if (!currentIds.has(id)) {
        sub.unsubscribe();
        delete subs[id];
      }
    });
  }, [stompClient, pageData]);

  const loadAuctions = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    try {
      const pageToLoad = typeof pageOverride === "number" ? pageOverride : page;

      const result = await getAuctions({
        search,
        sortBy: sortBy || undefined,
        direction: direction || undefined,
        region: region || undefined,
        country: country || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        page: pageToLoad,
        expiredLast7Days,
      });

      setPageData(result);
      setPage(pageToLoad);
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά κατά τη φόρτωση των auctions.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    loadAuctions(0);
  };

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

  const isAuctionActive = (endDateIso: string, nowValue: Date): boolean => {
    const end = new Date(endDateIso);
    if (Number.isNaN(end.getTime())) return false;
    return end.getTime() - nowValue.getTime() > 0;
  };

  const showBidMessage = (type: "success" | "error", message: string) => {
    setBidMessageType(type);
    setBidMessage(message);
    setTimeout(() => {
      setBidMessage(null);
      setBidMessageType(null);
    }, 5000);
  };

  const handleBidClick = async (auction: AuctionListItem) => {
    const raw = bidInputs[auction.id];

    if (!raw || raw.trim() === "") {
      window.alert("Συμπλήρωσε ποσό προσφοράς.");
      return;
    }

    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Μη έγκυρο ποσό.");
      return;
    }

    try {
      await placeBid(auction.id, amount);

      // 🔹 Optimistic update
      setPageData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((a) =>
            a.id === auction.id
              ? {
                  ...a,
                  topBidAmount:
                    a.topBidAmount != null && a.topBidAmount > amount
                      ? a.topBidAmount
                      : amount,
                }
              : a
          ),
        };
      });

      // καθάρισε το input
      setBidInputs((prev) => ({ ...prev, [auction.id]: "" }));

      showBidMessage("success", "Η προσφορά καταχωρήθηκε με επιτυχία!");
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά κατά την προσφορά.";
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      showBidMessage("error", message);
    }
  };

  // 🔹 ΝΕΟ: όταν Admin πατάει πάνω στο username
  const handleOpenBidderDetails = (username: string) => {
    if (!isAdmin) return;
    if (!onOpenUserDetailsAsAdmin) return;
    onOpenUserDetailsAsAdmin(username);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      <h1>Auctions</h1>

      {/* 🔹 Μήνυμα για bid (success / error) */}
      {bidMessage && (
        <p
          style={{
            color: bidMessageType === "error" ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {bidMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Search:
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        {/* 👇 Dropdown με ονόματα κατηγοριών, αλλά value = id */}
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Category:
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </div>

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

        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Region:
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="π.χ. NICOSIA"
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Country:
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="π.χ. Cyprus"
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Expired last 7 days:
            <input
              type="checkbox"
              checked={expiredLast7Days}
              onChange={(e) => setExpiredLast7Days(e.target.checked)}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Φόρτωση..." : "Φόρτωσε Auctions"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {pageData && (
        <div>
          <p>
            Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
            {pageData.totalElements} auctions
          </p>

          <ul>
            {pageData.content.map((auction) => {
              const canBid =
                auction.eligibleForBid && isAuctionActive(auction.endDate, now);

              return (
                <li key={auction.id} style={{ marginBottom: "0.75rem" }}>
                  {/* Main image αν υπάρχει */}
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
                      {auction.topBidderUsername ? (
                        isAdmin ? (
                          // 👇 Αν είναι Admin, κάνε το username clickable
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenBidderDetails(auction.topBidderUsername!)
                            }
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              margin: 0,
                              color: "blue",
                              textDecoration: "underline",
                              cursor: "pointer",
                              font: "inherit",
                              fontWeight: "bold",
                            }}
                          >
                            {auction.topBidderUsername}
                          </button>
                        ) : (
                          // 👇 Αν ΔΕΝ είναι Admin, απλά bold text
                          <strong>{auction.topBidderUsername}</strong>
                        )
                      ) : (
                        <strong>άγνωστο χρήστη</strong>
                      )}
                    </span>
                  ) : (
                    <span>Δεν υπάρχουν προσφορές ακόμη.</span>
                  )}
                  <br />
                  Short desc: {auction.shortDescription}
                  <br />
                  {canBid && (
                    <div
                      style={{
                        marginTop: "0.25rem",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ποσό (€)"
                        value={bidInputs[auction.id] ?? ""}
                        onChange={(e) =>
                          setBidInputs((prev) => ({
                            ...prev,
                            [auction.id]: e.target.value,
                          }))
                        }
                        style={{ width: "100px" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleBidClick(auction)}
                      >
                        Bid
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    style={{ marginTop: "0.25rem", marginLeft: "0.5rem" }}
                    onClick={() => onOpenDetails?.(auction.id)}
                  >
                    Details
                  </button>
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

export default AuctionsPage;
