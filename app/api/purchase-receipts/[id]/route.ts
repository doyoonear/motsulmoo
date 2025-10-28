import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 구매내역 삭제 API
 * Endpoint: DELETE /api/purchase-receipts/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. 구매내역 조회 (이미지 경로 확인용)
    const { data: receipt, error: fetchError } = await supabase
      .from('PurchaseReceipt')
      .select('imageUrl')
      .eq('id', id)
      .single();

    if (fetchError || !receipt) {
      return NextResponse.json(
        { error: '구매내역을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. Storage에서 이미지 삭제
    const { error: storageError } = await supabase.storage
      .from('receipts')
      .remove([receipt.imageUrl]);

    if (storageError) {
      console.error('Storage 삭제 실패:', storageError);
      // Storage 삭제 실패해도 DB는 삭제 진행
    }

    // 3. DB에서 구매내역 삭제 (연관된 FridgeItem도 CASCADE로 자동 삭제)
    const { error: deleteError } = await supabase
      .from('PurchaseReceipt')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`구매내역 삭제 실패: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '구매내역이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Error deleting purchase receipt:', error);
    return NextResponse.json(
      {
        error: '구매내역 삭제 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
