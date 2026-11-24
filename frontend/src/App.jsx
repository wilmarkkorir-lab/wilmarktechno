import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import { CommunityFeed } from './pages/Community.jsx'
import { Services, News, About, Privacy, Terms } from './pages/More.jsx'
import Join from './pages/Join.jsx'
import SecretAdmin from './pages/SecretAdmin.jsx'

const NAV_LINKS = [
  ['/', 'Home'],
  ['/news', 'News'],
  ['/services', 'Services'],
  ['/community', 'Community'],
  ['/about', 'About'],
]

/* ── Scroll to top on route change ──────────────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [pathname])
  return null
}

/* ── Chatbot ────────────────────────────────────────────────────────────── */
const GROQ_KEY = import.meta.env.VITE_GROQ_KEY || ''
const SYSTEM_PROMPT = `You are a helpful assistant for Wilmark Technologies, a Nairobi-based web development company. Keep answers short and friendly.

About Wilmark Technologies:
- We build all types of web applications: e-commerce, dashboards, booking systems, platforms, APIs, mobile-first websites
- We run a developer community in Kenya where developers learn, share skills and collaborate
- We do NOT do hiring or recruitment
- Contact: kipkirui9067@outlook.com | 0705 387 545 | WhatsApp available
- Location: Nairobi, Kenya
- Stack: React, Django, Tailwind CSS, PostgreSQL
- Timeline: most projects take 2-6 weeks
- Pricing: custom quotes based on project scope

Only answer questions related to Wilmark Technologies, web development, or the developer community. If asked something unrelated, politely redirect to what Wilmark does.`

async function askGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 200,
      temperature: 0.7,
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || 'No response.'
}

const SUGGESTIONS = ['What do you build?', 'How much does it cost?', 'How to contact you?', 'Tell me about the community']

function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([{ role: 'assistant', text: 'Hi! I\u2019m the Wilmark assistant. Ask me anything about what we build, our community or how to reach us.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(1)

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    const userMsg = { role: 'user', text: msg }
    setMsgs((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const history = [...msgs, userMsg].map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))
      const reply = await askGroq(history)
      setMsgs((m) => [...m, { role: 'assistant', text: reply }])
    } catch (e) {
      setMsgs((m) => [...m, { role: 'assistant', text: 'Sorry, something went wrong. Try again.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen((o) => !o); setUnread(0) }}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-leaf to-sky text-white shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 transition-all"
        aria-label="Open chat"
      >
        {open
          ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        }
        {!open && unread > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-flag text-white text-xs flex items-center justify-center font-bold">{unread}</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
          <div className="bg-gradient-to-r from-leaf to-sky px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">W</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Wilmark Assistant</p>
              <p className="text-white/80 text-xs flex items-center gap-1.5">{loading ? 'Typing...' : <><i className="bi bi-circle-fill text-emerald-300 text-[8px]" /> Always online</>}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white" aria-label="Close chat">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 bg-slate-50 p-4 space-y-3 max-h-80 overflow-y-auto">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && <div className="h-7 w-7 rounded-full bg-gradient-to-br from-leaf to-sky text-white text-xs flex items-center justify-center font-bold mr-2 shrink-0 mt-1">W</div>}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-leaf to-sky text-white rounded-br-sm' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 rounded-bl-sm'}`}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-leaf to-sky text-white text-xs flex items-center justify-center font-bold mr-2 shrink-0">W</div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm ring-1 ring-slate-200 flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-leaf animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-sky animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-sun animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          <div className="bg-white px-3 py-2 flex gap-2 overflow-x-auto border-t border-slate-100">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="shrink-0 text-xs bg-leaf/10 text-leaf font-medium px-3 py-1.5 rounded-full hover:bg-leaf/20 transition-colors whitespace-nowrap">{s}</button>
            ))}
          </div>
          <div className="bg-white px-3 py-3 border-t border-slate-100 flex gap-2">
            <input
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-leaf transition-colors"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button onClick={() => send()} disabled={loading} className="h-9 w-9 rounded-full bg-gradient-to-r from-leaf to-sky text-white flex items-center justify-center hover:opacity-90 shrink-0 disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Navigation ─────────────────────────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold shrink-0 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-leaf to-emerald-400 text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">W</span>
          <span className="hidden sm:inline text-ink">Wilmark <span className="bg-gradient-to-r from-leaf to-sky bg-clip-text text-transparent">Technologies</span></span>
          <span className="sm:hidden text-ink">Wilmark</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? 'text-leaf bg-leaf/5' : 'text-slate-600 hover:text-ink hover:bg-slate-50'}`}>
              {({ isActive }) => (
                <>{label}{isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-leaf" />}</>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA + Hamburger */}
        <div className="flex items-center gap-3">
          <Link to="/join" className="hidden md:inline-flex btn-leaf text-sm !px-4 !py-2">Join Us</Link>
          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-700" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? '400px' : '0px', opacity: open ? 1 : 0 }}>
        <nav className="border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-leaf/10 text-leaf font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
              {label}
            </NavLink>
          ))}
          <Link to="/join" onClick={() => setOpen(false)} className="block mt-2 btn-leaf w-full text-center text-sm">Join Us</Link>
        </nav>
      </div>
    </header>
  )
}

/* ── 404 page ───────────────────────────────────────────────────────────── */
function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="text-6xl text-leaf/60 mb-4"><i className="bi bi-search"></i></div>
        <h1 className="font-display text-4xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-slate-600 max-w-md mx-auto">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link to="/" className="btn-leaf mt-8">Back to Home</Link>
      </div>
    </div>
  )
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid gap-10 grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 font-display font-bold mb-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-leaf to-emerald-400 text-white text-sm font-bold">W</span>
              Wilmark Technologies
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">Built for Kenyan developers, founders and ecosystem partners. Connecting talent, skills and opportunity.</p>
          </div>
          <div>
            <p className="font-semibold mb-4 text-sm text-slate-300 uppercase tracking-wider">Pages</p>
            <ul className="space-y-3 text-sm">
              {NAV_LINKS.map(([to, label]) => <li key={to}><Link to={to} className="text-slate-400 hover:text-white transition-colors duration-200">{label}</Link></li>)}
              <li><Link to="/join" className="text-slate-400 hover:text-white transition-colors duration-200">Join Us</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-4 text-sm text-slate-300 uppercase tracking-wider">Legal</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors duration-200">Terms of Use</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-4 text-sm text-slate-300 uppercase tracking-wider">Connect</p>
            <div className="space-y-3 text-sm">
              <p className="text-slate-400 flex items-center gap-2"><i className="bi bi-envelope text-leaf"></i> kipkirui9067@outlook.com</p>
              <a href="https://wa.me/254705387545" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-leaf transition-colors flex items-center gap-2"><i className="bi bi-whatsapp text-leaf"></i> 0705 387 545 (WhatsApp)</a>
              <p className="text-slate-400 flex items-center gap-2"><i className="bi bi-geo-alt text-leaf"></i> Nairobi, Kenya</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Wilmark Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Built with <i className="bi bi-heart-fill text-flag text-xs"></i> in Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  )
}

/* ── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Nav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/news" element={<News />} />
          <Route path="/services" element={<Services />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/about" element={<About />} />
          <Route path="/join" element={<Join />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path={import.meta.env.VITE_ADMIN_PATH || '/wt-admin-x7k'} element={<SecretAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}
