import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    // Expose VITE_ prefixed env vars to the browser bundle
    // (SUPABASE_URL and SUPABASE_ANON_KEY are public/safe to expose)
    envPrefix: "VITE_",

    server: {
      // HMR disabled in AI Studio environments
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},

      // Proxy all /api/* and /auth/* calls to Express dev server
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
        "/auth": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
        "/rss.xml": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
        "/sitemap.xml": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },

    build: {
      // Code-split for better performance
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react":   ["react", "react-dom"],
            "vendor-supabase": ["@supabase/supabase-js"],
            "vendor-motion":  ["motion"],
            "vendor-lucide":  ["lucide-react"],
          },
        },
      },
      // Target modern browsers (no IE11 legacy output)
      target: "es2020",
      sourcemap: false,
    },
  };
});
