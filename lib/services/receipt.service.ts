import { supabase } from '@/lib/supabase';
import type { AnalyzedIngredient } from './ingredient-analyzer.service';

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

  // 1. 구매내역 저장
  const { data: receipt, error: receiptError } = await supabase
    .from('PurchaseReceipt')
    .insert({
      imageUrl,
      ocrRawText: ocrRawText || null,
      purchaseDate: purchaseDate?.toISOString() || null,
      storeName: storeName || null,
    })
    .select()
    .single();

  if (receiptError || !receipt) {
    throw new Error(`구매내역 저장 실패: ${receiptError?.message || 'Unknown error'}`);
  }

  // 2. 재료 저장 (receiptId 연결)
  if (ingredients.length > 0) {
    const { error: itemsError } = await supabase
      .from('FridgeItem')
      .insert(
        ingredients.map((ingredient) => ({
          receiptId: receipt.id,
          name: ingredient.name,
          category: ingredient.category,
          amount: ingredient.amount,
          unit: ingredient.unit,
          purchasedAt: purchaseDate?.toISOString() || null,
        }))
      );

    if (itemsError) {
      throw new Error(`재료 저장 실패: ${itemsError.message}`);
    }
  }

  return receipt.id;
}
