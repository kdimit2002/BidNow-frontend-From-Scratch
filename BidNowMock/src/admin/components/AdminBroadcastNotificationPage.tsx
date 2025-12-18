// src/admin/components/AdminBroadcastNotificationPage.tsx

import React, { useState } from "react";
import { broadcastAdminNotification } from "../../api/admin/backendAdminNotificationService";
import type { AdminBroadcastNotificationRequest } from "../models/AdminNotificationRequest";

const AdminBroadcastNotificationPage: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [metadataJson, setMetadataJson] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [announcementId, setAnnouncementId] = useState<number | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setAnnouncementId(null);

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setError("Το title είναι υποχρεωτικό.");
      return;
    }
    if (!trimmedBody) {
      setError("Το body είναι υποχρεωτικό.");
      return;
    }

    setLoading(true);
    try {
      const payload: AdminBroadcastNotificationRequest = {
        title: trimmedTitle,
        body: trimmedBody,
        metadataJson: metadataJson.trim(),
      };

      const res = await broadcastAdminNotification(payload);

      setSuccess("Το announcement στάλθηκε επιτυχώς.");
      setAnnouncementId(res.announcementId);
    } catch (err) {
      console.error(err);
      let message = "Κάτι πήγε στραβά κατά το broadcast.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setBody("");
    setMetadataJson("");
    setError(null);
    setSuccess(null);
    setAnnouncementId(null);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1rem" }}>
      <h1>Admin – Broadcast Notification</h1>
      <p style={{ color: "#555", marginBottom: "1rem" }}>
        Δημιούργησε ένα <strong>GENERAL</strong> announcement που θα εμφανιστεί
        σε όλα τα users ως notification τύπου <code>GENERAL</code>.
      </p>

      {error && (
        <p style={{ color: "red", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Σφάλμα: {error}
        </p>
      )}
      {success && (
        <p
          style={{
            color: "green",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          {success}
          {announcementId !== null && (
            <>
              {" "}
              (ID: <code>{announcementId}</code>)
            </>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
            placeholder="Π.χ. New feature: Live chat for auctions"
            maxLength={200}
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
            Body *
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ width: "100%", minHeight: 120, padding: "0.4rem" }}
            placeholder="Κείμενο της ανακοίνωσης που θα δουν οι χρήστες..."
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
            Metadata JSON (προαιρετικό)
          </label>
          <textarea
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            style={{ width: "100%", minHeight: 80, padding: "0.4rem" }}
            placeholder='Π.χ. {"deepLink":"/auctions/123","priority":"HIGH"}'
          />
          <p style={{ fontSize: "0.8rem", color: "#666", marginTop: 4 }}>
            Το πεδίο αυτό περνάει όπως είναι στο <code>metadataJson</code> του
            backend. Αν δεν το χρειάζεσαι, άφησέ το κενό.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Αποστολή..." : "Αποστολή broadcast"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            style={{ backgroundColor: "#eee" }}
          >
            Καθαρισμός
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBroadcastNotificationPage;
