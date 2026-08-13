"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  formatLeadFollowUp,
  LEAD_STATUSES,
  leadStatusLabel,
} from "@/lib/modules/leads/leads-labels";
import {
  changeLeadStatusAction,
  createLeadAction,
  deleteLeadAction,
  updateLeadAction,
} from "@/lib/modules/leads/leads-actions";
import type { Lead, LeadStatus } from "@/lib/modules/leads/leads-ports";

type LeadsAdminPanelProps = {
  gymName: string;
  leads: Lead[];
  dueFollowUps: Lead[];
  statusFilter: LeadStatus | "ALL";
  listError: string | null;
};

const fieldClass =
  "mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]";

export function LeadsAdminPanel({
  gymName,
  leads,
  dueFollowUps,
  statusFilter,
  listError,
}: LeadsAdminPanelProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("walk-in");
  const [interest, setInterest] = useState("trial");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await createLeadAction({
        name,
        phone,
        source,
        interest,
        notes: notes || undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.warning) {
        setWarning(result.warning);
      }
      setName("");
      setPhone("");
      setNotes("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
          {gymName}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-fg)] md:text-3xl">
          Leads
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-fg-muted)]">
          Capture walk-ins and follow-ups. Example: name “Walk-in Prospect”,
          phone “9876543210”, source “walk-in”, interest “trial”. Edit any lead
          below via{" "}
          <code className="text-xs">PATCH …/leads/:leadId</code>.
        </p>
      </div>

      {dueFollowUps.length > 0 ? (
        <section
          className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-panel)]"
          aria-labelledby="due-followups-heading"
        >
          <h2
            id="due-followups-heading"
            className="text-sm font-medium text-[var(--color-fg)]"
          >
            Due follow-ups ({dueFollowUps.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {dueFollowUps.map((lead) => (
              <li
                key={`due-${lead.id}`}
                className="text-sm text-[var(--color-fg-muted)]"
              >
                <span className="font-medium text-[var(--color-fg)]">
                  {lead.name}
                </span>{" "}
                · {lead.phone} · {formatLeadFollowUp(lead.followUpDate)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["ALL", "All"],
            ...LEAD_STATUSES.map(
              (status) => [status, leadStatusLabel(status)] as const,
            ),
          ] as const
        ).map(([value, label]) => {
          const href =
            value === "ALL" ? "/admin/crm" : `/admin/crm?status=${value}`;
          const active = statusFilter === value;
          return (
            <a
              key={value}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                  : "border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-panel)] space-y-4"
      >
        <h2 className="text-sm font-medium text-[var(--color-fg)]">
          Capture lead
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="lead-name"
              className="block text-sm font-medium text-[var(--color-fg)]"
            >
              Name
            </label>
            <input
              id="lead-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="Walk-in Prospect"
            />
          </div>
          <div>
            <label
              htmlFor="lead-phone"
              className="block text-sm font-medium text-[var(--color-fg)]"
            >
              Phone
            </label>
            <input
              id="lead-phone"
              required
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
              placeholder="9876543210"
            />
          </div>
          <div>
            <label
              htmlFor="lead-source"
              className="block text-sm font-medium text-[var(--color-fg)]"
            >
              Source
            </label>
            <input
              id="lead-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={fieldClass}
              placeholder="walk-in"
            />
          </div>
          <div>
            <label
              htmlFor="lead-interest"
              className="block text-sm font-medium text-[var(--color-fg)]"
            >
              Interest
            </label>
            <input
              id="lead-interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className={fieldClass}
              placeholder="trial"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="lead-notes"
              className="block text-sm font-medium text-[var(--color-fg)]"
            >
              Notes{" "}
              <span className="font-normal text-[var(--color-fg-muted)]">
                (optional)
              </span>
            </label>
            <textarea
              id="lead-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={fieldClass}
              placeholder="Asked about evening batch"
            />
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}
        {warning ? (
          <p className="text-sm text-[var(--color-fg-muted)]" role="status">
            {warning}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Create lead"}
        </Button>
      </form>

      <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)]">
        <div className="border-b border-[var(--color-border)]/80 px-5 py-3">
          <h2 className="text-sm font-medium text-[var(--color-fg)]">
            Pipeline for {gymName}
          </h2>
        </div>
        {listError ? (
          <p role="alert" className="px-5 py-4 text-sm text-[var(--color-danger)]">
            {listError}
          </p>
        ) : leads.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[var(--color-fg-muted)]">
            No leads yet. Capture a walk-in with the form above.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]/70">
            {leads.map((lead) => (
              <LeadEditRow
                key={lead.id}
                lead={lead}
                statusFilter={statusFilter}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function LeadEditRow({
  lead,
  statusFilter,
}: {
  lead: Lead;
  statusFilter: LeadStatus | "ALL";
}) {
  const router = useRouter();
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [source, setSource] = useState(lead.source ?? "");
  const [interest, setInterest] = useState(lead.interest ?? "");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [followUpDate, setFollowUpDate] = useState(lead.followUpDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await updateLeadAction({
        leadId: lead.id,
        name,
        phone,
        source,
        interest,
        notes,
        followUpDate: followUpDate || null,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.warning) {
        setWarning(result.warning);
      }
      router.refresh();
    });
  }

  function handleStatus(status: LeadStatus) {
    setError(null);
    startTransition(async () => {
      const result = await changeLeadStatusAction({
        leadId: lead.id,
        status,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (statusFilter !== "ALL" && statusFilter !== status) {
        router.push("/admin/crm");
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteLeadAction({ leadId: lead.id });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="space-y-4 px-5 py-4">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`edit-name-${lead.id}`}
              className="block text-xs font-medium text-[var(--color-fg-muted)]"
            >
              Name
            </label>
            <input
              id={`edit-name-${lead.id}`}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor={`edit-phone-${lead.id}`}
              className="block text-xs font-medium text-[var(--color-fg-muted)]"
            >
              Phone
            </label>
            <input
              id={`edit-phone-${lead.id}`}
              required
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor={`edit-source-${lead.id}`}
              className="block text-xs font-medium text-[var(--color-fg-muted)]"
            >
              Source
            </label>
            <input
              id={`edit-source-${lead.id}`}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={isPending}
              className={fieldClass}
              placeholder="walk-in"
            />
          </div>
          <div>
            <label
              htmlFor={`edit-interest-${lead.id}`}
              className="block text-xs font-medium text-[var(--color-fg-muted)]"
            >
              Interest
            </label>
            <input
              id={`edit-interest-${lead.id}`}
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              disabled={isPending}
              className={fieldClass}
              placeholder="trial"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor={`edit-notes-${lead.id}`}
              className="block text-xs font-medium text-[var(--color-fg-muted)]"
            >
              Notes
            </label>
            <textarea
              id={`edit-notes-${lead.id}`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor={`edit-followup-${lead.id}`}
              className="block text-xs font-medium text-[var(--color-fg-muted)]"
            >
              Follow-up date
            </label>
            <input
              id={`edit-followup-${lead.id}`}
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              disabled={isPending}
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor={`edit-status-${lead.id}`}
              className="block text-xs font-medium text-[var(--color-fg-muted)]"
            >
              Status
            </label>
            <select
              id={`edit-status-${lead.id}`}
              value={lead.status}
              disabled={isPending}
              onChange={(e) => handleStatus(e.target.value as LeadStatus)}
              className={fieldClass}
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {leadStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}
        {warning ? (
          <p className="text-sm text-[var(--color-fg-muted)]" role="status">
            {warning}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </form>
    </li>
  );
}
