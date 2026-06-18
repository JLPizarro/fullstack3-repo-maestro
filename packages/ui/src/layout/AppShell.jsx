import React from 'react'

export function AppShell({
  navItems = [],
  brandHref = '#',
  brandText = 'Hub Empresarial',
  children,
}) {
  return (
    <div className="ui-page">
      <header className="ui-topbar">
        <div className="ui-container ui-topbar-inner">
          <a className="ui-brand" href={brandHref} aria-label={brandText}>
            <span className="ui-brand-mark" aria-hidden="true" />
            <span className="ui-brand-text">{brandText}</span>
          </a>

          <nav className="ui-nav" aria-label="Módulos">
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={`ui-navlink ${n.active ? 'ui-navlink-active' : ''}`}
                aria-current={n.active ? 'page' : undefined}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="ui-main">
        <div className="ui-container">{children}</div>
      </main>
    </div>
  )
}

