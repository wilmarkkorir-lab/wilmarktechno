import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

/* ══════════════════════════════════════════════════════════════════════════
   Services
   ══════════════════════════════════════════════════════════════════════════ */

const serviceItems = [
  { icon: '🌐', title: 'Skill Swaps', gradient: 'from-leaf to-emerald-400', desc: 'Tell us what you know and what you want to learn. We match you with developers who want the reverse swap.' },
  { icon: '👥', title: 'Developer Profiles', gradient: 'from-sky to-blue-400', desc: 'Find people by skill, location or availability. Every profile shows endorsements from peers.' },
  { icon: '📝', title: 'Knowledge Feed', gradient: 'from-sun to-yellow-400', desc: 'Post tutorials, code snippets and questions. Likes and comments earn you points and badges.' },
  { icon: '🚀', title: 'Project Board', gradient: 'from-flag to-rose-400', desc: 'Post an idea, list the skills you need, and find collaborators who fit.' },
  { icon: '📅', title: 'Events & Hackathons', gradient: 'from-purple-500 to-purple-400', desc: 'Host or join meetups in Nairobi and online, with one-click RSVP and event reminders.' },
  { icon: '💬', title: 'Private Messages', gradient: 'from-teal-500 to-teal-400', desc: 'Talk one-to-one to plan a swap, a pairing session or a collaboration.' },
  { icon: '🏆', title: 'Skill Challenges', gradient: 'from-orange-500 to-orange-400', desc: 'Compete in timed challenges, submit your solution and get voted on by the community.' },
  { icon: '💼', title: 'Jobs Board', gradient: 'from-indigo-500 to-indigo-400', desc: 'Post and find developer jobs. Filter by remote, location and skill to find the right fit fast.' },
]

const whyItems = [
  { n: '1', title: 'Community-First', desc: 'Built around real developers in Nairobi and Kenya, not algorithms or ads.' },
  { n: '2', title: 'Mobile-Ready', desc: 'Works on any device so you can connect and learn on the go.' },
  { n: '3', title: 'Free to Join', desc: 'No paywalls for discovery, faster traction and higher visibility for everyone.' },
  { n: '4', title: 'Action-Oriented', desc: 'Every feature is designed to help you ship, learn or connect, not just scroll.' },
]

export function Services() {
  return (
    <>
      {/* Hero */}
      <section className="relative w-full bg-gradient-to-br from-ink via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #0B8A5F, transparent 55%), radial-gradient(circle at 75% 30%, #3A86FF, transparent 55%)' }} />
        <div className="relative hero max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <span className="badge bg-flag/20 text-flag mb-5">What we do</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-balance">Don&apos;t let your skills blend into the noise.</h1>
            <p className="mt-5 text-lg text-slate-300 max-w-2xl mx-auto">From invisible profiles to slow learning, we help Kenyan developers close the gaps that cost opportunities, credibility and growth.</p>
            <Link to="/join" className="btn mt-8 bg-leaf text-white hover:bg-emerald-600 shadow-lg text-base px-8 py-3">
              Join Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why act now */}
      <div className="section">
        <div className="text-center mb-12">
          <span className="badge bg-sun/20 text-ink mb-4">Why act now</span>
          <h2 className="text-balance">If your skills feel optional, you&apos;re leaving opportunities on the table.</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Wilmark Technologies connects you to practical tools built for Kenyan developers, partners and market speed.</p>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger">
          {whyItems.map(({ n, title, desc }) => (
            <div key={n} className="card text-center hover:shadow-md">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-leaf to-sky font-display text-xl font-bold text-white shadow-sm">{n}</div>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <section className="w-full bg-slate-50">
        <div className="section">
          <div className="text-center mb-12">
            <span className="badge bg-sky/10 text-sky mb-4">Our services</span>
            <h2 className="text-balance">Everything you need to grow as a developer</h2>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger">
            {serviceItems.map(({ icon, title, gradient, desc }) => (
              <div key={title} className="card hover:shadow-md group">
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <div className="section">
        <div className="bg-gradient-to-br from-leaf to-sky px-8 py-16 text-white text-center rounded-3xl">
          <h2 className="text-white text-balance">Too many developers still grow alone.</h2>
          <p className="mt-4 text-white/80 max-w-lg mx-auto">Get skill swaps that save time, profiles that get noticed, and a community that opens doors.</p>
          <Link to="/join" className="btn mt-8 bg-white text-leaf hover:bg-slate-50 shadow-lg text-base px-8 py-3">Join Wilmark Technologies</Link>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   News
   ══════════════════════════════════════════════════════════════════════════ */

function PostSkeleton() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex gap-2"><div className="h-5 w-16 skeleton rounded-full" /><div className="h-5 w-20 skeleton" /></div>
      <div className="h-6 w-3/4 skeleton" />
      <div className="space-y-2"><div className="h-4 skeleton" /><div className="h-4 w-2/3 skeleton" /></div>
    </div>
  )
}

export function News() {
  const [posts, setPosts] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = () => api('/posts/').then((d) => setPosts(d.results || d)).catch(() => setPosts([]))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErr('')
    const fd = new FormData(e.target)
    try {
      await api('/public-post/', {
        method: 'POST',
        body: {
          title: fd.get('title'),
          body: [fd.get('summary') || '', fd.get('author') ? `\n\nAuthor: ${fd.get('author')}` : '', fd.get('tags') ? `\nTags: ${fd.get('tags')}` : '', fd.get('link') ? `\nLink: ${fd.get('link')}` : ''].join(''),
        },
      })
      setDone(true)
      load()
    } catch (x) { setErr(x.message) }
    finally { setSubmitting(false) }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-ink via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #0B8A5F, transparent 55%), radial-gradient(circle at 80% 30%, #3A86FF, transparent 55%)' }} />
        <div className="relative hero max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <span className="badge bg-sky/20 text-sky mb-5">News &amp; Posts</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-balance">The stories that matter to developers.</h1>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-lg">Fresh local news, skill updates, events and ecosystem momentum — all in one place.</p>
            <button onClick={() => { setShowForm(true); setDone(false) }} className="btn mt-8 bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 shadow-lg text-base px-8 py-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Share your story
            </button>
          </div>
        </div>
      </section>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="bg-gradient-to-r from-leaf to-sky p-6 rounded-t-3xl flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-display font-bold text-2xl">Share your market update</h2>
                <p className="text-white/80 text-sm mt-1">Post jobs, events, startup news or campaign updates.</p>
              </div>
              <button onClick={() => { setShowForm(false); setDone(false); setErr('') }} className="text-white/80 hover:text-white text-3xl leading-none shrink-0 rounded-lg hover:bg-white/10 w-10 h-10 flex items-center justify-center transition-colors" aria-label="Close">&times;</button>
            </div>
            <div className="p-6">
              {done ? (
                <div className="text-center py-10 animate-fade-in">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="font-display text-2xl font-bold">Post published!</h3>
                  <p className="text-slate-600 mt-2">Your update is now live.</p>
                  <div className="flex gap-3 justify-center mt-6">
                    <button className="btn-leaf" onClick={() => setDone(false)}>Post another</button>
                    <button className="btn-ghost" onClick={() => { setShowForm(false); setDone(false) }}>Close</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                  {err && <div className="sm:col-span-2 rounded-xl bg-flag/10 border border-flag/20 px-4 py-3 text-sm text-flag" role="alert">{err}</div>}
                  <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1.5">Post title</label><input name="title" className="field" placeholder="e.g. JIC JavaScript weekend course" required /></div>
                  <div><label className="block text-sm font-semibold mb-1.5">Author</label><input name="author" className="field" placeholder="Your name or company" /></div>
                  <div><label className="block text-sm font-semibold mb-1.5">Tags</label><input name="tags" className="field" placeholder="JIC, WebDev, Kenya" /></div>
                  <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1.5">Summary</label><textarea name="summary" className="field" rows={4} placeholder="What should readers know?" required /></div>
                  <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1.5">Link (optional)</label><input name="link" className="field" placeholder="https://example.com" /></div>
                  <button className="btn bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 sm:col-span-2 w-full py-3 text-base" disabled={submitting}>
                    {submitting ? 'Publishing...' : 'Publish post'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Posts grid */}
      <div className="section">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts === null ? (
            <><PostSkeleton /><PostSkeleton /><PostSkeleton /><PostSkeleton /><PostSkeleton /><PostSkeleton /></>
          ) : posts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="font-display text-xl font-bold text-slate-700">No posts yet</h3>
              <p className="text-slate-500 text-sm mt-2">Be the first to share something with the community.</p>
            </div>
          ) : (
            posts.map((p) => (
              <article key={p.id} className="card hover:shadow-md group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="chip bg-leaf/10 text-leaf text-xs">Post</span>
                  <span className="text-xs text-slate-400">{(p.author && p.author !== 'wilmark_public') ? p.author : 'Community'}</span>
                </div>
                <h3 className="font-display font-bold group-hover:text-leaf transition-colors">{p.title}</h3>
                <p className="mt-2 text-slate-600 text-sm line-clamp-2">{p.body}</p>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-sm font-semibold text-leaf inline-flex items-center gap-1">
                    Read more
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   About
   ══════════════════════════════════════════════════════════════════════════ */

const whatWeDo = [
  { icon: '🔄', title: 'Skill Swaps', desc: 'Reach developers with concise skill offers and requests, find the exact match you need.' },
  { icon: '📅', title: 'Events & Meetups', desc: 'Tap into hackathons, founder sessions and study groups where real partnerships form.' },
  { icon: '💼', title: 'Jobs & Opportunities', desc: 'Access in-market talent and announce roles where active Kenyan developers are already looking.' },
  { icon: '👥', title: 'Community Reach', desc: 'Build credibility with developers and operators who influence the next tech projects in Kenya.' },
]

const whoWeServe = [
  { icon: '🧑‍💻', title: 'Developers', desc: 'Get visibility for your skills, find collaborators and grow your reputation in the community.' },
  { icon: '🚀', title: 'Startup Founders', desc: 'Highlight your growth story, mobilise support and get fast visibility from collaborators.' },
  { icon: '💼', title: 'Hiring Teams', desc: 'Reach active talent, showcase roles and move faster on recruitment with local credibility.' },
  { icon: '📣', title: 'Community Partners', desc: 'Target the developer audience with high-engagement events and ecosystem updates.' },
]

const focusCards = [
  { title: 'Community-First', desc: "Content shaped around Kenya's real developers, partners and operational priorities.", bg: 'bg-leaf/10', tc: 'text-leaf' },
  { title: 'Mobile-Ready', desc: 'Designed for WhatsApp, X and Instagram so your updates reach active developers quickly.', bg: 'bg-sky/10', tc: 'text-sky' },
  { title: 'Open Access', desc: 'No paywalls for discovery, faster traction and higher visibility for your announcements.', bg: 'bg-sun/20', tc: 'text-ink' },
  { title: 'Action-Oriented', desc: 'Share updates that generate leads, recruit talent, attract partners and make you easier to find.', bg: 'bg-flag/10', tc: 'text-flag' },
]

export function About() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-ink via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 20% 60%, #FFB703, transparent 50%), radial-gradient(circle at 80% 40%, #0B8A5F, transparent 50%)' }} />
        <div className="relative hero max-w-7xl mx-auto text-center">
          <div className="animate-fade-in max-w-3xl mx-auto">
            <span className="badge bg-sun/20 text-sun mb-5">About us</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-balance">A strategic gateway to Kenya&apos;s developer ecosystem.</h1>
            <p className="mt-5 text-lg text-slate-300">Wilmark Technologies connects developers, founders and operators to visibility, talent and market momentum across Kenya.</p>
          </div>
        </div>
      </section>

      <div className="section">
        <div className="text-center mb-12">
          <span className="badge bg-leaf/10 text-leaf mb-4">What we do</span>
          <h2 className="text-balance">Turn exposure into skills, hires and partnerships.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger">
          {whatWeDo.map(({ icon, title, desc }) => (
            <div key={title} className="card text-center hover:shadow-md">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="w-full bg-slate-50">
        <div className="section">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <span className="badge bg-sky/10 text-sky mb-4">Our focus</span>
              <h2 className="text-balance">Built to move your career forward.</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">Every feature is shaped around Kenya&apos;s real tech community — practical, mobile-first and open to everyone.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 stagger">
              {focusCards.map(({ title, desc, bg, tc }) => (
                <div key={title} className={`rounded-2xl p-6 ${bg}`}>
                  <p className={`font-display font-bold ${tc}`}>{title}</p>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section">
        <div className="text-center mb-12">
          <span className="badge bg-flag/10 text-flag mb-4">Who we serve</span>
          <h2 className="text-balance">For developers, founders and partners.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger">
          {whoWeServe.map(({ icon, title, desc }) => (
            <div key={title} className="card hover:shadow-md group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="rounded-3xl bg-gradient-to-br from-sun via-flag to-leaf px-8 py-16 text-white text-center">
          <h2 className="font-display text-3xl font-bold text-balance">Have a story to share?</h2>
          <p className="mt-4 text-white/80 max-w-md mx-auto">Share your tutorial, event recap, startup update or blog post with the Wilmark developer community.</p>
          <Link to="/news" className="btn mt-8 bg-white text-ink hover:bg-slate-50 shadow-lg text-base px-8 py-3">Submit a Post</Link>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Legal pages
   ══════════════════════════════════════════════════════════════════════════ */

function LegalPage({ title, children }) {
  return (
    <div className="section">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">{title}</h1>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}

function LegalSection({ heading, children }) {
  return (
    <section className="card">
      <h2 className="font-display text-xl font-bold mb-3">{heading}</h2>
      <p className="text-slate-600 leading-relaxed">{children}</p>
    </section>
  )
}

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <LegalSection heading="What we collect">Your username, email, a hashed password, the profile details you add, and what you post, send and vote on.</LegalSection>
      <LegalSection heading="Why we collect it">To run the community, verify your email, send you notifications and keep the site safe.</LegalSection>
      <LegalSection heading="Who sees it">Your profile, posts, comments and challenge entries are public. Messages are visible only to you and the person you write to. We do not sell your data.</LegalSection>
      <LegalSection heading="Your choices">You can edit your profile at any time and permanently delete your account and content from your settings page.</LegalSection>
      <LegalSection heading="Contact">Questions about your data? Reach us at kipkirui9067@outlook.com.</LegalSection>
    </LegalPage>
  )
}

export function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <LegalSection heading="Be respectful">No harassment, hate, spam, scams, impersonation or illegal content.</LegalSection>
      <LegalSection heading="Your content">You own what you post. You allow Wilmark Technologies to display it on the site.</LegalSection>
      <LegalSection heading="Moderation">We may hide content and suspend accounts that break these rules. Members can report posts, comments and profiles.</LegalSection>
      <LegalSection heading="No guarantees">The service is provided as is. Skill swaps, jobs and projects are between members — use your own judgement.</LegalSection>
      <LegalSection heading="Contact">Reach us at kipkirui9067@outlook.com.</LegalSection>
    </LegalPage>
  )
}
