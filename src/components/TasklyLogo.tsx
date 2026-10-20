import React from 'react';

interface TasklyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'dark' | 'light' | 'auto';
  onClick?: () => void;
}

export const TasklyLogo: React.FC<TasklyLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  theme = 'auto',
  onClick,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-lg', img: 'w-5 h-5' },
    md: { box: 'w-9 h-9', text: 'text-xl', img: 'w-7 h-7' },
    lg: { box: 'w-11 h-11', text: 'text-2xl', img: 'w-8 h-8' },
    xl: { box: 'w-14 h-14', text: 'text-3xl', img: 'w-11 h-11' },
  };

  const { box, text } = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Logo Icon Badge */}
      <div
        className={`${box} rounded-2xl bg-white shadow-md shadow-black/10 border border-slate-200/80 flex items-center justify-center p-1 overflow-hidden shrink-0 transition-transform duration-200 hover:scale-105`}
      >
        <img
          src="/assets/taskly-logo.png"
          alt="Taskly Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to original user asset if needed
            (e.target as HTMLImageElement).src = '/assets/aistudio/WhatsApp_Image_2026-10-19_at_5.45.33_PM__1__c8808754.jpeg';
          }}
        />
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <span
          className={`${text} font-black tracking-tight font-['Outfit',sans-serif] ${
            theme === 'dark'
              ? 'text-white'
              : theme === 'light'
              ? 'text-slate-900'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          Task<span className="text-[#65B741]">ly</span>
        </span>
      )}
    </div>
  );
};
