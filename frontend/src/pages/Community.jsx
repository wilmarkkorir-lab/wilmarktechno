import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

/* ── Auto-Link Text Component ─────────────────────────────────────────── */
function AutoLinkText({ text, className = '' }) {
  if (!text) return null
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = String(text).split(urlRegex)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          const isMeet = part.includes('meet.google.com')
          const isZoom = part.includes('zoom.us')
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sky hover:text-blue-700 underline font-semibold inline-flex items-center gap-1 break-all bg-sky/5 px-2 py-0.5 rounded transition-colors"
            >
              <i className={isMeet ? 'bi bi-camera-video-fill text-purple-600' : isZoom ? 'bi bi-camera-video text-blue-600' : 'bi bi-link-45deg'}></i>
              <span>{part}</span>
            </a>
          )
        }
        return part
      })}
    </span>
  )
}

/* ── Event Time Helpers & Countdown Badge ─────────────────────────────── */
function parseTimeIntoDate(baseDate, timeStr) {
  if (!baseDate || isNaN(baseDate.getTime())) return baseDate
  const d = new Date(baseDate.getTime())
  if (!timeStr) return d
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const meridian = match[3] ? match[3].toUpperCase() : null
    if (meridian === 'PM' && hours < 12) hours += 12
    if (meridian === 'AM' && hours === 12) hours = 0
    d.setHours(hours, minutes, 0, 0)
  }
  return d
}

function getEventStartEnd(item) {
  let start = item.rawDate ? new Date(item.rawDate) : null
  if (start && !isNaN(start.getTime()) && item.start_time) {
    start = parseTimeIntoDate(start, item.start_time)
  }

  let end = null
  if (item.rawEndDate) {
    end = new Date(item.rawEndDate)
    if (!isNaN(end.getTime()) && item.end_time) {
      end = parseTimeIntoDate(end, item.end_time)
    }
  } else if (start && !isNaN(start.getTime())) {
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  }
  return { start, end }
}

function EventTimerBadge({ item }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { start, end } = getEventStartEnd(item)
  if (!start || isNaN(start.getTime())) return null

  const nowMs = now.getTime()
  const startMs = start.getTime()
  const endMs = end ? end.getTime() : startMs + 2 * 60 * 60 * 1000

  // Live Now
  if (nowMs >= startMs && nowMs <= endMs) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm animate-pulse">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
        </span>
        LIVE NOW
      </span>
    )
  }

  // Upcoming
  if (nowMs < startMs) {
    const diff = Math.max(0, startMs - nowMs)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)

    let text = ''
    if (days > 0) text = `${days}d ${hours}h ${minutes}m`
    else if (hours > 0) text = `${hours}h ${minutes}m ${seconds}s`
    else text = `${minutes}m ${seconds}s`

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        <i className="bi bi-stopwatch text-purple-600"></i>
        <span>Starts in {text}</span>
      </span>
    )
  }

  // Past
  return (
    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
      <i className="bi bi-check-circle"></i>
      <span>Completed</span>
    </span>
  )
}

function extractMeetingUrl(item) {
  const combined = `${item.location_details || ''} ${item.location || ''} ${item.sub || ''} ${item.body || ''}`
  const match = combined.match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : null
}

/* ── Skeleton loader ──────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 skeleton rounded-full" />
        <div className="h-5 w-24 skeleton rounded-full" />
      </div>
      <div className="h-6 w-3/4 skeleton" />
      <div className="h-4 w-1/2 skeleton" />
      <div className="space-y-2">
        <div className="h-4 skeleton" />
        <div className="h-4 w-2/3 skeleton" />
      </div>
    </div>
  )
}

/* ── Constants ────────────────────────────────────────────────────────── */
const FILTERS = ['All', 'Updates', 'Events', 'Jobs', 'Classes', 'Materials']
const POST_TYPES = ['Blog', 'Local News', 'Startups', 'AI & Innovation', 'Course', 'Jobs']
const LOCATION_TYPES = ['Venue', 'Online event', 'To be announced']
const CURRENCIES = ['£', 'KSh', '$', '€']

const catColors = {
  Updates: 'bg-sky/10 text-sky border-sky/20',
  Events: 'bg-purple-100 text-purple-700 border-purple-200',
  Jobs: 'bg-sun/20 text-ink border-sun/30',
  Classes: 'bg-leaf/10 text-leaf border-leaf/20',
  Materials: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const results = (d) => d.results || d

/* ── Community Feed ───────────────────────────────────────────────────── */
export function CommunityFeed() {
  const [isJoined, setIsJoined] = useState(() => localStorage.getItem('wilmark_joined') === 'true')
  const [posts, setPosts] = useState(null)
  const [events, setEvents] = useState(null)
  const [jobs, setJobs] = useState(null)
  const [courses, setCourses] = useState(null)
  const [materials, setMaterials] = useState(null)
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState('post') // 'post' or 'event'
  const [editingItem, setEditingItem] = useState(null) // null or { type: 'event'|'post', id, ... }
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [actionNotice, setActionNotice] = useState('')
  const [regClass, setRegClass] = useState(null)
  const [reg, setReg] = useState({ full_name:'', email:'', phone:'' })
  const [regMsg, setRegMsg] = useState('')
  const [regBusy, setRegBusy] = useState(false)

  // Event specific state
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    start_date: '2026-12-22',
    start_time: '10:00 AM',
    end_date: '2026-12-22',
    end_time: '12:00 PM',
    location_type: 'Venue',
    location_details: '',
    currency: '£',
    price: '0.00',
    is_free: true,
    ticket_quantity: 100,
    image_url: '',
    organizer: '',
  })

  // Post form state
  const [postData, setPostData] = useState({
    title: '',
    type: 'Local News',
    author: '',
    tags: '',
    summary: '',
    link: '',
  })

  const [imagePreview, setImagePreview] = useState('')

  const loading = posts === null || events === null || jobs === null || courses === null || materials === null

  const load = () => {
    api('/posts/').then((d) => setPosts(results(d))).catch(() => setPosts([]))
    api('/events/').then((d) => setEvents(results(d))).catch(() => setEvents([]))
    api('/jobs/?remote=0').then((d) => setJobs(results(d))).catch(() => setJobs([]))
    api('/courses/').then((d) => setCourses(results(d))).catch(() => setCourses([]))
    api('/materials/').then((d) => setMaterials(results(d))).catch(() => setMaterials([]))
  }

  useEffect(() => {
    if (isJoined) {
      load()
    }
  }, [isJoined])

  const openForm = (mode, itemToEdit = null) => {
    setFormMode(mode)
    setShowForm(true)
    setSuccess(false)
    setErr('')

    if (itemToEdit) {
      setEditingItem(itemToEdit)
      if (mode === 'event') {
        setEventData({
          title: itemToEdit.title || '',
          description: itemToEdit.body || itemToEdit.description || '',
          start_date: itemToEdit.rawDate ? String(itemToEdit.rawDate).slice(0, 10) : '2026-12-22',
          start_time: itemToEdit.start_time || '10:00 AM',
          end_date: itemToEdit.rawEndDate ? String(itemToEdit.rawEndDate).slice(0, 10) : '2026-12-22',
          end_time: itemToEdit.end_time || '12:00 PM',
          location_type: itemToEdit.location_type || 'Venue',
          location_details: itemToEdit.location_details || itemToEdit.location || '',
          currency: '£',
          price: itemToEdit.price === 'Free' ? '0.00' : (String(itemToEdit.price).replace(/[^0-9.]/g, '') || '0.00'),
          is_free: !itemToEdit.price || itemToEdit.price === 'Free',
          ticket_quantity: itemToEdit.ticket_quantity || 100,
          image_url: itemToEdit.image_url || '',
          organizer: itemToEdit.organizer || '',
        })
        setImagePreview(itemToEdit.image_url || '')
      } else {
        setPostData({
          title: itemToEdit.title || '',
          type: 'Local News',
          author: itemToEdit.sub || '',
          tags: '',
          summary: itemToEdit.body || '',
          link: '',
        })
      }
    } else {
      setEditingItem(null)
    }
  }

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErr('Image file is too large (max 5 MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      setEventData((prev) => ({ ...prev, image_url: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  /* ── CRUD: Submit Event (Create or Update) ────────────────────────── */
  const handleEventSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErr('')
    try {
      const payload = {
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.start_date,
        start_time: eventData.start_time,
        end_date: eventData.end_date,
        end_time: eventData.end_time,
        location_type: eventData.location_type,
        location_details: eventData.location_details,
        location: eventData.location_details || eventData.location_type,
        price: eventData.is_free ? 'Free' : `${eventData.currency} ${eventData.price}`,
        is_free: eventData.is_free,
        ticket_quantity: Number(eventData.ticket_quantity) || 0,
        image_url: eventData.image_url,
        organizer: eventData.organizer || '',
      }

      if (editingItem && editingItem.numericId) {
        // UPDATE (PATCH)
        await api(`/public-event/${editingItem.numericId}/`, {
          method: 'PATCH',
          body: payload,
        })
        setActionNotice('Event updated successfully!')
      } else {
        // CREATE (POST)
        await api('/public-event/', {
          method: 'POST',
          body: payload,
        })
        setActionNotice('Event published successfully!')
      }

      setSuccess(true)
      load()
    } catch (x) {
      setErr(x.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── CRUD: Submit Post (Create or Update) ─────────────────────────── */
  const handlePostSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErr('')
    try {
      const payload = {
        title: postData.title,
        body: [
          postData.summary || '',
          postData.author ? `\n\nAuthor: ${postData.author}` : '',
          postData.tags ? `\nTags: ${postData.tags}` : '',
          postData.link ? `\nLink: ${postData.link}` : '',
        ].join(''),
      }

      if (editingItem && editingItem.numericId) {
        // UPDATE (PATCH)
        await api(`/public-post/${editingItem.numericId}/`, {
          method: 'PATCH',
          body: payload,
        })
        setActionNotice('Update modified successfully!')
      } else {
        // CREATE (POST)
        await api('/public-post/', {
          method: 'POST',
          body: payload,
        })
        setActionNotice('Update shared successfully!')
      }

      setSuccess(true)
      load()
    } catch (x) {
      setErr(x.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── CRUD: Delete Item ────────────────────────────────────────────── */
  const handleDelete = async (item) => {
    const isEvent = item.kind === 'Events'
    const itemType = isEvent ? 'event' : 'post'
    if (!window.confirm(`Are you sure you want to delete this ${itemType}: "${item.title}"?`)) {
      return
    }

    try {
      if (isEvent) {
        await api(`/public-event/${item.numericId}/delete/`, { method: 'DELETE' })
        setEvents((prev) => (prev || []).filter((e) => e.id !== item.numericId))
      } else {
        await api(`/public-post/${item.numericId}/delete/`, { method: 'DELETE' })
        setPosts((prev) => (prev || []).filter((p) => p.id !== item.numericId))
      }
      setActionNotice(`Successfully deleted ${itemType}.`)
      setTimeout(() => setActionNotice(''), 4000)
    } catch (err) {
      alert(`Could not delete: ${err.message}`)
    }
  }

  /* ── Gate View if Not Joined ──────────────────────────────────────── */
  if (!isJoined) {
    return (
      <main className="w-full min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="card max-w-xl w-full text-center p-8 sm:p-12 border-2 border-purple-200 shadow-xl animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center text-4xl mb-6 shadow-sm">
            <i className="bi bi-shield-lock-fill"></i>
          </div>

          <span className="badge bg-purple-100 text-purple-700 mb-4 inline-flex items-center gap-1.5 font-bold">
            <i className="bi bi-lock-fill"></i> Members Only Area
          </span>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4">
            Join Us to Access the Community
          </h1>

          <p className="text-slate-600 text-base leading-relaxed mb-8">
            Access to Wilmark Technologies developer updates, exclusive Google Meet sessions, live tech hackathons, and discussion feeds is reserved for community members.
          </p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left mb-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="bi bi-check-circle-fill text-leaf text-lg mt-0.5"></i>
              <span className="text-sm font-medium text-slate-700">Access live online developer meetups and Google Meet links</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="bi bi-check-circle-fill text-leaf text-lg mt-0.5"></i>
              <span className="text-sm font-medium text-slate-700">Host your own events and post market tech updates</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="bi bi-check-circle-fill text-leaf text-lg mt-0.5"></i>
              <span className="text-sm font-medium text-slate-700">Connect with founders, hiring teams, and Kenyan developers</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/join"
              className="btn bg-gradient-to-r from-leaf to-sky text-white px-8 py-3.5 text-base font-bold shadow-lg hover:opacity-95"
            >
              <i className="bi bi-person-plus-fill mr-2"></i> Join the Community
            </Link>
            <button
              onClick={() => {
                localStorage.setItem('wilmark_joined', 'true')
                setIsJoined(true)
              }}
              className="btn border-2 border-slate-200 text-slate-600 hover:bg-slate-50 text-sm"
            >
              Already submitted? Unlock
            </button>
          </div>
        </div>
      </main>
    )
  }

  /* ── Mapped Cards ─────────────────────────────────────────────────── */
  const postCards = (posts || []).map((p) => {
    const isSystem = (p.author || '').toLowerCase().includes('wilmark_public')
    return {
      kind: 'Updates',
      id: `p${p.id}`,
      numericId: p.id,
      title: p.title,
      sub: isSystem ? '' : p.author,
      body: p.body,
      date: p.created ? new Date(p.created).toLocaleDateString() : '',
    }
  })

  const eventCards = (events || []).map((e) => {
    const rawOrg = (e.organizer_name || e.organizer || '').trim()
    const isSystem = !rawOrg || rawOrg.toLowerCase().includes('wilmark_public') || rawOrg.toLowerCase() === 'wilmark community'
    const organizerDisplay = !isSystem ? rawOrg : ''
    const locationDisplay = e.location_details || e.location || e.location_type || 'Online'
    const subText = organizerDisplay ? `${organizerDisplay} · ${locationDisplay}` : locationDisplay

    return {
      kind: 'Events',
      id: `e${e.id}`,
      numericId: e.id,
      title: e.title,
      sub: subText,
      organizer: organizerDisplay,
      body: e.description,
      rawDate: e.date,
      date: e.date ? new Date(e.date).toLocaleDateString() : '',
      start_time: e.start_time,
      rawEndDate: e.end_date,
      end_date: e.end_date ? new Date(e.end_date).toLocaleDateString() : '',
      end_time: e.end_time,
      location_type: e.location_type,
      location_details: e.location_details,
      location: e.location,
      price: e.price || 'Free',
      ticket_quantity: e.ticket_quantity,
      image_url: e.image_url,
    }
  })

  const jobCards = (jobs || []).map((j) => ({
    kind: 'Jobs',
    id: `j${j.id}`,
    numericId: j.id,
    title: j.title,
    sub: `${j.company} · ${j.location}`,
    body: j.description,
    date: '',
  }))

  const classCards = (courses || []).map((c) => ({
    kind: 'Classes',
    id: `c${c.id}`,
    numericId: c.id,
    title: c.title,
    sub: [c.instructor, c.schedule, c.price].filter(Boolean).join(' · '),
    body: c.description,
    link: c.link,
    image_url: c.image_url,
    date: c.created ? new Date(c.created).toLocaleDateString() : '',
  }))

  const materialCards = (materials || []).map((m) => ({
    kind: 'Materials',
    id: `m${m.id}`,
    numericId: m.id,
    title: m.title,
    sub: [m.category, m.material_type].filter(Boolean).join(' · '),
    body: m.description,
    link: m.url,
    date: m.created ? new Date(m.created).toLocaleDateString() : '',
  }))

  const all = [...classCards, ...materialCards, ...eventCards, ...postCards, ...jobCards]
  const shown = filter === 'All' ? all : all.filter((c) => c.kind === filter)

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-ink via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #0B8A5F, transparent 55%), radial-gradient(circle at 70% 30%, #3A86FF, transparent 55%)' }} />
        <div className="relative hero max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <span className="badge bg-leaf/20 text-leaf mb-5 inline-flex items-center gap-1.5">
              <i className="bi bi-people-fill"></i> Community & Events
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-balance">Visibility, events, talent and market access.</h1>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-lg">Connect with developers, founders and ecosystem partners who are hiring, hosting events, collaborating and building now.</p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => openForm('event')}
                className="btn bg-purple-600 hover:bg-purple-700 text-white shadow-md font-bold"
              >
                <i className="bi bi-calendar-plus mr-1.5"></i> Host an event
              </button>
              <button
                onClick={() => openForm('post')}
                className="btn bg-leaf hover:bg-emerald-700 text-white shadow-md font-bold"
              >
                <i className="bi bi-pencil-square mr-1.5"></i> Share update
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="section">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-leaf p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-lg flex items-center gap-2"><i className="bi bi-whatsapp"></i> Wilmark WhatsApp Channel</p>
            <p className="text-white/90 text-sm mt-1">Get updates, class announcements, and community opportunities directly.</p>
          </div>
          <a href="https://whatsapp.com/channel/0029Vb9Am1m6BIEkmbKQfZ1C" target="_blank" rel="noreferrer" className="btn bg-white text-emerald-700 hover:bg-slate-100 font-bold shrink-0">Join Channel</a>
        </div>
        {/* Action Notice toast */}
        {actionNotice && (
          <div className="mb-6 p-4 rounded-xl bg-leaf/10 border border-leaf/30 text-leaf font-bold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <i className="bi bi-check-circle-fill text-lg"></i>
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice('')} className="text-leaf/60 hover:text-leaf">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Post / Event Actions Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (showForm && formMode === 'post' && !editingItem) setShowForm(false)
                  else openForm('post')
                }}
                className={`btn ${showForm && formMode === 'post' ? 'bg-slate-200 text-slate-700' : 'bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90'}`}
              >
                <i className="bi bi-plus-lg mr-1.5"></i> Share an update
              </button>

              <button
                onClick={() => {
                  if (showForm && formMode === 'event' && !editingItem) setShowForm(false)
                  else openForm('event')
                }}
                className={`btn ${showForm && formMode === 'event' ? 'bg-slate-200 text-slate-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
              >
                <i className="bi bi-calendar-event mr-1.5"></i> Post an event
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <i className="bi bi-shield-check text-leaf"></i> Active Member
            </span>
          </div>

          {/* Form Modal / Panel */}
          {showForm && (
            <div className="mt-6 animate-fade-in">
              {success ? (
                <div className="card text-center py-12">
                  <div className="text-6xl mb-4 text-leaf">
                    <i className="bi bi-patch-check-fill"></i>
                  </div>
                  <h3 className="font-display text-2xl font-bold">
                    {actionNotice || (formMode === 'event' ? 'Event published!' : 'Update published!')}
                  </h3>
                  <p className="text-slate-600 mt-2">
                    {formMode === 'event' ? 'Your event is now live and listed in the community feed.' : 'Your update is now live in the community.'}
                  </p>
                  <button className="btn-leaf mt-6 font-bold px-8" onClick={() => { setSuccess(false); setShowForm(false); setEditingItem(null) }}>
                    Done
                  </button>
                </div>
              ) : formMode === 'event' ? (
                /* ═════════════════════════════════════════════════════════════════════
                   FULL EVENT POSTING & EDITING FORM (CRUD)
                   ═════════════════════════════════════════════════════════════════════ */
                <form onSubmit={handleEventSubmit} className="card border-2 border-purple-200 shadow-xl">
                  {/* Form mode switcher */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
                        <i className="bi bi-calendar-event"></i>
                      </span>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-ink">
                          {editingItem ? 'Edit Event' : 'Post an Event'}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {editingItem ? 'Modify details of your event' : 'Create a workshop, hackathon, meetup or tech conference'}
                        </p>
                      </div>
                    </div>
                    {!editingItem && (
                      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                        <button type="button" onClick={() => setFormMode('post')} className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-ink">Update / Post</button>
                        <button type="button" onClick={() => setFormMode('event')} className="px-3 py-1.5 rounded-lg bg-white text-purple-700 shadow-sm">Event</button>
                      </div>
                    )}
                  </div>

                  {err && (
                    <div className="mb-6 rounded-xl bg-flag/10 border border-flag/20 px-4 py-3 text-sm text-flag flex items-center gap-2" role="alert">
                      <i className="bi bi-exclamation-triangle-fill shrink-0"></i>
                      <span>{err}</span>
                    </div>
                  )}

                  {/* 1. Title & Details */}
                  <div className="mb-8">
                    <h3 className="font-display font-bold text-lg text-ink mb-1">What’s the name of your event?</h3>
                    <p className="text-slate-500 text-xs mb-3 leading-relaxed">
                      This will be your event’s title. Your title will be used to help create your event’s summary, description, category, and tags – so be specific!
                    </p>
                    <label className="block text-sm font-semibold mb-1">
                      Event title <span className="text-flag">*</span>
                    </label>
                    <input
                      className="field text-base font-medium"
                      placeholder="e.g. Kenya JavaScript Developers Weekend Summit 2026"
                      value={eventData.title}
                      onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* 2. Event Image / Banner */}
                  <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-sm font-semibold mb-1">Event image / banner</label>
                    <p className="text-xs text-slate-500 mb-3">Upload a clean banner or picture for your event (JPG, PNG or WebP under 5 MB)</p>
                    
                    {imagePreview ? (
                      <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200 max-h-56">
                        <img src={imagePreview} alt="Event Preview" className="w-full h-56 object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(''); setEventData({ ...eventData, image_url: '' }) }}
                          className="absolute top-2 right-2 bg-ink/80 text-white rounded-lg px-2.5 py-1 text-xs hover:bg-flag transition-colors inline-flex items-center gap-1"
                        >
                          <i className="bi bi-x-circle"></i> Remove image
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-5 hover:border-purple-500 hover:bg-purple-50/50 cursor-pointer transition-colors text-center">
                            <i className="bi bi-image text-3xl text-purple-600 mb-1"></i>
                            <span className="text-xs font-semibold text-purple-700">Upload event picture</span>
                            <span className="text-[11px] text-slate-400 mt-0.5">Click to browse file</span>
                            <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                          </label>
                        </div>
                        <div>
                          <input
                            className="field h-full"
                            placeholder="Or paste image URL (https://...)"
                            value={eventData.image_url}
                            onChange={(e) => {
                              setEventData({ ...eventData, image_url: e.target.value })
                              setImagePreview(e.target.value)
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Date & Time */}
                  <div className="mb-8">
                    <h3 className="font-display font-bold text-lg text-ink mb-1">When does your event start and end?</h3>
                    <p className="text-slate-500 text-xs mb-3">Set exact dates and times so attendees know when to attend.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Start date *</label>
                        <input
                          type="date"
                          className="field"
                          value={eventData.start_date}
                          onChange={(e) => setEventData({ ...eventData, start_date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Start time *</label>
                        <input
                          type="text"
                          className="field"
                          placeholder="10:00 AM"
                          value={eventData.start_time}
                          onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">End date *</label>
                        <input
                          type="date"
                          className="field"
                          value={eventData.end_date}
                          onChange={(e) => setEventData({ ...eventData, end_date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">End time *</label>
                        <input
                          type="text"
                          className="field"
                          placeholder="12:00 PM"
                          value={eventData.end_time}
                          onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Location */}
                  <div className="mb-8">
                    <h3 className="font-display font-bold text-lg text-ink mb-1">Where is it located?</h3>
                    <p className="text-slate-500 text-xs mb-3">Choose the venue format and add address or meeting link.</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {LOCATION_TYPES.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setEventData({ ...eventData, location_type: loc })}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-1.5 ${
                            eventData.location_type === loc
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <i className={loc === 'Venue' ? 'bi bi-building' : loc === 'Online event' ? 'bi bi-globe' : 'bi bi-clock-history'}></i>
                          <span>{loc}</span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Location details <span className="text-flag">*</span>
                      </label>
                      <input
                        className="field"
                        placeholder={
                          eventData.location_type === 'Online event'
                            ? 'e.g. https://meet.google.com/abc-defg-hij'
                            : eventData.location_type === 'To be announced'
                            ? 'e.g. Nairobi CBD (details to be announced via email)'
                            : 'e.g. iHub Nairobi, Senteu Plaza, 6th Floor, Galana Rd'
                        }
                        value={eventData.location_details}
                        onChange={(e) => setEventData({ ...eventData, location_details: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* 5. Tickets & Pricing */}
                  <div className="mb-8 p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <h3 className="font-display font-bold text-lg text-ink mb-1">How much do you want to charge for tickets?</h3>
                    <p className="text-slate-500 text-xs mb-3 leading-relaxed">
                      Our tool can only generate one General Admission ticket for now. You can edit and add more ticket types later.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Price <span className="text-flag">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            className="field w-20 shrink-0 font-bold"
                            value={eventData.currency}
                            onChange={(e) => setEventData({ ...eventData, currency: e.target.value })}
                            disabled={eventData.is_free}
                          >
                            {CURRENCIES.map((cur) => <option key={cur} value={cur}>{cur}</option>)}
                          </select>
                          <input
                            type="text"
                            className="field flex-1 font-semibold"
                            placeholder="0.00"
                            value={eventData.is_free ? '0.00' : eventData.price}
                            onChange={(e) => setEventData({ ...eventData, price: e.target.value })}
                            disabled={eventData.is_free}
                            required={!eventData.is_free}
                          />
                        </div>
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={eventData.is_free}
                            onChange={(e) => setEventData({ ...eventData, is_free: e.target.checked })}
                            className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          />
                          My tickets are free
                        </label>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-purple-100">
                      <h4 className="font-display font-bold text-sm text-ink mb-1">How many tickets do you want to sell?</h4>
                      <p className="text-slate-500 text-xs mb-2">The total number of tickets you&apos;re willing to sell, across all ticket types.</p>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Total ticket quantity <span className="text-flag">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="field max-w-xs font-semibold"
                        placeholder="100"
                        value={eventData.ticket_quantity}
                        onChange={(e) => setEventData({ ...eventData, ticket_quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* 6. Description & Organizer */}
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Event summary & description <span className="text-flag">*</span>
                      </label>
                      <textarea
                        className="field"
                        rows={4}
                        placeholder="Outline the agenda, topics, speakers, what attendees should bring, and who should attend..."
                        value={eventData.description}
                        onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Organizer or company name (optional)</label>
                      <input
                        className="field"
                        placeholder="e.g. Nairobi Dev Community"
                        value={eventData.organizer}
                        onChange={(e) => setEventData({ ...eventData, organizer: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingItem(null) }}
                      className="btn border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 px-8 py-3 text-base shadow-lg font-bold"
                    >
                      <i className={editingItem ? 'bi bi-check2-circle mr-1.5' : 'bi bi-rocket-takeoff-fill mr-1.5'}></i>
                      {submitting ? 'Saving...' : editingItem ? 'Update Event' : 'Publish Event'}
                    </button>
                  </div>
                </form>
              ) : (
                /* ═════════════════════════════════════════════════════════════════════
                   POST EDITING & CREATING FORM (CRUD)
                   ═════════════════════════════════════════════════════════════════════ */
                <form onSubmit={handlePostSubmit} className="card shadow-lg">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-xl bg-leaf/10 text-leaf flex items-center justify-center text-xl font-bold">
                        <i className="bi bi-file-earmark-text"></i>
                      </span>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-ink">
                          {editingItem ? 'Edit Update' : 'Share your market update'}
                        </h2>
                        <p className="text-xs text-slate-500">Post news, tutorials, startup updates or developer questions</p>
                      </div>
                    </div>
                    {!editingItem && (
                      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                        <button type="button" onClick={() => setFormMode('post')} className="px-3 py-1.5 rounded-lg bg-white text-leaf shadow-sm">Update / Post</button>
                        <button type="button" onClick={() => setFormMode('event')} className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-ink">Event</button>
                      </div>
                    )}
                  </div>

                  {err && (
                    <div className="mb-4 rounded-xl bg-flag/10 border border-flag/20 px-4 py-3 text-sm text-flag flex items-center gap-2" role="alert">
                      <i className="bi bi-exclamation-triangle-fill shrink-0"></i>
                      <span>{err}</span>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5">Post title</label>
                      <input
                        name="title"
                        className="field"
                        placeholder="e.g. JIC JavaScript weekend course"
                        value={postData.title}
                        onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Type</label>
                      <select
                        name="type"
                        className="field"
                        value={postData.type}
                        onChange={(e) => setPostData({ ...postData, type: e.target.value })}
                      >
                        {POST_TYPES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Author or organisation</label>
                      <input
                        name="author"
                        className="field"
                        placeholder="Your name or company"
                        value={postData.author}
                        onChange={(e) => setPostData({ ...postData, author: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5">Tags</label>
                      <input
                        name="tags"
                        className="field"
                        placeholder="JIC, WebDev, Kenya"
                        value={postData.tags}
                        onChange={(e) => setPostData({ ...postData, tags: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5">Summary</label>
                      <textarea
                        name="summary"
                        className="field"
                        rows={4}
                        placeholder="What should readers know?"
                        value={postData.summary}
                        onChange={(e) => setPostData({ ...postData, summary: e.target.value })}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5">Link (optional)</label>
                      <input
                        name="link"
                        className="field"
                        placeholder="https://example.com"
                        value={postData.link}
                        onChange={(e) => setPostData({ ...postData, link: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowForm(false); setEditingItem(null) }}
                        className="btn border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 px-8 py-3 font-bold"
                        disabled={submitting}
                      >
                        <i className={editingItem ? 'bi bi-check2-circle mr-1.5' : 'bi bi-send-fill mr-1.5'}></i>
                        {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Publish post'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip cursor-pointer transition-all duration-200 inline-flex items-center gap-1.5 ${
                filter === f
                  ? f === 'Events' ? 'bg-purple-600 text-white shadow-sm' : 'bg-leaf text-white shadow-sm'
                  : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50 hover:text-ink'
              }`}
            >
              {f === 'Events' && <i className="bi bi-calendar-event"></i>}
              {f === 'Updates' && <i className="bi bi-file-earmark-text"></i>}
              {f === 'Jobs' && <i className="bi bi-briefcase"></i>}
              {f === 'Classes' && <i className="bi bi-mortarboard-fill"></i>}
              {f === 'Materials' && <i className="bi bi-journal-bookmark-fill"></i>}
              {f === 'All' && <i className="bi bi-grid-fill"></i>}
              <span>{f}</span>
              {!loading && f !== 'All' && <span className="ml-1 text-xs opacity-75 font-semibold">({all.filter((c) => c.kind === f).length})</span>}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-400 mb-6">Showing {shown.length} {shown.length === 1 ? 'item' : 'items'}</p>

        {/* Feed grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
          ) : shown.length === 0 ? (
            <div className="col-span-full text-center py-16 card">
              <div className="text-5xl mb-4 text-slate-400">
                <i className={filter === 'Events' ? 'bi bi-calendar-x' : 'bi bi-inbox'}></i>
              </div>
              <h3 className="text-slate-700 font-display font-bold text-xl">
                {filter === 'Events' ? 'No upcoming events yet' : 'Nothing here yet'}
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                {filter === 'Events' ? 'Be the first to host and list an event for Kenyan developers.' : 'Be the first to share something with the community.'}
              </p>
              {filter === 'Events' && (
                <button onClick={() => openForm('event')} className="btn bg-purple-600 text-white hover:bg-purple-700 mt-5 font-bold">
                  <i className="bi bi-calendar-plus mr-1.5"></i> Host an event now
                </button>
              )}
            </div>
          ) : (
            shown.map((item) => {
              const { kind, id, title, sub, body, date, image_url, price, start_time, link } = item
              const isEvent = kind === 'Events'
              const isClass = kind === 'Classes'
              const isMaterial = kind === 'Materials'
              const meetingUrl = isEvent ? extractMeetingUrl(item) : (isClass ? link : null)
              const { start, end } = isEvent ? getEventStartEnd(item) : {}
              const now = new Date()
              const isLive = isEvent && start && now >= start && (!end || now <= end)

              return (
                <article key={id} className={`card p-0 overflow-hidden hover:shadow-lg transition-all group flex flex-col ${isEvent ? 'ring-1 ring-purple-100' : ''}`}>
                  {/* Event Banner Image if present */}
                  {image_url && (
                    <div className="w-full h-44 bg-slate-100 relative overflow-hidden shrink-0">
                      <img src={image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {price && (
                        <span className="absolute top-3 right-3 bg-ink/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {price}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header line: Badges + Countdown / Live Indicator */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`chip text-xs border ${catColors[kind] || 'bg-slate-100 text-slate-700'} inline-flex items-center gap-1`}>
                        {isEvent && <i className="bi bi-calendar-event"></i>}
                        {kind}
                      </span>
                      {isEvent ? (
                        <EventTimerBadge item={item} />
                      ) : (
                        date && <span className="text-xs font-medium text-slate-500">{date}</span>
                      )}
                    </div>

                    <h3 className={`font-display text-lg font-bold leading-snug ${isEvent ? 'group-hover:text-purple-700' : 'group-hover:text-leaf'} transition-colors`}>
                      {title}
                    </h3>
                    
                    {/* Sub text with clickable links (and without wilmark_public) */}
                    {sub && (
                      <div className="text-xs text-slate-500 mt-1.5 font-medium flex items-center gap-1 flex-wrap">
                        <AutoLinkText text={sub} />
                      </div>
                    )}

                    {/* Date/time pill for events */}
                    {isEvent && date && (
                      <div className="mt-2 text-xs text-purple-700 font-semibold flex items-center gap-1.5">
                        <i className="bi bi-calendar3"></i>
                        <span>{date}</span>
                        {start_time && (
                          <>
                            <span>·</span>
                            <i className="bi bi-clock"></i>
                            <span>{start_time}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Body with auto-linked URLs */}
                    {body && (
                      <div className="mt-3 text-slate-600 text-sm line-clamp-3 leading-relaxed">
                        <AutoLinkText text={body} />
                      </div>
                    )}

                    {/* Event extra metadata bar */}
                    {isEvent && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        {item.location_type && (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <i className="bi bi-geo-alt-fill text-purple-600"></i>
                            <span>{item.location_type}</span>
                          </span>
                        )}
                        {!image_url && price && (
                          <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                            {price}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Bar with CRUD controls */}
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2 flex-wrap border-t border-slate-50">
                      {/* Meeting URL Button or Read More */}
                      {isClass ? (
                        <div className="flex gap-2 flex-wrap">
                          {link && <a href={link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-leaf text-white hover:bg-emerald-700"><i className="bi bi-camera-video-fill"></i>Access Class</a>}
                          <button onClick={e=>{e.stopPropagation(); setRegClass(item); setRegMsg(''); setReg({full_name:localStorage.getItem('wilmark_member_name')||'', email:localStorage.getItem('wilmark_member_email')||'', phone:''})}} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"><i className="bi bi-person-plus"></i>Register</button>
                        </div>
                      ) : isMaterial ? (
                        <a href={link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"><i className="bi bi-journal-arrow-down"></i>Open Material</a>
                      ) : meetingUrl ? (
                        <a
                          href={meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            isLive
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          <i className="bi bi-camera-video-fill"></i>
                          <span>{isLive ? 'Join Live Meeting' : 'Join Google Meet'}</span>
                          <i className="bi bi-box-arrow-up-right text-[10px]"></i>
                        </a>
                      ) : (
                        <span className={`text-sm font-semibold inline-flex items-center gap-1 ${isEvent ? 'text-purple-700' : 'text-leaf'}`}>
                          <span>{isEvent ? 'Event details' : 'Read more'}</span>
                          <i className="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </span>
                      )}

                      {/* CRUD Edit & Delete Buttons */}
                      {!isClass && !isMaterial && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openForm(isEvent ? 'event' : 'post', item)
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg text-slate-600 hover:text-ink hover:bg-slate-100 font-semibold inline-flex items-center gap-1 transition-colors"
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item)
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg text-flag hover:bg-flag/10 font-semibold inline-flex items-center gap-1 transition-colors"
                          title="Delete"
                        >
                          <i className="bi bi-trash3"></i>
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>)}
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>

        {regClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={()=>setRegClass(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
              <h3 className="font-display font-bold text-xl">Register for class</h3>
              <p className="text-sm text-slate-600 mt-1">{regClass.title}</p>
              {regMsg ? <div className="mt-4 rounded-xl bg-leaf/10 text-leaf p-3 text-sm font-semibold">{regMsg}</div> : (
                <form className="mt-4 space-y-3" onSubmit={async e=>{e.preventDefault(); setRegBusy(true); setRegMsg(''); try{ const r=await api(`/courses/${regClass.numericId}/register/`,{method:'POST',body:reg}); setRegMsg(r.message||'Registered.'); }catch(x){ setRegMsg(x.message) } finally{ setRegBusy(false) }}}>
                  <input className="field" placeholder="Full name" value={reg.full_name} onChange={e=>setReg({...reg,full_name:e.target.value})} required />
                  <input className="field" type="email" placeholder="Email" value={reg.email} onChange={e=>setReg({...reg,email:e.target.value})} required />
                  <input className="field" placeholder="Phone (optional)" value={reg.phone} onChange={e=>setReg({...reg,phone:e.target.value})} />
                  <div className="flex gap-2"><button className="btn-leaf flex-1" disabled={regBusy}>{regBusy?'Registering...':'Register'}</button><button type="button" className="btn-ghost" onClick={()=>setRegClass(null)}>Close</button></div>
                </form>
              )}
              {regMsg && <button className="btn-leaf mt-4 w-full" onClick={()=>setRegClass(null)}>Close</button>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
