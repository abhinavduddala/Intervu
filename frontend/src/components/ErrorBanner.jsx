import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorBanner = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-600 font-medium leading-relaxed ${className}`}>
      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorBanner;
