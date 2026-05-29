// Thin fetch wrapper. Defaults to http://localhost:8000 (FastAPI dev server)
// when NEXT_PUBLIC_API_BASE_URL is not set. Pass "mock" to force mock mode.

const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
const BASE_URL =
  RAW_BASE === "" ? "http://localhost:8000" : RAW_BASE;

export const isMockMode = (): boolean => RAW_BASE.toLowerCase() === "mock";

// Placeholder user until auth is wired. Backend requires a UUID FK to app_user.
export const DEFAULT_USER_ID =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID?.trim() ||
  "00000000-0000-0000-0000-000000000001";

export class ApiError extends Error {
  constructor(public status: number, public body: string, message?: string) {
    super(message ?? `API error ${status}: ${body}`);
  }
}

async function handle<T>(res: Response, path: string): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body, `${res.status} ${path}: ${body}`);
  }
  return (await res.json()) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "content-type": "application/json" },
    cache: "no-store",
  });
  return handle<T>(res, path);
}

export async function apiPost<TBody, TResp>(
  path: string,
  body: TBody,
): Promise<TResp> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return handle<TResp>(res, path);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body, `${res.status} ${path}: ${body}`);
  }
}

export const apiBaseUrl = BASE_URL;
