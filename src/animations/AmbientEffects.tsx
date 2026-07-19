/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  color: string;
  char?: string;
  rotation?: number;
  rotSpeed?: number;
  isRune?: boolean;
}

export const AmbientEffects: React.FC = () => {
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
    const maxParticles = 65;

    // Get time of day color theme adjustments
    const getHourColors = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        // Morning: warm peach/amber rays
        return {
          rayColor: 'rgba(251, 191, 36, 0.05)',
          auroraStart: 'rgba(251, 146, 60, 0.015)',
          auroraEnd: 'rgba(99, 102, 241, 0.01)'
        };
      } else if (hour >= 12 && hour < 17) {
        // Afternoon: bright blue/cyan
        return {
          rayColor: 'rgba(56, 189, 248, 0.04)',
          auroraStart: 'rgba(34, 211, 238, 0.01)',
          auroraEnd: 'rgba(16, 185, 129, 0.01)'
        };
      } else if (hour >= 17 && hour < 20) {
        // Evening: golden/rose purple
        return {
          rayColor: 'rgba(244, 63, 94, 0.04)',
          auroraStart: 'rgba(236, 72, 153, 0.015)',
          auroraEnd: 'rgba(124, 58, 237, 0.01)'
        };
      } else {
        // Night: deep emerald/stellar cyan (increased glow)
        return {
          rayColor: 'rgba(16, 185, 129, 0.07)',
          auroraStart: 'rgba(16, 185, 129, 0.02)',
          auroraEnd: 'rgba(6, 182, 212, 0.015)'
        };
      }
    };

    const runes = ['▲', '◆', '❖', '✦', '✧', '❈', '📜', '⚖', '🛡'];

    const createParticle = (initY = false): Particle => {
      const isRune = Math.random() < 0.15;
      const size = isRune ? Math.random() * 8 + 8 : Math.random() * 2 + 1;
      const maxOpacity = Math.random() * 0.35 + 0.1;
      
      const themeColors = getHourColors();
      const isEmerald = Math.random() < 0.7;
      const color = isEmerald ? 'rgba(16, 185, 129, ' : 'rgba(251, 191, 36, ';

      return {
        x: Math.random() * width,
        y: initY ? Math.random() * height : height + 20,
        size,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -(Math.random() * 0.35 + 0.1),
        opacity: initY ? Math.random() * maxOpacity : 0.01,
        maxOpacity,
        color,
        isRune,
        char: isRune ? runes[Math.floor(Math.random() * runes.length)] : undefined,
        rotation: isRune ? Math.random() * Math.PI * 2 : undefined,
        rotSpeed: isRune ? (Math.random() * 0.008 - 0.004) : undefined,
      };
    };

    // Populate initial particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const resizeHandler = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    let waveAngle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const theme = getHourColors();

      // 1. Draw Waving Aurora curtains
      waveAngle += 0.002;
      ctx.save();
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, theme.auroraStart);
      grad.addColorStop(0.5, theme.auroraEnd);
      grad.addColorStop(1, 'rgba(11, 15, 25, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 30) {
        // Double sine wave curves
        const yOffset1 = Math.sin(x * 0.0035 + waveAngle) * 55;
        const yOffset2 = Math.cos(x * 0.002 - waveAngle * 1.5) * 25;
        const y = height * 0.35 + yOffset1 + yOffset2;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Draw Soft Light Rays from top left corner
      ctx.save();
      const rayGrad = ctx.createRadialGradient(0, 0, 100, 0, 0, Math.max(width, height) * 0.85);
      rayGrad.addColorStop(0, theme.rayColor);
      rayGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.01)');
      rayGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width * 0.65, 0);
      ctx.lineTo(0, height * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Render and Update Particles (dust, emerald sparks, runes)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        // Reset if drifted off top or sides
        if (p.y < -30 || p.x < -30 || p.x > width + 30) {
          particles[i] = createParticle(false);
          continue;
        }

        // Fade in when newly spawned, fade out at the very top
        if (p.opacity < p.maxOpacity && p.y > height - 100) {
          p.opacity += 0.004;
        } else if (p.y < 120) {
          p.opacity -= 0.005;
        }
        p.opacity = Math.max(0.001, Math.min(p.maxOpacity, p.opacity));

        ctx.save();
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.shadowBlur = p.isRune ? 6 : 3;
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
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-70"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
export default AmbientEffects;
