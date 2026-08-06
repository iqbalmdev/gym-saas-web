import { ApiClientError, type ApiErrorBody } from "@/lib/api/errors";

export type HttpClient = {
  request: <T>(input: {
    path: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    accessToken?: string;
  }) => Promise<T>;
};

export type CreateHttpClientOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const error = (value as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const code = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;
  return typeof code === "string" && typeof message === "string";
}

export function createHttpClient(options: CreateHttpClientOptions): HttpClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/$/, "");

  return {
    async request<T>(input: {
      path: string;
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      body?: unknown;
      accessToken?: string;
    }): Promise<T> {
      const { path, method = "GET", body, accessToken } = input;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
      }
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}${path}`, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          cache: "no-store",
        });
      } catch {
        throw new ApiClientError({
          code: "NETWORK_OR_UNKNOWN",
          message: "Could not reach the server. Check your connection and try again.",
          status: 0,
        });
      }

      const text = await response.text();
      let parsed: unknown = null;
      if (text.length > 0) {
        try {
          parsed = JSON.parse(text) as unknown;
        } catch {
          throw new ApiClientError({
            code: "INVALID_JSON",
            message: "The server returned an unexpected response.",
            status: response.status,
          });
        }
      }

      if (!response.ok) {
        if (isApiErrorBody(parsed)) {
          throw new ApiClientError({
            code: parsed.error.code,
            message: parsed.error.message,
            status: response.status,
          });
        }
        throw new ApiClientError({
          code: "HTTP_ERROR",
          message: "Something went wrong. Please try again.",
          status: response.status,
        });
      }

      return parsed as T;
    },
  };
}

export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://gym-backend-lovat-mu.vercel.app"
  );
}
