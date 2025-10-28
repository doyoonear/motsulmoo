// 색상 상수
export const COLORS = {
  PRIMARY: 'rgb(109, 174, 181)',
  PRIMARY_DARK: 'rgb(105, 175, 183)',
  SECONDARY: '#FF9800',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F5F5F5',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  TEXT_HINT: '#BDBDBD',
  BORDER: '#E0E0E0',
  ERROR: '#F44336',
  SUCCESS: '#4CAF50',
  WARNING: '#FFC107',
  DIMMED: 'rgba(0, 0, 0, 0.5)',
} as const;

// 재료 카테고리 매핑 (단일 소스)
export const CATEGORY_MAP = {
  VEGETABLE: '채소류',
  MEAT: '육류',
  SEAFOOD: '해산물',
  MUSHROOM: '버섯류',
  EGG_PROTEIN: '달걀·가공단백류',
  GRAIN_NOODLE: '곡물·면류',
  DAIRY: '유제품',
  PROCESSED: '가공식품',
  SEASONING: '조미료·양념류',
  SNACK_ETC: '기타·간식류',
} as const;

// ENUM 값 목록
export const CATEGORY_TYPE = Object.keys(CATEGORY_MAP) as (keyof typeof CATEGORY_MAP)[];

// 한글 라벨 목록
export const CATEGORY_LABEL = Object.values(CATEGORY_MAP);

// 한글 → ENUM 변환 함수
export const getCategoryType = (label: string): string => {
  const entry = Object.entries(CATEGORY_MAP).find(([_, value]) => value === label);
  return entry ? entry[0] : label;
};

// ENUM → 한글 변환 함수
export const getCategoryLabel = (type: string): string => {
  return CATEGORY_MAP[type as keyof typeof CATEGORY_MAP] || type;
};

// 재료 카테고리 목록 (기존 호환성 유지)
export const INGREDIENT_CATEGORIES = CATEGORY_LABEL;

// 재료 단위 매핑 (단일 소스)
export const UNIT_MAP = {
  G: 'g',
  ML: 'ml',
} as const;

// ENUM 값 목록
export const UNIT_TYPE = Object.keys(UNIT_MAP) as (keyof typeof UNIT_MAP)[];

// 단위 라벨 목록
export const UNIT_LABEL = Object.values(UNIT_MAP);

// 단위 → ENUM 변환 함수
export const getUnitType = (label: string): string => {
  const entry = Object.entries(UNIT_MAP).find(([_, value]) => value === label);
  return entry ? entry[0] : label;
};

// ENUM → 단위 변환 함수
export const getUnitLabel = (type: string): string => {
  return UNIT_MAP[type as keyof typeof UNIT_MAP] || type;
};

// 네비게이션 메뉴
export const NAV_ITEMS = {
  FRIDGE: {
    label: '냉장고',
    route: '/fridge',
  },
  ADD: {
    label: '추가',
    route: '/add',
  },
  RECIPE_BOOK: {
    label: '레시피북',
    route: '/recipe-book',
  },
  SHOPPING: {
    label: '장보기',
    route: '/shopping',
  },
} as const;

// 토스트 메시지
export const TOAST_MESSAGES = {
  RECIPE_ANALYZING: '레시피가 분석 완료되면 알려드릴게요!',
  RECIPE_ANALYSIS_COMPLETE: '레시피 분석 완료!',
  RECIPE_ANALYZING_IN_PROGRESS: '레시피를 분석중입니다',
} as const;

// 애니메이션 시간
export const ANIMATION_DURATION = {
  TOAST: 3000,
  SPINNER: 1000,
} as const;
