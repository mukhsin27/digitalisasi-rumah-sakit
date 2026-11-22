
import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Brand({ compact = false }) {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="MedCare Hospital - Beranda"
    >
      <span className="brand-mark">
        <Activity size={21} />
      </span>

      <span>
        medcare
        <span style={{ color: '#1684d2' }}>.</span>

        {!compact && (
          <small className="brand-caption"> hospital</small>
        )}
      </span>
    </Link>
  );
}
