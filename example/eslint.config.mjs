import { defineConfig } from "eslint/config"
import js from "@eslint/js"
import tw4 from "eslint-plugin-tw4"

export default defineConfig([
  {
    files: ["**/*.js"],
    extends: [
      js.configs.recommended,
    ],
    plugins: {
      tw4,
    },
    rules: {
      "tw4/enforces-shorthand": "error",
    }
  }
])
