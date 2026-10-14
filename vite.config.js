import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";
const updatedAt = execFileSync("git", ["log", "-1", "--format=%cI"], {
  encoding: "utf8",
}).trim();
import react from "@vitejs/plugin-react";
export default defineConfig({
  define: { __SITE_UPDATED_AT__: JSON.stringify(updatedAt) },
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["chart.js"],
          maps: ["leaflet"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
