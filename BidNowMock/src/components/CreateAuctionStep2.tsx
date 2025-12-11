// src/components/CreateAuctionStep2.tsx

import React, { useState } from "react";
import {
  uploadAuctionMainImage,
  uploadAuctionImages,
} from "../api/Springboot/backendAuctionService";

interface CreateAuctionStep2Props {
  auctionId: number;
  onCompleted?: () => void;
}

const CreateAuctionStep2: React.FC<CreateAuctionStep2Props> = ({
  auctionId,
  onCompleted,
}) => {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleMainImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setMainImage(file);
  };

  const handleExtraImagesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setExtraImages(files);
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!mainImage) {
      setError("Πρέπει να επιλέξεις τουλάχιστον μία main image.");
      return;
    }

    setLoading(true);
    try {
      // 1) ανεβάζουμε main image
      const mainUrl = await uploadAuctionMainImage(auctionId, mainImage);
      console.log("Main image uploaded:", mainUrl);

      // 2) αν υπάρχουν extra images → ανέβασέ τες
      if (extraImages.length > 0) {
        const extraUrls = await uploadAuctionImages(auctionId, extraImages);
        console.log("Extra images uploaded:", extraUrls);
      }

      setSuccess("Οι φωτογραφίες ανέβηκαν επιτυχώς!");
      onCompleted?.();
    } catch (err: unknown) {
      console.error(err);
      let message = "Κάτι πήγε στραβά στο upload των φωτογραφιών.";
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
      <h2>Βήμα 2: Φωτογραφίες</h2>

      <p>Auction ID: {auctionId}</p>

      {error && <p style={{ color: "red" }}>Σφάλμα: {error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Main image (η πρώτη φωτογραφία):
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            required
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Extra images (πολλαπλές):
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleExtraImagesChange}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Ανέβασμα..." : "Ολοκλήρωση δημιουργίας δημοπρασίας"}
      </button>
    </form>
  );
};

export default CreateAuctionStep2;
