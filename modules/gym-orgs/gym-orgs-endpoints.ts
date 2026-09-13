/** Named Gym Backend paths for gym orgs — adapters only. */
export const endpoints = {
    gymOrgs: '/gym-orgs',
    meGym: '/me/gym',
    gymOrgTrainers: (gymOrgId: string) => `/gym-orgs/${encodeURIComponent(gymOrgId)}/trainers`,
} as const;
