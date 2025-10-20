import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: '이미지 파일이 필요합니다.' }, { status: 400 });
    }

    // 파일을 base64로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Google Cloud Vision API로 OCR 수행
    const visionResponse = await fetch(
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
                {
                  type: 'OBJECT_LOCALIZATION',
                  maxResults: 10,
                },
              ],
            },
          ],
        }),
      }
    );

    const visionData = await visionResponse.json();
    console.log('visionData:', JSON.stringify(visionData, null, 2));

    if (visionData.responses?.[0]?.error) {
      throw new Error(visionData.responses[0].error.message);
    }

    const extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text || '';
    const objectAnnotations = visionData.responses?.[0]?.localizedObjectAnnotations || [];

    if (!extractedText) {
      return NextResponse.json(
        { error: '이미지에서 텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 요리 이미지 영역 찾기 (Food 객체 감지)
    let croppedImageBase64 = '';
    const foodObject = objectAnnotations.find(
      (obj: any) => obj.name.toLowerCase() === 'food' || obj.name.toLowerCase() === 'dish'
    );

    if (foodObject && foodObject.boundingPoly) {
      // 원본 이미지를 크롭
      const vertices = foodObject.boundingPoly.normalizedVertices;
      if (vertices && vertices.length >= 4) {
        // 이미지 크롭 처리 (Sharp 라이브러리 사용하거나 클라이언트에서 처리)
        // 여기서는 bounding box 정보만 전달
        croppedImageBase64 = base64Image; // 실제 크롭은 추후 구현
      }
    }

    // Gemini API로 레시피 분석 및 분류
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
다음은 레시피 이미지에서 추출한 텍스트입니다. 이 텍스트에서 레시피 정보를 추출하고, 다음 정보를 JSON 형태로 반환해주세요.

추출한 텍스트:
${extractedText}

다음 형식으로 반환:
{
  "name": "요리 이름",
  "cookingTime": "소요 시간 (예: 30min, 1h, 1h 10min)",
  "mainIngredients": ["메인 재료1", "메인 재료2", "메인 재료3"],
  "additionalIngredients": ["추가 재료1", "추가 재료2"]
}

중요:
1. 요리 이름은 한글로 추출
2. 소요 시간은 "30min", "1h", "1h 10min" 형태로 표현
3. 메인 재료는 가장 중요한 3-5개 재료
4. 추가 재료는 양념, 부재료 등
5. JSON만 반환하고 다른 텍스트는 포함하지 마세요
6. 만약 레시피 정보를 찾을 수 없다면 null을 반환하세요
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // JSON 파싱 (마크다운 코드 블록 제거)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const recipe = JSON.parse(cleanedResponse);

    if (!recipe) {
      return NextResponse.json(
        { error: '레시피 정보를 추출할 수 없습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      recipe: {
        ...recipe,
        image: croppedImageBase64 || base64Image,
        thumbnail: base64Image,
      },
    });
  } catch (error) {
    console.error('Error analyzing recipe:', error);
    return NextResponse.json(
      {
        error: '레시피 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
