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

    if (!extractedText) {
      return NextResponse.json(
        { error: '이미지에서 텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Gemini API로 재료 분석 및 분류
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
다음은 구매 내역에서 추출한 텍스트입니다. 이 텍스트에서 식재료만 추출하고, 각 재료에 대해 다음 정보를 JSON 배열 형태로 반환해주세요.

추출한 텍스트:
${extractedText}

각 재료에 대해 다음 형식으로 반환:
[
  {
    "name": "재료 이름",
    "amount": 용량(숫자만),
    "unit": "g" 또는 "ml",
    "category": "카테고리"
  }
]

카테고리는 다음 중 하나여야 합니다:
- 채소류
- 육류
- 해산물
- 버섯류
- 달걀·가공단백류
- 곡물·면류
- 유제품
- 가공식품
- 조미료·양념류
- 기타·간식류

중요:
1. 식재료가 아닌 항목(총액, 날짜, 매장명 등)은 제외
2. 용량이 명시되지 않은 경우 일반적인 용량을 추정 (예: 양파 1개 = 200g)
3. g 또는 ml로 통일
4. JSON 배열만 반환하고 다른 텍스트는 포함하지 마세요
5. 만약 식재료를 찾을 수 없다면 빈 배열 []을 반환하세요
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

    const ingredients = JSON.parse(cleanedResponse);

    return NextResponse.json({
      success: true,
      extractedText,
      ingredients,
    });
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    return NextResponse.json(
      {
        error: '이미지 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
