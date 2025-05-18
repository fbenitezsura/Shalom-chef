
import React from 'react';
import { cn } from '@lib/util/cn';
import { LucideIcon } from 'lucide-react';

interface SocialIconProps {
  href: string;
  icon: LucideIcon;
  className?: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, icon: Icon, className }) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        "bg-restaurant-black text-restaurant-gold hover:bg-restaurant-red transition-colors duration-300",
        className
      )}
    >
      <Icon size={16} />
    </a>
  );
};

export default SocialIcon;
