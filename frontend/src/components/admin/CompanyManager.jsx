import React, { useState } from 'react';
import { Building2, Plus, Edit, Globe, Trash2 } from 'lucide-react';

const CompanyManager = ({
  companies = [], // Array of { name, count, avgReadiness, logoUrl, website }
  onCreateCompany,
  onEditCompany,
  onArchiveCompany
}) => {
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyWeb, setNewCompanyWeb] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    onCreateCompany({ name: newCompanyName.trim(), website: newCompanyWeb.trim() });
    setNewCompanyName('');
    setNewCompanyWeb('');
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F1F5F9] pb-3">
        <div>
          <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
            Companies Manager
          </h3>
          <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">Add target companies and view candidate statistics.</p>
        </div>

        {/* Create Company inline form */}
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 shrink-0">
          <input
            type="text"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Company name..."
            className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all min-w-[120px]"
          />
          <input
            type="text"
            value={newCompanyWeb}
            onChange={(e) => setNewCompanyWeb(e.target.value)}
            placeholder="Website (e.g. google.com)"
            className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all min-w-[150px]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </button>
        </form>
      </div>

      {/* Grid of companies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {companies.map((company, i) => {
          const initials = company.name ? company.name.substring(0, 2).toUpperCase() : 'CO';
          return (
            <div 
              key={i} 
              className="p-4.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-100 rounded-xl flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                
                <div className="min-w-0">
                  <h4 className="font-extrabold text-[#0F172A] truncate" title={company.name}>
                    {company.name}
                  </h4>
                  
                  <div className="flex flex-col gap-0.5 mt-0.5 text-[9px] text-[#64748B] font-mono leading-none">
                    <span>{company.count || 0} questions listed</span>
                    <span className="text-[#4f46e5] font-bold">Avg. readiness: {company.avgReadiness || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {company.website && (
                  <a
                    href={`https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#4F46E5] transition-colors"
                    title="Visit Website"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => onArchiveCompany(company.name)}
                  className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#EF4444] transition-colors"
                  title="Archive Company"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompanyManager;
