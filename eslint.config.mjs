import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Architecture rules encode `docs/architecture-plan.md` §4, ADR-0004 and the
 * module layout of ADR-0007, so the ports/adapters boundary fails a build
 * instead of relying on review.
 *
 * NOTE ON FLAT CONFIG: when two config objects both set `no-restricted-imports`
 * for the same file, the last match wins outright — they are not merged. The
 * three blocks below are therefore kept to *disjoint* file sets (ports,
 * adapters, everything-else) rather than one block per concern.
 */
const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,

    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Vendored agent skill references — not our source.
        '.agents/**',
        '.cursor/skills/**',
    ]),

    {
        name: 'gym-saas/strict-types',
        files: ['**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            // `_name` marks a deliberately unused binding (e.g. required-but-unused props).
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },

    {
        name: 'gym-saas/playwright-fixtures',
        // Playwright's fixture API calls `await use(value)` to yield a fixture.
        // The React lint rule mistakes it for React's `use` hook — false positive.
        files: ['e2e/**/*.ts'],
        rules: {
            'react-hooks/rules-of-hooks': 'off',
        },
    },

    {
        name: 'gym-saas/named-exports-only',
        // Next.js requires default exports in app/ (pages, layouts) — exempt there.
        files: ['components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'modules/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ExportDefaultDeclaration',
                    message:
                        'Named exports only (code-quality.mdc). Default exports are allowed only under app/, where Next.js requires them.',
                },
            ],
        },
    },

    // --- disjoint set 1: ports declare contracts only -------------------------
    {
        name: 'gym-saas/ports-declare-contracts-only',
        files: ['modules/*/*-ports.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@/lib/api/*',
                                '@/modules/*/*-adapter',
                                '@/modules/*/*-use-cases',
                                '@/modules/*/*-actions',
                                '@/modules/*/*-services',
                                '@/modules/*/components/*',
                                '@/components/*',
                            ],
                            message:
                                'Ports declare async contracts + DTO types only (ADR-0004). No adapters, use-cases, actions or UI.',
                        },
                    ],
                },
            ],
        },
    },

    // --- disjoint set 2: adapters own transport, nothing above it -------------
    {
        name: 'gym-saas/adapters-own-transport',
        files: ['modules/*/*-adapter.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@/modules/*/*-use-cases',
                                '@/modules/*/*-actions',
                                '@/modules/*/*-services',
                                '@/modules/*/components/*',
                                '@/components/*',
                            ],
                            message:
                                'Adapters implement ports and own HTTP only (ADR-0004) — they must not reach up into use-cases, actions or UI.',
                        },
                    ],
                },
            ],
        },
    },

    // --- disjoint set 3: everything above the transport layer -----------------
    {
        name: 'gym-saas/transport-stays-in-adapters',
        files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'modules/**/*.{ts,tsx}'],
        ignores: [
            'lib/api/**', // the HTTP kernel and the E2E fixture kernel themselves
            'modules/*/*-ports.ts', // set 1
            'modules/*/*-adapter.ts', // set 2
            'modules/*/*-services.ts', // the sanctioned port → adapter binding
            'modules/*/*-e2e-fixtures.ts', // per-module Playwright fakes read the shared e2e store
            '**/*.test.ts',
            '**/*.test.tsx',
        ],
        rules: {
            // `@/lib/api/composition`, `/errors` and `/endpoints` stay allowed:
            // composition is the DI root, the other two are shared constants/types.
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@/lib/api/client',
                                '@/modules/*/*-adapter',
                                '@/lib/api/e2e/*',
                                '@/modules/*/*-e2e-fixtures',
                            ],
                            message:
                                'HTTP belongs in adapters, bound in <module>-services.ts (ADR-0004/0007). Resolve ports via createAppServices() from @/lib/api/composition.',
                        },
                    ],
                },
            ],
            'no-restricted-globals': [
                'error',
                {
                    name: 'fetch',
                    message:
                        'No domain fetch outside modules/*/*-adapter.ts (ADR-0004). Read via ports in a Server Component, mutate via a Server Action.',
                },
            ],
        },
    },
]);

export default eslintConfig;
