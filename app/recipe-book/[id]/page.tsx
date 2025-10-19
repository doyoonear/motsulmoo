'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import BottomNavigation from '@/components/BottomNavigation';
import { Recipe, Ingredient } from '@/types';

// Mock 데이터
const MOCK_RECIPE: Recipe = {
  id: '1',
  name: '김치찌개',
  cookingTime: '30min',
  mainIngredients: [
    { id: '1', name: '김치', category: '채소류', amount: 300, unit: 'g' },
    { id: '2', name: '돼지고기', category: '육류', amount: 200, unit: 'g' },
  ],
  additionalIngredients: [
    { id: '3', name: '두부', category: '달걀·가공단백류', amount: 150, unit: 'g' },
    { id: '4', name: '대파', category: '채소류', amount: 50, unit: 'g' },
  ],
  seasonings: [
    { id: '5', name: '고춧가루', category: '조미료·양념류', amount: 20, unit: 'g' },
    { id: '6', name: '간장', category: '조미료·양념류', amount: 30, unit: 'ml' },
    { id: '7', name: '다진 마늘', category: '조미료·양념류', amount: 10, unit: 'g' },
  ],
  instructions: [
    '김치는 한입 크기로 썰고, 돼지고기는 먹기 좋은 크기로 자릅니다.',
    '냄비에 돼지고기를 넣고 중불에서 볶습니다.',
    '고기가 익으면 김치를 넣고 함께 볶아줍니다.',
    '물을 넣고 끓이다가 두부와 양념을 넣습니다.',
    '15분 정도 끓인 후 대파를 넣고 마무리합니다.',
  ],
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
};

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const router = useRouter();
  const [recipe] = useState<Recipe>(MOCK_RECIPE);
  const [showVariantBottomSheet, setShowVariantBottomSheet] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [variantName, setVariantName] = useState('');

  const handleIngredientLongPress = (ingredient: Ingredient) => {
    // TODO: 재료 수정하여 변형 레시피 생성
    setSelectedIngredient(ingredient);
    setShowVariantBottomSheet(true);
  };

  const handleSaveVariant = () => {
    // TODO: 변형 레시피 저장 API 호출
    console.log('변형 레시피 저장:', { variantName, selectedIngredient });
    setShowVariantBottomSheet(false);
    setSelectedIngredient(null);
    setVariantName('');
  };

  const renderIngredient = (ingredient: Ingredient) => (
    <button
      key={ingredient.id}
      className={styles.ingredientTag}
      onContextMenu={(e) => {
        e.preventDefault();
        handleIngredientLongPress(ingredient);
      }}
      onTouchStart={(e) => {
        const timeout = setTimeout(() => handleIngredientLongPress(ingredient), 500);
        e.currentTarget.dataset.timeout = timeout.toString();
      }}
      onTouchEnd={(e) => {
        const timeout = e.currentTarget.dataset.timeout;
        if (timeout) clearTimeout(Number(timeout));
      }}
    >
      {ingredient.name} {ingredient.amount}
      {ingredient.unit}
    </button>
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.backIcon}>
            <polyline points="15 18 9 12 15 6" strokeWidth="2" />
          </svg>
        </button>

        <div className={styles.imageSection}>
          <img src={recipe.imageUrl} alt={recipe.name} className={styles.image} />
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>{recipe.name}</h1>
            <span className={styles.time}>⏱️ {recipe.cookingTime}</span>
          </div>

          {recipe.variants && recipe.variants.length > 0 && (
            <div className={styles.variantsSection}>
              <span className={styles.variantLabel}>변형 레시피:</span>
              {recipe.variants.map((variant) => (
                <span key={variant.id} className={styles.variantTag}>
                  {variant.name}
                </span>
              ))}
            </div>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>메인 재료</h2>
            <div className={styles.ingredientList}>
              {recipe.mainIngredients.map(renderIngredient)}
            </div>
          </section>

          {recipe.additionalIngredients.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>추가 재료</h2>
              <div className={styles.ingredientList}>
                {recipe.additionalIngredients.map(renderIngredient)}
              </div>
            </section>
          )}

          {recipe.seasonings.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>양념</h2>
              <div className={styles.ingredientList}>{recipe.seasonings.map(renderIngredient)}</div>
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>조리 방법</h2>
            <ol className={styles.instructions}>
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className={styles.instruction}>
                  {instruction}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      {showVariantBottomSheet && (
        <>
          <div className={styles.dimmed} onClick={() => setShowVariantBottomSheet(false)} />
          <div className={styles.bottomSheet}>
            <div className={styles.bottomSheetHandle} />
            <h3 className={styles.bottomSheetTitle}>변형 레시피 저장</h3>
            <p className={styles.bottomSheetDescription}>
              선택한 재료: <strong>{selectedIngredient?.name}</strong>
            </p>
            <input
              type="text"
              placeholder="변형 레시피 이름 (예: 매콤한 버전)"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              className={styles.input}
            />
            <div className={styles.bottomSheetActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowVariantBottomSheet(false)}
              >
                취소
              </button>
              <button
                className={styles.saveButton}
                onClick={handleSaveVariant}
                disabled={!variantName}
              >
                저장
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNavigation />
    </div>
  );
}
