import React, { useState } from 'react';
import {
  Refrigerator,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Sparkles,
  Camera,
  Trash2,
  Edit3,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { Ingredient, IngredientCategory } from '../types';

interface FridgeInventoryViewProps {
  inventory: Ingredient[];
  onAddIngredient: (item: Omit<Ingredient, 'id' | 'addedAt'>) => void;
  onUpdateIngredient: (id: string, updated: Partial<Ingredient>) => void;
  onDeleteIngredient: (id: string) => void;
  onNavigateToScan: () => void;
  onNavigateToRecipes: () => void;
}

export const FridgeInventoryView: React.FC<FridgeInventoryViewProps> = ({
  inventory,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
  onNavigateToScan,
  onNavigateToRecipes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'quantity'>('expiry');

  // Modal for manual adding or editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<IngredientCategory>('vegetable');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState('個');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Calculate days left until expiry
  const getDaysLeft = (expiryDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('vegetable');
    setFormQuantity(1);
    setFormUnit('個');
    // Default 5 days from now
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setFormExpiryDate(d.toISOString().split('T')[0]);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Ingredient) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit);
    setFormExpiryDate(item.expiryDate);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingId) {
      onUpdateIngredient(editingId, {
        name: formName.trim(),
        category: formCategory,
        quantity: Number(formQuantity),
        unit: formUnit.trim(),
        expiryDate: formExpiryDate,
        notes: formNotes.trim(),
      });
    } else {
      onAddIngredient({
        name: formName.trim(),
        category: formCategory,
        quantity: Number(formQuantity),
        unit: formUnit.trim(),
        expiryDate: formExpiryDate,
        notes: formNotes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Filtered & sorted inventory
  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'expiry') {
      return getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'zh-TW');
    }
    if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    }
    return 0;
  });

  const expiringSoonCount = inventory.filter((i) => getDaysLeft(i.expiryDate) <= 3).length;

  const categoryLabels: Record<string, string> = {
    all: '全部食材',
    vegetable: '🥬 蔬菜',
    dairy_egg: '🥚 蛋豆奶',
    meat: '🥩 肉品',
    seafood: '🐟 海鮮',
    fruit: '🍎 水果',
    staple: '🍚 主食',
    condiment: '🧂 調味料',
    other: '📦 其他',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Refrigerator className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-800">冰箱庫存即時掌握</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              共 {inventory.length} 項食材
            </span>
          </div>
          <p className="text-sm text-slate-600">
            即時追蹤食材餘量與保鮮期，支援自動扣除與手動微調，減少廚餘與浪費。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToScan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition-colors shadow-xs"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>📷 AI 照片辨識入庫</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>手動新增食材</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">冰箱現有食材種類</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{inventory.length} 種</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Refrigerator className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs flex items-center justify-between transition-colors ${
            expiringSoonCount > 0
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs font-medium text-amber-800">3 天內即將到期食材</span>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {expiringSoonCount} <span className="text-xs font-normal">項需要注意</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-100">一鍵清冰箱靈感</span>
            <div className="text-sm font-bold text-white mt-1">依現有食材配菜</div>
          </div>
          <button
            onClick={onNavigateToRecipes}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>尋找食譜 &rarr;</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋食材名稱（如：雞蛋、高麗菜）或備註..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-emerald-500 text-slate-800"
            />
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-100 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 border-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="expiry">依到期日（緊急優先）</option>
              <option value="name">依食材名稱</option>
              <option value="quantity">依數量多寡</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === key
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Refrigerator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">沒有符合條件的食材</h3>
          <p className="text-xs text-slate-400 mt-1">您可以點擊上方按鈕拍照盤點或手動新增食材</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={onNavigateToScan}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              拍照盤點
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              手動輸入
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((item) => {
            const daysLeft = getDaysLeft(item.expiryDate);
            const isExpiringSoon = daysLeft <= 2;
            const isWarning = daysLeft > 2 && daysLeft <= 4;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border bg-white shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                  isExpiringSoon
                    ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300/40'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {categoryLabels[item.category] || '其他'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 leading-tight mt-0.5">
                        {item.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                        title="編輯食材"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`確定要自冰箱清單刪除「${item.name}」嗎？`)) {
                            onDeleteIngredient(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity Display */}
                  <div className="my-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-800">{item.quantity}</span>
                    <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 rounded-lg p-1.5 border border-slate-100 mb-3">
                      📝 {item.notes}
                    </p>
                  )}
                </div>

                {/* Expiry Pill */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        isExpiringSoon
                          ? 'text-red-500'
                          : isWarning
                          ? 'text-amber-500'
                          : 'text-emerald-600'
                      }`}
                    />
                    <span
                      className={`font-bold ${
                        isExpiringSoon
                          ? 'text-red-600'
                          : isWarning
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {daysLeft < 0
                        ? `已逾期 ${Math.abs(daysLeft)} 天`
                        : daysLeft === 0
                        ? '今日到期！'
                        : `剩餘 ${daysLeft} 天到期`}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.expiryDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-800">
                {editingId ? '編輯食材庫存' : '手動新增冰箱食材'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">食材名稱 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：雞蛋、高麗菜、板豆腐"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">數量 *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">單位 *</label>
                  <input
                    type="text"
                    required
                    placeholder="顆、塊、克、把"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">食材類別</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as IngredientCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-500"
                  >
                    <option value="vegetable">蔬菜</option>
                    <option value="dairy_egg">蛋豆奶</option>
                    <option value="meat">肉品</option>
                    <option value="seafood">海鮮</option>
                    <option value="fruit">水果</option>
                    <option value="staple">主食</option>
                    <option value="condiment">調味料</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">預計到期日期</label>
                  <input
                    type="date"
                    required
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">備註說明 (選填)</label>
                <input
                  type="text"
                  placeholder="如：已切半、放在門側"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  {editingId ? '儲存變更' : '新增入庫'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
