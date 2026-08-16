'use client';

import { useState, type SubmitEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatLeadFollowUp, LEAD_STATUSES, leadStatusLabel } from '@/modules/leads/leads-labels';
import {
    useChangeLeadStatus,
    useCreateLead,
    useDeleteLead,
    useLeadsPage,
    useUpdateLead,
} from '@/modules/leads/leads-hooks';
import type { Lead, LeadStatus } from '@/modules/leads/leads-ports';

type LeadsAdminPanelProps = {
    gymName: string;
    statusFilter: LeadStatus | 'ALL';
};

export function LeadsAdminPanel({ gymName, statusFilter }: LeadsAdminPanelProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [source, setSource] = useState('walk-in');
    const [interest, setInterest] = useState('trial');
    const [notes, setNotes] = useState('');

    // Hydrated from the page's server prefetch — same query key (ADR-0011).
    const { data, error: listQueryError } = useLeadsPage(statusFilter);
    const leads = data?.leads ?? [];
    const dueFollowUps = data?.dueFollowUps ?? [];

    const createLead = useCreateLead();

    // Status change and delete are owned *here*, not in LeadEditRow: an
    // optimistic delete unmounts the row, which would destroy a mutation hook
    // living inside it — taking the failure message with it. Held in the
    // parent, the mutation (and its error) outlives the row's remount.
    const changeStatus = useChangeLeadStatus(statusFilter);
    const deleteLead = useDeleteLead(statusFilter);
    const rowActionsPending = changeStatus.isPending || deleteLead.isPending;
    const rowActionError = changeStatus.error?.message ?? deleteLead.error?.message ?? null;

    const isPending = createLead.isPending;
    const listError = listQueryError?.message ?? null;
    const error = createLead.error?.message ?? null;
    const warning = createLead.data?.ok ? (createLead.data.warning ?? null) : null;

    function handleCreate(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        createLead.mutate(
            { name, phone, source, interest, notes: notes || undefined },
            {
                onSuccess: () => {
                    setName('');
                    setPhone('');
                    setNotes('');
                },
            },
        );
    }

    return (
        <div className="space-y-6">
            {dueFollowUps.length > 0 ? (
                <section
                    className="rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
                    aria-labelledby="due-followups-heading"
                >
                    <h2 id="due-followups-heading" className="text-sm font-medium text-(--color-fg)">
                        Due follow-ups ({dueFollowUps.length})
                    </h2>
                    <ul className="mt-3 space-y-2">
                        {dueFollowUps.map((lead) => (
                            <li key={`due-${lead.id}`} className="text-sm text-(--color-fg-muted)">
                                <span className="font-medium text-(--color-fg)">{lead.name}</span> · {lead.phone} ·{' '}
                                {formatLeadFollowUp(lead.followUpDate)}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            <form
                onSubmit={handleCreate}
                className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            >
                <h2 className="text-sm font-medium text-(--color-fg)">Capture lead</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="lead-name" className="block text-sm font-medium text-(--color-fg)">
                            Name
                        </label>
                        <Input
                            id="lead-name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1"
                            placeholder="Walk-in Prospect"
                        />
                    </div>
                    <div>
                        <label htmlFor="lead-phone" className="block text-sm font-medium text-(--color-fg)">
                            Phone
                        </label>
                        <Input
                            id="lead-phone"
                            required
                            inputMode="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1"
                            placeholder="9876543210"
                        />
                    </div>
                    <div>
                        <label htmlFor="lead-source" className="block text-sm font-medium text-(--color-fg)">
                            Source
                        </label>
                        <Input
                            id="lead-source"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="mt-1"
                            placeholder="walk-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="lead-interest" className="block text-sm font-medium text-(--color-fg)">
                            Interest
                        </label>
                        <Input
                            id="lead-interest"
                            value={interest}
                            onChange={(e) => setInterest(e.target.value)}
                            className="mt-1"
                            placeholder="trial"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="lead-notes" className="block text-sm font-medium text-(--color-fg)">
                            Notes <span className="font-normal text-(--color-fg-muted)">(optional)</span>
                        </label>
                        <Textarea
                            id="lead-notes"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1"
                            placeholder="Asked about evening batch"
                        />
                    </div>
                </div>
                {error ? (
                    <p role="alert" className="text-sm text-(--color-danger)">
                        {error}
                    </p>
                ) : null}
                {warning ? (
                    <p className="text-sm text-(--color-fg-muted)" role="status">
                        {warning}
                    </p>
                ) : null}
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving…' : 'Create lead'}
                </Button>
            </form>

            <div className="rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-panel)">
                <div className="border-b border-(--color-border)/80 px-5 py-3">
                    <h2 className="text-sm font-medium text-(--color-fg)">Pipeline for {gymName}</h2>
                </div>
                {rowActionError ? (
                    <p role="alert" className="px-5 pt-4 text-sm text-(--color-danger)">
                        {rowActionError}
                    </p>
                ) : null}
                {listError ? (
                    <p role="alert" className="px-5 py-4 text-sm text-(--color-danger)">
                        {listError}
                    </p>
                ) : leads.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-(--color-fg-muted)">
                        No leads yet. Capture a walk-in with the form above.
                    </p>
                ) : (
                    <ul className="divide-y divide-(--color-border)/70">
                        {leads.map((lead) => (
                            <LeadEditRow
                                key={lead.id}
                                lead={lead}
                                onStatusChange={(leadId, status) => changeStatus.mutate({ leadId, status })}
                                onDelete={(leadId) => deleteLead.mutate({ leadId })}
                                rowActionsPending={rowActionsPending}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

type LeadEditRowProps = {
    lead: Lead;
    /** Owned by the parent — see the note on `rowActionError` there. */
    onStatusChange: (leadId: string, status: LeadStatus) => void;
    onDelete: (leadId: string) => void;
    rowActionsPending: boolean;
};

function LeadEditRow({ lead, onStatusChange, onDelete, rowActionsPending }: LeadEditRowProps) {
    const [name, setName] = useState(lead.name);
    const [phone, setPhone] = useState(lead.phone);
    const [source, setSource] = useState(lead.source ?? '');
    const [interest, setInterest] = useState(lead.interest ?? '');
    const [notes, setNotes] = useState(lead.notes ?? '');
    const [followUpDate, setFollowUpDate] = useState(lead.followUpDate ?? '');

    // Save is safe to own here: it never removes the row, so this component
    // (and its mutation state) stays mounted through the round trip.
    const updateLead = useUpdateLead();
    const isPending = rowActionsPending || updateLead.isPending;
    const error = updateLead.error?.message ?? null;
    const warning = updateLead.data?.ok ? (updateLead.data.warning ?? null) : null;

    function handleSave(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        updateLead.mutate({
            leadId: lead.id,
            name,
            phone,
            source,
            interest,
            notes,
            followUpDate: followUpDate || null,
        });
    }

    function handleStatus(status: LeadStatus) {
        onStatusChange(lead.id, status);
    }

    function handleDelete() {
        onDelete(lead.id);
    }

    return (
        <li className="space-y-4 px-5 py-4">
            <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor={`edit-name-${lead.id}`}
                            className="block text-xs font-medium text-(--color-fg-muted)"
                        >
                            Name
                        </label>
                        <Input
                            id={`edit-name-${lead.id}`}
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isPending}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor={`edit-phone-${lead.id}`}
                            className="block text-xs font-medium text-(--color-fg-muted)"
                        >
                            Phone
                        </label>
                        <Input
                            id={`edit-phone-${lead.id}`}
                            required
                            inputMode="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isPending}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor={`edit-source-${lead.id}`}
                            className="block text-xs font-medium text-(--color-fg-muted)"
                        >
                            Source
                        </label>
                        <Input
                            id={`edit-source-${lead.id}`}
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            disabled={isPending}
                            placeholder="walk-in"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor={`edit-interest-${lead.id}`}
                            className="block text-xs font-medium text-(--color-fg-muted)"
                        >
                            Interest
                        </label>
                        <Input
                            id={`edit-interest-${lead.id}`}
                            value={interest}
                            onChange={(e) => setInterest(e.target.value)}
                            disabled={isPending}
                            placeholder="trial"
                            className="mt-1"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label
                            htmlFor={`edit-notes-${lead.id}`}
                            className="block text-xs font-medium text-(--color-fg-muted)"
                        >
                            Notes
                        </label>
                        <Textarea
                            id={`edit-notes-${lead.id}`}
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isPending}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor={`edit-followup-${lead.id}`}
                            className="block text-xs font-medium text-(--color-fg-muted)"
                        >
                            Follow-up date
                        </label>
                        <Input
                            id={`edit-followup-${lead.id}`}
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            disabled={isPending}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor={`edit-status-${lead.id}`}
                            className="block text-xs font-medium text-(--color-fg-muted)"
                        >
                            Status
                        </label>
                        <Select
                            value={lead.status}
                            disabled={isPending}
                            onValueChange={(value) => handleStatus(value as LeadStatus)}
                        >
                            <SelectTrigger id={`edit-status-${lead.id}`} className="mt-1 w-full">
                                <SelectValue>{(value: LeadStatus) => leadStatusLabel(value)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {LEAD_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {leadStatusLabel(status)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error ? (
                    <p role="alert" className="text-sm text-(--color-danger)">
                        {error}
                    </p>
                ) : null}
                {warning ? (
                    <p className="text-sm text-(--color-fg-muted)" role="status">
                        {warning}
                    </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button type="button" variant="ghost" disabled={isPending} onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </form>
        </li>
    );
}
