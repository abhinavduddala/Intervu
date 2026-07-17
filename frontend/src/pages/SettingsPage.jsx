import React, { useState, useEffect } from 'react';
import { 
  User, 
  Target, 
  SlidersHorizontal, 
  Bell, 
  Sun, 
  ShieldAlert, 
  Link2, 
  HelpCircle,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import ProfileCard from '../components/settings/ProfileCard';
import GoalCard from '../components/settings/GoalCard';
import PreferenceCard from '../components/settings/PreferenceCard';
import NotificationCard from '../components/settings/NotificationCard';
import AppearanceCard from '../components/settings/AppearanceCard';
import SecurityCard from '../components/settings/SecurityCard';
import ConnectedAccountCard from '../components/settings/ConnectedAccountCard';
import SaveBar from '../components/settings/SaveBar';

const tabs = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'account', label: 'Account Summary', icon: TrendingUp },
  { value: 'goals', label: 'Preparation Goals', icon: Target },
  { value: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'appearance', label: 'Appearance', icon: Sun },
  { value: 'security', label: 'Security', icon: ShieldAlert },
  { value: 'connected', label: 'Connected Accounts', icon: Link2 },
  { value: 'about', label: 'About Intervu', icon: HelpCircle }
];

const SettingsPage = () => {
  const user = useAuthStore(state => state.user);
  
  const [activeTab, setActiveTab] = useState('profile');

  // Unified settings state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || 'Senior Engineer',
    email: user?.email || 'dev@intervu.ai',
    college: 'Stanford University',
    branch: 'Computer Science',
    gradYear: 2026,
    bio: 'Software engineer focusing on system architectures, DP algorithms, and performance optimization.',
    avatarUrl: ''
  });

  const [initialProfile, setInitialProfile] = useState({ ...profileData });
  const [hasUnsavedProfile, setHasUnsavedProfile] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  // Autosaved cards data
  const [goalData, setGoalData] = useState({
    targetCompanies: ['Google', 'Amazon', 'Meta'],
    timeline: '3m',
    role: 'fullstack',
    language: 'javascript',
    prepLevel: 'intermediate',
    dailyGoal: 2,
    weeklyGoal: 10
  });

  const [preferenceData, setPreferenceData] = useState({
    difficulties: ['easy', 'medium'],
    topics: ['Arrays & Hashing', 'Trees', 'Graphs'],
    dailyReminderTime: '09:00',
    revisionAlertsEnabled: true
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    revisionAlerts: true,
    aiCompleteAlerts: true,
    weeklyDigest: false,
    companyReadinessAlerts: true
  });

  const [appearanceData, setAppearanceData] = useState({
    accentColor: 'indigo',
    fontSize: 'medium',
    compactMode: false
  });

  const [connectedData, setConnectedData] = useState({
    leetcodeUsername: 'dev_intervu',
    githubUrl: 'https://github.com/developer',
    linkedinUrl: 'https://linkedin.com/in/developer',
    portfolioUrl: 'https://portfolio.com'
  });

  const [autosaveMsg, setAutosaveMsg] = useState('');

  // Check manual profile changes
  useEffect(() => {
    const changed = JSON.stringify(profileData) !== JSON.stringify(initialProfile);
    setHasUnsavedProfile(changed);
  }, [profileData, initialProfile]);

  // Profile save handlers
  const handleProfileSave = async () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setInitialProfile({ ...profileData });
      setSaveStatus('saved');
      setHasUnsavedProfile(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleProfileReset = () => {
    setProfileData({ ...initialProfile });
  };

  // Trigger autosave overlay notifications
  const triggerAutosaveNotify = (tabName) => {
    setAutosaveMsg(`Autosaved changes to ${tabName}`);
    setTimeout(() => setAutosaveMsg(''), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none pb-28 text-xs font-semibold text-[#0F172A]">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Settings</h1>
        <p className="text-xs text-[#64748B] mt-1 font-medium">Manage your account preferences, preparation goals, and notifications.</p>
      </div>

      {/* Auto save message toast */}
      {autosaveMsg && (
        <div className="fixed top-20 right-6 z-50 p-3 bg-emerald-50 border border-emerald-200 text-[#22C55E] rounded-lg shadow-md flex items-center gap-2 animate-in fade-in duration-200 text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{autosaveMsg}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation panel */}
        {/* Desktop Sidebar (Left 3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm space-y-1">
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

        {/* Mobile View Navigation Header tabs */}
        <div className="lg:hidden w-full overflow-x-auto pb-2 border-b border-[#E2E8F0] flex gap-2 shrink-0 select-none">
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

        {/* Settings content frame (Right 9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Profile Card */}
          {activeTab === 'profile' && (
            <ProfileCard
              data={profileData}
              onChange={setProfileData}
            />
          )}

          {/* Account Metrics Summary card */}
          {activeTab === 'account' && (
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6">
              <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-3">
                Account Summary
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono">
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">Member Since</div>
                  <div className="text-sm font-extrabold text-[#0F172A] mt-0.5">June 2026</div>
                </div>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">Questions Solved</div>
                  <div className="text-sm font-extrabold text-[#22C55E] mt-0.5">18 Questions</div>
                </div>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">Current Streak</div>
                  <div className="text-sm font-extrabold text-[#F59E0B] mt-0.5">5 Days</div>
                </div>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">AI Solutions Reviewed</div>
                  <div className="text-sm font-extrabold text-[#4F46E5] mt-0.5">24 Sessions</div>
                </div>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">Revisions Cleared</div>
                  <div className="text-sm font-extrabold text-[#4F46E5] mt-0.5">42 Recs</div>
                </div>
              </div>
            </div>
          )}

          {/* Preparation Goals */}
          {activeTab === 'goals' && (
            <GoalCard
              data={goalData}
              onChange={(updated) => {
                setGoalData(updated);
                triggerAutosaveNotify('Goals');
              }}
            />
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <PreferenceCard
              data={preferenceData}
              onChange={(updated) => {
                setPreferenceData(updated);
                triggerAutosaveNotify('Preferences');
              }}
            />
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <NotificationCard
              data={notificationData}
              onChange={(updated) => {
                setNotificationData(updated);
                triggerAutosaveNotify('Notifications');
              }}
            />
          )}

          {/* Appearance Theme settings */}
          {activeTab === 'appearance' && (
            <AppearanceCard
              data={appearanceData}
              onChange={(updated) => {
                setAppearanceData(updated);
                triggerAutosaveNotify('Appearance');
              }}
            />
          )}

          {/* Security details */}
          {activeTab === 'security' && (
            <SecurityCard />
          )}

          {/* Connected profiles list */}
          {activeTab === 'connected' && (
            <ConnectedAccountCard
              data={connectedData}
              onChange={(updated) => {
                setConnectedData(updated);
                triggerAutosaveNotify('Connected Accounts');
              }}
            />
          )}

          {/* About Intervu card */}
          {activeTab === 'about' && (
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4 leading-relaxed font-medium text-[#475569]">
              <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-3">
                About Intervu
              </h3>
              <p>
                Intervu is a production-grade AI-powered coding interview companion engineered to raise placement success indices for software engineers.
              </p>
              <div className="text-[10px] font-mono text-[#64748B] space-y-1 mt-2.5 pt-2 border-t border-[#F1F5F9]/50">
                <div>Client Build Version: v1.0.5 (June 2026)</div>
                <div>Node JS Target Environment: MSBuild v17.0</div>
                <div>Design System Baseline: 8-Point Slate Layouts</div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Save Bar trigger overlay */}
      <SaveBar
        hasChanges={hasUnsavedProfile}
        saveStatus={saveStatus}
        onSave={handleProfileSave}
        onReset={handleProfileReset}
      />

    </div>
  );
};

export default SettingsPage;
