import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const serviceSlides = [
  { icon: 'bi-globe2', title: 'Web Applications', desc: 'We build fast, modern web apps tailored to your idea — from simple tools to full platforms.' },
  { icon: 'bi-cart3', title: 'E-commerce Systems', desc: 'Online stores with payments, inventory and order management built for Kenyan businesses.' },
  { icon: 'bi-speedometer2', title: 'Business Dashboards', desc: 'Custom dashboards and admin panels that give you real-time control over your operations.' },
  { icon: 'bi-phone', title: 'Mobile-First Websites', desc: 'Responsive websites that look and work great on every device, from phones to desktops.' },
  { icon: 'bi-link-45deg', title: 'API & Integrations', desc: 'Connect your systems — M-Pesa, SMS, third-party APIs — into one seamless workflow.' },
  { icon: 'bi-palette', title: 'UI/UX Design', desc: 'Clean, intuitive interfaces designed to delight users and keep them coming back.' },
]

const steps = [
  { n: '01', icon: 'bi-chat-dots', title: 'Tell us your idea', desc: 'Share what you want to build. We listen, ask the right questions and understand your goals.' },
  { n: '02', icon: 'bi-gear-wide-connected', title: 'We build it', desc: 'Our team designs and develops your web app with clean code, great UI and regular updates.' },
  { n: '03', icon: 'bi-rocket-takeoff', title: 'You launch', desc: 'We deploy, test and hand over a fully working product. We stay on for support after launch.' },
]

const testimonials = [
  { name: 'Sarah M.', role: 'Startup Founder, Nairobi', text: 'Wilmark built our entire platform in 5 weeks. The quality was outstanding and they kept us updated every step of the way.', stars: 5, color: 'border-leaf' },
  { name: 'James K.', role: 'Business Owner, Mombasa', text: 'Our e-commerce store went live faster than expected. Sales doubled in the first month. Highly recommend Wilmark Technologies.', stars: 5, color: 'border-sky' },
  { name: 'Amina O.', role: 'Community Manager', text: 'The developer community Wilmark built has connected hundreds of Kenyan developers. It is exactly what we needed.', stars: 5, color: 'border-sun' },
]

const techStack = [
  { name: 'React', icon: 'bi-atom', color: 'bg-sky/10 text-sky' },
  { name: 'Django', icon: 'bi-filetype-py', color: 'bg-leaf/10 text-leaf' },
  { name: 'Tailwind', icon: 'bi-palette', color: 'bg-sky/10 text-sky' },
  { name: 'PostgreSQL', icon: 'bi-database', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'M-Pesa API', icon: 'bi-credit-card-2-front', color: 'bg-leaf/10 text-leaf' },
  { name: 'Docker', icon: 'bi-box-seam', color: 'bg-sky/10 text-sky' },
  { name: 'REST APIs', icon: 'bi-hdd-network', color: 'bg-sun/20 text-ink' },
  { name: 'Vite', icon: 'bi-lightning-charge', color: 'bg-purple-50 text-purple-600' },
  { name: 'Python', icon: 'bi-filetype-py', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'JavaScript', icon: 'bi-filetype-js', color: 'bg-yellow-50 text-yellow-700' },
  { name: 'HTML', icon: 'bi-filetype-html', color: 'bg-orange-50 text-orange-600' },
  { name: 'CSS', icon: 'bi-filetype-css', color: 'bg-blue-50 text-blue-600' },
  { name: 'Bootstrap', icon: 'bi-bootstrap', color: 'bg-purple-50 text-purple-600' },
  { name: 'SQL', icon: 'bi-database-fill', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Git', icon: 'bi-git', color: 'bg-orange-50 text-orange-700' },
  { name: 'Node.js', icon: 'bi-terminal', color: 'bg-leaf/10 text-leaf' },
]

const newsCats = ['All', 'Local News', 'Startups', 'AI & Innovation', 'Course', 'Blog']

const trending = [
  '"The best way to predict the future is to invent it." — Alan Kay',
  '"Move fast and build things that matter." — Wilmark Community',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Any sufficiently advanced technology is indistinguishable from magic." — Arthur C. Clarke',
  '"Code is like humour. When you have to explain it, it is bad." — Cory House',
  '"The function of good software is to make the complex appear simple." — Grady Booch',
]

const contributors = [
  { icon: 'bi-globe-americas', name: 'Wangari Maathai', role: '"It\'s the little things citizens do. That\'s what will make the difference."', color: 'bg-leaf' },
  { icon: 'bi-lightbulb', name: 'Steve Jobs', role: '"The people who are crazy enough to think they can change the world are the ones who do."', color: 'bg-sky' },
  { icon: 'bi-rocket-takeoff', name: 'Elon Musk', role: '"When something is important enough, you do it even if the odds are not in your favour."', color: 'bg-flag' },
  { icon: 'bi-hand-thumbs-up', name: 'Barack Obama', role: '"The change we seek has always required great struggle and great sacrifice."', color: 'bg-sun' },
]

// Animated counter hook
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(false)
  useEffect(() => {
    if (!target || ref.current) return
    ref.current = true
    const step = Math.ceil(target / (duration / 16))
    let cur = 0
    const id = setInterval(() => {
      cur = Math.min(cur + step, target)
      setCount(cur)
      if (cur >= target) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [target])
  return count
}

function StatCard({ label, value, color, suffix = '+' }) {
  const count = useCounter(value)
  return (
    <div className="card text-center shadow-md">
      <p className={`font-display text-4xl font-bold ${color}`}>{count}{value ? suffix : '—'}</p>
      <p className="text-slate-600 text-sm mt-1">{label}</p>
    </div>
  )
}

export default function Landing() {
  const [slide, setSlide] = useState(0)
  const [cat, setCat] = useState('All')
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [notice, setNotice] = useState('')
  const [contactDone, setContactDone] = useState(false)
  const [contactErr, setContactErr] = useState('')

  useEffect(() => {
    api('/posts/').then((d) => setPosts(d.results || d)).catch(() => {})
    api('/stats/').then(setStats).catch(() => {})
    const id = setInterval(() => setSlide(s => (s + 1) % serviceSlides.length), 3000)
    return () => clearInterval(id)
  }, [])

  const allPosts = posts.map(p => ({
    category: 'Post',
    catColor: 'bg-leaf text-white',
    title: p.title,
    text: p.body,
    tags: [],
    author: (p.author && p.author !== 'wilmark_public') ? p.author : 'Community'
  }))
  const filtered = cat === 'All' ? allPosts : allPosts.filter(p => p.category === cat)

  const handleContact = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const name = fd.get('name') || ''
    const email = fd.get('email') || ''
    const phone = fd.get('phone') || ''
    const message = fd.get('message') || ''
    const text = `*New enquiry from ${name}*\nEmail: ${email}\nPhone: ${phone}\n\n${message}`
    window.open(`https://wa.me/254705387545?text=${encodeURIComponent(text)}`, '_blank')
    setContactDone(true)
  }

  return (
    <main className="w-full overflow-x-hidden">

      {/* Hero */}
      <section className="w-full bg-ink text-white hero">
        <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight">
          We build web apps.<br />
          <span className="bg-gradient-to-r from-leaf via-sky to-sun bg-clip-text text-transparent">
            You grow your business.
          </span>
        </h1>
        <p className="mt-4 text-slate-300 text-base md:text-lg max-w-2xl">
          Wilmark Technologies builds custom web applications for businesses, startups and communities across Kenya. We also bring developers together to learn, share and grow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/services" className="btn bg-leaf text-white hover:bg-emerald-600">See what we build</Link>
          <Link to="/join" className="btn border-2 border-white/30 text-white hover:bg-white/10">Join Us</Link>
        </div>
      </section>

      {/* Home video */}
      <section className="section border-t border-b border-slate-200 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 40%, #0B8A5F 0%, transparent 50%), radial-gradient(circle at 75% 60%, #3A86FF 0%, transparent 50%)' }} />
        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white ring-1 ring-white/40 relative group animate-gradient-border">
            <div className="relative bg-slate-900 h-[560px] sm:h-[640px] lg:h-[720px] w-full overflow-hidden">
              <video className="w-full h-full object-contain bg-slate-900" controls autoPlay loop muted playsInline poster="/vedios/devfest.mp4">
                <source src="/vedios/devfest.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between text-white pointer-events-none">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf px-3 py-1 text-xs font-bold text-white mb-2 animate-bounce">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> Live now
                  </span>
                  <h3 className="font-display font-bold text-xl mb-1">Watch the latest Wilmark session</h3>
                  <p className="text-white/80 text-sm">Developer community meetup — live from Nairobi.</p>
                </div>
                <div className="flex gap-3 mb-4 pointer-events-auto">
                  <a href="/community" className="btn-leaf px-6 py-2.5 text-base font-bold shadow-lg hover:bg-emerald-600 animate-bounce">Join Community</a>
                  <a href="/services" className="btn-ghost px-6 py-2.5 text-base font-bold">See Services</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats from backend */}
      {stats && (
        <section className="w-full px-4 sm:px-8 lg:px-16 -mt-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Community Members" value={stats.members} color="text-leaf" />
            <StatCard label="Skills Shared" value={stats.skills} color="text-sky" />
            <StatCard label="Posts Published" value={stats.posts} color="text-sun" />
            <StatCard label="Events Hosted" value={stats.events} color="text-flag" />
          </div>
        </section>
      )}

      {/* Service slider */}
      <section className="w-full bg-slate-50 border-b border-slate-200 mt-8">
        <div className="section py-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">What we build</span>
            <span className="text-xs text-slate-400">{slide + 1} / {serviceSlides.length}</span>
          </div>
          <div className="card border-l-4 border-leaf">
            <div className="text-3xl text-leaf mb-3"><i className={`bi ${serviceSlides[slide].icon}`}></i></div>
            <h3 className="font-display font-bold text-xl">{serviceSlides[slide].title}</h3>
            <p className="mt-2 text-slate-600 text-sm">{serviceSlides[slide].desc}</p>
          </div>
          <div className="flex gap-2 mt-4">
            {serviceSlides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-leaf' : 'w-2 bg-slate-300'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Sub nav pills */}
      <div className="w-full border-b border-slate-200 bg-white overflow-x-auto">
        <div className="flex gap-1 px-4 sm:px-8 lg:px-16 py-2 min-w-max">
          {[['#build', 'What we build'], ['#how', 'How it works'], ['/news', 'News'], ['/services', 'Services'], ['/community', 'Community'], ['#contact', 'Contact']].map(([href, label]) => (
            href.startsWith('#')
              ? <a key={label} href={href} className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap transition-colors">{label}</a>
              : <Link key={label} to={href} className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap transition-colors">{label}</Link>
          ))}
        </div>
      </div>

      {/* What we build carousel */}
      <section id="build" className="section bg-white">
        <span className="inline-block rounded-full bg-leaf/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-leaf mb-3">What we build</span>
        <h2>Need a web app that actually works?</h2>
        <p className="mt-3 text-slate-600">From simple websites to complex platforms — we turn your idea into a working, scalable web application with clean code and great design.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/services" className="btn bg-leaf text-white hover:bg-emerald-600">See our services</Link>
          <Link to="/join" className="btn border-2 border-leaf text-leaf hover:bg-leaf hover:text-white">Join Us</Link>
        </div>
        <div className="mt-10 relative overflow-hidden">
          <style>{`
            @keyframes wm-slide-in { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
            .wm-in { animation: wm-slide-in 0.5s ease forwards; }
          `}</style>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {serviceSlides.map((item, i) => {
              const pos = (i - slide + serviceSlides.length) % serviceSlides.length
              if (pos >= 3) return null
              const colors = ['border-leaf', 'border-sky', 'border-sun']
              const bgs = ['bg-leaf/10', 'bg-sky/10', 'bg-sun/20']
              const tcs = ['text-leaf', 'text-sky', 'text-ink']
              return (
                <div key={item.title} className={`card border-t-4 ${colors[pos]} wm-in`} style={{ animationDelay: `${pos * 0.1}s` }}>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${bgs[pos]} text-2xl mb-4`}><i className={`bi ${item.icon}`}></i></div>
                  <h3 className={`font-display font-bold ${tcs[pos]}`}>{item.title}</h3>
                  <p className="mt-2 text-slate-600 text-sm">{item.desc}</p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {serviceSlides.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === slide ? 'w-8 bg-leaf' : 'w-2 bg-slate-300 hover:bg-slate-400'}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSlide(s => (s - 1 + serviceSlides.length) % serviceSlides.length)}
                className="h-9 w-9 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-leaf hover:text-leaf transition-colors text-slate-500" aria-label="Previous slide"><i className="bi bi-arrow-left"></i></button>
              <button onClick={() => setSlide(s => (s + 1) % serviceSlides.length)}
                className="h-9 w-9 rounded-full bg-leaf text-white flex items-center justify-center hover:bg-emerald-600 transition-colors" aria-label="Next slide"><i className="bi bi-arrow-right"></i></button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section bg-gradient-to-br from-ink via-slate-800 to-slate-900 text-white">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-300 mb-3">How it works</span>
          <h2 className="text-white">From idea to live product in 3 steps</h2>
          <p className="mt-3 text-slate-300">Simple, transparent and fast. Here is how we work with you.</p>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {steps.map(({ n, icon, title, desc }, i) => (
            <div key={n} className="relative">
              {i < steps.length - 1 && <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-leaf to-sky z-0" style={{ width: 'calc(100% - 2rem)', left: '60%' }} />}
              <div className="card bg-white/5 border border-white/10 text-white relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-leaf to-sky text-white font-bold text-sm">{n}</span>
                  <span className="text-xl text-leaf"><i className={`bi ${icon}`}></i></span>
                </div>
                <h3 className="text-white font-display font-bold">{title}</h3>
                <p className="mt-2 text-slate-300 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <a href="#contact" className="btn bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90">Start your project</a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-slate-50">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-sun/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink mb-3">Testimonials</span>
          <h2>What our clients say</h2>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {testimonials.map(({ name, role, text, stars, color }) => (
            <div key={name} className={`card border-l-4 ${color} hover:shadow-md transition-shadow`}>
              <div className="flex gap-1 mb-3">
                {Array(stars).fill(0).map((_, i) => <i key={i} className="bi bi-star-fill text-sun text-sm"></i>)}
              </div>
              <p className="text-slate-700 text-sm italic leading-relaxed">"{text}"</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="section bg-white">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-sky/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky mb-3">Tech stack</span>
          <h2>Built with modern, proven technology</h2>
          <p className="mt-3 text-slate-600">We use tools that scale, perform and are trusted by teams worldwide.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {techStack.map(({ name, icon, color }) => (
            <div key={name} className={`rounded-2xl p-4 text-center ${color} hover:scale-105 transition-transform cursor-default`}>
              <div className="text-3xl mb-2"><i className={`bi ${icon}`}></i></div>
              <p className="text-xs font-bold">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* News and posts */}
      <section className="section bg-slate-50">
        <span className="inline-block rounded-full bg-flag/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-flag mb-3">News and posts</span>
        <h2>Latest from Wilmark and beyond</h2>
        <div className="flex flex-wrap gap-2 mt-5 mb-6">
          {newsCats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`chip cursor-pointer transition-colors ${cat === c ? 'bg-ink text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-5 grid-cols-1 sm:grid-cols-2">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-12 card">
                <div className="text-4xl text-slate-400 mb-3"><i className="bi bi-file-earmark-text"></i></div>
                <h3 className="text-slate-600">No posts yet</h3>
                <p className="text-slate-500 text-sm mt-1">Be the first to share something on the <Link to="/news" className="text-leaf underline">News page</Link>.</p>
              </div>
            ) : filtered.map((post, i) => (
              <article key={i} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`chip text-xs ${post.catColor}`}>{post.category}</span>
                </div>
                <h3>{post.title}</h3>
                <p className="mt-2 text-slate-600 text-sm line-clamp-2">{post.text}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{post.author}</span>
                  <div className="flex gap-3">
                    <Link to="/news" className="text-sm font-semibold text-leaf hover:underline">Read</Link>
                    <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' - Wilmark Technologies')}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-sky hover:underline">WhatsApp</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="space-y-6">
            <div className="card">
              <h3 className="font-display font-bold mb-4">Quotes to build by</h3>
              <ul className="space-y-4">
                {trending.map((t, i) => (
                  <li key={i} className="text-sm text-slate-700 border-b border-slate-100 pb-3 last:border-0 italic leading-relaxed">{t}</li>
                ))}
              </ul>
            </div>
            <div className="card bg-gradient-to-br from-ink to-slate-800 text-white">
              <h3 className="font-display font-bold mb-4">Inspiration wall</h3>
              {contributors.map(({ icon, name, role, color }) => (
                <div key={name} className="mb-5 last:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${color} text-white text-base`}><i className={`bi ${icon}`}></i></span>
                    <p className="font-semibold text-sm">{name}</p>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">{role}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="section bg-white">
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          <div>
            <span className="inline-block rounded-full bg-leaf/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-leaf mb-3">Get in touch</span>
            <h2>Ready to build something great?</h2>
            <p className="mt-3 text-slate-600">Tell us about your project and we will get back to you within 24 hours with a plan and a quote.</p>
            <div className="mt-8 space-y-4">
              {[['bi-envelope', 'Email', 'kipkirui9067@outlook.com', 'mailto:kipkirui9067@outlook.com'], ['bi-whatsapp', 'Phone / WhatsApp', '0705 387 545', 'https://wa.me/254705387545'], ['bi-geo-alt', 'Location', 'Nairobi, Kenya', null]].map(([icon, label, val, href]) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="h-10 w-10 rounded-full bg-leaf/10 text-leaf flex items-center justify-center text-lg shrink-0"><i className={`bi ${icon}`}></i></span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
                    {href ? <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-leaf hover:underline">{val}</a> : <p className="font-semibold text-slate-800">{val}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card shadow-lg">
            {contactDone ? (
              <div className="text-center py-10">
                <div className="text-5xl text-leaf mb-4"><i className="bi bi-check-circle-fill"></i></div>
                <h3>Message sent!</h3>
                <p className="text-slate-600 mt-2">We will get back to you within 24 hours.</p>
                <button className="btn bg-leaf text-white hover:bg-emerald-600 mt-6" onClick={() => setContactDone(false)}>Send another</button>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                <h3 className="font-display font-bold text-xl mb-2">Send us a message</h3>
                {contactErr && <p className="text-flag text-sm">{contactErr}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Your name</label>
                    <input name="name" className="field" placeholder="John Kamau" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Email</label>
                    <input name="email" type="email" className="field" placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone (optional)</label>
                  <input name="phone" className="field" placeholder="0799 770 321" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tell us about your project</label>
                  <textarea name="message" className="field" rows="4" placeholder="I want to build a web app that..." required />
                </div>
                <button className="btn bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 w-full py-3">Send message</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Weekly digest */}
      <section className="section bg-ink text-white">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-300 mb-3">Weekly digest</span>
            <h2 className="text-white">Get the best of Wilmark Technologies in your inbox.</h2>
            <p className="mt-3 text-slate-300">Weekly updates on new web apps, community events, tutorials and developer opportunities across Kenya.</p>
          </div>
          <div>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setNotice('Thanks! You are subscribed.') }}>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Name</label>
                <input className="field bg-white/10 border-white/20 text-white placeholder:text-slate-400" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Email</label>
                <input type="email" className="field bg-white/10 border-white/20 text-white placeholder:text-slate-400" placeholder="you@example.com" required />
              </div>
              <button className="btn bg-leaf text-white hover:bg-emerald-600 w-full">Subscribe</button>
              {notice && <p className="text-leaf text-sm font-semibold">{notice}</p>}
            </form>
          </div>
        </div>
      </section>

    </main>
  )
}

