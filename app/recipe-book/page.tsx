'use client';

import { useState } from 'react';
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
    variants: [
      {
        id: 'v1',
        name: '매콤한 버전',
        parentRecipeId: '1',
        modifiedIngredients: [],
        createdAt: new Date(),
      },
    ],
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
  {
    id: '4',
    name: '제육볶음',
    cookingTime: '35min',
    mainIngredients: [
      { id: '7', name: '돼지고기', category: '육류', amount: 400, unit: 'g' },
      { id: '8', name: '양파', category: '채소류', amount: 150, unit: 'g' },
    ],
    additionalIngredients: [],
    seasonings: [],
    instructions: [],
    imageUrl: '/placeholder-recipe.jpg',
    createdAt: new Date(),
  },
];

export default function RecipeBookPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRecipeClick = (recipeId: string) => {
    // TODO: 레시피 상세 페이지로 이동
    router.push(`/recipe-book/${recipeId}`);
  };

  const filteredRecipes = MOCK_RECIPES.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>레시피북</h1>

        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" />
            </svg>
            <input
              type="text"
              placeholder="레시피 이름으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={styles.clearButton}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.clearIcon}>
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={styles.recipeList}>
          {filteredRecipes.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>검색 결과가 없습니다</p>
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <div key={recipe.id} className={styles.recipeItem}>
                <RecipeCard recipe={recipe} onClick={() => handleRecipeClick(recipe.id)} />
                {recipe.variants && recipe.variants.length > 0 && (
                  <div className={styles.variants}>
                    <span className={styles.variantLabel}>변형 레시피:</span>
                    {recipe.variants.map((variant) => (
                      <span key={variant.id} className={styles.variantTag}>
                        {variant.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
