import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getToken, csv } from '../api'
import { AccountTools } from './More.jsx'

const tones = ['bg-leaf/10 text-leaf', 'bg-sky/10 text-sky', 'bg-sun/30 text-ink', 'bg-flag/10 text-flag']
const Skills = ({ list = [], counts = {} }) => <div className="flex flex-wrap gap-2">
  {list.map((s, i) => <span key={s} className={`chip ${tones[i % 4]}`}>{s}{counts[s] ? ` · ${counts[s]}` : ''}</span>)}</div>

function Person({ p, onEndorse }) {
  const nav = useNavigate()
  return (<article className="card flex flex-col gap-3">
    <div className="flex items-center gap-3">
      {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-full bg-ink font-display text-xl font-bold text-white">{p.username[0].toUpperCase()}</span>}
      <div><h3 className="font-display text-lg font-bold">{p.username}</h3><p className="text-sm text-slate-600">{p.headline || 'Developer'}{p.location && `, ${p.location}`}</p></div>
      <span className="chip ml-auto bg-sun/30">{p.badge}</span>
    </div>
    {p.bio && <p className="text-slate-700">{p.bio}</p>}
    <div><p className="mb-1 text-sm font-semibold">Can teach</p><Skills list={p.skill_names} counts={p.endorsements} /></div>
    {p.want_names.length > 0 && <div><p className="mb-1 text-sm font-semibold">Wants to learn</p><Skills list={p.want_names} /></div>}
    <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-sm">
      {p.open_to_collab && <span className="font-semibold text-leaf">Open to collaborate</span>}
      {p.github && <a className="text-sky underline" href={p.github} target="_blank" rel="noreferrer">GitHub</a>}
      {p.portfolio && <a className="text-sky underline" href={p.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
      {getToken() && <button className="btn-line ml-auto !px-3 !py-1" onClick={() => nav(`/inbox?to=${p.username}`)}>Message</button>}
      {getToken() && <button className="text-slate-500 underline" onClick={() => api(`/profiles/${p.id}/block/`, { method: 'POST' }).then((r) => alert(r.blocked ? 'Blocked.' : 'Unblocked.'))}>Block</button>}
      {getToken() && <button className="text-slate-500 underline" onClick={() => api(`/profiles/${p.id}/report/`, { method: 'POST', body: { reason: 'Reported by a member' } }).then(() => alert('Thanks. We will review this profile.')).catch((e) => alert(e.message))}>Report</button>}
    </div>
    {getToken() && onEndorse && p.skill_names.length > 0 && <div className="flex flex-wrap gap-2 border-t pt-3 text-sm">
      <span className="font-semibold">Endorse:</span>
      {p.skill_names.map((s) => <button key={s} className="text-leaf underline" onClick={() => onEndorse(p.id, s)}>{s}</button>)}</div>}
  </article>)
}

export function Directory() {
  const [q, setQ] = useState(''); const [skill, setSkill] = useState(''); const [collab, setCollab] = useState(false)
  const [list, setList] = useState([]); const [all, setAll] = useState([]); const [err, setErr] = useState('')
  const load = () => api(`/profiles/?q=${encodeURIComponent(q)}&skill=${skill}&collab=${collab ? 1 : 0}`).then((d) => setList(d.results || d)).catch((e) => setErr(e.message))
  useEffect(() => { api('/skills/').then(setAll) }, [])
  useEffect(() => { load() }, [q, skill, collab])
  const endorse = (id, s) => api(`/profiles/${id}/endorse/`, { method: 'POST', body: { skill: s } }).then(load).catch((e) => setErr(e.message))
  return (<main className="w-full px-6 lg:px-16 py-10">
    <h1 className="font-display text-3xl font-bold">Find developers</h1>
    <div className="mt-5 flex flex-wrap gap-3">
      <input className="field max-w-sm" placeholder="Search by name, headline or skill" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search developers" />
      <select className="field max-w-48" value={skill} onChange={(e) => setSkill(e.target.value)} aria-label="Filter by skill">
        <option value="">All skills</option>{all.map((s) => <option key={s}>{s}</option>)}</select>
      <label className="flex items-center gap-2"><input type="checkbox" checked={collab} onChange={(e) => setCollab(e.target.checked)} />Open to collaborate</label>
    </div>
    {err && <p role="alert" className="mt-3 text-flag">{err}</p>}
    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <Person key={p.id} p={p} onEndorse={endorse} />)}</div>
    {list.length === 0 && <p className="mt-10 text-slate-600">No developers match yet. Try fewer filters, or <Link className="text-sky underline" to="/auth">create your profile</Link>.</p>}
  </main>)
}

export function Matches() {
  const [list, setList] = useState(null)
  useEffect(() => { api('/profiles/matches/').then(setList) }, [])
  return (<main className="w-full px-6 lg:px-16 py-10">
    <h1 className="font-display text-3xl font-bold">Your skill swaps</h1>
    <p className="mt-2 text-slate-600">Developers who know what you want to learn and want to learn what you know.</p>
    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{(list || []).map((p) => <Person key={p.id} p={p} />)}</div>
    {list?.length === 0 && <p className="mt-10 text-slate-600">No matches yet. Add skills you can teach and skills you want to learn in your profile settings.</p>}
  </main>)
}

export function Settings() {
  const [f, setF] = useState(null); const [msg, setMsg] = useState('')
  useEffect(() => { api('/profiles/me/').then((p) => setF({ ...p, skills: p.skill_names.join(', '), wants: p.want_names.join(', ') })) }, [])
  if (!f) return <main className="p-10">Loading your profile...</main>
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  async function save(e) {
    e.preventDefault()
    const { headline, bio, location, github, portfolio, open_to_collab } = f
    await api(`/profiles/${f.id}/`, { method: 'PATCH', body: { headline, bio, location, github, portfolio, open_to_collab, skills: csv(f.skills), wants: csv(f.wants) } })
    setMsg('Profile saved')
  }
  return (<main className="w-full px-6 lg:px-16 py-10"><form onSubmit={save} className="card space-y-4">
    <h1 className="font-display text-2xl font-bold">Your profile</h1>
    {[['headline', 'Headline (for example, Full-stack developer)'], ['location', 'Location'], ['github', 'GitHub URL'], ['portfolio', 'Portfolio URL'],
      ['skills', 'Skills you can teach (comma separated)'], ['wants', 'Skills you want to learn (comma separated)']].map(([k, l]) =>
      <label key={k} className="block">{l}<input className="field mt-1" value={f[k] || ''} onChange={set(k)} /></label>)}
    <label className="block">About you<textarea rows="4" className="field mt-1" value={f.bio || ''} onChange={set('bio')} /></label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={f.open_to_collab} onChange={set('open_to_collab')} />Open to collaborate</label>
    <button className="btn-leaf">Save profile</button>{msg && <p role="status" className="text-leaf">{msg}</p>}
  </form><AccountTools /></main>)
}

