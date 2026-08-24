import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Komponen untuk memberikan warna sorotan (highlight) pada kata atau angka yang cocok dengan kata kunci pencarian.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-amber-200 text-amber-950 dark:bg-amber-400/35 dark:text-amber-200 px-1 py-0.5 rounded font-semibold shadow-xs'
}) => {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Pisahkan query menjadi kata-kata kunci dan escape karakter khusus regex
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Buat regex pencarian case-insensitive
  const pattern = `(${terms.join('|')})`;
  const regex = new RegExp(pattern, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = terms.some(term => new RegExp(`^${term}$`, 'i').test(part));
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export default HighlightText;
