
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const db = new Database('server/anywear.db');

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Supabase...');

  // 1. Migrate clothing_items
  const clothingItems = db.prepare('SELECT * FROM clothing_items').all();
  console.log(`📦 Found ${clothingItems.length} clothing items.`);
  
  for (const item of clothingItems) {
    const { error } = await supabase.from('clothing_items').upsert({
      id: item.id,
      name: item.name,
      category: item.category,
      image_url: item.image_url,
      tags: item.tags,
      is_cleaned: !!item.is_cleaned,
      is_cleaning: !!item.is_cleaning,
      cleaning_failed: !!item.cleaning_failed,
      source: item.source,
      created_at: item.created_at
    });
    if (error) console.error(`❌ Error migrating item ${item.id}:`, error.message);
  }

  // 2. Migrate posts
  const posts = db.prepare('SELECT * FROM posts').all();
  console.log(`📝 Found ${posts.length} posts.`);
  
  for (const post of posts) {
    const { error } = await supabase.from('posts').upsert({
      id: post.id,
      author_name: post.author_name,
      author_avatar: post.author_avatar,
      image_url: post.image_url,
      likes: post.likes,
      description: post.description,
      tags: post.tags,
      created_at: post.created_at
    });
    if (error) console.error(`❌ Error migrating post ${post.id}:`, error.message);
  }

  // 3. Migrate saved_posts
  const savedPosts = db.prepare('SELECT * FROM saved_posts').all();
  console.log(`⭐ Found ${savedPosts.length} saved posts.`);
  
  for (const saved of savedPosts) {
    const { error } = await supabase.from('saved_posts').upsert({
      post_id: saved.post_id
    });
    if (error) console.error(`❌ Error migrating saved post ${saved.post_id}:`, error.message);
  }

  // 4. Migrate shop_items
  const shopItems = db.prepare('SELECT * FROM shop_items').all();
  console.log(`🛒 Found ${shopItems.length} shop items.`);
  
  for (const item of shopItems) {
    const { error } = await supabase.from('shop_items').upsert({
      id: item.id,
      post_id: item.post_id,
      name: item.name,
      price: item.price,
      image_url: item.image_url
    });
    if (error) console.error(`❌ Error migrating shop item ${item.id}:`, error.message);
  }

  console.log('✅ Migration completed!');
}

migrate().catch(console.error);
