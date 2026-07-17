import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center select-none text-xs font-semibold text-[#0F172A]">
        <div className="bg-white border border-[#E2E8F0] p-8 rounded-xl shadow-sm max-w-md w-full space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[#EF4444] text-lg font-extrabold font-mono mx-auto">
            403
          </div>
          <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">Access Denied</h2>
          <p className="text-xs text-[#64748B] font-medium leading-relaxed">
            You do not have sufficient administrative permissions to access the internal CMS panel.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg shadow-sm transition-colors mt-2"
          >
            Return to Candidate Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
