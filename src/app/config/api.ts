function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveBaseUrl(envValue: string | undefined, fallback: string): string {
  const value = envValue?.trim() || fallback;
  return trimTrailingSlash(value);
}

export const API_BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL, "/api");
export const AUTH_API_BASE_URL = resolveBaseUrl(import.meta.env.VITE_AUTH_API_BASE_URL, "/auth");
