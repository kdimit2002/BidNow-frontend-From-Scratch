// src/admin/components/CreateReferralCodePage.tsx

import React, { useState } from "react";
import { createReferralCodeApi } from "../../api/Springboot/ReferralCodeService";
import type {
  ReferralCodeRequest,
  ReferralCodeResponse,
} from "../../models/Springboot/ReferralCode";

const CreateReferralCodePage: React.FC = () => {
  const [code, setCode] = useState("KEN123");
  const [creatorId, setCreatorId] = useState<number>(1);
  const [rewardPoints, setRewardPoints] = useState<number>(100);
  const [creatorRewardPoints, setCreatorRewardPoints] = useState<number>(50);
  const [maxUses, setMaxUses] = useState<number>(10);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [response, setResponse] = useState<ReferralCodeResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResponse(null);
    setLoading(true);

    try {
      const body: ReferralCodeRequest = {
        code: code.trim(),
        ownerId: Number(creatorId),
        rewardPoints: Number(rewardPoints),
        ownerRewardPoints: Number(creatorRewardPoints),
        maxUses: Number(maxUses),
        isDisabled,
      };

      if (!body.code) {
        throw new Error("Το code είναι υποχρεωτικό.");
      }
      if (body.ownerId <= 0) {
        throw new Error("OwnerId πρέπει να είναι > 0.");
      }
      if (body.rewardPoints < 0 || body.ownerRewardPoints < 0) {
        throw new Error("Reward points πρέπει να είναι >= 0.");
      }
      if (body.maxUses < 0) {
        throw new Error("Max uses πρέπει να είναι >= 0.");
      }

      const res = await createReferralCodeApi(body);

      setResponse(res);
      setSuccess(`Ο referral code δημιουργήθηκε: ${res.name}`);
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Create Referral Code (test page)</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "0.5rem", maxWidth: 400 }}
      >
        <label>
          Code:
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>

        <label>
          Creator ID:
          <input
            type="number"
            value={creatorId}
            onChange={(e) => setCreatorId(Number(e.target.value))}
            min={1}
            required
          />
        </label>

        <label>
          Reward Points (user):
          <input
            type="number"
            value={rewardPoints}
            onChange={(e) => setRewardPoints(Number(e.target.value))}
            min={0}
            required
          />
        </label>

        <label>
          Creator Reward Points:
          <input
            type="number"
            value={creatorRewardPoints}
            onChange={(e) =>
              setCreatorRewardPoints(Number(e.target.value))
            }
            min={0}
            required
          />
        </label>

        <label>
          Max Uses:
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            min={0}
            required
          />
        </label>

        <label>
          Disabled:
          <input
            type="checkbox"
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Δημιουργία..." : "Create Referral Code"}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Backend Response</h4>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CreateReferralCodePage;
