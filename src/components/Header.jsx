export default function Header({ route }) {
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
        </nav>
      </div>
    </header>
  )
}
