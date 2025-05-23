import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      components: "/src/components",
      pages: "/src/pages",
      styles: "/src/styles",
      firebaseApp: "/src/firebaseApp",
      context: "/src/context",
      hooks: "/src/hooks",
      lib: "/src/lib",
    },
  },
});
