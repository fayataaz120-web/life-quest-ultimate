/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  id?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  yOffset = 40,
  className = '',
  id,
}) => {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReduced) {
    return <div className={className} id={id}>{children}</div>;
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Premium cubic easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface RevealStaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delay?: number;
  className?: string;
  id?: string;
}

export const RevealStagger: React.FC<RevealStaggerProps> = ({
  children,
  staggerDelay = 0.08,
  delay = 0,
  className = '',
  id,
}) => {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReduced) {
    return <div className={className} id={id}>{children}</div>;
  }

  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface RevealItemProps {
  children: React.ReactNode;
  yOffset?: number;
  className?: string;
  id?: string;
}

export const RevealItem: React.FC<RevealItemProps> = ({
  children,
  yOffset = 30,
  className = '',
  id,
}) => {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReduced) {
    return <div className={className} id={id}>{children}</div>;
  }

  return (
    <motion.div
      id={id}
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
