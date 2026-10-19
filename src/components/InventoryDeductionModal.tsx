import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  X,
  ChefHat,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { DeductionItem, Recipe } from '../types';

interface InventoryDeductionModalProps {
  recipe: Recipe;
  deductionItems: DeductionItem[];
  onConfirmDeduction: (
    requestId: string,
    recipe: Recipe,
    finalItems: DeductionItem[]
  ) => void;
  onClose: () => void;
}

export const InventoryDeductionModal: React.FC<InventoryDeductionModalProps> = ({
  recipe,
  deductionItems: initialItems,
  onConfirmDeduction,
  onClose,
}) => {
  // Unique idempotency request ID for this session
  const [requestId] = useState(`cook-req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const [items, setItems] = useState<DeductionItem[]>(initialItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);

  // Update actual usage quantity for an item
  const handleAmountChange = (index: number, newAmount: number) => {
    const updated = [...items];
    const item = updated[index];
    const safeAmount = Math.max(0, newAmount);
    const remaining = Number((item.originalInventory - safeAmount).toFixed(2));

    updated[index] = {
      ...item,
      actualAmount: safeAmount,
      remainingInventory: remaining,
    };
    setItems(updated);
  };

  // Check if any item will result in negative stock
  const hasNegativeInventory = items.some((item) => item.remainingInventory < 0);

  const handleConfirm = () => {
    if (hasNegativeInventory) {
      setHasError('部分食材扣除量超過冰箱現有庫存，請調整實際使用量！');
      return;
    }

    setIsSubmitting(true);
    setHasError(null);
    onConfirmDeduction(requestId, recipe, items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <ChefHat className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">烹飪完成：確認實際使用量並扣除庫存</h2>
              <p className="text-xs text-emerald-100">料理：{recipe.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">安心扣除與冪等保護機制：</p>
              <p>
                系統已為本次料理產生防重複扣除金鑰（{requestId.slice(0, 15)}...）。
                請確認實際使用的食材數量，確認後將正式從冰箱扣除並寫入料理異動紀錄。
              </p>
            </div>
          </div>

          {hasError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{hasError}</span>
            </div>
          )}

          {/* Table of items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">食材名稱</th>
                  <th className="py-2.5 px-3 text-right">目前庫存</th>
                  <th className="py-2.5 px-3 text-center">本次實際用量</th>
                  <th className="py-2.5 px-3 text-right">扣除後剩餘</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      本道料理不需扣除特定冰箱庫存食材（或主要使用常備調味品）。
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr
                      key={item.name + idx}
                      className={item.remainingInventory < 0 ? 'bg-red-50/70' : 'hover:bg-slate-50/50'}
                    >
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {item.name}
                        {item.recipeAmount !== item.actualAmount && (
                          <span className="ml-1 text-[10px] text-amber-700 font-normal">
                            (原預估 {item.recipeAmount})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {item.originalInventory} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.actualAmount}
                            onChange={(e) =>
                              handleAmountChange(idx, parseFloat(e.target.value) || 0)
                            }
                            className={`w-16 px-2 py-1 text-center font-bold text-xs rounded border focus:outline-emerald-500 ${
                              item.remainingInventory < 0
                                ? 'border-red-400 bg-red-50 text-red-800'
                                : 'border-slate-300 bg-white text-slate-800'
                            }`}
                          />
                          <span className="text-slate-500 text-[11px]">{item.unit}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        {item.remainingInventory < 0 ? (
                          <span className="text-red-600">不足 {item.remainingInventory}</span>
                        ) : (
                          <span
                            className={
                              item.remainingInventory === 0
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }
                          >
                            {item.remainingInventory} {item.unit}
                            {item.remainingInventory === 0 && ' (用罄)'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>💡 提示：若只用了一半，可直接修改數量（支援小數點如 0.5）。</span>
            {items.some((i) => i.recipeAmount !== i.actualAmount) && (
              <button
                type="button"
                onClick={() => setItems(initialItems)}
                className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> 重設為食譜建議量
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            返回食譜
          </button>

          <button
            type="button"
            disabled={isSubmitting || hasNegativeInventory}
            onClick={handleConfirm}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
              isSubmitting || hasNegativeInventory
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 hover:scale-[1.01]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? '扣除更新中...' : '確認扣除並完成料理'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
