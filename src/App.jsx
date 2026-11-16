import { useEffect, useState } from 'react'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import CampaignList from './pages/CampaignList'
import LoginPage from './pages/login'
import RegisterPage from './pages/RegisterPage'
import { useAuth } from './hooks/useAuth'
import { campaigns } from './data/campaigns'
import './App.css'

// Tiny hash router, so no extra dependency is needed.
// If your team already uses react-router, swap this out for <Routes>.
function parseHash() {
  const raw = window.location.hash
    ? window.location.hash.replace(/^#/, '')
    : window.location.pathname || '/'
  const [path, query = ''] = raw.split('?')
  const params = new URLSearchParams(query)
  const parts = path.split('/').filter(Boolean)

  if (parts[0] === 'login') return { name: 'login' }
  if (parts[0] === 'register') return { name: 'register' }
  if (parts[0] === 'campaigns' && parts[1]) return { name: 'detail', id: parts[1] }
  if (parts[0] === 'campaigns') {
    return {
      name: 'campaigns',
      category: params.get('category') || '',
      status: params.get('status') || '',
    }
  }
  return { name: 'home' }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const { user, isAuthenticated, loading, logout } = useAuth()

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated && !['login', 'register'].includes(route.name)) {
      window.location.hash = '#/login'
    }
  }, [isAuthenticated, loading, route.name])

  if (loading && !['login', 'register'].includes(route.name)) return null

  const currentRoute =
    !isAuthenticated && !['login', 'register'].includes(route.name)
      ? { name: 'login' }
      : route

  let page
  if (currentRoute.name === 'campaigns') {
    // key forces a fresh filter state when arriving from a topic link
    page = <CampaignList key={currentRoute.category + currentRoute.status} initialCategory={currentRoute.category} initialStatus={currentRoute.status} />
  } else if (currentRoute.name === 'login') {
    page = <LoginPage />
  } else if (currentRoute.name === 'register') {
    page = <RegisterPage />
  } else if (currentRoute.name === 'detail') {
    const c = campaigns.find((x) => x.id === currentRoute.id)
    page = (
      <main className="container page">
        <a className="text-link" href="#/campaigns">Back to campaigns</a>
        <h1 className="page-title">{c ? c.title : 'Campaign not found'}</h1>
        <p className="page-intro">Campaign details page coming soon.</p>
      </main>
    )
  } else {
    page = <LandingPage />
  }

  return (
    <>
      <Header route={currentRoute} user={user} onLogout={logout} />
      {page}
    </>
  )
}
