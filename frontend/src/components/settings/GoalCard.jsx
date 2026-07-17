import React from 'react';
import { Check } from 'lucide-react';

const targetCompaniesList = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Atlassian', 'Qualcomm', 'Uber'];

const GoalCard = ({ 
  data = {}, 
  onChange 
}) => {
  const handleInputChange = (field, val) => {
    onChange({ ...data, [field]: val });
  };

  const handleCompanyToggle = (company) => {
    const list = data.targetCompanies || [];
    if (list.includes(company)) {
      handleInputChange('targetCompanies', list.filter(c => c !== company));
    } else {
      handleInputChange('targetCompanies', [...list, company]);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Preparation Goals
        </h3>
      </div>

      {/* Target Companies checklist */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#0F172A]">Target companies</label>
        <div className="flex flex-wrap gap-2">
          {targetCompaniesList.map((company) => {
            const isSelected = (data.targetCompanies || []).includes(company);
            return (
              <button
                key={company}
                type="button"
                onClick={() => handleCompanyToggle(company)}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5]'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                <span>{company}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Placement Timeline */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Placement timeline</label>
            <select
              value={data.timeline || '3m'}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className="w-full h-12 pl-4 pr-11 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
            >
              <option value="1m">1 Month (Sprint prep)</option>
              <option value="3m">3 Months (Standard prep)</option>
              <option value="6m">6 Months (Deep-dive track)</option>
              <option value="12m">1 Year (Long-term path)</option>
            </select>
          </div>

          {/* Target Role */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Target role</label>
            <select
              value={data.role || 'fullstack'}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full h-12 pl-4 pr-11 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
            >
              <option value="frontend">Frontend Software Engineer</option>
              <option value="backend">Backend Software Architect</option>
              <option value="fullstack">Full-Stack Generalist</option>
              <option value="mobile">Mobile Application Developer</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Preferred code language</label>
            <select
              value={data.language || 'javascript'}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full h-12 pl-4 pr-11 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python3</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="csharp">C#</option>
            </select>
          </div>

          {/* Preparation Level */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Preparation level baseline</label>
            <select
              value={data.prepLevel || 'intermediate'}
              onChange={(e) => handleInputChange('prepLevel', e.target.value)}
              className="w-full h-12 pl-4 pr-11 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
            >
              <option value="beginner">Beginner (Conceptual prep)</option>
              <option value="intermediate">Intermediate (Active solving)</option>
              <option value="advanced">Advanced (High-complexity audit)</option>
            </select>
          </div>

          {/* Daily solved target */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Daily study goal target</label>
            <input
              type="number"
              value={data.dailyGoal || 2}
              onChange={(e) => handleInputChange('dailyGoal', Number(e.target.value))}
              className="w-full h-12 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
              min={1}
              max={10}
            />
          </div>

          {/* Weekly solved target */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Weekly study goal target</label>
            <input
              type="number"
              value={data.weeklyGoal || 10}
              onChange={(e) => handleInputChange('weeklyGoal', Number(e.target.value))}
              className="w-full h-12 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
              min={1}
              max={50}
            />
          </div>

        </div>
      </div>

    </div>
  );
};

export default GoalCard;
