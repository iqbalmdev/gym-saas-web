"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/features/auth/actions";

const SIDEBAR_EXPANDED_KEY = "gym-saas-sidebar-expanded";

type NavIcon =
  | "home"
  | "renewals"
  | "leads"
  | "members"
  | "attendance"
  | "plans"
  | "settings";

const NAV_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: NavIcon;
}> = [
  { href: "/admin", label: "Dashboard", icon: "home" },
  { href: "/admin/renewals", label: "Renewals", icon: "renewals" },
  { href: "/admin/crm", label: "Leads", icon: "leads" },
  { href: "/admin/members", label: "Members", icon: "members" },
  { href: "/admin/attendance", label: "Attendance", icon: "attendance" },
  { href: "/admin/plans", label: "Plans", icon: "plans" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export type AdminShellUser = {
  displayName: string;
  email: string;
  roleCode: string;
  staffCode: string | null;
  initials: string;
};

type AdminShellProps = {
  children: ReactNode;
  user: AdminShellUser;
  setupBanner?: ReactNode;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname.startsWith(href);
}

function NavGlyph({ icon }: { icon: NavIcon }) {
  const common = "h-4 w-4 shrink-0";
  switch (icon) {
    case "home":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "renewals":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 12a8 8 0 0 1 13.5-5.8M20 12a8 8 0 0 1-13.5 5.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M17 4v4h4M7 20v-4H3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "leads":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 7h13M8 12h13M8 17h13M3 7h.01M3 12h.01M3 17h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "members":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "attendance":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 3v4M16 3v4M4 10h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "plans":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 4h10a2 2 0 0 1 2 2v14l-4-2-3 2-3-2-4 2V6a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9 10h6M9 14h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 16l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8l1.6-1.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

function CollapseIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      {expanded ? (
        <path
          d="M15 6 9 12l6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function AdminShell({ children, user, setupBanner }: AdminShellProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
    if (stored === "0") {
      setExpanded(false);
    } else if (stored === "1") {
      setExpanded(true);
    }
    document.documentElement.dataset.adminShellReady = "true";
  }, []);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  return (
    <div className="admin-shell min-h-screen text-[var(--color-fg)]">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-[var(--color-border)]/70 bg-[var(--color-surface)]/95 py-3 backdrop-blur-sm transition-[width] duration-300 ease-out ${
            expanded ? "w-[14rem]" : "w-[4.25rem]"
          }`}
          aria-label="Admin modules"
          role="complementary"
        >
          <div
            className={`mb-4 flex items-center gap-2.5 px-2 ${
              expanded ? "justify-between" : "flex-col gap-2"
            }`}
          >
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 rounded-xl ${
                expanded ? "min-w-0 px-1.5 py-1" : "justify-center"
              }`}
              title="Gym SaaS"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-xs font-bold text-[var(--color-accent-fg)]">
                G
              </span>
              {expanded ? (
                <span className="truncate text-sm font-semibold tracking-tight">
                  Gym SaaS
                </span>
              ) : null}
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-9 shrink-0 rounded-xl p-0"
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              title={expanded ? "Collapse" : "Expand"}
              onClick={toggleExpanded}
            >
              <CollapseIcon expanded={expanded} />
            </Button>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={`flex items-center rounded-xl text-sm transition ${
                    expanded ? "gap-2.5 px-3 py-2.5" : "justify-center px-0 py-2.5"
                  } ${
                    active
                      ? "bg-[var(--color-accent)] font-medium text-[var(--color-accent-fg)]"
                      : "text-[var(--color-fg-muted)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-fg)]"
                  }`}
                >
                  <NavGlyph icon={item.icon} />
                  {expanded ? <span className="truncate">{item.label}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div
            className={`mt-2 flex border-t border-[var(--color-border)]/80 px-2 pt-3 ${
              expanded ? "items-center justify-between gap-2" : "flex-col items-center gap-2"
            }`}
          >
            {expanded ? (
              <p className="text-xs text-[var(--color-fg-muted)]">Appearance</p>
            ) : null}
            <ThemeToggle />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/90 px-4 py-3 shadow-[var(--shadow-nav)] backdrop-blur-md md:px-6">
            <div className="flex items-center justify-end gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{user.displayName}</p>
                <p className="text-xs text-[var(--color-fg-muted)]">{user.roleCode}</p>
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-canvas-accent)] text-xs font-semibold text-[var(--color-fg)] ring-2 ring-[var(--color-surface)]"
                title={user.email}
                aria-label={user.displayName}
              >
                {user.initials}
              </div>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" className="text-xs">
                  Sign out
                </Button>
              </form>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            {setupBanner}
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
