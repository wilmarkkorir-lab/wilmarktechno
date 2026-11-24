import { useState, useEffect } from 'react'
import { api } from '../api'

const ADMIN_PASSWORD = 'wilmark2026'

const tabs = ['Dashboard', 'Posts', 'Applications', 'Classes', 'Materials', 'Community']

export default function SecretAdmin() {
  const [auth, setAuth] = useState(sessionStorage.getItem('wm_admin') === '1')
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [tab, setTab] = useState('Dashboard')

  const login = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) { sessionStorage.setItem('wm_admin', '1'); setAuth(true) }
    else setPwErr('Wrong password.')
  }

  if (!auth) return (
    <main className="w-full min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-leaf to-sky text-white font-bold text-2xl mx-auto mb-3">W</span>
          <h2 className="font-display font-bold text-xl">Admin Access</h2>
          <p className="text-slate-500 text-sm mt-1">Wilmark Technologies</p>
        </div>
        <form onSubmit={login} className="space-y-4">
          {pwErr && <p className="text-flag text-sm text-center">{pwErr}</p>}
          <input type="password" className="field" placeholder="Enter admin password" value={pw} onChange={e => setPw(e.target.value)} autoFocus required />
          <button className="btn bg-gradient-to-r from-leaf to-sky text-white w-full py-3">Login</button>
        </form>
      </div>
    </main>
  )

  return (
    <main className="w-full min-h-screen bg-slate-50">
      {/* Admin header */}
      <header className="bg-ink text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-leaf to-sky text-white font-bold text-sm">W</span>
          <span className="font-display font-bold">Wilmark Admin</span>
          <span className="chip bg-leaf/20 text-leaf text-xs">Secret Panel</span>
        </div>
        <button onClick={() => { sessionStorage.removeItem('wm_admin'); setAuth(false) }}
          className="text-slate-400 hover:text-white text-sm transition-colors">Logout</button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-leaf text-leaf' : 'border-transparent text-slate-600 hover:text-leaf'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 sm:px-8 py-8">
        {tab === 'Dashboard' && <Dashboard />}
        {tab === 'Posts' && <PostsAdmin />}
        {tab === 'Applications' && <ApplicationsAdmin />}
        {tab === 'Classes' && <ClassesAdmin />}
        {tab === 'Materials' && <MaterialsAdmin />}
        {tab === 'Community' && <CommunityAdmin />}
      </div>
    </main>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api('/stats/').then(setStats).catch(() => {}) }, [])
  const cards = stats ? [
    { label: 'Members', value: stats.members, color: 'from-leaf to-emerald-400', icon: '👥' },
    { label: 'Skills', value: stats.skills, color: 'from-sky to-blue-400', icon: '🎯' },
    { label: 'Posts', value: stats.posts, color: 'from-sun to-yellow-400', icon: '📝' },
    { label: 'Events', value: stats.events, color: 'from-flag to-rose-400', icon: '📅' },
  ] : []
  return (
    <div>
      <h2 className="font-display font-bold text-2xl mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, color, icon }) => (
          <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white`}>
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-3xl font-bold font-display">{value}</p>
            <p className="text-white/80 text-sm">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="font-display font-bold mb-3">Quick links</h3>
          <div className="flex flex-wrap gap-3">
            <a href="http://localhost:8000/admin" target="_blank" rel="noreferrer" className="btn bg-ink text-white hover:bg-slate-800">Django Admin →</a>
            <a href="http://localhost:8000/api/courses/" target="_blank" rel="noreferrer" className="btn border-2 border-slate-300 text-slate-700 hover:bg-slate-50">API: Classes</a>
            <a href="http://localhost:8000/api/materials/" target="_blank" rel="noreferrer" className="btn border-2 border-slate-300 text-slate-700 hover:bg-slate-50">API: Materials</a>
          </div>
        </div>
        <div className="card bg-emerald-50 border border-emerald-200">
          <h3 className="font-display font-bold mb-2 text-emerald-900">Community Channel</h3>
          <p className="text-sm text-emerald-800 mb-3">Share this WhatsApp channel for updates and class announcements.</p>
          <a href="https://whatsapp.com/channel/0029Vb9Am1m6BIEkmbKQfZ1C" target="_blank" rel="noreferrer" className="btn bg-emerald-600 text-white hover:bg-emerald-700">Open WhatsApp Channel</a>
        </div>
      </div>
    </div>
  )
}

// ── Posts Admin ───────────────────────────────────────────────────────────────
function PostsAdmin() {
  const [posts, setPosts] = useState([])
  const [err, setErr] = useState('')
  const [done, setDone] = useState('')
  const load = () => api('/posts/').then(d => setPosts(d.results || d)).catch(() => {})
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try { await api(`/public-post/${id}/delete/`, { method: 'DELETE' }); setDone('Post deleted.'); load() }
    catch (x) { setErr(x.message) }
  }

  return (
    <div>
      <h2 className="font-display font-bold text-2xl mb-6">Posts ({posts.length})</h2>
      {done && <div className="mb-4 rounded-xl bg-leaf/10 border border-leaf/20 px-4 py-3 text-leaf font-semibold flex justify-between"><span>✅ {done}</span><button onClick={() => setDone('')}>&times;</button></div>}
      {err && <div className="mb-4 rounded-xl bg-flag/10 border border-flag/20 px-4 py-3 text-flag font-semibold flex justify-between"><span>⚠️ {err}</span><button onClick={() => setErr('')}>&times;</button></div>}
      <div className="space-y-3">
        {posts.length === 0 && <p className="text-slate-500">No posts yet.</p>}
        {posts.map(p => (
          <div key={p.id} className="card flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{p.title}</p>
              <p className="text-xs text-slate-500 mt-1">by {p.author} · {new Date(p.created).toLocaleDateString()} · {p.like_count} likes</p>
              <p className="text-sm text-slate-600 mt-1 line-clamp-1">{p.body}</p>
            </div>
            <button onClick={() => del(p.id)} className="shrink-0 text-sm font-semibold text-flag hover:underline">🗑️ Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Applications Admin ────────────────────────────────────────────────────────
function ApplicationsAdmin() {
  const [apps, setApps] = useState([])
  const [view, setView] = useState(null)
  const [err, setErr] = useState('')
  const load = () => api('/applications/').then(d => setApps(Array.isArray(d)?d:(d.results||[]))).catch(x => setErr(x.message))
  useEffect(() => { load() }, [])

  return (
    <div>
      <h2 className="font-display font-bold text-2xl mb-6">Join Applications ({apps.length})</h2>
      {err && <p className="text-flag mb-4">{err}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="pb-3 font-semibold text-slate-600">Name</th>
              <th className="pb-3 font-semibold text-slate-600">Email</th>
              <th className="pb-3 font-semibold text-slate-600">Phone</th>
              <th className="pb-3 font-semibold text-slate-600">Course</th>
              <th className="pb-3 font-semibold text-slate-600">Date</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">No applications yet.</td></tr>}
            {apps.map(a => (
              <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 font-medium">{a.full_name}</td>
                <td className="py-3 text-slate-600">{a.email}</td>
                <td className="py-3">
                  <a href={`https://wa.me/${a.phone.replace(/\D/g,'').replace(/^0/,'254')}`} target="_blank" rel="noreferrer" className="text-leaf hover:underline">📱 {a.phone}</a>
                </td>
                <td className="py-3 text-slate-600">{a.course}</td>
                <td className="py-3 text-slate-400">{new Date(a.created).toLocaleDateString()}</td>
                <td className="py-3"><button onClick={() => setView(a)} className="text-sky font-semibold hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-leaf to-sky p-6 rounded-t-3xl flex justify-between items-start">
              <div>
                <h2 className="text-white font-display font-bold text-xl">{view.full_name}</h2>
                <p className="text-white/80 text-sm">{view.email} · {view.phone}</p>
              </div>
              <button onClick={() => setView(null)} className="text-white/70 hover:text-white text-3xl">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              {[
                ['Preferred name', view.preferred_name],
                ['Country', view.country], ['City', view.city],
                ['Gender', view.gender], ['Age range', view.age_range],
                ['LinkedIn', view.linkedin], ['GitHub', view.github],
                ['Portfolio', view.portfolio], ['Social other', view.social_other],
                ['Course', view.course], ['Cohort', view.cohort],
                ['Start date', view.start_date], ['Completion', view.completion_date],
                ['Heard via', view.heard_via],
                ['Skills learned', Array.isArray(view.skills_learned) ? view.skills_learned.join(', ') : view.skills_learned],
                ['Level before', view.skill_level_before], ['Level now', view.skill_level_after],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} className="flex gap-3">
                  <span className="font-semibold text-slate-500 w-36 shrink-0">{label}</span>
                  <span className="text-slate-800">{val}</span>
                </div>
              ))}
              {view.projects && (
                <div>
                  <p className="font-semibold text-slate-500 mb-1">Projects</p>
                  <p className="text-slate-800 whitespace-pre-wrap bg-slate-50 rounded-xl p-3">{view.projects}</p>
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <a href={`https://wa.me/${view.phone.replace(/\D/g,'').replace(/^0/,'254')}`} target="_blank" rel="noreferrer" className="btn bg-leaf text-white hover:bg-emerald-600">💬 WhatsApp</a>
                <a href={`mailto:${view.email}`} className="btn border-2 border-slate-300 text-slate-700 hover:bg-slate-50">📧 Email</a>
                <button onClick={() => setView(null)} className="btn border-2 border-slate-300 text-slate-700 hover:bg-slate-50 ml-auto">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Classes Admin ─────────────────────────────────────────────────────────────
function ClassesAdmin() {
  const empty = { title:'', description:'', instructor:'', schedule:'', link:'', image_url:'', price:'Free', active:true }
  const [items, setItems] = useState([])
  const [f, setF] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState('')
  const load = () => api('/courses/?all=1').then(d=>setItems(d.results||d)).catch(()=>{})
  useEffect(()=>{load()},[])
  const save = async (e) => {
    e.preventDefault(); setMsg('')
    try {
      if (editId) await api('/courses/'+editId+'/', { method:'PATCH', body:f })
      else await api('/courses/', { method:'POST', body:f })
      setF(empty); setEditId(null); setMsg('Saved.'); load()
    } catch(x){ setMsg(x.message) }
  }
  const del = async (id) => { if(!window.confirm('Delete class?')) return; await api('/courses/'+id+'/',{method:'DELETE'}); load() }
  const edit = (c) => { setEditId(c.id); setF({title:c.title,description:c.description||'',instructor:c.instructor||'',schedule:c.schedule||'',link:c.link||'',image_url:c.image_url||'',price:c.price||'Free',active:c.active}) }
  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-2xl">Online Classes</h2>
      <form onSubmit={save} className="card grid gap-3 sm:grid-cols-2">
        {msg && <p className="sm:col-span-2 text-sm text-leaf font-semibold">{msg}</p>}
        <input className="field" placeholder="Class title *" value={f.title} onChange={e=>setF({...f,title:e.target.value})} required />
        <input className="field" placeholder="Instructor" value={f.instructor} onChange={e=>setF({...f,instructor:e.target.value})} />
        <input className="field" placeholder="Schedule e.g. Sat 7pm EAT" value={f.schedule} onChange={e=>setF({...f,schedule:e.target.value})} />
        <input className="field" placeholder="Price e.g. Free / KSh 2000" value={f.price} onChange={e=>setF({...f,price:e.target.value})} />
        <input className="field sm:col-span-2" placeholder="Class meeting link (Zoom/Google Meet)" value={f.link} onChange={e=>setF({...f,link:e.target.value})} />
        <input className="field sm:col-span-2" placeholder="Image URL (optional)" value={f.image_url} onChange={e=>setF({...f,image_url:e.target.value})} />
        <textarea className="field sm:col-span-2" rows={3} placeholder="Description" value={f.description} onChange={e=>setF({...f,description:e.target.value})} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})}/> Active / visible</label>
        <div className="sm:col-span-2 flex gap-2"><button className="btn-leaf">{editId?'Update class':'Add class'}</button>{editId && <button type="button" className="btn-ghost" onClick={()=>{setEditId(null);setF(empty)}}>Cancel</button>}</div>
      </form>
      <div className="space-y-3">{items.map(c=>(
        <div key={c.id} className="card flex items-start justify-between gap-4">
          <div><p className="font-semibold">{c.title} {!c.active && <span className="text-xs text-flag">(hidden)</span>}</p><p className="text-xs text-slate-500">{c.instructor} · {c.schedule} · {c.price} · {c.registrations_count} registered</p>{c.link && <a href={c.link} target="_blank" rel="noreferrer" className="text-xs text-sky underline break-all">{c.link}</a>}</div>
          <div className="flex gap-2 shrink-0"><button onClick={()=>edit(c)} className="text-sm text-sky font-semibold">Edit</button><button onClick={()=>del(c.id)} className="text-sm text-flag font-semibold">Delete</button></div>
        </div>
      ))}{items.length===0 && <p className="text-slate-500">No classes yet.</p>}</div>
    </div>
  )
}

// ── Materials Admin ───────────────────────────────────────────────────────────
function MaterialsAdmin() {
  const empty = { title:'', description:'', category:'', material_type:'link', url:'', active:true }
  const [items, setItems] = useState([])
  const [f, setF] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState('')
  const load = () => api('/materials/?all=1').then(d=>setItems(d.results||d)).catch(()=>{})
  useEffect(()=>{load()},[])
  const save = async (e) => {
    e.preventDefault(); setMsg('')
    try {
      if (editId) await api('/materials/'+editId+'/', { method:'PATCH', body:f })
      else await api('/materials/', { method:'POST', body:f })
      setF(empty); setEditId(null); setMsg('Saved.'); load()
    } catch(x){ setMsg(x.message) }
  }
  const del = async (id) => { if(!window.confirm('Delete material?')) return; await api('/materials/'+id+'/',{method:'DELETE'}); load() }
  const edit = (m) => { setEditId(m.id); setF({title:m.title,description:m.description||'',category:m.category||'',material_type:m.material_type||'link',url:m.url,active:m.active}) }
  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-2xl">Study Materials</h2>
      <form onSubmit={save} className="card grid gap-3 sm:grid-cols-2">
        {msg && <p className="sm:col-span-2 text-sm text-leaf font-semibold">{msg}</p>}
        <input className="field" placeholder="Title *" value={f.title} onChange={e=>setF({...f,title:e.target.value})} required />
        <input className="field" placeholder="Category e.g. JavaScript" value={f.category} onChange={e=>setF({...f,category:e.target.value})} />
        <select className="field" value={f.material_type} onChange={e=>setF({...f,material_type:e.target.value})}>{['link','video','doc','other'].map(t=><option key={t} value={t}>{t}</option>)}</select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})}/> Active</label>
        <input className="field sm:col-span-2" placeholder="URL (optional)" value={f.url} onChange={e=>setF({...f,url:e.target.value})} />
        <textarea className="field sm:col-span-2" rows={2} placeholder="Description" value={f.description} onChange={e=>setF({...f,description:e.target.value})} />
        <div className="sm:col-span-2 flex gap-2"><button className="btn-leaf">{editId?'Update material':'Add material'}</button>{editId && <button type="button" className="btn-ghost" onClick={()=>{setEditId(null);setF(empty)}}>Cancel</button>}</div>
      </form>
      <div className="space-y-3">{items.map(m=>(
        <div key={m.id} className="card flex items-start justify-between gap-4">
          <div><p className="font-semibold">{m.title} <span className="text-xs text-slate-400">{m.material_type}</span> {!m.active && <span className="text-xs text-flag">(hidden)</span>}</p><p className="text-xs text-slate-500">{m.category}</p><a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-sky underline break-all">{m.url}</a></div>
          <div className="flex gap-2 shrink-0"><button onClick={()=>edit(m)} className="text-sm text-sky font-semibold">Edit</button><button onClick={()=>del(m.id)} className="text-sm text-flag font-semibold">Delete</button></div>
        </div>
      ))}{items.length===0 && <p className="text-slate-500">No materials yet.</p>}</div>
    </div>
  )
}

// ── Community Admin ───────────────────────────────────────────────────────────
function CommunityAdmin() {
  const [events, setEvents] = useState([])
  const [jobs, setJobs] = useState([])
  useEffect(() => {
    api('/events/').then(d => setEvents(d.results || d)).catch(() => {})
    api('/jobs/?remote=0').then(d => setJobs(d.results || d)).catch(() => {})
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display font-bold text-2xl mb-4">Events ({events.length})</h2>
        <div className="space-y-3">
          {events.length === 0 && <p className="text-slate-500">No events yet.</p>}
          {events.map(e => (
            <div key={e.id} className="card">
              <p className="font-semibold">{e.title}</p>
              <p className="text-xs text-slate-500 mt-1">{new Date(e.date).toLocaleString()} · {e.location} · by {e.organizer} · {e.attending} attending</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-display font-bold text-2xl mb-4">Jobs ({jobs.length})</h2>
        <div className="space-y-3">
          {jobs.length === 0 && <p className="text-slate-500">No jobs yet.</p>}
          {jobs.map(j => (
            <div key={j.id} className="card">
              <p className="font-semibold">{j.title}</p>
              <p className="text-xs text-slate-500 mt-1">{j.company} · {j.location} · by {j.poster}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
