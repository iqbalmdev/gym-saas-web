/**
 * Query-key factory for M9 Nutrition (ADR-0011).
 *
 * An omitted `date` is its own key, not today's date: the API resolves the
 * default day in Asia/Kolkata, and guessing it here would split the cache
 * whenever the browser sits in another timezone.
 */
export const nutritionKeys = {
    all: ['nutrition'] as const,
    foods: (query: string) => [...nutritionKeys.all, 'foods', query] as const,
    myLog: (date?: string) => [...nutritionKeys.all, 'me', 'log', date ?? 'today'] as const,
    staffClientLog: (clientUserId: string, date?: string) =>
        [...nutritionKeys.all, 'staff', clientUserId, 'log', date ?? 'today'] as const,
};
