import React from 'react';

export function MobileContainer({ children, className = '', noPadding = false }) {
  return (
    <div className={`mobile-container ${className}`}>
      <div className={`flex flex-col min-h-screen min-h-[100dvh] ${noPadding ? '' : 'pb-28'}`}>
        {children}
      </div>
    </div>
  );
}

export default MobileContainer;
