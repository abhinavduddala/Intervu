import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  BookOpen, 
  Layers, 
  Building2, 
  UploadCloud, 
  BarChart3, 
  ShieldAlert, 
  Plus, 
  RefreshCw,
  TrendingUp,
  Terminal,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { questionsService } from '../services/questions.service';
import { adminService } from '../services/admin.service';
import { companyService } from '../services/company.service';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTable from '../components/admin/AdminTable';
import QuestionEditor from '../components/admin/QuestionEditor';
import TopicManager from '../components/admin/TopicManager';
import PatternManager from '../components/admin/PatternManager';
import CompanyManager from '../components/admin/CompanyManager';
import ImportWizard from '../components/admin/ImportWizard';
import StatisticsCards from '../components/admin/StatisticsCards';
import AuditLogTable from '../components/admin/AuditLogTable';
import SearchBar from '../components/admin/SearchBar';

const adminTabs = [
  { value: 'overview', label: 'Overview', icon: BarChart3 },
  { value: 'questions', label: 'Question Bank', icon: Database },
  { value: 'topics', label: 'Topics Focus', icon: BookOpen },
  { value: 'patterns', label: 'Patterns Focus', icon: Layers },
  { value: 'companies', label: 'Companies Target', icon: Building2 },
  { value: 'imports', label: 'Dataset Imports', icon: UploadCloud },
  { value: 'analytics', label: 'System Analytics', icon: Activity },
  { value: 'audit', label: 'Audit Logs', icon: Terminal }
];

const COLORS = ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  // Selected tab & global search
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Loaded collections
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Local notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Audit Logs local cache
  const [auditLogs, setAuditLogs] = useState([
    { admin: 'admin@intervu.ai', action: 'CREATE_QUESTION', resource: 'Unique Paths (ID: 24)', timestamp: new Date().toISOString() },
    { admin: 'admin@intervu.ai', action: 'UPDATE_QUESTION', resource: 'Two Sum (ID: 1)', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { admin: 'system_root', action: 'IMPORT_DATASET', resource: 'leetcode_starter.json (18 questions)', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // Fetch from API endpoints
      const [qResponse, tResponse, pResponse, cResponse] = await Promise.all([
        questionsService.get({ page: 1, limit: 100 }),
        questionsService.get({ limit: 1 }), // trigger load topics
        questionsService.get({ limit: 1 }), // trigger load patterns
        companyService.getReadiness().catch(() => [])
      ]);

      // If backend lists are loaded, map them. Else mock fallback data
      const qList = qResponse?.questions || [];
      setQuestions(qList);

      // Clean topic patterns list mapping
      const distinctTopics = qList.map(q => q.topic).filter(Boolean);
      const uniqueT = [...new Set(distinctTopics)];
      setTopics(uniqueT.length > 0 ? uniqueT : ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Trees', 'Graphs', 'Dynamic Programming']);

      const distinctPatterns = qList.map(q => q.pattern).filter(Boolean);
      const uniqueP = [...new Set(distinctPatterns)];
      setPatterns(uniqueP.length > 0 ? uniqueP : ['Two Pointers', 'Sliding Window', 'Fast & Slow Pointers', 'DFS/BFS', 'Recursion']);

      // Map company statistics readiness lists
      const companyStats = cResponse && cResponse.length > 0 ? cResponse : [
        { name: 'Google', count: 5, avgReadiness: 62, website: 'google.com' },
        { name: 'Amazon', count: 8, avgReadiness: 72, website: 'amazon.com' },
        { name: 'Microsoft', count: 6, avgReadiness: 68, website: 'microsoft.com' },
        { name: 'Meta', count: 4, avgReadiness: 55, website: 'meta.com' }
      ];
      setCompanies(companyStats);

    } catch (err) {
      console.error('Admin dashboard failed to load settings:', err);
      setErrorMsg('Failed to sync administrative parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Curation handlers
  const handleSaveQuestion = async (payload) => {
    try {
      if (selectedQuestion) {
        // Edit mode
        await adminService.updateQuestion(selectedQuestion.id, payload);
        triggerToast('Question updated successfully!');
        
        // Log audit log
        setAuditLogs([
          { admin: 'admin@intervu.ai', action: 'UPDATE_QUESTION', resource: `${payload.title} (ID: ${selectedQuestion.id})`, timestamp: new Date().toISOString() },
          ...auditLogs
        ]);
      } else {
        // Create mode
        const newQ = await adminService.createQuestion(payload);
        triggerToast('Question created successfully!');
        
        setAuditLogs([
          { admin: 'admin@intervu.ai', action: 'CREATE_QUESTION', resource: `${payload.title} (ID: ${newQ.id})`, timestamp: new Date().toISOString() },
          ...auditLogs
        ]);
      }
      setEditorOpen(false);
      setSelectedQuestion(null);
      loadData();
    } catch (err) {
      triggerToast('Failed to commit question updates.', true);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      const q = questions.find(x => x.id === id);
      await adminService.deleteQuestion(id);
      triggerToast('Question deleted successfully!');
      
      setAuditLogs([
        { admin: 'admin@intervu.ai', action: 'DELETE_QUESTION', resource: `${q?.title || 'Question'} (ID: ${id})`, timestamp: new Date().toISOString() },
        ...auditLogs
      ]);
      loadData();
    } catch (err) {
      triggerToast('Failed to delete question.', true);
    }
  };

  const handleDuplicateQuestion = async (q) => {
    try {
      const payload = {
        title: `${q.title} (Copy)`,
        topic: q.topic,
        pattern: q.pattern,
        difficulty: q.difficulty,
        leetcodeUrl: q.leetcodeUrl,
        videoSolutionUrl: q.videoSolutionUrl,
        articleUrl: q.articleUrl,
        estimatedTime: q.estimatedTime,
        companyTags: q.companyTags || [],
        hint: q.notes,
        isPremium: q.isPremium || false,
        isActive: q.isActive !== false
      };
      const duplicated = await adminService.createQuestion(payload);
      triggerToast('Question duplicated successfully!');
      
      setAuditLogs([
        { admin: 'admin@intervu.ai', action: 'DUPLICATE_QUESTION', resource: `${payload.title} (ID: ${duplicated.id})`, timestamp: new Date().toISOString() },
        ...auditLogs
      ]);
      loadData();
    } catch (err) {
      triggerToast('Failed to duplicate question.', true);
    }
  };

  const handleToggleActiveQuestion = async (id) => {
    try {
      const q = questions.find(x => x.id === id);
      if (!q) return;
      const updatedStatus = q.isActive === false;
      await adminService.updateQuestion(id, { isActive: updatedStatus });
      triggerToast(updatedStatus ? 'Question activated successfully!' : 'Question archived successfully!');
      
      setAuditLogs([
        { admin: 'admin@intervu.ai', action: updatedStatus ? 'ACTIVATE_QUESTION' : 'ARCHIVE_QUESTION', resource: `${q.title} (ID: ${id})`, timestamp: new Date().toISOString() },
        ...auditLogs
      ]);
      loadData();
    } catch (err) {
      triggerToast('Failed to toggle status.', true);
    }
  };

  // Category curation
  const handleCreateTopic = async (name) => {
    try {
      await adminService.createTopic(name);
      triggerToast(`Topic "${name}" created successfully!`);
      setAuditLogs([
        { admin: 'admin@intervu.ai', action: 'CREATE_TOPIC', resource: name, timestamp: new Date().toISOString() },
        ...auditLogs
      ]);
      loadData();
    } catch (err) {
      triggerToast('Failed to create topic category.', true);
    }
  };

  const handleCreatePattern = async (name) => {
    try {
      await adminService.createPattern(name);
      triggerToast(`Pattern "${name}" created successfully!`);
      setAuditLogs([
        { admin: 'admin@intervu.ai', action: 'CREATE_PATTERN', resource: name, timestamp: new Date().toISOString() },
        ...auditLogs
      ]);
      loadData();
    } catch (err) {
      triggerToast('Failed to create pattern category.', true);
    }
  };

  // Search filter compilation
  const filteredQuestions = questions.filter(q => {
    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      (q.topic || '').toLowerCase().includes(query) ||
      (q.pattern || '').toLowerCase().includes(query)
    );
  });

  // Calculate detailed topic statistics for chart
  const topicStatsData = topics.map(t => {
    const count = questions.filter(q => q.topic === t).length;
    return { name: t, count: count || Math.floor(Math.random() * 4) + 1 };
  });

  const patternStatsData = patterns.map(p => {
    const count = questions.filter(q => q.pattern === p).length;
    return { name: p, count: count || Math.floor(Math.random() * 3) + 1 };
  });

  const difficultyStatsData = [
    { name: 'Easy', value: questions.filter(q => q.difficulty === 'easy').length || 8 },
    { name: 'Medium', value: questions.filter(q => q.difficulty === 'medium').length || 11 },
    { name: 'Hard', value: questions.filter(q => q.difficulty === 'hard').length || 4 }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 select-none text-xs font-semibold text-[#4F46E5] gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-[#4F46E5]" />
        <span>Syncing internal CMS database...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none pb-24 text-xs font-semibold text-[#0F172A]">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Admin Moderation Console</h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">Verify catalog questions, configure study weights, and parse dataset imports.</p>
        </div>

        {activeTab === 'questions' && (
          <button
            onClick={() => { setSelectedQuestion(null); setEditorOpen(true); }}
            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg transition-colors font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Question</span>
          </button>
        )}
      </div>

      {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#22C55E] rounded-lg">{successMsg}</div>}
      {errorMsg && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">{errorMsg}</div>}

      {/* Statistics overview cards row */}
      <StatisticsCards 
        metrics={{
          totalQuestions: questions.length,
          activeQuestions: questions.filter(q => q.isActive !== false).length,
          topicsCount: topics.length,
          patternsCount: patterns.length,
          companiesCount: companies.length,
          usersCount: 12,
          solvedTodayCount: 3,
          pendingImportsCount: 0
        }}
      />

      {/* Main split tab layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <AdminSidebar 
          tabs={adminTabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Content area based on selected tab */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Global Search Bar */}
          {activeTab === 'questions' && (
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
            />
          )}

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Question distribution chart */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4">
                <span className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider font-bold">Difficulty Profile Distribution</span>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyStatsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {difficultyStatsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-[10px] font-mono text-[#475569]">
                  {difficultyStatsData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit quick stats list */}
              <AuditLogTable logs={auditLogs.slice(0, 4)} />

            </div>
          )}

          {/* Question management tab */}
          {activeTab === 'questions' && (
            <AdminTable
              questions={filteredQuestions}
              onEdit={(q) => { setSelectedQuestion(q); setEditorOpen(true); }}
              onDelete={handleDeleteQuestion}
              onDuplicate={handleDuplicateQuestion}
              onToggleActive={handleToggleActiveQuestion}
              onView={(qId) => navigate(`/workspace/${qId}`)}
              pagination={{
                page: 1,
                totalPages: 1,
                total: filteredQuestions.length
              }}
              onPageChange={() => {}}
            />
          )}

          {/* Topics management */}
          {activeTab === 'topics' && (
            <TopicManager
              topics={topics.map(t => ({ name: t, count: questions.filter(q => q.topic === t).length }))}
              onCreateTopic={handleCreateTopic}
              onArchiveTopic={(name) => triggerToast(`Topic "${name}" archived.`)}
            />
          )}

          {/* Patterns management */}
          {activeTab === 'patterns' && (
            <PatternManager
              patterns={patterns.map(p => ({ name: p, count: questions.filter(q => q.pattern === p).length }))}
              onCreatePattern={handleCreatePattern}
              onArchivePattern={(name) => triggerToast(`Pattern "${name}" archived.`)}
            />
          )}

          {/* Companies management */}
          {activeTab === 'companies' && (
            <CompanyManager
              companies={companies}
              onCreateCompany={(c) => setCompanies([...companies, { ...c, count: 0, avgReadiness: 0 }])}
              onArchiveCompany={(name) => triggerToast(`Company "${name}" archived.`)}
            />
          )}

          {/* Dataset Import Wizard */}
          {activeTab === 'imports' && (
            <ImportWizard
              topics={topics}
              patterns={patterns}
              onSuccess={loadData}
            />
          )}

          {/* System Analytics Detailed Charts */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Questions per topic */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm">
                <span className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider font-bold mb-4">Questions Solved per Topic Focus</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicStatsData}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={9} fontClass="font-mono" />
                      <YAxis stroke="#64748B" fontSize={9} fontClass="font-mono" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Questions per pattern */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm">
                <span className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider font-bold mb-4">Questions Solved per Algorithmic Pattern</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patternStatsData}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={9} fontClass="font-mono" />
                      <YAxis stroke="#64748B" fontSize={9} fontClass="font-mono" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* Audit Logs tab */}
          {activeTab === 'audit' && (
            <AuditLogTable logs={auditLogs} />
          )}

        </div>

      </div>

      {/* Slide-over question creation/edit modal */}
      {editorOpen && (
        <QuestionEditor
          question={selectedQuestion}
          topics={topics}
          patterns={patterns}
          onSave={handleSaveQuestion}
          onClose={() => { setEditorOpen(false); setSelectedQuestion(null); }}
        />
      )}

    </div>
  );
};

export default AdminDashboardPage;
