import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  Eye, 
  Edit, 
  Archive, 
  Trash2, 
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import DifficultyBadge from '../explorer/DifficultyBadge';

const AdminTable = ({
  questions = [],
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onView,
  pagination = {},
  onPageChange
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(questions.map(q => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(x => x !== id));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Client sort mapping
  const sortedQuestions = [...questions].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'topic') {
      valA = a.topic || '';
      valB = b.topic || '';
    } else if (sortField === 'pattern') {
      valA = a.pattern || '';
      valB = b.pattern || '';
    }
    
    if (typeof valA === 'string') {
      return sortOrder === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden select-none text-xs font-semibold text-[#0F172A] flex flex-col justify-between">
      
      {/* Bulk actions banner */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between text-xs font-bold text-[#4F46E5]">
          <span>{selectedIds.length} items selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                selectedIds.forEach(id => onToggleActive(id));
                setSelectedIds([]);
              }}
              className="px-2.5 py-1.5 bg-white border border-indigo-200 text-[#4F46E5] hover:bg-indigo-100/50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Toggle Active</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.length} questions?`)) {
                  selectedIds.forEach(id => onDelete(id));
                  setSelectedIds([]);
                }
              }}
              className="px-2.5 py-1.5 bg-[#EF4444] text-white hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[9px] font-mono uppercase text-[#64748B] tracking-wider">
              <th className="px-5 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={questions.length > 0 && selectedIds.length === questions.length}
                  onChange={handleSelectAll}
                  className="h-3.5 w-3.5 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
                />
              </th>
              {/* Columns Header with Sort indicators */}
              {[
                { field: 'title', label: 'Title' },
                { field: 'topic', label: 'Topic' },
                { field: 'pattern', label: 'Pattern' },
                { field: 'difficulty', label: 'Difficulty' },
                { field: 'frequency', label: 'Frequency' },
                { field: 'isActive', label: 'Status' },
                { field: 'createdAt', label: 'Created' }
              ].map((col) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className="px-5 py-3.5 cursor-pointer hover:bg-indigo-50/20 select-none text-left"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{col.label}</span>
                    {sortField === col.field ? (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 text-[#4F46E5]" /> : <ChevronDown className="h-3 w-3 text-[#4F46E5]" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-[#CBD5E1]" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {sortedQuestions.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-[#64748B] italic">
                  No questions found matching the query.
                </td>
              </tr>
            ) : (
              sortedQuestions.map((row) => (
                <tr key={row.id} className="hover:bg-[#F8FAFC]/40 transition-colors text-xs font-semibold">
                  <td className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      className="h-3.5 w-3.5 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
                    />
                  </td>
                  <td className="px-5 py-3.5 text-[#0F172A] font-extrabold truncate max-w-[200px]" title={row.title}>
                    {row.title}
                  </td>
                  <td className="px-5 py-3.5 text-[#475569]">{row.topic}</td>
                  <td className="px-5 py-3.5 text-[#475569]">{row.pattern}</td>
                  <td className="px-5 py-3.5">
                    <DifficultyBadge difficulty={row.difficulty} />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[#475569]">
                    {row.frequency || 'Low'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      row.isActive !== false
                        ? 'text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20'
                        : 'text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0]'
                    }`}>
                      {row.isActive !== false ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[#64748B]">
                    {formatDate(row.createdAt)}
                  </td>
                  
                  {/* Dropdown Menu actions */}
                  <td className="px-5 py-3.5 text-right relative">
                    <button
                      onClick={(e) => toggleDropdown(row.id, e)}
                      className="p-1 rounded hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors inline-block"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenuId === row.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-5 mt-1.5 w-40 bg-white border border-[#E2E8F0] shadow-lg rounded-xl z-50 py-1.5 text-left divide-y divide-[#F1F5F9]">
                          <div className="py-1">
                            <button
                              onClick={() => { onView(row.id); setActiveMenuId(null); }}
                              className="w-full px-3.5 py-1.5 hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] text-xs font-semibold flex items-center gap-2 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                              <span>View Workspace</span>
                            </button>
                            <button
                              onClick={() => { onEdit(row); setActiveMenuId(null); }}
                              className="w-full px-3.5 py-1.5 hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] text-xs font-semibold flex items-center gap-2 transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5 text-[#64748B]" />
                              <span>Edit Question</span>
                            </button>
                            <button
                              onClick={() => { onDuplicate(row); setActiveMenuId(null); }}
                              className="w-full px-3.5 py-1.5 hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] text-xs font-semibold flex items-center gap-2 transition-colors"
                            >
                              <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                              <span>Duplicate</span>
                            </button>
                          </div>
                          
                          <div className="py-1">
                            <button
                              onClick={() => { onToggleActive(row.id); setActiveMenuId(null); }}
                              className="w-full px-3.5 py-1.5 hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] text-xs font-semibold flex items-center gap-2 transition-colors"
                            >
                              <Archive className="h-3.5 w-3.5 text-[#64748B]" />
                              <span>{row.isActive !== false ? 'Archive' : 'Activate'}</span>
                            </button>
                            <button
                              onClick={() => { 
                                if (window.confirm('Are you sure you want to delete this question?')) {
                                  onDelete(row.id);
                                }
                                setActiveMenuId(null); 
                              }}
                              className="w-full px-3.5 py-1.5 hover:bg-[#F8FAFC] text-[#EF4444] hover:bg-red-50/50 text-xs font-semibold flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination indicators footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs font-semibold">
          <span className="text-[#64748B] font-mono">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1 rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTable;
