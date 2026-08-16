/**
 * Same-origin BFF fetch for TanStack `queryFn`s (ADR-0011).
 *
 * The **only** place a browser `fetch` is allowed (see the `no-restricted-globals`
 * exemption in `eslint.config.mjs`). It talks exclusively to this app's own
 * `/api/*` route handlers — never to the Gym Backend. Domain HTTP stays in
 * `modules/<m>/<m>-adapter.ts` behind ports (ADR-0004); the route handler is
 * what bridges the two, so the session cookie is never read by client JS and
 * the tenant is still resolved server-side.
 *
 * Centralised so the error-shape parsing below is written once rather than in
 * each module's hooks.
 */

type ApiErrorEnvelope = { error?: { code?: string; message?: string } };

export class BffError extends Error {
    readonly code: string;
    readonly status: number;

    constructor(input: { code: string; message: string; status: number }) {
        super(input.message);
        this.name = 'BffError';
        this.code = input.code;
        this.status = input.status;
    }
}

/**
 * @param path Same-origin path beginning with `/api/`.
 * @param fallbackMessage Module-specific copy for responses that carry no usable error body.
 */
export async function getJson<T>(path: string, fallbackMessage: string): Promise<T> {
    let response: Response;
    try {
        response = await fetch(path);
    } catch {
        throw new BffError({ code: 'NETWORK_OR_UNKNOWN', message: fallbackMessage, status: 0 });
    }

    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        // Fall through — an unparseable body is only fatal if the status was
        // also bad, which the next block handles.
    }

    if (!response.ok) {
        const envelope = (body ?? {}) as ApiErrorEnvelope;
        throw new BffError({
            code: envelope.error?.code ?? 'NETWORK_OR_UNKNOWN',
            message: envelope.error?.message ?? fallbackMessage,
            status: response.status,
        });
    }

    if (body === null) {
        throw new BffError({ code: 'INVALID_JSON', message: fallbackMessage, status: response.status });
    }
    return body as T;
}
