'use client';

import { Recipe } from '@/types';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  recipe: Recipe;
  missingIngredients?: string[];
  onClick?: () => void;
}

export default function RecipeCard({ recipe, missingIngredients, onClick }: RecipeCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        <img src={recipe.imageUrl} alt={recipe.name} className={styles.image} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{recipe.name}</h3>
        <div className={styles.info}>
          <span className={styles.time}>⏱️ {recipe.cookingTime}</span>
          <span className={styles.ingredients}>
            {recipe.mainIngredients.map((ing) => ing.name).join(', ')}
          </span>
        </div>
        {missingIngredients && missingIngredients.length > 0 && (
          <div className={styles.missingIngredients}>
            <span className={styles.missingLabel}>부족한 재료:</span>
            <span className={styles.missingList}>{missingIngredients.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
