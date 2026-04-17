import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Supabase Setup ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[AWR] Missing Supabase credentials in .env file!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to seed initial data if needed (one-time setup)
const seedInitialData = async () => {
  const { data: existingPosts } = await supabase.from('posts').select('id').limit(1);
  if (!existingPosts || existingPosts.length === 0) {
    console.log("[AWR Server] Seeding cloud restoration data...");
    
    await supabase.from('posts').insert([
      { 
        id: 'restore-001', 
        author_name: 'Alex Chen', 
        author_avatar: 'https://i.pravatar.cc/150?img=11', 
        image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a992?auto=format&fit=crop&w=600&q=80', 
        likes: 42, 
        description: '深綠色高領毛衣搭配米色長褲與皮帶。', 
        tags: '休閒,簡約' 
      },
      { 
        id: 'restore-002', 
        author_name: 'You', 
        author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', 
        image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', 
        likes: 15, 
        description: '藝術風樹木設計', 
        tags: '設計,潮流' 
      }
    ]);
  }
};

seedInitialData();

// === UPLOAD ENDPOINT ===

app.post('/api/upload', async (req, res) => {
  const { image, path: filePath } = req.body;
  
  try {
    // Convert base64 to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const contentType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/png';
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filePath, buffer, {
        contentType,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(filePath);

    res.json({ url: publicUrl });
  } catch (error: any) {
    console.error("[Upload Error]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// === CLOTHING ITEMS ENDPOINTS ===

app.get('/api/items', async (req, res) => {
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const mapped = data.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    imageUrl: item.image_url,
    tags: item.tags ? item.tags.split(',') : [],
    isCleaned: !!item.is_cleaned,
    isCleaning: !!item.is_cleaning,
    cleaningFailed: !!item.cleaning_failed,
    source: item.source
  }));
  res.json(mapped);
});

app.post('/api/items', async (req, res) => {
  const { id, name, category, imageUrl, tags, isCleaned, isCleaning, cleaningFailed, source } = req.body;
  const { error } = await supabase.from('clothing_items').insert({
    id,
    name,
    category,
    image_url: imageUrl,
    tags: tags ? tags.join(',') : '',
    is_cleaned: isCleaned,
    is_cleaning: isCleaning,
    cleaning_failed: cleaningFailed,
    source
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, id });
});

app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  if (updates.tags !== undefined) payload.tags = updates.tags.join(',');
  if (updates.isCleaned !== undefined) payload.is_cleaned = updates.isCleaned;
  if (updates.isCleaning !== undefined) payload.is_cleaning = updates.isCleaning;
  if (updates.cleaningFailed !== undefined) payload.cleaning_failed = updates.cleaningFailed;
  if (updates.source !== undefined) payload.source = updates.source;

  const { error } = await supabase
    .from('clothing_items')
    .update(payload)
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete('/api/items/:id', async (req, res) => {
  const { error } = await supabase
    .from('clothing_items')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// === SAVED POSTS ENDPOINTS ===

app.get('/api/saved-posts', async (req, res) => {
  const { data, error } = await supabase.from('saved_posts').select('post_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(s => s.post_id));
});

app.post('/api/saved-posts/:id', async (req, res) => {
  const { error } = await supabase.from('saved_posts').upsert({ post_id: req.params.id });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete('/api/saved-posts/:id', async (req, res) => {
  const { error } = await supabase.from('saved_posts').delete().eq('post_id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// === POSTS ENDPOINTS ===

app.get('/api/posts', async (req, res) => {
  const { data: posts, error: postError } = await supabase
    .from('posts')
    .select('*, shop_items(*)')
    .order('created_at', { ascending: false });

  if (postError) return res.status(500).json({ error: postError.message });

  const mapped = posts.map(post => ({
    id: post.id,
    author: {
      name: post.author_name,
      avatar: post.author_avatar
    },
    imageUrl: post.image_url,
    likes: post.likes,
    description: post.description,
    tags: post.tags ? post.tags.split(',') : [],
    createdAt: post.created_at,
    shopItems: (post.shop_items || []).map((si: any) => ({
      id: si.id,
      name: si.name,
      price: si.price,
      imageUrl: si.image_url
    }))
  }));
  res.json(mapped);
});

app.post('/api/posts', async (req, res) => {
  const { id, author, imageUrl, likes, description, tags, shopItems } = req.body;
  
  const { error: postError } = await supabase.from('posts').insert({
    id,
    author_name: author.name,
    author_avatar: author.avatar,
    image_url: imageUrl,
    likes: likes || 0,
    description,
    tags: tags ? tags.join(',') : ''
  });

  if (postError) return res.status(500).json({ error: postError.message });

  if (shopItems && shopItems.length > 0) {
    const siPayload = shopItems.map((si: any) => ({
      id: si.id,
      post_id: id,
      name: si.name,
      price: si.price,
      image_url: si.imageUrl
    }));
    await supabase.from('shop_items').insert(siPayload);
  }

  res.json({ success: true });
});

app.delete('/api/posts/:id', async (req, res) => {
  const { error } = await supabase.from('posts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`[AWR Supabase] Server running with cloud persistence on port ${port}`);
});
