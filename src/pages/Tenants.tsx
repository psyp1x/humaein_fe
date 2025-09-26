import { useEffect, useState } from 'react'
import { api, authHeaders } from '../shared/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { showToast } from '../lib/toast'

export function Tenants({ token, tenant, setTenant, goBack }: { token: string; tenant: string; setTenant: (t: string) => void; goBack: () => void }) {
  const [tenants, setTenants] = useState<{name:string, created_at?: string}[]>([])
  const [newTenant, setNewTenant] = useState('')
  const [busy, setBusy] = useState('')

  async function refresh() {
    try {
      const resp = await api.get('/admin/tenants', { headers: { Authorization: `Bearer ${token}` } })
      setTenants(resp.data)
    } catch (e: any) {
      showToast({ title: 'Failed to fetch tenants', description: e?.response?.data?.detail || e?.message, variant: 'destructive' })
    }
  }
  useEffect(() => { refresh() }, [])

  async function create() {
    if (!newTenant.trim()) return
    try {
      setBusy('Creating...')
      await api.post('/admin/tenants', { name: newTenant.trim() }, { headers: { Authorization: `Bearer ${token}` } })
      setNewTenant('')
      await refresh()
      showToast({ title: 'Tenant created', variant: 'success' })
    } catch (e: any) {
      showToast({ title: 'Create failed', description: e?.response?.data?.detail || e?.message, variant: 'destructive' })
    } finally { setBusy('') }
  }

  async function remove(name: string) {
    if (!confirm(`Delete tenant ${name}? This removes claims/metrics/rulesets.`)) return
    try {
      setBusy('Deleting...')
      await api.delete(`/admin/tenants/${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${token}` } })
      if (tenant === name) {
        setTenant('demo')
        localStorage.setItem('rcm_tenant', 'demo')
      }
      await refresh()
      showToast({ title: 'Tenant deleted', variant: 'success' })
    } catch (e: any) {
      showToast({ title: 'Delete failed', description: e?.response?.data?.detail || e?.message, variant: 'destructive' })
    } finally { setBusy('') }
  }

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Tenants</h2>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={goBack}>Back</Button>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Create Tenant</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input className="w-[280px]" value={newTenant} onChange={e => setNewTenant(e.target.value)} placeholder="tenant-id" />
            <Button disabled={!newTenant || !!busy} onClick={create}>Add Tenant</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>All Tenants</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted text-left">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Created</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.name} className="border-t">
                      <td className="py-2 px-3 font-medium">{t.name}</td>
                      <td className="py-2 px-3">{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</td>
                      <td className="py-2 px-3 text-right space-x-2">
                        <Button variant="outline" onClick={() => { setTenant(t.name); localStorage.setItem('rcm_tenant', t.name); goBack() }}>Use</Button>
                        <Button variant="destructive" onClick={() => remove(t.name)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
