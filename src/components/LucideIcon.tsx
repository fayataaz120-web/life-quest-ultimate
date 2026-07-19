/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, className, size = 20, style }) => {
  // Safe lookup with HelpCircle fallback
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} size={size} style={style} />;
};

export default LucideIcon;
