import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - 获取所有历史记录
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}

// POST - 保存新的 prompt
export async function POST(request: NextRequest) {
  try {
    const { image_url, original_prompt, edited_prompt } = await request.json();

    if (!original_prompt) {
      return NextResponse.json(
        { error: '原始 prompt 不能为空' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert({
        image_url,
        original_prompt,
        edited_prompt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('保存 prompt 失败:', error);
    return NextResponse.json(
      { error: '保存 prompt 失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少 ID 参数' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除记录失败:', error);
    return NextResponse.json(
      { error: '删除记录失败' },
      { status: 500 }
    );
  }
}