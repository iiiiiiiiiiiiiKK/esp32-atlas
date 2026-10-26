import { FlatCompat } from "@eslint/eslintrc";
import { createRequire } from "node:module";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);
const compat = new FlatCompat({ baseDirectory: dirname(require.resolve("eslint-config-next/package.json")) });

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      "next-env.d.ts",
      "coverage/**",
      "test-results/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
