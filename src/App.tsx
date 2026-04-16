import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle,
  BarChart2,
  Book,
  Bookmark,
  Bot,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid,
  Heart,
  Home,
  Layers,
  Layout,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  PlusSquare,
  Quote,
  RefreshCw,
  Search,
  Send,
  Share,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  User,
  Wrench,
  X
} from 'lucide-react';
import { ClothingItem, CanvasItem, Category, Post, Outfit, ShopItem, UserProfile, OutfitRecord } from './types';
import { MOCK_ITEMS, MOCK_POSTS, STICKER_ITEMS } from './constants';
import { analyzeStyle, getOutfitSuggestions, generateProductImage, testConnection, setForcePlatformKey, chatWithAi, getWeeklyFashionReport, classifyFashionItem } from './services/gemini';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { useWardrobe } from './context/WardrobeContext';
import { useLanguage } from './context/LanguageContext';
import { useFeatureGuide } from './context/FeatureGuideContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import FeatureGuide from './components/FeatureGuide';
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import Mannequin3D from './components/Mannequin3D';
import FBXMannequin from './components/FBXMannequin';
import { ErrorBoundary } from './components/ErrorBoundary';

// --- Components ---

const NavButton = ({ active, icon, label, onClick, id }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, id: string }) => {
  const { triggerGuide } = useFeatureGuide();
  
  const handleClick = () => {
    onClick();
    triggerGuide(id);
  };

  return (
    <button 
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-black dark:text-white scale-110" : "text-black/20 dark:text-white/20"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
};

const BottomNav = ({ activeTab, setActiveTab, onResetMain }: { activeTab: string, setActiveTab: (t: string) => void, onResetMain: () => void }) => {
  const { t } = useLanguage();
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#121212] border-t border-black/5 dark:border-white/5 px-12 pt-3 pb-2 flex justify-between items-center z-[500] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] h-20">
      <NavButton 
        id="main"
        active={activeTab === 'main' || activeTab === 'scrapbook'}
        icon={<Home size={24} strokeWidth={activeTab === 'main' ? 2.5 : 2} />}
        label={t('nav_main')}
        onClick={() => {
          if (activeTab === 'main') {
            onResetMain();
          } else {
            setActiveTab('main');
          }
        }}
      />
      <NavButton 
        id="workshop"
        active={activeTab === 'workshop'}
        icon={<PlusSquare size={24} strokeWidth={activeTab === 'workshop' ? 2.5 : 2} />}
        label={t('nav_create')}
        onClick={() => setActiveTab('workshop')}
      />
      <NavButton 
        id="wardrobe"
        active={activeTab === 'wardrobe'}
        icon={<Layout size={24} strokeWidth={activeTab === 'wardrobe' ? 2.5 : 2} />}
        label={t('nav_closet')}
        onClick={() => setActiveTab('wardrobe')}
      />
      <NavButton 
        id="profile"
        active={activeTab === 'profile'}
        icon={<User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />}
        label={t('nav_me')}
        onClick={() => setActiveTab('profile')}
      />
    </nav>
  );
};

const ClothingImage = ({ src, alt, className, referrerPolicy = "no-referrer" }: { src: string, alt: string, className?: string, referrerPolicy?: React.HTMLAttributeReferrerPolicy }) => {
  const [error, setError] = useState(false);
  const fallbackUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80";

  if (error) {
    return <img src={fallbackUrl} alt={alt} className={className} referrerPolicy={referrerPolicy} />;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      referrerPolicy={referrerPolicy} 
      onError={() => setError(true)}
    />
  );
};

const ImageCropModal = ({ image, onClose, onConfirm }: { image: string, onClose: () => void, onConfirm: (url: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 }); 
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [image]);

  const handleSave = () => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sourceX = (crop.x / 100) * img.width;
    const sourceY = (crop.y / 100) * img.height;
    const sourceWidth = (crop.width / 100) * img.width;
    const sourceHeight = (crop.height / 100) * img.height;

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
    onConfirm(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <h3 className="text-xl font-black">裁切圖片</h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-black/40"><X size={24} /></button>
        </div>
        
        <div className="flex-1 p-8 flex items-center justify-center bg-stone-100 min-h-[300px] relative overflow-hidden">
          {imageLoaded ? (
            <div className="relative inline-block shadow-xl">
              <img src={image} alt="Crop" className="max-h-[40vh] block" />
              <div 
                className="absolute border-2 border-indigo-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
                style={{
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`
                }}
              />
            </div>
          ) : (
            <div className="animate-spin text-black/20"><RefreshCw size={40} /></div>
          )}
        </div>

        <div className="p-6 bg-stone-50 space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">左偏</label>
              <input type="range" value={crop.x} onChange={e => setCrop(c => ({...c, x: Math.min(parseInt(e.target.value), 100 - c.width)}))} className="w-full accent-indigo-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">頂偏</label>
              <input type="range" value={crop.y} onChange={e => setCrop(c => ({...c, y: Math.min(parseInt(e.target.value), 100 - c.height)}))} className="w-full accent-indigo-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">寬度</label>
              <input type="range" value={crop.width} onChange={e => setCrop(c => ({...c, width: Math.min(parseInt(e.target.value), 100 - c.x)}))} className="w-full accent-indigo-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">高度</label>
              <input type="range" value={crop.height} onChange={e => setCrop(c => ({...c, height: Math.min(parseInt(e.target.value), 100 - c.y)}))} className="w-full accent-indigo-600" />
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-xl"
          >
            儲存裁切變更
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const PostCard = ({ 
  post, 
  onEnterScrapbook, 
  onSaveInspiration,
  onShopClick 
}: { 
  post: Post, 
  onEnterScrapbook: (post: Post) => void, 
  onSaveInspiration: (post: Post) => void,
  onShopClick: (post: Post) => void 
}) => {
  const { t } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const translateTag = (tag: string) => {
    const key = `tag_${tag.toLowerCase()}`;
    const translated = t(key);
    return translated === key ? tag : translated;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSaved) {
      onSaveInspiration(post);
    }
    setIsSaved(!isSaved);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex flex-col"
    >
      <div 
        onClick={() => onEnterScrapbook(post)}
        className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-lg cursor-pointer group mb-3"
      >
        <ClothingImage src={post.imageUrl} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <button 
            onClick={(e) => { e.stopPropagation(); onShopClick(post); }}
            className="p-2 bg-white/90 text-black rounded-full shadow-md transition-all active:scale-90"
          >
            <ShoppingBag size={16} />
          </button>
          <button 
            onClick={handleLike}
            className={cn(
              "p-2 rounded-full shadow-md transition-all active:scale-90",
              isLiked ? "bg-red-500 text-white" : "bg-white/90 text-black"
            )}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleSave}
            className={cn(
              "p-2 rounded-full shadow-md transition-all active:scale-90",
              isSaved ? "bg-indigo-600 text-white" : "bg-white/90 text-black"
            )}
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[8px] font-bold flex items-center gap-1">
          <Layout size={10} />
          <span>2 {t('profile_posts')}</span>
        </div>
      </div>
      <div className="px-1">
        <div className="flex items-center gap-2 mb-2">
          <img src={post.author?.avatar || '/default_avatar.png'} alt={post.author?.name || 'User'} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
          <span className="font-bold text-[10px] tracking-tight text-black/60">{post.author?.name || 'User'}</span>
        </div>
        <h3 className="text-xs font-bold mb-1 line-clamp-1">{post.description || ''}</h3>
        <div className="flex flex-wrap gap-1">
          {(post.tags ?? []).map(tag => (
            <span key={tag} className="text-[8px] px-2 py-0.5 bg-black/5 rounded-full font-bold text-black/40">#{translateTag(tag)}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const MainView = ({ posts, onEnterScrapbook, onShopClick, onUploadPost, resetTrigger, onSaveInspiration, buyingList, onOpenBuyingList }: { 
  posts: Post[], 
  onEnterScrapbook: (post: Post) => void, 
  onShopClick: (post: Post) => void,
  onUploadPost: (post: Omit<Post, 'id' | 'author' | 'likes'>) => void, 
  resetTrigger: number,
  onSaveInspiration: (post: Post) => void,
  buyingList: ShopItem[],
  onOpenBuyingList: () => void
}) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>(['Casual', 'Western', 'Bombing']);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const translateTag = (tag: string) => {
    const key = `tag_${tag.toLowerCase()}`;
    const translated = t(key);
    return translated === key ? tag : translated;
  };

  const handleAddTag = () => {
    if (newTagName.trim() && !customTags.includes(newTagName.trim())) {
      setCustomTags([...customTags, newTagName.trim()]);
      setNewTagName('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(t => t !== tagToRemove));
    if (activeFilter === tagToRemove) setActiveFilter(null);
  };

  useEffect(() => {
    if (resetTrigger > 0) {
      setActiveFilter(null);
      setSearchQuery('');
    }
  }, [resetTrigger]);

  const filteredPosts = posts.filter(post => {
    const matchesFilter = activeFilter ? post.tags.includes(filterMap[activeFilter] || activeFilter) : true;
    const matchesSearch = searchQuery 
      ? post.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pb-40 pt-8 px-6 overflow-y-auto h-screen no-scrollbar relative">
      <header className="mb-4 text-center">
        <button 
          onClick={() => { setActiveFilter(null); setSearchQuery(''); }}
          className="inline-block active:scale-95 transition-transform"
        >
          <h1 className="text-4xl font-serif tracking-tight">AWR</h1>
        </button>
      </header>

      <div className="flex gap-3 mb-6 items-center">
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="p-3 bg-stone-100 rounded-full border border-black/10 shadow-sm active:scale-90 transition-transform flex items-center justify-center shrink-0"
          title="Upload Post"
        >
          <Camera size={20} className="text-black/60" />
        </button>
        <button 
          onClick={onOpenBuyingList}
          className="p-3 bg-stone-100 rounded-full border border-black/10 shadow-sm active:scale-90 transition-transform flex items-center justify-center shrink-0 relative"
          title="Buying List"
        >
          <ShoppingCart size={20} className="text-black/60" />
          {buyingList.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {buyingList.length}
            </span>
          )}
        </button>
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder={t('main_search')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-black/10 rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-black/20 placeholder:text-black/20 text-left"
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-black/40" size={18} />
        </div>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-8 no-scrollbar -mx-6 px-6 items-center">
        {(customTags ?? []).map(filter => (
          <div key={filter} className="relative group shrink-0">
            <button 
              onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95",
                activeFilter === filter 
                  ? "bg-emerald-100 text-emerald-900 shadow-emerald-100" 
                  : "bg-stone-100 text-black hover:bg-stone-200"
              )}
            >
              {translateTag(filter)}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleRemoveTag(filter); }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X size={8} />
            </button>
          </div>
        ))}
        
        {isAddingTag ? (
          <div className="flex items-center gap-2 shrink-0">
            <input 
              autoFocus
              type="text" 
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Tag name"
              className="px-4 py-2 bg-stone-100 border border-black/10 rounded-full text-xs focus:outline-none w-24"
            />
            <button onClick={handleAddTag} className="p-2 bg-black text-white rounded-full">
              <CheckCircle2 size={12} />
            </button>
            <button onClick={() => setIsAddingTag(false)} className="p-2 bg-stone-200 rounded-full">
              <X size={12} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingTag(true)}
            className="p-2 bg-stone-100 rounded-full border border-black/5 text-black/40 hover:bg-stone-200 transition-colors shrink-0"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
        {(filteredPosts ?? []).map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onEnterScrapbook={onEnterScrapbook} 
            onSaveInspiration={onSaveInspiration} 
            onShopClick={onShopClick}
          />
        ))}
      </div>

      <PostUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={onUploadPost} 
      />
    </div>
  );
};

const PostUploadModal = ({ isOpen, onClose, onUpload }: { isOpen: boolean, onClose: () => void, onUpload: (post: any) => void }) => {
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Limit to 5 total images
    const remainingSlots = 5 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target?.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
    
    // Clear input so same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateCollage = async (imgSources: string[]): Promise<string> => {
    if (imgSources.length === 1) return imgSources[0];

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imgSources[0]);

      canvas.width = 1200;
      canvas.height = 1200;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      imgSources.forEach((src, idx) => {
        const img = new Image();
        img.onload = () => {
          loadedImages[idx] = img;
          loadedCount++;
          if (loadedCount === imgSources.length) {
            drawLayout();
          }
        };
        img.src = src;
      });

      const drawLayout = () => {
        const gap = 8;
        const w = canvas.width;
        const h = canvas.height;

        const drawImg = (img: HTMLImageElement, x: number, y: number, tw: number, th: number) => {
          const aspect = img.width / img.height;
          const targetAspect = tw / th;
          let sx, sy, sw, sh;

          if (aspect > targetAspect) {
            sh = img.height;
            sw = img.height * targetAspect;
            sx = (img.width - sw) / 2;
            sy = 0;
          } else {
            sw = img.width;
            sh = img.width / targetAspect;
            sx = 0;
            sy = (img.height - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, x, y, tw, th);
        };

        const n = imgSources.length;
        if (n === 2) {
          drawImg(loadedImages[0], 0, 0, w / 2 - gap / 2, h);
          drawImg(loadedImages[1], w / 2 + gap / 2, 0, w / 2 - gap / 2, h);
        } else if (n === 3) {
          drawImg(loadedImages[0], 0, 0, w / 2 - gap / 2, h);
          drawImg(loadedImages[1], w / 2 + gap / 2, 0, w / 2 - gap / 2, h / 2 - gap / 2);
          drawImg(loadedImages[2], w / 2 + gap / 2, h / 2 + gap / 2, w / 2 - gap / 2, h / 2 - gap / 2);
        } else if (n === 4) {
          drawImg(loadedImages[0], 0, 0, w / 2 - gap / 2, h / 2 - gap / 2);
          drawImg(loadedImages[1], w / 2 + gap / 2, 0, w / 2 - gap / 2, h / 2 - gap / 2);
          drawImg(loadedImages[2], 0, h / 2 + gap / 2, w / 2 - gap / 2, h / 2 - gap / 2);
          drawImg(loadedImages[3], w / 2 + gap / 2, h / 2 + gap / 2, w / 2 - gap / 2, h / 2 - gap / 2);
        } else if (n === 5) {
          drawImg(loadedImages[0], 0, 0, w / 2 - gap / 2, h / 2 - gap / 2);
          drawImg(loadedImages[1], w / 2 + gap / 2, 0, w / 2 - gap / 2, h / 2 - gap / 2);
          drawImg(loadedImages[2], 0, h / 2 + gap / 2, w / 3 - gap / 2, h / 2 - gap / 2);
          drawImg(loadedImages[3], w / 3 + gap / 2, h / 2 + gap / 2, w / 3 - gap, h / 2 - gap / 2);
          drawImg(loadedImages[4], (w / 3) * 2 + gap / 2, h / 2 + gap / 2, w / 3 - gap / 2, h / 2 - gap / 2);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    });
  };

  const handleSubmit = async () => {
    if (images.length === 0 || !description) {
      alert(t('alert_provide_details'));
      return;
    }
    
    setIsGenerating(true);
    try {
      const finalImage = await generateCollage(images);
      onUpload({
        imageUrl: finalImage,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(t => t !== '')
      });
      setDescription('');
      setTags('');
      setImages([]);
      onClose();
    } catch (err) {
      console.error("Collage generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black tracking-tight mb-6 text-center">{t('main_upload_title')}</h3>
            
            <div className="space-y-6">
              {/* Image Grid Preview */}
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group border border-black/5 bg-stone-50">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                    >
                      <X size={12} />
                    </button>
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 px-2 py-0.5 bg-indigo-500 text-[8px] font-black text-white rounded-full uppercase tracking-tighter">Cover</div>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-stone-50 rounded-2xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center hover:bg-stone-100 transition-all group"
                  >
                    <Plus size={24} className="text-black/20 group-hover:text-black/40 transition-colors" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-black/30 mt-1">{images.length}/5</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
              </div>

              {images.length === 0 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-all"
                >
                  <Camera size={32} className="text-black/20 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{t('main_upload_photo')}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2 block">{t('main_upload_desc_label')}</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('main_upload_desc_placeholder')}
                  className="w-full bg-stone-50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2 block">{t('main_upload_tags_label')}</label>
                <input 
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={t('main_upload_tags_placeholder')}
                  className="w-full bg-stone-50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-black/10"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-black/5 text-black/40 rounded-[24px] font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                >
                  {t('main_upload_cancel')}
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isGenerating}
                  className={cn(
                    "flex-1 py-4 bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/20 active:scale-95 transition-transform flex items-center justify-center gap-2",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isGenerating && <RefreshCw size={14} className="animate-spin" />}
                  {isGenerating ? "Generating..." : t('main_upload_submit')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const filterMap: Record<string, string> = {
  'Western': 'West'
};

const classifyShopItem = (name: string): Category => {
  const n = name.toLowerCase();
  if (n.includes('褲') || n.includes('裙')) return 'Bottoms';
  if (n.includes('衣') || n.includes('袖') || n.includes('t-shirt')) return 'Tops';
  if (n.includes('鞋')) return 'Shoes';
  if (n.includes('項鍊') || n.includes('漁夫帽') || n.includes('領帶') || n.includes('眼鏡')) return 'Accessories';
  return 'Accessories'; // Default for everything else
};

const ScrapbookView = ({ posts, initialIndex = 0, initialMode = 'view', onExit, onSaveInspiration, onAddToBuyingList, onAddToCloset }: { 
  posts: Post[], 
  initialIndex?: number,
  initialMode?: 'view' | 'shop',
  onExit: () => void, 
  onSaveInspiration: (post: Post) => void,
  onAddToBuyingList: (item: ShopItem) => void,
  onAddToCloset: (item: ShopItem) => void
}) => {
  const { t } = useLanguage();
  const [isShoppingMode, setIsShoppingMode] = useState(initialMode === 'shop');
  const [activePostIndex, setActivePostIndex] = useState(initialIndex);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && initialIndex > 0) {
      const height = scrollRef.current.clientHeight;
      scrollRef.current.scrollTop = height * initialIndex;
    }
  }, [initialIndex]);

  const translateTag = (tag: string) => {
    const key = `tag_${tag.toLowerCase()}`;
    const translated = t(key);
    return translated === key ? tag : translated;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPos = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const index = Math.round(scrollPos / height);
    if (index !== activePostIndex) {
      setActivePostIndex(index);
    }
  };

  const currentPost = posts[activePostIndex];

  return (
    <div className="absolute inset-0 bg-black z-[200]">
      {/* Fixed Header */}
      <div className="absolute top-8 left-8 right-8 z-[210] flex justify-between items-center pointer-events-none">
        <button 
          onClick={onExit}
          className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white active:scale-90 transition-transform pointer-events-auto"
        >
          <ChevronRight size={24} className="rotate-180" />
        </button>

        <button 
          onClick={() => setIsShoppingMode(!isShoppingMode)}
          className={cn(
            "p-3 rounded-full transition-all active:scale-90 pointer-events-auto",
            isShoppingMode ? "bg-white text-black" : "bg-white/10 backdrop-blur-xl text-white"
          )}
        >
          <ShoppingBag size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {(posts ?? []).map((post, index) => (
          <div key={post.id} className="h-full w-full snap-start relative flex flex-col pt-24 pb-8 items-center justify-center bg-black">
            <AnimatePresence mode="wait">
              {!isShoppingMode ? (
                <motion.div 
                  key="normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-4 top-24 bottom-24 rounded-3xl overflow-hidden"
                >
                  <ClothingImage src={post.imageUrl} alt="Outfit" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

                  {/* Buttons at top-right of photo */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 text-white">
                    <SmallLikeButton />
                    <button 
                      onClick={() => onSaveInspiration(post)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 group-active:scale-90 transition-transform"><PlusSquare size={22} /></div>
                      <span className="text-[8px] font-black tracking-widest uppercase">{t('scrapbook_save')}</span>
                    </button>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-16 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={post.author?.avatar || '/default_avatar.png'} alt={post.author?.name || 'User'} className="w-10 h-10 rounded-full border-2 border-white shadow-xl" referrerPolicy="no-referrer" />
                      <span className="font-black text-base tracking-tight">{post.author?.name || 'User'}</span>
                    </div>
                    <p className="text-sm mb-3 leading-relaxed font-medium opacity-90">{post.description || ''}</p>
                    <div className="flex gap-2 flex-wrap">
                      {(post.tags ?? []).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">#{translateTag(tag)}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="shopping"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-0 bg-stone-50 flex flex-col"
                >
                  {/* Shrunk Photo at Top - No border, person complete */}
                  <div className="w-full h-[45vh] relative shrink-0">
                    <ClothingImage 
                      src={post.imageUrl} 
                      alt="Outfit" 
                      className="w-full h-full object-cover object-center" 
                    />
                    {/* Subtle overlay to make top buttons visible if needed, though they have backdrop-blur */}
                    <div className="absolute inset-0 bg-black/10" />
                  </div>

                  {/* Items List at Bottom */}
                  <div className="flex-1 bg-white rounded-t-[48px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] p-8 overflow-y-auto no-scrollbar -mt-12 relative z-10">
                      <h3 className="text-2xl font-black tracking-tighter">{t('shop_look_title')}</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/20">{post.shopItems?.length || 0} {t('shop_look_items')}</span>

                    <div className="space-y-4">
                      {post.shopItems?.map((item) => (
                        <div key={item.id} className="relative">
                          <a 
                            href="https://www.gu-global.com/tw/zh_TW/c/women_tshirtsweat.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block active:scale-[0.98] transition-transform"
                          >
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-4 p-4 bg-stone-50 rounded-3xl border border-black/5 group hover:bg-stone-100 transition-colors"
                            >
                              <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shadow-sm shrink-0">
                                <ClothingImage src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-black/80 mb-1">{item.name}</h4>
                                <p className="text-lg font-black tracking-tight">NT$ {item.price.toLocaleString()}</p>
                              </div>
                              <div className="w-11 h-11 shrink-0" /> {/* Spacer for button */}
                            </motion.div>
                          </a>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 z-20">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToCloset(item);
                              }}
                              className="p-3 bg-white text-indigo-600 border border-black/5 rounded-2xl shadow-lg shadow-indigo-600/5 hover:bg-indigo-50 active:scale-90 transition-all"
                            >
                              <Heart size={20} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToBuyingList(item);
                              }}
                              className="p-3 bg-black text-white rounded-2xl shadow-lg shadow-black/10 hover:bg-indigo-600 active:scale-90 transition-all"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {!post.shopItems && (
                        <div className="text-center py-12">
                          <ShoppingBag size={48} className="mx-auto text-black/5 mb-4" />
                          <p className="text-black/30 font-bold text-sm">{t('shop_no_items')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

const LikeButton = () => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <button 
      onClick={() => {
        setIsLiked(!isLiked);
      }}
      className="flex flex-col items-center gap-2 group"
    >
      <div className={cn(
        "p-4 backdrop-blur-xl rounded-full border border-white/10 transition-all",
        isLiked ? "bg-red-500 text-white border-red-400" : "bg-white/10 text-white"
      )}>
        <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
      </div>
      <span className="text-[10px] font-black tracking-widest uppercase">{isLiked ? 'Saved' : 'Save'}</span>
    </button>
  );
};

const SmallLikeButton = () => {
  const [isLiked, setIsLiked] = useState(false);
  return (
    <button
      onClick={() => setIsLiked(!isLiked)}
      className="flex flex-col items-center gap-1 group"
    >
      <div className={cn(
        "p-3 backdrop-blur-xl rounded-full border border-white/10 transition-all active:scale-90",
        isLiked ? "bg-red-500 text-white border-red-400" : "bg-white/10 text-white"
      )}>
        <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
      </div>
      <span className="text-[8px] font-black tracking-widest uppercase">{isLiked ? 'Liked' : 'Like'}</span>
    </button>
  );
};

const WardrobeView = ({ items, onAddItem, onUpdateItem, onRemoveItem, isRateLimited }: { items: ClothingItem[], onAddItem: (item: ClothingItem) => void, onUpdateItem: (id: string, updates: Partial<ClothingItem>) => void, onRemoveItem: (id: string) => void, isRateLimited: boolean }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const validCategories: Category[] = ['Tops', 'Bottoms', 'Shoes', 'Accessories'];

  const filteredItems = (activeCategory === 'All' 
    ? items.filter(i => validCategories.includes(i.category))
    : items.filter(i => i.category === activeCategory));

  const categoryLabels: Record<string, string> = {
    'All': t('closet_all'),
    'Tops': t('closet_tops'),
    'Bottoms': t('closet_bottoms'),
    'Shoes': t('closet_shoes'),
    'Accessories': t('closet_accessories')
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const category: Category = activeCategory !== 'All' ? activeCategory : 'Tops';

      const newItem: ClothingItem = {
        id: Math.random().toString(),
        name: file.name.split('.')[0],
        category: category,
        imageUrl: base64,
        tags: ['uploaded'],
        isCleaned: false,
        source: 'owned'
      };
      
      onAddItem(newItem);
      if (activeCategory === 'All') {
        setActiveCategory('Tops'); // Switch to Tops so the user sees where it went
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-40 pt-8 px-0 overflow-y-auto h-screen no-scrollbar bg-white">
      <header className="flex justify-between items-start mb-6 px-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">{t('closet_title')}</h1>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="image/*"
        />
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-black text-white rounded-[24px] shadow-2xl transition-all shadow-black/20 active:scale-95 flex items-center justify-center"
            title="上傳照片"
          >
            <Camera size={24} />
          </button>
        </div>
      </header>

      {/* Horizontally Scrollable Category Bar */}
      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar px-6 scroll-smooth touch-pan-x">
        {['All', ...validCategories].map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat as any)}
            className={cn(
              "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0",
              activeCategory === cat ? "bg-black text-white shadow-xl scale-105" : "bg-black/5 text-black/40 hover:bg-black/10"
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 px-6">
        {filteredItems.map(item => (
          <motion.div 
            layout
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[3/4] bg-transparent rounded-[24px] overflow-hidden relative group shadow-sm border border-black/5"
          >
            <ClothingImage 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110 drop-shadow-md" 
            />

            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {item.source && (
              <div className={cn(
                "absolute bottom-4 left-4 px-2 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/20 shadow-sm z-10",
                item.source === 'owned' ? "bg-emerald-500/80 text-white" : "bg-amber-500/80 text-white"
              )}>
                {item.source === 'owned' ? <User size={10} /> : <Bookmark size={10} />}
                <span className="text-[8px] font-black uppercase tracking-widest">
                  {item.source === 'owned' ? t('source_owned') : t('source_inspiration')}
                </span>
              </div>
            )}

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setDeletingId(item.id);
              }}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0 shadow-sm border border-black/5 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/60 truncate">{item.name}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"
            onClick={() => setDeletingId(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] p-10 w-full max-w-xs shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2">{t('delete_confirm_title')}</h3>
              <p className="text-black/40 text-sm mb-8 leading-relaxed">{t('delete_confirm_desc')}</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (deletingId) {
                      onRemoveItem(deletingId);
                      setDeletingId(null);
                    }
                  }}
                  className="w-full py-4 bg-red-500 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 transition-transform"
                >
                  {t('delete_confirm_btn')}
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="w-full py-4 bg-black/5 text-black/40 rounded-[24px] font-black uppercase tracking-widest text-xs active:scale-95 transition-transform"
                >
                  {t('delete_cancel_btn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkshopView = ({ items, onSaveCreation, onPublish, onRemoveItem, isRateLimited, onAiError, onShowHealthReminder }: { items: ClothingItem[], onSaveCreation: (items: ClothingItem[]) => void, onPublish: (items: ClothingItem[]) => void, onRemoveItem: (id: string) => void, isRateLimited: boolean, onAiError: (err: any) => void, onShowHealthReminder: () => void }) => {
  const { t } = useLanguage();
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<ClothingItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [closetState, setClosetState] = useState<'closed' | 'default' | 'expanded'>('default');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAnalyzingOutfit, setIsAnalyzingOutfit] = useState(false);

  // Helper to safely format canvas items for AI prompt and chat history
  const formatOutfitForAi = (canvasItems: CanvasItem[]) => {
    if (!canvasItems || canvasItems.length === 0) return "純淨畫布 (尚未選擇單品)";
    return canvasItems
      .map(i => `• ${i.name || '未命名單品'} (${i.category || '未分類'})`)
      .join("\n");
  };

  const handleAnalyzeOutfit = async () => {
    const safeCanvasItems = canvasItems ?? [];
    if (safeCanvasItems.length === 0) return;
    
    // 1. Show loading immediately
    setIsAnalyzingOutfit(true);
    setIsShareModalOpen(false);

    // AI Mock Response Helper
    const getMockStyleAdvice = () => {
      const advices = [
        "這套搭配展現了極佳的層次感！深色的下身平衡了整體視覺重心，建議可以加入一只銀色腕錶來提升細節精緻度。",
        "非常大膽且有個性的組合。上衣的剪裁完美符合當前的流行趨勢，建議搭配一雙簡潔的帆布鞋，讓整個人看起來更加清爽俐落。",
        "這是一個經典且不出錯的風格。如果想要增加亮點，可以嘗試加入飽和度較高的配件（如領巾或帽子），能瞬間點亮整體造型。",
        "選用的色系非常有質感，展現了低調的奢華感。建議將上衣紮入褲頭，能更有效地修飾身材比例，展現大氣場。"
      ];
      return advices[Math.floor(Math.random() * advices.length)];
    };

    try {
      const outfitDescription = formatOutfitForAi(safeCanvasItems);
      const userPrompt = `這是我剛搭配的穿搭單品：\n${outfitDescription}\n\n請給予我專業的風格建議與評分！`;
      
      // Prep prompt for API
      const prompt = `
        分析以下穿搭單品組合：
        ${outfitDescription}
        
        任務：
        1. 風格定位分析。
        2. 1-5 顆星評分。
        3. 具體的改良建議。
        請使用繁體中文回應。
      `;

      // Race against a 10-second timeout
      const response = await Promise.race([
        chatWithAi([{ role: 'user', text: prompt }]),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 10000))
      ]);

      const finalAdvice = response || `【AI 模擬模式】\n\n${getMockStyleAdvice()}\n\n*(提示：目前連線較忙碌，已自動切換至本地建議)*`;
      
      // Update messages FIRST while loading is still visible
      setChatMessages(prev => [
        ...prev, 
        { role: 'user', text: userPrompt },
        { role: 'model', text: finalAdvice }
      ]);
      
      // 2. Sequential state transition to prevent WSOD
      await new Promise(resolve => setTimeout(resolve, 150)); 
      setIsAnalyzingOutfit(false);
      setIsChatOpen(true);
      
    } catch (err: any) {
      console.warn("[AWR] AI Analysis failed or timed out, falling back to mock advice.", err);
      const outfitDescription = formatOutfitForAi(safeCanvasItems);
      const fallbackAdvice = `【AI 模擬模式】\n\n${getMockStyleAdvice()}\n\n*(提示：連線超時，已轉由本地智慧助理為您服務)*`;
      
      setChatMessages(prev => [
        ...prev, 
        { role: 'user', text: `這是我搭配的單品：\n${outfitDescription}` },
        { role: 'model', text: fallbackAdvice }
      ]);

      await new Promise(resolve => setTimeout(resolve, 150));
      setIsAnalyzingOutfit(false);
      setIsChatOpen(true);
    }
  };
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemToCrop, setItemToCrop] = useState<CanvasItem | null>(null);
  const [mannequinType, setMannequinType] = useState<'procedural' | 'custom'>('procedural');
  const [mannequinParams, setMannequinParams] = useState({
    gender: 'male' as 'male' | 'female',
    height: 163 / 175,
    chest: 1.0,
    waist: 1.0,
    hips: 1.0,
    weight: 1.0
  });
  const [isMannequinControlsOpen, setIsMannequinControlsOpen] = useState(false);
  const [modelMode, setModelMode] = useState<'3D' | '2D'>('2D');
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: t('chat_initial') }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const workshopUploadRef = useRef<HTMLInputElement>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'user' as const, text: userMsg }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const response = await chatWithAi(newMessages);
      if (response) {
        setChatMessages(prev => [...prev, { role: 'model', text: response }]);
      }
    } catch (err) {
      onAiError(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Pan & Zoom State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Persistence: Load last design
  useEffect(() => {
    const savedDesign = localStorage.getItem('anywear_last_design');
    const savedModel = localStorage.getItem('anywear_last_model');
    if (savedDesign) setCanvasItems(JSON.parse(savedDesign));
    if (savedModel) setSelectedModel(JSON.parse(savedModel));
  }, []);

  // Persistence: Save current design
  useEffect(() => {
    try {
      localStorage.setItem('anywear_last_design', JSON.stringify(canvasItems));
      localStorage.setItem('anywear_last_model', JSON.stringify(selectedModel));
    } catch (e) {
      console.warn("[AWR] Failed to save design to localStorage (likely quota exceeded):", e);
    }
  }, [canvasItems, selectedModel]);

  const getContainerWidth = () => {
    if (typeof window === 'undefined') return 400;
    const isDesktop = window.innerWidth >= 640;
    // max-w-md is 448px
    return isDesktop ? Math.min(window.innerWidth, 448) : window.innerWidth;
  };
  
  const getContainerHeight = () => {
    if (typeof window === 'undefined') return 800;
    const isDesktop = window.innerWidth >= 640;
    return isDesktop ? Math.min(window.innerHeight, 850) : window.innerHeight;
  };

  const addToCanvas = (item: ClothingItem) => {
    if (!item) {
      console.warn("[AWR] Attempted to add undefined item to canvas");
      return;
    }
    
    try {
      if (item.category === 'Model' || item.category === 'Media') {
        setSelectedModel(item);
        return;
      }

      // Replacement logic: DISABLED for collage/overlapping mode
      // Users want to be able to layer multiple items together.
      let currentItems = [...canvasItems];
      
      // Specifically prevent exact duplicates by item ID
      if (canvasItems.find(i => i.id === item.id)) {
        return; 
      }

      // Centering and snapped positioning based on category
      const centerX = getContainerWidth() / 2;
      const centerY = getContainerHeight() / 2;
      
      // Defensive check for tags
      const isSticker = item.tags && Array.isArray(item.tags) ? item.tags.includes('sticker') : false;
      const itemHalfSize = isSticker ? 28 : 64; // w-14 (56px) vs w-32 (128px)

      let yOffset = 0;
      switch(item.category) {
        case 'Accessories': yOffset = -220; break;
        case 'Tops': yOffset = -100; break;

        case 'Bottoms': yOffset = 150; break;
        case 'Shoes': yOffset = 350; break;
        default: yOffset = 0;
      }

      const newItem: CanvasItem = { 
        ...item, 
        canvasX: (centerX - transform.x - itemHalfSize) / transform.scale + (Math.random() * 20 - 10),
        canvasY: (centerY - transform.y + yOffset - itemHalfSize) / transform.scale + (Math.random() * 20 - 10),
        scale: 1
      };
      setCanvasItems([...currentItems, newItem]);
      setSelectedItemId(newItem.id);
    } catch (error) {
      console.error("[AWR] Error adding item to canvas:", error);
      onAiError(error);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: ClothingItem) => {
    e.dataTransfer.setData('clothingItem', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const itemData = e.dataTransfer.getData('clothingItem');
      if (itemData) {
        const item = JSON.parse(itemData);
        addToCanvas(item);
      }
    } catch (error) {
      console.error("[AWR] Error handling drop:", error);
    }
  };

  const handleWorkshopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Count existing uploaded items
    const existingUploads = canvasItems.filter(i => i.id.startsWith('workshop-upload-')).length;
    const remainingSlots = 5 - existingUploads;
    
    if (remainingSlots <= 0) {
      alert("You have reached the limit of 5 uploaded photos for this session.");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newItem: ClothingItem = {
          id: `workshop-upload-${Math.random().toString(36).substr(2, 9)}`,
          name: `Upload ${existingUploads + index + 1}`,
          category: 'Accessories', // Using Accessories so it doesn't replace clothes
          imageUrl,
          tags: ['sticker', 'workshop-upload'],
          source: 'owned'
        };
        addToCanvas(newItem);
      };
      reader.readAsDataURL(file);
    });

    if (workshopUploadRef.current) workshopUploadRef.current.value = '';
  };

  const removeFromCanvas = (id: string) => {
    setCanvasItems(canvasItems.filter(i => i.id !== id));
  };

  const bringToFront = (id: string) => {
    setCanvasItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      return [...prev.filter(i => i.id !== id), item];
    });
  };

  const handleNewDesign = () => {
    if (canvasItems.length > 0 || selectedModel) {
      onSaveCreation(canvasItems);
      setCanvasItems([]);
      setSelectedModel(null);
      localStorage.removeItem('anywear_last_design');
      localStorage.removeItem('anywear_last_model');
    }
  };

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    try {
      // If canvas is empty, suggest a full outfit
      if (canvasItems.length === 0) {
        const tops = items.filter(i => i.category === 'Tops');
        const bottoms = items.filter(i => i.category === 'Bottoms');
        if (tops.length > 0 && bottoms.length > 0) {
          const randomTop = tops[Math.floor(Math.random() * tops.length)];
          const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
          addToCanvas(randomTop);
          setTimeout(() => addToCanvas(randomBottom), 100);
          setAiAdvice("I've started a fresh look for you with a classic top and bottom pairing. How does this feel for a base?");
        }
      } else {
        const advice = await getOutfitSuggestions(canvasItems, "Stylish Look");
        setAiAdvice(advice || "No advice found.");
      }
    } catch (err) {
      onAiError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Pan Logic
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item')) return;
    if ((e.target as HTMLElement).closest('.mannequin-container')) return;
    
    setIsPanning(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartPanPos({ x: clientX - transform.x, y: clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let newX = clientX - startPanPos.x;
    let newY = clientY - startPanPos.y;

    // Apply Screen Limits
    if (canvasItems.length > 0) {
      const items = canvasItems as any[];
      const minX = Math.min(...items.map(i => i.canvasX)) * transform.scale;
      const maxX = Math.max(...items.map(i => i.canvasX)) * transform.scale;
      const minY = Math.min(...items.map(i => i.canvasY)) * transform.scale;
      const maxY = Math.max(...items.map(i => i.canvasY)) * transform.scale;

      const buffer = 150;
      const screenW = getContainerWidth();
      const screenH = getContainerHeight();

      if (newX + maxX < buffer) newX = buffer - maxX;
      if (newX + minX > screenW - buffer) newX = screenW - buffer - minX;
      if (newY + maxY < buffer) newY = buffer - maxY;
      if (newY + minY > screenH - buffer) newY = screenH - buffer - minY;
    }

    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom Logic
  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.001;
    const delta = -e.deltaY;
    const newScale = Math.min(Math.max(transform.scale + delta * zoomSpeed, 0.2), 3);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scaleRatio = newScale / transform.scale;
    const newX = mouseX - (mouseX - transform.x) * scaleRatio;
    const newY = mouseY - (mouseY - transform.y) * scaleRatio;

    setTransform({ x: newX, y: newY, scale: newScale });
  };

  const filteredWardrobe = ((items || []).filter(i => {
    if (activeCategory === 'Model') return i.category === 'Model';
    if (activeCategory === 'Stickers') return i.tags.includes('sticker');
    if (activeCategory === 'Tops') return i.category === 'Tops';
    if (activeCategory === 'Bottoms') return i.category === 'Bottoms';

    if (activeCategory === 'Shoes') return i.category === 'Shoes';
    if (activeCategory === 'Accessories') return i.category === 'Accessories';
    if (activeCategory === 'All') return i.category !== 'Media' && i.category !== 'Model';
    return true;
  }));

  // Closet stage heights
  
  const containerHeight = getContainerHeight();
  
  // Open: 10% from top
  // Default: 55% from top
  // Closed: Ensure it rests perfectly above the 80px BottomNav. 
  // Handle thickness is ~40px. 80 + 40 + padding = ~140px.
  const closetYPositions = {
    expanded: containerHeight * 0.1,
    default: containerHeight * 0.55,
    closed: containerHeight - 140
  };
  
  const closetY = closetYPositions[closetState as keyof typeof closetYPositions] ?? closetYPositions.default;

  const handleToggleCloset = () => {
    if (closetState === 'closed') setClosetState('default');
    else if (closetState === 'default') setClosetState('expanded');
    else setClosetState('closed');
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden relative">
      {/* Panning Event Catcher (z-0 behind mannequin, captures panning gestures on empty space) */}
      <div 
        ref={containerRef}
        onMouseDown={(e) => {
          handleMouseDown(e);
          setSelectedItemId(null);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "absolute inset-0 overflow-hidden no-scrollbar z-0 touch-none transition-opacity duration-300",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          backgroundColor: 'transparent'
        }}
      />

      {/* Fixed Mannequin Layer (Stationary, never moves with canvas. z-1 so it's above the panning background) */}
      {!selectedModel && modelMode === '3D' && (
        <div 
          className="mannequin-container absolute pointer-events-none"
          style={{
            left: '50%',
            top: '45%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '800px',
            zIndex: 1
          }}
        >
          {mannequinType === 'procedural' ? (
            <div className="pointer-events-auto w-full h-full">
              <Mannequin3D {...mannequinParams} />
            </div>
          ) : (
            <div className="pointer-events-auto w-full h-full">
              <FBXMannequin />
            </div>
          )}
        </div>
      )}

      {!selectedModel && modelMode === '2D' && (() => {
        const heightScale = mannequinParams.height || 1;
        const weightScale = (mannequinParams as any).weight || 1;
        const chestRatio = mannequinParams.chest || 1;
        const waistRatio = mannequinParams.waist || 1;
        const hipsRatio = mannequinParams.hips || 1;
        const avgWidthScale = ((chestRatio + waistRatio + hipsRatio) / 3) * weightScale;
        return (
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '45%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '800px',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <img 
              src={mannequinParams.gender === 'male' ? "/male_silhouette.png" : "/female_silhouette.png"} 
              alt="2D Silhouette" 
              className="object-contain"
              style={{ 
                mixBlendMode: 'multiply', 
                opacity: 0.8,
                transform: `scaleX(${avgWidthScale.toFixed(3)}) scaleY(${heightScale.toFixed(3)})`,
                transformOrigin: 'center bottom',
                height: '100%',
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        );
      })()}

      {selectedModel && (
        <div 
          className="absolute pointer-events-auto"
          style={{
            left: '50%',
            top: '45%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '600px',
            zIndex: 1
          }}
        >
          <ClothingImage 
            src={selectedModel.imageUrl} 
            alt="Model" 
            className="w-full h-full object-cover rounded-[40px] shadow-2xl border-4 border-white" 
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button 
              onClick={() => setSelectedModel(null)}
              className="p-2 bg-black/80 text-white rounded-full backdrop-blur-md active:scale-90"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Canvas Content Container (Clothing items ONLY. z-10 so they render ON TOP of mannequin. pointer-events-none ensures it doesn't block mannequin orbit controls) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div 
          style={{ 
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transformOrigin: '0 0',
            willChange: 'transform'
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {(canvasItems ?? []).map((item: any, idx) => (
            <motion.div 
              drag
              dragMomentum={false}
              dragElastic={0}
              key={item.id}
              className={cn(
                "canvas-item absolute bg-transparent backdrop-blur-none shadow-none overflow-hidden group border transition-all cursor-grab active:cursor-grabbing p-0.5 pointer-events-auto",
                item.tags.includes('sticker') ? "w-14 aspect-square rounded-xl" : "w-32 aspect-square rounded-[20px]",
                selectedItemId === item.id ? "border-indigo-500/20 shadow-sm" : "border-transparent"
              )}
              style={{ 
                left: item.canvasX || 0,
                top: item.canvasY || 0,
                zIndex: idx + 100,
                scale: item.scale || 1
              }}
              onDragStart={() => {
                bringToFront(item.id);
                setSelectedItemId(item.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                bringToFront(item.id);
                setSelectedItemId(item.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setItemToCrop(item);
              }}
              onDragEnd={(_, info) => {
                setCanvasItems(prev => {
                  const newItems = [...prev];
                  const index = newItems.findIndex(i => i.id === item.id);
                  if (index !== -1) {
                    newItems[index] = {
                      ...newItems[index],
                      canvasX: (newItems[index] as any).canvasX + info.offset.x / transform.scale,
                      canvasY: (newItems[index] as any).canvasY + info.offset.y / transform.scale
                    };
                  }
                  return newItems;
                });
              }}
            >
              <ClothingImage src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow-2xl" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCanvas(item.id);
                  if (selectedItemId === item.id) setSelectedItemId(null);
                }}
                className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              >
                <Trash2 size={10} />
              </button>
          </motion.div>
        ))}
      </div>


      {/* Floating Toolbar (Collapsible - Centered Top) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div 
          layout
          initial={false}
          animate={{
            width: isToolbarExpanded ? 'auto' : '48px',
          }}
          className={cn(
            "bg-white/95 backdrop-blur-2xl border border-black/10 shadow-2xl flex items-center overflow-hidden h-[52px] ring-1 ring-black/5",
            isToolbarExpanded ? "px-6 rounded-full gap-8" : "justify-center rounded-full cursor-pointer hover:bg-white transition-all duration-300"
          )}
          onClick={() => !isToolbarExpanded && setIsToolbarExpanded(true)}
        >
          {!isToolbarExpanded ? (
            <motion.div layout>
              <Wrench size={24} className="text-indigo-600" />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-8"
            >
              <button 
                onClick={handleAiSuggest} 
                className={cn("hover:text-black transition-colors shrink-0", isGenerating && "animate-pulse text-indigo-600")} 
                title={t('workshop_ai_suggest')}
              >
                <Sparkles size={20} />
              </button>
              
              <button 
                onClick={() => {
                  onShowHealthReminder();
                  setIsChatOpen(!isChatOpen);
                }} 
                className={cn("transition-colors flex items-center gap-1.5 shrink-0", isChatOpen ? "text-indigo-600" : "hover:text-indigo-600")} 
                title={t('workshop_ai_assistant')}
              >
                <Bot size={20} />
              </button>
              
              <div className="relative shrink-0">
                <button 
                  onClick={() => setIsMannequinControlsOpen(!isMannequinControlsOpen)}
                  className={cn("transition-colors flex items-center gap-2", isMannequinControlsOpen ? "text-indigo-600" : "hover:text-black")} 
                  title="調整身材"
                >
                  <User size={20} />
                </button>
              </div>

              <button 
                onClick={() => setIsShareModalOpen(true)} 
                className="hover:text-black transition-colors shrink-0" 
                title={t('workshop_share')}
              >
                <Share size={20} />
              </button>

              {selectedItemId && (
                <div className="flex items-center gap-3 px-2 border-l border-black/10">
                  <span className="text-[10px] font-black uppercase text-black/40">Size</span>
                  <input 
                    type="range" 
                    min="0.2" 
                    max="5" 
                    step="0.1" 
                    value={canvasItems.find(i => i.id === selectedItemId)?.scale || 1}
                    onChange={(e) => {
                      const newScale = parseFloat(e.target.value);
                      setCanvasItems(prev => prev.map(i => i.id === selectedItemId ? { ...i, scale: newScale } : i));
                    }}
                    className="w-24 h-1.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}

              <div className="w-px h-4 bg-black/10 mx-1 shrink-0" />

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsToolbarExpanded(false);
                }}
                className="hover:text-indigo-600 transition-colors p-1 shrink-0"
                title="縮小工具欄"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Integrated AI Chat Window (Siri-like) */}
      <AnimatePresence>
        {isMannequinControlsOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-6 right-6 z-[100] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-black/5 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-black/5 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <User size={14} className="text-indigo-600" />
                <h4 className="text-[10px] font-black tracking-tight uppercase">{t('workshop_body_controls_title')}</h4>
              </div>
              <button onClick={() => setIsMannequinControlsOpen(false)} className="text-black/20 hover:text-black p-1">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay Elements */}
        {/* Removed aiAdvice overlay as it is now integrated into chat */}

        <div className="absolute top-8 left-6 right-6 flex items-start justify-between z-50 pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto">
            <button 
              onClick={onClose}
              className="p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 active:scale-90 transition-all"
            >
              <ChevronRight className="rotate-180" size={24} />
            </button>
          </div>

          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setModelMode((m: string) => m === '2D' ? '3D' : '2D')}
                className="px-4 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all"
              >
                {modelMode === '2D' ? <Box size={14}/> : <Layout size={14}/>}
                {modelMode === '2D' ? "3D Mode" : "2D Mode"}
              </button>

              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Share size={14} />
                {t('workshop_upload_btn')}
              </button>
            </div>

            {/* Model customization trigger */}
            <button 
              onClick={() => setIsMannequinPanelOpen(!isMannequinPanelOpen)}
              className={cn(
                "p-3 rounded-2xl shadow-lg backdrop-blur-xl border transition-all active:scale-90",
                isMannequinPanelOpen ? "bg-black text-white border-black" : "bg-white/80 text-black border-black/5"
              )}
            >
              <User size={20} />
            </button>
          </div>
        </div>

        {/* Bottom Tool Bar */}
        <div className="absolute bottom-10 left-6 right-6 flex justify-between items-center z-50 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*';
                input.onchange = (e) => handleWorkshopUpload(e as any);
                input.click();
              }}
              className="p-4 bg-white/80 backdrop-blur-2xl rounded-[24px] shadow-sm border border-black/5 active:scale-95 transition-all text-black/60 hover:text-black"
            >
              <Camera size={20} />
            </button>
            <button 
              onClick={() => setCanvasItems([])}
              className="p-4 bg-white/80 backdrop-blur-2xl rounded-[24px] shadow-sm border border-black/5 active:scale-95 transition-all text-red-500/60 hover:text-red-500"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={cn(
                "p-4 rounded-[24px] shadow-xl backdrop-blur-2xl border transition-all active:scale-95 flex items-center gap-2",
                isChatOpen ? "bg-black text-white border-black" : "bg-indigo-600 text-white border-indigo-400"
              )}
            >
              <Bot size={20} className={isChatLoading ? "animate-pulse" : ""} />
              <span className="text-[10px] font-black uppercase tracking-widest">Stylist</span>
            </button>
          </div>
        </div>

        {/* Side Panel (Mannequin Customization) */}
        <AnimatePresence>
          {isMannequinPanelOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-80 bg-white/90 backdrop-blur-2xl z-[70] shadow-2xl border-l border-black/5 p-8 pt-24 overflow-y-auto no-scrollbar"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/30 mb-6">{t('workshop_model_settings')}</h3>
                  
                  {/* Mannequin Type Toggle */}
                  <div className="flex p-1 bg-stone-100 rounded-xl mb-6">
                    <button 
                      onClick={() => setMannequinType('procedural')}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        mannequinType === 'procedural' ? "bg-white text-black shadow-sm" : "text-black/40"
                      )}
                    >
                      Real 3D
                    </button>
                    <button 
                      onClick={() => setMannequinType('fbx')}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        mannequinType === 'fbx' ? "bg-white text-black shadow-sm" : "text-black/40"
                      )}
                    >
                      Style FBX
                    </button>
                  </div>

                  {/* Gender Toggle */}
                  <div className="flex p-1 bg-stone-100 rounded-xl mb-6">
                    <button 
                      onClick={() => setMannequinParams((p: any) => ({ ...p, gender: 'male', height: 1.0 }))}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        mannequinParams.gender === 'male' ? "bg-white text-black shadow-sm" : "text-black/40"
                      )}
                    >
                      {t('workshop_male')}
                    </button>
                    <button 
                      onClick={() => setMannequinParams((p: any) => ({ ...p, gender: 'female', height: 163 / 175 }))}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        mannequinParams.gender === 'female' ? "bg-white text-black shadow-sm" : "text-black/40"
                      )}
                    >
                      {t('workshop_female')}
                    </button>
                  </div>

                  {/* Body Measurement Sliders */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { label: `${t('workshop_height')} (cm)`, key: 'height', min: 150, max: 200, base: 175 },
                      { label: `${t('workshop_chest')} (cm)`, key: 'chest', min: 70, max: 120, base: 90 },
                      { label: `${t('workshop_waist')} (cm)`, key: 'waist', min: 50, max: 100, base: 70 },
                      { label: `${t('workshop_hips')} (cm)`, key: 'hips', min: 70, max: 120, base: 95 },
                    ].map(slider => {
                      const currentVal = (mannequinParams as any)[slider.key] * slider.base;
                      return (
                        <div key={slider.key} className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[8px] font-black uppercase tracking-widest text-black/40">{slider.label}</label>
                            <span className="text-[8px] font-mono text-black/60">{currentVal.toFixed(0)}</span>
                          </div>
                          <input 
                            type="range"
                            min={slider.min}
                            max={slider.max}
                            step="1"
                            value={currentVal}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setMannequinParams((p: any) => ({ ...p, [slider.key]: val / slider.base }));
                            }}
                            className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      );
                    })}
                    {/* Body Type Slider */}
                    <div className="space-y-1.5 col-span-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] font-black uppercase tracking-widest text-black/40">{t('workshop_weight_label')}</label>
                        <span className="text-[8px] font-mono text-black/60">{(mannequinParams as any).weight || 1.0}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.7"
                        max="1.5"
                        step="0.01"
                        value={(mannequinParams as any).weight || 1.0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setMannequinParams((p: any) => ({ ...p, weight: val }));
                        }}
                        className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Integrated AI Chat Window (Siri-like) */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-32 right-6 left-6 md:left-auto md:w-96 z-[100] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-black/5 flex flex-col overflow-hidden max-h-[60vh]"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-indigo-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">{t('chat_title')}</h4>
                    <p className="text-[10px] text-indigo-600/60 font-bold uppercase tracking-widest">{t('chat_status')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={18} className="text-black/40" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {(chatMessages ?? []).map((msg: any, idx: number) => {
                  if (!msg) return null;
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={`${idx}-${msg.role}`} 
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        isUser ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                        isUser 
                          ? "bg-black text-white rounded-tr-none" 
                          : "bg-stone-100 text-black rounded-tl-none"
                      )}>
                        <Markdown>{msg.text?.toString() || ""}</Markdown>
                      </div>
                    </div>
                  );
                })}
                {isChatLoading && (
                  <div className="flex items-start max-w-[85%]">
                    <div className="bg-stone-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-black/5 bg-stone-50/50">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('chat_placeholder')}
                    className="w-full bg-white border border-black/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-sm"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="mt-3 flex justify-center">
                  <button 
                    onClick={() => window.open('https://gemini.google.com/gem/10bJC9GZg4W6gn-3tgB7nYLooZ2nwV7EN?usp=sharing', '_blank')}
                    className="text-[10px] font-bold text-indigo-600/60 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare size={10} />
                    Open Full Gemini Assistant
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crop Modal */}
        {itemToCrop && (
          <ImageCropModal 
            image={itemToCrop.imageUrl}
            onClose={() => setItemToCrop(null)}
            onConfirm={(croppedUrl: string) => {
              setCanvasItems((prev: any) => prev.map((i: any) => i.id === itemToCrop.id ? { ...i, imageUrl: croppedUrl } : i));
              setItemToCrop(null);
            }}
          />
        )}

        {/* Swipeable Closet Panel & Zoom Indicator Group */}
        <motion.div 
          initial={false}
          animate={{ y: closetY }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[60] flex flex-col h-screen"
        >
          {/* The Beige Panel */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#D9CDBF] rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col h-full"
          >
            {/* Drag Handle / Swipe Trigger - Now Tab to Open */}
            <div 
              onClick={handleToggleCloset}
              className="w-full py-4 flex justify-center cursor-pointer shrink-0 hover:bg-black/5 transition-colors rounded-t-[40px]"
            >
              <div className="w-12 h-1.5 bg-black/20 rounded-full" />
            </div>

            {/* Category Tabs (Reverted to original design: Tops, Bottoms, Accessories, Model) */}
            <div className={cn(
              "flex justify-start items-center gap-1 mb-4 px-6 shrink-0 transition-opacity duration-200 overflow-x-auto no-scrollbar touch-pan-x",
              closetState === 'closed' ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>

              {[
                { id: 'All', label: t('closet_all') },
                { id: 'Tops', label: t('closet_tops') },
                { id: 'Bottoms', label: t('closet_bottoms') },
                { id: 'Shoes', label: t('closet_shoes') },
                { id: 'Accessories', label: t('closet_accessories') }
              ].map(cat => (
                <button 
                  key={cat.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCategory(cat.id as any);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-8 py-2 rounded-full text-[10px] font-bold transition-all border border-transparent whitespace-nowrap shrink-0",
                    activeCategory === cat.id 
                      ? "bg-black text-white shadow-lg" 
                      : "bg-white/40 text-black/60 hover:bg-white/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Item Grid */}
            <div className={cn(
              "grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar px-4 pb-48 flex-1 transition-opacity duration-200",
              closetState === 'closed' ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
              {filteredWardrobe.map((item: any) => (
                <div 
                  key={item.id} 
                  role="button"
                  tabIndex={0}
                  draggable={!isSelectMode}
                  onDragStart={(e) => !isSelectMode && handleDragStart(e, item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelectMode) {
                      if (selectedIds.includes(item.id)) {
                        setSelectedIds((prev: any) => prev.filter((id: string) => id !== item.id));
                      } else if (selectedIds.length < 5) {
                        setSelectedIds((prev: any) => [...prev, item.id]);
                      }
                    } else {
                      addToCanvas(item);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!isSelectMode) addToCanvas(item);
                    }
                  }}
                  className={cn(
                    "aspect-square bg-transparent rounded-2xl p-2 shadow-sm transition-all group relative border-2 cursor-pointer",
                    isSelectMode
                      ? selectedIds.includes(item.id) 
                        ? "border-indigo-600 scale-[0.98] shadow-lg shadow-indigo-100/50" 
                        : "border-transparent"
                      : item.category === 'Media' 
                        ? selectedModel?.id === item.id ? "border-indigo-600 scale-105" : "border-transparent"
                        : canvasItems.find((i: any) => i.id === item.id) ? "border-indigo-600 scale-105" : "border-transparent",
                    !isSelectMode && "active:scale-95"
                  )}
                >
                  <ClothingImage 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className={cn(
                      "w-full h-full p-2 transition-transform duration-500", 
                      item.category === 'Media' ? "object-cover rounded-xl" : "object-contain drop-shadow-md",
                      !isSelectMode && "group-hover:scale-110"
                    )} 
                  />

                  {isSelectMode && selectedIds.includes(item.id) && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg border-2 border-white z-20">
                      {selectedIds.indexOf(item.id) + 1}
                    </div>
                  )}

                  {item.source && !isSelectMode && (
                    <div className={cn(
                      "absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-md border border-white/20 shadow-sm z-10",
                      item.source === 'owned' ? "bg-emerald-500/80 text-white" : "bg-amber-500/80 text-white"
                    )}>
                      <User size={8} />
                      <span className="text-[7px] font-black uppercase tracking-wider">
                        {item.source === 'owned' ? t('source_owned') : t('source_inspiration')}
                      </span>
                    </div>
                  )}
                  
                  {!isSelectMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50 z-10"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  
                  {(!isSelectMode && (item.category === 'Media' ? selectedModel?.id === item.id : canvasItems.find((i: any) => i.id === item.id))) && (
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-lg">
                      <Sparkles size={8} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Share Modal */}
        <AnimatePresence>
          {isShareModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-end justify-center"
              onClick={() => setIsShareModalOpen(false)}
            >
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white w-full max-w-md rounded-t-[40px] p-8 pb-12 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-8" />
                <h3 className="text-center font-black text-lg mb-8">{t('share_title')}</h3>
                
                {/* Social Links */}
                <div className="grid grid-cols-5 gap-4 mb-10">
                  {[
                    { name: t('share_copy'), icon: <Layers size={20} />, color: 'bg-gray-100' },
                    { name: 'Line', icon: <Sparkles size={20} />, color: 'bg-green-500 text-white' },
                    { name: 'FB', icon: <Layout size={20} />, color: 'bg-blue-600 text-white' },
                    { name: 'IG', icon: <Camera size={20} />, color: 'bg-pink-500 text-white' },
                    { name: t('share_more'), icon: <Share size={20} />, color: 'bg-gray-100' }
                  ].map(social => (
                    <div key={social.name} className="flex flex-col items-center gap-2">
                      <button className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform", social.color)}>
                        {social.icon}
                      </button>
                      <span className="text-[10px] font-bold text-black/40">{social.name}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      onPublish([...(selectedModel ? [selectedModel] : []), ...canvasItems]);
                      setIsShareModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors group shadow-lg shadow-emerald-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} />
                      <span className="font-bold text-sm">{t('share_publish')}</span>
                    </div>
                    <ChevronRight size={18} className="opacity-50" />
                  </button>

                  <button 
                    onClick={handleAnalyzeOutfit}
                    className="w-full flex items-center justify-between p-4 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition-colors group shadow-lg shadow-indigo-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <Bot size={18} />
                      <span className="font-bold text-sm">{t('share_ai_assistant')}</span>
                    </div>
                    <ChevronRight size={18} className="opacity-50" />
                  </button>

                  {[
                    { name: t('share_favorites'), icon: <Heart size={18} />, onClick: () => {
                      onSaveCreation(canvasItems);
                      setIsShareModalOpen(false);
                      setAlertMessage("已儲存穿搭至我的衣櫥！");
                    }},
                    { name: t('share_download'), icon: <PlusSquare size={18} />, onClick: () => {} },
                    { name: t('share_files'), icon: <Bookmark size={18} />, onClick: () => {} }
                  ].map(action => (
                    <button 
                      key={action.name} 
                      onClick={action.onClick}
                      className="w-full flex items-center justify-between p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-black/40 group-hover:text-black transition-colors">{action.icon}</div>
                        <span className="font-bold text-sm">{action.name}</span>
                      </div>
                      <ChevronRight size={18} className="text-black/20" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isAnalyzingOutfit && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1100] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="relative mb-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-t-2 border-indigo-500/20"
                  style={{ position: 'relative' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-indigo-600"
                  >
                    <Sparkles size={40} />
                  </motion.div>
                </div>
              </div>
              <h2 className="text-xl font-black mb-2">{t('analyzing_outfit')}</h2>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 h-1.5 bg-indigo-600 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
const ProfileView = ({ 
  wardrobe, 
  creations, 
  posts, 
  onUpdateItem, 
  onRemoveItem,
  onRemoveCreation,
  onRemovePost,
  isRateLimited, 
  isApiDenied, 
  onAiError,
  onOpenCalendar,
  onUploadTodayPhoto,
  userProfile,
  onEditProfile,
  allPosts,
  trash,
  setTrash,
  onRestoreFromTrash,
  savedPostIds,
  onUnsavePost
}: { 
  wardrobe: ClothingItem[], 
  creations: OutfitRecord[], 
  posts: Post[], 
  onUpdateItem: (id: string, updates: Partial<ClothingItem>) => void, 
  onRemoveItem: (id: string) => void,
  onRemoveCreation: (index: number) => void,
  onRemovePost: (id: string) => void,
  isRateLimited: boolean, 
  isApiDenied: boolean, 
  onAiError: (err: any, silent?: boolean) => void,
  onOpenCalendar: () => void,
  onUploadTodayPhoto: (imageUrl: string) => void,
  userProfile: UserProfile,
  onEditProfile: () => void,
  allPosts: Post[],
  trash: any[],
  setTrash: (v: any[]) => void,
  onRestoreFromTrash: (id: string) => void,
  savedPostIds: string[],
  onUnsavePost: (id: string) => void
}) => {
  const { language, t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedInTrash, setSelectedInTrash] = useState<string[]>([]);
  
  const today = new Date();
  const todayOutfit = creations.find(c => {
    const d = new Date(c.date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  })?.items || null;

  const todayDay = today.getDate();
  const todayMonthName = today.toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', { month: 'short' });


  const [activeTab, setActiveTab] = useState<'ITEMS' | 'OUTFITS' | 'POSTS' | 'MY POSTS'>('ITEMS');
  const [isTop50Open, setIsTop50Open] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewType, setReviewType] = useState<'monthly' | 'yearly'>('monthly');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUploadTodayPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative pb-24 h-full overflow-y-auto no-scrollbar bg-white dark:bg-[#121212]">
      <div className="absolute top-8 left-6 z-20">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/5 active:scale-90 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
        >
          <Menu size={18} className="dark:text-white" />
        </button>
      </div>

      <AnimatePresence>
        {isTrashOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white dark:bg-[#121212] z-[500] flex flex-col pt-12"
          >
            <div className="px-6 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setIsTrashOpen(false); setIsSelecting(false); }}
                  className="p-2 bg-stone-100 dark:bg-white/5 rounded-full"
                >
                  <ChevronRight size={24} className="rotate-180" />
                </button>
                <h3 className="text-2xl font-black tracking-tighter">{t('trash_title')}</h3>
              </div>
              
              {trash.length > 0 && (
                <div className="flex gap-2">
                  {!isSelecting && (
                    <button 
                      onClick={() => {
                        if (confirm(t('trash_confirm_clear_all'))) {
                          trash.forEach(item => {
                            if (item.type === 'post') fetch(`/api/posts/${item.originalData.id}`, { method: 'DELETE' }).catch(console.error);
                            else if (item.type === 'item') fetch(`/api/items/${item.originalData.id}`, { method: 'DELETE' }).catch(console.error);
                          });
                          setTrash([]);
                        }
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-red-600 px-4 py-2 bg-red-50 dark:bg-red-500/10 rounded-full"
                    >
                      {t('trash_clear_all')}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsSelecting(!isSelecting);
                      setSelectedInTrash([]);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-full"
                  >
                    {isSelecting ? t('trash_cancel_select') : t('trash_select')}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6">
              {trash.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Trash2 size={48} className="mb-4" />
                  <p className="text-sm font-bold">{t('trash_empty')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 pb-32">
                  {trash.map((item) => {
                    const data = item.originalData;
                    const imageUrl = data.imageUrl || (data.items?.[0]?.imageUrl);
                    const isSelected = selectedInTrash.includes(item.id);
                    
                    return (
                      <motion.div 
                        key={item.id}
                        layout
                        onClick={() => {
                          if (isSelecting) {
                            setSelectedInTrash(prev => 
                              prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                            );
                          }
                        }}
                        className={cn(
                          "aspect-square rounded-2xl bg-stone-50 dark:bg-white/5 border-2 transition-all relative overflow-hidden group",
                          isSelected ? "border-indigo-500" : "border-transparent"
                        )}
                      >
                        <ClothingImage src={imageUrl} alt="Trash Item" className="w-full h-full object-cover p-1 opacity-60" />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/40 rounded-md text-[6px] font-black uppercase text-white tracking-widest">
                          {item.type}
                        </div>
                        {isSelecting && (
                          <div className={cn(
                            "absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected ? "bg-indigo-500 border-indigo-500 shadow-md" : "bg-white/20 border-white/40"
                          )}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {isSelecting && selectedInTrash.length > 0 && (
              <div className="absolute bottom-32 left-6 right-6 flex gap-3 z-[600]">
                <button 
                  onClick={() => {
                    selectedInTrash.forEach(id => onRestoreFromTrash(id));
                    setIsSelecting(false);
                    setSelectedInTrash([]);
                  }}
                  className="flex-1 py-4 bg-indigo-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {t('trash_restore_selected')}
                </button>
                <button 
                  onClick={() => {
                    if (confirm(t('trash_confirm_delete_all'))) {
                      const itemsToDelete = trash.filter(i => selectedInTrash.includes(i.id));
                      itemsToDelete.forEach(item => {
                        if (item.type === 'post') fetch(`/api/posts/${item.originalData.id}`, { method: 'DELETE' }).catch(console.error);
                        else if (item.type === 'item') fetch(`/api/items/${item.originalData.id}`, { method: 'DELETE' }).catch(console.error);
                      });
                      setTrash(trash.filter(i => !selectedInTrash.includes(i.id)));
                      setIsSelecting(false);
                      setSelectedInTrash([]);
                    }
                  }}
                  className="flex-1 py-4 bg-red-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                >
                  {t('trash_delete_selected')}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings Sidebar */}
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-[#121212] z-[600] shadow-2xl border-r border-black/5 dark:border-white/5 p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-2xl font-black tracking-tighter">{t('settings_title')}</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-stone-100 dark:bg-white/5 rounded-full active:scale-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30 ml-4">Tools</h4>
              <button 
                onClick={() => { setIsTrashOpen(true); setIsSidebarOpen(false); }}
                className="w-full flex items-center gap-4 p-5 bg-stone-50/50 dark:bg-white/5 rounded-3xl transition-all active:scale-95 group"
              >
                <div className="p-2.5 bg-white dark:bg-white/10 rounded-2xl shadow-sm text-black dark:text-white group-hover:scale-110 transition-transform">
                  <Trash2 size={20} className="opacity-40" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-60">{t('settings_trash')}</span>
              </button>
            </div>

            <div className="pt-8 border-t border-black/5">
              <p className="text-[10px] font-bold opacity-20 text-center tracking-widest uppercase">Version 2.5.0 • Gemini Workshop</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 right-6 z-10">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-col items-center mb-12 pt-8">
        <div 
          onClick={onEditProfile}
          className="w-32 h-32 rounded-full bg-stone-100 overflow-hidden mb-6 border-8 border-white shadow-2xl cursor-pointer hover:scale-105 transition-transform group relative"
        >
          <ClothingImage src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
        </div>
        <h2 
          onClick={onEditProfile}
          className="text-3xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition-opacity"
        >
          {userProfile.name}
        </h2>
        <p className="text-black/30 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
          {userProfile.handle} • {userProfile.bio}
        </p>
        
      </div>

      {/* Calendar Block */}
      <div className="mx-6 bg-white dark:bg-white/5 rounded-[40px] p-6 shadow-[0_10px_30_rgba(0,0,0,0.05)] border border-black/5 dark:border-white/5 mb-8 flex items-center justify-between">
        <div 
          onClick={onOpenCalendar}
          className="flex flex-col cursor-pointer active:scale-95 transition-transform"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1 flex items-center gap-1"><Calendar size={12}/> Today</span>
          <span className="text-3xl font-black tracking-tighter">{todayDay}</span>
          <span className="text-sm font-bold text-black/60">{todayMonthName}</span>
        </div>
        
        <div className="flex-1 flex justify-end">
          {todayOutfit ? (
            <div className="flex -space-x-4">
              {todayOutfit.slice(0, 3).map((item, idx) => (
                <div key={idx} className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden border-4 border-white shadow-sm relative z-[3-idx]">
                  <ClothingImage src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                </div>
              ))}
            </div>
          ) : (
            <div 
              onClick={handleCameraClick}
              className="w-16 h-16 rounded-2xl bg-stone-50 border-2 border-dashed border-black/10 flex items-center justify-center text-black/20 hover:bg-stone-100 transition-colors"
            >
              <Camera size={20} />
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
      </div>


      <div className="flex justify-between mb-12 mx-6">
        <div className="text-center">
          <div className="font-black text-xl tracking-tighter">{(posts ?? []).filter(p => p.author?.name === 'You').length}</div>
          <div className="text-[9px] uppercase tracking-[0.2em] font-black text-black/30 mt-1">{t('profile_posts')}</div>
        </div>
        <div className="text-center">
          <div className="font-black text-xl tracking-tighter">{(wardrobe ?? []).length}</div>
          <div className="text-[9px] uppercase tracking-[0.2em] font-black text-black/30 mt-1">{t('closet_all')}</div>
        </div>
        <div className="text-center">
          <div className="font-black text-xl tracking-tighter">{(posts ?? []).filter(p => p.author?.name !== 'You').length}</div>
          <div className="text-[9px] uppercase tracking-[0.2em] font-black text-black/30 mt-1">{t('profile_saved')}</div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4 mx-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-500" />
            {t('profile_charts_title')}
          </h3>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x mx-6 pb-4">
          {/* Top 50 Card */}
          <button 
            onClick={() => setIsTop50Open(true)}
            className="flex-shrink-0 w-44 snap-start group"
          >
            <div className="aspect-square rounded-[40px] bg-stone-900 p-6 flex flex-col justify-center items-center shadow-2xl shadow-black/10 group-hover:scale-[1.02] transition-transform relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#4f46e520,transparent)]" />
               <div className="relative z-10 text-center">
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60 mb-1">{t('chart_label')}</div>
                 <div className="text-4xl font-black text-white tracking-tighter mb-1">{t('chart_top50_title')}</div>
                 <div className="w-8 h-0.5 bg-indigo-500/40 mx-auto mb-3" />
                 <div className="text-[8px] font-black uppercase tracking-widest text-white/40">{t('chart_global_ranking')}</div>
               </div>
            </div>
            <div className="mt-4 text-left">
              <div className="text-[11px] font-black text-black tracking-tight">{t('chart_top50_subtitle')}</div>
              <div className="text-[9px] font-bold text-black/30 uppercase tracking-widest">{t('chart_update_weekly')}</div>
            </div>
          </button>

          {/* Monthly Review Card */}
          <button 
            onClick={() => { setReviewType('monthly'); setIsReviewOpen(true); }}
            className="flex-shrink-0 w-44 snap-start group"
          >
            <div className="aspect-square rounded-[40px] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 flex flex-col justify-end shadow-xl shadow-black/5 group-hover:scale-[1.02] transition-transform relative overflow-hidden text-left">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 blur-3xl rounded-full -mr-16 -mt-16" />
               <Sparkles className="absolute top-8 left-8 text-emerald-500/20" size={48} />
               <div className="relative z-10">
                 <div className="text-[32px] font-black text-black tracking-tighter leading-none mb-1" style={{ whiteSpace: 'pre-line' }}>{t('chart_monthly_title')}</div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600/40">{t('chart_style_dna')}</div>
               </div>
            </div>
            <div className="mt-4 text-left">
              <div className="text-[11px] font-black text-black tracking-tight">{t('chart_review_monthly')}</div>
              <div className="text-[9px] font-bold text-black/30 uppercase tracking-widest">{t('chart_update_monthly')}</div>
            </div>
          </button>

          {/* Yearly Card (Teaser) */}
          <button 
            onClick={() => { setReviewType('yearly'); setIsReviewOpen(true); }}
            className="flex-shrink-0 w-44 snap-start group opacity-60"
          >
            <div className="aspect-square rounded-[40px] bg-stone-100 p-6 flex flex-col justify-center items-center group-hover:scale-[1.02] transition-transform relative overflow-hidden">
               <Layers className="text-black/10 mb-2" size={32} />
               <div className="text-[28px] font-black text-black/20 tracking-tighter mb-1 text-center leading-none" style={{ whiteSpace: 'pre-line' }}>{t('chart_yearly_title')}</div>
            </div>
            <div className="mt-4 text-left">
              <div className="text-[11px] font-black text-black tracking-tight">{t('chart_review_yearly')}</div>
              <div className="text-[9px] font-bold text-black/10 uppercase tracking-widest">{t('chart_update_yearly')}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mx-6 border-b border-black/5 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'ITEMS', label: t('profile_tab_items') },
          { id: 'OUTFITS', label: t('profile_tab_outfits') },
          { id: 'POSTS', label: t('profile_tab_posts') },
          { id: 'MY POSTS', label: t('profile_tab_my_posts') }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "pb-4 text-xs font-black tracking-widest transition-all relative whitespace-nowrap",
              activeTab === tab.id ? "text-black dark:text-white" : "text-black/20 dark:text-white/20"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTabProfile" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 gap-4 mx-6">
        {activeTab === 'ITEMS' && (wardrobe ?? []).map((item) => (
          <div key={item.id} className="aspect-square bg-stone-100 dark:bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center relative group">
            <ClothingImage 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-contain p-2" 
            />
            {item.source && (
              <div className={cn(
                "absolute bottom-1 left-1 px-1 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-md border border-white/20 shadow-sm z-10",
                item.source === 'owned' ? "bg-emerald-500/80 text-white" : "bg-amber-500/80 text-white"
              )}>
                {item.source === 'owned' ? <User size={6} /> : <Bookmark size={6} />}
                <span className="text-[6px] font-black uppercase tracking-wider">
                  {item.source === 'owned' ? t('source_owned') : t('source_inspiration')}
                </span>
              </div>
            )}
            <button 
              onClick={() => onRemoveItem(item.id)}
              className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {activeTab === 'OUTFITS' && (creations ?? []).map((creation, idx) => (
          <div key={idx} className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-1">
              {creation.items.slice(0, 4).map((item, i) => (
                <ClothingImage key={i} src={item.imageUrl} alt={item.name} className="w-full h-full object-contain bg-white rounded-lg" />
              ))}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('profile_view_btn')}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onRemoveCreation(idx); }}
              className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50 z-10"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {activeTab === 'POSTS' && (posts ?? []).filter(p => !!p && savedPostIds.includes(p.id)).map((post) => (
          <div key={post.id} className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative group">
            <ClothingImage src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
            <button 
              onClick={() => onUnsavePost(post.id)}
              className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {activeTab === 'MY POSTS' && (posts ?? []).filter(p => !!p && p.author?.name === userProfile?.name).map((post) => (
          <div key={post.id} className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative group">
            <ClothingImage src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
            <button 
              onClick={() => onRemovePost(post.id)}
              className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      <Top50Modal 
        isOpen={isTop50Open} 
        onClose={() => setIsTop50Open(false)} 
        posts={allPosts} 
      />

      <FashionReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        creations={creations}
        type={reviewType}
      />
    </div>
  );
};

const WeeklyReportModal = ({ outfits, weekIndex, onClose }: { outfits: ClothingItem[][], weekIndex: number, onClose: () => void }) => {
  const { language, t } = useLanguage();
  const [reportData, setReportData] = useState<{
    strengths: string;
    suggestions: string;
    quote: string;
    knowledge: { title: string, content: string }
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const FALLBACK_QUOTES = [
    "沒有不好的身材，只有還沒找到對的『磅數』與『比例』。",
    "夏天穿的是『清爽感』，冬天穿的是『層次感』，而四季穿的都是『質感』。",
    "配件不是可有可無的點綴，而是讓基礎款單品擁有靈魂的關鍵。",
    "當你不知道穿什麼時，一件高磅數的白 T 與原色牛仔褲永遠不會背叛你。",
    "所謂的『上淺下深』，不只是顏色搭配，更是視覺重心的穩固。",
    "不要讓衣服穿你；當你感到不自在時，再貴的品牌也只是束縛。",
    "寬鬆不代表邋遢，只要抓準『長度短、寬度夠』，矮個子也能穿出大氣場。"
  ];

  const FALLBACK_KNOWLEDGE = [
    { title: "守、破、離", content: "先掌握基本比例與配色（守），再依特質打破常規（破），最終達到穿衣自由（離）。" },
    { title: "名片理論", content: "衣服是配角，目的是放大你的特質。穿搭是透過視覺向世界遞出的第一張名片。" },
    { title: "舒適為王", content: "避開「盲目追求流行」而穿上不自在的衣服。自信與舒適度是判斷適合與否的首要指標。" },
    { title: "黃金 7:3 比例", content: "透過高腰褲、紮衣服、短版上衣明確標示腰線，即便穿超寬褲也能展現大氣場。" },
    { title: "身形修飾", content: "針對瘦小/豐腴體型，選擇高磅數硬挺材質，避免過軟貼身，用布料重塑線條。" },
    { title: "三色原則", content: "全身上下的主色調不超過三種，這能確保造型簡潔俐落。" }
  ];

  const hasOutfits = outfits.length > 0;

  useEffect(() => {
    if (hasOutfits && !reportData) {
      handleAnalyze();
    }
  }, [hasOutfits]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWeeklyFashionReport(outfits, language);
      if (data) {
        setReportData(data);
      } else {
        throw new Error("No data returned from AI");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze week");
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomItem = (arr: any[], seed: number) => arr[seed % arr.length];
  const seed = weekIndex + (new Date().getDate()); // Simple stable seed

  const displayData = reportData || {
    strengths: hasOutfits ? t('weekly_analyzing') : t('weekly_no_outfits'),
    suggestions: hasOutfits ? "..." : t('closet_all'),
    quote: language === 'zh' ? getRandomItem(FALLBACK_QUOTES, seed) : "Fashion is the armor to survive the reality of everyday life.",
    knowledge: language === 'zh' ? getRandomItem(FALLBACK_KNOWLEDGE, seed) : {
      title: "Rule of Three Colors",
      content: "No more than three colors."
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/98 backdrop-blur-2xl z-[800] flex flex-col p-8 overflow-y-auto no-scrollbar"
    >
      <div className="flex justify-between items-center mb-10 shrink-0">
        <div>
          <h3 className="text-3xl font-black tracking-tighter">{t('weekly_report_title')}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mt-1">
            {t('weekly_week_label')} {weekIndex + 1} {t('weekly_week_suffix')}
          </p>
        </div>
        <button onClick={onClose} className="p-3 bg-stone-100 rounded-full active:scale-90 transition-transform">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-10 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-10 text-center rounded-[40px]">
            <RefreshCw size={40} className="animate-spin text-black/20 mb-4" />
            <p className="text-sm font-bold tracking-tight text-black/40">{t('weekly_analyzing')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 flex flex-col items-center gap-4 text-center">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm font-bold text-red-950">{error}</p>
            <button 
              onClick={handleAnalyze}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-200 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Weekly Outfits */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">{t('weekly_outfits')}</span>
            <div className="flex-1 h-px bg-black/5" />
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {hasOutfits ? outfits.map((outfit, idx) => (
              <div key={idx} className="w-24 h-32 shrink-0 bg-stone-50 rounded-2xl overflow-hidden grid grid-cols-2 gap-0.5 p-1 border border-black/5 shadow-sm">
                {outfit.slice(0, 4).map((item, i) => (
                  <ClothingImage key={i} src={item.imageUrl} alt={item.name} className="w-full h-full object-contain bg-white rounded-lg" />
                ))}
              </div>
            )) : (
              <div className="w-full h-32 rounded-3xl border-2 border-dashed border-black/5 flex items-center justify-center text-black/10 text-xs font-bold italic">
                {t('weekly_no_outfits')}
              </div>
            )}
          </div>
        </section>

        {/* AI Insights */}
        <div className="grid grid-cols-2 gap-6">
          <section className="bg-emerald-50/50 p-5 rounded-[32px] border border-emerald-100/50 relative overflow-hidden group min-h-[140px]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/20 blur-2xl group-hover:bg-emerald-200/40 transition-all" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 mb-3 flex items-center gap-2">
              <Sparkles size={12} className="text-emerald-400" /> {t('weekly_strengths')}
            </h4>
            <p className="text-sm font-bold text-emerald-950 leading-relaxed">{displayData.strengths}</p>
          </section>
          <section className="bg-indigo-50/50 p-5 rounded-[32px] border border-indigo-100/50 relative overflow-hidden group min-h-[140px]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200/20 blur-2xl group-hover:bg-indigo-200/40 transition-all" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-800/40 mb-3 flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-400" /> {t('weekly_suggestions')}
            </h4>
            <p className="text-sm font-bold text-indigo-950 leading-relaxed">{displayData.suggestions}</p>
          </section>
        </div>

        {/* Fashion Quote */}
        <section className="text-center py-8 px-10 bg-black rounded-[40px] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,#4f46e5,transparent)]" />
          <div className="flex flex-col items-center gap-2 mb-4">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400/60">{t('weekly_quote')}</span>
          </div>
          <p className="text-lg font-black tracking-tight leading-snug mb-3 italic">"{displayData.quote}"</p>
          <div className="w-12 h-0.5 bg-indigo-500/50 mx-auto" />
        </section>

        {/* Knowledge Card */}
        <section className="bg-stone-50 p-8 rounded-[40px] border border-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
              <Book size={16} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest">{displayData.knowledge.title}</h4>
          </div>
          <p className="text-sm font-medium text-black/60 leading-relaxed">{displayData.knowledge.content}</p>
        </section>
      </div>

      <button onClick={onClose} className="mt-10 py-5 bg-stone-100 rounded-[32px] font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform shrink-0">
        {t('weekly_close')}
      </button>
    </motion.div>
  );
};

const CalendarView = ({ creations, onClose }: { creations: OutfitRecord[], onClose: () => void }) => {
  const { language, t } = useLanguage();
  const today = new Date();
  
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const monthName = language === 'zh' 
    ? `${viewYear}年 ${viewMonth + 1}月`
    : new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long' });
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawStartDay = new Date(viewYear, viewMonth, 1).getDay();
  // Adjust to Monday start: 0(Mon)...6(Sun)
  const startDay = rawStartDay === 0 ? 6 : rawStartDay - 1;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 10 }, (_, i) => 2026 + i);

  const [selectedWeek, setSelectedWeek] = useState<{ outfits: ClothingItem[][], index: number } | null>(null);

  const creationMap = new Map<number, ClothingItem[]>();
  creations.forEach(record => {
    const d = new Date(record.date);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      creationMap.set(d.getDate(), record.items);
    }
  });

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - startDay + 1;
    if (day > 0 && day <= daysInMonth) return day;
    return null;
  });

  // Group days into 6 weeks
  const weeks = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, (i + 1) * 7));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 50 }} 
      className="fixed inset-0 bg-white z-[600] flex flex-col p-6 h-full"
    >
      <div className="flex justify-between items-center mt-8 mb-8 shrink-0">
        <button 
          onClick={() => setIsPickerOpen(true)}
          className="text-left group active:scale-95 transition-transform"
        >
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-2 group-hover:text-black/60">
            {monthName} {viewYear}
            <ChevronRight size={24} className="rotate-90 opacity-20" />
          </h2>
        </button>
        <button 
          onClick={onClose} 
          className="p-3 bg-stone-100 rounded-full active:scale-90 transition-transform flex items-center justify-center shrink-0"
        >
          <X size={20} className="text-black/60"/>
        </button>
      </div>

      <div className="grid grid-cols-[40px_repeat(7,1fr)] mb-4">
        <div /> {/* Spacer for report button */}
        {(language === 'zh' ? ['一', '二', '三', '四', '五', '六', '日'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-black/30 tracking-widest uppercase">{d}</div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 space-y-2">
        {weeks.map((week, weekIdx) => {
          const weekOutfits = week
            .map(d => d ? creationMap.get(d) : null)
            .filter((o): o is ClothingItem[] => !!o);
          
          const sundayDate = week[6];
          const isWeekComplete = sundayDate ? new Date(viewYear, viewMonth, sundayDate) <= new Date() : false;
          
          return (
            <div key={weekIdx} className="grid grid-cols-[40px_repeat(7,1fr)] gap-2">
              <div className="w-[40px] flex items-center justify-center">
                {isWeekComplete && (
                  <button 
                    onClick={() => setSelectedWeek({ outfits: weekOutfits, index: weekIdx })}
                    className="w-full h-full bg-black text-white rounded-xl flex flex-col items-center justify-center p-1 group hover:bg-stone-800 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[6px] font-black uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 opacity-40">Report</span>
                      <BarChart2 size={12} className="shrink-0" />
                    </div>
                  </button>
                )}
              </div>

              {week.map((dayNum, i) => {
                const outfit = dayNum ? creationMap.get(dayNum) : null;
                const isToday = dayNum === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                return (
                  <div key={i} className="aspect-[3/4] relative">
                    {dayNum ? (
                      <div className={cn(
                        "w-full h-full rounded-2xl flex flex-col p-1.5 transition-all outline outline-1",
                        isToday ? "bg-stone-100 outline-black/20 shadow-inner" : "bg-white outline-black/5",
                        outfit && !isToday && "hover:shadow-md cursor-pointer"
                      )}>
                        <span className={cn(
                          "text-[10px] font-black z-10 w-5 h-5 flex items-center justify-center rounded-full mb-1",
                          isToday ? "bg-black text-white" : "text-black/40"
                        )}>
                          {dayNum}
                        </span>
                        {outfit ? (
                          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0.5 rounded-xl overflow-hidden shrink-0 pointer-events-none">
                            {outfit.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="bg-stone-50 overflow-hidden outline outline-1 outline-black/5 rounded-md">
                                <ClothingImage src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-0.5" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center pointer-events-none">
                            <span className="text-[14px] opacity-10 font-black tracking-widest">-</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedWeek && (
          <WeeklyReportModal 
            outfits={selectedWeek.outfits} 
            weekIndex={selectedWeek.index} 
            onClose={() => setSelectedWeek(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPickerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[700] flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-2xl font-black tracking-tighter">Select Month & Year</h3>
              <button onClick={() => setIsPickerOpen(false)} className="p-3 bg-black/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 sticky top-0 bg-white/5 py-2">Month</p>
                {months.map((m, idx) => (
                  <button 
                    key={m} 
                    onClick={() => setViewMonth(idx)}
                    className={cn(
                      "w-full text-left py-3 px-4 rounded-2xl text-lg transition-all",
                      viewMonth === idx ? "bg-black text-white font-black" : "text-black/40 border border-transparent"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="w-1/3 overflow-y-auto no-scrollbar space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 sticky top-0 bg-white/5 py-2">Year</p>
                {years.map(y => (
                  <button 
                    key={y} 
                    onClick={() => setViewYear(y)}
                    className={cn(
                      "w-full text-left py-3 px-4 rounded-2xl text-lg transition-all",
                      viewYear === y ? "bg-black text-white font-black" : "text-black/40 border border-transparent"
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsPickerOpen(false)}
              className="mt-8 w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-black/20 active:scale-95 transition-transform"
            >
              Confirm Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Top50Modal = ({ isOpen, onClose, posts }: { isOpen: boolean, onClose: () => void, posts: Post[] }) => {
  const { t } = useLanguage();
  const topPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 50);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[2000] flex flex-col p-6 overflow-y-auto no-scrollbar"
        >
          <div className="flex justify-between items-center mb-10 shrink-0">
            <div>
              <h3 className="text-4xl font-black tracking-tighter text-white">Top 50</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">{t('chart_top50_subtitle')}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white active:scale-90 transition-transform">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {topPosts.map((post, idx) => (
              <div key={post.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] group hover:bg-white/10 transition-colors">
                <div className="text-xl font-black text-white/20 w-8">{idx + 1}</div>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <ClothingImage src={post.imageUrl} alt="Top Post" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold truncate">{post.description}</div>
                  <div className="text-white/40 text-[10px] uppercase font-black">{post.author.name}</div>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-full">
                  <Heart size={12} fill="currentColor" />
                  <span className="text-[11px] font-black">{post.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FashionReviewModal = ({ isOpen, onClose, creations, type }: { isOpen: boolean, onClose: () => void, creations: OutfitRecord[], type: 'monthly' | 'yearly' }) => {
  const { t, language } = useLanguage();
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Stats logic
  const relevantCreations = creations.filter(c => {
    const d = new Date(c.date);
    const now = new Date();
    if (type === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return d.getFullYear() === now.getFullYear();
  });

  const itemCounts: Record<string, { item: ClothingItem, count: number }> = {};
  relevantCreations.forEach(c => {
    c.items.forEach(item => {
      if (!itemCounts[item.id]) {
        itemCounts[item.id] = { item, count: 0 };
      }
      itemCounts[item.id].count++;
    });
  });

  const mostWorn = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 3);
  
  // Style Identity (approximate by tags)
  const tagCounts: Record<string, number> = {};
  relevantCreations.forEach(c => {
    c.items.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
  });
  const topStyle = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Universal";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-white z-[2000] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 flex justify-between items-center shrink-0 border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-20">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                 <Sparkles size={16} />
               </div>
               <h3 className="text-xl font-black tracking-tighter">{type === 'monthly' ? t('chart_review_monthly') : t('chart_review_yearly')}</h3>
             </div>
             <button onClick={onClose} className="p-3 bg-stone-100 rounded-full active:scale-90 transition-transform">
               <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-12 pb-24">
             {/* Main Hero Card */}
             <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Summary</div>
                   <div className="text-5xl font-black tracking-tighter leading-none mb-6">Style<br/>Identity</div>
                   <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 inline-block">
                     <div className="flex items-center gap-2">
                       <Layout size={16} className="text-emerald-200" />
                       <span className="text-sm font-black uppercase tracking-widest">{topStyle}</span>
                     </div>
                   </div>
                </div>
                <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/20 blur-[80px] rounded-full" />
             </div>

             {/* Most Worn Items Grid */}
             <section>
                <div className="flex justify-between items-baseline mb-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-black/40">{t('review_stats_most_worn')}</h4>
                  <span className="text-xs font-bold text-indigo-500">{relevantCreations.length} {t('profile_tab_outfits')}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {mostWorn.map((entry, idx) => (
                    <div key={entry.item.id} className={cn(
                      "rounded-[32px] p-6 flex flex-col items-center text-center relative overflow-hidden border border-black/5",
                      idx === 0 ? "col-span-2 bg-stone-50" : "bg-white"
                    )}>
                      <div className="w-32 h-32 mb-4">
                        <ClothingImage src={entry.item.imageUrl} alt="Most Worn" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-xs font-black uppercase tracking-widest text-black/30 mb-1">Rank #{idx + 1}</div>
                      <div className="text-lg font-black tracking-tighter text-black truncate w-full">{entry.item.name}</div>
                      <div className="mt-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        Worn {entry.count} times
                      </div>
                    </div>
                  ))}
                  {mostWorn.length === 0 && (
                     <div className="col-span-2 py-20 bg-stone-50 rounded-[40px] border-2 border-dashed border-black/5 flex flex-col items-center text-center p-8">
                        <Smile size={32} className="text-black/10 mb-4" />
                        <p className="text-sm font-bold text-black/20 italic">No outfits recorded for this period yet.</p>
                     </div>
                  )}
                </div>
             </section>

             {/* AI Insights Card */}
             <section className="bg-stone-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                     <Sparkles className="text-indigo-400" />
                     <h4 className="text-lg font-black tracking-tighter leading-tight">{t('review_ai_title')}</h4>
                   </div>
                   <div className="prose prose-invert prose-sm text-white/70 italic leading-relaxed">
                     {(language === 'zh') ? 
                      `根據數據，您本季的穿搭偏好『${topStyle}』。目前您的衣櫥中深色比例較高，建議下個月可以嘗試加入一些『淡米色』或『鼠尾草綠』的高磅數單品來增加層次感。另外，您的皮帶配件使用率較低，透過紮衣服強調腰線能更有效地修飾比例。` :
                      `Based on your data, you've shown a strong preference for '${topStyle}' recently. Since your current rotation is heavy on dark tones, consider adding 'Sage Green' or 'Beige' pieces to lighten up your layers. Pro-tip: emphasized waistlines via tucking would further enhance your proportions.`
                     }
                   </div>
                </div>
             </section>
          </div>

          <div className="p-8 bg-white border-t border-black/5 sticky bottom-0 z-20">
             <button 
               onClick={onClose}
               className="w-full py-5 bg-stone-900 text-white rounded-[40px] font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl shadow-black/10"
             >
               {t('review_close')}
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HealthReminder = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-2xl border border-black/5 p-8 max-w-sm w-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <X size={20} className="text-black/40" />
        </button>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="p-4 bg-amber-50 rounded-3xl text-amber-600 shadow-inner">
            <ShieldAlert size={48} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-black tracking-tight text-black">{t('health_title')}</h2>
            <p className="text-sm text-black/60 font-medium leading-relaxed">
              {t('health_message')}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-all"
          >
            {t('health_button')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BuyingListView = ({ items, onClose, onRemove }: { items: ShopItem[], onClose: () => void, onRemove: (id: string) => void }) => {
  const { t } = useLanguage();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black tracking-tighter">{t('buying_list_title')}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/20 mt-1">
              {items.length} / 3 {t('buying_list_count')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 rounded-full text-black/40">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 p-4 bg-stone-50 rounded-3xl border border-black/5"
              >
                <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shadow-sm shrink-0">
                  <ClothingImage src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-black/80 mb-1">{item.name}</h4>
                  <p className="text-sm font-black tracking-tight">NT$ {item.price.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={32} className="text-black/10" />
              </div>
              <p className="text-sm text-black/40 font-bold leading-relaxed">
                {t('buying_list_empty')}
              </p>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <button 
            onClick={() => window.open("https://www.gu-global.com/tw/zh_TW/c/women_tshirtsweat.html", "_blank")}
            className="mt-8 w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/20 active:scale-95 transition-all"
          >
            {t('buying_list_checkout')}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

const CustomAlert = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[32px] p-8 max-w-xs w-full shadow-2xl text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-amber-500" />
        </div>
        <p className="text-sm font-bold text-black leading-relaxed mb-8">
          {message}
        </p>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
        >
          OK
        </button>
      </motion.div>
    </motion.div>
  );
};

const DeleteConfirmModal = ({ onConfirm, onClose }: { onConfirm: () => void, onClose: () => void }) => {
  const { t } = useLanguage();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/10" />
        
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Trash2 size={40} className="text-red-500" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-black tracking-tighter text-black mb-4">
          {t('delete_confirm_title')}
        </h2>
        
        <p className="text-sm font-medium text-black/40 leading-relaxed mb-10 px-4">
          {t('delete_confirm_desc')}
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-5 bg-red-500 text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-200 active:scale-95 transition-all"
          >
            {t('delete_confirm_btn')}
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-5 bg-stone-100 text-black/40 rounded-[32px] font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all"
          >
            {t('delete_cancel_btn')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EditProfileModal = ({ 
  isOpen, 
  onClose, 
  profile, 
  onSave 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  profile: UserProfile, 
  onSave: (p: UserProfile) => void 
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Update internal state if props change when opening
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setHandle(profile.handle);
      setBio(profile.bio);
      setAvatar(profile.avatar);
    }
  }, [isOpen, profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setAvatar(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    onSave({ name, handle, bio, avatar });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000] flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/10" />
            
            <h3 className="text-3xl font-black tracking-tighter text-center mb-8">{t('profile_edit_title')}</h3>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-stone-100 overflow-hidden mb-3 border-4 border-white shadow-xl cursor-pointer relative group"
                >
                  <ClothingImage src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">{t('profile_avatar_change')}</span>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                
                <button 
                  onClick={() => setAvatar('/default_avatar.png')}
                  className="mt-4 px-4 py-2 bg-stone-100/50 hover:bg-stone-100 text-[9px] font-black uppercase tracking-widest text-black/40 rounded-full transition-all active:scale-95 border border-black/[0.03]"
                >
                  {t('profile_default_avatar_btn')}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2 block">{t('profile_name_label')}</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 rounded-2xl p-4 text-sm font-bold focus:outline-none border border-black/[0.03]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2 block">{t('profile_handle_label')}</label>
                  <input 
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-stone-50 rounded-2xl p-4 text-sm font-medium focus:outline-none border border-black/[0.03]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2 block">{t('profile_bio_label')}</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-stone-50 rounded-2xl p-4 text-sm font-medium focus:outline-none border border-black/[0.03] h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={handleSubmit}
                  className="w-full py-5 bg-black text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/20 active:scale-95 transition-all"
                >
                  {t('profile_save_btn')}
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-stone-100 text-black/40 rounded-[32px] font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all"
                >
                  {t('main_upload_cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default function App() {
  const { t, hasSetLanguage } = useLanguage();
  const [isAuthCompleted, setIsAuthCompleted] = useState(() => {
    return !!localStorage.getItem('anywear_auth_method');
  });

  const handleAuthComplete = (type: 'google' | 'guest', userData?: { name: string, avatar: string, email: string }) => {
    localStorage.setItem('anywear_auth_method', type);
    setIsAuthCompleted(true);
    if (type === 'google' && userData) {
      setUserProfile(prev => ({ 
        ...prev, 
        name: userData.name, 
        handle: `@${userData.email.split('@')[0]}`,
        avatar: userData.avatar || prev.avatar
      }));
    }
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('anywear_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Alex Rivera',
      handle: '@alex_style',
      bio: 'Style Curator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    };
  });

  useEffect(() => {
    localStorage.setItem('anywear_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const [activeTab, setActiveTab] = useState('main');
  const [showHealthReminder, setShowHealthReminder] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { items: wardrobe, addItem, updateItem, removeItem } = useWardrobe();
  const [creations, setCreations] = useState<OutfitRecord[]>(() => {
    // Generate some mock history for the review cards
    const now = new Date();
    const mockHistory: OutfitRecord[] = [];
    
    // Some for this month
    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 2);
      mockHistory.push({
        items: MOCK_ITEMS.slice(i, i + 3),
        date: d.toISOString()
      });
    }
    
    // Some for last month
    for (let i = 0; i < 8; i++) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - 1);
      d.setDate(i * 3 + 1);
      mockHistory.push({
        items: MOCK_ITEMS.slice(i % 5, (i % 5) + 2),
        date: d.toISOString()
      });
    }

    return mockHistory;
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [deleteConfig, setDeleteConfig] = useState<{ onConfirm: () => void } | null>(null);
  
  const [trash, setTrash] = useState<any[]>(() => {
    const saved = localStorage.getItem('anywear_trash');
    return saved ? JSON.parse(saved) : [];
  });

  // Ensure dark mode is strictly disabled by removing any lingering classes
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('anywear_trash', JSON.stringify(trash));
    } catch (e) {
      console.warn("[AWR] Trash storage quota exceeded. Cleaning up old items...", e);
      // If saving fails even after limiting size, we just don't persist it.
    }
  }, [trash]);

  const moveToTrash = (item: any, type: 'item' | 'post' | 'creation') => {
    const trashItem = {
      id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      originalData: item,
      type,
      deletedAt: new Date().toISOString()
    };
    setTrash(prev => {
      // Keep only recent 20 items to prevent storage quota issues
      const newTrash = [trashItem, ...prev];
      return newTrash.slice(0, 20);
    });
    setAlertMessage(t('alert_moved_to_trash'));
  };
  
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // If we have data, use it. If it's an empty array, it's a valid empty state.
          setPosts(data);
        } else {
          // Only fallback if the response isn't an array (e.g. an error object from server)
          console.log("Using MOCK_POSTS fallback due to invalid response from API:", data);
          setPosts(MOCK_POSTS);
        }
      })
      .catch(err => {
        console.error("Error fetching posts, using fallback:", err);
        setPosts(MOCK_POSTS);
      });

    // Also fetch saved post IDs
    fetch('/api/saved-posts')
      .then(res => res.json())
      .then(ids => {
        if (Array.isArray(ids)) setSavedPostIds(ids);
      })
      .catch(err => console.error("Error fetching saved posts:", err));
  }, []);
  const [mainResetTrigger, setMainResetTrigger] = useState(0);
  const [isApiDenied, setIsApiDenied] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [buyingList, setBuyingList] = useState<ShopItem[]>([]);
  const [isBuyingListOpen, setIsBuyingListOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [scrapbookConfig, setScrapbookConfig] = useState<{ index: number, mode: 'view' | 'shop' }>({ index: 0, mode: 'view' });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const triggerDeleteConfirmation = (onConfirm: () => void) => {
    setDeleteConfig({ onConfirm });
  };

  const handleAddToBuyingList = (item: ShopItem) => {
    if (buyingList.length >= 3) {
      setAlertMessage("您的觀察列表已滿3個的上限");
      return;
    }
    if (buyingList.find(i => i.id === item.id)) {
      setAlertMessage("此單品已在您的觀察列表中");
      return;
    }
    setBuyingList([...buyingList, item]);
  };

  const handleRemoveFromBuyingList = (id: string) => {
    setBuyingList(buyingList.filter(i => i.id !== id));
  };

  const handleGlobalAiError = (err: any, silent: boolean = false) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[AWR] Global AI Error:", msg);
    
    if (msg.startsWith("PERMISSION_DENIED")) {
      setIsApiDenied(true);
    } else if (msg.startsWith("RATE_LIMIT")) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 30000);
    }
    
    if (!silent) setAlertMessage(msg);
  };

  const handleAddItem = (item: ClothingItem) => {
    addItem(item);
  };

  const handleAddToCloset = (item: ShopItem) => {
    handleAddItem({
      id: `insp-shop-${item.id}-${Date.now()}`,
      name: item.name,
      category: classifyShopItem(item.name),
      imageUrl: item.imageUrl,
      tags: ['shop-inspiration'],
      source: 'inspiration'
    });
    setAlertMessage("已加入個人衣櫃");
  };

  const handleUpdateItem = (id: string, updates: Partial<ClothingItem>) => {
    updateItem(id, updates);
  };

  const handleRemoveItem = (id: string | null) => {
    if (!id) return;
    const item = wardrobe.find(i => i.id === id);
    if (item) {
      console.log(`[AWR] Removing item: ${id}`);
      moveToTrash(item, 'item');
      removeItem(id);
    }
  };

  const handleSaveInspiration = async (post: Post) => {
    // 1. Save as clothing item (scrapbook usage)
    handleAddItem({
      id: `insp-scrap-${post.id}`,
      name: `Inspiration from ${post.author.name}`,
      category: 'Tops',
      imageUrl: post.imageUrl,
      tags: post.tags,
      source: 'inspiration'
    });

    // 2. Persistent save as post for Inspiration tab
    if (!savedPostIds.includes(post.id)) {
      setSavedPostIds(prev => [...prev, post.id]);
      try {
        await fetch(`/api/saved-posts/${post.id}`, { method: 'POST' });
      } catch (err) {
        console.error("Failed to save post:", err);
      }
    }
  };

  const handleUnsavePost = async (id: string) => {
    setSavedPostIds(prev => prev.filter(pid => pid !== id));
    try {
      await fetch(`/api/saved-posts/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error("Failed to unsave post:", err);
    }
  };

  const handleUploadTodayPhoto = (imageUrl: string) => {
    const newItem: ClothingItem = {
      id: `daily-${Date.now()}`,
      name: 'Daily Outfit',
      imageUrl,
      category: 'Outfits',
      tags: [],
      source: 'owned'
    };
    setCreations(prev => [{ items: [newItem], date: new Date().toISOString() }, ...prev]);
  };

  const handleSaveCreation = (items: ClothingItem[]) => {
    setCreations(prev => [{ items, date: new Date().toISOString() }, ...prev]);
  };

  const handlePublish = async (items: ClothingItem[]) => {
    if (items.length === 0) return;
    
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar
      },
      imageUrl: items[0].imageUrl, // Use the first item's image as a placeholder for the collage
      likes: 0,
      description: `My new creation with ${items.length} items!`,
      tags: items.map(i => i.category).filter((v, i, a) => a.indexOf(v) === i)
    };
    
    // Optimistic Update
    setPosts(prev => [newPost, ...prev]);
    setActiveTab('main');
    setAlertMessage(t('alert_published'));

    // Persistent Save
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
    } catch (err) {
      console.error("Failed to publish creation:", err);
    }
  };

  const handleUploadPost = async (postData: Omit<Post, 'id' | 'author' | 'likes'>) => {
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar
      },
      likes: 0,
      ...postData
    };
    
    // Optimistic UI update
    setPosts(prev => [newPost, ...prev]);
    
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (!res.ok) {
        throw new Error('Failed to upload post');
      }
      setAlertMessage(t('alert_uploaded'));
    } catch (err) {
      console.error(err);
      // We could revert the state if the upload failed
    }
  };

  const handleRemoveCreation = (index: number) => {
    const creation = creations[index];
    if (creation) {
      moveToTrash(creation, 'creation');
      setCreations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleRemovePost = (id: string) => {
    setPosts(prev => {
      const targetPost = prev.find(p => p.id === id);
      if (targetPost) {
        moveToTrash(targetPost, 'post');
      }
      return prev.filter(p => !!p && p.id !== id);
    });
  };

  const handleResetMain = () => {
    setMainResetTrigger(prev => prev + 1);
  };

  const handleRestoreFromTrash = (id: string) => {
    const trashItem = trash.find(t => t.id === id);
    if (!trashItem) return;

    if (trashItem.type === 'item') {
      addItem(trashItem.originalData);
    } else if (trashItem.type === 'post') {
      setPosts(prev => [trashItem.originalData, ...prev]);
    } else if (trashItem.type === 'creation') {
      setCreations(prev => [trashItem.originalData, ...prev]);
    }

    setTrash(prev => prev.filter(t => t.id !== id));
    setAlertMessage(t('alert_restored'));
  };

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center items-center font-sans transition-colors duration-500">
      <div className="w-full max-w-md sm:h-[850px] h-screen text-black bg-white selection:bg-black selection:text-white sm:rounded-[40px] shadow-2xl overflow-hidden relative transform-gpu translate-x-0 transition-colors duration-500">
        <AnimatePresence>
          {!hasSetLanguage && <WelcomeScreen />}
        </AnimatePresence>

        <AnimatePresence>
          {hasSetLanguage && !isAuthCompleted && <AuthScreen onComplete={handleAuthComplete} />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-full h-full bg-white dark:bg-[#121212] relative"
          >
          {activeTab === 'main' && (
            <ErrorBoundary>
              <MainView 
                posts={posts}
                onEnterScrapbook={(post) => {
                  const idx = posts.findIndex(p => p.id === post.id);
                  setScrapbookConfig({ index: idx >= 0 ? idx : 0, mode: 'view' });
                  setActiveTab('scrapbook');
                }} 
                onShopClick={(post) => {
                  const idx = posts.findIndex(p => p.id === post.id);
                  setScrapbookConfig({ index: idx >= 0 ? idx : 0, mode: 'shop' });
                  setActiveTab('scrapbook');
                }}
                onUploadPost={handleUploadPost}
                resetTrigger={mainResetTrigger}
                onSaveInspiration={handleSaveInspiration}
                buyingList={buyingList}
                onOpenBuyingList={() => setIsBuyingListOpen(true)}
              />
            </ErrorBoundary>
          )}
          {activeTab === 'scrapbook' && (
            <ErrorBoundary>
              <ScrapbookView 
                posts={posts} 
                initialIndex={scrapbookConfig.index}
                initialMode={scrapbookConfig.mode}
                onExit={() => setActiveTab('main')} 
                onSaveInspiration={handleSaveInspiration}
                onAddToBuyingList={handleAddToBuyingList}
                onAddToCloset={handleAddToCloset}
              />
            </ErrorBoundary>
          )}
          {activeTab === 'wardrobe' && (
            <ErrorBoundary>
              <WardrobeView 
                items={wardrobe} 
                onAddItem={handleAddItem} 
                onUpdateItem={handleUpdateItem} 
                onRemoveItem={handleRemoveItem} 
                isRateLimited={isRateLimited} 
              />
            </ErrorBoundary>
          )}
          {activeTab === 'workshop' && (
            <ErrorBoundary>
              <WorkshopView 
                items={wardrobe} 
                onSaveCreation={handleSaveCreation} 
                onPublish={handlePublish} 
                onRemoveItem={handleRemoveItem}
                isRateLimited={isRateLimited} 
                onAiError={handleGlobalAiError} 
                onShowHealthReminder={() => setShowHealthReminder(true)}
              />
            </ErrorBoundary>
          )}
          {activeTab === 'profile' && (
            <ErrorBoundary>
              <ProfileView 
                wardrobe={wardrobe} 
                creations={creations} 
                posts={posts} 
                userProfile={userProfile}
                onEditProfile={() => setIsEditProfileOpen(true)}
                onUpdateItem={handleUpdateItem} 
                onRemoveItem={handleRemoveItem}
                onRemoveCreation={handleRemoveCreation}
                onRemovePost={handleRemovePost}
                onOpenCalendar={() => setIsCalendarOpen(true)}
                onUploadTodayPhoto={handleUploadTodayPhoto}
                allPosts={posts}
                isRateLimited={isRateLimited}
                isApiDenied={isApiDenied}
                onAiError={handleGlobalAiError}
                trash={trash}
                setTrash={setTrash}
                onRestoreFromTrash={handleRestoreFromTrash}
                savedPostIds={savedPostIds}
                onUnsavePost={handleUnsavePost}
              />
            </ErrorBoundary>
          )}
        </motion.main>
      </AnimatePresence>

      <AnimatePresence>
        {isCalendarOpen && (
          <CalendarView creations={creations} onClose={() => setIsCalendarOpen(false)} />
        )}
      </AnimatePresence>

      {activeTab !== 'scrapbook' && (
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onResetMain={handleResetMain}
        />
      )}

      <AnimatePresence>
        {isBuyingListOpen && (
          <BuyingListView 
            items={buyingList} 
            onClose={() => setIsBuyingListOpen(false)} 
            onRemove={handleRemoveFromBuyingList}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHealthReminder && (
          <HealthReminder onClose={() => setShowHealthReminder(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertMessage && (
          <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
        )}
      </AnimatePresence>

      <FeatureGuide isAuthCompleted={isAuthCompleted} />

      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={userProfile}
        onSave={setUserProfile}
      />

      <AnimatePresence>
        {deleteConfig && (
          <DeleteConfirmModal 
            onConfirm={deleteConfig.onConfirm} 
            onClose={() => setDeleteConfig(null)} 
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
