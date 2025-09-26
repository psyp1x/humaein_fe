import { useEffect, useState } from 'react'
import { Login } from './Login'
import { Dashboard } from './Dashboard'
import { Toaster } from '../components/ui/toaster'
import { Register } from './Register'

export function App() {
  const [token, setToken] = useState<string | null>(null)
  const [tenant, setTenant] = useState('demo')
  const [route, setRoute] = useState<'login'|'register'|'app'>('login')

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
      <Dashboard token={token} tenant={tenant} setTenant={setTenant} />
      <Toaster />
    </>
  )
}
