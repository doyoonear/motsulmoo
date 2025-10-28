import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToStorage } from '@/lib/supabase';
import { convertFileToBase64, extractTextFromImage } from '@/lib/services/ocr.service';
import { analyzeIngredientsFromText } from '@/lib/services/ingredient-analyzer.service';
import { createPurchaseWithIngredients } from '@/lib/services/receipt.service';

/**
 * 구매내역 이미지 분석 API
 * Endpoint: POST /api/analyze-purchase
 *
 * 실행 단계:
 * 1. 이미지 파일 검증
 * 2. Supabase Storage에 이미지 업로드
 * 3. OCR로 텍스트 추출
 * 4. AI로 재료 분석
 * 5. DB에 구매내역 및 재료 저장
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 이미지 파일 검증
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 2. Supabase Storage에 이미지 업로드 (Private 버킷)
    const imagePath = await uploadImageToStorage(file, 'receipts');

    // 3. OCR로 텍스트 추출
    const base64Image = await convertFileToBase64(file);
    const extractedText = await extractTextFromImage(base64Image);

    // 4. AI로 재료 분석
    const analyzedIngredients = await analyzeIngredientsFromText(extractedText);

    // 5. DB에 구매내역 및 재료 저장 (이미지 경로 저장)
    const receiptId = await createPurchaseWithIngredients({
      imageUrl: imagePath, // path 저장 (나중에 Signed URL로 변환)
      ocrRawText: extractedText,
      ingredients: analyzedIngredients,
    });

    return NextResponse.json({
      success: true,
      receiptId,
      imagePath, // path 반환
      extractedText,
      ingredients: analyzedIngredients,
    });
  } catch (error) {
    console.error('Error analyzing purchase:', error);
    return NextResponse.json(
      {
        error: '구매내역 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
