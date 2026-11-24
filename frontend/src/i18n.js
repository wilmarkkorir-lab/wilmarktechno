const dict = {
  en: { developers: 'Developers', feed: 'Feed', projects: 'Projects', events: 'Events', jobs: 'Jobs', challenges: 'Challenges',
    join: 'Join free', logout: 'Log out', swaps: 'Skill swaps', messages: 'Messages', alerts: 'Alerts',
    heroTitle: 'Trade what you know for what you want to learn.',
    heroText: 'Wilmark Technologies is a community where developers swap skills, build projects together and grow faster than they would alone. Free and open to everyone.',
    ctaProfile: 'Create your profile', ctaBrowse: 'Browse developers' },
  sw: { developers: 'Wasanidi', feed: 'Machapisho', projects: 'Miradi', events: 'Matukio', jobs: 'Kazi', challenges: 'Changamoto',
    join: 'Jiunge bure', logout: 'Toka', swaps: 'Kubadilishana ujuzi', messages: 'Ujumbe', alerts: 'Arifa',
    heroTitle: 'Fundisha ulichonacho, jifunze unachotaka.',
    heroText: 'Wilmark Technologies ni jumuiya ambapo wasanidi hubadilishana ujuzi, hujenga miradi pamoja na hukua haraka zaidi. Ni bure na wazi kwa kila mtu.',
    ctaProfile: 'Tengeneza wasifu wako', ctaBrowse: 'Tazama wasanidi' } }
export const lang = () => localStorage.getItem('lang') || 'en'
export const setLang = (l) => { localStorage.setItem('lang', l); location.reload() }
export const t = (k) => dict[lang()][k] || dict.en[k]
