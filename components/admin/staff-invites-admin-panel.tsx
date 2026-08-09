"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  formatInviteExpiry,
  staffInviteRoleLabel,
  staffInviteStatusLabel,
} from "@/lib/display/staff-invite-labels";
import {
  createStaffInviteAction,
  revokeStaffInviteAction,
} from "@/lib/features/staff-invites/actions";
import type {
  StaffInvite,
  StaffInviteTargetRole,
} from "@/lib/ports/staff-invites";

type StaffInvitesAdminPanelProps = {
  gymName: string;
  invites: StaffInvite[];
  listError: string | null;
};

export function StaffInvitesAdminPanel({
  gymName,
  invites,
  listError,
}: StaffInvitesAdminPanelProps) {
  const router = useRouter();
  const [staffCode, setStaffCode] = useState("");
  const [targetRole, setTargetRole] =
    useState<StaffInviteTargetRole>("TRAINER");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createStaffInviteAction({ staffCode, targetRole });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setStaffCode("");
      router.refresh();
    });
  }

  function handleRevoke(inviteId: string) {
    setError(null);
    startTransition(async () => {
      const result = await revokeStaffInviteAction({ inviteId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="space-y-4" aria-labelledby="staff-invites-heading">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
          Gym organization
        </p>
        <h2
          id="staff-invites-heading"
          className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-fg)]"
        >
          {gymName}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Invite Staff to this gym with their staff code. Trainers are
          unlimited; Admins are capped by the API.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-panel)] space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="invitee-staff-code"
              className="block text-sm font-medium text-[var(--color-fg)]"
            >
              Staff code
            </label>
            <input
              id="invitee-staff-code"
              name="staffCode"
              required
              value={staffCode}
              onChange={(event) => setStaffCode(event.target.value)}
              className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
              placeholder="STF-XXXX"
              autoComplete="off"
            />
          </div>
          <div>
            <label
              htmlFor="invite-target-role"
              className="block text-sm font-medium text-[var(--color-fg)]"
            >
              Role
            </label>
            <select
              id="invite-target-role"
              name="targetRole"
              value={targetRole}
              onChange={(event) =>
                setTargetRole(event.target.value as StaffInviteTargetRole)
              }
              className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="TRAINER">Trainer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending…" : "Send invite"}
        </Button>
      </form>

      <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)]">
        <div className="border-b border-[var(--color-border)]/80 px-5 py-3">
          <h3 className="text-sm font-medium text-[var(--color-fg)]">
            Invites for {gymName}
          </h3>
        </div>
        {listError ? (
          <p role="alert" className="px-5 py-4 text-sm text-[var(--color-danger)]">
            {listError}
          </p>
        ) : invites.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[var(--color-fg-muted)]">
            No staff invites yet. Enter a staff code above to invite a Trainer
            or Admin.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]/70">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-[var(--color-fg)]">
                    {gymName}
                  </p>
                  <p className="text-sm text-[var(--color-fg-muted)]">
                    {staffInviteRoleLabel(invite.targetRole)}
                    <span className="mx-2">·</span>
                    {staffInviteStatusLabel(invite.status)}
                  </p>
                  <p className="text-xs text-[var(--color-fg-muted)]">
                    Expires {formatInviteExpiry(invite.expiresAt)}
                  </p>
                </div>
                {invite.status === "PENDING" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 text-xs"
                    disabled={isPending}
                    onClick={() => handleRevoke(invite.id)}
                  >
                    Revoke
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
