import React from 'react';

const Loader = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin`} />
    </div>
  );
};

export default Loader; 