import React from 'react';

interface SatelliteEmblemProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function SatelliteEmblem({ 
  size = 20, 
  className = '', 
  ...props 
}: SatelliteEmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="SatQuery Remote Sensing Logo"
      {...props}
    >
      <path d="M13 7 9 3 5 7l4 4" />
      <path d="m17 11 4 4-4 4-4-4" />
      <path d="m8 12 4 4" />
      <path d="m16 8-4-4" />
      <path d="M12 12l.01 0" />
      <path d="M4 20a10 10 0 0 1 10-10" />
      <path d="M4 16a6 6 0 0 1 6-6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}