import { z } from "zod";

import { endpoints } from "@/lib/modules/auth/auth-endpoints";
import type { HttpClient } from "@/lib/api/client";
import type { AuthGateway, AuthLane } from "@/lib/modules/auth/auth-ports";

export const otpSentSchema = z.object({
  status: z.literal("OTP_SENT"),
  isNewUser: z.boolean(),
});

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});

const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  lane: z.enum(["CLIENT", "STAFF"]),
  roleCode: z.string().min(1),
  staffCode: z.string().nullable(),
  emailVerifiedAt: z.string().nullable(),
});

const verifySchema = z.object({
  session: sessionSchema,
  user: userSchema,
});

const meSchema = z.object({
  user: userSchema,
});

export function createAuthAdapter(http: HttpClient): AuthGateway {
  return {
    async requestOtp({ email }) {
      const raw = await http.request<unknown>({
        path: endpoints.otpRequest,
        method: "POST",
        body: { email },
      });
      return otpSentSchema.parse(raw);
    },

    async verifyOtp({ email, token, lane, name }) {
      const body: {
        email: string;
        token: string;
        lane?: AuthLane;
        name?: string;
      } = { email, token };
      if (lane) {
        body.lane = lane;
      }
      if (name) {
        body.name = name;
      }
      const raw = await http.request<unknown>({
        path: endpoints.otpVerify,
        method: "POST",
        body,
      });
      return verifySchema.parse(raw);
    },

    async completeGoogle({ accessToken, lane, name }) {
      const body: { lane: AuthLane; name?: string } = { lane };
      if (name) {
        body.name = name;
      }
      const raw = await http.request<unknown>({
        path: endpoints.googleComplete,
        method: "POST",
        accessToken,
        body,
      });
      return meSchema.parse(raw);
    },

    async getMe({ accessToken }) {
      const raw = await http.request<unknown>({
        path: endpoints.me,
        method: "GET",
        accessToken,
      });
      return meSchema.parse(raw);
    },
  };
}
