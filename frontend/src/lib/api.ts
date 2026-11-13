// Where the Spring Boot API lives. Override it with a .env file (VITE_API_URL=...).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Spring Boot sends errors as "Problem Details" JSON (RFC 9457).
type ProblemDetail = {
  title?: string
  detail?: string
  errors?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// ---------- One function that every API call goes through ----------

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  })

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as ProblemDetail | null
    throw new ApiError(
      problem?.detail ?? `Request failed with status ${response.status}`,
      response.status,
      problem?.errors ?? {},
    )
  }

  if (response.status === 204) return undefined as T // 204 = success with no body
  return (await response.json()) as T
}

// ---------- The API, one function per endpoint ----------

export const api = {
  ping: () => request<{ status: string }>('/api/ping'),
}