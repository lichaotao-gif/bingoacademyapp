const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'
const TOKEN_KEY = 'bingo_admin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export interface ApiResult<T = unknown> {
  code: number
  msg: string
  data?: T
  total?: number
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  const json: ApiResult<T> = await res.json().catch(() => ({ code: 500, msg: '网络异常' }))

  if (json.code === 401) {
    removeToken()
    window.location.href = '/admin/login'
    throw new Error('登录已过期')
  }
  return json
}

export const http = {
  get: <T>(url: string, params?: Record<string, string | number>) => {
    const q = params ? Object.entries(params).reduce((acc, [k, v]) => {
      if (v != null && v !== '') acc[k] = String(v)
      return acc
    }, {} as Record<string, string>) : {}
    const search = Object.keys(q).length ? '?' + new URLSearchParams(q).toString() : ''
    return request<T>(url + search, { method: 'GET' })
  },
  post: <T>(url: string, body?: object) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: object) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
}
