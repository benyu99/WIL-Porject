import { CATEGORIES, STATUSES } from '../data/campaigns'

function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className="filter-group" role="group" aria-label={label}>
      <span className="filter-label">{label}</span>
      <div className="chips">
        {['All', ...options].map((opt) => {
          const selected = (opt === 'All' && value === '') || opt === value
          return (
            <button
              key={opt}
              type="button"
              className="chip"
              aria-pressed={selected}
              onClick={() => onChange(opt === 'All' ? '' : opt)}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CampaignFilters({ category, status, onCategory, onStatus }) {
  return (
    <div className="filters">
      <ChipGroup label="Category" options={CATEGORIES} value={category} onChange={onCategory} />
      <ChipGroup label="Status" options={STATUSES} value={status} onChange={onStatus} />
    </div>
  )
}
