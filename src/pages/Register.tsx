import { useState } from 'react'
import { api } from '../shared/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'

export function Register({ onRegister, onGoLogin }: { onRegister: (token: string) => void; onGoLogin?: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await api.post('/auth/register', { username, password })
      onRegister(res.data.access_token)
    } catch (err) {
      setError('Registration failed')
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button className="w-full" type="submit">Register</Button>
              {onGoLogin && <Button variant="secondary" type="button" onClick={onGoLogin}>Back to login</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
