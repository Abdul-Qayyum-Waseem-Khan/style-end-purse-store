import React from 'react';

export function Logo({ className = 'h-9 sm:h-10 w-auto', light = false }: { className?: string; light?: boolean }) {
  return (
    <img
      src="/style-end-logo.svg"
      alt="Style End Purse"
      className={`object-contain select-none ${light ? 'brightness-0 invert' : ''} ${className}`}
    />
  );
}
