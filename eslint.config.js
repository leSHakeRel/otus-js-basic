import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import jest from "eslint-plugin-jest";

export default defineConfig([
  { ignores: ["**/dist/**", "**/coverage/**", "**/node_modules/**"] },
  {
    files: ["./src/*.{js}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      ...js.configs.recommended.rules,
      semi: ["error", "always"],
      "prefer-const": "error",
    },
  },
  {
    files: [".src/**/*.test.js"],
    ...jest.configs["flat/recommended"],
  },
]);
