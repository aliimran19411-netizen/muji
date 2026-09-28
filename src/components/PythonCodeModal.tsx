import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal, X, ExternalLink } from 'lucide-react';

interface PythonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appPyCode: string;
  requirementsCode: string;
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({
  isOpen,
  onClose,
  appPyCode,
  requirementsCode,
}) => {
  const [activeTab, setActiveTab] = useState<'app.py' | 'requirements.txt' | 'guide'>('app.py');
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'app' | 'reqs') => {
    navigator.clipboard.writeText(text);
    if (type === 'app') {
      setCopiedApp(true);
      setTimeout(() => setCopiedApp(false), 2000);
    } else {
      setCopiedReqs(true);
      setTimeout(() => setCopiedReqs(false), 2000);
    }
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Python Streamlit Application Code
              </h2>
              <p className="text-xs text-slate-400">
                Single-file <code className="text-blue-300 font-mono">app.py</code> with <code className="text-blue-300 font-mono">requirements.txt</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('app.py', appPyCode)}
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download app.py
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('app.py')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'app.py'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              app.py
            </button>
            <button
              onClick={() => setActiveTab('requirements.txt')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'requirements.txt'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              requirements.txt
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'guide'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Quick Setup Guide
            </button>
          </div>

          <div className="pb-2">
            {activeTab === 'app.py' && (
              <button
                onClick={() => handleCopy(appPyCode, 'app')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-medium px-2 py-1 rounded bg-blue-950/50 border border-blue-800/60"
              >
                {copiedApp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedApp ? 'Copied app.py!' : 'Copy Code'}
              </button>
            )}
            {activeTab === 'requirements.txt' && (
              <button
                onClick={() => handleCopy(requirementsCode, 'reqs')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-medium px-2 py-1 rounded bg-blue-950/50 border border-blue-800/60"
              >
                {copiedReqs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedReqs ? 'Copied requirements.txt!' : 'Copy requirements'}
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed flex-1">
          {activeTab === 'app.py' && (
            <pre className="text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto selection:bg-blue-600/30">
              <code>{appPyCode}</code>
            </pre>
          )}

          {activeTab === 'requirements.txt' && (
            <div>
              <div className="mb-3 text-xs text-slate-400">
                Put these exact four libraries inside your <code className="text-blue-300">requirements.txt</code> file:
              </div>
              <pre className="text-emerald-400 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto text-sm">
                <code>{requirementsCode}</code>
              </pre>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="font-sans text-sm text-slate-300 space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  How to run this on your local machine:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>Make sure Python 3.10+ is installed on your computer.</li>
                  <li>
                    Create a new folder and save the code into <code className="text-blue-400 font-mono">app.py</code> and <code className="text-blue-400 font-mono">requirements.txt</code>.
                  </li>
                  <li>
                    Open your terminal in that folder and install the dependencies:
                    <div className="mt-1 p-2 bg-slate-900 border border-slate-700 rounded font-mono text-emerald-300 text-xs">
                      pip install -r requirements.txt
                    </div>
                  </li>
                  <li>
                    Run the Streamlit application:
                    <div className="mt-1 p-2 bg-slate-900 border border-slate-700 rounded font-mono text-emerald-300 text-xs">
                      streamlit run app.py
                    </div>
                  </li>
                  <li>Your browser will automatically open <code className="text-blue-400 font-mono">http://localhost:8501</code> with the interactive application!</li>
                </ol>
              </div>

              <div className="bg-blue-950/30 border border-blue-800/50 p-4 rounded-xl text-xs space-y-1.5 text-blue-200">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Free Gemini API Key:
                </div>
                <p>
                  You can get a free API key instantly at{' '}
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-blue-400 font-semibold"
                  >
                    Google AI Studio (aistudio.google.com)
                  </a>
                  . Paste it into the sidebar password field in the Streamlit app.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
