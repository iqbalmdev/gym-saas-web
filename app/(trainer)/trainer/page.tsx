import { EmptyState } from '@/components/ui/empty-state';

/** Reserved Phase B route — do not delete. */
export default function TrainerPlaceholderPage() {
    return (
        <div className="mx-auto max-w-lg p-8">
            <EmptyState
                title="Trainer web (Phase B)"
                description="Route group reserved. Trainer surface ships after Admin Phase A."
            />
        </div>
    );
}
