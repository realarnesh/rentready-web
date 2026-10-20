import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Django API (github.com/realarnesh/rentready) runs on :8000.
// Proxying /api avoids CORS setup during local development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": process.env.VITE_API_TARGET || "http://127.0.0.1:8000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
