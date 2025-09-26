type Claim = { id: number; claim_id: string; status: string; error_type: string; error_explanation: string; recommended_action: string; paid_amount_aed: number }

export function ResultsTable({ claims }: { claims: Claim[] }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h3>Results</h3>
      <table border={1} cellPadding={4}>
        <thead>
          <tr>
            <th>Claim</th>
            <th>Status</th>
            <th>Error type</th>
            <th>Explanation</th>
            <th>Recommendation</th>
            <th>Paid</th>
          </tr>
        </thead>
        <tbody>
          {claims.map(c => (
            <tr key={c.id}>
              <td>{c.claim_id}</td>
              <td>{c.status}</td>
              <td>{c.error_type}</td>
              <td><pre style={{ whiteSpace: 'pre-wrap' }}>{c.error_explanation}</pre></td>
              <td><pre style={{ whiteSpace: 'pre-wrap' }}>{c.recommended_action}</pre></td>
              <td>{c.paid_amount_aed ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
