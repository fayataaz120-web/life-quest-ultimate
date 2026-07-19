/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed: number; // e.g. -0.2 (slower scroll), 0.1 (standard), 0.3 (faster scroll)
  className?: string;
  style?: React.CSSProperties;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed,
  className = '',
  style = {},
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Map scroll Y offset to slow parallax translation factor
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      ref={ref}
      style={{
        ...style,
        y: isReduced ? 0 : y,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxLayer;
