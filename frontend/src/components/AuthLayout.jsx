import React from 'react';
import { Compass, Sparkles, Brain, Target, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F8FAFC]">
      
      {/* Left Panel: Brand & Features (40% width, desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-white border-r border-[#E2E8F0] relative overflow-hidden flex-col justify-between p-12">
        {/* Subtle decorative dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.4] pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#4F46E5 1.5px, transparent 1.5px)', 
            backgroundSize: '24px 24px' 
          }} 
        />
        
        {/* Logo and Brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-[#0F172A] tracking-tight">
            <Compass className="h-6 w-6 text-[#4F46E5]" />
            <span>Intervu</span>
          </Link>
          <div className="text-xs text-[#64748B] font-mono mt-1">
            Your AI-Powered Coding Interview Companion
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 flex flex-col gap-8 my-auto">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Prepare smarter.
              <br />
              Land your target role.
            </h1>
            <p className="text-sm text-[#64748B] mt-3 max-w-sm">
              Stop grinding blindly. Intervu combines your LeetCode attempts with deep analytics and active recall.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0F172A]">AI Code Review</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Line-by-line performance reviews and complexity analysis.</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0F172A]">Company Readiness</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Benchmark your topic completeness against real tech interview stats.</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0F172A]">Progress Analytics</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Keep track of success ratios, streak history, and revision stages.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-[#64748B] font-mono">
          &copy; {new Date().getFullYear()} Intervu. Built for software engineers.
        </div>
      </div>

      {/* Right Panel: Auth Cards (60% width, centered on mobile) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
