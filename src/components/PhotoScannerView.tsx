import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';
import { DetectedItem, Ingredient, IngredientCategory } from '../types';
import { SAMPLE_FRIDGE_IMAGES } from '../data/sampleData';

interface PhotoScannerViewProps {
  onAddIngredients: (items: Omit<Ingredient, 'id' | 'addedAt'>[]) => void;
  onNavigateToFridge: () => void;
}

export const PhotoScannerView: React.FC<PhotoScannerViewProps> = ({
  onAddIngredients,
  onNavigateToFridge,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_FRIDGE_IMAGES[0].dataUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [overallAssessment, setOverallAssessment] = useState<string>('');
  const [uncertainPrompt, setUncertainPrompt] = useState<string>('');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from local device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('請上傳正確的圖片格式 (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setDetectedItems([]);
      setOverallAssessment('');
      setUncertainPrompt('');
      setErrorMessage(null);
      setSuccessCount(null);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI photo scan via Gemini API
  const handleStartScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setErrorMessage(null);
    setSuccessCount(null);
    setScanStepMessage('正在讀取冰箱影像細節...');

    try {
      const stepTimer1 = setTimeout(() => {
        setScanStepMessage('Gemini 多模態模型分析中：辨識食材形狀、包裝與數量...');
      }, 900);

      const stepTimer2 = setTimeout(() => {
        setScanStepMessage('標註食材邊界框座標並推算保鮮期...');
      }, 2000);

      const response = await fetch('/api/scan-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: selectedImage.startsWith('data:image/png')
            ? 'image/png'
            : selectedImage.startsWith('data:image/svg+xml')
            ? 'image/svg+xml'
            : 'image/jpeg',
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || '辨識服務發生錯誤');
      }

      const items: DetectedItem[] = (data.detectedItems || []).map((item: any, idx: number) => ({
        id: `detected-${Date.now()}-${idx}`,
        name: item.name || '未知食材',
        category: (item.category as IngredientCategory) || 'vegetable',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        unit: item.unit || '個',
        confidence: item.confidence || 'high',
        estimatedExpiryDays: item.estimatedExpiryDays || 5,
        notes: item.notes || '',
        box2d: item.box2d || undefined,
        selected: true, // Selected by default for user review
      }));

      setDetectedItems(items);
      setOverallAssessment(data.overallAssessment || '已完成食材盤點分析');
      setUncertainPrompt(data.uncertainPrompt || '');
    } catch (err: any) {
      console.error(err);
      // Fallback fallback sample items if network or API key issue
      setErrorMessage(
        `AI 辨識提示：${err.message || '無法連線至 AI 辨識服務'}。您可點選下方範例載入食材，或直接手動校正。`
      );
      // Populate demo detection results so user experience is not blocked
      loadFallbackSampleItems();
    } finally {
      setIsScanning(false);
    }
  };

  const loadFallbackSampleItems = () => {
    const demoItems: DetectedItem[] = [
      {
        id: 'det-1',
        name: '雞蛋',
        category: 'dairy_egg',
        quantity: 4,
        unit: '顆',
        confidence: 'high',
        estimatedExpiryDays: 14,
        notes: '盒裝完整，鮮度良好',
        box2d: [130, 580, 360, 950],
        selected: true,
      },
      {
        id: 'det-2',
        name: '高麗菜',
        category: 'vegetable',
        quantity: 0.5,
        unit: '顆',
        confidence: 'high',
        estimatedExpiryDays: 2,
        notes: '已切半，外層稍軟，建議優先料理',
        box2d: [400, 60, 680, 440],
        selected: true,
      },
      {
        id: 'det-3',
        name: '板豆腐',
        category: 'dairy_egg',
        quantity: 1,
        unit: '塊',
        confidence: 'medium',
        estimatedExpiryDays: 1,
        notes: '請手動確認：保鮮期短，建議即日煮食',
        box2d: [420, 520, 670, 780],
        selected: true,
      },
      {
        id: 'det-4',
        name: '生鮮雞胸肉',
        category: 'meat',
        quantity: 300,
        unit: '克',
        confidence: 'high',
        estimatedExpiryDays: 3,
        notes: '密封包裝',
        box2d: [760, 60, 980, 440],
        selected: true,
      },
      {
        id: 'det-5',
        name: '牛番茄',
        category: 'vegetable',
        quantity: 2,
        unit: '顆',
        confidence: 'high',
        estimatedExpiryDays: 5,
        notes: '紅熟飽滿',
        box2d: [760, 520, 980, 850],
        selected: true,
      },
    ];
    setDetectedItems(demoItems);
    setOverallAssessment('冰箱食材豐富，包含優質蛋白質（雞蛋、豆腐、雞胸肉）與葉菜，其中高麗菜與板豆腐建議 2 天內優先烹調！');
    setUncertainPrompt('板豆腐包裝有少許冷凝水遮擋，已標記請手動確認。');
  };

  // Toggle item selection checkbox
  const toggleItemSelection = (id: string) => {
    setDetectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Update item field
  const updateItemField = (id: string, field: keyof DetectedItem, value: any) => {
    setDetectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Remove item from scan result
  const removeItem = (id: string) => {
    setDetectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Add custom manual item
  const handleAddCustomItem = () => {
    const newItem: DetectedItem = {
      id: `manual-${Date.now()}`,
      name: '新食材',
      category: 'vegetable',
      quantity: 1,
      unit: '份',
      confidence: 'high',
      estimatedExpiryDays: 5,
      notes: '手動補充',
      selected: true,
    };
    setDetectedItems((prev) => [newItem, ...prev]);
  };

  // Confirm and add selected items to actual inventory
  const handleConfirmAddToInventory = () => {
    const selected = detectedItems.filter((i) => i.selected);
    if (selected.length === 0) {
      alert('請至少勾選一項食材進行存入！');
      return;
    }

    const todayStr = new Date();
    const inventoryItems = selected.map((item) => {
      const expDate = new Date(todayStr);
      expDate.setDate(expDate.getDate() + (item.estimatedExpiryDays || 5));

      return {
        name: item.name.trim(),
        category: item.category,
        quantity: Number(item.quantity) || 1,
        unit: item.unit.trim() || '份',
        expiryDate: expDate.toISOString().split('T')[0],
        notes: item.notes,
        box2d: item.box2d,
      };
    });

    onAddIngredients(inventoryItems);
    setSuccessCount(selected.length);
  };

  const selectedCount = detectedItems.filter((i) => i.selected).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Camera className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-slate-800">照片辨識一鍵盤點</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-medium border border-emerald-500/20">
            多模態視覺 AI 邊界框偵測
          </span>
        </div>
        <p className="text-sm text-slate-600">
          拍照或上傳冰箱內部照片，AI 自動標註食材並框選辨識（如：雞蛋 4 顆、高麗菜半顆、板豆腐 1 塊），供您確認校正後一鍵建檔入庫。
        </p>
      </div>

      {/* Preset sample buttons for 1-click test */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200/60">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            快速體驗（無需上傳照片即可 1 鍵測試 AI 盤點）：
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_FRIDGE_IMAGES.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => {
                setSelectedImage(sample.dataUrl);
                setDetectedItems([]);
                setOverallAssessment('');
                setUncertainPrompt('');
                setErrorMessage(null);
                setSuccessCount(null);
              }}
              className={`text-xs px-3 py-2 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                selectedImage === sample.dataUrl
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span>📷 範例冰箱 #{idx + 1}：{sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Left photo viewer / Bounding box overlay; Right: Detected items table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image / Camera Container */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
            <span>冰箱影像檢視區</span>
            {detectedItems.length > 0 && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                已啟用邊界框互動標註
              </span>
            )}
          </h2>

          {/* Image & Bounding Box Canvas Overlay */}
          <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-300">
            {selectedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={selectedImage}
                  alt="冰箱照片"
                  className="w-full h-full object-contain"
                />

                {/* Render bounding boxes over the image if detected items have coordinates */}
                {detectedItems.map((item) => {
                  if (!item.box2d || item.box2d.length !== 4) return null;
                  const [ymin, xmin, ymax, xmax] = item.box2d;
                  const top = `${ymin / 10}%`;
                  const left = `${xmin / 10}%`;
                  const height = `${(ymax - ymin) / 10}%`;
                  const width = `${(xmax - xmin) / 10}%`;
                  const isHovered = hoveredItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredItemId(item.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      style={{ top, left, width, height }}
                      className={`absolute rounded-sm transition-all cursor-pointer pointer-events-auto ${
                        isHovered
                          ? 'border-3 border-emerald-400 bg-emerald-400/25 shadow-lg shadow-emerald-500/40 z-20 scale-102'
                          : item.selected
                          ? 'border-2 border-amber-300 bg-amber-400/10 z-10'
                          : 'border border-dashed border-slate-400/60 bg-slate-500/5'
                      }`}
                    >
                      <div
                        className={`absolute -top-6 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap transition-opacity ${
                          isHovered
                            ? 'bg-emerald-600 text-white opacity-100'
                            : 'bg-black/75 text-amber-200 opacity-90'
                        }`}
                      >
                        {item.name} {item.quantity} {item.unit}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">尚未選取任何冰箱照片</p>
              </div>
            )}
          </div>

          {/* Action buttons under image */}
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>上傳照片檔案</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>手機拍照輸入</span>
            </button>

            <button
              disabled={isScanning || !selectedImage}
              onClick={handleStartScan}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                isScanning || !selectedImage
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-700/20 hover:scale-[1.01]'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{scanStepMessage || 'AI 分析冰箱影像中...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>開始 AI 照片辨識盤點</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-400 text-center">
            提示：支援 JPG、PNG、WebP。建議光線均勻、食材無重疊遮擋，辨識效果最為精準。
          </p>
        </div>

        {/* Right: Scan Results & Editing Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>AI 盤點辨識清單</span>
                {detectedItems.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    偵測到 {detectedItems.length} 項食材
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                AI 盤點結果僅為初估，請檢視勾選或校正數量，確認後點擊底部按鈕存入冰箱。
              </p>
            </div>

            <button
              onClick={handleAddCustomItem}
              className="text-xs px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>手動補充食材</span>
            </button>
          </div>

          {/* Uncertainty or Assessment Notice */}
          {overallAssessment && (
            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">冰箱盤點速報：</p>
                <p>{overallAssessment}</p>
                {uncertainPrompt && (
                  <p className="text-amber-700 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline" />
                    {uncertainPrompt}
                  </p>
                )}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Success notice after adding */}
          {successCount !== null && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>成功儲存！</strong> 已將 {successCount} 項食材成功同步至您的冰箱庫存。
                </span>
              </div>
              <button
                onClick={onNavigateToFridge}
                className="font-bold underline text-emerald-700 hover:text-emerald-800 ml-2"
              >
                前往查看冰箱庫存 &rarr;
              </button>
            </div>
          )}

          {/* Detected Items List */}
          {detectedItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <Camera className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">尚未執行照片辨識</p>
              <p className="text-xs text-slate-400 mt-1">
                請在左側點選「開始 AI 照片辨識盤點」或使用上方快速範例體驗
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {detectedItems.map((item) => {
                const isHovered = hoveredItemId === item.id;
                const isLowConfidence = item.confidence === 'low' || item.confidence === 'medium';

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    className={`p-3 rounded-xl border transition-all ${
                      isHovered
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : item.selected
                        ? 'border-slate-200 bg-white hover:border-emerald-300'
                        : 'border-slate-200 bg-slate-50/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />

                      {/* Name input */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] text-slate-400 block">食材名稱</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                          className="w-full text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Quantity & Unit input */}
                      <div className="w-24">
                        <label className="text-[10px] text-slate-400 block">數量 / 單位</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemField(item.id, 'quantity', parseFloat(e.target.value) || 0)
                            }
                            className="w-12 text-sm text-right font-medium text-slate-800 bg-slate-100 rounded px-1.5 py-0.5 focus:outline-emerald-500"
                          />
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateItemField(item.id, 'unit', e.target.value)}
                            className="w-9 text-xs text-slate-600 bg-slate-100 rounded px-1 py-0.5 text-center focus:outline-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Expiry Estimate */}
                      <div className="w-20 hidden sm:block">
                        <label className="text-[10px] text-slate-400 block">預估保鮮</label>
                        <div className="flex items-center text-xs text-slate-700">
                          <input
                            type="number"
                            value={item.estimatedExpiryDays}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                'estimatedExpiryDays',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-8 text-xs text-right font-semibold bg-slate-100 rounded px-1 py-0.5 mr-1"
                          />
                          <span>天</span>
                        </div>
                      </div>

                      {/* Category select */}
                      <div className="w-24 hidden md:block">
                        <label className="text-[10px] text-slate-400 block">類別</label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            updateItemField(item.id, 'category', e.target.value as IngredientCategory)
                          }
                          className="text-xs bg-slate-100 rounded px-1.5 py-1 text-slate-700 focus:outline-emerald-500"
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

                      {/* Delete item button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="自盤點清單移除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Lower tags / Confidence / Notes */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pl-7">
                      <div className="flex items-center gap-2">
                        {isLowConfidence ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                            <AlertCircle className="w-3 h-3" />
                            請手動確認
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            高信心辨識
                          </span>
                        )}
                        {item.notes && <span className="text-slate-500 italic">{item.notes}</span>}
                      </div>

                      {item.box2d && (
                        <span className="text-emerald-700 font-medium">📍 已框選座標</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Batch Action */}
          {detectedItems.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-slate-600">
                已勾選 <span className="font-bold text-emerald-700">{selectedCount}</span> /{' '}
                {detectedItems.length} 項食材
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetectedItems([])}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  清除重測
                </button>

                <button
                  disabled={selectedCount === 0}
                  onClick={handleConfirmAddToInventory}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                    selectedCount === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 hover:scale-[1.01]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>一鍵確認並存入冰箱庫存（{selectedCount} 項）</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
