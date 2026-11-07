import { getStatus, formatDateRange } from '../data/campaigns'

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-')

export default function CampaignCard({ campaign }) {
  const status = getStatus(campaign)
  const isOnline = campaign.location.toLowerCase() === 'online'

  return (
    <article className="card">
      <div className={`card-image cat-${slug(campaign.category)}`}>
        {campaign.image && <img src={campaign.image} alt="" loading="lazy" />}
        <span className="chip-category">{campaign.category}</span>
      </div>

      <div className="card-body">
        <span className={`status status-${status.toLowerCase()}`}>{status}</span>
        <h3 className="card-title">{campaign.title}</h3>
        <p className="card-desc">{campaign.description}</p>

        <dl className="card-meta">
          <div>
            <dt>Dates</dt>
            <dd>{formatDateRange(campaign.startDate, campaign.endDate)}</dd>
          </div>
          <div>
            <dt>{isOnline ? 'Format' : 'Location'}</dt>
            <dd>{isOnline ? 'Online' : campaign.location}</dd>
          </div>
        </dl>

        <a
          className="btn btn-primary"
          href={`#/campaigns/${campaign.id}`}
          aria-label={`View details for ${campaign.title}`}
        >
          View details
        </a>
      </div>
    </article>
  )
}
