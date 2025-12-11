// // src/App.tsx
// import React, { useEffect, useState } from "react";

// import AuctionsPage from "./components/AuctionsPage";
// import AuctionDetailsPage from "./components/AuctionDetailsPage";
// import CreateAuctionFlowPage from "./components/CreateAuctionFlowPage";

// import SignUpFlowPage from "./components/SignUpFlowPage";
// import SignInForm from "./components/SignInForm";
// import UserProfilePage from "./components/UserProfilePage";

// import MyPendingAuctionsPage from "./components/MyPendingAuctionsPage";

// import MyWonAuctionsPage from "./components/MyWonAuctionsPage";

// import ReferralCodeUsagePage from "./components/ReferralCodeUsagePage";

// import AdminReferralCodesPage from "./admin/components/AdminReferralCodesPage";

// import {
//   initSessionFromStoredRefreshToken,
// } from "./api/Firebase/firebaseIdentityService";
// import {
//   callBackendLogin,
//   logout,
// } from "./api/Springboot/backendUserService";
// import type { AuthUserDto } from "./models/Springboot/UserEntity";
// import MyBidAuctionsPage from "./components/MyBidAuctionsPage";
// import CreateReferralCodePage from "./admin/components/CreateReferralCodePage";

// import AdminPendingAuctionsPage from "./admin/components/AdminPendingAuctionsPage";

// import AdminCategoriesPage from "./admin/components/AdminCategoriesPage";

// import AdminUsersPage from "./admin/components/AdminUsersPage";

// import ActiveUsersAllMonthsPage from "./admin/components/ActiveUsersAllMonthsPage";


// type AppPage =
//   | "auctions"
//   | "auctionDetails"
//   | "signup"
//   | "signin"
//   | "myProfile"
//   | "createAuction"
//   | "myPendingAuctions"
//   | "myWins"
//   | "myActiveBids"
//   | "myReferralCodeUsage"
//   | "createReferralCode"
//   | "users"
//   | "pendingAuctions"
//   | "endingAuctions"
//   | "categories"
//   | "referralCodes"
//   | "createReferralCode"
//   | "inspectActiveUsers";


// type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// const App: React.FC = () => {
//   const [page, setPage] = useState<AppPage>("auctions"); // 👉 πρώτη σελίδα: auctions
//   const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
//   const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);

//   const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(
//     null
//   );

//   // bootstrap auth από stored refresh token
//   useEffect(() => {
//     const bootstrapAuth = async () => {
//       try {
//         const session = await initSessionFromStoredRefreshToken();

//         if (session) {
//           try {
//             const auth = await callBackendLogin();
//             setAuthUser(auth);
//             setAuthStatus("authenticated");
//             // ΔΕΝ σε πετάω σε "home", μένουμε στην auctions
//             setPage("auctions");
//           } catch (e) {
//             console.error("Backend login failed on boot", e);
//             logout();
//             setAuthUser(null);
//             setAuthStatus("unauthenticated");
//             setPage("auctions");
//           }
//         } else {
//           setAuthUser(null);
//           setAuthStatus("unauthenticated");
//           setPage("auctions");
//         }
//       } catch (e) {
//         console.error("Error bootstrapping auth", e);
//         setAuthUser(null);
//         setAuthStatus("unauthenticated");
//         setPage("auctions");
//       }
//     };

//     bootstrapAuth();
//   }, []);

//   const handleSignedIn = (auth: AuthUserDto) => {
//     setAuthUser(auth);
//     setAuthStatus("authenticated");
//     setPage("auctions"); // μετά το sign in / sign up γυρίζουμε στη λίστα
//   };

//   const handleSignOut = () => {
//     logout();
//     setAuthUser(null);
//     setAuthStatus("unauthenticated");
//     setPage("auctions");
//   };

//   const handleOpenDetails = (auctionId: number) => {
//     setSelectedAuctionId(auctionId);
//     setPage("auctionDetails");
//   };

//   const isAuctioneer =
//     authUser?.roleName === "Auctioneer";

//   if (authStatus === "loading") {
//     return (
//       <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
//         <p>Φόρτωση...</p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
//       {/* HEADER / NAVBAR */}
//       <header
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "1rem",
//           borderBottom: "1px solid #ddd",
//           paddingBottom: "0.5rem",
//         }}
//       >
//         {/* Αριστερά: τίτλος + κουμπί Auctions */}
//         <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//           <h1 style={{ margin: 0, fontSize: "1.3rem" }}>BidNow</h1>

//           <button onClick={() => setPage("auctions")}>Auctions</button>
//         </div>

//         {/* Δεξιά: auth info + actions */}
//         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
//           {authStatus === "authenticated" ? (
//             <>

//               {/* Users */}

//               <span style={{ fontSize: "0.9rem", color: "#555" }}>
//                 Logged in as{" "}
//                 <strong>{authUser?.username}</strong>
//                 {authUser?.roleName && ` (${authUser.roleName})`}
//               </span>

//               {/* Profile */}
//               <button onClick={() => setPage("myProfile")}>User Profile</button>

//               <button
//                 onClick={() => {
//                   setPage("myWins");
//                 }}
//               >
//                 My Wins
//               </button>

//               <button
//                 onClick={() => {
//                   setPage("myActiveBids");
//                 }}>
//                   My Active Bids
//               </button>


//               {/* Auctioneers */}


//               {/* Create Auction – αν θες μόνο για Auctioneers χρησιμοποίησε το isAuctioneer */}
//               { isAuctioneer && (
//                 <>
//                 <button onClick={() => setPage("createAuction")}>
//                   Create Auction
//                 </button>
//                     {/* 👇 ΝΕΟ κουμπί για pending auctions */}
//                 <button onClick={() => { setPage("myPendingAuctions")}}>
//                 My Pending Auctions
//                 </button>
//                 </>
//               )
//               }

//               {/* Referral Code Owner */}

//               { authUser && authUser.isReferralCodeOwner&& (
//                 <button
//                   onClick={() => {
//                     setPage("myReferralCodeUsage");
//                   }}
//                 >
//                   My Referral Code Usage
//                 </button>
//               )
//               }


//               {/* Admin */}

//               { authUser && authUser.roleName == "Admin" && (
//                 <>
                
//                 <button
//                   onClick={() => {
//                     setPage("users");
//                   }}
//                 >
//                   Users Page 
//                 </button>                
                

//                 <button
//                   onClick={() => {
//                     setPage("pendingAuctions");
//                   }}
//                 >
//                   Pending Auctions
//                 </button>                 
                
//                 <button
//                   onClick={() => {
//                     setPage("categories");
//                   }}
//                 >
//                   Categories
//                 </button> 

//                 <button
//                   onClick={() => {
//                     setPage("referralCodes");
//                   }}
//                 >
//                   Referral Codes 
//                 </button> 



//                 <button
//                   onClick={() => {
//                     setPage("createReferralCode");
//                   }}
//                 >
//                   Create Referral Codes
//                 </button> 


//                 <button
//                   onClick={() => {
//                     setPage("inspectActiveUsers");
//                   }}
//                 >
//                   Inspect Active Users
//                 </button>

             


//               </>
//               )
//               }


//               {/* Logout */}
//               <button onClick={handleSignOut}>Sign Out</button>


//             </>
//           ) : (
//             <>
//               <span style={{ fontSize: "0.9rem", color: "#555" }}>
//                 Guest (not signed in)
//               </span>
//               <button onClick={() => setPage("signin")}>Sign In</button>
//               <button onClick={() => setPage("signup")}>Sign Up</button>
//             </>
//           )}
//         </div>
//       </header>

//       {/* ROUTING / PAGES */}


//       {/* Anonymous */}

//       {page === "signup" && (
//         <SignUpFlowPage onSignUpCompleted={handleSignedIn} />
//       )}

//       {page === "signin" && <SignInForm onSignedIn={handleSignedIn} />}

//       {page === "auctions" && (
//         <AuctionsPage onOpenDetails={handleOpenDetails} />
//       )}

//       {page === "auctionDetails" && selectedAuctionId !== null && (
//         <AuctionDetailsPage
//           auctionId={selectedAuctionId}
//           onBack={() => setPage("auctions")}
//         />
//       )}

//       {/* User(Bidder-Auctioneer) */}

//       {page === "myProfile" && authStatus === "authenticated" && (
//         <UserProfilePage
//           // αν δεν έχεις ReferralCodeUsagePage σε αυτό το app, μπορεί να είναι απλό no-op
//           onShowReferralCodeUsage={() => {
//             alert("Referral code usage page δεν έχει υλοποιηθεί σε αυτό το app.");
//           }}
//         />
//       )}
      
//       {page === "myWins" && authStatus === "authenticated" && (
//         <MyWonAuctionsPage />
//       )}

//       {page === "myActiveBids" && authStatus === "authenticated" && (
//         <MyBidAuctionsPage onOpenDetails={handleOpenDetails}/>
//       )}

//       {/* Auctioneer */}

//       {page === "createAuction" && authStatus === "authenticated" && authUser && authUser.roleName == "Auctioneer" && (
//         <CreateAuctionFlowPage
//           onCompleted={() => {
//             // Επειδή τα auctions δημιουργούνται ως PENDING,
//             // δεν σε πάω στο details (για να μην φας το "this is not an active auction").
//             alert(
//               "Το auction δημιουργήθηκε και είναι σε κατάσταση 'pending approval' από admin."
//             );
//             setPage("auctions");
//           }}
//         />
//       )}

//       {page === "myPendingAuctions" && authStatus === "authenticated" && authUser && authUser.roleName == "Auctioneer" && (
//           <MyPendingAuctionsPage onBack={() => setPage("auctions")}/>
//       )}

//       {/* Referral Code Owner */}

//       {page === "myReferralCodeUsage" && authStatus === "authenticated" && authUser && authUser.isReferralCodeOwner && (
//         <ReferralCodeUsagePage onBack={() => setPage("auctions")}/>
//       )}

//       {/* Admin */}

//       {/* Create Referral Code */}
//       {page === "createReferralCode" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
//           <CreateReferralCodePage />
//       )}    

//       {/* Admin pending auctions */}
//       {page === "pendingAuctions" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
//           <AdminPendingAuctionsPage onBack={() => setPage("auctions")} />
//       )}

//       {/* Admin categories */}
//       {page === "categories" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
//           <AdminCategoriesPage onBack={() => setPage("auctions")} />
//       )}

//       {/* Admin users */}
//       {page === "users" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
//         <AdminUsersPage />
//       )}

//       {/* Create referral code (Admin) */}
//       {page === "createReferralCode" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
//         <CreateReferralCodePage />
//       )}

//       {/* Admin referral codes */}
//       {page === "referralCodes" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
//         <AdminReferralCodesPage />
//       )}

//       {/* Active users stats */}
//       {page === "inspectActiveUsers" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
//         <ActiveUsersAllMonthsPage />
//       )}


//       {/* Προστασία σελίδων αν για κάποιο λόγο φτάσουμε εδώ χωρίς auth
//       {authStatus === "unauthenticated" &&
//         (page === "myProfile" || page === "createAuction") && (
//           <p style={{ marginTop: "1rem", color: "red" }}>
//             Πρέπει να συνδεθείς για να δεις αυτή τη σελίδα.
//           </p>
//         )} */}

//       {/* Προστασία αν κάποιος πάει σε σελίδες χωρίς auth */}
//       {authStatus === "unauthenticated" &&
//         (page === "myProfile" ||
//           page === "createAuction" ||
//           page === "myPendingAuctions" ||
//           page === "myActiveBids" ||
//           page === "myWins" ||
//           page === "pendingAuctions" ||
//           page === "categories" ||
//           page === "users" ||
//           page === "createReferralCode" ||
//           page === "referralCodes" ||
//           page === "inspectActiveUsers" ||
//           page === "myReferralCodeUsage") && (
//           <p>Πρέπει να συνδεθείς για να δεις αυτή τη σελίδα.</p>
//         )}


//     </div>
//   );
// };

// export default App;


// src/App.tsx
import React, { useEffect, useState } from "react";

import AuctionsPage from "./components/AuctionsPage";
import AuctionDetailsPage from "./components/AuctionDetailsPage";
import CreateAuctionFlowPage from "./components/CreateAuctionFlowPage";

import SignUpFlowPage from "./components/SignUpFlowPage";
import SignInForm from "./components/SignInForm";
import UserProfilePage from "./components/UserProfilePage";

import MyPendingAuctionsPage from "./components/MyPendingAuctionsPage";

import MyWonAuctionsPage from "./components/MyWonAuctionsPage";

import ReferralCodeUsagePage from "./components/ReferralCodeUsagePage";

import AdminReferralCodesPage from "./admin/components/AdminReferralCodesPage";

import {
  initSessionFromStoredRefreshToken,
} from "./api/Firebase/firebaseIdentityService";
import {
  callBackendLogin,
  logout,
} from "./api/Springboot/backendUserService";
import type { AuthUserDto } from "./models/Springboot/UserEntity";
import MyBidAuctionsPage from "./components/MyBidAuctionsPage";
import CreateReferralCodePage from "./admin/components/CreateReferralCodePage";

import AdminPendingAuctionsPage from "./admin/components/AdminPendingAuctionsPage";

import AdminCategoriesPage from "./admin/components/AdminCategoriesPage";

import AdminUsersPage from "./admin/components/AdminUsersPage";

import ActiveUsersAllMonthsPage from "./admin/components/ActiveUsersAllMonthsPage";

// 👇 ΝΕΟ: σελίδα με λεπτομέρειες χρήστη (Admin)
import AdminUserDetailsPage from "./admin/components/AdminUserDetailsPage";

type AppPage =
  | "auctions"
  | "auctionDetails"
  | "signup"
  | "signin"
  | "myProfile"
  | "createAuction"
  | "myPendingAuctions"
  | "myWins"
  | "myActiveBids"
  | "myReferralCodeUsage"
  | "createReferralCode"
  | "users"
  | "pendingAuctions"
  | "endingAuctions"
  | "categories"
  | "referralCodes"
  | "inspectActiveUsers"
  | "adminUserDetails"; // 👈 ΝΕΟ

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const App: React.FC = () => {
  const [page, setPage] = useState<AppPage>("auctions"); // 👉 πρώτη σελίδα: auctions
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);

  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(
    null
  );

  // 👇 ΝΕΟ: ποιον χρήστη θέλει να δει ο admin
  const [selectedAdminUsername, setSelectedAdminUsername] = useState<string | null>(null);

  // bootstrap auth από stored refresh token
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const session = await initSessionFromStoredRefreshToken();

        if (session) {
          try {
            const auth = await callBackendLogin();
            setAuthUser(auth);
            setAuthStatus("authenticated");
            // ΔΕΝ σε πετάω σε "home", μένουμε στην auctions
            setPage("auctions");
          } catch (e) {
            console.error("Backend login failed on boot", e);
            logout();
            setAuthUser(null);
            setAuthStatus("unauthenticated");
            setPage("auctions");
          }
        } else {
          setAuthUser(null);
          setAuthStatus("unauthenticated");
          setPage("auctions");
        }
      } catch (e) {
        console.error("Error bootstrapping auth", e);
        setAuthUser(null);
        setAuthStatus("unauthenticated");
        setPage("auctions");
      }
    };

    bootstrapAuth();
  }, []);

  const handleSignedIn = (auth: AuthUserDto) => {
    setAuthUser(auth);
    setAuthStatus("authenticated");
    setPage("auctions"); // μετά το sign in / sign up γυρίζουμε στη λίστα
  };

  const handleSignOut = () => {
    logout();
    setAuthUser(null);
    setAuthStatus("unauthenticated");
    setPage("auctions");
  };

  const handleOpenDetails = (auctionId: number) => {
    setSelectedAuctionId(auctionId);
    setPage("auctionDetails");
  };

  // 🔹 ΝΕΟ: όταν Admin πατάει πάνω σε username (από AuctionsPage)
  const handleOpenUserDetailsAsAdmin = (username: string) => {
    setSelectedAdminUsername(username);
    setPage("adminUserDetails");
  };

  const isAuctioneer =
    authUser?.roleName === "Auctioneer";

  if (authStatus === "loading") {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
        <p>Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      {/* HEADER / NAVBAR */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          borderBottom: "1px solid #ddd",
          paddingBottom: "0.5rem",
        }}
      >
        {/* Αριστερά: τίτλος + κουμπί Auctions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.3rem" }}>BidNow</h1>

          <button onClick={() => setPage("auctions")}>Auctions</button>
        </div>

        {/* Δεξιά: auth info + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {authStatus === "authenticated" ? (
            <>

              {/* Users */}

              <span style={{ fontSize: "0.9rem", color: "#555" }}>
                Logged in as{" "}
                <strong>{authUser?.username}</strong>
                {authUser?.roleName && ` (${authUser.roleName})`}
              </span>

              {/* Profile */}
              <button onClick={() => setPage("myProfile")}>User Profile</button>

              <button
                onClick={() => {
                  setPage("myWins");
                }}
              >
                My Wins
              </button>

              <button
                onClick={() => {
                  setPage("myActiveBids");
                }}>
                  My Active Bids
              </button>


              {/* Auctioneers */}


              {/* Create Auction – αν θες μόνο για Auctioneers χρησιμοποίησε το isAuctioneer */}
              { isAuctioneer && (
                <>
                <button onClick={() => setPage("createAuction")}>
                  Create Auction
                </button>
                    {/* 👇 ΝΕΟ κουμπί για pending auctions */}
                <button onClick={() => { setPage("myPendingAuctions")}}>
                My Pending Auctions
                </button>
                </>
              )
              }

              {/* Referral Code Owner */}

              { authUser && authUser.isReferralCodeOwner&& (
                <button
                  onClick={() => {
                    setPage("myReferralCodeUsage");
                  }}
                >
                  My Referral Code Usage
                </button>
              )
              }


              {/* Admin */}

              { authUser && authUser.roleName == "Admin" && (
                <>
                
                <button
                  onClick={() => {
                    setPage("users");
                  }}
                >
                  Users Page 
                </button>                
                

                <button
                  onClick={() => {
                    setPage("pendingAuctions");
                  }}
                >
                  Pending Auctions
                </button>                 
                
                <button
                  onClick={() => {
                    setPage("categories");
                  }}
                >
                  Categories
                </button> 

                <button
                  onClick={() => {
                    setPage("referralCodes");
                  }}
                >
                  Referral Codes 
                </button> 



                <button
                  onClick={() => {
                    setPage("createReferralCode");
                  }}
                >
                  Create Referral Codes
                </button> 


                <button
                  onClick={() => {
                    setPage("inspectActiveUsers");
                  }}
                >
                  Inspect Active Users
                </button>

             


              </>
              )
              }


              {/* Logout */}
              <button onClick={handleSignOut}>Sign Out</button>


            </>
          ) : (
            <>
              <span style={{ fontSize: "0.9rem", color: "#555" }}>
                Guest (not signed in)
              </span>
              <button onClick={() => setPage("signin")}>Sign In</button>
              <button onClick={() => setPage("signup")}>Sign Up</button>
            </>
          )}
        </div>
      </header>

      {/* ROUTING / PAGES */}


      {/* Anonymous */}

      {page === "signup" && (
        <SignUpFlowPage onSignUpCompleted={handleSignedIn} />
      )}

      {page === "signin" && <SignInForm onSignedIn={handleSignedIn} />}

      {page === "auctions" && (
        <AuctionsPage
          onOpenDetails={handleOpenDetails}
          currentUser={authUser}
          onOpenUserDetailsAsAdmin={handleOpenUserDetailsAsAdmin}
        />
      )}

      {page === "auctionDetails" && selectedAuctionId !== null && (
        <AuctionDetailsPage
          auctionId={selectedAuctionId}
          onBack={() => setPage("auctions")}
        />
      )}

      {/* User(Bidder-Auctioneer) */}

      {page === "myProfile" && authStatus === "authenticated" && (
        <UserProfilePage
          // αν δεν έχεις ReferralCodeUsagePage σε αυτό το app, μπορεί να είναι απλό no-op
          onShowReferralCodeUsage={() => {
            alert("Referral code usage page δεν έχει υλοποιηθεί σε αυτό το app.");
          }}
        />
      )}
      
      {page === "myWins" && authStatus === "authenticated" && (
        <MyWonAuctionsPage />
      )}

      {page === "myActiveBids" && authStatus === "authenticated" && (
        <MyBidAuctionsPage onOpenDetails={handleOpenDetails}/>
      )}

      {/* Auctioneer */}

      {page === "createAuction" && authStatus === "authenticated" && authUser && authUser.roleName == "Auctioneer" && (
        <CreateAuctionFlowPage
          onCompleted={() => {
            // Επειδή τα auctions δημιουργούνται ως PENDING,
            // δεν σε πάω στο details (για να μην φας το "this is not an active auction").
            alert(
              "Το auction δημιουργήθηκε και είναι σε κατάσταση 'pending approval' από admin."
            );
            setPage("auctions");
          }}
        />
      )}

      {page === "myPendingAuctions" && authStatus === "authenticated" && authUser && authUser.roleName == "Auctioneer" && (
          <MyPendingAuctionsPage onBack={() => setPage("auctions")}/>
      )}

      {/* Referral Code Owner */}

      {page === "myReferralCodeUsage" && authStatus === "authenticated" && authUser && authUser.isReferralCodeOwner && (
        <ReferralCodeUsagePage onBack={() => setPage("auctions")}/>
      )}

      {/* Admin */}

      {/* Create Referral Code */}
      {page === "createReferralCode" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
          <CreateReferralCodePage />
      )}    

      {/* Admin pending auctions */}
      {page === "pendingAuctions" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
          <AdminPendingAuctionsPage onBack={() => setPage("auctions")} />
      )}

      {/* Admin categories */}
      {page === "categories" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
          <AdminCategoriesPage onBack={() => setPage("auctions")} />
      )}

      {/* Admin users */}
      {page === "users" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
        <AdminUsersPage />
      )}

      {/* Create referral code (Admin) */}
      {page === "createReferralCode" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
        <CreateReferralCodePage />
      )}

      {/* Admin referral codes */}
      {page === "referralCodes" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
        <AdminReferralCodesPage />
      )}

      {/* Active users stats */}
      {page === "inspectActiveUsers" && authStatus === "authenticated" && authUser && authUser.roleName == "Admin" && (
        <ActiveUsersAllMonthsPage />
      )}

      {/* 👇 ΝΕΟ: Admin user details page */}
      {page === "adminUserDetails" &&
        authStatus === "authenticated" &&
        authUser &&
        authUser.roleName === "Admin" &&
        selectedAdminUsername && (
          <AdminUserDetailsPage
            username={selectedAdminUsername}
            onBack={() => setPage("users")} // ή "auctions", όπως προτιμάς
          />
      )}

      {/* Προστασία αν κάποιος πάει σε σελίδες χωρίς auth */}
      {authStatus === "unauthenticated" &&
        (page === "myProfile" ||
          page === "createAuction" ||
          page === "myPendingAuctions" ||
          page === "myActiveBids" ||
          page === "myWins" ||
          page === "pendingAuctions" ||
          page === "categories" ||
          page === "users" ||
          page === "createReferralCode" ||
          page === "referralCodes" ||
          page === "inspectActiveUsers" ||
          page === "myReferralCodeUsage" ||
          page === "adminUserDetails") && (
          <p>Πρέπει να συνδεθείς για να δεις αυτή τη σελίδα.</p>
        )}


    </div>
  );
};

export default App;
