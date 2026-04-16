-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clothing Items Table
CREATE TABLE clothing_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_cleaned BOOLEAN DEFAULT false,
  is_cleaning BOOLEAN DEFAULT false,
  cleaning_failed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  source TEXT
);

-- Posts Table
CREATE TABLE posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  image_url TEXT NOT NULL,
  likes INT DEFAULT 0,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Shop Items Table (Linked to Posts)
CREATE TABLE shop_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INT NOT NULL,
  image_url TEXT NOT NULL
);
