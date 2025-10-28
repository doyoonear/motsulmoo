import { prisma } from '@/lib/prisma';
import type { AnalyzedIngredient } from './ingredient-analyzer.service';
import { IngredientCategory as PrismaIngredientCategory, IngredientUnit } from '@prisma/client';

// 한글 카테고리를 Prisma Enum으로 매핑
const CATEGORY_MAP: Record<string, PrismaIngredientCategory> = {
  '채소류': PrismaIngredientCategory.VEGETABLE,
  '육류': PrismaIngredientCategory.MEAT,
  '해산물': PrismaIngredientCategory.SEAFOOD,
  '버섯류': PrismaIngredientCategory.MUSHROOM,
  '달걀·가공단백류': PrismaIngredientCategory.EGG_PROTEIN,
  '곡물·면류': PrismaIngredientCategory.GRAIN_NOODLE,
  '유제품': PrismaIngredientCategory.DAIRY,
  '가공식품': PrismaIngredientCategory.PROCESSED,
  '조미료·양념류': PrismaIngredientCategory.SEASONING,
  '기타·간식류': PrismaIngredientCategory.SNACK_ETC,
};

// 단위를 Prisma Enum으로 매핑
const UNIT_MAP: Record<string, IngredientUnit> = {
  'g': IngredientUnit.G,
  'ml': IngredientUnit.ML,
};

interface CreateReceiptParams {
  imageUrl: string;
  ocrRawText: string;
  purchaseDate?: Date;
  storeName?: string;
  ingredients: AnalyzedIngredient[];
}

/**
 * 구매내역과 재료를 DB에 저장
 * @param params - 구매내역 정보
 * @returns 생성된 구매내역 ID (PurchaseReceipt ID)
 */
export async function createPurchaseWithIngredients(
  params: CreateReceiptParams
): Promise<string> {
  const { imageUrl, ocrRawText, purchaseDate, storeName, ingredients } = params;

  // 트랜잭션으로 구매내역과 재료 모두 저장
  const receipt = await prisma.purchaseReceipt.create({
    data: {
      imageUrl,
      ocrRawText,
      purchaseDate,
      storeName,
      fridgeItems: {
        create: ingredients.map((ingredient) => ({
          name: ingredient.name,
          category: CATEGORY_MAP[ingredient.category],
          amount: ingredient.amount,
          unit: UNIT_MAP[ingredient.unit],
          purchasedAt: purchaseDate,
        })),
      },
    },
    include: {
      fridgeItems: true,
    },
  });

  return receipt.id;
}
