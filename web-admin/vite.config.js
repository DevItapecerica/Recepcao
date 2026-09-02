import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
    environmentOptions: { jsdom: { url: "http://localhost:3000" } },
    restoreMocks: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@API": path.resolve(__dirname, "./src/API"),
      "@Service": path.resolve(__dirname, "./src/service"),
      "@Context": path.resolve(__dirname, "./src/context"),
    },
  },
  server: {
    host: "0.0.0.0", //Acesso externo
    port: 5173,
    proxy: {
      "/api/v1": {
        target: "http://192.168.16.13:3000",
        changeOrigin: false,
        secure: false,
      },
    },
  },
});
