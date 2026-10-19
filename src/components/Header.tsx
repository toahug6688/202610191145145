import React from 'react';
import { Refrigerator, Sparkles, ChefHat, History, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'fridge' | 'scan' | 'recipes' | 'history';
  onSelectTab: (tab: 'fridge' | 'scan' | 'recipes' | 'history') => void;
  inventoryCount: number;
  expiringCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  inventoryCount,
  expiringCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab('fridge')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Refrigerator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-800 tracking-tight">AI 智慧冰箱</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  食譜推薦與庫存
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">照片辨識盤點 · 設備限制極速出菜 · 動態換菜與扣庫</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('fridge')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'fridge'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Refrigerator className="w-4 h-4" />
              <span>冰箱庫存</span>
              <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                {inventoryCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('scan')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'scan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>照片盤點</span>
            </button>

            <button
              onClick={() => onSelectTab('recipes')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'recipes'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>智慧食譜</span>
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'history'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">料理與異動紀錄</span>
              <span className="sm:hidden">紀錄</span>
            </button>
          </nav>
        </div>

        {/* Expiring Alert Banner if any */}
        {expiringCount > 0 && currentTab !== 'scan' && (
          <div className="py-1 px-3 bg-amber-50/80 border-t border-amber-200/60 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>提醒：</strong> 冰箱中有 <span className="font-bold underline">{expiringCount} 項食材</span> 即將在 3 天內到期，建議優先料理！
              </span>
            </div>
            <button
              onClick={() => onSelectTab('recipes')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline ml-2"
            >
              快速找適合食譜 &rarr;
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
