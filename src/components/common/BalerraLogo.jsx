import React from 'react';

export const BalerraLogo = ({ size = 'default', showText = true, className = '', dark = false }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Circle Wolf Logo */}
      <div className={`relative ${sizeClasses[size] || sizeClasses.default} flex-shrink-0`}>
        <img 
          src="/logo.svg" 
          alt="Balerra Delivery" 
          className="w-full h-full object-contain drop-shadow-sm" 
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold italic text-lg leading-none tracking-wider font-sans ${
            dark ? 'text-white' : 'text-brand-700'
          }`}>
            BALERA
          </span>
          <span className={`text-[10px] font-black italic tracking-[0.2em] leading-tight ${
            dark ? 'text-sky-400' : 'text-[#0B3C95]'
          }`}>
            DELIVERY
          </span>
        </div>
      )}
    </div>
  );
};
