import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const COURSES = ['Web Development Bootcamp', 'Python for Beginners', 'JavaScript Fundamentals', 'React & Frontend', 'Django & Backend', 'Full Stack Development', 'UI/UX Design', 'Data & SQL', 'Other']
const COUNTRIES = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'Nigeria', 'Ghana', 'South Africa', 'Other']
const SKILLS = ['HTML', 'CSS', 'JavaScript', 'Python', 'React', 'Node.js', 'PHP', 'SQL', 'Git', 'Bootstrap', 'Django', 'Other']
const HEARD = ['WhatsApp', 'Social media', 'Friend / referral', 'Google search', 'Other']
const LEVELS = ['Beginner', 'Some experience', 'Intermediate', 'Advanced']
const AGES = ['Under 18', '18-24', '25-34', '35-44', '45+']
const GENDERS = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say']

const Section = ({ n, title, color, children }) => (
  <div className="card mb-6">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
      <span className={`h-9 w-9 rounded-full ${color} text-white flex items-center justify-center font-bold text-sm shrink-0`}>{n}</span>
      <h3 className="font-display font-bold text-xl">{title}</h3>
    </div>
    {children}
  </div>
)

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-1">{label}{required && <span className="text-flag ml-1">*</span>}</label>
    {children}
  </div>
)

export default function Join() {
  const [f, setF] = useState({
    full_name: '', preferred_name: '', email: '', phone: '', country: 'Kenya', city: '', gender: '', age_range: '',
    linkedin: '', github: '', portfolio: '', social_other: '',
    course: '', cohort: '', start_date: '', completion_date: '', heard_via: '',
    skills_learned: [], skill_level_before: '', skill_level_after: '', projects: ''
  })
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [step, setStep] = useState(1)
  const [customCourse, setCustomCourse] = useState('')
  const [isOtherCourse, setIsOtherCourse] = useState(false)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const handleCourseChange = (e) => {
    const val = e.target.value
    if (val === 'Other') {
      setIsOtherCourse(true)
      setF({ ...f, course: customCourse })
    } else {
      setIsOtherCourse(false)
      setF({ ...f, course: val })
    }
  }

  const handleCustomCourseChange = (e) => {
    const val = e.target.value
    setCustomCourse(val)
    setF({ ...f, course: val })
  }

  const toggleSkill = (skill) => {
    setF({ ...f, skills_learned: f.skills_learned.includes(skill) ? f.skills_learned.filter(s => s !== skill) : [...f.skills_learned, skill] })
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await api('/join/', { method: 'POST', body: f })
      // Grant community access immediately
      localStorage.setItem('wilmark_joined', 'true')
      localStorage.setItem('wilmark_member_name', f.full_name)
      localStorage.setItem('wilmark_member_email', f.email)
      setDone(true)
    } catch (x) {
      setErr(x.message)
      setStep(1)
    }
  }

  if (done) return (
    <main className="w-full">
      <section className="bg-gradient-to-br from-leaf to-sky text-white hero text-center">
        <div className="text-6xl mb-4 text-white">
          <i className="bi bi-patch-check-fill"></i>
        </div>
        <h1 className="text-white">Welcome to Wilmark Technologies!</h1>
        <p className="mt-3 text-white/80 text-lg">Your membership is active and your application has been received. You now have full access to our community.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/community" className="btn bg-white text-leaf hover:bg-slate-100 font-bold px-6 py-3">
            <i className="bi bi-people-fill mr-1.5"></i> Enter Community & Events
          </Link>
          <Link to="/" className="btn border-2 border-white/40 text-white hover:bg-white/10 px-6 py-3">
            <i className="bi bi-house-door mr-1.5"></i> Back to Home
          </Link>
        </div>
      </section>
    </main>
  )

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ink via-slate-800 to-slate-900 text-white hero text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #0B8A5F, transparent 55%), radial-gradient(circle at 80% 30%, #3A86FF, transparent 55%)' }} />
        <div className="relative">
          <span className="inline-block rounded-full bg-leaf/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-leaf mb-4">
            <i className="bi bi-shield-check mr-1.5"></i>Join the community
          </span>
          <h1 className="text-white">Become part of Wilmark Technologies</h1>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">Fill in your details below to join our developer community, unlock events access, showcase your skills and collaborate with others.</p>
        </div>
      </section>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 h-1.5">
        <div className="h-1.5 bg-gradient-to-r from-leaf to-sky transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <div className="w-full px-4 sm:px-8 lg:px-16 py-3 flex gap-4 text-sm max-w-7xl mx-auto">
        {[['1', 'Personal details'], ['2', 'Online profiles'], ['3', 'Learning journey']].map(([n, label]) => (
          <button key={n} onClick={() => setStep(Number(n))}
            className={`flex items-center gap-2 font-medium transition-colors ${step >= Number(n) ? 'text-leaf' : 'text-slate-400'}`}>
            <span className={`h-6 w-6 rounded-full text-xs flex items-center justify-center font-bold ${step >= Number(n) ? 'bg-leaf text-white' : 'bg-slate-200 text-slate-500'}`}>{n}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-6">
        {err && (
          <div className="mb-6 rounded-2xl bg-flag/10 border border-flag/20 px-6 py-4 text-flag font-semibold flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill shrink-0"></i>
            <span>{err}</span>
          </div>
        )}

        {/* SECTION 1 */}
        {step === 1 && (
          <Section n="1" title="Personal details" color="bg-leaf">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required><input className="field" value={f.full_name} onChange={set('full_name')} placeholder="John Kamau" required /></Field>
              <Field label="Preferred name"><input className="field" value={f.preferred_name} onChange={set('preferred_name')} placeholder="John" /></Field>
              <Field label="Email address" required><input type="email" className="field" value={f.email} onChange={set('email')} placeholder="john@example.com" required /></Field>
              <Field label="Phone / WhatsApp number" required><input className="field" value={f.phone} onChange={set('phone')} placeholder="0705 387 545" required /></Field>
              <Field label="Country" required>
                <select className="field" value={f.country} onChange={set('country')} required>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="City / town" required><input className="field" value={f.city} onChange={set('city')} placeholder="Nairobi" required /></Field>
              <Field label="Gender (optional)">
                <select className="field" value={f.gender} onChange={set('gender')}>
                  {GENDERS.map(g => <option key={g} value={g}>{g || 'Prefer not to say'}</option>)}
                </select>
              </Field>
              <Field label="Age range" required>
                <select className="field" value={f.age_range} onChange={set('age_range')} required>
                  <option value="">Select age range</option>
                  {AGES.map(a => <option key={a}>{a}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="btn bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 px-8">
                Next: Online profiles <i className="bi bi-arrow-right ml-1.5"></i>
              </button>
            </div>
          </Section>
        )}

        {/* SECTION 2 */}
        {step === 2 && (
          <Section n="2" title="Online profiles" color="bg-sky">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="LinkedIn"><input className="field" value={f.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/yourname" /></Field>
              <Field label="GitHub"><input className="field" value={f.github} onChange={set('github')} placeholder="https://github.com/yourname" /></Field>
              <Field label="Portfolio or personal website"><input className="field" value={f.portfolio} onChange={set('portfolio')} placeholder="https://yoursite.com" /></Field>
              <Field label="Other social media (X, Instagram, YouTube)"><input className="field" value={f.social_other} onChange={set('social_other')} placeholder="@yourhandle or link" /></Field>
            </div>
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="btn border-2 border-slate-300 text-slate-700 hover:bg-slate-50">
                <i className="bi bi-arrow-left mr-1.5"></i> Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn bg-gradient-to-r from-sky to-leaf text-white hover:opacity-90 px-8">
                Next: Learning journey <i className="bi bi-arrow-right ml-1.5"></i>
              </button>
            </div>
          </Section>
        )}

        {/* SECTION 3 */}
        {step === 3 && (
          <Section n="3" title="Learning with Wilmark" color="bg-gradient-to-br from-sun to-flag">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={isOtherCourse ? 'sm:col-span-2 grid sm:grid-cols-2 gap-4' : ''}>
                <Field label="Which course or class did you take?" required>
                  <select className="field" value={isOtherCourse ? 'Other' : f.course} onChange={handleCourseChange} required>
                    <option value="">Select a course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                {isOtherCourse && (
                  <Field label="Specify your course name" required>
                    <input
                      className="field"
                      value={customCourse}
                      onChange={handleCustomCourseChange}
                      placeholder="e.g. Mobile App Dev, Cyber Security, etc."
                      required
                    />
                  </Field>
                )}
              </div>

              <Field label="Cohort or batch name"><input className="field" value={f.cohort} onChange={set('cohort')} placeholder="e.g. Batch 3, Jan 2025" /></Field>
              <Field label="Start date"><input type="date" className="field" value={f.start_date} onChange={set('start_date')} /></Field>
              <Field label="Completion date (or still learning)">
                <input className="field" value={f.completion_date} onChange={set('completion_date')} placeholder="e.g. March 2025 or Still learning" />
              </Field>
              <Field label="How did you hear about my classes?" required>
                <select className="field" value={f.heard_via} onChange={set('heard_via')} required>
                  <option value="">Select one</option>
                  {HEARD.map(h => <option key={h}>{h}</option>)}
                </select>
              </Field>
              <Field label="Skill level before the course" required>
                <select className="field" value={f.skill_level_before} onChange={set('skill_level_before')} required>
                  <option value="">Select level</option>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Skill level now" required>
                <select className="field" value={f.skill_level_after} onChange={set('skill_level_after')} required>
                  <option value="">Select level</option>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold mb-3">Skills you learned <span className="text-slate-400 font-normal">(select all that apply)</span></label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className={`chip cursor-pointer transition-colors ${f.skills_learned.includes(skill) ? 'bg-leaf text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {f.skills_learned.includes(skill) && <i className="bi bi-check mr-1 font-bold"></i>}
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <Field label="Projects you built during the course">
                <textarea className="field" rows={4} value={f.projects} onChange={set('projects')} placeholder="Describe your projects and include links e.g. https://github.com/..." />
              </Field>
            </div>

            <div className="mt-6 flex justify-between flex-wrap gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn border-2 border-slate-300 text-slate-700 hover:bg-slate-50">
                <i className="bi bi-arrow-left mr-1.5"></i> Back
              </button>
              <button type="submit" className="btn bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 px-10 py-3 text-base font-bold shadow-lg">
                <i className="bi bi-send-fill mr-2"></i> Submit application
              </button>
            </div>
          </Section>
        )}
      </form>
    </main>
  )
}
