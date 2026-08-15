# 2026-08-15 — Admin shell rebuilt on Base UI's `Sidebar` primitive

Replaced the hand-rolled collapsible nav in `components/admin/admin-shell.tsx`
(manual `localStorage` persistence, a manual mobile-drawer overlay + ESC
handler, one-off inline SVG icons) with casheq's pattern: shadcn's `Sidebar`
primitive on top of `@base-ui/react`, already the project's UI base — no new
dependency.

**New:** `components/ui/{sidebar,sheet,tooltip,separator,skeleton,input}.tsx`,
`hooks/use-mobile.ts`, `components/admin/app-sidebar.tsx`. **`admin-nav.ts`**
gained an `AdminNavIcon → lucide-react` map and `getActiveAdminNavItem` (drives
the header's page-title text). `adminNavItems`/`resolveAdminHomeHref` are
unchanged — `admin-nav.test.ts` still covers them as-is.

State persistence moved from a client-only `localStorage` read to the
`sidebar_state` cookie, read server-side in `app/(admin)/admin/layout.tsx` and
passed in as `defaultOpen` — SSR-known, no flash on load. The mobile drawer is
now the primitive's own `Sheet`, which gets focus-trap/ESC for free. Client
persona (`app/(client)/client/layout.tsx`) was restyled to the same header
atoms (`Separator`, `Button`, `ThemeToggle`) but stays sidebar-less — it's one
route today, so a nav rail would be empty chrome.

Follow-up polish, in order raised:

- Collapsed-rail tooltips were firing on base-ui's default 600ms hover delay
  with no `TooltipProvider` mounted anywhere — felt broken. Wrapped the shell
  in `TooltipProvider delay={150}`.
- Nav text bumped off the shadcn default (`h-8`/`text-sm`) to `h-10`/
  `text-[0.9375rem]` — cramped for a nav that's on screen all day.
  `SIDEBAR_WIDTH` was bumped 15rem → 16rem to give the larger text room, then
  reverted back to 15rem afterward — current committed value is the upstream
  15rem.
- `SIDEBAR_WIDTH_ICON` bumped 3rem → 4rem (kept): the 32px collapsed button
  had zero slack at 3rem, so it looked centered by coincidence. The wider
  rail exposed that the button was never actually centered — fixed with
  `group-data-[collapsible=icon]:mx-auto` on `sidebarMenuButtonVariants`
  itself, so it's correct at any rail width, not a value tuned to 4rem.
- Collapse animation felt like a jump: the button's own resize transition had
  no explicit duration and fell back to Tailwind's default (150ms ease) while
  the rail/gap animate on `duration-200 ease-linear` — two clocks running
  side by side. Matched the button to `duration-200 ease-linear` and added an
  opacity fade on the trailing label so it dissolves instead of hard-clipping
  mid-word.

e2e: `admin-shell.page.ts`/`admin-shell.spec.ts`/`pages.fixture.ts` updated
for the new interaction model — one `SidebarTrigger` (scoped to `<header>`,
since the rail's own edge handle shares its accessible name) instead of two
differently-labeled collapse/expand buttons, `data-state` instead of
`localStorage`. Caught and fixed one real regression along the way: an early
draft gave the header a page-title `<h1>`, duplicating the `<h1>` every admin
page already renders and breaking `getByRole('heading', ...)` across the
suite — it's a `<p>` now, chrome rather than a second heading.

Full verify (`lockfile:check`, `format:check`, `lint`, `typecheck`, `vitest`)
and the full Playwright suite (26/26) green before commit
(`5f22941`).
