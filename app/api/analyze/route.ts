import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: '请提供图片' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API Key 未配置' },
        { status: 500 }
      );
    }

    // 从 base64 中提取媒体类型和数据
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: '无效的图片格式' },
        { status: 400 }
      );
    }

    const mediaType = matches[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const base64Data = matches[2];

    const response = await anthropic.messages.create({
      model: 'glm-4.6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `请详细分析这张图片，并生成一个可以用于 AI 图像生成工具（如 Midjourney、Stable Diffusion、DALL-E）的英文 prompt。

要求：
1. 描述图片的主要内容、风格、构图、色调、光影等
2. 使用专业的 AI 绘画 prompt 格式
3. 包含艺术风格、画面质量等关键词
4. 直接输出 prompt，不需要其他解释

示例格式：
A [subject] in [setting], [style], [lighting], [mood], [technical parameters]`
            },
          ],
        },
      ],
    });

    // 提取文本响应
    const textContent = response.content.find(block => block.type === 'text');
    const prompt = textContent && 'text' in textContent ? textContent.text : '';

    return NextResponse.json({ prompt });
  } catch (error: unknown) {
    console.error('分析图片失败:', error);

    const errorMessage = error instanceof Error ? error.message : '未知错误';

    return NextResponse.json(
      { error: `分析失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
