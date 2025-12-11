// // src/components/SignOutButton.tsx
// import React from "react";
// import { signOutFirebase } from "../api/Springboot/backendClient";

// interface SignOutButtonProps {
//   onSignedOut?: () => void;
// }

// const SignOutButton: React.FC<SignOutButtonProps> = ({ onSignedOut }) => {
//   const handleSignOut = () => {
//     signOutFirebase(); // 🔑 καθαρίζουμε το token

//     if (onSignedOut) {
//       onSignedOut();
//     }
//   };

//   return (
//     <button type="button" onClick={handleSignOut}>
//       Sign Out
//     </button>
//   );
// };

// export default SignOutButton;

// src/components/SignOutButton.tsx
import React from "react";
import { logout } from "../api/Springboot/backendUserService";

interface SignOutButtonProps {
  onSignedOut?: () => void;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ onSignedOut }) => {
  const handleSignOut = () => {
    logout(); // καθαρίζουμε token + userId

    if (onSignedOut) {
      onSignedOut();
    }
  };

  return (
    <button type="button" onClick={handleSignOut}>
      Sign Out
    </button>
  );
};

export default SignOutButton;
