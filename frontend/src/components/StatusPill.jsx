export default function StatusPill({ value }) {
  const normalized = String(value || 'unknown').toLowerCase();
  return <span className={`status-pill ${normalized}`}>{value || 'unknown'}</span>;
}
