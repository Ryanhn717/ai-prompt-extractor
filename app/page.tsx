'use client';

import { useState, useCallback } from 'react';
import {
  Sparkles,
  Upload,
  Copy,
  Save,
  ArrowRight,
  CheckCircle,
  Image as ImageIcon,
  Zap
} from 'lucide-react';

// 对话框组件
function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">AI Prompt Extractor</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const analyzeImage = useCallback(async (base64: string) => {
    if (!base64) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '分析失败');
      }

      setPrompt(data.prompt);
      setOriginalPrompt(data.prompt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分析失败，请重试';
      setError(errorMessage);
      console.error('分析错误:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageBase64(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  }, [analyzeImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

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

  const handleSave = useCallback(async () => {
    if (!prompt) return;
    setSaving(true);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_prompt: originalPrompt,
          edited_prompt: prompt !== originalPrompt ? prompt : null,
        }),
      });
      if (response.ok) {
        alert('保存成功！');
      }
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }, [prompt, originalPrompt]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24">
          {/* Header */}
          <header className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Sparkles size={24} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                AI Powered
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Image to Prompt
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              将任意图片转换为精美的 AI 绘画 Prompt
              <br />
              支持中英文图片，适用于 Midjourney、Stable Diffusion
            </p>
          </header>

          {/* CTA Button */}
          <div className="flex justify-center mb-16">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full hover:scale-105 transition-all duration-200 text-lg shadow-lg"
            >
              <Zap size={20} />
              免费体验
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-gray-900/50 to-transparent border border-gray-800">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">拖拽上传</h3>
              <p className="text-gray-400">支持 JPG、PNG、WebP 等格式</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-gray-900/50 to-transparent border border-gray-800">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI 智能</h3>
              <p className="text-gray-400">GLM-4.6 深度理解图片内容</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-gray-900/50 to-transparent border border-gray-800">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Copy size={24} className="text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">一键复制</h3>
              <p className="text-gray-400">生成专业级 AI 绘画 Prompt</p>
            </div>
          </div>

          {/* How it works */}
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold mb-8">简单三步，获取完美 Prompt</h2>
            <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold mb-3">
                  1
                </div>
                <p className="text-gray-300">上传图片</p>
              </div>
              <div className="text-gray-600">
                <ArrowRight size={24} />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold mb-3">
                  2
                </div>
                <p className="text-gray-300">AI 分析</p>
              </div>
              <div className="text-gray-600">
                <ArrowRight size={24} />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-2xl font-bold mb-3">
                  3
                </div>
                <p className="text-gray-300">复制使用</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Image Upload */}
          <div>
            <h3 className="text-lg font-semibold mb-3">上传图片</h3>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFile(file);
                };
                input.click();
              }}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isLoading
                  ? 'border-blue-500 bg-blue-500/10 opacity-50'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }
              `}
            >
              {imageBase64 ? (
                <img
                  src={imageBase64}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-gray-800 rounded-full">
                    <Upload size={32} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-300">拖拽图片到这里</p>
                    <p className="text-sm text-gray-500">或点击选择文件</p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    分析中...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Prompt Result */}
          <div>
            <h3 className="text-lg font-semibold mb-3">生成的 Prompt</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="AI 将在这里生成描述图片的 Prompt..."
              className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCopy}
                disabled={!prompt || copied}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                {copied ? '已复制' : '复制 Prompt'}
              </button>
              <button
                onClick={handleSave}
                disabled={!prompt || saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Save size={20} />
                {saving ? '保存中...' : '保存记录'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </Dialog>
    </div>
  );
}