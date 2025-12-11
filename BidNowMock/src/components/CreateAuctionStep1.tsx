// src/components/CreateAuctionStep1.tsx

import React, { useState, useEffect } from "react";
import type {
  AuctionCreateRequest,
  AuctionDetails,
  ShippingCostPayer,
} from "../models/Springboot/Auction";
import { createAuction } from "../api/Springboot/backendAuctionService";

// 👇 import για κατηγορίες
import { getCategories } from "../api/Springboot/backendCategoryService";
import type { CategoryDto } from "../api/Springboot/backendCategoryService";

interface CreateAuctionStep1Props {
  onCompleted: (data: { auctionId: number; createdAuction: AuctionDetails }) => void;
}

// helper: φτιάχνει LocalDateTime string τύπου "YYYY-MM-DDTHH:mm:ss"
// εδώ βάζω now + 10 seconds για να περάσει το @Future
function buildStartDateNowPlus10Seconds(): string {
  const now = new Date();
  const future = new Date(now.getTime() + 10 * 1000); // +10s
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = future.getFullYear();
  const month = pad(future.getMonth() + 1);
  const day = pad(future.getDate());
  const hours = pad(future.getHours());
  const minutes = pad(future.getMinutes());
  const seconds = pad(future.getSeconds());

  // μορφή που ταιριάζει σε LocalDateTime (χωρίς timezone)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const CreateAuctionStep1: React.FC<CreateAuctionStep1Props> = ({ onCompleted }) => {
  // 👇 τώρα κρατάμε το id της κατηγορίας ως string (από dropdown)
  const [categoryId, setCategoryId] = useState<string>("");

  const [title, setTitle] = useState<string>("PS4");
  const [shortDescription, setShortDescription] = useState<string>("Playstation 4 with game");
  const [description, setDescription] = useState<string>("Playstation 4 in good condition with FC26");
  const [startingAmount, setStartingAmount] = useState<string>("50");
  const [minBidIncrement, setMinBidIncrement] = useState<string>("1");
  const [shippingCostPayer, setShippingCostPayer] =
    useState<ShippingCostPayer>("BUYER");
  const [endDate, setEndDate] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 👇 state για τις κατηγορίες
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Φόρτωση κατηγοριών μία φορά στο mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const result = await getCategories();
        setCategories(result);

        // αν θες κάποιο default, π.χ. την πρώτη κατηγορία
        if (result.length > 0) {
          setCategoryId(result[0].id.toString());
        }
      } catch (err: unknown) {
        console.error(err);
        let message = "Κάτι πήγε στραβά κατά τη φόρτωση των κατηγοριών.";
        if (err instanceof Error) {
          message = err.message;
        }
        setCategoriesError(message);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!categoryId) {
      setError("Επίλεξε κατηγορία πριν δημιουργήσεις τη δημοπρασία.");
      return;
    }

    setLoading(true);

    try {
      const startDate = buildStartDateNowPlus10Seconds();

      const request: AuctionCreateRequest = {
        categoryId: Number(categoryId), // 👈 id από dropdown
        title,
        shortDescription,
        description,
        startingAmount: Number(startingAmount),
        minBidIncrement: Number(minBidIncrement),
        startDate, // 👉 μπαίνει αυτόματα (now + 10s)
        endDate, // αυτό το δίνει ο χρήστης από το input
        shippingCostPayer,
      };

      const created = await createAuction(request);
      setSuccess(`Auction created with id=${created.id}`);

      onCompleted({ auctionId: created.id, createdAuction: created });
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά κατά τη δημιουργία της δημοπρασίας.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Βήμα 1: Στοιχεία δημοπρασίας (χωρίς φωτογραφίες)</h2>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      {categoriesError && <p style={{ color: "red" }}>{categoriesError}</p>}

      {/* 👇 Αντί για "Category ID" input → dropdown με ονόματα */}
      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Category:
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            style={{ marginLeft: "0.5rem" }}
            disabled={categoriesLoading || categories.length === 0}
          >
            {categoriesLoading && <option>Φόρτωση κατηγοριών...</option>}
            {!categoriesLoading && categories.length === 0 && (
              <option value="">Δεν υπάρχουν διαθέσιμες κατηγορίες</option>
            )}
            {!categoriesLoading &&
              categories.length > 0 &&
              categories.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Short Description:
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
            style={{ marginLeft: "0.5rem", width: "300px" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ marginLeft: "0.5rem", width: "300px", height: "80px" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Starting amount:
          <input
            type="number"
            value={startingAmount}
            onChange={(e) => setStartingAmount(e.target.value)}
            required
            step="0.01"
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Min bid increment:
          <input
            type="number"
            value={minBidIncrement}
            onChange={(e) => setMinBidIncrement(e.target.value)}
            required
            step="0.01"
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          End date:
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Ποιος πληρώνει τα μεταφορικά;
          <select
            value={shippingCostPayer}
            onChange={(e) =>
              setShippingCostPayer(e.target.value as ShippingCostPayer)
            }
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="SELLER">Seller πληρώνει όλα τα μεταφορικά</option>
            <option value="BUYER">Buyer πληρώνει όλα τα μεταφορικά</option>
            <option value="SPLIT">50 / 50 (Seller & Buyer)</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={loading || categoriesLoading}>
        {loading ? "Δημιουργία..." : "Συνέχεια στο Βήμα 2 (φωτογραφίες)"}
      </button>
    </form>
  );
};

export default CreateAuctionStep1;
