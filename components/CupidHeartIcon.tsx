import React from 'react';

export const CupidHeartIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = '' }) => {
  return (
    <span 
      style={{ fontSize: size ? `${size}px` : '22px', lineHeight: 1 }} 
      className={`inline-flex items-center justify-center select-none ${className}`}
      role="img"
      aria-label="Suami Istri"
    >
      💘
    </span>
  );
};
