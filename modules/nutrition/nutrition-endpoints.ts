/** Named Gym Backend paths for M9 Nutrition — adapters only. */
export const endpoints = {
    foodsSearch: '/foods/search',
    meCalorieLogs: '/me/calorie-logs',
    meCalorieLogItem: (itemId: string) => `/me/calorie-logs/items/${encodeURIComponent(itemId)}`,
    gymOrgClientCalorieLogs: (gymOrgId: string, clientUserId: string) =>
        `/gym-orgs/${encodeURIComponent(gymOrgId)}/clients/${encodeURIComponent(clientUserId)}/calorie-logs`,
} as const;
