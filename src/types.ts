export type Category = 'Tops' | 'Bottoms' | 'Shoes' | 'Accessories' | 'Model' | 'Media' | 'Stickers' | 'Outfits';

export type ItemSource = 'owned' | 'inspiration';

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  tags: string[];
  createdAt?: string;
  source?: ItemSource;
  isCleaned?: boolean;
  isCleaning?: boolean;
  cleaningFailed?: boolean;
}

export interface CanvasItem extends ClothingItem {
  canvasX: number;
  canvasY: number;
  scale?: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  createdAt: string;
  description?: string;
}

export interface OutfitRecord {
  items: ClothingItem[];
  date: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  imageUrl: string;
  likes: number;
  description: string;
  tags: string[];
  shopItems?: ShopItem[];
}
export interface UserProfile {
  name: string;
  avatar: string;
  handle: string;
  bio: string;
}
