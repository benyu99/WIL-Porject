import { campaigns, getStatus, CATEGORIES } from '../data/campaigns'
import CampaignCard from '../components/CampaignCard'

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-')

export default function LandingPage() {
  const featured = campaigns.filter((c) => getStatus(c) === 'Active').slice(0, 3)

  return (
    <main>
      <section className="hero">
        <div className="container hero-inner">
          <h1 className="hero-title">Awareness starts when someone shows up.</h1>
          <p className="hero-sub">
            Find social campaigns on mental health, the environment, road safety and more. See
            what’s on, where it is, and how to get involved.
          </p>
          <div className="hero-actions">
            <a className="btn btn-accent" href="#/campaigns">
              Browse campaigns
            </a>
            <a className="btn btn-ghost" href="#/campaigns?status=Active">
              See what’s active now
            </a>
          </div>
        </div>
      </section>

      <section className="container section" aria-labelledby="topics-h">
        <h2 id="topics-h" className="section-title">Pick a cause</h2>
        <ul className="topic-list">
          {CATEGORIES.map((cat) => {
            const count = campaigns.filter((c) => c.category === cat).length
            return (
              <li key={cat}>
                <a
                  className={`topic cat-${slug(cat)}`}
                  href={`#/campaigns?category=${encodeURIComponent(cat)}`}
                >
                  <span className="topic-name">{cat}</span>
                  <span className="topic-count">
                    {count} {count === 1 ? 'campaign' : 'campaigns'}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      {featured.length > 0 && (
        <section className="container section" aria-labelledby="now-h">
          <div className="section-head">
            <h2 id="now-h" className="section-title">Happening now</h2>
            <a className="text-link" href="#/campaigns?status=Active">View all active</a>
          </div>
          <div className="grid">
            {featured.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}

      <section className="container section" aria-labelledby="how-h">
        <h2 id="how-h" className="section-title">How it works</h2>
        <ol className="steps">
          <li>
            <h3>Browse</h3>
            <p>Scroll the campaign list or filter by cause and status.</p>
          </li>
          <li>
            <h3>Check the details</h3>
            <p>Open a campaign to see its dates, location and what to bring.</p>
          </li>
          <li>
            <h3>Show up</h3>
            <p>Join in person or online and pass it on to a friend.</p>
          </li>
        </ol>
      </section>

      <footer className="site-footer">
        <div className="container">Speak Up · A WIL project</div>
      </footer>
    </main>
  )
}
