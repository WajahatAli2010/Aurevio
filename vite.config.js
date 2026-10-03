import { defineConfig } from "vite";

export default defineConfig({
  base: "/Aurevio/",
  build: {
    target: "es2020",
    sourcemap: false
  }
});