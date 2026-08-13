import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Architecture rules below encode `docs/architecture-plan.md` §4 and ADR-0004
 * so the ports/adapters boundary fails a build instead of relying on review.
 * See `.cursor/rules/code-quality.mdc` and `001-tech-stack.mdc`.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored agent skill references — not our source.
    ".agents/**",
    ".cursor/skills/**",
  ]),

  {
    name: "gym-saas/strict-types",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // `_name` marks a deliberately unused binding (e.g. required-but-unused props).
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    name: "gym-saas/playwright-fixtures",
    // Playwright's fixture API calls `await use(value)` to yield a fixture.
    // The React lint rule mistakes it for React's `use` hook — false positive.
    files: ["e2e/**/*.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },

  {
    name: "gym-saas/named-exports-only",
    // Next.js requires default exports in app/ (pages, layouts) — exempt there.
    files: ["components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Named exports only (code-quality.mdc). Default exports are allowed only under app/, where Next.js requires them.",
        },
      ],
    },
  },

  {
    name: "gym-saas/ports-declare-contracts-only",
    files: ["lib/ports/**/*.ts"],
    ignores: ["lib/ports/fakes/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/api/*", "@/lib/features/*", "@/components/*"],
              message:
                "Ports declare async contracts + DTO types only (ADR-0004). They must not import adapters, features, or UI.",
            },
          ],
        },
      ],
    },
  },

  {
    name: "gym-saas/transport-stays-in-adapters",
    files: [
      "lib/features/**/*.ts",
      "components/**/*.{ts,tsx}",
      "app/**/*.{ts,tsx}",
    ],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      // `@/lib/api/composition`, `/errors` and `/endpoints` stay allowed:
      // composition is the DI root, the other two are shared constants/types.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/api/client",
                "@/lib/api/*-adapter",
                "@/lib/api/e2e-fixtures",
              ],
              message:
                "HTTP belongs in adapters (ADR-0004). Depend on ports and resolve them via createAppServices() from @/lib/api/composition.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "No domain fetch outside lib/api adapters (ADR-0004). Read via ports in a Server Component, mutate via a Server Action.",
        },
      ],
    },
  },
]);

export default eslintConfig;
