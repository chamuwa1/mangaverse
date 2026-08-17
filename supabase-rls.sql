-- Supabase Row Level Security (RLS) Configuration for MangaVerse

-- 1. Enable RLS on reading_history table
ALTER TABLE IF EXISTS reading_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only select their own reading history
CREATE POLICY "Users can view their own reading history" 
ON reading_history FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert, update, or delete their own history
CREATE POLICY "Users can manage their own reading history" 
ON reading_history FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 2. Enable RLS on library table
ALTER TABLE IF EXISTS library ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only select their own library
CREATE POLICY "Users can view their own library" 
ON library FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert, update, or delete their own library entries
CREATE POLICY "Users can manage their own library" 
ON library FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
