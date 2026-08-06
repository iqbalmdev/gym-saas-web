import { EmptyState } from "@/components/ui/empty-state";

export default function ClientHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
          Member home
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Your client dashboard for membership and progress.
        </p>
      </div>
      <EmptyState
        title="More member features come next"
        description="You are signed in on the Client lane. Invites, plans, and progress land here in Phase B — this home stays free of Admin desk tools."
      />
    </div>
  );
}
