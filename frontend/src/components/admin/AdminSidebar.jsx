import React from 'react';

const AdminSidebar = ({ 
  tabs = [], 
  activeTab, 
  setActiveTab 
}) => {
  return (
    <>
      {/* Desktop Navigation Sidebar (Left Column) */}
      <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm space-y-1 select-none text-xs font-semibold text-[#0F172A]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-50/60 text-[#4F46E5]'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Mobile Navigation Header tabs */}
      <div className="lg:hidden w-full overflow-x-auto pb-2 border-b border-[#E2E8F0] flex gap-2 shrink-0 select-none text-xs font-semibold">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 border text-xs font-bold rounded-lg shrink-0 transition-all ${
                isSelected
                  ? 'bg-[#4F46E5] text-white border-transparent'
                  : 'bg-white border-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default AdminSidebar;
