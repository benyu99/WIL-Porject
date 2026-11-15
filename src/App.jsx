import { useEffect, useState } from 'react'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import CampaignList from './pages/CampaignList'
import { campaigns } from './data/campaigns'
import './App.css'

// Tiny hash router, so no extra dependency is needed.
// If your team already uses react-router, swap this out for <Routes>.
function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, query = ''] = raw.split('?')
  const params = new URLSearchParams(query)
  const parts = path.split('/').filter(Boolean)

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

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  let page
  if (route.name === 'campaigns') {
    // key forces a fresh filter state when arriving from a topic link
    page = <CampaignList key={route.category + route.status} initialCategory={route.category} initialStatus={route.status} />
  } else if (route.name === 'detail') {
    const c = campaigns.find((x) => x.id === route.id)
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
      <Header route={route} />
      {page}
    </>
  )
}
