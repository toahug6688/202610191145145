import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Clock,
  Users,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
  SlidersHorizontal,
  Plus,
  X,
} from 'lucide-react';
import { ApplianceType, DietaryPreferences, DietaryStyle } from '../types';

interface PreferencesFilterBarProps {
  preferences: DietaryPreferences;
  onChangePreferences: (updated: DietaryPreferences) => void;
  onTriggerRecommend: () => void;
  isLoading: boolean;
}

export const PreferencesFilterBar: React.FC<PreferencesFilterBarProps> = ({
  preferences,
  onChangePreferences,
  onTriggerRecommend,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customExclusionInput, setCustomExclusionInput] = useState('');

  // Toggle appliance
  const toggleAppliance = (appliance: ApplianceType) => {
    const exists = preferences.appliances.includes(appliance);
    let updated: ApplianceType[];
    if (exists) {
      if (preferences.appliances.length <= 1) {
        // Keep at least one appliance selected
        return;
      }
      updated = preferences.appliances.filter((a) => a !== appliance);
    } else {
      updated = [...preferences.appliances, appliance];
    }
    onChangePreferences({ ...preferences, appliances: updated });
  };

  // Set dietary style
  const setDietaryStyle = (style: DietaryStyle) => {
    onChangePreferences({ ...preferences, dietaryStyle: style });
  };

  // Set max cook time
  const setMaxTime = (time: 15 | 30 | 45) => {
    onChangePreferences({ ...preferences, maxTimeMinutes: time });
  };

  // Add excluded ingredient
  const handleAddExclusion = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed || preferences.excludedIngredients.includes(trimmed)) return;
    onChangePreferences({
      ...preferences,
      excludedIngredients: [...preferences.excludedIngredients, trimmed],
    });
    setCustomExclusionInput('');
  };

  // Remove excluded ingredient
  const handleRemoveExclusion = (item: string) => {
    onChangePreferences({
      ...preferences,
      excludedIngredients: preferences.excludedIngredients.filter((e) => e !== item),
    });
  };

  const appliancesConfig: { id: ApplianceType; label: string; icon: string; desc: string }[] = [
    { id: 'microwave', label: '微波爐', icon: '⚡', desc: '極速加熱與少油' },
    { id: 'single_gas_stove', label: '單口瓦斯爐', icon: '🔥', desc: '單一爐火一鍋到底' },
    { id: 'rice_cooker', label: '電鍋 / 電子鍋', icon: '🍲', desc: '蒸煮燉煮免顧火' },
    { id: 'air_fryer', label: '氣炸鍋', icon: '🌪️', desc: '香脆無油烘烤' },
    { id: 'no_heat', label: '免開火 (涼拌/冷拌)', icon: '🥗', desc: '免火源速拌' },
  ];

  const dietaryStyleConfig: { id: DietaryStyle; label: string; desc: string }[] = [
    { id: 'high_protein', label: '高蛋白增肌', desc: '肉蛋豆豐富、強化肌肉修復' },
    { id: 'keto_low_carb', label: '低醣生酮', desc: '低碳水化合物、適量好油脂' },
    { id: 'balanced', label: '均衡家常', desc: '營養均衡、老少咸宜' },
    { id: 'vegetarian', label: '全素蔬食', desc: '無肉無蛋純植物料理' },
    { id: 'light', label: '清淡少油', desc: '減鹽低卡、腸胃少負擔' },
  ];

  const commonExclusionTags = ['海鮮', '香菜', '牛肉', '不吃辣', '特定蔬菜(苦瓜/青椒)', '乳製品', '堅果'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs mb-8 overflow-hidden transition-all">
      {/* Primary Bar: Quick overview & CTA */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800 text-base">烹飪偏好與設備限制</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                可多選條件
              </span>
            </div>
            <p className="text-xs text-slate-500">
              已套用：
              <span className="font-semibold text-emerald-700 mx-1">
                {preferences.appliances.length} 種設備限制
              </span>
              ·
              <span className="font-semibold text-emerald-700 mx-1">
                {dietaryStyleConfig.find((d) => d.id === preferences.dietaryStyle)?.label}
              </span>
              ·
              <span className="font-semibold text-emerald-700 mx-1">
                限 {preferences.maxTimeMinutes} 分鐘內
              </span>
              {preferences.excludedIngredients.length > 0 && (
                <>
                  · 排除：
                  <span className="text-amber-700 font-medium mx-1">
                    {preferences.excludedIngredients.join('、')}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <span>{isExpanded ? '收合設定' : '展開調整偏好'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            disabled={isLoading}
            onClick={onTriggerRecommend}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
              isLoading
                ? 'bg-slate-300 text-slate-500 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? '生成推薦中...' : '生成符合條件食譜'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Settings Panel */}
      {isExpanded && (
        <div className="p-5 sm:p-6 bg-slate-50/60 space-y-6">
          {/* 1. Appliance Restrictions (設備限制) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>現有廚房設備（可複選，硬性限制絕不超用）：</span>
              </label>
              <span className="text-[11px] text-slate-400">小套房／租屋族友善</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {appliancesConfig.map((app) => {
                const isSelected = preferences.appliances.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => toggleAppliance(app.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{app.icon}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isSelected ? '已啟用' : '未具備'}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-800 mt-1">{app.label}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{app.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Dietary Style & Time Limits */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Dietary Style */}
            <div className="md:col-span-7">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>飲食目標風格：</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryStyleConfig.map((style) => {
                  const isSelected = preferences.dietaryStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setDietaryStyle(style.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <span>{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time constraint & Servings */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>烹調時間限制（從洗切到上桌）：</span>
                </label>
                <div className="flex gap-2">
                  {[15, 30, 45].map((mins) => {
                    const isSelected = preferences.maxTimeMinutes === mins;
                    return (
                      <button
                        key={mins}
                        onClick={() => setMaxTime(mins as 15 | 30 | 45)}
                        className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {mins === 15 ? '⚡ 15 分極速' : `${mins} 分鐘`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Servings */}
              <div className="mt-4 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>預設料理份數：</span>
                </label>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => onChangePreferences({ ...preferences, servings: s })}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        preferences.servings === s
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s} 人份
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Hard Exclusions & Allergens (忌口與過敏原排除) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>硬性忌口與過敏原（嚴格排除，絕不包含）：</span>
              </label>
              <span className="text-[11px] text-red-600 font-medium">硬性過濾條件</span>
            </div>

            {/* Selected Exclusion Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {preferences.excludedIngredients.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold"
                >
                  <span>🚫 {item}</span>
                  <button
                    onClick={() => handleRemoveExclusion(item)}
                    className="hover:text-red-950 p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              {/* Custom input */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="新增自訂忌口 (如: 苦瓜)"
                  value={customExclusionInput}
                  onChange={(e) => setCustomExclusionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExclusion(customExclusionInput);
                    }
                  }}
                  className="text-xs px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500 w-36"
                />
                <button
                  type="button"
                  onClick={() => handleAddExclusion(customExclusionInput)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions for Exclusions */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span>快速加入常見忌口：</span>
              {commonExclusionTags.map((tag) => {
                const isSelected = preferences.excludedIngredients.includes(tag);
                if (isSelected) return null;
                return (
                  <button
                    key={tag}
                    onClick={() => handleAddExclusion(tag)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    + {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Prioritize Expiring toggle */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              💡 優先消耗即將到期食材（例如 3 天內到期的高麗菜、板豆腐）
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.prioritizeExpiring}
                onChange={(e) =>
                  onChangePreferences({ ...preferences, prioritizeExpiring: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
