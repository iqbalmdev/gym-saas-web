import { z } from 'zod';

import type { HttpClient } from '@/lib/api/client';
import { endpoints } from '@/modules/profile/profile-endpoints';
import type {
    ClientProfile,
    ProfileReader,
    ProfileWriter,
    ProgressLog,
    ProgressLogsPage,
} from '@/modules/profile/profile-ports';

const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER']).nullable();

const profileSchema = z.object({
    userId: z.string().min(1),
    heightCm: z.number().nullable(),
    weightKg: z.number().nullable(),
    dob: z.string().nullable(),
    gender: genderSchema,
    medicalNotes: z.string().nullable(),
    bmi: z.number().nullable(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

const progressLogSchema = z.object({
    id: z.string().min(1),
    clientUserId: z.string().min(1),
    logDate: z.string().min(1),
    weightKg: z.number().nullable(),
    bmi: z.number().nullable(),
    notes: z.string().nullable(),
    createdAt: z.string().min(1),
});

const profileEnvelopeSchema = z.object({
    profile: profileSchema,
});

const progressLogEnvelopeSchema = z.object({
    progressLog: progressLogSchema,
});

const progressLogsEnvelopeSchema = z.object({
    progressLogs: z.object({
        items: z.array(progressLogSchema),
        total: z.number(),
        limit: z.number(),
        offset: z.number(),
    }),
});

function pageQuery(input: { limit?: number; offset?: number }): string {
    const params = new URLSearchParams();
    if (input.limit !== undefined) {
        params.set('limit', String(input.limit));
    }
    if (input.offset !== undefined) {
        params.set('offset', String(input.offset));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

function toProfile(raw: z.infer<typeof profileSchema>): ClientProfile {
    return raw;
}

function toLog(raw: z.infer<typeof progressLogSchema>): ProgressLog {
    return raw;
}

function toPage(raw: z.infer<typeof progressLogsEnvelopeSchema>['progressLogs']): ProgressLogsPage {
    return {
        items: raw.items.map(toLog),
        total: raw.total,
        limit: raw.limit,
        offset: raw.offset,
    };
}

export function createProfileAdapter(http: HttpClient): ProfileReader & ProfileWriter {
    return {
        async getMyProfile({ accessToken }) {
            const raw = await http.request<unknown>({
                path: endpoints.meProfile,
                method: 'GET',
                accessToken,
            });
            return { profile: toProfile(profileEnvelopeSchema.parse(raw).profile) };
        },

        async updateMyProfile({ accessToken, body }) {
            const raw = await http.request<unknown>({
                path: endpoints.meProfile,
                method: 'PATCH',
                accessToken,
                body,
            });
            return { profile: toProfile(profileEnvelopeSchema.parse(raw).profile) };
        },

        async listMyProgressLogs({ accessToken, limit, offset }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.meProgressLogs}${pageQuery({ limit, offset })}`,
                method: 'GET',
                accessToken,
            });
            return { progressLogs: toPage(progressLogsEnvelopeSchema.parse(raw).progressLogs) };
        },

        async upsertMyProgressLog({ accessToken, body }) {
            const raw = await http.request<unknown>({
                path: endpoints.meProgressLogs,
                method: 'PUT',
                accessToken,
                body,
            });
            return { progressLog: toLog(progressLogEnvelopeSchema.parse(raw).progressLog) };
        },

        async getStaffClientProfile({ accessToken, gymOrgId, clientUserId }) {
            const raw = await http.request<unknown>({
                path: endpoints.gymOrgClientProfile(gymOrgId, clientUserId),
                method: 'GET',
                accessToken,
            });
            return { profile: toProfile(profileEnvelopeSchema.parse(raw).profile) };
        },

        async listStaffClientProgressLogs({ accessToken, gymOrgId, clientUserId, limit, offset }) {
            const raw = await http.request<unknown>({
                path: `${endpoints.gymOrgClientProgressLogs(gymOrgId, clientUserId)}${pageQuery({ limit, offset })}`,
                method: 'GET',
                accessToken,
            });
            return { progressLogs: toPage(progressLogsEnvelopeSchema.parse(raw).progressLogs) };
        },
    };
}
