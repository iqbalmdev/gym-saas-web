import type { WearableProvider } from '@/modules/health-sync/health-sync-ports';

const PROVIDER_LABELS: Record<WearableProvider, string> = {
    APPLE_HEALTH: 'Apple Health',
    HEALTH_CONNECT: 'Health Connect',
    SAMSUNG_HEALTH: 'Samsung Health',
};

/** Every provider the API accepts, in the order the member sees them. */
export const WEARABLE_PROVIDERS: WearableProvider[] = ['HEALTH_CONNECT', 'APPLE_HEALTH', 'SAMSUNG_HEALTH'];

export function wearableProviderLabel(provider: WearableProvider): string {
    return PROVIDER_LABELS[provider];
}

export function formatWearableCount(value: number | null, unit: string): string {
    if (value === null) {
        return '—';
    }
    return `${value.toLocaleString('en-IN')} ${unit}`;
}

export function formatWearableWeight(value: number | null): string {
    if (value === null) {
        return '—';
    }
    return `${value} kg`;
}

/**
 * The API returns an ISO instant; members care about the day and time, not the
 * offset. `null` means connected but never synced from the phone yet.
 */
export function formatLastSynced(lastSyncedAt: string | null): string {
    if (!lastSyncedAt) {
        return 'Never synced';
    }
    const parsed = new Date(lastSyncedAt);
    if (Number.isNaN(parsed.getTime())) {
        return 'Never synced';
    }
    return parsed.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
