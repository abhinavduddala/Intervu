import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  School, 
  BookOpen, 
  CalendarRange, 
  Code2, 
  Globe, 
  Flame, 
  CheckCircle2, 
  Award,
  Settings,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

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

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  // Mock static values synced to settings
  const profileDetails = {
    fullName: user?.fullName || 'Senior Engineer',
    email: user?.email || 'dev@intervu.ai',
    college: 'Stanford University',
    branch: 'Computer Science',
    gradYear: 2026,
    bio: 'Software engineer focusing on system architectures, DP algorithms, and performance optimization.',
    leetcodeUsername: 'dev_intervu',
    githubUrl: 'https://github.com/developer',
    linkedinUrl: 'https://linkedin.com/in/developer',
    portfolioUrl: 'https://portfolio.com'
  };

  const accountMetrics = {
    memberSince: 'June 2026',
    solvedCount: 18,
    streakCount: 5,
    aiReviewsCount: 24,
    revisionsCount: 42
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 select-none pb-24 text-xs font-semibold text-[#0F172A]">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Profile</h1>
        <p className="text-xs text-[#64748B] mt-1 font-medium">Manage your public developer profile and interview credentials.</p>
      </div>

      {/* Top Profile Header card */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar visual */}
          <div className="h-20 w-20 rounded-full bg-[#F8FAFC] border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] text-xl font-bold font-mono">
            {profileDetails.fullName.substring(0, 1).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              {profileDetails.fullName}
            </h1>
            <div className="text-xs text-[#64748B] font-medium leading-none">
              {profileDetails.email}
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-[10px] font-mono text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <School className="h-3.5 w-3.5" />
                {profileDetails.college}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm font-bold shrink-0"
        >
          <Settings className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main details grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Biography & Connected Channels (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* About Bio */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2 flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-[#4F46E5]" />
              <span>Personal Biography</span>
            </h3>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              {profileDetails.bio}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#F1F5F9] text-xs">
              <div className="flex gap-2">
                <BookOpen className="h-4.5 w-4.5 text-[#64748B]" />
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase">Branch</span>
                  <div className="font-bold text-[#0F172A]">{profileDetails.branch}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <CalendarRange className="h-4.5 w-4.5 text-[#64748B]" />
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase">Graduation Year</span>
                  <div className="font-bold text-[#0F172A]">{profileDetails.gradYear}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connected profiles links */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
              Connected Channels
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {profileDetails.githubUrl ? (
                <a 
                  href={profileDetails.githubUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-200 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                  <GithubIcon className="h-4 w-4 shrink-0 text-[#0F172A]" />
                  <span className="truncate">GitHub Profile</span>
                </a>
              ) : null}

              {profileDetails.linkedinUrl ? (
                <a 
                  href={profileDetails.linkedinUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-200 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                  <LinkedinIcon className="h-4 w-4 shrink-0 text-[#0077B5]" />
                  <span className="truncate">LinkedIn Profile</span>
                </a>
              ) : null}

              {profileDetails.leetcodeUsername ? (
                <a 
                  href={`https://leetcode.com/${profileDetails.leetcodeUsername}/`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-200 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                  <Code2 className="h-4 w-4 shrink-0 text-[#FFA116]" />
                  <span className="truncate">{profileDetails.leetcodeUsername}</span>
                </a>
              ) : null}

              {profileDetails.portfolioUrl ? (
                <a 
                  href={profileDetails.portfolioUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-200 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                  <Globe className="h-4 w-4 shrink-0 text-[#4F46E5]" />
                  <span className="truncate">Portfolio Site</span>
                </a>
              ) : null}
            </div>
          </div>

        </div>

        {/* Right Column: Performance Stats (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Account Metrics Summary card */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">
              Performance Indicators
            </h3>
            
            <div className="space-y-3 font-semibold">
              <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]/50">
                <span className="text-[#64748B]">Questions Solved</span>
                <span className="text-sm font-extrabold text-[#22C55E] font-mono">{accountMetrics.solvedCount} problems</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]/50">
                <span className="text-[#64748B]">Active Study Streak</span>
                <span className="text-sm font-extrabold text-[#F59E0B] font-mono flex items-center gap-1">
                  <Flame className="h-4 w-4 fill-current animate-pulse text-[#F59E0B]" />
                  <span>{accountMetrics.streakCount} Days</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]/50">
                <span className="text-[#64748B]">AI Analysis Reviews</span>
                <span className="text-sm font-extrabold text-[#4F46E5] font-mono">{accountMetrics.aiReviewsCount} sessions</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]/50">
                <span className="text-[#64748B]">Spaced Revisions Done</span>
                <span className="text-sm font-extrabold text-[#0F172A] font-mono">{accountMetrics.revisionsCount} tasks</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#64748B]">Member Since</span>
                <span className="text-xs font-bold text-[#0F172A] font-mono">{accountMetrics.memberSince}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
