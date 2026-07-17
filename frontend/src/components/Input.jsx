import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  type = 'text', 
  error, 
  placeholder, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-[#0F172A] select-none">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`w-full h-12 px-4 py-3 bg-white border ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20'
        } rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none transition-all duration-150`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">
          {error.message}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
