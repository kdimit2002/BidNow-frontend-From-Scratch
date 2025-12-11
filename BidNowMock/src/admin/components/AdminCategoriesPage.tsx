// src/components/AdminCategoriesPage.tsx

import React, { useEffect, useState } from "react";
import {
  getCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../../api/Springboot/backendCategoryService";

import type { CategoryDto } from "../../api/Springboot/backendCategoryService";

interface AdminCategoriesPageProps {
  onBack?: () => void;
}

type MessageType = "success" | "error" | null;

const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // Update
  const [selectedUpdateId, setSelectedUpdateId] = useState<number | "">("");
  const [updateName, setUpdateName] = useState<string>("");

  // Delete
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | "">("");

  // Toast / μήνυμα
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>(null);

  const showMessage = (type: MessageType, msg: string) => {
    setMessageType(type);
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 4000);
  };

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: unknown) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά στο φόρτωμα των κατηγοριών.";
      if (err instanceof Error && err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // CREATE
  const handleCreate = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      window.alert("Γράψε ένα όνομα κατηγορίας.");
      return;
    }

    try {
      const created = await adminCreateCategory(trimmed);
      showMessage("success", `Η κατηγορία "${created.name}" δημιουργήθηκε.`);
      setNewCategoryName("");
      // πρόσθεσε τη νέα στην λίστα
      setCategories((prev) => [...prev, created]);
    } catch (err: unknown) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά στη δημιουργία κατηγορίας.";
      if (err instanceof Error && err.message) {
        msg = err.message;
      }
      showMessage("error", msg);
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (selectedUpdateId === "") {
      window.alert("Επέλεξε κατηγορία για αλλαγή.");
      return;
    }
    const trimmed = updateName.trim();
    if (!trimmed) {
      window.alert("Γράψε το νέο όνομα κατηγορίας.");
      return;
    }

    try {
      const updated = await adminUpdateCategory(selectedUpdateId, trimmed);
      showMessage(
        "success",
        `Η κατηγορία ενημερώθηκε σε "${updated.name}".`
      );

      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setUpdateName("");
      setSelectedUpdateId("");
    } catch (err: unknown) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά στο update της κατηγορίας.";
      if (err instanceof Error && err.message) {
        msg = err.message;
      }
      showMessage("error", msg);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (selectedDeleteId === "") {
      window.alert("Επέλεξε κατηγορία για διαγραφή.");
      return;
    }

    const cat = categories.find((c) => c.id === selectedDeleteId);
    const confirm = window.confirm(
      `Σίγουρα θέλεις να διαγράψεις την κατηγορία "${cat?.name}" ;`
    );
    if (!confirm) return;

    try {
      await adminDeleteCategory(selectedDeleteId);
      showMessage("success", `Η κατηγορία "${cat?.name}" διαγράφηκε.`);

      setCategories((prev) =>
        prev.filter((c) => c.id !== selectedDeleteId)
      );
      setSelectedDeleteId("");
    } catch (err: unknown) {
      console.error(err);
      let msg = "Κάτι πήγε στραβά στη διαγραφή κατηγορίας.";
      if (err instanceof Error && err.message) {
        msg = err.message;
      }
      showMessage("error", msg);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <button type="button" onClick={onBack}>
          ← Back to auctions
        </button>
      </div>

      <h1>Admin: Διαχείριση Κατηγοριών</h1>

      {message && (
        <p
          style={{
            color: messageType === "error" ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}

      {loading && <p>Φόρτωση κατηγοριών...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Λίστα κατηγοριών */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Υπάρχουσες κατηγορίες</h3>
        {categories.length === 0 ? (
          <p>Δεν υπάρχουν κατηγορίες.</p>
        ) : (
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                #{c.id} — <strong>{c.name}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      {/* CREATE */}
      <div style={{ marginTop: "1rem" }}>
        <h3>Δημιουργία κατηγορίας</h3>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="π.χ. Electronics"
          style={{ marginRight: "0.5rem" }}
        />
        <button type="button" onClick={handleCreate}>
          Create
        </button>
      </div>

      <hr style={{ margin: "1rem 0" }} />

      {/* UPDATE */}
      <div style={{ marginTop: "1rem" }}>
        <h3>Ενημέρωση κατηγορίας</h3>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Επίλεξε κατηγορία:
            <select
              value={selectedUpdateId}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setSelectedUpdateId("");
                  setUpdateName("");
                  return;
                }
                const id = Number(val);
                setSelectedUpdateId(id);
                const cat = categories.find((c) => c.id === id);
                setUpdateName(cat?.name ?? "");
              }}
              style={{ marginLeft: "0.5rem" }}
            >
              <option value="">-- διάλεξε --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <input
            type="text"
            value={updateName}
            onChange={(e) => setUpdateName(e.target.value)}
            placeholder="Νέο όνομα κατηγορίας"
            style={{ marginRight: "0.5rem" }}
          />
          <button type="button" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </div>

      <hr style={{ margin: "1rem 0" }} />

      {/* DELETE */}
      <div style={{ marginTop: "1rem" }}>
        <h3>Διαγραφή κατηγορίας</h3>
        <label>
          Επίλεξε κατηγορία:
          <select
            value={selectedDeleteId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedDeleteId(val ? Number(val) : "");
            }}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">-- διάλεξε --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          style={{ marginLeft: "0.5rem" }}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
