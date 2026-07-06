'use client';

import { playHoverSound } from '@/lib/sfx';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function InteractiveCard({ children, className }: InteractiveCardProps) {
  return (
    <div 
      className={className}
      onMouseEnter={() => playHoverSound()}
    >
      {children}
    </div>
  );
}
