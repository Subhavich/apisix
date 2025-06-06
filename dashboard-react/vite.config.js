import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    hmr: {
      protocol: "ws",
      host: "localhost", // 👈 Host of your machine, not "reactapp"
      port: 24678,
    },
    watch: {
      usePolling: true,
    },
  },
});
