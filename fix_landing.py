import pathlib, re

p = pathlib.Path('C:/Users/korir/Downloads/wilmark/frontend/src/pages/Landing.jsx')
src = p.read_text(encoding='utf-8')

# Find the news section start and end
news_start = src.index('{/* News and posts */}')
# Find the closing </section> after news
# We'll find the aside closing and then the section closing
search_from = news_start
# find end of the news section by locating the Weekly digest section
weekly_start = src.index('{/* Weekly digest */}')

old_news_section = src[news_start:weekly_start]

new_news_section = '''      {/* News and posts */}
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
                <div className="text-4xl mb-3">&#x1F4DD;</div>
                <h3 className="text-slate-600">No posts yet</h3>
                <p className="text-slate-500 text-sm mt-1">Be the first to share something on the <Link to="/news" className="text-leaf underline">News page</Link>.</p>
              </div>
            ) : filtered.map((post, i) => (
              <article key={i} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`chip text-xs ${post.catColor}`}>{post.category}</span>
                </div>
                <h3>{post.title}</h3>
                <p className="mt-2 text-slate-600 text-sm">{post.text}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.tags.map(t => <span key={t} className="text-xs text-sky font-medium">#{t}</span>)}
                </div>
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
              <h3 className="font-display font-bold mb-3">Trending this week</h3>
              <ul className="space-y-3">
                {trending.map(t => (
                  <li key={t} className="text-sm text-slate-700 border-b border-slate-100 pb-2 last:border-0">{t}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="font-display font-bold mb-3">Contributor spotlight</h3>
              {contributors.map(({ initials, name, role, color }) => (
                <div key={name} className="flex items-center gap-3 mb-4 last:mb-0">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${color} text-white font-bold text-sm`}>{initials}</span>
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      '''

result = src[:news_start] + new_news_section + src[weekly_start:]
p.write_text(result, encoding='utf-8')
print('done')
