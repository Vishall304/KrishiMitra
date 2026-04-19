import React from 'react';

export function MobileContainer({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-[#F7F9F4] ${className}`}>
      <div className="max-w-2xl mx-auto min-h-screen">
        {children}
      </div>
    </div>
  );
}

export default MobileContainer;
