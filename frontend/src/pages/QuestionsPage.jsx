import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  LayoutGrid, 
  LayoutList, 
  RotateCcw,
  Star,
  Bookmark,
  Eye,
  Info,
  Compass,
  ArrowRight
} from 'lucide-react';
import { questionsService } from '../services/questions.service';
import FilterSidebar from '../components/explorer/FilterSidebar';
import QuestionCard from '../components/explorer/QuestionCard';
import QuestionPreview from '../components/explorer/QuestionPreview';
import SortDropdown from '../components/explorer/SortDropdown';
import Pagination from '../components/explorer/Pagination';

// Helper to highlight matching text
const highlightMatch = (text, searchVal) => {
  if (!searchVal || !text) return text;
  const regex = new RegExp(`(${searchVal})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === searchVal.toLowerCase() 
          ? <mark key={i} className="bg-indigo-100 text-[#4F46E5] px-0.5 rounded font-bold">{part}</mark> 
          : part
      )}
    </span>
  );
};

// Skeleton Card loader
const SkeletonCard = () => (
  <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl animate-pulse space-y-3 select-none">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-[#F1F5F9] rounded w-20" />
      <div className="h-4 bg-[#F1F5F9] rounded w-10" />
    </div>
    <div className="h-5 bg-[#F1F5F9] rounded w-2/3" />
    <div className="h-3.5 bg-[#F1F5F9] rounded w-1/2" />
    <div className="h-8 bg-[#F1F5F9] rounded w-full mt-4" />
  </div>
);

const QuestionsPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Sorting States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topicId, setTopicId] = useState('');
  const [patternId, setPatternId] = useState('');
  const [company, setCompany] = useState('');
  const [frequency, setFrequency] = useState('');
  const [sortBy, setSortBy] = useState('learningOrder');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  
  // Dynamic metadata lists fetched from backend
  const [availableTopics, setAvailableTopics] = useState([]);
  const [availablePatterns, setAvailablePatterns] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  // Selected Question Preview
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Mobile drawer controls
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Favorites & Bookmarks lists (stored locally / mock tracking)
  const [favorites, setFavorites] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  // Search Debouncing timer
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to first page on search
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Load dynamic filter metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [topicsList, patternsList] = await Promise.all([
          questionsService.getTopics(),
          questionsService.getPatterns()
        ]);
        setAvailableTopics(topicsList || []);
        setAvailablePatterns(patternsList || []);
      } catch (err) {
        console.error('Failed to load explorer metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Load questions and user progress list
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearch,
        difficulty,
        topicId,
        patternId,
        company,
        frequency,
        sortBy,
        page,
        limit
      };

      const [qData, pData] = await Promise.all([
        questionsService.get(params),
        questionsService.getProgress()
      ]);

      setQuestions(qData.questions || []);
      setTotalPages(qData.pagination?.totalPages || 1);
      setProgressList(pData || []);

      // Retain selected preview selection matching if present
      if (selectedQuestion) {
        const updated = (qData.questions || []).find(q => q.id === selectedQuestion.id);
        if (updated) setSelectedQuestion(updated);
      }
    } catch (err) {
      console.error('Failed to load explorer questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [debouncedSearch, difficulty, topicId, patternId, company, frequency, sortBy, page]);

  // Status check utilities
  const getQuestionProgress = (qId) => {
    const prog = progressList.find(p => p.question_id === qId);
    return prog ? prog.status : 'NOT_STARTED';
  };

  // Toggle handlers
  const handleFavorite = async (qId) => {
    try {
      await questionsService.favorite(qId);
      // Reload local indicators
      if (favorites.includes(qId)) {
        setFavorites(favorites.filter(id => id !== qId));
      } else {
        setFavorites([...favorites, qId]);
      }
      loadQuestions();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleBookmark = (qId) => {
    if (bookmarks.includes(qId)) {
      setBookmarks(bookmarks.filter(id => id !== qId));
    } else {
      setBookmarks([...bookmarks, qId]);
    }
  };

  const handleStart = async (qId) => {
    try {
      await questionsService.start(qId);
      loadQuestions();
    } catch (err) {
      console.error('Failed to mark started:', err);
    }
  };

  // Open the in-app coding workspace, marking the question as started if it is new
  const handleOpenWorkspace = async (qId) => {
    if (getQuestionProgress(qId) === 'NOT_STARTED') {
      try {
        await questionsService.start(qId);
      } catch (err) {
        console.error('Failed to mark started:', err);
      }
    }
    navigate(`/workspace/${qId}`);
  };

  const handleRandomPractice = () => {
    const pool = questions.filter((q) => getQuestionProgress(q.id) !== 'SOLVED');
    const list = pool.length ? pool : questions;
    if (!list.length) return;
    handleOpenWorkspace(list[Math.floor(Math.random() * list.length)].id);
  };

  const handleSolve = async (qId) => {
    try {
      await questionsService.markSolved(qId);
      loadQuestions();
    } catch (err) {
      console.error('Failed to mark solved:', err);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDifficulty('');
    setTopicId('');
    setPatternId('');
    setCompany('');
    setFrequency('');
    setPage(1);
  };

  const handlePreviewOpen = (q) => {
    setSelectedQuestion(q);
    setPreviewOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Top Header & Page Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Question Explorer</h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">Browse curated coding interview questions, filter by company, topic, and difficulty.</p>
        </div>
      </div>

      {/* Explorer Top Bar */}
      <div className="flex items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-sm shrink-0 text-xs font-semibold">
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] rounded-lg text-[#64748B] font-bold"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span>Filters</span>
          </button>
          
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {/* View Layout Toggle */}
        <div className="flex items-center gap-1 border border-[#E2E8F0] rounded-lg p-1 bg-[#F8FAFC]">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0f172a]'}`}
            title="List view"
          >
            <LayoutList className="h-4 w-4 shrink-0" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0f172a]'}`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Grid View Panels */}
      <div className="flex-1 flex gap-8 items-start overflow-hidden">
        
        {/* Left Column: Filter Sidebar (Desktop only) */}
        <aside className="hidden lg:block lg:w-64 shrink-0 h-full overflow-hidden">
          <FilterSidebar
            search={search}
            setSearch={setSearch}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            topicId={topicId}
            setTopicId={setTopicId}
            patternId={patternId}
            setPatternId={setPatternId}
            availableTopics={availableTopics}
            availablePatterns={availablePatterns}
            company={company}
            setCompany={setCompany}
            frequency={frequency}
            setFrequency={setFrequency}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Center Panel: Question List */}
        <div className="flex-1 flex flex-col gap-4 max-h-full overflow-y-auto h-full pr-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 bg-white border border-dashed border-[#E2E8F0] rounded-xl p-8 flex-1 select-none">
              {/* Premium SVG Magnifying Glass and Grid Mockup */}
              <div className="w-24 h-24 mb-6 relative">
                <svg className="w-full h-full text-indigo-100" fill="none" viewBox="0 0 100 100" stroke="currentColor">
                  <rect x="15" y="15" width="70" height="70" rx="12" strokeWidth="2.5" className="text-slate-100" fill="#F8FAFC" />
                  <path d="M25 35h30M25 50h40M25 65h20" strokeWidth="3" strokeLinecap="round" className="text-slate-200" />
                  <circle cx="70" cy="70" r="14" strokeWidth="3" fill="#FFFFFF" className="text-[#4F46E5]" />
                  <path d="M80 80l8 8" strokeWidth="3.5" strokeLinecap="round" className="text-[#4F46E5]" />
                </svg>
              </div>

              <h3 className="text-base font-extrabold text-[#0F172A] mb-1">No matching questions found</h3>
              <p className="text-xs text-[#64748B] max-w-xs mb-6 leading-relaxed">
                Adjust your search queries, reset the accordion filters, or explore our recommended questions.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="h-10 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => navigate('/workspace/1')}
                  className="h-10 px-4 bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-lg transition-all active:scale-[0.98]"
                >
                  Try Random Question
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-3'}>
                {questions.map((q) => {
                  const status = getQuestionProgress(q.id);
                  const isFav = favorites.includes(q.id) || status === 'FAVORITE';
                  const isBk = bookmarks.includes(q.id);
                  return (
                    <QuestionCard
                      key={q.id}
                      question={{
                        ...q,
                        title: highlightMatch(q.title, debouncedSearch)
                      }}
                      status={status}
                      isFavorite={isFav}
                      isBookmarked={isBk}
                      viewMode={viewMode}
                      onPreview={handlePreviewOpen}
                      onFavorite={handleFavorite}
                      onBookmark={handleBookmark}
                      onOpenWorkspace={handleOpenWorkspace}
                    />
                  );
                })}
              </div>

              {/* Pagination controls */}
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        {/* Right Column: Question Preview (Desktop only) */}
        <aside className="hidden lg:block lg:w-80 shrink-0 max-h-full h-full overflow-y-auto">
          <QuestionPreview
            question={selectedQuestion}
            status={selectedQuestion ? getQuestionProgress(selectedQuestion.id) : 'NOT_STARTED'}
            isFavorite={selectedQuestion ? (favorites.includes(selectedQuestion.id) || getQuestionProgress(selectedQuestion.id) === 'FAVORITE') : false}
            onClose={() => setSelectedQuestion(null)}
            onStart={handleStart}
            onSolve={handleSolve}
            onFavorite={handleFavorite}
            onOpenWorkspace={handleOpenWorkspace}
            onQuickStartRandom={handleRandomPractice}
          />
        </aside>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="relative w-80 max-w-full bg-white h-full p-4 overflow-y-auto z-50 flex flex-col shadow-xl">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#E2E8F0]">
              <span className="font-extrabold text-sm text-[#0F172A]">Filters</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1 rounded hover:bg-[#F1F5F9]">
                <X className="h-5 w-5 text-[#64748B]" />
              </button>
            </div>
            <FilterSidebar
              search={search}
              setSearch={setSearch}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              topicId={topicId}
              setTopicId={setTopicId}
              patternId={patternId}
              setPatternId={setPatternId}
              availableTopics={availableTopics}
              availablePatterns={availablePatterns}
              company={company}
              setCompany={setCompany}
              frequency={frequency}
              setFrequency={setFrequency}
              onReset={handleResetFilters}
            />
          </div>
        </div>
      )}

      {/* Mobile Question Preview Modal */}
      {previewOpen && selectedQuestion && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col z-50">
            <QuestionPreview
              question={selectedQuestion}
              status={getQuestionProgress(selectedQuestion.id)}
              isFavorite={favorites.includes(selectedQuestion.id) || getQuestionProgress(selectedQuestion.id) === 'FAVORITE'}
              onClose={() => { setPreviewOpen(false); setSelectedQuestion(null); }}
              onStart={handleStart}
              onSolve={handleSolve}
              onFavorite={handleFavorite}
              onOpenWorkspace={handleOpenWorkspace}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default QuestionsPage;
