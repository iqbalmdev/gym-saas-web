import { endpoints } from '@/lib/modules/auth/auth-endpoints';
// Deliberate exception to the adapter boundary (ADR-0004): this builds a browser
// redirect target, it does not perform transport. Only the base URL is needed.
// eslint-disable-next-line no-restricted-imports
import { getApiBaseUrl } from '@/lib/api/client';

/** Web callback path Supabase must allowlist (and backend `redirect_to` must match). */
export const GOOGLE_OAUTH_CALLBACK_PATH = '/auth/google/callback';

/**
 * Browser URL for GET /auth/google/start with allowlisted web callback.
 * @see docs/api/client-auth.md
 */
export function buildGoogleOAuthStartUrl(webOrigin: string): string {
    const origin = webOrigin.replace(/\/$/, '');
    const redirectTo = `${origin}${GOOGLE_OAUTH_CALLBACK_PATH}`;
    const url = new URL(`${getApiBaseUrl().replace(/\/$/, '')}${endpoints.googleStart}`);
    url.searchParams.set('redirect_to', redirectTo);
    return url.toString();
}
