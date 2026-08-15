/** Shared API error envelope from Gym Backend. */
export type ApiErrorBody = {
    error: {
        code: string;
        message: string;
    };
};

export class ApiClientError extends Error {
    readonly code: string;
    readonly status: number;

    constructor(input: { code: string; message: string; status: number }) {
        super(input.message);
        this.name = 'ApiClientError';
        this.code = input.code;
        this.status = input.status;
    }
}

/** Map transport failures to calm UI-facing codes (never dump raw payloads). */
export function toUserFacingErrorCode(error: unknown): string {
    if (error instanceof ApiClientError) {
        return error.code;
    }
    return 'NETWORK_OR_UNKNOWN';
}
