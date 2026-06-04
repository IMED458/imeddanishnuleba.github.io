import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, AlignLeft, 
  AlignCenter, AlignRight, Table, Link as LinkIcon, 
  Type, Undo, Redo, Copy, ClipboardCheck
} from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder = 'შეიყვანეთ ტექსტი...' }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Set initial content if different and not currently selected
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      
      // Update custom undo/redo history if substantial change
      const lastHistoryItem = history[historyIdx];
      if (html !== lastHistoryItem) {
        const newHistory = history.slice(0, historyIdx + 1);
        const updated = [...newHistory, html];
        setHistory(updated);
        setHistoryIdx(updated.length - 1);
      }
    }
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      const content = history[prevIdx];
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        onChange(content);
      }
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      const content = history[nextIdx];
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        onChange(content);
      }
    }
  };

  const copyToClipboard = () => {
    if (editorRef.current) {
      // Create temporary textarea to copy plain text or rich text
      const text = editorRef.current.innerText;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; font-size: 13px;">დასახელება</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; font-size: 13px;">დოზირება</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; font-size: 13px;">ხანგრძლივობა</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 13px;">წამალი ა</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 13px;">1ტ x 2-ჯერ დღეში</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 13px;">7 დღე</td>
          </tr>
        </tbody>
      </table>
    `;
    executeCommand('insertHTML', tableHTML);
  };

  const insertLink = () => {
    const url = prompt('შეიყვანეთ ბმულის მისამართი (URL):', 'https://');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const changeTextSize = (size: string) => {
    // Standard command acts on selection
    if (size === 'h3') {
      executeCommand('formatBlock', '<h3>');
    } else if (size === 'h4') {
      executeCommand('formatBlock', '<h4>');
    } else if (size === 'p') {
      executeCommand('formatBlock', '<p>');
    } else {
      executeCommand('fontSize', size); // 1 to 7
    }
  };

  return (
    <div className="w-full flex flex-col border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all duration-200">
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 select-none">
        
        {/* Formatting Actions */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 hover:bg-slate-200 active:bg-slate-300 rounded text-slate-700 transition"
            title="სქელი ტექსტი (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 hover:bg-slate-200 active:bg-slate-300 rounded text-slate-700 transition"
            title="დახრილი ტექსტი (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 hover:bg-slate-200 active:bg-slate-300 rounded text-slate-700 transition"
            title="ხაზგასმული ტექსტი (Underline)"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Font Headings / Paragraph */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5 mr-1">
          <select 
            onChange={(e) => changeTextSize(e.target.value)}
            className="h-8 text-xs font-medium rounded border border-slate-200 bg-white px-2 py-1 outline-none text-slate-700 focus:border-slate-400"
            defaultValue="p"
            title="ტექსტის სტილი"
          >
            <option value="p">აბზაცი (Paragraph)</option>
            <option value="h3">მთავარი სათაური (H1)</option>
            <option value="h4">ქვესათაური (H2)</option>
            <option value="3">პატარა შრიფტი</option>
            <option value="4">სტანდარტული შრიფტი</option>
            <option value="5">დიდი შრიფტი</option>
          </select>
        </div>

        {/* Lists & Alignment */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
            title="მარკირებული სია"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
            title="ნუმერირებული სია"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
            title="ძებნა მარცხნივ"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
            title="ძებნა ცენტრში"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
            title="ძებნა მარჯვნივ"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table & Hyperlinks */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 hover:bg-slate-200 rounded text-emerald-700 transition"
            title="ცხრილის დამატება"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className="p-1.5 hover:bg-slate-200 rounded text-blue-600 transition"
            title="ბმულის ჩასმა"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Actions & History */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIdx === 0}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="უკან დაბრუნება (Undo)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIdx === history.length - 1}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="წინ გადასვლა (Redo)"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition relative"
            title="კოპირება (Copy Text)"
          >
            {copied ? (
              <ClipboardCheck className="w-4 h-4 text-emerald-600 font-bold" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>

      {/* EDITABLE COMPONENT */}
      <div 
        ref={editorRef}
        contentEditable
        onBlur={handleContentChange}
        onInput={handleContentChange}
        className="prose-editor min-h-[220px] max-h-[450px] overflow-y-auto px-4 py-3 outline-none text-slate-800 text-sm md:text-base leading-relaxed bg-white"
        placeholder={placeholder}
        style={{ wordBreak: 'break-word' }}
      />
      
      {/* Character Count */}
      <div className="flex justify-between items-center bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 px-3 py-1 font-mono">
        <span>* დააჭირეთ Shift+Enter აბზაცის გარეშე გადასასვლელად</span>
        <span>შენახულია ლოკალურად</span>
      </div>

    </div>
  );
}
