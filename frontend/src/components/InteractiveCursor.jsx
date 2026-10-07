import React, { useEffect, useState } from 'react';

export function InteractiveCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isTouch = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    if (isTouch) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target;
      const clickable = target && target.closest ? target.closest('button, a, input, select, textarea, [role="button"], .interactive, .cursor-pointer') : null;
      setIsPointer(Boolean(clickable));
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isTouch]);

  if (isTouch || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Sleek Dot Circle with Soft Radial Gradient Shaded Edge */}
      <div
        className="fixed rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isPointer ? '18px' : '12px',
          height: isPointer ? '18px' : '12px',
          background: isPointer
            ? 'radial-gradient(circle, #34D399 0%, #10B981 40%, rgba(6, 182, 212, 0.45) 70%, transparent 100%)'
            : 'radial-gradient(circle, #34D399 0%, #10B981 45%, rgba(16, 185, 129, 0.35) 75%, transparent 100%)',
          boxShadow: isPointer
            ? '0 0 12px rgba(52, 211, 153, 0.8), 0 0 4px rgba(16, 185, 129, 0.9)'
            : '0 0 8px rgba(52, 211, 153, 0.6), 0 0 2px rgba(16, 185, 129, 0.8)',
          filter: 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.6))',
        }}
      />
    </div>
  );
}
