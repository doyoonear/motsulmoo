'use client';

import { useState } from 'react';
import styles from './page.module.css';
import BottomNavigation from '@/components/BottomNavigation';
import { Recipe, Ingredient } from '@/types';

interface DayRecommendation {
  date: Date;
  dayOfWeek: string;
  recipe: Recipe;
  missingIngredients: Ingredient[];
}

// Mock 데이터
const MOCK_RECOMMENDATIONS: DayRecommendation[] = [
  {
    date: new Date('2025-12-20'),
    dayOfWeek: '오늘',
    recipe: {
      id: '1',
      name: '크림 버섯 파스타',
      cookingTime: '35min',
      mainIngredients: [],
      additionalIngredients: [],
      seasonings: [],
      instructions: [],
      imageUrl: '/placeholder-recipe.jpg',
      createdAt: new Date(),
    },
    missingIngredients: [
      { id: '1', name: '크림', category: '유제품', amount: 200, unit: 'ml' },
      { id: '2', name: '파슬리', category: '채소류', amount: 10, unit: 'g' },
    ],
  },
  {
    date: new Date('2025-12-21'),
    dayOfWeek: '내일',
    recipe: {
      id: '2',
      name: '허니 갈릭 치킨',
      cookingTime: '45min',
      mainIngredients: [],
      additionalIngredients: [],
      seasonings: [],
      instructions: [],
      imageUrl: '/placeholder-recipe.jpg',
      createdAt: new Date(),
    },
    missingIngredients: [{ id: '3', name: '생강', category: '채소류', amount: 20, unit: 'g' }],
  },
];

export default function ShoppingPage() {
  const [recommendations, setRecommendations] = useState<DayRecommendation[]>(MOCK_RECOMMENDATIONS);

  // 모든 부족한 재료를 모아서 중복 제거
  const allMissingIngredients = recommendations.reduce((acc, day) => {
    day.missingIngredients.forEach((ingredient) => {
      const existing = acc.find((item) => item.name === ingredient.name);
      if (existing) {
        existing.amount += ingredient.amount;
      } else {
        acc.push({ ...ingredient });
      }
    });
    return acc;
  }, [] as Ingredient[]);

  const handleChangeRecipe = (date: Date) => {
    // TODO: 해당 날짜에 다른 레시피 추천 API 호출
    console.log('다른 레시피 추천:', date);
    alert('다른 레시피를 추천합니다.');
  };

  const handleAddToCart = () => {
    // TODO: 장바구니 저장 API 호출
    console.log('장바구니 저장');
    alert('장바구니에 저장되었습니다.');
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>장보기 도우미</h1>
          <button className={styles.shareButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.shareIcon}>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeWidth="2" />
              <polyline points="16 6 12 2 8 6" strokeWidth="2" />
              <line x1="12" y1="2" x2="12" y2="15" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>추천 장바구니 목록</h2>
          <div className={styles.shoppingCart}>
            <div className={styles.cartHeader}>
              <p className={styles.cartDescription}>이번 주 필요한 재료</p>
              <span className={styles.cartBadge}>11개 항목</span>
            </div>
            <div className={styles.ingredientTags}>
              {allMissingIngredients.map((ingredient) => (
                <span key={ingredient.id} className={styles.ingredientTag}>
                  {ingredient.name}
                </span>
              ))}
              <span className={styles.ingredientTag}>생강</span>
              <span className={styles.ingredientTag}>새강</span>
              <span className={styles.ingredientTag}>페티 치즈</span>
              <span className={styles.ingredientTag}>올리브</span>
              <span className={styles.ingredientTag}>코코넛 밀크</span>
              <span className={styles.ingredientTag}>커리 파우더</span>
              <span className={styles.ingredientTag}>건과류</span>
              <span className={styles.ingredientTag}>연어</span>
              <span className={styles.ingredientTag}>레몬</span>
            </div>
            <button className={styles.saveCartButton} onClick={handleAddToCart}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.cartIcon}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeWidth="2" />
                <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
                <path d="M16 10a4 4 0 0 1-8 0" strokeWidth="2" />
              </svg>
              장바구니 목록 저장
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>주간 레시피 캘린더</h2>
          <div className={styles.calendar}>
            {recommendations.map((day, index) => (
              <div key={day.date.toISOString()} className={styles.dayCard}>
                <div className={styles.dayHeader}>
                  <div className={styles.dayLabel}>
                    <span className={styles.dayOfWeek}>{day.dayOfWeek}</span>
                    <span className={styles.date}>{day.date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</span>
                  </div>
                  <button
                    className={styles.changeButton}
                    onClick={() => handleChangeRecipe(day.date)}
                  >
                    다른 요리
                  </button>
                </div>

                <div className={styles.recipeCard}>
                  <div className={styles.recipeIcon}>✓</div>
                  <div className={styles.recipeContent}>
                    <h3 className={styles.recipeName}>{day.recipe.name}</h3>
                    <div className={styles.missingInfo}>
                      <span className={styles.missingLabel}>부족한 재료:</span>
                      <div className={styles.missingTags}>
                        {day.missingIngredients.map((ingredient) => (
                          <span key={ingredient.id} className={styles.missingTag}>
                            {ingredient.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
