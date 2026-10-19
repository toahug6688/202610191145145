import { Ingredient, DietaryPreferences } from '../types';

export const INITIAL_PREFERENCES: DietaryPreferences = {
  appliances: ['microwave', 'single_gas_stove', 'rice_cooker'],
  dietaryStyle: 'high_protein',
  excludedIngredients: ['海鮮'],
  maxTimeMinutes: 15,
  servings: 1,
  prioritizeExpiring: true,
};

// Calculate relative dates for realistic freshness demonstration
const today = new Date();
const formatDate = (daysFromNow: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

export const INITIAL_INVENTORY: Ingredient[] = [
  {
    id: 'inv-1',
    name: '雞蛋',
    category: 'dairy_egg',
    quantity: 4,
    unit: '顆',
    expiryDate: formatDate(10),
    addedAt: formatDate(-2),
    notes: '常備牧場雞蛋',
    box2d: [150, 620, 360, 920],
  },
  {
    id: 'inv-2',
    name: '高麗菜',
    category: 'vegetable',
    quantity: 0.5,
    unit: '顆',
    expiryDate: formatDate(2), // expiring soon!
    addedAt: formatDate(-4),
    notes: '已切半，需盡快烹煮',
    box2d: [380, 80, 680, 420],
  },
  {
    id: 'inv-3',
    name: '板豆腐',
    category: 'dairy_egg',
    quantity: 1,
    unit: '塊',
    expiryDate: formatDate(1), // expiring tomorrow!
    addedAt: formatDate(-3),
    notes: '有機非基改板豆腐',
    box2d: [420, 500, 650, 750],
  },
  {
    id: 'inv-4',
    name: '雞胸肉',
    category: 'meat',
    quantity: 300,
    unit: '克',
    expiryDate: formatDate(3),
    addedAt: formatDate(-1),
    notes: '舒肥生鮮雞胸肉',
    box2d: [700, 100, 920, 450],
  },
  {
    id: 'inv-5',
    name: '牛番茄',
    category: 'vegetable',
    quantity: 2,
    unit: '顆',
    expiryDate: formatDate(5),
    addedAt: formatDate(-2),
    notes: '新鮮紅熟',
    box2d: [720, 520, 910, 780],
  },
  {
    id: 'inv-6',
    name: '青蔥',
    category: 'vegetable',
    quantity: 2,
    unit: '根',
    expiryDate: formatDate(2),
    addedAt: formatDate(-3),
    notes: '側門蔬菜格',
    box2d: [180, 100, 350, 320],
  },
  {
    id: 'inv-7',
    name: '全脂鮮奶',
    category: 'beverage' as any,
    quantity: 1,
    unit: '瓶',
    expiryDate: formatDate(6),
    addedAt: formatDate(-1),
    notes: '936ml 大瓶裝',
    box2d: [120, 380, 400, 580],
  },
];

// High quality SVG data URLs that depict realistic fridge shelves with egg cartons, cabbage, tofu, chicken, etc.
// These render crisp, beautiful fridge scenes with identifiable visual elements!
export const SAMPLE_FRIDGE_IMAGES = [
  {
    id: 'fridge-sample-1',
    name: '家庭常備冷藏（雞蛋、高麗菜、板豆腐）',
    description: '包含半顆高麗菜、盒裝板豆腐、雞蛋、鮮奶與牛番茄',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="fridgeBack" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#eaf2f8"/>
      <stop offset="100%" stop-color="#c9dbe9"/>
    </linearGradient>
    <linearGradient id="shelfGlass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7fc1ca" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="#d4f1f4" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#7fc1ca" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="cabbageGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a8e063"/>
      <stop offset="100%" stop-color="#56ab2f"/>
    </linearGradient>
    <linearGradient id="tofuGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0ece1"/>
    </linearGradient>
    <linearGradient id="eggGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f6d365"/>
      <stop offset="100%" stop-color="#fda085"/>
    </linearGradient>
  </defs>

  <!-- Fridge Interior Background -->
  <rect width="800" height="600" fill="url(#fridgeBack)"/>
  <!-- Interior Lighting Glow -->
  <circle cx="400" cy="50" r="300" fill="#ffffff" opacity="0.35"/>
  <rect x="0" y="0" width="800" height="30" fill="#cbd5e1" opacity="0.5"/>

  <!-- Top Shelf Glass -->
  <rect x="20" y="220" width="760" height="18" rx="4" fill="url(#shelfGlass)"/>
  <rect x="20" y="235" width="760" height="5" fill="#486581" opacity="0.3"/>

  <!-- Middle Shelf Glass -->
  <rect x="20" y="420" width="760" height="18" rx="4" fill="url(#shelfGlass)"/>
  <rect x="20" y="435" width="760" height="5" fill="#486581" opacity="0.3"/>

  <!-- TOP SHELF ITEMS -->
  <!-- Green Onion / Scallions -->
  <g id="scallions" transform="translate(60, 90)">
    <rect x="0" y="0" width="130" height="120" rx="8" fill="#d1fae5" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2"/>
    <path d="M 20 110 Q 50 30 110 20" stroke="#059669" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 35 110 Q 60 40 100 35" stroke="#10b981" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M 25 110 Q 40 60 80 50" stroke="#34d399" stroke-width="6" stroke-linecap="round" fill="none"/>
    <text x="65" y="105" text-anchor="middle" font-size="14" font-weight="bold" fill="#065f46" font-family="sans-serif">青蔥 2 根</text>
  </g>

  <!-- Milk Bottle -->
  <g id="milk" transform="translate(260, 50)">
    <rect x="0" y="30" width="90" height="140" rx="12" fill="#ffffff" stroke="#93c5fd" stroke-width="3"/>
    <rect x="20" y="10" width="50" height="25" rx="5" fill="#3b82f6"/>
    <rect x="10" y="70" width="70" height="50" fill="#dbeafe" rx="4"/>
    <text x="45" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af" font-family="sans-serif">全脂鮮奶</text>
    <text x="45" y="155" text-anchor="middle" font-size="11" fill="#64748b" font-family="sans-serif">1 瓶 (936ml)</text>
  </g>

  <!-- Egg Carton (雞蛋 4 顆) -->
  <g id="eggs" transform="translate(460, 80)">
    <rect x="0" y="20" width="260" height="120" rx="14" fill="#fed7aa" stroke="#f97316" stroke-width="3"/>
    <rect x="10" y="5" width="240" height="20" rx="6" fill="#fdba74"/>
    <!-- 4 Eggs -->
    <ellipse cx="45" cy="70" rx="22" ry="28" fill="url(#eggGrad)"/>
    <ellipse cx="100" cy="70" rx="22" ry="28" fill="url(#eggGrad)"/>
    <ellipse cx="155" cy="70" rx="22" ry="28" fill="url(#eggGrad)"/>
    <ellipse cx="210" cy="70" rx="22" ry="28" fill="url(#eggGrad)"/>
    <text x="130" y="125" text-anchor="middle" font-size="15" font-weight="bold" fill="#9a3412" font-family="sans-serif">雞蛋 4 顆 (鮮度佳)</text>
  </g>

  <!-- MIDDLE SHELF ITEMS -->
  <!-- Half Cabbage (高麗菜半顆) -->
  <g id="cabbage" transform="translate(60, 250)">
    <path d="M 30 160 C 20 70 120 20 200 40 C 260 60 270 140 250 160 Z" fill="url(#cabbageGrad)" stroke="#2f7d5b" stroke-width="4"/>
    <!-- Leaf veins -->
    <path d="M 140 160 Q 140 100 120 50" stroke="#dcfce7" stroke-width="6" fill="none"/>
    <path d="M 140 120 Q 90 90 60 110" stroke="#dcfce7" stroke-width="4" fill="none"/>
    <path d="M 140 110 Q 190 80 230 100" stroke="#dcfce7" stroke-width="4" fill="none"/>
    <!-- Cut plane indicator -->
    <line x1="25" y1="160" x2="255" y2="160" stroke="#15803d" stroke-width="5"/>
    <rect x="50" y="115" width="160" height="30" rx="6" fill="#ffffff" opacity="0.9"/>
    <text x="130" y="136" text-anchor="middle" font-size="15" font-weight="bold" fill="#166534" font-family="sans-serif">高麗菜 半顆 (剩2天)</text>
  </g>

  <!-- Firm Tofu (板豆腐 1 塊) -->
  <g id="tofu" transform="translate(420, 270)">
    <rect x="0" y="20" width="220" height="130" rx="10" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/>
    <!-- Plastic wrap seal edge -->
    <rect x="8" y="28" width="204" height="114" rx="6" fill="url(#tofuGrad)" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="20" y1="50" x2="200" y2="50" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="20" y1="80" x2="200" y2="80" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="20" y1="110" x2="200" y2="110" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="40" y="65" width="140" height="36" rx="6" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
    <text x="110" y="88" text-anchor="middle" font-size="14" font-weight="bold" fill="#854d0e" font-family="sans-serif">板豆腐 1 塊 (需即食)</text>
  </g>

  <!-- BOTTOM SHELF ITEMS -->
  <!-- Chicken Breast (雞胸肉 300g) -->
  <g id="chicken" transform="translate(60, 460)">
    <rect x="0" y="0" width="240" height="120" rx="12" fill="#fce7f3" stroke="#db2777" stroke-width="3"/>
    <path d="M 30 70 Q 70 30 140 40 Q 210 50 200 95 Q 120 110 30 70 Z" fill="#fda4af" stroke="#f43f5e" stroke-width="2"/>
    <rect x="50" y="80" width="140" height="30" rx="6" fill="#ffffff" opacity="0.95"/>
    <text x="120" y="100" text-anchor="middle" font-size="14" font-weight="bold" fill="#be185d" font-family="sans-serif">生鮮雞胸肉 300g</text>
  </g>

  <!-- Fresh Tomatoes (牛番茄 2 顆) -->
  <g id="tomatoes" transform="translate(420, 460)">
    <rect x="0" y="0" width="260" height="120" rx="12" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
    <circle cx="70" cy="60" r="38" fill="#ef4444"/>
    <path d="M 70 24 L 62 16 M 70 24 L 78 16 M 70 24 L 70 12" stroke="#15803d" stroke-width="4" stroke-linecap="round"/>
    <circle cx="160" cy="60" r="38" fill="#dc2626"/>
    <path d="M 160 24 L 152 16 M 160 24 L 168 16 M 160 24 L 160 12" stroke="#15803d" stroke-width="4" stroke-linecap="round"/>
    <text x="130" y="110" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b" font-family="sans-serif">牛番茄 2 顆</text>
  </g>
</svg>
`)}`,
  },
  {
    id: 'fridge-sample-2',
    name: '健身增肌蔬食冷藏（豆腐、花椰菜、水煮蛋）',
    description: '包含青花菜、水煮蛋、雞胸肉、希臘優格與豆漿',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bgGym" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bgGym)"/>
  <rect x="20" y="240" width="760" height="16" rx="4" fill="#94a3b8" opacity="0.6"/>
  <rect x="20" y="440" width="760" height="16" rx="4" fill="#94a3b8" opacity="0.6"/>

  <!-- Broccoli -->
  <g transform="translate(80, 70)">
    <rect x="0" y="0" width="220" height="150" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
    <circle cx="110" cy="65" r="45" fill="#15803d"/>
    <circle cx="80" cy="55" r="30" fill="#16a34a"/>
    <circle cx="140" cy="55" r="30" fill="#16a34a"/>
    <text x="110" y="135" text-anchor="middle" font-size="15" font-weight="bold" fill="#14532d" font-family="sans-serif">綠花椰菜 1 朵</text>
  </g>

  <!-- Boiled Eggs -->
  <g transform="translate(420, 70)">
    <rect x="0" y="0" width="260" height="150" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>
    <ellipse cx="80" cy="70" rx="30" ry="40" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
    <ellipse cx="170" cy="70" rx="30" ry="40" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
    <text x="130" y="135" text-anchor="middle" font-size="15" font-weight="bold" fill="#78350f" font-family="sans-serif">熟水煮蛋 6 顆</text>
  </g>

  <!-- Greek Yogurt & Soy Milk -->
  <g transform="translate(80, 270)">
    <rect x="0" y="0" width="240" height="150" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="3"/>
    <rect x="40" y="25" width="70" height="80" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="2"/>
    <rect x="130" y="20" width="60" height="90" rx="6" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
    <text x="120" y="135" text-anchor="middle" font-size="15" font-weight="bold" fill="#1e3a8a" font-family="sans-serif">無糖豆漿 + 希臘優格</text>
  </g>

  <!-- Tofu & Mushrooms -->
  <g transform="translate(420, 270)">
    <rect x="0" y="0" width="260" height="150" rx="10" fill="#f5f5f4" stroke="#78716c" stroke-width="3"/>
    <rect x="30" y="30" width="100" height="70" rx="6" fill="#ffffff" stroke="#a8a29e" stroke-width="2"/>
    <text x="130" y="135" text-anchor="middle" font-size="15" font-weight="bold" fill="#292524" font-family="sans-serif">板豆腐 1 塊 + 鴻喜菇 1 包</text>
  </g>
</svg>
`)}`,
  },
];
