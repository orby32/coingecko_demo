import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Disallow console.log in production; allow warn/error for debugging
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Prefer const for variables that are never reassigned
      "prefer-const": "warn",

      // Require === and !== instead of == and !=
      eqeqeq: ["error", "always"],

      // Disallow var; use let/const
      "no-var": "error",

      // Reduce TypeScript any usage
      "@typescript-eslint/no-explicit-any": "warn",

      // Catch unused variables; args starting with _ are ignored
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
