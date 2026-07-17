import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, Database, RefreshCw, Eye } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const ImportWizard = ({ 
  topics = [], 
  patterns = [], 
  onSuccess 
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [previewRows, setPreviewRows] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const [history, setHistory] = useState([
    { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), filename: 'leetcode_starter.json', count: 18, status: 'success' },
    { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), filename: 'blind75_weights.json', count: 75, status: 'success' }
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setJsonInput(evt.target.result);
      processAndValidate(evt.target.result);
    };
    reader.readAsText(file);
  };

  const processAndValidate = (rawText) => {
    try {
      setResults(null);
      const parsed = JSON.parse(rawText);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      setPreviewRows(rows);

      // Client side pre-validation
      const errors = [];
      rows.forEach((item, idx) => {
        if (!item.title || typeof item.title !== 'string') {
          errors.push(`Row ${idx + 1}: Missing or invalid title.`);
        }
        if (!item.difficulty || !['easy', 'medium', 'hard'].includes(item.difficulty.toLowerCase())) {
          errors.push(`Row ${idx + 1}: Difficulty must be 'easy', 'medium', or 'hard'.`);
        }
        if (item.topic && !topics.includes(item.topic)) {
          errors.push(`Row ${idx + 1}: Topic "${item.topic}" does not exist (will trigger backend reject).`);
        }
        if (item.pattern && !patterns.includes(item.pattern)) {
          errors.push(`Row ${idx + 1}: Pattern "${item.pattern}" does not exist (will trigger backend reject).`);
        }
      });
      setValidationErrors(errors);
    } catch (err) {
      setValidationErrors([`Invalid JSON Syntax: ${err.message}`]);
      setPreviewRows([]);
    }
  };

  const handleImport = async () => {
    if (previewRows.length === 0 || validationErrors.length > 0) return;
    try {
      setLoading(true);
      const res = await adminService.importQuestions(previewRows);
      setResults(res);
      
      // Update history logs
      setHistory([
        { timestamp: new Date().toISOString(), filename: 'manual_import.json', count: res.inserted, status: 'success' },
        ...history
      ]);
      setJsonInput('');
      setPreviewRows([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setValidationErrors([`Import failed: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-3">
        Dataset Import Wizard
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Column (Left) */}
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E2E8F0] hover:border-[#4F46E5] bg-[#F8FAFC] rounded-xl p-8 cursor-pointer transition-all">
            <Upload className="h-10 w-10 text-[#64748B] mb-2" />
            <span className="font-bold text-[#0F172A]">Upload JSON File</span>
            <span className="text-[10px] text-[#64748B] mt-0.5 font-medium leading-none">Drag & drop or click selection</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              processAndValidate(e.target.value);
            }}
            placeholder="Or paste raw JSON questions list here..."
            className="w-full h-32 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all resize-none font-mono"
          />

          {previewRows.length > 0 && validationErrors.length === 0 && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              <span>Import {previewRows.length} Questions</span>
            </button>
          )}
        </div>

        {/* Validation Column (Right) */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
            
            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>Validation Warning ({validationErrors.length})</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pl-6 list-disc text-[10px] font-medium leading-relaxed">
                  {validationErrors.slice(0, 10).map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                  {validationErrors.length > 10 && <div>...and {validationErrors.length - 10} more errors</div>}
                </div>
              </div>
            )}

            {/* Results alert */}
            {results && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#22C55E] rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="h-4.5 w-4.5" />
                  <span>Import Completed!</span>
                </div>
                <div className="text-[10px] font-mono pl-6 leading-relaxed">
                  <div>• Solved: {results.inserted} questions written</div>
                  <div>• Duplicates: {results.duplicates} ignored</div>
                  <div>• Failed: {results.failed} errors</div>
                </div>
              </div>
            )}

            {/* Preview scroll block */}
            {previewRows.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Batch Preview</span>
                <div className="border border-[#E2E8F0] rounded-lg divide-y divide-[#F1F5F9] max-h-36 overflow-y-auto pr-1">
                  {previewRows.slice(0, 5).map((row, idx) => (
                    <div key={idx} className="p-2 bg-[#F8FAFC]/50 text-[10px] font-medium leading-normal flex items-center justify-between">
                      <span className="font-bold text-[#0F172A] truncate max-w-[150px]">{row.title || 'Untitled'}</span>
                      <span className="text-[#64748B] font-mono">{row.topic} • {row.difficulty}</span>
                    </div>
                  ))}
                  {previewRows.length > 5 && (
                    <div className="p-2 text-center text-[#64748B] text-[9px] font-mono">
                      + {previewRows.length - 5} more questions in queue
                    </div>
                  )}
                </div>
              </div>
            )}

            {!jsonInput && !results && (
              <div className="text-center py-10 text-[#64748B] italic">
                Upload or paste a dataset to begin validation rules check.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* History Log listing */}
      <div className="border-t border-[#F1F5F9] pt-5 space-y-3.5">
        <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Import Action Log History
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[9px] font-mono uppercase text-[#64748B]">
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Filename</th>
                <th className="px-4 py-2">Uploaded Count</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {history.map((row, idx) => (
                <tr key={idx} className="text-xs font-semibold hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="px-4 py-2 font-mono text-[#64748B]">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-[#0F172A] font-bold">
                    {row.filename}
                  </td>
                  <td className="px-4 py-2 font-mono text-[#475569]">
                    {row.count} questions
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded border border-[#22C55E]/20">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => alert(`Simulating rollback for import dataset: ${row.filename}. (${row.count} questions archived).`)}
                      className="text-[10px] font-bold text-[#EF4444] hover:underline"
                    >
                      Rollback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ImportWizard;
