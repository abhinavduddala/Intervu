import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Compass, LogOut, ArrowLeft, Shield } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex select-none text-xs font-semibold">
      
      {/* Sidebar */}
      <aside className="bg-white border-r border-[#E2E8F0] w-60 flex flex-col flex-shrink-0">
        <div className="h-14 border-b border-[#E2E8F0] flex items-center px-5 gap-2.5">
          <Compass className="h-5 w-5 text-[#4F46E5]" />
          <span className="font-extrabold text-sm tracking-tight text-[#0F172A]">Intervu Admin</span>
        </div>
        
        <nav className="flex-1 p-4.5 flex flex-col gap-1">
          <Link
            to="/admin"
            className="px-3.5 py-2.5 rounded-lg bg-indigo-50/50 text-[#4F46E5] text-xs font-bold flex items-center gap-2.5"
          >
            <Shield className="h-4.5 w-4.5 text-[#4F46E5]" />
            <span>Admin Console</span>
          </Link>
          
          <Link
            to="/dashboard"
            className="px-3.5 py-2.5 rounded-lg hover:bg-indigo-50/20 text-[#64748B] hover:text-[#4F46E5] text-xs font-bold flex items-center gap-2 mt-auto border border-[#E2E8F0] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Candidate Portal</span>
          </Link>
        </nav>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="text-[10px] font-mono text-[#4F46E5] font-extrabold tracking-wider uppercase bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded">
            Admin Auth // {user?.email || 'System Root'}
          </div>
          
          <button
            onClick={handleLogout}
            className="text-[#64748B] hover:text-[#EF4444] flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;
