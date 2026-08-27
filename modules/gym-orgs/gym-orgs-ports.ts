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

/** Live trainer_profiles at a gym — GET /gym-orgs/:gymOrgId/trainers. */
export type GymTrainer = {
    trainerProfileId: string;
    userId: string;
    gymOrgId: string;
    name: string;
    email: string;
    staffCode: string | null;
    bio: string | null;
    isAdmin: boolean;
    createdAt: string | null;
};

export type GymTrainersPage = {
    items: GymTrainer[];
    total: number;
    limit: number;
    offset: number;
};

export type GymOrgsReader = {
    list: (input: { accessToken: string }) => Promise<{ gymOrgs: GymOrgSummary[] }>;
    listTrainers: (input: {
        accessToken: string;
        gymOrgId: string;
        limit?: number;
        offset?: number;
    }) => Promise<{ trainers: GymTrainersPage }>;
};

export type GymOrgsWriter = {
    create: (input: { accessToken: string; body: CreateGymOrgInput }) => Promise<{ gymOrg: GymOrgDetail }>;
};
