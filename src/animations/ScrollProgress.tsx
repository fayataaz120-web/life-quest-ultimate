/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useScroll } from 'motion/react';

interface ScrollProgressProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ containerRef }) => {
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReduced) return null;

  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 z-50 shadow-[0_0_8px_rgba(16,185,129,0.5)] pointer-events-none"
    />
  );
};

export default ScrollProgress;
