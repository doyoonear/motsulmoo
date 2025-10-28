import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Supabase Storage에 이미지 파일 업로드
 * @param file - 업로드할 파일
 * @param bucket - 스토리지 버킷 이름 (Supabase 대시보드에서 미리 생성 필요)
 * @returns 업로드된 파일의 경로 (path)
 */
export async function uploadImageToStorage(
  file: File,
  bucket: string = 'receipts'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`파일 업로드 실패: ${error.message}`);
  }

  // Private 버킷: path만 반환 (나중에 Signed URL로 접근)
  return data.path;
}

/**
 * Private 버킷의 파일에 대한 임시 접근 URL 생성 (Signed URL)
 * @param filePath - 파일 경로
 * @param bucket - 버킷 이름
 * @param expiresIn - URL 유효 시간 (초), 기본 1시간
 * @returns 임시 접근 가능한 Signed URL
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = 'receipts',
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Signed URL 생성 실패: ${error.message}`);
  }

  return data.signedUrl;
}
