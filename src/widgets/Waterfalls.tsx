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
} from 'recharts'

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
}: {
  title: string
  items: { name: string; value: number }[]
  valueFormatter?: (n: number) => string
  barColors?: { up: string; down: string; total: string }
}) {
  const data = buildWaterfall(items)
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
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
              {data.map((d, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={d.isTotal ? barColors.total : d.positive ? barColors.up : barColors.down}
                />
              ))}
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
  const itemsCount = metrics.map(m => ({ name: m.error_category || 'No error', value: m.claim_count || 0 }))
  const itemsPaid = metrics.map(m => ({ name: m.error_category || 'No error', value: m.paid_amount_aed || 0 }))

  if (!metrics?.length) {
    return <div className="text-sm text-muted-foreground">No metrics yet. Run validation to see waterfalls.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
      <WaterfallChart title="Claim counts by error category" items={itemsCount} />
      <WaterfallChart
        title="Paid amount by error category"
        items={itemsPaid}
        valueFormatter={(n) => formatCurrency(n, 'AED')}
        barColors={{ up: '#0ea5e9', down: '#ea580c', total: '#1f2937' }}
      />
    </div>
  )
}
