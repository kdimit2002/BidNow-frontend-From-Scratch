

// // // src/components/AuctionDetailsPage.tsx

// // import React, {
// //   useState,
// //   useEffect,
// //   useCallback,
// //   useRef,
// // } from "react";
// // import { getAuctionById } from "../api/Springboot/backendAuctionService";
// // import { placeBid } from "../api/Springboot/BackendBidService";
// // import { sendChatMessage } from "../api/Springboot/backendChatService";
// // import { adminEditAuction } from "../api/admin/backendAdminAuctionService";
// // import type {
// //   AuctionDetails,
// //   ShippingCostPayer,
// //   AdminAuctionUpdateRequest,
// //   AuctionStatus,
// // } from "../models/Springboot/Auction";

// // import { Client } from "@stomp/stompjs";
// // import type {
// //   IMessage,
// //   StompSubscription,
// //   IStompSocket,
// // } from "@stomp/stompjs";
// // import SockJS from "sockjs-client";

// // // 🔹 Auth user τύπος
// // import type { AuthUserDto } from "../models/Springboot/UserEntity";

// // interface AuctionDetailsPageProps {
// //   auctionId: number;
// //   onBack?: () => void;
// //   currentUser: AuthUserDto | null;
// //   onOpenUserDetailsAsAdmin?: (username: string) => void;
// // }

// // // DTO που στέλνει το backend για Bids (WebSocket)
// // interface BidEventDto {
// //   id: number;
// //   amount: number;
// //   bidderUsername: string;
// //   createdAt: string;
// //   auctionId: number;
// //   newEndDate: string;
// // }

// // // DTO που στέλνει το backend για Chat (WebSocket)
// // interface ChatMessageDto {
// //   id: number;
// //   senderDisplayName: string;
// //   senderFirebaseId: string;
// //   content: string;
// //   createdAt: string;
// //   remainingMessages?: number;
// // }

// // const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
// //   auctionId,
// //   onBack,
// //   currentUser,
// //   onOpenUserDetailsAsAdmin,
// // }) => {
// //   const [auction, setAuction] = useState<AuctionDetails | null>(null);
// //   const [loading, setLoading] = useState<boolean>(false);
// //   const [error, setError] = useState<string | null>(null);

// //   const [bidAmount, setBidAmount] = useState<string>("");

// //   // feedback για bid
// //   const [bidMessage, setBidMessage] = useState<string | null>(null);
// //   const [bidMessageType, setBidMessageType] =
// //     useState<"success" | "error" | null>(null);

// //   // νέο μήνυμα chat (textarea)
// //   const [newChatContent, setNewChatContent] = useState<string>("");

// //   // fullscreen image
// //   const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
// //     null
// //   );

// //   // real-time countdown
// //   const [now, setNow] = useState<Date>(new Date());

// //   // STOMP client + subscriptions (bids + chat)
// //   const [stompClient, setStompClient] = useState<Client | null>(null);
// //   const bidSubscriptionRef = useRef<StompSubscription | null>(null);
// //   const chatSubscriptionRef = useRef<StompSubscription | null>(null);

// //   // 🔹 Admin flag (μία πηγή αλήθειας)
// //   const isAdmin = currentUser?.roleName === "Admin";

// //   const handleOpenUserDetails = (username: string) => {
// //     if (!isAdmin) return;
// //     if (!onOpenUserDetailsAsAdmin) return;
// //     onOpenUserDetailsAsAdmin(username);
// //   };

// //   // 🔹 Edit state για ADMIN (auction edit)
// //   const [isEditing, setIsEditing] = useState<boolean>(false);
// //   const [editForm, setEditForm] = useState<{
// //     categoryId: string;
// //     title: string;
// //     shortDescription: string;
// //     description: string;
// //     startingAmount: string;
// //     minBidIncrement: string;
// //     startDate: string;
// //     endDate: string;
// //     shippingCostPayer: ShippingCostPayer;
// //     auctionStatus: AuctionStatus | "";
// //   }>({
// //     categoryId: "",
// //     title: "",
// //     shortDescription: "",
// //     description: "",
// //     startingAmount: "",
// //     minBidIncrement: "",
// //     startDate: "",
// //     endDate: "",
// //     shippingCostPayer: "BUYER",
// //     auctionStatus: "",
// //   });

// //   const toDateTimeLocal = (value: string | null | undefined): string => {
// //     if (!value) return "";
// //     // backend π.χ. "2025-12-26T15:19:00" → input datetime-local θέλει "YYYY-MM-DDTHH:mm"
// //     return value.length >= 16 ? value.slice(0, 16) : value;
// //   };

// //   // update "now" κάθε 1s
// //   useEffect(() => {
// //     const timer = setInterval(() => {
// //       setNow(new Date());
// //     }, 1000);
// //     return () => clearInterval(timer);
// //   }, []);

// //   // ESC για κλείσιμο fullscreen εικόνας
// //   useEffect(() => {
// //     const handleKeyDown = (e: KeyboardEvent) => {
// //       if (e.key === "Escape") {
// //         setFullscreenImageUrl(null);
// //       }
// //     };

// //     window.addEventListener("keydown", handleKeyDown);
// //     return () => window.removeEventListener("keydown", handleKeyDown);
// //   }, []);

// //   // WebSocket/STOMP σύνδεση ΜΙΑ φορά
// //   useEffect(() => {
// //     const socket = new SockJS("http://localhost:8080/ws");
// //     const client = new Client({
// //       webSocketFactory: () => socket as IStompSocket,
// //       reconnectDelay: 5000,
// //       debug: () => {
// //         // console.log('[STOMP details]', msg);
// //       },
// //     });

// //     client.onConnect = () => {
// //       console.log("STOMP connected (details)");
// //       setStompClient(client);
// //     };

// //     client.onStompError = (frame) => {
// //       console.error(
// //         "STOMP error (details):",
// //         frame.headers["message"],
// //         frame.body
// //       );
// //     };

// //     client.activate();

// //     return () => {
// //       if (bidSubscriptionRef.current) {
// //         bidSubscriptionRef.current.unsubscribe();
// //         bidSubscriptionRef.current = null;
// //       }
// //       if (chatSubscriptionRef.current) {
// //         chatSubscriptionRef.current.unsubscribe();
// //         chatSubscriptionRef.current = null;
// //       }
// //       client.deactivate();
// //     };
// //   }, []);

// //   // Subscribe σε bid topic + chat topic
// //   useEffect(() => {
// //     if (!stompClient || !stompClient.connected) {
// //       return;
// //     }

// //     // καθάρισε παλιά subscriptions (αν αλλάξει auctionId)
// //     if (bidSubscriptionRef.current) {
// //       bidSubscriptionRef.current.unsubscribe();
// //       bidSubscriptionRef.current = null;
// //     }
// //     if (chatSubscriptionRef.current) {
// //       chatSubscriptionRef.current.unsubscribe();
// //       chatSubscriptionRef.current = null;
// //     }

// //     // -------- BIDS --------
// //     const bidDestination = `/topic/auctions/${auctionId}`;
// //     const bidSub = stompClient.subscribe(
// //       bidDestination,
// //       (message: IMessage) => {
// //         try {
// //           const payload: BidEventDto = JSON.parse(message.body);

// //           setAuction((prev) => {
// //             if (!prev || prev.id !== payload.auctionId) return prev;

// //             const newBid = {
// //               id: payload.id,
// //               amount: payload.amount,
// //               bidderUsername: payload.bidderUsername,
// //               createdAt: payload.createdAt,
// //               auctionId: payload.auctionId,
// //             };

// //             const alreadyExists = prev.bids.some((b) => b.id === newBid.id);
// //             const updatedBids = alreadyExists
// //               ? prev.bids
// //               : [newBid, ...prev.bids];

// //             return {
// //               ...prev,
// //               endDate: payload.newEndDate,
// //               bids: updatedBids,
// //             };
// //           });
// //         } catch (err) {
// //           console.error("Failed to parse BidEventDto (details)", err);
// //         }
// //       }
// //     );
// //     bidSubscriptionRef.current = bidSub;

// //     // -------- CHAT --------
// //     const chatDestination = `/topic/auctions/${auctionId}/chat`;
// //     const chatSub = stompClient.subscribe(
// //       chatDestination,
// //       (message: IMessage) => {
// //         try {
// //           const payload: ChatMessageDto = JSON.parse(message.body);

// //           setAuction((prev) => {
// //             if (!prev || prev.id !== auctionId) return prev;
// //             const exists = prev.chat.some((m) => m.id === payload.id);
// //             if (exists) return prev;

// //             return {
// //               ...prev,
// //               chat: [...prev.chat, payload],
// //             };
// //           });
// //         } catch (err) {
// //           console.error("Failed to parse ChatMessageDto (details)", err);
// //         }
// //       }
// //     );
// //     chatSubscriptionRef.current = chatSub;

// //     return () => {
// //       bidSub.unsubscribe();
// //       chatSub.unsubscribe();
// //       if (bidSubscriptionRef.current === bidSub) {
// //         bidSubscriptionRef.current = null;
// //       }
// //       if (chatSubscriptionRef.current === chatSub) {
// //         chatSubscriptionRef.current = null;
// //       }
// //     };
// //   }, [stompClient, auctionId]);

// //   const loadAuction = useCallback(async () => {
// //     setError(null);
// //     setLoading(true);
// //     setAuction(null);

// //     try {
// //       const result = await getAuctionById(auctionId);
// //       setAuction(result);
// //     } catch (err: unknown) {
// //       console.error(err);
// //       let message = "Κάτι πήγε στραβά κατά τη φόρτωση της δημοπρασίας.";
// //       if (err instanceof Error) {
// //         message = err.message;
// //       }
// //       setError(message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [auctionId]);

// //   useEffect(() => {
// //     loadAuction();
// //   }, [loadAuction]);

// //   // Όταν φορτώνεται/αλλάζει το auction, γεμίζουμε τη φόρμα edit (για Admin)
// //   useEffect(() => {
// //     if (!auction) return;
// //     setEditForm({
// //       categoryId: "", // αφήνουμε κενό = δεν αλλάζουμε κατηγορία, εκτός αν το γεμίσει ο admin
// //       title: auction.title ?? "",
// //       shortDescription: auction.shortDescription ?? "",
// //       description: auction.description ?? "",
// //       startingAmount: auction.startingAmount?.toString() ?? "",
// //       minBidIncrement: auction.minBidIncrement?.toString() ?? "",
// //       startDate: toDateTimeLocal(auction.startDate),
// //       endDate: toDateTimeLocal(auction.endDate),
// //       shippingCostPayer: auction.shippingCostPayer,
// //       auctionStatus: auction.status as AuctionStatus,
// //     });
// //   }, [auction]);

// //   const getCityFromLocation = (sellerLocation: string | null): string => {
// //     if (!sellerLocation) return "Unknown";
// //     const [city] = sellerLocation.split(",");
// //     return city.trim();
// //   };

// //   const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
// //     const end = new Date(endDateIso);
// //     const diffMs = end.getTime() - nowValue.getTime();

// //     if (Number.isNaN(end.getTime())) {
// //       return endDateIso;
// //     }

// //     if (diffMs <= 0) {
// //       return "Έληξε";
// //     }

// //     let totalSeconds = Math.floor(diffMs / 1000);

// //     const days = Math.floor(totalSeconds / (24 * 3600));
// //     totalSeconds -= days * 24 * 3600;

// //     const hours = Math.floor(totalSeconds / 3600);
// //     totalSeconds -= hours * 3600;

// //     const minutes = Math.floor(totalSeconds / 60);
// //     const seconds = totalSeconds - minutes * 60;

// //     if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
// //     if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
// //     if (minutes > 0) return `${minutes}m ${seconds}s`;
// //     return `${seconds}s`;
// //   };

// //   const isAuctionActive = (endDateIso: string, nowValue: Date): boolean => {
// //     const end = new Date(endDateIso);
// //     if (Number.isNaN(end.getTime())) return false;
// //     return end.getTime() - nowValue.getTime() > 0;
// //   };

// //   const showBidMessage = (type: "success" | "error", message: string) => {
// //     setBidMessageType(type);
// //     setBidMessage(message);
// //     setTimeout(() => {
// //       setBidMessage(null);
// //       setBidMessageType(null);
// //     }, 5000);
// //   };

// //   const handleBidClick = async (auctionDetails: AuctionDetails) => {
// //     const raw = bidAmount;

// //     if (!raw || raw.trim() === "") {
// //       window.alert("Συμπλήρωσε ποσό προσφοράς.");
// //       return;
// //     }

// //     const amount = Number(raw);
// //     if (!Number.isFinite(amount) || amount <= 0) {
// //       window.alert("Μη έγκυρο ποσό.");
// //       return;
// //     }

// //     try {
// //       await placeBid(auctionDetails.id, amount);
// //       showBidMessage("success", "Η προσφορά καταχωρήθηκε με επιτυχία!");

// //       setBidAmount("");
// //       await loadAuction();
// //     } catch (err: unknown) {
// //       console.error(err);
// //       let message = "Κάτι πήγε στραβά κατά την προσφορά.";
// //       if (err instanceof Error && err.message) {
// //         message = err.message;
// //       }
// //       showBidMessage("error", message);
// //     }
// //   };

// //   const handleSendChat = async () => {
// //     if (!auction) return;
// //     const trimmed = newChatContent.trim();
// //     if (!trimmed) {
// //       window.alert("Το μήνυμα δεν μπορεί να είναι κενό.");
// //       return;
// //     }

// //     try {
// //       await sendChatMessage(auction.id, trimmed);
// //       setNewChatContent("");
// //       // Θα έρθει μέσω WebSocket
// //     } catch (err: unknown) {
// //       console.error(err);
// //       let message = "Κάτι πήγε στραβά κατά την αποστολή του μηνύματος.";
// //       if (err instanceof Error && err.message) {
// //         message = err.message;
// //       }
// //       window.alert(message);
// //     }
// //   };

// //   const handleSaveEdit = async () => {
// //     if (!auction) return;

// //     const payload: AdminAuctionUpdateRequest = {
// //       categoryId: editForm.categoryId
// //         ? Number(editForm.categoryId)
// //         : undefined,
// //       title: editForm.title.trim() || undefined,
// //       shortDescription: editForm.shortDescription.trim() || undefined,
// //       description: editForm.description.trim() || undefined,
// //       startingAmount: editForm.startingAmount
// //         ? Number(editForm.startingAmount)
// //         : undefined,
// //       minBidIncrement: editForm.minBidIncrement
// //         ? Number(editForm.minBidIncrement)
// //         : undefined,
// //       startDate: editForm.startDate || undefined,
// //       endDate: editForm.endDate || undefined,
// //       shippingCostPayer: editForm.shippingCostPayer,
// //       status: editForm.auctionStatus || undefined,
// //     };

// //     try {
// //       const updated = await adminEditAuction(auction.id, payload);
// //       setAuction(updated);
// //       setIsEditing(false);
// //       showBidMessage("success", "Η δημοπρασία ενημερώθηκε με επιτυχία.");
// //     } catch (err: unknown) {
// //       console.error(err);
// //       let message = "Κάτι πήγε στραβά κατά την ενημέρωση της δημοπρασίας.";
// //       if (err instanceof Error && err.message) {
// //         message = err.message;
// //       }
// //       showBidMessage("error", message);
// //     }
// //   };

// //   return (
// //     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
// //       <div style={{ marginBottom: "1rem" }}>
// //         <button type="button" onClick={onBack}>
// //           ← Back to auctions
// //         </button>
// //       </div>

// //       <h1>Auction Details</h1>

// //       {/* Μήνυμα για bid / admin actions */}
// //       {bidMessage && (
// //         <p
// //           style={{
// //             color: bidMessageType === "error" ? "red" : "green",
// //             fontWeight: "bold",
// //           }}
// //         >
// //           {bidMessage}
// //         </p>
// //       )}

// //       {loading && <p>Φόρτωση...</p>}
// //       {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

// //       {auction &&
// //         !loading &&
// //         !error &&
// //         (() => {
// //           const isActive = isAuctionActive(auction.endDate, now);
// //           const canBid = auction.eligibleForBid && isActive;
// //           const canChat = auction.eligibleForChat && isActive;

// //           return (
// //             <div
// //               style={{
// //                 border: "1px solid #ccc",
// //                 padding: "1rem",
// //                 borderRadius: 4,
// //               }}
// //             >
// //               <h2>{auction.title}</h2>

// //               <p>
// //                 Πωλητής:{" "}
// //                 {isAdmin ? (
// //                   <button
// //                     type="button"
// //                     onClick={() =>
// //                       handleOpenUserDetails(auction.sellerUsername)
// //                     }
// //                     style={{
// //                       background: "none",
// //                       border: "none",
// //                       padding: 0,
// //                       margin: 0,
// //                       color: "blue",
// //                       textDecoration: "underline",
// //                       cursor: "pointer",
// //                       font: "inherit",
// //                       fontWeight: "bold",
// //                     }}
// //                   >
// //                     {auction.sellerUsername}
// //                   </button>
// //                 ) : (
// //                   <strong>{auction.sellerUsername}</strong>
// //                 )}
// //               </p>

// //               <p>
// //                 Κατηγορία: <strong>{auction.categoryName}</strong>
// //               </p>

// //               <p>
// //                 Τοποθεσία πωλητή:{" "}
// //                 <strong>{getCityFromLocation(auction.sellerLocation)}</strong>
// //               </p>

// //               <p>
// //                 Starting amount: <strong>{auction.startingAmount}€</strong>
// //               </p>

// //               <p>
// //                 Min bid increment: <strong>{auction.minBidIncrement}€</strong>
// //               </p>

// //               <p>
// //                 Χρόνος που απομένει:{" "}
// //                 <strong>{formatTimeRemaining(auction.endDate, now)}</strong>
// //               </p>

// //               <p style={{ marginTop: "0.5rem" }}>
// //                 <strong>Short description:</strong> {auction.shortDescription}
// //               </p>

// //               <p>
// //                 <strong>Full description:</strong> {auction.description}
// //               </p>

// //               <p>
// //                 <strong>Ποιος πληρώνει τα μεταφορικά: </strong>
// //                 {auction.shippingCostPayer}
// //               </p>

// //               {/* Images */}
// //               <div style={{ marginTop: "1rem" }}>
// //                 <h3>Images</h3>
// //                 {auction.imageUrls && auction.imageUrls.length > 0 ? (
// //                   <div
// //                     style={{
// //                       display: "flex",
// //                       flexWrap: "wrap",
// //                       gap: "0.5rem",
// //                       marginTop: "0.5rem",
// //                     }}
// //                   >
// //                     {auction.imageUrls.map((url, idx) => (
// //                       <div
// //                         key={idx}
// //                         style={{ border: "1px solid #ddd", padding: 4 }}
// //                       >
// //                         <img
// //                           src={url}
// //                           alt={`Auction image ${idx + 1}`}
// //                           style={{
// //                             maxWidth: 200,
// //                             maxHeight: 200,
// //                             display: "block",
// //                             cursor: "pointer",
// //                           }}
// //                           onClick={() => setFullscreenImageUrl(url)}
// //                         />
// //                       </div>
// //                     ))}
// //                   </div>
// //                 ) : (
// //                   <p>Δεν υπάρχουν εικόνες για αυτή τη δημοπρασία.</p>
// //                 )}
// //               </div>

// //               <p style={{ marginTop: "0.5rem" }}>
// //                 Eligible for bid:{" "}
// //                 <strong>{auction.eligibleForBid ? "YES" : "NO"}</strong>
// //               </p>

// //               <p>
// //                 Eligible for chat:{" "}
// //                 <strong>{auction.eligibleForChat ? "YES" : "NO"}</strong>
// //               </p>

// //               {canBid && (
// //                 <div
// //                   style={{
// //                     marginTop: "0.5rem",
// //                     display: "flex",
// //                     gap: "0.5rem",
// //                     alignItems: "center",
// //                   }}
// //                 >
// //                   <input
// //                     type="number"
// //                     min="0"
// //                     step="0.01"
// //                     placeholder="Ποσό (€)"
// //                     value={bidAmount}
// //                     onChange={(e) => setBidAmount(e.target.value)}
// //                     style={{ width: "120px" }}
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => handleBidClick(auction)}
// //                   >
// //                     Bid
// //                   </button>
// //                 </div>
// //               )}

// //               {/* 🔹 ADMIN – Edit auction block */}
// //               {isAdmin && (
// //                 <div style={{ marginTop: "1rem" }}>
// //                   {!isEditing ? (
// //                     <button
// //                       type="button"
// //                       onClick={() => setIsEditing(true)}
// //                     >
// //                       Edit auction
// //                     </button>
// //                   ) : (
// //                     <div
// //                       style={{
// //                         marginTop: "0.5rem",
// //                         padding: "0.75rem",
// //                         border: "1px dashed #999",
// //                         borderRadius: 4,
// //                       }}
// //                     >
// //                       <h3>Edit auction</h3>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Category ID (άδειο = χωρίς αλλαγή):
// //                           <input
// //                             type="number"
// //                             value={editForm.categoryId}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 categoryId: e.target.value,
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem", width: "120px" }}
// //                           />
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Title:
// //                           <input
// //                             type="text"
// //                             value={editForm.title}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 title: e.target.value,
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem", width: "300px" }}
// //                           />
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Short description:
// //                           <input
// //                             type="text"
// //                             value={editForm.shortDescription}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 shortDescription: e.target.value,
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem", width: "300px" }}
// //                           />
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Full description:
// //                           <textarea
// //                             value={editForm.description}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 description: e.target.value,
// //                               }))
// //                             }
// //                             style={{
// //                               marginLeft: "0.5rem",
// //                               width: "300px",
// //                               height: "80px",
// //                             }}
// //                           />
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Starting amount:
// //                           <input
// //                             type="number"
// //                             step="0.01"
// //                             value={editForm.startingAmount}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 startingAmount: e.target.value,
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem" }}
// //                           />
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Min bid increment:
// //                           <input
// //                             type="number"
// //                             step="0.01"
// //                             value={editForm.minBidIncrement}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 minBidIncrement: e.target.value,
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem" }}
// //                           />
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Start date:
// //                           <input
// //                             type="datetime-local"
// //                             value={editForm.startDate}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 startDate: e.target.value,
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem" }}
// //                           />
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           End date:
// //                           <input
// //                             type="datetime-local"
// //                             value={editForm.endDate}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 endDate: e.target.value,
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem" }}
// //                           />
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Ποιος πληρώνει τα μεταφορικά;
// //                           <select
// //                             value={editForm.shippingCostPayer}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 shippingCostPayer:
// //                                   e.target.value as ShippingCostPayer,
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem" }}
// //                           >
// //                             <option value="SELLER">
// //                               Seller πληρώνει όλα τα μεταφορικά
// //                             </option>
// //                             <option value="BUYER">
// //                               Buyer πληρώνει όλα τα μεταφορικά
// //                             </option>
// //                             <option value="SPLIT">
// //                               50 / 50 (Seller &amp; Buyer)
// //                             </option>
// //                           </select>
// //                         </label>
// //                       </div>

// //                       <div style={{ marginBottom: "0.5rem" }}>
// //                         <label>
// //                           Status:
// //                           <select
// //                             value={editForm.auctionStatus || ""}
// //                             onChange={(e) =>
// //                               setEditForm((prev) => ({
// //                                 ...prev,
// //                                 auctionStatus:
// //                                   e.target.value as AuctionStatus | "",
// //                               }))
// //                             }
// //                             style={{ marginLeft: "0.5rem" }}
// //                           >
// //                             <option value="">(χωρίς αλλαγή)</option>
// //                             <option value="PENDING_APPROVAL">
// //                               PENDING_APPROVAL
// //                             </option>
// //                             <option value="ACTIVE">ACTIVE</option>
// //                             <option value="EXPIRED">EXPIRED</option>
// //                             <option value="CANCELLED">CANCELLED</option>
// //                           </select>
// //                         </label>
// //                       </div>

// //                       <div style={{ marginTop: "0.5rem" }}>
// //                         <button
// //                           type="button"
// //                           onClick={handleSaveEdit}
// //                           style={{ marginRight: "0.5rem" }}
// //                         >
// //                           Save changes
// //                         </button>
// //                         <button
// //                           type="button"
// //                           onClick={() => setIsEditing(false)}
// //                         >
// //                           Cancel
// //                         </button>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}

// //               <hr style={{ margin: "1rem 0" }} />

// //               <h3>Bids</h3>
// //               {auction.bids.length === 0 ? (
// //                 <p>Δεν υπάρχουν bids ακόμη.</p>
// //               ) : (
// //                 <ul>
// //                   {auction.bids.map((b) => (
// //                     <li key={b.id}>
// //                       {b.amount}€ από{" "}
// //                       {b.bidderUsername ? (
// //                         isAdmin ? (
// //                           <button
// //                             type="button"
// //                             onClick={() =>
// //                               handleOpenUserDetails(b.bidderUsername)
// //                             }
// //                             style={{
// //                               background: "none",
// //                               border: "none",
// //                               padding: 0,
// //                               margin: 0,
// //                               color: "blue",
// //                               textDecoration: "underline",
// //                               cursor: "pointer",
// //                               font: "inherit",
// //                               fontWeight: "bold",
// //                             }}
// //                           >
// //                             {b.bidderUsername}
// //                           </button>
// //                         ) : (
// //                           <strong>{b.bidderUsername}</strong>
// //                         )
// //                       ) : (
// //                         <span>άγνωστο χρήστη</span>
// //                       )}{" "}
// //                       ({b.createdAt})
// //                     </li>
// //                   ))}
// //                 </ul>
// //               )}

// //               <hr style={{ margin: "1rem 0" }} />

// //               <h3>Chat</h3>
// //               {auction.chat.length === 0 ? (
// //                 <p>Δεν υπάρχουν μηνύματα στο chat.</p>
// //               ) : (
// //                 <ul>
// //                   {auction.chat.map((m) => (
// //                     <li key={m.id}>
// //                       <strong>
// //                         {isAdmin ? (
// //                           <button
// //                             type="button"
// //                             onClick={() =>
// //                               handleOpenUserDetails(m.senderDisplayName)
// //                             }
// //                             style={{
// //                               background: "none",
// //                               border: "none",
// //                               padding: 0,
// //                               margin: 0,
// //                               color: "blue",
// //                               textDecoration: "underline",
// //                               cursor: "pointer",
// //                               font: "inherit",
// //                               fontWeight: "bold",
// //                             }}
// //                           >
// //                             {m.senderDisplayName}
// //                           </button>
// //                         ) : (
// //                           m.senderDisplayName
// //                         )}
// //                         {m.senderDisplayName === auction.sellerUsername &&
// //                           " (Auctioneer)"}
// //                       </strong>
// //                       : {m.content} (
// //                       {m.createdAt}
// //                       {typeof m.remainingMessages === "number" && (
// //                         <>
// //                           {" "}
// //                           — απομένουν {m.remainingMessages}/25 μηνύματα
// //                         </>
// //                       )}
// //                       )
// //                     </li>
// //                   ))}
// //                 </ul>
// //               )}

// //               {!canChat && (
// //                 <p style={{ color: "gray", marginTop: "0.5rem" }}>
// //                   Δεν μπορείς να στείλεις μηνύματα στο chat αυτή τη στιγμή
// //                   (είτε η δημοπρασία έληξε, είτε δεν έχεις δικαίωμα chat).
// //                 </p>
// //               )}

// //               {canChat && (
// //                 <div style={{ marginTop: "0.5rem" }}>
// //                   <textarea
// //                     value={newChatContent}
// //                     onChange={(e) => setNewChatContent(e.target.value)}
// //                     rows={3}
// //                     style={{ width: "100%", resize: "vertical" }}
// //                     placeholder="Γράψε το μήνυμά σου..."
// //                   />
// //                   <br />
// //                   <button
// //                     type="button"
// //                     style={{ marginTop: "0.25rem" }}
// //                     onClick={handleSendChat}
// //                   >
// //                     Send
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           );
// //         })()}

// //       {/* Fullscreen overlay για εικόνες */}
// //       {fullscreenImageUrl && (
// //         <div
// //           onClick={() => setFullscreenImageUrl(null)}
// //           style={{
// //             position: "fixed",
// //             inset: 0,
// //             backgroundColor: "rgba(0, 0, 0, 0.8)",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "center",
// //             zIndex: 2000,
// //             cursor: "zoom-out",
// //           }}
// //         >
// //           <img
// //             src={fullscreenImageUrl}
// //             alt="Auction fullscreen"
// //             style={{
// //               maxWidth: "90vw",
// //               maxHeight: "90vh",
// //               boxShadow: "0 0 20px rgba(0,0,0,0.5)",
// //               borderRadius: 4,
// //             }}
// //           />
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default AuctionDetailsPage;
// // src/components/AuctionDetailsPage.tsx

// import React, { useState, useEffect, useCallback, useRef } from "react";
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
// import type { IMessage, StompSubscription, IStompSocket } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// interface AuctionDetailsPageProps {
//   auctionId: number;
//   onBack?: () => void;
//   currentUser: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;

//   // ✅ ΝΕΟ: για να πας στη σελίδα "My Auctions"
//   onGoToMyAuctions?: () => void;
// }

// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
// }

// interface ChatMessageDto {
//   id: number;
//   senderDisplayName: string;
//   senderFirebaseId: string;
//   content: string;
//   createdAt: string;
//   remainingMessages?: number;
// }

// // 👇 Για να μην “σπάει” TS αν το AuthUserDto έχει username ή displayName
// type AuthUserLike = AuthUserDto & { username?: string; displayName?: string };

// const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
//   auctionId,
//   onBack,
//   currentUser,
//   onOpenUserDetailsAsAdmin,
//   onGoToMyAuctions,
// }) => {
//   const [auction, setAuction] = useState<AuctionDetails | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [bidAmount, setBidAmount] = useState<string>("");

//   const [bidMessage, setBidMessage] = useState<string | null>(null);
//   const [bidMessageType, setBidMessageType] =
//     useState<"success" | "error" | null>(null);

//   const [newChatContent, setNewChatContent] = useState<string>("");

//   const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
//     null
//   );

//   const [now, setNow] = useState<Date>(new Date());

//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const bidSubscriptionRef = useRef<StompSubscription | null>(null);
//   const chatSubscriptionRef = useRef<StompSubscription | null>(null);

//   const isAdmin = currentUser?.roleName === "Admin";

//   const handleOpenUserDetails = (username: string) => {
//     if (!isAdmin) return;
//     if (!onOpenUserDetailsAsAdmin) return;
//     onOpenUserDetailsAsAdmin(username);
//   };

//   // ✅ ΝΕΟ: isMyAuction
//   const currentUsername =
//     (currentUser as AuthUserLike | null)?.username ??
//     (currentUser as AuthUserLike | null)?.displayName ??
//     null;

//   const isMyAuction =
//     !!currentUsername && !!auction && auction.sellerUsername === currentUsername;

//   // ------------------ Admin edit state ------------------
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
//     return value.length >= 16 ? value.slice(0, 16) : value;
//   };

// const hydrateEditFormFromAuction = useCallback((a: AuctionDetails) => {
//   setEditForm({
//     categoryId: "",
//     title: a.title ?? "",
//     shortDescription: a.shortDescription ?? "",
//     description: a.description ?? "",
//     startingAmount: a.startingAmount?.toString() ?? "",
//     minBidIncrement: a.minBidIncrement?.toString() ?? "",
//     startDate: toDateTimeLocal(a.startDate),
//     endDate: toDateTimeLocal(a.endDate),
//     shippingCostPayer: a.shippingCostPayer,
//     auctionStatus: a.status as AuctionStatus,
//   });
// }, []);


//   // ------------------ timers / listeners ------------------
//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setFullscreenImageUrl(null);
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   // ------------------ STOMP connect once ------------------
//   useEffect(() => {
//     const socket = new SockJS("/ws");//"http://localhost:8080/ws"
//     const client = new Client({
//       webSocketFactory: () => socket as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {},
//     });

//     client.onConnect = () => setStompClient(client);

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

//   // ------------------ subscribe bids/chat ------------------
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected) return;

//     if (bidSubscriptionRef.current) {
//       bidSubscriptionRef.current.unsubscribe();
//       bidSubscriptionRef.current = null;
//     }
//     if (chatSubscriptionRef.current) {
//       chatSubscriptionRef.current.unsubscribe();
//       chatSubscriptionRef.current = null;
//     }

//     const bidDestination = `/topic/auctions/${auctionId}`;
//     const bidSub = stompClient.subscribe(bidDestination, (message: IMessage) => {
//       try {
//         const payload: BidEventDto = JSON.parse(message.body);

//         setAuction((prev) => {
//           if (!prev || prev.id !== payload.auctionId) return prev;

//           const newBid = {
//             id: payload.id,
//             amount: payload.amount,
//             bidderUsername: payload.bidderUsername,
//             createdAt: payload.createdAt,
//             auctionId: payload.auctionId,
//           };

//           const alreadyExists = prev.bids.some((b) => b.id === newBid.id);
//           const updatedBids = alreadyExists ? prev.bids : [newBid, ...prev.bids];

//           return {
//             ...prev,
//             endDate: payload.newEndDate,
//             bids: updatedBids,
//           };
//         });
//       } catch (err) {
//         console.error("Failed to parse BidEventDto (details)", err);
//       }
//     });
//     bidSubscriptionRef.current = bidSub;

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

//             return { ...prev, chat: [...prev.chat, payload] };
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
//       if (bidSubscriptionRef.current === bidSub) bidSubscriptionRef.current = null;
//       if (chatSubscriptionRef.current === chatSub) chatSubscriptionRef.current = null;
//     };
//   }, [stompClient, auctionId]);

//   // ------------------ load auction ------------------
//   const loadAuction = useCallback(async () => {
//     setError(null);
//     setLoading(true);
//     setAuction(null);

//     try {
//       const result = await getAuctionById(auctionId);
//       setAuction(result);
//     } catch (err: unknown) {
//       console.error(err);
//       const message =
//         err instanceof Error
//           ? err.message
//           : "Κάτι πήγε στραβά κατά τη φόρτωση της δημοπρασίας.";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [auctionId]);

//   useEffect(() => {
//     loadAuction();
//   }, [loadAuction]);

//   // hydrate edit form when auction changes
//   useEffect(() => {
//     if (!auction) return;
//     hydrateEditFormFromAuction(auction);
//   }, [auction, hydrateEditFormFromAuction]);


//   // ------------------ helpers ------------------
//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   const formatTimeRemaining = (endDateIso: string, nowValue: Date): string => {
//     const end = new Date(endDateIso);
//     const diffMs = end.getTime() - nowValue.getTime();
//     if (Number.isNaN(end.getTime())) return endDateIso;
//     if (diffMs <= 0) return "Έληξε";

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

//   // ------------------ actions ------------------
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
//       const message =
//         err instanceof Error && err.message
//           ? err.message
//           : "Κάτι πήγε στραβά κατά την προσφορά.";
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
//     } catch (err: unknown) {
//       console.error(err);
//       const message =
//         err instanceof Error && err.message
//           ? err.message
//           : "Κάτι πήγε στραβά κατά την αποστολή του μηνύματος.";
//       window.alert(message);
//     }
//   };

//   const handleSaveEdit = async () => {
//     if (!auction) return;

//     const payload: AdminAuctionUpdateRequest = {
//       categoryId: editForm.categoryId ? Number(editForm.categoryId) : undefined,
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
//       auctionStatus: editForm.auctionStatus || undefined,
//     };

//     try {
//       const updated = await adminEditAuction(auction.id, payload);
//       setAuction(updated);
//       setIsEditing(false);
//       showBidMessage("success", "Η δημοπρασία ενημερώθηκε με επιτυχία.");
//     } catch (err: unknown) {
//       console.error(err);
//       const message =
//         err instanceof Error && err.message
//           ? err.message
//           : "Κάτι πήγε στραβά κατά την ενημέρωση της δημοπρασίας.";
//       showBidMessage("error", message);
//     }
//   };

//   const handleCancelEdit = () => {
//     if (auction) hydrateEditFormFromAuction(auction);
//     setIsEditing(false);
//   };

//   // ------------------ render ------------------
//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
//       <div
//         style={{
//           marginBottom: "1rem",
//           display: "flex",
//           gap: "10px",
//           alignItems: "center",
//           justifyContent: "space-between",
//           flexWrap: "wrap",
//         }}
//       >
//         <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
//           <button type="button" onClick={onBack}>
//             ← Back to auctions
//           </button>

//           {/* ✅ ΝΕΟ: Go to My Auctions (μόνο αν είναι δικό σου) */}
//           {isMyAuction && onGoToMyAuctions && (
//             <button type="button" onClick={onGoToMyAuctions}>
//               Go to My Auctions
//             </button>
//           )}
//         </div>

//         {/* ✅ ΝΕΟ: badge */}
//         {isMyAuction && (
//           <span
//             style={{
//               padding: "4px 10px",
//               borderRadius: 999,
//               border: "1px solid #2e7d32",
//               color: "#2e7d32",
//               fontWeight: "bold",
//               fontSize: "0.9rem",
//             }}
//           >
//             My auction
//           </span>
//         )}
//       </div>

//       <h1>Auction Details</h1>

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

//       {auction && !loading && !error && (() => {
//         const isActive = isAuctionActive(auction.endDate, now);
//         const canBid = auction.eligibleForBid && isActive;
//         const canChat = auction.eligibleForChat && isActive;

//         return (
//           <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: 4 }}>
//             <h2 style={{ display: "flex", gap: "10px", alignItems: "center" }}>
//               {auction.title}
//               {isMyAuction && (
//                 <span style={{ fontSize: "0.85rem", color: "#2e7d32" }}>
//                   (You are the seller)
//                 </span>
//               )}
//             </h2>

//             <p>
//               Πωλητής:{" "}
//               {isAdmin ? (
//                 <button
//                   type="button"
//                   onClick={() => handleOpenUserDetails(auction.sellerUsername)}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     padding: 0,
//                     margin: 0,
//                     color: "blue",
//                     textDecoration: "underline",
//                     cursor: "pointer",
//                     font: "inherit",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   {auction.sellerUsername}
//                 </button>
//               ) : (
//                 <strong>{auction.sellerUsername}</strong>
//               )}
//             </p>

//             <p>
//               Κατηγορία: <strong>{auction.categoryName}</strong>
//             </p>

//             <p>
//               Τοποθεσία πωλητή:{" "}
//               <strong>{getCityFromLocation(auction.sellerLocation)}</strong>
//             </p>

//             <p>
//               Starting amount: <strong>{auction.startingAmount}€</strong>
//             </p>

//             <p>
//               Min bid increment: <strong>{auction.minBidIncrement}€</strong>
//             </p>

//             <p>
//               Χρόνος που απομένει:{" "}
//               <strong>{formatTimeRemaining(auction.endDate, now)}</strong>
//             </p>

//             <p style={{ marginTop: "0.5rem" }}>
//               <strong>Short description:</strong> {auction.shortDescription}
//             </p>

//             <p>
//               <strong>Full description:</strong> {auction.description}
//             </p>

//             <p>
//               <strong>Ποιος πληρώνει τα μεταφορικά: </strong>
//               {auction.shippingCostPayer}
//             </p>

//             <div style={{ marginTop: "1rem" }}>
//               <h3>Images</h3>
//               {auction.imageUrls && auction.imageUrls.length > 0 ? (
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
//                   {auction.imageUrls.map((url, idx) => (
//                     <div key={idx} style={{ border: "1px solid #ddd", padding: 4 }}>
//                       <img
//                         src={url}
//                         alt={`Auction image ${idx + 1}`}
//                         style={{ maxWidth: 200, maxHeight: 200, display: "block", cursor: "pointer" }}
//                         onClick={() => setFullscreenImageUrl(url)}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p>Δεν υπάρχουν εικόνες για αυτή τη δημοπρασία.</p>
//               )}
//             </div>

//             <p style={{ marginTop: "0.5rem" }}>
//               Eligible for bid: <strong>{auction.eligibleForBid ? "YES" : "NO"}</strong>
//             </p>

//             <p>
//               Eligible for chat: <strong>{auction.eligibleForChat ? "YES" : "NO"}</strong>
//             </p>

//             {canBid && (
//               <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
//                 <input
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   placeholder="Ποσό (€)"
//                   value={bidAmount}
//                   onChange={(e) => setBidAmount(e.target.value)}
//                   style={{ width: "120px" }}
//                 />
//                 <button type="button" onClick={() => handleBidClick(auction)}>
//                   Bid
//                 </button>
//               </div>
//             )}

//             {isAdmin && (
//               <div style={{ marginTop: "1rem" }}>
//                 {!isEditing ? (
//                   <button type="button" onClick={() => setIsEditing(true)}>
//                     Edit auction
//                   </button>
//                 ) : (
//                   <div style={{ marginTop: "0.5rem", padding: "0.75rem", border: "1px dashed #999", borderRadius: 4 }}>
//                     <h3>Edit auction</h3>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Category ID (άδειο = χωρίς αλλαγή):
//                         <input
//                           type="number"
//                           value={editForm.categoryId}
//                           onChange={(e) =>
//                             setEditForm((prev) => ({ ...prev, categoryId: e.target.value }))
//                           }
//                           style={{ marginLeft: "0.5rem", width: "120px" }}
//                         />
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Title:
//                         <input
//                           type="text"
//                           value={editForm.title}
//                           onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
//                           style={{ marginLeft: "0.5rem", width: "300px" }}
//                         />
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Short description:
//                         <input
//                           type="text"
//                           value={editForm.shortDescription}
//                           onChange={(e) =>
//                             setEditForm((prev) => ({ ...prev, shortDescription: e.target.value }))
//                           }
//                           style={{ marginLeft: "0.5rem", width: "300px" }}
//                         />
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Full description:
//                         <textarea
//                           value={editForm.description}
//                           onChange={(e) =>
//                             setEditForm((prev) => ({ ...prev, description: e.target.value }))
//                           }
//                           style={{ marginLeft: "0.5rem", width: "300px", height: "80px" }}
//                         />
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Starting amount:
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={editForm.startingAmount}
//                           onChange={(e) =>
//                             setEditForm((prev) => ({ ...prev, startingAmount: e.target.value }))
//                           }
//                           style={{ marginLeft: "0.5rem" }}
//                         />
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Min bid increment:
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={editForm.minBidIncrement}
//                           onChange={(e) =>
//                             setEditForm((prev) => ({ ...prev, minBidIncrement: e.target.value }))
//                           }
//                           style={{ marginLeft: "0.5rem" }}
//                         />
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Start date:
//                         <input
//                           type="datetime-local"
//                           value={editForm.startDate}
//                           onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
//                           style={{ marginLeft: "0.5rem" }}
//                         />
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         End date:
//                         <input
//                           type="datetime-local"
//                           value={editForm.endDate}
//                           onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
//                           style={{ marginLeft: "0.5rem" }}
//                         />
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Ποιος πληρώνει τα μεταφορικά;
//                         <select
//                           value={editForm.shippingCostPayer}
//                           onChange={(e) =>
//                             setEditForm((prev) => ({
//                               ...prev,
//                               shippingCostPayer: e.target.value as ShippingCostPayer,
//                             }))
//                           }
//                           style={{ marginLeft: "0.5rem" }}
//                         >
//                           <option value="SELLER">Seller πληρώνει όλα τα μεταφορικά</option>
//                           <option value="BUYER">Buyer πληρώνει όλα τα μεταφορικά</option>
//                           <option value="SPLIT">50 / 50 (Seller &amp; Buyer)</option>
//                         </select>
//                       </label>
//                     </div>

//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <label>
//                         Status:
//                         <select
//                           value={editForm.auctionStatus || ""}
//                           onChange={(e) =>
//                             setEditForm((prev) => ({
//                               ...prev,
//                               auctionStatus: e.target.value as AuctionStatus | "",
//                             }))
//                           }
//                           style={{ marginLeft: "0.5rem" }}
//                         >
//                           <option value="">(χωρίς αλλαγή)</option>
//                           <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
//                           <option value="ACTIVE">ACTIVE</option>
//                           <option value="EXPIRED">EXPIRED</option>
//                           <option value="CANCELLED">CANCELLED</option>
//                         </select>
//                       </label>
//                     </div>

//                     <div style={{ marginTop: "0.5rem" }}>
//                       <button type="button" onClick={handleSaveEdit} style={{ marginRight: "0.5rem" }}>
//                         Save changes
//                       </button>
//                       <button type="button" onClick={handleCancelEdit}>
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             <hr style={{ margin: "1rem 0" }} />

//             <h3>Bids</h3>
//             {auction.bids.length === 0 ? (
//               <p>Δεν υπάρχουν bids ακόμη.</p>
//             ) : (
//               <ul>
//                 {auction.bids.map((b) => (
//                   <li key={b.id}>
//                     {b.amount}€ από{" "}
//                     {b.bidderUsername ? (
//                       isAdmin ? (
//                         <button
//                           type="button"
//                           onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                           style={{
//                             background: "none",
//                             border: "none",
//                             padding: 0,
//                             margin: 0,
//                             color: "blue",
//                             textDecoration: "underline",
//                             cursor: "pointer",
//                             font: "inherit",
//                             fontWeight: "bold",
//                           }}
//                         >
//                           {b.bidderUsername}
//                         </button>
//                       ) : (
//                         <strong>{b.bidderUsername}</strong>
//                       )
//                     ) : (
//                       <span>άγνωστο χρήστη</span>
//                     )}{" "}
//                     ({b.createdAt})
//                   </li>
//                 ))}
//               </ul>
//             )}

//             <hr style={{ margin: "1rem 0" }} />

//             <h3>Chat</h3>
//             {auction.chat.length === 0 ? (
//               <p>Δεν υπάρχουν μηνύματα στο chat.</p>
//             ) : (
//               <ul>
//                 {auction.chat.map((m) => (
//                   <li key={m.id}>
//                     <strong>
//                       {isAdmin ? (
//                         <button
//                           type="button"
//                           onClick={() => handleOpenUserDetails(m.senderDisplayName)}
//                           style={{
//                             background: "none",
//                             border: "none",
//                             padding: 0,
//                             margin: 0,
//                             color: "blue",
//                             textDecoration: "underline",
//                             cursor: "pointer",
//                             font: "inherit",
//                             fontWeight: "bold",
//                           }}
//                         >
//                           {m.senderDisplayName}
//                         </button>
//                       ) : (
//                         m.senderDisplayName
//                       )}
//                       {m.senderDisplayName === auction.sellerUsername && " (Auctioneer)"}
//                     </strong>
//                     : {m.content} ({m.createdAt}
//                     {typeof m.remainingMessages === "number" && (
//                       <> — απομένουν {m.remainingMessages}/25 μηνύματα</>
//                     )}
//                     )
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {!canChat && (
//               <p style={{ color: "gray", marginTop: "0.5rem" }}>
//                 Δεν μπορείς να στείλεις μηνύματα στο chat αυτή τη στιγμή
//                 (είτε η δημοπρασία έληξε, είτε δεν έχεις δικαίωμα chat).
//               </p>
//             )}

//             {canChat && (
//               <div style={{ marginTop: "0.5rem" }}>
//                 <textarea
//                   value={newChatContent}
//                   onChange={(e) => setNewChatContent(e.target.value)}
//                   rows={3}
//                   style={{ width: "100%", resize: "vertical" }}
//                   placeholder="Γράψε το μήνυμά σου..."
//                 />
//                 <br />
//                 <button type="button" style={{ marginTop: "0.25rem" }} onClick={handleSendChat}>
//                   Send
//                 </button>
//               </div>
//             )}
//           </div>
//         );
//       })()}

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

// AuctionDetailsPage.tsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";
// import type { IMessage, IStompSocket, StompSubscription } from "@stomp/stompjs";

// import { getAuctionById } from "../api/Springboot/backendAuctionService";
// import { placeBid } from "../api/Springboot/BackendBidService";
// import { sendChatMessage } from "../api/Springboot/backendChatService";
// import { adminEditAuction } from "../api/admin/backendAdminAuctionService";

// import type {
//   AdminAuctionUpdateRequest,
//   AuctionDetails,
//   AuctionStatus,
//   ShippingCostPayer,
// } from "../models/Springboot/Auction";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// interface AuctionDetailsPageProps {
//   auctionId: number;
//   onBack?: () => void;
//   currentUser: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;

//   onSignIn?: () => void;
//   onSignUp?: () => void;

//   onBidUpdate?: (u: {
//     auctionId: number;
//     amount: number;
//     bidderUsername: string;
//     newEndDate: string;
//   }) => void;

//   onAuctionLoaded?: (a: AuctionDetails) => void;

//   variant?: "page" | "modal";
// }

// // ✅ WebSocket DTO (updated: bidderAvatarUrl)
// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
//   bidderAvatarUrl?: string | null;
// }

// interface ChatMessageDto {
//   id: number;
//   senderDisplayName: string;
//   senderAvatarUrl?: string | null;
//   senderFirebaseId: string;
//   content: string;
//   createdAt: string;
//   remainingMessages?: number;
// }

// const DEFAULT_AVATAR_FALLBACK =
//   "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%25' height='100%25' rx='999' fill='%23E5E7EB'/%3E%3Cpath d='M32 34c6 0 11-5 11-11S38 12 32 12s-11 5-11 11 5 11 11 11zm0 6c-10 0-18 6-18 14h36c0-8-8-14-18-14z' fill='%239CA3AF'/%3E%3C/svg%3E";

// function formatMoneyEUR(value: number): string {
//   try {
//     return new Intl.NumberFormat("el-GR", {
//       style: "currency",
//       currency: "EUR",
//       maximumFractionDigits: 0,
//     }).format(value);
//   } catch {
//     return `${value}€`;
//   }
// }

// function timeAgo(iso: string, now: Date): string {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return "";
//   const diffMs = now.getTime() - d.getTime();
//   const s = Math.max(0, Math.floor(diffMs / 1000));
//   const m = Math.floor(s / 60);
//   const h = Math.floor(m / 60);
//   const day = Math.floor(h / 24);

//   if (day > 0) return `${day}d ago`;
//   if (h > 0) return `${h}h ago`;
//   if (m > 0) return `${m}m ago`;
//   return `${s}s ago`;
// }

// function formatTimeRemaining(
//   endIso: string,
//   now: Date
// ): { label: string; ended: boolean } {
//   const end = new Date(endIso);
//   if (Number.isNaN(end.getTime())) return { label: endIso, ended: false };
//   const diff = end.getTime() - now.getTime();
//   if (diff <= 0) return { label: "Ended", ended: true };

//   let total = Math.floor(diff / 1000);
//   const days = Math.floor(total / (24 * 3600));
//   total -= days * 24 * 3600;
//   const hours = Math.floor(total / 3600);
//   total -= hours * 3600;
//   const minutes = Math.floor(total / 60);
//   const seconds = total - minutes * 60;

//   if (days > 0)
//     return {
//       label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
//       ended: false,
//     };
//   if (hours > 0) return { label: `${hours}h ${minutes}m ${seconds}s`, ended: false };
//   if (minutes > 0) return { label: `${minutes}m ${seconds}s`, ended: false };
//   return { label: `${seconds}s`, ended: false };
// }

// function toDateTimeLocal(value: string | null | undefined): string {
//   if (!value) return "";
//   return value.length >= 16 ? value.slice(0, 16) : value;
// }

// type NoticeType = "success" | "error";
// type NoticeState = { type: NoticeType; text: string } | null;

// function useAutoDismissNotice(timeoutMs = 4200) {
//   const [notice, setNotice] = useState<NoticeState>(null);
//   const timerRef = useRef<number | null>(null);

//   const clear = useCallback(() => {
//     if (timerRef.current != null) {
//       window.clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }
//     setNotice(null);
//   }, []);

//   const show = useCallback(
//     (type: NoticeType, text: string) => {
//       setNotice({ type, text });
//       if (timerRef.current != null) window.clearTimeout(timerRef.current);
//       timerRef.current = window.setTimeout(() => {
//         setNotice(null);
//         timerRef.current = null;
//       }, timeoutMs);
//     },
//     [timeoutMs]
//   );

//   useEffect(() => {
//     return () => {
//       if (timerRef.current != null) window.clearTimeout(timerRef.current);
//     };
//   }, []);

//   return { notice, show, clear };
// }

// const NoticeInline: React.FC<{
//   notice: NoticeState;
//   onClose: () => void;
// }> = ({ notice, onClose }) => {
//   if (!notice) return null;

//   const isErr = notice.type === "error";
//   return (
//     <div
//       style={{
//         marginTop: 10,
//         borderRadius: 12,
//         border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
//         background: isErr ? "#FEF2F2" : "#F0FDF4",
//         color: isErr ? "#991B1B" : "#166534",
//         padding: "10px 12px",
//         fontWeight: 800,
//         fontSize: 13,
//         display: "flex",
//         alignItems: "flex-start",
//         justifyContent: "space-between",
//         gap: 10,
//       }}
//       role="status"
//       aria-live="polite"
//     >
//       <div style={{ lineHeight: 1.35 }}>{notice.text}</div>

//       <button
//         type="button"
//         onClick={onClose}
//         aria-label="Close message"
//         style={{
//           flex: "0 0 auto",
//           width: 30,
//           height: 30,
//           padding: 0,
//           borderRadius: 10,
//           border: "1px solid rgba(17,24,39,0.12)",
//           background: "rgba(255,255,255,0.75)",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontWeight: 950,
//           fontSize: 16,
//           lineHeight: 1,
//         }}
//         title="Close"
//       >
//         <span style={{ display: "block", transform: "translateY(-0.5px)" }}>
//           ✕
//         </span>
//       </button>
//     </div>
//   );
// };

// const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
//   auctionId,
//   onBack,
//   currentUser,
//   onOpenUserDetailsAsAdmin,
//   onSignIn,
//   onBidUpdate,
//   onAuctionLoaded,
//   variant = "page",
// }) => {
//   const [auction, setAuction] = useState<AuctionDetails | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [now, setNow] = useState<Date>(new Date());

//   // ✅ responsive (για να μην δημιουργείται horizontal scroll σε modal / στενά πλάτη)
//   const [vw, setVw] = useState<number>(() =>
//     typeof window !== "undefined" ? window.innerWidth : 1200
//   );
//   useEffect(() => {
//     const onResize = () => setVw(window.innerWidth);
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isModal = variant === "modal";
//   const isSingleColumn = isModal || vw < 980;

//   // ✅ αυτό είναι “phone” breakpoint (για να πάει το chat στο τέλος)
//   const isMobile = vw <= 640;

//   const chatViewportHeight = isModal ? 260 : isMobile ? 380 : 320;

//   // ✅ stable refs για callbacks
//   const onAuctionLoadedRef =
//     useRef<AuctionDetailsPageProps["onAuctionLoaded"]>(onAuctionLoaded);
//   const onBidUpdateRef =
//     useRef<AuctionDetailsPageProps["onBidUpdate"]>(onBidUpdate);

//   useEffect(() => {
//     onAuctionLoadedRef.current = onAuctionLoaded;
//   }, [onAuctionLoaded]);

//   useEffect(() => {
//     onBidUpdateRef.current = onBidUpdate;
//   }, [onBidUpdate]);

//   // images
//   const [selectedImageIdx, setSelectedImageIdx] = useState(0);
//   const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
//     null
//   );

//   // ✅ track broken images (Cloudflare expiry etc.)
//   const [brokenImageByUrl, setBrokenImageByUrl] = useState<Record<string, boolean>>({});

//   // bid/chat
//   const [bidAmount, setBidAmount] = useState<string>("");
//   const [newChatContent, setNewChatContent] = useState<string>("");

//   // ✅ inline messages (auto-hide + manual close)
//   const bidNotice = useAutoDismissNotice(4200);
//   const chatNotice = useAutoDismissNotice(4200);
//   const adminNotice = useAutoDismissNotice(4200);

//   // ------------------ Chat auto-scroll (default to bottom) ------------------
//   const chatScrollRef = useRef<HTMLDivElement | null>(null);
//   const didInitialChatScrollRef = useRef<boolean>(false);

//   const scrollChatToBottom = useCallback(() => {
//     const el = chatScrollRef.current;
//     if (!el) return;
//     el.scrollTop = el.scrollHeight;
//   }, []);

//   // ws
//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const bidSubRef = useRef<StompSubscription | null>(null);
//   const chatSubRef = useRef<StompSubscription | null>(null);

//   const isAdmin = currentUser?.roleName === "Admin";

//   const handleOpenUserDetails = useCallback(
//     (username: string) => {
//       if (!isAdmin) return;
//       if (!onOpenUserDetailsAsAdmin) return;
//       onOpenUserDetailsAsAdmin(username);
//     },
//     [isAdmin, onOpenUserDetailsAsAdmin]
//   );

//   // timers / esc
//   useEffect(() => {
//     const t = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(t);
//   }, []);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setFullscreenImageUrl(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   // clear notices on auction change
//   useEffect(() => {
//     bidNotice.clear();
//     chatNotice.clear();
//     adminNotice.clear();
//     setBidAmount("");
//     setNewChatContent("");
//     didInitialChatScrollRef.current = false; // ✅ reset initial scroll per auction

//     // ✅ reset broken image tracking per auction
//     setBrokenImageByUrl({});
//   }, [auctionId, bidNotice.clear, chatNotice.clear, adminNotice.clear]);

//   // load auction
//   const loadAuction = useCallback(async () => {
//     setError(null);
//     setLoading(true);
//     setAuction(null);

//     try {
//       const res = await getAuctionById(auctionId);
//       setAuction(res);
//       onAuctionLoadedRef.current?.(res);
//       setSelectedImageIdx(0);
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while loading this auction. Please try again.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   }, [auctionId]);

//   useEffect(() => {
//     void loadAuction();
//   }, [loadAuction]);

//   // STOMP connect once
//   useEffect(() => {
//     const socket = new SockJS("/ws");
//     const client = new Client({
//       webSocketFactory: () => socket as unknown as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {},
//     });

//     client.onConnect = () => setStompClient(client);
//     client.onStompError = (frame) => {
//       // eslint-disable-next-line no-console
//       console.error(
//         "STOMP error (details):",
//         frame.headers["message"],
//         frame.body
//       );
//     };

//     client.activate();

//     return () => {
//       if (bidSubRef.current) {
//         bidSubRef.current.unsubscribe();
//         bidSubRef.current = null;
//       }
//       if (chatSubRef.current) {
//         chatSubRef.current.unsubscribe();
//         chatSubRef.current = null;
//       }
//       client.deactivate();
//     };
//   }, []);

//   // Subscribe bids/chat
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected) return;

//     if (bidSubRef.current) {
//       bidSubRef.current.unsubscribe();
//       bidSubRef.current = null;
//     }
//     if (chatSubRef.current) {
//       chatSubRef.current.unsubscribe();
//       chatSubRef.current = null;
//     }

//     const bidTopic = `/topic/auctions/${auctionId}`;
//     const bidSub = stompClient.subscribe(bidTopic, (message: IMessage) => {
//       try {
//         const payload: BidEventDto = JSON.parse(message.body);

//         onBidUpdateRef.current?.({
//           auctionId: payload.auctionId,
//           amount: payload.amount,
//           bidderUsername: payload.bidderUsername,
//           newEndDate: payload.newEndDate,
//         });

//         setAuction((prev) => {
//           if (!prev || prev.id !== payload.auctionId) return prev;

//           const newBid = {
//             id: payload.id,
//             amount: payload.amount,
//             bidderUsername: payload.bidderUsername,
//             createdAt: payload.createdAt,
//             auctionId: payload.auctionId,
//             bidderAvatarUrl: payload.bidderAvatarUrl ?? null,
//           };

//           const already = prev.bids.some((b) => b.id === newBid.id);
//           const bids = already ? prev.bids : [newBid, ...prev.bids];

//           return { ...prev, endDate: payload.newEndDate, bids };
//         });
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("Failed to parse BidEventDto", err);
//       }
//     });
//     bidSubRef.current = bidSub;

//     const chatTopic = `/topic/auctions/${auctionId}/chat`;
//     const chatSub = stompClient.subscribe(chatTopic, (message: IMessage) => {
//       try {
//         const payload: ChatMessageDto = JSON.parse(message.body);
//         setAuction((prev) => {
//           if (!prev || prev.id !== auctionId) return prev;
//           const exists = prev.chat.some((m) => m.id === payload.id);
//           if (exists) return prev;
//           return { ...prev, chat: [...prev.chat, payload] };
//         });
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("Failed to parse ChatMessageDto", err);
//       }
//     });
//     chatSubRef.current = chatSub;

//     return () => {
//       bidSub.unsubscribe();
//       chatSub.unsubscribe();
//       if (bidSubRef.current === bidSub) bidSubRef.current = null;
//       if (chatSubRef.current === chatSub) chatSubRef.current = null;
//     };
//   }, [stompClient, auctionId]);

//   // auto-scroll first load chat (once per auction)
//   useEffect(() => {
//     if (!auction) return;
//     if (didInitialChatScrollRef.current) return;

//     window.setTimeout(() => {
//       scrollChatToBottom();
//       didInitialChatScrollRef.current = true;
//     }, 0);
//   }, [auction, scrollChatToBottom]);

//   // auto-scroll on new messages ONLY if user is near bottom
//   useEffect(() => {
//     if (!auction) return;
//     const el = chatScrollRef.current;
//     if (!el) return;

//     const threshold = 90; // px
//     const distanceFromBottom =
//       el.scrollHeight - (el.scrollTop + el.clientHeight);

//     if (distanceFromBottom <= threshold) {
//       window.setTimeout(() => scrollChatToBottom(), 0);
//     }
//   }, [auction?.chat.length, auction, scrollChatToBottom]);

//   // derived
//   const allImages = auction?.imageUrls ?? [];
//   const images = useMemo(
//     () => allImages.filter((u) => !!u && !brokenImageByUrl[u]),
//     [allImages, brokenImageByUrl]
//   );

//   useEffect(() => {
//     if (selectedImageIdx >= images.length && images.length > 0) {
//       setSelectedImageIdx(0);
//     }
//     if (images.length === 0) {
//       setSelectedImageIdx(0);
//       setFullscreenImageUrl(null);
//     }
//   }, [images.length, selectedImageIdx]);

//   const mainImage =
//     images.length > 0
//       ? images[Math.min(selectedImageIdx, images.length - 1)]
//       : null;

//   const timeBox = useMemo(() => {
//     if (!auction) return { label: "", ended: false };
//     return formatTimeRemaining(auction.endDate, now);
//   }, [auction, now]);

//   const isActive = useMemo(() => {
//     if (!auction) return false;
//     const end = new Date(auction.endDate);
//     if (Number.isNaN(end.getTime())) return false;
//     return end.getTime() - now.getTime() > 0;
//   }, [auction, now]);

//   const canBid = !!auction && auction.eligibleForBid && isActive;

//   const isLoggedIn = !!currentUser;
//   const canChat = !!auction && isLoggedIn && auction.eligibleForChat && isActive;

//   const chatBlockedReason = useMemo(() => {
//     if (!auction) return null;
//     if (!isActive) return "Chat is closed because the auction has ended.";
//     if (!isLoggedIn) return null;
//     if (!auction.eligibleForChat)
//       return "Place a bid to unlock the chat for this auction.";
//     return null;
//   }, [auction, isActive, isLoggedIn]);

//   const isEnded = useMemo(() => {
//     if (!auction) return false;
//     if (auction.status === "EXPIRED" || auction.status === "CANCELLED")
//       return true;
//     return timeBox.ended;
//   }, [auction, timeBox.ended]);

//   type BidItem = AuctionDetails["bids"][number] & { bidderAvatarUrl?: string | null };

//   const sortedBids: BidItem[] = useMemo(() => {
//     if (!auction) return [];
//     const copy = [...(auction.bids as BidItem[])];
//     copy.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
//     return copy;
//   }, [auction]);

//   const currentTopBid = sortedBids.length > 0 ? sortedBids[0].amount : null;

//   const minNextBid = useMemo(() => {
//     if (!auction) return null;
//     const base = currentTopBid ?? auction.startingAmount;
//     return (base ?? 0) + (auction.minBidIncrement ?? 0);
//   }, [auction, currentTopBid]);

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   // actions
//   const handleBid = async () => {
//     if (!auction) return;

//     const raw = bidAmount.trim();
//     if (!raw) {
//     bidNotice.show("error", "Please enter a bid amount.");      return;
//     }

//     const amount = Number(raw);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       bidNotice.show("error", "Please enter a valid amount.");
//       return;
//     }

//     try {
//       await placeBid(auction.id, amount);
//       bidNotice.show("success", "Your bid was placed successfully!");
//       setBidAmount("");
//       await loadAuction();
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error ? e.message : "Something went wrong while placing your bid. Please try again.";
//       bidNotice.show("error", msg);
//     }
//   };

//   const handleSendChat = async () => {
//     if (!auction) return;
//     const text = newChatContent.trim();
//     if (!text) {
//       chatNotice.show("error", "Your message can't be empty.");
//       return;
//     }

//     try {
//       await sendChatMessage(auction.id, text);
//       setNewChatContent("");

//       // ✅ Force scroll to bottom after sending (so user sees their message)
//       window.setTimeout(() => {
//         scrollChatToBottom();
//       }, 0);

//       // (προαιρετικό) success message:
//       // chatNotice.show("success", "Το μήνυμα στάλθηκε.");
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while sending your message. Please try again.";
//       chatNotice.show("error", msg);
//     }
//   };

//   // ------------------ ADMIN edit ------------------
//   const [isEditing, setIsEditing] = useState(false);
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

//   const hydrateEdit = useCallback((a: AuctionDetails) => {
//     setEditForm({
//       categoryId: "",
//       title: a.title ?? "",
//       shortDescription: a.shortDescription ?? "",
//       description: a.description ?? "",
//       startingAmount: a.startingAmount?.toString() ?? "",
//       minBidIncrement: a.minBidIncrement?.toString() ?? "",
//       startDate: toDateTimeLocal(a.startDate),
//       endDate: toDateTimeLocal(a.endDate),
//       shippingCostPayer: a.shippingCostPayer,
//       auctionStatus: a.status as AuctionStatus,
//     });
//   }, []);

//   useEffect(() => {
//     if (auction) hydrateEdit(auction);
//   }, [auction, hydrateEdit]);

//   const handleSaveEdit = async () => {
//     if (!auction) return;

//     const payload: AdminAuctionUpdateRequest = {
//       categoryId: editForm.categoryId ? Number(editForm.categoryId) : undefined,
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
//       auctionStatus: editForm.auctionStatus || undefined,
//     };

//     try {
//       const updated = await adminEditAuction(auction.id, payload);
//       setAuction(updated);
//       setIsEditing(false);
//       adminNotice.show("success", "Auction updated successfully.");
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while updating the auction. Please try again.";
//       adminNotice.show("error", msg);
//     }
//   };

//   // ------------------ UI helpers ------------------
//   const AvatarCircle: React.FC<{
//     size: number;
//     name?: string;
//     url?: string | null;
//     ring?: boolean;
//   }> = ({ size, name, url, ring }) => {
//     const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
//     return (
//       <div
//         style={{
//           width: size,
//           height: size,
//           borderRadius: 999,
//           overflow: "hidden",
//           flex: "0 0 auto",
//           boxShadow: ring ? "0 0 0 3px rgba(59,130,246,0.25)" : undefined,
//           background: "#EEF2FF",
//           display: "grid",
//           placeItems: "center",
//         }}
//       >
//         {url ? (
//           <img
//             src={url}
//             alt={name ?? "avatar"}
//             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             onError={(e) => {
//               (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
//             }}
//           />
//         ) : (
//           <span style={{ fontWeight: 800, color: "#4F46E5" }}>{initial}</span>
//         )}
//       </div>
//     );
//   };

//   // ------------------ See more dropdown (bids from rank #4 and below) ------------------
//   const [bidHistoryOpen, setBidHistoryOpen] = useState<boolean>(false);
//   useEffect(() => {
//     setBidHistoryOpen(false);
//   }, [auctionId]);

//   const imageStageHeight = isSingleColumn ? 320 : 420;

//   // ------------------ render ------------------
//   return (
//     <div
//       style={{
//         minHeight: variant === "page" ? "100vh" : "100%",
//         background: "#F6F8FB",
//         width: "100%",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//         overflowX: "hidden",
//       }}
//     >
//       <div
//         style={{
//           maxWidth: isModal ? "100%" : 1200,
//           width: "100%",
//           margin: "0 auto",
//           padding: isModal ? "12px" : "18px",
//           boxSizing: "border-box",
//           overflowX: "hidden",
//         }}
//       >
//         {variant === "page" && onBack && (
//           <div style={{ marginBottom: 12 }}>
//             <button
//               type="button"
//               onClick={onBack}
//               style={{
//                 height: 40,
//                 padding: "0 14px",
//                 borderRadius: 12,
//                 border: "1px solid rgba(17, 24, 39, 0.12)",
//                 background: "#FFFFFF",
//                 fontWeight: 900,
//                 cursor: "pointer",
//               }}
//             >
//               ← Back to all auctions
//             </button>
//           </div>
//         )}

//         {loading && <div style={{ padding: 18 }}>Φόρτωση...</div>}
//         {error && <div style={{ padding: 18, color: "#B91C1C" }}>Σφάλμα: {error}</div>}

//         {auction && !loading && !error && (
//           <>
//             {/* ✅ Chat card extracted (so we can render it in different place on mobile) */}
//             {(() => {
//               const chatCard = (
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: 16,
//                     boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                     overflow: "hidden",
//                     minWidth: 0,
//                   }}
//                 >
//                   <div
//                     style={{
//                       background: "#0B84F3",
//                       color: "white",
//                       padding: "12px 14px",
//                       fontWeight: 900,
//                       display: "flex",
//                       alignItems: "baseline",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <div>Auction Chat</div>
//                     <div style={{ fontWeight: 800, opacity: 0.9, fontSize: 13 }}>
//                       {auction.chat.length} messages
//                     </div>
//                   </div>

//                   <div style={{ padding: 12 }}>
//                     <div
//                       ref={chatScrollRef}
//                       style={{
//                         height: chatViewportHeight, // ✅ bigger height
//                         overflowY: "auto",
//                         paddingRight: 6,
//                       }}
//                     >
//                       {auction.chat.length === 0 ? (
//                         <div style={{ color: "#6B7280" }}>No messages yet.</div>
//                       ) : (
//                         <div style={{ display: "grid", gap: 12 }}>
//                           {auction.chat.map((m) => {
//                             const isAuctioneer =
//                               m.senderDisplayName === auction.sellerUsername;
//                             return (
//                               <div key={m.id} style={{ display: "grid", gap: 6 }}>
//                                 <div
//                                   style={{
//                                     color: "#6B7280",
//                                     fontWeight: 700,
//                                     fontSize: 12,
//                                   }}
//                                 >
//                                   {new Date(m.createdAt).toLocaleTimeString("en-US", {
//                                     hour: "numeric",
//                                     minute: "2-digit",
//                                   })}
//                                 </div>

//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     gap: 10,
//                                     alignItems: "flex-start",
//                                     minWidth: 0,
//                                   }}
//                                 >
//                                   <AvatarCircle
//                                     size={28}
//                                     name={m.senderDisplayName}
//                                     url={m.senderAvatarUrl ?? null}
//                                   />

//                                   <div
//                                     style={{
//                                       display: "grid",
//                                       gap: 6,
//                                       width: "100%",
//                                       minWidth: 0,
//                                     }}
//                                   >
//                                     <div
//                                       style={{
//                                         display: "flex",
//                                         gap: 10,
//                                         alignItems: "center",
//                                         minWidth: 0,
//                                       }}
//                                     >
//                                       <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                         {isAdmin ? (
//                                           <button
//                                             type="button"
//                                             onClick={() =>
//                                               handleOpenUserDetails(m.senderDisplayName)
//                                             }
//                                             style={{
//                                               background: "transparent",
//                                               border: "none",
//                                               padding: 0,
//                                               margin: 0,
//                                               cursor: "pointer",
//                                               fontWeight: 900,
//                                               color: "#111827",
//                                               textAlign: "left",
//                                               maxWidth: "100%",
//                                               whiteSpace: "nowrap",
//                                               overflow: "hidden",
//                                               textOverflow: "ellipsis",
//                                             }}
//                                             title={m.senderDisplayName}
//                                           >
//                                             {m.senderDisplayName}
//                                           </button>
//                                         ) : (
//                                           <div
//                                             style={{
//                                               maxWidth: "100%",
//                                               whiteSpace: "nowrap",
//                                               overflow: "hidden",
//                                               textOverflow: "ellipsis",
//                                             }}
//                                             title={m.senderDisplayName}
//                                           >
//                                             {m.senderDisplayName}
//                                           </div>
//                                         )}
//                                       </div>

//                                       {isAuctioneer && (
//                                         <div
//                                           style={{
//                                             fontSize: 12,
//                                             fontWeight: 800,
//                                             color: "#2563EB",
//                                             display: "flex",
//                                             gap: 6,
//                                             alignItems: "center",
//                                             flex: "0 0 auto",
//                                           }}
//                                         >
//                                           <span>✎</span>
//                                           <span>Auctioneer</span>
//                                         </div>
//                                       )}
//                                     </div>

//                                     <div
//                                       style={{
//                                         display: "inline-block",
//                                         background: isAuctioneer ? "#FEF3C7" : "#FFFFFF",
//                                         border: "1px solid #E5E7EB",
//                                         borderRadius: 14,
//                                         padding: "10px 12px",
//                                         maxWidth: "100%",
//                                         overflowWrap: "anywhere",
//                                         wordBreak: "break-word",
//                                       }}
//                                     >
//                                       {m.content}
//                                     </div>

//                                     {typeof m.remainingMessages === "number" && (
//                                       <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 12 }}>
//                                         Messages left: {m.remainingMessages}/25
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>

//                     {!isEnded && (
//                       <>
//                         <div
//                           style={{
//                             marginTop: 12,
//                             display: "grid",
//                             gridTemplateColumns: "minmax(0, 1fr) auto",
//                             gap: 10,
//                             alignItems: "center",
//                           }}
//                         >
//                           <input
//                             value={canChat ? newChatContent : ""}
//                             onChange={(e) => setNewChatContent(e.target.value)}
//                             disabled={!canChat}
//                             placeholder={
//                               canChat
//                                 ? "Write a message..."
//                                 : !isLoggedIn
//                                 ? "Sign in to chat..."
//                                 : chatBlockedReason ?? "Chat is not available."
//                             }
//                             style={{
//                               width: "100%",
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               outline: "none",
//                               background: canChat ? "white" : "#F9FAFB",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter" && !e.shiftKey && canChat) {
//                                 e.preventDefault();
//                                 void handleSendChat();
//                               }
//                             }}
//                           />

//                           {canChat ? (
//                             <button
//                               type="button"
//                               onClick={() => void handleSendChat()}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: 12,
//                                 border: "1px solid #111827",
//                                 background: "#111827",
//                                 color: "white",
//                                 fontWeight: 900,
//                                 cursor: "pointer",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               Send
//                             </button>
//                           ) : !isLoggedIn ? (
//                             <button
//                               type="button"
//                               onClick={() => onSignIn?.()}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: 12,
//                                 border: "1px solid #111827",
//                                 background: "#111827",
//                                 color: "white",
//                                 fontWeight: 900,
//                                 cursor: "pointer",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               Sign in to Chat
//                             </button>
//                           ) : null}
//                         </div>

//                         <NoticeInline notice={chatNotice.notice} onClose={chatNotice.clear} />

//                         {!canChat && !isLoggedIn && (
//                           <div style={{ marginTop: 8, color: "#6B7280", fontSize: 12, fontWeight: 700 }}>
//                             You need an account to chat
//                           </div>
//                         )}

//                         {!canChat && isLoggedIn && chatBlockedReason && (
//                           <div style={{ marginTop: 8, color: "#B91C1C", fontSize: 12, fontWeight: 800 }}>
//                             {chatBlockedReason}
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               );

//               return (
//                 <>
//                   <div
//                     style={{
//                       display: "grid",
//                       gridTemplateColumns: isSingleColumn
//                         ? "1fr"
//                         : "minmax(0, 1.65fr) minmax(0, 1fr)",
//                       gap: 18,
//                       alignItems: "start",
//                       width: "100%",
//                       maxWidth: "100%",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     {/* LEFT COLUMN */}
//                     <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
//                       {/* Image carousel card */}
//                       {images.length > 0 ? (
//                         <div
//                           style={{
//                             background: "white",
//                             borderRadius: 16,
//                             boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                             overflow: "hidden",
//                             minWidth: 0,
//                           }}
//                         >
//                           <div
//                             style={{
//                               position: "relative",
//                               height: imageStageHeight,
//                               background: "#F3F4F6",
//                               overflow: "hidden",
//                               zIndex: 0,
//                             }}
//                           >
//                             {mainImage ? (
//                               <img
//                                 src={mainImage}
//                                 alt="auction main"
//                                 style={{
//                                   width: "100%",
//                                   height: "100%",
//                                   objectFit: "contain",
//                                   objectPosition: "center",
//                                   cursor: "zoom-in",
//                                   background: "#F3F4F6",
//                                 }}
//                                 onClick={() => setFullscreenImageUrl(mainImage)}
//                                 onError={() => {
//                                   setBrokenImageByUrl((p) => ({ ...p, [mainImage]: true }));
//                                   setFullscreenImageUrl(null);
//                                 }}
//                               />
//                             ) : null}

//                             {auction.categoryName && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   top: 14,
//                                   right: 14,
//                                   background: "rgba(255,255,255,0.92)",
//                                   border: "1px solid rgba(229,231,235,0.9)",
//                                   borderRadius: 999,
//                                   padding: "6px 10px",
//                                   fontWeight: 700,
//                                   fontSize: 13,
//                                   zIndex: 2,
//                                   maxWidth: "calc(100% - 28px)",
//                                   whiteSpace: "nowrap",
//                                   overflow: "hidden",
//                                   textOverflow: "ellipsis",
//                                 }}
//                               >
//                                 {auction.categoryName}
//                               </div>
//                             )}

//                             {images.length > 0 && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   bottom: 14,
//                                   right: 14,
//                                   background: "rgba(17,24,39,0.75)",
//                                   color: "white",
//                                   borderRadius: 999,
//                                   padding: "8px 12px",
//                                   fontWeight: 800,
//                                   zIndex: 2,
//                                 }}
//                               >
//                                 {Math.min(selectedImageIdx + 1, images.length)}/{images.length}
//                               </div>
//                             )}

//                             {images.length > 1 && (
//                               <>
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     setSelectedImageIdx((i) => (i - 1 + images.length) % images.length)
//                                   }
//                                   style={{
//                                     position: "absolute",
//                                     left: 12,
//                                     top: "50%",
//                                     transform: "translateY(-50%)",
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 12,
//                                     border: "1px solid #E5E7EB",
//                                     background: "rgba(255,255,255,0.92)",
//                                     cursor: "pointer",
//                                     fontSize: 18,
//                                     fontWeight: 900,
//                                     zIndex: 2,
//                                   }}
//                                 >
//                                   ‹
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => setSelectedImageIdx((i) => (i + 1) % images.length)}
//                                   style={{
//                                     position: "absolute",
//                                     right: 12,
//                                     top: "50%",
//                                     transform: "translateY(-50%)",
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 12,
//                                     border: "1px solid #E5E7EB",
//                                     background: "rgba(255,255,255,0.92)",
//                                     cursor: "pointer",
//                                     fontSize: 18,
//                                     fontWeight: 900,
//                                     zIndex: 2,
//                                   }}
//                                 >
//                                   ›
//                                 </button>
//                               </>
//                             )}
//                           </div>

//                           {images.length > 1 && (
//                             <div
//                               style={{
//                                 borderTop: "1px solid #EEF2F7",
//                                 padding: 12,
//                                 display: "flex",
//                                 gap: 12,
//                                 overflowX: "auto",
//                                 WebkitOverflowScrolling: "touch",
//                                 background: "#FFFFFF",
//                                 position: "relative",
//                                 zIndex: 1,
//                               }}
//                             >
//                               {images.map((u, idx) => {
//                                 const active = idx === selectedImageIdx;
//                                 return (
//                                   <button
//                                     key={u + idx}
//                                     type="button"
//                                     onClick={() => setSelectedImageIdx(idx)}
//                                     style={{
//                                       flex: "0 0 auto",
//                                       width: 150,
//                                       height: 92,
//                                       borderRadius: 14,
//                                       border: active ? "3px solid #111827" : "1px solid #E5E7EB",
//                                       padding: 0,
//                                       overflow: "hidden",
//                                       cursor: "pointer",
//                                       background: "#F3F4F6",
//                                       boxSizing: "border-box",
//                                     }}
//                                   >
//                                     <img
//                                       src={u}
//                                       alt={`thumb ${idx + 1}`}
//                                       style={{
//                                         width: "100%",
//                                         height: "100%",
//                                         objectFit: "contain",
//                                         objectPosition: "center",
//                                         background: "#F3F4F6",
//                                       }}
//                                       onError={() => {
//                                         setBrokenImageByUrl((p) => ({ ...p, [u]: true }));
//                                       }}
//                                     />
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         // ✅ No image: μην εμφανίζεις το image box, μόνο μήνυμα
//                         <div
//                           style={{
//                             background: "white",
//                             borderRadius: 16,
//                             boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                             padding: 16,
//                             minWidth: 0,
//                             color: "#6B7280",
//                             fontWeight: 800,
//                           }}
//                         >
//                           Image is not available
//                         </div>
//                       )}

//                       {/* Seller information card */}
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div style={{ fontWeight: 800, color: "#111827", marginBottom: 10 }}>
//                           Seller Information
//                         </div>

//                         <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
//                           <AvatarCircle
//                             size={44}
//                             name={auction.sellerUsername}
//                             url={auction.sellerAvatarUrl ?? null}
//                           />

//                           <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
//                             <div style={{ fontWeight: 800, color: "#111827" }}>
//                               {isAdmin ? (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleOpenUserDetails(auction.sellerUsername)}
//                                   style={{
//                                     background: "transparent",
//                                     border: "none",
//                                     padding: 0,
//                                     margin: 0,
//                                     cursor: "pointer",
//                                     fontWeight: 800,
//                                     color: "#111827",
//                                     textAlign: "left",
//                                     maxWidth: "100%",
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                   }}
//                                   title={auction.sellerUsername}
//                                 >
//                                   {auction.sellerUsername}
//                                 </button>
//                               ) : (
//                                 <div
//                                   style={{
//                                     maxWidth: "100%",
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                   }}
//                                   title={auction.sellerUsername}
//                                 >
//                                   {auction.sellerUsername}
//                                 </div>
//                               )}
//                             </div>

//                             <div
//                               style={{
//                                 display: "flex",
//                                 gap: 6,
//                                 alignItems: "center",
//                                 color: "#6B7280",
//                                 minWidth: 0,
//                               }}
//                             >
//                               <span style={{ fontSize: 14 }}>
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                 <path d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
//                                 <circle cx="12" cy="11" r="2.5" stroke="currentColor" stroke-width="2"/>
//                               </svg>
//                               </span>
//                               <span
//                                 style={{
//                                   whiteSpace: "nowrap",
//                                   overflow: "hidden",
//                                   textOverflow: "ellipsis",
//                                 }}
//                                 title={getCityFromLocation(auction.sellerLocation)}
//                               >
//                                 {getCityFromLocation(auction.sellerLocation)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Description card */}
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
//                           Description
//                         </div>

//                         <div
//                           style={{
//                             color: "#374151",
//                             lineHeight: 1.55,
//                             overflowWrap: "anywhere",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {auction.description || auction.shortDescription || "—"}
//                         </div>

//                         <div
//                           style={{
//                             marginTop: 14,
//                             paddingTop: 14,
//                             borderTop: "1px solid #EEF2F7",
//                             display: "grid",
//                             gridTemplateColumns: isSingleColumn
//                               ? "1fr"
//                               : "minmax(0, 1fr) minmax(0, 1fr)",
//                             gap: 12,
//                           }}
//                         >
//                           <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                             {/* <span style={{ fontSize: 18 }}>💠</span> */}
//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
//                                 Starting price
//                               </div>
//                               <div style={{ fontWeight: 900, color: "#111827" }}>
//                                 {formatMoneyEUR(auction.startingAmount)}
//                               </div>
//                             </div>
//                           </div>

//                           <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                             {/* <span style={{ fontSize: 18 }}>↗️</span> */}
//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
//                                 Minimum raise
//                               </div>
//                               <div style={{ fontWeight: 900, color: "#111827" }}>
//                                 {formatMoneyEUR(auction.minBidIncrement)}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* ✅ Chat stays here ONLY on non-mobile */}
//                       {!isMobile && chatCard}
//                     </div>

//                     {/* RIGHT COLUMN */}
//                     <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div
//                           style={{
//                             fontSize: 18,
//                             fontWeight: 900,
//                             color: "#111827",
//                             overflowWrap: "anywhere",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {auction.title}
//                         </div>

//                         <div
//                           style={{
//                             marginTop: 12,
//                             padding: 14,
//                             borderRadius: 14,
//                             background: "#F9FAFB",
//                             border: "1px solid #EEF2F7",
//                           }}
//                         >
//                           <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                             <span style={{ fontSize: 18 }}>🕒</span>
//                             <div style={{ fontWeight: 800, color: "#374151" }}>
//                               Time Remaining
//                             </div>
//                           </div>
//                           <div
//                             style={{
//                               marginTop: 8,
//                               fontWeight: 900,
//                               color: timeBox.ended ? "#DC2626" : "#111827",
//                               overflowWrap: "anywhere",
//                               wordBreak: "break-word",
//                             }}
//                           >
//                             {timeBox.label}
//                           </div>
//                         </div>

//                         {!isEnded && (
//                           <div style={{ marginTop: 16 }}>
//                             <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                               Place Your Bid{" "}
//                               {minNextBid != null ? `(min ${formatMoneyEUR(minNextBid)})` : ""}
//                             </div>

//                             <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                               <div
//                                 style={{
//                                   flex: 1,
//                                   minWidth: 0,
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 8,
//                                   border: "1px solid #E5E7EB",
//                                   borderRadius: 12,
//                                   padding: "10px 12px",
//                                   background: canBid ? "white" : "#F9FAFB",
//                                   boxSizing: "border-box",
//                                 }}
//                               >
//                                 <span style={{ color: "#9CA3AF", fontWeight: 900 }}>€</span>
//                                 <input
//                                   type="number"
//                                   min={0}
//                                   step="1"
//                                   value={bidAmount}
//                                   onChange={(e) => setBidAmount(e.target.value)}
//                                   placeholder=""
//                                   disabled={!canBid}
//                                   style={{
//                                     width: "100%",
//                                     border: "none",
//                                     outline: "none",
//                                     background: "transparent",
//                                     fontSize: 14,
//                                     minWidth: 0,
//                                   }}
//                                 />
//                               </div>

//                               {canBid ? (
//                                 <button
//                                   type="button"
//                                   onClick={handleBid}
//                                   style={{
//                                     padding: "10px 14px",
//                                     borderRadius: 12,
//                                     border: "1px solid #111827",
//                                     background: "#111827",
//                                     color: "white",
//                                     fontWeight: 800,
//                                     cursor: "pointer",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   Place Bid
//                                 </button>
//                               ) : (
//                                 <button
//                                   type="button"
//                                   onClick={() => onSignIn?.()}
//                                   style={{
//                                     padding: "10px 14px",
//                                     borderRadius: 12,
//                                     border: "1px solid #111827",
//                                     background: "#111827",
//                                     color: "white",
//                                     fontWeight: 800,
//                                     cursor: "pointer",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   Sign in to Bid
//                                 </button>
//                               )}
//                             </div>

//                             <NoticeInline notice={bidNotice.notice} onClose={bidNotice.clear} />
//                           </div>
//                         )}

//                         {/* Bidder rankings (Top 3 only) */}
//                         <div style={{ marginTop: 16 }}>
//                           <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
//                             Bidder Rankings ({sortedBids.length})
//                           </div>

//                           {sortedBids.length === 0 ? (
//                             <div style={{ color: "#6B7280" }}>No bids yet.</div>
//                           ) : (
//                             <div style={{ display: "grid", gap: 10 }}>
//                               {sortedBids.slice(0, 3).map((b, idx) => {
//                                 const leading = idx === 0;
//                                 return (
//                                   <div
//                                     key={b.id}
//                                     style={{
//                                       borderRadius: 14,
//                                       border: leading
//                                         ? "2px solid rgba(59,130,246,0.5)"
//                                         : "1px solid #E5E7EB",
//                                       padding: 12,
//                                       display: "flex",
//                                       alignItems: "center",
//                                       justifyContent: "space-between",
//                                       gap: 12,
//                                       background: "white",
//                                       minWidth: 0,
//                                     }}
//                                   >
//                                     <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
//                                       <div
//                                         style={{
//                                           width: 44,
//                                           height: 44,
//                                           borderRadius: 999,
//                                           background: "#2563EB",
//                                           display: "grid",
//                                           placeItems: "center",
//                                           color: "white",
//                                           fontWeight: 900,
//                                           flex: "0 0 auto",
//                                         }}
//                                       >
//                                         #{idx + 1}
//                                       </div>

//                                       <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                                         <AvatarCircle
//                                           size={38}
//                                           name={b.bidderUsername}
//                                           url={b.bidderAvatarUrl ?? null}
//                                           ring={leading}
//                                         />
//                                         <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                                           <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                             {b.bidderUsername ? (
//                                               isAdmin ? (
//                                                 <button
//                                                   type="button"
//                                                   onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                                                   style={{
//                                                     background: "transparent",
//                                                     border: "none",
//                                                     padding: 0,
//                                                     margin: 0,
//                                                     cursor: "pointer",
//                                                     fontWeight: 900,
//                                                     color: "#111827",
//                                                     textAlign: "left",
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </button>
//                                               ) : (
//                                                 <div
//                                                   style={{
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </div>
//                                               )
//                                             ) : (
//                                               "Unknown"
//                                             )}
//                                           </div>
//                                           <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                                             {timeAgo(b.createdAt, now)}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>

//                                     <div style={{ textAlign: "right", flex: "0 0 auto" }}>
//                                       <div style={{ color: "#2563EB", fontWeight: 900 }}>
//                                         {formatMoneyEUR(b.amount)}
//                                       </div>
//                                       {leading && (
//                                         <div style={{ color: "#2563EB", fontWeight: 800, fontSize: 13 }}>
//                                           Leading
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           )}

//                           {sortedBids.length > 3 && (
//                             <div style={{ marginTop: 12 }}>
//                               <button
//                                 type="button"
//                                 onClick={() => setBidHistoryOpen((v) => !v)}
//                                 style={{
//                                   width: "100%",
//                                   border: "1px solid rgba(17,24,39,0.14)",
//                                   background: "#FFFFFF",
//                                   borderRadius: 12,
//                                   padding: "10px 12px",
//                                   fontWeight: 900,
//                                   cursor: "pointer",
//                                   fontSize: 13,
//                                 }}
//                               >
//                                 {bidHistoryOpen ? "Hide" : "See more"}
//                               </button>
//                             </div>
//                           )}

//                           {bidHistoryOpen && sortedBids.length > 3 && (
//                             <div
//                               style={{
//                                 marginTop: 12,
//                                 borderRadius: 16,
//                                 border: "1px solid #E5E7EB",
//                                 overflow: "hidden",
//                                 background: "#FFFFFF",
//                                 minWidth: 0,
//                               }}
//                             >
//                               <div
//                                 style={{
//                                   padding: "10px 12px",
//                                   borderBottom: "1px solid #EEF2F7",
//                                   display: "flex",
//                                   justifyContent: "space-between",
//                                   alignItems: "baseline",
//                                   gap: 10,
//                                 }}
//                               >
//                                 <div style={{ fontWeight: 950, color: "#111827" }}>More bids</div>
//                                 <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                                   Scroll to view
//                                 </div>
//                               </div>

//                               <div
//                                 style={{
//                                   maxHeight: 260,
//                                   overflowY: "auto",
//                                   padding: 12,
//                                   display: "grid",
//                                   gap: 10,
//                                   background: "#F9FAFB",
//                                 }}
//                               >
//                                 {sortedBids.slice(3).map((b) => {
//                                   return (
//                                     <div
//                                       key={`more-${b.id}`}
//                                       style={{
//                                         borderRadius: 14,
//                                         border: "1px solid #E5E7EB",
//                                         background: "#FFFFFF",
//                                         padding: 12,
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         alignItems: "center",
//                                         gap: 12,
//                                         minWidth: 0,
//                                       }}
//                                     >
//                                       <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                                         <AvatarCircle size={38} name={b.bidderUsername} url={b.bidderAvatarUrl ?? null} />
//                                         <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                                           <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                             {b.bidderUsername ? (
//                                               isAdmin ? (
//                                                 <button
//                                                   type="button"
//                                                   onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                                                   style={{
//                                                     background: "transparent",
//                                                     border: "none",
//                                                     padding: 0,
//                                                     margin: 0,
//                                                     cursor: "pointer",
//                                                     fontWeight: 900,
//                                                     color: "#111827",
//                                                     textAlign: "left",
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </button>
//                                               ) : (
//                                                 <div
//                                                   style={{
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </div>
//                                               )
//                                             ) : (
//                                               "Unknown"
//                                             )}
//                                           </div>

//                                           <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                                             {timeAgo(b.createdAt, now)}
//                                           </div>
//                                         </div>
//                                       </div>

//                                       <div style={{ textAlign: "right", flex: "0 0 auto" }}>
//                                         <div style={{ color: "#2563EB", fontWeight: 950 }}>
//                                           {formatMoneyEUR(b.amount)}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ✅ On mobile: chat goes to the END of the page (after title/time/bids) */}
//                   {isMobile && <div style={{ marginTop: 14 }}>{chatCard}</div>}
//                 </>
//               );
//             })()}

//             {/* ADMIN block */}
//             {isAdmin && (
//               <div style={{ marginTop: 18 }}>
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: 16,
//                     boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                     padding: 16,
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                     overflowX: "hidden",
//                   }}
//                 >
//                   <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
//                     <div style={{ fontWeight: 900, color: "#111827" }}>Admin: Edit auction</div>
//                     {!isEditing ? (
//                       <button
//                         type="button"
//                         onClick={() => setIsEditing(true)}
//                         style={{
//                           padding: "8px 12px",
//                           borderRadius: 12,
//                           border: "1px solid #E5E7EB",
//                           background: "white",
//                           cursor: "pointer",
//                           fontWeight: 800,
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         Open editor
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           if (auction) hydrateEdit(auction);
//                           setIsEditing(false);
//                         }}
//                         style={{
//                           padding: "8px 12px",
//                           borderRadius: 12,
//                           border: "1px solid #E5E7EB",
//                           background: "white",
//                           cursor: "pointer",
//                           fontWeight: 800,
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         Close
//                       </button>
//                     )}
//                   </div>

//                   <NoticeInline notice={adminNotice.notice} onClose={adminNotice.clear} />

//                   {isEditing && (
//                     <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Title
//                           <input
//                             value={editForm.title}
//                             onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Category ID (optional)
//                           <input
//                             value={editForm.categoryId}
//                             onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                         Short description
//                         <input
//                           value={editForm.shortDescription}
//                           onChange={(e) => setEditForm((p) => ({ ...p, shortDescription: e.target.value }))}
//                           style={{
//                             border: "1px solid #E5E7EB",
//                             borderRadius: 12,
//                             padding: "10px 12px",
//                             minWidth: 0,
//                             boxSizing: "border-box",
//                           }}
//                         />
//                       </label>

//                       <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                         Full description
//                         <textarea
//                           value={editForm.description}
//                           onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
//                           rows={4}
//                           style={{
//                             border: "1px solid #E5E7EB",
//                             borderRadius: 12,
//                             padding: "10px 12px",
//                             resize: "vertical",
//                             minWidth: 0,
//                             boxSizing: "border-box",
//                           }}
//                         />
//                       </label>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Starting amount
//                           <input
//                             value={editForm.startingAmount}
//                             onChange={(e) => setEditForm((p) => ({ ...p, startingAmount: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Min bid increment
//                           <input
//                             value={editForm.minBidIncrement}
//                             onChange={(e) => setEditForm((p) => ({ ...p, minBidIncrement: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Start date
//                           <input
//                             value={editForm.startDate}
//                             onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
//                             type="datetime-local"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           End date
//                           <input
//                             value={editForm.endDate}
//                             onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
//                             type="datetime-local"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Shipping cost payer
//                           <select
//                             value={editForm.shippingCostPayer}
//                             onChange={(e) =>
//                               setEditForm((p) => ({
//                                 ...p,
//                                 shippingCostPayer: e.target.value as ShippingCostPayer,
//                               }))
//                             }
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               background: "white",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           >
//                             <option value="SELLER">SELLER</option>
//                             <option value="BUYER">BUYER</option>
//                             <option value="SPLIT">SPLIT</option>
//                           </select>
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Status
//                           <select
//                             value={editForm.auctionStatus || ""}
//                             onChange={(e) =>
//                               setEditForm((p) => ({
//                                 ...p,
//                                 auctionStatus: e.target.value as AuctionStatus | "",
//                               }))
//                             }
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               background: "white",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           >
//                             <option value="">(no change)</option>
//                             <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
//                             <option value="ACTIVE">ACTIVE</option>
//                             <option value="EXPIRED">EXPIRED</option>
//                             <option value="CANCELLED">CANCELLED</option>
//                           </select>
//                         </label>
//                       </div>

//                       <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             if (auction) hydrateEdit(auction);
//                             setIsEditing(false);
//                           }}
//                           style={{
//                             padding: "10px 14px",
//                             borderRadius: 12,
//                             border: "1px solid #E5E7EB",
//                             background: "white",
//                             cursor: "pointer",
//                             fontWeight: 800,
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => void handleSaveEdit()}
//                           style={{
//                             padding: "10px 14px",
//                             borderRadius: 12,
//                             border: "1px solid #111827",
//                             background: "#111827",
//                             color: "white",
//                             cursor: "pointer",
//                             fontWeight: 900,
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           Save changes
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Fullscreen overlay */}
//       {fullscreenImageUrl && (
//         <div
//           onClick={() => setFullscreenImageUrl(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.82)",
//             display: "grid",
//             placeItems: "center",
//             zIndex: 9999,
//             cursor: "zoom-out",
//             padding: 16,
//           }}
//         >
//           <img
//             src={fullscreenImageUrl}
//             alt="fullscreen"
//             style={{
//               maxWidth: "92vw",
//               maxHeight: "92vh",
//               borderRadius: 14,
//               boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
//               background: "white",
//             }}
//             onError={() => {
//               setBrokenImageByUrl((p) => ({ ...p, [fullscreenImageUrl]: true }));
//               setFullscreenImageUrl(null);
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuctionDetailsPage;


// // AuctionDetailsPage.tsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";
// import type { IMessage, IStompSocket, StompSubscription } from "@stomp/stompjs";

// import { getAuctionById } from "../api/Springboot/backendAuctionService";
// import { placeBid } from "../api/Springboot/BackendBidService";
// import { sendChatMessage } from "../api/Springboot/backendChatService";
// import { adminEditAuction } from "../api/admin/backendAdminAuctionService";

// import type {
//   AdminAuctionUpdateRequest,
//   AuctionDetails,
//   AuctionStatus,
//   ShippingCostPayer,
// } from "../models/Springboot/Auction";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// interface AuctionDetailsPageProps {
//   auctionId: number;
//   onBack?: () => void;
//   currentUser: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;

//   onSignIn?: () => void;
//   onSignUp?: () => void;

//   onBidUpdate?: (u: {
//     auctionId: number;
//     amount: number;
//     bidderUsername: string;
//     newEndDate: string;
//   }) => void;

//   onAuctionLoaded?: (a: AuctionDetails) => void;

//   variant?: "page" | "modal";
// }

// // ✅ WebSocket DTO (updated: bidderAvatarUrl)
// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
//   bidderAvatarUrl?: string | null;
// }

// interface ChatMessageDto {
//   id: number;
//   senderDisplayName: string;
//   senderAvatarUrl?: string | null;
//   senderFirebaseId: string;
//   content: string;
//   createdAt: string;
//   remainingMessages?: number;
// }

// const DEFAULT_AVATAR_FALLBACK =
//   "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%25' height='100%25' rx='999' fill='%23E5E7EB'/%3E%3Cpath d='M32 34c6 0 11-5 11-11S38 12 32 12s-11 5-11 11 5 11 11 11zm0 6c-10 0-18 6-18 14h36c0-8-8-14-18-14z' fill='%239CA3AF'/%3E%3C/svg%3E";

// function formatMoneyEUR(value: number): string {
//   try {
//     return new Intl.NumberFormat("el-GR", {
//       style: "currency",
//       currency: "EUR",
//       maximumFractionDigits: 0,
//     }).format(value);
//   } catch {
//     return `${value}€`;
//   }
// }

// function timeAgo(iso: string, now: Date): string {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return "";
//   const diffMs = now.getTime() - d.getTime();
//   const s = Math.max(0, Math.floor(diffMs / 1000));
//   const m = Math.floor(s / 60);
//   const h = Math.floor(m / 60);
//   const day = Math.floor(h / 24);

//   if (day > 0) return `${day}d ago`;
//   if (h > 0) return `${h}h ago`;
//   if (m > 0) return `${m}m ago`;
//   return `${s}s ago`;
// }

// function formatTimeRemaining(
//   endIso: string,
//   now: Date
// ): { label: string; ended: boolean } {
//   const end = new Date(endIso);
//   if (Number.isNaN(end.getTime())) return { label: endIso, ended: false };
//   const diff = end.getTime() - now.getTime();
//   if (diff <= 0) return { label: "Ended", ended: true };

//   let total = Math.floor(diff / 1000);
//   const days = Math.floor(total / (24 * 3600));
//   total -= days * 24 * 3600;
//   const hours = Math.floor(total / 3600);
//   total -= hours * 3600;
//   const minutes = Math.floor(total / 60);
//   const seconds = total - minutes * 60;

//   if (days > 0)
//     return {
//       label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
//       ended: false,
//     };
//   if (hours > 0) return { label: `${hours}h ${minutes}m ${seconds}s`, ended: false };
//   if (minutes > 0) return { label: `${minutes}m ${seconds}s`, ended: false };
//   return { label: `${seconds}s`, ended: false };
// }

// function toDateTimeLocal(value: string | null | undefined): string {
//   if (!value) return "";
//   return value.length >= 16 ? value.slice(0, 16) : value;
// }

// type NoticeType = "success" | "error";
// type NoticeState = { type: NoticeType; text: string } | null;

// function useAutoDismissNotice(timeoutMs = 4200) {
//   const [notice, setNotice] = useState<NoticeState>(null);
//   const timerRef = useRef<number | null>(null);

//   const clear = useCallback(() => {
//     if (timerRef.current != null) {
//       window.clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }
//     setNotice(null);
//   }, []);

//   const show = useCallback(
//     (type: NoticeType, text: string) => {
//       setNotice({ type, text });
//       if (timerRef.current != null) window.clearTimeout(timerRef.current);
//       timerRef.current = window.setTimeout(() => {
//         setNotice(null);
//         timerRef.current = null;
//       }, timeoutMs);
//     },
//     [timeoutMs]
//   );

//   useEffect(() => {
//     return () => {
//       if (timerRef.current != null) window.clearTimeout(timerRef.current);
//     };
//   }, []);

//   return { notice, show, clear };
// }

// const NoticeInline: React.FC<{
//   notice: NoticeState;
//   onClose: () => void;
// }> = ({ notice, onClose }) => {
//   if (!notice) return null;

//   const isErr = notice.type === "error";
//   return (
//     <div
//       style={{
//         marginTop: 10,
//         borderRadius: 12,
//         border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
//         background: isErr ? "#FEF2F2" : "#F0FDF4",
//         color: isErr ? "#991B1B" : "#166534",
//         padding: "10px 12px",
//         fontWeight: 800,
//         fontSize: 13,
//         display: "flex",
//         alignItems: "flex-start",
//         justifyContent: "space-between",
//         gap: 10,
//       }}
//       role="status"
//       aria-live="polite"
//     >
//       <div style={{ lineHeight: 1.35 }}>{notice.text}</div>

//       <button
//         type="button"
//         onClick={onClose}
//         aria-label="Close message"
//         style={{
//           flex: "0 0 auto",
//           width: 30,
//           height: 30,
//           padding: 0,
//           borderRadius: 10,
//           border: "1px solid rgba(17,24,39,0.12)",
//           background: "rgba(255,255,255,0.75)",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontWeight: 950,
//           fontSize: 16,
//           lineHeight: 1,
//         }}
//         title="Close"
//       >
//         <span style={{ display: "block", transform: "translateY(-0.5px)" }}>
//           ✕
//         </span>
//       </button>
//     </div>
//   );
// };

// /* =========================================================
//    ✅ ΜΟΝΗ ΑΛΛΑΓΗ: AvatarCircle έξω από το component + React.memo
//    ========================================================= */
// const AvatarCircle = React.memo(
//   ({
//     size,
//     name,
//     url,
//     ring,
//   }: {
//     size: number;
//     name?: string;
//     url?: string | null;
//     ring?: boolean;
//   }) => {
//     const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
//     return (
//       <div
//         style={{
//           width: size,
//           height: size,
//           borderRadius: 999,
//           overflow: "hidden",
//           flex: "0 0 auto",
//           boxShadow: ring ? "0 0 0 3px rgba(59,130,246,0.25)" : undefined,
//           background: "#EEF2FF",
//           display: "grid",
//           placeItems: "center",
//         }}
//       >
//         {url ? (
//           <img
//             src={url}
//             alt={name ?? "avatar"}
//             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             onError={(e) => {
//               (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
//             }}
//           />
//         ) : (
//           <span style={{ fontWeight: 800, color: "#4F46E5" }}>{initial}</span>
//         )}
//       </div>
//     );
//   }
// );
// AvatarCircle.displayName = "AvatarCircle";
// /* ========================================================= */

// const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
//   auctionId,
//   onBack,
//   currentUser,
//   onOpenUserDetailsAsAdmin,
//   onSignIn,
//   onBidUpdate,
//   onAuctionLoaded,
//   variant = "page",
// }) => {
//   const [auction, setAuction] = useState<AuctionDetails | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [now, setNow] = useState<Date>(new Date());

//   // ✅ responsive (για να μην δημιουργείται horizontal scroll σε modal / στενά πλάτη)
//   const [vw, setVw] = useState<number>(() =>
//     typeof window !== "undefined" ? window.innerWidth : 1200
//   );
//   useEffect(() => {
//     const onResize = () => setVw(window.innerWidth);
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isModal = variant === "modal";
//   const isSingleColumn = isModal || vw < 980;

//   // ✅ αυτό είναι “phone” breakpoint (για να πάει το chat στο τέλος)
//   const isMobile = vw <= 640;

//   const chatViewportHeight = isModal ? 260 : isMobile ? 380 : 320;

//   // ✅ stable refs για callbacks
//   const onAuctionLoadedRef =
//     useRef<AuctionDetailsPageProps["onAuctionLoaded"]>(onAuctionLoaded);
//   const onBidUpdateRef =
//     useRef<AuctionDetailsPageProps["onBidUpdate"]>(onBidUpdate);

//   useEffect(() => {
//     onAuctionLoadedRef.current = onAuctionLoaded;
//   }, [onAuctionLoaded]);

//   useEffect(() => {
//     onBidUpdateRef.current = onBidUpdate;
//   }, [onBidUpdate]);

//   // images
//   const [selectedImageIdx, setSelectedImageIdx] = useState(0);
//   const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
//     null
//   );

//   // ✅ track broken images (Cloudflare expiry etc.)
//   const [brokenImageByUrl, setBrokenImageByUrl] = useState<Record<string, boolean>>({});

//   // bid/chat
//   const [bidAmount, setBidAmount] = useState<string>("");
//   const [newChatContent, setNewChatContent] = useState<string>("");

//   // ✅ inline messages (auto-hide + manual close)
//   const bidNotice = useAutoDismissNotice(4200);
//   const chatNotice = useAutoDismissNotice(4200);
//   const adminNotice = useAutoDismissNotice(4200);

//   // ------------------ Chat auto-scroll (default to bottom) ------------------
//   const chatScrollRef = useRef<HTMLDivElement | null>(null);
//   const didInitialChatScrollRef = useRef<boolean>(false);

//   const scrollChatToBottom = useCallback(() => {
//     const el = chatScrollRef.current;
//     if (!el) return;
//     el.scrollTop = el.scrollHeight;
//   }, []);

//   // ws
//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const bidSubRef = useRef<StompSubscription | null>(null);
//   const chatSubRef = useRef<StompSubscription | null>(null);

//   const isAdmin = currentUser?.roleName === "Admin";

//   const handleOpenUserDetails = useCallback(
//     (username: string) => {
//       if (!isAdmin) return;
//       if (!onOpenUserDetailsAsAdmin) return;
//       onOpenUserDetailsAsAdmin(username);
//     },
//     [isAdmin, onOpenUserDetailsAsAdmin]
//   );

//   // timers / esc
//   useEffect(() => {
//     const t = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(t);
//   }, []);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setFullscreenImageUrl(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   // clear notices on auction change
//   useEffect(() => {
//     bidNotice.clear();
//     chatNotice.clear();
//     adminNotice.clear();
//     setBidAmount("");
//     setNewChatContent("");
//     didInitialChatScrollRef.current = false; // ✅ reset initial scroll per auction

//     // ✅ reset broken image tracking per auction
//     setBrokenImageByUrl({});
//   }, [auctionId, bidNotice.clear, chatNotice.clear, adminNotice.clear]);

//   // load auction
//   const loadAuction = useCallback(async () => {
//     setError(null);
//     setLoading(true);
//     setAuction(null);

//     try {
//       const res = await getAuctionById(auctionId);
//       setAuction(res);
//       onAuctionLoadedRef.current?.(res);
//       setSelectedImageIdx(0);
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while loading this auction. Please try again.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   }, [auctionId]);

//   useEffect(() => {
//     void loadAuction();
//   }, [loadAuction]);

//   // STOMP connect once
//   useEffect(() => {
//     const socket = new SockJS("/ws");
//     const client = new Client({
//       webSocketFactory: () => socket as unknown as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {},
//     });

//     client.onConnect = () => setStompClient(client);
//     client.onStompError = (frame) => {
//       // eslint-disable-next-line no-console
//       console.error(
//         "STOMP error (details):",
//         frame.headers["message"],
//         frame.body
//       );
//     };

//     client.activate();

//     return () => {
//       if (bidSubRef.current) {
//         bidSubRef.current.unsubscribe();
//         bidSubRef.current = null;
//       }
//       if (chatSubRef.current) {
//         chatSubRef.current.unsubscribe();
//         chatSubRef.current = null;
//       }
//       client.deactivate();
//     };
//   }, []);

//   // Subscribe bids/chat
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected) return;

//     if (bidSubRef.current) {
//       bidSubRef.current.unsubscribe();
//       bidSubRef.current = null;
//     }
//     if (chatSubRef.current) {
//       chatSubRef.current.unsubscribe();
//       chatSubRef.current = null;
//     }

//     const bidTopic = `/topic/auctions/${auctionId}`;
//     const bidSub = stompClient.subscribe(bidTopic, (message: IMessage) => {
//       try {
//         const payload: BidEventDto = JSON.parse(message.body);

//         onBidUpdateRef.current?.({
//           auctionId: payload.auctionId,
//           amount: payload.amount,
//           bidderUsername: payload.bidderUsername,
//           newEndDate: payload.newEndDate,
//         });

//         setAuction((prev) => {
//           if (!prev || prev.id !== payload.auctionId) return prev;

//           const newBid = {
//             id: payload.id,
//             amount: payload.amount,
//             bidderUsername: payload.bidderUsername,
//             createdAt: payload.createdAt,
//             auctionId: payload.auctionId,
//             bidderAvatarUrl: payload.bidderAvatarUrl ?? null,
//           };

//           const already = prev.bids.some((b) => b.id === newBid.id);
//           const bids = already ? prev.bids : [newBid, ...prev.bids];

//           return { ...prev, endDate: payload.newEndDate, bids };
//         });
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("Failed to parse BidEventDto", err);
//       }
//     });
//     bidSubRef.current = bidSub;

//     const chatTopic = `/topic/auctions/${auctionId}/chat`;
//     const chatSub = stompClient.subscribe(chatTopic, (message: IMessage) => {
//       try {
//         const payload: ChatMessageDto = JSON.parse(message.body);
//         setAuction((prev) => {
//           if (!prev || prev.id !== auctionId) return prev;
//           const exists = prev.chat.some((m) => m.id === payload.id);
//           if (exists) return prev;
//           return { ...prev, chat: [...prev.chat, payload] };
//         });
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("Failed to parse ChatMessageDto", err);
//       }
//     });
//     chatSubRef.current = chatSub;

//     return () => {
//       bidSub.unsubscribe();
//       chatSub.unsubscribe();
//       if (bidSubRef.current === bidSub) bidSubRef.current = null;
//       if (chatSubRef.current === chatSub) chatSubRef.current = null;
//     };
//   }, [stompClient, auctionId]);

//   // auto-scroll first load chat (once per auction)
//   useEffect(() => {
//     if (!auction) return;
//     if (didInitialChatScrollRef.current) return;

//     window.setTimeout(() => {
//       scrollChatToBottom();
//       didInitialChatScrollRef.current = true;
//     }, 0);
//   }, [auction, scrollChatToBottom]);

//   // auto-scroll on new messages ONLY if user is near bottom
//   useEffect(() => {
//     if (!auction) return;
//     const el = chatScrollRef.current;
//     if (!el) return;

//     const threshold = 90; // px
//     const distanceFromBottom =
//       el.scrollHeight - (el.scrollTop + el.clientHeight);

//     if (distanceFromBottom <= threshold) {
//       window.setTimeout(() => scrollChatToBottom(), 0);
//     }
//   }, [auction?.chat.length, auction, scrollChatToBottom]);

//   // derived
//   const allImages = auction?.imageUrls ?? [];
//   const images = useMemo(
//     () => allImages.filter((u) => !!u && !brokenImageByUrl[u]),
//     [allImages, brokenImageByUrl]
//   );

//   useEffect(() => {
//     if (selectedImageIdx >= images.length && images.length > 0) {
//       setSelectedImageIdx(0);
//     }
//     if (images.length === 0) {
//       setSelectedImageIdx(0);
//       setFullscreenImageUrl(null);
//     }
//   }, [images.length, selectedImageIdx]);

//   const mainImage =
//     images.length > 0
//       ? images[Math.min(selectedImageIdx, images.length - 1)]
//       : null;

//   const timeBox = useMemo(() => {
//     if (!auction) return { label: "", ended: false };
//     return formatTimeRemaining(auction.endDate, now);
//   }, [auction, now]);

//   const isActive = useMemo(() => {
//     if (!auction) return false;
//     const end = new Date(auction.endDate);
//     if (Number.isNaN(end.getTime())) return false;
//     return end.getTime() - now.getTime() > 0;
//   }, [auction, now]);

//   const canBid = !!auction && auction.eligibleForBid && isActive;

//   const isLoggedIn = !!currentUser;
//   const canChat = !!auction && isLoggedIn && auction.eligibleForChat && isActive;

//   const chatBlockedReason = useMemo(() => {
//     if (!auction) return null;
//     if (!isActive) return "Chat is closed because the auction has ended.";
//     if (!isLoggedIn) return null;
//     if (!auction.eligibleForChat)
//       return "Place a bid to unlock the chat for this auction.";
//     return null;
//   }, [auction, isActive, isLoggedIn]);

//   const isEnded = useMemo(() => {
//     if (!auction) return false;
//     if (auction.status === "EXPIRED" || auction.status === "CANCELLED")
//       return true;
//     return timeBox.ended;
//   }, [auction, timeBox.ended]);

//   type BidItem = AuctionDetails["bids"][number] & { bidderAvatarUrl?: string | null };

//   const sortedBids: BidItem[] = useMemo(() => {
//     if (!auction) return [];
//     const copy = [...(auction.bids as BidItem[])];
//     copy.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
//     return copy;
//   }, [auction]);

//   const currentTopBid = sortedBids.length > 0 ? sortedBids[0].amount : null;

//   const minNextBid = useMemo(() => {
//     if (!auction) return null;
//     const base = currentTopBid ?? auction.startingAmount;
//     return (base ?? 0) + (auction.minBidIncrement ?? 0);
//   }, [auction, currentTopBid]);

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   // actions
//   const handleBid = async () => {
//     if (!auction) return;

//     const raw = bidAmount.trim();
//     if (!raw) {
//       bidNotice.show("error", "Please enter a bid amount.");
//       return;
//     }

//     const amount = Number(raw);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       bidNotice.show("error", "Please enter a valid amount.");
//       return;
//     }

//     try {
//       await placeBid(auction.id, amount);
//       bidNotice.show("success", "Your bid was placed successfully!");
//       setBidAmount("");
//       await loadAuction();
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error ? e.message : "Something went wrong while placing your bid. Please try again.";
//       bidNotice.show("error", msg);
//     }
//   };

//   const handleSendChat = async () => {
//     if (!auction) return;
//     const text = newChatContent.trim();
//     if (!text) {
//       chatNotice.show("error", "Your message can't be empty.");
//       return;
//     }

//     try {
//       await sendChatMessage(auction.id, text);
//       setNewChatContent("");

//       // ✅ Force scroll to bottom after sending (so user sees their message)
//       window.setTimeout(() => {
//         scrollChatToBottom();
//       }, 0);

//       // (προαιρετικό) success message:
//       // chatNotice.show("success", "Το μήνυμα στάλθηκε.");
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while sending your message. Please try again.";
//       chatNotice.show("error", msg);
//     }
//   };

//   // ------------------ ADMIN edit ------------------
//   const [isEditing, setIsEditing] = useState(false);
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

//   const hydrateEdit = useCallback((a: AuctionDetails) => {
//     setEditForm({
//       categoryId: "",
//       title: a.title ?? "",
//       shortDescription: a.shortDescription ?? "",
//       description: a.description ?? "",
//       startingAmount: a.startingAmount?.toString() ?? "",
//       minBidIncrement: a.minBidIncrement?.toString() ?? "",
//       startDate: toDateTimeLocal(a.startDate),
//       endDate: toDateTimeLocal(a.endDate),
//       shippingCostPayer: a.shippingCostPayer,
//       auctionStatus: a.status as AuctionStatus,
//     });
//   }, []);

//   useEffect(() => {
//     if (auction) hydrateEdit(auction);
//   }, [auction, hydrateEdit]);

//   const handleSaveEdit = async () => {
//     if (!auction) return;

//     const payload: AdminAuctionUpdateRequest = {
//       categoryId: editForm.categoryId ? Number(editForm.categoryId) : undefined,
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
//       auctionStatus: editForm.auctionStatus || undefined,
//     };

//     try {
//       const updated = await adminEditAuction(auction.id, payload);
//       setAuction(updated);
//       setIsEditing(false);
//       adminNotice.show("success", "Auction updated successfully.");
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while updating the auction. Please try again.";
//       adminNotice.show("error", msg);
//     }
//   };

//   // ------------------ See more dropdown (bids from rank #4 and below) ------------------
//   const [bidHistoryOpen, setBidHistoryOpen] = useState<boolean>(false);
//   useEffect(() => {
//     setBidHistoryOpen(false);
//   }, [auctionId]);

//   const imageStageHeight = isSingleColumn ? 320 : 420;

//   // ------------------ render ------------------
//   return (
//     <div
//       style={{
//         minHeight: variant === "page" ? "100vh" : "100%",
//         background: "#F6F8FB",
//         width: "100%",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//         overflowX: "hidden",
//       }}
//     >
//       <div
//         style={{
//           maxWidth: isModal ? "100%" : 1200,
//           width: "100%",
//           margin: "0 auto",
//           padding: isModal ? "12px" : "18px",
//           boxSizing: "border-box",
//           overflowX: "hidden",
//         }}
//       >
//         {variant === "page" && onBack && (
//           <div style={{ marginBottom: 12 }}>
//             <button
//               type="button"
//               onClick={onBack}
//               style={{
//                 height: 40,
//                 padding: "0 14px",
//                 borderRadius: 12,
//                 border: "1px solid rgba(17, 24, 39, 0.12)",
//                 background: "#FFFFFF",
//                 fontWeight: 900,
//                 cursor: "pointer",
//               }}
//             >
//               ← Back to all auctions
//             </button>
//           </div>
//         )}

//         {loading && <div style={{ padding: 18 }}>Φόρτωση...</div>}
//         {error && <div style={{ padding: 18, color: "#B91C1C" }}>Σφάλμα: {error}</div>}

//         {auction && !loading && !error && (
//           <>
//             {/* ✅ Chat card extracted (so we can render it in different place on mobile) */}
//             {(() => {
//               const chatCard = (
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: 16,
//                     boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                     overflow: "hidden",
//                     minWidth: 0,
//                   }}
//                 >
//                   <div
//                     style={{
//                       background: "#0B84F3",
//                       color: "white",
//                       padding: "12px 14px",
//                       fontWeight: 900,
//                       display: "flex",
//                       alignItems: "baseline",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <div>Auction Chat</div>
//                     <div style={{ fontWeight: 800, opacity: 0.9, fontSize: 13 }}>
//                       {auction.chat.length} messages
//                     </div>
//                   </div>

//                   <div style={{ padding: 12 }}>
//                     <div
//                       ref={chatScrollRef}
//                       style={{
//                         height: chatViewportHeight, // ✅ bigger height
//                         overflowY: "auto",
//                         paddingRight: 6,
//                       }}
//                     >
//                       {auction.chat.length === 0 ? (
//                         <div style={{ color: "#6B7280" }}>No messages yet.</div>
//                       ) : (
//                         <div style={{ display: "grid", gap: 12 }}>
//                           {auction.chat.map((m) => {
//                             const isAuctioneer =
//                               m.senderDisplayName === auction.sellerUsername;
//                             return (
//                               <div key={m.id} style={{ display: "grid", gap: 6 }}>
//                                 <div
//                                   style={{
//                                     color: "#6B7280",
//                                     fontWeight: 700,
//                                     fontSize: 12,
//                                   }}
//                                 >
//                                   {new Date(m.createdAt).toLocaleTimeString("en-US", {
//                                     hour: "numeric",
//                                     minute: "2-digit",
//                                   })}
//                                 </div>

//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     gap: 10,
//                                     alignItems: "flex-start",
//                                     minWidth: 0,
//                                   }}
//                                 >
//                                   <AvatarCircle
//                                     size={28}
//                                     name={m.senderDisplayName}
//                                     url={m.senderAvatarUrl ?? null}
//                                   />

//                                   <div
//                                     style={{
//                                       display: "grid",
//                                       gap: 6,
//                                       width: "100%",
//                                       minWidth: 0,
//                                     }}
//                                   >
//                                     <div
//                                       style={{
//                                         display: "flex",
//                                         gap: 10,
//                                         alignItems: "center",
//                                         minWidth: 0,
//                                       }}
//                                     >
//                                       <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                         {isAdmin ? (
//                                           <button
//                                             type="button"
//                                             onClick={() =>
//                                               handleOpenUserDetails(m.senderDisplayName)
//                                             }
//                                             style={{
//                                               background: "transparent",
//                                               border: "none",
//                                               padding: 0,
//                                               margin: 0,
//                                               cursor: "pointer",
//                                               fontWeight: 900,
//                                               color: "#111827",
//                                               textAlign: "left",
//                                               maxWidth: "100%",
//                                               whiteSpace: "nowrap",
//                                               overflow: "hidden",
//                                               textOverflow: "ellipsis",
//                                             }}
//                                             title={m.senderDisplayName}
//                                           >
//                                             {m.senderDisplayName}
//                                           </button>
//                                         ) : (
//                                           <div
//                                             style={{
//                                               maxWidth: "100%",
//                                               whiteSpace: "nowrap",
//                                               overflow: "hidden",
//                                               textOverflow: "ellipsis",
//                                             }}
//                                             title={m.senderDisplayName}
//                                           >
//                                             {m.senderDisplayName}
//                                           </div>
//                                         )}
//                                       </div>

//                                       {isAuctioneer && (
//                                         <div
//                                           style={{
//                                             fontSize: 12,
//                                             fontWeight: 800,
//                                             color: "#2563EB",
//                                             display: "flex",
//                                             gap: 6,
//                                             alignItems: "center",
//                                             flex: "0 0 auto",
//                                           }}
//                                         >
//                                           <span>✎</span>
//                                           <span>Auctioneer</span>
//                                         </div>
//                                       )}
//                                     </div>

//                                     <div
//                                       style={{
//                                         display: "inline-block",
//                                         background: isAuctioneer ? "#FEF3C7" : "#FFFFFF",
//                                         border: "1px solid #E5E7EB",
//                                         borderRadius: 14,
//                                         padding: "10px 12px",
//                                         maxWidth: "100%",
//                                         overflowWrap: "anywhere",
//                                         wordBreak: "break-word",
//                                       }}
//                                     >
//                                       {m.content}
//                                     </div>

//                                     {typeof m.remainingMessages === "number" && (
//                                       <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 12 }}>
//                                         Messages left: {m.remainingMessages}/25
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>

//                     {!isEnded && (
//                       <>
//                         <div
//                           style={{
//                             marginTop: 12,
//                             display: "grid",
//                             gridTemplateColumns: "minmax(0, 1fr) auto",
//                             gap: 10,
//                             alignItems: "center",
//                           }}
//                         >
//                           <input
//                             value={canChat ? newChatContent : ""}
//                             onChange={(e) => setNewChatContent(e.target.value)}
//                             disabled={!canChat}
//                             placeholder={
//                               canChat
//                                 ? "Write a message..."
//                                 : !isLoggedIn
//                                 ? "Sign in to chat..."
//                                 : chatBlockedReason ?? "Chat is not available."
//                             }
//                             style={{
//                               width: "100%",
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               outline: "none",
//                               background: canChat ? "white" : "#F9FAFB",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter" && !e.shiftKey && canChat) {
//                                 e.preventDefault();
//                                 void handleSendChat();
//                               }
//                             }}
//                           />

//                           {canChat ? (
//                             <button
//                               type="button"
//                               onClick={() => void handleSendChat()}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: 12,
//                                 border: "1px solid #111827",
//                                 background: "#111827",
//                                 color: "white",
//                                 fontWeight: 900,
//                                 cursor: "pointer",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               Send
//                             </button>
//                           ) : !isLoggedIn ? (
//                             <button
//                               type="button"
//                               onClick={() => onSignIn?.()}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: 12,
//                                 border: "1px solid #111827",
//                                 background: "#111827",
//                                 color: "white",
//                                 fontWeight: 900,
//                                 cursor: "pointer",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               Sign in to Chat
//                             </button>
//                           ) : null}
//                         </div>

//                         <NoticeInline notice={chatNotice.notice} onClose={chatNotice.clear} />

//                         {!canChat && !isLoggedIn && (
//                           <div style={{ marginTop: 8, color: "#6B7280", fontSize: 12, fontWeight: 700 }}>
//                             You need an account to chat
//                           </div>
//                         )}

//                         {!canChat && isLoggedIn && chatBlockedReason && (
//                           <div style={{ marginTop: 8, color: "#B91C1C", fontSize: 12, fontWeight: 800 }}>
//                             {chatBlockedReason}
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               );

//               return (
//                 <>
//                   <div
//                     style={{
//                       display: "grid",
//                       gridTemplateColumns: isSingleColumn
//                         ? "1fr"
//                         : "minmax(0, 1.65fr) minmax(0, 1fr)",
//                       gap: 18,
//                       alignItems: "start",
//                       width: "100%",
//                       maxWidth: "100%",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     {/* LEFT COLUMN */}
//                     <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
//                       {/* Image carousel card */}
//                       {images.length > 0 ? (
//                         <div
//                           style={{
//                             background: "white",
//                             borderRadius: 16,
//                             boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                             overflow: "hidden",
//                             minWidth: 0,
//                           }}
//                         >
//                           <div
//                             style={{
//                               position: "relative",
//                               height: imageStageHeight,
//                               background: "#F3F4F6",
//                               overflow: "hidden",
//                               zIndex: 0,
//                             }}
//                           >
//                             {mainImage ? (
//                               <img
//                                 src={mainImage}
//                                 alt="auction main"
//                                 style={{
//                                   width: "100%",
//                                   height: "100%",
//                                   objectFit: "contain",
//                                   objectPosition: "center",
//                                   cursor: "zoom-in",
//                                   background: "#F3F4F6",
//                                 }}
//                                 onClick={() => setFullscreenImageUrl(mainImage)}
//                                 onError={() => {
//                                   setBrokenImageByUrl((p) => ({ ...p, [mainImage]: true }));
//                                   setFullscreenImageUrl(null);
//                                 }}
//                               />
//                             ) : null}

//                             {auction.categoryName && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   top: 14,
//                                   right: 14,
//                                   background: "rgba(255,255,255,0.92)",
//                                   border: "1px solid rgba(229,231,235,0.9)",
//                                   borderRadius: 999,
//                                   padding: "6px 10px",
//                                   fontWeight: 700,
//                                   fontSize: 13,
//                                   zIndex: 2,
//                                   maxWidth: "calc(100% - 28px)",
//                                   whiteSpace: "nowrap",
//                                   overflow: "hidden",
//                                   textOverflow: "ellipsis",
//                                 }}
//                               >
//                                 {auction.categoryName}
//                               </div>
//                             )}

//                             {images.length > 0 && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   bottom: 14,
//                                   right: 14,
//                                   background: "rgba(17,24,39,0.75)",
//                                   color: "white",
//                                   borderRadius: 999,
//                                   padding: "8px 12px",
//                                   fontWeight: 800,
//                                   zIndex: 2,
//                                 }}
//                               >
//                                 {Math.min(selectedImageIdx + 1, images.length)}/{images.length}
//                               </div>
//                             )}

//                             {images.length > 1 && (
//                               <>
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     setSelectedImageIdx((i) => (i - 1 + images.length) % images.length)
//                                   }
//                                   style={{
//                                     position: "absolute",
//                                     left: 12,
//                                     top: "50%",
//                                     transform: "translateY(-50%)",
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 12,
//                                     border: "1px solid #E5E7EB",
//                                     background: "rgba(255,255,255,0.92)",
//                                     cursor: "pointer",
//                                     fontSize: 18,
//                                     fontWeight: 900,
//                                     zIndex: 2,
//                                   }}
//                                 >
//                                   ‹
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => setSelectedImageIdx((i) => (i + 1) % images.length)}
//                                   style={{
//                                     position: "absolute",
//                                     right: 12,
//                                     top: "50%",
//                                     transform: "translateY(-50%)",
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 12,
//                                     border: "1px solid #E5E7EB",
//                                     background: "rgba(255,255,255,0.92)",
//                                     cursor: "pointer",
//                                     fontSize: 18,
//                                     fontWeight: 900,
//                                     zIndex: 2,
//                                   }}
//                                 >
//                                   ›
//                                 </button>
//                               </>
//                             )}
//                           </div>

//                           {images.length > 1 && (
//                             <div
//                               style={{
//                                 borderTop: "1px solid #EEF2F7",
//                                 padding: 12,
//                                 display: "flex",
//                                 gap: 12,
//                                 overflowX: "auto",
//                                 WebkitOverflowScrolling: "touch",
//                                 background: "#FFFFFF",
//                                 position: "relative",
//                                 zIndex: 1,
//                               }}
//                             >
//                               {images.map((u, idx) => {
//                                 const active = idx === selectedImageIdx;
//                                 return (
//                                   <button
//                                     key={u + idx}
//                                     type="button"
//                                     onClick={() => setSelectedImageIdx(idx)}
//                                     style={{
//                                       flex: "0 0 auto",
//                                       width: 150,
//                                       height: 92,
//                                       borderRadius: 14,
//                                       border: active ? "3px solid #111827" : "1px solid #E5E7EB",
//                                       padding: 0,
//                                       overflow: "hidden",
//                                       cursor: "pointer",
//                                       background: "#F3F4F6",
//                                       boxSizing: "border-box",
//                                     }}
//                                   >
//                                     <img
//                                       src={u}
//                                       alt={`thumb ${idx + 1}`}
//                                       style={{
//                                         width: "100%",
//                                         height: "100%",
//                                         objectFit: "contain",
//                                         objectPosition: "center",
//                                         background: "#F3F4F6",
//                                       }}
//                                       onError={() => {
//                                         setBrokenImageByUrl((p) => ({ ...p, [u]: true }));
//                                       }}
//                                     />
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         // ✅ No image: μην εμφανίζεις το image box, μόνο μήνυμα
//                         <div
//                           style={{
//                             background: "white",
//                             borderRadius: 16,
//                             boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                             padding: 16,
//                             minWidth: 0,
//                             color: "#6B7280",
//                             fontWeight: 800,
//                           }}
//                         >
//                           Image is not available
//                         </div>
//                       )}

//                       {/* Seller information card */}
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div style={{ fontWeight: 800, color: "#111827", marginBottom: 10 }}>
//                           Seller Information
//                         </div>

//                         <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
//                           <AvatarCircle
//                             size={44}
//                             name={auction.sellerUsername}
//                             url={auction.sellerAvatarUrl ?? null}
//                           />

//                           <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
//                             <div style={{ fontWeight: 800, color: "#111827" }}>
//                               {isAdmin ? (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleOpenUserDetails(auction.sellerUsername)}
//                                   style={{
//                                     background: "transparent",
//                                     border: "none",
//                                     padding: 0,
//                                     margin: 0,
//                                     cursor: "pointer",
//                                     fontWeight: 800,
//                                     color: "#111827",
//                                     textAlign: "left",
//                                     maxWidth: "100%",
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                   }}
//                                   title={auction.sellerUsername}
//                                 >
//                                   {auction.sellerUsername}
//                                 </button>
//                               ) : (
//                                 <div
//                                   style={{
//                                     maxWidth: "100%",
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                   }}
//                                   title={auction.sellerUsername}
//                                 >
//                                   {auction.sellerUsername}
//                                 </div>
//                               )}
//                             </div>

//                             <div
//                               style={{
//                                 display: "flex",
//                                 gap: 6,
//                                 alignItems: "center",
//                                 color: "#6B7280",
//                                 minWidth: 0,
//                               }}
//                             >
//                               <span style={{ fontSize: 14 }}>
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                   <path d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
//                                   <circle cx="12" cy="11" r="2.5" stroke="currentColor" stroke-width="2"/>
//                                 </svg>
//                               </span>
//                               <span
//                                 style={{
//                                   whiteSpace: "nowrap",
//                                   overflow: "hidden",
//                                   textOverflow: "ellipsis",
//                                 }}
//                                 title={getCityFromLocation(auction.sellerLocation)}
//                               >
//                                 {getCityFromLocation(auction.sellerLocation)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Description card */}
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
//                           Description
//                         </div>

//                         <div
//                           style={{
//                             color: "#374151",
//                             lineHeight: 1.55,
//                             overflowWrap: "anywhere",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {auction.description || auction.shortDescription || "—"}
//                         </div>

//                         <div
//                           style={{
//                             marginTop: 14,
//                             paddingTop: 14,
//                             borderTop: "1px solid #EEF2F7",
//                             display: "grid",
//                             gridTemplateColumns: isSingleColumn
//                               ? "1fr"
//                               : "minmax(0, 1fr) minmax(0, 1fr)",
//                             gap: 12,
//                           }}
//                         >
//                           <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
//                                 Starting price
//                               </div>
//                               <div style={{ fontWeight: 900, color: "#111827" }}>
//                                 {formatMoneyEUR(auction.startingAmount)}
//                               </div>
//                             </div>
//                           </div>

//                           <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
//                                 Minimum raise
//                               </div>
//                               <div style={{ fontWeight: 900, color: "#111827" }}>
//                                 {formatMoneyEUR(auction.minBidIncrement)}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* ✅ Chat stays here ONLY on non-mobile */}
//                       {!isMobile && chatCard}
//                     </div>

//                     {/* RIGHT COLUMN */}
//                     <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div
//                           style={{
//                             fontSize: 18,
//                             fontWeight: 900,
//                             color: "#111827",
//                             overflowWrap: "anywhere",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {auction.title}
//                         </div>

//                         <div
//                           style={{
//                             marginTop: 12,
//                             padding: 14,
//                             borderRadius: 14,
//                             background: "#F9FAFB",
//                             border: "1px solid #EEF2F7",
//                           }}
//                         >
//                           <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                             <span style={{ fontSize: 18 }}>🕒</span>
//                             <div style={{ fontWeight: 800, color: "#374151" }}>
//                               Time Remaining
//                             </div>
//                           </div>
//                           <div
//                             style={{
//                               marginTop: 8,
//                               fontWeight: 900,
//                               color: timeBox.ended ? "#DC2626" : "#111827",
//                               overflowWrap: "anywhere",
//                               wordBreak: "break-word",
//                             }}
//                           >
//                             {timeBox.label}
//                           </div>
//                         </div>

//                         {!isEnded && (
//                           <div style={{ marginTop: 16 }}>
//                             <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                               Place Your Bid{" "}
//                               {minNextBid != null ? `(min ${formatMoneyEUR(minNextBid)})` : ""}
//                             </div>

//                             <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                               <div
//                                 style={{
//                                   flex: 1,
//                                   minWidth: 0,
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 8,
//                                   border: "1px solid #E5E7EB",
//                                   borderRadius: 12,
//                                   padding: "10px 12px",
//                                   background: canBid ? "white" : "#F9FAFB",
//                                   boxSizing: "border-box",
//                                 }}
//                               >
//                                 <span style={{ color: "#9CA3AF", fontWeight: 900 }}>€</span>
//                                 <input
//                                   type="number"
//                                   min={0}
//                                   step="1"
//                                   value={bidAmount}
//                                   onChange={(e) => setBidAmount(e.target.value)}
//                                   placeholder=""
//                                   disabled={!canBid}
//                                   style={{
//                                     width: "100%",
//                                     border: "none",
//                                     outline: "none",
//                                     background: "transparent",
//                                     fontSize: 14,
//                                     minWidth: 0,
//                                   }}
//                                 />
//                               </div>

//                               {canBid ? (
//                                 <button
//                                   type="button"
//                                   onClick={handleBid}
//                                   style={{
//                                     padding: "10px 14px",
//                                     borderRadius: 12,
//                                     border: "1px solid #111827",
//                                     background: "#111827",
//                                     color: "white",
//                                     fontWeight: 800,
//                                     cursor: "pointer",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   Place Bid
//                                 </button>
//                               ) : (
//                                 <button
//                                   type="button"
//                                   onClick={() => onSignIn?.()}
//                                   style={{
//                                     padding: "10px 14px",
//                                     borderRadius: 12,
//                                     border: "1px solid #111827",
//                                     background: "#111827",
//                                     color: "white",
//                                     fontWeight: 800,
//                                     cursor: "pointer",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   Sign in to Bid
//                                 </button>
//                               )}
//                             </div>

//                             <NoticeInline notice={bidNotice.notice} onClose={bidNotice.clear} />
//                           </div>
//                         )}

//                         {/* Bidder rankings (Top 3 only) */}
//                         <div style={{ marginTop: 16 }}>
//                           <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
//                             Bidder Rankings ({sortedBids.length})
//                           </div>

//                           {sortedBids.length === 0 ? (
//                             <div style={{ color: "#6B7280" }}>No bids yet.</div>
//                           ) : (
//                             <div style={{ display: "grid", gap: 10 }}>
//                               {sortedBids.slice(0, 3).map((b, idx) => {
//                                 const leading = idx === 0;
//                                 return (
//                                   <div
//                                     key={b.id}
//                                     style={{
//                                       borderRadius: 14,
//                                       border: leading
//                                         ? "2px solid rgba(59,130,246,0.5)"
//                                         : "1px solid #E5E7EB",
//                                       padding: 12,
//                                       display: "flex",
//                                       alignItems: "center",
//                                       justifyContent: "space-between",
//                                       gap: 12,
//                                       background: "white",
//                                       minWidth: 0,
//                                     }}
//                                   >
//                                     <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
//                                       <div
//                                         style={{
//                                           width: 44,
//                                           height: 44,
//                                           borderRadius: 999,
//                                           background: "#2563EB",
//                                           display: "grid",
//                                           placeItems: "center",
//                                           color: "white",
//                                           fontWeight: 900,
//                                           flex: "0 0 auto",
//                                         }}
//                                       >
//                                         #{idx + 1}
//                                       </div>

//                                       <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                                         <AvatarCircle
//                                           size={38}
//                                           name={b.bidderUsername}
//                                           url={b.bidderAvatarUrl ?? null}
//                                           ring={leading}
//                                         />
//                                         <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                                           <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                             {b.bidderUsername ? (
//                                               isAdmin ? (
//                                                 <button
//                                                   type="button"
//                                                   onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                                                   style={{
//                                                     background: "transparent",
//                                                     border: "none",
//                                                     padding: 0,
//                                                     margin: 0,
//                                                     cursor: "pointer",
//                                                     fontWeight: 900,
//                                                     color: "#111827",
//                                                     textAlign: "left",
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </button>
//                                               ) : (
//                                                 <div
//                                                   style={{
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </div>
//                                               )
//                                             ) : (
//                                               "Unknown"
//                                             )}
//                                           </div>
//                                           <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                                             {timeAgo(b.createdAt, now)}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>

//                                     <div style={{ textAlign: "right", flex: "0 0 auto" }}>
//                                       <div style={{ color: "#2563EB", fontWeight: 900 }}>
//                                         {formatMoneyEUR(b.amount)}
//                                       </div>
//                                       {leading && (
//                                         <div style={{ color: "#2563EB", fontWeight: 800, fontSize: 13 }}>
//                                           Leading
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           )}

//                           {sortedBids.length > 3 && (
//                             <div style={{ marginTop: 12 }}>
//                               <button
//                                 type="button"
//                                 onClick={() => setBidHistoryOpen((v) => !v)}
//                                 style={{
//                                   width: "100%",
//                                   border: "1px solid rgba(17,24,39,0.14)",
//                                   background: "#FFFFFF",
//                                   borderRadius: 12,
//                                   padding: "10px 12px",
//                                   fontWeight: 900,
//                                   cursor: "pointer",
//                                   fontSize: 13,
//                                 }}
//                               >
//                                 {bidHistoryOpen ? "Hide" : "See more"}
//                               </button>
//                             </div>
//                           )}

//                           {bidHistoryOpen && sortedBids.length > 3 && (
//                             <div
//                               style={{
//                                 marginTop: 12,
//                                 borderRadius: 16,
//                                 border: "1px solid #E5E7EB",
//                                 overflow: "hidden",
//                                 background: "#FFFFFF",
//                                 minWidth: 0,
//                               }}
//                             >
//                               <div
//                                 style={{
//                                   padding: "10px 12px",
//                                   borderBottom: "1px solid #EEF2F7",
//                                   display: "flex",
//                                   justifyContent: "space-between",
//                                   alignItems: "baseline",
//                                   gap: 10,
//                                 }}
//                               >
//                                 <div style={{ fontWeight: 950, color: "#111827" }}>More bids</div>
//                                 <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                                   Scroll to view
//                                 </div>
//                               </div>

//                               <div
//                                 style={{
//                                   maxHeight: 260,
//                                   overflowY: "auto",
//                                   padding: 12,
//                                   display: "grid",
//                                   gap: 10,
//                                   background: "#F9FAFB",
//                                 }}
//                               >
//                                 {sortedBids.slice(3).map((b) => {
//                                   return (
//                                     <div
//                                       key={`more-${b.id}`}
//                                       style={{
//                                         borderRadius: 14,
//                                         border: "1px solid #E5E7EB",
//                                         background: "#FFFFFF",
//                                         padding: 12,
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         alignItems: "center",
//                                         gap: 12,
//                                         minWidth: 0,
//                                       }}
//                                     >
//                                       <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                                         <AvatarCircle size={38} name={b.bidderUsername} url={b.bidderAvatarUrl ?? null} />
//                                         <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                                           <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                             {b.bidderUsername ? (
//                                               isAdmin ? (
//                                                 <button
//                                                   type="button"
//                                                   onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                                                   style={{
//                                                     background: "transparent",
//                                                     border: "none",
//                                                     padding: 0,
//                                                     margin: 0,
//                                                     cursor: "pointer",
//                                                     fontWeight: 900,
//                                                     color: "#111827",
//                                                     textAlign: "left",
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </button>
//                                               ) : (
//                                                 <div
//                                                   style={{
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </div>
//                                               )
//                                             ) : (
//                                               "Unknown"
//                                             )}
//                                           </div>

//                                           <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                                             {timeAgo(b.createdAt, now)}
//                                           </div>
//                                         </div>
//                                       </div>

//                                       <div style={{ textAlign: "right", flex: "0 0 auto" }}>
//                                         <div style={{ color: "#2563EB", fontWeight: 950 }}>
//                                           {formatMoneyEUR(b.amount)}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ✅ On mobile: chat goes to the END of the page (after title/time/bids) */}
//                   {isMobile && <div style={{ marginTop: 14 }}>{chatCard}</div>}
//                 </>
//               );
//             })()}

//             {/* ADMIN block */}
//             {isAdmin && (
//               <div style={{ marginTop: 18 }}>
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: 16,
//                     boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                     padding: 16,
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                     overflowX: "hidden",
//                   }}
//                 >
//                   <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
//                     <div style={{ fontWeight: 900, color: "#111827" }}>Admin: Edit auction</div>
//                     {!isEditing ? (
//                       <button
//                         type="button"
//                         onClick={() => setIsEditing(true)}
//                         style={{
//                           padding: "8px 12px",
//                           borderRadius: 12,
//                           border: "1px solid #E5E7EB",
//                           background: "white",
//                           cursor: "pointer",
//                           fontWeight: 800,
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         Open editor
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           if (auction) hydrateEdit(auction);
//                           setIsEditing(false);
//                         }}
//                         style={{
//                           padding: "8px 12px",
//                           borderRadius: 12,
//                           border: "1px solid #E5E7EB",
//                           background: "white",
//                           cursor: "pointer",
//                           fontWeight: 800,
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         Close
//                       </button>
//                     )}
//                   </div>

//                   <NoticeInline notice={adminNotice.notice} onClose={adminNotice.clear} />

//                   {isEditing && (
//                     <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Title
//                           <input
//                             value={editForm.title}
//                             onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Category ID (optional)
//                           <input
//                             value={editForm.categoryId}
//                             onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                         Short description
//                         <input
//                           value={editForm.shortDescription}
//                           onChange={(e) => setEditForm((p) => ({ ...p, shortDescription: e.target.value }))}
//                           style={{
//                             border: "1px solid #E5E7EB",
//                             borderRadius: 12,
//                             padding: "10px 12px",
//                             minWidth: 0,
//                             boxSizing: "border-box",
//                           }}
//                         />
//                       </label>

//                       <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                         Full description
//                         <textarea
//                           value={editForm.description}
//                           onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
//                           rows={4}
//                           style={{
//                             border: "1px solid #E5E7EB",
//                             borderRadius: 12,
//                             padding: "10px 12px",
//                             resize: "vertical",
//                             minWidth: 0,
//                             boxSizing: "border-box",
//                           }}
//                         />
//                       </label>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Starting amount
//                           <input
//                             value={editForm.startingAmount}
//                             onChange={(e) => setEditForm((p) => ({ ...p, startingAmount: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Min bid increment
//                           <input
//                             value={editForm.minBidIncrement}
//                             onChange={(e) => setEditForm((p) => ({ ...p, minBidIncrement: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Start date
//                           <input
//                             value={editForm.startDate}
//                             onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
//                             type="datetime-local"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           End date
//                           <input
//                             value={editForm.endDate}
//                             onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
//                             type="datetime-local"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Shipping cost payer
//                           <select
//                             value={editForm.shippingCostPayer}
//                             onChange={(e) =>
//                               setEditForm((p) => ({
//                                 ...p,
//                                 shippingCostPayer: e.target.value as ShippingCostPayer,
//                               }))
//                             }
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               background: "white",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           >
//                             <option value="SELLER">SELLER</option>
//                             <option value="BUYER">BUYER</option>
//                             <option value="SPLIT">SPLIT</option>
//                           </select>
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Status
//                           <select
//                             value={editForm.auctionStatus || ""}
//                             onChange={(e) =>
//                               setEditForm((p) => ({
//                                 ...p,
//                                 auctionStatus: e.target.value as AuctionStatus | "",
//                               }))
//                             }
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               background: "white",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           >
//                             <option value="">(no change)</option>
//                             <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
//                             <option value="ACTIVE">ACTIVE</option>
//                             <option value="EXPIRED">EXPIRED</option>
//                             <option value="CANCELLED">CANCELLED</option>
//                           </select>
//                         </label>
//                       </div>

//                       <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             if (auction) hydrateEdit(auction);
//                             setIsEditing(false);
//                           }}
//                           style={{
//                             padding: "10px 14px",
//                             borderRadius: 12,
//                             border: "1px solid #E5E7EB",
//                             background: "white",
//                             cursor: "pointer",
//                             fontWeight: 800,
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => void handleSaveEdit()}
//                           style={{
//                             padding: "10px 14px",
//                             borderRadius: 12,
//                             border: "1px solid #111827",
//                             background: "#111827",
//                             color: "white",
//                             cursor: "pointer",
//                             fontWeight: 900,
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           Save changes
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Fullscreen overlay */}
//       {fullscreenImageUrl && (
//         <div
//           onClick={() => setFullscreenImageUrl(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.82)",
//             display: "grid",
//             placeItems: "center",
//             zIndex: 9999,
//             cursor: "zoom-out",
//             padding: 16,
//           }}
//         >
//           <img
//             src={fullscreenImageUrl}
//             alt="fullscreen"
//             style={{
//               maxWidth: "92vw",
//               maxHeight: "92vh",
//               borderRadius: 14,
//               boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
//               background: "white",
//             }}
//             onError={() => {
//               setBrokenImageByUrl((p) => ({ ...p, [fullscreenImageUrl]: true }));
//               setFullscreenImageUrl(null);
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuctionDetailsPage;


// // AuctionDetailsPage.tsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";
// import type { IMessage, IStompSocket, StompSubscription } from "@stomp/stompjs";

// import { getAuctionById } from "../api/Springboot/backendAuctionService";
// import { placeBid } from "../api/Springboot/BackendBidService";
// import { sendChatMessage } from "../api/Springboot/backendChatService";
// import { adminEditAuction } from "../api/admin/backendAdminAuctionService";

// import type {
//   AdminAuctionUpdateRequest,
//   AuctionDetails,
//   AuctionStatus,
//   ShippingCostPayer,
// } from "../models/Springboot/Auction";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// interface AuctionDetailsPageProps {
//   auctionId: number;
//   onBack?: () => void;
//   currentUser: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;

//   onSignIn?: () => void;
//   onSignUp?: () => void;

//   onBidUpdate?: (u: {
//     auctionId: number;
//     amount: number;
//     bidderUsername: string;
//     newEndDate: string;
//   }) => void;

//   onAuctionLoaded?: (a: AuctionDetails) => void;

//   variant?: "page" | "modal";
// }

// // ✅ WebSocket DTO (updated: bidderAvatarUrl)
// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
//   bidderAvatarUrl?: string | null;
// }

// interface ChatMessageDto {
//   id: number;
//   senderDisplayName: string;
//   senderAvatarUrl?: string | null;
//   senderFirebaseId: string;
//   content: string;
//   createdAt: string;
//   remainingMessages?: number;
// }

// const DEFAULT_AVATAR_FALLBACK =
//   "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%25' height='100%25' rx='999' fill='%23E5E7EB'/%3E%3Cpath d='M32 34c6 0 11-5 11-11S38 12 32 12s-11 5-11 11 5 11 11 11zm0 6c-10 0-18 6-18 14h36c0-8-8-14-18-14z' fill='%239CA3AF'/%3E%3C/svg%3E";

// function formatMoneyEUR(value: number): string {
//   try {
//     return new Intl.NumberFormat("el-GR", {
//       style: "currency",
//       currency: "EUR",
//       maximumFractionDigits: 0,
//     }).format(value);
//   } catch {
//     return `${value}€`;
//   }
// }

// function timeAgo(iso: string, now: Date): string {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return "";
//   const diffMs = now.getTime() - d.getTime();
//   const s = Math.max(0, Math.floor(diffMs / 1000));
//   const m = Math.floor(s / 60);
//   const h = Math.floor(m / 60);
//   const day = Math.floor(h / 24);

//   if (day > 0) return `${day}d ago`;
//   if (h > 0) return `${h}h ago`;
//   if (m > 0) return `${m}m ago`;
//   return `${s}s ago`;
// }

// function formatTimeRemaining(
//   endIso: string,
//   now: Date
// ): { label: string; ended: boolean } {
//   const end = new Date(endIso);
//   if (Number.isNaN(end.getTime())) return { label: endIso, ended: false };
//   const diff = end.getTime() - now.getTime();
//   if (diff <= 0) return { label: "Ended", ended: true };

//   let total = Math.floor(diff / 1000);
//   const days = Math.floor(total / (24 * 3600));
//   total -= days * 24 * 3600;
//   const hours = Math.floor(total / 3600);
//   total -= hours * 3600;
//   const minutes = Math.floor(total / 60);
//   const seconds = total - minutes * 60;

//   if (days > 0)
//     return {
//       label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
//       ended: false,
//     };
//   if (hours > 0) return { label: `${hours}h ${minutes}m ${seconds}s`, ended: false };
//   if (minutes > 0) return { label: `${minutes}m ${seconds}s`, ended: false };
//   return { label: `${seconds}s`, ended: false };
// }

// function toDateTimeLocal(value: string | null | undefined): string {
//   if (!value) return "";
//   return value.length >= 16 ? value.slice(0, 16) : value;
// }

// type NoticeType = "success" | "error";
// type NoticeState = { type: NoticeType; text: string } | null;

// function useAutoDismissNotice(timeoutMs = 4200) {
//   const [notice, setNotice] = useState<NoticeState>(null);
//   const timerRef = useRef<number | null>(null);

//   const clear = useCallback(() => {
//     if (timerRef.current != null) {
//       window.clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }
//     setNotice(null);
//   }, []);

//   const show = useCallback(
//     (type: NoticeType, text: string) => {
//       setNotice({ type, text });
//       if (timerRef.current != null) window.clearTimeout(timerRef.current);
//       timerRef.current = window.setTimeout(() => {
//         setNotice(null);
//         timerRef.current = null;
//       }, timeoutMs);
//     },
//     [timeoutMs]
//   );

//   useEffect(() => {
//     return () => {
//       if (timerRef.current != null) window.clearTimeout(timerRef.current);
//     };
//   }, []);

//   return { notice, show, clear };
// }

// const NoticeInline: React.FC<{
//   notice: NoticeState;
//   onClose: () => void;
// }> = ({ notice, onClose }) => {
//   if (!notice) return null;

//   const isErr = notice.type === "error";
//   return (
//     <div
//       style={{
//         marginTop: 10,
//         borderRadius: 12,
//         border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
//         background: isErr ? "#FEF2F2" : "#F0FDF4",
//         color: isErr ? "#991B1B" : "#166534",
//         padding: "10px 12px",
//         fontWeight: 800,
//         fontSize: 13,
//         display: "flex",
//         alignItems: "flex-start",
//         justifyContent: "space-between",
//         gap: 10,
//       }}
//       role="status"
//       aria-live="polite"
//     >
//       <div style={{ lineHeight: 1.35 }}>{notice.text}</div>

//       <button
//         type="button"
//         onClick={onClose}
//         aria-label="Close message"
//         style={{
//           flex: "0 0 auto",
//           width: 30,
//           height: 30,
//           padding: 0,
//           borderRadius: 10,
//           border: "1px solid rgba(17,24,39,0.12)",
//           background: "rgba(255,255,255,0.75)",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontWeight: 950,
//           fontSize: 16,
//           lineHeight: 1,
//         }}
//         title="Close"
//       >
//         <span style={{ display: "block", transform: "translateY(-0.5px)" }}>
//           ✕
//         </span>
//       </button>
//     </div>
//   );
// };

// /* =========================================================
//    ✅ ΜΟΝΗ ΑΛΛΑΓΗ: AvatarCircle έξω από το component + React.memo
//    ========================================================= */
// const AvatarCircle = React.memo(
//   ({
//     size,
//     name,
//     url,
//     ring,
//   }: {
//     size: number;
//     name?: string;
//     url?: string | null;
//     ring?: boolean;
//   }) => {
//     const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
//     return (
//       <div
//         style={{
//           width: size,
//           height: size,
//           borderRadius: 999,
//           overflow: "hidden",
//           flex: "0 0 auto",
//           boxShadow: ring ? "0 0 0 3px rgba(59,130,246,0.25)" : undefined,
//           background: "#EEF2FF",
//           display: "grid",
//           placeItems: "center",
//         }}
//       >
//         {url ? (
//           <img
//             src={url}
//             alt={name ?? "avatar"}
//             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             onError={(e) => {
//               (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
//             }}
//           />
//         ) : (
//           <span style={{ fontWeight: 800, color: "#4F46E5" }}>{initial}</span>
//         )}
//       </div>
//     );
//   }
// );
// AvatarCircle.displayName = "AvatarCircle";
// /* ========================================================= */

// const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
//   auctionId,
//   onBack,
//   currentUser,
//   onOpenUserDetailsAsAdmin,
//   onSignIn,
//   onBidUpdate,
//   onAuctionLoaded,
//   variant = "page",
// }) => {
//   const [auction, setAuction] = useState<AuctionDetails | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [now, setNow] = useState<Date>(new Date());

//   // ✅ responsive (για να μην δημιουργείται horizontal scroll σε modal / στενά πλάτη)
//   const [vw, setVw] = useState<number>(() =>
//     typeof window !== "undefined" ? window.innerWidth : 1200
//   );
//   useEffect(() => {
//     const onResize = () => setVw(window.innerWidth);
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

  

//   const isModal = variant === "modal";
//   const isSingleColumn = isModal || vw < 980;

//   // ✅ αυτό είναι “phone” breakpoint (για να πάει το chat στο τέλος)
//   const isMobile = vw <= 640;

//   const chatViewportHeight = isModal ? 260 : isMobile ? 380 : 320;

//   // ✅ stable refs για callbacks
//   const onAuctionLoadedRef =
//     useRef<AuctionDetailsPageProps["onAuctionLoaded"]>(onAuctionLoaded);
//   const onBidUpdateRef =
//     useRef<AuctionDetailsPageProps["onBidUpdate"]>(onBidUpdate);

//   useEffect(() => {
//     onAuctionLoadedRef.current = onAuctionLoaded;
//   }, [onAuctionLoaded]);

//   useEffect(() => {
//     onBidUpdateRef.current = onBidUpdate;
//   }, [onBidUpdate]);

//   // images
//   const [selectedImageIdx, setSelectedImageIdx] = useState(0);
//   const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
//     null
//   );

//   // ✅ track broken images (Cloudflare expiry etc.)
//   const [brokenImageByUrl, setBrokenImageByUrl] = useState<Record<string, boolean>>({});

//   // bid/chat
//   const [bidAmount, setBidAmount] = useState<string>("");
//   const [newChatContent, setNewChatContent] = useState<string>("");

//   // ✅ inline messages (auto-hide + manual close)
//   const bidNotice = useAutoDismissNotice(4200);
//   const chatNotice = useAutoDismissNotice(4200);
//   const adminNotice = useAutoDismissNotice(4200);

//   // ------------------ Chat auto-scroll (default to bottom) ------------------
//   const chatScrollRef = useRef<HTMLDivElement | null>(null);
//   const didInitialChatScrollRef = useRef<boolean>(false);

//   const scrollChatToBottom = useCallback(() => {
//     const el = chatScrollRef.current;
//     if (!el) return;
//     el.scrollTop = el.scrollHeight;
//   }, []);

//   // ws
//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const bidSubRef = useRef<StompSubscription | null>(null);
//   const chatSubRef = useRef<StompSubscription | null>(null);

//   const isAdmin = currentUser?.roleName === "Admin";

//   const handleOpenUserDetails = useCallback(
//     (username: string) => {
//       if (!isAdmin) return;
//       if (!onOpenUserDetailsAsAdmin) return;
//       onOpenUserDetailsAsAdmin(username);
//     },
//     [isAdmin, onOpenUserDetailsAsAdmin]
//   );

//   // ✅ optimistic unlock for chat after successful bid (no "locked" feeling)
//   const [chatUnlockedOptimistic, setChatUnlockedOptimistic] = useState(false);

//   // timers / esc
//   useEffect(() => {
//     const t = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(t);
//   }, []);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setFullscreenImageUrl(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   // clear notices on auction change
//   useEffect(() => {
//     bidNotice.clear();
//     chatNotice.clear();
//     adminNotice.clear();
//     setBidAmount("");
//     setNewChatContent("");
//     didInitialChatScrollRef.current = false; // ✅ reset initial scroll per auction

//     // ✅ reset broken image tracking per auction
//     setBrokenImageByUrl({});

//     // ✅ reset optimistic unlock per auction
//     setChatUnlockedOptimistic(false);
//   }, [auctionId, bidNotice.clear, chatNotice.clear, adminNotice.clear]);

//   // load auction
//   const loadAuction = useCallback(async () => {
//     setError(null);
//     setLoading(true);
//     setAuction(null);

//     try {
//       const res = await getAuctionById(auctionId);
//       setAuction(res);
//       onAuctionLoadedRef.current?.(res);
//       setSelectedImageIdx(0);
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while loading this auction. Please try again.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   }, [auctionId]);

//   useEffect(() => {
//     void loadAuction();
//   }, [loadAuction]);

//   // STOMP connect once
//   useEffect(() => {
//     const socket = new SockJS("/ws");
//     const client = new Client({
//       webSocketFactory: () => socket as unknown as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {},
//     });

//     client.onConnect = () => setStompClient(client);
//     client.onStompError = (frame) => {
//       // eslint-disable-next-line no-console
//       console.error(
//         "STOMP error (details):",
//         frame.headers["message"],
//         frame.body
//       );
//     };

//     client.activate();

//     return () => {
//       if (bidSubRef.current) {
//         bidSubRef.current.unsubscribe();
//         bidSubRef.current = null;
//       }
//       if (chatSubRef.current) {
//         chatSubRef.current.unsubscribe();
//         chatSubRef.current = null;
//       }
//       client.deactivate();
//     };
//   }, []);

//   // Subscribe bids/chat
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected) return;

//     if (bidSubRef.current) {
//       bidSubRef.current.unsubscribe();
//       bidSubRef.current = null;
//     }
//     if (chatSubRef.current) {
//       chatSubRef.current.unsubscribe();
//       chatSubRef.current = null;
//     }

//     const bidTopic = `/topic/auctions/${auctionId}`;
//     const bidSub = stompClient.subscribe(bidTopic, (message: IMessage) => {
//       try {
//         const payload: BidEventDto = JSON.parse(message.body);

//         onBidUpdateRef.current?.({
//           auctionId: payload.auctionId,
//           amount: payload.amount,
//           bidderUsername: payload.bidderUsername,
//           newEndDate: payload.newEndDate,
//         });

//         setAuction((prev) => {
//           if (!prev || prev.id !== payload.auctionId) return prev;

//           const newBid = {
//             id: payload.id,
//             amount: payload.amount,
//             bidderUsername: payload.bidderUsername,
//             createdAt: payload.createdAt,
//             auctionId: payload.auctionId,
//             bidderAvatarUrl: payload.bidderAvatarUrl ?? null,
//           };

//           const already = prev.bids.some((b) => b.id === newBid.id);
//           const bids = already ? prev.bids : [newBid, ...prev.bids];

//           // ✅ if you have a bid, you can chat (optimistic UX)
//           // (safe: it only affects UI; backend still enforces eligibility)
//           return {
//             ...prev,
//             endDate: payload.newEndDate,
//             bids,
//             eligibleForChat: true,
//           };
//         });

//         // ✅ ensure chat unlock even if auction isn't updated yet
//         setChatUnlockedOptimistic(true);
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("Failed to parse BidEventDto", err);
//       }
//     });
//     bidSubRef.current = bidSub;

//     const chatTopic = `/topic/auctions/${auctionId}/chat`;
//     const chatSub = stompClient.subscribe(chatTopic, (message: IMessage) => {
//       try {
//         const payload: ChatMessageDto = JSON.parse(message.body);
//         setAuction((prev) => {
//           if (!prev || prev.id !== auctionId) return prev;
//           const exists = prev.chat.some((m) => m.id === payload.id);
//           if (exists) return prev;
//           return { ...prev, chat: [...prev.chat, payload] };
//         });
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("Failed to parse ChatMessageDto", err);
//       }
//     });
//     chatSubRef.current = chatSub;

//     return () => {
//       bidSub.unsubscribe();
//       chatSub.unsubscribe();
//       if (bidSubRef.current === bidSub) bidSubRef.current = null;
//       if (chatSubRef.current === chatSub) chatSubRef.current = null;
//     };
//   }, [stompClient, auctionId]);

//   // auto-scroll first load chat (once per auction)
//   useEffect(() => {
//     if (!auction) return;
//     if (didInitialChatScrollRef.current) return;

//     window.setTimeout(() => {
//       scrollChatToBottom();
//       didInitialChatScrollRef.current = true;
//     }, 0);
//   }, [auction, scrollChatToBottom]);

//   // auto-scroll on new messages ONLY if user is near bottom
//   useEffect(() => {
//     if (!auction) return;
//     const el = chatScrollRef.current;
//     if (!el) return;

//     const threshold = 90; // px
//     const distanceFromBottom =
//       el.scrollHeight - (el.scrollTop + el.clientHeight);

//     if (distanceFromBottom <= threshold) {
//       window.setTimeout(() => scrollChatToBottom(), 0);
//     }
//   }, [auction?.chat.length, auction, scrollChatToBottom]);

//   // derived
//   const allImages = auction?.imageUrls ?? [];
//   const images = useMemo(
//     () => allImages.filter((u) => !!u && !brokenImageByUrl[u]),
//     [allImages, brokenImageByUrl]
//   );

//   useEffect(() => {
//     if (selectedImageIdx >= images.length && images.length > 0) {
//       setSelectedImageIdx(0);
//     }
//     if (images.length === 0) {
//       setSelectedImageIdx(0);
//       setFullscreenImageUrl(null);
//     }
//   }, [images.length, selectedImageIdx]);

//   const mainImage =
//     images.length > 0
//       ? images[Math.min(selectedImageIdx, images.length - 1)]
//       : null;

//   const timeBox = useMemo(() => {
//     if (!auction) return { label: "", ended: false };
//     return formatTimeRemaining(auction.endDate, now);
//   }, [auction, now]);

//   const isActive = useMemo(() => {
//     if (!auction) return false;
//     const end = new Date(auction.endDate);
//     if (Number.isNaN(end.getTime())) return false;
//     return end.getTime() - now.getTime() > 0;
//   }, [auction, now]);

//   const canBid = !!auction && auction.eligibleForBid && isActive;

//   const isLoggedIn = !!currentUser;

//   // ✅ effective eligibility for chat (backend flag OR optimistic unlock)
//   const effectiveEligibleForChat = useMemo(() => {
//     if (!auction) return false;
//     return auction.eligibleForChat || chatUnlockedOptimistic;
//   }, [auction, chatUnlockedOptimistic]);

//   const canChat = !!auction && isLoggedIn && effectiveEligibleForChat && isActive;

//   const chatBlockedReason = useMemo(() => {
//     if (!auction) return null;
//     if (!isActive) return "Chat is closed because the auction has ended.";
//     if (!isLoggedIn) return null;
//     if (!effectiveEligibleForChat)
//       return "Place a bid to unlock the chat for this auction.";
//     return null;
//   }, [auction, isActive, isLoggedIn, effectiveEligibleForChat]);

//   const isEnded = useMemo(() => {
//     if (!auction) return false;
//     if (auction.status === "EXPIRED" || auction.status === "CANCELLED")
//       return true;
//     return timeBox.ended;
//   }, [auction, timeBox.ended]);

//   type BidItem = AuctionDetails["bids"][number] & { bidderAvatarUrl?: string | null };

//   const sortedBids: BidItem[] = useMemo(() => {
//     if (!auction) return [];
//     const copy = [...(auction.bids as BidItem[])];
//     copy.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
//     return copy;
//   }, [auction]);

//   const currentTopBid = sortedBids.length > 0 ? sortedBids[0].amount : null;

//   const minNextBid = useMemo(() => {
//     if (!auction) return null;
//     const base = currentTopBid ?? auction.startingAmount;
//     return (base ?? 0) + (auction.minBidIncrement ?? 0);
//   }, [auction, currentTopBid]);

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   // actions
//   const handleBid = async () => {
//     if (!auction) return;

//     const raw = bidAmount.trim();
//     if (!raw) {
//       bidNotice.show("error", "Please enter a bid amount.");
//       return;
//     }

//     const amount = Number(raw);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       bidNotice.show("error", "Please enter a valid amount.");
//       return;
//     }

//     try {
//       await placeBid(auction.id, amount);

//       // ✅ Optimistic unlock chat ONLY on success (no unlock on backend error)
//       setChatUnlockedOptimistic(true);
//       setAuction((prev) => (prev ? { ...prev, eligibleForChat: true } : prev));

//       bidNotice.show("success", "Your bid was placed successfully!");
//       setBidAmount("");

//       // ❌ Fix 1: do not reload the entire auction (avoids "refresh" feeling)
//       // await loadAuction();
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error ? e.message : "Something went wrong while placing your bid. Please try again.";
//       bidNotice.show("error", msg);
//     }
//   };

//   const handleSendChat = async () => {
//     if (!auction) return;
//     const text = newChatContent.trim();
//     if (!text) {
//       chatNotice.show("error", "Your message can't be empty.");
//       return;
//     }

//     try {
//       await sendChatMessage(auction.id, text);
//       setNewChatContent("");

//       // ✅ Force scroll to bottom after sending (so user sees their message)
//       window.setTimeout(() => {
//         scrollChatToBottom();
//       }, 0);

//       // (προαιρετικό) success message:
//       // chatNotice.show("success", "Το μήνυμα στάλθηκε.");
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while sending your message. Please try again.";
//       chatNotice.show("error", msg);
//     }
//   };

//   // ------------------ ADMIN edit ------------------
//   const [isEditing, setIsEditing] = useState(false);
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

//   const hydrateEdit = useCallback((a: AuctionDetails) => {
//     setEditForm({
//       categoryId: "",
//       title: a.title ?? "",
//       shortDescription: a.shortDescription ?? "",
//       description: a.description ?? "",
//       startingAmount: a.startingAmount?.toString() ?? "",
//       minBidIncrement: a.minBidIncrement?.toString() ?? "",
//       startDate: toDateTimeLocal(a.startDate),
//       endDate: toDateTimeLocal(a.endDate),
//       shippingCostPayer: a.shippingCostPayer,
//       auctionStatus: a.status as AuctionStatus,
//     });
//   }, []);

//   useEffect(() => {
//     if (auction) hydrateEdit(auction);
//   }, [auction, hydrateEdit]);

//   const handleSaveEdit = async () => {
//     if (!auction) return;

//     const payload: AdminAuctionUpdateRequest = {
//       categoryId: editForm.categoryId ? Number(editForm.categoryId) : undefined,
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
//       auctionStatus: editForm.auctionStatus || undefined,
//     };

//     try {
//       const updated = await adminEditAuction(auction.id, payload);
//       setAuction(updated);
//       setIsEditing(false);
//       adminNotice.show("success", "Auction updated successfully.");
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while updating the auction. Please try again.";
//       adminNotice.show("error", msg);
//     }
//   };

//   // ------------------ See more dropdown (bids from rank #4 and below) ------------------
//   const [bidHistoryOpen, setBidHistoryOpen] = useState<boolean>(false);
//   useEffect(() => {
//     setBidHistoryOpen(false);
//   }, [auctionId]);

//   const imageStageHeight = isSingleColumn ? 320 : 420;

//   // ------------------ render ------------------
//   return (
//     <div
//       style={{
//         minHeight: variant === "page" ? "100vh" : "100%",
//         background: "#F6F8FB",
//         width: "100%",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//         overflowX: "hidden",
//       }}
//     >
//       <div
//         style={{
//           maxWidth: isModal ? "100%" : 1200,
//           width: "100%",
//           margin: "0 auto",
//           padding: isModal ? "12px" : "18px",
//           boxSizing: "border-box",
//           overflowX: "hidden",
//         }}
//       >
//         {variant === "page" && onBack && (
//           <div style={{ marginBottom: 12 }}>
//             <button
//               type="button"
//               onClick={onBack}
//               style={{
//                 height: 40,
//                 padding: "0 14px",
//                 borderRadius: 12,
//                 border: "1px solid rgba(17, 24, 39, 0.12)",
//                 background: "#FFFFFF",
//                 fontWeight: 900,
//                 cursor: "pointer",
//               }}
//             >
//               ← Back to all auctions
//             </button>
//           </div>
//         )}

//         {loading && <div style={{ padding: 18 }}>Φόρτωση...</div>}
//         {error && <div style={{ padding: 18, color: "#B91C1C" }}>Σφάλμα: {error}</div>}

//         {auction && !loading && !error && (
//           <>
//             {/* ✅ Chat card extracted (so we can render it in different place on mobile) */}
//             {(() => {
//               const chatCard = (
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: 16,
//                     boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                     overflow: "hidden",
//                     minWidth: 0,
//                   }}
//                 >
//                   <div
//                     style={{
//                       background: "#0B84F3",
//                       color: "white",
//                       padding: "12px 14px",
//                       fontWeight: 900,
//                       display: "flex",
//                       alignItems: "baseline",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <div>Auction Chat</div>
//                     <div style={{ fontWeight: 800, opacity: 0.9, fontSize: 13 }}>
//                       {auction.chat.length} messages
//                     </div>
//                   </div>

//                   <div style={{ padding: 12 }}>
//                     <div
//                       ref={chatScrollRef}
//                       style={{
//                         height: chatViewportHeight, // ✅ bigger height
//                         overflowY: "auto",
//                         paddingRight: 6,
//                       }}
//                     >
//                       {auction.chat.length === 0 ? (
//                         <div style={{ color: "#6B7280" }}>No messages yet.</div>
//                       ) : (
//                         <div style={{ display: "grid", gap: 12 }}>
//                           {auction.chat.map((m) => {
//                             const isAuctioneer =
//                               m.senderDisplayName === auction.sellerUsername;
//                             return (
//                               <div key={m.id} style={{ display: "grid", gap: 6 }}>
//                                 <div
//                                   style={{
//                                     color: "#6B7280",
//                                     fontWeight: 700,
//                                     fontSize: 12,
//                                   }}
//                                 >
//                                   {new Date(m.createdAt).toLocaleTimeString("en-US", {
//                                     hour: "numeric",
//                                     minute: "2-digit",
//                                   })}
//                                 </div>

//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     gap: 10,
//                                     alignItems: "flex-start",
//                                     minWidth: 0,
//                                   }}
//                                 >
//                                   <AvatarCircle
//                                     size={28}
//                                     name={m.senderDisplayName}
//                                     url={m.senderAvatarUrl ?? null}
//                                   />

//                                   <div
//                                     style={{
//                                       display: "grid",
//                                       gap: 6,
//                                       width: "100%",
//                                       minWidth: 0,
//                                     }}
//                                   >
//                                     <div
//                                       style={{
//                                         display: "flex",
//                                         gap: 10,
//                                         alignItems: "center",
//                                         minWidth: 0,
//                                       }}
//                                     >
//                                       <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                         {isAdmin ? (
//                                           <button
//                                             type="button"
//                                             onClick={() =>
//                                               handleOpenUserDetails(m.senderDisplayName)
//                                             }
//                                             style={{
//                                               background: "transparent",
//                                               border: "none",
//                                               padding: 0,
//                                               margin: 0,
//                                               cursor: "pointer",
//                                               fontWeight: 900,
//                                               color: "#111827",
//                                               textAlign: "left",
//                                               maxWidth: "100%",
//                                               whiteSpace: "nowrap",
//                                               overflow: "hidden",
//                                               textOverflow: "ellipsis",
//                                             }}
//                                             title={m.senderDisplayName}
//                                           >
//                                             {m.senderDisplayName}
//                                           </button>
//                                         ) : (
//                                           <div
//                                             style={{
//                                               maxWidth: "100%",
//                                               whiteSpace: "nowrap",
//                                               overflow: "hidden",
//                                               textOverflow: "ellipsis",
//                                             }}
//                                             title={m.senderDisplayName}
//                                           >
//                                             {m.senderDisplayName}
//                                           </div>
//                                         )}
//                                       </div>

//                                       {isAuctioneer && (
//                                         <div
//                                           style={{
//                                             fontSize: 12,
//                                             fontWeight: 800,
//                                             color: "#2563EB",
//                                             display: "flex",
//                                             gap: 6,
//                                             alignItems: "center",
//                                             flex: "0 0 auto",
//                                           }}
//                                         >
//                                           <span>✎</span>
//                                           <span>Auctioneer</span>
//                                         </div>
//                                       )}
//                                     </div>

//                                     <div
//                                       style={{
//                                         display: "inline-block",
//                                         background: isAuctioneer ? "#FEF3C7" : "#FFFFFF",
//                                         border: "1px solid #E5E7EB",
//                                         borderRadius: 14,
//                                         padding: "10px 12px",
//                                         maxWidth: "100%",
//                                         overflowWrap: "anywhere",
//                                         wordBreak: "break-word",
//                                       }}
//                                     >
//                                       {m.content}
//                                     </div>

//                                     {typeof m.remainingMessages === "number" && (
//                                       <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 12 }}>
//                                         Messages left: {m.remainingMessages}/25
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>

//                     {!isEnded && (
//                       <>
//                         <div
//                           style={{
//                             marginTop: 12,
//                             display: "grid",
//                             gridTemplateColumns: "minmax(0, 1fr) auto",
//                             gap: 10,
//                             alignItems: "center",
//                           }}
//                         >
//                           <input
//                             value={canChat ? newChatContent : ""}
//                             onChange={(e) => setNewChatContent(e.target.value)}
//                             disabled={!canChat}
//                             placeholder={
//                               canChat
//                                 ? "Write a message..."
//                                 : !isLoggedIn
//                                 ? "Sign in to chat..."
//                                 : chatBlockedReason ?? "Chat is not available."
//                             }
//                             style={{
//                               width: "100%",
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               outline: "none",
//                               background: canChat ? "white" : "#F9FAFB",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter" && !e.shiftKey && canChat) {
//                                 e.preventDefault();
//                                 void handleSendChat();
//                               }
//                             }}
//                           />

//                           {canChat ? (
//                             <button
//                               type="button"
//                               onClick={() => void handleSendChat()}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: 12,
//                                 border: "1px solid #111827",
//                                 background: "#111827",
//                                 color: "white",
//                                 fontWeight: 900,
//                                 cursor: "pointer",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               Send
//                             </button>
//                           ) : !isLoggedIn ? (
//                             <button
//                               type="button"
//                               onClick={() => onSignIn?.()}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: 12,
//                                 border: "1px solid #111827",
//                                 background: "#111827",
//                                 color: "white",
//                                 fontWeight: 900,
//                                 cursor: "pointer",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               Sign in to Chat
//                             </button>
//                           ) : null}
//                         </div>

//                         <NoticeInline notice={chatNotice.notice} onClose={chatNotice.clear} />

//                         {!canChat && !isLoggedIn && (
//                           <div style={{ marginTop: 8, color: "#6B7280", fontSize: 12, fontWeight: 700 }}>
//                             You need an account to chat
//                           </div>
//                         )}

//                         {!canChat && isLoggedIn && chatBlockedReason && (
//                           <div style={{ marginTop: 8, color: "#B91C1C", fontSize: 12, fontWeight: 800 }}>
//                             {chatBlockedReason}
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               );

//               return (
//                 <>
//                   <div
//                     style={{
//                       display: "grid",
//                       gridTemplateColumns: isSingleColumn
//                         ? "1fr"
//                         : "minmax(0, 1.65fr) minmax(0, 1fr)",
//                       gap: 18,
//                       alignItems: "start",
//                       width: "100%",
//                       maxWidth: "100%",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     {/* LEFT COLUMN */}
//                     <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
//                       {/* Image carousel card */}
//                       {images.length > 0 ? (
//                         <div
//                           style={{
//                             background: "white",
//                             borderRadius: 16,
//                             boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                             overflow: "hidden",
//                             minWidth: 0,
//                           }}
//                         >
//                           <div
//                             style={{
//                               position: "relative",
//                               height: imageStageHeight,
//                               background: "#F3F4F6",
//                               overflow: "hidden",
//                               zIndex: 0,
//                             }}
//                           >
//                             {mainImage ? (
//                               <img
//                                 src={mainImage}
//                                 alt="auction main"
//                                 style={{
//                                   width: "100%",
//                                   height: "100%",
//                                   objectFit: "contain",
//                                   objectPosition: "center",
//                                   cursor: "zoom-in",
//                                   background: "#F3F4F6",
//                                 }}
//                                 onClick={() => setFullscreenImageUrl(mainImage)}
//                                 onError={() => {
//                                   setBrokenImageByUrl((p) => ({ ...p, [mainImage]: true }));
//                                   setFullscreenImageUrl(null);
//                                 }}
//                               />
//                             ) : null}

//                             {auction.categoryName && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   top: 14,
//                                   right: 14,
//                                   background: "rgba(255,255,255,0.92)",
//                                   border: "1px solid rgba(229,231,235,0.9)",
//                                   borderRadius: 999,
//                                   padding: "6px 10px",
//                                   fontWeight: 700,
//                                   fontSize: 13,
//                                   zIndex: 2,
//                                   maxWidth: "calc(100% - 28px)",
//                                   whiteSpace: "nowrap",
//                                   overflow: "hidden",
//                                   textOverflow: "ellipsis",
//                                 }}
//                               >
//                                 {auction.categoryName}
//                               </div>
//                             )}

//                             {images.length > 0 && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   bottom: 14,
//                                   right: 14,
//                                   background: "rgba(17,24,39,0.75)",
//                                   color: "white",
//                                   borderRadius: 999,
//                                   padding: "8px 12px",
//                                   fontWeight: 800,
//                                   zIndex: 2,
//                                 }}
//                               >
//                                 {Math.min(selectedImageIdx + 1, images.length)}/{images.length}
//                               </div>
//                             )}

//                             {images.length > 1 && (
//                               <>
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     setSelectedImageIdx((i) => (i - 1 + images.length) % images.length)
//                                   }
//                                   style={{
//                                     position: "absolute",
//                                     left: 12,
//                                     top: "50%",
//                                     transform: "translateY(-50%)",
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 12,
//                                     border: "1px solid #E5E7EB",
//                                     background: "rgba(255,255,255,0.92)",
//                                     cursor: "pointer",
//                                     fontSize: 18,
//                                     fontWeight: 900,
//                                     zIndex: 2,
//                                   }}
//                                 >
//                                   ‹
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => setSelectedImageIdx((i) => (i + 1) % images.length)}
//                                   style={{
//                                     position: "absolute",
//                                     right: 12,
//                                     top: "50%",
//                                     transform: "translateY(-50%)",
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 12,
//                                     border: "1px solid #E5E7EB",
//                                     background: "rgba(255,255,255,0.92)",
//                                     cursor: "pointer",
//                                     fontSize: 18,
//                                     fontWeight: 900,
//                                     zIndex: 2,
//                                   }}
//                                 >
//                                   ›
//                                 </button>
//                               </>
//                             )}
//                           </div>

//                           {images.length > 1 && (
//                             <div
//                               style={{
//                                 borderTop: "1px solid #EEF2F7",
//                                 padding: 12,
//                                 display: "flex",
//                                 gap: 12,
//                                 overflowX: "auto",
//                                 WebkitOverflowScrolling: "touch",
//                                 background: "#FFFFFF",
//                                 position: "relative",
//                                 zIndex: 1,
//                               }}
//                             >
//                               {images.map((u, idx) => {
//                                 const active = idx === selectedImageIdx;
//                                 return (
//                                   <button
//                                     key={u + idx}
//                                     type="button"
//                                     onClick={() => setSelectedImageIdx(idx)}
//                                     style={{
//                                       flex: "0 0 auto",
//                                       width: 150,
//                                       height: 92,
//                                       borderRadius: 14,
//                                       border: active ? "3px solid #111827" : "1px solid #E5E7EB",
//                                       padding: 0,
//                                       overflow: "hidden",
//                                       cursor: "pointer",
//                                       background: "#F3F4F6",
//                                       boxSizing: "border-box",
//                                     }}
//                                   >
//                                     <img
//                                       src={u}
//                                       alt={`thumb ${idx + 1}`}
//                                       style={{
//                                         width: "100%",
//                                         height: "100%",
//                                         objectFit: "contain",
//                                         objectPosition: "center",
//                                         background: "#F3F4F6",
//                                       }}
//                                       onError={() => {
//                                         setBrokenImageByUrl((p) => ({ ...p, [u]: true }));
//                                       }}
//                                     />
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         // ✅ No image: μην εμφανίζεις το image box, μόνο μήνυμα
//                         <div
//                           style={{
//                             background: "white",
//                             borderRadius: 16,
//                             boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                             padding: 16,
//                             minWidth: 0,
//                             color: "#6B7280",
//                             fontWeight: 800,
//                           }}
//                         >
//                           Image is not available
//                         </div>
//                       )}

//                       {/* Seller information card */}
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div style={{ fontWeight: 800, color: "#111827", marginBottom: 10 }}>
//                           Seller Information
//                         </div>

//                         <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
//                           <AvatarCircle
//                             size={44}
//                             name={auction.sellerUsername}
//                             url={auction.sellerAvatarUrl ?? null}
//                           />

//                           <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
//                             <div style={{ fontWeight: 800, color: "#111827" }}>
//                               {isAdmin ? (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleOpenUserDetails(auction.sellerUsername)}
//                                   style={{
//                                     background: "transparent",
//                                     border: "none",
//                                     padding: 0,
//                                     margin: 0,
//                                     cursor: "pointer",
//                                     fontWeight: 800,
//                                     color: "#111827",
//                                     textAlign: "left",
//                                     maxWidth: "100%",
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                   }}
//                                   title={auction.sellerUsername}
//                                 >
//                                   {auction.sellerUsername}
//                                 </button>
//                               ) : (
//                                 <div
//                                   style={{
//                                     maxWidth: "100%",
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                   }}
//                                   title={auction.sellerUsername}
//                                 >
//                                   {auction.sellerUsername}
//                                 </div>
//                               )}
//                             </div>

//                             <div
//                               style={{
//                                 display: "flex",
//                                 gap: 6,
//                                 alignItems: "center",
//                                 color: "#6B7280",
//                                 minWidth: 0,
//                               }}
//                             >
//                               <span style={{ fontSize: 14 }}>
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                   <path d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
//                                   <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2"/>
//                                 </svg>
//                               </span>
//                               <span
//                                 style={{
//                                   whiteSpace: "nowrap",
//                                   overflow: "hidden",
//                                   textOverflow: "ellipsis",
//                                 }}
//                                 title={getCityFromLocation(auction.sellerLocation)}
//                               >
//                                 {getCityFromLocation(auction.sellerLocation)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Description card */}
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
//                           Description
//                         </div>

//                         <div
//                           style={{
//                             color: "#374151",
//                             lineHeight: 1.55,
//                             overflowWrap: "anywhere",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {auction.description || auction.shortDescription || "—"}
//                         </div>

//                         <div
//                           style={{
//                             marginTop: 14,
//                             paddingTop: 14,
//                             borderTop: "1px solid #EEF2F7",
//                             display: "grid",
//                             gridTemplateColumns: isSingleColumn
//                               ? "1fr"
//                               : "minmax(0, 1fr) minmax(0, 1fr)",
//                             gap: 12,
//                           }}
//                         >
//                           <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
//                                 Starting price
//                               </div>
//                               <div style={{ fontWeight: 900, color: "#111827" }}>
//                                 {formatMoneyEUR(auction.startingAmount)}
//                               </div>
//                             </div>
//                           </div>

//                           <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
//                                 Minimum raise
//                               </div>
//                               <div style={{ fontWeight: 900, color: "#111827" }}>
//                                 {formatMoneyEUR(auction.minBidIncrement)}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* ✅ Chat stays here ONLY on non-mobile */}
//                       {!isMobile && chatCard}
//                     </div>

//                     {/* RIGHT COLUMN */}
//                     <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div
//                           style={{
//                             fontSize: 18,
//                             fontWeight: 900,
//                             color: "#111827",
//                             overflowWrap: "anywhere",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {auction.title}
//                         </div>

//                         <div
//                           style={{
//                             marginTop: 12,
//                             padding: 14,
//                             borderRadius: 14,
//                             background: "#F9FAFB",
//                             border: "1px solid #EEF2F7",
//                           }}
//                         >
//                           <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                             <span style={{ fontSize: 18 }}>🕒</span>
//                             <div style={{ fontWeight: 800, color: "#374151" }}>
//                               Time Remaining
//                             </div>
//                           </div>
//                           <div
//                             style={{
//                               marginTop: 8,
//                               fontWeight: 900,
//                               color: timeBox.ended ? "#DC2626" : "#111827",
//                               overflowWrap: "anywhere",
//                               wordBreak: "break-word",
//                             }}
//                           >
//                             {timeBox.label}
//                           </div>
//                         </div>

//                         {!isEnded && (
//                           <div style={{ marginTop: 16 }}>
//                             <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                               Place Your Bid{" "}
//                               {minNextBid != null ? `(min ${formatMoneyEUR(minNextBid)})` : ""}
//                             </div>

//                             <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                               <div
//                                 style={{
//                                   flex: 1,
//                                   minWidth: 0,
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 8,
//                                   border: "1px solid #E5E7EB",
//                                   borderRadius: 12,
//                                   padding: "10px 12px",
//                                   background: canBid ? "white" : "#F9FAFB",
//                                   boxSizing: "border-box",
//                                 }}
//                               >
//                                 <span style={{ color: "#9CA3AF", fontWeight: 900 }}>€</span>
//                                 <input
//                                   type="number"
//                                   min={0}
//                                   step="1"
//                                   value={bidAmount}
//                                   onChange={(e) => setBidAmount(e.target.value)}
//                                   placeholder=""
//                                   disabled={!canBid}
//                                   style={{
//                                     width: "100%",
//                                     border: "none",
//                                     outline: "none",
//                                     background: "transparent",
//                                     fontSize: 14,
//                                     minWidth: 0,
//                                   }}
//                                 />
//                               </div>

//                               {canBid ? (
//                                 <button
//                                   type="button"
//                                   onClick={handleBid}
//                                   style={{
//                                     padding: "10px 14px",
//                                     borderRadius: 12,
//                                     border: "1px solid #111827",
//                                     background: "#111827",
//                                     color: "white",
//                                     fontWeight: 800,
//                                     cursor: "pointer",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   Place Bid
//                                 </button>
//                               ) : (
//                                 <button
//                                   type="button"
//                                   onClick={() => onSignIn?.()}
//                                   style={{
//                                     padding: "10px 14px",
//                                     borderRadius: 12,
//                                     border: "1px solid #111827",
//                                     background: "#111827",
//                                     color: "white",
//                                     fontWeight: 800,
//                                     cursor: "pointer",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   Sign in to Bid
//                                 </button>
//                               )}
//                             </div>

//                             <NoticeInline notice={bidNotice.notice} onClose={bidNotice.clear} />
//                           </div>
//                         )}

//                         {/* Bidder rankings (Top 3 only) */}
//                         <div style={{ marginTop: 16 }}>
//                           <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
//                             Bidder Rankings ({sortedBids.length})
//                           </div>

//                           {sortedBids.length === 0 ? (
//                             <div style={{ color: "#6B7280" }}>No bids yet.</div>
//                           ) : (
//                             <div style={{ display: "grid", gap: 10 }}>
//                               {sortedBids.slice(0, 3).map((b, idx) => {
//                                 const leading = idx === 0;
//                                 return (
//                                   <div
//                                     key={b.id}
//                                     style={{
//                                       borderRadius: 14,
//                                       border: leading
//                                         ? "2px solid rgba(59,130,246,0.5)"
//                                         : "1px solid #E5E7EB",
//                                       padding: 12,
//                                       display: "flex",
//                                       alignItems: "center",
//                                       justifyContent: "space-between",
//                                       gap: 12,
//                                       background: "white",
//                                       minWidth: 0,
//                                     }}
//                                   >
//                                     <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
//                                       <div
//                                         style={{
//                                           width: 44,
//                                           height: 44,
//                                           borderRadius: 999,
//                                           background: "#2563EB",
//                                           display: "grid",
//                                           placeItems: "center",
//                                           color: "white",
//                                           fontWeight: 900,
//                                           flex: "0 0 auto",
//                                         }}
//                                       >
//                                         #{idx + 1}
//                                       </div>

//                                       <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                                         <AvatarCircle
//                                           size={38}
//                                           name={b.bidderUsername}
//                                           url={b.bidderAvatarUrl ?? null}
//                                           ring={leading}
//                                         />
//                                         <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                                           <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                             {b.bidderUsername ? (
//                                               isAdmin ? (
//                                                 <button
//                                                   type="button"
//                                                   onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                                                   style={{
//                                                     background: "transparent",
//                                                     border: "none",
//                                                     padding: 0,
//                                                     margin: 0,
//                                                     cursor: "pointer",
//                                                     fontWeight: 900,
//                                                     color: "#111827",
//                                                     textAlign: "left",
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </button>
//                                               ) : (
//                                                 <div
//                                                   style={{
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </div>
//                                               )
//                                             ) : (
//                                               "Unknown"
//                                             )}
//                                           </div>
//                                           <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                                             {timeAgo(b.createdAt, now)}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>

//                                     <div style={{ textAlign: "right", flex: "0 0 auto" }}>
//                                       <div style={{ color: "#2563EB", fontWeight: 900 }}>
//                                         {formatMoneyEUR(b.amount)}
//                                       </div>
//                                       {leading && (
//                                         <div style={{ color: "#2563EB", fontWeight: 800, fontSize: 13 }}>
//                                           Leading
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           )}

//                           {sortedBids.length > 3 && (
//                             <div style={{ marginTop: 12 }}>
//                               <button
//                                 type="button"
//                                 onClick={() => setBidHistoryOpen((v) => !v)}
//                                 style={{
//                                   width: "100%",
//                                   border: "1px solid rgba(17,24,39,0.14)",
//                                   background: "#FFFFFF",
//                                   borderRadius: 12,
//                                   padding: "10px 12px",
//                                   fontWeight: 900,
//                                   cursor: "pointer",
//                                   fontSize: 13,
//                                 }}
//                               >
//                                 {bidHistoryOpen ? "Hide" : "See more"}
//                               </button>
//                             </div>
//                           )}

//                           {bidHistoryOpen && sortedBids.length > 3 && (
//                             <div
//                               style={{
//                                 marginTop: 12,
//                                 borderRadius: 16,
//                                 border: "1px solid #E5E7EB",
//                                 overflow: "hidden",
//                                 background: "#FFFFFF",
//                                 minWidth: 0,
//                               }}
//                             >
//                               <div
//                                 style={{
//                                   padding: "10px 12px",
//                                   borderBottom: "1px solid #EEF2F7",
//                                   display: "flex",
//                                   justifyContent: "space-between",
//                                   alignItems: "baseline",
//                                   gap: 10,
//                                 }}
//                               >
//                                 <div style={{ fontWeight: 950, color: "#111827" }}>More bids</div>
//                                 <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                                   Scroll to view
//                                 </div>
//                               </div>

//                               <div
//                                 style={{
//                                   maxHeight: 260,
//                                   overflowY: "auto",
//                                   padding: 12,
//                                   display: "grid",
//                                   gap: 10,
//                                   background: "#F9FAFB",
//                                 }}
//                               >
//                                 {sortedBids.slice(3).map((b) => {
//                                   return (
//                                     <div
//                                       key={`more-${b.id}`}
//                                       style={{
//                                         borderRadius: 14,
//                                         border: "1px solid #E5E7EB",
//                                         background: "#FFFFFF",
//                                         padding: 12,
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         alignItems: "center",
//                                         gap: 12,
//                                         minWidth: 0,
//                                       }}
//                                     >
//                                       <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                                         <AvatarCircle size={38} name={b.bidderUsername} url={b.bidderAvatarUrl ?? null} />
//                                         <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                                           <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                             {b.bidderUsername ? (
//                                               isAdmin ? (
//                                                 <button
//                                                   type="button"
//                                                   onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                                                   style={{
//                                                     background: "transparent",
//                                                     border: "none",
//                                                     padding: 0,
//                                                     margin: 0,
//                                                     cursor: "pointer",
//                                                     fontWeight: 900,
//                                                     color: "#111827",
//                                                     textAlign: "left",
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </button>
//                                               ) : (
//                                                 <div
//                                                   style={{
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </div>
//                                               )
//                                             ) : (
//                                               "Unknown"
//                                             )}
//                                           </div>

//                                           <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                                             {timeAgo(b.createdAt, now)}
//                                           </div>
//                                         </div>
//                                       </div>

//                                       <div style={{ textAlign: "right", flex: "0 0 auto" }}>
//                                         <div style={{ color: "#2563EB", fontWeight: 950 }}>
//                                           {formatMoneyEUR(b.amount)}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ✅ On mobile: chat goes to the END of the page (after title/time/bids) */}
//                   {isMobile && <div style={{ marginTop: 14 }}>{chatCard}</div>}
//                 </>
//               );
//             })()}

//             {/* ADMIN block */}
//             {isAdmin && (
//               <div style={{ marginTop: 18 }}>
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: 16,
//                     boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                     padding: 16,
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                     overflowX: "hidden",
//                   }}
//                 >
//                   <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
//                     <div style={{ fontWeight: 900, color: "#111827" }}>Admin: Edit auction</div>
//                     {!isEditing ? (
//                       <button
//                         type="button"
//                         onClick={() => setIsEditing(true)}
//                         style={{
//                           padding: "8px 12px",
//                           borderRadius: 12,
//                           border: "1px solid #E5E7EB",
//                           background: "white",
//                           cursor: "pointer",
//                           fontWeight: 800,
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         Open editor
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           if (auction) hydrateEdit(auction);
//                           setIsEditing(false);
//                         }}
//                         style={{
//                           padding: "8px 12px",
//                           borderRadius: 12,
//                           border: "1px solid #E5E7EB",
//                           background: "white",
//                           cursor: "pointer",
//                           fontWeight: 800,
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         Close
//                       </button>
//                     )}
//                   </div>

//                   <NoticeInline notice={adminNotice.notice} onClose={adminNotice.clear} />

//                   {isEditing && (
//                     <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Title
//                           <input
//                             value={editForm.title}
//                             onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Category ID (optional)
//                           <input
//                             value={editForm.categoryId}
//                             onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                         Short description
//                         <input
//                           value={editForm.shortDescription}
//                           onChange={(e) => setEditForm((p) => ({ ...p, shortDescription: e.target.value }))}
//                           style={{
//                             border: "1px solid #E5E7EB",
//                             borderRadius: 12,
//                             padding: "10px 12px",
//                             minWidth: 0,
//                             boxSizing: "border-box",
//                           }}
//                         />
//                       </label>

//                       <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                         Full description
//                         <textarea
//                           value={editForm.description}
//                           onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
//                           rows={4}
//                           style={{
//                             border: "1px solid #E5E7EB",
//                             borderRadius: 12,
//                             padding: "10px 12px",
//                             resize: "vertical",
//                             minWidth: 0,
//                             boxSizing: "border-box",
//                           }}
//                         />
//                       </label>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Starting amount
//                           <input
//                             value={editForm.startingAmount}
//                             onChange={(e) => setEditForm((p) => ({ ...p, startingAmount: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Min bid increment
//                           <input
//                             value={editForm.minBidIncrement}
//                             onChange={(e) => setEditForm((p) => ({ ...p, minBidIncrement: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Start date
//                           <input
//                             value={editForm.startDate}
//                             onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
//                             type="datetime-local"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           End date
//                           <input
//                             value={editForm.endDate}
//                             onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
//                             type="datetime-local"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Shipping cost payer
//                           <select
//                             value={editForm.shippingCostPayer}
//                             onChange={(e) =>
//                               setEditForm((p) => ({
//                                 ...p,
//                                 shippingCostPayer: e.target.value as ShippingCostPayer,
//                               }))
//                             }
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               background: "white",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           >
//                             <option value="SELLER">SELLER</option>
//                             <option value="BUYER">BUYER</option>
//                             <option value="SPLIT">SPLIT</option>
//                           </select>
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Status
//                           <select
//                             value={editForm.auctionStatus || ""}
//                             onChange={(e) =>
//                               setEditForm((p) => ({
//                                 ...p,
//                                 auctionStatus: e.target.value as AuctionStatus | "",
//                               }))
//                             }
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               background: "white",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           >
//                             <option value="">(no change)</option>
//                             <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
//                             <option value="ACTIVE">ACTIVE</option>
//                             <option value="EXPIRED">EXPIRED</option>
//                             <option value="CANCELLED">CANCELLED</option>
//                           </select>
//                         </label>
//                       </div>

//                       <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             if (auction) hydrateEdit(auction);
//                             setIsEditing(false);
//                           }}
//                           style={{
//                             padding: "10px 14px",
//                             borderRadius: 12,
//                             border: "1px solid #E5E7EB",
//                             background: "white",
//                             cursor: "pointer",
//                             fontWeight: 800,
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => void handleSaveEdit()}
//                           style={{
//                             padding: "10px 14px",
//                             borderRadius: 12,
//                             border: "1px solid #111827",
//                             background: "#111827",
//                             color: "white",
//                             cursor: "pointer",
//                             fontWeight: 900,
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           Save changes
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Fullscreen overlay */}
//       {fullscreenImageUrl && (
//         <div
//           onClick={() => setFullscreenImageUrl(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.82)",
//             display: "grid",
//             placeItems: "center",
//             zIndex: 9999,
//             cursor: "zoom-out",
//             padding: 16,
//           }}
//         >
//           <img
//             src={fullscreenImageUrl}
//             alt="fullscreen"
//             style={{
//               maxWidth: "92vw",
//               maxHeight: "92vh",
//               borderRadius: 14,
//               boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
//               background: "white",
//             }}
//             onError={() => {
//               setBrokenImageByUrl((p) => ({ ...p, [fullscreenImageUrl]: true }));
//               setFullscreenImageUrl(null);
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuctionDetailsPage;


// // AuctionDetailsPage.tsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";
// import type { IMessage, IStompSocket, StompSubscription } from "@stomp/stompjs";

// import { getAuctionById } from "../api/Springboot/backendAuctionService";
// import { placeBid } from "../api/Springboot/BackendBidService";
// import { sendChatMessage } from "../api/Springboot/backendChatService";
// import { adminEditAuction } from "../api/admin/backendAdminAuctionService";

// import type {
//   AdminAuctionUpdateRequest,
//   AuctionDetails,
//   AuctionStatus,
//   ShippingCostPayer,
// } from "../models/Springboot/Auction";
// import type { AuthUserDto } from "../models/Springboot/UserEntity";

// interface AuctionDetailsPageProps {
//   auctionId: number;
//   onBack?: () => void;
//   currentUser: AuthUserDto | null;
//   onOpenUserDetailsAsAdmin?: (username: string) => void;

//   onSignIn?: () => void;
//   onSignUp?: () => void;

//   onBidUpdate?: (u: {
//     auctionId: number;
//     amount: number;
//     bidderUsername: string;
//     newEndDate: string;
//   }) => void;

//   onAuctionLoaded?: (a: AuctionDetails) => void;

//   variant?: "page" | "modal";
// }

// // ✅ WebSocket DTO (updated: bidderAvatarUrl)
// interface BidEventDto {
//   id: number;
//   amount: number;
//   bidderUsername: string;
//   createdAt: string;
//   auctionId: number;
//   newEndDate: string;
//   bidderAvatarUrl?: string | null;
// }

// interface ChatMessageDto {
//   id: number;
//   senderDisplayName: string;
//   senderAvatarUrl?: string | null;
//   senderFirebaseId: string;
//   content: string;
//   createdAt: string;
//   remainingMessages?: number;
// }

// const DEFAULT_AVATAR_FALLBACK =
//   "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%25' height='100%25' rx='999' fill='%23E5E7EB'/%3E%3Cpath d='M32 34c6 0 11-5 11-11S38 12 32 12s-11 5-11 11 5 11 11 11zm0 6c-10 0-18 6-18 14h36c0-8-8-14-18-14z' fill='%239CA3AF'/%3E%3C/svg%3E";

// function formatMoneyEUR(value: number): string {
//   try {
//     return new Intl.NumberFormat("el-GR", {
//       style: "currency",
//       currency: "EUR",
//       maximumFractionDigits: 0,
//     }).format(value);
//   } catch {
//     return `${value}€`;
//   }
// }

// function timeAgo(iso: string, now: Date): string {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return "";
//   const diffMs = now.getTime() - d.getTime();
//   const s = Math.max(0, Math.floor(diffMs / 1000));
//   const m = Math.floor(s / 60);
//   const h = Math.floor(m / 60);
//   const day = Math.floor(h / 24);

//   if (day > 0) return `${day}d ago`;
//   if (h > 0) return `${h}h ago`;
//   if (m > 0) return `${m}m ago`;
//   return `${s}s ago`;
// }

// function formatTimeRemaining(
//   endIso: string,
//   now: Date
// ): { label: string; ended: boolean } {
//   const end = new Date(endIso);
//   if (Number.isNaN(end.getTime())) return { label: endIso, ended: false };
//   const diff = end.getTime() - now.getTime();
//   if (diff <= 0) return { label: "Ended", ended: true };

//   let total = Math.floor(diff / 1000);
//   const days = Math.floor(total / (24 * 3600));
//   total -= days * 24 * 3600;
//   const hours = Math.floor(total / 3600);
//   total -= hours * 3600;
//   const minutes = Math.floor(total / 60);
//   const seconds = total - minutes * 60;

//   if (days > 0)
//     return {
//       label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
//       ended: false,
//     };
//   if (hours > 0) return { label: `${hours}h ${minutes}m ${seconds}s`, ended: false };
//   if (minutes > 0) return { label: `${minutes}m ${seconds}s`, ended: false };
//   return { label: `${seconds}s`, ended: false };
// }

// function toDateTimeLocal(value: string | null | undefined): string {
//   if (!value) return "";
//   return value.length >= 16 ? value.slice(0, 16) : value;
// }

// type NoticeType = "success" | "error";
// type NoticeState = { type: NoticeType; text: string } | null;

// function useAutoDismissNotice(timeoutMs = 4200) {
//   const [notice, setNotice] = useState<NoticeState>(null);
//   const timerRef = useRef<number | null>(null);

//   const clear = useCallback(() => {
//     if (timerRef.current != null) {
//       window.clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }
//     setNotice(null);
//   }, []);

//   const show = useCallback(
//     (type: NoticeType, text: string) => {
//       setNotice({ type, text });
//       if (timerRef.current != null) window.clearTimeout(timerRef.current);
//       timerRef.current = window.setTimeout(() => {
//         setNotice(null);
//         timerRef.current = null;
//       }, timeoutMs);
//     },
//     [timeoutMs]
//   );

//   useEffect(() => {
//     return () => {
//       if (timerRef.current != null) window.clearTimeout(timerRef.current);
//     };
//   }, []);

//   return { notice, show, clear };
// }

// const NoticeInline: React.FC<{
//   notice: NoticeState;
//   onClose: () => void;
// }> = ({ notice, onClose }) => {
//   if (!notice) return null;

//   const isErr = notice.type === "error";
//   return (
//     <div
//       style={{
//         marginTop: 10,
//         borderRadius: 12,
//         border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
//         background: isErr ? "#FEF2F2" : "#F0FDF4",
//         color: isErr ? "#991B1B" : "#166534",
//         padding: "10px 12px",
//         fontWeight: 800,
//         fontSize: 13,
//         display: "flex",
//         alignItems: "flex-start",
//         justifyContent: "space-between",
//         gap: 10,
//       }}
//       role="status"
//       aria-live="polite"
//     >
//       <div style={{ lineHeight: 1.35 }}>{notice.text}</div>

//       <button
//         type="button"
//         onClick={onClose}
//         aria-label="Close message"
//         style={{
//           flex: "0 0 auto",
//           width: 30,
//           height: 30,
//           padding: 0,
//           borderRadius: 10,
//           border: "1px solid rgba(17,24,39,0.12)",
//           background: "rgba(255,255,255,0.75)",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontWeight: 950,
//           fontSize: 16,
//           lineHeight: 1,
//         }}
//         title="Close"
//       >
//         <span style={{ display: "block", transform: "translateY(-0.5px)" }}>
//           ✕
//         </span>
//       </button>
//     </div>
//   );
// };

// /* =========================================================
//    ✅ ΜΟΝΗ ΑΛΛΑΓΗ: AvatarCircle έξω από το component + React.memo
//    ========================================================= */
// const AvatarCircle = React.memo(
//   ({
//     size,
//     name,
//     url,
//     ring,
//   }: {
//     size: number;
//     name?: string;
//     url?: string | null;
//     ring?: boolean;
//   }) => {
//     const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
//     return (
//       <div
//         style={{
//           width: size,
//           height: size,
//           borderRadius: 999,
//           overflow: "hidden",
//           flex: "0 0 auto",
//           boxShadow: ring ? "0 0 0 3px rgba(59,130,246,0.25)" : undefined,
//           background: "#EEF2FF",
//           display: "grid",
//           placeItems: "center",
//         }}
//       >
//         {url ? (
//           <img
//             src={url}
//             alt={name ?? "avatar"}
//             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             onError={(e) => {
//               (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
//             }}
//           />
//         ) : (
//           <span style={{ fontWeight: 800, color: "#4F46E5" }}>{initial}</span>
//         )}
//       </div>
//     );
//   }
// );
// AvatarCircle.displayName = "AvatarCircle";
// /* ========================================================= */

// const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
//   auctionId,
//   onBack,
//   currentUser,
//   onOpenUserDetailsAsAdmin,
//   onSignIn,
//   onBidUpdate,
//   onAuctionLoaded,
//   variant = "page",
// }) => {
//   const [auction, setAuction] = useState<AuctionDetails | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [now, setNow] = useState<Date>(new Date());

//   // ✅ responsive (για να μην δημιουργείται horizontal scroll σε modal / στενά πλάτη)
//   const [vw, setVw] = useState<number>(() =>
//     typeof window !== "undefined" ? window.innerWidth : 1200
//   );
//   useEffect(() => {
//     const onResize = () => setVw(window.innerWidth);
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isModal = variant === "modal";
//   const isSingleColumn = isModal || vw < 980;

//   // ✅ αυτό είναι “phone” breakpoint (για να πάει το chat στο τέλος)
//   const isMobile = vw <= 640;

//   const chatViewportHeight = isModal ? 260 : isMobile ? 380 : 320;

//   // ✅ stable refs για callbacks
//   const onAuctionLoadedRef =
//     useRef<AuctionDetailsPageProps["onAuctionLoaded"]>(onAuctionLoaded);
//   const onBidUpdateRef =
//     useRef<AuctionDetailsPageProps["onBidUpdate"]>(onBidUpdate);

//   useEffect(() => {
//     onAuctionLoadedRef.current = onAuctionLoaded;
//   }, [onAuctionLoaded]);

//   useEffect(() => {
//     onBidUpdateRef.current = onBidUpdate;
//   }, [onBidUpdate]);

//   // ✅ TOP anchor (scroll-to-top when opening page / changing auction)
//   const pageTopAnchorRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     // 1) window scroll (page variant)
//     window.scrollTo({ top: 0, left: 0, behavior: "auto" });
//     // 2) nearest scroll container (modal / nested scroll)
//     pageTopAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
//   }, [auctionId, variant]);

//   // images
//   const [selectedImageIdx, setSelectedImageIdx] = useState(0);
//   const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
//     null
//   );

//   // ✅ track broken images (Cloudflare expiry etc.)
//   const [brokenImageByUrl, setBrokenImageByUrl] = useState<Record<string, boolean>>({});

//   // bid/chat
//   const [bidAmount, setBidAmount] = useState<string>("");
//   const [newChatContent, setNewChatContent] = useState<string>("");

//   // ✅ inline messages (auto-hide + manual close)
//   const bidNotice = useAutoDismissNotice(4200);
//   const chatNotice = useAutoDismissNotice(4200);
//   const adminNotice = useAutoDismissNotice(4200);

//   // ------------------ Chat auto-scroll (default to bottom) ------------------
//   const chatScrollRef = useRef<HTMLDivElement | null>(null);
//   const didInitialChatScrollRef = useRef<boolean>(false);

//   const scrollChatToBottom = useCallback(() => {
//     const el = chatScrollRef.current;
//     if (!el) return;
//     el.scrollTop = el.scrollHeight;
//   }, []);

//   // ws
//   const [stompClient, setStompClient] = useState<Client | null>(null);
//   const bidSubRef = useRef<StompSubscription | null>(null);
//   const chatSubRef = useRef<StompSubscription | null>(null);

//   const isAdmin = currentUser?.roleName === "Admin";

//   const handleOpenUserDetails = useCallback(
//     (username: string) => {
//       if (!isAdmin) return;
//       if (!onOpenUserDetailsAsAdmin) return;
//       onOpenUserDetailsAsAdmin(username);
//     },
//     [isAdmin, onOpenUserDetailsAsAdmin]
//   );

//   // ✅ optimistic unlock for chat after successful bid (no "locked" feeling)
//   const [chatUnlockedOptimistic, setChatUnlockedOptimistic] = useState(false);

//   // timers / esc
//   useEffect(() => {
//     const t = window.setInterval(() => setNow(new Date()), 1000);
//     return () => window.clearInterval(t);
//   }, []);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setFullscreenImageUrl(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   // clear notices on auction change
//   useEffect(() => {
//     bidNotice.clear();
//     chatNotice.clear();
//     adminNotice.clear();
//     setBidAmount("");
//     setNewChatContent("");
//     didInitialChatScrollRef.current = false; // ✅ reset initial scroll per auction

//     // ✅ reset broken image tracking per auction
//     setBrokenImageByUrl({});

//     // ✅ reset optimistic unlock per auction
//     setChatUnlockedOptimistic(false);
//   }, [auctionId, bidNotice.clear, chatNotice.clear, adminNotice.clear]);

//   // load auction
//   const loadAuction = useCallback(async () => {
//     setError(null);
//     setLoading(true);
//     setAuction(null);

//     try {
//       const res = await getAuctionById(auctionId);
//       setAuction(res);
//       onAuctionLoadedRef.current?.(res);
//       setSelectedImageIdx(0);
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while loading this auction. Please try again.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   }, [auctionId]);

//   useEffect(() => {
//     void loadAuction();
//   }, [loadAuction]);

//   // STOMP connect once
//   useEffect(() => {
//     const socket = new SockJS("/ws");
//     const client = new Client({
//       webSocketFactory: () => socket as unknown as IStompSocket,
//       reconnectDelay: 5000,
//       debug: () => {},
//     });

//     client.onConnect = () => setStompClient(client);
//     client.onStompError = (frame) => {
//       // eslint-disable-next-line no-console
//       console.error(
//         "STOMP error (details):",
//         frame.headers["message"],
//         frame.body
//       );
//     };

//     client.activate();

//     return () => {
//       if (bidSubRef.current) {
//         bidSubRef.current.unsubscribe();
//         bidSubRef.current = null;
//       }
//       if (chatSubRef.current) {
//         chatSubRef.current.unsubscribe();
//         chatSubRef.current = null;
//       }
//       client.deactivate();
//     };
//   }, []);

//   // Subscribe bids/chat
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected) return;

//     if (bidSubRef.current) {
//       bidSubRef.current.unsubscribe();
//       bidSubRef.current = null;
//     }
//     if (chatSubRef.current) {
//       chatSubRef.current.unsubscribe();
//       chatSubRef.current = null;
//     }

//     const bidTopic = `/topic/auctions/${auctionId}`;
//     const bidSub = stompClient.subscribe(bidTopic, (message: IMessage) => {
//       try {
//         const payload: BidEventDto = JSON.parse(message.body);

//         onBidUpdateRef.current?.({
//           auctionId: payload.auctionId,
//           amount: payload.amount,
//           bidderUsername: payload.bidderUsername,
//           newEndDate: payload.newEndDate,
//         });

//         setAuction((prev) => {
//           if (!prev || prev.id !== payload.auctionId) return prev;

//           const newBid = {
//             id: payload.id,
//             amount: payload.amount,
//             bidderUsername: payload.bidderUsername,
//             createdAt: payload.createdAt,
//             auctionId: payload.auctionId,
//             bidderAvatarUrl: payload.bidderAvatarUrl ?? null,
//           };

//           const already = prev.bids.some((b) => b.id === newBid.id);
//           const bids = already ? prev.bids : [newBid, ...prev.bids];

//           // ✅ if you have a bid, you can chat (optimistic UX)
//           // (safe: it only affects UI; backend still enforces eligibility)
//           return {
//             ...prev,
//             endDate: payload.newEndDate,
//             bids,
//             eligibleForChat: true,
//           };
//         });

//         // ✅ ensure chat unlock even if auction isn't updated yet
//         setChatUnlockedOptimistic(true);
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("Failed to parse BidEventDto", err);
//       }
//     });
//     bidSubRef.current = bidSub;

//     const chatTopic = `/topic/auctions/${auctionId}/chat`;
//     const chatSub = stompClient.subscribe(chatTopic, (message: IMessage) => {
//       try {
//         const payload: ChatMessageDto = JSON.parse(message.body);
//         setAuction((prev) => {
//           if (!prev || prev.id !== auctionId) return prev;
//           const exists = prev.chat.some((m) => m.id === payload.id);
//           if (exists) return prev;
//           return { ...prev, chat: [...prev.chat, payload] };
//         });
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("Failed to parse ChatMessageDto", err);
//       }
//     });
//     chatSubRef.current = chatSub;

//     return () => {
//       bidSub.unsubscribe();
//       chatSub.unsubscribe();
//       if (bidSubRef.current === bidSub) bidSubRef.current = null;
//       if (chatSubRef.current === chatSub) chatSubRef.current = null;
//     };
//   }, [stompClient, auctionId]);

//   // auto-scroll first load chat (once per auction)
//   useEffect(() => {
//     if (!auction) return;
//     if (didInitialChatScrollRef.current) return;

//     window.setTimeout(() => {
//       scrollChatToBottom();
//       didInitialChatScrollRef.current = true;
//     }, 0);
//   }, [auction, scrollChatToBottom]);

//   // auto-scroll on new messages ONLY if user is near bottom
//   useEffect(() => {
//     if (!auction) return;
//     const el = chatScrollRef.current;
//     if (!el) return;

//     const threshold = 90; // px
//     const distanceFromBottom =
//       el.scrollHeight - (el.scrollTop + el.clientHeight);

//     if (distanceFromBottom <= threshold) {
//       window.setTimeout(() => scrollChatToBottom(), 0);
//     }
//   }, [auction?.chat.length, auction, scrollChatToBottom]);

//   // derived
//   const allImages = auction?.imageUrls ?? [];
//   const images = useMemo(
//     () => allImages.filter((u) => !!u && !brokenImageByUrl[u]),
//     [allImages, brokenImageByUrl]
//   );

//   useEffect(() => {
//     if (selectedImageIdx >= images.length && images.length > 0) {
//       setSelectedImageIdx(0);
//     }
//     if (images.length === 0) {
//       setSelectedImageIdx(0);
//       setFullscreenImageUrl(null);
//     }
//   }, [images.length, selectedImageIdx]);

//   const mainImage =
//     images.length > 0
//       ? images[Math.min(selectedImageIdx, images.length - 1)]
//       : null;

//   const timeBox = useMemo(() => {
//     if (!auction) return { label: "", ended: false };
//     return formatTimeRemaining(auction.endDate, now);
//   }, [auction, now]);

//   const isActive = useMemo(() => {
//     if (!auction) return false;
//     const end = new Date(auction.endDate);
//     if (Number.isNaN(end.getTime())) return false;
//     return end.getTime() - now.getTime() > 0;
//   }, [auction, now]);

//   const canBid = !!auction && auction.eligibleForBid && isActive;

//   const isLoggedIn = !!currentUser;

//   // ✅ effective eligibility for chat (backend flag OR optimistic unlock)
//   const effectiveEligibleForChat = useMemo(() => {
//     if (!auction) return false;
//     return auction.eligibleForChat || chatUnlockedOptimistic;
//   }, [auction, chatUnlockedOptimistic]);

//   const canChat = !!auction && isLoggedIn && effectiveEligibleForChat && isActive;

//   const chatBlockedReason = useMemo(() => {
//     if (!auction) return null;
//     if (!isActive) return "Chat is closed because the auction has ended.";
//     if (!isLoggedIn) return null;
//     if (!effectiveEligibleForChat)
//       return "Place a bid to unlock the chat for this auction.";
//     return null;
//   }, [auction, isActive, isLoggedIn, effectiveEligibleForChat]);

//   const isEnded = useMemo(() => {
//     if (!auction) return false;
//     if (auction.status === "EXPIRED" || auction.status === "CANCELLED")
//       return true;
//     return timeBox.ended;
//   }, [auction, timeBox.ended]);

//   type BidItem = AuctionDetails["bids"][number] & { bidderAvatarUrl?: string | null };

//   const sortedBids: BidItem[] = useMemo(() => {
//     if (!auction) return [];
//     const copy = [...(auction.bids as BidItem[])];
//     copy.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
//     return copy;
//   }, [auction]);

//   const currentTopBid = sortedBids.length > 0 ? sortedBids[0].amount : null;

//   const minNextBid = useMemo(() => {
//     if (!auction) return null;
//     const base = currentTopBid ?? auction.startingAmount;
//     return (base ?? 0) + (auction.minBidIncrement ?? 0);
//   }, [auction, currentTopBid]);

//   const getCityFromLocation = (sellerLocation: string | null): string => {
//     if (!sellerLocation) return "Unknown";
//     const [city] = sellerLocation.split(",");
//     return city.trim();
//   };

//   // actions
//   const handleBid = async () => {
//     if (!auction) return;

//     const raw = bidAmount.trim();
//     if (!raw) {
//       bidNotice.show("error", "Please enter a bid amount.");
//       return;
//     }

//     const amount = Number(raw);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       bidNotice.show("error", "Please enter a valid amount.");
//       return;
//     }

//     try {
//       await placeBid(auction.id, amount);

//       // ✅ Optimistic unlock chat ONLY on success (no unlock on backend error)
//       setChatUnlockedOptimistic(true);
//       setAuction((prev) => (prev ? { ...prev, eligibleForChat: true } : prev));

//       bidNotice.show("success", "Your bid was placed successfully!");
//       setBidAmount("");

//       // ❌ Fix 1: do not reload the entire auction (avoids "refresh" feeling)
//       // await loadAuction();
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while placing your bid. Please try again.";
//       bidNotice.show("error", msg);
//     }
//   };

//   const handleSendChat = async () => {
//     if (!auction) return;
//     const text = newChatContent.trim();
//     if (!text) {
//       chatNotice.show("error", "Your message can't be empty.");
//       return;
//     }

//     try {
//       await sendChatMessage(auction.id, text);
//       setNewChatContent("");

//       // ✅ Force scroll to bottom after sending (so user sees their message)
//       window.setTimeout(() => {
//         scrollChatToBottom();
//       }, 0);
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while sending your message. Please try again.";
//       chatNotice.show("error", msg);
//     }
//   };

//   // ------------------ ADMIN edit ------------------
//   const [isEditing, setIsEditing] = useState(false);
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

//   const hydrateEdit = useCallback((a: AuctionDetails) => {
//     setEditForm({
//       categoryId: "",
//       title: a.title ?? "",
//       shortDescription: a.shortDescription ?? "",
//       description: a.description ?? "",
//       startingAmount: a.startingAmount?.toString() ?? "",
//       minBidIncrement: a.minBidIncrement?.toString() ?? "",
//       startDate: toDateTimeLocal(a.startDate),
//       endDate: toDateTimeLocal(a.endDate),
//       shippingCostPayer: a.shippingCostPayer,
//       auctionStatus: a.status as AuctionStatus,
//     });
//   }, []);

//   useEffect(() => {
//     if (auction) hydrateEdit(auction);
//   }, [auction, hydrateEdit]);

//   const handleSaveEdit = async () => {
//     if (!auction) return;

//     const payload: AdminAuctionUpdateRequest = {
//       categoryId: editForm.categoryId ? Number(editForm.categoryId) : undefined,
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
//       auctionStatus: editForm.auctionStatus || undefined,
//     };

//     try {
//       const updated = await adminEditAuction(auction.id, payload);
//       setAuction(updated);
//       setIsEditing(false);
//       adminNotice.show("success", "Auction updated successfully.");
//     } catch (e: unknown) {
//       const msg =
//         e instanceof Error
//           ? e.message
//           : "Something went wrong while updating the auction. Please try again.";
//       adminNotice.show("error", msg);
//     }
//   };

//   // ------------------ See more dropdown (bids from rank #4 and below) ------------------
//   const [bidHistoryOpen, setBidHistoryOpen] = useState<boolean>(false);
//   useEffect(() => {
//     setBidHistoryOpen(false);
//   }, [auctionId]);

//   const imageStageHeight = isSingleColumn ? 320 : 420;

//   // ------------------ render ------------------
//   return (
//     <div
//       style={{
//         minHeight: variant === "page" ? "100vh" : "100%",
//         background: "#F6F8FB",
//         width: "100%",
//         maxWidth: "100%",
//         boxSizing: "border-box",
//         overflowX: "hidden",
//       }}
//     >
//       <div
//         style={{
//           maxWidth: isModal ? "100%" : 1200,
//           width: "100%",
//           margin: "0 auto",
//           padding: isModal ? "12px" : "18px",
//           boxSizing: "border-box",
//           overflowX: "hidden",
//         }}
//       >
//         {/* ✅ anchor for scroll-to-top */}
//         <div ref={pageTopAnchorRef} style={{ height: 0 }} />

//         {variant === "page" && onBack && (
//           <div style={{ marginBottom: 12 }}>
//             <button
//               type="button"
//               onClick={onBack}
//               style={{
//                 height: 40,
//                 padding: "0 14px",
//                 borderRadius: 12,
//                 border: "1px solid rgba(17, 24, 39, 0.12)",
//                 background: "#FFFFFF",
//                 fontWeight: 900,
//                 cursor: "pointer",
//               }}
//             >
//               ← Back to all auctions
//             </button>
//           </div>
//         )}

//         {loading && <div style={{ padding: 18 }}>Φόρτωση...</div>}
//         {error && <div style={{ padding: 18, color: "#B91C1C" }}>Σφάλμα: {error}</div>}

//         {auction && !loading && !error && (
//           <>
//             {/* ✅ Chat card extracted (so we can render it in different place on mobile) */}
//             {(() => {
//               const chatCard = (
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: 16,
//                     boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                     overflow: "hidden",
//                     minWidth: 0,
//                   }}
//                 >
//                   <div
//                     style={{
//                       background: "#0B84F3",
//                       color: "white",
//                       padding: "12px 14px",
//                       fontWeight: 900,
//                       display: "flex",
//                       alignItems: "baseline",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <div>Auction Chat</div>
//                     <div style={{ fontWeight: 800, opacity: 0.9, fontSize: 13 }}>
//                       {auction.chat.length} messages
//                     </div>
//                   </div>

//                   <div style={{ padding: 12 }}>
//                     <div
//                       ref={chatScrollRef}
//                       style={{
//                         height: chatViewportHeight, // ✅ bigger height
//                         overflowY: "auto",
//                         paddingRight: 6,
//                       }}
//                     >
//                       {auction.chat.length === 0 ? (
//                         <div style={{ color: "#6B7280" }}>No messages yet.</div>
//                       ) : (
//                         <div style={{ display: "grid", gap: 12 }}>
//                           {auction.chat.map((m) => {
//                             const isAuctioneer =
//                               m.senderDisplayName === auction.sellerUsername;
//                             return (
//                               <div key={m.id} style={{ display: "grid", gap: 6 }}>
//                                 <div
//                                   style={{
//                                     color: "#6B7280",
//                                     fontWeight: 700,
//                                     fontSize: 12,
//                                   }}
//                                 >
//                                   {new Date(m.createdAt).toLocaleTimeString("en-US", {
//                                     hour: "numeric",
//                                     minute: "2-digit",
//                                   })}
//                                 </div>

//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     gap: 10,
//                                     alignItems: "flex-start",
//                                     minWidth: 0,
//                                   }}
//                                 >
//                                   <AvatarCircle
//                                     size={28}
//                                     name={m.senderDisplayName}
//                                     url={m.senderAvatarUrl ?? null}
//                                   />

//                                   <div
//                                     style={{
//                                       display: "grid",
//                                       gap: 6,
//                                       width: "100%",
//                                       minWidth: 0,
//                                     }}
//                                   >
//                                     <div
//                                       style={{
//                                         display: "flex",
//                                         gap: 10,
//                                         alignItems: "center",
//                                         minWidth: 0,
//                                       }}
//                                     >
//                                       <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                         {isAdmin ? (
//                                           <button
//                                             type="button"
//                                             onClick={() =>
//                                               handleOpenUserDetails(m.senderDisplayName)
//                                             }
//                                             style={{
//                                               background: "transparent",
//                                               border: "none",
//                                               padding: 0,
//                                               margin: 0,
//                                               cursor: "pointer",
//                                               fontWeight: 900,
//                                               color: "#111827",
//                                               textAlign: "left",
//                                               maxWidth: "100%",
//                                               whiteSpace: "nowrap",
//                                               overflow: "hidden",
//                                               textOverflow: "ellipsis",
//                                             }}
//                                             title={m.senderDisplayName}
//                                           >
//                                             {m.senderDisplayName}
//                                           </button>
//                                         ) : (
//                                           <div
//                                             style={{
//                                               maxWidth: "100%",
//                                               whiteSpace: "nowrap",
//                                               overflow: "hidden",
//                                               textOverflow: "ellipsis",
//                                             }}
//                                             title={m.senderDisplayName}
//                                           >
//                                             {m.senderDisplayName}
//                                           </div>
//                                         )}
//                                       </div>

//                                       {isAuctioneer && (
//                                         <div
//                                           style={{
//                                             fontSize: 12,
//                                             fontWeight: 800,
//                                             color: "#2563EB",
//                                             display: "flex",
//                                             gap: 6,
//                                             alignItems: "center",
//                                             flex: "0 0 auto",
//                                           }}
//                                         >
//                                           <span>✎</span>
//                                           <span>Auctioneer</span>
//                                         </div>
//                                       )}
//                                     </div>

//                                     <div
//                                       style={{
//                                         display: "inline-block",
//                                         background: isAuctioneer ? "#FEF3C7" : "#FFFFFF",
//                                         border: "1px solid #E5E7EB",
//                                         borderRadius: 14,
//                                         padding: "10px 12px",
//                                         maxWidth: "100%",
//                                         overflowWrap: "anywhere",
//                                         wordBreak: "break-word",
//                                       }}
//                                     >
//                                       {m.content}
//                                     </div>

//                                     {typeof m.remainingMessages === "number" && (
//                                       <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 12 }}>
//                                         Messages left: {m.remainingMessages}/25
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>

//                     {!isEnded && (
//                       <>
//                         <div
//                           style={{
//                             marginTop: 12,
//                             display: "grid",
//                             gridTemplateColumns: "minmax(0, 1fr) auto",
//                             gap: 10,
//                             alignItems: "center",
//                           }}
//                         >
//                           <input
//                             value={canChat ? newChatContent : ""}
//                             onChange={(e) => setNewChatContent(e.target.value)}
//                             disabled={!canChat}
//                             placeholder={
//                               canChat
//                                 ? "Write a message..."
//                                 : !isLoggedIn
//                                 ? "Sign in to chat..."
//                                 : chatBlockedReason ?? "Chat is not available."
//                             }
//                             style={{
//                               width: "100%",
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               outline: "none",
//                               background: canChat ? "white" : "#F9FAFB",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter" && !e.shiftKey && canChat) {
//                                 e.preventDefault();
//                                 void handleSendChat();
//                               }
//                             }}
//                           />

//                           {canChat ? (
//                             <button
//                               type="button"
//                               onClick={() => void handleSendChat()}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: 12,
//                                 border: "1px solid #111827",
//                                 background: "#111827",
//                                 color: "white",
//                                 fontWeight: 900,
//                                 cursor: "pointer",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               Send
//                             </button>
//                           ) : !isLoggedIn ? (
//                             <button
//                               type="button"
//                               onClick={() => onSignIn?.()}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: 12,
//                                 border: "1px solid #111827",
//                                 background: "#111827",
//                                 color: "white",
//                                 fontWeight: 900,
//                                 cursor: "pointer",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               Sign in to Chat
//                             </button>
//                           ) : null}
//                         </div>

//                         <NoticeInline notice={chatNotice.notice} onClose={chatNotice.clear} />

//                         {!canChat && !isLoggedIn && (
//                           <div style={{ marginTop: 8, color: "#6B7280", fontSize: 12, fontWeight: 700 }}>
//                             You need an account to chat
//                           </div>
//                         )}

//                         {!canChat && isLoggedIn && chatBlockedReason && (
//                           <div style={{ marginTop: 8, color: "#B91C1C", fontSize: 12, fontWeight: 800 }}>
//                             {chatBlockedReason}
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               );

//               return (
//                 <>
//                   <div
//                     style={{
//                       display: "grid",
//                       gridTemplateColumns: isSingleColumn
//                         ? "1fr"
//                         : "minmax(0, 1.65fr) minmax(0, 1fr)",
//                       gap: 18,
//                       alignItems: "start",
//                       width: "100%",
//                       maxWidth: "100%",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     {/* LEFT COLUMN */}
//                     <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
//                       {/* Image carousel card */}
//                       {images.length > 0 ? (
//                         <div
//                           style={{
//                             background: "white",
//                             borderRadius: 16,
//                             boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                             overflow: "hidden",
//                             minWidth: 0,
//                           }}
//                         >
//                           <div
//                             style={{
//                               position: "relative",
//                               height: imageStageHeight,
//                               background: "#F3F4F6",
//                               overflow: "hidden",
//                               zIndex: 0,
//                             }}
//                           >
//                             {mainImage ? (
//                               <img
//                                 src={mainImage}
//                                 alt="auction main"
//                                 style={{
//                                   width: "100%",
//                                   height: "100%",
//                                   objectFit: "contain",
//                                   objectPosition: "center",
//                                   cursor: "zoom-in",
//                                   background: "#F3F4F6",
//                                 }}
//                                 onClick={() => setFullscreenImageUrl(mainImage)}
//                                 onError={() => {
//                                   setBrokenImageByUrl((p) => ({ ...p, [mainImage]: true }));
//                                   setFullscreenImageUrl(null);
//                                 }}
//                               />
//                             ) : null}

//                             {auction.categoryName && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   top: 14,
//                                   right: 14,
//                                   background: "rgba(255,255,255,0.92)",
//                                   border: "1px solid rgba(229,231,235,0.9)",
//                                   borderRadius: 999,
//                                   padding: "6px 10px",
//                                   fontWeight: 700,
//                                   fontSize: 13,
//                                   zIndex: 2,
//                                   maxWidth: "calc(100% - 28px)",
//                                   whiteSpace: "nowrap",
//                                   overflow: "hidden",
//                                   textOverflow: "ellipsis",
//                                 }}
//                               >
//                                 {auction.categoryName}
//                               </div>
//                             )}

//                             {images.length > 0 && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   bottom: 14,
//                                   right: 14,
//                                   background: "rgba(17,24,39,0.75)",
//                                   color: "white",
//                                   borderRadius: 999,
//                                   padding: "8px 12px",
//                                   fontWeight: 800,
//                                   zIndex: 2,
//                                 }}
//                               >
//                                 {Math.min(selectedImageIdx + 1, images.length)}/{images.length}
//                               </div>
//                             )}

//                             {images.length > 1 && (
//                               <>
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     setSelectedImageIdx((i) => (i - 1 + images.length) % images.length)
//                                   }
//                                   style={{
//                                     position: "absolute",
//                                     left: 12,
//                                     top: "50%",
//                                     transform: "translateY(-50%)",
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 12,
//                                     border: "1px solid #E5E7EB",
//                                     background: "rgba(255,255,255,0.92)",
//                                     cursor: "pointer",
//                                     fontSize: 18,
//                                     fontWeight: 900,
//                                     zIndex: 2,
//                                   }}
//                                 >
//                                   ‹
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => setSelectedImageIdx((i) => (i + 1) % images.length)}
//                                   style={{
//                                     position: "absolute",
//                                     right: 12,
//                                     top: "50%",
//                                     transform: "translateY(-50%)",
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 12,
//                                     border: "1px solid #E5E7EB",
//                                     background: "rgba(255,255,255,0.92)",
//                                     cursor: "pointer",
//                                     fontSize: 18,
//                                     fontWeight: 900,
//                                     zIndex: 2,
//                                   }}
//                                 >
//                                   ›
//                                 </button>
//                               </>
//                             )}
//                           </div>

//                           {images.length > 1 && (
//                             <div
//                               style={{
//                                 borderTop: "1px solid #EEF2F7",
//                                 padding: 12,
//                                 display: "flex",
//                                 gap: 12,
//                                 overflowX: "auto",
//                                 WebkitOverflowScrolling: "touch",
//                                 background: "#FFFFFF",
//                                 position: "relative",
//                                 zIndex: 1,
//                               }}
//                             >
//                               {images.map((u, idx) => {
//                                 const active = idx === selectedImageIdx;
//                                 return (
//                                   <button
//                                     key={u + idx}
//                                     type="button"
//                                     onClick={() => setSelectedImageIdx(idx)}
//                                     style={{
//                                       flex: "0 0 auto",
//                                       width: 150,
//                                       height: 92,
//                                       borderRadius: 14,
//                                       border: active ? "3px solid #111827" : "1px solid #E5E7EB",
//                                       padding: 0,
//                                       overflow: "hidden",
//                                       cursor: "pointer",
//                                       background: "#F3F4F6",
//                                       boxSizing: "border-box",
//                                     }}
//                                   >
//                                     <img
//                                       src={u}
//                                       alt={`thumb ${idx + 1}`}
//                                       style={{
//                                         width: "100%",
//                                         height: "100%",
//                                         objectFit: "contain",
//                                         objectPosition: "center",
//                                         background: "#F3F4F6",
//                                       }}
//                                       onError={() => {
//                                         setBrokenImageByUrl((p) => ({ ...p, [u]: true }));
//                                       }}
//                                     />
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         // ✅ No image: μην εμφανίζεις το image box, μόνο μήνυμα
//                         <div
//                           style={{
//                             background: "white",
//                             borderRadius: 16,
//                             boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                             padding: 16,
//                             minWidth: 0,
//                             color: "#6B7280",
//                             fontWeight: 800,
//                           }}
//                         >
//                           Image is not available
//                         </div>
//                       )}

//                       {/* Seller information card */}
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div style={{ fontWeight: 800, color: "#111827", marginBottom: 10 }}>
//                           Seller Information
//                         </div>

//                         <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
//                           <AvatarCircle
//                             size={44}
//                             name={auction.sellerUsername}
//                             url={auction.sellerAvatarUrl ?? null}
//                           />

//                           <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
//                             <div style={{ fontWeight: 800, color: "#111827" }}>
//                               {isAdmin ? (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleOpenUserDetails(auction.sellerUsername)}
//                                   style={{
//                                     background: "transparent",
//                                     border: "none",
//                                     padding: 0,
//                                     margin: 0,
//                                     cursor: "pointer",
//                                     fontWeight: 800,
//                                     color: "#111827",
//                                     textAlign: "left",
//                                     maxWidth: "100%",
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                   }}
//                                   title={auction.sellerUsername}
//                                 >
//                                   {auction.sellerUsername}
//                                 </button>
//                               ) : (
//                                 <div
//                                   style={{
//                                     maxWidth: "100%",
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                   }}
//                                   title={auction.sellerUsername}
//                                 >
//                                   {auction.sellerUsername}
//                                 </div>
//                               )}
//                             </div>

//                             <div
//                               style={{
//                                 display: "flex",
//                                 gap: 6,
//                                 alignItems: "center",
//                                 color: "#6B7280",
//                                 minWidth: 0,
//                               }}
//                             >
//                               <span style={{ fontSize: 14 }}>
//                                 <svg
//                                   xmlns="http://www.w3.org/2000/svg"
//                                   width="18"
//                                   height="18"
//                                   viewBox="0 0 24 24"
//                                   fill="none"
//                                 >
//                                   <path
//                                     d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"
//                                     stroke="currentColor"
//                                     strokeWidth="2"
//                                     strokeLinejoin="round"
//                                   />
//                                   <circle
//                                     cx="12"
//                                     cy="11"
//                                     r="2.5"
//                                     stroke="currentColor"
//                                     strokeWidth="2"
//                                   />
//                                 </svg>
//                               </span>
//                               <span
//                                 style={{
//                                   whiteSpace: "nowrap",
//                                   overflow: "hidden",
//                                   textOverflow: "ellipsis",
//                                 }}
//                                 title={getCityFromLocation(auction.sellerLocation)}
//                               >
//                                 {getCityFromLocation(auction.sellerLocation)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Description card */}
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
//                           Description
//                         </div>

//                         <div
//                           style={{
//                             color: "#374151",
//                             lineHeight: 1.55,
//                             overflowWrap: "anywhere",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {auction.description || auction.shortDescription || "—"}
//                         </div>

//                         <div
//                           style={{
//                             marginTop: 14,
//                             paddingTop: 14,
//                             borderTop: "1px solid #EEF2F7",
//                             display: "grid",
//                             gridTemplateColumns: isSingleColumn
//                               ? "1fr"
//                               : "minmax(0, 1fr) minmax(0, 1fr)",
//                             gap: 12,
//                           }}
//                         >
//                           <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
//                                 Starting price
//                               </div>
//                               <div style={{ fontWeight: 900, color: "#111827" }}>
//                                 {formatMoneyEUR(auction.startingAmount)}
//                               </div>
//                             </div>
//                           </div>

//                           <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                             <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                               <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
//                                 Minimum raise
//                               </div>
//                               <div style={{ fontWeight: 900, color: "#111827" }}>
//                                 {formatMoneyEUR(auction.minBidIncrement)}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* ✅ Chat stays here ONLY on non-mobile */}
//                       {!isMobile && chatCard}
//                     </div>

//                     {/* RIGHT COLUMN */}
//                     <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
//                       <div
//                         style={{
//                           background: "white",
//                           borderRadius: 16,
//                           boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                           padding: 16,
//                           minWidth: 0,
//                         }}
//                       >
//                         <div
//                           style={{
//                             fontSize: 18,
//                             fontWeight: 900,
//                             color: "#111827",
//                             overflowWrap: "anywhere",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {auction.title}
//                         </div>

//                         <div
//                           style={{
//                             marginTop: 12,
//                             padding: 14,
//                             borderRadius: 14,
//                             background: "#F9FAFB",
//                             border: "1px solid #EEF2F7",
//                           }}
//                         >
//                           <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                             <span style={{ fontSize: 18 }}>🕒</span>
//                             <div style={{ fontWeight: 800, color: "#374151" }}>
//                               Time Remaining
//                             </div>
//                           </div>
//                           <div
//                             style={{
//                               marginTop: 8,
//                               fontWeight: 900,
//                               color: timeBox.ended ? "#DC2626" : "#111827",
//                               overflowWrap: "anywhere",
//                               wordBreak: "break-word",
//                             }}
//                           >
//                             {timeBox.label}
//                           </div>
//                         </div>

//                         {!isEnded && (
//                           <div style={{ marginTop: 16 }}>
//                             <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                               Place Your Bid{" "}
//                               {minNextBid != null ? `(min ${formatMoneyEUR(minNextBid)})` : ""}
//                             </div>

//                             <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
//                               <div
//                                 style={{
//                                   flex: 1,
//                                   minWidth: 0,
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 8,
//                                   border: "1px solid #E5E7EB",
//                                   borderRadius: 12,
//                                   padding: "10px 12px",
//                                   background: canBid ? "white" : "#F9FAFB",
//                                   boxSizing: "border-box",
//                                 }}
//                               >
//                                 <span style={{ color: "#9CA3AF", fontWeight: 900 }}>€</span>
//                                 <input
//                                   type="number"
//                                   min={0}
//                                   step="1"
//                                   value={bidAmount}
//                                   onChange={(e) => setBidAmount(e.target.value)}
//                                   placeholder=""
//                                   disabled={!canBid}
//                                   style={{
//                                     width: "100%",
//                                     border: "none",
//                                     outline: "none",
//                                     background: "transparent",
//                                     fontSize: 14,
//                                     minWidth: 0,
//                                   }}
//                                 />
//                               </div>

//                               {canBid ? (
//                                 <button
//                                   type="button"
//                                   onClick={handleBid}
//                                   style={{
//                                     padding: "10px 14px",
//                                     borderRadius: 12,
//                                     border: "1px solid #111827",
//                                     background: "#111827",
//                                     color: "white",
//                                     fontWeight: 800,
//                                     cursor: "pointer",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   Place Bid
//                                 </button>
//                               ) : (
//                                 <button
//                                   type="button"
//                                   onClick={() => onSignIn?.()}
//                                   style={{
//                                     padding: "10px 14px",
//                                     borderRadius: 12,
//                                     border: "1px solid #111827",
//                                     background: "#111827",
//                                     color: "white",
//                                     fontWeight: 800,
//                                     cursor: "pointer",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   Sign in to Bid
//                                 </button>
//                               )}
//                             </div>

//                             <NoticeInline notice={bidNotice.notice} onClose={bidNotice.clear} />
//                           </div>
//                         )}

//                         {/* Bidder rankings (Top 3 only) */}
//                         <div style={{ marginTop: 16 }}>
//                           <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
//                             Bidder Rankings ({sortedBids.length})
//                           </div>

//                           {sortedBids.length === 0 ? (
//                             <div style={{ color: "#6B7280" }}>No bids yet.</div>
//                           ) : (
//                             <div style={{ display: "grid", gap: 10 }}>
//                               {sortedBids.slice(0, 3).map((b, idx) => {
//                                 const leading = idx === 0;
//                                 return (
//                                   <div
//                                     key={b.id}
//                                     style={{
//                                       borderRadius: 14,
//                                       border: leading
//                                         ? "2px solid rgba(59,130,246,0.5)"
//                                         : "1px solid #E5E7EB",
//                                       padding: 12,
//                                       display: "flex",
//                                       alignItems: "center",
//                                       justifyContent: "space-between",
//                                       gap: 12,
//                                       background: "white",
//                                       minWidth: 0,
//                                     }}
//                                   >
//                                     <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
//                                       <div
//                                         style={{
//                                           width: 44,
//                                           height: 44,
//                                           borderRadius: 999,
//                                           background: "#2563EB",
//                                           display: "grid",
//                                           placeItems: "center",
//                                           color: "white",
//                                           fontWeight: 900,
//                                           flex: "0 0 auto",
//                                         }}
//                                       >
//                                         #{idx + 1}
//                                       </div>

//                                       <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                                         <AvatarCircle
//                                           size={38}
//                                           name={b.bidderUsername}
//                                           url={b.bidderAvatarUrl ?? null}
//                                           ring={leading}
//                                         />
//                                         <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                                           <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                             {b.bidderUsername ? (
//                                               isAdmin ? (
//                                                 <button
//                                                   type="button"
//                                                   onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                                                   style={{
//                                                     background: "transparent",
//                                                     border: "none",
//                                                     padding: 0,
//                                                     margin: 0,
//                                                     cursor: "pointer",
//                                                     fontWeight: 900,
//                                                     color: "#111827",
//                                                     textAlign: "left",
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </button>
//                                               ) : (
//                                                 <div
//                                                   style={{
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </div>
//                                               )
//                                             ) : (
//                                               "Unknown"
//                                             )}
//                                           </div>
//                                           <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                                             {timeAgo(b.createdAt, now)}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>

//                                     <div style={{ textAlign: "right", flex: "0 0 auto" }}>
//                                       <div style={{ color: "#2563EB", fontWeight: 900 }}>
//                                         {formatMoneyEUR(b.amount)}
//                                       </div>
//                                       {leading && (
//                                         <div style={{ color: "#2563EB", fontWeight: 800, fontSize: 13 }}>
//                                           Leading
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           )}

//                           {sortedBids.length > 3 && (
//                             <div style={{ marginTop: 12 }}>
//                               <button
//                                 type="button"
//                                 onClick={() => setBidHistoryOpen((v) => !v)}
//                                 style={{
//                                   width: "100%",
//                                   border: "1px solid rgba(17,24,39,0.14)",
//                                   background: "#FFFFFF",
//                                   borderRadius: 12,
//                                   padding: "10px 12px",
//                                   fontWeight: 900,
//                                   cursor: "pointer",
//                                   fontSize: 13,
//                                 }}
//                               >
//                                 {bidHistoryOpen ? "Hide" : "See more"}
//                               </button>
//                             </div>
//                           )}

//                           {bidHistoryOpen && sortedBids.length > 3 && (
//                             <div
//                               style={{
//                                 marginTop: 12,
//                                 borderRadius: 16,
//                                 border: "1px solid #E5E7EB",
//                                 overflow: "hidden",
//                                 background: "#FFFFFF",
//                                 minWidth: 0,
//                               }}
//                             >
//                               <div
//                                 style={{
//                                   padding: "10px 12px",
//                                   borderBottom: "1px solid #EEF2F7",
//                                   display: "flex",
//                                   justifyContent: "space-between",
//                                   alignItems: "baseline",
//                                   gap: 10,
//                                 }}
//                               >
//                                 <div style={{ fontWeight: 950, color: "#111827" }}>More bids</div>
//                                 <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                                   Scroll to view
//                                 </div>
//                               </div>

//                               <div
//                                 style={{
//                                   maxHeight: 260,
//                                   overflowY: "auto",
//                                   padding: 12,
//                                   display: "grid",
//                                   gap: 10,
//                                   background: "#F9FAFB",
//                                 }}
//                               >
//                                 {sortedBids.slice(3).map((b) => {
//                                   return (
//                                     <div
//                                       key={`more-${b.id}`}
//                                       style={{
//                                         borderRadius: 14,
//                                         border: "1px solid #E5E7EB",
//                                         background: "#FFFFFF",
//                                         padding: 12,
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         alignItems: "center",
//                                         gap: 12,
//                                         minWidth: 0,
//                                       }}
//                                     >
//                                       <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                                         <AvatarCircle size={38} name={b.bidderUsername} url={b.bidderAvatarUrl ?? null} />
//                                         <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
//                                           <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
//                                             {b.bidderUsername ? (
//                                               isAdmin ? (
//                                                 <button
//                                                   type="button"
//                                                   onClick={() => handleOpenUserDetails(b.bidderUsername)}
//                                                   style={{
//                                                     background: "transparent",
//                                                     border: "none",
//                                                     padding: 0,
//                                                     margin: 0,
//                                                     cursor: "pointer",
//                                                     fontWeight: 900,
//                                                     color: "#111827",
//                                                     textAlign: "left",
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </button>
//                                               ) : (
//                                                 <div
//                                                   style={{
//                                                     maxWidth: "100%",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                   }}
//                                                   title={b.bidderUsername}
//                                                 >
//                                                   {b.bidderUsername}
//                                                 </div>
//                                               )
//                                             ) : (
//                                               "Unknown"
//                                             )}
//                                           </div>

//                                           <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
//                                             {timeAgo(b.createdAt, now)}
//                                           </div>
//                                         </div>
//                                       </div>

//                                       <div style={{ textAlign: "right", flex: "0 0 auto" }}>
//                                         <div style={{ color: "#2563EB", fontWeight: 950 }}>
//                                           {formatMoneyEUR(b.amount)}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ✅ On mobile: chat goes to the END of the page (after title/time/bids) */}
//                   {isMobile && <div style={{ marginTop: 14 }}>{chatCard}</div>}
//                 </>
//               );
//             })()}

//             {/* ADMIN block */}
//             {isAdmin && (
//               <div style={{ marginTop: 18 }}>
//                 <div
//                   style={{
//                     background: "white",
//                     borderRadius: 16,
//                     boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//                     padding: 16,
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                     overflowX: "hidden",
//                   }}
//                 >
//                   <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
//                     <div style={{ fontWeight: 900, color: "#111827" }}>Admin: Edit auction</div>
//                     {!isEditing ? (
//                       <button
//                         type="button"
//                         onClick={() => setIsEditing(true)}
//                         style={{
//                           padding: "8px 12px",
//                           borderRadius: 12,
//                           border: "1px solid #E5E7EB",
//                           background: "white",
//                           cursor: "pointer",
//                           fontWeight: 800,
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         Open editor
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           if (auction) hydrateEdit(auction);
//                           setIsEditing(false);
//                         }}
//                         style={{
//                           padding: "8px 12px",
//                           borderRadius: 12,
//                           border: "1px solid #E5E7EB",
//                           background: "white",
//                           cursor: "pointer",
//                           fontWeight: 800,
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         Close
//                       </button>
//                     )}
//                   </div>

//                   <NoticeInline notice={adminNotice.notice} onClose={adminNotice.clear} />

//                   {isEditing && (
//                     <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Title
//                           <input
//                             value={editForm.title}
//                             onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Category ID (optional)
//                           <input
//                             value={editForm.categoryId}
//                             onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                         Short description
//                         <input
//                           value={editForm.shortDescription}
//                           onChange={(e) => setEditForm((p) => ({ ...p, shortDescription: e.target.value }))}
//                           style={{
//                             border: "1px solid #E5E7EB",
//                             borderRadius: 12,
//                             padding: "10px 12px",
//                             minWidth: 0,
//                             boxSizing: "border-box",
//                           }}
//                         />
//                       </label>

//                       <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                         Full description
//                         <textarea
//                           value={editForm.description}
//                           onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
//                           rows={4}
//                           style={{
//                             border: "1px solid #E5E7EB",
//                             borderRadius: 12,
//                             padding: "10px 12px",
//                             resize: "vertical",
//                             minWidth: 0,
//                             boxSizing: "border-box",
//                           }}
//                         />
//                       </label>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Starting amount
//                           <input
//                             value={editForm.startingAmount}
//                             onChange={(e) => setEditForm((p) => ({ ...p, startingAmount: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Min bid increment
//                           <input
//                             value={editForm.minBidIncrement}
//                             onChange={(e) => setEditForm((p) => ({ ...p, minBidIncrement: e.target.value }))}
//                             type="number"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Start date
//                           <input
//                             value={editForm.startDate}
//                             onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
//                             type="datetime-local"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           End date
//                           <input
//                             value={editForm.endDate}
//                             onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
//                             type="datetime-local"
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           />
//                         </label>
//                       </div>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
//                           gap: 10,
//                         }}
//                       >
//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Shipping cost payer
//                           <select
//                             value={editForm.shippingCostPayer}
//                             onChange={(e) =>
//                               setEditForm((p) => ({
//                                 ...p,
//                                 shippingCostPayer: e.target.value as ShippingCostPayer,
//                               }))
//                             }
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               background: "white",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           >
//                             <option value="SELLER">SELLER</option>
//                             <option value="BUYER">BUYER</option>
//                             <option value="SPLIT">SPLIT</option>
//                           </select>
//                         </label>

//                         <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
//                           Status
//                           <select
//                             value={editForm.auctionStatus || ""}
//                             onChange={(e) =>
//                               setEditForm((p) => ({
//                                 ...p,
//                                 auctionStatus: e.target.value as AuctionStatus | "",
//                               }))
//                             }
//                             style={{
//                               border: "1px solid #E5E7EB",
//                               borderRadius: 12,
//                               padding: "10px 12px",
//                               background: "white",
//                               minWidth: 0,
//                               boxSizing: "border-box",
//                             }}
//                           >
//                             <option value="">(no change)</option>
//                             <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
//                             <option value="ACTIVE">ACTIVE</option>
//                             <option value="EXPIRED">EXPIRED</option>
//                             <option value="CANCELLED">CANCELLED</option>
//                           </select>
//                         </label>
//                       </div>

//                       <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             if (auction) hydrateEdit(auction);
//                             setIsEditing(false);
//                           }}
//                           style={{
//                             padding: "10px 14px",
//                             borderRadius: 12,
//                             border: "1px solid #E5E7EB",
//                             background: "white",
//                             cursor: "pointer",
//                             fontWeight: 800,
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => void handleSaveEdit()}
//                           style={{
//                             padding: "10px 14px",
//                             borderRadius: 12,
//                             border: "1px solid #111827",
//                             background: "#111827",
//                             color: "white",
//                             cursor: "pointer",
//                             fontWeight: 900,
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           Save changes
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Fullscreen overlay */}
//       {fullscreenImageUrl && (
//         <div
//           onClick={() => setFullscreenImageUrl(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.82)",
//             display: "grid",
//             placeItems: "center",
//             zIndex: 9999,
//             cursor: "zoom-out",
//             padding: 16,
//           }}
//         >
//           <img
//             src={fullscreenImageUrl}
//             alt="fullscreen"
//             style={{
//               maxWidth: "92vw",
//               maxHeight: "92vh",
//               borderRadius: 14,
//               boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
//               background: "white",
//             }}
//             onError={() => {
//               setBrokenImageByUrl((p) => ({ ...p, [fullscreenImageUrl]: true }));
//               setFullscreenImageUrl(null);
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuctionDetailsPage;




// AuctionDetailsPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage, IStompSocket, StompSubscription } from "@stomp/stompjs";

import { getAuctionById } from "../api/Springboot/backendAuctionService";
import { placeBid } from "../api/Springboot/BackendBidService";
import { sendChatMessage } from "../api/Springboot/backendChatService";
import { adminEditAuction } from "../api/admin/backendAdminAuctionService";

import type {
  AdminAuctionUpdateRequest,
  AuctionDetails,
  AuctionStatus,
  ShippingCostPayer,
} from "../models/Springboot/Auction";
import type { AuthUserDto } from "../models/Springboot/UserEntity";

interface AuctionDetailsPageProps {
  auctionId: number;
  onBack?: () => void;
  currentUser: AuthUserDto | null;
  onOpenUserDetailsAsAdmin?: (username: string) => void;

  onSignIn?: () => void;
  onSignUp?: () => void;

  onBidUpdate?: (u: {
    auctionId: number;
    amount: number;
    bidderUsername: string;
    newEndDate: string;
  }) => void;

  onAuctionLoaded?: (a: AuctionDetails) => void;

  variant?: "page" | "modal";
}

// ✅ WebSocket DTO (updated: bidderAvatarUrl)
interface BidEventDto {
  id: number;
  amount: number;
  bidderUsername: string;
  createdAt: string;
  auctionId: number;
  newEndDate: string;
  bidderAvatarUrl?: string | null;
}

interface ChatMessageDto {
  id: number;
  senderDisplayName: string;
  senderAvatarUrl?: string | null;
  senderFirebaseId: string;
  content: string;
  createdAt: string;
  remainingMessages?: number;
}

const DEFAULT_AVATAR_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%25' height='100%25' rx='999' fill='%23E5E7EB'/%3E%3Cpath d='M32 34c6 0 11-5 11-11S38 12 32 12s-11 5-11 11 5 11 11 11zm0 6c-10 0-18 6-18 14h36c0-8-8-14-18-14z' fill='%239CA3AF'/%3E%3C/svg%3E";

function formatMoneyEUR(value: number): string {
  try {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value}€`;
  }
}

function timeAgo(iso: string, now: Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = now.getTime() - d.getTime();
  const s = Math.max(0, Math.floor(diffMs / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);

  if (day > 0) return `${day}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return `${s}s ago`;
}

function formatTimeRemaining(
  endIso: string,
  now: Date
): { label: string; ended: boolean } {
  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return { label: endIso, ended: false };
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return { label: "Ended", ended: true };

  let total = Math.floor(diff / 1000);
  const days = Math.floor(total / (24 * 3600));
  total -= days * 24 * 3600;
  const hours = Math.floor(total / 3600);
  total -= hours * 3600;
  const minutes = Math.floor(total / 60);
  const seconds = total - minutes * 60;

  if (days > 0)
    return {
      label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      ended: false,
    };
  if (hours > 0) return { label: `${hours}h ${minutes}m ${seconds}s`, ended: false };
  if (minutes > 0) return { label: `${minutes}m ${seconds}s`, ended: false };
  return { label: `${seconds}s`, ended: false };
}

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  return value.length >= 16 ? value.slice(0, 16) : value;
}

type NoticeType = "success" | "error";
type NoticeState = { type: NoticeType; text: string } | null;

function useAutoDismissNotice(timeoutMs = 4200) {
  const [notice, setNotice] = useState<NoticeState>(null);
  const timerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotice(null);
  }, []);

  const show = useCallback(
    (type: NoticeType, text: string) => {
      setNotice({ type, text });
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setNotice(null);
        timerRef.current = null;
      }, timeoutMs);
    },
    [timeoutMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { notice, show, clear };
}

const NoticeInline: React.FC<{
  notice: NoticeState;
  onClose: () => void;
}> = ({ notice, onClose }) => {
  if (!notice) return null;

  const isErr = notice.type === "error";
  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: 12,
        border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`,
        background: isErr ? "#FEF2F2" : "#F0FDF4",
        color: isErr ? "#991B1B" : "#166534",
        padding: "10px 12px",
        fontWeight: 800,
        fontSize: 13,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ lineHeight: 1.35 }}>{notice.text}</div>

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
};

/* =========================================================
   ✅ AvatarCircle έξω από component + React.memo
   ========================================================= */
const AvatarCircle = React.memo(
  ({
    size,
    name,
    url,
    ring,
  }: {
    size: number;
    name?: string;
    url?: string | null;
    ring?: boolean;
  }) => {
    const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          overflow: "hidden",
          flex: "0 0 auto",
          boxShadow: ring ? "0 0 0 3px rgba(59,130,246,0.25)" : undefined,
          background: "#EEF2FF",
          display: "grid",
          placeItems: "center",
        }}
      >
        {url ? (
          <img
            src={url}
            alt={name ?? "avatar"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
            }}
          />
        ) : (
          <span style={{ fontWeight: 800, color: "#4F46E5" }}>{initial}</span>
        )}
      </div>
    );
  }
);
AvatarCircle.displayName = "AvatarCircle";
/* ========================================================= */

const AuctionDetailsPage: React.FC<AuctionDetailsPageProps> = ({
  auctionId,
  onBack,
  currentUser,
  onOpenUserDetailsAsAdmin,
  onSignIn,
  onBidUpdate,
  onAuctionLoaded,
  variant = "page",
}) => {
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [now, setNow] = useState<Date>(new Date());

  // ✅ responsive (για να μην δημιουργείται horizontal scroll σε modal / στενά πλάτη)
  const [vw, setVw] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isModal = variant === "modal";
  const isSingleColumn = isModal || vw < 980;

  // ✅ αυτό είναι “phone” breakpoint (για να πάει το chat στο τέλος)
  const isMobile = vw <= 640;

  const chatViewportHeight = isModal ? 260 : isMobile ? 380 : 320;

  // ✅ stable refs για callbacks
  const onAuctionLoadedRef =
    useRef<AuctionDetailsPageProps["onAuctionLoaded"]>(onAuctionLoaded);
  const onBidUpdateRef =
    useRef<AuctionDetailsPageProps["onBidUpdate"]>(onBidUpdate);

  useEffect(() => {
    onAuctionLoadedRef.current = onAuctionLoaded;
  }, [onAuctionLoaded]);

  useEffect(() => {
    onBidUpdateRef.current = onBidUpdate;
  }, [onBidUpdate]);

  // images
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);

  // ✅ track broken images (Cloudflare expiry etc.)
  const [brokenImageByUrl, setBrokenImageByUrl] = useState<Record<string, boolean>>({});

  // bid/chat
  const [bidAmount, setBidAmount] = useState<string>("");
  const [newChatContent, setNewChatContent] = useState<string>("");

  // ✅ inline messages (auto-hide + manual close)
  const bidNotice = useAutoDismissNotice(4200);
  const chatNotice = useAutoDismissNotice(4200);
  const adminNotice = useAutoDismissNotice(4200);

  // ------------------ Chat auto-scroll (default to bottom) ------------------
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const didInitialChatScrollRef = useRef<boolean>(false);

  const scrollChatToBottom = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  // ws
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const bidSubRef = useRef<StompSubscription | null>(null);
  const chatSubRef = useRef<StompSubscription | null>(null);

  const isAdmin = currentUser?.roleName === "Admin";

  const handleOpenUserDetails = useCallback(
    (username: string) => {
      if (!isAdmin) return;
      if (!onOpenUserDetailsAsAdmin) return;
      onOpenUserDetailsAsAdmin(username);
    },
    [isAdmin, onOpenUserDetailsAsAdmin]
  );

  // ✅ optimistic unlock for chat after successful bid (no "locked" feeling)
  const [chatUnlockedOptimistic, setChatUnlockedOptimistic] = useState(false);

  // ------------------ ABSOLUTE scroll-to-top (works on mobile + modal) ------------------
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // reduce browser scroll restoration surprises on SPA
    try {
      if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      // ignore
    }
  }, []);

  const findScrollParent = useCallback((el: HTMLElement | null): HTMLElement | null => {
    let cur: HTMLElement | null = el;
    while (cur) {
      const style = window.getComputedStyle(cur);
      const overflowY = style.overflowY;
      const canScrollY =
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        cur.scrollHeight > cur.clientHeight;

      if (canScrollY) return cur;
      cur = cur.parentElement;
    }
    return null;
  }, []);

  const scrollToAbsoluteTop = useCallback(() => {
    if (typeof window === "undefined") return;

    // 1) window/page scroll
    window.scrollTo(0, 0);
    if (document?.documentElement) document.documentElement.scrollTop = 0;
    if (document?.body) document.body.scrollTop = 0;

    // 2) modal/layout scroll container (if any)
    const root = rootRef.current;
    const sp = findScrollParent(root);
    if (sp) {
      sp.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [findScrollParent]);

  // Scroll on open / auction change (multiple attempts for mobile/layout shifts)
  useEffect(() => {
    scrollToAbsoluteTop();

    const raf1 = window.requestAnimationFrame(() => scrollToAbsoluteTop());
    const raf2 = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => scrollToAbsoluteTop());
    });

    const t = window.setTimeout(() => scrollToAbsoluteTop(), 80);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(t);
    };
  }, [auctionId, variant, scrollToAbsoluteTop]);

  // Run again after auction is rendered (important on mobile/heavy content)
  useEffect(() => {
    if (!auction) return;
    const t = window.setTimeout(() => scrollToAbsoluteTop(), 0);
    return () => window.clearTimeout(t);
  }, [auction?.id, scrollToAbsoluteTop]);

  // timers / esc
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImageUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // clear notices on auction change
  useEffect(() => {
    bidNotice.clear();
    chatNotice.clear();
    adminNotice.clear();
    setBidAmount("");
    setNewChatContent("");
    didInitialChatScrollRef.current = false; // ✅ reset initial scroll per auction
    setBrokenImageByUrl({});
    setChatUnlockedOptimistic(false);
  }, [auctionId, bidNotice.clear, chatNotice.clear, adminNotice.clear]);

  // load auction
  const loadAuction = useCallback(async () => {
    setError(null);
    setLoading(true);
    setAuction(null);

    try {
      const res = await getAuctionById(auctionId);
      setAuction(res);
      onAuctionLoadedRef.current?.(res);
      setSelectedImageIdx(0);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Something went wrong while loading this auction. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    void loadAuction();
  }, [loadAuction]);

  // STOMP connect once
  useEffect(() => {
    const socket = new SockJS("/ws");
    const client = new Client({
      webSocketFactory: () => socket as unknown as IStompSocket,
      reconnectDelay: 5000,
      debug: () => {},
    });

    client.onConnect = () => setStompClient(client);
    client.onStompError = (frame) => {
      // eslint-disable-next-line no-console
      console.error("STOMP error (details):", frame.headers["message"], frame.body);
    };

    client.activate();

    return () => {
      if (bidSubRef.current) {
        bidSubRef.current.unsubscribe();
        bidSubRef.current = null;
      }
      if (chatSubRef.current) {
        chatSubRef.current.unsubscribe();
        chatSubRef.current = null;
      }
      client.deactivate();
    };
  }, []);

  // Subscribe bids/chat
  useEffect(() => {
    if (!stompClient || !stompClient.connected) return;

    if (bidSubRef.current) {
      bidSubRef.current.unsubscribe();
      bidSubRef.current = null;
    }
    if (chatSubRef.current) {
      chatSubRef.current.unsubscribe();
      chatSubRef.current = null;
    }

    const bidTopic = `/topic/auctions/${auctionId}`;
    const bidSub = stompClient.subscribe(bidTopic, (message: IMessage) => {
      try {
        const payload: BidEventDto = JSON.parse(message.body);

        onBidUpdateRef.current?.({
          auctionId: payload.auctionId,
          amount: payload.amount,
          bidderUsername: payload.bidderUsername,
          newEndDate: payload.newEndDate,
        });

        setAuction((prev) => {
          if (!prev || prev.id !== payload.auctionId) return prev;

          const newBid = {
            id: payload.id,
            amount: payload.amount,
            bidderUsername: payload.bidderUsername,
            createdAt: payload.createdAt,
            auctionId: payload.auctionId,
            bidderAvatarUrl: payload.bidderAvatarUrl ?? null,
          };

          const already = prev.bids.some((b) => b.id === newBid.id);
          const bids = already ? prev.bids : [newBid, ...prev.bids];

          // ✅ if you have a bid, you can chat (optimistic UX)
          return {
            ...prev,
            endDate: payload.newEndDate,
            bids,
            eligibleForChat: true,
          };
        });

        setChatUnlockedOptimistic(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse BidEventDto", err);
      }
    });
    bidSubRef.current = bidSub;

    const chatTopic = `/topic/auctions/${auctionId}/chat`;
    const chatSub = stompClient.subscribe(chatTopic, (message: IMessage) => {
      try {
        const payload: ChatMessageDto = JSON.parse(message.body);
        setAuction((prev) => {
          if (!prev || prev.id !== auctionId) return prev;
          const exists = prev.chat.some((m) => m.id === payload.id);
          if (exists) return prev;
          return { ...prev, chat: [...prev.chat, payload] };
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse ChatMessageDto", err);
      }
    });
    chatSubRef.current = chatSub;

    return () => {
      bidSub.unsubscribe();
      chatSub.unsubscribe();
      if (bidSubRef.current === bidSub) bidSubRef.current = null;
      if (chatSubRef.current === chatSub) chatSubRef.current = null;
    };
  }, [stompClient, auctionId]);

  // auto-scroll first load chat (once per auction)
  useEffect(() => {
    if (!auction) return;
    if (didInitialChatScrollRef.current) return;

    window.setTimeout(() => {
      scrollChatToBottom();
      didInitialChatScrollRef.current = true;
    }, 0);
  }, [auction, scrollChatToBottom]);

  // auto-scroll on new messages ONLY if user is near bottom
  useEffect(() => {
    if (!auction) return;
    const el = chatScrollRef.current;
    if (!el) return;

    const threshold = 90; // px
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);

    if (distanceFromBottom <= threshold) {
      window.setTimeout(() => scrollChatToBottom(), 0);
    }
  }, [auction?.chat.length, auction, scrollChatToBottom]);

  // derived
  const allImages = auction?.imageUrls ?? [];
  const images = useMemo(
    () => allImages.filter((u) => !!u && !brokenImageByUrl[u]),
    [allImages, brokenImageByUrl]
  );

  useEffect(() => {
    if (selectedImageIdx >= images.length && images.length > 0) {
      setSelectedImageIdx(0);
    }
    if (images.length === 0) {
      setSelectedImageIdx(0);
      setFullscreenImageUrl(null);
    }
  }, [images.length, selectedImageIdx]);

  const mainImage =
    images.length > 0 ? images[Math.min(selectedImageIdx, images.length - 1)] : null;

  const timeBox = useMemo(() => {
    if (!auction) return { label: "", ended: false };
    return formatTimeRemaining(auction.endDate, now);
  }, [auction, now]);

  const isActive = useMemo(() => {
    if (!auction) return false;
    const end = new Date(auction.endDate);
    if (Number.isNaN(end.getTime())) return false;
    return end.getTime() - now.getTime() > 0;
  }, [auction, now]);

  const canBid = !!auction && auction.eligibleForBid && isActive;

  const isLoggedIn = !!currentUser;

  // ✅ effective eligibility for chat (backend flag OR optimistic unlock)
  const effectiveEligibleForChat = useMemo(() => {
    if (!auction) return false;
    return auction.eligibleForChat || chatUnlockedOptimistic;
  }, [auction, chatUnlockedOptimistic]);

  const canChat = !!auction && isLoggedIn && effectiveEligibleForChat && isActive;

  const chatBlockedReason = useMemo(() => {
    if (!auction) return null;
    if (!isActive) return "Chat is closed because the auction has ended.";
    if (!isLoggedIn) return null;
    if (!effectiveEligibleForChat) return "Place a bid to unlock the chat for this auction.";
    return null;
  }, [auction, isActive, isLoggedIn, effectiveEligibleForChat]);

  const isEnded = useMemo(() => {
    if (!auction) return false;
    if (auction.status === "EXPIRED" || auction.status === "CANCELLED") return true;
    return timeBox.ended;
  }, [auction, timeBox.ended]);

  type BidItem = AuctionDetails["bids"][number] & { bidderAvatarUrl?: string | null };

  const sortedBids: BidItem[] = useMemo(() => {
    if (!auction) return [];
    const copy = [...(auction.bids as BidItem[])];
    copy.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
    return copy;
  }, [auction]);

  const currentTopBid = sortedBids.length > 0 ? sortedBids[0].amount : null;

  const minNextBid = useMemo(() => {
    if (!auction) return null;
    const base = currentTopBid ?? auction.startingAmount;
    return (base ?? 0) + (auction.minBidIncrement ?? 0);
  }, [auction, currentTopBid]);

  const getCityFromLocation = (sellerLocation: string | null): string => {
    if (!sellerLocation) return "Unknown";
    const [city] = sellerLocation.split(",");
    return city.trim();
  };

  // actions
  const handleBid = async () => {
    if (!auction) return;

    const raw = bidAmount.trim();
    if (!raw) {
      bidNotice.show("error", "Please enter a bid amount.");
      return;
    }

    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) {
      bidNotice.show("error", "Please enter a valid amount.");
      return;
    }

    try {
      await placeBid(auction.id, amount);

      // ✅ Optimistic unlock chat ONLY on success (no unlock on backend error)
      setChatUnlockedOptimistic(true);
      setAuction((prev) => (prev ? { ...prev, eligibleForChat: true } : prev));

      bidNotice.show("success", "Your bid was placed successfully!");
      setBidAmount("");

      // ❌ Do NOT reload the entire auction (avoids "refresh" feeling)
      // await loadAuction();
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Something went wrong while placing your bid. Please try again.";
      bidNotice.show("error", msg);
    }
  };

  const handleSendChat = async () => {
    if (!auction) return;
    const text = newChatContent.trim();
    if (!text) {
      chatNotice.show("error", "Your message can't be empty.");
      return;
    }

    try {
      await sendChatMessage(auction.id, text);
      setNewChatContent("");

      // ✅ Force scroll to bottom after sending (so user sees their message)
      window.setTimeout(() => {
        scrollChatToBottom();
      }, 0);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Something went wrong while sending your message. Please try again.";
      chatNotice.show("error", msg);
    }
  };

  // ------------------ ADMIN edit ------------------
  const [isEditing, setIsEditing] = useState(false);
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

  const hydrateEdit = useCallback((a: AuctionDetails) => {
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

  useEffect(() => {
    if (auction) hydrateEdit(auction);
  }, [auction, hydrateEdit]);

  const handleSaveEdit = async () => {
    if (!auction) return;

    const payload: AdminAuctionUpdateRequest = {
      categoryId: editForm.categoryId ? Number(editForm.categoryId) : undefined,
      title: editForm.title.trim() || undefined,
      shortDescription: editForm.shortDescription.trim() || undefined,
      description: editForm.description.trim() || undefined,
      startingAmount: editForm.startingAmount ? Number(editForm.startingAmount) : undefined,
      minBidIncrement: editForm.minBidIncrement ? Number(editForm.minBidIncrement) : undefined,
      startDate: editForm.startDate || undefined,
      endDate: editForm.endDate || undefined,
      shippingCostPayer: editForm.shippingCostPayer,
      auctionStatus: editForm.auctionStatus || undefined,
    };

    try {
      const updated = await adminEditAuction(auction.id, payload);
      setAuction(updated);
      setIsEditing(false);
      adminNotice.show("success", "Auction updated successfully.");
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Something went wrong while updating the auction. Please try again.";
      adminNotice.show("error", msg);
    }
  };

  // ------------------ See more dropdown (bids from rank #4 and below) ------------------
  const [bidHistoryOpen, setBidHistoryOpen] = useState<boolean>(false);
  useEffect(() => {
    setBidHistoryOpen(false);
  }, [auctionId]);

  const imageStageHeight = isSingleColumn ? 320 : 420;

  // ------------------ render ------------------
  return (
    <div
      ref={rootRef}
      style={{
        minHeight: variant === "page" ? "100vh" : "100%",
        background: "#F6F8FB",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: isModal ? "100%" : 1200,
          width: "100%",
          margin: "0 auto",
          padding: isModal ? "12px" : "18px",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {variant === "page" && onBack && (
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                height: 40,
                padding: "0 14px",
                borderRadius: 12,
                border: "1px solid rgba(17, 24, 39, 0.12)",
                background: "#FFFFFF",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ← Back to all auctions
            </button>
          </div>
        )}

        {loading && <div style={{ padding: 18 }}>Φόρτωση...</div>}
        {error && <div style={{ padding: 18, color: "#B91C1C" }}>Σφάλμα: {error}</div>}

        {auction && !loading && !error && (
          <>
            {/* ✅ Chat card extracted (so we can render it in different place on mobile) */}
            {(() => {
              const chatCard = (
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                    overflow: "hidden",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      background: "#0B84F3",
                      color: "white",
                      padding: "12px 14px",
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>Auction Chat</div>
                    <div style={{ fontWeight: 800, opacity: 0.9, fontSize: 13 }}>
                      {auction.chat.length} messages
                    </div>
                  </div>

                  <div style={{ padding: 12 }}>
                    <div
                      ref={chatScrollRef}
                      style={{
                        height: chatViewportHeight,
                        overflowY: "auto",
                        paddingRight: 6,
                      }}
                    >
                      {auction.chat.length === 0 ? (
                        <div style={{ color: "#6B7280" }}>No messages yet.</div>
                      ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                          {auction.chat.map((m) => {
                            const isAuctioneer = m.senderDisplayName === auction.sellerUsername;
                            return (
                              <div key={m.id} style={{ display: "grid", gap: 6 }}>
                                <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 12 }}>
                                  {new Date(m.createdAt).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                    minWidth: 0,
                                  }}
                                >
                                  <AvatarCircle size={28} name={m.senderDisplayName} url={m.senderAvatarUrl ?? null} />

                                  <div style={{ display: "grid", gap: 6, width: "100%", minWidth: 0 }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: 10,
                                        alignItems: "center",
                                        minWidth: 0,
                                      }}
                                    >
                                      <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
                                        {isAdmin ? (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenUserDetails(m.senderDisplayName)}
                                            style={{
                                              background: "transparent",
                                              border: "none",
                                              padding: 0,
                                              margin: 0,
                                              cursor: "pointer",
                                              fontWeight: 900,
                                              color: "#111827",
                                              textAlign: "left",
                                              maxWidth: "100%",
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                            }}
                                            title={m.senderDisplayName}
                                          >
                                            {m.senderDisplayName}
                                          </button>
                                        ) : (
                                          <div
                                            style={{
                                              maxWidth: "100%",
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                            }}
                                            title={m.senderDisplayName}
                                          >
                                            {m.senderDisplayName}
                                          </div>
                                        )}
                                      </div>

                                      {isAuctioneer && (
                                        <div
                                          style={{
                                            fontSize: 12,
                                            fontWeight: 800,
                                            color: "#2563EB",
                                            display: "flex",
                                            gap: 6,
                                            alignItems: "center",
                                            flex: "0 0 auto",
                                          }}
                                        >
                                          <span>✎</span>
                                          <span>Auctioneer</span>
                                        </div>
                                      )}
                                    </div>

                                    <div
                                      style={{
                                        display: "inline-block",
                                        background: isAuctioneer ? "#FEF3C7" : "#FFFFFF",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: 14,
                                        padding: "10px 12px",
                                        maxWidth: "100%",
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {m.content}
                                    </div>

                                    {typeof m.remainingMessages === "number" && (
                                      <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 12 }}>
                                        Messages left: {m.remainingMessages}/25
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {!isEnded && (
                      <>
                        <div
                          style={{
                            marginTop: 12,
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1fr) auto",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <input
                            value={canChat ? newChatContent : ""}
                            onChange={(e) => setNewChatContent(e.target.value)}
                            disabled={!canChat}
                            placeholder={
                              canChat
                                ? "Write a message..."
                                : !isLoggedIn
                                ? "Sign in to chat..."
                                : chatBlockedReason ?? "Chat is not available."
                            }
                            style={{
                              width: "100%",
                              border: "1px solid #E5E7EB",
                              borderRadius: 12,
                              padding: "10px 12px",
                              outline: "none",
                              background: canChat ? "white" : "#F9FAFB",
                              minWidth: 0,
                              boxSizing: "border-box",
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey && canChat) {
                                e.preventDefault();
                                void handleSendChat();
                              }
                            }}
                          />

                          {canChat ? (
                            <button
                              type="button"
                              onClick={() => void handleSendChat()}
                              style={{
                                padding: "10px 14px",
                                borderRadius: 12,
                                border: "1px solid #111827",
                                background: "#111827",
                                color: "white",
                                fontWeight: 900,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Send
                            </button>
                          ) : !isLoggedIn ? (
                            <button
                              type="button"
                              onClick={() => onSignIn?.()}
                              style={{
                                padding: "10px 14px",
                                borderRadius: 12,
                                border: "1px solid #111827",
                                background: "#111827",
                                color: "white",
                                fontWeight: 900,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Sign in to Chat
                            </button>
                          ) : null}
                        </div>

                        <NoticeInline notice={chatNotice.notice} onClose={chatNotice.clear} />

                        {!canChat && !isLoggedIn && (
                          <div style={{ marginTop: 8, color: "#6B7280", fontSize: 12, fontWeight: 700 }}>
                            You need an account to chat
                          </div>
                        )}

                        {!canChat && isLoggedIn && chatBlockedReason && (
                          <div style={{ marginTop: 8, color: "#B91C1C", fontSize: 12, fontWeight: 800 }}>
                            {chatBlockedReason}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );

              return (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isSingleColumn
                        ? "1fr"
                        : "minmax(0, 1.65fr) minmax(0, 1fr)",
                      gap: 18,
                      alignItems: "start",
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* LEFT COLUMN */}
                    <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
                      {/* Image carousel card */}
                      {images.length > 0 ? (
                        <div
                          style={{
                            background: "white",
                            borderRadius: 16,
                            boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                            overflow: "hidden",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              height: imageStageHeight,
                              background: "#F3F4F6",
                              overflow: "hidden",
                              zIndex: 0,
                            }}
                          >
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt="auction main"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  objectPosition: "center",
                                  cursor: "zoom-in",
                                  background: "#F3F4F6",
                                }}
                                onClick={() => setFullscreenImageUrl(mainImage)}
                                onError={() => {
                                  setBrokenImageByUrl((p) => ({ ...p, [mainImage]: true }));
                                  setFullscreenImageUrl(null);
                                }}
                              />
                            ) : null}

                            {auction.categoryName && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 14,
                                  right: 14,
                                  background: "rgba(255,255,255,0.92)",
                                  border: "1px solid rgba(229,231,235,0.9)",
                                  borderRadius: 999,
                                  padding: "6px 10px",
                                  fontWeight: 700,
                                  fontSize: 13,
                                  zIndex: 2,
                                  maxWidth: "calc(100% - 28px)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {auction.categoryName}
                              </div>
                            )}

                            {images.length > 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 14,
                                  right: 14,
                                  background: "rgba(17,24,39,0.75)",
                                  color: "white",
                                  borderRadius: 999,
                                  padding: "8px 12px",
                                  fontWeight: 800,
                                  zIndex: 2,
                                }}
                              >
                                {Math.min(selectedImageIdx + 1, images.length)}/{images.length}
                              </div>
                            )}

                            {images.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedImageIdx((i) => (i - 1 + images.length) % images.length)
                                  }
                                  style={{
                                    position: "absolute",
                                    left: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    border: "1px solid #E5E7EB",
                                    background: "rgba(255,255,255,0.92)",
                                    cursor: "pointer",
                                    fontSize: 18,
                                    fontWeight: 900,
                                    zIndex: 2,
                                  }}
                                >
                                  ‹
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedImageIdx((i) => (i + 1) % images.length)}
                                  style={{
                                    position: "absolute",
                                    right: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    border: "1px solid #E5E7EB",
                                    background: "rgba(255,255,255,0.92)",
                                    cursor: "pointer",
                                    fontSize: 18,
                                    fontWeight: 900,
                                    zIndex: 2,
                                  }}
                                >
                                  ›
                                </button>
                              </>
                            )}
                          </div>

                          {images.length > 1 && (
                            <div
                              style={{
                                borderTop: "1px solid #EEF2F7",
                                padding: 12,
                                display: "flex",
                                gap: 12,
                                overflowX: "auto",
                                WebkitOverflowScrolling: "touch",
                                background: "#FFFFFF",
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              {images.map((u, idx) => {
                                const active = idx === selectedImageIdx;
                                return (
                                  <button
                                    key={u + idx}
                                    type="button"
                                    onClick={() => setSelectedImageIdx(idx)}
                                    style={{
                                      flex: "0 0 auto",
                                      width: 150,
                                      height: 92,
                                      borderRadius: 14,
                                      border: active ? "3px solid #111827" : "1px solid #E5E7EB",
                                      padding: 0,
                                      overflow: "hidden",
                                      cursor: "pointer",
                                      background: "#F3F4F6",
                                      boxSizing: "border-box",
                                    }}
                                  >
                                    <img
                                      src={u}
                                      alt={`thumb ${idx + 1}`}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        objectPosition: "center",
                                        background: "#F3F4F6",
                                      }}
                                      onError={() => setBrokenImageByUrl((p) => ({ ...p, [u]: true }))}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            background: "white",
                            borderRadius: 16,
                            boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                            padding: 16,
                            minWidth: 0,
                            color: "#6B7280",
                            fontWeight: 800,
                          }}
                        >
                          Image is not available
                        </div>
                      )}

                      {/* Seller information card */}
                      <div
                        style={{
                          background: "white",
                          borderRadius: 16,
                          boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                          padding: 16,
                          minWidth: 0,
                        }}
                      >
                        <div style={{ fontWeight: 800, color: "#111827", marginBottom: 10 }}>
                          Seller Information
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                          <AvatarCircle size={44} name={auction.sellerUsername} url={auction.sellerAvatarUrl ?? null} />

                          <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, color: "#111827" }}>
                              {isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserDetails(auction.sellerUsername)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: 0,
                                    margin: 0,
                                    cursor: "pointer",
                                    fontWeight: 800,
                                    color: "#111827",
                                    textAlign: "left",
                                    maxWidth: "100%",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={auction.sellerUsername}
                                >
                                  {auction.sellerUsername}
                                </button>
                              ) : (
                                <div
                                  style={{
                                    maxWidth: "100%",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={auction.sellerUsername}
                                >
                                  {auction.sellerUsername}
                                </div>
                              )}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                                color: "#6B7280",
                                minWidth: 0,
                              }}
                            >
                              <span style={{ fontSize: 14 }}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                  />
                                  <circle
                                    cx="12"
                                    cy="11"
                                    r="2.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  />
                                </svg>
                              </span>
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={getCityFromLocation(auction.sellerLocation)}
                              >
                                {getCityFromLocation(auction.sellerLocation)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description card */}
                      <div
                        style={{
                          background: "white",
                          borderRadius: 16,
                          boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                          padding: 16,
                          minWidth: 0,
                        }}
                      >
                        <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
                          Description
                        </div>

                        <div
                          style={{
                            color: "#374151",
                            lineHeight: 1.55,
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {auction.description || auction.shortDescription || "—"}
                        </div>

                      <div
                      style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: "1px solid #EEF2F7",
                        display: "grid",
                        gridTemplateColumns: isSingleColumn
                          ? "1fr"
                          : "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", // ✅ 3 columns
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
                            Starting price
                          </div>
                          <div style={{ fontWeight: 900, color: "#111827" }}>
                            {formatMoneyEUR(auction.startingAmount)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
                            Minimum raise
                          </div>
                          <div style={{ fontWeight: 900, color: "#111827" }}>
                            {formatMoneyEUR(auction.minBidIncrement)}
                          </div>
                        </div>
                      </div>

                      {/* ✅ NEW: Shipping cost payer */}
                      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
                            Shipping cost
                          </div>
                          <div style={{ fontWeight: 900, color: "#111827" }}>
                            {auction.shippingCostPayer === "BUYER"
                              ? "Buyer pays"
                              : auction.shippingCostPayer === "SELLER"
                              ? "Seller pays"
                              : auction.shippingCostPayer === "SPLIT"
                              ? "Split"
                              : auction.shippingCostPayer}
                          </div>
                        </div>
                      </div>
                    </div>

                      </div>

                      {/* ✅ Chat stays here ONLY on non-mobile */}
                      {!isMobile && chatCard}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ minWidth: 0, display: "grid", gap: 14 }}>
                      <div
                        style={{
                          background: "white",
                          borderRadius: 16,
                          boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                          padding: 16,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: "#111827",
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {auction.title}
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            padding: 14,
                            borderRadius: 14,
                            background: "#F9FAFB",
                            border: "1px solid #EEF2F7",
                          }}
                        >
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ fontSize: 18 }}>🕒</span>
                            <div style={{ fontWeight: 800, color: "#374151" }}>Time Remaining</div>
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              fontWeight: 900,
                              color: timeBox.ended ? "#DC2626" : "#111827",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                            }}
                          >
                            {timeBox.label}
                          </div>
                        </div>

                        {!isEnded && (
                          <div style={{ marginTop: 16 }}>
                            <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
                              Place Your Bid {minNextBid != null ? `(min ${formatMoneyEUR(minNextBid)})` : ""}
                            </div>

                            <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  border: "1px solid #E5E7EB",
                                  borderRadius: 12,
                                  padding: "10px 12px",
                                  background: "white",
                                  boxSizing: "border-box",
                                }}
                              >
                                <span style={{ color: "#9CA3AF", fontWeight: 900 }}>€</span>
                                <input
                                  type="number"
                                  min={0}
                                  step="1"
                                  value={bidAmount}
                                  onChange={(e) => setBidAmount(e.target.value)}
                                  placeholder=""
                                  disabled={!canBid}
                                  style={{
                                    width: "100%",
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontSize: 14,
                                    minWidth: 0,
                                  }}
                                />
                              </div>

                              {canBid ? (
                                <button
                                  type="button"
                                  onClick={handleBid}
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: 12,
                                    border: "1px solid #111827",
                                    background: "#111827",
                                    color: "white",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Place Bid
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onSignIn?.()}
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: 12,
                                    border: "1px solid #111827",
                                    background: "#111827",
                                    color: "white",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span style={{ color: "#0B84F3" }} aria-hidden="true">🔒</span> Sign in to Bid
                                </button>
                              )}
                            </div>

                            <NoticeInline notice={bidNotice.notice} onClose={bidNotice.clear} />
                          </div>
                        )}

                        {/* Bidder rankings (Top 3 only) */}
                        <div style={{ marginTop: 16 }}>
                          <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
                            Bidder Rankings ({sortedBids.length})
                          </div>

                          {sortedBids.length === 0 ? (
                            <div style={{ color: "#6B7280" }}>No bids yet.</div>
                          ) : (
                            <div style={{ display: "grid", gap: 10 }}>
                              {sortedBids.slice(0, 3).map((b, idx) => {
                                const leading = idx === 0;
                                return (
                                  <div
                                    key={b.id}
                                    style={{
                                      borderRadius: 14,
                                      border: leading
                                        ? "2px solid rgba(59,130,246,0.5)"
                                        : "1px solid #E5E7EB",
                                      padding: 12,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: 12,
                                      background: "white",
                                      minWidth: 0,
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                                      <div
                                        style={{
                                          width: 44,
                                          height: 44,
                                          borderRadius: 999,
                                          background: "#2563EB",
                                          display: "grid",
                                          placeItems: "center",
                                          color: "white",
                                          fontWeight: 900,
                                          flex: "0 0 auto",
                                        }}
                                      >
                                        #{idx + 1}
                                      </div>

                                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                        <AvatarCircle
                                          size={38}
                                          name={b.bidderUsername}
                                          url={b.bidderAvatarUrl ?? null}
                                          ring={leading}
                                        />
                                        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                                          <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
                                            {b.bidderUsername ? (
                                              isAdmin ? (
                                                <button
                                                  type="button"
                                                  onClick={() => handleOpenUserDetails(b.bidderUsername)}
                                                  style={{
                                                    background: "transparent",
                                                    border: "none",
                                                    padding: 0,
                                                    margin: 0,
                                                    cursor: "pointer",
                                                    fontWeight: 900,
                                                    color: "#111827",
                                                    textAlign: "left",
                                                    maxWidth: "100%",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                  title={b.bidderUsername}
                                                >
                                                  {b.bidderUsername}
                                                </button>
                                              ) : (
                                                <div
                                                  style={{
                                                    maxWidth: "100%",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                  title={b.bidderUsername}
                                                >
                                                  {b.bidderUsername}
                                                </div>
                                              )
                                            ) : (
                                              "Unknown"
                                            )}
                                          </div>
                                          <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
                                            {timeAgo(b.createdAt, now)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                                      <div style={{ color: "#2563EB", fontWeight: 900 }}>
                                        {formatMoneyEUR(b.amount)}
                                      </div>
                                      {leading && (
                                        <div style={{ color: "#2563EB", fontWeight: 800, fontSize: 13 }}>
                                          Leading
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {sortedBids.length > 3 && (
                            <div style={{ marginTop: 12 }}>
                              <button
                                type="button"
                                onClick={() => setBidHistoryOpen((v) => !v)}
                                style={{
                                  width: "100%",
                                  border: "1px solid rgba(17,24,39,0.14)",
                                  background: "#FFFFFF",
                                  borderRadius: 12,
                                  padding: "10px 12px",
                                  fontWeight: 900,
                                  cursor: "pointer",
                                  fontSize: 13,
                                }}
                              >
                                {bidHistoryOpen ? "Hide" : "See more"}
                              </button>
                            </div>
                          )}

                          {bidHistoryOpen && sortedBids.length > 3 && (
                            <div
                              style={{
                                marginTop: 12,
                                borderRadius: 16,
                                border: "1px solid #E5E7EB",
                                overflow: "hidden",
                                background: "#FFFFFF",
                                minWidth: 0,
                              }}
                            >
                              <div
                                style={{
                                  padding: "10px 12px",
                                  borderBottom: "1px solid #EEF2F7",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "baseline",
                                  gap: 10,
                                }}
                              >
                                <div style={{ fontWeight: 950, color: "#111827" }}>More bids</div>
                                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
                                  Scroll to view
                                </div>
                              </div>

                              <div
                                style={{
                                  maxHeight: 260,
                                  overflowY: "auto",
                                  padding: 12,
                                  display: "grid",
                                  gap: 10,
                                  background: "#F9FAFB",
                                }}
                              >
                                {sortedBids.slice(3).map((b) => (
                                  <div
                                    key={`more-${b.id}`}
                                    style={{
                                      borderRadius: 14,
                                      border: "1px solid #E5E7EB",
                                      background: "#FFFFFF",
                                      padding: 12,
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      gap: 12,
                                      minWidth: 0,
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                      <AvatarCircle size={38} name={b.bidderUsername} url={b.bidderAvatarUrl ?? null} />
                                      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                                        <div style={{ fontWeight: 900, color: "#111827", minWidth: 0 }}>
                                          {b.bidderUsername ? (
                                            isAdmin ? (
                                              <button
                                                type="button"
                                                onClick={() => handleOpenUserDetails(b.bidderUsername)}
                                                style={{
                                                  background: "transparent",
                                                  border: "none",
                                                  padding: 0,
                                                  margin: 0,
                                                  cursor: "pointer",
                                                  fontWeight: 900,
                                                  color: "#111827",
                                                  textAlign: "left",
                                                  maxWidth: "100%",
                                                  whiteSpace: "nowrap",
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                }}
                                                title={b.bidderUsername}
                                              >
                                                {b.bidderUsername}
                                              </button>
                                            ) : (
                                              <div
                                                style={{
                                                  maxWidth: "100%",
                                                  whiteSpace: "nowrap",
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                }}
                                                title={b.bidderUsername}
                                              >
                                                {b.bidderUsername}
                                              </div>
                                            )
                                          ) : (
                                            "Unknown"
                                          )}
                                        </div>

                                        <div style={{ color: "#6B7280", fontWeight: 700, fontSize: 13 }}>
                                          {timeAgo(b.createdAt, now)}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                                      <div style={{ color: "#2563EB", fontWeight: 950 }}>
                                        {formatMoneyEUR(b.amount)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ On mobile: chat goes to the END of the page */}
                  {isMobile && <div style={{ marginTop: 14 }}>{chatCard}</div>}
                </>
              );
            })()}

            {/* ADMIN block */}
            {isAdmin && (
              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                    padding: 16,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflowX: "hidden",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900, color: "#111827" }}>Admin: Edit auction</div>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 12,
                          border: "1px solid #E5E7EB",
                          background: "white",
                          cursor: "pointer",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Open editor
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (auction) hydrateEdit(auction);
                          setIsEditing(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 12,
                          border: "1px solid #E5E7EB",
                          background: "white",
                          cursor: "pointer",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Close
                      </button>
                    )}
                  </div>

                  <NoticeInline notice={adminNotice.notice} onClose={adminNotice.clear} />

                  {isEditing && (
                    <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isSingleColumn
                            ? "1fr"
                            : "minmax(0, 1fr) minmax(0, 1fr)",
                          gap: 10,
                        }}
                      >
                        <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                          Title
                          <input
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            style={{
                              border: "1px solid #E5E7EB",
                              borderRadius: 12,
                              padding: "10px 12px",
                              minWidth: 0,
                              boxSizing: "border-box",
                            }}
                          />
                        </label>

                        <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                          Category ID (optional)
                          <input
                            value={editForm.categoryId}
                            onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}
                            type="number"
                            style={{
                              border: "1px solid #E5E7EB",
                              borderRadius: 12,
                              padding: "10px 12px",
                              minWidth: 0,
                              boxSizing: "border-box",
                            }}
                          />
                        </label>
                      </div>

                      <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                        Short description
                        <input
                          value={editForm.shortDescription}
                          onChange={(e) => setEditForm((p) => ({ ...p, shortDescription: e.target.value }))}
                          style={{
                            border: "1px solid #E5E7EB",
                            borderRadius: 12,
                            padding: "10px 12px",
                            minWidth: 0,
                            boxSizing: "border-box",
                          }}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                        Full description
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          rows={4}
                          style={{
                            border: "1px solid #E5E7EB",
                            borderRadius: 12,
                            padding: "10px 12px",
                            resize: "vertical",
                            minWidth: 0,
                            boxSizing: "border-box",
                          }}
                        />
                      </label>

                      <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid #EEF2F7",
                    display: "grid",
                    gridTemplateColumns: isSingleColumn
                      ? "1fr"
                      : "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", // ✅ 3 columns
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                    <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
                        Starting price
                      </div>
                      <div style={{ fontWeight: 900, color: "#111827" }}>
                        {formatMoneyEUR(auction.startingAmount)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                    <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
                        Minimum raise
                      </div>
                      <div style={{ fontWeight: 900, color: "#111827" }}>
                        {formatMoneyEUR(auction.minBidIncrement)}
                      </div>
                    </div>
                  </div>

                  {/* ✅ NEW: Shipping cost payer */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                    <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: "#111827", fontSize: 13 }}>
                        Shipping cost
                      </div>
                      <div style={{ fontWeight: 900, color: "#111827" }}>
                        {auction.shippingCostPayer === "BUYER"
                          ? "Buyer pays"
                          : auction.shippingCostPayer === "SELLER"
                          ? "Seller pays"
                          : auction.shippingCostPayer === "SPLIT"
                          ? "Split"
                          : auction.shippingCostPayer}
                      </div>
                    </div>
                  </div>
                </div>


                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isSingleColumn
                            ? "1fr"
                            : "minmax(0, 1fr) minmax(0, 1fr)",
                          gap: 10,
                        }}
                      >
                        <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                          Start date
                          <input
                            value={editForm.startDate}
                            onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
                            type="datetime-local"
                            style={{
                              border: "1px solid #E5E7EB",
                              borderRadius: 12,
                              padding: "10px 12px",
                              minWidth: 0,
                              boxSizing: "border-box",
                            }}
                          />
                        </label>

                        <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                          End date
                          <input
                            value={editForm.endDate}
                            onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
                            type="datetime-local"
                            style={{
                              border: "1px solid #E5E7EB",
                              borderRadius: 12,
                              padding: "10px 12px",
                              minWidth: 0,
                              boxSizing: "border-box",
                            }}
                          />
                        </label>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isSingleColumn
                            ? "1fr"
                            : "minmax(0, 1fr) minmax(0, 1fr)",
                          gap: 10,
                        }}
                      >
                        <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                          Shipping cost payer
                          <select
                            value={editForm.shippingCostPayer}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                shippingCostPayer: e.target.value as ShippingCostPayer,
                              }))
                            }
                            style={{
                              border: "1px solid #E5E7EB",
                              borderRadius: 12,
                              padding: "10px 12px",
                              background: "white",
                              minWidth: 0,
                              boxSizing: "border-box",
                            }}
                          >
                            <option value="SELLER">SELLER</option>
                            <option value="BUYER">BUYER</option>
                            <option value="SPLIT">SPLIT</option>
                          </select>
                        </label>

                        <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                          Status
                          <select
                            value={editForm.auctionStatus || ""}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                auctionStatus: e.target.value as AuctionStatus | "",
                              }))
                            }
                            style={{
                              border: "1px solid #E5E7EB",
                              borderRadius: 12,
                              padding: "10px 12px",
                              background: "white",
                              minWidth: 0,
                              boxSizing: "border-box",
                            }}
                          >
                            <option value="">(no change)</option>
                            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="EXPIRED">EXPIRED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </label>
                      </div>

                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (auction) hydrateEdit(auction);
                            setIsEditing(false);
                          }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: "1px solid #E5E7EB",
                            background: "white",
                            cursor: "pointer",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleSaveEdit()}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: "1px solid #111827",
                            background: "#111827",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fullscreen overlay */}
      {fullscreenImageUrl && (
        <div
          onClick={() => setFullscreenImageUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            cursor: "zoom-out",
            padding: 16,
          }}
        >
          <img
            src={fullscreenImageUrl}
            alt="fullscreen"
            style={{
              maxWidth: "92vw",
              maxHeight: "92vh",
              borderRadius: 14,
              boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
              background: "white",
            }}
            onError={() => {
              setBrokenImageByUrl((p) => ({ ...p, [fullscreenImageUrl]: true }));
              setFullscreenImageUrl(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AuctionDetailsPage;
