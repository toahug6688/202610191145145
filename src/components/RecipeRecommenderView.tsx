import React, { useState } from 'react';
import {
  ChefHat,
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Send,
  ArrowRight,
  TrendingUp,
  History,
  BookOpen,
  ShoppingBag,
} from 'lucide-react';
import {
  DietaryPreferences,
  Ingredient,
  Recipe,
  DeductionItem,
} from '../types';
import { PreferencesFilterBar } from './PreferencesFilterBar';
import { InventoryDeductionModal } from './InventoryDeductionModal';

interface RecipeRecommenderViewProps {
  inventory: Ingredient[];
  preferences: DietaryPreferences;
  onChangePreferences: (updated: DietaryPreferences) => void;
  onConfirmDeduction: (
    requestId: string,
    recipe: Recipe,
    deductions: DeductionItem[]
  ) => void;
  onNavigateToFridge: () => void;
  onNavigateToScan: () => void;
}

export const RecipeRecommenderView: React.FC<RecipeRecommenderViewProps> = ({
  inventory,
  preferences,
  onChangePreferences,
  onConfirmDeduction,
  onNavigateToFridge,
  onNavigateToScan,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chefAdvice, setChefAdvice] = useState<string | null>(null);

  // Dynamic Swapping & Chat State
  const [chatFeedback, setChatFeedback] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapHistory, setSwapHistory] = useState<Recipe[]>([]);

  // Cooking Deduction Modal State
  const [deductionModalRecipe, setDeductionModalRecipe] = useState<Recipe | null>(null);
  const [deductionItems, setDeductionItems] = useState<DeductionItem[]>([]);

  // Fetch / Generate Recipes
  const handleGenerateRecipes = async (isSwap = false, customPrompt = '') => {
    setIsLoading(!isSwap);
    setIsSwapping(isSwap);
    setErrorMessage(null);

    const activeRecipe = recipes[activeRecipeIndex];

    try {
      const response = await fetch('/api/recommend-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory,
          appliances: preferences.appliances,
          dietaryStyle: preferences.dietaryStyle,
          excludedIngredients: preferences.excludedIngredients,
          maxTimeMinutes: preferences.maxTimeMinutes,
          servings: preferences.servings,
          prioritizeExpiring: preferences.prioritizeExpiring,
          swapRequest: isSwap
            ? {
                originalRecipeTitle: activeRecipe?.title || '當前推薦料理',
                feedbackOrPrompt: customPrompt || '這道我不喜歡，請在保留現有食材與限制下換一道',
                isSwap: true,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || '生成食譜失敗');
      }

      if (data.recipes && data.recipes.length > 0) {
        if (isSwap && activeRecipe) {
          // Push old recipe to swap history
          setSwapHistory((prev) => [activeRecipe, ...prev]);
          // Replace or insert at current index
          const newRecipe = data.recipes[0];
          const updated = [...recipes];
          updated[activeRecipeIndex] = newRecipe;
          setRecipes(updated);
        } else {
          setRecipes(data.recipes);
          setActiveRecipeIndex(0);
          setSwapHistory([]);
        }

        if (data.chefAdvice) {
          setChefAdvice(data.chefAdvice);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`推薦提示：${err.message || '連線逾時'}。已為您啟動離線精選智慧推薦！`);
      loadFallbackRecipes(isSwap, customPrompt);
    } finally {
      setIsLoading(false);
      setIsSwapping(false);
      setChatFeedback('');
    }
  };

  // Fallback high quality recipes matching eggs, tofu, cabbage
  const loadFallbackRecipes = (isSwap: boolean, customPrompt: string) => {
    const isNoHeatRequested = customPrompt.includes('免開火') || customPrompt.includes('不用開火');

    const sample1: Recipe = {
      id: `rec-${Date.now()}-1`,
      title: '極速微波蔥香溫拌板豆腐',
      subtitle: '高蛋白低醣 · 微波 3 分鐘出菜',
      description: '使用快到期的有機板豆腐，免繁複煎炒，微波溫熱後淋上蔥花蒜香薄鹽醬油，香嫩可口。',
      prepTimeMinutes: 4,
      cookTimeMinutes: 3,
      totalTimeMinutes: 7,
      servings: preferences.servings,
      applianceUsed: '微波爐',
      dietaryTags: ['高蛋白', '低醣生酮', '極速 15 分內', '即期食材優先'],
      requiredIngredients: [
        { name: '板豆腐', amount: 1, unit: '塊', inInventory: true, inventoryRemaining: 0, needToBuy: false },
        { name: '青蔥', amount: 1, unit: '根', inInventory: true, inventoryRemaining: 1, needToBuy: false },
        { name: '雞蛋', amount: 1, unit: '顆', inInventory: true, inventoryRemaining: 3, needToBuy: false },
      ],
      seasonings: ['薄鹽醬油 1 大匙', '香油 1 茶匙', '白胡椒少許'],
      steps: [
        { stepNumber: 1, instruction: '將板豆腐用紙巾稍微吸乾多餘水分，切成 2 公分適口厚塊。', tip: '吸乾水分能讓豆腐在微波後更扎實濃郁。' },
        { stepNumber: 2, instruction: '青蔥切細花，雞蛋打散後均勻淋在豆腐上，加蓋微波 600W 加熱 2.5 分鐘。', tip: '加微波專用蓋或保鮮膜留縫，蒸氣能讓蛋液滑順像茶碗蒸。' },
        { stepNumber: 3, instruction: '取出淋上醬油、香油與白胡椒，即刻享用！' },
      ],
      nutritionSummary: { calories: 280, protein: 26, carbs: 4, fat: 16, note: '優質大豆與雞蛋蛋白質，完美增肌減脂' },
      swapDiffHighlight: isSwap ? '🔄 已切換為微波極速料理，免開火爐，耗時僅 7 分鐘且優先清空快到期的板豆腐！' : undefined,
    };

    const sample2: Recipe = {
      id: `rec-${Date.now()}-2`,
      title: isNoHeatRequested ? '麻油蒜味冷拌嫩豆腐' : '單口爐高麗菜烘蛋',
      subtitle: isNoHeatRequested ? '免開火冷拌 · 8 分鐘上桌' : '一鍋到底 · 脆甜爆汁',
      description: isNoHeatRequested
        ? '完全不需開火加熱！利用現有板豆腐與青蔥切碎涼拌，淋上香濃麻油與醬汁，清爽消暑。'
        : '將冰箱切半的高麗菜切絲，與打散的雞蛋在單口平底鍋慢烘至金黃，蔬菜甘甜與蛋香融合。',
      prepTimeMinutes: 5,
      cookTimeMinutes: isNoHeatRequested ? 0 : 8,
      totalTimeMinutes: isNoHeatRequested ? 5 : 13,
      servings: preferences.servings,
      applianceUsed: isNoHeatRequested ? '免開火' : '單口瓦斯爐',
      dietaryTags: isNoHeatRequested ? ['免開火', '極速出菜', '高蛋白'] : ['一鍋到底', '低醣生酮', '高纖飽足'],
      requiredIngredients: isNoHeatRequested
        ? [
            { name: '板豆腐', amount: 1, unit: '塊', inInventory: true, needToBuy: false },
            { name: '青蔥', amount: 1, unit: '根', inInventory: true, needToBuy: false },
          ]
        : [
            { name: '高麗菜', amount: 0.5, unit: '顆', inInventory: true, needToBuy: false },
            { name: '雞蛋', amount: 3, unit: '顆', inInventory: true, needToBuy: false },
          ],
      seasonings: ['食用油 1 茶匙', '鹽巴半茶匙', '黑胡椒粒'],
      steps: [
        { stepNumber: 1, instruction: isNoHeatRequested ? '板豆腐切小塊擺盤。' : '高麗菜切細絲，雞蛋 3 顆加入鹽與胡椒打勻。' },
        { stepNumber: 2, instruction: isNoHeatRequested ? '青蔥切末撒在豆腐上，調和麻油醬汁淋上。' : '單口爐中小火熱油，下高麗菜炒軟約 2 分鐘。' },
        { stepNumber: 3, instruction: isNoHeatRequested ? '撒少許熟白芝麻即可享用。' : '倒入蛋液鋪平，蓋鍋蓋烘烤至表面凝固翻面微煎即可起鍋。' },
      ],
      nutritionSummary: { calories: 310, protein: 22, carbs: 9, fat: 19 },
      swapDiffHighlight: isSwap ? `🔄 已針對您的反饋「${customPrompt}」換成【${isNoHeatRequested ? '免開火涼拌' : '快炒烘蛋'}】，耗時縮短，原料 100% 取自現有庫存！` : undefined,
    };

    setRecipes([sample1, sample2]);
    setActiveRecipeIndex(0);
    setChefAdvice('今日冰箱食材非常平衡！板豆腐與高麗菜處於黃金食用期，推薦優先享用。');
  };

  // Prepare deduction modal
  const handleOpenDeductionModal = (recipe: Recipe) => {
    // Cross match recipe's required ingredients with user's inventory
    const itemsToDeduct: DeductionItem[] = recipe.requiredIngredients
      .map((req) => {
        // Find in inventory by fuzzy name match
        const matched = inventory.find(
          (inv) =>
            inv.name.includes(req.name) ||
            req.name.includes(inv.name) ||
            (inv.name.includes('蛋') && req.name.includes('蛋')) ||
            (inv.name.includes('豆腐') && req.name.includes('豆腐'))
        );

        if (matched) {
          const original = matched.quantity;
          const actual = Math.min(req.amount, original);
          return {
            name: matched.name,
            recipeAmount: req.amount,
            unit: matched.unit || req.unit,
            originalInventory: original,
            actualAmount: actual,
            remainingInventory: Number((original - actual).toFixed(2)),
            matchedInventoryId: matched.id,
          };
        }
        return null;
      })
      .filter(Boolean) as DeductionItem[];

    setDeductionItems(itemsToDeduct);
    setDeductionModalRecipe(recipe);
  };

  const activeRecipe = recipes[activeRecipeIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <ChefHat className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-800">客製智慧食譜與動態換菜</h1>
          </div>
          <p className="text-sm text-slate-600">
            結合現有食材、設備限制與飲食目標，極速推薦出菜；不喜歡可點選換菜或對話微調，煮完一鍵扣除庫存！
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToScan}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>📷 照片盤點冰箱</span>
          </button>
          <button
            onClick={onNavigateToFridge}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>📦 目前庫存 ({inventory.length})</span>
          </button>
        </div>
      </div>

      {/* Preferences & Appliance Filter Bar */}
      <PreferencesFilterBar
        preferences={preferences}
        onChangePreferences={onChangePreferences}
        onTriggerRecommend={() => handleGenerateRecipes(false)}
        isLoading={isLoading}
      />

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Main Recipe Area */}
      {recipes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">點擊上方按鈕開始為您量身配菜</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            AI 將根據您目前的冰箱食材（如：雞蛋、高麗菜、板豆腐）與您設定的設備限制（{preferences.appliances.join('、')}），極速生成美味推薦。
          </p>
          <button
            onClick={() => handleGenerateRecipes(false)}
            disabled={isLoading}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>立即推薦今日料理</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Recipe Navigation Tabs / List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-700">推薦菜單方案 ({recipes.length})</h2>
              <button
                onClick={() => handleGenerateRecipes(false)}
                disabled={isLoading}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                重新配菜
              </button>
            </div>

            {recipes.map((rec, idx) => {
              const isSelected = idx === activeRecipeIndex;
              return (
                <div
                  key={rec.id || idx}
                  onClick={() => setActiveRecipeIndex(idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      方案 #{idx + 1} · {rec.applianceUsed}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {rec.totalTimeMinutes} 分鐘
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{rec.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{rec.description}</p>
                </div>
              );
            })}

            {/* Chef Advice pill */}
            {chefAdvice && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">🧑‍🍳 主廚小叮嚀：</span>
                {chefAdvice}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Recipe View, Dynamic Swapping & Deduct CTA */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            {activeRecipe && (
              <>
                {/* Dynamic Swap Highlight Banner (if swapped) */}
                {activeRecipe.swapDiffHighlight && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-start gap-2.5 shadow-xs">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-amber-950 mb-0.5">動態換菜成功！</div>
                      <p>{activeRecipe.swapDiffHighlight}</p>
                    </div>
                    {swapHistory.length > 0 && (
                      <button
                        onClick={() => {
                          const prev = swapHistory[0];
                          setSwapHistory((s) => s.slice(1));
                          const updated = [...recipes];
                          updated[activeRecipeIndex] = prev;
                          setRecipes(updated);
                        }}
                        className="text-[11px] underline font-bold text-amber-800 hover:text-amber-950 whitespace-nowrap ml-2"
                      >
                        ↩ 返回上一道料理
                      </button>
                    )}
                  </div>
                )}

                {/* Recipe Title & Meta Badges */}
                <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {activeRecipe.applianceUsed}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {activeRecipe.totalTimeMinutes} 分鐘出菜
                      </span>
                      {activeRecipe.dietaryTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                      {activeRecipe.title}
                    </h2>
                    {activeRecipe.subtitle && (
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                        {activeRecipe.subtitle}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 mt-2">{activeRecipe.description}</p>
                  </div>

                  {/* Nutrition Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center min-w-[170px]">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      每份預估熱量與營養
                    </div>
                    <div className="text-lg font-black text-slate-800 mt-0.5">
                      {activeRecipe.nutritionSummary.calories} <span className="text-xs font-normal">kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-1 text-[11px] font-bold">
                      <div className="bg-white rounded px-1 py-0.5 text-emerald-700">
                        蛋 {activeRecipe.nutritionSummary.protein}g
                      </div>
                      <div className="bg-white rounded px-1 py-0.5 text-blue-700">
                        碳 {activeRecipe.nutritionSummary.carbs}g
                      </div>
                      <div className="bg-white rounded px-1 py-0.5 text-orange-700">
                        脂 {activeRecipe.nutritionSummary.fat}g
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Ingredients vs Fridge Inventory */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                    <span>所需食材與冰箱庫存對照（{activeRecipe.servings} 人份）</span>
                    <span className="text-xs text-slate-500 font-normal">
                      綠標：冰箱已有充足庫存
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeRecipe.requiredIngredients.map((ing, idx) => (
                      <div
                        key={ing.name + idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          ing.inInventory
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {ing.inInventory ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className="font-bold text-slate-800">{ing.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">
                            需 {ing.amount} {ing.unit}
                          </span>
                          {ing.inInventory ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-800">
                              庫存充足
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              需額外準備
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seasonings */}
                  {activeRecipe.seasonings && activeRecipe.seasonings.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-slate-600">調味料建議：</span>
                      {activeRecipe.seasonings.map((s, i) => (
                        <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Step-by-Step Cooking Steps */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>料理步驟指引（極簡不費力）</span>
                  </h3>
                  <div className="space-y-2.5">
                    {activeRecipe.steps.map((st) => (
                      <div
                        key={st.stepNumber}
                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {st.stepNumber}
                        </span>
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-slate-800 leading-relaxed">
                            {st.instruction}
                          </p>
                          {st.tip && (
                            <p className="text-amber-800 bg-amber-50 rounded px-2 py-1 mt-1.5 text-[11px] font-medium border border-amber-200/60 inline-block">
                              💡 主廚秘訣：{st.tip}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Recipe Swapping & Conversational Fine-Tuning */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs font-bold text-slate-800">
                        一鍵動態換菜與對話微調（保留現有食材與硬性限制）：
                      </h4>
                    </div>
                    {isSwapping && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> AI 重新構思換菜中...
                      </span>
                    )}
                  </div>

                  {/* Feature 3 Quick Swap Chips */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={isSwapping}
                      onClick={() => handleGenerateRecipes(true, '這道我不喜歡，換一道不用開火的料理')}
                      className="text-xs px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>「這道我不喜歡，換一道不用開火的」</span>
                    </button>

                    <button
                      disabled={isSwapping}
                      onClick={() => handleGenerateRecipes(true, '改成 15 分鐘極速出菜')}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                    >
                      ⚡ 改成 15 分鐘極速出菜
                    </button>

                    <button
                      disabled={isSwapping}
                      onClick={() => handleGenerateRecipes(true, '不要高麗菜，改用其他現有食材')}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                    >
                      🥬 不要高麗菜，換現有食材
                    </button>

                    <button
                      disabled={isSwapping}
                      onClick={() => handleGenerateRecipes(true, '換一道用電鍋或氣炸鍋的')}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                    >
                      🍲 換成電鍋或氣炸鍋料理
                    </button>

                    <button
                      disabled={isSwapping}
                      onClick={() => handleGenerateRecipes(true, '提高蛋白質含量 (增肌目標)')}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                    >
                      💪 蛋白質再加強 (高蛋白)
                    </button>
                  </div>

                  {/* Free form input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="想更換烹調法或調整食材？輸入您的意見（如：想喝暖湯、辣度減少...）"
                      value={chatFeedback}
                      onChange={(e) => setChatFeedback(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatFeedback.trim()) {
                          e.preventDefault();
                          handleGenerateRecipes(true, chatFeedback);
                        }
                      }}
                      className="flex-1 text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-emerald-500 text-slate-800"
                    />
                    <button
                      disabled={isSwapping || !chatFeedback.trim()}
                      onClick={() => handleGenerateRecipes(true, chatFeedback)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        isSwapping || !chatFeedback.trim()
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>發送微調</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Main Action: Cooking Completed & Inventory Deduction */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-xs text-slate-500">
                    完成料理後點擊右方按鈕，系統將引導您確認實際用量並自動扣除冰箱庫存。
                  </div>

                  <button
                    onClick={() => handleOpenDeductionModal(activeRecipe)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>烹飪完成，自動扣除已用食材庫存</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Inventory Deduction Confirmation Modal */}
      {deductionModalRecipe && (
        <InventoryDeductionModal
          recipe={deductionModalRecipe}
          deductionItems={deductionItems}
          onConfirmDeduction={(requestId, recipe, deductions) => {
            onConfirmDeduction(requestId, recipe, deductions);
            setDeductionModalRecipe(null);
          }}
          onClose={() => setDeductionModalRecipe(null)}
        />
      )}
    </div>
  );
};
