// src/components/NotificationsPage.tsx

import React, { useEffect, useState } from "react";
import { getMyNotifications } from "../api/Springboot/backendNotificationService";
import type {
  NotificationDto,
  NotificationPage,
} from "../models/Springboot/Notification";

interface NotificationsPageProps {
  pageSize?: number;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({
  pageSize = 20,
}) => {
  const [pageData, setPageData] = useState<NotificationPage | null>(null);
  const [page, setPage] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async (pageOverride?: number) => {
    const targetPage = typeof pageOverride === "number" ? pageOverride : page;

    setLoading(true);
    setError(null);

    try {
      const data = await getMyNotifications(targetPage, pageSize);
      setPageData(data);
      setPage(targetPage);
    } catch (err) {
      console.error(err);
      let message = "Κάτι πήγε στραβά κατά τη φόρτωση των ειδοποιήσεων.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const handlePrevPage = () => {
    if (!pageData || pageData.first) return;
    void loadNotifications(page - 1);
  };

  const handleNextPage = () => {
    if (!pageData || pageData.last) return;
    void loadNotifications(page + 1);
  };

  const formatDateTime = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const humanizeType = (type: NotificationDto["notificationType"]): string => {
    if (type === "GENERAL") return "Announcement";
    return type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      <h1>Notifications</h1>

      {loading && <p>Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}

      {pageData && (
        <>
          <p style={{ marginBottom: "0.5rem" }}>
            Σελίδα {pageData.number + 1} από {pageData.totalPages} — Σύνολο{" "}
            {pageData.totalElements} ειδοποιήσεις
          </p>

          {pageData.content.length === 0 ? (
            <p>Δεν υπάρχουν ειδοποιήσεις.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {pageData.content.map((n) => {
                const isAnnouncement = n.notificationType === "GENERAL";
                const isUnread = !n.read && !isAnnouncement;

                const containerStyle: React.CSSProperties = {
                  borderRadius: 8,
                  padding: "0.75rem 1rem",
                  marginBottom: "0.5rem",
                  border: "1px solid #ddd",
                  backgroundColor: isAnnouncement
                    ? "#eef4ff"
                    : isUnread
                    ? "#fdf7e3"
                    : "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                };

                const titleStyle: React.CSSProperties = {
                  fontWeight:
                    isAnnouncement || isUnread ? ("bold" as const) : ("normal" as const),
                  margin: 0,
                  marginBottom: "0.25rem",
                };

                return (
                  <li key={n.id} style={containerStyle}>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            color: isAnnouncement ? "#1d4ed8" : "#555",
                          }}
                        >
                          {humanizeType(n.notificationType)}
                        </span>

                        {isAnnouncement && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.1rem 0.4rem",
                              borderRadius: 999,
                              backgroundColor: "#dbeafe",
                              color: "#1d4ed8",
                              fontWeight: 600,
                            }}
                          >
                            Announcement
                          </span>
                        )}

                        {isUnread && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.1rem 0.4rem",
                              borderRadius: 999,
                              backgroundColor: "#f97316",
                              color: "white",
                              fontWeight: 700,
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>

                      <h3 style={titleStyle}>{n.title}</h3>
                      <p style={{ margin: 0, whiteSpace: "pre-line" }}>
                        {n.body}
                      </p>

                      {n.metadataJson && (
                        <p
                          style={{
                            margin: "0.25rem 0 0",
                            fontSize: "0.8rem",
                            color: "#555",
                          }}
                        >
                          <strong>Extra info:</strong>{" "}
                          <code>{n.metadataJson}</code>
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        minWidth: "120px",
                        textAlign: "right",
                        fontSize: "0.8rem",
                        color: "#666",
                      }}
                    >
                      <div>{formatDateTime(n.createdAt)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={loading || !pageData || pageData.first}
              style={{ marginRight: "0.5rem" }}
            >
              Προηγούμενη
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={loading || !pageData || pageData.last}
            >
              Επόμενη
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
