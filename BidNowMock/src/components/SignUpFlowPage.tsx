// // src/pages/SignUpFlowPage.tsx
// import React, { useState } from "react";
// import SignUpStep1 from "./SignUpStep1";
// import SignUpStep2 from "./SignUpStep2";
// import type { Country, Region } from "../models/Springboot/UserEntity";

// const SignUpFlowPage: React.FC = () => {
//   const [step, setStep] = useState<1 | 2>(1);

//   const [region, setRegion] = useState<Region | null>(null);
//   const [country, setCountry] = useState<Country | null>(null);
//   const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);
//   const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);

//   const handleStep1Completed = (data: {
//     region: Region;
//     country: Country;
//     firebaseUserId: string;
//     firebaseIdToken: string;
//   }) => {
//     setRegion(data.region);
//     setCountry(data.country);
//     setFirebaseUserId(data.firebaseUserId);
//     setFirebaseIdToken(data.firebaseIdToken);
//     setStep(2);
//   };

//   const handleFlowCompleted = () => {
//     // εδώ μπορείς π.χ. να κάνεις redirect στο home ή dashboard
//     console.log("Full sign up flow completed");
//   };

//   return (
//     <div style={{ maxWidth: 480, margin: "0 auto", padding: "1rem" }}>
//       <h1>Sign Up</h1>

//       {step === 1 && (
//         <SignUpStep1 onCompleted={handleStep1Completed} />
//       )}

//       {step === 2 && region && country && firebaseUserId && firebaseIdToken && (
//         <SignUpStep2
//           region={region}
//           country={country}
//           firebaseUserId={firebaseUserId}
//           onCompleted={handleFlowCompleted}
//         />
//       )}
//     </div>
//   );
// };

// export default SignUpFlowPage;

// src/pages/SignUpFlowPage.tsx
// import React, { useState } from "react";
// import SignUpStep1 from "./SignUpStep1";
// import SignUpStep2 from "./SignUpStep2";
// import type { Country, Region } from "../models/Springboot/UserEntity";

// const SignUpFlowPage: React.FC = () => {
//   const [step, setStep] = useState<1 | 2>(1);

//   const [region, setRegion] = useState<Region | null>(null);
//   const [country, setCountry] = useState<Country | null>(null);
//   const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);

//   const handleStep1Completed = (data: {
//     region: Region;
//     country: Country;
//     firebaseUserId: string;
//   }) => {
//     setRegion(data.region);
//     setCountry(data.country);
//     setFirebaseUserId(data.firebaseUserId);
//     setStep(2);
//   };

//   const handleFlowCompleted = () => {
//     // εδώ μπορείς π.χ. να κάνεις redirect στο home ή dashboard
//     console.log("Full sign up flow completed");
//   };

//   return (
//     <div style={{ maxWidth: 480, margin: "0 auto", padding: "1rem" }}>
//       <h1>Sign Up</h1>

//       {step === 1 && (
//         <SignUpStep1 onCompleted={handleStep1Completed} />
//       )}

//       {step === 2 && region && country && firebaseUserId && (
//         <SignUpStep2
//           region={region}
//           country={country}
//           firebaseUserId={firebaseUserId}
//           onCompleted={handleFlowCompleted}
//         />
//       )}
//     </div>
//   );
// };

// export default SignUpFlowPage;


// src/pages/SignUpFlowPage.tsx
import React, { useState } from "react";
import SignUpStep1 from "./SignUpStep1";
import SignUpStep2 from "./SignUpStep2";
import type { Country, Region } from "../models/Springboot/UserEntity";
import type { AuthUserDto } from "../models/Springboot/UserEntity";

interface SignUpFlowPageProps {
  onSignUpCompleted: (auth: AuthUserDto) => void;
}

const SignUpFlowPage: React.FC<SignUpFlowPageProps> = ({
  onSignUpCompleted,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  const [region, setRegion] = useState<Region | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);

  const handleStep1Completed = (data: {
    region: Region;
    country: Country;
    firebaseUserId: string;
  }) => {
    setRegion(data.region);
    setCountry(data.country);
    setFirebaseUserId(data.firebaseUserId);
    setStep(2);
  };

  const handleFlowCompleted = (authUser: AuthUserDto) => {
    console.log("Full sign up flow completed", authUser);
    onSignUpCompleted(authUser);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1rem" }}>
      <h1>Sign Up</h1>

      {step === 1 && <SignUpStep1 onCompleted={handleStep1Completed} />}

      {step === 2 && region && country && firebaseUserId && (
        <SignUpStep2
          region={region}
          country={country}
          firebaseUserId={firebaseUserId}
          onCompleted={handleFlowCompleted}
        />
      )}
    </div>
  );
};

export default SignUpFlowPage;
