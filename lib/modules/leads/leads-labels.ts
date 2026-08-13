import type { LeadStatus } from '@/lib/modules/leads/leads-ports';

export function leadStatusLabel(status: LeadStatus): string {
    switch (status) {
        case 'NEW':
            return 'New';
        case 'CONTACTED':
            return 'Contacted';
        case 'TRIAL':
            return 'Trial';
        case 'CONVERTED':
            return 'Converted';
        case 'LOST':
            return 'Lost';
    }
}

export const LEAD_STATUSES: ReadonlyArray<LeadStatus> = ['NEW', 'CONTACTED', 'TRIAL', 'CONVERTED', 'LOST'];

export function formatLeadFollowUp(date: string | null): string {
    if (!date) {
        return 'No follow-up';
    }
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
        return date;
    }
    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeZone: 'Asia/Kolkata',
    }).format(parsed);
}
