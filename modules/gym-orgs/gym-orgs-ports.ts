/** GymOrgWriter / reader ports for M2. */
export type GymOrgSummary = {
    id: string;
    name: string;
    timezone: string;
    isOwner: boolean;
};

export type CreateGymOrgInput = {
    name: string;
    address?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    logoUrl?: string | null;
    timezone?: string;
};

export type GymOrgDetail = GymOrgSummary & {
    ownerUserId?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type GymOrgsReader = {
    list: (input: { accessToken: string }) => Promise<{ gymOrgs: GymOrgSummary[] }>;
};

export type GymOrgsWriter = {
    create: (input: { accessToken: string; body: CreateGymOrgInput }) => Promise<{ gymOrg: GymOrgDetail }>;
};
