import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop }
];

const accentColors = [
  { value: 'indigo', label: 'Indigo', hex: 'bg-[#4F46E5]' },
  { value: 'violet', label: 'Violet', hex: 'bg-violet-600' },
  { value: 'emerald', label: 'Emerald', hex: 'bg-emerald-600' },
  { value: 'blue', label: 'Blue', hex: 'bg-blue-600' }
];

const AppearanceCard = ({ 
  data = {}, 
  onChange 
}) => {
  const setTheme = useAuthStore(state => state.setTheme);
  const currentTheme = useAuthStore(state => state.theme);

  const handleInputChange = (field, val) => {
    onChange({ ...data, [field]: val });
    if (field === 'theme') {
      setTheme(val); // sync layout state
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Appearance Preferences
        </h3>
      </div>

      {/* Theme selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#0F172A]">UI theme mode</label>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const isSelected = currentTheme === t.value || (currentTheme === 'dark' && t.value === 'dark');
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => handleInputChange('theme', t.value)}
                className={`py-3.5 rounded-lg border flex flex-col items-center gap-2 transition-all text-xs font-bold leading-none ${
                  isSelected
                    ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5]'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Colors */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#0F172A]">Accent theme color</label>
        <div className="flex gap-3.5">
          {accentColors.map((color) => {
            const isSelected = (data.accentColor || 'indigo') === color.value;
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => handleInputChange('accentColor', color.value)}
                className={`h-7 w-7 rounded-full ${color.hex} flex items-center justify-center relative transition-transform hover:scale-105`}
                title={color.label}
              >
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-white block" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font scale and Compact mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#F1F5F9] pt-5">
        
        {/* Font scale */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">Text font size</label>
          <select
            value={data.fontSize || 'medium'}
            onChange={(e) => handleInputChange('fontSize', e.target.value)}
            className="w-full h-12 pl-4 pr-11 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
          >
            <option value="small">Small (11px)</option>
            <option value="medium">Medium (12px default)</option>
            <option value="large">Large (14px)</option>
          </select>
        </div>

        {/* Compact Layout */}
        <div className="flex items-center justify-between gap-4 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-end h-12">
          <div>
            <label className="text-xs font-medium text-[#0F172A] leading-none">Compact layout</label>
            <span className="block text-[9px] text-[#64748B] font-medium leading-none mt-0.5">Minimizes spacing and padding</span>
          </div>
          <input
            type="checkbox"
            checked={data.compactMode || false}
            onChange={(e) => handleInputChange('compactMode', e.target.checked)}
            className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
          />
        </div>

      </div>

    </div>
  );
};

export default AppearanceCard;
