import pathlib

p = pathlib.Path('C:/Users/korir/Downloads/wilmark/frontend/src/pages/More.jsx')
src = p.read_text(encoding='utf-8')

# Remove old PostForm if present
if 'const PostForm = ({ onDone })' in src:
    pf_start = src.index('const PostForm = ({ onDone })')
    news_start = src.index('export function News()')
    src = src[:pf_start] + src[news_start:]

# Replace News function
start = src.index('export function News()')
i = src.index('{', start)
depth = 0
for j in range(i, len(src)):
    if src[j] == '{': depth += 1
    elif src[j] == '}':
        depth -= 1
        if depth == 0:
            end = j + 1
            break

new_news = r"""export function News() {
  const [posts, setPosts] = useState([])
  const [cat, setCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const load = () => api('/posts/').then((d) => setPosts(d.results || d)).catch(() => {})
  useEffect(() => { load() }, [])
  const submit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await api('/posts/', { method: 'POST', body: { title: fd.get('title'), body: (fd.get('summary') || '') + '\n\nAuthor: ' + (fd.get('author') || '') + '\nTags: ' + (fd.get('tags') || '') + '\nImage: ' + (fd.get('image_url') || '') + '\nLink: ' + (fd.get('link') || ''), code: '' } })
      setDone(true); setErr(''); load()
    } catch (x) { setErr(x.message) }
  }
  return (
    <main>
      <section className="bg-gradient-to-br from-ink via-slate-800 to-slate-900 text-white hero text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #0B8A5F, transparent 55%), radial-gradient(circle at 80% 30%, #3A86FF, transparent 55%)' }} />
        <div className="relative">
          <span className="inline-block rounded-full bg-sky/20 px-4 py-1.5 text-sm font-semibold text-sky mb-4">News &amp; Posts</span>
          <h1>The stories that matter to developers.</h1>
          <p className="mt-3 text-slate-300">Fresh local news, skill updates, events and ecosystem momentum, all in one place.</p>
          <button onClick={() => setShowForm(true)} className="btn mt-6 bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 text-base px-8 py-3">+ Share your story</button>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.65)'}}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-leaf to-sky p-6 rounded-t-3xl flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-display font-bold text-2xl">Share your market update.</h2>
                <p className="text-white/80 text-sm mt-1">Post jobs, events, startup news or campaign updates to reach Wilmark&apos;s tech community.</p>
              </div>
              <button onClick={() => { setShowForm(false); setDone(false) }} className="text-white/80 hover:text-white text-4xl leading-none shrink-0">&times;</button>
            </div>
            <div className="p-6">
              {done ? (
                <div className="text-center py-10">
                  <div className="text-6xl mb-4">✅</div>
                  <h3>Post published!</h3>
                  <p className="text-slate-600 mt-2">Your update is now live in the community.</p>
                  <button className="btn bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 mt-6" onClick={() => setDone(false)}>Post another</button>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                  {err && <p className="text-flag text-sm sm:col-span-2">{err}</p>}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Post title</label>
                    <input name="title" className="field" placeholder="e.g. JIC JavaScript weekend course" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Type</label>
                    <select name="type" className="field">{CATS.filter(c => c !== 'All').map(t => <option key={t}>{t}</option>)}</select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Author or organisation</label>
                    <input name="author" className="field" placeholder="Your name, JIC, community..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Tags</label>
                    <input name="tags" className="field" placeholder="JIC, WebDev, Kenya" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Short summary</label>
                    <textarea name="summary" className="field" rows="3" placeholder="What should readers know?" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Image URL</label>
                    <input name="image_url" className="field" placeholder="https://example.com/image.jpg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Or upload a picture</label>
                    <input type="file" accept="image/*" className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-leaf/10 file:text-leaf file:font-semibold hover:file:bg-leaf/20 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Image alt text</label>
                    <input name="image_alt" className="field" placeholder="Short description of the image" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Link</label>
                    <input name="link" className="field" placeholder="https://example.com" />
                  </div>
                  <button className="btn bg-gradient-to-r from-leaf to-sky text-white hover:opacity-90 sm:col-span-2 w-full py-3 text-base">Publish post</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="flex flex-wrap gap-2 mb-8">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`chip cursor-pointer transition-colors ${cat === c ? 'bg-leaf text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{c}</button>
          ))}
        </div>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 && <p className="text-slate-600 col-span-full">No posts yet. Be the first to share something.</p>}
          {posts.map((p) => (
            <article key={p.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="chip bg-leaf/10 text-leaf text-xs">Post</span>
                <span className="text-xs text-slate-500">{p.author}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="mt-1 text-slate-600 text-sm line-clamp-2">{p.body}</p>
              <button className="mt-3 text-sm font-semibold text-sky hover:underline">Read more</button>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}"""

result = src[:start] + new_news + src[end:]
p.write_text(result, encoding='utf-8')
print('done')
