"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { membershipPaymentStatusLabel } from "@/lib/modules/membership-invites/membership-invites-labels";
import {
  offboardMemberAction,
  setCheckInBlockAction,
} from "@/lib/modules/roster/roster-actions";
import type { RosterMember } from "@/lib/modules/roster/roster-ports";

type RosterPanelProps = {
  members: RosterMember[];
  listError: string | null;
};

export function RosterPanel({ members, listError }: RosterPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = members.filter((member) => member.status === "ACTIVE");

  function handleOffboard(membershipId: string) {
    setError(null);
    startTransition(async () => {
      const result = await offboardMemberAction({ membershipId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function handleCheckInBlock(membershipId: string, blocked: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await setCheckInBlockAction({ membershipId, blocked });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="space-y-3" aria-labelledby="roster-heading">
      <div>
        <h2
          id="roster-heading"
          className="text-sm font-semibold text-[var(--color-fg)]"
        >
          Active roster
        </h2>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Payment badges are informational. Check-in block is a manual safety
          valve — entitlement still follows subscription dates.
        </p>
      </div>

      {(listError || error) && (
        <p
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          {error ?? listError}
        </p>
      )}

      {active.length === 0 ? (
        <p className="text-sm text-[var(--color-fg-muted)]">
          No active members yet. Accepted invites appear here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-fg-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {active.map((member) => (
                <tr key={member.membershipId}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-fg)]">
                      {member.clientName}
                    </p>
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      {member.clientEmail}
                      {member.clientPhone ? ` · ${member.clientPhone}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-[var(--color-fg)]">
                      {member.basePaymentStatus
                        ? membershipPaymentStatusLabel(member.basePaymentStatus)
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium text-[var(--color-fg)]"
                      data-testid={`check-in-status-${member.membershipId}`}
                    >
                      {member.checkInBlocked ? "Blocked" : "Allowed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() =>
                          handleCheckInBlock(
                            member.membershipId,
                            !member.checkInBlocked,
                          )
                        }
                      >
                        {member.checkInBlocked
                          ? "Unblock check-in"
                          : "Block check-in"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => handleOffboard(member.membershipId)}
                      >
                        Offboard
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
