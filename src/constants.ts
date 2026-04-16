import { ClothingItem, Post } from './types';

export const MOCK_ITEMS: ClothingItem[] = [
  { id: '1', name: 'Wool-Like Blouson (Grey)', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', tags: ['outer', 'warm'], createdAt: '2026-03-01T00:00:00Z', source: 'owned' },
  { id: '2', name: 'Wool-Like Blouson (Black)', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80', tags: ['outer', 'classic'], createdAt: '2026-03-02T00:00:00Z', source: 'owned' },
  { id: '3', name: 'Wool-Like Blouson (Brown)', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=80', tags: ['outer', 'earthy'], createdAt: '2026-03-03T00:00:00Z', source: 'owned' },
  { id: '5', name: 'Oxford Shirt', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', tags: ['basic'], createdAt: '2026-03-04T00:00:00Z', source: 'owned' },
  { id: '6', name: 'Wide Cargo Pants', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80', tags: ['cargo', 'wide'], createdAt: '2026-03-05T00:00:00Z', source: 'owned' },
  { id: '7', name: 'Straight Jeans', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80', tags: ['denim'], createdAt: '2026-03-06T00:00:00Z', source: 'owned' },
  { id: '8', name: 'Canvas Sneakers', category: 'Shoes', imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80', tags: ['shoes'], createdAt: '2026-03-07T00:00:00Z', source: 'owned' },
  { id: '9', name: 'Knit Beanie', category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&w=600&q=80', tags: ['winter'], createdAt: '2026-03-08T00:00:00Z', source: 'owned' },
  { id: '10', name: 'Leather Belt', category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80', tags: ['leather'], createdAt: '2026-03-09T00:00:00Z', source: 'owned' },
  { id: '12', name: 'Lounge Pants', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1580331451062-99ff652288d7?auto=format&fit=crop&w=600&q=80', tags: ['casual', 'comfort'], createdAt: '2026-03-10T00:00:00Z', source: 'owned' },
];

export const STICKER_ITEMS: ClothingItem[] = [
  { id: 's-long-pants', name: 'Wide-Leg Jeans', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', tags: ['sticker', 'pants', 'denim', 'wide-leg'], isCleaned: true, source: 'inspiration' },
  { id: 's-shorts', name: 'Summer Shorts', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80', tags: ['sticker', 'shorts'], isCleaned: true, source: 'inspiration' },
  { id: 's-dress', name: 'Summer Dress', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1618932260643-eee4a3f7d745?auto=format&fit=crop&w=600&q=80', tags: ['sticker', 'dress'], isCleaned: true, source: 'inspiration' },
  { id: 's-tshirt-1', name: 'Olive Green Tee', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=600&q=80', tags: ['sticker', 'tshirt', 'minimalist'], isCleaned: true, source: 'inspiration' },
  { id: 's-tshirt-2', name: 'Black Tee', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', tags: ['sticker', 'tshirt'], isCleaned: true, source: 'inspiration' },
  { id: 's-jacket', name: 'Leather Jacket', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80', tags: ['sticker', 'jacket'], isCleaned: true, source: 'inspiration' },
  { id: 's1', name: 'Plaid Skirt', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80', tags: ['sticker', 'plaid', 'skirt'], source: 'inspiration' },
  { id: 's2', name: 'Chino Pants', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1473963456451-3344a88c4df2?auto=format&fit=crop&w=600&q=80', tags: ['sticker'], source: 'inspiration' },
  { id: 's3', name: 'Long Sleeve', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80', tags: ['sticker'], source: 'inspiration' },
  { id: 's4', name: 'Denim Shorts', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=600&q=80', tags: ['sticker'], source: 'inspiration' },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p2',
    author: { name: 'Wei-Chun', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80',
    likes: 128,
    description: 'Streetwear essentials in Tokyo.',
    tags: ['Streetwear'],
    shopItems: [
      { id: 'wc-1', name: 'Oversized Hoodie', price: 2100, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80' },
      { id: 'wc-2', name: 'Cargo Pants', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'p4',
    author: { name: 'Yui', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    likes: 85,
    description: 'Casual cafe afternoon.',
    tags: ['Casual'],
    shopItems: [
      { id: 'yui-1', name: 'White Pocket Oversized Tee', price: 1000, imageUrl: '/shop/tshirt.png' },
      { id: 'yui-2', name: 'Grey Straight Jeans', price: 1200, imageUrl: '/shop/pants.png' },
      { id: 'yui-3', name: 'High-Top Canvas Shoes', price: 1500, imageUrl: '/shop/shoes.png' }
    ]
  },
  {
    id: 'p6',
    author: { name: 'Min-Jun', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1520975954732-35dd2229969e?auto=format&fit=crop&w=1000&q=80',
    likes: 92,
    description: 'Clean minimalist aesthetics.',
    tags: ['Minimalist'],
    shopItems: [
      { id: 'mj-1', name: 'White Essential Tee', price: 490, imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=600&q=80' },
      { id: 'mj-2', name: 'Slim Trousers', price: 1490, imageUrl: 'https://images.unsplash.com/photo-1473963456451-3344a88c4df2?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'p7',
    author: { name: 'Hana', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775ff?auto=format&fit=crop&w=1000&q=80',
    likes: 115,
    description: 'Sporty look for the weekend.',
    tags: ['Sporty'],
    shopItems: [
      { id: 'hana-1', name: 'Track Jacket', price: 1890, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80' },
      { id: 'hana-2', name: 'Jogger Pants', price: 1290, imageUrl: 'https://images.unsplash.com/photo-1580331451062-99ff652288d7?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'p8',
    author: { name: 'Haruto', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1000&q=80',
    likes: 74,
    description: 'Autumn layering in NYC.',
    tags: ['Casual'],
    shopItems: [
      { id: 'haru-1', name: 'Wool Blouson', price: 3990, imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=80' },
      { id: 'haru-2', name: 'Oxford Shirt', price: 990, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80' },
      { id: 'haru-3', name: 'Leather Belt', price: 690, imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'p10',
    author: { name: 'Ji-Young', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1522333323533-443573bb3310?auto=format&fit=crop&w=1000&q=80',
    likes: 210,
    description: 'Neon forest explorer.',
    tags: ['Urban'],
    shopItems: [
      { id: 'jy-1', name: 'Wide-Leg Jeans', price: 1590, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80' },
      { id: 'jy-2', name: 'Knit Beanie', price: 490, imageUrl: 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'p11',
    author: { name: 'Kenji', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1618331812910-296eaefa7d21?auto=format&fit=crop&w=1000&q=80',
    likes: 67,
    description: 'Refined business casual.',
    tags: ['Casual'],
    shopItems: [
      { id: 'kj-1', name: 'Oxford Shirt', price: 990, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80' },
      { id: 'kj-2', name: 'Slim Trousers', price: 1490, imageUrl: 'https://images.unsplash.com/photo-1473963456451-3344a88c4df2?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'p12',
    author: { name: 'Mei', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7b?auto=format&fit=crop&w=1000&q=80',
    likes: 142,
    description: 'Aesthetic soft girl look.',
    tags: ['Aesthetic'],
    shopItems: [
      { id: 'mei-1', name: 'Summer Dress', price: 1290, imageUrl: 'https://images.unsplash.com/photo-1618932260643-eee4a3f7d745?auto=format&fit=crop&w=600&q=80' },
      { id: 'mei-2', name: 'Canvas Sneakers', price: 1890, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'p14',
    author: { name: 'Takumi', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=80',
    likes: 98,
    description: 'Classic denim double-up.',
    tags: ['Denim'],
    shopItems: [
      { id: 'tk-1', name: 'Straight Jeans', price: 1590, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80' },
      { id: 'tk-2', name: 'Denim Jacket', price: 2490, imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'nh2wk4klk',
    author: { name: 'Lisa', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
    likes: 128,
    description: '白色長袖上衣搭配灰色長褲與黃色高筒帆布鞋。',
    tags: ['Relaxed', 'Casual'],
    shopItems: [
      { id: 'item-nh2wk4klk-0-pants', name: 'Lisa 修閒造型長褲', price: 1150, imageUrl: '/shop/pants.png' },
      { id: 'item-nh2wk4klk-1-tshirt', name: 'Lisa 質感長袖上衣', price: 1080, imageUrl: '/shop/tshirt.png' },
      { id: 'item-nh2wk4klk-2-converse', name: '深黃色色高筒Converse', price: 1200, imageUrl: '/shop/yellow_converse_lisa.png' }
    ]
  },
  {
    id: 'rpda0i1iz',
    author: { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    likes: 92,
    description: '深灰色文字印花 T 恤。',
    tags: ['Streetwear', 'Casual'],
    shopItems: [
      { id: 'item-rpda0i1iz-0-necklace', name: '純銀項鍊', price: 1200, imageUrl: '/shop/silver_necklace_emma.png' },
      { id: 'item-rpda0i1iz-1-shoes', name: 'Adidas平底鞋', price: 1200, imageUrl: '/shop/adidas_shoes_emma.png' },
      { id: 'item-rpda0i1iz-2-pants', name: '墨綠工裝褲', price: 900, imageUrl: '/shop/green_cargo_pants_emma.png' },
      { id: 'item-rpda0i1iz-3-tshirt', name: '黑色T-Shirt', price: 700, imageUrl: '/shop/black_tshirt_emma.png' }
    ]
  },
  {
    id: 'i196sh3gj',
    author: { name: 'Alie', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80',
    likes: 142,
    description: '深灰色衛衣搭配刷破牛仔褲與圓框墨鏡。',
    tags: ['Street', 'Casual'],
    shopItems: [
      { id: 'item-i196sh3gj-0-sunglasses', name: '太陽眼鏡', price: 600, imageUrl: '/shop/sunglasses_alie.png' },
      { id: 'item-i196sh3gj-1-sweatshirt', name: '黑色寬版長袖', price: 500, imageUrl: '/shop/black_sweatshirt_alie.png' },
      { id: 'item-i196sh3gj-2-shoes', name: 'Nike白色平底鞋', price: 1200, imageUrl: '/shop/nike_shoes_alie.png' },
      { id: 'item-i196sh3gj-3-necklace', name: '純銀項鍊', price: 1200, imageUrl: '/shop/silver_necklace_alie.png' }
    ]
  },
  {
    id: 'x7wi2e7ik',
    author: { name: 'Allen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80',
    likes: 210,
    description: '白色長袖襯衫內搭同色 T 恤，配卡其色休閒短褲。',
    tags: ['Beach', 'Casual'],
    shopItems: [
      { id: 'item-x7wi2e7ik-0-watch', name: '天梭錶', price: 15000, imageUrl: '/shop/tissot_watch_allen.png' },
      { id: 'item-x7wi2e7ik-1-shirt', name: '白色襯衫', price: 500, imageUrl: '/shop/white_shirt_allen.png' },
      { id: 'item-x7wi2e7ik-2-shorts', name: '墨綠色短褲', price: 400, imageUrl: '/shop/green_shorts_allen.png' }
    ]
  },
  {
    id: 'q8eccf6jw',
    author: { name: 'Jay', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    imageUrl: 'https://images.unsplash.com/photo-1516822211625-780c74f33bce?auto=format&fit=crop&w=1000&q=80',
    likes: 156,
    description: '白色長袖襯衫外搭深灰色針織背心，配黑色寬褲與卡其色漁夫帽。',
    tags: ['Modern', 'Minimalist'],
    shopItems: [
      { id: 'item-q8eccf6jw-0-vest', name: '灰色針織衫', price: 900, imageUrl: '/shop/grey_knit_vest_jay.png' },
      { id: 'item-q8eccf6jw-1-hat', name: '漁夫帽', price: 400, imageUrl: '/shop/bucket_hat_jay.png' },
      { id: 'item-q8eccf6jw-2-pants', name: '黑色長褲', price: 900, imageUrl: '/shop/black_pants_jay.png' }
    ]
  },
  {
    id: 'pm1rehl72',
    author: { name: 'Gwen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    imageUrl: '/demo_post_image.jpg',
    likes: 195,
    description: '白色短袖襯衫配深藍百褶裙，繫藍色格子領結。',
    tags: ['Aesthetic', 'Casual'],
    shopItems: [
      { id: 'item-pm1rehl72-0-skirt', name: '黑色長裙', price: 700, imageUrl: '/shop/black_skirt_gwen.png' },
      { id: 'item-pm1rehl72-1-tie', name: '領帶', price: 500, imageUrl: '/shop/tie_gwen.png' },
      { id: 'item-pm1rehl72-2-shirt', name: '白色短袖襯衫', price: 700, imageUrl: '/shop/white_shirt_gwen.png' }
    ]
  },
  {
    id: '3x5bxvgls',
    author: { name: 'Ivy', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
    imageUrl: '/restore_green_sweater.jpg', 
    likes: 128,
    description: '橘褐色寬鬆針織衫搭配黑色合身長褲。',
    tags: ['Casual', 'Chic'],
    shopItems: [
      { id: 'item-3x5bxvgls-0-knit', name: '針織衫', price: 1000, imageUrl: '/shop/knit_sweater.png' },
      { id: 'item-3x5bxvgls-1-pants', name: '黑色直筒褲', price: 700, imageUrl: '/shop/black_pants.png' }
    ]
  },
];
