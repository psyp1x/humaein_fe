type Claim = { id: number; claim_id: string; status: string; error_type: string; error_explanation: string; recommended_action: string; paid_amount_aed: number }

function fmtAED(n?: number) {
  if (n == null) return '—'
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(n) } catch { return String(n) }
}

export function ResultsTable({ claims }: { claims: Claim[] }) {
  if (!claims?.length) {
    return <div className="text-sm text-muted-foreground">No results yet. Upload claims and run validation.</div>
  }
  return (
    <div className="overflow-auto rounded-md border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-muted text-left">
            <th className="py-2 px-3">Claim</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Error type</th>
            <th className="py-2 px-3">Explanation</th>
            <th className="py-2 px-3">Recommendation</th>
            <th className="py-2 px-3">Paid</th>
          </tr>
        </thead>
        <tbody>
          {claims.map(c => (
            <tr key={c.id} className="border-t">
              <td className="py-2 px-3 whitespace-nowrap font-medium">{c.claim_id}</td>
              <td className="py-2 px-3 whitespace-nowrap">{c.status}</td>
              <td className="py-2 px-3 whitespace-nowrap">{c.error_type}</td>
              <td className="py-2 px-3"><pre className="whitespace-pre-wrap font-sans">{c.error_explanation}</pre></td>
              <td className="py-2 px-3"><pre className="whitespace-pre-wrap font-sans">{c.recommended_action}</pre></td>
              <td className="py-2 px-3 whitespace-nowrap text-right">{fmtAED(c.paid_amount_aed)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
