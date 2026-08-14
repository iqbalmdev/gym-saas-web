/** CRM leads — Postman Leads folder. */

export type LeadStatus = 'NEW' | 'CONTACTED' | 'TRIAL' | 'CONVERTED' | 'LOST';

export type Lead = {
    id: string;
    gymOrgId: string;
    name: string;
    phone: string;
    source: string | null;
    interest: string | null;
    notes: string | null;
    status: LeadStatus;
    followUpDate: string | null;
    createdBy: string;
    convertedMembershipInviteId: string | null;
    createdAt: string;
    updatedAt: string;
};

export type LeadPage = {
    items: Lead[];
    total: number;
    limit: number;
    offset: number;
};

export type LeadWarning = {
    code: string;
    message?: string;
};

export type CreateLeadInput = {
    name: string;
    phone: string;
    source?: string | null;
    interest?: string | null;
    notes?: string | null;
};

export type UpdateLeadInput = {
    name?: string;
    phone?: string;
    source?: string | null;
    interest?: string | null;
    notes?: string | null;
    /** YYYY-MM-DD or null to clear; omit to keep. */
    followUpDate?: string | null;
};

export type LeadsReader = {
    list: (input: {
        accessToken: string;
        gymOrgId: string;
        status?: LeadStatus;
        limit?: number;
        offset?: number;
    }) => Promise<{ leads: LeadPage }>;

    listDueFollowUps: (input: {
        accessToken: string;
        gymOrgId: string;
        limit?: number;
        offset?: number;
    }) => Promise<{ leads: LeadPage }>;

    get: (input: { accessToken: string; gymOrgId: string; leadId: string }) => Promise<{ lead: Lead }>;
};

export type LeadsWriter = {
    create: (input: {
        accessToken: string;
        gymOrgId: string;
        body: CreateLeadInput;
    }) => Promise<{ lead: Lead; warnings: LeadWarning[] }>;

    update: (input: {
        accessToken: string;
        gymOrgId: string;
        leadId: string;
        body: UpdateLeadInput;
    }) => Promise<{ lead: Lead; warnings: LeadWarning[] }>;

    changeStatus: (input: {
        accessToken: string;
        gymOrgId: string;
        leadId: string;
        status: LeadStatus;
    }) => Promise<{ lead: Lead }>;

    softDelete: (input: { accessToken: string; gymOrgId: string; leadId: string }) => Promise<void>;
};
