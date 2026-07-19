/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';

export type WeatherTheme =
  | 'Clear Night'
  | 'Rain'
  | 'Snow'
  | 'Fog'
  | 'Aurora'
  | 'Floating Lanterns'
  | 'Magic Storm';

// Global helper to switch weather system
export const setGlobalWeather = (theme: WeatherTheme) => {
  localStorage.setItem('ultimate-quest-weather', theme);
  window.dispatchEvent(new CustomEvent('magic-weather-change', { detail: theme }));
};

export const WeatherSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeWeather, setActiveWeather] = useState<WeatherTheme>(() => {
    return (localStorage.getItem('ultimate-quest-weather') as WeatherTheme) || 'Clear Night';
  });

  // Track weather settings changes
  useEffect(() => {
    const handleWeatherChange = (e: Event) => {
      const customEvent = e as CustomEvent<WeatherTheme>;
      setActiveWeather(customEvent.detail);
    };

    window.addEventListener('magic-weather-change', handleWeatherChange);
    return () => {
      window.removeEventListener('magic-weather-change', handleWeatherChange);
    };
  }, []);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Weather elements arrays
    let elements: any[] = [];
    let flashes: number = 0; // used for magic storms
    let windAngle = 0;

    const initWeather = (theme: WeatherTheme) => {
      elements = [];
      flashes = 0;

      if (theme === 'Clear Night') {
        // Twinkling stars
        for (let i = 0; i < 40; i++) {
          elements.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.7),
            size: Math.random() * 1.5 + 0.8,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            phase: Math.random() * Math.PI,
          });
        }
      } else if (theme === 'Rain') {
        // Raindrops
        for (let i = 0; i < 75; i++) {
          elements.push({
            x: Math.random() * width,
            y: Math.random() * height,
            length: Math.random() * 15 + 10,
            vy: Math.random() * 8 + 12,
            vx: -2, // slightly angled
          });
        }
      } else if (theme === 'Snow') {
        // Snowflakes
        for (let i = 0; i < 55; i++) {
          elements.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1,
            vy: Math.random() * 0.8 + 0.5,
            swing: Math.random() * 2 + 1,
            swingSpeed: Math.random() * 0.02 + 0.01,
            phase: Math.random() * Math.PI,
          });
        }
      } else if (theme === 'Floating Lanterns') {
        // Lanterns
        for (let i = 0; i < 18; i++) {
          elements.push({
            x: Math.random() * width,
            y: height + Math.random() * 100,
            w: Math.random() * 10 + 10,
            h: Math.random() * 12 + 12,
            vy: -(Math.random() * 0.4 + 0.25),
            sway: Math.random() * 15,
            swaySpeed: Math.random() * 0.01 + 0.005,
            phase: Math.random() * Math.PI,
          });
        }
      } else if (theme === 'Magic Storm') {
        // Spark clouds & lightning arcs
        for (let i = 0; i < 15; i++) {
          elements.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1,
            vy: -(Math.random() * 2 + 1), // floating upwards quickly
            vx: (Math.random() - 0.5) * 2,
            color: Math.random() < 0.5 ? '#a855f7' : '#06b6d4', // Purple / Cyan
            life: Math.random() * 50 + 50,
          });
        }
      }
    };

    initWeather(activeWeather);

    const resizeHandler = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initWeather(activeWeather);
    };
    window.addEventListener('resize', resizeHandler);

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (activeWeather === 'Clear Night') {
        // Draw Twinkling Stars
        elements.forEach((star) => {
          star.phase += star.twinkleSpeed;
          const alpha = (Math.sin(star.phase) + 1) / 2 * 0.8 + 0.2;
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (activeWeather === 'Rain') {
        // Draw angled rain
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.25)';
        ctx.lineWidth = 1.2;
        elements.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.vx, drop.y + drop.length);
          ctx.stroke();

          // Move
          drop.y += drop.vy;
          drop.x += drop.vx;

          // Recycle
          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * width;
          }
        });
      } else if (activeWeather === 'Snow') {
        // Draw drift snow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        elements.forEach((flake) => {
          flake.phase += flake.swingSpeed;
          const currentX = flake.x + Math.sin(flake.phase) * flake.swing;

          ctx.beginPath();
          ctx.arc(currentX, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();

          flake.y += flake.vy;

          // Recycle
          if (flake.y > height) {
            flake.y = -5;
            flake.x = Math.random() * width;
          }
        });
      } else if (activeWeather === 'Fog') {
        // Draw foggy layered gradients drifting
        windAngle += 0.0035;
        const driftX = Math.sin(windAngle) * 50;

        ctx.save();
        const fog = ctx.createLinearGradient(driftX, height, driftX + width * 0.8, height - 180);
        fog.addColorStop(0, 'rgba(148, 163, 184, 0.06)');
        fog.addColorStop(0.5, 'rgba(148, 163, 184, 0.03)');
        fog.addColorStop(1, 'rgba(148, 163, 184, 0.0)');
        ctx.fillStyle = fog;
        ctx.fillRect(0, height - 200, width, 200);

        const fogTop = ctx.createLinearGradient(width - driftX, 0, width - driftX - width * 0.8, 150);
        fogTop.addColorStop(0, 'rgba(148, 163, 184, 0.04)');
        fogTop.addColorStop(1, 'rgba(148, 163, 184, 0.0)');
        ctx.fillStyle = fogTop;
        ctx.fillRect(0, 0, width, 180);
        ctx.restore();
      } else if (activeWeather === 'Aurora') {
        // Draw colorful multiple Aurora ribbons
        windAngle += 0.002;
        const drawRibbon = (color1: string, color2: string, heightMult: number, phaseShift: number) => {
          ctx.save();
          const gr = ctx.createLinearGradient(0, 0, width, 0);
          gr.addColorStop(0, color1);
          gr.addColorStop(0.7, color2);
          gr.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 40) {
            const y = height * heightMult + Math.sin(x * 0.0025 + windAngle + phaseShift) * 45;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };

        // Emerald / Cyan / Violet curtains
        drawRibbon('rgba(16, 185, 129, 0.02)', 'rgba(6, 182, 212, 0.015)', 0.4, 0);
        drawRibbon('rgba(139, 92, 246, 0.015)', 'rgba(236, 72, 153, 0.01)', 0.48, Math.PI / 3);
      } else if (activeWeather === 'Floating Lanterns') {
        // Draw warm lanterns drifting up
        elements.forEach((l) => {
          l.phase += l.swaySpeed;
          const currentX = l.x + Math.sin(l.phase) * l.sway;

          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
          
          // Outer paper shell
          ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.fillRect(currentX, l.y, l.w, l.h);

          // Inner glowing core
          ctx.fillStyle = 'rgba(253, 224, 71, 0.8)';
          ctx.fillRect(currentX + l.w * 0.25, l.y + l.h * 0.4, l.w * 0.5, l.h * 0.5);

          ctx.restore();

          l.y += l.vy;

          // Recycle
          if (l.y < -l.h) {
            l.y = height + Math.random() * 50;
            l.x = Math.random() * width;
          }
        });
      } else if (activeWeather === 'Magic Storm') {
        // 1. Draw lightning flashes occasionally
        if (Math.random() < 0.004 && flashes === 0) {
          flashes = Math.floor(Math.random() * 3) + 2; // flash count
        }

        if (flashes > 0) {
          if (Math.random() < 0.4) {
            ctx.save();
            ctx.fillStyle = Math.random() < 0.5 ? 'rgba(168, 85, 247, 0.07)' : 'rgba(6, 182, 212, 0.07)';
            ctx.fillRect(0, 0, width, height);

            // Draw a quick jagged lightning arc down
            ctx.strokeStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#06b6d4';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            let startX = Math.random() * width;
            ctx.moveTo(startX, 0);
            for (let segY = 50; segY < height * 0.75; segY += 45) {
              startX += (Math.random() - 0.5) * 60;
              ctx.lineTo(startX, segY);
            }
            ctx.stroke();
            ctx.restore();
            flashes--;
          }
        }

        // 2. Draw rising electric magic embers
        elements.forEach((p, idx) => {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Move
          p.y += p.vy;
          p.x += p.vx;
          p.life--;

          // Recycle
          if (p.life <= 0 || p.y < -10) {
            elements[idx] = {
              x: Math.random() * width,
              y: height + 20,
              size: Math.random() * 3 + 1,
              vy: -(Math.random() * 2 + 1),
              vx: (Math.random() - 0.5) * 2,
              color: Math.random() < 0.5 ? '#a855f7' : '#06b6d4',
              life: Math.random() * 50 + 50,
            };
          }
        });
      }

      if (!document.hidden) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(animationId);
    };
  }, [activeWeather]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-60"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
export default WeatherSystem;
