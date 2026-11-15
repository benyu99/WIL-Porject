// Sample data for FR-02. Replace with your real source (API / Firebase / JSON) later.
// Keep the same field names and the rest of the UI will keep working.
// Dates are ISO strings (YYYY-MM-DD). Use location: "Online" for virtual campaigns.

export const CATEGORIES = [
  'Mental health',
  'Environment',
  'Road safety',
  'Community safety',
  'Public health',
]

export const STATUSES = ['Upcoming', 'Active', 'Ended']

export const campaigns = [
  {
    id: 'c1',
    title: 'Check In, Not Out',
    category: 'Mental health',
    description:
      'Peer-led conversations that teach students and workers how to ask "are you okay?" and what to do after the answer.',
    startDate: '2026-10-01',
    endDate: '2026-11-30',
    location: 'Canberra City',
    image: '',
  },
  {
    id: 'c2',
    title: 'Plastic-Free Lake Month',
    category: 'Environment',
    description:
      'Weekend clean-ups and a reusable-cup swap around Lake Burley Griffin. Gloves and bags are provided.',
    startDate: '2026-10-10',
    endDate: '2026-11-10',
    location: 'Lake Burley Griffin',
    image: '',
  },
  {
    id: 'c3',
    title: 'Slow Down Near Schools',
    category: 'Road safety',
    description:
      'A term-long push for safer school zones, with parent volunteers, speed-awareness signage and short driver pledges.',
    startDate: '2026-11-09',
    endDate: '2026-12-11',
    location: 'Tuggeranong',
    image: '',
  },
  {
    id: 'c4',
    title: 'Night Walk Together',
    category: 'Community safety',
    description:
      'Community walks and a safety-tips toolkit to help people feel confident getting home after dark.',
    startDate: '2026-11-20',
    endDate: '2026-11-27',
    location: 'Gungahlin',
    image: '',
  },
  {
    id: 'c5',
    title: 'Talk It Out Online',
    category: 'Mental health',
    description:
      'A free four-week webinar series on stress, sleep and burnout, with a live Q&A from a registered psychologist.',
    startDate: '2026-10-19',
    endDate: '2026-11-13',
    location: 'Online',
    image: '',
  },
  {
    id: 'c6',
    title: 'Get Vaccinated, Protect Others',
    category: 'Public health',
    description:
      'Pop-up information stalls explaining seasonal vaccines, who is eligible and where to book a free appointment.',
    startDate: '2026-08-03',
    endDate: '2026-09-18',
    location: 'Woden',
    image: '',
  },
  {
    id: 'c7',
    title: 'Ride Safe, Ride Seen',
    category: 'Road safety',
    description:
      'Free bike-light fitting and a visibility check for commuters, plus a guide to sharing the road with trucks.',
    startDate: '2026-09-01',
    endDate: '2026-10-05',
    location: 'Belconnen',
    image: '',
  },
  {
    id: 'c8',
    title: 'Plant 1,000 Trees',
    category: 'Environment',
    description:
      'Join planting days to restore native bushland. Learn which species to plant and how to care for seedlings.',
    startDate: '2026-12-05',
    endDate: '2027-01-31',
    location: 'Mount Majura',
    image: '',
  },
  {
    id: 'c9',
    title: 'Know Your Numbers',
    category: 'Public health',
    description:
      'An online hub with simple explainers on blood pressure, cholesterol and diabetes screening, and when to see a GP.',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    location: 'Online',
    image: '',
  },
]

// Status is derived from the dates, so it never goes stale.
export function getStatus(campaign, today = new Date()) {
  const iso = today.toISOString().slice(0, 10)
  if (iso < campaign.startDate) return 'Upcoming'
  if (iso > campaign.endDate) return 'Ended'
  return 'Active'
}

export function formatDateRange(start, end) {
  const fmt = (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  return `${fmt(start)} – ${fmt(end)}`
}
