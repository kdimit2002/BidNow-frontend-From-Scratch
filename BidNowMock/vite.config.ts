// // vite.config.ts
// import { defineConfig } from "vite";
 import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   define: {
//     // 👇 αυτό “χαρτογραφεί” το global σε window για browser περιβάλλον
//     global: "window",
//   },
//   optimizeDeps: {
//     // βοηθάει στο pre-bundling των libs για να μην έχουμε περίεργα
//     include: ["@stomp/stompjs", "sockjs-client"],
//   },
// });
import { defineConfig } from "vite";

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
  server: {
    allowedHosts: ['mayola-teliosporic-scoldingly.ngrok-free.dev'],
    host: true,
    port: 5173,
proxy: {
  "/api": { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false },
  "/ws":  { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false, ws: true },
  "/auctions": { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false },
  "/user": { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false },
  "/referralCode": { target: "http://172.23.128.1:8080", changeOrigin: true, secure: false },
}
  },
});

