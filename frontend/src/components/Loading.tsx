export function Loading({ label = 'Загрузка...' }: { label?: string }) {
  return <div className="loading"><span className="spinner" />{label}</div>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><div className="empty-icon">∅</div><h3>{title}</h3><p>{text}</p></div>;
}
