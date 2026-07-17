import React from 'react';

const AuthCard = ({ children, className = '' }) => {
  return (
    <div className={`w-full bg-white border border-[#E2E8F0] p-8 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default AuthCard;
