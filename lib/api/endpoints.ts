/**
 * Shared Gym Backend paths. Module-specific paths live beside their adapter in
 * `modules/<module>/<module>-endpoints.ts` (ADR-0007/0008) so adding a module
 * does not edit a file every other module also edits.
 */
export const endpoints = {
    health: '/health',
} as const;
