import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'

type Metric = { error_category: string; claim_count: number; paid_amount_aed: number }

function toWaterfall(values: { name: string; value: number }[]) {
  let cum = 0
  return values.map((d, i) => {
    const start = cum
    cum += d.value
    const end = cum
    const delta = d.value
    return {
      name: d.name,
      base: Math.min(start, end),
      delta: Math.abs(delta),
    }
  })
}

export function ErrorWaterfalls({ metrics }: { metrics: Metric[] }) {
  const order = metrics.map(m => m.error_category || 'No error')
  const counts = toWaterfall(metrics.map(m => ({ name: m.error_category || 'No error', value: m.claim_count || 0 })))
  const paid = toWaterfall(metrics.map(m => ({ name: m.error_category || 'No error', value: m.paid_amount_aed || 0 })))
  return (
    <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
      <div>
        <h3>Claim counts by error category (waterfall)</h3>
        <BarChart width={520} height={300} data={counts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="base" stackId="a" fill="#eee" />
          <Bar dataKey="delta" stackId="a" fill="#8884d8" />
        </BarChart>
      </div>
      <div>
        <h3>Paid amount by error category (waterfall)</h3>
        <BarChart width={520} height={300} data={paid}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="base" stackId="b" fill="#eee" />
          <Bar dataKey="delta" stackId="b" fill="#82ca9d" />
        </BarChart>
      </div>
    </div>
  )
}
