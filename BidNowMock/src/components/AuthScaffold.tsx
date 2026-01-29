// src/components/AuthScaffold.tsx
import React from "react";

type AuthScaffoldProps = {
  children: React.ReactNode;
};

const AuthScaffold: React.FC<AuthScaffoldProps> = ({ children }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh", // ✅ σωστό για mobile (dynamic viewport)
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        backgroundColor: "#041822", // ✅ fallback αν αργήσει η εικόνα
        backgroundImage: "url(/images/authentication_background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          minHeight: "100dvh",
          width: "100%",
          boxSizing: "border-box",
          display: "grid",
          placeItems: "center",
          padding: "clamp(14px, 3vw, 32px)",
          background:
            "radial-gradient(900px 520px at 50% 22%, rgba(255,255,255,0.18), rgba(0,0,0,0) 62%)," +
            "linear-gradient(180deg, rgba(13, 42, 55, 0.62), rgba(5, 20, 29, 0.76))",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthScaffold;
