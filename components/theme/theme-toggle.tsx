'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/theme-provider';

type ThemeToggleProps = {
    className?: string;
};

function SunIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="M19 14.5A7.5 7.5 0 0 1 9.5 5 7.2 7.2 0 0 0 8 5a8 8 0 1 0 11 9.5c0-.5 0-1-.1-1.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Mount-safe by design: SSR and the pre-paint boot script can disagree on
        // theme, so the toggle only renders its real state after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // SSR + boot script can disagree on theme before mount — avoid hydration mismatch.
    if (!mounted) {
        return (
            <Button
                type="button"
                variant="ghost"
                className={`h-9 w-9 rounded-xl p-0 ${className}`}
                aria-label="Theme"
                disabled
            >
                <span className="h-4 w-4" aria-hidden />
            </Button>
        );
    }

    const isDark = theme === 'dark';

    return (
        <Button
            type="button"
            variant="ghost"
            className={`h-9 w-9 rounded-xl p-0 ${className}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            onClick={toggleTheme}
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </Button>
    );
}
