import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Terminal,
  Play,
  Clock,
  CheckCircle2,
  ChevronDown,
  Brain
} from 'lucide-react';

const faqItems = [
  {
    question: "How does Intervu integrate with LeetCode?",
    answer: "Intervu is a placement preparation companion with a built-in code editor. You solve coding challenges right in Intervu in Python, Java, C, C++ and more, run them against test cases, and get detailed AI-powered reviews, analytics and spaced revisions."
  },
  {
    question: "What does the AI Code Review analyze?",
    answer: "The AI analyzer reviews your line-by-line syntax, determines time and space complexities, identifies potential edge cases (null inputs, overflows), and offers optimized code alternatives with clean explanations."
  },
  {
    question: "How are company readiness scores computed?",
    answer: "Readiness scores are compiled based on weighted topic frequencies tested in actual interviews at top companies (e.g. Google, Amazon, Meta). Completing problems in high-frequency topics drives your score closer to target benchmarks."
  },
  {
    question: "What is Spaced Repetition Revision?",
    answer: "Based on your confidence levels and AI feedback, solved questions are automatically queued for revision at optimal intervals (e.g., 2 days, 7 days, 30 days) to lock key logic into long-term memory."
  }
];

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const handleScrollToDemo = () => {
    const element = document.getElementById('dashboard-preview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-[#0F172A] tracking-tight hover:opacity-90 transition-opacity">
              <Compass className="h-5 w-5 text-[#4F46E5]" />
              <span>Intervu</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#475569]">
              <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors">How it Works</a>
              <a href="#dashboard-preview" className="hover:text-[#0F172A] transition-colors">Preview</a>
              <a href="#faq" className="hover:text-[#0F172A] transition-colors">FAQ</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-[#475569] hover:text-[#0F172A] px-3 py-2 rounded-lg hover:bg-[#EEF2FF] transition-all"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="text-sm font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 border border-[#E2E8F0] bg-white px-3.5 py-1 rounded-full text-xs text-[#4F46E5] mb-6 font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-[#14B8A6]" />
            <span>Spaced Repetition Interview Prep</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0F172A] mb-6 leading-tight">
            Master Coding Interviews with AI
          </h1>
          
          <p className="text-md md:text-lg text-[#475569] mb-8 leading-relaxed max-w-xl">
            Intervu helps software engineers prepare for technical interviews by combining LeetCode, AI-powered code reviews, company-specific roadmaps, progress analytics, and personalized recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-lg transition-all shadow-sm"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleScrollToDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-[#F1F5F9] text-[#0F172A] font-semibold rounded-lg border border-[#E2E8F0] transition-all"
            >
              <Play className="h-4 w-4 fill-current text-[#475569]" />
              Browse Questions
            </button>
          </div>
        </div>

        {/* Realistic Dashboard Preview on Hero Right Side */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-md p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] font-semibold">
                  A
                </div>
                <div>
                  <div className="text-xs text-[#64748B] font-medium">Welcome Back</div>
                  <div className="text-sm font-semibold text-[#0F172A]">Alex Mercer</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold bg-amber-50 border border-amber-100 text-[#F59E0B] px-3 py-1 rounded-full">
                🔥 14 Day Streak
              </div>
            </div>

            {/* Widgets row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <div className="text-xs text-[#64748B] font-medium mb-1">Target Readiness</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">Google</span>
                  <span className="text-xs font-bold text-[#4F46E5]">82%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#4F46E5] h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <div className="text-xs text-[#64748B] font-medium mb-1">Revision Queue</div>
                <div className="text-lg font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#F59E0B]" />
                  <span>3 Due Today</span>
                </div>
                <div className="text-[10px] text-[#64748B] mt-1 font-mono">Spaced stages: 2, 7, 30 days</div>
              </div>
            </div>

            {/* Recent Questions list */}
            <div>
              <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider mb-3">Recent Progress</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs border border-[#E2E8F0] p-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EEF2FF] transition-colors">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                    <span className="font-medium">Two Sum</span>
                  </div>
                  <span className="text-[10px] font-mono border border-emerald-100 bg-emerald-50 text-[#22C55E] px-2 py-0.5 rounded">Easy</span>
                </div>
                <div className="flex items-center justify-between text-xs border border-[#E2E8F0] p-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EEF2FF] transition-colors">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                    <span className="font-medium">LRU Cache</span>
                  </div>
                  <span className="text-[10px] font-mono border border-amber-100 bg-amber-50 text-[#F59E0B] px-2 py-0.5 rounded">Medium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. HOW INTERVU WORKS TIMELINE */}
      <section id="how-it-works" className="py-24 border-t border-b border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] mb-4">
              How Intervu Works
            </h2>
            <p className="text-md text-[#475569]">
              Five structured steps to move from LeetCode attempts to production-quality engineering logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-indigo-50 border-2 border-[#4F46E5] flex items-center justify-center text-sm font-bold text-[#4F46E5] mb-4">
                1
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Choose Question</h3>
              <p className="text-xs text-[#475569] max-w-[180px]">
                Select a problem from the verified curated roadmaps or search filter tracks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-indigo-50 border-2 border-[#4F46E5] flex items-center justify-center text-sm font-bold text-[#4F46E5] mb-4">
                2
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Solve in Intervu</h3>
              <p className="text-xs text-[#475569] max-w-[180px]">
                Write code in the built-in editor and run it against real test cases.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-indigo-50 border-2 border-[#4F46E5] flex items-center justify-center text-sm font-bold text-[#4F46E5] mb-4">
                3
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Paste Solution</h3>
              <p className="text-xs text-[#475569] max-w-[180px]">
                Paste your working script in the Intervu workspace interface.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-indigo-50 border-2 border-[#4F46E5] flex items-center justify-center text-sm font-bold text-[#4F46E5] mb-4">
                4
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Receive AI Analysis</h3>
              <p className="text-xs text-[#475569] max-w-[180px]">
                Instantly process performance metrics, edge cases, and line-by-line checks.
              </p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-indigo-50 border-2 border-[#4F46E5] flex items-center justify-center text-sm font-bold text-[#4F46E5] mb-4">
                5
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Track Progress</h3>
              <p className="text-xs text-[#475569] max-w-[180px]">
                Review readiness indexes and revision logs as your profile status updates.
              </p>
            </div>

            {/* Background connecting bar (hidden on mobile) */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-[#E2E8F0] z-0"></div>
          </div>
        </div>
      </section>

      {/* 4. DASHBOARD PREVIEW SECTION */}
      <section id="dashboard-preview" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] mb-4">
            A Realistic Sandbox Overview
          </h2>
          <p className="text-md text-[#475569]">
            This is not a mockup illustration. It represents the actual design of the application workspace.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#0F172A]">Workspace Dashboard</span>
              <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-[#4F46E5] px-2 py-0.5 rounded">Admin Mode</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#64748B]">
              <span>Database Status: Connected</span>
              <span>•</span>
              <span>Revision Stage: 1</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Sidebar Mock */}
            <aside className="lg:col-span-3 border-r border-[#E2E8F0] bg-[#FFFFFF] p-6 flex flex-col gap-6">
              <div>
                <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider mb-2">Metrics Summary</div>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-xs text-[#475569]">Today's Goal</div>
                    <div className="text-md font-bold text-[#0F172A]">Complete 2 Array questions</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#475569]">Total Solved</div>
                    <div className="text-md font-bold text-[#0F172A]">87 Questions</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#475569]">Daily Streak</div>
                    <div className="text-md font-bold text-[#F59E0B]">🔥 14 Days</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider mb-3">Topic Progress</div>
                <div className="flex flex-col gap-2.5 text-xs text-[#475569]">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Arrays & Hashing</span>
                      <span className="font-semibold text-[#0F172A]">80%</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4F46E5] h-full rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Trees</span>
                      <span className="font-semibold text-[#0F172A]">50%</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4F46E5] h-full rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Dynamic Programming</span>
                      <span className="font-semibold text-[#0F172A]">20%</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4F46E5] h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Area Mock */}
            <main className="lg:col-span-9 p-6 flex flex-col gap-6 bg-[#F8FAFC]">
              
              {/* Top row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Google score */}
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-sm">
                  <div className="text-xs text-[#64748B] font-medium mb-1">Google Readiness</div>
                  <div className="text-xl font-bold text-[#0F172A] mb-2">82%</div>
                  <div className="text-[10px] text-[#64748B]">Benchmark target: 80%</div>
                </div>
                {/* Meta score */}
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-sm">
                  <div className="text-xs text-[#64748B] font-medium mb-1">Meta Readiness</div>
                  <div className="text-xl font-bold text-[#0F172A] mb-2">68%</div>
                  <div className="text-[10px] text-[#64748B]">Needs 5 Graph problems</div>
                </div>
                {/* Revision stage */}
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-sm">
                  <div className="text-xs text-[#64748B] font-medium mb-1">Active Revision Queue</div>
                  <div className="text-xl font-bold text-[#F59E0B] mb-2">3 Items</div>
                  <div className="text-[10px] text-[#64748B]">Spaced checks starting tomorrow</div>
                </div>
              </div>

              {/* Code Workspace with AI Overlay Mockup */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-[#4F46E5]" />
                    <span className="text-xs font-mono font-bold text-[#0F172A]">valid_parentheses.py</span>
                  </div>
                  <span className="text-[10px] font-mono border border-indigo-100 bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded">Python3</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code Column */}
                  <div className="font-mono text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] select-none">
                    <p><span className="text-[#4F46E5] font-semibold">def</span> <span className="text-indigo-900 font-semibold">isValid</span>(s: str) -&gt; bool:</p>
                    <p className="pl-4">stack = []</p>
                    <p className="pl-4">mapping = &#123;<span className="text-teal-600">")"</span>: <span className="text-teal-600">"Indices"</span>, <span className="text-teal-600">"&#125;"</span>: <span className="text-teal-600">"&#123;"</span>, <span className="text-teal-600">"]"</span>: <span className="text-teal-600">"["</span>&#125;</p>
                    <p className="pl-4"><span className="text-[#4F46E5] font-semibold">for</span> char <span className="text-[#4F46E5] font-semibold">in</span> s:</p>
                    <p className="pl-8"><span className="text-[#4F46E5] font-semibold">if</span> char <span className="text-[#4F46E5] font-semibold">in</span> mapping:</p>
                    <p className="pl-12">top = stack.pop() <span className="text-[#4F46E5] font-semibold">if</span> stack <span className="text-[#4F46E5] font-semibold">else</span> <span className="text-teal-600">'#'</span></p>
                    <p className="pl-12"><span className="text-[#4F46E5] font-semibold">if</span> mapping[char] != top:</p>
                    <p className="pl-16"><span className="text-[#4F46E5] font-semibold">return</span> <span className="text-red-500">False</span></p>
                    <p className="pl-8"><span className="text-[#4F46E5] font-semibold">else</span>:</p>
                    <p className="pl-12">stack.append(char)</p>
                    <p className="pl-4"><span className="text-[#4F46E5] font-semibold">return</span> <span className="text-[#4F46E5] font-semibold">not</span> stack</p>
                  </div>

                  {/* AI Diagnostic Overlay Column */}
                  <div className="border border-[#E2E8F0] bg-indigo-50/50 p-4 rounded-lg flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-indigo-100 pb-2 text-xs font-semibold text-[#4F46E5]">
                      <Brain className="h-4 w-4" />
                      <span>Recent AI Reviews</span>
                    </div>
                    <div className="flex flex-col gap-2.5 text-xs">
                      <div className="flex items-center justify-between font-mono bg-white p-2 rounded border border-indigo-100/60">
                        <span className="text-[#475569]">Complexity</span>
                        <span className="font-bold text-[#14B8A6]">Time: O(N) | Space: O(N)</span>
                      </div>
                      <p className="text-[#475569] leading-relaxed">
                        Optimized to O(N) time with a stack. Verified all edge cases including empty strings and mismatched nesting structures.
                      </p>
                      <div className="mt-auto flex items-center gap-1.5 text-[10px] font-mono text-[#64748B]">
                        <span>Checked at: 2026-06-29</span>
                        <span>•</span>
                        <span className="text-[#22C55E] font-bold">Passed</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </main>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-24 px-6 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#475569]">
              Everything you need to know about the Intervu platform.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqItems.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-[#E2E8F0] rounded-lg bg-white overflow-hidden transition-colors duration-150">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-[#0F172A] hover:bg-[#EEF2FF] transition-all"
                  >
                    <span>{item.question}</span>
                    <ChevronDown className={`h-4 w-4 text-[#64748B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.15 } }}
                        className="overflow-hidden border-t border-[#E2E8F0]"
                      >
                        <p className="p-5 text-xs text-[#475569] leading-relaxed bg-[#F8FAFC]">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="py-24 px-6 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto bg-[#4F46E5] text-white rounded-xl p-10 text-center shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Ready to Ace Your Next Coding Interview?
          </h2>
          <p className="text-sm text-indigo-100 max-w-xl mb-8 leading-relaxed">
            Get structured company readiness trackers, line-by-line AI complex reviews, and customized spaced repetition roadmaps designed to help you pass.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#4F46E5] font-semibold rounded-lg hover:bg-indigo-50 transition-all shadow-sm"
          >
            Start Preparing Today
            <ArrowRight className="h-4 w-4 text-[#4F46E5]" />
          </Link>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-[#E2E8F0] bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Compass className="h-4 w-4 text-[#4F46E5]" />
            <span>&copy; {new Date().getFullYear()} Intervu. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
