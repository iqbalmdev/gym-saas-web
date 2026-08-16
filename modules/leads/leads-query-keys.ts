import type { LeadStatus } from '@/modules/leads/leads-ports';

/**
 * Query-key factory for the CRM pipeline (ADR-0011).
 *
 * `page` covers both the filtered pipeline and the due-follow-ups panel: they
 * come from one round trip and every mutation affects both (converting a lead
 * drops it out of follow-ups), so splitting them would only add a second
 * fetch and a second thing to invalidate.
 */
export const leadsKeys = {
    all: ['leads'] as const,
    page: (statusFilter: LeadStatus | 'ALL') => [...leadsKeys.all, 'page', statusFilter] as const,
};
