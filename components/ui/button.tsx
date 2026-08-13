import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    children: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
    primary: 'bg-[var(--color-accent)] text-[var(--color-accent-fg)] hover:opacity-90',
    secondary:
        'bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[var(--color-canvas)]',
    ghost: 'bg-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]',
};

export function Button({ variant = 'primary', className = '', children, type = 'button', ...rest }: ButtonProps) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${variantClass[variant]} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}
