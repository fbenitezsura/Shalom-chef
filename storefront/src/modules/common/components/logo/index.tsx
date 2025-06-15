
import React from 'react';
import { cn } from '@lib/util/cn';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("relative", className)}>
      <h1 className="font-playfair text-4xl font-bold tracking-tighter text-restaurant-gold">
        <span className="relative">
          Shalom Chef
          <span className="absolute -top-1 -right-2 text-xs text-restaurant-red">®</span>
        </span>
      </h1>
      <p className="text-[10px] tracking-[0.3em] uppercase text-restaurant-gold mt-1">Shalomchef</p>
    </div>
  );
};

export default Logo;
