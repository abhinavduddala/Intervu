import React from 'react';
import { Mail, Bell } from 'lucide-react';

const NotificationCard = ({ 
  data = {}, 
  onChange 
}) => {
  const handleToggle = (field) => {
    onChange({ ...data, [field] : !data[field] });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Notification Settings
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* Email notifications */}
        <label className="flex items-start justify-between gap-4 p-3.5 hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl cursor-pointer transition-all">
          <div className="flex gap-3">
            <Mail className="h-4.5 w-4.5 text-[#4F46E5] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0F172A]">Email notifications</span>
              <p className="text-[10px] text-[#64748B] font-medium leading-relaxed mt-0.5">
                Receive weekly summary updates, placement readiness metrics, and system alerts.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.emailNotifications ?? true}
            onChange={() => handleToggle('emailNotifications')}
            className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5] mt-1 shrink-0"
          />
        </label>

        {/* Push notifications */}
        <label className="flex items-start justify-between gap-4 p-3.5 hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl cursor-pointer transition-all">
          <div className="flex gap-3">
            <Bell className="h-4.5 w-4.5 text-[#4F46E5] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0F172A]">Browser push alerts</span>
              <p className="text-[10px] text-[#64748B] font-medium leading-relaxed mt-0.5">
                Stay updated when AI analysis reports compile or revisions become due.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.pushNotifications ?? false}
            onChange={() => handleToggle('pushNotifications')}
            className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5] mt-1 shrink-0"
          />
        </label>
      </div>

      {/* Subscription matrix checklist */}
      <div className="flex flex-col gap-3 border-t border-[#F1F5F9] pt-5">
        <label className="text-xs font-medium text-[#0F172A]">Subscription channels</label>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-4 cursor-pointer text-xs font-semibold text-[#0F172A]">
            <span className="text-[#475569]">Spaced revision alerts</span>
            <input
              type="checkbox"
              checked={data.revisionAlerts ?? true}
              onChange={() => handleToggle('revisionAlerts')}
              className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer text-xs font-semibold text-[#0F172A]">
            <span className="text-[#475569]">AI analysis complete reports</span>
            <input
              type="checkbox"
              checked={data.aiCompleteAlerts ?? true}
              onChange={() => handleToggle('aiCompleteAlerts')}
              className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer text-xs font-semibold text-[#0F172A]">
            <span className="text-[#475569]">Weekly progress digest</span>
            <input
              type="checkbox"
              checked={data.weeklyDigest ?? false}
              onChange={() => handleToggle('weeklyDigest')}
              className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer text-xs font-semibold text-[#0F172A]">
            <span className="text-[#475569]">Company readiness updates</span>
            <input
              type="checkbox"
              checked={data.companyReadinessAlerts ?? true}
              onChange={() => handleToggle('companyReadinessAlerts')}
              className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
            />
          </label>
        </div>
      </div>

    </div>
  );
};

export default NotificationCard;
