import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

const translations: Translations = {
  // Bottom Nav
  nav_main: { zh: '主頁', en: 'Main' },
  nav_create: { zh: '創作', en: 'Create' },
  nav_closet: { zh: '衣櫥', en: 'Closet' },
  nav_me: { zh: '我的', en: 'Me' },
  
  // Workshop / Create
  workshop_new: { zh: '新設計', en: 'New Design' },
  workshop_ai_suggest: { zh: 'AI 建議', en: 'AI Suggest' },
  workshop_ai_assistant: { zh: 'AI 助手', en: 'AI Assistant' },
  workshop_mannequin: { zh: '3D 模特兒', en: '3D Mannequin' },
  workshop_share: { zh: '分享', en: 'Share' },
  workshop_body_editor: { zh: '身材編輯器', en: 'Body Editor' },
  workshop_body_controls_title: { zh: '模特兒身材調整', en: 'Mannequin Body Adjustment' },
  workshop_mode_3d: { zh: '3D 模特兒', en: '3D Mannequin' },
  workshop_mode_2d: { zh: '2D 模特兒', en: '2D Mannequin' },
  workshop_male: { zh: '男性', en: 'Male' },
  workshop_female: { zh: '女性', en: 'Female' },
  workshop_height: { zh: '身高', en: 'Height' },
  workshop_chest: { zh: '胸圍', en: 'Chest' },
  workshop_waist: { zh: '腰圍', en: 'Waist' },
  workshop_hips: { zh: '臀圍', en: 'Hips' },
  workshop_weight_label: { zh: '胖瘦程度', en: 'Body Weight' },
  workshop_reset_body: { zh: '重置身材', en: 'Reset Body' },
  workshop_ai_styling: { zh: 'AI 處理中', en: 'AI Styling' },
  workshop_wait: { zh: '請稍候...', en: 'Wait...' },
  
  // Share Modal
  share_title: { zh: '分享創作', en: 'Share Creation' },
  share_publish: { zh: '發布到動態', en: 'Publish to Feed' },
  share_copy: { zh: '複製連結', en: 'Copy Link' },
  share_more: { zh: '更多', en: 'More' },
  share_favorites: { zh: '加入收藏', en: 'Save to Favorites' },
  share_download: { zh: '下載圖片', en: 'Download Image' },
  share_files: { zh: '儲存至檔案', en: 'Save to Files' },
  share_ai_assistant: { zh: '分享給 AI 風格助手', en: 'Share to AI Assistant' },
  analyzing_outfit: { zh: 'AI 正努力為您提供穿搭建議...', en: 'AI is analyzing your outfit...' },
  
  // Closet
  closet_title: { zh: '個人衣櫃', en: 'My Wardrobe' },
  closet_search: { zh: '搜尋單品...', en: 'Search items...' },
  closet_add: { zh: '新增單品', en: 'Add Item' },
  closet_all: { zh: '全部', en: 'All' },
  closet_tops: { zh: '上衣', en: 'Tops' },
  closet_bottoms: { zh: '下著', en: 'Bottoms' },
  closet_shoes: { zh: '鞋類', en: 'Shoes' },
  closet_accessories: { zh: '飾品', en: 'Accessories' },

  
  // Profile / Me
  profile_title: { zh: '個人檔案', en: 'Profile' },
  profile_posts: { zh: '貼文', en: 'Posts' },
  profile_saved: { zh: '已儲存', en: 'Saved' },
  profile_followers: { zh: '粉絲', en: 'Followers' },
  profile_following: { zh: '追蹤中', en: 'Following' },
  profile_edit: { zh: '編輯個人檔案', en: 'Edit Profile' },
  profile_tab_items: { zh: '單品', en: 'ITEMS' },
  profile_tab_outfits: { zh: '穿搭', en: 'OUTFITS' },
  profile_tab_posts: { zh: '靈感', en: 'POSTS' },
  profile_tab_my_posts: { zh: '我的貼文', en: 'MY POSTS' },
  profile_dna_title: { zh: 'AI 風格 DNA', en: 'AI Style DNA' },
  profile_dna_desc: { zh: '分析你的衣櫥，發掘你獨特的時尚身份。', en: 'Analyze your wardrobe to discover your unique fashion identity.' },
  profile_dna_run: { zh: '開始分析', en: 'Run Analysis' },
  profile_dna_analyzing: { zh: '分析中...', en: 'Analyzing...' },
  profile_dna_insights: { zh: 'AI 造型師洞察', en: 'AI Stylist Insights' },
  
  profile_ai_status: { zh: 'AI 造型師狀態', en: 'AI Stylist' },
  profile_ai_offline: { zh: '離線 (缺少金鑰)', en: 'Offline (Key Missing)' },
  profile_ai_denied: { zh: '存取被拒', en: 'Permission Denied' },
  profile_ai_cooldown: { zh: '冷卻中', en: 'Cooling Down' },
  profile_ai_online: { zh: '連線中', en: 'Online' },
  
  profile_diag_title: { zh: '診斷工具', en: 'Diagnostic Tool' },
  profile_diag_run: { zh: '執行測試以驗證 AI 連線。', en: 'Run a test to verify your AI connection.' },
  profile_diag_testing: { zh: '正在測試連線...', en: 'Testing connection...' },
  profile_diag_success: { zh: '連線成功', en: 'Connection Success' },
  profile_diag_failed: { zh: '連線失敗', en: 'Connection Failed' },
  profile_diag_free_mode: { zh: '使用預設金鑰 (免費模式)', en: 'Use App Default Key (Free Mode)' },
  profile_diag_free_active: { zh: '免費模式已啟用', en: 'Free Mode Active' },
  profile_diag_free_desc: { zh: '正在繞過自定義 API 金鑰。', en: 'Bypassing custom API key.' },
  profile_diag_restore: { zh: '還原我的金鑰', en: 'Restore My Key' },
  profile_diag_error_details: { zh: '詳細錯誤資訊：', en: 'Exact Error Details:' },
  profile_diag_tip: { zh: '提示：如果你看到「Requested entity was not found」，通常表示你的 Google Cloud 專案中未啟用 Generative AI API。', en: 'Tip: If you see "Requested entity was not found", it usually means the Generative AI API is not enabled in your Google Cloud project.' },
  profile_diag_stuck: { zh: '仍然無法連線？嘗試繞過你的金鑰：', en: 'Still stuck? Try bypassing your key:' },
  profile_diag_denied_msg: { zh: '存取被拒：你的 API 金鑰沒有 Gemini 的存取權限。請確保你的 Google Cloud 專案中已啟用「Generative AI API」。', en: 'Permission Denied: Your API key doesn\'t have access to Gemini. Please ensure "Generative AI API" is enabled in your Google Cloud project.' },
  
  profile_view_btn: { zh: '查看', en: 'VIEW' },
  profile_edit_title: { zh: '編輯個人檔案', en: 'Edit Profile' },
  profile_name_label: { zh: '用戶名稱', en: 'Name' },
  profile_handle_label: { zh: '用戶帳號', en: 'Username' },
  profile_bio_label: { zh: '個人簡介', en: 'Bio' },
  profile_save_btn: { zh: '儲存變更', en: 'Save Changes' },
  profile_avatar_change: { zh: '更換頭像', en: 'Change Avatar' },
  profile_default_avatar_btn: { zh: '使用預設頭像', en: 'Use Default Avatar' },
  
  alert_published: { zh: '已發布到主頁面！', en: 'Published to Main Feed!' },
  alert_uploaded: { zh: '貼文上傳成功！', en: 'Post uploaded successfully!' },

  // Health Reminder
  health_title: { zh: '健康使用提醒', en: 'Health Usage Reminder' },
  health_message: { zh: '請注意不要過度依賴 AI 助理。AI 生成的建議僅供參考，過度依賴可能對身心靈健康造成潛在風險。請保持獨立思考，並在必要時尋求專業建議。', en: 'Please be careful not to over-rely on the AI assistant. AI-generated suggestions are for reference only. Over-reliance may pose potential risks to physical and mental health. Please maintain independent thinking and seek professional advice when necessary.' },
  health_button: { zh: '我知道了', en: 'I Understand' },

  // AI Chat
  chat_title: { zh: 'AI 風格助手', en: 'AI Style Assistant' },
  chat_status: { zh: '在線並準備就緒', en: 'Online & Ready' },
  chat_placeholder: { zh: '詢問風格建議...', en: 'Ask for style advice...' },
  chat_initial: { zh: '嗨！我是你的 AI 風格助手。今天有什麼我可以幫你的嗎？', en: 'Hi! I\'m your AI Style Assistant. How can I help you with your outfit today?' },

  // Main View
  main_search: { zh: '搜尋風格...', en: 'Search style...' },
  main_upload_title: { zh: '分享你的風格', en: 'Share Your Style' },
  main_upload_photo: { zh: '上傳照片', en: 'Upload Photo' },
  main_upload_change: { zh: '更換照片', en: 'Change Photo' },
  main_upload_desc_label: { zh: '描述', en: 'Description' },
  main_upload_desc_placeholder: { zh: '今天穿什麼？', en: 'What are you wearing today?' },
  main_upload_tags_label: { zh: '標籤 (逗號分隔)', en: 'Tags (comma separated)' },
  main_upload_tags_placeholder: { zh: '休閒, 街頭, OOTD', en: 'Casual, Streetwear, OOTD' },
  main_upload_cancel: { zh: '取消', en: 'Cancel' },
  main_upload_submit: { zh: '立即發布', en: 'Post Now' },
  common_cancel: { zh: '取消', en: 'Cancel' },
  common_select: { zh: '選擇', en: 'Select' },
  common_confirm: { zh: '確認', en: 'Confirm' },

  // Scrapbook
  scrapbook_save: { zh: '儲存', en: 'SAVE' },
  scrapbook_shop: { zh: '購物', en: 'SHOP' },

  // Buying List
  buying_list_title: { zh: '商品比價', en: 'Price Comparison' },
  buying_list_count: { zh: '已收藏', en: 'Saved' },
  buying_list_empty: { zh: '您可在各個欣賞的貼文創作中點選購物功能，將單品加入此清單做比價、觀察或單純欣賞', en: 'You can add items from posts to this list for comparison, observation, or appreciation.' },
  buying_list_checkout: { zh: '前往購買', en: 'Checkout All' },

  // Shop the Look
  shop_look_title: { zh: '單品清單', en: 'Shop the Look' },
  shop_look_items: { zh: '個單品', en: 'Items' },
  shop_no_items: { zh: '此貼文尚未標記單品', en: 'No items found in this photo.' },

  // Tags & Sources
  tag_casual: { zh: '休閒', en: 'Casual' },
  tag_western: { zh: '美式', en: 'Western' },
  tag_bombing: { zh: '街頭', en: 'Bombing' },
  tag_streetwear: { zh: '街頭穿搭', en: 'Streetwear' },
  tag_ootd: { zh: '今日穿搭', en: 'OOTD' },
  tag_vintage: { zh: '復古', en: 'Vintage' },
  tag_minimalist: { zh: '極簡', en: 'Minimalist' },
  tag_sporty: { zh: '運動', en: 'Sporty' },
  
  source_owned: { zh: '自有', en: 'OWNED' },
  source_inspiration: { zh: '靈感', en: 'INSP' },

  // Feature Guide
  guide_next: { zh: '下一步', en: 'Next' },
  guide_skip: { zh: '跳過', en: 'Skip' },
  guide_finish: { zh: '完成', en: 'Finish' },
  
  guide_main_title: { zh: '探索靈感', en: 'Explore Inspiration' },
  guide_main_desc: { zh: '在這裡你可以看到其他人的穿搭靈感，點擊圖片可以進入沈浸式查看。', en: 'Here you can see outfit inspirations from others. Click on an image for an immersive view.' },
  
  guide_create_title: { zh: '創意工作坊', en: 'Creative Workshop' },
  guide_create_desc: { zh: '使用 3D 模特兒和你的衣服來搭配出完美的穿搭。你可以自由調整模特兒的身材。', en: 'Use the 3D mannequin and your clothes to create the perfect outfit. You can freely adjust the mannequin\'s body.' },
  
  guide_closet_title: { zh: '數位衣櫥', en: 'Digital Closet' },
  guide_closet_desc: { zh: '管理你的所有單品。你可以上傳自己的衣服，AI 會自動幫你處理背景。', en: 'Manage all your items. You can upload your own clothes, and AI will automatically process the background.' },
  
  guide_me_title: { zh: '個人風格', en: 'Personal Style' },
  guide_me_desc: { zh: '查看你的穿搭 DNA 分析，管理你的貼文和已儲存的靈感。', en: 'Check your Style DNA analysis, manage your posts, and saved inspirations.' },

  // Weekly Report
  weekly_report_title: { zh: '週報', en: 'Weekly Report' },
  weekly_week_label: { zh: '第', en: 'Week' },
  weekly_week_suffix: { zh: '週', en: '' },
  weekly_outfits: { zh: '本週穿搭', en: 'Weekly Outfits' },
  weekly_no_outfits: { zh: '本週暫無穿搭紀錄', en: 'No outfits found this week' },
  weekly_analyzing: { zh: 'AI 造型師分析中...', en: 'AI Stylist is analyzing your week...' },
  weekly_strengths: { zh: '優點', en: 'Strengths' },
  weekly_suggestions: { zh: '建議', en: 'Suggestions' },
  weekly_quote: { zh: '每週金句', en: 'Weekly Saying' },
  weekly_close: { zh: '關閉報告', en: 'Close Report' },

  // Delete Confirmation
  delete_confirm_title: { zh: '刪除單品？', en: 'Remove Item?' },
  delete_confirm_desc: { zh: '此動作無法復原。您確定要從衣櫥中刪除此單品嗎？', en: 'This action cannot be undone. Are you sure you want to delete this piece from your wardrobe?' },
  delete_confirm_btn: { zh: '永久刪除', en: 'DELETE FOREVER' },
  delete_cancel_btn: { zh: '保留它', en: 'KEEP IT' },

  // Charts & Reviews
  profile_charts_title: { zh: '榜單與回顧', en: 'Charts & Reviews' },
  chart_top50_title: { zh: 'Top 50', en: 'Top 50' },
  chart_top50_subtitle: { zh: '全站最熱門穿搭榜', en: 'Global Hot Outfits' },
  chart_review_monthly: { zh: '月度穿搭回顧', en: 'Monthly Review' },
  chart_review_yearly: { zh: '年度穿搭盛典', en: 'Yearly Wrap' },
  chart_update_weekly: { zh: '每週一更新', en: 'Updated every Monday' },
  chart_update_monthly: { zh: '每月第一週更新', en: 'Updated 1st week of month' },
  review_stats_most_worn: { zh: '最常穿搭單品', en: 'Most Worn Item' },
  review_stats_fav_style: { zh: '本月偏好風格', en: 'Style Identity' },
  review_stats_total_outfits: { zh: '本月穿搭總數', en: 'Total Outfits' },
  review_ai_title: { zh: '造型師回顧與建議', en: 'Stylist Review & Suggestions' },
  review_close: { zh: '關閉回顧', en: 'Close Review' },

  // Charts Card Visual Text
  chart_label: { zh: '排行榜', en: 'Charts' },
  chart_global_ranking: { zh: '全球排行', en: 'Global Ranking' },
  chart_monthly_title: { zh: '月度\n回顧', en: 'Monthly\nReview' },
  chart_style_dna: { zh: '風格 DNA', en: 'Style DNA' },
  chart_yearly_title: { zh: '年度\n回顧', en: 'Yearly\nWrap' },
  chart_update_yearly: { zh: '年底更新', en: 'Updated at year end' },

  // Settings & Trash
  settings_title: { zh: '設定與工具', en: 'Settings' },
  settings_appearance: { zh: '外觀', en: 'Appearance' },
  settings_dark_mode: { zh: '深色模式', en: 'Dark Mode' },
  settings_light_mode: { zh: '淺色模式', en: 'Light Mode' },
  settings_dark: { zh: '深色', en: 'Dark' },
  settings_light: { zh: '淺色', en: 'Light' },
  settings_auto: { zh: '自動', en: 'Automatic' },
  settings_trash: { zh: '垃圾桶', en: 'Trash Bin' },
  
  trash_title: { zh: '垃圾桶', en: 'Trash Bin' },
  trash_empty: { zh: '垃圾桶是空的', en: 'Trash is empty' },
  trash_select: { zh: '選擇', en: 'Select' },
  trash_cancel_select: { zh: '取消', en: 'Cancel' },
  trash_delete_selected: { zh: '刪除所選', en: 'Delete Selected' },
  trash_restore_selected: { zh: '還原所選', en: 'Restore Selected' },
  trash_clear_all: { zh: '全部清空', en: 'Clear All' },
  trash_confirm_delete_all: { zh: '確定要永久刪除所選項目嗎？這項操作無法復原。', en: 'Are you sure you want to permanently delete selected items? This action cannot be undone.' },
  trash_confirm_clear_all: { zh: '確定要永久清空垃圾桶？這將刪除所有內容且無法復原。', en: 'Are you sure you want to clear the entire trash bin? All items will be permanently deleted and cannot be restored.' },
  alert_moved_to_trash: { zh: '已移至垃圾桶', en: 'Moved to Trash' },
  alert_restored: { zh: '已還原項目', en: 'Item restored' },
  alert_confirm_error: { zh: '發生錯誤，請稍後再試。', en: 'An error occurred, please try again.' },
  alert_provide_details: { zh: '請提供照片與描述。', en: 'Please provide an image and description.' },

  // Auth Screen
  auth_title: { zh: '加入 AnyWear', en: 'Join AnyWear' },
  auth_subtitle: { zh: '發掘您的專屬風格 DNA', en: 'Discover your Style DNA' },
  auth_google: { zh: '透過 Google 繼續', en: 'Continue with Google' },
  auth_guest: { zh: '以訪客身份繼續', en: 'Continue as Guest' },
  auth_terms: { zh: '繼續即表示您同意我們的服務條款與隱私權政策', en: 'By continuing, you agree to our Terms of Service and Privacy Policy.' },
  auth_mock_loading: { zh: '連線中...', en: 'Connecting...' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  hasSetLanguage: boolean;
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  completeTutorial: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('anywear_language');
    return (saved as Language) || 'zh';
  });

  const [hasSetLanguage, setHasSetLanguage] = useState(() => {
    return !!localStorage.getItem('anywear_welcome_completed');
  });

  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem('anywear_welcome_completed') === 'true' && !localStorage.getItem('anywear_tutorial_seen');
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setHasSetLanguage(true);
    localStorage.setItem('anywear_language', lang);
    localStorage.setItem('anywear_welcome_completed', 'true');
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('anywear_tutorial_seen', 'true');
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, hasSetLanguage, showTutorial, setShowTutorial, completeTutorial }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
