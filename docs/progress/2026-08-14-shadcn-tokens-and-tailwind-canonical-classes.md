# 2026-08-14 — shadcn/ui + token aliasing, and Tailwind canonical classes

Two commits, in this order deliberately: shadcn first, canonical classes second,
because token aliasing rewrites many of the same `className` strings.

## shadcn/ui (ADR-0006)

The office network **can** reach the shadcn registry, so `npx shadcn@latest init`
ran normally — no need for the hand-vendoring fallback. Worth knowing, since
`registry.npmjs.org` and `ui.shadcn.com` are blocked/allowed independently here.

Two things `init` did that had to be undone:

- **Dark mode keyed off `.dark`.** Repointed the custom variant at
  `[data-theme='dark']`, which is what the FOUC-safe boot script and
  `localStorage` preference already drive. Adding shadcn's mechanism alongside
  would have meant two competing switches.
- **A second palette.** It wrote a full neutral-oklch token set into `:root` and
  `.dark`. Replaced with aliases onto the existing `--color-*` tokens, so
  nothing in `globals.css` holds a literal colour and retheming stays a
  `crm-tokens.css` edit.

**The alias block exists once.** Because `--color-*` already swaps on
`html[data-theme="dark"]`, the aliases follow automatically — there is
deliberately no dark-mode duplicate to keep in sync.

Mapping worth remembering: shadcn's `primary` is the high-contrast *action*
colour (`--color-accent`), while `secondary` / `muted` / `accent` are all quiet
*surfaces* (`--color-canvas-accent`), not brand. Charts reuse the status palette
rather than introducing an orphan one. New `--radius-control` (0.625rem) drives
button/input radii; panels keep `--radius-panel` (1.25rem).

Corrections to ADR-0006 as written: components pull **`@base-ui/react`, not
Radix** (recent shadcn switched primitives), and `init` installs `shadcn` itself
as a runtime dependency — moved to devDependencies, it is a CLI.

`components/ui/button.tsx` was overwritten by `init`. Call sites use only
`ghost` and `secondary`, both of which exist in the new API, so nothing broke;
the old `primary` variant was unused. `empty-state.tsx` was left alone.

**New E2E assertion:** `shadcn tokens resolve and follow data-theme`. The
existing test only checked the `data-theme` attribute, which would still pass if
the alias broke — components would simply render in the wrong colours. The new
test reads computed `--background` / `--foreground` / `--primary` / `--border`
and asserts they equal the CRM palette and change between themes.

## Tailwind canonical classes

458 occurrences of `[var(--x)]` → `(--x)` across 26 files, opacity modifiers
preserved (`bg-(--color-fg)/25`).

Verified equivalent rather than assumed: built CSS captured before and after,
old selector encoding normalised to the new spelling, then rule sets compared as
sorted sets — **497 rules, identical**. The only raw-output differences are
shorter class names and the sort order that follows from them.

## Gotcha for future codemods on this repo

`grep -rl … | xargs` and unquoted `$files` both failed here: zsh does not
word-split unquoted expansions, and BSD `grep -Z` means *decompress*, not
null-separate. Route paths contain parentheses (`app/(auth)/…`), which makes
this bite. Use `find … -exec … {} +`.
