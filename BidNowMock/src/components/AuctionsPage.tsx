
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

// // 👇 ΝΕΟ: AuthUser τύπος
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// // 👇 ΝΕΟ: service για categories
// import {
//   getCategories,
//   type CategoryDto,
// } from "../api/Springboot/backendCategoryService";

// interface AuctionsPageProps {
//   onOpenDetails?: (auctionId: number) => void;
//   currentUser: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;
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

// const AuctionsPage: React.FC<AuctionsPageProps> = ({
//   onOpenDetails,
//   currentUser,
//   onOpenUserDetailsAsAdmin,
// }) => {
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

//   // 🔹 Admin flag
//   const isAdmin = currentUser?.roleName === "Admin";

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
//     const socket = new SockJS("/ws");//http://localhost:8080/ws
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

//   // 🔹 ΝΕΟ: όταν Admin πατάει πάνω στο username
//   const handleOpenBidderDetails = (username: string) => {
//     if (!isAdmin) return;
//     if (!onOpenUserDetailsAsAdmin) return;
//     onOpenUserDetailsAsAdmin(username);
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
//                       {auction.topBidderUsername ? (
//                         isAdmin ? (
//                           // 👇 Αν είναι Admin, κάνε το username clickable
//                           <button
//                             type="button"
//                             onClick={() =>
//                               handleOpenBidderDetails(auction.topBidderUsername!)
//                             }
//                             style={{
//                               background: "none",
//                               border: "none",
//                               padding: 0,
//                               margin: 0,
//                               color: "blue",
//                               textDecoration: "underline",
//                               cursor: "pointer",
//                               font: "inherit",
//                               fontWeight: "bold",
//                             }}
//                           >
//                             {auction.topBidderUsername}
//                           </button>
//                         ) : (
//                           // 👇 Αν ΔΕΝ είναι Admin, απλά bold text
//                           <strong>{auction.topBidderUsername}</strong>
//                         )
//                       ) : (
//                         <strong>άγνωστο χρήστη</strong>
//                       )}
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


/////////////////////// VERSION 3 /////////////////////////////////////



  // // src/components/AuctionsPage.tsx

  // import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
  // import { createPortal } from "react-dom";
  // import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
  // import type { AuthUserDto } from "../models/Springboot/UserEntity";
  // import { getAuctions } from "../api/Springboot/backendAuctionService";
  // import { placeBid } from "../api/Springboot/BackendBidService";

  // import { Client } from "@stomp/stompjs";
  // import type { IMessage, StompSubscription, IStompSocket } from "@stomp/stompjs";
  // import SockJS from "sockjs-client";

  // import { getCategories, type CategoryDto } from "../api/Springboot/backendCategoryService";

  // interface AuctionsPageProps {
  //   onOpenDetails?: (auctionId: number) => void;

  //   currentUser?: AuthUserDto | null;
  //   onOpenUserDetailsAsAdmin?: (username: string) => void;

  //   onSignIn?: () => void;

  //   onCreateAuction?: () => void;
  //   onViewMyBids?: () => void;
  // }

  // type AuctionListItemUI = AuctionListItem & {
  //   sellerAvatarUrl?: string | null;
  //   topBidderAvatarUrl?: string | null;
  // };

  // interface BidEventDto {
  //   id: number;
  //   amount: number;
  //   bidderUsername: string;
  //   createdAt: string;
  //   auctionId: number;
  //   newEndDate: string;
  //   bidderAvatarUrl?: string | null;
  // }

  // type InlineNoticeType = "success" | "error";

  // const AuctionsPage: React.FC<AuctionsPageProps> = ({
  //   onOpenDetails,
  //   currentUser,
  //   onSignIn,
  //   onCreateAuction,
  //   onViewMyBids,
  // }) => {
  //   const [search, setSearch] = useState<string>("");
  //   const [categoryId, setCategoryId] = useState<string>("");

  //   const [sortBy, setSortBy] = useState<string>("endDate");
  //   const [direction, setDirection] = useState<string>("asc");

  //   const [region, setRegion] = useState<string>("");
  //   const [country, setCountry] = useState<string>("");

  //   const [expiredLast7Days, setExpiredLast7Days] = useState<boolean>(false);

  //   const [page, setPage] = useState<number>(0);
  //   const [pageData, setPageData] = useState<SpringPage<AuctionListItemUI> | null>(null);

  //   const [loading, setLoading] = useState<boolean>(false);
  //   const [error, setError] = useState<string | null>(null);

  //   const [bidInputs, setBidInputs] = useState<Record<number, string>>({});

  //   const [categories, setCategories] = useState<CategoryDto[]>([]);

  //   const [now, setNow] = useState<Date>(new Date());

  //   const [stompClient, setStompClient] = useState<Client | null>(null);
  //   const subscriptionsRef = useRef<Record<number, StompSubscription>>({});

  //   // ✅ Inline notices per auction (no browser alerts)
  //   const [bidNoticeByAuctionId, setBidNoticeByAuctionId] = useState<
  //     Record<number, { type: InlineNoticeType; message: string } | undefined>
  //   >({});
  //   const bidNoticeTimersRef = useRef<Record<number, number>>({});

  //   const dismissBidNotice = useCallback((auctionId: number) => {
  //     const t = bidNoticeTimersRef.current[auctionId];
  //     if (t) {
  //       window.clearTimeout(t);
  //       delete bidNoticeTimersRef.current[auctionId];
  //     }
  //     setBidNoticeByAuctionId((prev) => {
  //       if (!prev[auctionId]) return prev;
  //       const next = { ...prev };
  //       delete next[auctionId];
  //       return next;
  //     });
  //   }, []);

  //   const showBidNotice = useCallback(
  //     (auctionId: number, type: InlineNoticeType, message: string) => {
  //       // clear old timer
  //       const old = bidNoticeTimersRef.current[auctionId];
  //       if (old) window.clearTimeout(old);

  //       setBidNoticeByAuctionId((prev) => ({
  //         ...prev,
  //         [auctionId]: { type, message },
  //       }));

  //       bidNoticeTimersRef.current[auctionId] = window.setTimeout(() => {
  //         setBidNoticeByAuctionId((prev) => {
  //           if (!prev[auctionId]) return prev;
  //           const next = { ...prev };
  //           delete next[auctionId];
  //           return next;
  //         });
  //         delete bidNoticeTimersRef.current[auctionId];
  //       }, 4500);
  //     },
  //     []
  //   );

  //   useEffect(() => {
  //     return () => {
  //       Object.values(bidNoticeTimersRef.current).forEach((t) => window.clearTimeout(t));
  //       bidNoticeTimersRef.current = {};
  //     };
  //   }, []);

  //   // ✅ prune notices when page changes (avoid keeping notices for auctions not shown)
  //   useEffect(() => {
  //     if (!pageData) return;
  //     const ids = new Set(pageData.content.map((a) => a.id));

  //     setBidNoticeByAuctionId((prev) => {
  //       const next: Record<number, { type: InlineNoticeType; message: string } | undefined> = { ...prev };
  //       Object.keys(next).forEach((k) => {
  //         const id = Number(k);
  //         if (!ids.has(id)) {
  //           const t = bidNoticeTimersRef.current[id];
  //           if (t) {
  //             window.clearTimeout(t);
  //             delete bidNoticeTimersRef.current[id];
  //           }
  //           delete next[id];
  //         }
  //       });
  //       return next;
  //     });
  //   }, [pageData]);

  //   // ✅ More Filters dropdown
  //   const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  //   // anchor/button + dropdown refs
  //   const moreFiltersAnchorRef = useRef<HTMLDivElement | null>(null);
  //   const moreFiltersBtnRef = useRef<HTMLButtonElement | null>(null);
  //   const moreFiltersDropdownRef = useRef<HTMLDivElement | null>(null);

  //   // dropdown absolute position in document (so it scrolls away with page)
  //   const [moreFiltersPos, setMoreFiltersPos] = useState<{ top: number; left: number; width: number } | null>(null);

  //   // -----------------------------
  //   // ✅ Responsive breakpoints
  //   // -----------------------------
  //   const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1280));

  //   useEffect(() => {
  //     const onResize = () => setVw(window.innerWidth);
  //     window.addEventListener("resize", onResize, { passive: true });
  //     return () => window.removeEventListener("resize", onResize);
  //   }, []);

  //   const isMobile = vw <= 640; // phones
  //   const isTablet = vw > 640 && vw <= 1024; // tablets

  //   const isAuthenticated = !!currentUser;
  //   const isAuctioneerOrAdmin = currentUser?.roleName === "Auctioneer" || currentUser?.roleName === "Admin";

  //   useEffect(() => {
  //     const timer = window.setInterval(() => setNow(new Date()), 1000);
  //     return () => window.clearInterval(timer);
  //   }, []);

  //   useEffect(() => {
  //     const loadCategories = async () => {
  //       try {
  //         const data = await getCategories();
  //         setCategories(data);
  //       } catch (err) {
  //         console.error("Failed to load categories", err);
  //       }
  //     };
  //     void loadCategories();
  //   }, []);

  //   useEffect(() => {
  //     const socket = new SockJS("/ws");
  //     const client = new Client({
  //       webSocketFactory: () => socket as unknown as IStompSocket,
  //       reconnectDelay: 5000,
  //       debug: () => {},
  //     });

  //     client.onConnect = () => setStompClient(client);

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

  //   useEffect(() => {
  //     if (!stompClient || !stompClient.connected || !pageData) return;

  //     const subs = subscriptionsRef.current;
  //     const currentIds = new Set(pageData.content.map((a) => a.id));

  //     pageData.content.forEach((auction) => {
  //       if (subs[auction.id]) return;

  //       const destination = `/topic/auctions/${auction.id}`;
  //       const sub = stompClient.subscribe(destination, (message: IMessage) => {
  //         try {
  //           const payload: BidEventDto = JSON.parse(message.body);

  //           setPageData((prev) => {
  //             if (!prev) return prev;
  //             if (!prev.content.some((a) => a.id === payload.auctionId)) return prev;

  //             return {
  //               ...prev,
  //               content: prev.content.map((a) =>
  //                 a.id === payload.auctionId
  //                   ? {
  //                       ...a,
  //                       topBidAmount: payload.amount,
  //                       topBidderUsername: payload.bidderUsername,
  //                       topBidderAvatarUrl: payload.bidderAvatarUrl ?? a.topBidderAvatarUrl ?? null,
  //                       endDate: payload.newEndDate,
  //                     }
  //                   : a
  //               ),
  //             };
  //           });
  //         } catch (err) {
  //           console.error("Failed to parse BidEventDto", err);
  //         }
  //       });

  //       subs[auction.id] = sub;
  //     });

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

  //       const uiResult: SpringPage<AuctionListItemUI> = {
  //         ...result,
  //         content: result.content as AuctionListItemUI[],
  //       };

  //       setPageData(uiResult);
  //       setPage(pageToLoad);
  //     } catch (err: unknown) {
  //       console.error(err);
  //       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των auctions.";
  //       if (err instanceof Error) message = err.message;
  //       setError(message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const filtersKey = useMemo(() => {
  //     return JSON.stringify({
  //       search,
  //       categoryId,
  //       sortBy,
  //       direction,
  //       region,
  //       country,
  //       expiredLast7Days,
  //     });
  //   }, [search, categoryId, sortBy, direction, region, country, expiredLast7Days]);

  //   useEffect(() => {
  //     const t = window.setTimeout(() => {
  //       void loadAuctions(0);
  //     }, 350);
  //     return () => window.clearTimeout(t);
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [filtersKey]);

  //   const handlePrevPage = () => {
  //     if (!pageData || pageData.first) return;
  //     void loadAuctions(page - 1);
  //   };

  //   const handleNextPage = () => {
  //     if (!pageData || pageData.last) return;
  //     void loadAuctions(page + 1);
  //   };

  //   const toTitleCase = (s: string) => (s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());

  //   const getCityFromLocation = (sellerLocation: string | null): string => {
  //     if (!sellerLocation) return "Unknown";
  //     const [first] = sellerLocation.split(",");
  //     return toTitleCase(first.trim());
  //   };

  //   const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
  //     const end = new Date(endDateIso);
  //     const diffMs = end.getTime() - nowValue.getTime();

  //     if (Number.isNaN(end.getTime())) return endDateIso;
  //     if (diffMs <= 0) return "Ended";

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

  //   const nf = useMemo(
  //     () =>
  //       new Intl.NumberFormat("en-US", {
  //         minimumFractionDigits: 0,
  //         maximumFractionDigits: 2,
  //       }),
  //     []
  //   );

  //   const asNumber = (v: unknown): number => {
  //     if (typeof v === "number") return v;
  //     if (typeof v === "string") {
  //       const n = Number(v);
  //       return Number.isFinite(n) ? n : 0;
  //     }
  //     return 0;
  //   };

  //   const formatMoney = (v: unknown): string => `${nf.format(asNumber(v))}€`;

  //   const computeMinBid = (a: AuctionListItemUI): number => {
  //     const top = a.topBidAmount != null ? asNumber(a.topBidAmount) : null;
  //     if (top == null) return asNumber(a.startingAmount);
  //     return top + asNumber(a.minBidIncrement);
  //   };

  //   const initials = (username: string) => {
  //     if (!username) return "?";
  //     return username.trim().slice(0, 1).toUpperCase();
  //   };

  //   const Avatar: React.FC<{ url?: string | null; username: string; size?: number }> = ({ url, username, size = 34 }) => {
  //     const s = `${size}px`;
  //     const baseStyle: React.CSSProperties = {
  //       width: s,
  //       height: s,
  //       borderRadius: "999px",
  //       display: "inline-flex",
  //       alignItems: "center",
  //       justifyContent: "center",
  //       flexShrink: 0,
  //       overflow: "hidden",
  //       background: "#EEF2FF",
  //       color: "#1F2A44",
  //       fontWeight: 700,
  //       border: "1px solid rgba(17, 24, 39, 0.08)",
  //     };

  //     if (url) {
  //       return (
  //         <span style={baseStyle}>
  //           <img src={url} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  //         </span>
  //       );
  //     }

  //     return <span style={baseStyle}>{initials(username)}</span>;
  //   };

  //   const InlineNotice: React.FC<{
  //     type: InlineNoticeType;
  //     message: string;
  //     onClose: () => void;
  //   }> = ({ type, message, onClose }) => {
  //     const isErr = type === "error";
  //     return (
  //       <div
  //         style={{
  //           marginTop: 8,
  //           padding: "10px 12px",
  //           borderRadius: 14,
  //           border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
  //           background: isErr ? "#FEF2F2" : "#F0FDF4",
  //           color: isErr ? "#991B1B" : "#166534",
  //           fontWeight: 900,
  //           fontSize: 13,
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "space-between",
  //           gap: 12,
  //         }}
  //         role="status"
  //         aria-live="polite"
  //       >
  //         <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>{message}</div>

  //         {/* ✅ fixed centered X (same as AuctionDetails) */}
  //         <button
  //           type="button"
  //           onClick={onClose}
  //           aria-label="Close message"
  //           style={{
  //             flex: "0 0 auto",
  //             width: 30,
  //             height: 30,
  //             padding: 0,
  //             borderRadius: 10,
  //             border: "1px solid rgba(17,24,39,0.12)",
  //             background: "rgba(255,255,255,0.75)",
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             justifyContent: "center",
  //             fontWeight: 950,
  //             fontSize: 16,
  //             lineHeight: 1,
  //           }}
  //           title="Close"
  //         >
  //           <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
  //         </button>
  //       </div>
  //     );
  //   };

  //   const handleBidClick = async (auction: AuctionListItemUI) => {
  //     if (!isAuthenticated) {
  //       onSignIn?.();
  //       return;
  //     }

  //     const raw = bidInputs[auction.id];

  //     if (!raw || raw.trim() === "") {
  //       showBidNotice(auction.id, "error", "Συμπλήρωσε ποσό προσφοράς.");
  //       return;
  //     }

  //     const amount = Number(raw);
  //     if (!Number.isFinite(amount) || amount <= 0) {
  //       showBidNotice(auction.id, "error", "Μη έγκυρο ποσό.");
  //       return;
  //     }

  //     try {
  //       await placeBid(auction.id, amount);

  //       setPageData((prev) => {
  //         if (!prev) return prev;
  //         return {
  //           ...prev,
  //           content: prev.content.map((a) =>
  //             a.id === auction.id
  //               ? {
  //                   ...a,
  //                   topBidAmount: a.topBidAmount != null && asNumber(a.topBidAmount) > amount ? a.topBidAmount : amount,
  //                 }
  //               : a
  //           ),
  //         };
  //       });

  //       setBidInputs((prev) => ({ ...prev, [auction.id]: "" }));
  //       showBidNotice(auction.id, "success", "Η προσφορά καταχωρήθηκε με επιτυχία!");
  //     } catch (err: unknown) {
  //       console.error(err);
  //       let message = "Κάτι πήγε στραβά κατά την προσφορά.";
  //       if (err instanceof Error && err.message) message = err.message;
  //       showBidNotice(auction.id, "error", message);
  //     }
  //   };

  //   // -----------------------------
  //   // ✅ More Filters position + outside click (PORTAL)
  //   // -----------------------------
  //   const computeMoreFiltersPos = (): { top: number; left: number; width: number } | null => {
  //     const btnEl = moreFiltersBtnRef.current;
  //     if (!btnEl) return null;

  //     const r = btnEl.getBoundingClientRect();
  //     const margin = 12;
  //     const desiredWidth = isMobile ? Math.min(window.innerWidth - margin * 2, 520) : 520;

  //     let left = r.left + window.scrollX;
  //     const maxLeft = window.scrollX + window.innerWidth - margin - desiredWidth;
  //     left = Math.min(left, maxLeft);
  //     left = Math.max(left, window.scrollX + margin);

  //     const top = r.bottom + window.scrollY + 8;
  //     return { top, left, width: desiredWidth };
  //   };

  //   useEffect(() => {
  //     if (!showMoreFilters) {
  //       setMoreFiltersPos(null);
  //       return;
  //     }
  //     setMoreFiltersPos(computeMoreFiltersPos());

  //     const onResize = () => setMoreFiltersPos(computeMoreFiltersPos());
  //     window.addEventListener("resize", onResize, { passive: true });
  //     return () => window.removeEventListener("resize", onResize);
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [showMoreFilters, vw]);

  //   useEffect(() => {
  //     if (!showMoreFilters) return;

  //     const onMouseDown = (e: MouseEvent) => {
  //       const target = e.target as Node;

  //       const anchor = moreFiltersAnchorRef.current;
  //       if (anchor && anchor.contains(target)) return;

  //       const dd = moreFiltersDropdownRef.current;
  //       if (dd && dd.contains(target)) return;

  //       setShowMoreFilters(false);
  //     };

  //     window.addEventListener("mousedown", onMouseDown);
  //     return () => window.removeEventListener("mousedown", onMouseDown);
  //   }, [showMoreFilters]);

  //   // -----------------------------
  //   // ✅ Styles
  //   // -----------------------------
  //   const pageOuter: React.CSSProperties = {
  //     width: "100%",
  //     minHeight: "100vh",
  //     background: "#F5F6F8",
  //   };

  //   const container: React.CSSProperties = {
  //     width: "100%",
  //     maxWidth: "100%",
  //     margin: 0,
  //     padding: isMobile ? "12px 12px 28px" : isTablet ? "16px 18px 36px" : "18px 24px 40px",
  //     boxSizing: "border-box",
  //   };

  //   const topBar: React.CSSProperties = {
  //     display: "grid",
  //     gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr auto" : "minmax(320px, 560px) 1fr minmax(140px, 220px)",
  //     alignItems: "center",
  //     gap: isMobile ? 10 : 16,
  //     padding: "8px 0 12px",
  //     width: "100%",
  //     boxSizing: "border-box",
  //   };

  //   const searchWrap: React.CSSProperties = {
  //     display: "flex",
  //     alignItems: "center",
  //     gap: 10,
  //     background: "#F0F1F3",
  //     border: "1px solid rgba(17, 24, 39, 0.10)",
  //     borderRadius: 12,
  //     padding: isMobile ? "9px 10px" : "10px 12px",
  //     width: "100%",
  //     boxSizing: "border-box",
  //   };

  //   const inputStyle: React.CSSProperties = {
  //     width: "100%",
  //     border: "none",
  //     outline: "none",
  //     background: "transparent",
  //     fontSize: 14,
  //   };

  //   const resultsRight: React.CSSProperties = {
  //     justifySelf: isMobile ? "start" : "end",
  //     fontSize: 12,
  //     color: "#6B7280",
  //   };

  //   const panel: React.CSSProperties = {
  //     background: "#F3F4F6",
  //     border: "1px solid rgba(17, 24, 39, 0.06)",
  //     borderRadius: 16,
  //     padding: isMobile ? 14 : 18,
  //     boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
  //     width: "100%",
  //     boxSizing: "border-box",
  //   };

  //   // ✅ Mobile only: τα 2 buttons δίπλα-δίπλα ΠΑΝΩ από το panel
  //   const quickActionsRow: React.CSSProperties = {
  //     display: "flex",
  //     alignItems: "center",
  //     gap: 10,
  //     width: "100%",
  //     flexDirection: "row",
  //     flexWrap: "nowrap",
  //     marginBottom: 12,
  //   };

  //   const chipsRow: React.CSSProperties = {
  //     display: "flex",
  //     flexWrap: isMobile ? "nowrap" : "wrap",
  //     gap: 10,
  //     marginTop: 10,
  //     overflowX: isMobile ? "auto" : "visible",
  //     WebkitOverflowScrolling: "touch",
  //     paddingBottom: isMobile ? 6 : 0,
  //   };

  //   const chip = (active: boolean): React.CSSProperties => ({
  //     display: "inline-flex",
  //     alignItems: "center",
  //     gap: 8,
  //     padding: "8px 12px",
  //     borderRadius: 12,
  //     border: active ? "1px solid #0B1220" : "1px solid rgba(17, 24, 39, 0.12)",
  //     background: active ? "#0B1220" : "#FFFFFF",
  //     color: active ? "#FFFFFF" : "#111827",
  //     fontSize: 13,
  //     fontWeight: 600,
  //     cursor: "pointer",
  //     userSelect: "none",
  //     flex: "0 0 auto",
  //   });

  //   const filtersRow: React.CSSProperties = {
  //     marginTop: 14,
  //     background: "#FFFFFF",
  //     border: "1px solid rgba(17, 24, 39, 0.08)",
  //     borderRadius: 14,
  //     padding: 12,
  //     display: "grid",
  //     gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
  //     gap: 12,
  //     width: "100%",
  //     boxSizing: "border-box",
  //   };

  //   const selectWrap: React.CSSProperties = {
  //     display: "flex",
  //     alignItems: "center",
  //     gap: 10,
  //     background: "#F3F4F6",
  //     border: "1px solid rgba(17, 24, 39, 0.10)",
  //     borderRadius: 12,
  //     padding: "10px 12px",
  //     minWidth: 0,
  //     boxSizing: "border-box",
  //   };

  //   const selectStyle: React.CSSProperties = {
  //     width: "100%",
  //     border: "none",
  //     outline: "none",
  //     background: "transparent",
  //     fontSize: 13,
  //     fontWeight: 600,
  //     color: "#111827",
  //     minWidth: 0,
  //   };

  //   // ✅ More Filters button
  //   const moreFiltersRow: React.CSSProperties = {
  //     marginTop: 14,
  //     display: "flex",
  //     justifyContent: "flex-start",
  //   };

  //   const moreFiltersWrap: React.CSSProperties = {
  //     position: "relative",
  //     width: isMobile ? "100%" : "auto",
  //   };

  //   const btn: React.CSSProperties = {
  //     height: isMobile ? 34 : 36,
  //     borderRadius: 12,
  //     border: "1px solid rgba(17, 24, 39, 0.12)",
  //     background: "#FFFFFF",
  //     fontWeight: 800,
  //     fontSize: isMobile ? 12.5 : 13,
  //     cursor: "pointer",
  //     padding: "0 14px",
  //     whiteSpace: "nowrap",
  //   };

  //   const moreFiltersBtn: React.CSSProperties = {
  //     ...btn,
  //     width: isMobile ? "100%" : "auto",
  //     display: "inline-flex",
  //     alignItems: "center",
  //     justifyContent: "center",
  //     gap: 8,
  //   };

  //   // dropdown content (inside portal)
  //   const dropdownShell = (pos: { top: number; left: number; width: number }): React.CSSProperties => ({
  //     position: "absolute",
  //     top: pos.top,
  //     left: pos.left,
  //     width: pos.width,
  //     zIndex: 9999,
  //     borderRadius: 14,
  //     overflow: "auto",
  //     maxHeight: "min(520px, calc(100vh - 24px))",
  //   });

  //   const filtersRowDropdown: React.CSSProperties = {
  //     ...filtersRow,
  //     marginTop: 0,
  //     boxShadow: "0 18px 40px rgba(17,24,39,0.16)",
  //   };

  //   const grid: React.CSSProperties = {
  //     marginTop: 18,
  //     display: "grid",
  //     gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
  //     gap: isMobile ? 12 : 16,
  //     width: "100%",
  //     boxSizing: "border-box",
  //   };

  //   const card: React.CSSProperties = {
  //     background: "#FFFFFF",
  //     borderRadius: 16,
  //     border: "1px solid rgba(17, 24, 39, 0.08)",
  //     overflow: "hidden",
  //     boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
  //     display: "flex",
  //     flexDirection: "column",
  //   };

  //   const imgWrap: React.CSSProperties = {
  //     position: "relative",
  //     height: isMobile ? 210 : 240,
  //     background: "#E5E7EB",
  //   };

  //   const badgeLeft: React.CSSProperties = {
  //     position: "absolute",
  //     top: 10,
  //     left: 10,
  //     display: "inline-flex",
  //     alignItems: "center",
  //     gap: 6,
  //     padding: isMobile ? "5px 9px" : "6px 10px",
  //     borderRadius: 999,
  //     background: "rgba(255,255,255,0.92)",
  //     border: "1px solid rgba(17, 24, 39, 0.10)",
  //     fontSize: isMobile ? 11 : 12,
  //     fontWeight: 800,
  //     color: "#111827",
  //     maxWidth: "calc(100% - 20px)",
  //     boxSizing: "border-box",
  //     whiteSpace: "nowrap",
  //   };

  //   const badgeRight: React.CSSProperties = {
  //     position: "absolute",
  //     top: isMobile ? 42 : 10,
  //     right: 10,
  //     padding: isMobile ? "5px 9px" : "6px 10px",
  //     borderRadius: 999,
  //     background: "rgba(255,255,255,0.92)",
  //     border: "1px solid rgba(17, 24, 39, 0.10)",
  //     fontSize: isMobile ? 11 : 12,
  //     fontWeight: 800,
  //     color: "#111827",
  //     maxWidth: "calc(100% - 20px)",
  //     whiteSpace: "nowrap",
  //     overflow: "hidden",
  //     textOverflow: "ellipsis",
  //     boxSizing: "border-box",
  //   };

  //   const endedOverlay: React.CSSProperties = {
  //     position: "absolute",
  //     inset: 0,
  //     background: "rgba(0,0,0,0.35)",
  //     display: "flex",
  //     alignItems: "center",
  //     justifyContent: "center",
  //     color: "#FFFFFF",
  //     fontWeight: 900,
  //     letterSpacing: 0.5,
  //     textTransform: "uppercase",
  //     textAlign: "center",
  //     padding: "0 10px",
  //   };

  //   const body: React.CSSProperties = {
  //     padding: isMobile ? 12 : 14,
  //     display: "flex",
  //     flexDirection: "column",
  //     gap: isMobile ? 8 : 10,
  //   };

  //   const sellerBox: React.CSSProperties = {
  //     background: "#F3F4F6",
  //     borderRadius: 14,
  //     padding: isMobile ? 10 : 12,
  //     display: "flex",
  //     alignItems: "center",
  //     gap: 10,
  //   };

  //   const sellerInfoCol: React.CSSProperties = {
  //     display: "grid",
  //     gap: 1,
  //     minWidth: 0,
  //     flex: 1,
  //     paddingTop: 2,
  //   };

  //   const sellerNameRow: React.CSSProperties = {
  //     display: "flex",
  //     alignItems: "baseline",
  //     gap: 8,
  //     minWidth: 0,
  //   };

  //   const sellerUsernameStyle: React.CSSProperties = {
  //     fontWeight: 900,
  //     color: "#111827",
  //     fontSize: isMobile ? 15 : 16,
  //     lineHeight: 1.1,
  //     whiteSpace: "nowrap",
  //     overflow: "hidden",
  //     textOverflow: "ellipsis",
  //     flex: "1 1 auto",
  //     minWidth: 0,
  //   };

  //   const sellerLocationInline: React.CSSProperties = {
  //     fontSize: isMobile ? 13 : 12,
  //     color: "#2563EB",
  //     whiteSpace: "nowrap",
  //     flex: "0 0 auto",
  //   };

  //   const titleStyle: React.CSSProperties = {
  //     margin: 0,
  //     fontSize: isMobile ? 15 : 18,
  //     fontWeight: 800,
  //     color: "#111827",
  //     lineHeight: 1.2,
  //     display: "-webkit-box",
  //     WebkitBoxOrient: "vertical",
  //     WebkitLineClamp: isMobile ? 2 : 3,
  //     overflow: "hidden",
  //   };

  //   const descStyle: React.CSSProperties = {
  //     margin: 0,
  //     fontSize: isMobile ? 12.5 : 13,
  //     color: "#4B5563",
  //     lineHeight: 1.35,
  //     display: "-webkit-box",
  //     WebkitBoxOrient: "vertical",
  //     WebkitLineClamp: isMobile ? 2 : 3,
  //     overflow: "hidden",
  //   };

  //   const metaRow: React.CSSProperties = {
  //     display: "flex",
  //     justifyContent: "space-between",
  //     gap: 10,
  //     fontSize: isMobile ? 11.5 : 12,
  //     color: "#6B7280",
  //     alignItems: "center",
  //     flexWrap: "nowrap",
  //   };

  //   const metaLeft: React.CSSProperties = {
  //     flex: "1 1 0",
  //     minWidth: 0,
  //     whiteSpace: "nowrap",
  //     overflow: "hidden",
  //     textOverflow: "ellipsis",
  //   };

  //   const metaRight: React.CSSProperties = {
  //     flex: "0 0 auto",
  //     whiteSpace: "nowrap",
  //     textAlign: "right",
  //   };

  //   const detailsBtn: React.CSSProperties = {
  //     ...btn,
  //     width: "100%",
  //     justifyContent: "center",
  //   };

  //   const primaryBtn: React.CSSProperties = {
  //     ...btn,
  //     background: "#0B1220",
  //     color: "#FFFFFF",
  //     border: "1px solid #0B1220",
  //   };

  //   const disabledPrimaryBtn: React.CSSProperties = {
  //     ...primaryBtn,
  //     opacity: 0.55,
  //     cursor: "not-allowed",
  //   };

  //   const actionBtnLight: React.CSSProperties = {
  //     height: isMobile ? 38 : 40,
  //     padding: isMobile ? "0 10px" : "0 14px",
  //     borderRadius: 12,
  //     border: "1px solid rgba(17, 24, 39, 0.12)",
  //     background: "#FFFFFF",
  //     fontWeight: 900,
  //     fontSize: isMobile ? 12.5 : 14,
  //     cursor: "pointer",
  //     display: "inline-flex",
  //     alignItems: "center",
  //     gap: isMobile ? 6 : 10,
  //     justifyContent: "center",
  //     whiteSpace: "nowrap",
  //     minWidth: 0,
  //     flex: isMobile ? "1 1 0" : "0 0 auto",
  //     width: "auto",
  //   };

  //   const actionBtnDark: React.CSSProperties = {
  //     ...actionBtnLight,
  //     background: "#100e0ef6",
  //     border: "1px solid #0B1220",
  //     color: "#ffffffff",
  //   };

  //   const bidRow: React.CSSProperties = {
  //     marginTop: 4,
  //     display: "grid",
  //     gridTemplateColumns: "1fr",
  //     gap: 8,
  //   };

  //   const bidInputWrap: React.CSSProperties = {
  //     display: "grid",
  //     gridTemplateColumns: "1fr auto",
  //     gap: 10,
  //     alignItems: "center",
  //     width: "100%",
  //   };

  //   const bidInput: React.CSSProperties = {
  //     width: "100%",
  //     height: 36,
  //     borderRadius: 12,
  //     border: "1px solid rgba(17, 24, 39, 0.12)",
  //     padding: "0 10px",
  //     outline: "none",
  //     fontWeight: 700,
  //     boxSizing: "border-box",
  //     minWidth: 0,
  //   };

  //   const pagination: React.CSSProperties = {
  //     marginTop: 18,
  //     display: "flex",
  //     justifyContent: "center",
  //     gap: 10,
  //   };

  //   const leadingSize = isMobile ? 32 : 40;

  //   const leadingBidderRow: React.CSSProperties = {
  //     marginTop: 10,
  //     borderRadius: 14,
  //     border: "2px solid rgba(59,130,246,0.45)",
  //     background: "rgba(59,130,246,0.06)",
  //     padding: isMobile ? 10 : 12,
  //     display: "grid",
  //     gridTemplateColumns: "1fr auto",
  //     alignItems: "center",
  //     gap: 10,
  //     minWidth: 0,
  //   };

  //   const leadingLeft: React.CSSProperties = {
  //     display: "flex",
  //     alignItems: "center",
  //     gap: 8,
  //     minWidth: 0,
  //     overflow: "hidden",
  //   };

  //   const leadingRank: React.CSSProperties = {
  //     width: leadingSize,
  //     height: leadingSize,
  //     borderRadius: 999,
  //     background: "#2563EB",
  //     color: "#FFFFFF",
  //     display: "grid",
  //     placeItems: "center",
  //     fontWeight: 900,
  //     flex: "0 0 auto",
  //     fontSize: isMobile ? 11 : 13,
  //   };

  //   const leadingAvatarWrap: React.CSSProperties = {
  //     width: leadingSize,
  //     height: leadingSize,
  //     borderRadius: 999,
  //     background: "#E5E7EB",
  //     display: "grid",
  //     placeItems: "center",
  //     overflow: "hidden",
  //     flex: "0 0 auto",
  //     fontSize: isMobile ? 12 : 14,
  //     fontWeight: 900,
  //     color: "#1F2A44",
  //   };

  //   const leadingNameCol: React.CSSProperties = {
  //     display: "grid",
  //     gap: 1,
  //     minWidth: 0,
  //     overflow: "hidden",
  //   };

  //   const leadingUsername: React.CSSProperties = {
  //     fontWeight: 900,
  //     color: "#111827",
  //     fontSize: isMobile ? 13 : 14,
  //     lineHeight: 1.1,
  //     whiteSpace: "nowrap",
  //     overflow: "hidden",
  //     textOverflow: "ellipsis",
  //   };

  //   const leadingLabel: React.CSSProperties = {
  //     fontWeight: 700,
  //     color: "#6B7280",
  //     fontSize: isMobile ? 12 : 13,
  //     whiteSpace: "nowrap",
  //     overflow: "hidden",
  //     textOverflow: "ellipsis",
  //   };

  //   const leadingAmount: React.CSSProperties = {
  //     fontWeight: 900,
  //     color: "#2563EB",
  //     flex: "0 0 auto",
  //     whiteSpace: "nowrap",
  //     fontSize: isMobile ? 12.5 : 14,
  //   };

  //   const totalResults = pageData?.totalElements ?? 0;

  //   return (
  //     <div style={pageOuter}>
  //       <div style={container}>
  //         <div style={topBar}>
  //           <div style={searchWrap}>
  //             <span style={{ fontSize: 14, opacity: 0.7 }}>🔍</span>
  //             <input
  //               type="text"
  //               placeholder="Search auctions..."
  //               value={search}
  //               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
  //               style={inputStyle}
  //             />
  //           </div>

  //           <div style={resultsRight}>{loading ? "Loading..." : `${totalResults} results`}</div>
  //         </div>

  //         {/* ✅ Mobile: actions πάνω από panel, δίπλα-δίπλα */}
  //         {isMobile && (
  //           <div style={quickActionsRow}>
  //             {isAuctioneerOrAdmin && (
  //               <button type="button" style={actionBtnDark} onClick={onCreateAuction}>
  //                 ➕ <span>Create Auction</span>
  //               </button>
  //             )}

  //             {isAuthenticated && (
  //               <button type="button" style={actionBtnLight} onClick={onViewMyBids}>
  //                 ☰ <span>View my bids</span>
  //               </button>
  //             )}
  //           </div>
  //         )}

  //         <div style={panel}>
  //           <div
  //             style={{
  //               display: "flex",
  //               alignItems: isMobile ? "stretch" : "center",
  //               justifyContent: "space-between",
  //               gap: 12,
  //               flexDirection: isMobile ? "column" : "row",
  //             }}
  //           >
  //             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
  //               <span style={{ fontSize: 16, opacity: 0.7 }}>⎇</span>
  //               <div style={{ fontWeight: 800, color: "#111827" }}>Filter by category</div>
  //             </div>

  //             {!isMobile && (
  //               <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
  //                 {isAuctioneerOrAdmin && (
  //                   <button type="button" style={actionBtnDark} onClick={onCreateAuction}>
  //                     ➕ <span>Create Auction</span>
  //                   </button>
  //                 )}

  //                 {isAuthenticated && (
  //                   <button type="button" style={actionBtnLight} onClick={onViewMyBids}>
  //                     ☰ <span>View my bids</span>
  //                   </button>
  //                 )}
  //               </div>
  //             )}
  //           </div>

  //           <div style={chipsRow}>
  //             <button type="button" style={chip(categoryId === "")} onClick={() => setCategoryId("")}>
  //               ⭐ All Items
  //             </button>

  //             {categories.map((c) => (
  //               <button
  //                 key={c.id}
  //                 type="button"
  //                 style={chip(categoryId === c.id.toString())}
  //                 onClick={() => setCategoryId(c.id.toString())}
  //               >
  //                 {c.name}
  //               </button>
  //             ))}
  //           </div>

  //           {/* ✅ More Filters dropdown button (portal fixes clipping on laptops) */}
  //           <div style={moreFiltersRow} ref={moreFiltersAnchorRef}>
  //             <div style={moreFiltersWrap}>
  //               <button
  //                 ref={moreFiltersBtnRef}
  //                 type="button"
  //                 style={moreFiltersBtn}
  //                 onClick={() => setShowMoreFilters((v) => !v)}
  //               >
  //                 More Filters <span style={{ opacity: 0.75 }}>{showMoreFilters ? "▲" : "▼"}</span>
  //               </button>
  //             </div>
  //           </div>

  //           {/* ✅ Dropdown rendered in document.body so it never gets clipped */}
  //           {showMoreFilters &&
  //             moreFiltersPos &&
  //             typeof document !== "undefined" &&
  //             createPortal(
  //               <div ref={moreFiltersDropdownRef} style={dropdownShell(moreFiltersPos)}>
  //                 <div style={filtersRowDropdown}>
  //                   <div style={selectWrap}>
  //                     <span style={{ fontSize: 14, opacity: 0.7 }}>📅</span>
  //                     <select
  //                       value={`${sortBy}:${direction}`}
  //                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
  //                         const [sb, dir] = e.target.value.split(":");
  //                         setSortBy(sb);
  //                         setDirection(dir);
  //                       }}
  //                       style={selectStyle}
  //                     >
  //                       <option value="endDate:asc">End Date (Ending Soon)</option>
  //                       <option value="endDate:desc">End Date (Ending Late)</option>
  //                       <option value="startDate:asc">Start Date (Soonest)</option>
  //                       <option value="startDate:desc">Start Date (Latest)</option>
  //                     </select>
  //                   </div>

  //                   <div style={selectWrap}>
  //                     <span style={{ fontSize: 14, opacity: 0.7 }}>📍</span>
  //                     <select
  //                       value={region}
  //                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
  //                         const r = e.target.value;
  //                         setRegion(r);
  //                         setCountry(r ? "Cyprus" : "");
  //                       }}
  //                       style={selectStyle}
  //                     >
  //                       <option value="">All Locations</option>
  //                       <option value="NICOSIA">Nicosia</option>
  //                       <option value="LIMASSOL">Limassol</option>
  //                       <option value="PAPHOS">Paphos</option>
  //                       <option value="FAMAGUSTA">Famagusta</option>
  //                     </select>
  //                   </div>

  //                   <div style={selectWrap}>
  //                     <span style={{ fontSize: 14, opacity: 0.7 }}>↕</span>
  //                     <select
  //                       value={expiredLast7Days ? "EXPIRED7" : "ACTIVE"}
  //                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExpiredLast7Days(e.target.value === "EXPIRED7")}
  //                       style={selectStyle}
  //                     >
  //                       <option value="ACTIVE">Active Auctions</option>
  //                       <option value="EXPIRED7">Expired (last 7 days)</option>
  //                     </select>
  //                   </div>
  //                 </div>
  //               </div>,
  //               document.body
  //             )}

  //           {error && (
  //             <div style={{ marginTop: 12, color: "#B91C1C", fontWeight: 800 }}>
  //               Σφάλμα: {error}
  //             </div>
  //           )}
  //         </div>

  //         {pageData && (
  //           <>
  //             <div style={grid}>
  //               {pageData.content.map((auction) => {
  //                 const active = isAuctionActive(auction.endDate, now);
  //                 const timeLabel = formatTimeRemaining(auction.endDate, now);
  //                 const minBid = computeMinBid(auction);
  //                 const hasLeadingBidder = auction.topBidAmount != null && (auction.topBidderUsername ?? "").trim().length > 0;
  //                 const canBid = active && auction.eligibleForBid && isAuthenticated;

  //                 const notice = bidNoticeByAuctionId[auction.id];

  //                 return (
  //                   <div key={auction.id} style={card}>
  //                     <div style={imgWrap}>
  //                       {auction.mainImageUrl ? (
  //                         <img
  //                           src={auction.mainImageUrl}
  //                           alt={auction.title}
  //                           style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
  //                         />
  //                       ) : (
  //                         <div
  //                           style={{
  //                             width: "100%",
  //                             height: "100%",
  //                             display: "flex",
  //                             alignItems: "center",
  //                             justifyContent: "center",
  //                             color: "#6B7280",
  //                             fontWeight: 800,
  //                           }}
  //                         >
  //                           No image
  //                         </div>
  //                       )}

  //                       <div style={badgeLeft}>
  //                         <span style={{ opacity: 0.85 }}>⏱</span>
  //                         <span style={{ color: timeLabel === "Ended" ? "#DC2626" : "#111827" }}>{timeLabel}</span>
  //                       </div>

  //                       <div style={badgeRight}>{auction.categoryName}</div>

  //                       {!active && <div style={endedOverlay}>AUCTION ENDED</div>}
  //                     </div>

  //                     <div style={body}>
  //                       <div style={sellerBox}>
  //                         <Avatar url={auction.sellerAvatarUrl ?? null} username={auction.sellerUsername} size={isMobile ? 40 : 41} />

  //                         <div style={sellerInfoCol}>
  //                           <div style={{ fontSize: isMobile ? 15 : 16, color: "#6B7280" }}>Seller</div>

  //                           <div style={sellerNameRow}>
  //                             <div style={sellerUsernameStyle} title={auction.sellerUsername}>
  //                               {auction.sellerUsername}
  //                             </div>

  //                             <div style={sellerLocationInline}>📍 {getCityFromLocation(auction.sellerLocation)}</div>
  //                           </div>
  //                         </div>
  //                       </div>

  //                       <h3 style={titleStyle}>{auction.title}</h3>
  //                       <p style={descStyle}>{auction.shortDescription}</p>

  //                       <div style={metaRow}>
  //                         <span style={metaLeft}>
  //                           Starting price:{" "}
  //                           <span style={{ fontWeight: 900, color: "#111827" }}>{formatMoney(auction.startingAmount)}</span>
  //                         </span>

  //                         <span style={metaRight}>
  //                           Minimum raise:{" "}
  //                           <span style={{ fontWeight: 900, color: "#111827" }}>{formatMoney(auction.minBidIncrement)}</span>
  //                         </span>
  //                       </div>

  //                       <button type="button" style={detailsBtn} onClick={() => onOpenDetails?.(auction.id)}>
  //                         ⓘ More Details
  //                       </button>

  //                       <div style={leadingBidderRow}>
  //                         {hasLeadingBidder ? (
  //                           <>
  //                             <div style={leadingLeft}>
  //                               <div style={leadingRank}>#1</div>

  //                               <div style={leadingAvatarWrap}>
  //                                 {auction.topBidderAvatarUrl ? (
  //                                   <img
  //                                     src={auction.topBidderAvatarUrl}
  //                                     alt="bidder avatar"
  //                                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
  //                                   />
  //                                 ) : (
  //                                   <span>{initials(auction.topBidderUsername ?? "")}</span>
  //                                 )}
  //                               </div>

  //                               <div style={leadingNameCol}>
  //                                 <div style={leadingUsername}>{auction.topBidderUsername}</div>
  //                                 <div style={leadingLabel}>Leading bidder</div>
  //                               </div>
  //                             </div>

  //                             <div style={leadingAmount}>{auction.topBidAmount} €</div>
  //                           </>
  //                         ) : (
  //                           <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
  //                             <div
  //                               style={{
  //                                 width: leadingSize,
  //                                 height: leadingSize,
  //                                 borderRadius: 999,
  //                                 background: "#E5E7EB",
  //                                 display: "grid",
  //                                 placeItems: "center",
  //                                 fontWeight: 900,
  //                                 color: "#6B7280",
  //                                 flex: "0 0 auto",
  //                                 fontSize: isMobile ? 12 : 14,
  //                               }}
  //                             >
  //                               🏷️
  //                             </div>

  //                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
  //                               <div
  //                                 style={{
  //                                   fontWeight: 900,
  //                                   color: "#111827",
  //                                   fontSize: isMobile ? 13 : 14,
  //                                   lineHeight: 1.15,
  //                                   display: "-webkit-box",
  //                                   WebkitBoxOrient: "vertical",
  //                                   WebkitLineClamp: 2,
  //                                   overflow: "hidden",
  //                                 }}
  //                               >
  //                                 Be the first one to bid
  //                               </div>
  //                               <div
  //                                 style={{
  //                                   fontWeight: 700,
  //                                   color: "#6B7280",
  //                                   fontSize: isMobile ? 12 : 13,
  //                                   lineHeight: 1.15,
  //                                 }}
  //                               >
  //                                 No bids yet.
  //                               </div>
  //                             </div>
  //                           </div>
  //                         )}
  //                       </div>

  //                       {active && (
  //                         <div style={bidRow}>
  //                           <div style={{ fontSize: isMobile ? 11.5 : 12, color: "#6B7280" }}>
  //                             Place Bid (min {formatMoney(minBid)})
  //                           </div>

  //                           <div style={bidInputWrap}>
  //                             <input
  //                               type="number"
  //                               min="0"
  //                               step="0.01"
  //                               placeholder="€"
  //                               value={bidInputs[auction.id] ?? ""}
  //                               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  //                                 setBidInputs((prev) => ({ ...prev, [auction.id]: e.target.value }))
  //                               }
  //                               style={bidInput}
  //                               disabled={!canBid}
  //                             />

  //                             {!isAuthenticated ? (
  //                               <button type="button" style={primaryBtn} onClick={() => onSignIn?.()}>
  //                                 Sign in to Bid
  //                               </button>
  //                             ) : auction.eligibleForBid ? (
  //                               <button type="button" style={primaryBtn} onClick={() => void handleBidClick(auction)}>
  //                                 Bid
  //                               </button>
  //                             ) : (
  //                               <button type="button" style={disabledPrimaryBtn} disabled title="Δεν είσαι eligible για bid">
  //                                 Not eligible
  //                               </button>
  //                             )}
  //                           </div>

  //                           {/* ✅ inline message right where the user did the error */}
  //                           {notice && (
  //                             <InlineNotice
  //                               type={notice.type}
  //                               message={notice.message}
  //                               onClose={() => dismissBidNotice(auction.id)}
  //                             />
  //                           )}
  //                         </div>
  //                       )}
  //                     </div>
  //                   </div>
  //                 );
  //               })}
  //             </div>

  //             <div style={{ ...pagination, flexDirection: "column", alignItems: "center", gap: 8 }}>
  //               <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", width: "100%" }}>
  //                 <button type="button" style={btn} onClick={handlePrevPage} disabled={loading || !pageData || pageData.first}>
  //                   ← Previous
  //                 </button>

  //                 <button type="button" style={btn} onClick={handleNextPage} disabled={loading || !pageData || pageData.last}>
  //                   Next →
  //                 </button>
  //               </div>

  //               {pageData && (
  //                 <div style={{ marginTop: 2, color: "#6B7280", fontWeight: 700 }}>
  //                   Page <strong style={{ color: "#111827" }}>{page + 1}</strong> of{" "}
  //                   <strong style={{ color: "#111827" }}>{Math.max(pageData.totalPages, 1)}</strong>
  //                 </div>
  //               )}
  //             </div>
  //           </>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  // export default AuctionsPage;

  ///////////////// VERSION 4 /////////////////////////
  // /
  // src/components/AuctionsPage.tsx

// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";
// import { getAuctions } from "../api/Springboot/backendAuctionService";
// import { placeBid } from "../api/Springboot/BackendBidService";

// import { Client } from "@stomp/stompjs";
// import type { IMessage, StompSubscription, IStompSocket } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// import { getCategories, type CategoryDto } from "../api/Springboot/backendCategoryService";

// interface AuctionsPageProps {
//   onOpenDetails?: (auctionId: number) => void;

//   currentUser?: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;

//   onSignIn?: () => void;

//   onCreateAuction?: () => void;
//   onViewMyBids?: () => void;
// }

// type AuctionListItemUI = AuctionListItem & {
//   sellerAvatarUrl?: string | null;
//   topBidderAvatarUrl?: string | null;
// };

// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
//   bidderAvatarUrl?: string | null;
// }

// type InlineNoticeType = "success" | "error";

// const AuctionsPage: React.FC<AuctionsPageProps> = ({
//   onOpenDetails,
//   currentUser,
//   onSignIn,
//   onCreateAuction,
//   onViewMyBids,
// }) => {
//   const [search, setSearch] = useState<string>("");
//   const [categoryId, setCategoryId] = useState<string>("");

//   const [sortBy, setSortBy] = useState<string>("endDate");
//   const [direction, setDirection] = useState<string>("asc");

//   const [region, setRegion] = useState<string>("");
//   const [country, setCountry] = useState<string>("");

//   const [expiredLast7Days, setExpiredLast7Days] = useState<boolean>(false);

//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] = useState<SpringPage<AuctionListItemUI> | null>(null);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [bidInputs, setBidInputs] = useState<Record<number, string>>({});

//   const [categories, setCategories] = useState<CategoryDto[]>([]);

//   const [now, setNow] = useState<Date>(new Date());

//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const subscriptionsRef = useRef<Record<number, StompSubscription>>({});

//   // ✅ Inline notices per auction (no browser alerts)
//   const [bidNoticeByAuctionId, setBidNoticeByAuctionId] = useState<
//     Record<number, { type: InlineNoticeType; message: string } | undefined>
//   >({});
//   const bidNoticeTimersRef = useRef<Record<number, number>>({});

//   const dismissBidNotice = useCallback((auctionId: number) => {
//     const t = bidNoticeTimersRef.current[auctionId];
//     if (t) {
//       window.clearTimeout(t);
//       delete bidNoticeTimersRef.current[auctionId];
//     }
//     setBidNoticeByAuctionId((prev) => {
//       if (!prev[auctionId]) return prev;
//       const next = { ...prev };
//       delete next[auctionId];
//       return next;
//     });
//   }, []);

//   const showBidNotice = useCallback((auctionId: number, type: InlineNoticeType, message: string) => {
//     // clear old timer
//     const old = bidNoticeTimersRef.current[auctionId];
//     if (old) window.clearTimeout(old);

//     setBidNoticeByAuctionId((prev) => ({
//       ...prev,
//       [auctionId]: { type, message },
//     }));

//     bidNoticeTimersRef.current[auctionId] = window.setTimeout(() => {
//       setBidNoticeByAuctionId((prev) => {
//         if (!prev[auctionId]) return prev;
//         const next = { ...prev };
//         delete next[auctionId];
//         return next;
//       });
//       delete bidNoticeTimersRef.current[auctionId];
//     }, 4500);
//   }, []);

//   useEffect(() => {
//     return () => {
//       Object.values(bidNoticeTimersRef.current).forEach((t) => window.clearTimeout(t));
//       bidNoticeTimersRef.current = {};
//     };
//   }, []);

//   // ✅ prune notices when page changes (avoid keeping notices for auctions not shown)
//   useEffect(() => {
//     if (!pageData) return;
//     const ids = new Set(pageData.content.map((a) => a.id));

//     setBidNoticeByAuctionId((prev) => {
//       const next: Record<number, { type: InlineNoticeType; message: string } | undefined> = { ...prev };
//       Object.keys(next).forEach((k) => {
//         const id = Number(k);
//         if (!ids.has(id)) {
//           const t = bidNoticeTimersRef.current[id];
//           if (t) {
//             window.clearTimeout(t);
//             delete bidNoticeTimersRef.current[id];
//           }
//           delete next[id];
//         }
//       });
//       return next;
//     });
//   }, [pageData]);

//   // ✅ More Filters dropdown
//   const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

//   // anchor/button + dropdown refs
//   const moreFiltersAnchorRef = useRef<HTMLDivElement | null>(null);
//   const moreFiltersBtnRef = useRef<HTMLButtonElement | null>(null);
//   const moreFiltersDropdownRef = useRef<HTMLDivElement | null>(null);

//   // dropdown absolute position in document (so it scrolls away with page)
//   const [moreFiltersPos, setMoreFiltersPos] = useState<{ top: number; left: number; width: number } | null>(null);

//   // -----------------------------
//   // ✅ Responsive breakpoints
//   // -----------------------------
//   const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1280));

//   useEffect(() => {
//     const onResize = () => setVw(window.innerWidth);
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isMobile = vw <= 640; // phones
//   const isTablet = vw > 640 && vw <= 1024; // tablets

//   const isAuthenticated = !!currentUser;
//   const isAuctioneerOrAdmin = currentUser?.roleName === "Auctioneer" || currentUser?.roleName === "Admin";

//   useEffect(() => {
//     const timer = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const data = await getCategories();
//         setCategories(data);
//       } catch (err) {
//         console.error("Failed to load categories", err);
//       }
//     };
//     void loadCategories();
//   }, []);

//   useEffect(() => {
//     const socket = new SockJS("/ws");
//     const client = new Client({
//       webSocketFactory: () => socket as unknown as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {},
//     });

//     client.onConnect = () => setStompClient(client);

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

//   useEffect(() => {
//     if (!stompClient || !stompClient.connected || !pageData) return;

//     const subs = subscriptionsRef.current;
//     const currentIds = new Set(pageData.content.map((a) => a.id));

//     pageData.content.forEach((auction) => {
//       if (subs[auction.id]) return;

//       const destination = `/topic/auctions/${auction.id}`;
//       const sub = stompClient.subscribe(destination, (message: IMessage) => {
//         try {
//           const payload: BidEventDto = JSON.parse(message.body);

//           setPageData((prev) => {
//             if (!prev) return prev;
//             if (!prev.content.some((a) => a.id === payload.auctionId)) return prev;

//             return {
//               ...prev,
//               content: prev.content.map((a) =>
//                 a.id === payload.auctionId
//                   ? {
//                       ...a,
//                       topBidAmount: payload.amount,
//                       topBidderUsername: payload.bidderUsername,
//                       topBidderAvatarUrl: payload.bidderAvatarUrl ?? a.topBidderAvatarUrl ?? null,
//                       endDate: payload.newEndDate,
//                     }
//                   : a
//               ),
//             };
//           });
//         } catch (err) {
//           console.error("Failed to parse BidEventDto", err);
//         }
//       });

//       subs[auction.id] = sub;
//     });

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

//       const uiResult: SpringPage<AuctionListItemUI> = {
//         ...result,
//         content: result.content as AuctionListItemUI[],
//       };

//       setPageData(uiResult);
//       setPage(pageToLoad);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των auctions.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtersKey = useMemo(() => {
//     return JSON.stringify({
//       search,
//       categoryId,
//       sortBy,
//       direction,
//       region,
//       country,
//       expiredLast7Days,
//     });
//   }, [search, categoryId, sortBy, direction, region, country, expiredLast7Days]);

//   useEffect(() => {
//     const t = window.setTimeout(() => {
//       void loadAuctions(0);
//     }, 350);
//     return () => window.clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filtersKey]);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     void loadAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     void loadAuctions(page + 1);
//   };

//   const toTitleCase = (s: string) => (s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [first] = sellerLocation.split(",");
//     return toTitleCase(first.trim());
//   };

//   const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
//     const end = new Date(endDateIso);
//     const diffMs = end.getTime() - nowValue.getTime();

//     if (Number.isNaN(end.getTime())) return endDateIso;
//     if (diffMs <= 0) return "Ended";

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

//   const nf = useMemo(
//     () =>
//       new Intl.NumberFormat("en-US", {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 2,
//       }),
//     []
//   );

//   const asNumber = (v: unknown): number => {
//     if (typeof v === "number") return v;
//     if (typeof v === "string") {
//       const n = Number(v);
//       return Number.isFinite(n) ? n : 0;
//     }
//     return 0;
//   };

//   const formatMoney = (v: unknown): string => `${nf.format(asNumber(v))}€`;

//   const computeMinBid = (a: AuctionListItemUI): number => {
//     const top = a.topBidAmount != null ? asNumber(a.topBidAmount) : null;
//     if (top == null) return asNumber(a.startingAmount);
//     return top + asNumber(a.minBidIncrement);
//   };

//   const initials = (username: string) => {
//     if (!username) return "?";
//     return username.trim().slice(0, 1).toUpperCase();
//   };

//   const Avatar: React.FC<{ url?: string | null; username: string; size?: number }> = ({ url, username, size = 34 }) => {
//     const s = `${size}px`;
//     const baseStyle: React.CSSProperties = {
//       width: s,
//       height: s,
//       borderRadius: "999px",
//       display: "inline-flex",
//       alignItems: "center",
//       justifyContent: "center",
//       flexShrink: 0,
//       overflow: "hidden",
//       background: "#EEF2FF",
//       color: "#1F2A44",
//       fontWeight: 700,
//       border: "1px solid rgba(17, 24, 39, 0.08)",
//     };

//     if (url) {
//       return (
//         <span style={baseStyle}>
//           <img src={url} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//         </span>
//       );
//     }

//     return <span style={baseStyle}>{initials(username)}</span>;
//   };

//   const InlineNotice: React.FC<{
//     type: InlineNoticeType;
//     message: string;
//     onClose: () => void;
//   }> = ({ type, message, onClose }) => {
//     const isErr = type === "error";
//     return (
//       <div
//         style={{
//           marginTop: 8,
//           padding: "10px 12px",
//           borderRadius: 14,
//           border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
//           background: isErr ? "#FEF2F2" : "#F0FDF4",
//           color: isErr ? "#991B1B" : "#166534",
//           fontWeight: 900,
//           fontSize: 13,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           gap: 12,
//         }}
//         role="status"
//         aria-live="polite"
//       >
//         <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>{message}</div>

//         {/* ✅ fixed centered X (same as AuctionDetails) */}
//         <button
//           type="button"
//           onClick={onClose}
//           aria-label="Close message"
//           style={{
//             flex: "0 0 auto",
//             width: 30,
//             height: 30,
//             padding: 0,
//             borderRadius: 10,
//             border: "1px solid rgba(17,24,39,0.12)",
//             background: "rgba(255,255,255,0.75)",
//             cursor: "pointer",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontWeight: 950,
//             fontSize: 16,
//             lineHeight: 1,
//           }}
//           title="Close"
//         >
//           <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
//         </button>
//       </div>
//     );
//   };

//   const handleBidClick = async (auction: AuctionListItemUI) => {
//     if (!isAuthenticated) {
//       onSignIn?.();
//       return;
//     }

//     const raw = bidInputs[auction.id];

//     if (!raw || raw.trim() === "") {
//       showBidNotice(auction.id, "error", "Συμπλήρωσε ποσό προσφοράς.");
//       return;
//     }

//     const amount = Number(raw);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       showBidNotice(auction.id, "error", "Μη έγκυρο ποσό.");
//       return;
//     }

//     try {
//       await placeBid(auction.id, amount);

//       setPageData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           content: prev.content.map((a) =>
//             a.id === auction.id
//               ? {
//                   ...a,
//                   topBidAmount: a.topBidAmount != null && asNumber(a.topBidAmount) > amount ? a.topBidAmount : amount,
//                 }
//               : a
//           ),
//         };
//       });

//       setBidInputs((prev) => ({ ...prev, [auction.id]: "" }));
//       showBidNotice(auction.id, "success", "Η προσφορά καταχωρήθηκε με επιτυχία!");
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά την προσφορά.";
//       if (err instanceof Error && err.message) message = err.message;
//       showBidNotice(auction.id, "error", message);
//     }
//   };

//   // -----------------------------
//   // ✅ More Filters position + outside click (PORTAL)
//   // -----------------------------
//   const computeMoreFiltersPos = (): { top: number; left: number; width: number } | null => {
//     const btnEl = moreFiltersBtnRef.current;
//     if (!btnEl) return null;

//     const r = btnEl.getBoundingClientRect();
//     const margin = 12;
//     const desiredWidth = isMobile ? Math.min(window.innerWidth - margin * 2, 520) : 520;

//     let left = r.left + window.scrollX;
//     const maxLeft = window.scrollX + window.innerWidth - margin - desiredWidth;
//     left = Math.min(left, maxLeft);
//     left = Math.max(left, window.scrollX + margin);

//     const top = r.bottom + window.scrollY + 8;
//     return { top, left, width: desiredWidth };
//   };

//   useEffect(() => {
//     if (!showMoreFilters) {
//       setMoreFiltersPos(null);
//       return;
//     }
//     setMoreFiltersPos(computeMoreFiltersPos());

//     const onResize = () => setMoreFiltersPos(computeMoreFiltersPos());
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showMoreFilters, vw]);

//   useEffect(() => {
//     if (!showMoreFilters) return;

//     const onMouseDown = (e: MouseEvent) => {
//       const target = e.target as Node;

//       const anchor = moreFiltersAnchorRef.current;
//       if (anchor && anchor.contains(target)) return;

//       const dd = moreFiltersDropdownRef.current;
//       if (dd && dd.contains(target)) return;

//       setShowMoreFilters(false);
//     };

//     window.addEventListener("mousedown", onMouseDown);
//     return () => window.removeEventListener("mousedown", onMouseDown);
//   }, [showMoreFilters]);

//   // -----------------------------
//   // ✅ Styles
//   // -----------------------------
//   const pageOuter: React.CSSProperties = {
//     width: "100%",
//     minHeight: "100vh",
//     background: "#F5F6F8",
//   };

//   const container: React.CSSProperties = {
//     width: "100%",
//     maxWidth: "100%",
//     margin: 0,
//     padding: isMobile ? "12px 12px 28px" : isTablet ? "16px 18px 36px" : "18px 24px 40px",
//     boxSizing: "border-box",
//   };

//   const topBar: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr auto" : "minmax(320px, 560px) 1fr minmax(140px, 220px)",
//     alignItems: "center",
//     gap: isMobile ? 10 : 16,
//     padding: "8px 0 12px",
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const searchWrap: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     background: "#F0F1F3",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     borderRadius: 12,
//     padding: isMobile ? "9px 10px" : "10px 12px",
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const inputStyle: React.CSSProperties = {
//     width: "100%",
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     fontSize: 14,
//   };

//   const resultsRight: React.CSSProperties = {
//     justifySelf: isMobile ? "start" : "end",
//     fontSize: 12,
//     color: "#6B7280",
//   };

//   const panel: React.CSSProperties = {
//     background: "#F3F4F6",
//     border: "1px solid rgba(17, 24, 39, 0.06)",
//     borderRadius: 16,
//     padding: isMobile ? 14 : 18,
//     boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   // ✅ Mobile only: τα 2 buttons δίπλα-δίπλα ΠΑΝΩ από το panel
//   const quickActionsRow: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     width: "100%",
//     flexDirection: "row",
//     flexWrap: "nowrap",
//     marginBottom: 12,
//   };

//   const chipsRow: React.CSSProperties = {
//     display: "flex",
//     flexWrap: isMobile ? "nowrap" : "wrap",
//     gap: 10,
//     marginTop: 10,
//     overflowX: isMobile ? "auto" : "visible",
//     WebkitOverflowScrolling: "touch",
//     paddingBottom: isMobile ? 6 : 0,
//   };

//   const chip = (active: boolean): React.CSSProperties => ({
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 8,
//     padding: "8px 12px",
//     borderRadius: 12,
//     border: active ? "1px solid #0B1220" : "1px solid rgba(17, 24, 39, 0.12)",
//     background: active ? "#0B1220" : "#FFFFFF",
//     color: active ? "#FFFFFF" : "#111827",
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: "pointer",
//     userSelect: "none",
//     flex: "0 0 auto",
//   });

//   const filtersRow: React.CSSProperties = {
//     marginTop: 14,
//     background: "#FFFFFF",
//     border: "1px solid rgba(17, 24, 39, 0.08)",
//     borderRadius: 14,
//     padding: 12,
//     display: "grid",
//     gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
//     gap: 12,
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const selectWrap: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     background: "#F3F4F6",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     borderRadius: 12,
//     padding: "10px 12px",
//     minWidth: 0,
//     boxSizing: "border-box",
//   };

//   const selectStyle: React.CSSProperties = {
//     width: "100%",
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#111827",
//     minWidth: 0,
//   };

//   // ✅ More Filters button
//   const moreFiltersRow: React.CSSProperties = {
//     marginTop: 14,
//     display: "flex",
//     justifyContent: "flex-start",
//   };

//   const moreFiltersWrap: React.CSSProperties = {
//     position: "relative",
//     width: isMobile ? "100%" : "auto",
//   };

//   const btn: React.CSSProperties = {
//     height: isMobile ? 34 : 36,
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 800,
//     fontSize: isMobile ? 12.5 : 13,
//     cursor: "pointer",
//     padding: "0 14px",
//     whiteSpace: "nowrap",
//   };

//   const moreFiltersBtn: React.CSSProperties = {
//     ...btn,
//     width: isMobile ? "100%" : "auto",
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//   };

//   // dropdown content (inside portal)
//   const dropdownShell = (pos: { top: number; left: number; width: number }): React.CSSProperties => ({
//     position: "absolute",
//     top: pos.top,
//     left: pos.left,
//     width: pos.width,
//     zIndex: 9999,
//     borderRadius: 14,
//     overflow: "auto",
//     maxHeight: "min(520px, calc(100vh - 24px))",
//   });

//   const filtersRowDropdown: React.CSSProperties = {
//     ...filtersRow,
//     marginTop: 0,
//     boxShadow: "0 18px 40px rgba(17,24,39,0.16)",
//   };

//   const grid: React.CSSProperties = {
//     marginTop: 18,
//     display: "grid",
//     gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
//     gap: isMobile ? 12 : 16,
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const card: React.CSSProperties = {
//     background: "#FFFFFF",
//     borderRadius: 16,
//     border: "1px solid rgba(17, 24, 39, 0.08)",
//     overflow: "hidden",
//     boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
//     display: "flex",
//     flexDirection: "column",
//   };

//   const imgWrap: React.CSSProperties = {
//     position: "relative",
//     height: isMobile ? 210 : 240,
//     background: "#E5E7EB",
//   };

//   // ✅ NEW: one row container for BOTH badges (time + category)
//   const topBadgesRow: React.CSSProperties = {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     right: 10,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 10,
//     zIndex: 3,
//     pointerEvents: "none",
//   };

//   // ✅ UPDATED: badgeLeft (μικρό, δεν απλώνεται)
// const badgeLeft: React.CSSProperties = {
//   display: "inline-flex",
//   alignItems: "center",
//   gap: 6,
//   padding: isMobile ? "5px 8px" : "6px 10px",
//   borderRadius: 999,
//   background: "rgba(255,255,255,0.92)",
//   border: "1px solid rgba(17, 24, 39, 0.10)",
//   fontSize: isMobile ? 11 : 12,
//   fontWeight: 800,
//   color: "#111827",
//   boxSizing: "border-box",
//   whiteSpace: "nowrap",
//   overflow: "hidden",
//   textOverflow: "ellipsis",

//   // 🔥 βασικό fix:
//   flex: "0 1 auto",
//   width: "fit-content",
//   maxWidth: "62%", // για να μην “σπρώχνει” την κατηγορία
// };

// // (προαιρετικό αλλά καλό) κράτα και το badgeRight λίγο πιο “σφιχτό”
// const badgeRight: React.CSSProperties = {
//   padding: isMobile ? "5px 9px" : "6px 10px",
//   borderRadius: 999,
//   background: "rgba(255,255,255,0.92)",
//   border: "1px solid rgba(17, 24, 39, 0.10)",
//   fontSize: isMobile ? 11 : 12,
//   fontWeight: 800,
//   color: "#111827",
//   boxSizing: "border-box",
//   whiteSpace: "nowrap",
//   overflow: "hidden",
//   textOverflow: "ellipsis",
//   minWidth: 0,

//   flex: "0 1 auto",
//   maxWidth: "45%",
// };


//   // ✅ UPDATED: ensure overlay doesn't cover badges
//   const endedOverlay: React.CSSProperties = {
//     position: "absolute",
//     inset: 0,
//     zIndex: 2,
//     background: "rgba(0,0,0,0.35)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     color: "#FFFFFF",
//     fontWeight: 900,
//     letterSpacing: 0.5,
//     textTransform: "uppercase",
//     textAlign: "center",
//     padding: "0 10px",
//   };

//   const body: React.CSSProperties = {
//     padding: isMobile ? 12 : 14,
//     display: "flex",
//     flexDirection: "column",
//     gap: isMobile ? 8 : 10,
//   };

//   const sellerBox: React.CSSProperties = {
//     background: "#F3F4F6",
//     borderRadius: 14,
//     padding: isMobile ? 10 : 12,
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//   };

//   const sellerInfoCol: React.CSSProperties = {
//     display: "grid",
//     gap: 1,
//     minWidth: 0,
//     flex: 1,
//     paddingTop: 2,
//   };

//   const sellerNameRow: React.CSSProperties = {
//     display: "flex",
//     alignItems: "baseline",
//     gap: 8,
//     minWidth: 0,
//   };

//   const sellerUsernameStyle: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: isMobile ? 15 : 16,
//     lineHeight: 1.1,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     flex: "1 1 auto",
//     minWidth: 0,
//   };

//   const sellerLocationInline: React.CSSProperties = {
//     fontSize: isMobile ? 13 : 12,
//     color: "#2563EB",
//     whiteSpace: "nowrap",
//     flex: "0 0 auto",
//   };

//   const titleStyle: React.CSSProperties = {
//     margin: 0,
//     fontSize: isMobile ? 15 : 18,
//     fontWeight: 800,
//     color: "#111827",
//     lineHeight: 1.2,
//     display: "-webkit-box",
//     WebkitBoxOrient: "vertical",
//     WebkitLineClamp: isMobile ? 2 : 3,
//     overflow: "hidden",
//   };

//   const descStyle: React.CSSProperties = {
//     margin: 0,
//     fontSize: isMobile ? 12.5 : 13,
//     color: "#4B5563",
//     lineHeight: 1.35,
//     display: "-webkit-box",
//     WebkitBoxOrient: "vertical",
//     WebkitLineClamp: isMobile ? 2 : 3,
//     overflow: "hidden",
//   };

//   const metaRow: React.CSSProperties = {
//     display: "flex",
//     justifyContent: "space-between",
//     gap: 10,
//     fontSize: isMobile ? 11.5 : 12,
//     color: "#6B7280",
//     alignItems: "center",
//     flexWrap: "nowrap",
//   };

//   const metaLeft: React.CSSProperties = {
//     flex: "1 1 0",
//     minWidth: 0,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const metaRight: React.CSSProperties = {
//     flex: "0 0 auto",
//     whiteSpace: "nowrap",
//     textAlign: "right",
//   };

//   const detailsBtn: React.CSSProperties = {
//     ...btn,
//     width: "100%",
//     justifyContent: "center",
//   };

//   const primaryBtn: React.CSSProperties = {
//     ...btn,
//     background: "#0B1220",
//     color: "#FFFFFF",
//     border: "1px solid #0B1220",
//   };

//   const disabledPrimaryBtn: React.CSSProperties = {
//     ...primaryBtn,
//     opacity: 0.55,
//     cursor: "not-allowed",
//   };

//   const actionBtnLight: React.CSSProperties = {
//     height: isMobile ? 38 : 40,
//     padding: isMobile ? "0 10px" : "0 14px",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 900,
//     fontSize: isMobile ? 12.5 : 14,
//     cursor: "pointer",
//     display: "inline-flex",
//     alignItems: "center",
//     gap: isMobile ? 6 : 10,
//     justifyContent: "center",
//     whiteSpace: "nowrap",
//     minWidth: 0,
//     flex: isMobile ? "1 1 0" : "0 0 auto",
//     width: "auto",
//   };

//   const actionBtnDark: React.CSSProperties = {
//     ...actionBtnLight,
//     background: "#000000f1",
//     border: "1px solid #0B1220",
//     color: "#ffffffff",
//   };

//   const bidRow: React.CSSProperties = {
//     marginTop: 4,
//     display: "grid",
//     gridTemplateColumns: "1fr",
//     gap: 8,
//   };

//   const bidInputWrap: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "1fr auto",
//     gap: 10,
//     alignItems: "center",
//     width: "100%",
//   };

//   const bidInput: React.CSSProperties = {
//     width: "100%",
//     height: 36,
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     padding: "0 10px",
//     outline: "none",
//     fontWeight: 700,
//     boxSizing: "border-box",
//     minWidth: 0,
//   };

//   const pagination: React.CSSProperties = {
//     marginTop: 18,
//     display: "flex",
//     justifyContent: "center",
//     gap: 10,
//   };

//   const leadingSize = isMobile ? 32 : 40;

//   const leadingBidderRow: React.CSSProperties = {
//     marginTop: 10,
//     borderRadius: 14,
//     border: "2px solid rgba(59,130,246,0.45)",
//     background: "rgba(59,130,246,0.06)",
//     padding: isMobile ? 10 : 12,
//     display: "grid",
//     gridTemplateColumns: "1fr auto",
//     alignItems: "center",
//     gap: 10,
//     minWidth: 0,
//   };

//   const leadingLeft: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     minWidth: 0,
//     overflow: "hidden",
//   };

//   const leadingRank: React.CSSProperties = {
//     width: leadingSize,
//     height: leadingSize,
//     borderRadius: 999,
//     background: "#2563EB",
//     color: "#FFFFFF",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//     flex: "0 0 auto",
//     fontSize: isMobile ? 11 : 13,
//   };

//   const leadingAvatarWrap: React.CSSProperties = {
//     width: leadingSize,
//     height: leadingSize,
//     borderRadius: 999,
//     background: "#E5E7EB",
//     display: "grid",
//     placeItems: "center",
//     overflow: "hidden",
//     flex: "0 0 auto",
//     fontSize: isMobile ? 12 : 14,
//     fontWeight: 900,
//     color: "#1F2A44",
//   };

//   const leadingNameCol: React.CSSProperties = {
//     display: "grid",
//     gap: 1,
//     minWidth: 0,
//     overflow: "hidden",
//   };

//   const leadingUsername: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: isMobile ? 13 : 14,
//     lineHeight: 1.1,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const leadingLabel: React.CSSProperties = {
//     fontWeight: 700,
//     color: "#6B7280",
//     fontSize: isMobile ? 12 : 13,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const leadingAmount: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#2563EB",
//     flex: "0 0 auto",
//     whiteSpace: "nowrap",
//     fontSize: isMobile ? 12.5 : 14,
//   };

//   const totalResults = pageData?.totalElements ?? 0;

//   return (
//     <div style={pageOuter}>
//       <div style={container}>
//         <div style={topBar}>
//           <div style={searchWrap}>
//             <span style={{ fontSize: 14, opacity: 0.7 }}>🔍</span>
//             <input
//               type="text"
//               placeholder="Search auctions..."
//               value={search}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
//               style={inputStyle}
//             />
//           </div>

//           <div style={resultsRight}>{loading ? "Loading..." : `${totalResults} results`}</div>
//         </div>

//         {/* ✅ Mobile: actions πάνω από panel, δίπλα-δίπλα */}
//         {isMobile && (
//           <div style={quickActionsRow}>
//             {isAuctioneerOrAdmin && (
//               <button type="button" style={actionBtnDark} onClick={onCreateAuction}>
//                     <span style={{ color: "#008FFF", fontWeight: 700, marginRight: 3  ,fontSize:25,marginBottom:4.5,outlineColor:"white"}}>+</span>
//                 <span>Create Auction</span>
//               </button>
//             )}

//             {isAuthenticated && (
//               <button type="button" style={actionBtnLight} onClick={onViewMyBids}>
//                 ☰ <span>View my bids</span>
//               </button>
//             )}
//           </div>
//         )}

//         <div style={panel}>
//           <div
//             style={{
//               display: "flex",
//               alignItems: isMobile ? "stretch" : "center",
//               justifyContent: "space-between",
//               gap: 12,
//               flexDirection: isMobile ? "column" : "row",
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <span style={{ fontSize: 16, opacity: 0.7 }}>⎇</span>
//               <div style={{ fontWeight: 800, color: "#111827" }}>Filter by category</div>
//             </div>

//             {!isMobile && (
//               <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//                 {isAuctioneerOrAdmin && (
//                   <button type="button" style={actionBtnDark} onClick={onCreateAuction}>
//                     <span style={{ color: "#008FFF", fontWeight: 700, marginRight: 2  ,fontSize:30,marginBottom:7,outlineColor:"white"}}>+</span>
//                     <span>Create Auction</span>
//                   </button>
//                 )}

//                 {isAuthenticated && (
//                   <button type="button" style={actionBtnLight} onClick={onViewMyBids}>
//                     ☰ <span>View my bids</span>
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           <div style={chipsRow}>
//             <button type="button" style={chip(categoryId === "")} onClick={() => setCategoryId("")}>
//               ⭐ All Items
//             </button>

//             {categories.map((c) => (
//               <button
//                 key={c.id}
//                 type="button"
//                 style={chip(categoryId === c.id.toString())}
//                 onClick={() => setCategoryId(c.id.toString())}
//               >
//                 {c.name}
//               </button>
//             ))}
//           </div>

//           {/* ✅ More Filters dropdown button (portal fixes clipping on laptops) */}
//           <div style={moreFiltersRow} ref={moreFiltersAnchorRef}>
//             <div style={moreFiltersWrap}>
//               <button
//                 ref={moreFiltersBtnRef}
//                 type="button"
//                 style={moreFiltersBtn}
//                 onClick={() => setShowMoreFilters((v) => !v)}
//               >
//                 More Filters <span style={{ opacity: 0.75 }}>{showMoreFilters ? "▲" : "▼"}</span>
//               </button>
//             </div>
//           </div>

//           {/* ✅ Dropdown rendered in document.body so it never gets clipped */}
//           {showMoreFilters &&
//             moreFiltersPos &&
//             typeof document !== "undefined" &&
//             createPortal(
//               <div ref={moreFiltersDropdownRef} style={dropdownShell(moreFiltersPos)}>
//                 <div style={filtersRowDropdown}>
//                   <div style={selectWrap}>
//                     <span style={{ fontSize: 14, opacity: 0.7 }}>📅</span>
//                     <select
//                       value={`${sortBy}:${direction}`}
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
//                         const [sb, dir] = e.target.value.split(":");
//                         setSortBy(sb);
//                         setDirection(dir);
//                       }}
//                       style={selectStyle}
//                     >
//                       <option value="endDate:asc">End Date (Ending Soon)</option>
//                       <option value="endDate:desc">End Date (Ending Late)</option>
//                       <option value="startDate:asc">Start Date (Soonest)</option>
//                       <option value="startDate:desc">Start Date (Latest)</option>
//                     </select>
//                   </div>

//                   <div style={selectWrap}>
//                     <span style={{ fontSize: 14, opacity: 0.7 }}>📍</span>
//                     <select
//                       value={region}
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
//                         const r = e.target.value;
//                         setRegion(r);
//                         setCountry(r ? "Cyprus" : "");
//                       }}
//                       style={selectStyle}
//                     >
//                       <option value="">All Locations</option>
//                       <option value="NICOSIA">Nicosia</option>
//                       <option value="LIMASSOL">Limassol</option>
//                       <option value="PAPHOS">Paphos</option>
//                       <option value="FAMAGUSTA">Famagusta</option>
//                     </select>
//                   </div>

//                   <div style={selectWrap}>
//                     <span style={{ fontSize: 14, opacity: 0.7 }}>↕</span>
//                     <select
//                       value={expiredLast7Days ? "EXPIRED7" : "ACTIVE"}
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExpiredLast7Days(e.target.value === "EXPIRED7")}
//                       style={selectStyle}
//                     >
//                       <option value="ACTIVE">Active Auctions</option>
//                       <option value="EXPIRED7">Expired (last 7 days)</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>,
//               document.body
//             )}

//           {error && (
//             <div style={{ marginTop: 12, color: "#B91C1C", fontWeight: 800 }}>
//               Σφάλμα: {error}
//             </div>
//           )}
//         </div>

//         {pageData && (
//           <>
//             <div style={grid}>
//               {pageData.content.map((auction) => {
//                 const active = isAuctionActive(auction.endDate, now);
//                 const timeLabel = formatTimeRemaining(auction.endDate, now);
//                 const minBid = computeMinBid(auction);
//                 const hasLeadingBidder = auction.topBidAmount != null && (auction.topBidderUsername ?? "").trim().length > 0;
//                 const canBid = active && auction.eligibleForBid && isAuthenticated;

//                 const notice = bidNoticeByAuctionId[auction.id];

//                 return (
//                   <div key={auction.id} style={card}>
//                     <div style={imgWrap}>
//                       {auction.mainImageUrl ? (
//                         <img
//                           src={auction.mainImageUrl}
//                           alt={auction.title}
//                           style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
//                         />
//                       ) : (
//                         <div
//                           style={{
//                             width: "100%",
//                             height: "100%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: "#6B7280",
//                             fontWeight: 800,
//                           }}
//                         >
//                           No image
//                         </div>
//                       )}

//                       {/* ✅ UPDATED: both badges are now aligned top-left & top-right inline */}
//                       <div style={topBadgesRow}>
//                         <div style={badgeLeft}>
//                           <span style={{ opacity: 0.85 }}>⏱</span>
//                           <span style={{ color: timeLabel === "Ended" ? "#DC2626" : "#111827" }}>{timeLabel}</span>
//                         </div>

//                         <div style={badgeRight}>{auction.categoryName}</div>
//                       </div>

//                       {!active && <div style={endedOverlay}>AUCTION ENDED</div>}
//                     </div>

//                     <div style={body}>
//                       <div style={sellerBox}>
//                         <Avatar url={auction.sellerAvatarUrl ?? null} username={auction.sellerUsername} size={isMobile ? 40 : 41} />

//                         <div style={sellerInfoCol}>
//                           <div style={{ fontSize: isMobile ? 15 : 16, color: "#6B7280" }}>Seller</div>

//                           <div style={sellerNameRow}>
//                             <div style={sellerUsernameStyle} title={auction.sellerUsername}>
//                               {auction.sellerUsername}
//                             </div>

//                             <div style={sellerLocationInline}>📍 {getCityFromLocation(auction.sellerLocation)}</div>
//                           </div>
//                         </div>
//                       </div>

//                       <h3 style={titleStyle}>{auction.title}</h3>
//                       <p style={descStyle}>{auction.shortDescription}</p>

//                       <div style={metaRow}>
//                         <span style={metaLeft}>
//                           Starting price:{" "}
//                           <span style={{ fontWeight: 900, color: "#111827" }}>{formatMoney(auction.startingAmount)}</span>
//                         </span>

//                         <span style={metaRight}>
//                           Minimum raise:{" "}
//                           <span style={{ fontWeight: 900, color: "#111827" }}>{formatMoney(auction.minBidIncrement)}</span>
//                         </span>
//                       </div>

//                       <button type="button" style={detailsBtn} onClick={() => onOpenDetails?.(auction.id)}>
//                         ⓘ More Details
//                       </button>

//                       <div style={leadingBidderRow}>
//                         {hasLeadingBidder ? (
//                           <>
//                             <div style={leadingLeft}>
//                               <div style={leadingRank}>#1</div>

//                               <div style={leadingAvatarWrap}>
//                                 {auction.topBidderAvatarUrl ? (
//                                   <img
//                                     src={auction.topBidderAvatarUrl}
//                                     alt="bidder avatar"
//                                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                                   />
//                                 ) : (
//                                   <span>{initials(auction.topBidderUsername ?? "")}</span>
//                                 )}
//                               </div>

//                               <div style={leadingNameCol}>
//                                 <div style={leadingUsername}>{auction.topBidderUsername}</div>
//                                 <div style={leadingLabel}>Leading bidder</div>
//                               </div>
//                             </div>

//                             <div style={leadingAmount}>{auction.topBidAmount} €</div>
//                           </>
//                         ) : (
//                           <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                             <div
//                               style={{
//                                 width: leadingSize,
//                                 height: leadingSize,
//                                 borderRadius: 999,
//                                 background: "#E5E7EB",
//                                 display: "grid",
//                                 placeItems: "center",
//                                 fontWeight: 900,
//                                 color: "#6B7280",
//                                 flex: "0 0 auto",
//                                 fontSize: isMobile ? 12 : 14,
//                               }}
//                             >
//                               🏷️
//                             </div>

//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div
//                                 style={{
//                                   fontWeight: 900,
//                                   color: "#111827",
//                                   fontSize: isMobile ? 13 : 14,
//                                   lineHeight: 1.15,
//                                   display: "-webkit-box",
//                                   WebkitBoxOrient: "vertical",
//                                   WebkitLineClamp: 2,
//                                   overflow: "hidden",
//                                 }}
//                               >
//                                 Be the first one to bid
//                               </div>
//                               <div
//                                 style={{
//                                   fontWeight: 700,
//                                   color: "#6B7280",
//                                   fontSize: isMobile ? 12 : 13,
//                                   lineHeight: 1.15,
//                                 }}
//                               >
//                                 No bids yet.
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {active && (
//                         <div style={bidRow}>
//                           <div style={{ fontSize: isMobile ? 11.5 : 12, color: "#6B7280" }}>
//                             Place Bid (min {formatMoney(minBid)})
//                           </div>

//                           <div style={bidInputWrap}>
//                             <input
//                               type="number"
//                               min="0"
//                               step="0.01"
//                               placeholder="€"
//                               value={bidInputs[auction.id] ?? ""}
//                               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                                 setBidInputs((prev) => ({ ...prev, [auction.id]: e.target.value }))
//                               }
//                               style={bidInput}
//                               disabled={!canBid}
//                             />

//                             {!isAuthenticated ? (
//                               <button type="button" style={primaryBtn} onClick={() => onSignIn?.()}>
//                                 Sign in to Bid
//                               </button>
//                             ) : auction.eligibleForBid ? (
//                               <button type="button" style={primaryBtn} onClick={() => void handleBidClick(auction)}>
//                                 Bid
//                               </button>
//                             ) : (
//                               <button type="button" style={disabledPrimaryBtn} disabled title="Δεν είσαι eligible για bid">
//                                 Not eligible
//                               </button>
//                             )}
//                           </div>

//                           {/* ✅ inline message right where the user did the error */}
//                           {notice && (
//                             <InlineNotice
//                               type={notice.type}
//                               message={notice.message}
//                               onClose={() => dismissBidNotice(auction.id)}
//                             />
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div style={{ ...pagination, flexDirection: "column", alignItems: "center", gap: 8 }}>
//               <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", width: "100%" }}>
//                 <button type="button" style={btn} onClick={handlePrevPage} disabled={loading || !pageData || pageData.first}>
//                   ← Previous
//                 </button>

//                 <button type="button" style={btn} onClick={handleNextPage} disabled={loading || !pageData || pageData.last}>
//                   Next →
//                 </button>
//               </div>

//               {pageData && (
//                 <div style={{ marginTop: 2, color: "#6B7280", fontWeight: 700 }}>
//                   Page <strong style={{ color: "#111827" }}>{page + 1}</strong> of{" "}
//                   <strong style={{ color: "#111827" }}>{Math.max(pageData.totalPages, 1)}</strong>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuctionsPage;



///////////////// VERSION 5 //////////
// src/components/AuctionsPage.tsx
// src/components/AuctionsPage.tsx


// // src/components/AuctionsPage.tsx

// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";
// import { getAuctions } from "../api/Springboot/backendAuctionService";
// import { placeBid } from "../api/Springboot/BackendBidService";

// import { Client } from "@stomp/stompjs";
// import type { IMessage, StompSubscription, IStompSocket } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
// import { getCategories, type CategoryDto } from "../api/Springboot/backendCategoryService";

// interface AuctionsPageProps {
//   onOpenDetails?: (auctionId: number) => void;

//   currentUser?: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;

//   onSignIn?: () => void;

//   onCreateAuction?: () => void;
//   onViewMyBids?: () => void;
// }

// type AuctionListItemUI = AuctionListItem & {
//   sellerAvatarUrl?: string | null;
//   topBidderAvatarUrl?: string | null;
// };

// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
//   bidderAvatarUrl?: string | null;
// }

// type InlineNoticeType = "success" | "error";

// const AuctionsPage: React.FC<AuctionsPageProps> = ({
//   onOpenDetails,
//   currentUser,
//   onSignIn,
//   onCreateAuction,
//   onViewMyBids,
// }) => {
//   const [search, setSearch] = useState<string>("");
//   const [categoryId, setCategoryId] = useState<string>("");

//   const [sortBy, setSortBy] = useState<string>("endDate");
//   const [direction, setDirection] = useState<string>("asc");

//   const [region, setRegion] = useState<string>("");
//   const [country, setCountry] = useState<string>("");

//   const [expiredLast7Days, setExpiredLast7Days] = useState<boolean>(false);

//   const [page, setPage] = useState<number>(0);
//   const [pageData, setPageData] = useState<SpringPage<AuctionListItemUI> | null>(null);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [bidInputs, setBidInputs] = useState<Record<number, string>>({});

//   const [categories, setCategories] = useState<CategoryDto[]>([]);

//   const [now, setNow] = useState<Date>(new Date());

//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const subscriptionsRef = useRef<Record<number, StompSubscription>>({});

//   // ✅ Inline notices per auction (no browser alerts)
//   const [bidNoticeByAuctionId, setBidNoticeByAuctionId] = useState<
//     Record<number, { type: InlineNoticeType; message: string } | undefined>
//   >({});
//   const bidNoticeTimersRef = useRef<Record<number, number>>({});

//   const dismissBidNotice = useCallback((auctionId: number) => {
//     const t = bidNoticeTimersRef.current[auctionId];
//     if (t) {
//       window.clearTimeout(t);
//       delete bidNoticeTimersRef.current[auctionId];
//     }
//     setBidNoticeByAuctionId((prev) => {
//       if (!prev[auctionId]) return prev;
//       const next = { ...prev };
//       delete next[auctionId];
//       return next;
//     });
//   }, []);

//   const showBidNotice = useCallback((auctionId: number, type: InlineNoticeType, message: string) => {
//     // clear old timer
//     const old = bidNoticeTimersRef.current[auctionId];
//     if (old) window.clearTimeout(old);

//     setBidNoticeByAuctionId((prev) => ({
//       ...prev,
//       [auctionId]: { type, message },
//     }));

//     bidNoticeTimersRef.current[auctionId] = window.setTimeout(() => {
//       setBidNoticeByAuctionId((prev) => {
//         if (!prev[auctionId]) return prev;
//         const next = { ...prev };
//         delete next[auctionId];
//         return next;
//       });
//       delete bidNoticeTimersRef.current[auctionId];
//     }, 4500);
//   }, []);

//   useEffect(() => {
//     return () => {
//       Object.values(bidNoticeTimersRef.current).forEach((t) => window.clearTimeout(t));
//       bidNoticeTimersRef.current = {};
//     };
//   }, []);

//   // ✅ prune notices when page changes (avoid keeping notices for auctions not shown)
//   useEffect(() => {
//     if (!pageData) return;
//     const ids = new Set(pageData.content.map((a) => a.id));

//     setBidNoticeByAuctionId((prev) => {
//       const next: Record<number, { type: InlineNoticeType; message: string } | undefined> = { ...prev };
//       Object.keys(next).forEach((k) => {
//         const id = Number(k);
//         if (!ids.has(id)) {
//           const t = bidNoticeTimersRef.current[id];
//           if (t) {
//             window.clearTimeout(t);
//             delete bidNoticeTimersRef.current[id];
//           }
//           delete next[id];
//         }
//       });
//       return next;
//     });
//   }, [pageData]);

//   // ✅ More Filters dropdown
//   const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

//   // anchor/button + dropdown refs
//   const moreFiltersAnchorRef = useRef<HTMLDivElement | null>(null);
//   const moreFiltersBtnRef = useRef<HTMLButtonElement | null>(null);
//   const moreFiltersDropdownRef = useRef<HTMLDivElement | null>(null);

//   // dropdown absolute position in document (so it scrolls away with page)
//   const [moreFiltersPos, setMoreFiltersPos] = useState<{ top: number; left: number; width: number } | null>(null);

//   // -----------------------------
//   // ✅ Responsive breakpoints
//   // -----------------------------
//   const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1280));

//   useEffect(() => {
//     const onResize = () => setVw(window.innerWidth);
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isMobile = vw <= 640; // phones
//   const isTablet = vw > 640 && vw <= 1024; // tablets

//   const isAuthenticated = !!currentUser;
//   const isAuctioneerOrAdmin = currentUser?.roleName === "Auctioneer" || currentUser?.roleName === "Admin";

//   // ✅ current username (safe cast)
//   const currentUsername = ((currentUser as unknown as { username?: string } | null)?.username ?? "").trim().toLowerCase();

//   useEffect(() => {
//     const timer = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const data = await getCategories();
//         setCategories(data);
//       } catch (err) {
//         console.error("Failed to load categories", err);
//       }
//     };
//     void loadCategories();
//   }, []);

//   useEffect(() => {
//     const socket = new SockJS("/ws");
//     const client = new Client({
//       webSocketFactory: () => socket as unknown as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {},
//     });

//     client.onConnect = () => setStompClient(client);

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

//   useEffect(() => {
//     if (!stompClient || !stompClient.connected || !pageData) return;

//     const subs = subscriptionsRef.current;
//     const currentIds = new Set(pageData.content.map((a) => a.id));

//     pageData.content.forEach((auction) => {
//       if (subs[auction.id]) return;

//       const destination = `/topic/auctions/${auction.id}`;
//       const sub = stompClient.subscribe(destination, (message: IMessage) => {
//         try {
//           const payload: BidEventDto = JSON.parse(message.body);

//           setPageData((prev) => {
//             if (!prev) return prev;
//             if (!prev.content.some((a) => a.id === payload.auctionId)) return prev;

//             return {
//               ...prev,
//               content: prev.content.map((a) =>
//                 a.id === payload.auctionId
//                   ? {
//                       ...a,
//                       topBidAmount: payload.amount,
//                       topBidderUsername: payload.bidderUsername,
//                       topBidderAvatarUrl: payload.bidderAvatarUrl ?? a.topBidderAvatarUrl ?? null,
//                       endDate: payload.newEndDate,
//                     }
//                   : a
//               ),
//             };
//           });
//         } catch (err) {
//           console.error("Failed to parse BidEventDto", err);
//         }
//       });

//       subs[auction.id] = sub;
//     });

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

//       const uiResult: SpringPage<AuctionListItemUI> = {
//         ...result,
//         content: result.content as AuctionListItemUI[],
//       };

//       setPageData(uiResult);
//       setPage(pageToLoad);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση των auctions.";
//       if (err instanceof Error) message = err.message;
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtersKey = useMemo(() => {
//     return JSON.stringify({
//       search,
//       categoryId,
//       sortBy,
//       direction,
//       region,
//       country,
//       expiredLast7Days,
//     });
//   }, [search, categoryId, sortBy, direction, region, country, expiredLast7Days]);

//   useEffect(() => {
//     const t = window.setTimeout(() => {
//       void loadAuctions(0);
//     }, 350);
//     return () => window.clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filtersKey]);

//   const handlePrevPage = () => {
//     if (!pageData || pageData.first) return;
//     void loadAuctions(page - 1);
//   };

//   const handleNextPage = () => {
//     if (!pageData || pageData.last) return;
//     void loadAuctions(page + 1);
//   };

//   const toTitleCase = (s: string) => (s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [first] = sellerLocation.split(",");
//     return toTitleCase(first.trim());
//   };

//   const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
//     const end = new Date(endDateIso);
//     const diffMs = end.getTime() - nowValue.getTime();

//     if (Number.isNaN(end.getTime())) return endDateIso;
//     if (diffMs <= 0) return "Ended";

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

//   const nf = useMemo(
//     () =>
//       new Intl.NumberFormat("en-US", {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 2,
//       }),
//     []
//   );

//   const asNumber = (v: unknown): number => {
//     if (typeof v === "number") return v;
//     if (typeof v === "string") {
//       const n = Number(v);
//       return Number.isFinite(n) ? n : 0;
//     }
//     return 0;
//   };

//   const formatMoney = (v: unknown): string => `${nf.format(asNumber(v))}€`;

//   const computeMinBid = (a: AuctionListItemUI): number => {
//     const top = a.topBidAmount != null ? asNumber(a.topBidAmount) : null;
//     if (top == null) return asNumber(a.startingAmount);
//     return top + asNumber(a.minBidIncrement);
//   };

//   const initials = (username: string) => {
//     if (!username) return "?";
//     return username.trim().slice(0, 1).toUpperCase();
//   };

//   const Avatar: React.FC<{ url?: string | null; username: string; size?: number }> = ({ url, username, size = 34 }) => {
//     const s = `${size}px`;
//     const baseStyle: React.CSSProperties = {
//       width: s,
//       height: s,
//       borderRadius: "999px",
//       display: "inline-flex",
//       alignItems: "center",
//       justifyContent: "center",
//       flexShrink: 0,
//       overflow: "hidden",
//       background: "#EEF2FF",
//       color: "#1F2A44",
//       fontWeight: 700,
//       border: "1px solid rgba(17, 24, 39, 0.08)",
//     };

//     if (url) {
//       return (
//         <span style={baseStyle}>
//           <img src={url} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//         </span>
//       );
//     }

//     return <span style={baseStyle}>{initials(username)}</span>;
//   };

//   const InlineNotice: React.FC<{
//     type: InlineNoticeType;
//     message: string;
//     onClose: () => void;
//   }> = ({ type, message, onClose }) => {
//     const isErr = type === "error";
//     return (
//       <div
//         style={{
//           marginTop: 8,
//           padding: "10px 12px",
//           borderRadius: 14,
//           border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
//           background: isErr ? "#FEF2F2" : "#F0FDF4",
//           color: isErr ? "#991B1B" : "#166534",
//           fontWeight: 900,
//           fontSize: 13,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           gap: 12,
//         }}
//         role="status"
//         aria-live="polite"
//       >
//         <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>{message}</div>

//         {/* ✅ fixed centered X (same as AuctionDetails) */}
//         <button
//           type="button"
//           onClick={onClose}
//           aria-label="Close message"
//           style={{
//             flex: "0 0 auto",
//             width: 30,
//             height: 30,
//             padding: 0,
//             borderRadius: 10,
//             border: "1px solid rgba(17,24,39,0.12)",
//             background: "rgba(255,255,255,0.75)",
//             cursor: "pointer",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontWeight: 950,
//             fontSize: 16,
//             lineHeight: 1,
//           }}
//           title="Close"
//         >
//           <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
//         </button>
//       </div>
//     );
//   };

//   const handleBidClick = async (auction: AuctionListItemUI) => {
//     if (!isAuthenticated) {
//       onSignIn?.();
//       return;
//     }

//     const raw = bidInputs[auction.id];

//     if (!raw || raw.trim() === "") {
//       showBidNotice(auction.id, "error", "Συμπλήρωσε ποσό προσφοράς.");
//       return;
//     }

//     const amount = Number(raw);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       showBidNotice(auction.id, "error", "Μη έγκυρο ποσό.");
//       return;
//     }

//     try {
//       await placeBid(auction.id, amount);

//       setPageData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           content: prev.content.map((a) =>
//             a.id === auction.id
//               ? {
//                   ...a,
//                   topBidAmount: a.topBidAmount != null && asNumber(a.topBidAmount) > amount ? a.topBidAmount : amount,
//                 }
//               : a
//           ),
//         };
//       });

//       setBidInputs((prev) => ({ ...prev, [auction.id]: "" }));
//       showBidNotice(auction.id, "success", "Η προσφορά καταχωρήθηκε με επιτυχία!");
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά την προσφορά.";
//       if (err instanceof Error && err.message) message = err.message;
//       showBidNotice(auction.id, "error", message);
//     }
//   };

//   // -----------------------------
//   // ✅ More Filters position + outside click (PORTAL)
//   // -----------------------------
//   const computeMoreFiltersPos = (): { top: number; left: number; width: number } | null => {
//     const btnEl = moreFiltersBtnRef.current;
//     if (!btnEl) return null;

//     const r = btnEl.getBoundingClientRect();
//     const margin = 12;
//     const desiredWidth = isMobile ? Math.min(window.innerWidth - margin * 2, 520) : 520;

//     let left = r.left + window.scrollX;
//     const maxLeft = window.scrollX + window.innerWidth - margin - desiredWidth;
//     left = Math.min(left, maxLeft);
//     left = Math.max(left, window.scrollX + margin);

//     const top = r.bottom + window.scrollY + 8;
//     return { top, left, width: desiredWidth };
//   };

//   useEffect(() => {
//     if (!showMoreFilters) {
//       setMoreFiltersPos(null);
//       return;
//     }
//     setMoreFiltersPos(computeMoreFiltersPos());

//     const onResize = () => setMoreFiltersPos(computeMoreFiltersPos());
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showMoreFilters, vw]);

//   useEffect(() => {
//     if (!showMoreFilters) return;

//     const onMouseDown = (e: MouseEvent) => {
//       const target = e.target as Node;

//       const anchor = moreFiltersAnchorRef.current;
//       if (anchor && anchor.contains(target)) return;

//       const dd = moreFiltersDropdownRef.current;
//       if (dd && dd.contains(target)) return;

//       setShowMoreFilters(false);
//     };

//     window.addEventListener("mousedown", onMouseDown);
//     return () => window.removeEventListener("mousedown", onMouseDown);
//   }, [showMoreFilters]);

//   // -----------------------------
//   // ✅ Styles
//   // -----------------------------
//   const pageOuter: React.CSSProperties = {
//     width: "100%",
//     minHeight: "100vh",
//     background: "#F5F6F8",
//   };

//   const container: React.CSSProperties = {
//     width: "100%",
//     maxWidth: "100%",
//     margin: 0,
//     padding: isMobile ? "12px 12px 28px" : isTablet ? "16px 18px 36px" : "18px 24px 40px",
//     boxSizing: "border-box",
//   };

//   const topBar: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr auto" : "minmax(320px, 560px) 1fr minmax(140px, 220px)",
//     alignItems: "center",
//     gap: isMobile ? 10 : 16,
//     padding: "8px 0 12px",
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const searchWrap: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     background: "#F0F1F3",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     borderRadius: 12,
//     padding: isMobile ? "9px 10px" : "10px 12px",
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const inputStyle: React.CSSProperties = {
//     width: "100%",
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     fontSize: 14,
//   };

//   const resultsRight: React.CSSProperties = {
//     justifySelf: isMobile ? "start" : "end",
//     fontSize: 12,
//     color: "#6B7280",
//   };

//   const panel: React.CSSProperties = {
//     background: "#F3F4F6",
//     border: "1px solid rgba(17, 24, 39, 0.06)",
//     borderRadius: 16,
//     padding: isMobile ? 14 : 18,
//     boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   // ✅ Mobile only: τα 2 buttons δίπλα-δίπλα ΠΑΝΩ από το panel
//   const quickActionsRow: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     width: "100%",
//     flexDirection: "row",
//     flexWrap: "nowrap",
//     marginBottom: 12,
//   };

//   const chipsRow: React.CSSProperties = {
//     display: "flex",
//     flexWrap: isMobile ? "nowrap" : "wrap",
//     gap: 10,
//     marginTop: 10,
//     overflowX: isMobile ? "auto" : "visible",
//     WebkitOverflowScrolling: "touch",
//     paddingBottom: isMobile ? 6 : 0,
//   };

//   const chip = (active: boolean): React.CSSProperties => ({
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 8,
//     padding: "8px 12px",
//     borderRadius: 12,
//     border: active ? "1px solid #0B1220" : "1px solid rgba(17, 24, 39, 0.12)",
//     background: active ? "#0B1220" : "#FFFFFF",
//     color: active ? "#FFFFFF" : "#111827",
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: "pointer",
//     userSelect: "none",
//     flex: "0 0 auto",
//   });

//   const filtersRow: React.CSSProperties = {
//     marginTop: 14,
//     background: "#FFFFFF",
//     border: "1px solid rgba(17, 24, 39, 0.08)",
//     borderRadius: 14,
//     padding: 12,
//     display: "grid",
//     gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
//     gap: 12,
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const selectWrap: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     background: "#F3F4F6",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     borderRadius: 12,
//     padding: "10px 12px",
//     minWidth: 0,
//     boxSizing: "border-box",
//   };

//   const selectStyle: React.CSSProperties = {
//     width: "100%",
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#111827",
//     minWidth: 0,
//   };

//   // ✅ More Filters button
//   const moreFiltersRow: React.CSSProperties = {
//     marginTop: 14,
//     display: "flex",
//     justifyContent: "flex-start",
//   };

//   const moreFiltersWrap: React.CSSProperties = {
//     position: "relative",
//     width: isMobile ? "100%" : "auto",
//   };

//   const btn: React.CSSProperties = {
//     height: isMobile ? 34 : 36,
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 800,
//     fontSize: isMobile ? 12.5 : 13,
//     cursor: "pointer",
//     padding: "0 14px",
//     whiteSpace: "nowrap",
//   };

//   const moreFiltersBtn: React.CSSProperties = {
//     ...btn,
//     width: isMobile ? "100%" : "auto",
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//   };

//   // dropdown content (inside portal)
//   const dropdownShell = (pos: { top: number; left: number; width: number }): React.CSSProperties => ({
//     position: "absolute",
//     top: pos.top,
//     left: pos.left,
//     width: pos.width,
//     zIndex: 9999,
//     borderRadius: 14,
//     overflow: "auto",
//     maxHeight: "min(520px, calc(100vh - 24px))",
//   });

//   const filtersRowDropdown: React.CSSProperties = {
//     ...filtersRow,
//     marginTop: 0,
//     boxShadow: "0 18px 40px rgba(17,24,39,0.16)",
//   };

//   const grid: React.CSSProperties = {
//     marginTop: 18,
//     display: "grid",
//     gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
//     gap: isMobile ? 12 : 16,
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const card: React.CSSProperties = {
//     background: "#FFFFFF",
//     borderRadius: 16,
//     border: "1px solid rgba(17, 24, 39, 0.08)",
//     overflow: "hidden",
//     boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
//     display: "flex",
//     flexDirection: "column",
//   };

//   const imgWrap: React.CSSProperties = {
//     position: "relative",
//     height: isMobile ? 210 : 240,
//     background: "#E5E7EB",
//   };

//   // ✅ one row container for BOTH sides (time left + badges right)
//   const topBadgesRow: React.CSSProperties = {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     right: 10,
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     gap: 10,
//     zIndex: 3,
//     pointerEvents: "none",
//   };

//   // ✅ time badge (small, doesn't stretch)
//   const badgeLeft: React.CSSProperties = {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 6,
//     padding: isMobile ? "5px 8px" : "6px 10px",
//     borderRadius: 999,
//     background: "rgba(255,255,255,0.92)",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     fontSize: isMobile ? 11 : 12,
//     fontWeight: 800,
//     color: "#111827",
//     boxSizing: "border-box",
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     flex: "0 1 auto",
//     width: "fit-content",
//     maxWidth: "62%",
//   };

//   // ✅ right side stack (category + optional My auction)
//   const badgeRightStack: React.CSSProperties = {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "flex-end",
//     gap: 6,
//     minWidth: 0,
//     maxWidth: "55%",
//   };

//   const badgeRight: React.CSSProperties = {
//     padding: isMobile ? "5px 9px" : "6px 10px",
//     borderRadius: 999,
//     background: "rgba(255,255,255,0.92)",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     fontSize: isMobile ? 11 : 12,
//     fontWeight: 800,
//     color: "#111827",
//     boxSizing: "border-box",
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     minWidth: 0,
//     flex: "0 1 auto",
//     maxWidth: "100%",
//   };

//   // ✅ NEW: My auction badge
//   const myAuctionBadge: React.CSSProperties = {
//     padding: isMobile ? "5px 9px" : "6px 10px",
//     borderRadius: 999,
//     background: "rgba(17,24,39,0.88)",
//     border: "1px solid rgba(255,255,255,0.22)",
//     fontSize: isMobile ? 11 : 12,
//     fontWeight: 950,
//     color: "#FFFFFF",
//     boxSizing: "border-box",
//     whiteSpace: "nowrap",
//     maxWidth: "100%",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   // ✅ ensure overlay doesn't cover badges
//   const endedOverlay: React.CSSProperties = {
//     position: "absolute",
//     inset: 0,
//     zIndex: 2,
//     background: "rgba(0,0,0,0.35)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     color: "#FFFFFF",
//     fontWeight: 900,
//     letterSpacing: 0.5,
//     textTransform: "uppercase",
//     textAlign: "center",
//     padding: "0 10px",
//   };

//   const body: React.CSSProperties = {
//     padding: isMobile ? 12 : 14,
//     display: "flex",
//     flexDirection: "column",
//     gap: isMobile ? 8 : 10,
//   };

//   const sellerBox: React.CSSProperties = {
//     background: "#F3F4F6",
//     borderRadius: 14,
//     padding: isMobile ? 10 : 12,
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//   };

//   const sellerInfoCol: React.CSSProperties = {
//     display: "grid",
//     gap: 1,
//     minWidth: 0,
//     flex: 1,
//     paddingTop: 2,
//   };

//   const sellerNameRow: React.CSSProperties = {
//     display: "flex",
//     alignItems: "baseline",
//     gap: 8,
//     minWidth: 0,
//   };

//   const sellerUsernameStyle: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: isMobile ? 15 : 16,
//     lineHeight: 1.1,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     flex: "1 1 auto",
//     minWidth: 0,
//   };

//   const sellerLocationInline: React.CSSProperties = {
//     fontSize: isMobile ? 13 : 12,
//     color: "#2563EB",
//     whiteSpace: "nowrap",
//     flex: "0 0 auto",
//   };

//   const titleStyle: React.CSSProperties = {
//     margin: 0,
//     fontSize: isMobile ? 15 : 18,
//     fontWeight: 800,
//     color: "#111827",
//     lineHeight: 1.2,
//     display: "-webkit-box",
//     WebkitBoxOrient: "vertical",
//     WebkitLineClamp: isMobile ? 2 : 3,
//     overflow: "hidden",
//   };

//   const descStyle: React.CSSProperties = {
//     margin: 0,
//     fontSize: isMobile ? 12.5 : 13,
//     color: "#4B5563",
//     lineHeight: 1.35,
//     display: "-webkit-box",
//     WebkitBoxOrient: "vertical",
//     WebkitLineClamp: isMobile ? 2 : 3,
//     overflow: "hidden",
//   };

//   const metaRow: React.CSSProperties = {
//     display: "flex",
//     justifyContent: "space-between",
//     gap: 10,
//     fontSize: isMobile ? 11.5 : 12,
//     color: "#6B7280",
//     alignItems: "center",
//     flexWrap: "nowrap",
//   };

//   const metaLeft: React.CSSProperties = {
//     flex: "1 1 0",
//     minWidth: 0,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const metaRight: React.CSSProperties = {
//     flex: "0 0 auto",
//     whiteSpace: "nowrap",
//     textAlign: "right",
//   };

//   const detailsBtn: React.CSSProperties = {
//     ...btn,
//     width: "100%",
//     justifyContent: "center",
//   };

//   const primaryBtn: React.CSSProperties = {
//     ...btn,
//     background: "#0B1220",
//     color: "#FFFFFF",
//     border: "1px solid #0B1220",
//   };

//   const disabledPrimaryBtn: React.CSSProperties = {
//     ...primaryBtn,
//     opacity: 0.55,
//     cursor: "not-allowed",
//   };

//   const actionBtnLight: React.CSSProperties = {
//     height: isMobile ? 38 : 40,
//     padding: isMobile ? "0 10px" : "0 14px",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 900,
//     fontSize: isMobile ? 12.5 : 14,
//     cursor: "pointer",
//     display: "inline-flex",
//     alignItems: "center",
//     gap: isMobile ? 6 : 10,
//     justifyContent: "center",
//     whiteSpace: "nowrap",
//     minWidth: 0,
//     flex: isMobile ? "1 1 0" : "0 0 auto",
//     width: "auto",
//   };

//   const actionBtnDark: React.CSSProperties = {
//     ...actionBtnLight,
//     background: "#1e1e21ff",
//     border: "1px solid #0B1220",
//     color: "#ffffffff",
//   };

//   const bidRow: React.CSSProperties = {
//     marginTop: 4,
//     display: "grid",
//     gridTemplateColumns: "1fr",
//     gap: 8,
//   };

//   const bidInputWrap: React.CSSProperties = {
//     display: "grid",
//     gridTemplateColumns: "1fr auto",
//     gap: 10,
//     alignItems: "center",
//     width: "100%",
//   };

//   const bidInput: React.CSSProperties = {
//     width: "100%",
//     height: 36,
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     padding: "0 10px",
//     outline: "none",
//     fontWeight: 700,
//     boxSizing: "border-box",
//     minWidth: 0,
//   };

//   const pagination: React.CSSProperties = {
//     marginTop: 18,
//     display: "flex",
//     justifyContent: "center",
//     gap: 10,
//   };

//   const leadingSize = isMobile ? 32 : 40;

//   const leadingBidderRow: React.CSSProperties = {
//     marginTop: 10,
//     borderRadius: 14,
//     border: "2px solid rgba(59,130,246,0.45)",
//     background: "rgba(59,130,246,0.06)",
//     padding: isMobile ? 10 : 12,
//     display: "grid",
//     gridTemplateColumns: "1fr auto",
//     alignItems: "center",
//     gap: 10,
//     minWidth: 0,
//   };

//   const leadingLeft: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     minWidth: 0,
//     overflow: "hidden",
//   };

//   const leadingRank: React.CSSProperties = {
//     width: leadingSize,
//     height: leadingSize,
//     borderRadius: 999,
//     background: "#2563EB",
//     color: "#FFFFFF",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//     flex: "0 0 auto",
//     fontSize: isMobile ? 11 : 13,
//   };

//   const leadingAvatarWrap: React.CSSProperties = {
//     width: leadingSize,
//     height: leadingSize,
//     borderRadius: 999,
//     background: "#E5E7EB",
//     display: "grid",
//     placeItems: "center",
//     overflow: "hidden",
//     flex: "0 0 auto",
//     fontSize: isMobile ? 12 : 14,
//     fontWeight: 900,
//     color: "#1F2A44",
//   };

//   const leadingNameCol: React.CSSProperties = {
//     display: "grid",
//     gap: 1,
//     minWidth: 0,
//     overflow: "hidden",
//   };

//   const leadingUsername: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#111827",
//     fontSize: isMobile ? 13 : 14,
//     lineHeight: 1.1,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const leadingLabel: React.CSSProperties = {
//     fontWeight: 700,
//     color: "#6B7280",
//     fontSize: isMobile ? 12 : 13,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const leadingAmount: React.CSSProperties = {
//     fontWeight: 900,
//     color: "#2563EB",
//     flex: "0 0 auto",
//     whiteSpace: "nowrap",
//     fontSize: isMobile ? 12.5 : 14,
//   };

//   const totalResults = pageData?.totalElements ?? 0;

//   return (
//     <div style={pageOuter}>
//       <div style={container}>
//         <div style={topBar}>
//           <div style={searchWrap}>
//             <span style={{ fontSize: 14, opacity: 0.7 }}>🔍</span>
//             <input
//               type="text"
//               placeholder="Search auctions..."
//               value={search}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
//               style={inputStyle}
//             />
//           </div>

//           <div style={resultsRight}>{loading ? "Loading..." : `${totalResults} results`}</div>
//         </div>

//         {/* ✅ Mobile: actions πάνω από panel, δίπλα-δίπλα */}
//         {isMobile && (
//           <div style={quickActionsRow}>
//             {isAuctioneerOrAdmin && (
//               <button type="button" style={actionBtnDark} onClick={onCreateAuction}>
//                 <span style={{ color: "#008FFF", fontWeight: 700, marginRight: 3  ,fontSize:25,marginBottom:4.5,outlineColor:"white"}}>+</span>
//                 <span>Create Auction</span>
//               </button>
//             )}

//             {isAuthenticated && (
//               <button type="button" style={actionBtnLight} onClick={onViewMyBids}>
//                 ☰ <span>View my bids</span>
//               </button>
//             )}
//           </div>
//         )}

//         <div style={panel}>
//           <div
//             style={{
//               display: "flex",
//               alignItems: isMobile ? "stretch" : "center",
//               justifyContent: "space-between",
//               gap: 12,
//               flexDirection: isMobile ? "column" : "row",
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <span style={{ fontSize: 16, opacity: 0.7 }}>⎇</span>
//               <div style={{ fontWeight: 800, color: "#111827" }}>Filter by category</div>
//             </div>

//             {!isMobile && (
//               <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//                 {isAuctioneerOrAdmin && (
//                   <button type="button" style={actionBtnDark} onClick={onCreateAuction}>
//                     <span style={{ color: "#008FFF", fontWeight: 700, marginRight: 2  ,fontSize:30,marginBottom:7,outlineColor:"white"}}>+</span>
//                     <span>Create Auction</span>
//                   </button>
//                 )}

//                 {isAuthenticated && (
//                   <button type="button" style={actionBtnLight} onClick={onViewMyBids}>
//                     ☰ <span>View my bids</span>
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           <div style={chipsRow}>
//             <button type="button" style={chip(categoryId === "")} onClick={() => setCategoryId("")}>
//               ⭐ All Items
//             </button>

//             {categories.map((c) => (
//               <button
//                 key={c.id}
//                 type="button"
//                 style={chip(categoryId === c.id.toString())}
//                 onClick={() => setCategoryId(c.id.toString())}
//               >
//                 {c.name}
//               </button>
//             ))}
//           </div>

//           {/* ✅ More Filters dropdown button (portal fixes clipping on laptops) */}
//           <div style={moreFiltersRow} ref={moreFiltersAnchorRef}>
//             <div style={moreFiltersWrap}>
//               <button
//                 ref={moreFiltersBtnRef}
//                 type="button"
//                 style={moreFiltersBtn}
//                 onClick={() => setShowMoreFilters((v) => !v)}
//               >
//                 More Filters <span style={{ opacity: 0.75 }}>{showMoreFilters ? "▲" : "▼"}</span>
//               </button>
//             </div>
//           </div>

//           {/* ✅ Dropdown rendered in document.body so it never gets clipped */}
//           {showMoreFilters &&
//             moreFiltersPos &&
//             typeof document !== "undefined" &&
//             createPortal(
//               <div ref={moreFiltersDropdownRef} style={dropdownShell(moreFiltersPos)}>
//                 <div style={filtersRowDropdown}>
//                   <div style={selectWrap}>
//                     <span style={{ fontSize: 14, opacity: 0.7 }}>📅</span>
//                     <select
//                       value={`${sortBy}:${direction}`}
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
//                         const [sb, dir] = e.target.value.split(":");
//                         setSortBy(sb);
//                         setDirection(dir);
//                       }}
//                       style={selectStyle}
//                     >
//                       <option value="endDate:asc">End Date (Ending Soon)</option>
//                       <option value="endDate:desc">End Date (Ending Late)</option>
//                       <option value="startDate:asc">Start Date (Soonest)</option>
//                       <option value="startDate:desc">Start Date (Latest)</option>
//                     </select>
//                   </div>

//                   <div style={selectWrap}>
//                     <span style={{ fontSize: 14, opacity: 0.7 }}>📍</span>
//                     <select
//                       value={region}
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
//                         const r = e.target.value;
//                         setRegion(r);
//                         setCountry(r ? "Cyprus" : "");
//                       }}
//                       style={selectStyle}
//                     >
//                       <option value="">All Locations</option>
//                       <option value="NICOSIA">Nicosia</option>
//                       <option value="LIMASSOL">Limassol</option>
//                       <option value="PAPHOS">Paphos</option>
//                       <option value="FAMAGUSTA">Famagusta</option>
//                     </select>
//                   </div>

//                   <div style={selectWrap}>
//                     <span style={{ fontSize: 14, opacity: 0.7 }}>↕</span>
//                     <select
//                       value={expiredLast7Days ? "EXPIRED7" : "ACTIVE"}
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
//                         setExpiredLast7Days(e.target.value === "EXPIRED7")
//                       }
//                       style={selectStyle}
//                     >
//                       <option value="ACTIVE">Active Auctions</option>
//                       <option value="EXPIRED7">Expired (last 7 days)</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>,
//               document.body
//             )}

//           {error && (
//             <div style={{ marginTop: 12, color: "#B91C1C", fontWeight: 800 }}>
//               Σφάλμα: {error}
//             </div>
//           )}
//         </div>

//         {pageData && (
//           <>
//             <div style={grid}>
//               {pageData.content.map((auction) => {
//                 const active = isAuctionActive(auction.endDate, now);
//                 const timeLabel = formatTimeRemaining(auction.endDate, now);
//                 const minBid = computeMinBid(auction);
//                 const hasLeadingBidder =
//                   auction.topBidAmount != null && (auction.topBidderUsername ?? "").trim().length > 0;
//                 const canBid = active && auction.eligibleForBid && isAuthenticated;

//                 const notice = bidNoticeByAuctionId[auction.id];

//                 // ✅ NEW: is this auction mine?
//                 const sellerUsername = (auction.sellerUsername ?? "").trim().toLowerCase();
//                 const isMyAuction = isAuthenticated && currentUsername.length > 0 && sellerUsername === currentUsername;

//                 return (
//                   <div key={auction.id} style={card}>
//                     <div style={imgWrap}>
//                       {auction.mainImageUrl ? (
//                         <button
//                         type="button"
//                         onClick={() => onOpenDetails?.(auction.id)}
//                         style={{
//                           width: "100%",
//                           height: "100%",
//                           display: "block",
//                           padding: 0,
//                           margin: 0,
//                           border: "none",
//                           outline: "none",
//                           background: "transparent",
//                           boxShadow: "none",
//                           cursor: "pointer",
//                           appearance: "none",
//                           WebkitAppearance: "none",
//                           lineHeight: 0,
//                         }}
//                       >
//                         <img
//                           src={auction.mainImageUrl}
//                           alt={auction.title}
//                           style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
//                         />
//                       </button>

//                       ) : (
//                         <div
//                           style={{
//                             width: "100%",
//                             height: "100%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: "#6B7280",
//                             fontWeight: 800,
//                           }}
//                         >
//                           No image
//                         </div>
//                       )}

//                       {/* ✅ both badges aligned top-left & top-right inline */}
//                       <div style={topBadgesRow}>
//                         <div style={badgeLeft}>
//                           <span style={{ opacity: 0.85 }}>⏱</span>
//                           <span style={{ color: timeLabel === "Ended" ? "#DC2626" : "#111827" }}>
//                             {timeLabel}
//                           </span>
//                         </div>

//                         <div style={badgeRightStack}>
//                           <div style={badgeRight}>{auction.categoryName}</div>
//                           {isMyAuction && <div style={myAuctionBadge}>My auction</div>}
//                         </div>
//                       </div>

//                       {!active && <div style={endedOverlay}>AUCTION ENDED</div>}
//                     </div>

//                     <div style={body}>
//                       <div style={sellerBox}>
//                         <Avatar
//                           url={auction.sellerAvatarUrl ?? null}
//                           username={auction.sellerUsername}
//                           size={isMobile ? 40 : 41}
//                         />

//                         <div style={sellerInfoCol}>
//                           <div style={{ fontSize: isMobile ? 15 : 16, color: "#6B7280" }}>Seller</div>

//                           <div style={sellerNameRow}>
//                             <div style={sellerUsernameStyle} title={auction.sellerUsername}>
//                               {auction.sellerUsername}
//                             </div>

//                             <div style={sellerLocationInline}>
//                               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                 <path d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
//                                 <circle cx="12" cy="11" r="2.5" stroke="currentColor" stroke-width="2"/>
//                               </svg>
//                               {getCityFromLocation(auction.sellerLocation)}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <h3 style={titleStyle}>{auction.title}</h3>
//                       <p style={descStyle}>{auction.shortDescription}</p>

//                       <div style={metaRow}>
//                         <span style={metaLeft}>
//                           Starting price:{" "}
//                           <span style={{ fontWeight: 900, color: "#111827" }}>
//                             {formatMoney(auction.startingAmount)}
//                           </span>
//                         </span>

//                         <span style={metaRight}>
//                           Minimum raise:{" "}
//                           <span style={{ fontWeight: 900, color: "#111827" }}>
//                             {formatMoney(auction.minBidIncrement)}
//                           </span>
//                         </span>
//                       </div>

//                       <button type="button" style={detailsBtn} onClick={() => onOpenDetails?.(auction.id)}>
//                         ⓘ More Details
//                       </button>

//                       <div style={leadingBidderRow}>
//                         {hasLeadingBidder ? (
//                           <>
//                             <div style={leadingLeft}>
//                               <div style={leadingRank}>#1</div>

//                               <div style={leadingAvatarWrap}>
//                                 {auction.topBidderAvatarUrl ? (
//                                   <img
//                                     src={auction.topBidderAvatarUrl}
//                                     alt="bidder avatar"
//                                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                                   />
//                                 ) : (
//                                   <span>{initials(auction.topBidderUsername ?? "")}</span>
//                                 )}
//                               </div>

//                               <div style={leadingNameCol}>
//                                 <div style={leadingUsername}>{auction.topBidderUsername}</div>
//                                 <div style={leadingLabel}>Leading bidder</div>
//                               </div>
//                             </div>

//                             <div style={leadingAmount}>{auction.topBidAmount} €</div>
//                           </>
//                         ) : (
//                           <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                             <div
//                               style={{
//                                 width: leadingSize,
//                                 height: leadingSize,
//                                 borderRadius: 999,
//                                 background: "#E5E7EB",
//                                 display: "grid",
//                                 placeItems: "center",
//                                 fontWeight: 900,
//                                 color: "#6B7280",
//                                 flex: "0 0 auto",
//                                 fontSize: isMobile ? 12 : 14,
//                               }}
//                             >
//                               🏷️
//                             </div>

//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div
//                                 style={{
//                                   fontWeight: 900,
//                                   color: "#111827",
//                                   fontSize: isMobile ? 13 : 14,
//                                   lineHeight: 1.15,
//                                   display: "-webkit-box",
//                                   WebkitBoxOrient: "vertical",
//                                   WebkitLineClamp: 2,
//                                   overflow: "hidden",
//                                 }}
//                               >
//                                 Be the first one to bid
//                               </div>
//                               <div
//                                 style={{
//                                   fontWeight: 700,
//                                   color: "#6B7280",
//                                   fontSize: isMobile ? 12 : 13,
//                                   lineHeight: 1.15,
//                                 }}
//                               >
//                                 No bids yet.
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {active && (
//                         <div style={bidRow}>
//                           <div style={{ fontSize: isMobile ? 11.5 : 12, color: "#6B7280" }}>
//                             Place Bid (min {formatMoney(minBid)})
//                           </div>

//                           <div style={bidInputWrap}>
//                             <input
//                               type="number"
//                               min="0"
//                               step="0.01"
//                               placeholder="€"
//                               value={bidInputs[auction.id] ?? ""}
//                               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                                 setBidInputs((prev) => ({ ...prev, [auction.id]: e.target.value }))
//                               }
//                               style={bidInput}
//                               disabled={!canBid}
//                             />

//                             {!isAuthenticated ? (
//                               <button type="button" style={primaryBtn} onClick={() => onSignIn?.()}>
//                                 Sign in to Bid
//                               </button>
//                             ) : auction.eligibleForBid ? (
//                               <button type="button" style={primaryBtn} onClick={() => void handleBidClick(auction)}>
//                                 Bid
//                               </button>
//                             ) : (
//                               <button type="button" style={disabledPrimaryBtn} disabled title="Δεν είσαι eligible για bid">
//                                 Not eligible
//                               </button>
//                             )}
//                           </div>

//                           {/* ✅ inline message right where the user did the error */}
//                           {notice && (
//                             <InlineNotice
//                               type={notice.type}
//                               message={notice.message}
//                               onClose={() => dismissBidNotice(auction.id)}
//                             />
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div style={{ ...pagination, flexDirection: "column", alignItems: "center", gap: 8 }}>
//               <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", width: "100%" }}>
//                 <button type="button" style={btn} onClick={handlePrevPage} disabled={loading || !pageData || pageData.first}>
//                   ← Previous
//                 </button>

//                 <button type="button" style={btn} onClick={handleNextPage} disabled={loading || !pageData || pageData.last}>
//                   Next →
//                 </button>
//               </div>

//               {pageData && (
//                 <div style={{ marginTop: 2, color: "#6B7280", fontWeight: 700 }}>
//                   Page <strong style={{ color: "#111827" }}>{page + 1}</strong> of{" "}
//                   <strong style={{ color: "#111827" }}>{Math.max(pageData.totalPages, 1)}</strong>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuctionsPage;

// src/components/AuctionsPage.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AuctionListItem, SpringPage } from "../models/Springboot/Auction";
import type { AuthUserDto } from "../models/Springboot/UserEntity";
import { getAuctions } from "../api/Springboot/backendAuctionService";
import { placeBid } from "../api/Springboot/BackendBidService";

import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription, } from "@stomp/stompjs";

//import SockJS from "sockjs-client";

import { getCategories, type CategoryDto } from "../api/Springboot/backendCategoryService";

// ✅ reuse the same popover component (AuctionDetails uses it as-is)
import { ConfirmBidPopover, type ConfirmBidState } from "./ConfirmBidPopover";

interface AuctionsPageProps {
  onOpenDetails?: (auctionId: number) => void;

  currentUser?: AuthUserDto | null;
  onOpenUserDetailsAsAdmin?: (username: string) => void;

  onSignIn?: () => void;

  onCreateAuction?: () => void;
  onViewMyBids?: () => void;
}

type AuctionListItemUI = AuctionListItem & {
  sellerAvatarUrl?: string | null;
  topBidderAvatarUrl?: string | null;
};

interface BidEventDto {
  id: number;
  amount: number;
  bidderUsername: string;
  createdAt: string;
  auctionId: number;
  newEndDate: string;
  bidderAvatarUrl?: string | null;
}

type InlineNoticeType = "success" | "error";

/* =========================================================
   ✅ Helpers/components έξω από AuctionsPage
   ========================================================= */

const initials = (username: string) => {
  if (!username) return "?";
  return username.trim().slice(0, 1).toUpperCase();
};

const Avatar = React.memo(
  ({ url, username, size = 34 }: { url?: string | null; username: string; size?: number }) => {
    const s = `${size}px`;
    const baseStyle: React.CSSProperties = {
      width: s,
      height: s,
      borderRadius: "999px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
      background: "#EEF2FF",
      color: "#1F2A44",
      fontWeight: 700,
      border: "1px solid rgba(17, 24, 39, 0.08)",
    };

    if (url) {
      return (
        <span style={baseStyle}>
          <img src={url} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </span>
      );
    }

    return <span style={baseStyle}>{initials(username)}</span>;
  }
);
Avatar.displayName = "Avatar";

const InlineNotice = React.memo(
  ({
    type,
    message,
    onClose,
  }: {
    type: InlineNoticeType;
    message: string;
    onClose: () => void;
  }) => {
    const isErr = type === "error";
    return (
      <div
        style={{
          marginTop: 8,
          padding: "10px 12px",
          borderRadius: 14,
          border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
          background: isErr ? "#FEF2F2" : "#F0FDF4",
          color: isErr ? "#991B1B" : "#166534",
          fontWeight: 900,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
        role="status"
        aria-live="polite"
      >
        <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>{message}</div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close message"
          style={{
            flex: "0 0 auto",
            width: 30,
            height: 30,
            padding: 0,
            borderRadius: 10,
            border: "1px solid rgba(17,24,39,0.12)",
            background: "rgba(255,255,255,0.75)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 950,
            fontSize: 16,
            lineHeight: 1,
          }}
          title="Close"
        >
          <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
        </button>
      </div>
    );
  }
);
InlineNotice.displayName = "InlineNotice";

/* ========================================================= */

const AuctionsPage: React.FC<AuctionsPageProps> = ({
  onOpenDetails,
  currentUser,
  onSignIn,
  onCreateAuction,
  onViewMyBids,
}) => {
  const [search, setSearch] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [sortBy, setSortBy] = useState<string>("endDate");
  const [direction, setDirection] = useState<string>("asc");

  const [region, setRegion] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  const [expiredLast7Days, setExpiredLast7Days] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [pageData, setPageData] = useState<SpringPage<AuctionListItemUI> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [bidInputs, setBidInputs] = useState<Record<number, string>>({});

  const [categories, setCategories] = useState<CategoryDto[]>([]);

  const [now, setNow] = useState<Date>(new Date());

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const subscriptionsRef = useRef<Record<number, StompSubscription>>({});

  // ✅ Inline notices per auction (no browser alerts)
  const [bidNoticeByAuctionId, setBidNoticeByAuctionId] = useState<
    Record<number, { type: InlineNoticeType; message: string } | undefined>
  >({});
  const bidNoticeTimersRef = useRef<Record<number, number>>({});

  // ✅ Confirm popup (CENTER inside card, stays until Cancel/Confirm)
  const [confirmBid, setConfirmBid] = useState<ConfirmBidState | null>(null);
  const [confirmBusy, setConfirmBusy] = useState<boolean>(false);

  // ✅ refs for each card (so we can compute width for centering)
  const cardRefById = useRef<Record<number, HTMLDivElement | null>>({});

  const dismissBidNotice = useCallback((auctionId: number) => {
    const t = bidNoticeTimersRef.current[auctionId];
    if (t) {
      window.clearTimeout(t);
      delete bidNoticeTimersRef.current[auctionId];
    }
    setBidNoticeByAuctionId((prev) => {
      if (!prev[auctionId]) return prev;
      const next = { ...prev };
      delete next[auctionId];
      return next;
    });
  }, []);

  const showBidNotice = useCallback((auctionId: number, type: InlineNoticeType, message: string) => {
    const old = bidNoticeTimersRef.current[auctionId];
    if (old) window.clearTimeout(old);

    setBidNoticeByAuctionId((prev) => ({
      ...prev,
      [auctionId]: { type, message },
    }));

    bidNoticeTimersRef.current[auctionId] = window.setTimeout(() => {
      setBidNoticeByAuctionId((prev) => {
        if (!prev[auctionId]) return prev;
        const next = { ...prev };
        delete next[auctionId];
        return next;
      });
      delete bidNoticeTimersRef.current[auctionId];
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(bidNoticeTimersRef.current).forEach((t) => window.clearTimeout(t));
      bidNoticeTimersRef.current = {};
    };
  }, []);

  // ✅ prune notices when page changes
  useEffect(() => {
    if (!pageData) return;
    const ids = new Set(pageData.content.map((a) => a.id));

    setBidNoticeByAuctionId((prev) => {
      const next: Record<number, { type: InlineNoticeType; message: string } | undefined> = { ...prev };
      Object.keys(next).forEach((k) => {
        const id = Number(k);
        if (!ids.has(id)) {
          const t = bidNoticeTimersRef.current[id];
          if (t) {
            window.clearTimeout(t);
            delete bidNoticeTimersRef.current[id];
          }
          delete next[id];
        }
      });
      return next;
    });
  }, [pageData]);

  // ✅ More Filters dropdown
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  const moreFiltersAnchorRef = useRef<HTMLDivElement | null>(null);
  const moreFiltersBtnRef = useRef<HTMLButtonElement | null>(null);
  const moreFiltersDropdownRef = useRef<HTMLDivElement | null>(null);

  const [moreFiltersPos, setMoreFiltersPos] = useState<{ top: number; left: number; width: number } | null>(null);

  // -----------------------------
  // ✅ Responsive breakpoints
  // -----------------------------
  const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1280));

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = vw <= 640;
  const isTablet = vw > 640 && vw <= 1024;

  const isAuthenticated = !!currentUser;
  const isAuctioneerOrAdmin = currentUser?.roleName === "Auctioneer" || currentUser?.roleName === "Admin";

  const currentUsername = ((currentUser as unknown as { username?: string } | null)?.username ?? "").trim().toLowerCase();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    void loadCategories();
  }, []);

 useEffect(() => {
  // ✅ production-like: brokerURL με ws/wss ανάλογα με το origin
  const wsUrl =
    import.meta.env.VITE_WS_URL ??
    `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;

  const client = new Client({
    brokerURL: wsUrl,
    reconnectDelay: 5000,
    debug: () => {},
  });

  client.onConnect = () => setStompClient(client);

  client.onStompError = (frame) => {
    console.error("STOMP error:", frame.headers["message"], frame.body);
  };

  client.onWebSocketError = (e) => {
    console.error("WebSocket error:", e);
  };

  client.activate();

  return () => {
    Object.values(subscriptionsRef.current).forEach((sub) => sub.unsubscribe());
    subscriptionsRef.current = {};
    client.deactivate();
  };
}, []);


  useEffect(() => {
    if (!stompClient || !stompClient.connected || !pageData) return;

    const subs = subscriptionsRef.current;
    const currentIds = new Set(pageData.content.map((a) => a.id));

    pageData.content.forEach((auction) => {
      if (subs[auction.id]) return;

      const destination = `/topic/auctions/${auction.id}`;
      const sub = stompClient.subscribe(destination, (message: IMessage) => {
        try {
          const payload: BidEventDto = JSON.parse(message.body);

          setPageData((prev) => {
            if (!prev) return prev;
            if (!prev.content.some((a) => a.id === payload.auctionId)) return prev;

            return {
              ...prev,
              content: prev.content.map((a) =>
                a.id === payload.auctionId
                  ? {
                      ...a,
                      topBidAmount: payload.amount,
                      topBidderUsername: payload.bidderUsername,
                      topBidderAvatarUrl: payload.bidderAvatarUrl ?? a.topBidderAvatarUrl ?? null,
                      endDate: payload.newEndDate,
                    }
                  : a
              ),
            };
          });
        } catch (err) {
          console.error("Failed to parse BidEventDto", err);
        }
      });

      subs[auction.id] = sub;
    });

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

      const uiResult: SpringPage<AuctionListItemUI> = {
        ...result,
        content: result.content as AuctionListItemUI[],
      };

      setPageData(uiResult);
      setPage(pageToLoad);
    } catch (err: unknown) {
      console.error(err);
      let message = "Something went wrong while loading auctions.";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filtersKey = useMemo(() => {
    return JSON.stringify({
      search,
      categoryId,
      sortBy,
      direction,
      region,
      country,
      expiredLast7Days,
    });
  }, [search, categoryId, sortBy, direction, region, country, expiredLast7Days]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadAuctions(0);
    }, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    void loadAuctions(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    void loadAuctions(page + 1);
  };

  const toTitleCase = (s: string) => (s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());

  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [first] = sellerLocation.split(",");
    return toTitleCase(first.trim());
  };

  const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
    const end = new Date(endDateIso);
    const diffMs = end.getTime() - nowValue.getTime();

    if (Number.isNaN(end.getTime())) return endDateIso;
    if (diffMs <= 0) return "Ended";

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

  const nf = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    []
  );

  const asNumber = (v: unknown): number => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const formatMoney = (v: unknown): string => `${nf.format(asNumber(v))}€`;

  const computeMinBid = (a: AuctionListItemUI): number => {
    const top = a.topBidAmount != null ? asNumber(a.topBidAmount) : null;
    if (top == null) return asNumber(a.startingAmount);
    return top + asNumber(a.minBidIncrement);
  };

  // -----------------------------
  // ✅ More Filters position + outside click (PORTAL)
  // -----------------------------
  const computeMoreFiltersPos = (): { top: number; left: number; width: number } | null => {
    const btnEl = moreFiltersBtnRef.current;
    if (!btnEl) return null;

    const r = btnEl.getBoundingClientRect();
    const margin = 12;
    const desiredWidth = isMobile ? Math.min(window.innerWidth - margin * 2, 520) : 520;

    let left = r.left + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - margin - desiredWidth;
    left = Math.min(left, maxLeft);
    left = Math.max(left, window.scrollX + margin);

    const top = r.bottom + window.scrollY + 8;
    return { top, left, width: desiredWidth };
  };

  useEffect(() => {
    if (!showMoreFilters) {
      setMoreFiltersPos(null);
      return;
    }
    setMoreFiltersPos(computeMoreFiltersPos());

    const onResize = () => setMoreFiltersPos(computeMoreFiltersPos());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMoreFilters, vw]);

  useEffect(() => {
    if (!showMoreFilters) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      const anchor = moreFiltersAnchorRef.current;
      if (anchor && anchor.contains(target)) return;

      const dd = moreFiltersDropdownRef.current;
      if (dd && dd.contains(target)) return;

      setShowMoreFilters(false);
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [showMoreFilters]);

  // ✅ close confirm if auction disappears (page/filter change)
  useEffect(() => {
    if (!confirmBid || !pageData) return;
    const ids = new Set(pageData.content.map((a) => a.id));
    if (!ids.has(confirmBid.auctionId)) {
      setConfirmBid(null);
      setConfirmBusy(false);
    }
  }, [pageData, confirmBid]);

  // -----------------------------
  // ✅ Styles
  // -----------------------------
  const pageOuter: React.CSSProperties = {
    width: "100%",
    minHeight: "100vh",
    background: "#F5F6F8",
  };

  const container: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    margin: 0,
    padding: isMobile ? "12px 12px 28px" : isTablet ? "16px 18px 36px" : "18px 24px 40px",
    boxSizing: "border-box",
  };

  const topBar: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr auto" : "minmax(320px, 560px) 1fr minmax(140px, 220px)",
    alignItems: "center",
    gap: isMobile ? 10 : 16,
    padding: "8px 0 12px",
    width: "100%",
    boxSizing: "border-box",
  };

  const searchWrap: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#F0F1F3",
    border: "1px solid rgba(17, 24, 39, 0.10)",
    borderRadius: 12,
    padding: isMobile ? "9px 10px" : "10px 12px",
    width: "100%",
    boxSizing: "border-box",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
  };

  const resultsRight: React.CSSProperties = {
    justifySelf: isMobile ? "start" : "end",
    fontSize: 12,
    color: "#6B7280",
  };

  const panel: React.CSSProperties = {
    background: "#F3F4F6",
    border: "1px solid rgba(17, 24, 39, 0.06)",
    borderRadius: 16,
    padding: isMobile ? 14 : 18,
    boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
    width: "100%",
    boxSizing: "border-box",
  };

  const quickActionsRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    flexDirection: "row",
    flexWrap: "nowrap",
    marginBottom: 12,
  };

  const chipsRow: React.CSSProperties = {
    display: "flex",
    flexWrap: isMobile ? "nowrap" : "wrap",
    gap: 10,
    marginTop: 10,
    overflowX: isMobile ? "auto" : "visible",
    WebkitOverflowScrolling: "touch",
    paddingBottom: isMobile ? 6 : 0,
  };

  const chip = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 12,
    border: active ? "1px solid #0B1220" : "1px solid rgba(17, 24, 39, 0.12)",
    background: active ? "#0B1220" : "#FFFFFF",
    color: active ? "#FFFFFF" : "#111827",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    flex: "0 0 auto",
  });

  const filtersRow: React.CSSProperties = {
    marginTop: 14,
    background: "#FFFFFF",
    border: "1px solid rgba(17, 24, 39, 0.08)",
    borderRadius: 14,
    padding: 12,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
    gap: 12,
    width: "100%",
    boxSizing: "border-box",
  };

  const selectWrap: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#F3F4F6",
    border: "1px solid rgba(17, 24, 39, 0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    minWidth: 0,
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
    minWidth: 0,
  };

  const moreFiltersRow: React.CSSProperties = {
    marginTop: 14,
    display: "flex",
    justifyContent: "flex-start",
  };

  const moreFiltersWrap: React.CSSProperties = {
    position: "relative",
    width: isMobile ? "100%" : "auto",
  };

  const btn: React.CSSProperties = {
    height: isMobile ? 34 : 36,
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    fontWeight: 800,
    fontSize: isMobile ? 12.5 : 13,
    cursor: "pointer",
    padding: "0 14px",
    whiteSpace: "nowrap",
  };

  const moreFiltersBtn: React.CSSProperties = {
    ...btn,
    width: isMobile ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  const dropdownShell = (pos: { top: number; left: number; width: number }): React.CSSProperties => ({
    position: "absolute",
    top: pos.top,
    left: pos.left,
    width: pos.width,
    zIndex: 9999,
    borderRadius: 14,
    overflow: "auto",
    maxHeight: "min(520px, calc(100vh - 24px))",
  });

  const filtersRowDropdown: React.CSSProperties = {
    ...filtersRow,
    marginTop: 0,
    boxShadow: "0 18px 40px rgba(17,24,39,0.16)",
  };

  const grid: React.CSSProperties = {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
    gap: isMobile ? 12 : 16,
    width: "100%",
    boxSizing: "border-box",
  };

  const card: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid rgba(17, 24, 39, 0.08)",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(17, 24, 39, 0.06)",
    display: "flex",
    flexDirection: "column",
    position: "relative", // ✅ needed for centered overlay
  };

  const imgWrap: React.CSSProperties = {
    position: "relative",
    height: isMobile ? 210 : 240,
    background: "#E5E7EB",
  };

  const topBadgesRow: React.CSSProperties = {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    zIndex: 3,
    pointerEvents: "none",
  };

  const badgeLeft: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: isMobile ? "5px 8px" : "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(17, 24, 39, 0.10)",
    fontSize: isMobile ? 11 : 12,
    fontWeight: 800,
    color: "#111827",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: "0 1 auto",
    width: "fit-content",
    maxWidth: "62%",
  };

  const badgeRightStack: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    minWidth: 0,
    maxWidth: "55%",
  };

  const badgeRight: React.CSSProperties = {
    padding: isMobile ? "5px 9px" : "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(17, 24, 39, 0.10)",
    fontSize: isMobile ? 11 : 12,
    fontWeight: 800,
    color: "#111827",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
    flex: "0 1 auto",
    maxWidth: "100%",
  };

  const myAuctionBadge: React.CSSProperties = {
    padding: isMobile ? "5px 9px" : "6px 10px",
    borderRadius: 999,
    background: "rgba(17,24,39,0.88)",
    border: "1px solid rgba(255,255,255,0.22)",
    fontSize: isMobile ? 11 : 12,
    fontWeight: 950,
    color: "#FFFFFF",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const endedOverlay: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontWeight: 900,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
    padding: "0 10px",
  };

  const body: React.CSSProperties = {
    padding: isMobile ? 12 : 14,
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 8 : 10,
  };

  const sellerBox: React.CSSProperties = {
    background: "#F3F4F6",
    borderRadius: 14,
    padding: isMobile ? 10 : 12,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const sellerInfoCol: React.CSSProperties = {
    display: "grid",
    gap: 1,
    minWidth: 0,
    flex: 1,
    paddingTop: 2,
  };

  const sellerNameRow: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    minWidth: 0,
  };

  const sellerUsernameStyle: React.CSSProperties = {
    fontWeight: 900,
    color: "#111827",
    fontSize: isMobile ? 15 : 16,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: "1 1 auto",
    minWidth: 0,
  };

  const sellerLocationInline: React.CSSProperties = {
    fontSize: isMobile ? 13 : 12,
    color: "#2563EB",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: isMobile ? 15 : 18,
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1.2,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: isMobile ? 2 : 3,
    overflow: "hidden",
  };

  const descStyle: React.CSSProperties = {
    margin: 0,
    fontSize: isMobile ? 12.5 : 13,
    color: "#4B5563",
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: isMobile ? 2 : 3,
    overflow: "hidden",
  };

  const metaRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: isMobile ? 11.5 : 12,
    color: "#6B7280",
    alignItems: "center",
    flexWrap: "nowrap",
  };

  const metaLeft: React.CSSProperties = {
    flex: "1 1 0",
    minWidth: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const metaRight: React.CSSProperties = {
    flex: "0 0 auto",
    whiteSpace: "nowrap",
    textAlign: "right",
  };

  const detailsBtn: React.CSSProperties = {
    ...btn,
    width: "100%",
    justifyContent: "center",
  };

  const primaryBtn: React.CSSProperties = {
    ...btn,
    background: "#0B1220",
    color: "#FFFFFF",
    border: "1px solid #0B1220",
  };

  const disabledPrimaryBtn: React.CSSProperties = {
    ...primaryBtn,
    opacity: 0.55,
    cursor: "not-allowed",
  };

  const actionBtnLight: React.CSSProperties = {
    height: isMobile ? 38 : 40,
    padding: isMobile ? "0 10px" : "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    fontWeight: 900,
    fontSize: isMobile ? 12.5 : 14,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: isMobile ? 6 : 10,
    justifyContent: "center",
    whiteSpace: "nowrap",
    minWidth: 0,
    flex: isMobile ? "1 1 0" : "0 0 auto",
    width: "auto",
  };

  const actionBtnDark: React.CSSProperties = {
    ...actionBtnLight,
    background: "#1e1e21ff",
    border: "1px solid #0B1220",
    color: "#ffffffff",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  };

  const bidRow: React.CSSProperties = {
    marginTop: 4,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
  };

  const bidInputWrap: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
    width: "100%",
  };

  const bidInput: React.CSSProperties = {
    width: "100%",
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    padding: "0 10px",
    outline: "none",
    fontWeight: 700,
    boxSizing: "border-box",
    minWidth: 0,
  };

  const pagination: React.CSSProperties = {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    gap: 10,
  };

  const leadingSize = isMobile ? 32 : 40;

  const leadingBidderRow: React.CSSProperties = {
    marginTop: 10,
    borderRadius: 14,
    border: "2px solid rgba(59,130,246,0.45)",
    background: "rgba(59,130,246,0.06)",
    padding: isMobile ? 10 : 12,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  };

  const leadingLeft: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    overflow: "hidden",
  };

  const leadingRank: React.CSSProperties = {
    width: leadingSize,
    height: leadingSize,
    borderRadius: 999,
    background: "#2563EB",
    color: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    flex: "0 0 auto",
    fontSize: isMobile ? 11 : 13,
  };

  const leadingAvatarWrap: React.CSSProperties = {
    width: leadingSize,
    height: leadingSize,
    borderRadius: 999,
    background: "#E5E7EB",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    flex: "0 0 auto",
    fontSize: isMobile ? 12 : 14,
    fontWeight: 900,
    color: "#1F2A44",
  };

  const leadingNameCol: React.CSSProperties = {
    display: "grid",
    gap: 1,
    minWidth: 0,
    overflow: "hidden",
  };

  const leadingUsername: React.CSSProperties = {
    fontWeight: 900,
    color: "#111827",
    fontSize: isMobile ? 13 : 14,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const leadingLabel: React.CSSProperties = {
    fontWeight: 700,
    color: "#6B7280",
    fontSize: isMobile ? 12 : 13,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const leadingAmount: React.CSSProperties = {
    fontWeight: 900,
    color: "#2563EB",
    flex: "0 0 auto",
    whiteSpace: "nowrap",
    fontSize: isMobile ? 12.5 : 14,
  };

  const totalResults = pageData?.totalElements ?? 0;

  return (
    <div style={pageOuter}>
      <div style={container}>
        <div style={topBar}>
          <div style={searchWrap}>
            <span style={{ fontSize: 14, opacity: 0.7 }}>🔍</span>
            <input
              type="text"
              placeholder="Search auctions..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={resultsRight}>{loading ? "Loading..." : `${totalResults} results`}</div>
        </div>

        {isMobile && (
          <div style={quickActionsRow}>
            {isAuctioneerOrAdmin && (
              <button type="button" style={actionBtnDark} onClick={onCreateAuction}>
                <span style={{ color: "#008FFF", fontWeight: 700, marginRight: 3, fontSize: 25, marginBottom: 4.5, outlineColor: "white" }}>+</span>
                <span>Create Auction</span>
              </button>
            )}

            {isAuthenticated && (
              <button type="button" style={actionBtnLight} onClick={onViewMyBids}>
                ☰ <span>View my bids</span>
              </button>
            )}
          </div>
        )}

        <div style={panel}>
          <div
            style={{
              display: "flex",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              gap: 12,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, opacity: 0.7 }}>⎇</span>
              <div style={{ fontWeight: 800, color: "#111827" }}>Filter by category</div>
            </div>

            {!isMobile && (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {isAuctioneerOrAdmin && (
                  <button type="button" style={actionBtnDark} onClick={onCreateAuction}>
                    <span style={{ color: "#008FFF", fontWeight: 700, marginRight: 2, fontSize: 30, marginBottom: 7, outlineColor: "white" }}>+</span>
                    <span>Create Auction</span>
                  </button>
                )}

                {isAuthenticated && (
                  <button type="button" style={actionBtnLight} onClick={onViewMyBids}>
                    ☰ <span>View my bids</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={chipsRow}>
            <button type="button" style={chip(categoryId === "")} onClick={() => setCategoryId("")}>
              ⭐ All Items
            </button>

            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                style={chip(categoryId === c.id.toString())}
                onClick={() => setCategoryId(c.id.toString())}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div style={moreFiltersRow} ref={moreFiltersAnchorRef}>
            <div style={moreFiltersWrap}>
              <button
                ref={moreFiltersBtnRef}
                type="button"
                style={moreFiltersBtn}
                onClick={() => setShowMoreFilters((v) => !v)}
              >
                More Filters <span style={{ opacity: 0.75 }}>{showMoreFilters ? "▲" : "▼"}</span>
              </button>
            </div>
          </div>

          {showMoreFilters &&
            moreFiltersPos &&
            typeof document !== "undefined" &&
            createPortal(
              <div ref={moreFiltersDropdownRef} style={dropdownShell(moreFiltersPos)}>
                <div style={filtersRowDropdown}>
                  <div style={selectWrap}>
                    <span style={{ fontSize: 14, opacity: 0.7 }}>📅</span>
                    <select
                      value={`${sortBy}:${direction}`}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const [sb, dir] = e.target.value.split(":");
                        setSortBy(sb);
                        setDirection(dir);
                      }}
                      style={selectStyle}
                    >
                      <option value="endDate:asc">End Date (Ending Soon)</option>
                      <option value="endDate:desc">End Date (Ending Late)</option>
                      <option value="startDate:asc">Start Date (Soonest)</option>
                      <option value="startDate:desc">Start Date (Latest)</option>
                    </select>
                  </div>

                  <div style={selectWrap}>
                    <span style={{ fontSize: 14, opacity: 0.7 }}>📍</span>
                    <select
                      value={region}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const r = e.target.value;
                        setRegion(r);
                        setCountry(r ? "Cyprus" : "");
                      }}
                      style={selectStyle}
                    >
                      <option value="">All Locations</option>
                      <option value="NICOSIA">Nicosia</option>
                      <option value="LIMASSOL">Limassol</option>
                      <option value="PAPHOS">Paphos</option>
                      <option value="FAMAGUSTA">Famagusta</option>
                    </select>
                  </div>

                  <div style={selectWrap}>
                    <span style={{ fontSize: 14, opacity: 0.7 }}>↕</span>
                    <select
                      value={expiredLast7Days ? "EXPIRED7" : "ACTIVE"}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExpiredLast7Days(e.target.value === "EXPIRED7")}
                      style={selectStyle}
                    >
                      <option value="ACTIVE">Active Auctions</option>
                      <option value="EXPIRED7">Expired (last 7 days)</option>
                    </select>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {error && (
            <div style={{ marginTop: 12, color: "#B91C1C", fontWeight: 800 }}>
              Error: {error}
            </div>
          )}
        </div>

        {pageData && (
          <>
            <div style={grid}>
              {pageData.content.map((auction) => {
                const active = isAuctionActive(auction.endDate, now);
                const timeLabel = formatTimeRemaining(auction.endDate, now);
                const minBid = computeMinBid(auction);
                const hasLeadingBidder = auction.topBidAmount != null && (auction.topBidderUsername ?? "").trim().length > 0;
                const canBid = active && auction.eligibleForBid && isAuthenticated;

                const notice = bidNoticeByAuctionId[auction.id];

                const sellerUsername = (auction.sellerUsername ?? "").trim().toLowerCase();
                const isMyAuction = isAuthenticated && currentUsername.length > 0 && sellerUsername === currentUsername;

                const isConfirmOpenForThisCard = confirmBid?.auctionId === auction.id;

                return (
                  <div
                    key={auction.id}
                    style={card}
                    ref={(el) => {
                      cardRefById.current[auction.id] = el;
                    }}
                  >
                    <div style={imgWrap}>
                      {auction.mainImageUrl ? (
                        <button
                          type="button"
                          onClick={() => onOpenDetails?.(auction.id)}
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            padding: 0,
                            margin: 0,
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            boxShadow: "none",
                            cursor: "pointer",
                            appearance: "none",
                            WebkitAppearance: "none",
                            lineHeight: 0,
                          }}
                        >
                          <img
                            src={auction.mainImageUrl}
                            alt={auction.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </button>
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#6B7280",
                            fontWeight: 800,
                          }}
                        >
                          No image
                        </div>
                      )}

                      <div style={topBadgesRow}>
                        <div style={badgeLeft}>
                          <span style={{ opacity: 0.85 }}>⏱</span>
                          <span style={{ color: timeLabel === "Ended" ? "#DC2626" : "#111827" }}>
                            {timeLabel}
                          </span>
                        </div>

                        <div style={badgeRightStack}>
                          <div style={badgeRight}>{auction.categoryName}</div>
                          {isMyAuction && <div style={myAuctionBadge}>My auction</div>}
                        </div>
                      </div>

                      {!active && <div style={endedOverlay}>AUCTION ENDED</div>}
                    </div>

                    <div style={body}>
                      <div style={sellerBox}>
                        <Avatar
                          url={auction.sellerAvatarUrl ?? null}
                          username={auction.sellerUsername}
                          size={isMobile ? 40 : 41}
                        />

                        <div style={sellerInfoCol}>
                          <div style={{ fontSize: isMobile ? 15 : 16, color: "#6B7280" }}>Seller</div>

                          <div style={sellerNameRow}>
                            <div style={sellerUsernameStyle} title={auction.sellerUsername}>
                              {auction.sellerUsername}
                            </div>

                            <div style={sellerLocationInline}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              {getCityFromLocation(auction.sellerLocation)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <h3 style={titleStyle}>{auction.title}</h3>
                      <p style={descStyle}>{auction.shortDescription}</p>

                      <div style={metaRow}>
                        <span style={metaLeft}>
                          Starting price:{" "}
                          <span style={{ fontWeight: 900, color: "#111827" }}>
                            {formatMoney(auction.startingAmount)}
                          </span>
                        </span>

                        <span style={metaRight}>
                          Minimum raise:{" "}
                          <span style={{ fontWeight: 900, color: "#111827" }}>
                            {formatMoney(auction.minBidIncrement)}
                          </span>
                        </span>
                      </div>

                      <button type="button" style={detailsBtn} onClick={() => onOpenDetails?.(auction.id)}>
                        ⓘ More Details
                      </button>

                      <div style={leadingBidderRow}>
                        {hasLeadingBidder ? (
                          <>
                            <div style={leadingLeft}>
                              <div style={leadingRank}>#1</div>

                              <div style={leadingAvatarWrap}>
                                {auction.topBidderAvatarUrl ? (
                                  <img
                                    src={auction.topBidderAvatarUrl}
                                    alt="bidder avatar"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <span>{initials(auction.topBidderUsername ?? "")}</span>
                                )}
                              </div>

                              <div style={leadingNameCol}>
                                <div style={leadingUsername}>{auction.topBidderUsername}</div>
                                <div style={leadingLabel}>Leading bidder</div>
                              </div>
                            </div>

                            <div style={leadingAmount}>{auction.topBidAmount} €</div>
                          </>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <div
                              style={{
                                width: leadingSize,
                                height: leadingSize,
                                borderRadius: 999,
                                background: "#E5E7EB",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 900,
                                color: "#6B7280",
                                flex: "0 0 auto",
                                fontSize: isMobile ? 12 : 14,
                              }}
                            >
                              🏷️
                            </div>

                            <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 900,
                                  color: "#111827",
                                  fontSize: isMobile ? 13 : 14,
                                  lineHeight: 1.15,
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                  overflow: "hidden",
                                }}
                              >
                                Be the first one to bid
                              </div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#6B7280",
                                  fontSize: isMobile ? 12 : 13,
                                  lineHeight: 1.15,
                                }}
                              >
                                No bids yet.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {active && (
                        <div style={bidRow}>
                          <div style={{ fontSize: isMobile ? 11.5 : 12, color: "#6B7280" }}>
                            Place Bid (min {formatMoney(minBid)})
                          </div>

                          <div style={bidInputWrap}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="€"
                              value={bidInputs[auction.id] ?? ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setBidInputs((prev) => ({ ...prev, [auction.id]: e.target.value }))
                              }
                              style={bidInput}
                              disabled={!canBid}
                            />

                            {!isAuthenticated ? (
                              <button type="button" style={primaryBtn} onClick={() => onSignIn?.()}>
                                <span style={{ color: "#0B84F3" }} aria-hidden="true">🔒</span>  Sign in to Bid
                              </button>
                            ) : auction.eligibleForBid ? (
                              <button
                                type="button"
                                style={primaryBtn}
                                onClick={() => {
                                  const raw = bidInputs[auction.id];

                                  if (!raw || raw.trim() === "") {
                                    showBidNotice(auction.id, "error", "Please enter a bid amount.");
                                    return;
                                  }

                                  const amount = Number(raw);
                                  if (!Number.isFinite(amount) || amount <= 0) {
                                    showBidNotice(auction.id, "error", "Please enter a valid amount.");
                                    return;
                                  }

                                  if (amount < minBid) {
                                    showBidNotice(auction.id, "error", `Minimum bid is ${formatMoney(minBid)}.`);
                                    return;
                                  }

                                  // ✅ open centered confirm inside THIS card
                                  const cardEl = cardRefById.current[auction.id];
                                  const cardW = cardEl?.getBoundingClientRect().width ?? 360;

                                  const desiredWidth = Math.min(isMobile ? 480 : 360, Math.max(220, cardW - 24));

                                setConfirmBid({
                                  auctionId: auction.id,
                                  lastAmount: auction.topBidAmount ?? null,
                                  startingAmount: auction.startingAmount ?? null, // ✅ added
                                  amount,
                                  title: auction.title,
                                  pos: {
                                    top: 0,
                                    left: 0,
                                    width: desiredWidth,
                                    placement: "bottom",
                                  },
                                });

                                }}
                              >
                                Bid
                              </button>
                            ) : (
                              <button type="button" style={disabledPrimaryBtn} disabled title="You are not eligible for bidding">
                                Not eligible
                              </button>
                            )}
                          </div>

                          {notice && (
                            <InlineNotice
                              type={notice.type}
                              message={notice.message}
                              onClose={() => dismissBidNotice(auction.id)}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* ✅ CONFIRM OVERLAY: centered in the card, stays until Cancel/Confirm */}
                    {isConfirmOpenForThisCard && confirmBid && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          zIndex: 4500,
                          background: "rgba(203, 203, 203, 0.5)",
                          borderRadius: 16,
                          display: "block",
                          pointerEvents: "auto",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: confirmBid.pos.width,
                            maxWidth: "calc(100% - 24px)",
                          }}
                        >
                          <ConfirmBidPopover
                            state={{
                              ...confirmBid,
                              pos: { ...confirmBid.pos, top: 0, left: 0 },
                            }}
                            busy={confirmBusy}
                            onCancel={() => {
                              if (confirmBusy) return;
                              setConfirmBid(null);
                            }}
                            onConfirm={async () => {
                              if (confirmBusy) return;
                              setConfirmBusy(true);

                              await handleBidClick(auction, confirmBid.amount);

                              setConfirmBusy(false);
                              setConfirmBid(null);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ ...pagination, flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", width: "100%" }}>
                <button type="button" style={btn} onClick={handlePrevPage} disabled={loading || !pageData || pageData.first}>
                  ← Previous
                </button>

                <button type="button" style={btn} onClick={handleNextPage} disabled={loading || !pageData || pageData.last}>
                  Next →
                </button>
              </div>

              {pageData && (
                <div style={{ marginTop: 2, color: "#6B7280", fontWeight: 700 }}>
                  Page <strong style={{ color: "#111827" }}>{page + 1}</strong> of{" "}
                  <strong style={{ color: "#111827" }}>{Math.max(pageData.totalPages, 1)}</strong>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  async function handleBidClick(auction: AuctionListItemUI, amountOverride?: number) {
    if (!isAuthenticated) {
      onSignIn?.();
      return;
    }

    const amount = typeof amountOverride === "number" ? amountOverride : Number(bidInputs[auction.id]);

    if (!Number.isFinite(amount) || amount <= 0) {
      showBidNotice(auction.id, "error", "Please enter a valid amount.");
      return;
    }

    const minBidNow = computeMinBid(auction);
    if (amount < minBidNow) {
      showBidNotice(auction.id, "error", `Minimum bid is ${formatMoney(minBidNow)}.`);
      return;
    }

    try {
      await placeBid(auction.id, amount);

      setPageData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((a) =>
            a.id === auction.id
              ? {
                  ...a,
                  topBidAmount: a.topBidAmount != null && asNumber(a.topBidAmount) > amount ? a.topBidAmount : amount,
                }
              : a
          ),
        };
      });

      setBidInputs((prev) => ({ ...prev, [auction.id]: "" }));
      showBidNotice(auction.id, "success", "Your bid was placed successfully!");
    } catch (err: unknown) {
      console.error(err);
      let message = "Something went wrong.";
      if (err instanceof Error && err.message) message = err.message;
      showBidNotice(auction.id, "error", message);
    }
  }
};

export default AuctionsPage;
