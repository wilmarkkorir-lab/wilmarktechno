import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, getToken } from '../api'
import { t } from '../i18n.js'

export function Verify() {
  const [p] = useSearchParams(); const [msg, setMsg] = useState('Checking your link...')
  useEffect(() => {
    api(`/verify/?token=${encodeURIComponent(p.get('token') || '')}`)
      .then(() => setMsg('Email verified. You can now post, message and host events.')).catch((e) => setMsg(e.message))
  }, [])
  return <main className="mx-auto max-w-md px-4 py-16"><div className="card space-y-4"><p role="status">{msg}</p><Link className="btn-leaf" to="/feed">Go to the feed</Link></div></main>
}

export function VerifyBanner() {
  const [ok, setOk] = useState(true); const [sent, setSent] = useState(false)
  useEffect(() => { if (getToken()) api('/profiles/me/').then((p) => setOk(p.email_verified)).catch(() => {}) }, [])
  if (ok || !getToken()) return null
  return (<div className="bg-sun px-4 py-2 text-center text-sm font-medium">
    Verify your email to post, message and host events.{' '}
    {sent ? 'Link sent. Check your inbox.' : <button className="underline" onClick={() => api('/resend/', { method: 'POST' }).then(() => setSent(true))}>Resend the link</button>}
  </div>)
}

export function Bell() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const tick = () => api('/notifications/').then((d) => setN(d.unread)).catch(() => {})
    tick(); const id = setInterval(tick, 15000); return () => clearInterval(id)
  }, [])
  return <Link to="/notifications" className="hover:text-sky">{t('alerts')}{n > 0 && <span className="ml-1 rounded-full bg-flag px-2 py-0.5 text-xs text-white">{n}</span>}</Link>
}

export function Notifications() {
  const [d, setD] = useState(null)
  useEffect(() => { api('/notifications/').then((x) => { setD(x); if (x.unread) api('/notifications/read/', { method: 'POST' }) }) }, [])
  return (<main className="mx-auto max-w-2xl px-4 py-10">
    <h1 className="mb-6 font-display text-3xl font-bold">Alerts</h1>
    <ul className="space-y-3">{(d?.items || []).map((n) => (
      <li key={n.id} className={`card flex items-center justify-between gap-3 ${n.read ? '' : 'border-l-4 border-leaf'}`}>
        <span>{n.text}</span>{n.link && <Link className="shrink-0 text-sky underline" to={n.link}>Open</Link>}</li>))}</ul>
    {d?.items.length === 0 && <p className="text-slate-600">Nothing yet. Likes, comments, endorsements and messages show up here.</p>}
  </main>)
}
