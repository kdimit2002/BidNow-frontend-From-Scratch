// src/admin/components/AdminBroadcastNotificationPage.tsx

import React, { useMemo, useState } from "react";
import { broadcastAdminNotification } from "../../api/admin/backendAdminNotificationService";
import type { AdminBroadcastNotificationRequest } from "../models/AdminNotificationRequest";

type MessageType = "success" | "error" | null;

const AdminBroadcastNotificationPage: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [metadataJson, setMetadataJson] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  // unified toast
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [announcementId, setAnnouncementId] = useState<number | null>(null);

  const showMessage = (type: MessageType, msg: string) => {
    setMessageType(type);
    setMessage(msg);
    window.setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3500);
  };

  const trimmedTitle = useMemo(() => title.trim(), [title]);
  const trimmedBody = useMemo(() => body.trim(), [body]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setAnnouncementId(null);

    if (!trimmedTitle) {
      showMessage("error", "Το title είναι υποχρεωτικό.");
      return;
    }
    if (!trimmedBody) {
      showMessage("error", "Το body είναι υποχρεωτικό.");
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

      setAnnouncementId(res.announcementId);
      showMessage("success", "Το announcement στάλθηκε επιτυχώς.");
    } catch (err) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά κατά το broadcast.";
      if (err instanceof Error && err.message) msg = err.message;
      showMessage("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setBody("");
    setMetadataJson("");
    setAnnouncementId(null);
    setMessage(null);
    setMessageType(null);
  };

  return (
    <div style={styles.page}>
      {/* Toast */}
      {message && (
        <div
          style={{
            ...styles.toast,
            ...(messageType === "error" ? styles.toastError : styles.toastSuccess),
          }}
          role="status"
          aria-live="polite"
        >
          {message}
          {messageType === "success" && announcementId !== null && (
            <span style={{ fontWeight: 900 }}>
              {" "}
              • ID: <span style={styles.mono}>{announcementId}</span>
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={styles.title}>Broadcast Notification</h1>
            <span style={styles.badge}>GENERAL</span>
          </div>
          <p style={styles.subtitle}>
            Δημιούργησε ένα announcement που θα εμφανιστεί σε όλους τους users ως notification τύπου{" "}
            <span style={styles.mono}>GENERAL</span>.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {/* Form card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>Σύνθεση ανακοίνωσης</div>
              <div style={styles.cardHint}>
                Συμπλήρωσε title & body. Προαιρετικά πρόσθεσε metadataJson για deep links / priority.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formCol}>
              <div>
                <label style={styles.label}>
                  Title <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                  placeholder="Π.χ. New feature: Live chat for auctions"
                  maxLength={200}
                  disabled={loading}
                />
                <div style={styles.helperRow}>
                  <span style={styles.helperText}>Max 200 χαρακτήρες</span>
                  <span style={styles.helperText}>
                    {title.length}/200
                  </span>
                </div>
              </div>

              <div>
                <label style={styles.label}>
                  Body <span style={styles.req}>*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  style={{ ...styles.textarea, minHeight: 140 }}
                  placeholder="Κείμενο της ανακοίνωσης που θα δουν οι χρήστες..."
                  disabled={loading}
                />
              </div>

              <div>
                <label style={styles.label}>Metadata JSON (προαιρετικό)</label>
                <textarea
                  value={metadataJson}
                  onChange={(e) => setMetadataJson(e.target.value)}
                  style={{ ...styles.textarea, minHeight: 96, fontFamily: styles.mono.fontFamily as string }}
                  placeholder='Π.χ. {"deepLink":"/auctions/123","priority":"HIGH"}'
                  disabled={loading}
                />
                <div style={styles.note}>
                  Περνάει αυτούσιο στο <span style={styles.mono}>metadataJson</span> του backend. Αν δεν το χρειάζεσαι,
                  άφησέ το κενό.
                </div>
              </div>

              <div style={styles.actions}>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  {loading ? "Αποστολή..." : "Αποστολή broadcast"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  style={styles.secondaryBtn}
                >
                  Καθαρισμός
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Preview card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>Preview</div>
              <div style={styles.cardHint}>Έτσι περίπου θα φαίνεται στο UI του χρήστη.</div>
            </div>
          </div>

          <div style={styles.previewShell}>
            <div style={styles.previewTopRow}>
              <span style={styles.previewDot} />
              <div style={{ flex: 1 }}>
                <div style={styles.previewTitle}>{trimmedTitle || "Τίτλος ανακοίνωσης"}</div>
                <div style={styles.previewSub}>
                  Τύπος: <span style={styles.mono}>GENERAL</span>
                </div>
              </div>
            </div>

            <div style={styles.previewBody}>
              {trimmedBody || "Το κείμενο της ανακοίνωσης θα εμφανιστεί εδώ…"}
            </div>

            <div style={styles.previewMeta}>
              <div style={styles.previewMetaTitle}>metadataJson</div>
              <div style={styles.previewMetaBox}>
                {metadataJson.trim() ? (
                  <span style={styles.mono}>{metadataJson.trim()}</span>
                ) : (
                  <span style={{ color: "#94a3b8" }}>— κενό —</span>
                )}
              </div>
            </div>

            {announcementId !== null && (
              <div style={styles.previewFooter}>
                Sent • ID: <span style={styles.mono}>{announcementId}</span>
              </div>
            )}
          </div>

          <div style={styles.helperNote}>
            Tip: Κράτα το title σύντομο (1 γραμμή) και βάλε λεπτομέρειες στο body.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcastNotificationPage;

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "20px 16px 28px",
    background: "#f6f7fb",
    minHeight: "100vh",
    position: "relative",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },

  title: {
    margin: 0,
    fontSize: 24,
    letterSpacing: -0.2,
    color: "#0f172a",
  },

  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.5,
    maxWidth: 760,
  },

  badge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.85fr",
    gap: 16,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    padding: 16,
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 4,
  },

  cardHint: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.4,
  },

  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
    marginBottom: 6,
  },

  req: {
    color: "#ef4444",
    fontWeight: 900,
  },

  input: {
    height: 40,
    width: "100%",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#ffffff",
  },

  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#ffffff",
    resize: "vertical",
    lineHeight: 1.5,
  },

  helperRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 6,
  },

  helperText: {
    fontSize: 12,
    color: "#64748b",
  },

  note: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 6,
  },

  primaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
    flex: 1,
  },

  secondaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  // preview
  previewShell: {
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#fbfdff",
    padding: 14,
  },

  previewTopRow: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 10,
  },

  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#0f172a",
    marginTop: 6,
    flexShrink: 0,
  },

  previewTitle: {
    fontWeight: 900,
    color: "#0f172a",
    fontSize: 14,
    lineHeight: 1.25,
  },

  previewSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },

  previewBody: {
    fontSize: 13,
    color: "#0f172a",
    lineHeight: 1.55,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
  },

  previewMeta: {
    marginTop: 12,
  },

  previewMetaTitle: {
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
    marginBottom: 6,
  },

  previewMetaBox: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  previewFooter: {
    marginTop: 12,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 800,
  },

  helperNote: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
    padding: "10px 4px 0",
  },

  // toast
  toast: {
    position: "fixed",
    top: 16,
    right: 16,
    maxWidth: 520,
    zIndex: 9999,
    padding: "10px 12px",
    borderRadius: 14,
    fontWeight: 900,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.15)",
    border: "1px solid transparent",
  },

  toastSuccess: {
    background: "#ecfdf5",
    borderColor: "#a7f3d0",
    color: "#065f46",
  },

  toastError: {
    background: "#fff1f2",
    borderColor: "#fecdd3",
    color: "#9f1239",
  },

  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};
