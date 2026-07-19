/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { LucideIcon } from '../components/LucideIcon';
import { sfx } from '../utils/audio';

// 1. PREMIUM MAGIC BUTTON (with click ripples and hover lifts)
interface MagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  emeraldGlow?: boolean;
  className?: string;
}

export const MagicButton: React.FC<MagicButtonProps> = ({
  children,
  emeraldGlow = false,
  className = '',
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sfx.playClick();

    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();

      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const glowStyle = emeraldGlow 
    ? { borderColor: 'rgba(16, 185, 129, 0.45)', boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)' }
    : { borderColor: 'rgba(59, 130, 246, 0.35)', boxShadow: '0 0 10px rgba(59, 130, 246, 0.15)' };

  return (
    <motion.button
      ref={buttonRef}
      whileHover={{ scale: 1.035, ...glowStyle }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 14 }}
      onClick={handleClick}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      {...(props as any)}
    >
      {/* Click ripples layer */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full pointer-events-none bg-white/20 animate-ripple shrink-0"
          style={{
            left: r.x,
            top: r.y,
            width: 10,
            height: 10,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// 2. PREMIUM TILT CARD (Interactive 3D Mouse Tilt)
interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const MagicCard: React.FC<MagicCardProps> = ({
  children,
  className = '',
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for tracking cursor relative to card center
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to interpolate angle
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 220, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    // Disable tilt on mobile/tablets
    if (window.innerWidth < 1024) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalized coordinates (-0.5 to 0.5)
    const normX = (e.clientX - rect.left) / width - 0.5;
    const normY = (e.clientY - rect.top) / height - 0.5;

    x.set(normX);
    y.set(normY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ 
        scale: 1.015,
        borderColor: 'rgba(59, 130, 246, 0.25)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.55), 0 0 15px rgba(59,130,246,0.03)'
      }}
      transition={{ duration: 0.25 }}
      className={`border rounded-xl backdrop-blur-md transition-colors duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 3. BOUNCING INTERACTIVE ICON
interface MagicIconProps {
  name: string;
  size?: number;
  selected?: boolean;
  className?: string;
}

export const MagicIcon: React.FC<MagicIconProps> = ({
  name,
  size = 18,
  selected = false,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ rotate: 15, scale: 1.15 }}
      animate={selected ? { y: [0, -3, 0] } : {}}
      transition={selected ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } : { duration: 0.2 }}
      className={`inline-flex items-center justify-center shrink-0 ${className} ${selected ? 'drop-shadow-[0_0_5px_currentColor]' : ''}`}
    >
      <LucideIcon name={name as any} size={size} />
    </motion.div>
  );
};
