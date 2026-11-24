import React from 'react';
import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

const MONACO_LANG = {
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  javascript: 'javascript',
  go: 'go',
  csharp: 'csharp',
};

const CodeEditor = ({ value, onChange, language = 'python', height = '460px', onRun }) => {
  const handleMount = (editor, monaco) => {
    // Ctrl/Cmd + Enter runs the code
    if (onRun) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRun());
    }
  };

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#1E1E1E]">
      <Editor
        height={height}
        language={MONACO_LANG[language] || 'plaintext'}
        value={value}
        theme="vs-dark"
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        loading={
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading editor...
          </div>
        }
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          padding: { top: 12 },
        }}
      />
    </div>
  );
};

export default CodeEditor;
