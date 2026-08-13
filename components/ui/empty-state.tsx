type EmptyStateProps = {
    title: string;
    description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="rounded-(--radius-panel) border border-(--color-border)/80 bg-(--color-surface) p-8 shadow-(--shadow-panel)">
            <h2 className="text-base font-semibold text-(--color-fg)">{title}</h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-(--color-fg-muted)">{description}</p>
        </div>
    );
}
