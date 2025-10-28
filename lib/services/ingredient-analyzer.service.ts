import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IngredientCategory } from '@/types';

export interface AnalyzedIngredient {
  name: string;
  amount: number;
  unit: 'g' | 'ml';
  category: IngredientCategory;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const PURCHASE_ANALYSIS_PROMPT = `
다음은 구매내역에서 추출한 텍스트입니다. 이 텍스트에서 식재료만 추출하고, 각 재료에 대해 다음 정보를 JSON 배열 형태로 반환해주세요.

추출한 텍스트:
{extractedText}

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

/**
 * Gemini API를 사용하여 OCR 텍스트에서 재료 정보 추출 및 분석
 * @param extractedText - OCR로 추출된 텍스트
 * @returns 분석된 재료 목록
 */
export async function analyzeIngredientsFromText(
  extractedText: string
): Promise<AnalyzedIngredient[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = PURCHASE_ANALYSIS_PROMPT.replace('{extractedText}', extractedText);

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  const ingredients = parseGeminiResponse(responseText);

  return ingredients;
}

/**
 * Gemini 응답에서 JSON 파싱 (마크다운 코드 블록 제거)
 * @param responseText - Gemini API 응답 텍스
 * @returns 파싱된 재료 배열
 */
function parseGeminiResponse(responseText: string): AnalyzedIngredient[] {
  let cleanedResponse = responseText.trim();

  // 마크다운 코드 블록 제거
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
  }

  try {
    const ingredients: AnalyzedIngredient[] = JSON.parse(cleanedResponse);
    return ingredients;
  } catch (error) {
    throw new Error(`재료 분석 결과 파싱 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
