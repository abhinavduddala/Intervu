import React from 'react';
import { Code2, Globe } from 'lucide-react';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const ConnectedAccountCard = ({ 
  data = {}, 
  onChange 
}) => {
  const handleInputChange = (field, val) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Connected Profiles
        </h3>
      </div>

      <div className="space-y-6">
        {/* LeetCode */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">LeetCode username</label>
          <div className="field-control">
            <Code2 className="field-icon text-[#64748B] h-4 w-4" />
            <input
              type="text"
              value={data.leetcodeUsername || ''}
              onChange={(e) => handleInputChange('leetcodeUsername', e.target.value)}
              className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
              placeholder="leetcode_username"
            />
          </div>
        </div>

        {/* GitHub */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">GitHub profile URL</label>
          <div className="field-control">
            <GithubIcon className="field-icon text-[#64748B] h-4 w-4" />
            <input
              type="url"
              value={data.githubUrl || ''}
              onChange={(e) => handleInputChange('githubUrl', e.target.value)}
              className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
              placeholder="https://github.com/username"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">LinkedIn profile URL</label>
          <div className="field-control">
            <LinkedinIcon className="field-icon text-[#64748B] h-4 w-4" />
            <input
              type="url"
              value={data.linkedinUrl || ''}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        {/* Portfolio website */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">Portfolio website URL</label>
          <div className="field-control">
            <Globe className="field-icon text-[#64748B] h-4 w-4" />
            <input
              type="url"
              value={data.portfolioUrl || ''}
              onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
              className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
              placeholder="https://portfolio.com"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ConnectedAccountCard;
