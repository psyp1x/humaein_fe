import { useEffect, useState } from 'react'
import { Login } from './Login'
import { Dashboard } from './Dashboard'
import { Toaster } from '../components/ui/toaster'
import { Register } from './Register'
import { Tenants } from './Tenants'

export function App() {
  const [token, setToken] = useState<string | null>(null)
  const [tenant, setTenant] = useState('demo')
  const [route, setRoute] = useState<'login'|'register'|'app'|'tenants'>('login')

  useEffect(() => {
    const saved = localStorage.getItem('rcm_token')
    if (saved) {
      setToken(saved)
      setRoute('app')
    }
  }, [])

  function onLogin(t: string) {
    localStorage.setItem('rcm_token', t)
    setToken(t)
    setRoute('app')
  }

  if (!token) {
    return (
      <>
        {route === 'login' ? <Login onLogin={onLogin} onGoRegister={() => setRoute('register')} /> : <Register onRegister={onLogin} onGoLogin={() => setRoute('login')} />}
        <Toaster />
      </>
    )
  }
  return (
    <>
      {route === 'app' && <Dashboard token={token} tenant={tenant} setTenant={setTenant} goTenants={() => setRoute('tenants')} />}
      {route === 'tenants' && <Tenants token={token} tenant={tenant} setTenant={(t) => { setTenant(t); localStorage.setItem('rcm_tenant', t); setRoute('app') }} goBack={() => setRoute('app')} />}
      <Toaster />
    </>
  )
}
