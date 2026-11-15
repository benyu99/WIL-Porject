import { useState, useMemo } from 'react'
import { campaigns, getStatus } from '../data/campaigns'
import CampaignCard from '../components/CampaignCard'
import CampaignFilters from '../components/CampaignFilters'

export default function CampaignList({ initialCategory = '', initialStatus = '' }) {
  const [category, setCategory] = useState(initialCategory)
  const [status, setStatus] = useState(initialStatus)

  const visible = useMemo(
    () =>
      campaigns.filter(
        (c) =>
          (!category || c.category === category) &&
          (!status || getStatus(c) === status),
      ),
    [category, status],
  )

  const clear = () => {
    setCategory('')
    setStatus('')
  }

  return (
    <main className="container page">
      <h1 className="page-title">Campaigns</h1>
      <p className="page-intro">
        Browse awareness campaigns running near you and online. Filter by topic or by what’s
        happening now.
      </p>

      <CampaignFilters
        category={category}
        status={status}
        onCategory={setCategory}
        onStatus={setStatus}
      />

      <p className="result-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'campaign' : 'campaigns'}
      </p>

      {visible.length > 0 ? (
        <div className="grid">
          {visible.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>No campaigns match these filters</h2>
          <p>Try a different category or status, or clear the filters to see everything.</p>
          <button type="button" className="btn btn-primary" onClick={clear}>
            Clear filters
          </button>
        </div>
      )}
    </main>
  )
}
