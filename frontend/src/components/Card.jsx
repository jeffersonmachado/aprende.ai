export default function Card({ title, children, action }) {
  return <section className="card"><div className="card-header"><h3>{title}</h3>{action || null}</div><div>{children}</div></section>;
}
