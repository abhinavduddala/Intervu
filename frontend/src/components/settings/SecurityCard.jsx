import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, Key, LogOut } from 'lucide-react';

const SecurityCard = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [tfaEnabled, setTfaEnabled] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setError('');
    setSuccess('Password updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      
      {/* Change Password Form */}
      <form onSubmit={handlePasswordChange} className="space-y-6">
        <div className="border-b border-[#F1F5F9] pb-3 flex items-center gap-1.5">
          <Key className="h-4.5 w-4.5 text-[#4F46E5]" />
          <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
            Change Password
          </h3>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">{error}</div>}
        {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#22C55E] rounded-lg">{success}</div>}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">Current password</label>
          <div className="field-control">
            <Lock className="field-icon text-[#64748B] h-4 w-4" />
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full h-12 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
            >
              {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">New password</label>
            <div className="field-control">
              <Lock className="field-icon text-[#64748B] h-4 w-4" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150 input-with-icon"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#0F172A]">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          className="h-10 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg transition-colors shadow-sm select-none active:scale-[0.98]"
        >
          Update Password
        </button>
      </form>

      {/* Two-Factor Authentication placeholder */}
      <div className="border-t border-[#F1F5F9] pt-5 space-y-3">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="h-4.5 w-4.5 text-[#22C55E]" />
          <span>Two-Factor Authentication (2FA)</span>
        </h3>
        
        <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <div>
            <span className="font-bold text-[#0F172A]">Secure Account Login</span>
            <p className="text-[10px] text-[#64748B] font-medium leading-relaxed mt-0.5">
              Require an authenticator verification code alongside your password settings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTfaEnabled(!tfaEnabled)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              tfaEnabled 
                ? 'bg-emerald-50 border-[#22C55E] text-[#22C55E]' 
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
          >
            {tfaEnabled ? 'Enabled' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Active sessions */}
      <div className="border-t border-[#F1F5F9] pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
            Active Browser Sessions
          </h3>
          <button 
            type="button"
            onClick={() => alert('Logged out of all concurrent browser sessions.')}
            className="text-[10px] font-bold text-[#EF4444] hover:underline flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout all other devices</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-[#0F172A]">Windows 11 • Chrome Browser</span>
              <div className="text-[10px] text-[#64748B] font-mono mt-0.5">IP: 192.168.1.15 • Current Session</div>
            </div>
            <span className="text-[9px] font-mono text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded uppercase font-bold">
              Active Now
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SecurityCard;
