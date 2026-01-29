// src/components/SignUpFlowPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpStep1 from "./SignUpStep1";
import SignUpStep2 from "./SignUpStep2";
import type { Country, Region, AuthUserDto } from "../models/Springboot/UserEntity";

interface SignUpFlowPageProps {
  onSignUpCompleted: (auth: AuthUserDto) => void;
}

const SignUpFlowPage: React.FC<SignUpFlowPageProps> = ({ onSignUpCompleted }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [region, setRegion] = useState<Region | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const handleStep1Completed = (data: {
    region: Region;
    country: Country;
    firebaseUserId: string;
    displayName: string;
  }) => {
    setRegion(data.region);
    setCountry(data.country);
    setFirebaseUserId(data.firebaseUserId);
    setDisplayName(data.displayName);
    setStep(2);
  };

  const handleBackFromStep2 = () => {
    // Πίσω στο Step 1 (καθαρίζουμε τα step2 prerequisites)
    setStep(1);
    setRegion(null);
    setCountry(null);
    setFirebaseUserId(null);
    setDisplayName(null);
  };

  const handleFlowCompleted = (authUser: AuthUserDto) => {
    // 1) ενημέρωσε app state
    onSignUpCompleted(authUser);

    // 2) redirect στο main page (AuctionsPage)
    navigate("/", { replace: true });
  };

  return (
    <>
      {step === 1 && <SignUpStep1 onCompleted={handleStep1Completed} />}

      {step === 2 && region && country && firebaseUserId && displayName && (
        <SignUpStep2
          region={region}
          country={country}
          firebaseUserId={firebaseUserId}
          displayName={displayName}
          onCompleted={handleFlowCompleted}
          onBack={handleBackFromStep2}
        />
      )}
    </>
  );
};

export default SignUpFlowPage;
