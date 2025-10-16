import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "0.0.0.0", // Allow access from any IP on network
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["@tanstack/react-query", "react-router-dom"], // Fix dependency warnings
    force: true
  },
  // Ensure mobile compatibility
  define: {
    global: 'globalThis',
  }
}));
