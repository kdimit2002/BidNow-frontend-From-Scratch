import React, { useState } from "react";
import {
  sendAdminToUserNotification,
  type AdminToUserNotificationDto,
} from "../../api/admin/adminNotificationApi";

export default function AdminSendNotificationPage() {
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [metadataJson, setMetadataJson] = useState<string>(""); // ✅ επιτρέπεται κενό

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessId(null);

    const uid = Number(userId);
    if (!Number.isFinite(uid) || uid <= 0) {
      setError("Βάλε έγκυρο userId (αριθμός > 0).");
      return;
    }
    if (title.trim().length === 0) {
      setError("Το title είναι υποχρεωτικό.");
      return;
    }
    if (body.trim().length === 0) {
      setError("Το body είναι υποχρεωτικό.");
      return;
    }

    // ✅ metadataJson: το αφήνουμε όπως είναι (μπορεί να είναι "")
    // Αν θες validation JSON, πες μου και το προσθέτω ως optional toggle.

    const payload: AdminToUserNotificationDto = {
      userId: uid,
      title: title.trim(),
      body: body.trim(),
      metadataJson, // μπορεί να είναι "" (κενό)
    };

    setLoading(true);
    try {
      const res = await sendAdminToUserNotification(payload);
      setSuccessId(res.notificationId);
    } catch (err: any) {
      setError(err?.message ?? "Κάτι πήγε λάθος.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h2>Send Notification (Admin)</h2>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Endpoint: <code>/api/admin/notifications/send</code>
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>User ID</span>
          <input
            type="number"
            inputMode="numeric"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="π.χ. 123"
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Τίτλος notification"
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Body</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Κείμενο notification"
            rows={5}
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>metadataJson (optional, μπορεί να είναι κενό)</span>
          <textarea
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            placeholder='π.χ. {"auctionId": 55, "bidId": 123}'
            rows={6}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Notification"}
        </button>

        {error && (
          <div
            style={{
              background: "rgba(255,0,0,0.08)",
              border: "1px solid rgba(255,0,0,0.25)",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <b>Σφάλμα:</b> {error}
          </div>
        )}

        {successId !== null && (
          <div
            style={{
              background: "rgba(0,128,0,0.08)",
              border: "1px solid rgba(0,128,0,0.25)",
              padding: 12,
              borderRadius: 8,
            }}
          >
            ✅ Στάλθηκε! <b>notificationId:</b> {successId}
          </div>
        )}
      </form>
    </div>
  );
}
