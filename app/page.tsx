'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import RecipeCard from '@/components/RecipeCard';
import BottomNavigation from '@/components/BottomNavigation';
import { Recipe } from '@/types';

// Mock 데이터
const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    name: '김치찌개',
    cookingTime: '30min',
    mainIngredients: [
      { id: '1', name: '김치', category: '채소류', amount: 300, unit: 'g' },
      { id: '2', name: '돼지고기', category: '육류', amount: 200, unit: 'g' },
    ],
    additionalIngredients: [],
    seasonings: [],
    instructions: [],
    imageUrl: '/placeholder-recipe.jpg',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: '된장찌개',
    cookingTime: '25min',
    mainIngredients: [
      { id: '3', name: '두부', category: '달걀·가공단백류', amount: 150, unit: 'g' },
      { id: '4', name: '호박', category: '채소류', amount: 100, unit: 'g' },
    ],
    additionalIngredients: [],
    seasonings: [],
    instructions: [],
    imageUrl: '/placeholder-recipe.jpg',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: '불고기',
    cookingTime: '40min',
    mainIngredients: [
      { id: '5', name: '소고기', category: '육류', amount: 300, unit: 'g' },
      { id: '6', name: '양파', category: '채소류', amount: 100, unit: 'g' },
    ],
    additionalIngredients: [],
    seasonings: [],
    instructions: [],
    imageUrl: '/placeholder-recipe.jpg',
    createdAt: new Date(),
  },
];

const MOCK_SHOPPING_RECOMMENDATIONS = [
  {
    day: '수요일',
    recipe: '제육볶음',
    missingIngredients: ['돼지고기', '고추장'],
  },
  {
    day: '목요일',
    recipe: '된장찌개',
    missingIngredients: ['두부'],
  },
  {
    day: '금요일',
    recipe: '김치볶음밥',
    missingIngredients: ['김치', '참기름'],
  },
];

export default function Home() {
  const router = useRouter();

  const handleRecipeClick = (recipeId: string) => {
    // TODO: 레시피 상세 페이지로 이동
    router.push(`/recipe-book/${recipeId}`);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>오늘은 뭘 먹을까?</h2>
          <div className={styles.recipeGrid}>
            {MOCK_RECIPES.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe.id)}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>이번주 장바구니 추천</h2>
          <div className={styles.shoppingList}>
            {MOCK_SHOPPING_RECOMMENDATIONS.map((item, index) => (
              <div key={index} className={styles.shoppingItem}>
                <div className={styles.shoppingDay}>{item.day}</div>
                <div className={styles.shoppingRecipe}>{item.recipe}</div>
                <div className={styles.shoppingMissing}>
                  부족한 재료: {item.missingIngredients.join(', ')}
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
