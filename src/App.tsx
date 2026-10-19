/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FridgeInventoryView } from './components/FridgeInventoryView';
import { PhotoScannerView } from './components/PhotoScannerView';
import { RecipeRecommenderView } from './components/RecipeRecommenderView';
import { CookingHistoryView } from './components/CookingHistoryView';
import {
  Ingredient,
  DietaryPreferences,
  CookingHistoryRecord,
  InventoryLog,
  Recipe,
  DeductionItem,
} from './types';
import { INITIAL_INVENTORY, INITIAL_PREFERENCES } from './data/sampleData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'fridge' | 'scan' | 'recipes' | 'history'>('fridge');

  // LocalStorage-backed state
  const [inventory, setInventory] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem('ai_fridge_inventory');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INVENTORY;
  });

  const [preferences, setPreferences] = useState<DietaryPreferences>(() => {
    try {
      const saved = localStorage.getItem('ai_fridge_preferences');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PREFERENCES;
  });

  const [cookingHistory, setCookingHistory] = useState<CookingHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ai_fridge_cooking_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'hist-init-1',
        requestId: 'cook-req-seed-001',
        recipeTitle: '極速微波蔥香溫拌板豆腐',
        completedAt: new Date(Date.now() - 86400000).toLocaleString('zh-TW', { hour12: false }),
        servings: 1,
        applianceUsed: '微波爐',
        deductedItems: [
          { name: '板豆腐', usedAmount: 1, unit: '塊', remaining: 1 },
          { name: '雞蛋', usedAmount: 1, unit: '顆', remaining: 4 },
          { name: '青蔥', usedAmount: 1, unit: '根', remaining: 2 },
        ],
      },
    ];
  });

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    try {
      const saved = localStorage.getItem('ai_fridge_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'log-init-1',
        timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
        type: 'manual_add',
        title: '初始常備食材建檔',
        details: '系統預載高麗菜、板豆腐、雞蛋、雞胸肉與生鮮蔬果庫存。',
      },
    ];
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_fridge_inventory', JSON.stringify(inventory));
    } catch (e) {
      console.error(e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_fridge_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.error(e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_fridge_cooking_history', JSON.stringify(cookingHistory));
    } catch (e) {
      console.error(e);
    }
  }, [cookingHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_fridge_logs', JSON.stringify(inventoryLogs));
    } catch (e) {
      console.error(e);
    }
  }, [inventoryLogs]);

  // Batch Add Ingredients (from Photo Scan)
  const handleBatchAddIngredients = (items: Omit<Ingredient, 'id' | 'addedAt'>[]) => {
    const now = new Date().toISOString().split('T')[0];
    const newIngredients: Ingredient[] = items.map((item, idx) => ({
      ...item,
      id: `inv-${Date.now()}-${idx}`,
      addedAt: now,
    }));

    setInventory((prev) => [...newIngredients, ...prev]);

    // Create log
    const log: InventoryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      type: 'scan_add',
      title: `多模態照片辨識入庫 (${items.length} 項)`,
      details: `已將：${items.map((i) => `${i.name} ${i.quantity}${i.unit}`).join('、')} 存入冰箱庫存。`,
    };
    setInventoryLogs((prev) => [log, ...prev]);

    showToast(`🎉 成功！已將 ${items.length} 項食材加入冰箱庫存。`);
  };

  // Single Add Ingredient
  const handleAddIngredient = (item: Omit<Ingredient, 'id' | 'addedAt'>) => {
    const newIngredient: Ingredient = {
      ...item,
      id: `inv-${Date.now()}`,
      addedAt: new Date().toISOString().split('T')[0],
    };

    setInventory((prev) => [newIngredient, ...prev]);

    const log: InventoryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      type: 'manual_add',
      title: `手動新增食材：${item.name}`,
      details: `入庫數量：${item.quantity} ${item.unit}，預計到期：${item.expiryDate}`,
    };
    setInventoryLogs((prev) => [log, ...prev]);

    showToast(`已新增「${item.name}」到冰箱庫存！`);
  };

  // Update Ingredient
  const handleUpdateIngredient = (id: string, updated: Partial<Ingredient>) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );

    const log: InventoryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      type: 'manual_edit',
      title: `編輯食材：${updated.name || '項目更新'}`,
      details: `更新食材細節與庫存數量。`,
    };
    setInventoryLogs((prev) => [log, ...prev]);

    showToast('食材庫存資訊已更新。');
  };

  // Delete Ingredient
  const handleDeleteIngredient = (id: string) => {
    const target = inventory.find((i) => i.id === id);
    setInventory((prev) => prev.filter((item) => item.id !== id));

    if (target) {
      const log: InventoryLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
        type: 'manual_delete',
        title: `移除食材：${target.name}`,
        details: `自冰箱清單中手動刪除 ${target.name} (${target.quantity} ${target.unit})`,
      };
      setInventoryLogs((prev) => [log, ...prev]);
      showToast(`已自冰箱移除「${target.name}」。`);
    }
  };

  // Feature 3: Confirm Cooking Completion & Idempotent Inventory Deductions
  const handleConfirmDeduction = (
    requestId: string,
    recipe: Recipe,
    deductions: DeductionItem[]
  ) => {
    // Check if this requestId was already processed
    const alreadyDeducted = cookingHistory.some((h) => h.requestId === requestId);
    if (alreadyDeducted) {
      showToast('⚠️ 本筆料理已完成記錄，系統已自動防止重複扣除庫存。');
      return;
    }

    // Execute deduction on inventory
    setInventory((prevInventory) => {
      let updatedInventory = [...prevInventory];

      for (const item of deductions) {
        if (item.actualAmount <= 0) continue;

        const idx = updatedInventory.findIndex(
          (inv) =>
            inv.id === item.matchedInventoryId ||
            inv.name.trim() === item.name.trim() ||
            inv.name.includes(item.name) ||
            item.name.includes(inv.name)
        );

        if (idx !== -1) {
          const current = updatedInventory[idx];
          const newQty = Number((current.quantity - item.actualAmount).toFixed(2));

          if (newQty <= 0) {
            // Item completely finished, remove or keep at 0
            updatedInventory = updatedInventory.filter((_, i) => i !== idx);
          } else {
            updatedInventory[idx] = {
              ...current,
              quantity: newQty,
            };
          }
        }
      }

      return updatedInventory;
    });

    // Add to Cooking History
    const historyRecord: CookingHistoryRecord = {
      id: `cook-${Date.now()}`,
      requestId,
      recipeTitle: recipe.title,
      completedAt: new Date().toLocaleString('zh-TW', { hour12: false }),
      servings: recipe.servings,
      applianceUsed: recipe.applianceUsed,
      deductedItems: deductions.map((d) => ({
        name: d.name,
        usedAmount: d.actualAmount,
        unit: d.unit,
        remaining: Math.max(0, d.remainingInventory),
      })),
      notes: recipe.swapDiffHighlight,
    };
    setCookingHistory((prev) => [historyRecord, ...prev]);

    // Add to Inventory Logs
    const log: InventoryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      type: 'cooking_deduct',
      title: `🍳 烹飪扣除：${recipe.title}`,
      details: `消耗食材：${deductions
        .map((d) => `${d.name} -${d.actualAmount}${d.unit} (剩餘 ${Math.max(0, d.remainingInventory)})`)
        .join('、')}`,
    };
    setInventoryLogs((prev) => [log, ...prev]);

    showToast(`🍽️ 太棒了！已完成料理「${recipe.title}」，食材庫存已全數自動扣除更新！`);
  };

  // Count expiring soon (< 3 days)
  const expiringCount = inventory.filter((item) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(item.expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 3;
  }).length;

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        inventoryCount={inventory.length}
        expiringCount={expiringCount}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-base">✨</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'fridge' && (
          <FridgeInventoryView
            inventory={inventory}
            onAddIngredient={handleAddIngredient}
            onUpdateIngredient={handleUpdateIngredient}
            onDeleteIngredient={handleDeleteIngredient}
            onNavigateToScan={() => setCurrentTab('scan')}
            onNavigateToRecipes={() => setCurrentTab('recipes')}
          />
        )}

        {currentTab === 'scan' && (
          <PhotoScannerView
            onAddIngredients={handleBatchAddIngredients}
            onNavigateToFridge={() => setCurrentTab('fridge')}
          />
        )}

        {currentTab === 'recipes' && (
          <RecipeRecommenderView
            inventory={inventory}
            preferences={preferences}
            onChangePreferences={setPreferences}
            onConfirmDeduction={handleConfirmDeduction}
            onNavigateToFridge={() => setCurrentTab('fridge')}
            onNavigateToScan={() => setCurrentTab('scan')}
          />
        )}

        {currentTab === 'history' && (
          <CookingHistoryView
            cookingHistory={cookingHistory}
            inventoryLogs={inventoryLogs}
            onNavigateToRecipes={() => setCurrentTab('recipes')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 AI 智慧冰箱與食譜推薦平台 · 珍惜食材 · 告別廚餘 · 輕鬆上菜</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>多模態視覺盤點</span>
            <span>·</span>
            <span>設備限制篩選</span>
            <span>·</span>
            <span>動態換菜</span>
            <span>·</span>
            <span>庫存自動扣減</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
