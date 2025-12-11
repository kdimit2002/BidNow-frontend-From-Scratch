import React, { useEffect, useState } from "react";
import { getAdminUserByUsername } from "../../api/admin/Users";
import type { AdminUserEntityDto } from "../models/AdminResponseUser";

interface AdminUserDetailsPageProps {
  username: string;
  onBack: () => void;
}

const AdminUserDetailsPage: React.FC<AdminUserDetailsPageProps> = ({
  username,
  onBack,
}) => {
  const [user, setUser] = useState<AdminUserEntityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminUserByUsername(username);
        if (!cancelled) {
          setUser(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error(err);
          let message = "Αποτυχία φόρτωσης στοιχείων χρήστη.";
          if (err instanceof Error) message = err.message;
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return (
    <div style={{ padding: "1rem" }}>
      <button type="button" onClick={onBack} style={{ marginBottom: "1rem" }}>
        ← Πίσω στη λίστα χρηστών
      </button>

      <h2>Admin – User details</h2>

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && !user && <p>Δεν βρέθηκε χρήστης.</p>}

      {user && (
        <div
          style={{
            marginTop: "12px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <div>
            <img
              src={user.avatarUrl}
              alt={user.username}
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ marginTop: 0 }}>{user.username}</h3>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p>
              <strong>Firebase ID:</strong> {user.firebaseId}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phoneNumber}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>

            <p>
              <strong>Reward Points (current):</strong> {user.rewardPoints}
            </p>
            <p>
              <strong>All Time Reward Points:</strong>{" "}
              {user.allTimeRewardPoints ?? 0}
            </p>

            <p>
              <strong>Banned:</strong> {user.isBanned ? "Yes" : "No"}
            </p>
            <p>
              <strong>Anonymized:</strong>{" "}
              {user.isAnonymized ? "Yes" : "No"}
            </p>
            <p>
              <strong>Eligible for chat:</strong>{" "}
              {user.eligibleForChat ? "Yes" : "No"}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {user.locationDto
                ? `${user.locationDto.country} (${user.locationDto.region})`
                : "-"}
            </p>

            <hr style={{ margin: "12px 0" }} />

            <p>
              <strong>Referral code owner:</strong>{" "}
              {user.isReferralCodeOwner ? "Yes" : "No"}
            </p>
            {user.isReferralCodeOwner && (
              <p>
                <strong>Referral code name:</strong>{" "}
                {user.referralCodeName ?? "-"}
              </p>
            )}

            <p>
              <strong>Has used referral code:</strong>{" "}
              {user.hasUsedReferralCode ? "Yes" : "No"}
            </p>
            {user.hasUsedReferralCode && (
              <p>
                <strong>Referral code used:</strong>{" "}
                {user.referralCodeUsed ?? "-"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailsPage;
