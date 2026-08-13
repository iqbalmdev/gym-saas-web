import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-(--color-canvas) px-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md">{children}</div>
        </div>
    );
}
