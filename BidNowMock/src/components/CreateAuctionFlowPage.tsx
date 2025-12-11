// src/components/CreateAuctionFlowPage.tsx

import React, { useState } from "react";
import type { AuctionDetails } from "../models/Springboot/Auction";
import CreateAuctionStep1 from "./CreateAuctionStep1";
import CreateAuctionStep2 from "./CreateAuctionStep2";

interface CreateAuctionFlowPageProps {
  onCompleted?: (auctionId: number) => void;
  onBack?: () => void;
}

const CreateAuctionFlowPage: React.FC<CreateAuctionFlowPageProps> = ({
  onCompleted, onBack
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [createdAuction, setCreatedAuction] = useState<AuctionDetails | null>(
    null
  );

  const handleStep1Completed = (data: {
    auctionId: number;
    createdAuction: AuctionDetails;
  }) => {
    setCreatedAuction(data.createdAuction);
    setStep(2);
  };

  const handleFlowCompleted = () => {
    if (createdAuction) {
      onCompleted?.(createdAuction.id);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1rem" }}>
       {onBack && (
      <div style={{ marginBottom: "1rem" }}>
        <button type="button" onClick={onBack}>
          ← Back to all auctions
        </button>
      </div>
    )}
      <h1>Create Auction</h1>

      {step === 1 && <CreateAuctionStep1 onCompleted={handleStep1Completed} />}

      {step === 2 && createdAuction && (
        <CreateAuctionStep2
          auctionId={createdAuction.id}
          onCompleted={handleFlowCompleted}
        />
      )}
    </div>
  );
};

export default CreateAuctionFlowPage;
