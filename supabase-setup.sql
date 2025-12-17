-- 创建 prompts 历史记录表
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT, -- 保存图片URL（可选）
  original_prompt TEXT NOT NULL,
  edited_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON public.prompts(created_at DESC);

-- 开启行级安全
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- 允许所有人插入和查看（简化版本）
CREATE POLICY "Allow all access" ON public.prompts
  FOR ALL USING (true) WITH CHECK (true);

-- 示例查询
-- SELECT * FROM public.prompts ORDER BY created_at DESC LIMIT 10;
-- INSERT INTO public.prompts (original_prompt) VALUES ('A beautiful sunset');
-- DELETE FROM public.prompts WHERE id = 'your-uuid';