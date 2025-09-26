import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Cell,
  Line,
  LabelList,
} from 'recharts'
import { useMemo, useState } from 'react'

type Metric = { error_category: string; claim_count: number; paid_amount_aed: number }

type WFDatum = {
  name: string
  base: number
  delta: number
  positive: boolean
  cumAfter: number
  raw: number
  isTotal?: boolean
}

function buildWaterfall(values: { name: string; value: number }[], withTotal = true): WFDatum[] {
  const data: WFDatum[] = []
  let cum = 0
  for (const v of values) {
    const start = cum
    cum += v.value
    const pos = v.value >= 0
    const base = pos ? start : cum
    data.push({
      name: v.name,
      base,
      delta: Math.abs(v.value),
      positive: pos,
      cumAfter: cum,
      raw: v.value,
    })
  }
  if (withTotal) {
    data.push({
      name: 'Total',
      base: 0,
      delta: Math.abs(cum),
      positive: cum >= 0,
      cumAfter: cum,
      raw: cum,
      isTotal: true,
    })
  }
  return data
}

function buildDistributionBridge(values: { name: string; value: number }[], noErrorLabel = 'No error'): WFDatum[] {
  const total = values.reduce((acc, v) => acc + (v.value || 0), 0)
  const noErr = values.find(v => v.name === noErrorLabel)?.value || 0
  const errorCats = values.filter(v => v.name !== noErrorLabel && v.value)
  // If there are no error categories, return a single bar for No error for clearer visual distinction
  if (!errorCats.length) {
    return buildWaterfall([{ name: noErrorLabel, value: total }], false)
  }
  const items: { name: string; value: number }[] = []
  items.push({ name: 'Total', value: total })
  for (const e of errorCats) {
    items.push({ name: e.name, value: -Math.abs(e.value) })
  }
  items.push({ name: noErrorLabel, value: noErr })
  return buildWaterfall(items, false)
}

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}

function formatCurrency(n: number, currency = 'AED') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function WaterfallChart({
  title,
  items,
  valueFormatter = formatNumber,
  barColors = { up: '#16a34a', down: '#dc2626', total: '#1f2937' },
  mode = 'cumulative',
  showPercent = false,
}: {
  title: string
  items: { name: string; value: number }[]
  valueFormatter?: (n: number) => string
  barColors?: { up: string; down: string; total: string }
  mode?: 'cumulative' | 'bridge'
  showPercent?: boolean
}) {
  const data = mode === 'bridge' ? buildDistributionBridge(items) : buildWaterfall(items)
  const total = useMemo(() => items.reduce((a, b) => a + (b.value || 0), 0), [items])
  const dataWithLabels = useMemo(() => {
    if (!showPercent) return data
    return data.map(d => {
      const baseVal = d.isTotal ? d.cumAfter : d.raw
      const pct = total > 0 ? Math.round(((baseVal || 0) / total) * 100) : 0
      return { ...d, pctLabel: pct >= 2 ? `${pct}%` : '' }
    })
  }, [data, total, showPercent])
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={dataWithLabels} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(val: any, key: any, p: any) => {
                if (key === 'cumAfter') return valueFormatter(p.payload.cumAfter)
                if (key === 'delta') return valueFormatter(p.payload.raw)
                return valueFormatter(val)
              }}
              labelFormatter={(label) => String(label)}
            />
            <ReferenceLine y={0} stroke="#9ca3af" />
            {/* Invisible base for offset */}
            <Bar dataKey="base" stackId="wf" fill="transparent" />
            {/* Delta bar with per-datum color */}
            <Bar dataKey="delta" stackId="wf" radius={[2, 2, 0, 0]}>
              {dataWithLabels.map((d, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={d.isTotal ? barColors.total : d.positive ? barColors.up : barColors.down}
                />
              ))}
              {showPercent && (
                <LabelList dataKey="pctLabel" position="top" />
              )}
            </Bar>
            {/* Connector line showing cumulative */}
            <Line type="monotone" dataKey="cumAfter" stroke="#6b7280" dot={{ r: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ErrorWaterfalls({ metrics }: { metrics: Metric[] }) {
  const [mode, setMode] = useState<'cumulative' | 'bridge'>('bridge')
  const itemsCount = useMemo(() => metrics.map(m => ({ name: m.error_category || 'No error', value: m.claim_count || 0 })), [metrics])
  const itemsPaid = useMemo(() => metrics.map(m => ({ name: m.error_category || 'No error', value: m.paid_amount_aed || 0 })), [metrics])

  if (!metrics?.length) {
    return <div className="text-sm text-muted-foreground">No metrics yet. Run validation to see waterfalls.</div>
  }

  return (
    <div className="space-y-3 mt-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Mode:</span>
        <div className="inline-flex rounded border overflow-hidden">
          <button
            className={`px-2 py-1 ${mode === 'bridge' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setMode('bridge')}
          >
            Bridge
          </button>
          <button
            className={`px-2 py-1 border-l ${mode === 'cumulative' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setMode('cumulative')}
          >
            Cumulative
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WaterfallChart title="Claim counts by error category" items={itemsCount} mode={mode} showPercent />
        <WaterfallChart
          title="Paid amount by error category"
          items={itemsPaid}
          valueFormatter={(n) => formatCurrency(n, 'AED')}
          barColors={{ up: '#0ea5e9', down: '#ea580c', total: '#1f2937' }}
          mode={mode}
          showPercent
        />
      </div>
    </div>
  )
}
