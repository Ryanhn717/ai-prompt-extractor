'use client';

import { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import PromptEditor from '@/components/PromptEditor';
import HistoryList from '@/components/HistoryList';

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

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

  const handleImageSelect = useCallback((base64: string) => {
    setImageBase64(base64);
    analyzeImage(base64);
  }, [analyzeImage]);

  const handleRegenerate = useCallback(() => {
    if (imageBase64) {
      analyzeImage(imageBase64);
    }
  }, [imageBase64, analyzeImage]);

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
          image_url: imageBase64.slice(0, 500), // 只保存前500个字符的预览
          original_prompt: originalPrompt,
          edited_prompt: prompt !== originalPrompt ? prompt : null,
        }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      alert('保存成功！');
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }, [prompt, originalPrompt, imageBase64]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500" size={28} />
            <h1 className="text-xl font-bold">AI Prompt Extractor</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            上传图片，AI 自动提取可用于图像生成的 Prompt
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image Upload */}
          <div>
            <h2 className="text-lg font-semibold text-gray-200 mb-3">上传图片</h2>
            <ImageUploader
              onImageSelect={handleImageSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Right: Prompt Editor */}
          <div>
            <PromptEditor
              prompt={prompt}
              onPromptChange={setPrompt}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
              isLoading={isLoading}
              saving={saving}
            />
          </div>
        </div>

        {/* History Section */}
        <div className="mt-8">
          <HistoryList />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Usage Tips */}
        <div className="mt-12 p-6 bg-gray-800/50 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">使用说明</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>1. 上传一张图片（支持拖拽或点击上传）</li>
            <li>2. AI 会自动分析图片并生成对应的英文 Prompt</li>
            <li>3. 你可以直接编辑生成的 Prompt 来调整细节</li>
            <li>4. 点击"复制"按钮将 Prompt 复制到剪贴板</li>
            <li>5. 将 Prompt 用于 Midjourney、Stable Diffusion、DALL-E 等工具</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          Powered by GLM-4.6 Vision
        </div>
      </footer>
    </div>
  );
}
