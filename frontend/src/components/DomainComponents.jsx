export function RewardPill({ label, value }) {
  return (
    <span className="reward-pill">
      <strong>{label}</strong>
      <span>{value}</span>
    </span>
  );
}

export function JourneyStageCard({ title, subtitle, description, details = [], selected, onClick }) {
  return (
    <button
      type="button"
      className={`journey-stage-card ${selected ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="stage-kicker">{subtitle}</span>
      <strong>{title}</strong>
      <p>{description}</p>
      {details.map((detail) => (
        <p key={detail} className="stage-detail">{detail}</p>
      ))}
    </button>
  );
}

export function ScenarioOptionCard({ title, rationale, risk, consequence, selected, onClick }) {
  return (
    <button
      type="button"
      className={`scenario-option-card ${selected ? 'active' : ''}`}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <p>{rationale}</p>
      <div className="option-meta">
        <span>Risco: {risk}</span>
        <span>Consequencia: {consequence}</span>
      </div>
    </button>
  );
}

export function MentorCard({ title, value }) {
  return (
    <div className="mentor-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function CompetencyMeter({ label, value, baseline }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  const safeBaseline = baseline === undefined
    ? null
    : Math.max(0, Math.min(100, Number(baseline || 0)));

  return (
    <div className="competency-meter">
      <div className="row-between">
        <strong>{label}</strong>
        <span>{safeValue}%</span>
      </div>
      <div className="meter-track">
        {safeBaseline !== null ? <div className="meter-baseline" style={{ width: `${safeBaseline}%` }} /> : null}
        <div className="meter-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function DiagnosticMiniCard({ label, value }) {
  return (
    <div className="diagnostic-mini-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function TimelineStep({ title, status, difficulty, competencies, current }) {
  return (
    <div className={`timeline-step ${current ? 'current' : ''}`}>
      <div className="row-between wrap gap-sm">
        <strong>{title}</strong>
        <div className="inline-pills">
          <span className="status-pill">{status}</span>
          <span className="status-pill">{difficulty}</span>
        </div>
      </div>
      <p>Competencias: {competencies}</p>
    </div>
  );
}

export function JourneySummaryCard({ title, children }) {
  return (
    <article className="journey-summary-card">
      <h4>{title}</h4>
      {children}
    </article>
  );
}