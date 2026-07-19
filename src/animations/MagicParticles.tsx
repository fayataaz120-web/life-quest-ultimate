/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  fadeSpeed: number;
  color: string;
  isRune: boolean;
  char?: string;
  rotation?: number;
  rotSpeed?: number;
}

export const MagicParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const colors = [
      'rgba(16, 185, 129, ',  // Emerald
      'rgba(59, 130, 246, ',  // Blue
      'rgba(139, 92, 246, ',  // Purple
      'rgba(245, 158, 11, ',  // Gold
    ];
    const runes = ['▲', '◆', '❖', '⚙', '✦', '⚔', '🛡', '❈', '✧'];

    // Initialize particles
    const maxParticles = Math.min(80, Math.floor((width * height) / 18000));
    
    const createParticle = (initY = false): Particle => {
      const size = Math.random() * 2 + 1.2;
      const isRune = Math.random() < 0.15;
      const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      const maxOpacity = Math.random() * 0.35 + 0.15;

      return {
        x: Math.random() * width,
        y: initY ? Math.random() * height : height + 10,
        size: isRune ? size * 3.5 : size,
        speedY: -(Math.random() * 0.45 + 0.15),
        speedX: (Math.random() * 0.3 - 0.15),
        opacity: initY ? Math.random() * maxOpacity : 0.01,
        maxOpacity,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        color: colorPrefix,
        isRune,
        char: isRune ? runes[Math.floor(Math.random() * runes.length)] : undefined,
        rotation: isRune ? Math.random() * Math.PI * 2 : undefined,
        rotSpeed: isRune ? (Math.random() * 0.01 - 0.005) : undefined,
      };
    };

    // Populate initial state
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const resizeHandler = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    let lastTime = performance.now();

    const draw = (time: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw subtle moving fog/aurora gradient at the bottom/top
      const gradient = ctx.createLinearGradient(0, height, width, height - 250);
      gradient.addColorStop(0, 'rgba(11, 15, 25, 0)');
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.01)');
      gradient.addColorStop(1, 'rgba(11, 15, 25, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - 300, width, 300);

      // Render & Update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Drifting movement
        p.y += p.speedY;
        p.x += p.speedX;

        // Fade in / out logic
        if (p.y < 0) {
          // Recycle
          particles[i] = createParticle(false);
          continue;
        }

        if (p.opacity < p.maxOpacity && p.y > height - 100) {
          p.opacity += p.fadeSpeed;
        } else if (p.y < 150) {
          p.opacity -= p.fadeSpeed;
        }
        
        // Safe bound checks
        p.opacity = Math.max(0.001, Math.min(p.maxOpacity, p.opacity));

        // Draw particle
        ctx.save();
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.shadowBlur = p.isRune ? 8 : 4;
        ctx.shadowColor = p.color.replace('rgba', 'rgb').split(',').slice(0, 3).join(',') + ')';

        if (p.isRune && p.char && p.rotation !== undefined && p.rotSpeed !== undefined) {
          p.rotation += p.rotSpeed;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = `${p.size}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.char, 0, 0);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // request next frame if page is active
      if (!document.hidden) {
        requestRef.current = requestAnimationFrame(draw);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      } else {
        requestRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start loop
    requestRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default MagicParticles;
