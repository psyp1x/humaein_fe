import { useEffect, useState } from 'react'
import { api, authHeaders } from '../shared/api'
import { ResultsTable } from '../widgets/ResultsTable'
import { ErrorWaterfalls } from '../widgets/Waterfalls'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { showToast } from '../lib/toast'

type Metric = { metric_date: string; error_category: string; claim_count: number; paid_amount_aed: number }
type Claim = { id: number; claim_id: string; status: string; error_type: string; error_explanation: string; recommended_action: string; paid_amount_aed: number }

export function Dashboard({ token, tenant, setTenant }: { token: string; tenant: string; setTenant: (t: string) => void }) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [configYaml, setConfigYaml] = useState<string>('')
  const [configJson, setConfigJson] = useState<any>(null)
  const [busy, setBusy] = useState<string>('')
  const [llm, setLlm] = useState<{enabled:boolean; model:string; has_api_key:boolean} | null>(null)

  async function fetchConfigPreview() {
    try {
      const resp = await api.get('/tenants/config', { headers: authHeaders(token, tenant) })
      setConfigYaml(resp.data?.config_yaml || '')
      setConfigJson(resp.data?.config_json || null)
    } catch {
      setConfigYaml('')
      setConfigJson(null)
    }
  }

  async function refresh() {
    const [m, c] = await Promise.all([
      api.get('/metrics/error-categories', { headers: authHeaders(token, tenant) }),
      api.get('/claims/', { headers: authHeaders(token, tenant) }),
    ])
    setMetrics(m.data)
    setClaims(c.data)
    await fetchConfigPreview()
    try {
      const info = await api.get('/admin/llm', { headers: authHeaders(token, tenant) })
      setLlm(info.data)
    } catch { setLlm(null) }
  }

  useEffect(() => {
    const saved = localStorage.getItem('rcm_tenant')
    if (saved && !tenant) {
      setTenant(saved)
    } else {
      refresh()
    }
  }, [])
  useEffect(() => { refresh() }, [tenant])

  async function runValidation() {
    try {
      setBusy('Running validation...')
      await api.post('/metrics/run-validation', {}, { headers: authHeaders(token, tenant) })
      showToast({ title: 'Validation completed', variant: 'success' })
    } catch (e: any) {
      showToast({ title: 'Validation failed', description: e?.response?.data?.detail || e?.message || 'Unknown error', variant: 'destructive' })
    } finally {
      setBusy('')
      await refresh()
    }
  }

  async function upload(file: File, path: string) {
    const form = new FormData()
    form.append('file', file)
    try {
      setBusy('Uploading...')
      await api.post(path, form, { headers: { ...authHeaders(token, tenant) } })
      showToast({ title: 'Upload succeeded', variant: 'success' })
    } catch (e: any) {
      showToast({ title: 'Upload failed', description: e?.response?.data?.detail || e?.message || 'Unknown error', variant: 'destructive' })
    } finally {
      setBusy('')
      await refresh()
    }
  }

  function extOf(name: string) {
    const i = name.lastIndexOf('.')
    return i >= 0 ? name.slice(i).toLowerCase() : ''
  }

  async function uploadSmart(file: File, kind: 'claims' | 'technical' | 'medical') {
    const ext = extOf(file.name)
    let path = ''
    if (kind === 'claims') {
      path = '/ingest/claims'
    } else if (kind === 'technical') {
      path = ext === '.pdf' ? '/ingest/rules/technical-pdf' : '/ingest/rules/technical'
    } else if (kind === 'medical') {
      path = ext === '.pdf' ? '/ingest/rules/medical-pdf' : '/ingest/rules/medical'
    }
    await upload(file, path)
  }

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between py-3">
          <div className="text-xl font-semibold">RCM</div>
          <div className="flex items-center gap-2">
            {llm && <span className={`text-xs px-2 py-1 rounded-full ${llm.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>LLM: {llm.enabled ? llm.model : 'disabled'}</span>}
            <Button variant="secondary" onClick={() => { localStorage.removeItem('rcm_token'); location.reload() }}>Logout</Button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Input className="w-[220px]" value={tenant} onChange={(e) => { setTenant(e.target.value); localStorage.setItem('rcm_tenant', e.target.value) }} placeholder="Tenant" />
          <Button
            disabled={!tenant || !!busy}
            onClick={async () => {
              try {
                setBusy('Ensuring tenant...')
                await api.post('/tenants/', { name: tenant }, { headers: { Authorization: `Bearer ${token}` } })
                showToast({ title: 'Tenant ensured', variant: 'success' })
              } catch (e: any) {
                showToast({ title: 'Ensure tenant failed', description: e?.response?.data?.detail || e?.message || 'Unknown error', variant: 'destructive' })
              } finally {
                setBusy('')
              }
            }}
          >Ensure Tenant</Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4"><div className="text-sm text-muted-foreground">Total claims</div></CardHeader>
          <CardContent className="pt-0 p-4"><div className="text-2xl font-semibold">{claims.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4"><div className="text-sm text-muted-foreground">Flagged (not validated)</div></CardHeader>
          <CardContent className="pt-0 p-4"><div className="text-2xl font-semibold">{claims.filter(c => c.status !== 'Validated').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4"><div className="text-sm text-muted-foreground">Paid amount (AED)</div></CardHeader>
          <CardContent className="pt-0 p-4"><div className="text-2xl font-semibold">{claims.reduce((s, c) => s + (c.paid_amount_aed || 0), 0).toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Upload Claims</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" type="file" onChange={(e) => e.target.files && uploadSmart(e.target.files[0], 'claims')} />
            <div className="text-xs text-muted-foreground">Accepted: CSV, XLSX</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rules Config Preview</CardTitle>
            <div className="text-sm text-muted-foreground">Merged YAML/PDF-derived config currently applied for this tenant.</div>
          </CardHeader>
          <CardContent>
            {configYaml ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">YAML</div>
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">{configYaml}</pre>
                </div>
                {configJson && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border p-3">
                      <div className="font-medium mb-1">Technical</div>
                      <div>min_paid_for_approval: {configJson?.technical?.min_paid_for_approval ?? '—'}</div>
                      <div>required_fields: {(configJson?.technical?.required_fields || []).join(', ') || '—'}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="font-medium mb-1">Medical</div>
                      <div>disallowed_service_codes: {(configJson?.medical?.disallowed_service_codes || []).join(', ') || '—'}</div>
                      <div>required_dx_for_service: {configJson?.medical?.required_dx_for_service ? Object.keys(configJson.medical.required_dx_for_service).length : 0} mappings</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No rules config uploaded yet.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Technical Rules</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input accept=".yaml,.yml,.csv,.xlsx,application/pdf" type="file" onChange={(e) => e.target.files && uploadSmart(e.target.files[0], 'technical')} />
            <div className="text-xs text-muted-foreground">Accepted: YAML, CSV, XLSX, PDF (auto-routed)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Medical Rules</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input accept=".yaml,.yml,.csv,.xlsx,application/pdf" type="file" onChange={(e) => e.target.files && uploadSmart(e.target.files[0], 'medical')} />
            <div className="text-xs text-muted-foreground">Accepted: YAML, CSV, XLSX, PDF (auto-routed)</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Validation</CardTitle>
            <Button disabled={!!busy} onClick={runValidation}>{busy ? busy : 'Run Validation'}</Button>
          </CardHeader>
          <CardContent>
            <ErrorWaterfalls metrics={metrics} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader><CardTitle>Results</CardTitle></CardHeader>
          <CardContent>
            <ResultsTable claims={claims} />
          </CardContent>
        </Card>
        </div>
        </div>
    </div>
  )
}
