import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

function htmlPartials() {
  return {
    name: "aurevio-html-partials",
    transformIndexHtml(html) {
      const pattern = /<!--\s*@include:\s*([^\s]+)\s*-->/g;
      const expand = source => source.replace(pattern, (_, file) => {
        const filePath = path.resolve(process.cwd(), file);
        if (!fs.existsSync(filePath)) throw new Error("Aurevio HTML partial not found: " + file);
        return expand(fs.readFileSync(filePath, "utf8"));
      });
      return expand(html);
    }
  };
}

export default defineConfig({
  base: "/Aurevio/",
  plugins: [htmlPartials()],
  build: { target: "es2020", sourcemap: false }
});
