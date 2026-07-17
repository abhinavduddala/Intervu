import React from 'react';
import { Camera, User, Mail, School, BookOpen, CalendarRange } from 'lucide-react';

const ProfileCard = ({ 
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
          Profile Settings
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar mock upload */}
        <div className="relative group cursor-pointer shrink-0">
          <div className="h-20 w-20 rounded-full bg-[#F8FAFC] border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] text-xl font-bold font-mono overflow-hidden">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span>{(data.fullName || 'U').substring(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-extrabold text-[#0F172A]">{data.fullName || 'User Profile'}</h4>
          <p className="text-[11px] text-[#64748B] font-medium">{data.email || 'user@example.com'}</p>
          <button className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] text-[10px] font-bold rounded-lg transition-all mt-1">
            Change Photo
          </button>
        </div>
      </div>

      {/* Grid Inputs - Form Group 24px (space-y-6 equivalent) */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Full name</label>
            <div className="field-control">
              <User className="field-icon text-[#64748B] h-4 w-4" />
              <input
                type="text"
                value={data.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
                placeholder="Full name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Email address</label>
            <div className="field-control">
              <Mail className="field-icon text-[#64748B] h-4 w-4" />
              <input
                type="email"
                value={data.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
                placeholder="Email address"
              />
            </div>
          </div>

          {/* University / College */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">University or college</label>
            <div className="field-control">
              <School className="field-icon text-[#64748B] h-4 w-4" />
              <input
                type="text"
                value={data.college || ''}
                onChange={(e) => handleInputChange('college', e.target.value)}
                className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
                placeholder="College name"
              />
            </div>
          </div>

          {/* Branch / Specialization */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Branch or specialization</label>
            <div className="field-control">
              <BookOpen className="field-icon text-[#64748B] h-4 w-4" />
              <input
                type="text"
                value={data.branch || ''}
                onChange={(e) => handleInputChange('branch', e.target.value)}
                className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
                placeholder="Computer Science, ECE, etc."
              />
            </div>
          </div>

          {/* Graduation Year */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Graduation year</label>
            <div className="field-control">
              <CalendarRange className="field-icon text-[#64748B] h-4 w-4" />
              <input
                type="number"
                value={data.gradYear || ''}
                onChange={(e) => handleInputChange('gradYear', e.target.value)}
                className="w-full h-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
                placeholder="Year"
              />
            </div>
          </div>
        </div>

        {/* Short Bio */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">Short bio</label>
          <textarea
            value={data.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 resize-none h-24 leading-relaxed"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

    </div>
  );
};

export default ProfileCard;
