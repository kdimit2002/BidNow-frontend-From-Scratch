import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = "Confirm action",
  message,
  confirmText = "Yes, continue",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <>
      <style>{`
        .bn-modal-overlay{
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .bn-modal{
          width: min(440px, 96vw);
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.10);
          box-shadow: 0 22px 70px rgba(0,0,0,0.22);
          overflow: hidden;
        }
        .bn-modal-head{
          padding: 14px 16px 10px;
          border-bottom: 1px solid rgba(15,23,42,0.08);
          font-weight: 900;
          color: #0f172a;
          font-size: 1.05rem;
        }
        .bn-modal-body{
          padding: 12px 16px 2px;
          color: #334155;
          line-height: 1.45;
          white-space: pre-line;
          font-size: 0.95rem;
        }
        .bn-modal-actions{
          padding: 14px 16px 16px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }
        .bn-btn{
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(15,23,42,0.14);
          background: #fff;
          color: #0f172a;
          font-weight: 900;
          cursor: pointer;
        }
        .bn-btn-primary{
          border: 1px solid rgba(11,92,255,0.25);
          background: #0b5cff;
          color: #fff;
          box-shadow: 0 12px 26px rgba(11,92,255,0.18);
        }
        .bn-btn:disabled{
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>

      <div
        className="bn-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => {
          // κλείσιμο αν πατήσεις έξω
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bn-modal">
          <div className="bn-modal-head">{title}</div>
          <div className="bn-modal-body">{message}</div>

          <div className="bn-modal-actions">
            <button className="bn-btn" onClick={onClose} disabled={loading}>
              {cancelText}
            </button>
            <button
              className="bn-btn bn-btn-primary"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Γίνεται..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
