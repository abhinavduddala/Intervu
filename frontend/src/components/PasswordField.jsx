import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = React.forwardRef(({ 
  label = 'Password', 
  error, 
  placeholder = '••••••••', 
  className = '', 
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 relative ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-[#0F172A] select-none">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={`w-full h-12 pl-4 pr-11 py-3 bg-white border ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20'
          } rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none transition-all duration-150`}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] p-0.5"
          tabIndex="-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">
          {error.message}
        </span>
      )}
    </div>
  );
});

PasswordField.displayName = 'PasswordField';

export default PasswordField;
