import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, login } from '../api'

export default function Auth() {
  const [mode, setMode] = useState('signup'); const [f, setF] = useState({ username: '', email: '', password: '' })
  const [err, setErr] = useState(''); const nav = useNavigate()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  async function go(e) {
    e.preventDefault(); setErr('')
    try {
      if (mode === 'signup') await api('/register/', { method: 'POST', body: f })
      await login(f.username, f.password); nav(mode === 'signup' ? '/settings' : '/people')
    } catch (x) { setErr(x.message) }
  }
  return (<main className="mx-auto max-w-md px-4 py-16">
    <form onSubmit={go} className="card space-y-4">
      <h1 className="font-display text-2xl font-bold">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
      <label className="block">Username<input className="field mt-1" value={f.username} onChange={set('username')} required /></label>
      {mode === 'signup' && <label className="block">Email<input type="email" required className="field mt-1" value={f.email} onChange={set('email')} /></label>}
      <label className="block">Password<input type="password" className="field mt-1" value={f.password} onChange={set('password')} required /></label>
      {err && <p role="alert" className="text-flag">{err}</p>}
      <button className="btn-leaf w-full">{mode === 'signup' ? 'Create account' : 'Log in'}</button>
      {mode === 'login' && <Link to="/forgot" className="block text-center text-sm text-sky">Forgot your password?</Link>}
      <button type="button" className="w-full text-sm text-sky" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
        {mode === 'signup' ? 'Already a member? Log in' : 'New here? Create an account'}</button>
    </form></main>)
}
