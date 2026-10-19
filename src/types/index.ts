export type IngredientCategory =
  | 'vegetable'
  | 'meat'
  | 'seafood'
  | 'dairy_egg'
  | 'fruit'
  | 'staple'
  | 'condiment'
  | 'other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  expiryDate: string; // ISO date string YYYY-MM-DD
  addedAt: string;
  notes?: string;
  box2d?: number[]; // [ymin, xmin, ymax, xmax] 0-1000
}

export interface DetectedItem {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  confidence: 'high' | 'medium' | 'low';
  estimatedExpiryDays: number;
  notes?: string;
  box2d?: number[]; // [ymin, xmin, ymax, xmax] 0-1000
  selected: boolean;
}

export type ApplianceType =
  | 'rice_cooker'
  | 'air_fryer'
  | 'microwave'
  | 'single_gas_stove'
  | 'no_heat';

export type DietaryStyle =
  | 'balanced'
  | 'high_protein'
  | 'keto_low_carb'
  | 'vegetarian'
  | 'light';

export interface DietaryPreferences {
  appliances: ApplianceType[];
  dietaryStyle: DietaryStyle;
  excludedIngredients: string[];
  maxTimeMinutes: 15 | 30 | 45;
  servings: number;
  prioritizeExpiring: boolean;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  inInventory: boolean;
  inventoryRemaining?: number;
  needToBuy: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  applianceUsed: string;
  dietaryTags: string[];
  requiredIngredients: RecipeIngredient[];
  seasonings: string[];
  steps: RecipeStep[];
  nutritionSummary: NutritionSummary;
  swapDiffHighlight?: string;
}

export interface DeductionItem {
  name: string;
  recipeAmount: number;
  unit: string;
  originalInventory: number;
  actualAmount: number;
  remainingInventory: number;
  matchedInventoryId?: string;
}

export interface CookingHistoryRecord {
  id: string;
  requestId: string;
  recipeTitle: string;
  completedAt: string;
  servings: number;
  applianceUsed: string;
  deductedItems: {
    name: string;
    usedAmount: number;
    unit: string;
    remaining: number;
  }[];
  notes?: string;
}

export interface InventoryLog {
  id: string;
  timestamp: string;
  type: 'scan_add' | 'manual_add' | 'manual_edit' | 'manual_delete' | 'cooking_deduct';
  title: string;
  details: string;
}
