import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        admin: resolve(import.meta.dirname, "index.html"),
        inscriere: resolve(import.meta.dirname, "inscriere.html")
      }
    }
  }
});
