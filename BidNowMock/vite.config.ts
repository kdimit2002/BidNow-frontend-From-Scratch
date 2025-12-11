// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    // 👇 αυτό “χαρτογραφεί” το global σε window για browser περιβάλλον
    global: "window",
  },
  optimizeDeps: {
    // βοηθάει στο pre-bundling των libs για να μην έχουμε περίεργα
    include: ["@stomp/stompjs", "sockjs-client"],
  },
});
