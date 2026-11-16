export default function Header({ route, user, onLogout }) {
  const link = (href, label, active) => (
    <a href={href} className="nav-link" aria-current={active ? 'page' : undefined}>
      {label}
    </a>
  )

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#/" className="brand" aria-label="Home">
          <span className="brand-mark" aria-hidden="true" />
          Speak Up
        </a>
        <nav aria-label="Main">
          {link('#/', 'Home', route.name === 'home')}
          {link('#/campaigns', 'Campaigns', route.name === 'campaigns')}
          {user ? (
            <>
              <span className="nav-link" role="status">
                Logged in as {user.name || 'Demo'}
              </span>
              <button className="nav-link" type="button" onClick={onLogout}>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                </svg>
                Log out
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
