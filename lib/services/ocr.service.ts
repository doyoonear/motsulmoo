/**
 * Google Cloud Vision API를 사용한 OCR 서비스
 */

interface VisionResponse {
  responses?: Array<{
    error?: { message: string };
    fullTextAnnotation?: {
      text: string;
    };
  }>;
}

/**
 * 이미지 파일을 Base64로 변환
 */
export async function convertFileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}

/**
 * Google Cloud Vision API를 사용하여 이미지에서 텍스트 추출
 * @param base64Image - Base64로 인코딩된 이미지
 * @returns 추출된 텍스트
 */
export async function extractTextFromImage(base64Image: string): Promise<string> {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    }
  );

  const data: VisionResponse = await response.json();

  if (data.responses?.[0]?.error) {
    throw new Error(data.responses[0].error.message);
  }

  const extractedText = data.responses?.[0]?.fullTextAnnotation?.text || '';

  if (!extractedText) {
    throw new Error('이미지에서 텍스트를 추출할 수 없습니다.');
  }

  return extractedText;
}
