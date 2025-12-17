'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, Save } from 'lucide-react';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onRegenerate: () => void;
  onSave: () => void;
  isLoading: boolean;
  saving: boolean;
}

export default function PromptEditor({
  prompt,
  onPromptChange,
  onRegenerate,
  onSave,
  isLoading,
  saving
}: PromptEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [prompt]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-200">提取的 Prompt</h2>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            disabled={isLoading || !prompt}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            重新生成
          </button>
          <button
            onClick={onSave}
            disabled={!prompt || saving}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Save size={14} />
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={handleCopy}
            disabled={!prompt}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} />
                已复制
              </>
            ) : (
              <>
                <Copy size={14} />
                复制
              </>
            )}
          </button>
        </div>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="上传图片后，AI 将自动分析并生成描述该图片的 Prompt..."
        className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="mt-2 text-sm text-gray-500">
        字数：{prompt.length} | 你可以直接编辑上方文本来修改 Prompt
      </div>
    </div>
  );
}
