
import type React from 'react';

export const PlusMinusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="7" x2="12" y2="11" /> {/* Top vertical part of plus */}
    <line x1="10" y1="9" x2="14" y2="9" /> {/* Horizontal part of plus */}
    <line x1="8" y1="15" x2="16" y2="15" /> {/* Minus sign below */}
  </svg>
);
