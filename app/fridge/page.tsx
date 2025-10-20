'use client';

import { useState } from 'react';
import styles from './page.module.css';
import BottomNavigation from '@/components/BottomNavigation';
import { FridgeItem, IngredientCategory } from '@/types';
import { INGREDIENT_CATEGORIES, COLORS } from '@/constants';

// 카테고리별 아이콘 색상 매핑
const getCategoryColor = (category: IngredientCategory | 'all'): string => {
  const colorMap: Record<string, string> = {
    전체: COLORS.PRIMARY,
    채소류: '#94c35f',
    육류: '#FF7043',
    해산물: '#29B6F6',
    버섯류: '#A1887F',
    '달걀·가공단백류': '#FFB74D',
    '곡물·면류': '#FFD54F',
    유제품: '#a6c5c8',
    가공식품: '#FFAB91',
    '양념·소스': '#83745e',
    '기타·간식류': '#BA68C8',
  };
  return colorMap[category] || COLORS.PRIMARY;
};

// Mock 데이터
const MOCK_FRIDGE_ITEMS: FridgeItem[] = [
  {
    id: '1',
    name: '닭가슴살',
    category: '육류',
    amount: 500,
    unit: 'g',
    purchasedAt: new Date('2024-12-25'),
  },
  {
    id: '2',
    name: '버섯',
    category: '채소류',
    amount: 200,
    unit: 'g',
    purchasedAt: new Date('2024-12-22'),
  },
  {
    id: '3',
    name: '마늘',
    category: '채소류',
    amount: 100,
    unit: 'g',
  },
  {
    id: '4',
    name: '파스타',
    category: '곡물·면류',
    amount: 300,
    unit: 'g',
  },
  {
    id: '5',
    name: '꿀',
    category: '양념·소스',
    amount: 250,
    unit: 'ml',
  },
  {
    id: '6',
    name: '간장',
    category: '양념·소스',
    amount: 200,
    unit: 'ml',
  },
];

export default function FridgePage() {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>(MOCK_FRIDGE_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemUnit, setNewItemUnit] = useState<'g' | 'ml'>('g');
  const [newItemCategory, setNewItemCategory] = useState<IngredientCategory>('채소류');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);

      // API 호출
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이미지 분석에 실패했습니다.');
      }

      if (data.success && data.ingredients && data.ingredients.length > 0) {
        // 분석된 재료를 냉장고에 추가
        const newItems: FridgeItem[] = data.ingredients.map((ingredient: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: ingredient.name,
          category: ingredient.category as IngredientCategory,
          amount: ingredient.amount,
          unit: ingredient.unit as 'g' | 'ml',
          purchasedAt: new Date(),
        }));

        setFridgeItems([...fridgeItems, ...newItems]);
        alert(`${newItems.length}개의 재료가 냉장고에 추가되었습니다!`);
        setShowImageUpload(false);
      } else {
        alert('이미지에서 식재료를 찾을 수 없습니다. 다른 이미지를 시도해주세요.');
      }
    } catch (error) {
      console.error('이미지 분석 오류:', error);
      alert(error instanceof Error ? error.message : '이미지 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemName || !newItemAmount) {
      alert('재료 이름과 용량을 입력해주세요.');
      return;
    }

    // TODO: 재료 추가 API 호출
    const newItem: FridgeItem = {
      id: Date.now().toString(),
      name: newItemName,
      category: newItemCategory,
      amount: Number(newItemAmount),
      unit: newItemUnit,
      purchasedAt: new Date(),
    };

    setFridgeItems([...fridgeItems, newItem]);
    setNewItemName('');
    setNewItemAmount('');
    setNewItemUnit('g');
    setNewItemCategory('채소류');
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    // TODO: 재료 삭제 API 호출
    setFridgeItems(fridgeItems.filter((item) => item.id !== id));
  };

  const filteredItems =
    selectedCategory === 'all'
      ? fridgeItems
      : fridgeItems.filter((item) => item.category === selectedCategory);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>냉장고 관리</h1>
          <button
            className={styles.imageButton}
            onClick={() => setShowImageUpload(true)}
            title="구매 내역 업로드"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.imageIcon}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <polyline points="21 15 16 10 5 21" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className={styles.categoryFilter}>
          <button
            className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            전체
          </button>
          <button
            className={`${styles.categoryButton} ${selectedCategory === '채소류' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('채소류')}
          >
            채소
          </button>
          <button
            className={`${styles.categoryButton} ${selectedCategory === '육류' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('육류')}
          >
            육류
          </button>
          <button
            className={`${styles.categoryButton} ${selectedCategory === '해산물' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('해산물')}
          >
            해산물
          </button>
          <button
            className={`${styles.categoryButton} ${selectedCategory === '버섯류' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('버섯류')}
          >
            버섯
          </button>
          <button
            className={`${styles.categoryButton} ${selectedCategory === '달걀·가공단백류' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('달걀·가공단백류')}
          >
            달걀
          </button>
        </div>

        <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
          + 재료 추가하기
        </button>

        <div className={styles.itemsList}>
          {filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>냉장고에 재료가 없습니다</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div
                  className={styles.categoryDot}
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                />
                <div className={styles.itemInfo}>
                  <div className={styles.itemNameRow}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <span className={styles.itemAmount}>
                      {item.amount}
                      {item.unit}
                    </span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemCategory}>{item.category}</span>
                    {item.purchasedAt && (
                      <span className={styles.itemDate}>
                        {item.purchasedAt.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        }).replace(/\. /g, '. ').slice(0, -1)} 까지
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showImageUpload && (
        <>
          <div className={styles.dimmed} onClick={() => !isAnalyzing && setShowImageUpload(false)} />
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>구매 내역 업로드</h3>
            {isAnalyzing ? (
              <div className={styles.analyzingContainer}>
                <div className={styles.spinner} />
                <p className={styles.analyzingText}>이미지를 분석하고 있습니다...</p>
              </div>
            ) : (
              <>
                <label htmlFor="receiptUpload" className={styles.uploadArea}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.uploadIcon}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
                    <polyline points="17 8 12 3 7 8" strokeWidth="2" />
                    <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" />
                  </svg>
                  <p className={styles.uploadText}>구매 내역 이미지를 업로드하세요</p>
                </label>
                <input
                  id="receiptUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                />
                <button className={styles.cancelButton} onClick={() => setShowImageUpload(false)}>
                  취소
                </button>
              </>
            )}
          </div>
        </>
      )}

      {showAddModal && (
        <>
          <div className={styles.dimmed} onClick={() => setShowAddModal(false)} />
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>재료 추가</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>재료 이름</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className={styles.input}
                placeholder="예: 양파"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>카테고리</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as IngredientCategory)}
                className={styles.select}
              >
                {INGREDIENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>용량</label>
                <input
                  type="number"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className={styles.input}
                  placeholder="100"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>단위</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value as 'g' | 'ml')}
                  className={styles.select}
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                </select>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                취소
              </button>
              <button className={styles.submitButton} onClick={handleAddItem}>
                추가
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNavigation />
    </div>
  );
}
