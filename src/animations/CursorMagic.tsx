/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const CursorMagic: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, speed: 0 });
  const isHoveringRef = useRef(false);

  useEffect(() => {
    // Check if device supports touch pointer coarse (usually mobile/tablet)
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to cover window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const ripples: Ripple[] = [];

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      
      const dx = e.clientX - mouseRef.current.lastX;
      const dy = e.clientY - mouseRef.current.lastY;
      mouseRef.current.speed = Math.sqrt(dx * dx + dy * dy);

      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    // Track mouse clicks
    const handleMouseDown = (e: MouseEvent) => {
      // Spawn ripple
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 2,
        maxRadius: 35,
        alpha: 1,
        color: '#10b981', // Emerald
      });

      // Spawn burst of particles
      const count = 15;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1.5,
          color: Math.random() < 0.65 ? '#10b981' : '#fbbf24', // Emerald vs Gold
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
    };

    // Global event delegation to see if mouse is hovering an interactive element
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'INPUT' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') ||
        target.closest('a');

      isHoveringRef.current = !!isInteractive;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseover', handleMouseOver);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Spawn trails based on mouse movement speed and hovering status
      const spawnChance = isHoveringRef.current ? 0.95 : 0.4;
      if (Math.random() < spawnChance && mouseRef.current.speed > 0.5) {
        const pCount = isHoveringRef.current ? 3 : 1;
        for (let i = 0; i < pCount; i++) {
          const spread = isHoveringRef.current ? 8 : 3;
          particles.push({
            x: mouseRef.current.x + (Math.random() - 0.5) * spread,
            y: mouseRef.current.y + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8 - 0.3, // drift slightly up
            size: Math.random() * (isHoveringRef.current ? 3.5 : 2.2) + 1,
            color: Math.random() < 0.7 ? '#10b981' : '#fbbf24',
            alpha: 0.95,
            decay: Math.random() * 0.02 + 0.012,
          });
        }
      }

      // Decay mouse movement speed metric
      mouseRef.current.speed *= 0.9;

      // 2. Draw and update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw and update shockwave ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.15;
        r.alpha -= 0.045;

        if (r.alpha <= 0 || r.radius >= r.maxRadius - 0.5) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 6;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
