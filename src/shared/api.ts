import axios from 'axios'

const base = 'https://humaeinbe-production.up.railway.app/api'
export const api = axios.create({ baseURL: base })

export function authHeaders(token: string, tenant: string) {
  return { Authorization: `Bearer ${token}`, 'X-Tenant-ID': tenant }
}
