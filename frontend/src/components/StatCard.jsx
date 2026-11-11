export default function StatCard({ label, value, note, icon: Icon, tone = "green" }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{Icon && <Icon size={19}/>}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>;
}
