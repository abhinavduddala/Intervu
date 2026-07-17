import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'w-full h-11 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 select-none border active:scale-[0.98] focus:outline-none';
  
  const variants = {
    primary: 'bg-[#4F46E5] hover:bg-[#4338CA] text-white border-transparent focus:ring-2 focus:ring-[#4F46E5]/20 disabled:opacity-50 disabled:hover:bg-[#4F46E5] disabled:active:scale-100',
    secondary: 'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0] focus:ring-2 focus:ring-slate-500/10 disabled:opacity-50 disabled:active:scale-100',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white border-transparent focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:active:scale-100'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
