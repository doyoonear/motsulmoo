// 색상 상수
export const COLORS = {
  PRIMARY: '#4CAF50',
  PRIMARY_DARK: '#45a049',
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
  PROGRESS_BAR: '#4CAF50',
} as const;

// 재료 카테고리
export const INGREDIENT_CATEGORIES = [
  '채소류',
  '육류',
  '해산물',
  '버섯류',
  '달걀·가공단백류',
  '곡물·면류',
  '유제품',
  '가공식품',
  '조미료·양념류',
  '기타·간식류',
] as const;

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
