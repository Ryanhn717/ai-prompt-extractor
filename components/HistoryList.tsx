'use client';

import { useState, useEffect } from 'react';
import { Copy, Trash2, Clock } from 'lucide-react';
import { Prompt } from '@/lib/supabase';

export default function HistoryList() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prompts');
      const data = await response.json();
      setPrompts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await fetch(`/api/prompts?id=${id}`, { method: 'DELETE' });
      setPrompts(prompts.filter(p => p.id !== id));
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-200">历史记录</h2>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {loading && prompts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          加载中...
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          还没有历史记录
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={14} />
                  {formatDate(item.created_at)}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">原始 Prompt:</div>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {item.original_prompt}
                  </p>
                </div>

                {item.edited_prompt && item.edited_prompt !== item.original_prompt && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">编辑后:</div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {item.edited_prompt}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleCopy(item.edited_prompt || item.original_prompt)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Copy size={12} />
                    复制
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}