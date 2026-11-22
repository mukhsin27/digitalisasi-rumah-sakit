
export default function EmptyState({
  title = 'Belum ada data',
  description = 'Data akan ditampilkan setelah tersedia.'
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
