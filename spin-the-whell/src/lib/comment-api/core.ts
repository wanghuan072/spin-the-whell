export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public details?: unknown) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const controller = init?.signal ? null : new AbortController();
  let timeoutId: number | null = null;
  try {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const method = init?.method?.toUpperCase() ?? "GET";
    if (method !== "GET" && method !== "HEAD") {
      headers.set("X-Requested-With", "SpinTheWheel");
    }
    const request = fetch(path, {
      ...init,
      credentials: "same-origin",
      headers,
      signal: init?.signal ?? controller?.signal,
    });
    const timeout = new Promise<Response>((_resolve, reject) => {
      if (!controller) return;
      timeoutId = window.setTimeout(() => {
        controller.abort();
        reject(new ApiError("API_TIMEOUT", "The comment service is taking too long to respond. Please try again.", 503));
      }, 8_000);
    });
    response = await Promise.race([request, timeout]);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "API_UNAVAILABLE",
      error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
        ? "The comment service is taking too long to respond. Please try again."
        : "The comment service is currently unavailable. Please try again.",
      503,
    );
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null) as {
    error?: { code?: string; message?: string; details?: unknown };
  } | null;

  if (!response.ok) {
    throw new ApiError(
      data?.error?.code ?? "REQUEST_FAILED",
      data?.error?.message ?? "The request could not be completed.",
      response.status,
      data?.error?.details,
    );
  }
  return data as T;
}
