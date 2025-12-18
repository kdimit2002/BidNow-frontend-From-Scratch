

// // src/components/AuctionDetailsPage.tsx

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
// } from "react";
// import { getAuctionById } from "../api/Springboot/backendAuctionService";
// import { placeBid } from "../api/Springboot/BackendBidService";
// import { sendChatMessage } from "../api/Springboot/backendChatService";
// import { adminEditAuction } from "../api/admin/backendAdminAuctionService";
// import type {
//   AuctionDetails,
//   ShippingCostPayer,
//   AdminAuctionUpdateRequest,
//   AuctionStatus,
// } from "../models/Springboot/Auction";

// import { Client } from "@stomp/stompjs";
// import type {
//   IMessage,
//   StompSubscription,
//   IStompSocket,
// } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// // 🔹 Auth user τύπος
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// interface AuctionDetailsPageProps {
//   auctionId: number;
//   onBack?: () => void;
//   currentUser: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;
// }

// // DTO που στέλνει το backend για Bids (WebSocket)
// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
// }

// // DTO που στέλνει το backend για Chat (WebSocket)
// interface ChatMessageDto {
//   id: number;
//   senderDisplayName: string;
//   senderFirebaseId: string;
//   content: string;
//   createdAt: string;
//   remainingMessages?: number;
// }

// const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
//   auctionId,
//   onBack,
//   currentUser,
//   onOpenUserDetailsAsAdmin,
// }) => {
//   const [auction, setAuction] = useState<AuctionDetails | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [bidAmount, setBidAmount] = useState<string>("");

//   // feedback για bid
//   const [bidMessage, setBidMessage] = useState<string | null>(null);
//   const [bidMessageType, setBidMessageType] =
//     useState<"success" | "error" | null>(null);

//   // νέο μήνυμα chat (textarea)
//   const [newChatContent, setNewChatContent] = useState<string>("");

//   // fullscreen image
//   const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
//     null
//   );

//   // real-time countdown
//   const [now, setNow] = useState<Date>(new Date());

//   // STOMP client + subscriptions (bids + chat)
//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const bidSubscriptionRef = useRef<StompSubscription | null>(null);
//   const chatSubscriptionRef = useRef<StompSubscription | null>(null);

//   // 🔹 Admin flag (μία πηγή αλήθειας)
//   const isAdmin = currentUser?.roleName === "Admin";

//   const handleOpenUserDetails = (username: string) => {
//     if (!isAdmin) return;
//     if (!onOpenUserDetailsAsAdmin) return;
//     onOpenUserDetailsAsAdmin(username);
//   };

//   // 🔹 Edit state για ADMIN (auction edit)
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [editForm, setEditForm] = useState<{
//     categoryId: string;
//     title: string;
//     shortDescription: string;
//     description: string;
//     startingAmount: string;
//     minBidIncrement: string;
//     startDate: string;
//     endDate: string;
//     shippingCostPayer: ShippingCostPayer;
//     auctionStatus: AuctionStatus | "";
//   }>({
//     categoryId: "",
//     title: "",
//     shortDescription: "",
//     description: "",
//     startingAmount: "",
//     minBidIncrement: "",
//     startDate: "",
//     endDate: "",
//     shippingCostPayer: "BUYER",
//     auctionStatus: "",
//   });

//   const toDateTimeLocal = (value: string | null | undefined): string => {
//     if (!value) return "";
//     // backend π.χ. "2025-12-26T15:19:00" → input datetime-local θέλει "YYYY-MM-DDTHH:mm"
//     return value.length >= 16 ? value.slice(0, 16) : value;
//   };

//   // update "now" κάθε 1s
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setNow(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // ESC για κλείσιμο fullscreen εικόνας
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setFullscreenImageUrl(null);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   // WebSocket/STOMP σύνδεση ΜΙΑ φορά
//   useEffect(() => {
//     const socket = new SockJS("http://localhost:8080/ws");
//     const client = new Client({
//       webSocketFactory: () => socket as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {
//         // console.log('[STOMP details]', msg);
//       },
//     });

//     client.onConnect = () => {
//       console.log("STOMP connected (details)");
//       setStompClient(client);
//     };

//     client.onStompError = (frame) => {
//       console.error(
//         "STOMP error (details):",
//         frame.headers["message"],
//         frame.body
//       );
//     };

//     client.activate();

//     return () => {
//       if (bidSubscriptionRef.current) {
//         bidSubscriptionRef.current.unsubscribe();
//         bidSubscriptionRef.current = null;
//       }
//       if (chatSubscriptionRef.current) {
//         chatSubscriptionRef.current.unsubscribe();
//         chatSubscriptionRef.current = null;
//       }
//       client.deactivate();
//     };
//   }, []);

//   // Subscribe σε bid topic + chat topic
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected) {
//       return;
//     }

//     // καθάρισε παλιά subscriptions (αν αλλάξει auctionId)
//     if (bidSubscriptionRef.current) {
//       bidSubscriptionRef.current.unsubscribe();
//       bidSubscriptionRef.current = null;
//     }
//     if (chatSubscriptionRef.current) {
//       chatSubscriptionRef.current.unsubscribe();
//       chatSubscriptionRef.current = null;
//     }

//     // -------- BIDS --------
//     const bidDestination = `/topic/auctions/${auctionId}`;
//     const bidSub = stompClient.subscribe(
//       bidDestination,
//       (message: IMessage) => {
//         try {
//           const payload: BidEventDto = JSON.parse(message.body);

//           setAuction((prev) => {
//             if (!prev || prev.id !== payload.auctionId) return prev;

//             const newBid = {
//               id: payload.id,
//               amount: payload.amount,
//               bidderUsername: payload.bidderUsername,
//               createdAt: payload.createdAt,
//               auctionId: payload.auctionId,
//             };

//             const alreadyExists = prev.bids.some((b) => b.id === newBid.id);
//             const updatedBids = alreadyExists
//               ? prev.bids
//               : [newBid, ...prev.bids];

//             return {
//               ...prev,
//               endDate: payload.newEndDate,
//               bids: updatedBids,
//             };
//           });
//         } catch (err) {
//           console.error("Failed to parse BidEventDto (details)", err);
//         }
//       }
//     );
//     bidSubscriptionRef.current = bidSub;

//     // -------- CHAT --------
//     const chatDestination = `/topic/auctions/${auctionId}/chat`;
//     const chatSub = stompClient.subscribe(
//       chatDestination,
//       (message: IMessage) => {
//         try {
//           const payload: ChatMessageDto = JSON.parse(message.body);

//           setAuction((prev) => {
//             if (!prev || prev.id !== auctionId) return prev;
//             const exists = prev.chat.some((m) => m.id === payload.id);
//             if (exists) return prev;

//             return {
//               ...prev,
//               chat: [...prev.chat, payload],
//             };
//           });
//         } catch (err) {
//           console.error("Failed to parse ChatMessageDto (details)", err);
//         }
//       }
//     );
//     chatSubscriptionRef.current = chatSub;

//     return () => {
//       bidSub.unsubscribe();
//       chatSub.unsubscribe();
//       if (bidSubscriptionRef.current === bidSub) {
//         bidSubscriptionRef.current = null;
//       }
//       if (chatSubscriptionRef.current === chatSub) {
//         chatSubscriptionRef.current = null;
//       }
//     };
//   }, [stompClient, auctionId]);

//   const loadAuction = useCallback(async () => {
//     setError(null);
//     setLoading(true);
//     setAuction(null);

//     try {
//       const result = await getAuctionById(auctionId);
//       setAuction(result);
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά τη φόρτωση της δημοπρασίας.";
//       if (err instanceof Error) {
//         message = err.message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [auctionId]);

//   useEffect(() => {
//     loadAuction();
//   }, [loadAuction]);

//   // Όταν φορτώνεται/αλλάζει το auction, γεμίζουμε τη φόρμα edit (για Admin)
//   useEffect(() => {
//     if (!auction) return;
//     setEditForm({
//       categoryId: "", // αφήνουμε κενό = δεν αλλάζουμε κατηγορία, εκτός αν το γεμίσει ο admin
//       title: auction.title ?? "",
//       shortDescription: auction.shortDescription ?? "",
//       description: auction.description ?? "",
//       startingAmount: auction.startingAmount?.toString() ?? "",
//       minBidIncrement: auction.minBidIncrement?.toString() ?? "",
//       startDate: toDateTimeLocal(auction.startDate),
//       endDate: toDateTimeLocal(auction.endDate),
//       shippingCostPayer: auction.shippingCostPayer,
//       auctionStatus: auction.status as AuctionStatus,
//     });
//   }, [auction]);

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

//   const handleBidClick = async (auctionDetails: AuctionDetails) => {
//     const raw = bidAmount;

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
//       await placeBid(auctionDetails.id, amount);
//       showBidMessage("success", "Η προσφορά καταχωρήθηκε με επιτυχία!");

//       setBidAmount("");
//       await loadAuction();
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά την προσφορά.";
//       if (err instanceof Error && err.message) {
//         message = err.message;
//       }
//       showBidMessage("error", message);
//     }
//   };

//   const handleSendChat = async () => {
//     if (!auction) return;
//     const trimmed = newChatContent.trim();
//     if (!trimmed) {
//       window.alert("Το μήνυμα δεν μπορεί να είναι κενό.");
//       return;
//     }

//     try {
//       await sendChatMessage(auction.id, trimmed);
//       setNewChatContent("");
//       // Θα έρθει μέσω WebSocket
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά την αποστολή του μηνύματος.";
//       if (err instanceof Error && err.message) {
//         message = err.message;
//       }
//       window.alert(message);
//     }
//   };

//   const handleSaveEdit = async () => {
//     if (!auction) return;

//     const payload: AdminAuctionUpdateRequest = {
//       categoryId: editForm.categoryId
//         ? Number(editForm.categoryId)
//         : undefined,
//       title: editForm.title.trim() || undefined,
//       shortDescription: editForm.shortDescription.trim() || undefined,
//       description: editForm.description.trim() || undefined,
//       startingAmount: editForm.startingAmount
//         ? Number(editForm.startingAmount)
//         : undefined,
//       minBidIncrement: editForm.minBidIncrement
//         ? Number(editForm.minBidIncrement)
//         : undefined,
//       startDate: editForm.startDate || undefined,
//       endDate: editForm.endDate || undefined,
//       shippingCostPayer: editForm.shippingCostPayer,
//       status: editForm.auctionStatus || undefined,
//     };

//     try {
//       const updated = await adminEditAuction(auction.id, payload);
//       setAuction(updated);
//       setIsEditing(false);
//       showBidMessage("success", "Η δημοπρασία ενημερώθηκε με επιτυχία.");
//     } catch (err: unknown) {
//       console.error(err);
//       let message = "Κάτι πήγε στραβά κατά την ενημέρωση της δημοπρασίας.";
//       if (err instanceof Error && err.message) {
//         message = err.message;
//       }
//       showBidMessage("error", message);
//     }
//   };

//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
//       <div style={{ marginBottom: "1rem" }}>
//         <button type="button" onClick={onBack}>
//           ← Back to auctions
//         </button>
//       </div>

//       <h1>Auction Details</h1>

//       {/* Μήνυμα για bid / admin actions */}
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

//       {loading && <p>Φόρτωση...</p>}
//       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

//       {auction &&
//         !loading &&
//         !error &&
//         (() => {
//           const isActive = isAuctionActive(auction.endDate, now);
//           const canBid = auction.eligibleForBid && isActive;
//           const canChat = auction.eligibleForChat && isActive;

//           return (
//             <div
//               style={{
//                 border: "1px solid #ccc",
//                 padding: "1rem",
//                 borderRadius: 4,
//               }}
//             >
//               <h2>{auction.title}</h2>

//               <p>
//                 Πωλητής:{" "}
//                 {isAdmin ? (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       handleOpenUserDetails(auction.sellerUsername)
//                     }
//                     style={{
//                       background: "none",
//                       border: "none",
//                       padding: 0,
//                       margin: 0,
//                       color: "blue",
//                       textDecoration: "underline",
//                       cursor: "pointer",
//                       font: "inherit",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     {auction.sellerUsername}
//                   </button>
//                 ) : (
//                   <strong>{auction.sellerUsername}</strong>
//                 )}
//               </p>

//               <p>
//                 Κατηγορία: <strong>{auction.categoryName}</strong>
//               </p>

//               <p>
//                 Τοποθεσία πωλητή:{" "}
//                 <strong>{getCityFromLocation(auction.sellerLocation)}</strong>
//               </p>

//               <p>
//                 Starting amount: <strong>{auction.startingAmount}€</strong>
//               </p>

//               <p>
//                 Min bid increment: <strong>{auction.minBidIncrement}€</strong>
//               </p>

//               <p>
//                 Χρόνος που απομένει:{" "}
//                 <strong>{formatTimeRemaining(auction.endDate, now)}</strong>
//               </p>

//               <p style={{ marginTop: "0.5rem" }}>
//                 <strong>Short description:</strong> {auction.shortDescription}
//               </p>

//               <p>
//                 <strong>Full description:</strong> {auction.description}
//               </p>

//               <p>
//                 <strong>Ποιος πληρώνει τα μεταφορικά: </strong>
//                 {auction.shippingCostPayer}
//               </p>

//               {/* Images */}
//               <div style={{ marginTop: "1rem" }}>
//                 <h3>Images</h3>
//                 {auction.imageUrls && auction.imageUrls.length > 0 ? (
//                   <div
//                     style={{
//                       display: "flex",
//                       flexWrap: "wrap",
//                       gap: "0.5rem",
//                       marginTop: "0.5rem",
//                     }}
//                   >
//                     {auction.imageUrls.map((url, idx) => (
//                       <div
//                         key={idx}
//                         style={{ border: "1px solid #ddd", padding: 4 }}
//                       >
//                         <img
//                           src={url}
//                           alt={`Auction image ${idx + 1}`}
//                           style={{
//                             maxWidth: 200,
//                             maxHeight: 200,
//                             display: "block",
//                             cursor: "pointer",
//                           }}
//                           onClick={() => setFullscreenImageUrl(url)}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p>Δεν υπάρχουν εικόνες για αυτή τη δημοπρασία.</p>
//                 )}
//               </div>

//               <p style={{ marginTop: "0.5rem" }}>
//                 Eligible for bid:{" "}
//                 <strong>{auction.eligibleForBid ? "YES" : "NO"}</strong>
//               </p>

//               <p>
//                 Eligible for chat:{" "}
//                 <strong>{auction.eligibleForChat ? "YES" : "NO"}</strong>
//               </p>

//               {canBid && (
//                 <div
//                   style={{
//                     marginTop: "0.5rem",
//                     display: "flex",
//                     gap: "0.5rem",
//                     alignItems: "center",
//                   }}
//                 >
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     placeholder="Ποσό (€)"
//                     value={bidAmount}
//                     onChange={(e) => setBidAmount(e.target.value)}
//                     style={{ width: "120px" }}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => handleBidClick(auction)}
//                   >
//                     Bid
//                   </button>
//                 </div>
//               )}

//               {/* 🔹 ADMIN – Edit auction block */}
//               {isAdmin && (
//                 <div style={{ marginTop: "1rem" }}>
//                   {!isEditing ? (
//                     <button
//                       type="button"
//                       onClick={() => setIsEditing(true)}
//                     >
//                       Edit auction
//                     </button>
//                   ) : (
//                     <div
//                       style={{
//                         marginTop: "0.5rem",
//                         padding: "0.75rem",
//                         border: "1px dashed #999",
//                         borderRadius: 4,
//                       }}
//                     >
//                       <h3>Edit auction</h3>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Category ID (άδειο = χωρίς αλλαγή):
//                           <input
//                             type="number"
//                             value={editForm.categoryId}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 categoryId: e.target.value,
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem", width: "120px" }}
//                           />
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Title:
//                           <input
//                             type="text"
//                             value={editForm.title}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 title: e.target.value,
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem", width: "300px" }}
//                           />
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Short description:
//                           <input
//                             type="text"
//                             value={editForm.shortDescription}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 shortDescription: e.target.value,
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem", width: "300px" }}
//                           />
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Full description:
//                           <textarea
//                             value={editForm.description}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 description: e.target.value,
//                               }))
//                             }
//                             style={{
//                               marginLeft: "0.5rem",
//                               width: "300px",
//                               height: "80px",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Starting amount:
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={editForm.startingAmount}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 startingAmount: e.target.value,
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem" }}
//                           />
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Min bid increment:
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={editForm.minBidIncrement}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 minBidIncrement: e.target.value,
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem" }}
//                           />
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Start date:
//                           <input
//                             type="datetime-local"
//                             value={editForm.startDate}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 startDate: e.target.value,
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem" }}
//                           />
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           End date:
//                           <input
//                             type="datetime-local"
//                             value={editForm.endDate}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 endDate: e.target.value,
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem" }}
//                           />
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Ποιος πληρώνει τα μεταφορικά;
//                           <select
//                             value={editForm.shippingCostPayer}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 shippingCostPayer:
//                                   e.target.value as ShippingCostPayer,
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem" }}
//                           >
//                             <option value="SELLER">
//                               Seller πληρώνει όλα τα μεταφορικά
//                             </option>
//                             <option value="BUYER">
//                               Buyer πληρώνει όλα τα μεταφορικά
//                             </option>
//                             <option value="SPLIT">
//                               50 / 50 (Seller &amp; Buyer)
//                             </option>
//                           </select>
//                         </label>
//                       </div>

//                       <div style={{ marginBottom: "0.5rem" }}>
//                         <label>
//                           Status:
//                           <select
//                             value={editForm.auctionStatus || ""}
//                             onChange={(e) =>
//                               setEditForm((prev) => ({
//                                 ...prev,
//                                 auctionStatus:
//                                   e.target.value as AuctionStatus | "",
//                               }))
//                             }
//                             style={{ marginLeft: "0.5rem" }}
//                           >
//                             <option value="">(χωρίς αλλαγή)</option>
//                             <option value="PENDING_APPROVAL">
//                               PENDING_APPROVAL
//                             </option>
//                             <option value="ACTIVE">ACTIVE</option>
//                             <option value="EXPIRED">EXPIRED</option>
//                             <option value="CANCELLED">CANCELLED</option>
//                           </select>
//                         </label>
//                       </div>

//                       <div style={{ marginTop: "0.5rem" }}>
//                         <button
//                           type="button"
//                           onClick={handleSaveEdit}
//                           style={{ marginRight: "0.5rem" }}
//                         >
//                           Save changes
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => setIsEditing(false)}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               <hr style={{ margin: "1rem 0" }} />

//               <h3>Bids</h3>
//               {auction.bids.length === 0 ? (
//                 <p>Δεν υπάρχουν bids ακόμη.</p>
//               ) : (
//                 <ul>
//                   {auction.bids.map((b) => (
//                     <li key={b.id}>
//                       {b.amount}€ από{" "}
//                       {b.bidderUsername ? (
//                         isAdmin ? (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               handleOpenUserDetails(b.bidderUsername)
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
//                             {b.bidderUsername}
//                           </button>
//                         ) : (
//                           <strong>{b.bidderUsername}</strong>
//                         )
//                       ) : (
//                         <span>άγνωστο χρήστη</span>
//                       )}{" "}
//                       ({b.createdAt})
//                     </li>
//                   ))}
//                 </ul>
//               )}

//               <hr style={{ margin: "1rem 0" }} />

//               <h3>Chat</h3>
//               {auction.chat.length === 0 ? (
//                 <p>Δεν υπάρχουν μηνύματα στο chat.</p>
//               ) : (
//                 <ul>
//                   {auction.chat.map((m) => (
//                     <li key={m.id}>
//                       <strong>
//                         {isAdmin ? (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               handleOpenUserDetails(m.senderDisplayName)
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
//                             {m.senderDisplayName}
//                           </button>
//                         ) : (
//                           m.senderDisplayName
//                         )}
//                         {m.senderDisplayName === auction.sellerUsername &&
//                           " (Auctioneer)"}
//                       </strong>
//                       : {m.content} (
//                       {m.createdAt}
//                       {typeof m.remainingMessages === "number" && (
//                         <>
//                           {" "}
//                           — απομένουν {m.remainingMessages}/25 μηνύματα
//                         </>
//                       )}
//                       )
//                     </li>
//                   ))}
//                 </ul>
//               )}

//               {!canChat && (
//                 <p style={{ color: "gray", marginTop: "0.5rem" }}>
//                   Δεν μπορείς να στείλεις μηνύματα στο chat αυτή τη στιγμή
//                   (είτε η δημοπρασία έληξε, είτε δεν έχεις δικαίωμα chat).
//                 </p>
//               )}

//               {canChat && (
//                 <div style={{ marginTop: "0.5rem" }}>
//                   <textarea
//                     value={newChatContent}
//                     onChange={(e) => setNewChatContent(e.target.value)}
//                     rows={3}
//                     style={{ width: "100%", resize: "vertical" }}
//                     placeholder="Γράψε το μήνυμά σου..."
//                   />
//                   <br />
//                   <button
//                     type="button"
//                     style={{ marginTop: "0.25rem" }}
//                     onClick={handleSendChat}
//                   >
//                     Send
//                   </button>
//                 </div>
//               )}
//             </div>
//           );
//         })()}

//       {/* Fullscreen overlay για εικόνες */}
//       {fullscreenImageUrl && (
//         <div
//           onClick={() => setFullscreenImageUrl(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(0, 0, 0, 0.8)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 2000,
//             cursor: "zoom-out",
//           }}
//         >
//           <img
//             src={fullscreenImageUrl}
//             alt="Auction fullscreen"
//             style={{
//               maxWidth: "90vw",
//               maxHeight: "90vh",
//               boxShadow: "0 0 20px rgba(0,0,0,0.5)",
//               borderRadius: 4,
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuctionDetailsPage;
// src/components/AuctionDetailsPage.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAuctionById } from "../api/Springboot/backendAuctionService";
import { placeBid } from "../api/Springboot/BackendBidService";
import { sendChatMessage } from "../api/Springboot/backendChatService";
import { adminEditAuction } from "../api/admin/backendAdminAuctionService";
import type {
  AuctionDetails,
  ShippingCostPayer,
  AdminAuctionUpdateRequest,
  AuctionStatus,
} from "../models/Springboot/Auction";

import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription, IStompSocket } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import type { AuthUserDto } from "../models/Springboot/UserEntity";

interface AuctionDetailsPageProps {
  auctionId: number;
  onBack?: () => void;
  currentUser: AuthUserDto | null;
  onOpenUserDetailsAsAdmin?: (username: string) => void;

  // ✅ ΝΕΟ: για να πας στη σελίδα "My Auctions"
  onGoToMyAuctions?: () => void;
}

interface BidEventDto {
  id: number;
  amount: number;
  bidderUsername: string;
  createdAt: string;
  auctionId: number;
  newEndDate: string;
}

interface ChatMessageDto {
  id: number;
  senderDisplayName: string;
  senderFirebaseId: string;
  content: string;
  createdAt: string;
  remainingMessages?: number;
}

// 👇 Για να μην “σπάει” TS αν το AuthUserDto έχει username ή displayName
type AuthUserLike = AuthUserDto & { username?: string; displayName?: string };

const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
  auctionId,
  onBack,
  currentUser,
  onOpenUserDetailsAsAdmin,
  onGoToMyAuctions,
}) => {
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [bidAmount, setBidAmount] = useState<string>("");

  const [bidMessage, setBidMessage] = useState<string | null>(null);
  const [bidMessageType, setBidMessageType] =
    useState<"success" | "error" | null>(null);

  const [newChatContent, setNewChatContent] = useState<string>("");

  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
    null
  );

  const [now, setNow] = useState<Date>(new Date());

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const bidSubscriptionRef = useRef<StompSubscription | null>(null);
  const chatSubscriptionRef = useRef<StompSubscription | null>(null);

  const isAdmin = currentUser?.roleName === "Admin";

  const handleOpenUserDetails = (username: string) => {
    if (!isAdmin) return;
    if (!onOpenUserDetailsAsAdmin) return;
    onOpenUserDetailsAsAdmin(username);
  };

  // ✅ ΝΕΟ: isMyAuction
  const currentUsername =
    (currentUser as AuthUserLike | null)?.username ??
    (currentUser as AuthUserLike | null)?.displayName ??
    null;

  const isMyAuction =
    !!currentUsername && !!auction && auction.sellerUsername === currentUsername;

  // ------------------ Admin edit state ------------------
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{
    categoryId: string;
    title: string;
    shortDescription: string;
    description: string;
    startingAmount: string;
    minBidIncrement: string;
    startDate: string;
    endDate: string;
    shippingCostPayer: ShippingCostPayer;
    auctionStatus: AuctionStatus | "";
  }>({
    categoryId: "",
    title: "",
    shortDescription: "",
    description: "",
    startingAmount: "",
    minBidIncrement: "",
    startDate: "",
    endDate: "",
    shippingCostPayer: "BUYER",
    auctionStatus: "",
  });

  const toDateTimeLocal = (value: string | null | undefined): string => {
    if (!value) return "";
    return value.length >= 16 ? value.slice(0, 16) : value;
  };

const hydrateEditFormFromAuction = useCallback((a: AuctionDetails) => {
  setEditForm({
    categoryId: "",
    title: a.title ?? "",
    shortDescription: a.shortDescription ?? "",
    description: a.description ?? "",
    startingAmount: a.startingAmount?.toString() ?? "",
    minBidIncrement: a.minBidIncrement?.toString() ?? "",
    startDate: toDateTimeLocal(a.startDate),
    endDate: toDateTimeLocal(a.endDate),
    shippingCostPayer: a.shippingCostPayer,
    auctionStatus: a.status as AuctionStatus,
  });
}, []);


  // ------------------ timers / listeners ------------------
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImageUrl(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ------------------ STOMP connect once ------------------
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket as IStompSocket,
      reconnectDelay: 5000,
      debug: () => {},
    });

    client.onConnect = () => setStompClient(client);

    client.onStompError = (frame) => {
      console.error(
        "STOMP error (details):",
        frame.headers["message"],
        frame.body
      );
    };

    client.activate();

    return () => {
      if (bidSubscriptionRef.current) {
        bidSubscriptionRef.current.unsubscribe();
        bidSubscriptionRef.current = null;
      }
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current.unsubscribe();
        chatSubscriptionRef.current = null;
      }
      client.deactivate();
    };
  }, []);

  // ------------------ subscribe bids/chat ------------------
  useEffect(() => {
    if (!stompClient || !stompClient.connected) return;

    if (bidSubscriptionRef.current) {
      bidSubscriptionRef.current.unsubscribe();
      bidSubscriptionRef.current = null;
    }
    if (chatSubscriptionRef.current) {
      chatSubscriptionRef.current.unsubscribe();
      chatSubscriptionRef.current = null;
    }

    const bidDestination = `/topic/auctions/${auctionId}`;
    const bidSub = stompClient.subscribe(bidDestination, (message: IMessage) => {
      try {
        const payload: BidEventDto = JSON.parse(message.body);

        setAuction((prev) => {
          if (!prev || prev.id !== payload.auctionId) return prev;

          const newBid = {
            id: payload.id,
            amount: payload.amount,
            bidderUsername: payload.bidderUsername,
            createdAt: payload.createdAt,
            auctionId: payload.auctionId,
          };

          const alreadyExists = prev.bids.some((b) => b.id === newBid.id);
          const updatedBids = alreadyExists ? prev.bids : [newBid, ...prev.bids];

          return {
            ...prev,
            endDate: payload.newEndDate,
            bids: updatedBids,
          };
        });
      } catch (err) {
        console.error("Failed to parse BidEventDto (details)", err);
      }
    });
    bidSubscriptionRef.current = bidSub;

    const chatDestination = `/topic/auctions/${auctionId}/chat`;
    const chatSub = stompClient.subscribe(
      chatDestination,
      (message: IMessage) => {
        try {
          const payload: ChatMessageDto = JSON.parse(message.body);

          setAuction((prev) => {
            if (!prev || prev.id !== auctionId) return prev;
            const exists = prev.chat.some((m) => m.id === payload.id);
            if (exists) return prev;

            return { ...prev, chat: [...prev.chat, payload] };
          });
        } catch (err) {
          console.error("Failed to parse ChatMessageDto (details)", err);
        }
      }
    );
    chatSubscriptionRef.current = chatSub;

    return () => {
      bidSub.unsubscribe();
      chatSub.unsubscribe();
      if (bidSubscriptionRef.current === bidSub) bidSubscriptionRef.current = null;
      if (chatSubscriptionRef.current === chatSub) chatSubscriptionRef.current = null;
    };
  }, [stompClient, auctionId]);

  // ------------------ load auction ------------------
  const loadAuction = useCallback(async () => {
    setError(null);
    setLoading(true);
    setAuction(null);

    try {
      const result = await getAuctionById(auctionId);
      setAuction(result);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Κάτι πήγε στραβά κατά τη φόρτωση της δημοπρασίας.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadAuction();
  }, [loadAuction]);

  // hydrate edit form when auction changes
  useEffect(() => {
    if (!auction) return;
    hydrateEditFormFromAuction(auction);
  }, [auction, hydrateEditFormFromAuction]);


  // ------------------ helpers ------------------
  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
    const end = new Date(endDateIso);
    const diffMs = end.getTime() - nowValue.getTime();
    if (Number.isNaN(end.getTime())) return endDateIso;
    if (diffMs <= 0) return "Έληξε";

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

  // ------------------ actions ------------------
  const handleBidClick = async (auctionDetails: AuctionDetails) => {
    const raw = bidAmount;
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
      await placeBid(auctionDetails.id, amount);
      showBidMessage("success", "Η προσφορά καταχωρήθηκε με επιτυχία!");
      setBidAmount("");
      await loadAuction();
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Κάτι πήγε στραβά κατά την προσφορά.";
      showBidMessage("error", message);
    }
  };

  const handleSendChat = async () => {
    if (!auction) return;
    const trimmed = newChatContent.trim();
    if (!trimmed) {
      window.alert("Το μήνυμα δεν μπορεί να είναι κενό.");
      return;
    }

    try {
      await sendChatMessage(auction.id, trimmed);
      setNewChatContent("");
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Κάτι πήγε στραβά κατά την αποστολή του μηνύματος.";
      window.alert(message);
    }
  };

  const handleSaveEdit = async () => {
    if (!auction) return;

    const payload: AdminAuctionUpdateRequest = {
      categoryId: editForm.categoryId ? Number(editForm.categoryId) : undefined,
      title: editForm.title.trim() || undefined,
      shortDescription: editForm.shortDescription.trim() || undefined,
      description: editForm.description.trim() || undefined,
      startingAmount: editForm.startingAmount
        ? Number(editForm.startingAmount)
        : undefined,
      minBidIncrement: editForm.minBidIncrement
        ? Number(editForm.minBidIncrement)
        : undefined,
      startDate: editForm.startDate || undefined,
      endDate: editForm.endDate || undefined,
      shippingCostPayer: editForm.shippingCostPayer,
      auctionStatus: editForm.auctionStatus || undefined,
    };

    try {
      const updated = await adminEditAuction(auction.id, payload);
      setAuction(updated);
      setIsEditing(false);
      showBidMessage("success", "Η δημοπρασία ενημερώθηκε με επιτυχία.");
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Κάτι πήγε στραβά κατά την ενημέρωση της δημοπρασίας.";
      showBidMessage("error", message);
    }
  };

  const handleCancelEdit = () => {
    if (auction) hydrateEditFormFromAuction(auction);
    setIsEditing(false);
  };

  // ------------------ render ------------------
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" onClick={onBack}>
            ← Back to auctions
          </button>

          {/* ✅ ΝΕΟ: Go to My Auctions (μόνο αν είναι δικό σου) */}
          {isMyAuction && onGoToMyAuctions && (
            <button type="button" onClick={onGoToMyAuctions}>
              Go to My Auctions
            </button>
          )}
        </div>

        {/* ✅ ΝΕΟ: badge */}
        {isMyAuction && (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid #2e7d32",
              color: "#2e7d32",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            My auction
          </span>
        )}
      </div>

      <h1>Auction Details</h1>

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

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {auction && !loading && !error && (() => {
        const isActive = isAuctionActive(auction.endDate, now);
        const canBid = auction.eligibleForBid && isActive;
        const canChat = auction.eligibleForChat && isActive;

        return (
          <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: 4 }}>
            <h2 style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {auction.title}
              {isMyAuction && (
                <span style={{ fontSize: "0.85rem", color: "#2e7d32" }}>
                  (You are the seller)
                </span>
              )}
            </h2>

            <p>
              Πωλητής:{" "}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => handleOpenUserDetails(auction.sellerUsername)}
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
                  {auction.sellerUsername}
                </button>
              ) : (
                <strong>{auction.sellerUsername}</strong>
              )}
            </p>

            <p>
              Κατηγορία: <strong>{auction.categoryName}</strong>
            </p>

            <p>
              Τοποθεσία πωλητή:{" "}
              <strong>{getCityFromLocation(auction.sellerLocation)}</strong>
            </p>

            <p>
              Starting amount: <strong>{auction.startingAmount}€</strong>
            </p>

            <p>
              Min bid increment: <strong>{auction.minBidIncrement}€</strong>
            </p>

            <p>
              Χρόνος που απομένει:{" "}
              <strong>{formatTimeRemaining(auction.endDate, now)}</strong>
            </p>

            <p style={{ marginTop: "0.5rem" }}>
              <strong>Short description:</strong> {auction.shortDescription}
            </p>

            <p>
              <strong>Full description:</strong> {auction.description}
            </p>

            <p>
              <strong>Ποιος πληρώνει τα μεταφορικά: </strong>
              {auction.shippingCostPayer}
            </p>

            <div style={{ marginTop: "1rem" }}>
              <h3>Images</h3>
              {auction.imageUrls && auction.imageUrls.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {auction.imageUrls.map((url, idx) => (
                    <div key={idx} style={{ border: "1px solid #ddd", padding: 4 }}>
                      <img
                        src={url}
                        alt={`Auction image ${idx + 1}`}
                        style={{ maxWidth: 200, maxHeight: 200, display: "block", cursor: "pointer" }}
                        onClick={() => setFullscreenImageUrl(url)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p>Δεν υπάρχουν εικόνες για αυτή τη δημοπρασία.</p>
              )}
            </div>

            <p style={{ marginTop: "0.5rem" }}>
              Eligible for bid: <strong>{auction.eligibleForBid ? "YES" : "NO"}</strong>
            </p>

            <p>
              Eligible for chat: <strong>{auction.eligibleForChat ? "YES" : "NO"}</strong>
            </p>

            {canBid && (
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ποσό (€)"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  style={{ width: "120px" }}
                />
                <button type="button" onClick={() => handleBidClick(auction)}>
                  Bid
                </button>
              </div>
            )}

            {isAdmin && (
              <div style={{ marginTop: "1rem" }}>
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)}>
                    Edit auction
                  </button>
                ) : (
                  <div style={{ marginTop: "0.5rem", padding: "0.75rem", border: "1px dashed #999", borderRadius: 4 }}>
                    <h3>Edit auction</h3>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Category ID (άδειο = χωρίς αλλαγή):
                        <input
                          type="number"
                          value={editForm.categoryId}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, categoryId: e.target.value }))
                          }
                          style={{ marginLeft: "0.5rem", width: "120px" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Title:
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                          style={{ marginLeft: "0.5rem", width: "300px" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Short description:
                        <input
                          type="text"
                          value={editForm.shortDescription}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, shortDescription: e.target.value }))
                          }
                          style={{ marginLeft: "0.5rem", width: "300px" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Full description:
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          style={{ marginLeft: "0.5rem", width: "300px", height: "80px" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Starting amount:
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.startingAmount}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, startingAmount: e.target.value }))
                          }
                          style={{ marginLeft: "0.5rem" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Min bid increment:
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.minBidIncrement}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, minBidIncrement: e.target.value }))
                          }
                          style={{ marginLeft: "0.5rem" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Start date:
                        <input
                          type="datetime-local"
                          value={editForm.startDate}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
                          style={{ marginLeft: "0.5rem" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        End date:
                        <input
                          type="datetime-local"
                          value={editForm.endDate}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
                          style={{ marginLeft: "0.5rem" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Ποιος πληρώνει τα μεταφορικά;
                        <select
                          value={editForm.shippingCostPayer}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              shippingCostPayer: e.target.value as ShippingCostPayer,
                            }))
                          }
                          style={{ marginLeft: "0.5rem" }}
                        >
                          <option value="SELLER">Seller πληρώνει όλα τα μεταφορικά</option>
                          <option value="BUYER">Buyer πληρώνει όλα τα μεταφορικά</option>
                          <option value="SPLIT">50 / 50 (Seller &amp; Buyer)</option>
                        </select>
                      </label>
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <label>
                        Status:
                        <select
                          value={editForm.auctionStatus || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              auctionStatus: e.target.value as AuctionStatus | "",
                            }))
                          }
                          style={{ marginLeft: "0.5rem" }}
                        >
                          <option value="">(χωρίς αλλαγή)</option>
                          <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="EXPIRED">EXPIRED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </label>
                    </div>

                    <div style={{ marginTop: "0.5rem" }}>
                      <button type="button" onClick={handleSaveEdit} style={{ marginRight: "0.5rem" }}>
                        Save changes
                      </button>
                      <button type="button" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <hr style={{ margin: "1rem 0" }} />

            <h3>Bids</h3>
            {auction.bids.length === 0 ? (
              <p>Δεν υπάρχουν bids ακόμη.</p>
            ) : (
              <ul>
                {auction.bids.map((b) => (
                  <li key={b.id}>
                    {b.amount}€ από{" "}
                    {b.bidderUsername ? (
                      isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleOpenUserDetails(b.bidderUsername)}
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
                          {b.bidderUsername}
                        </button>
                      ) : (
                        <strong>{b.bidderUsername}</strong>
                      )
                    ) : (
                      <span>άγνωστο χρήστη</span>
                    )}{" "}
                    ({b.createdAt})
                  </li>
                ))}
              </ul>
            )}

            <hr style={{ margin: "1rem 0" }} />

            <h3>Chat</h3>
            {auction.chat.length === 0 ? (
              <p>Δεν υπάρχουν μηνύματα στο chat.</p>
            ) : (
              <ul>
                {auction.chat.map((m) => (
                  <li key={m.id}>
                    <strong>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleOpenUserDetails(m.senderDisplayName)}
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
                          {m.senderDisplayName}
                        </button>
                      ) : (
                        m.senderDisplayName
                      )}
                      {m.senderDisplayName === auction.sellerUsername && " (Auctioneer)"}
                    </strong>
                    : {m.content} ({m.createdAt}
                    {typeof m.remainingMessages === "number" && (
                      <> — απομένουν {m.remainingMessages}/25 μηνύματα</>
                    )}
                    )
                  </li>
                ))}
              </ul>
            )}

            {!canChat && (
              <p style={{ color: "gray", marginTop: "0.5rem" }}>
                Δεν μπορείς να στείλεις μηνύματα στο chat αυτή τη στιγμή
                (είτε η δημοπρασία έληξε, είτε δεν έχεις δικαίωμα chat).
              </p>
            )}

            {canChat && (
              <div style={{ marginTop: "0.5rem" }}>
                <textarea
                  value={newChatContent}
                  onChange={(e) => setNewChatContent(e.target.value)}
                  rows={3}
                  style={{ width: "100%", resize: "vertical" }}
                  placeholder="Γράψε το μήνυμά σου..."
                />
                <br />
                <button type="button" style={{ marginTop: "0.25rem" }} onClick={handleSendChat}>
                  Send
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {fullscreenImageUrl && (
        <div
          onClick={() => setFullscreenImageUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            cursor: "zoom-out",
          }}
        >
          <img
            src={fullscreenImageUrl}
            alt="Auction fullscreen"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              borderRadius: 4,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AuctionDetailsPage;
