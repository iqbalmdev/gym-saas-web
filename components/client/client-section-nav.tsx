'use client';

import type { ReactElement } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
    { href: '/client', label: 'Home', match: (path: string) => path === '/client' },
    { href: '/client/profile', label: 'Profile', match: (path: string) => path.startsWith('/client/profile') },
] as const;

export function ClientSectionNav(): ReactElement {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap gap-1" aria-label="Member sections">
            {LINKS.map((link) => {
                const active = link.match(pathname);
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={`rounded-md px-2.5 py-1 text-sm font-medium ${
                            active
                                ? 'bg-(--color-accent) text-(--color-accent-fg)'
                                : 'text-(--color-fg-muted) hover:text-(--color-fg)'
                        }`}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
