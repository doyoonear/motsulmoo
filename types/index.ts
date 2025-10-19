// 재료 카테고리 타입
export type IngredientCategory =
  | '채소류'
  | '육류'
  | '해산물'
  | '버섯류'
  | '달걀·가공단백류'
  | '곡물·면류'
  | '유제품'
  | '가공식품'
  | '조미료·양념류'
  | '기타·간식류';

// 재료 타입
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  amount: number;
  unit: 'g' | 'ml';
}

// 레시피 타입
export interface Recipe {
  id: string;
  name: string;
  cookingTime: string;
  mainIngredients: Ingredient[];
  additionalIngredients: Ingredient[];
  seasonings: Ingredient[];
  instructions: string[];
  imageUrl: string;
  createdAt: Date;
  variants?: RecipeVariant[];
}

// 레시피 변형 타입
export interface RecipeVariant {
  id: string;
  name: string;
  parentRecipeId: string;
  modifiedIngredients: {
    original: Ingredient;
    modified: Ingredient;
  }[];
  createdAt: Date;
}

// 냉장고 아이템 타입
export interface FridgeItem extends Ingredient {
  purchasedAt?: Date;
  expiresAt?: Date;
}

// 장보기 추천 타입
export interface ShoppingRecommendation {
  date: Date;
  recipes: {
    recipe: Recipe;
    missingIngredients: Ingredient[];
  }[];
}

// 네비게이션 타입
export type NavRoute = '/fridge' | '/add' | '/recipe-book' | '/shopping' | '/';
