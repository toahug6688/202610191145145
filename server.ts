import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasApiKey: Boolean(apiKey) });
});

// POST /api/scan-fridge: Multimodal visual ingredient detection
app.post('/api/scan-fridge', async (req: Request, res: Response) => {
  try {
    const { image, mimeType = 'image/jpeg' } = req.body;
    if (!image) {
      return res.status(400).json({ error: '請提供冰箱照片資料' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY 未設定，請檢查環境變數' });
    }

    // Clean base64 data if it includes data URL prefix
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `你是一位專業的料理與食材辨識 AI 助手。
請細心辨識這張冰箱內部照片中出現的所有食材與調味料。
請為每個辨識到的食材提供：
1. 繁體中文食材名稱（如：雞蛋、高麗菜、板豆腐、全脂鮮奶、雞胸肉、番茄、蔥、胡蘿蔔、洋蔥、蘋果等）。
2. 食材分類：'vegetable' (蔬菜), 'meat' (肉品), 'seafood' (海鮮), 'dairy_egg' (蛋奶豆類), 'fruit' (水果), 'staple' (主食/澱粉), 'condiment' (醬料調味), 'beverage' (飲料), 'other' (其他)。
3. 合理估計的數量（小數或整數，例如 4、0.5、1、200）以及單位（例如：顆、半顆、塊、盒、包、瓶、克、根、把）。
4. 辨識信心度：'high' (清晰可見), 'medium' (部分可見/推論), 'low' (遮蔽或不確定)。
5. 若為不確定或被遮擋的食材，請在 notes 中備註「請手動確認」或說明原因。
6. estimatedExpiryDays: 該類食材在冰箱冷藏下的預估剩餘保鮮天數（例如葉菜 3-5 天、豆腐 3 天、雞蛋 14 天、肉類 2-3 天、調味料 60 天）。
7. box2d 座標: 若可能，標記物體在影像中的標準化矩形座標 [ymin, xmin, ymax, xmax]，數值範圍為 0 到 1000 之間的整數。如果無法精確框選，請填入物體大概所在區域。

請嚴格遵守真實看到的物品，不要憑空捏造不存在的食材。對不確定的項目標記 low 或 medium。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  confidence: { type: Type.STRING },
                  estimatedExpiryDays: { type: Type.INTEGER },
                  notes: { type: Type.STRING },
                  box2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: '[ymin, xmin, ymax, xmax] normalized 0-1000',
                  },
                },
                required: ['name', 'category', 'quantity', 'unit', 'confidence'],
              },
            },
            overallAssessment: {
              type: Type.STRING,
              description: '冰箱整體概況簡評（如：蔬菜豐富、蛋白質充足、需盡快消耗的項目等）',
            },
            uncertainPrompt: {
              type: Type.STRING,
              description: '針對遮擋或不清晰區域的友善提醒',
            },
          },
          required: ['detectedItems', 'overallAssessment'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Scan fridge error:', error);
    res.status(500).json({ error: error.message || '照片辨識失敗，請重試或改用手動盤點' });
  }
});

// POST /api/recommend-recipes: Recommend recipes tailored to inventory & constraints
app.post('/api/recommend-recipes', async (req: Request, res: Response) => {
  try {
    const {
      inventory = [],
      appliances = [],
      dietaryStyle = 'balanced',
      excludedIngredients = [],
      maxTimeMinutes = 30,
      servings = 1,
      prioritizeExpiring = true,
      swapRequest,
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY 未設定' });
    }

    const inventorySummary = inventory
      .map((item: any) => `${item.name} (${item.quantity} ${item.unit}${item.daysLeft !== undefined ? `, 約剩${item.daysLeft}天到期` : ''})`)
      .join('、');

    const applianceMapping: Record<string, string> = {
      rice_cooker: '電鍋 (大同電鍋/電子鍋)',
      air_fryer: '氣炸鍋',
      microwave: '微波爐',
      single_gas_stove: '單口瓦斯爐 (只能同時使用一口爐火)',
      no_heat: '免開火/涼拌/冷壓',
    };

    const applianceList = (appliances.length > 0 ? appliances : ['microwave', 'single_gas_stove'])
      .map((k: string) => applianceMapping[k] || k)
      .join(', ');

    const isSwapMode = Boolean(swapRequest?.isSwap);

    const systemPrompt = `你是一位精通快速家常料理與小空間/租屋族烹飪的大廚與營養專家。
使用者的目標是：用冰箱現有庫存快速完成美味料理，同時嚴格遵守設備限制與飲食忌口！

【硬性規則（不可違反）】：
1. 嚴格忌口與過敏原排除：絕不可使用以下任何食材：[${excludedIngredients.join('、') || '無特殊忌口'}]。此為硬性限制，不得推薦！
2. 烹飪設備限制：使用者手邊只有以下設備：[${applianceList}]。絕不能要求使用烤箱、雙口爐同時烹調等多餘設備！
3. 烹飪時間限制：總時間（包含備料與加熱）嚴格控制在 ${maxTimeMinutes} 分鐘以內！
4. 優先使用現有食材：[${inventorySummary || '無現有庫存'}]。缺少的食材需標記 needToBuy: true。
5. 份量：請依 ${servings} 人份設計精準食材用量。
6. 飲食風格：${dietaryStyle}（例如：高蛋白增肌需注重肉蛋豆類蛋白質含量、低醣生酮需嚴格控制碳水化合物、全素蔬食不可有動物來源）。

${
  isSwapMode
    ? `【動態換菜特殊指示】：
使用者對上一道料理『${swapRequest.originalRecipeTitle || '推薦食譜'}』提出換菜要求：
使用者意見：「${swapRequest.feedbackOrPrompt}」
請在保留使用者原有冰箱食材與所有硬性限制的前提下，生成全新的食譜替換，並在 swapDiffHighlight 中向使用者清晰說明換菜特色與主要差異！`
    : `請推薦 3 道不同風味與烹調方式的美味料理方案（例如：一道極速免開火或微波、一道家常熱炒或電鍋蒸煮、一道創意高蛋白或輕食）。`
}

所有步驟請條理清晰，每個步驟提供料理秘訣（tip）。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [{ text: systemPrompt }],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  description: { type: Type.STRING },
                  prepTimeMinutes: { type: Type.INTEGER },
                  cookTimeMinutes: { type: Type.INTEGER },
                  totalTimeMinutes: { type: Type.INTEGER },
                  servings: { type: Type.INTEGER },
                  applianceUsed: { type: Type.STRING },
                  dietaryTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  requiredIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                        inInventory: { type: Type.BOOLEAN },
                        inventoryRemaining: { type: Type.NUMBER },
                        needToBuy: { type: Type.BOOLEAN },
                      },
                      required: ['name', 'amount', 'unit', 'inInventory', 'needToBuy'],
                    },
                  },
                  seasonings: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        stepNumber: { type: Type.INTEGER },
                        instruction: { type: Type.STRING },
                        tip: { type: Type.STRING },
                      },
                      required: ['stepNumber', 'instruction'],
                    },
                  },
                  nutritionSummary: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.INTEGER },
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER },
                      note: { type: Type.STRING },
                    },
                    required: ['calories', 'protein', 'carbs', 'fat'],
                  },
                  swapDiffHighlight: {
                    type: Type.STRING,
                    description: '動態換菜時的對比與差異亮點',
                  },
                },
                required: [
                  'id',
                  'title',
                  'description',
                  'totalTimeMinutes',
                  'applianceUsed',
                  'requiredIngredients',
                  'steps',
                  'nutritionSummary',
                ],
              },
            },
            chefAdvice: {
              type: Type.STRING,
              description: '主廚給使用者的今日料理搭配小建議',
            },
          },
          required: ['recipes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Recommend recipes error:', error);
    res.status(500).json({ error: error.message || '食譜推薦生成失敗，請稍後重試' });
  }
});

// Mount Vite middleware in development or static in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Smart Fridge server running at http://0.0.0.0:${PORT}`);
});
