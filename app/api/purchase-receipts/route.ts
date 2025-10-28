import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSignedUrl } from '@/lib/supabase';

/**
 * 구매내역 목록 조회 API
 * Endpoint: GET /api/purchase-receipts
 */
export async function GET() {
  try {
    // 1. 구매내역 조회 (최신순)
    const { data: receipts, error } = await supabase
      .from('PurchaseReceipt')
      .select('id, imageUrl, purchaseDate, storeName, createdAt')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`구매내역 조회 실패: ${error.message}`);
    }

    // 2. 각 이미지에 대한 Signed URL 생성
    const receiptsWithSignedUrls = await Promise.all(
      (receipts || []).map(async (receipt) => {
        try {
          const signedUrl = await getSignedUrl(receipt.imageUrl, 'receipts', 3600);
          return {
            ...receipt,
            signedUrl,
          };
        } catch (err) {
          console.error(`Signed URL 생성 실패 for ${receipt.imageUrl}:`, err);
          return {
            ...receipt,
            signedUrl: null,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      receipts: receiptsWithSignedUrls,
    });
  } catch (error) {
    console.error('Error fetching purchase receipts:', error);
    return NextResponse.json(
      {
        error: '구매내역 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
