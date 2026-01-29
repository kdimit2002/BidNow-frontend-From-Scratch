
// // src/App.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   NavLink,
//   Navigate,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import AuctionsPage from "./components/AuctionsPage";
// import AuctionDetailsPage from "./components/AuctionDetailsPage";
// import CreateAuctionFlowPage from "./components/CreateAuctionFlowPage";

// import SignUpFlowPage from "./components/SignUpFlowPage";
// import SignInForm from "./components/SignInForm";
// import UserProfilePage from "./components/UserProfilePage";

// import MyPendingAuctionsPage from "./components/MyPendingAuctionsPage";
// import MyWonAuctionsPage from "./components/MyWonAuctionsPage";
// import MyBidAuctionsPage from "./components/MyBidAuctionsPage";
// import MyAuctionsPage from "./components/MyAuctionsPage";

// import ReferralCodeUsagePage from "./components/ReferralCodeUsagePage";
// import NotificationsPage from "./components/NotificationsPage";

// import AdminReferralCodesPage from "./admin/components/AdminReferralCodesPage";
// import CreateReferralCodePage from "./admin/components/CreateReferralCodePage";
// import AdminPendingAuctionsPage from "./admin/components/AdminPendingAuctionsPage";
// import AdminCategoriesPage from "./admin/components/AdminCategoriesPage";
// import AdminUsersPage from "./admin/components/AdminUsersPage";
// import ActiveUsersAllMonthsPage from "./admin/components/ActiveUsersAllMonthsPage";
// import AdminUserDetailsPage from "./admin/components/AdminUserDetailsPage";
// import AdminBroadcastNotificationPage from "./admin/components/AdminBroadcastNotificationPage";
// import AdminMyAuctionsPage from "./admin/components/AdminMyAuctionsPage";

// import AdminVerificationPage from "./admin/components/AdminVerificationPage";
// import AdminProblemReportsPage from "./admin/components/AdminProblemReportsPage";

// // ✅ NEW: Admin send notification page
// import AdminSendNotificationPage from "./admin/components/AdminSendNotificationPage";

// import { initSessionFromStoredRefreshToken } from "./api/Firebase/firebaseIdentityService";
// import { callBackendLogin, logout } from "./api/Springboot/backendUserService";

// import type { AuthUserDto } from "./models/Springboot/UserEntity";

// type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// /** Guards */
// function RequireAuth({
//   isAuthenticated,
//   children,
// }: {
//   isAuthenticated: boolean;
//   children: React.ReactNode;
// }) {
//   const location = useLocation();
//   if (!isAuthenticated) {
//     return <Navigate to="/signin" replace state={{ from: location }} />;
//   }
//   return <>{children}</>;
// }

// function RequireAdmin({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
//   if (!isAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireAuctioneerOrAdmin({
//   isAuctioneerOrAdmin,
//   children,
// }: {
//   isAuctioneerOrAdmin: boolean;
//   children: React.ReactNode;
// }) {
//   if (!isAuctioneerOrAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireReferralOwner({
//   isReferralOwner,
//   children,
// }: {
//   isReferralOwner: boolean;
//   children: React.ReactNode;
// }) {
//   if (!isReferralOwner) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// /** Route wrappers */
// function AuctionDetailsRoute({ authUser }: { authUser: AuthUserDto | null }) {
//   const navigate = useNavigate();
//   const { auctionId } = useParams<{ auctionId: string }>();
//   const id = Number(auctionId);
//   if (!auctionId || Number.isNaN(id)) return <Navigate to="/" replace />;

//   return (
//     <AuctionDetailsPage
//       auctionId={id}
//       currentUser={authUser}
//       onBack={() => navigate(-1)}
//       onGoToMyAuctions={() => navigate("/me/auctions")}
//       onOpenUserDetailsAsAdmin={(username: string) =>
//         navigate(`/admin/users/${encodeURIComponent(username)}`)
//       }
//     />
//   );
// }

// function AdminUserDetailsRoute() {
//   const navigate = useNavigate();
//   const { username } = useParams<{ username: string }>();
//   if (!username) return <Navigate to="/admin/users" replace />;

//   return (
//     <AdminUserDetailsPage
//       username={decodeURIComponent(username)}
//       onBack={() => navigate("/admin/users")}
//     />
//   );
// }

// const AppShell: React.FC = () => {
//   const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
//   const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);

//   const [isDesktop, setIsDesktop] = useState<boolean>(() => {
//     if (typeof window === "undefined") return true;
//     return window.innerWidth >= 960;
//   });
//   const [menuOpen, setMenuOpen] = useState<boolean>(() => {
//     if (typeof window === "undefined") return true;
//     return window.innerWidth >= 960;
//   });

//   const navigate = useNavigate();
//   const location = useLocation();

//   const isAuthRoute = location.pathname === "/signin" || location.pathname === "/signup";

//   useEffect(() => {
//     const onResize = () => {
//       const desktop = window.innerWidth >= 960;
//       setIsDesktop(desktop);
//       setMenuOpen(desktop ? true : false);
//     };
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   useEffect(() => {
//     const bootstrapAuth = async () => {
//       try {
//         const session = await initSessionFromStoredRefreshToken();

//         if (session) {
//           try {
//             const auth = await callBackendLogin();
//             setAuthUser(auth);
//             setAuthStatus("authenticated");
//           } catch (e) {
//             console.error("Backend login failed on boot", e);
//             logout();
//             setAuthUser(null);
//             setAuthStatus("unauthenticated");
//           }
//         } else {
//           setAuthUser(null);
//           setAuthStatus("unauthenticated");
//         }
//       } catch (e) {
//         console.error("Error bootstrapping auth", e);
//         setAuthUser(null);
//         setAuthStatus("unauthenticated");
//       }
//     };

//     void bootstrapAuth();
//   }, []);

//   const handleSignedIn = (auth: AuthUserDto) => {
//     setAuthUser(auth);
//     setAuthStatus("authenticated");
//   };

//   const handleSignOut = () => {
//     logout();
//     setAuthUser(null);
//     setAuthStatus("unauthenticated");
//     navigate("/", { replace: true });
//   };

//   // ✅ για να αλλάζει το "Logged in as" από UserProfilePage
//   const patchAuthUser = (patch: Partial<AuthUserDto>) => {
//     setAuthUser((prev) => (prev ? { ...prev, ...patch } : prev));
//   };

//   const isAuthenticated = authStatus === "authenticated";
//   const isAdmin = authUser?.roleName === "Admin";
//   const isAuctioneerOrAdmin = authUser?.roleName === "Auctioneer" || authUser?.roleName === "Admin";
//   const isReferralOwner = authUser?.isReferralCodeOwner === true;

//   const navLinkStyle = useMemo(() => {
//     const base: React.CSSProperties = {
//       display: "inline-flex",
//       alignItems: "center",
//       justifyContent: "center",
//       padding: "0.5rem 0.75rem",
//       borderRadius: 10,
//       border: "1px solid #ddd",
//       textDecoration: "none",
//       fontSize: "0.9rem",
//       lineHeight: 1,
//       whiteSpace: "nowrap",
//       background: "white",
//       color: "#111",
//     };

//     return ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
//       ...base,
//       borderColor: isActive ? "#111" : "#ddd",
//       background: isActive ? "#111" : "white",
//       color: isActive ? "white" : "#111",
//     });
//   }, []);

//   if (authStatus === "loading") {
//     return (
//       <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
//         <p style={{ margin: 0 }}>Φόρτωση...</p>
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         width: "100%",
//         display: "flex",
//         flexDirection: "column",
//         background: "#fafafa",
//       }}
//     >
//       {!isAuthRoute && (
//         <header
//           style={{
//             position: "sticky",
//             top: 0,
//             zIndex: 20,
//             background: "white",
//             borderBottom: "1px solid #e7e7e7",
//           }}
//         >
//           <div
//             style={{
//               width: "100%",
//               padding: "clamp(12px, 2vw, 18px)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               gap: "12px",
//               flexWrap: "wrap",
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               <NavLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
//                 <h1 style={{ margin: 0, fontSize: "1.25rem" }}>BidNow</h1>
//               </NavLink>

//               {!isDesktop && (
//                 <button
//                   onClick={() => setMenuOpen((v) => !v)}
//                   style={{
//                     padding: "0.5rem 0.75rem",
//                     borderRadius: 10,
//                     border: "1px solid #ddd",
//                     background: "white",
//                     cursor: "pointer",
//                     fontSize: "0.9rem",
//                   }}
//                 >
//                   ☰ Menu
//                 </button>
//               )}
//             </div>

//             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               {isAuthenticated ? (
//                 <>
//                   <span style={{ fontSize: "0.9rem", color: "#555" }}>
//                     Logged in as <strong>{authUser?.username}</strong>
//                     {authUser?.roleName ? ` (${authUser.roleName})` : ""}
//                   </span>

//                   <button
//                     onClick={handleSignOut}
//                     style={{
//                       padding: "0.5rem 0.75rem",
//                       borderRadius: 10,
//                       border: "1px solid #ddd",
//                       background: "white",
//                       cursor: "pointer",
//                       fontSize: "0.9rem",
//                       whiteSpace: "nowrap",
//                     }}
//                   >
//                     Sign Out
//                   </button>
//                 </>
//               ) : (
//                 <span style={{ fontSize: "0.9rem", color: "#555" }}>
//                   Guest (not signed in)
//                 </span>
//               )}
//             </div>
//           </div>

//           {menuOpen && (
//             <div style={{ padding: "0 0 clamp(10px, 1.5vw, 14px)", background: "white" }}>
//               <div
//                 style={{
//                   padding: "clamp(10px, 2vw, 18px)",
//                   display: "flex",
//                   gap: "10px",
//                   flexWrap: "wrap",
//                   overflowX: "auto",
//                 }}
//               >
//                 <NavLink to="/" style={navLinkStyle}>
//                   Auctions
//                 </NavLink>

//                 {!isAuthenticated ? (
//                   <>
//                     <NavLink to="/signin" style={navLinkStyle}>
//                       Sign In
//                     </NavLink>
//                     <NavLink to="/signup" style={navLinkStyle}>
//                       Sign Up
//                     </NavLink>
//                   </>
//                 ) : (
//                   <>
//                     <NavLink to="/me" style={navLinkStyle}>
//                       User Profile
//                     </NavLink>
//                     <NavLink to="/me/wins" style={navLinkStyle}>
//                       My Wins
//                     </NavLink>
//                     <NavLink to="/me/bids" style={navLinkStyle}>
//                       My Active Bids
//                     </NavLink>
//                     <NavLink to="/me/notifications" style={navLinkStyle}>
//                       Notifications
//                     </NavLink>

//                     {isAuctioneerOrAdmin && (
//                       <>
//                         <NavLink to="/auction/create" style={navLinkStyle}>
//                           Create Auction
//                         </NavLink>
//                         <NavLink to="/me/auctions" style={navLinkStyle}>
//                           My Auctions
//                         </NavLink>
//                         <NavLink to="/me/auctions/pending" style={navLinkStyle}>
//                           My Pending Auctions
//                         </NavLink>
//                       </>
//                     )}

//                     {isReferralOwner && (
//                       <NavLink to="/me/referrals" style={navLinkStyle}>
//                         My Referral Code Usage
//                       </NavLink>
//                     )}

//                     {isAdmin && (
//                       <>
//                         <NavLink to="/admin/users" style={navLinkStyle}>
//                           Users Page
//                         </NavLink>
//                         <NavLink to="/admin/auctions/pending" style={navLinkStyle}>
//                           Pending Auctions
//                         </NavLink>
//                         <NavLink to="/admin/categories" style={navLinkStyle}>
//                           Categories
//                         </NavLink>
//                         <NavLink to="/admin/referral-codes" style={navLinkStyle}>
//                           Referral Codes
//                         </NavLink>
//                         <NavLink to="/admin/referral-codes/create" style={navLinkStyle}>
//                           Create Referral Codes
//                         </NavLink>
//                         <NavLink to="/admin/active-users" style={navLinkStyle}>
//                           Inspect Active Users
//                         </NavLink>
//                         <NavLink to="/admin/broadcast" style={navLinkStyle}>
//                           Admin Broadcast
//                         </NavLink>

//                         {/* ✅ NEW: Send notification to a specific user */}
//                         <NavLink to="/admin/notifications/send" style={navLinkStyle}>
//                           Send Notification
//                         </NavLink>

//                         <NavLink to="/admin/auctions/non-active" style={navLinkStyle}>
//                           Admin Non-active Auctions
//                         </NavLink>
//                         <NavLink to="/admin/verifications" style={navLinkStyle}>
//                           Admin Verifications
//                         </NavLink>
//                         <NavLink to="/admin/problem-reports" style={navLinkStyle}>
//                           Admin Problem Reports
//                         </NavLink>
//                       </>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </header>
//       )}

//       <main
//         style={{
//           flex: 1,
//           width: "100%",
//           padding: isAuthRoute ? 0 : "clamp(12px, 2vw, 24px)",
//           boxSizing: "border-box",
//         }}
//       >
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <AuctionsPage
//                 onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                 currentUser={authUser}
//                 onOpenUserDetailsAsAdmin={(username: string) =>
//                   navigate(`/admin/users/${encodeURIComponent(username)}`)
//                 }
//               />
//             }
//           />

//           <Route path="/auction/:auctionId" element={<AuctionDetailsRoute authUser={authUser} />} />

//           <Route path="/signin" element={<SignInForm onSignedIn={handleSignedIn} />} />
//           <Route path="/signup" element={<SignUpFlowPage onSignUpCompleted={handleSignedIn} />} />

//           <Route
//             path="/me"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <UserProfilePage
//                   onShowReferralCodeUsage={() => navigate("/me/referrals")}
//                   onAuthUserUpdated={patchAuthUser}
//                   onSignedOut={handleSignOut}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/wins"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyWonAuctionsPage
//                   onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/bids"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyBidAuctionsPage
//                   onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/notifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <NotificationsPage />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyAuctionsPage
//                     onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                     onBack={() => navigate("/")}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/auction/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <CreateAuctionFlowPage
//                     onCompleted={() => {
//                       alert("Το auction δημιουργήθηκε και είναι σε κατάσταση 'pending approval' από admin.");
//                       navigate("/", { replace: true });
//                     }}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/referrals"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireReferralOwner isReferralOwner={!!isReferralOwner}>
//                   <ReferralCodeUsagePage />
//                 </RequireReferralOwner>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUsersPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/users/:username"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUserDetailsRoute />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/categories"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminCategoriesPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminReferralCodesPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <CreateReferralCodePage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/active-users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <ActiveUsersAllMonthsPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/broadcast"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminBroadcastNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           {/* ✅ NEW: Admin send notification to a specific user */}
//           <Route
//             path="/admin/notifications/send"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminSendNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/non-active"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminMyAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/verifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminVerificationPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/problem-reports"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminProblemReportsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </main>

//       {!isAuthRoute && (
//         <footer
//           style={{
//             borderTop: "1px solid #e7e7e7",
//             padding: "12px 18px",
//             background: "white",
//             color: "#666",
//             fontSize: "0.85rem",
//           }}
//         >
//           © {new Date().getFullYear()} BidNow
//         </footer>
//       )}
//     </div>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <AppShell />
//     </BrowserRouter>
//   );
// };

// export default App;



///////////////////// VERSION 1 ///////////////////////////////////////
// src/App.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import AuctionsPage from "./components/AuctionsPage";
// import AuctionDetailsPage from "./components/AuctionDetailsPage";
// import CreateAuctionFlowPage from "./components/CreateAuctionFlowPage";

// import SignUpFlowPage from "./components/SignUpFlowPage";
// import SignInForm from "./components/SignInForm";
// import UserProfilePage from "./components/UserProfilePage";

// import MyPendingAuctionsPage from "./components/MyPendingAuctionsPage";
// import MyWonAuctionsPage from "./components/MyWonAuctionsPage";
// import MyBidAuctionsPage from "./components/MyBidAuctionsPage";
// import MyAuctionsPage from "./components/MyAuctionsPage";

// import ReferralCodeUsagePage from "./components/ReferralCodeUsagePage";
// import NotificationsPage from "./components/NotificationsPage";

// import AdminReferralCodesPage from "./admin/components/AdminReferralCodesPage";
// import CreateReferralCodePage from "./admin/components/CreateReferralCodePage";
// import AdminPendingAuctionsPage from "./admin/components/AdminPendingAuctionsPage";
// import AdminCategoriesPage from "./admin/components/AdminCategoriesPage";
// import AdminUsersPage from "./admin/components/AdminUsersPage";
// import ActiveUsersAllMonthsPage from "./admin/components/ActiveUsersAllMonthsPage";
// import AdminUserDetailsPage from "./admin/components/AdminUserDetailsPage";
// import AdminBroadcastNotificationPage from "./admin/components/AdminBroadcastNotificationPage";
// import AdminMyAuctionsPage from "./admin/components/AdminMyAuctionsPage";

// import AdminVerificationPage from "./admin/components/AdminVerificationPage";
// import AdminProblemReportsPage from "./admin/components/AdminProblemReportsPage";

// // ✅ από το 2ο (updated)
// import AdminSendNotificationPage from "./admin/components/AdminSendNotificationPage";

// import { initSessionFromStoredRefreshToken } from "./api/Firebase/firebaseIdentityService";
// import { callBackendLogin, logout } from "./api/Springboot/backendUserService";

// import type { AuthUserDto } from "./models/Springboot/UserEntity";

// type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// type MenuPos = {
//   top: number;
//   left: number;
//   width: number;
//   maxHeight: number;
// };

// type PageToastType = "success" | "error";

// // ✅ SVG Icon (Bell)
// const BellIcon = ({ size = 20 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
//     <path
//       d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//     <path
//       d="M13.73 21a2 2 0 01-3.46 0"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// /** Guards */
// function RequireAuth({ isAuthenticated, children }: { isAuthenticated: boolean; children: React.ReactNode }) {
//   const location = useLocation();
//   if (!isAuthenticated) return <Navigate to="/signin" replace state={{ from: location }} />;
//   return <>{children}</>;
// }

// function RequireAdmin({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
//   if (!isAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireAuctioneerOrAdmin({
//   isAuctioneerOrAdmin,
//   children,
// }: {
//   isAuctioneerOrAdmin: boolean;
//   children: React.ReactNode;
// }) {
//   if (!isAuctioneerOrAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireReferralOwner({ isReferralOwner, children }: { isReferralOwner: boolean; children: React.ReactNode }) {
//   if (!isReferralOwner) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// /** Route wrappers */
// function AuctionDetailsRoute({ authUser }: { authUser: AuthUserDto | null }) {
//   const navigate = useNavigate();
//   const { auctionId } = useParams<{ auctionId: string }>();
//   const id = Number(auctionId);
//   if (!auctionId || Number.isNaN(id)) return <Navigate to="/" replace />;

//   return (
//     <AuctionDetailsPage
//       auctionId={id}
//       currentUser={authUser}
//       variant="page"
//       onBack={() => navigate(-1)}
//       onGoToMyAuctions={() => navigate("/me/auctions")}
//       onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
//       onSignIn={() => navigate("/signin")}
//       onSignUp={() => navigate("/signup")}
//     />
//   );
// }

// function AdminUserDetailsRoute() {
//   const navigate = useNavigate();
//   const { username } = useParams<{ username: string }>();
//   if (!username) return <Navigate to="/admin/users" replace />;

//   return <AdminUserDetailsPage username={decodeURIComponent(username)} onBack={() => navigate("/admin/users")} />;
// }

// function SignInRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
//   const navigate = useNavigate();
//   const location = useLocation() as any;

//   return (
//     <SignInForm
//       onSignedIn={(auth) => {
//         onSignedIn(auth);
//         const from = location?.state?.from?.pathname;
//         navigate(from || "/", { replace: true });
//       }}
//     />
//   );
// }

// function SignUpRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
//   const navigate = useNavigate();
//   const location = useLocation() as any;

//   return (
//     <SignUpFlowPage
//       onSignUpCompleted={(auth) => {
//         onSignedIn(auth);
//         const from = location?.state?.from?.pathname;
//         navigate(from || "/", { replace: true });
//       }}
//     />
//   );
// }

// const AppShell: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ------------------------
//   // Auth state (όπως πριν)
//   // ------------------------
//   const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
//   const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);

//   // ✅ για να αλλάζει το "Logged in as" / username/avatar κτλ από child pages
//   const patchAuthUser = (patch: Partial<AuthUserDto>) => {
//     setAuthUser((prev) => (prev ? { ...prev, ...patch } : prev));
//   };

//   useEffect(() => {
//     const bootstrapAuth = async () => {
//       try {
//         const session = await initSessionFromStoredRefreshToken();
//         if (session) {
//           try {
//             const auth = await callBackendLogin();
//             setAuthUser(auth);
//             setAuthStatus("authenticated");
//           } catch (e) {
//             console.error("Backend login failed on boot", e);
//             logout();
//             setAuthUser(null);
//             setAuthStatus("unauthenticated");
//           }
//         } else {
//           setAuthUser(null);
//           setAuthStatus("unauthenticated");
//         }
//       } catch (e) {
//         console.error("Error bootstrapping auth", e);
//         setAuthUser(null);
//         setAuthStatus("unauthenticated");
//       }
//     };

//     void bootstrapAuth();
//   }, []);

//   const handleSignedIn = (auth: AuthUserDto) => {
//     setAuthUser(auth);
//     setAuthStatus("authenticated");
//   };

//   const handleSignOut = () => {
//     logout();
//     setAuthUser(null);
//     setAuthStatus("unauthenticated");
//     setMenuOpen(false);
//     navigate("/", { replace: true });
//   };

//   const isAuthenticated = authStatus === "authenticated";
//   const isAdmin = authUser?.roleName === "Admin";
//   const isAuctioneerOrAdmin = authUser?.roleName === "Auctioneer" || authUser?.roleName === "Admin";
//   const isReferralOwner = authUser?.isReferralCodeOwner === true;

//   // ------------------------
//   // UI state από το 1ο (header/menu/toast/modal)
//   // ------------------------
//   const LOGO_SRC = "/images/websiteLogoFinal1.png";

//   // responsive
//   const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
//   useEffect(() => {
//     const onResize = () => {
//       const w = window.innerWidth;
//       setVw((prev) => (prev === w ? prev : w));
//     };
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isMobile = vw <= 640;
//   const isTiny = vw <= 420;

//   // dropdown menu
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement | null>(null);

//   const userChipRef = useRef<HTMLDivElement | null>(null);
//   const [menuPos, setMenuPos] = useState<MenuPos | null>(null);

//   // modal auction details (π.χ. από MyWins)
//   const [detailsModalAuctionId, setDetailsModalAuctionId] = useState<number | null>(null);

//   useEffect(() => {
//     if (detailsModalAuctionId === null) return;

//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setDetailsModalAuctionId(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [detailsModalAuctionId]);

//   useEffect(() => {
//     if (detailsModalAuctionId === null) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [detailsModalAuctionId]);

//   // click outside
//   useEffect(() => {
//     if (!menuOpen) return;

//     const onDocClick = (e: MouseEvent) => {
//       const t = e.target as Node;
//       if (menuRef.current && !menuRef.current.contains(t)) {
//         setMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [menuOpen]);

//   // position menu only on open in mobile
//   useEffect(() => {
//     if (!menuOpen || !isMobile) {
//       setMenuPos(null);
//       return;
//     }

//     const el = userChipRef.current;
//     if (!el) return;

//     const rect = el.getBoundingClientRect();
//     const padding = 10;
//     const screenW = window.innerWidth;

//     const desired = Math.min(320, screenW - padding * 2);
//     const width = Math.min(Math.max(220, desired), screenW - padding * 2);

//     let left = rect.right - width;
//     left = Math.max(padding, Math.min(left, screenW - padding - width));

//     const top = rect.bottom + 10;
//     const maxHeight = Math.max(180, window.innerHeight - top - padding);

//     setMenuPos({ top, left, width, maxHeight });
//   }, [menuOpen, isMobile, vw]);

//   // close on scroll only on mobile
//   useEffect(() => {
//     if (!menuOpen || !isMobile) return;
//     const closeOnScroll = () => setMenuOpen(false);
//     window.addEventListener("scroll", closeOnScroll, { passive: true });
//     return () => window.removeEventListener("scroll", closeOnScroll);
//   }, [menuOpen, isMobile]);

//   // ------------------------
//   // Toast από το 1ο (μόνο στο "/")
//   // ------------------------
//   const [pageToast, setPageToast] = useState<{ type: PageToastType; msg: string } | null>(null);
//   const pageToastTimerRef = useRef<number | null>(null);

//   const clearPageToastTimer = () => {
//     if (pageToastTimerRef.current) {
//       window.clearTimeout(pageToastTimerRef.current);
//       pageToastTimerRef.current = null;
//     }
//   };

//   const closePageToast = () => {
//     clearPageToastTimer();
//     setPageToast(null);
//   };

//   const showPageToast = (type: PageToastType, msg: string, autoMs = 4500) => {
//     clearPageToastTimer();
//     setPageToast({ type, msg });
//     pageToastTimerRef.current = window.setTimeout(() => closePageToast(), autoMs);
//   };

//   useEffect(() => {
//     return () => clearPageToastTimer();
//   }, []);

//   // αν φύγεις από "/", κλείσε toast
//   useEffect(() => {
//     if (location.pathname !== "/") closePageToast();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.pathname]);

//   // ------------------------
//   // Avatar initial
//   // ------------------------
//   const avatarInitial = useMemo(() => {
//     const u = authUser?.username ?? "";
//     return u.trim().slice(0, 1).toUpperCase() || "?";
//   }, [authUser]);

//   const userAvatarUrl = authUser?.avatarUrl ?? null;

//   if (authStatus === "loading") {
//     return (
//       <div style={{ width: "100%", padding: 16 }}>
//         <p>Φόρτωση...</p>
//       </div>
//     );
//   }

//   // ------------------------
//   // Styles (από το 1ο)
//   // ------------------------
//   const headerOuter: React.CSSProperties = {
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 5000,
//     background: "#F5F6F8",
//     borderBottom: "1px solid rgba(17, 24, 39, 0.10)",
//     position: "sticky",
//   };

//   const headerInner: React.CSSProperties = {
//     width: "100%",
//     maxWidth: 1400,
//     margin: "0 auto",
//     padding: isMobile ? "10px 10px" : "14px 18px",
//     display: "flex",
//     flexDirection: isMobile ? "column" : "row",
//     alignItems: isMobile ? "stretch" : "center",
//     justifyContent: "space-between",
//     gap: isMobile ? 8 : 12,
//     boxSizing: "border-box",
//   };

//   const brandBtn: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: isMobile ? "center" : "flex-start",
//     gap: 10,
//     border: "none",
//     background: "transparent",
//     cursor: "pointer",
//     padding: 0,
//     flex: "0 0 auto",
//     width: isMobile ? "100%" : "auto",
//     order: isMobile ? 1 : 0,
//   };

//   const pillBtn: React.CSSProperties = {
//     height: "clamp(32px, 8vw, 40px)",
//     padding: "0 clamp(8px, 2.8vw, 14px)",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 800,
//     cursor: "pointer",
//     fontSize: "clamp(12px, 3.2vw, 14px)",
//     whiteSpace: "nowrap",
//     flex: "0 0 auto",
//   };

//   const primaryPill: React.CSSProperties = {
//     ...pillBtn,
//     background: "#0B1220",
//     border: "1px solid #0B1220",
//     color: "#FFFFFF",
//   };

//   const headerActions: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: isMobile ? 6 : 10,
//     width: isMobile ? "100%" : "auto",
//     justifyContent: isMobile ? "flex-start" : "flex-end",
//     flexWrap: isMobile ? "wrap" : "nowrap",
//     marginLeft: isMobile ? 0 : "auto",
//     minWidth: 0,
//     order: isMobile ? 1 : 0,
//   };

//   const userChip: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: isMobile ? 8 : 10,
//     cursor: "pointer",
//     borderRadius: 14,
//     padding: "clamp(6px, 1.8vw, 8px) clamp(8px, 2vw, 10px)",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     background: "#FFFFFF",
//     minWidth: 0,
//     maxWidth: "clamp(180px, 56vw, 320px)",
//   };

//   const avatar: React.CSSProperties = {
//     width: isMobile ? 30 : 34,
//     height: isMobile ? 30 : 34,
//     borderRadius: 999,
//     overflow: "hidden",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//     color: "#FFFFFF",
//     background: "#6366F1",
//     flex: "0 0 auto",
//   };

//   const menu: React.CSSProperties = isMobile
//     ? {
//         position: "fixed",
//         top: menuPos?.top ?? (isTiny ? 112 : 82),
//         left: menuPos?.left ?? 10,
//         width: menuPos?.width ?? Math.min(320, Math.max(220, vw - 20)),
//         background: "#FFFFFF",
//         borderRadius: 14,
//         border: "1px solid rgba(17, 24, 39, 0.12)",
//         boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
//         overflowY: "auto",
//         overflowX: "hidden",
//         WebkitOverflowScrolling: "touch",
//         maxHeight: menuPos?.maxHeight ?? "calc(100vh - 100px)",
//         zIndex: 6000,
//       }
//     : {
//         position: "absolute",
//         right: 0,
//         top: "calc(100% + 10px)",
//         width: 260,
//         background: "#FFFFFF",
//         borderRadius: 14,
//         border: "1px solid rgba(17, 24, 39, 0.12)",
//         boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
//         overflowY: "auto",
//         overflowX: "hidden",
//         maxHeight: "calc(100vh - 90px)",
//         zIndex: 6000,
//       };

//   const menuItem = (danger?: boolean): React.CSSProperties => ({
//     width: "100%",
//     textAlign: "left",
//     padding: "12px 14px",
//     border: "none",
//     background: "#FFFFFF",
//     cursor: "pointer",
//     fontWeight: 800,
//     color: danger ? "#DC2626" : "#111827",
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//   });

//   const menuDivider: React.CSSProperties = {
//     height: 1,
//     background: "rgba(17, 24, 39, 0.08)",
//   };

//   const iconBtn: React.CSSProperties = {
//     width: "clamp(36px, 9vw, 44px)",
//     height: "clamp(36px, 9vw, 44px)",
//     borderRadius: 14,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     cursor: "pointer",
//     display: "grid",
//     placeItems: "center",
//     padding: 0,
//     boxShadow: "0 6px 14px rgba(17,24,39,0.06)",
//     flex: "0 0 auto",
//   };

//   return (
//     <div style={{ width: "100%", minHeight: "100vh", background: "#F5F6F8" }}>
//       {/* ✅ Header (Design από 1ο) */}
//       <div style={headerOuter}>
//         <div style={headerInner}>
//           <button
//             type="button"
//             style={brandBtn}
//             onClick={() => {
//               setMenuOpen(false);
//               navigate("/");
//             }}
//           >
//             <img
//               src={LOGO_SRC}
//               alt="BidNow"
//               style={{
//                 height: "clamp(40px, 20vw, 60px)",
//                 maxWidth: "clamp(250px, 34vw, 170px)",
//                 width: "250",
//                 display: "block",
//               }}
//             />
//           </button>

//           <div style={headerActions}>
//             {!isAuthenticated ? (
//               <>
//                 <button type="button" style={pillBtn} onClick={() => navigate("/signin")}>
//                   Sign In
//                 </button>
//                 <button type="button" style={primaryPill} onClick={() => navigate("/signup")}>
//                   Sign Up
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   type="button"
//                   style={iconBtn}
//                   onClick={() => {
//                     setMenuOpen(false);
//                     navigate("/me/notifications");
//                   }}
//                   aria-label="Notifications"
//                   title="Notifications"
//                 >
//                   <BellIcon size={isMobile ? 18 : 20} />
//                 </button>

//                 <div style={{ position: "relative" }} ref={menuRef}>
//                   <div
//                     ref={userChipRef}
//                     style={userChip}
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => setMenuOpen((v) => !v)}
//                     title={authUser?.username}
//                   >
//                     <div style={avatar}>
//                       {userAvatarUrl ? (
//                         <img
//                           src={userAvatarUrl}
//                           alt="avatar"
//                           style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                           onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).style.display = "none";
//                           }}
//                         />
//                       ) : (
//                         <span>{avatarInitial}</span>
//                       )}
//                     </div>

//                     <div style={{ display: "grid", lineHeight: 1.1, minWidth: 0 }}>
//                       <div
//                         style={{
//                           fontWeight: 900,
//                           color: "#111827",
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           fontSize: isMobile ? 12.5 : 14,
//                         }}
//                       >
//                         {authUser?.username}
//                       </div>

//                       {!isMobile && (
//                         <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                           {authUser?.roleName ?? ""}
//                         </div>
//                       )}
//                     </div>

//                     <div style={{ marginLeft: 6, opacity: 0.75, flex: "0 0 auto" }}>⚙️</div>
//                   </div>

//                   {menuOpen && (
//                     <div style={menu}>
//                       {isAdmin ? (
//                         <>
//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/admin/users"))}>
//                             🛡 Users (Admin)
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/auctions/pending"))}
//                           >
//                             🧰 Pending auctions (Admin)
//                           </button>

//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/admin/categories"))}>
//                             🗂 Categories (Admin)
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes"))}
//                           >
//                             🔑 Referral codes (Admin)
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes/create"))}
//                           >
//                             ➕ Create referral code
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/active-users"))}
//                           >
//                             📊 Inspect active users
//                           </button>

//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/admin/broadcast"))}>
//                             📣 Admin broadcast
//                           </button>

//                           {/* ✅ NEW from 2ο */}
//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/notifications/send"))}
//                           >
//                             📨 Send notification
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/auctions/non-active"))}
//                           >
//                             🧾 Admin non-active auctions
//                           </button>

//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/admin/verifications"))}>
//                             ✅ Admin verifications
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/problem-reports"))}
//                           >
//                             🐞 Admin problem reports
//                           </button>

//                           <div style={menuDivider} />
//                           <button type="button" style={menuItem(true)} onClick={handleSignOut}>
//                             ⎋ Sign out
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me"))}>
//                             👤 View my profile
//                           </button>

//                           {/* <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/bids"))}>
//                             🧾 View my bids
//                           </button> */}

//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/wins"))}>
//                             🏆 View my won auctions
//                           </button>

//                           {isAuctioneerOrAdmin && (
//                             <>
//                               <div style={menuDivider} />
//                               {/* <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/auction/create"))}>
//                                 ➕ Create auction
//                               </button> */}
//                               <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/auctions"))}>
//                                 📦 View my auctions
//                               </button>
//                               <button
//                                 type="button"
//                                 style={menuItem()}
//                                 onClick={() => (setMenuOpen(false), navigate("/me/auctions/pending"))}
//                               >
//                                 ⏳ View my pending auctions
//                               </button>
//                             </>
//                           )}

//                           {isReferralOwner && (
//                             <>
//                               <div style={menuDivider} />
//                               <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/referrals"))}>
//                                 🎟 My referral usage
//                               </button>
//                             </>
//                           )}

//                           <div style={menuDivider} />
//                           <button type="button" style={menuItem(true)} onClick={handleSignOut}>
//                             ⎋ Sign out
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ✅ Toast (μόνο στο "/") */}
//       {location.pathname === "/" && pageToast && (
//         <div
//           style={{
//             position: "fixed",
//             top: 18,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 7000,
//             width: "min(720px, 92vw)",
//             borderRadius: 16,
//             border: `1px solid ${pageToast.type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//             background: pageToast.type === "error" ? "#FEF2F2" : "#F0FDF4",
//             boxShadow: "0 14px 35px rgba(17, 24, 39, 0.12)",
//             padding: "12px 12px",
//             boxSizing: "border-box",
//           }}
//           role="status"
//           aria-live="polite"
//         >
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
//             <div
//               style={{
//                 fontWeight: 900,
//                 fontSize: 14,
//                 color: pageToast.type === "error" ? "#991B1B" : "#166534",
//                 lineHeight: 1.35,
//                 overflowWrap: "anywhere",
//                 wordBreak: "break-word",
//               }}
//             >
//               {pageToast.msg}
//             </div>

//             <button
//               type="button"
//               onClick={closePageToast}
//               aria-label="Close message"
//               style={{
//                 flex: "0 0 auto",
//                 width: 30,
//                 height: 30,
//                 padding: 0,
//                 borderRadius: 10,
//                 border: "1px solid rgba(17,24,39,0.12)",
//                 background: "rgba(255,255,255,0.75)",
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: 950,
//                 fontSize: 16,
//                 lineHeight: 1,
//               }}
//               title="Close"
//             >
//               <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ✅ Routes */}
//       <div style={{ padding: "clamp(12px, 2vw, 24px)" }}>
//         <Routes>
//           {/* Public auctions */}
//           <Route
//             path="/"
//             element={
//               <AuctionsPage
//                 onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                 currentUser={authUser}
//                 onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
//                 onSignIn={() => navigate("/signin")}
//                 onCreateAuction={() => navigate("/auction/create")}
//                 onViewMyBids={() => navigate("/me/bids")}
//               />
//             }
//           />

//           <Route path="/auction/:auctionId" element={<AuctionDetailsRoute authUser={authUser} />} />

//           {/* Auth */}
//           <Route path="/signin" element={<SignInRoute onSignedIn={handleSignedIn} />} />
//           <Route path="/signup" element={<SignUpRoute onSignedIn={handleSignedIn} />} />

//           {/* User */}
//           <Route
//             path="/me"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <UserProfilePage
//                   onShowReferralCodeUsage={() => navigate("/me/referrals")}
//                   onAuthUserUpdated={patchAuthUser}
//                   onSignedOut={handleSignOut}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/wins"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyWonAuctionsPage
//                   onOpenDetails={(auctionId: number) => setDetailsModalAuctionId(auctionId)} // ✅ modal όπως 1ο
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/bids"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyBidAuctionsPage
//                   currentUser={authUser}
//                   // onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                   onSignIn={() => navigate("/signin")}
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/notifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <NotificationsPage />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyAuctionsPage
//                     currentUser={authUser}
//                     onSignIn={() => navigate("/signin")}
//                     onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                     onBack={() => navigate("/")}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/auction/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <CreateAuctionFlowPage
//                     onBack={() => navigate("/")}
//                     onCompleted={() => {
//                       navigate("/", { replace: true });
//                       showPageToast(
//                         "success",
//                         "Η δημοπρασία δημιουργήθηκε με επιτυχία και αναμένει έγκριση από κάποιον διαχειριστή."
//                       );
//                     }}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/referrals"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireReferralOwner isReferralOwner={!!isReferralOwner}>
//                   <ReferralCodeUsagePage onBack={() => navigate("/")} />
//                 </RequireReferralOwner>
//               </RequireAuth>
//             }
//           />

//           {/* Admin */}
//           <Route
//             path="/admin/users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUsersPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/users/:username"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUserDetailsRoute />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/categories"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminCategoriesPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminReferralCodesPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <CreateReferralCodePage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/active-users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <ActiveUsersAllMonthsPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/broadcast"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminBroadcastNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           {/* ✅ NEW from 2ο */}
//           <Route
//             path="/admin/notifications/send"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminSendNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/non-active"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminMyAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/verifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminVerificationPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/problem-reports"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminProblemReportsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>

//       {/* ✅ Modal Details (όπως 1ο) */}
//       {detailsModalAuctionId !== null && (
//         <div
//           onClick={() => setDetailsModalAuctionId(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.55)",
//             zIndex: 5000,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               width: "min(1200px, 96vw)",
//               height: "min(92vh, 900px)",
//               borderRadius: 16,
//               overflow: "hidden",
//               boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
//               background: "#F6F8FB",
//               position: "relative",
//             }}
//           >
//             <button
//               type="button"
//               onClick={() => setDetailsModalAuctionId(null)}
//               style={{
//                 position: "absolute",
//                 top: 10,
//                 right: 10,
//                 zIndex: 5100,
//                 width: 40,
//                 height: 40,
//                 borderRadius: 12,
//                 border: "1px solid rgba(17, 24, 39, 0.12)",
//                 background: "#FFFFFF",
//                 cursor: "pointer",
//                 fontWeight: 900,
//               }}
//               aria-label="Close"
//             >
//               ✕
//             </button>

//             <div style={{ height: "100%", overflowY: "auto" }}>
//               <AuctionDetailsPage
//                 auctionId={detailsModalAuctionId}
//                 variant="modal"
//                 currentUser={authUser}
//                 onBack={() => setDetailsModalAuctionId(null)}
//                 onOpenUserDetailsAsAdmin={(username: string) => {
//                   setDetailsModalAuctionId(null);
//                   navigate(`/admin/users/${encodeURIComponent(username)}`);
//                 }}
//                 // onGoToMyAuctions={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/me/auctions");
//                 // // }}
//                 // onSignIn={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/signin");
//                 // }}
//                 // onSignUp={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/signup");
//                 // }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <AppShell />
//     </BrowserRouter>
//   );
// };

// export default App;


///////////////////// VERSION 1 ///////////////////////////////////////
// // src/App.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import AuctionsPage from "./components/AuctionsPage";
// import AuctionDetailsPage from "./components/AuctionDetailsPage";
// import CreateAuctionFlowPage from "./components/CreateAuctionFlowPage";

// import SignUpFlowPage from "./components/SignUpFlowPage";
// import SignInForm from "./components/SignInForm";
// import UserProfilePage from "./components/UserProfilePage";

// import MyPendingAuctionsPage from "./components/MyPendingAuctionsPage";
// import MyWonAuctionsPage from "./components/MyWonAuctionsPage";
// import MyBidAuctionsPage from "./components/MyBidAuctionsPage";
// import MyAuctionsPage from "./components/MyAuctionsPage";

// import ReferralCodeUsagePage from "./components/ReferralCodeUsagePage";
// import NotificationsPage from "./components/NotificationsPage";

// import AdminReferralCodesPage from "./admin/components/AdminReferralCodesPage";
// import CreateReferralCodePage from "./admin/components/CreateReferralCodePage";
// import AdminPendingAuctionsPage from "./admin/components/AdminPendingAuctionsPage";
// import AdminCategoriesPage from "./admin/components/AdminCategoriesPage";
// import AdminUsersPage from "./admin/components/AdminUsersPage";
// import ActiveUsersAllMonthsPage from "./admin/components/ActiveUsersAllMonthsPage";
// import AdminUserDetailsPage from "./admin/components/AdminUserDetailsPage";
// import AdminBroadcastNotificationPage from "./admin/components/AdminBroadcastNotificationPage";
// import AdminMyAuctionsPage from "./admin/components/AdminMyAuctionsPage";

// import AdminVerificationPage from "./admin/components/AdminVerificationPage";
// import AdminProblemReportsPage from "./admin/components/AdminProblemReportsPage";

// // ✅ από το 2ο (updated)
// import AdminSendNotificationPage from "./admin/components/AdminSendNotificationPage";

// import { initSessionFromStoredRefreshToken } from "./api/Firebase/firebaseIdentityService";
// import { callBackendLogin, logout } from "./api/Springboot/backendUserService";

// import type { AuthUserDto } from "./models/Springboot/UserEntity";

// type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// type MenuPos = {
//   top: number;
//   left: number;
//   width: number;
//   maxHeight: number;
// };

// type PageToastType = "success" | "error";

// // ✅ SVG Icon (Bell)
// const BellIcon = ({ size = 20 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
//     <path
//       d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//     <path
//       d="M13.73 21a2 2 0 01-3.46 0"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// /** Guards */
// function RequireAuth({ isAuthenticated, children }: { isAuthenticated: boolean; children: React.ReactNode }) {
//   const location = useLocation();
//   if (!isAuthenticated) return <Navigate to="/signin" replace state={{ from: location }} />;
//   return <>{children}</>;
// }

// function RequireAdmin({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
//   if (!isAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireAuctioneerOrAdmin({
//   isAuctioneerOrAdmin,
//   children,
// }: {
//   isAuctioneerOrAdmin: boolean;
//   children: React.ReactNode;
// }) {
//   if (!isAuctioneerOrAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireReferralOwner({ isReferralOwner, children }: { isReferralOwner: boolean; children: React.ReactNode }) {
//   if (!isReferralOwner) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// /** Route wrappers */
// function AuctionDetailsRoute({ authUser }: { authUser: AuthUserDto | null }) {
//   const navigate = useNavigate();
//   const { auctionId } = useParams<{ auctionId: string }>();
//   const id = Number(auctionId);
//   if (!auctionId || Number.isNaN(id)) return <Navigate to="/" replace />;

//   return (
//     <AuctionDetailsPage
//       auctionId={id}
//       currentUser={authUser}
//       variant="page"
//       onBack={() => navigate(-1)}
//       onGoToMyAuctions={() => navigate("/me/auctions")}
//       onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
//       onSignIn={() => navigate("/signin")}
//       onSignUp={() => navigate("/signup")}
//     />
//   );
// }

// function AdminUserDetailsRoute() {
//   const navigate = useNavigate();
//   const { username } = useParams<{ username: string }>();
//   if (!username) return <Navigate to="/admin/users" replace />;

//   return <AdminUserDetailsPage username={decodeURIComponent(username)} onBack={() => navigate("/admin/users")} />;
// }

// function SignInRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
//   const navigate = useNavigate();
//   const location = useLocation() as any;

//   return (
//     <SignInForm
//       onSignedIn={(auth) => {
//         onSignedIn(auth);
//         const from = location?.state?.from?.pathname;
//         navigate(from || "/", { replace: true });
//       }}
//     />
//   );
// }

// function SignUpRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
//   const navigate = useNavigate();
//   const location = useLocation() as any;

//   return (
//     <SignUpFlowPage
//       onSignUpCompleted={(auth) => {
//         onSignedIn(auth);
//         const from = location?.state?.from?.pathname;
//         navigate(from || "/", { replace: true });
//       }}
//     />
//   );
// }

// const AppShell: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ✅ HIDE HEADER: μόνο για /signin και /signup
//   const hideHeader = location.pathname === "/signin" || location.pathname === "/signup";

//   // ------------------------
//   // Auth state (όπως πριν)
//   // ------------------------
//   const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
//   const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);

//   // ✅ για να αλλάζει το "Logged in as" / username/avatar κτλ από child pages
//   const patchAuthUser = (patch: Partial<AuthUserDto>) => {
//     setAuthUser((prev) => (prev ? { ...prev, ...patch } : prev));
//   };

//   useEffect(() => {
//     const bootstrapAuth = async () => {
//       try {
//         const session = await initSessionFromStoredRefreshToken();
//         if (session) {
//           try {
//             const auth = await callBackendLogin();
//             setAuthUser(auth);
//             setAuthStatus("authenticated");
//           } catch (e) {
//             console.error("Backend login failed on boot", e);
//             logout();
//             setAuthUser(null);
//             setAuthStatus("unauthenticated");
//           }
//         } else {
//           setAuthUser(null);
//           setAuthStatus("unauthenticated");
//         }
//       } catch (e) {
//         console.error("Error bootstrapping auth", e);
//         setAuthUser(null);
//         setAuthStatus("unauthenticated");
//       }
//     };

//     void bootstrapAuth();
//   }, []);

//   const handleSignedIn = (auth: AuthUserDto) => {
//     setAuthUser(auth);
//     setAuthStatus("authenticated");
//   };

//   const handleSignOut = () => {
//     logout();
//     setAuthUser(null);
//     setAuthStatus("unauthenticated");
//     setMenuOpen(false);
//     navigate("/", { replace: true });
//   };

//   const isAuthenticated = authStatus === "authenticated";
//   const isAdmin = authUser?.roleName === "Admin";
//   const isAuctioneerOrAdmin = authUser?.roleName === "Auctioneer" || authUser?.roleName === "Admin";
//   const isReferralOwner = authUser?.isReferralCodeOwner === true;

//   // ------------------------
//   // UI state από το 1ο (header/menu/toast/modal)
//   // ------------------------
//   const LOGO_SRC = "/images/websiteLogoFinal1.png";

//   // responsive
//   const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
//   useEffect(() => {
//     const onResize = () => {
//       const w = window.innerWidth;
//       setVw((prev) => (prev === w ? prev : w));
//     };
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isMobile = vw <= 640;
//   const isTiny = vw <= 420;

//   // dropdown menu
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement | null>(null);

//   const userChipRef = useRef<HTMLDivElement | null>(null);
//   const [menuPos, setMenuPos] = useState<MenuPos | null>(null);

//   // modal auction details (π.χ. από MyWins)
//   const [detailsModalAuctionId, setDetailsModalAuctionId] = useState<number | null>(null);

//   useEffect(() => {
//     if (detailsModalAuctionId === null) return;

//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setDetailsModalAuctionId(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [detailsModalAuctionId]);

//   useEffect(() => {
//     if (detailsModalAuctionId === null) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [detailsModalAuctionId]);

//   // click outside
//   useEffect(() => {
//     if (!menuOpen) return;

//     const onDocClick = (e: MouseEvent) => {
//       const t = e.target as Node;
//       if (menuRef.current && !menuRef.current.contains(t)) {
//         setMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [menuOpen]);

//   // position menu only on open in mobile
//   useEffect(() => {
//     if (!menuOpen || !isMobile) {
//       setMenuPos(null);
//       return;
//     }

//     const el = userChipRef.current;
//     if (!el) return;

//     const rect = el.getBoundingClientRect();
//     const padding = 10;
//     const screenW = window.innerWidth;

//     const desired = Math.min(320, screenW - padding * 2);
//     const width = Math.min(Math.max(220, desired), screenW - padding * 2);

//     let left = rect.right - width;
//     left = Math.max(padding, Math.min(left, screenW - padding - width));

//     const top = rect.bottom + 10;
//     const maxHeight = Math.max(180, window.innerHeight - top - padding);

//     setMenuPos({ top, left, width, maxHeight });
//   }, [menuOpen, isMobile, vw]);

//   // close on scroll only on mobile
//   useEffect(() => {
//     if (!menuOpen || !isMobile) return;
//     const closeOnScroll = () => setMenuOpen(false);
//     window.addEventListener("scroll", closeOnScroll, { passive: true });
//     return () => window.removeEventListener("scroll", closeOnScroll);
//   }, [menuOpen, isMobile]);

//   // ------------------------
//   // Toast από το 1ο (μόνο στο "/")
//   // ------------------------
//   const [pageToast, setPageToast] = useState<{ type: PageToastType; msg: string } | null>(null);
//   const pageToastTimerRef = useRef<number | null>(null);

//   const clearPageToastTimer = () => {
//     if (pageToastTimerRef.current) {
//       window.clearTimeout(pageToastTimerRef.current);
//       pageToastTimerRef.current = null;
//     }
//   };

//   const closePageToast = () => {
//     clearPageToastTimer();
//     setPageToast(null);
//   };

//   const showPageToast = (type: PageToastType, msg: string, autoMs = 4500) => {
//     clearPageToastTimer();
//     setPageToast({ type, msg });
//     pageToastTimerRef.current = window.setTimeout(() => closePageToast(), autoMs);
//   };

//   useEffect(() => {
//     return () => clearPageToastTimer();
//   }, []);

//   // αν φύγεις από "/", κλείσε toast
//   useEffect(() => {
//     if (location.pathname !== "/") closePageToast();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.pathname]);

//   // ------------------------
//   // Avatar initial
//   // ------------------------
//   const avatarInitial = useMemo(() => {
//     const u = authUser?.username ?? "";
//     return u.trim().slice(0, 1).toUpperCase() || "?";
//   }, [authUser]);

//   const userAvatarUrl = authUser?.avatarUrl ?? null;

//   if (authStatus === "loading") {
//     return (
//       <div style={{ width: "100%", padding: 16 }}>
//         <p>Φόρτωση...</p>
//       </div>
//     );
//   }

//   // ------------------------
//   // Styles (από το 1ο)
//   // ------------------------
//   const headerOuter: React.CSSProperties = {
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 5000,
//     background: "#F5F6F8",
//     borderBottom: "1px solid rgba(17, 24, 39, 0.10)",
//     position: "sticky",
//   };

//   const headerInner: React.CSSProperties = {
//     width: "100%",
//     maxWidth: 1400,
//     margin: "0 auto",
//     padding: isMobile ? "10px 10px" : "14px 18px",
//     display: "flex",
//     flexDirection: isMobile ? "column" : "row",
//     alignItems: isMobile ? "stretch" : "center",
//     justifyContent: "space-between",
//     gap: isMobile ? 8 : 12,
//     boxSizing: "border-box",
//   };

//   const brandBtn: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: isMobile ? "center" : "flex-start",
//     gap: 10,
//     border: "none",
//     background: "transparent",
//     cursor: "pointer",
//     padding: 0,
//     flex: "0 0 auto",
//     width: isMobile ? "100%" : "auto",
//     order: isMobile ? 1 : 0,
//   };

//   const pillBtn: React.CSSProperties = {
//     height: "clamp(32px, 8vw, 40px)",
//     padding: "0 clamp(8px, 2.8vw, 14px)",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 800,
//     cursor: "pointer",
//     fontSize: "clamp(12px, 3.2vw, 14px)",
//     whiteSpace: "nowrap",
//     flex: "0 0 auto",
//   };

//   const primaryPill: React.CSSProperties = {
//     ...pillBtn,
//     background: "#0B1220",
//     border: "1px solid #0B1220",
//     color: "#FFFFFF",
//   };

//   const headerActions: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: isMobile ? 6 : 10,
//     width: isMobile ? "100%" : "auto",
//     justifyContent: isMobile ? "flex-start" : "flex-end",
//     flexWrap: isMobile ? "wrap" : "nowrap",
//     marginLeft: isMobile ? 0 : "auto",
//     minWidth: 0,
//     order: isMobile ? 1 : 0,
//   };

//   const userChip: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: isMobile ? 8 : 10,
//     cursor: "pointer",
//     borderRadius: 14,
//     padding: "clamp(6px, 1.8vw, 8px) clamp(8px, 2vw, 10px)",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     background: "#FFFFFF",
//     minWidth: 0,
//     maxWidth: "clamp(180px, 56vw, 320px)",
//   };

//   const avatar: React.CSSProperties = {
//     width: isMobile ? 30 : 34,
//     height: isMobile ? 30 : 34,
//     borderRadius: 999,
//     overflow: "hidden",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//     color: "#FFFFFF",
//     background: "#6366F1",
//     flex: "0 0 auto",
//   };

//   const menu: React.CSSProperties = isMobile
//     ? {
//         position: "fixed",
//         top: menuPos?.top ?? (isTiny ? 112 : 82),
//         left: menuPos?.left ?? 10,
//         width: menuPos?.width ?? Math.min(320, Math.max(220, vw - 20)),
//         background: "#FFFFFF",
//         borderRadius: 14,
//         border: "1px solid rgba(17, 24, 39, 0.12)",
//         boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
//         overflowY: "auto",
//         overflowX: "hidden",
//         WebkitOverflowScrolling: "touch",
//         maxHeight: menuPos?.maxHeight ?? "calc(100vh - 100px)",
//         zIndex: 6000,
//       }
//     : {
//         position: "absolute",
//         right: 0,
//         top: "calc(100% + 10px)",
//         width: 260,
//         background: "#FFFFFF",
//         borderRadius: 14,
//         border: "1px solid rgba(17, 24, 39, 0.12)",
//         boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
//         overflowY: "auto",
//         overflowX: "hidden",
//         maxHeight: "calc(100vh - 90px)",
//         zIndex: 6000,
//       };

//   const menuItem = (danger?: boolean): React.CSSProperties => ({
//     width: "100%",
//     textAlign: "left",
//     padding: "12px 14px",
//     border: "none",
//     background: "#FFFFFF",
//     cursor: "pointer",
//     fontWeight: 800,
//     color: danger ? "#DC2626" : "#111827",
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//   });

//   const menuDivider: React.CSSProperties = {
//     height: 1,
//     background: "rgba(17, 24, 39, 0.08)",
//   };

//   const iconBtn: React.CSSProperties = {
//     width: "clamp(36px, 9vw, 44px)",
//     height: "clamp(36px, 9vw, 44px)",
//     borderRadius: 14,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     cursor: "pointer",
//     display: "grid",
//     placeItems: "center",
//     padding: 0,
//     boxShadow: "0 6px 14px rgba(17,24,39,0.06)",
//     flex: "0 0 auto",
//   };

//   return (
//     <div style={{ width: "100%", minHeight: "100vh", background: "#F5F6F8" }}>
//       {/* ✅ Header (Design από 1ο) */}
//       <div style={headerOuter}>
//         <div style={headerInner}>
//           <button
//             type="button"
//             style={brandBtn}
//             onClick={() => {
//               setMenuOpen(false);
//               navigate("/");
//             }}
//           >
//             <img
//               src={LOGO_SRC}
//               alt="BidNow"
//               style={{
//                 height: "clamp(40px, 20vw, 60px)",
//                 maxWidth: "clamp(250px, 34vw, 170px)",
//                 width: "250",
//                 display: "block",
//               }}
//             />
//           </button>

//           <div style={headerActions}>
//             {!isAuthenticated ? (
//               <>
//                 <button type="button" style={pillBtn} onClick={() => navigate("/signin")}>
//                   Sign In
//                 </button>
//                 <button type="button" style={primaryPill} onClick={() => navigate("/signup")}>
//                   Sign Up
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   type="button"
//                   style={iconBtn}
//                   onClick={() => {
//                     setMenuOpen(false);
//                     navigate("/me/notifications");
//                   }}
//                   aria-label="Notifications"
//                   title="Notifications"
//                 >
//                   <BellIcon size={isMobile ? 18 : 20} />
//                 </button>

//                 <div style={{ position: "relative" }} ref={menuRef}>
//                   <div
//                     ref={userChipRef}
//                     style={userChip}
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => setMenuOpen((v) => !v)}
//                     title={authUser?.username}
//                   >
//                     <div style={avatar}>
//                       {userAvatarUrl ? (
//                         <img
//                           src={userAvatarUrl}
//                           alt="avatar"
//                           style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                           onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).style.display = "none";
//                           }}
//                         />
//                       ) : (
//                         <span>{avatarInitial}</span>
//                       )}
//                     </div>

//                     <div style={{ display: "grid", lineHeight: 1.1, minWidth: 0 }}>
//                       <div
//                         style={{
//                           fontWeight: 900,
//                           color: "#111827",
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           fontSize: isMobile ? 12.5 : 14,
//                         }}
//                       >
//                         {authUser?.username}
//                       </div>

//                       {!isMobile && (
//                         <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                           {authUser?.roleName ?? ""}
//                         </div>
//                       )}
//                     </div>

//                     <div style={{ marginLeft: 6, opacity: 0.75, flex: "0 0 auto" }}>⚙️</div>
//                   </div>

//                   {menuOpen && (
//                     <div style={menu}>
//                       {isAdmin ? (
//                         <>
//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/admin/users"))}>
//                             🛡 Users (Admin)
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/auctions/pending"))}
//                           >
//                             🧰 Pending auctions (Admin)
//                           </button>

//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/admin/categories"))}>
//                             🗂 Categories (Admin)
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes"))}
//                           >
//                             🔑 Referral codes (Admin)
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes/create"))}
//                           >
//                             ➕ Create referral code
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/active-users"))}
//                           >
//                             📊 Inspect active users
//                           </button>

//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/admin/broadcast"))}>
//                             📣 Admin broadcast
//                           </button>

//                           {/* ✅ NEW from 2ο */}
//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/notifications/send"))}
//                           >
//                             📨 Send notification
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/auctions/non-active"))}
//                           >
//                             🧾 Admin non-active auctions
//                           </button>

//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/admin/verifications"))}>
//                             ✅ Admin verifications
//                           </button>

//                           <button
//                             type="button"
//                             style={menuItem()}
//                             onClick={() => (setMenuOpen(false), navigate("/admin/problem-reports"))}
//                           >
//                             🐞 Admin problem reports
//                           </button>

//                           <div style={menuDivider} />
//                           <button type="button" style={menuItem(true)} onClick={handleSignOut}>
//                             ⎋ Sign out
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me"))}>
//                             👤 View my profile
//                           </button>

//                           {/* <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/bids"))}>
//                             🧾 View my bids
//                           </button> */}

//                           <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/wins"))}>
//                             🏆 View my won auctions
//                           </button>

//                           {isAuctioneerOrAdmin && (
//                             <>
//                               <div style={menuDivider} />
//                               {/* <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/auction/create"))}>
//                                 ➕ Create auction
//                               </button> */}
//                               <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/auctions"))}>
//                                 📦 View my auctions
//                               </button>
//                               <button
//                                 type="button"
//                                 style={menuItem()}
//                                 onClick={() => (setMenuOpen(false), navigate("/me/auctions/pending"))}
//                               >
//                                 ⏳ View my pending auctions
//                               </button>
//                             </>
//                           )}

//                           {isReferralOwner && (
//                             <>
//                               <div style={menuDivider} />
//                               <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/referrals"))}>
//                                 🎟 My referral usage
//                               </button>
//                             </>
//                           )}

//                           <div style={menuDivider} />
//                           <button type="button" style={menuItem(true)} onClick={handleSignOut}>
//                             ⎋ Sign out
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ✅ Toast (μόνο στο "/") */}
//       {location.pathname === "/" && pageToast && (
//         <div
//           style={{
//             position: "fixed",
//             top: 18,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 7000,
//             width: "min(720px, 92vw)",
//             borderRadius: 16,
//             border: `1px solid ${pageToast.type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//             background: pageToast.type === "error" ? "#FEF2F2" : "#F0FDF4",
//             boxShadow: "0 14px 35px rgba(17, 24, 39, 0.12)",
//             padding: "12px 12px",
//             boxSizing: "border-box",
//           }}
//           role="status"
//           aria-live="polite"
//         >
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
//             <div
//               style={{
//                 fontWeight: 900,
//                 fontSize: 14,
//                 color: pageToast.type === "error" ? "#991B1B" : "#166534",
//                 lineHeight: 1.35,
//                 overflowWrap: "anywhere",
//                 wordBreak: "break-word",
//               }}
//             >
//               {pageToast.msg}
//             </div>

//             <button
//               type="button"
//               onClick={closePageToast}
//               aria-label="Close message"
//               style={{
//                 flex: "0 0 auto",
//                 width: 30,
//                 height: 30,
//                 padding: 0,
//                 borderRadius: 10,
//                 border: "1px solid rgba(17,24,39,0.12)",
//                 background: "rgba(255,255,255,0.75)",
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: 950,
//                 fontSize: 16,
//                 lineHeight: 1,
//               }}
//               title="Close"
//             >
//               <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ✅ Routes */}
//       {/* ✅ HIDE HEADER: χωρίς padding στα auth routes (προαιρετικό αλλά σωστό) */}
//       <div style={{ padding: hideHeader ? 0 : "clamp(12px, 2vw, 24px)" }}>
//         <Routes>
//           {/* Public auctions */}
//           <Route
//             path="/"
//             element={
//               <AuctionsPage
//                 onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                 currentUser={authUser}
//                 onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
//                 onSignIn={() => navigate("/signin")}
//                 onCreateAuction={() => navigate("/auction/create")}
//                 onViewMyBids={() => navigate("/me/bids")}
//               />
//             }
//           />

//           <Route path="/auction/:auctionId" element={<AuctionDetailsRoute authUser={authUser} />} />

//           {/* Auth */}
//           <Route path="/signin" element={<SignInRoute onSignedIn={handleSignedIn} />} />
//           <Route path="/signup" element={<SignUpRoute onSignedIn={handleSignedIn} />} />

//           {/* User */}
//           <Route
//             path="/me"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <UserProfilePage
//                   onShowReferralCodeUsage={() => navigate("/me/referrals")}
//                   onAuthUserUpdated={patchAuthUser}
//                   onSignedOut={handleSignOut}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/wins"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyWonAuctionsPage
//                   onOpenDetails={(auctionId: number) => setDetailsModalAuctionId(auctionId)} // ✅ modal όπως 1ο
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/bids"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyBidAuctionsPage
//                   currentUser={authUser}
//                   // onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                   onSignIn={() => navigate("/signin")}
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/notifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <NotificationsPage />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyAuctionsPage
//                     currentUser={authUser}
//                     onSignIn={() => navigate("/signin")}
//                     onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                     onBack={() => navigate("/")}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/auction/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <CreateAuctionFlowPage
//                     onBack={() => navigate("/")}
//                     onCompleted={() => {
//                       navigate("/", { replace: true });
//                       showPageToast(
//                         "success",
//                         "Η δημοπρασία δημιουργήθηκε με επιτυχία και αναμένει έγκριση από κάποιον διαχειριστή."
//                       );
//                     }}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/referrals"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireReferralOwner isReferralOwner={!!isReferralOwner}>
//                   <ReferralCodeUsagePage onBack={() => navigate("/")} />
//                 </RequireReferralOwner>
//               </RequireAuth>
//             }
//           />

//           {/* Admin */}
//           <Route
//             path="/admin/users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUsersPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/users/:username"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUserDetailsRoute />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/categories"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminCategoriesPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminReferralCodesPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <CreateReferralCodePage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/active-users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <ActiveUsersAllMonthsPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/broadcast"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminBroadcastNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           {/* ✅ NEW from 2ο */}
//           <Route
//             path="/admin/notifications/send"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminSendNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/non-active"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminMyAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/verifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminVerificationPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/problem-reports"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminProblemReportsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>

//       {/* ✅ Modal Details (όπως 1ο) */}
//       {detailsModalAuctionId !== null && (
//         <div
//           onClick={() => setDetailsModalAuctionId(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.55)",
//             zIndex: 5000,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               width: "min(1200px, 96vw)",
//               height: "min(92vh, 900px)",
//               borderRadius: 16,
//               overflow: "hidden",
//               boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
//               background: "#F6F8FB",
//               position: "relative",
//             }}
//           >
//             <button
//               type="button"
//               onClick={() => setDetailsModalAuctionId(null)}
//               style={{
//                 position: "absolute",
//                 top: 10,
//                 right: 10,
//                 zIndex: 5100,
//                 width: 40,
//                 height: 40,
//                 borderRadius: 12,
//                 border: "1px solid rgba(17, 24, 39, 0.12)",
//                 background: "#FFFFFF",
//                 cursor: "pointer",
//                 fontWeight: 900,
//               }}
//               aria-label="Close"
//             >
//               ✕
//             </button>

//             <div style={{ height: "100%", overflowY: "auto" }}>
//               <AuctionDetailsPage
//                 auctionId={detailsModalAuctionId}
//                 variant="modal"
//                 currentUser={authUser}
//                 onBack={() => setDetailsModalAuctionId(null)}
//                 onOpenUserDetailsAsAdmin={(username: string) => {
//                   setDetailsModalAuctionId(null);
//                   navigate(`/admin/users/${encodeURIComponent(username)}`);
//                 }}
//                 // onGoToMyAuctions={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/me/auctions");
//                 // // }}
//                 // onSignIn={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/signin");
//                 // }}
//                 // onSignUp={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/signup");
//                 // }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <AppShell />
//     </BrowserRouter>
//   );
// };

// export default App;

///////////////////// VERSION 1 ///////////////////////////////////////

// // src/App.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import AuctionsPage from "./components/AuctionsPage";
// import AuctionDetailsPage from "./components/AuctionDetailsPage";
// import CreateAuctionFlowPage from "./components/CreateAuctionFlowPage";

// import SignUpFlowPage from "./components/SignUpFlowPage";
// import SignInForm from "./components/SignInForm";
// import UserProfilePage from "./components/UserProfilePage";

// import MyPendingAuctionsPage from "./components/MyPendingAuctionsPage";
// import MyWonAuctionsPage from "./components/MyWonAuctionsPage";
// import MyBidAuctionsPage from "./components/MyBidAuctionsPage";
// import MyAuctionsPage from "./components/MyAuctionsPage";

// import ReferralCodeUsagePage from "./components/ReferralCodeUsagePage";
// import NotificationsPage from "./components/NotificationsPage";

// import AdminReferralCodesPage from "./admin/components/AdminReferralCodesPage";
// import CreateReferralCodePage from "./admin/components/CreateReferralCodePage";
// import AdminPendingAuctionsPage from "./admin/components/AdminPendingAuctionsPage";
// import AdminCategoriesPage from "./admin/components/AdminCategoriesPage";
// import AdminUsersPage from "./admin/components/AdminUsersPage";
// import ActiveUsersAllMonthsPage from "./admin/components/ActiveUsersAllMonthsPage";
// import AdminUserDetailsPage from "./admin/components/AdminUserDetailsPage";
// import AdminBroadcastNotificationPage from "./admin/components/AdminBroadcastNotificationPage";
// import AdminMyAuctionsPage from "./admin/components/AdminMyAuctionsPage";

// import AdminVerificationPage from "./admin/components/AdminVerificationPage";
// import AdminProblemReportsPage from "./admin/components/AdminProblemReportsPage";

// // ✅ από το 2ο (updated)
// import AdminSendNotificationPage from "./admin/components/AdminSendNotificationPage";

// import { initSessionFromStoredRefreshToken } from "./api/Firebase/firebaseIdentityService";
// import { callBackendLogin, logout } from "./api/Springboot/backendUserService";

// import type { AuthUserDto } from "./models/Springboot/UserEntity";

// type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// type MenuPos = {
//   top: number;
//   left: number;
//   width: number;
//   maxHeight: number;
// };

// type PageToastType = "success" | "error";

// // ✅ SVG Icon (Bell)
// const BellIcon = ({ size = 20 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
//     <path
//       d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//     <path
//       d="M13.73 21a2 2 0 01-3.46 0"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// /** Guards */
// function RequireAuth({ isAuthenticated, children }: { isAuthenticated: boolean; children: React.ReactNode }) {
//   const location = useLocation();
//   if (!isAuthenticated) return <Navigate to="/signin" replace state={{ from: location }} />;
//   return <>{children}</>;
// }

// function RequireAdmin({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
//   if (!isAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireAuctioneerOrAdmin({
//   isAuctioneerOrAdmin,
//   children,
// }: {
//   isAuctioneerOrAdmin: boolean;
//   children: React.ReactNode;
// }) {
//   if (!isAuctioneerOrAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireReferralOwner({ isReferralOwner, children }: { isReferralOwner: boolean; children: React.ReactNode }) {
//   if (!isReferralOwner) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// /** Route wrappers */
// function AuctionDetailsRoute({ authUser }: { authUser: AuthUserDto | null }) {
//   const navigate = useNavigate();
//   const { auctionId } = useParams<{ auctionId: string }>();
//   const id = Number(auctionId);
//   if (!auctionId || Number.isNaN(id)) return <Navigate to="/" replace />;

//   return (
//     <AuctionDetailsPage
//       auctionId={id}
//       currentUser={authUser}
//       variant="page"
//       onBack={() => navigate(-1)}
//       onGoToMyAuctions={() => navigate("/me/auctions")}
//       onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
//       onSignIn={() => navigate("/signin")}
//       onSignUp={() => navigate("/signup")}
//     />
//   );
// }

// function AdminUserDetailsRoute() {
//   const navigate = useNavigate();
//   const { username } = useParams<{ username: string }>();
//   if (!username) return <Navigate to="/admin/users" replace />;

//   return <AdminUserDetailsPage username={decodeURIComponent(username)} onBack={() => navigate("/admin/users")} />;
// }

// function SignInRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
//   const navigate = useNavigate();
//   const location = useLocation() as any;

//   return (
//     <SignInForm
//       onSignedIn={(auth) => {
//         onSignedIn(auth);
//         const from = location?.state?.from?.pathname;
//         navigate(from || "/", { replace: true });
//       }}
//     />
//   );
// }

// function SignUpRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
//   const navigate = useNavigate();
//   const location = useLocation() as any;

//   return (
//     <SignUpFlowPage
//       onSignUpCompleted={(auth) => {
//         onSignedIn(auth);
//         const from = location?.state?.from?.pathname;
//         navigate(from || "/", { replace: true });
//       }}
//     />
//   );
// }

// const AppShell: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ✅ HIDE HEADER μόνο στα /signin & /signup
//   const hideHeader = location.pathname === "/signin" || location.pathname === "/signup";

//   // ------------------------
//   // Auth state (όπως πριν)
//   // ------------------------
//   const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
//   const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);

//   // ✅ για να αλλάζει το "Logged in as" / username/avatar κτλ από child pages
//   const patchAuthUser = (patch: Partial<AuthUserDto>) => {
//     setAuthUser((prev) => (prev ? { ...prev, ...patch } : prev));
//   };

//   useEffect(() => {
//     const bootstrapAuth = async () => {
//       try {
//         const session = await initSessionFromStoredRefreshToken();
//         if (session) {
//           try {
//             const auth = await callBackendLogin();
//             setAuthUser(auth);
//             setAuthStatus("authenticated");
//           } catch (e) {
//             console.error("Backend login failed on boot", e);
//             logout();
//             setAuthUser(null);
//             setAuthStatus("unauthenticated");
//           }
//         } else {
//           setAuthUser(null);
//           setAuthStatus("unauthenticated");
//         }
//       } catch (e) {
//         console.error("Error bootstrapping auth", e);
//         setAuthUser(null);
//         setAuthStatus("unauthenticated");
//       }
//     };

//     void bootstrapAuth();
//   }, []);

//   const handleSignedIn = (auth: AuthUserDto) => {
//     setAuthUser(auth);
//     setAuthStatus("authenticated");
//   };

//   const handleSignOut = () => {
//     logout();
//     setAuthUser(null);
//     setAuthStatus("unauthenticated");
//     setMenuOpen(false);
//     setUnreadCount(0);
//     navigate("/", { replace: true });
//   };

//   const isAuthenticated = authStatus === "authenticated";
//   const isAdmin = authUser?.roleName === "Admin";
//   const isAuctioneerOrAdmin = authUser?.roleName === "Auctioneer" || authUser?.roleName === "Admin";
//   const isReferralOwner = authUser?.isReferralCodeOwner === true;

//   // ------------------------
//   // UI state από το 1ο (header/menu/toast/modal)
//   // ------------------------
//   const LOGO_SRC = "/images/websiteLogoFinal1.png";

//   // responsive
//   const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
//   useEffect(() => {
//     const onResize = () => {
//       const w = window.innerWidth;
//       setVw((prev) => (prev === w ? prev : w));
//     };
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isMobile = vw <= 640;
//   const isTiny = vw <= 420;

//   // dropdown menu
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement | null>(null);

//   const userChipRef = useRef<HTMLDivElement | null>(null);
//   const [menuPos, setMenuPos] = useState<MenuPos | null>(null);

//   // modal auction details (π.χ. από MyWins)
//   const [detailsModalAuctionId, setDetailsModalAuctionId] = useState<number | null>(null);

//   useEffect(() => {
//     if (detailsModalAuctionId === null) return;

//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setDetailsModalAuctionId(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [detailsModalAuctionId]);

//   useEffect(() => {
//     if (detailsModalAuctionId === null) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [detailsModalAuctionId]);

//   // click outside
//   useEffect(() => {
//     if (!menuOpen) return;

//     const onDocClick = (e: MouseEvent) => {
//       const t = e.target as Node;
//       if (menuRef.current && !menuRef.current.contains(t)) {
//         setMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [menuOpen]);

//   // position menu only on open in mobile
//   useEffect(() => {
//     if (!menuOpen || !isMobile) {
//       setMenuPos(null);
//       return;
//     }

//     const el = userChipRef.current;
//     if (!el) return;

//     const rect = el.getBoundingClientRect();
//     const padding = 10;
//     const screenW = window.innerWidth;

//     const desired = Math.min(320, screenW - padding * 2);
//     const width = Math.min(Math.max(220, desired), screenW - padding * 2);

//     let left = rect.right - width;
//     left = Math.max(padding, Math.min(left, screenW - padding - width));

//     const top = rect.bottom + 10;
//     const maxHeight = Math.max(180, window.innerHeight - top - padding);

//     setMenuPos({ top, left, width, maxHeight });
//   }, [menuOpen, isMobile, vw]);

//   // close on scroll only on mobile
//   useEffect(() => {
//     if (!menuOpen || !isMobile) return;
//     const closeOnScroll = () => setMenuOpen(false);
//     window.addEventListener("scroll", closeOnScroll, { passive: true });
//     return () => window.removeEventListener("scroll", closeOnScroll);
//   }, [menuOpen, isMobile]);

//   // ------------------------
//   // Toast από το 1ο (μόνο στο "/")
//   // ------------------------
//   const [pageToast, setPageToast] = useState<{ type: PageToastType; msg: string } | null>(null);
//   const pageToastTimerRef = useRef<number | null>(null);

//   const clearPageToastTimer = () => {
//     if (pageToastTimerRef.current) {
//       window.clearTimeout(pageToastTimerRef.current);
//       pageToastTimerRef.current = null;
//     }
//   };

//   const closePageToast = () => {
//     clearPageToastTimer();
//     setPageToast(null);
//   };

//   const showPageToast = (type: PageToastType, msg: string, autoMs = 4500) => {
//     clearPageToastTimer();
//     setPageToast({ type, msg });
//     pageToastTimerRef.current = window.setTimeout(() => closePageToast(), autoMs);
//   };

//   useEffect(() => {
//     return () => clearPageToastTimer();
//   }, []);

//   // αν φύγεις από "/", κλείσε toast
//   useEffect(() => {
//     if (location.pathname !== "/") closePageToast();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.pathname]);

//   // ------------------------
//   // Avatar initial
//   // ------------------------
//   const avatarInitial = useMemo(() => {
//     const u = authUser?.username ?? "";
//     return u.trim().slice(0, 1).toUpperCase() || "?";
//   }, [authUser]);

//   const userAvatarUrl = authUser?.avatarUrl ?? null;

//   if (authStatus === "loading") {
//     return (
//       <div style={{ width: "100%", padding: 16 }}>
//         <p>Φόρτωση...</p>
//       </div>
//     );
//   }

//   // ------------------------
//   // Styles (από το 1ο)
//   // ------------------------
//   const headerOuter: React.CSSProperties = {
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 5000,
//     background: "#F5F6F8",
//     borderBottom: "1px solid rgba(17, 24, 39, 0.10)",
//     position: "sticky",
//   };

//   const headerInner: React.CSSProperties = {
//     width: "100%",
//     maxWidth: 1400,
//     margin: "0 auto",
//     padding: isMobile ? "10px 10px" : "14px 18px",
//     display: "flex",
//     flexDirection: isMobile ? "column" : "row",
//     alignItems: isMobile ? "stretch" : "center",
//     justifyContent: "space-between",
//     gap: isMobile ? 8 : 12,
//     boxSizing: "border-box",
//   };

//   const brandBtn: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: isMobile ? "center" : "flex-start",
//     gap: 10,
//     border: "none",
//     background: "transparent",
//     cursor: "pointer",
//     padding: 0,
//     flex: "0 0 auto",
//     width: isMobile ? "100%" : "auto",
//     order: isMobile ? 1 : 0,
//   };

//   const pillBtn: React.CSSProperties = {
//     height: "clamp(32px, 8vw, 40px)",
//     padding: "0 clamp(8px, 2.8vw, 14px)",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 800,
//     cursor: "pointer",
//     fontSize: "clamp(12px, 3.2vw, 14px)",
//     whiteSpace: "nowrap",
//     flex: "0 0 auto",
//   };

//   const primaryPill: React.CSSProperties = {
//     ...pillBtn,
//     background: "#0B1220",
//     border: "1px solid #0B1220",
//     color: "#FFFFFF",
//   };

//   const headerActions: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: isMobile ? 6 : 10,
//     width: isMobile ? "100%" : "auto",
//     justifyContent: isMobile ? "flex-start" : "flex-end",
//     flexWrap: isMobile ? "wrap" : "nowrap",
//     marginLeft: isMobile ? 0 : "auto",
//     minWidth: 0,
//     order: isMobile ? 1 : 0,
//   };

//   const userChip: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: isMobile ? 8 : 10,
//     cursor: "pointer",
//     borderRadius: 14,
//     padding: "clamp(6px, 1.8vw, 8px) clamp(8px, 2vw, 10px)",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     background: "#FFFFFF",
//     minWidth: 0,
//     maxWidth: "clamp(180px, 56vw, 320px)",
//   };

//   const avatar: React.CSSProperties = {
//     width: isMobile ? 30 : 34,
//     height: isMobile ? 30 : 34,
//     borderRadius: 999,
//     overflow: "hidden",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//     color: "#FFFFFF",
//     background: "#6366F1",
//     flex: "0 0 auto",
//   };

//   const menu: React.CSSProperties = isMobile
//     ? {
//         position: "fixed",
//         top: menuPos?.top ?? (isTiny ? 112 : 82),
//         left: menuPos?.left ?? 10,
//         width: menuPos?.width ?? Math.min(320, Math.max(220, vw - 20)),
//         background: "#FFFFFF",
//         borderRadius: 14,
//         border: "1px solid rgba(17, 24, 39, 0.12)",
//         boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
//         overflowY: "auto",
//         overflowX: "hidden",
//         WebkitOverflowScrolling: "touch",
//         maxHeight: menuPos?.maxHeight ?? "calc(100vh - 100px)",
//         zIndex: 6000,
//       }
//     : {
//         position: "absolute",
//         right: 0,
//         top: "calc(100% + 10px)",
//         width: 260,
//         background: "#FFFFFF",
//         borderRadius: 14,
//         border: "1px solid rgba(17, 24, 39, 0.12)",
//         boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
//         overflowY: "auto",
//         overflowX: "hidden",
//         maxHeight: "calc(100vh - 90px)",
//         zIndex: 6000,
//       };

//   const menuItem = (danger?: boolean): React.CSSProperties => ({
//     width: "100%",
//     textAlign: "left",
//     padding: "12px 14px",
//     border: "none",
//     background: "#FFFFFF",
//     cursor: "pointer",
//     fontWeight: 800,
//     color: danger ? "#DC2626" : "#111827",
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//   });

//   const menuDivider: React.CSSProperties = {
//     height: 1,
//     background: "rgba(17, 24, 39, 0.08)",
//   };

//   const iconBtn: React.CSSProperties = {
//     width: "clamp(36px, 9vw, 44px)",
//     height: "clamp(36px, 9vw, 44px)",
//     borderRadius: 14,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     cursor: "pointer",
//     display: "grid",
//     placeItems: "center",
//     padding: 0,
//     boxShadow: "0 6px 14px rgba(17,24,39,0.06)",
//     flex: "0 0 auto",
//   };

//   return (
//     <div style={{ width: "100%", minHeight: "100vh", background: "#F5F6F8" }}>
//       {/* ✅ Header (Design από 1ο) - HIDDEN σε signin/signup */}
//       {!hideHeader && (
//         <div style={headerOuter}>
//           <div style={headerInner}>
//             <button
//               type="button"
//               style={brandBtn}
//               onClick={() => {
//                 setMenuOpen(false);
//                 navigate("/");
//               }}
//             >
//               <img
//                 src={LOGO_SRC}
//                 alt="BidNow"
//                 style={{
//                   height: "clamp(40px, 20vw, 60px)",
//                   maxWidth: "clamp(250px, 34vw, 170px)",
//                   width: "250",
//                   display: "block",
//                 }}
//               />
//             </button>

//             <div style={headerActions}>
//               {!isAuthenticated ? (
//                 <>
//                   <button type="button" style={pillBtn} onClick={() => navigate("/signin")}>
//                     Sign In
//                   </button>
//                   <button type="button" style={primaryPill} onClick={() => navigate("/signup")}>
//                     Sign Up
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     type="button"
//                     style={iconBtn}
//                     onClick={() => {
//                       setMenuOpen(false);
//                       navigate("/me/notifications");
//                     }}
//                     aria-label="Notifications"
//                     title="Notifications"
//                   >
//                     <BellIcon size={isMobile ? 18 : 20} />
//                   </button>

//                   <div style={{ position: "relative" }} ref={menuRef}>
//                     <div
//                       ref={userChipRef}
//                       style={userChip}
//                       role="button"
//                       tabIndex={0}
//                       onClick={() => setMenuOpen((v) => !v)}
//                       title={authUser?.username}
//                     >
//                       <div style={avatar}>
//                         {userAvatarUrl ? (
//                           <img
//                             src={userAvatarUrl}
//                             alt="avatar"
//                             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                             onError={(e) => {
//                               (e.currentTarget as HTMLImageElement).style.display = "none";
//                             }}
//                           />
//                         ) : (
//                           <span>{avatarInitial}</span>
//                         )}
//                       </div>

//                       <div style={{ display: "grid", lineHeight: 1.1, minWidth: 0 }}>
//                         <div
//                           style={{
//                             fontWeight: 900,
//                             color: "#111827",
//                             whiteSpace: "nowrap",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             fontSize: isMobile ? 12.5 : 14,
//                           }}
//                         >
//                           {authUser?.username}
//                         </div>

//                         {!isMobile && (
//                           <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                             {authUser?.roleName ?? ""}
//                           </div>
//                         )}
//                       </div>

//                       <div style={{ marginLeft: 6, opacity: 0.75, flex: "0 0 auto" }}>⚙️</div>
//                     </div>

//                     {menuOpen && (
//                       <div style={menu}>
//                         {isAdmin ? (
//                           <>
//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/users"))}
//                             >
//                               🛡 Users (Admin)
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/auctions/pending"))}
//                             >
//                               🧰 Pending auctions (Admin)
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/categories"))}
//                             >
//                               🗂 Categories (Admin)
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes"))}
//                             >
//                               🔑 Referral codes (Admin)
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes/create"))}
//                             >
//                               ➕ Create referral code
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/active-users"))}
//                             >
//                               📊 Inspect active users
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/broadcast"))}
//                             >
//                               📣 Admin broadcast
//                             </button>

//                             {/* ✅ NEW from 2ο */}
//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/notifications/send"))}
//                             >
//                               📨 Send notification
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/auctions/non-active"))}
//                             >
//                               🧾 Admin non-active auctions
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/verifications"))}
//                             >
//                               ✅ Admin verifications
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/problem-reports"))}
//                             >
//                               🐞 Admin problem reports
//                             </button>

//                             <div style={menuDivider} />
//                             <button type="button" style={menuItem(true)} onClick={handleSignOut}>
//                               ⎋ Sign out
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/me"))}
//                             >
//                               👤 View my profile
//                             </button>

//                             {/* <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/bids"))}>
//                               🧾 View my bids
//                             </button> */}

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/me/wins"))}
//                             >
//                               🏆 View my won auctions
//                             </button>

//                             {isAuctioneerOrAdmin && (
//                               <>
//                                 <div style={menuDivider} />
//                                 {/* <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/auction/create"))}>
//                                   ➕ Create auction
//                                 </button> */}
//                                 <button
//                                   type="button"
//                                   style={menuItem()}
//                                   onClick={() => (setMenuOpen(false), navigate("/me/auctions"))}
//                                 >
//                                   📦 View my auctions
//                                 </button>
//                                 <button
//                                   type="button"
//                                   style={menuItem()}
//                                   onClick={() => (setMenuOpen(false), navigate("/me/auctions/pending"))}
//                                 >
//                                   ⏳ View my pending auctions
//                                 </button>
//                               </>
//                             )}

//                             {isReferralOwner && (
//                               <>
//                                 <div style={menuDivider} />
//                                 <button
//                                   type="button"
//                                   style={menuItem()}
//                                   onClick={() => (setMenuOpen(false), navigate("/me/referrals"))}
//                                 >
//                                   🎟 My referral usage
//                                 </button>
//                               </>
//                             )}

//                             <div style={menuDivider} />
//                             <button type="button" style={menuItem(true)} onClick={handleSignOut}>
//                               ⎋ Sign out
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ✅ Toast (μόνο στο "/") */}
//       {location.pathname === "/" && pageToast && (
//         <div
//           style={{
//             position: "fixed",
//             top: 18,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 7000,
//             width: "min(720px, 92vw)",
//             borderRadius: 16,
//             border: `1px solid ${pageToast.type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//             background: pageToast.type === "error" ? "#FEF2F2" : "#F0FDF4",
//             boxShadow: "0 14px 35px rgba(17, 24, 39, 0.12)",
//             padding: "12px 12px",
//             boxSizing: "border-box",
//           }}
//           role="status"
//           aria-live="polite"
//         >
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
//             <div
//               style={{
//                 fontWeight: 900,
//                 fontSize: 14,
//                 color: pageToast.type === "error" ? "#991B1B" : "#166534",
//                 lineHeight: 1.35,
//                 overflowWrap: "anywhere",
//                 wordBreak: "break-word",
//               }}
//             >
//               {pageToast.msg}
//             </div>

//             <button
//               type="button"
//               onClick={closePageToast}
//               aria-label="Close message"
//               style={{
//                 flex: "0 0 auto",
//                 width: 30,
//                 height: 30,
//                 padding: 0,
//                 borderRadius: 10,
//                 border: "1px solid rgba(17,24,39,0.12)",
//                 background: "rgba(255,255,255,0.75)",
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: 950,
//                 fontSize: 16,
//                 lineHeight: 1,
//               }}
//               title="Close"
//             >
//               <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ✅ Routes */}
//       {/* ✅ προαιρετικό: no padding σε signin/signup για full-screen auth UI */}
//       <div style={{ padding: hideHeader ? 0 : "clamp(12px, 2vw, 24px)" }}>
//         <Routes>
//           {/* Public auctions */}
//           <Route
//             path="/"
//             element={
//               <AuctionsPage
//                 onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                 currentUser={authUser}
//                 onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
//                 onSignIn={() => navigate("/signin")}
//                 onCreateAuction={() => navigate("/auction/create")}
//                 onViewMyBids={() => navigate("/me/bids")}
//               />
//             }
//           />

//           <Route path="/auction/:auctionId" element={<AuctionDetailsRoute authUser={authUser} />} />

//           {/* Auth */}
//           <Route path="/signin" element={<SignInRoute onSignedIn={handleSignedIn} />} />
//           <Route path="/signup" element={<SignUpRoute onSignedIn={handleSignedIn} />} />

//           {/* User */}
//           <Route
//             path="/me"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <UserProfilePage
//                   onShowReferralCodeUsage={() => navigate("/me/referrals")}
//                   onAuthUserUpdated={patchAuthUser}
//                   onSignedOut={handleSignOut}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/wins"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyWonAuctionsPage
//                   onOpenDetails={(auctionId: number) => setDetailsModalAuctionId(auctionId)} // ✅ modal όπως 1ο
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/bids"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyBidAuctionsPage
//                   currentUser={authUser}
//                   // onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                   onSignIn={() => navigate("/signin")}
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/notifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <NotificationsPage />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyAuctionsPage
//                     currentUser={authUser}
//                     onSignIn={() => navigate("/signin")}
//                     onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                     onBack={() => navigate("/")}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/auction/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <CreateAuctionFlowPage
//                     onBack={() => navigate("/")}
//                     onCompleted={() => {
//                       navigate("/", { replace: true });
//                       showPageToast(
//                         "success",
//                         "Η δημοπρασία δημιουργήθηκε με επιτυχία και αναμένει έγκριση από κάποιον διαχειριστή."
//                       );
//                     }}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/referrals"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireReferralOwner isReferralOwner={!!isReferralOwner}>
//                   <ReferralCodeUsagePage onBack={() => navigate("/")} />
//                 </RequireReferralOwner>
//               </RequireAuth>
//             }
//           />

//           {/* Admin */}
//           <Route
//             path="/admin/users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUsersPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/users/:username"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUserDetailsRoute />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/categories"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminCategoriesPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminReferralCodesPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <CreateReferralCodePage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/active-users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <ActiveUsersAllMonthsPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/broadcast"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminBroadcastNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           {/* ✅ NEW from 2ο */}
//           <Route
//             path="/admin/notifications/send"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminSendNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/non-active"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminMyAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/verifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminVerificationPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/problem-reports"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminProblemReportsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>

//       {/* ✅ Modal Details (όπως 1ο) */}
//       {detailsModalAuctionId !== null && (
//         <div
//           onClick={() => setDetailsModalAuctionId(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.55)",
//             zIndex: 5000,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               width: "min(1200px, 96vw)",
//               height: "min(92vh, 900px)",
//               borderRadius: 16,
//               overflow: "hidden",
//               boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
//               background: "#F6F8FB",
//               position: "relative",
//             }}
//           >
//             <button
//               type="button"
//               onClick={() => setDetailsModalAuctionId(null)}
//               style={{
//                 position: "absolute",
//                 top: 10,
//                 right: 10,
//                 zIndex: 5100,
//                 width: 40,
//                 height: 40,
//                 borderRadius: 12,
//                 border: "1px solid rgba(17, 24, 39, 0.12)",
//                 background: "#FFFFFF",
//                 cursor: "pointer",
//                 fontWeight: 900,
//               }}
//               aria-label="Close"
//             >
//               ✕
//             </button>

//             <div style={{ height: "100%", overflowY: "auto" }}>
//               <AuctionDetailsPage
//                 auctionId={detailsModalAuctionId}
//                 variant="modal"
//                 currentUser={authUser}
//                 onBack={() => setDetailsModalAuctionId(null)}
//                 onOpenUserDetailsAsAdmin={(username: string) => {
//                   setDetailsModalAuctionId(null);
//                   navigate(`/admin/users/${encodeURIComponent(username)}`);
//                 }}
//                 // onGoToMyAuctions={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/me/auctions");
//                 // // }}
//                 // onSignIn={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/signin");
//                 // }}
//                 // onSignUp={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/signup");
//                 // }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <AppShell />
//     </BrowserRouter>
//   );
// };

// export default App;



///////////////////////// VFINAL ////////////////////


// // src/App.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import AuctionsPage from "./components/AuctionsPage";
// import AuctionDetailsPage from "./components/AuctionDetailsPage";
// import CreateAuctionFlowPage from "./components/CreateAuctionFlowPage";

// import SignUpFlowPage from "./components/SignUpFlowPage";
// import SignInForm from "./components/SignInForm";
// import UserProfilePage from "./components/UserProfilePage";

// import MyPendingAuctionsPage from "./components/MyPendingAuctionsPage";
// import MyWonAuctionsPage from "./components/MyWonAuctionsPage";
// import MyBidAuctionsPage from "./components/MyBidAuctionsPage";
// import MyAuctionsPage from "./components/MyAuctionsPage";

// import ReferralCodeUsagePage from "./components/ReferralCodeUsagePage";
// import NotificationsPage from "./components/NotificationsPage";

// import AdminReferralCodesPage from "./admin/components/AdminReferralCodesPage";
// import CreateReferralCodePage from "./admin/components/CreateReferralCodePage";
// import AdminPendingAuctionsPage from "./admin/components/AdminPendingAuctionsPage";
// import AdminCategoriesPage from "./admin/components/AdminCategoriesPage";
// import AdminUsersPage from "./admin/components/AdminUsersPage";
// import ActiveUsersAllMonthsPage from "./admin/components/ActiveUsersAllMonthsPage";
// import AdminUserDetailsPage from "./admin/components/AdminUserDetailsPage";
// import AdminBroadcastNotificationPage from "./admin/components/AdminBroadcastNotificationPage";
// import AdminMyAuctionsPage from "./admin/components/AdminMyAuctionsPage";

// import AdminVerificationPage from "./admin/components/AdminVerificationPage";
// import AdminProblemReportsPage from "./admin/components/AdminProblemReportsPage";

// // ✅ από το 2ο (updated)
// import AdminSendNotificationPage from "./admin/components/AdminSendNotificationPage";

// import { initSessionFromStoredRefreshToken } from "./api/Firebase/firebaseIdentityService";
// import { callBackendLogin, logout } from "./api/Springboot/backendUserService";

// // ✅ NEW: unread notifications count (μέσω backendClient)
// import { getMyUnreadNotificationsCount } from "./api/Springboot/backendNotificationService";

// import type { AuthUserDto } from "./models/Springboot/UserEntity";

// type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// type MenuPos = {
//   top: number;
//   left: number;
//   width: number;
//   maxHeight: number;
// };

// type PageToastType = "success" | "error";

// // ✅ SVG Icon (Bell)
// const BellIcon = ({ size = 20 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
//     <path
//       d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//     <path
//       d="M13.73 21a2 2 0 01-3.46 0"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// /** Guards */
// function RequireAuth({ isAuthenticated, children }: { isAuthenticated: boolean; children: React.ReactNode }) {
//   const location = useLocation();
//   if (!isAuthenticated) return <Navigate to="/signin" replace state={{ from: location }} />;
//   return <>{children}</>;
// }

// function RequireAdmin({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
//   if (!isAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireAuctioneerOrAdmin({
//   isAuctioneerOrAdmin,
//   children,
// }: {
//   isAuctioneerOrAdmin: boolean;
//   children: React.ReactNode;
// }) {
//   if (!isAuctioneerOrAdmin) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// function RequireReferralOwner({ isReferralOwner, children }: { isReferralOwner: boolean; children: React.ReactNode }) {
//   if (!isReferralOwner) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// /** Route wrappers */
// function AuctionDetailsRoute({ authUser }: { authUser: AuthUserDto | null }) {
//   const navigate = useNavigate();
//   const { auctionId } = useParams<{ auctionId: string }>();
//   const id = Number(auctionId);
//   if (!auctionId || Number.isNaN(id)) return <Navigate to="/" replace />;

//   return (
//     <AuctionDetailsPage
//       auctionId={id}
//       currentUser={authUser}
//       variant="page"
//       onBack={() => navigate(-1)}
//       onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
//       onSignIn={() => navigate("/signin")}
//       onSignUp={() => navigate("/signup")}
//     />
//   );
// }

// function AdminUserDetailsRoute() {
//   const navigate = useNavigate();
//   const { username } = useParams<{ username: string }>();
//   if (!username) return <Navigate to="/admin/users" replace />;

//   return <AdminUserDetailsPage username={decodeURIComponent(username)} onBack={() => navigate("/admin/users")} />;
// }

// function SignInRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
//   const navigate = useNavigate();
//   const location = useLocation() as any;

//   return (
//     <SignInForm
//       onSignedIn={(auth) => {
//         onSignedIn(auth);
//         const from = location?.state?.from?.pathname;
//         navigate(from || "/", { replace: true });
//       }}
//     />
//   );
// }

// function SignUpRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
//   const navigate = useNavigate();
//   const location = useLocation() as any;

//   return (
//     <SignUpFlowPage
//       onSignUpCompleted={(auth) => {
//         onSignedIn(auth);
//         const from = location?.state?.from?.pathname;
//         navigate(from || "/", { replace: true });
//       }}
//     />
//   );
// }

// const AppShell: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ✅ HIDE HEADER μόνο στα /signin & /signup
//   const hideHeader = location.pathname === "/signin" || location.pathname === "/signup";

//   // ------------------------
//   // Auth state (όπως πριν)
//   // ------------------------
//   const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
//   const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);

//   // ✅ για να αλλάζει το "Logged in as" / username/avatar κτλ από child pages
//   const patchAuthUser = (patch: Partial<AuthUserDto>) => {
//     setAuthUser((prev) => (prev ? { ...prev, ...patch } : prev));
//   };

//   useEffect(() => {
//     const bootstrapAuth = async () => {
//       try {
//         const session = await initSessionFromStoredRefreshToken();
//         if (session) {
//           try {
//             const auth = await callBackendLogin();
//             setAuthUser(auth);
//             setAuthStatus("authenticated");
//           } catch (e) {
//             console.error("Backend login failed on boot", e);
//             logout();
//             setAuthUser(null);
//             setAuthStatus("unauthenticated");
//           }
//         } else {
//           setAuthUser(null);
//           setAuthStatus("unauthenticated");
//         }
//       } catch (e) {
//         console.error("Error bootstrapping auth", e);
//         setAuthUser(null);
//         setAuthStatus("unauthenticated");
//       }
//     };

//     void bootstrapAuth();
//   }, []);

//   const handleSignedIn = (auth: AuthUserDto) => {
//     setAuthUser(auth);
//     setAuthStatus("authenticated");
//   };

//   const handleSignOut = () => {
//     logout();
//     setAuthUser(null);
//     setAuthStatus("unauthenticated");
//     setUnreadCount(0); // ✅ NEW
//     setMenuOpen(false);
//     navigate("/", { replace: true });
//   };

//   const isAuthenticated = authStatus === "authenticated";
//   const isAdmin = authUser?.roleName === "Admin";
//   const isAuctioneerOrAdmin = authUser?.roleName === "Auctioneer" || authUser?.roleName === "Admin";
//   const isReferralOwner = authUser?.isReferralCodeOwner === true;

//   // ------------------------
//   // ✅ NEW: Unread notifications badge (calls Springboot API μέσω backendClient)
//   // ------------------------
//   const [unreadCount, setUnreadCount] = useState<number>(0);

//   const refreshUnreadCount = async () => {
//     try {
//       const c = await getMyUnreadNotificationsCount();
//       setUnreadCount(c);
//     } catch (e) {
//       console.error("Failed to fetch unread notifications count", e);
//     }
//   };

//   // 1) Μόλις γίνει authenticated -> πάρε count
//   useEffect(() => {
//     if (!isAuthenticated) {
//       setUnreadCount(0);
//       return;
//     }
//     void refreshUnreadCount();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuthenticated]);

//   // 2) Polling κάθε 30s
//   useEffect(() => {
//     if (!isAuthenticated) return;
//     const id = window.setInterval(() => void refreshUnreadCount(), 30000);
//     return () => window.clearInterval(id);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuthenticated]);

//   // 3) Όταν μπαίνεις στη σελίδα notifications -> refresh
//   useEffect(() => {
//     if (!isAuthenticated) return;
//     if (location.pathname === "/me/notifications") {
//       void refreshUnreadCount();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.pathname, isAuthenticated]);

//   // 4) Optional: instant refresh αν κάποια σελίδα κάνει dispatch event
//   useEffect(() => {
//     if (!isAuthenticated) return;
//     const handler = () => void refreshUnreadCount();
//     window.addEventListener("notifications:changed", handler);
//     return () => window.removeEventListener("notifications:changed", handler);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuthenticated]);

//   // ------------------------
//   // UI state από το 1ο (header/menu/toast/modal)
//   // ------------------------
//   const LOGO_SRC = "/images/websiteLogoFinal1.png";

//   // responsive
//   const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
//   useEffect(() => {
//     const onResize = () => {
//       const w = window.innerWidth;
//       setVw((prev) => (prev === w ? prev : w));
//     };
//     window.addEventListener("resize", onResize, { passive: true });
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const isMobile = vw <= 640;
//   const isTiny = vw <= 420;

//   // dropdown menu
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement | null>(null);

//   const userChipRef = useRef<HTMLDivElement | null>(null);
//   const [menuPos, setMenuPos] = useState<MenuPos | null>(null);

//   // modal auction details (π.χ. από MyWins)
//   const [detailsModalAuctionId, setDetailsModalAuctionId] = useState<number | null>(null);

//   useEffect(() => {
//     if (detailsModalAuctionId === null) return;

//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setDetailsModalAuctionId(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [detailsModalAuctionId]);

//   useEffect(() => {
//     if (detailsModalAuctionId === null) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [detailsModalAuctionId]);

//   // click outside
//   useEffect(() => {
//     if (!menuOpen) return;

//     const onDocClick = (e: MouseEvent) => {
//       const t = e.target as Node;
//       if (menuRef.current && !menuRef.current.contains(t)) {
//         setMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [menuOpen]);

//   // position menu only on open in mobile
//   useEffect(() => {
//     if (!menuOpen || !isMobile) {
//       setMenuPos(null);
//       return;
//     }

//     const el = userChipRef.current;
//     if (!el) return;

//     const rect = el.getBoundingClientRect();
//     const padding = 10;
//     const screenW = window.innerWidth;

//     const desired = Math.min(320, screenW - padding * 2);
//     const width = Math.min(Math.max(220, desired), screenW - padding * 2);

//     let left = rect.right - width;
//     left = Math.max(padding, Math.min(left, screenW - padding - width));

//     const top = rect.bottom + 10;
//     const maxHeight = Math.max(180, window.innerHeight - top - padding);

//     setMenuPos({ top, left, width, maxHeight });
//   }, [menuOpen, isMobile, vw]);

//   // close on scroll only on mobile
//   useEffect(() => {
//     if (!menuOpen || !isMobile) return;
//     const closeOnScroll = () => setMenuOpen(false);
//     window.addEventListener("scroll", closeOnScroll, { passive: true });
//     return () => window.removeEventListener("scroll", closeOnScroll);
//   }, [menuOpen, isMobile]);

//   // ------------------------
//   // Toast από το 1ο (μόνο στο "/")
//   // ------------------------
//   const [pageToast, setPageToast] = useState<{ type: PageToastType; msg: string } | null>(null);
//   const pageToastTimerRef = useRef<number | null>(null);

//   const clearPageToastTimer = () => {
//     if (pageToastTimerRef.current) {
//       window.clearTimeout(pageToastTimerRef.current);
//       pageToastTimerRef.current = null;
//     }
//   };

//   const closePageToast = () => {
//     clearPageToastTimer();
//     setPageToast(null);
//   };

//   const showPageToast = (type: PageToastType, msg: string, autoMs = 4500) => {
//     clearPageToastTimer();
//     setPageToast({ type, msg });
//     pageToastTimerRef.current = window.setTimeout(() => closePageToast(), autoMs);
//   };

//   useEffect(() => {
//     return () => clearPageToastTimer();
//   }, []);

//   // αν φύγεις από "/", κλείσε toast
//   useEffect(() => {
//     if (location.pathname !== "/") closePageToast();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.pathname]);

//   // ------------------------
//   // Avatar initial
//   // ------------------------
//   const avatarInitial = useMemo(() => {
//     const u = authUser?.username ?? "";
//     return u.trim().slice(0, 1).toUpperCase() || "?";
//   }, [authUser]);

//   const userAvatarUrl = authUser?.avatarUrl ?? null;

//   if (authStatus === "loading") {
//     return (
//       <div style={{ width: "100%", padding: 16 }}>
//         <p>Φόρτωση...</p>
//       </div>
//     );
//   }

//   // ------------------------
//   // Styles (από το 1ο)
//   // ------------------------
//   const headerOuter: React.CSSProperties = {
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 5000,
//     background: "#F5F6F8",
//     borderBottom: "1px solid rgba(17, 24, 39, 0.10)",
//     position: "sticky",
//   };

//   const headerInner: React.CSSProperties = {
//     width: "100%",
//     maxWidth: 1400,
//     margin: "0 auto",
//     padding: isMobile ? "10px 10px" : "14px 18px",
//     display: "flex",
//     flexDirection: isMobile ? "column" : "row",
//     alignItems: isMobile ? "stretch" : "center",
//     justifyContent: "space-between",
//     gap: isMobile ? 8 : 12,
//     boxSizing: "border-box",
//   };

//   const brandBtn: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: isMobile ? "center" : "flex-start",
//     gap: 10,
//     border: "none",
//     background: "transparent",
//     cursor: "pointer",
//     padding: 0,
//     flex: "0 0 auto",
//     width: isMobile ? "100%" : "auto",
//     order: isMobile ? 1 : 0,
//   };

//   const pillBtn: React.CSSProperties = {
//     height: "clamp(32px, 8vw, 40px)",
//     padding: "0 clamp(8px, 2.8vw, 14px)",
//     borderRadius: 12,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     fontWeight: 800,
//     cursor: "pointer",
//     fontSize: "clamp(12px, 3.2vw, 14px)",
//     whiteSpace: "nowrap",
//     flex: "0 0 auto",
//   };

//   const primaryPill: React.CSSProperties = {
//     ...pillBtn,
//     background: "#0B1220",
//     border: "1px solid #0B1220",
//     color: "#FFFFFF",
//   };

//   const headerActions: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: isMobile ? 6 : 10,
//     width: isMobile ? "100%" : "auto",
//     justifyContent: isMobile ? "flex-start" : "flex-end",
//     flexWrap: isMobile ? "wrap" : "nowrap",
//     marginLeft: isMobile ? 0 : "auto",
//     minWidth: 0,
//     order: isMobile ? 1 : 0,
//   };

//   const userChip: React.CSSProperties = {
//     display: "flex",
//     alignItems: "center",
//     gap: isMobile ? 8 : 10,
//     cursor: "pointer",
//     borderRadius: 14,
//     padding: "clamp(6px, 1.8vw, 8px) clamp(8px, 2vw, 10px)",
//     border: "1px solid rgba(17, 24, 39, 0.10)",
//     background: "#FFFFFF",
//     minWidth: 0,
//     maxWidth: "clamp(180px, 56vw, 320px)",
//   };

//   const avatar: React.CSSProperties = {
//     width: isMobile ? 30 : 34,
//     height: isMobile ? 30 : 34,
//     borderRadius: 999,
//     overflow: "hidden",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//     color: "#FFFFFF",
//     background: "#6366F1",
//     flex: "0 0 auto",
//   };

//   const menu: React.CSSProperties = isMobile
//     ? {
//         position: "fixed",
//         top: menuPos?.top ?? (isTiny ? 112 : 82),
//         left: menuPos?.left ?? 10,
//         width: menuPos?.width ?? Math.min(320, Math.max(220, vw - 20)),
//         background: "#FFFFFF",
//         borderRadius: 14,
//         border: "1px solid rgba(17, 24, 39, 0.12)",
//         boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
//         overflowY: "auto",
//         overflowX: "hidden",
//         WebkitOverflowScrolling: "touch",
//         maxHeight: menuPos?.maxHeight ?? "calc(100vh - 100px)",
//         zIndex: 6000,
//       }
//     : {
//         position: "absolute",
//         right: 0,
//         top: "calc(100% + 10px)",
//         width: 260,
//         background: "#FFFFFF",
//         borderRadius: 14,
//         border: "1px solid rgba(17, 24, 39, 0.12)",
//         boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
//         overflowY: "auto",
//         overflowX: "hidden",
//         maxHeight: "calc(100vh - 90px)",
//         zIndex: 6000,
//       };

//   const menuItem = (danger?: boolean): React.CSSProperties => ({
//     width: "100%",
//     textAlign: "left",
//     padding: "12px 14px",
//     border: "none",
//     background: "#FFFFFF",
//     cursor: "pointer",
//     fontWeight: 800,
//     color: danger ? "#DC2626" : "#111827",
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//   });

//   const menuDivider: React.CSSProperties = {
//     height: 1,
//     background: "rgba(17, 24, 39, 0.08)",
//   };

//   const iconBtn: React.CSSProperties = {
//     width: "clamp(36px, 9vw, 44px)",
//     height: "clamp(36px, 9vw, 44px)",
//     borderRadius: 14,
//     border: "1px solid rgba(17, 24, 39, 0.12)",
//     background: "#FFFFFF",
//     cursor: "pointer",
//     display: "grid",
//     placeItems: "center",
//     padding: 0,
//     boxShadow: "0 6px 14px rgba(17,24,39,0.06)",
//     flex: "0 0 auto",
//   };

//   return (
//     <div style={{ width: "100%", minHeight: "100vh", background: "#F5F6F8" }}>
//       {/* ✅ Header (Design από 1ο) - HIDDEN σε signin/signup */}
//       {!hideHeader && (
//         <div style={headerOuter}>
//           <div style={headerInner}>
//             <button
//               type="button"
//               style={brandBtn}
//               onClick={() => {
//                 setMenuOpen(false);
//                 navigate("/");
//               }}
//             >
//               <img
//                 src={LOGO_SRC}
//                 alt="BidNow"
//                 style={{
//                   height: "clamp(40px, 20vw, 60px)",
//                   maxWidth: "clamp(250px, 34vw, 170px)",
//                   width: "250",
//                   display: "block",
//                 }}
//               />
//             </button>

//             <div style={headerActions}>
//               {!isAuthenticated ? (
//                 <>
//                   <button type="button" style={pillBtn} onClick={() => navigate("/signin")}>
//                     Sign In
//                   </button>
//                   <button type="button" style={primaryPill} onClick={() => navigate("/signup")}>
//                     Sign Up
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   {/* <button
//                     type="button"
//                     style={{ ...iconBtn, position: "relative" }}
//                     onClick={() => {
//                       setMenuOpen(false);
//                       void refreshUnreadCount(); // ✅ NEW
//                       navigate("/me/notifications");
//                     }}
//                     aria-label="Notifications"
//                     title="Notifications"
//                   >
//                     <BellIcon size={isMobile ? 18 : 20} />

//                     {unreadCount > 0 && (
//                       <span
//                         style={{
//                           position: "absolute",
//                           top: 6,
//                           right: 6,
//                           minWidth: 18,
//                           height: 18,
//                           padding: "0 5px",
//                           borderRadius: 999,
//                           background: "#DC2626",
//                           color: "#FFFFFF",
//                           fontSize: 11,
//                           fontWeight: 900,
//                           display: "grid",
//                           placeItems: "center",
//                           lineHeight: 1,
//                           border: "2px solid #FFFFFF",
//                         }}
//                         aria-label={`${unreadCount} unread notifications`}
//                         title={`${unreadCount} unread`}
//                       >
//                         {unreadCount > 99 ? "99+" : unreadCount}
//                       </span>
//                     )}
//                   </button> */}
//                   <button
//   type="button"
//   style={{ ...iconBtn, position: "relative", overflow: "visible" }}
//   onClick={() => {
//     setMenuOpen(false);
//     void refreshUnreadCount();
//     navigate("/me/notifications");
//   }}
//   aria-label="Notifications"
//   title="Notifications"
// >
//   <BellIcon size={isMobile ? 18 : 20} />

//   {unreadCount > 0 && (
//     <span
//       style={{
//         position: "absolute",
//         top: 0,
//         right: 0,
//         transform: "translate(40%, -40%)", // ✅ βγάζει το badge έξω από το καμπανάκι
//         minWidth: isTiny ? 16 : 18,
//         height: isTiny ? 16 : 18,
//         padding: unreadCount >= 10 ? "0 5px" : "0 0px",
//         borderRadius: 999,
//         background: "#DC2626",
//         color: "#FFFFFF",
//         fontSize: isTiny ? 10 : 11,
//         fontWeight: 900,
//         display: "grid",
//         placeItems: "center",
//         lineHeight: 1,
//         border: `${isTiny ? 1.5 : 2}px solid #FFFFFF`,
//         pointerEvents: "none", // ✅ να μην “τρώει” click
//       }}
//       aria-label={`${unreadCount} unread notifications`}
//       title={`${unreadCount} unread`}
//     >
//       {unreadCount > 99 ? "99+" : unreadCount}
//     </span>
//   )}
// </button>


//                   <div style={{ position: "relative" }} ref={menuRef}>
//                     <div
//                       ref={userChipRef}
//                       style={userChip}
//                       role="button"
//                       tabIndex={0}
//                       onClick={() => setMenuOpen((v) => !v)}
//                       title={authUser?.username}
//                     >
//                       <div style={avatar}>
//                         {userAvatarUrl ? (
//                           <img
//                             src={userAvatarUrl}
//                             alt="avatar"
//                             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                             onError={(e) => {
//                               (e.currentTarget as HTMLImageElement).style.display = "none";
//                             }}
//                           />
//                         ) : (
//                           <span>{avatarInitial}</span>
//                         )}
//                       </div>

//                       <div style={{ display: "grid", lineHeight: 1.1, minWidth: 0 }}>
//                         <div
//                           style={{
//                             fontWeight: 900,
//                             color: "#111827",
//                             whiteSpace: "nowrap",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             fontSize: isMobile ? 12.5 : 14,
//                           }}
//                         >
//                           {authUser?.username}
//                         </div>

//                         {!isMobile && (
//                           <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
//                             {authUser?.roleName ?? ""}
//                           </div>
//                         )}
//                       </div>

//                       <div style={{ marginLeft: 6, opacity: 0.75, flex: "0 0 auto" }}>⚙️</div>
//                     </div>

//                     {menuOpen && (
//                       <div style={menu}>
//                         {isAdmin ? (
//                           <>
//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/users"))}
//                             >
//                               🛡 Users (Admin)
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/auctions/pending"))}
//                             >
//                               🧰 Pending auctions (Admin)
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/categories"))}
//                             >
//                               🗂 Categories (Admin)
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes"))}
//                             >
//                               🔑 Referral codes (Admin)
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes/create"))}
//                             >
//                               ➕ Create referral code
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/active-users"))}
//                             >
//                               📊 Inspect active users
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/broadcast"))}
//                             >
//                               📣 Admin broadcast
//                             </button>

//                             {/* ✅ NEW from 2ο */}
//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/notifications/send"))}
//                             >
//                               📨 Send notification
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/auctions/non-active"))}
//                             >
//                               🧾 Admin non-active auctions
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/verifications"))}
//                             >
//                               ✅ Admin verifications
//                             </button>

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/admin/problem-reports"))}
//                             >
//                               🐞 Admin problem reports
//                             </button>

//                             <div style={menuDivider} />
//                             <button type="button" style={menuItem(true)} onClick={handleSignOut}>
//                               ⎋ Sign out
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/me"))}
//                             >
//                               👤 View my profile
//                             </button>

//                             {/* <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me/bids"))}>
//                               🧾 View my bids
//                             </button> */}

//                             <button
//                               type="button"
//                               style={menuItem()}
//                               onClick={() => (setMenuOpen(false), navigate("/me/wins"))}
//                             >
//                               🏆 View my won auctions
//                             </button>

//                             {isAuctioneerOrAdmin && (
//                               <>
//                                 <div style={menuDivider} />
//                                 {/* <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/auction/create"))}>
//                                   ➕ Create auction
//                                 </button> */}
//                                 <button
//                                   type="button"
//                                   style={menuItem()}
//                                   onClick={() => (setMenuOpen(false), navigate("/me/auctions"))}
//                                 >
//                                   📦 View my auctions
//                                 </button>
//                                 <button
//                                   type="button"
//                                   style={menuItem()}
//                                   onClick={() => (setMenuOpen(false), navigate("/me/auctions/pending"))}
//                                 >
//                                   ⏳ View my pending auctions
//                                 </button>
//                               </>
//                             )}

//                             {isReferralOwner && (
//                               <>
//                                 <div style={menuDivider} />
//                                 <button
//                                   type="button"
//                                   style={menuItem()}
//                                   onClick={() => (setMenuOpen(false), navigate("/me/referrals"))}
//                                 >
//                                   🎟 My referral usage
//                                 </button>
//                               </>
//                             )}

//                             <div style={menuDivider} />
//                             <button type="button" style={menuItem(true)} onClick={handleSignOut}>
//                               ⎋ Sign out
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ✅ Toast (μόνο στο "/") */}
//       {location.pathname === "/" && pageToast && (
//         <div
//           style={{
//             position: "fixed",
//             top: 18,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 7000,
//             width: "min(720px, 92vw)",
//             borderRadius: 16,
//             border: `1px solid ${pageToast.type === "error" ? "#FCA5A5" : "#86EFAC"}`,
//             background: pageToast.type === "error" ? "#FEF2F2" : "#F0FDF4",
//             boxShadow: "0 14px 35px rgba(17, 24, 39, 0.12)",
//             padding: "12px 12px",
//             boxSizing: "border-box",
//           }}
//           role="status"
//           aria-live="polite"
//         >
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
//             <div
//               style={{
//                 fontWeight: 900,
//                 fontSize: 14,
//                 color: pageToast.type === "error" ? "#991B1B" : "#166534",
//                 lineHeight: 1.35,
//                 overflowWrap: "anywhere",
//                 wordBreak: "break-word",
//               }}
//             >
//               {pageToast.msg}
//             </div>

//             <button
//               type="button"
//               onClick={closePageToast}
//               aria-label="Close message"
//               style={{
//                 flex: "0 0 auto",
//                 width: 30,
//                 height: 30,
//                 padding: 0,
//                 borderRadius: 10,
//                 border: "1px solid rgba(17,24,39,0.12)",
//                 background: "rgba(255,255,255,0.75)",
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: 950,
//                 fontSize: 16,
//                 lineHeight: 1,
//               }}
//               title="Close"
//             >
//               <span style={{ display: "block", transform: "translateY(-0.5px)" }}>✕</span>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ✅ Routes */}
//       {/* ✅ προαιρετικό: no padding σε signin/signup για full-screen auth UI */}
//       <div style={{ padding: hideHeader ? 0 : "clamp(12px, 2vw, 24px)" }}>
//         <Routes>
//           {/* Public auctions */}
//           <Route
//             path="/"
//             element={
//               <AuctionsPage
//                 onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                 currentUser={authUser}
//                 onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
//                 onSignIn={() => navigate("/signin")}
//                 onCreateAuction={() => navigate("/auction/create")}
//                 onViewMyBids={() => navigate("/me/bids")}
//               />
//             }
//           />

//           <Route path="/auction/:auctionId" element={<AuctionDetailsRoute authUser={authUser} />} />

//           {/* Auth */}
//           <Route path="/signin" element={<SignInRoute onSignedIn={handleSignedIn} />} />
//           <Route path="/signup" element={<SignUpRoute onSignedIn={handleSignedIn} />} />

//           {/* User */}
//           <Route
//             path="/me"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <UserProfilePage
//                   onShowReferralCodeUsage={() => navigate("/me/referrals")}
//                   onAuthUserUpdated={patchAuthUser}
//                   onSignedOut={handleSignOut}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/wins"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyWonAuctionsPage
//                   onOpenDetails={(auctionId: number) => setDetailsModalAuctionId(auctionId)} // ✅ modal όπως 1ο
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/bids"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <MyBidAuctionsPage
//                   currentUser={authUser}
//                   // onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                   onSignIn={() => navigate("/signin")}
//                   onBack={() => navigate("/")}
//                 />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/notifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//       <NotificationsPage onBack={() => navigate("/")} />
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyAuctionsPage
//                     currentUser={authUser}
//                     onSignIn={() => navigate("/signin")}
//                     onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
//                     onBack={() => navigate("/")}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <MyPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/auction/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
//                   <CreateAuctionFlowPage
//                     onBack={() => navigate("/")}
//                     onCompleted={() => {
//                       navigate("/", { replace: true });
//                       showPageToast(
//                         "success",
//                         "Η δημοπρασία δημιουργήθηκε με επιτυχία και αναμένει έγκριση από κάποιον διαχειριστή."
//                       );
//                     }}
//                   />
//                 </RequireAuctioneerOrAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/me/referrals"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireReferralOwner isReferralOwner={!!isReferralOwner}>
//                   <ReferralCodeUsagePage onBack={() => navigate("/")} />
//                 </RequireReferralOwner>
//               </RequireAuth>
//             }
//           />

//           {/* Admin */}
//           <Route
//             path="/admin/users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUsersPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/users/:username"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminUserDetailsRoute />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/pending"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminPendingAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/categories"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminCategoriesPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminReferralCodesPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/referral-codes/create"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <CreateReferralCodePage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/active-users"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <ActiveUsersAllMonthsPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/broadcast"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminBroadcastNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           {/* ✅ NEW from 2ο */}
//           <Route
//             path="/admin/notifications/send"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminSendNotificationPage />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/auctions/non-active"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminMyAuctionsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/verifications"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminVerificationPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route
//             path="/admin/problem-reports"
//             element={
//               <RequireAuth isAuthenticated={isAuthenticated}>
//                 <RequireAdmin isAdmin={!!isAdmin}>
//                   <AdminProblemReportsPage onBack={() => navigate("/")} />
//                 </RequireAdmin>
//               </RequireAuth>
//             }
//           />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>

//       {/* ✅ Modal Details (όπως 1ο) */}
//       {detailsModalAuctionId !== null && (
//         <div
//           onClick={() => setDetailsModalAuctionId(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.55)",
//             zIndex: 5000,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               width: "min(1200px, 96vw)",
//               height: "min(92vh, 900px)",
//               borderRadius: 16,
//               overflow: "hidden",
//               boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
//               background: "#F6F8FB",
//               position: "relative",
//             }}
//           >
//             <button
//               type="button"
//               onClick={() => setDetailsModalAuctionId(null)}
//               style={{
//                 position: "absolute",
//                 top: 10,
//                 right: 10,
//                 zIndex: 5100,
//                 width: 40,
//                 height: 40,
//                 borderRadius: 12,
//                 border: "1px solid rgba(17, 24, 39, 0.12)",
//                 background: "#FFFFFF",
//                 cursor: "pointer",
//                 fontWeight: 900,
//               }}
//               aria-label="Close"
//             >
//               ✕
//             </button>

//             <div style={{ height: "100%", overflowY: "auto" }}>
//               <AuctionDetailsPage
//                 auctionId={detailsModalAuctionId}
//                 variant="modal"
//                 currentUser={authUser}
//                 onBack={() => setDetailsModalAuctionId(null)}
//                 onOpenUserDetailsAsAdmin={(username: string) => {
//                   setDetailsModalAuctionId(null);
//                   navigate(`/admin/users/${encodeURIComponent(username)}`);
//                 }}
//                 // onGoToMyAuctions={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/me/auctions");
//                 // // }}
//                 // onSignIn={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/signin");
//                 // }}
//                 // onSignUp={() => {
//                 //   setDetailsModalAuctionId(null);
//                 //   navigate("/signup");
//                 // }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <AppShell />
//     </BrowserRouter>
//   );
// };

// export default App;
// src/App.tsx


import React, { useEffect, useMemo, useRef, useState, useCallback} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import AuctionsPage from "./components/AuctionsPage";
import AuctionDetailsPage from "./components/AuctionDetailsPage";
import CreateAuctionFlowPage from "./components/CreateAuctionFlowPage";

import SignUpFlowPage from "./components/SignUpFlowPage";
import SignInForm from "./components/SignInForm";
import UserProfilePage from "./components/UserProfilePage";

import MyPendingAuctionsPage from "./components/MyPendingAuctionsPage";
import MyWonAuctionsPage from "./components/MyWonAuctionsPage";
import MyBidAuctionsPage from "./components/MyBidAuctionsPage";
import MyAuctionsPage from "./components/MyAuctionsPage";

import ReferralCodeUsagePage from "./components/ReferralCodeUsagePage";
import NotificationsPage from "./components/NotificationsPage";

import AdminReferralCodesPage from "./admin/components/AdminReferralCodesPage";
import CreateReferralCodePage from "./admin/components/CreateReferralCodePage";
import AdminPendingAuctionsPage from "./admin/components/AdminPendingAuctionsPage";
import AdminCategoriesPage from "./admin/components/AdminCategoriesPage";
import AdminUsersPage from "./admin/components/AdminUsersPage";
import ActiveUsersAllMonthsPage from "./admin/components/ActiveUsersAllMonthsPage";
import AdminUserDetailsPage from "./admin/components/AdminUserDetailsPage";
import AdminBroadcastNotificationPage from "./admin/components/AdminBroadcastNotificationPage";
import AdminMyAuctionsPage from "./admin/components/AdminMyAuctionsPage";

import AdminVerificationPage from "./admin/components/AdminVerificationPage";
import AdminProblemReportsPage from "./admin/components/AdminProblemReportsPage";

// ✅ από το 2ο (updated)
import AdminSendNotificationPage from "./admin/components/AdminSendNotificationPage";

import { initSessionFromStoredRefreshToken } from "./api/Firebase/firebaseIdentityService";
import { callBackendLogin, logout } from "./api/Springboot/backendUserService";

// ✅ NEW: unread notifications count (μέσω backendClient)
import { getMyUnreadNotificationsCount } from "./api/Springboot/backendNotificationService";

import type { AuthUserDto } from "./models/Springboot/UserEntity";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type MenuPos = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

type PageToastType = "success" | "error";

// ✅ SVG Icon (Bell)
const BellIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Guards */
function RequireAuth({ isAuthenticated, children }: { isAuthenticated: boolean; children: React.ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/signin" replace state={{ from: location }} />;
  return <>{children}</>;
}

function RequireAdmin({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireAuctioneerOrAdmin({
  isAuctioneerOrAdmin,
  children,
}: {
  isAuctioneerOrAdmin: boolean;
  children: React.ReactNode;
}) {
  if (!isAuctioneerOrAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireReferralOwner({ isReferralOwner, children }: { isReferralOwner: boolean; children: React.ReactNode }) {
  if (!isReferralOwner) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Route wrappers */
function AuctionDetailsRoute({ authUser }: { authUser: AuthUserDto | null }) {
  const navigate = useNavigate();
  const { auctionId } = useParams<{ auctionId: string }>();
  const id = Number(auctionId);
  if (!auctionId || Number.isNaN(id)) return <Navigate to="/" replace />;

  return (
    <AuctionDetailsPage
      auctionId={id}
      currentUser={authUser}
      variant="page"
      onBack={() => navigate(-1)}
      onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
      onSignIn={() => navigate("/signin")}
      onSignUp={() => navigate("/signup")}
    />
  );
}

function AdminUserDetailsRoute() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  if (!username) return <Navigate to="/admin/users" replace />;

  return <AdminUserDetailsPage username={decodeURIComponent(username)} onBack={() => navigate("/admin/users")} />;
}

function SignInRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
  const navigate = useNavigate();
  const location = useLocation() as any;

  return (
    <SignInForm
      onSignedIn={(auth) => {
        onSignedIn(auth);
        const from = location?.state?.from?.pathname;
        navigate(from || "/", { replace: true });
      }}
    />
  );
}

function SignUpRoute({ onSignedIn }: { onSignedIn: (auth: AuthUserDto) => void }) {
  const navigate = useNavigate();
  const location = useLocation() as any;

  return (
    <SignUpFlowPage
      onSignUpCompleted={(auth) => {
        onSignedIn(auth);
        const from = location?.state?.from?.pathname;
        navigate(from || "/", { replace: true });
      }}
    />
  );
}

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ HIDE HEADER μόνο στα /signin & /signup
  const hideHeader = location.pathname === "/signin" || location.pathname === "/signup";

  // ------------------------
  // Auth state (όπως πριν)
  // ------------------------
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);

  // ✅ για να αλλάζει το "Logged in as" / username/avatar κτλ από child pages
  const patchAuthUser = (patch: Partial<AuthUserDto>) => {
    setAuthUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const session = await initSessionFromStoredRefreshToken();
        if (session) {
          try {
            const auth = await callBackendLogin();
            setAuthUser(auth);
            setAuthStatus("authenticated");
          } catch (e) {
            console.error("Backend login failed on boot", e);
            logout();
            setAuthUser(null);
            setAuthStatus("unauthenticated");
          }
        } else {
          setAuthUser(null);
          setAuthStatus("unauthenticated");
        }
      } catch (e) {
        console.error("Error bootstrapping auth", e);
        setAuthUser(null);
        setAuthStatus("unauthenticated");
      }
    };

    void bootstrapAuth();
  }, []);

  const handleSignedIn = (auth: AuthUserDto) => {
    setAuthUser(auth);
    setAuthStatus("authenticated");
  };

  const handleSignOut = () => {
    logout();
    setAuthUser(null);
    setAuthStatus("unauthenticated");
    setUnreadCount(0); // ✅ NEW
    setMenuOpen(false);
    navigate("/", { replace: true });
  };

  const isAuthenticated = authStatus === "authenticated";
  const isAdmin = authUser?.roleName === "Admin";
  const isAuctioneerOrAdmin = authUser?.roleName === "Auctioneer" || authUser?.roleName === "Admin";
  const isReferralOwner = authUser?.isReferralCodeOwner === true;

  // ------------------------
  // ✅ NEW: Unread notifications badge (calls Springboot API μέσω backendClient)
  // ------------------------
  // const [unreadCount, setUnreadCount] = useState<number>(0);

  // const refreshUnreadCount = async () => {
  //   try {
  //     const c = await getMyUnreadNotificationsCount();
  //     setUnreadCount(c);
  //   } catch (e) {
  //     console.error("Failed to fetch unread notifications count", e);
  //   }
  // };
const [unreadCount, setUnreadCount] = useState<number>(0);

const unreadInFlightRef = useRef<Promise<void> | null>(null);
const lastUnreadFetchAtRef = useRef(0);

const refreshUnreadCount = useCallback(async (force = false) => {
  if (!isAuthenticated) return;

  const now = Date.now();
  if (!force && now - lastUnreadFetchAtRef.current < 800) return;

  if (unreadInFlightRef.current) return unreadInFlightRef.current;

  unreadInFlightRef.current = (async () => {
    try {
      const c = await getMyUnreadNotificationsCount();
      setUnreadCount(c);
      lastUnreadFetchAtRef.current = Date.now();
    } catch (e) {
      console.error("Failed to fetch unread notifications count", e);
    } finally {
      unreadInFlightRef.current = null;
    }
  })();

  return unreadInFlightRef.current;
}, [isAuthenticated]);

  // 1) Μόλις γίνει authenticated -> πάρε count
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    void refreshUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 2) Polling κάθε 30s
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = window.setInterval(() => void refreshUnreadCount(), 30000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 3) Όταν μπαίνεις στη σελίδα notifications -> refresh
  useEffect(() => {
    if (!isAuthenticated) return;
    if (location.pathname === "/me/notifications") {
      void refreshUnreadCount(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isAuthenticated]);

  // 4) Optional: instant refresh αν κάποια σελίδα κάνει dispatch event
  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = () => void refreshUnreadCount();
    window.addEventListener("notifications:changed", handler);
    return () => window.removeEventListener("notifications:changed", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ------------------------
  // UI state από το 1ο (header/menu/toast/modal)
  // ------------------------
  const LOGO_SRC = "/images/websiteLogoFinal1.png";

  // responsive
  const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setVw((prev) => (prev === w ? prev : w));
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = vw <= 640;
  const isTiny = vw <= 420;

  // ✅ EXTRA: για “πολύ μικρά” κινητά (π.χ. 320-340px)
  const isVeryTiny = vw <= 340;



  const badgeSize = isTiny || isVeryTiny ? 16 : 18;
  const badgeOffset = isTiny || isVeryTiny ? -5 : -6;
  // const showDotOnly = isVeryTiny; // σε πολύ μικρό πλάτος δείχνουμε μόνο τελεία (όχι αριθμό)
  // Badge text: μέχρι 9, μετά 9+
const badgeText = unreadCount > 9 ? "9+" : String(unreadCount);
const badgeIsPill = badgeText.length > 1; // "9+" => true

// λίγο πιο φαρδύ όταν είναι "9+"
const badgeMinWidth = badgeIsPill ? badgeSize + (isVeryTiny ? 6 : 8) : badgeSize;
const badgePadX = badgeIsPill ? (isVeryTiny ? 4 : 5) : 0;

// λίγο shift δεξιά όταν γίνεται pill, για να μην “κάθεται” άσχημα πάνω στο καμπανάκι
const badgeRight = badgeOffset - (badgeIsPill ? 2 : 0);
const badgeTop = badgeOffset; // κράτα το ίδιο
  // dropdown menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const userChipRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);

  // modal auction details (π.χ. από MyWins)
  const [detailsModalAuctionId, setDetailsModalAuctionId] = useState<number | null>(null);

  useEffect(() => {
    if (detailsModalAuctionId === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailsModalAuctionId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailsModalAuctionId]);

  useEffect(() => {
    if (detailsModalAuctionId === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailsModalAuctionId]);

  // click outside
  useEffect(() => {
    if (!menuOpen) return;

    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  // position menu only on open in mobile
  useEffect(() => {
    if (!menuOpen || !isMobile) {
      setMenuPos(null);
      return;
    }

    const el = userChipRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const padding = 10;
    const screenW = window.innerWidth;

    const desired = Math.min(320, screenW - padding * 2);
    const width = Math.min(Math.max(220, desired), screenW - padding * 2);

    let left = rect.right - width;
    left = Math.max(padding, Math.min(left, screenW - padding - width));

    const top = rect.bottom + 10;
    const maxHeight = Math.max(180, window.innerHeight - top - padding);

    setMenuPos({ top, left, width, maxHeight });
  }, [menuOpen, isMobile, vw]);

  // close on scroll only on mobile
  useEffect(() => {
    if (!menuOpen || !isMobile) return;
    const closeOnScroll = () => setMenuOpen(false);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [menuOpen, isMobile]);

  // ------------------------
  // Toast από το 1ο (μόνο στο "/")
  // ------------------------
  const [pageToast, setPageToast] = useState<{ type: PageToastType; msg: string } | null>(null);
  const pageToastTimerRef = useRef<number | null>(null);

  const clearPageToastTimer = () => {
    if (pageToastTimerRef.current) {
      window.clearTimeout(pageToastTimerRef.current);
      pageToastTimerRef.current = null;
    }
  };

  const closePageToast = () => {
    clearPageToastTimer();
    setPageToast(null);
  };

  const showPageToast = (type: PageToastType, msg: string, autoMs = 4500) => {
    clearPageToastTimer();
    setPageToast({ type, msg });
    pageToastTimerRef.current = window.setTimeout(() => closePageToast(), autoMs);
  };

  useEffect(() => {
    return () => clearPageToastTimer();
  }, []);

  // αν φύγεις από "/", κλείσε toast
  useEffect(() => {
    if (location.pathname !== "/") closePageToast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ------------------------
  // Avatar initial
  // ------------------------
  const avatarInitial = useMemo(() => {
    const u = authUser?.username ?? "";
    return u.trim().slice(0, 1).toUpperCase() || "?";
  }, [authUser]);

  const userAvatarUrl = authUser?.avatarUrl ?? null;

  if (authStatus === "loading") {
    return (
      <div style={{ width: "100%", padding: 16 }}>
        <p>Φόρτωση...</p>
      </div>
    );
  }

  // ------------------------
  // Styles (από το 1ο)
  // ------------------------
  const headerOuter: React.CSSProperties = {
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5000,
    background: "#F5F6F8",
    borderBottom: "1px solid rgba(17, 24, 39, 0.10)",
    position: "sticky",
  };

  const headerInner: React.CSSProperties = {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    padding: isMobile ? "10px 10px" : "14px 18px",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    gap: isMobile ? 8 : 12,
    boxSizing: "border-box",
  };

  const brandBtn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: isMobile ? "center" : "flex-start",
    gap: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    flex: "0 0 auto",
    width: isMobile ? "100%" : "auto",
    order: isMobile ? 1 : 0,
  };

  const pillBtn: React.CSSProperties = {
    height: "clamp(32px, 8vw, 40px)",
    padding: "0 clamp(8px, 2.8vw, 14px)",
    borderRadius: 12,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: "clamp(12px, 3.2vw, 14px)",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
  };

  const primaryPill: React.CSSProperties = {
    ...pillBtn,
    background: "#0B1220",
    border: "1px solid #0B1220",
    color: "#FFFFFF",
  };

  const headerActions: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 6 : 10,
    width: isMobile ? "100%" : "auto",
    justifyContent: isMobile ? "flex-start" : "flex-end",
    flexWrap: isMobile ? "wrap" : "nowrap",
    marginLeft: isMobile ? 0 : "auto",
    minWidth: 0,
    order: isMobile ? 1 : 0,
  };

  const userChip: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 8 : 10,
    cursor: "pointer",
    borderRadius: 14,
    padding: "clamp(6px, 1.8vw, 8px) clamp(8px, 2vw, 10px)",
    border: "1px solid rgba(17, 24, 39, 0.10)",
    background: "#FFFFFF",
    minWidth: 0,
    maxWidth: "clamp(180px, 56vw, 320px)",
  };

  const avatar: React.CSSProperties = {
    width: isMobile ? 30 : 34,
    height: isMobile ? 30 : 34,
    borderRadius: 999,
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#FFFFFF",
    background: "#6366F1",
    flex: "0 0 auto",
  };

  const menu: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: menuPos?.top ?? (isTiny ? 112 : 82),
        left: menuPos?.left ?? 10,
        width: menuPos?.width ?? Math.min(320, Math.max(220, vw - 20)),
        background: "#FFFFFF",
        borderRadius: 14,
        border: "1px solid rgba(17, 24, 39, 0.12)",
        boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        maxHeight: menuPos?.maxHeight ?? "calc(100vh - 100px)",
        zIndex: 6000,
      }
    : {
        position: "absolute",
        right: 0,
        top: "calc(100% + 10px)",
        width: 260,
        background: "#FFFFFF",
        borderRadius: 14,
        border: "1px solid rgba(17, 24, 39, 0.12)",
        boxShadow: "0 20px 40px rgba(17,24,39,0.12)",
        overflowY: "auto",
        overflowX: "hidden",
        maxHeight: "calc(100vh - 90px)",
        zIndex: 6000,
      };

  const menuItem = (danger?: boolean): React.CSSProperties => ({
    width: "100%",
    textAlign: "left",
    padding: "12px 14px",
    border: "none",
    background: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 800,
    color: danger ? "#DC2626" : "#111827",
    display: "flex",
    alignItems: "center",
    gap: 10,
  });

  const menuDivider: React.CSSProperties = {
    height: 1,
    background: "rgba(17, 24, 39, 0.08)",
  };

  const iconBtn: React.CSSProperties = {
    width: "clamp(36px, 9vw, 44px)",
    height: "clamp(36px, 9vw, 44px)",
    borderRadius: 14,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    background: "#FFFFFF",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    padding: 0,
    boxShadow: "0 6px 14px rgba(17,24,39,0.06)",
    flex: "0 0 auto",
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#F5F6F8" }}>
      {/* ✅ Header (Design από 1ο) - HIDDEN σε signin/signup */}
      {!hideHeader && (
        <div style={headerOuter}>
          <div style={headerInner}>
            <button
              type="button"
              style={brandBtn}
              onClick={() => {
                setMenuOpen(false);
                navigate("/");
              }}
            >
              <img
                src={LOGO_SRC}
                alt="BidNow"
                style={{
                  height: "clamp(40px, 20vw, 60px)",
                  maxWidth: "clamp(250px, 34vw, 170px)",
                  width: "250",
                  display: "block",
                }}
              />
            </button>

            <div style={headerActions}>
              {!isAuthenticated ? (
                <>
                  <button type="button" style={pillBtn} onClick={() => navigate("/signin")}>
                    Sign In
                  </button>
                  <button type="button" style={primaryPill} onClick={() => navigate("/signup")}>
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  {/* ✅ Notifications: wrapper + badge sibling (ΔΕΝ καλύπτει ποτέ το καμπανάκι) */}
                  <div style={{ position: "relative", flex: "0 0 auto" }}>
                    <button
                      type="button"
                      style={{ ...iconBtn, color: "#111827" }}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/me/notifications");
                      }}
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <BellIcon size={isMobile ? 18 : 20} />
                    </button>

                      {unreadCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: badgeTop,
                            right: badgeRight,
                            zIndex: 2,

                            height: badgeSize,
                            minWidth: badgeMinWidth,
                            width: "auto",

                            padding: `0 ${badgePadX}px`,
                            borderRadius: 999,
                            background: "#DC2626",
                            color: "#FFFFFF",
                            fontSize: isVeryTiny ? 9 : isTiny ? 10 : 11,
                            fontWeight: 900,

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                            lineHeight: 1,
                            boxSizing: "border-box",

                            border: "2px solid #F5F6F8",
                            pointerEvents: "none",
                          }}
                          aria-label={`${unreadCount} unread notifications`}
                          title={`${unreadCount} unread`}
                        >
                          {badgeText}
                        </span>
                      )}

                  </div>

                  <div style={{ position: "relative" }} ref={menuRef}>
                    <div
                      ref={userChipRef}
                      style={userChip}
                      role="button"
                      tabIndex={0}
                      onClick={() => setMenuOpen((v) => !v)}
                      title={authUser?.username}
                    >
                      <div style={avatar}>
                        {userAvatarUrl ? (
                          <img
                            src={userAvatarUrl}
                            alt="avatar"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span>{avatarInitial}</span>
                        )}
                      </div>

                      <div style={{ display: "grid", lineHeight: 1.1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 900,
                            color: "#111827",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: isMobile ? 12.5 : 14,
                          }}
                        >
                          {authUser?.username}
                        </div>

                        {!isMobile && (
                          <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 800 }}>
                            {authUser?.roleName ?? ""}
                          </div>
                        )}
                      </div>

                      <div style={{ marginLeft: 6, opacity: 0.75, flex: "0 0 auto" }}>⚙️</div>
                    </div>

                    {menuOpen && (
                      <div style={menu}>
                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/users"))}
                            >
                              🛡 Users (Admin)
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/auctions/pending"))}
                            >
                              🧰 Pending auctions (Admin)
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/categories"))}
                            >
                              🗂 Categories (Admin)
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes"))}
                            >
                              🔑 Referral codes (Admin)
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/referral-codes/create"))}
                            >
                              ➕ Create referral code
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/active-users"))}
                            >
                              📊 Inspect active users
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/broadcast"))}
                            >
                              📣 Admin broadcast
                            </button>

                            {/* ✅ NEW from 2ο */}
                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/notifications/send"))}
                            >
                              📨 Send notification
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/auctions/non-active"))}
                            >
                              🧾 Admin non-active auctions
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/verifications"))}
                            >
                              ✅ Admin verifications
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/admin/problem-reports"))}
                            >
                              🐞 Admin problem reports
                            </button>

                            <div style={menuDivider} />
                            <button type="button" style={menuItem(true)} onClick={handleSignOut}>
                              ⎋ Sign out
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" style={menuItem()} onClick={() => (setMenuOpen(false), navigate("/me"))}>
                              👤 View my profile
                            </button>

                            <button
                              type="button"
                              style={menuItem()}
                              onClick={() => (setMenuOpen(false), navigate("/me/wins"))}
                            >
                              🏆 View my won auctions
                            </button>

                            {isAuctioneerOrAdmin && (
                              <>
                                <div style={menuDivider} />
                                <button
                                  type="button"
                                  style={menuItem()}
                                  onClick={() => (setMenuOpen(false), navigate("/me/auctions"))}
                                >
                                  📦 View my auctions
                                </button>
                                <button
                                  type="button"
                                  style={menuItem()}
                                  onClick={() => (setMenuOpen(false), navigate("/me/auctions/pending"))}
                                >
                                  ⏳ View my pending auctions
                                </button>
                              </>
                            )}

                            {isReferralOwner && (
                              <>
                                <div style={menuDivider} />
                                <button
                                  type="button"
                                  style={menuItem()}
                                  onClick={() => (setMenuOpen(false), navigate("/me/referrals"))}
                                >
                                  🎟 My referral usage
                                </button>
                              </>
                            )}

                            <div style={menuDivider} />
                            <button type="button" style={menuItem(true)} onClick={handleSignOut}>
                              ⎋ Sign out
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast (μόνο στο "/") */}
      {location.pathname === "/" && pageToast && (
        <div
          style={{
            position: "fixed",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 7000,
            width: "min(720px, 92vw)",
            borderRadius: 16,
            border: `1px solid ${pageToast.type === "error" ? "#FCA5A5" : "#86EFAC"}`,
            background: pageToast.type === "error" ? "#FEF2F2" : "#F0FDF4",
            boxShadow: "0 14px 35px rgba(17, 24, 39, 0.12)",
            padding: "12px 12px",
            boxSizing: "border-box",
          }}
          role="status"
          aria-live="polite"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: 14,
                color: pageToast.type === "error" ? "#991B1B" : "#166534",
                lineHeight: 1.35,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {pageToast.msg}
            </div>

            <button
              type="button"
              onClick={closePageToast}
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
        </div>
      )}

      {/* ✅ Routes */}
      <div style={{ padding: hideHeader ? 0 : "clamp(12px, 2vw, 24px)" }}>
        <Routes>
          {/* Public auctions */}
          <Route
            path="/"
            element={
              <AuctionsPage
                onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
                currentUser={authUser}
                onOpenUserDetailsAsAdmin={(username: string) => navigate(`/admin/users/${encodeURIComponent(username)}`)}
                onSignIn={() => navigate("/signin")}
                onCreateAuction={() => navigate("/auction/create")}
                onViewMyBids={() => navigate("/me/bids")}
              />
            }
          />

          <Route path="/auction/:auctionId" element={<AuctionDetailsRoute authUser={authUser} />} />

          {/* Auth */}
          <Route path="/signin" element={<SignInRoute onSignedIn={handleSignedIn} />} />
          <Route path="/signup" element={<SignUpRoute onSignedIn={handleSignedIn} />} />

          {/* User */}
          <Route
            path="/me"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <UserProfilePage
                  onShowReferralCodeUsage={() => navigate("/me/referrals")}
                  onAuthUserUpdated={patchAuthUser}
                  onSignedOut={handleSignOut}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/me/wins"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <MyWonAuctionsPage
                  onOpenDetails={(auctionId: number) => setDetailsModalAuctionId(auctionId)}
                  onBack={() => navigate("/")}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/me/bids"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <MyBidAuctionsPage currentUser={authUser} onSignIn={() => navigate("/signin")} onBack={() => navigate("/")} />
              </RequireAuth>
            }
          />

          <Route
            path="/me/notifications"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <NotificationsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/me/auctions"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
                  <MyAuctionsPage
                    currentUser={authUser}
                    onSignIn={() => navigate("/signin")}
                    onOpenDetails={(auctionId: number) => navigate(`/auction/${auctionId}`)}
                    onBack={() => navigate("/")}
                  />
                </RequireAuctioneerOrAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/me/auctions/pending"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
                  <MyPendingAuctionsPage onBack={() => navigate("/auction")} />
                </RequireAuctioneerOrAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/auction/create"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAuctioneerOrAdmin isAuctioneerOrAdmin={!!isAuctioneerOrAdmin}>
                  <CreateAuctionFlowPage
                    onBack={() => navigate("/")}
                    onCompleted={() => {
                      navigate("/me/auctions/pending", { replace: true });
                      showPageToast(
                        "success",
                        "Η δημοπρασία δημιουργήθηκε με επιτυχία και αναμένει έγκριση από κάποιον διαχειριστή."
                      );
                    }}
                  />
                </RequireAuctioneerOrAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/me/referrals"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireReferralOwner isReferralOwner={!!isReferralOwner}>
                  <ReferralCodeUsagePage onBack={() => navigate("/")} />
                </RequireReferralOwner>
              </RequireAuth>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/users"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminUsersPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/users/:username"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminUserDetailsRoute />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/auctions/pending"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminPendingAuctionsPage onBack={() => navigate("/")} />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminCategoriesPage onBack={() => navigate("/")} />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/referral-codes"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminReferralCodesPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/referral-codes/create"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <CreateReferralCodePage />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/active-users"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <ActiveUsersAllMonthsPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/broadcast"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminBroadcastNotificationPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          {/* ✅ NEW from 2ο */}
          <Route
            path="/admin/notifications/send"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminSendNotificationPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/auctions/non-active"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminMyAuctionsPage onBack={() => navigate("/")} />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/verifications"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminVerificationPage onBack={() => navigate("/")} />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route
            path="/admin/problem-reports"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <RequireAdmin isAdmin={!!isAdmin}>
                  <AdminProblemReportsPage onBack={() => navigate("/")} />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* ✅ Modal Details (όπως 1ο) */}
      {detailsModalAuctionId !== null && (
        <div
          onClick={() => setDetailsModalAuctionId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 5000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1200px, 96vw)",
              height: "min(92vh, 900px)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
              background: "#F6F8FB",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setDetailsModalAuctionId(null)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 5100,
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid rgba(17, 24, 39, 0.12)",
                background: "#FFFFFF",
                cursor: "pointer",
                fontWeight: 900,
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={{ height: "100%", overflowY: "auto" }}>
              <AuctionDetailsPage
                auctionId={detailsModalAuctionId}
                variant="modal"
                currentUser={authUser}
                onBack={() => setDetailsModalAuctionId(null)}
                onOpenUserDetailsAsAdmin={(username: string) => {
                  setDetailsModalAuctionId(null);
                  navigate(`/admin/users/${encodeURIComponent(username)}`); // admin navigation
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
};

export default App;
