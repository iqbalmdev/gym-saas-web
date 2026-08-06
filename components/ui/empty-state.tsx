type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)]/80 bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)]">
      <h2 className="text-base font-semibold text-[var(--color-fg)]">{title}</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-fg-muted)]">
        {description}
      </p>
    </div>
  );
}
