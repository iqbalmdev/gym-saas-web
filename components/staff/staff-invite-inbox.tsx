"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  formatInviteExpiry,
  staffInviteRoleLabel,
  staffInviteStatusLabel,
} from "@/lib/display/staff-invite-labels";
import { acceptStaffInviteAction } from "@/lib/features/staff-invites/actions";
import type { StaffInvite } from "@/lib/ports/staff-invites";

type StaffInviteInboxProps = {
  invites: StaffInvite[];
  listError: string | null;
  staffCode: string | null;
};

export function StaffInviteInbox({
  invites,
  listError,
  staffCode,
}: StaffInviteInboxProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actionable = invites.filter(
    (invite) => invite.status === "PENDING" || invite.status === "EXPIRED",
  );

  function handleAccept(inviteId: string) {
    setError(null);
    startTransition(async () => {
      const result = await acceptStaffInviteAction({ inviteId });
      if (result && !result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section
      className="space-y-3 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-panel)]"
      aria-labelledby="staff-invite-inbox-heading"
    >
      <div>
        <h2
          id="staff-invite-inbox-heading"
          className="text-lg font-semibold tracking-tight text-[var(--color-fg)]"
        >
          Your staff invites
        </h2>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Accept an invite to join a gym as Trainer or Admin
          {staffCode ? (
            <>
              . Your staff code is{" "}
              <span className="font-medium text-[var(--color-fg)]">
                {staffCode}
              </span>
              .
            </>
          ) : (
            "."
          )}
        </p>
      </div>

      {listError ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {listError}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {!listError && actionable.length === 0 ? (
        <p className="text-sm text-[var(--color-fg-muted)]">
          No pending invites. Share your staff code with a gym Admin, or create
          your own gym below.
        </p>
      ) : null}

      {actionable.length > 0 ? (
        <ul className="divide-y divide-[var(--color-border)]/70 rounded-md border border-[var(--color-border)]/80">
          {actionable.map((invite) => (
            <li
              key={invite.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-[var(--color-fg)]">
                  Join as {staffInviteRoleLabel(invite.targetRole)}
                  <span className="mx-2 text-[var(--color-fg-muted)]">·</span>
                  <span className="font-normal text-[var(--color-fg-muted)]">
                    {staffInviteStatusLabel(invite.status)}
                  </span>
                </p>
                <p className="text-xs text-[var(--color-fg-muted)]">
                  Expires {formatInviteExpiry(invite.expiresAt)}
                </p>
              </div>
              {invite.status === "PENDING" ? (
                <Button
                  type="button"
                  className="shrink-0"
                  disabled={isPending}
                  onClick={() => handleAccept(invite.id)}
                >
                  {isPending ? "Accepting…" : "Accept"}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
