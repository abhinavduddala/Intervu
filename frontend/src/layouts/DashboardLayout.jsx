import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Compass,
  LayoutDashboard,
  Code2,
  Sparkles,
  BarChart3,
  Brain,
  RotateCcw,
  Building2,
  Video,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, sidebarOpen, toggleSidebar, theme, toggleTheme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/questions', label: 'Questions', icon: Code2 },
    { path: '/roadmap', label: 'Roadmap', icon: Sparkles },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/workspace/two-sum', label: 'AI Review', icon: Brain },
    { path: '/revision', label: 'Revision Planner', icon: RotateCcw },
    { path: '/company', label: 'Companies', icon: Building2 },
    { path: '/mock-interview', label: 'Mock Interview', icon: Video },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex overflow-hidden">
      
      {/* Desktop Sidebar Navigation */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-[#E2E8F0] shadow-sm transition-all duration-200 ${
          sidebarOpen ? 'w-64' : 'w-16'
        } flex-shrink-0 relative z-30 h-screen`}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-[#E2E8F0] flex items-center px-4 gap-2.5 justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-md tracking-tight hover:opacity-90 transition-opacity">
            <Compass className="h-5.5 w-5.5 text-[#4F46E5]" />
            {sidebarOpen && <span className="font-extrabold text-sm tracking-tight text-[#0F172A]">Intervu</span>}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3.5 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/mock-interview' && location.pathname.startsWith('/mock-interview/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3.5 py-3 rounded-lg flex items-center gap-3.5 transition-all duration-150 group text-xs ${
                  isActive
                    ? 'text-[#4F46E5] bg-indigo-50/60 font-bold border border-indigo-100/50 shadow-2xs'
                    : 'text-[#64748B] font-semibold hover:text-[#0F172A] hover:bg-slate-50/80 border border-transparent'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-[#4F46E5]' : 'text-[#64748B] group-hover:text-[#0F172A]'}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Collapse Toggle */}
        <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="w-full py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <span className="text-[10px] font-bold">Collapse Panel</span>
            ) : (
              <span className="text-[10px] font-bold">&raquo;</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-200 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-4">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-md">
              <Compass className="h-5.5 w-5.5 text-[#4F46E5]" />
              <span className="font-extrabold text-sm tracking-tight text-[#0F172A]">Intervu</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded hover:bg-[#F1F5F9]">
              <X className="h-5 w-5 text-[#64748B]" />
            </button>
          </div>
          <nav className="p-3.5 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/mock-interview' && location.pathname.startsWith('/mock-interview/'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-3 rounded-lg flex items-center gap-3.5 text-xs font-semibold ${
                    isActive
                      ? 'text-[#4F46E5] bg-indigo-50/60 border border-indigo-100/50'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50/80'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-[#E2E8F0]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between z-20 shrink-0 select-none">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Input Bar (UI only) */}
            <div className="field-control max-w-md w-full hidden sm:block">
              <Search className="field-icon text-[#64748B] h-4 w-4" />
              <input
                type="text"
                placeholder="Search questions, topics, roadmaps..."
                className="w-full pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all input-with-icon"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors relative ${notificationsOpen ? 'bg-[#F1F5F9]' : ''}`}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-lg shadow-md p-2 z-40">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 py-1.5 border-b border-[#F1F5F9]">
                      Updates
                    </div>
                    <div className="p-3 text-xs text-[#475569] leading-relaxed">
                      Your revision queues for <strong className="text-[#0F172A]">Two Sum</strong> is due today.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors ${profileDropdownOpen ? 'bg-[#F1F5F9]' : ''}`}
              >
                <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-[#4F46E5]">
                  {user?.email?.substring(0, 1).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-lg shadow-md py-1.5 z-40 text-xs">
                    <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                      <div className="font-bold text-[#0F172A] truncate">
                        {user?.name || user?.email?.split('@')[0]}
                      </div>
                      <div className="text-[10px] text-[#64748B] truncate mt-0.5">{user?.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-3 py-1.5 text-[#475569] hover:bg-[#F1F5F9] block font-medium"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-[#EF4444] hover:bg-red-50 flex items-center gap-2 border-t border-[#F1F5F9] mt-1 font-bold"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* View Outlet Grid */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
