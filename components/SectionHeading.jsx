
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && (
          <div className="section-kicker">
            {eyebrow}
          </div>
        )}

        <h2 className="section-title">
          {title}
        </h2>

        {description && (
          <p className="section-desc">
            {description}
          </p>
        )}
      </div>

      {href && linkLabel && (
        <Link href={href} className="text-link">
          {linkLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
