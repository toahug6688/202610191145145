import React, { useState } from 'react';
import {
  History,
  ChefHat,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { CookingHistoryRecord, InventoryLog } from '../types';

interface CookingHistoryViewProps {
  cookingHistory: CookingHistoryRecord[];
  inventoryLogs: InventoryLog[];
  onNavigateToRecipes: () => void;
}

export const CookingHistoryView: React.FC<CookingHistoryViewProps> = ({
  cookingHistory,
  inventoryLogs,
  onNavigateToRecipes,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'meals' | 'logs'>('meals');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-800">料理歷史與庫存異動日誌</h1>
          </div>
          <p className="text-sm text-slate-600">
            追蹤每一道完成的佳餚、食材扣除明細，與冰箱出入庫紀錄，資料透明防重複扣除。
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('meals')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'meals'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🍳 料理完成紀錄 ({cookingHistory.length})
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'logs'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 庫存變動日誌 ({inventoryLogs.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Cooking Meals Records */}
      {activeSubTab === 'meals' && (
        <div className="space-y-4">
          {cookingHistory.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">尚未有完成的料理紀錄</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                挑選一道推薦食譜，煮完後點擊「烹飪完成扣除庫存」，系統將為您在此留下專屬的料理成就與食材消耗紀錄！
              </p>
              <button
                onClick={onNavigateToRecipes}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20"
              >
                <span>立即探索今日食譜 &rarr;</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cookingHistory.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{record.completedAt}</span>
                        <span>·</span>
                        <span className="font-semibold text-emerald-700">
                          {record.applianceUsed || '家常設備'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">{record.recipeTitle}</h3>
                      <p className="text-xs text-slate-500">{record.servings} 人份出菜</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 已扣庫存
                    </span>
                  </div>

                  {/* Deducted items breakdown */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center justify-between">
                      <span>實際扣除食材用量</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        單據編號：{record.requestId.slice(0, 14)}...
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {record.deductedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 last:border-b-0"
                        >
                          <span className="font-medium text-slate-700">{item.name}</span>
                          <span className="font-bold text-slate-800">
                            扣除 -{item.usedAmount} {item.unit}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              (餘 {item.remaining})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Full Inventory Audit Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              全生命週期異動明細（包含照片盤點、手動增刪改與料理扣除）
            </span>
            <span className="text-xs text-slate-400">共 {inventoryLogs.length} 筆異動</span>
          </div>

          {inventoryLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">目前暫無異動紀錄</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {inventoryLogs.map((log) => {
                const isDeduct = log.type === 'cooking_deduct';
                const isScan = log.type === 'scan_add';

                return (
                  <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isDeduct
                          ? 'bg-amber-100 text-amber-700'
                          : isScan
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isDeduct ? (
                        <ChefHat className="w-4 h-4" />
                      ) : isScan ? (
                        <Package className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{log.title}</span>
                        <span className="text-[11px] text-slate-400 shrink-0">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
