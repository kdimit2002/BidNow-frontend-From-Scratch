// // export default CreateAuctionFlowPage;
// import React, { useState } from "react";
// import type { AuctionDetails } from "../models/Springboot/Auction";
// import CreateAuctionStep1 from "./CreateAuctionStep1";
// import CreateAuctionStep2 from "./CreateAuctionStep2";

// interface CreateAuctionFlowPageProps {
//   onCompleted?: (auctionId: number) => void;
//   onBack?: () => void; // ✅ αυτό θα σε πάει στο AuctionsPage
// }

// const CreateAuctionFlowPage: React.FC<CreateAuctionFlowPageProps> = ({ onCompleted, onBack }) => {
//   const [step, setStep] = useState<1 | 2>(1);
//   const [createdAuction, setCreatedAuction] = useState<AuctionDetails | null>(null);

//   const handleStep1Completed = (data: { auctionId: number; createdAuction: AuctionDetails }) => {
//     setCreatedAuction(data.createdAuction);
//     setStep(2);
//   };

//   // ✅ Αυτό θα κληθεί ΜΟΛΙΣ ολοκληρωθεί επιτυχώς το Step2
//   const handleFlowCompleted = () => {
//     // ✅ προτεραιότητα: ενημερώνουμε τον parent (App) για να κάνει redirect + μήνυμα
//     if (createdAuction) {
//       onCompleted?.(createdAuction.id);
//       return;
//     }

//     // fallback
//     if (onBack) {
//       onBack();
//     }
//   };

//   return (
//     <div style={{ width: "100%" }}>
//       {onBack && (
//         <button
//           type="button"
//           onClick={onBack}
//           style={{
//             height: 40,
//             padding: "0 14px",
//             borderRadius: 12,
//             border: "1px solid rgba(17, 24, 39, 0.12)",
//             background: "#FFFFFF",
//             fontWeight: 900,
//             cursor: "pointer",
//             margin: "12px 0 0 12px",
//           }}
//         >
//           ← Back to all auctions
//         </button>
//       )}

//       {step === 1 && <CreateAuctionStep1 onCompleted={handleStep1Completed} />}

//       {step === 2 && createdAuction && (
//         <CreateAuctionStep2 auctionId={createdAuction.id} onCompleted={handleFlowCompleted} />
//       )}
//     </div>
//   );
// };

// export default CreateAuctionFlowPage;
// src/components/CreateAuctionFlowPage.tsx
// src/components/CreateAuctionFlowPage.tsx
// // src/components/CreateAuctionFlowPage.tsx

// import React, { useState } from "react";
// import type { AuctionDetails } from "../models/Springboot/Auction";
// import CreateAuctionStep1, { type AuctionDraft } from "./CreateAuctionStep1";
// import CreateAuctionStep2 from "./CreateAuctionStep2";

// interface CreateAuctionFlowPageProps {
//   onCompleted?: (auctionId: number) => void;
//   onBack?: () => void;
// }

// const CreateAuctionFlowPage: React.FC<CreateAuctionFlowPageProps> = ({ onCompleted, onBack }) => {
//   const [step, setStep] = useState<1 | 2>(1);
//   const [createdAuction, setCreatedAuction] = useState<AuctionDetails | null>(null);

//   const [draft, setDraft] = useState<AuctionDraft>({
//     categoryId: "",
//     title: "PS4",
//     shortDescription: "Playstation 4 with game",
//     description: "Playstation 4 in good condition with FC26",
//     startingAmount: "50",
//     minBidIncrement: "1",
//     shippingCostPayer: "BUYER",
//     endDate: "",
//   });

//   const patchDraft = (patch: Partial<AuctionDraft>) => {
//     setDraft((prev) => ({ ...prev, ...patch }));
//   };

//   const handleStep1Completed = (data: { auctionId: number; createdAuction: AuctionDetails }) => {
//     setCreatedAuction(data.createdAuction);
//     setStep(2);
//   };

//   const handleFlowCompleted = () => {
//     if (createdAuction) {
//       onCompleted?.(createdAuction.id);
//       return;
//     }
//     onBack?.();
//   };

//   // ✅ όταν γυρνάμε πίσω (μετά από delete στο Step2), καθάρισε το createdAuction
//   const handleBackToStep1 = () => {
//     setCreatedAuction(null);
//     setStep(1);
//   };

//   return (
//     <div style={{ width: "100%" }}>
//       {step === 1 && (
//         <CreateAuctionStep1
//           draft={draft}
//           onDraftChange={patchDraft}
//           onCompleted={handleStep1Completed}
//         />
//       )}

//       {step === 2 && createdAuction && (
//         <CreateAuctionStep2
//           auctionId={createdAuction.id}
//           onBack={handleBackToStep1}
//           onCompleted={handleFlowCompleted}
//         />
//       )}
//     </div>
//   );
// };

// export default CreateAuctionFlowPage;

// src/components/CreateAuctionFlowPage.tsx

import React, { useState } from "react";
import type { AuctionDetails } from "../models/Springboot/Auction";
import CreateAuctionStep1, { type AuctionDraft } from "./CreateAuctionStep1";
import CreateAuctionStep2 from "./CreateAuctionStep2";

interface CreateAuctionFlowPageProps {
  onCompleted?: (auctionId: number) => void;
  onBack?: () => void;
}

const CreateAuctionFlowPage: React.FC<CreateAuctionFlowPageProps> = ({ onCompleted, onBack }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [createdAuction, setCreatedAuction] = useState<AuctionDetails | null>(null);

  const [draft, setDraft] = useState<AuctionDraft>({
    categoryId: "",
    title: "",
    shortDescription: "",
    description: "",
    startingAmount: "",
    minBidIncrement: "",
    shippingCostPayer: "BUYER",
    endDate: "",
  });

  const patchDraft = (patch: Partial<AuctionDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleStep1Completed = (data: { auctionId: number; createdAuction: AuctionDetails }) => {
    setCreatedAuction(data.createdAuction);
    setStep(2);
  };

  const handleFlowCompleted = () => {
    if (createdAuction) {
      onCompleted?.(createdAuction.id);
      return;
    }
    onBack?.();
  };

  // ✅ όταν γυρνάμε πίσω (μετά από delete στο Step2), καθάρισε το createdAuction
  const handleBackToStep1 = () => {
    setCreatedAuction(null);
    setStep(1);
  };

  return (
    <div style={{ width: "100%" }}>
      {step === 1 && (
        <CreateAuctionStep1
          draft={draft}
          onDraftChange={patchDraft}
          onCompleted={handleStep1Completed}
          onBack={onBack} // ✅ NEW
        />
      )}


      {step === 2 && createdAuction && (
        <CreateAuctionStep2
          auctionId={createdAuction.id}
          onBack={handleBackToStep1}
          onCompleted={handleFlowCompleted}
        />
      )}
    </div>
  );
};

export default CreateAuctionFlowPage;
