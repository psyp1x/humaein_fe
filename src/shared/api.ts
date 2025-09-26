import axios from 'axios'

const base = (import.meta as any)?.env?.VITE_API_BASE || '/api'
export const api = axios.create({ baseURL: base })

export function authHeaders(token: string, tenant: string) {
  return { Authorization: `Bearer ${token}`, 'X-Tenant-ID': tenant }
}
