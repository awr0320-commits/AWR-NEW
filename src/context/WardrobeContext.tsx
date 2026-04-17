import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClothingItem, Category } from '../types';

interface WardrobeContextType {
  items: ClothingItem[];
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<ClothingItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  filteredItems: (category: Category | 'All', sortBy: 'Recently Used' | 'Date Added' | 'Color Sync') => ClothingItem[];
  isLoading: boolean;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch(err => console.error("Error fetching items:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const addItem = async (item: ClothingItem) => {
    try {
      // 1. Upload to Supabase Storage first if it's a new upload (data URL)
      let finalImageUrl = item.imageUrl;
      if (item.imageUrl.startsWith('data:')) {
        const fileExt = item.imageUrl.match(/\/(\w+);base64/)?.[1] || 'png';
        const fileName = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `wardrobe/${fileName}`;
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: item.imageUrl, path: filePath }),
        });
        
        if (!uploadRes.ok) throw new Error('Cloud upload failed');
        const { url } = await uploadRes.json();
        finalImageUrl = url;
      }
      
      // 2. Save metadata with cloud URL
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, imageUrl: finalImageUrl }),
      });
      
      if (!res.ok) throw new Error('Failed to save item metadata');
      const savedItem = await res.json();
      setItems(prev => [{ ...item, imageUrl: finalImageUrl, id: savedItem.id }, ...prev]);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const updateItem = async (id: string, updates: Partial<ClothingItem>) => {
    try {
      // Optimistic update
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update item');
        // Ideally we would revert the optimistic update here on fail
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      // Optimistic update
      setItems((prev) => prev.filter((item) => item.id !== id));
      
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const filteredItems = (category: Category | 'All', sortBy: 'Recently Used' | 'Date Added' | 'Color Sync') => {
    let filtered = category === 'All' ? items.filter(i => i.category !== 'Model' && i.category !== 'Media') : items.filter((item) => item.category === category);
    
    switch (sortBy) {
      case 'Date Added':
        return [...filtered].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      case 'Recently Used':
        return filtered; // Placeholder
      case 'Color Sync':
        return filtered; // Placeholder
      default:
        return filtered;
    }
  };

  return (
    <WardrobeContext.Provider value={{ items, addItem, updateItem, removeItem, filteredItems, isLoading }}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
