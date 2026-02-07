-- ============================================
-- Bookshelf App — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- 1. Books table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  year INTEGER,
  pages INTEGER,
  cover TEXT,
  status TEXT DEFAULT 'want' CHECK (status IN ('want', 'reading', 'finished')),
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  notes TEXT DEFAULT '',
  shelf_year INTEGER,
  ol_key TEXT,
  schema_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_user_year ON books(user_id, shelf_year);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_updated_at ON books;
CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. User preferences table
CREATE TABLE IF NOT EXISTS user_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'classic',
  shelf_name TEXT DEFAULT 'My Shelf',
  schema_version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS user_prefs_updated_at ON user_prefs;
CREATE TRIGGER user_prefs_updated_at
  BEFORE UPDATE ON user_prefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. Row Level Security (RLS) — CRITICAL
-- Each user can ONLY access their own data
-- ============================================

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prefs ENABLE ROW LEVEL SECURITY;

-- Books: users can only CRUD their own books
DROP POLICY IF EXISTS "Users can view own books" ON books;
CREATE POLICY "Users can view own books" ON books
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own books" ON books;
CREATE POLICY "Users can insert own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own books" ON books;
CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own books" ON books;
CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (auth.uid() = user_id);

-- Prefs: users can only CRUD their own prefs
DROP POLICY IF EXISTS "Users can view own prefs" ON user_prefs;
CREATE POLICY "Users can view own prefs" ON user_prefs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own prefs" ON user_prefs;
CREATE POLICY "Users can insert own prefs" ON user_prefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own prefs" ON user_prefs;
CREATE POLICY "Users can update own prefs" ON user_prefs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own prefs" ON user_prefs;
CREATE POLICY "Users can delete own prefs" ON user_prefs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Done! Now go to Authentication → Providers and enable Google.
-- ============================================
