
const labels = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  completed: 'Selesai',
  waiting: 'Menunggu Diproses',
  ready: 'Siap Diambil',
  collected: 'Sudah Diambil'
};

const tones = {
  pending: 'warning',
  waiting: 'warning',
  approved: 'success',
  completed: 'success',
  ready: 'info',
  collected: 'success',
  rejected: 'danger'
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();

  return (
    <span className={`pill status-${tones[key] || 'neutral'}`}>
      {labels[key] || status || '—'}
    </span>
  );
}
