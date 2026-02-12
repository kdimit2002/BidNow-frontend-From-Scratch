// // // vite.config.ts
// // import { defineConfig } from "vite";

// // export default defineConfig({
// //   plugins: [react()],
// //   define: {
// //     // 👇 αυτό “χαρτογραφεί” το global σε window για browser περιβάλλον
// //     global: "window",
// //   },
// //   optimizeDeps: {
// //     // βοηθάει στο pre-bundling των libs για να μην έχουμε περίεργα
// //     include: ["@stomp/stompjs", "sockjs-client"],
// //   },
// // });


// import react from "@vitejs/plugin-react";


// import { defineConfig } from "vite";



// export default defineConfig({
//     plugins: [react()],
//   define: {
//     // 👇 αυτό “χαρτογραφεί” το global σε window για browser περιβάλλον
//     global: "window",
//   },
//   optimizeDeps: {
//     // βοηθάει στο pre-bundling των libs για να μην έχουμε περίεργα
//     include: ["@stomp/stompjs", "sockjs-client"],
//   },
//   server: {
//     allowedHosts: ['mayola-teliosporic-scoldingly.ngrok-free.dev'],
//     host: true,
//     port: 5173,
// proxy: {
//   "/api": { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false },
//   "/ws":  { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false, ws: true },
//   "/auctions": { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false },
//   "/user": { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false },
//   "/referralCode": { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false },
// }
//   },
// });


// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const BACKEND_TARGET = process.env.VITE_BACKEND_TARGET ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  optimizeDeps: {
    include: ["@stomp/stompjs"], // SockJS δεν το χρειάζεσαι πλέον στο AuctionsPage
  },
  server: {
    // ✅ δέχεται ΟΛΑ τα subdomains των ngrok-free.* χωρίς να αλλάζεις κάθε φορά config
    allowedHosts: [".ngrok-free.dev", ".ngrok-free.app"],

    host: true,
    port: 5173,

    // ✅ HMR πίσω από HTTPS tunnel
    hmr: {
      clientPort: 443,
    },

    proxy: {
      "/api": { target: BACKEND_TARGET, changeOrigin: true, secure: false },
      "/auctions": { target: BACKEND_TARGET, changeOrigin: true, secure: false },
      "/user": { target: BACKEND_TARGET, changeOrigin: true, secure: false },
      "/referralCode": { target: BACKEND_TARGET, changeOrigin: true, secure: false },

      // ✅ Raw WebSocket endpoint (Spring addEndpoint("/ws"))
      "/ws": { target: BACKEND_TARGET, changeOrigin: true, secure: false, ws: true },
    },
  },
});
