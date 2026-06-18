import React from 'react'

export function ModuleHeader({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  right,
  tabs,
}) {
  return (
    <section className="ui-header">
      {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="ui-title">
            {title}
            {titleAccent ? <span className="ui-title-accent"> {titleAccent}</span> : null}
          </h1>
          {subtitle ? <p className="ui-subtitle">{subtitle}</p> : null}
        </div>

        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </div>

      {tabs ? <div className="mt-4">{tabs}</div> : null}
    </section>
  )
}

