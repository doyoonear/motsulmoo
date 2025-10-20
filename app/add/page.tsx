'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import BottomNavigation from '@/components/BottomNavigation';
import { TOAST_MESSAGES } from '@/constants';

export default function AddRecipePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setUploadProgress(0);

    // 진행률 애니메이션
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);

      // API 호출
      const response = await fetch('/api/analyze-recipe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '레시피 분석에 실패했습니다.');
      }

      if (data.success && data.recipe) {
        setUploadProgress(100);

        // 분석 완료 후 처리
        setTimeout(() => {
          setIsAnalyzing(false);
          alert(TOAST_MESSAGES.RECIPE_ANALYSIS_COMPLETE);

          // TODO: 레시피 저장 API 호출 및 상세 페이지로 이동
          console.log('분석된 레시피:', data.recipe);
          // router.push(`/recipe-book/${data.recipe.id}`);
        }, 500);
      } else {
        alert('레시피 정보를 추출할 수 없습니다. 다른 이미지를 시도해주세요.');
        setIsAnalyzing(false);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('레시피 분석 오류:', error);
      alert(error instanceof Error ? error.message : '레시피 분석 중 오류가 발생했습니다.');
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={styles.container}>
      {isAnalyzing && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>레시피 추가</h1>
          <button className={styles.helpButton} onClick={() => alert('도움말')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.helpIcon}>
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeWidth="2" />
              <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className={`${styles.uploadSection} ${isAnalyzing ? styles.dimmed : ''}`}>
          <label htmlFor="imageUpload" className={styles.uploadArea}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.cameraIcon}>
              <path
                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                strokeWidth="2"
              />
              <circle cx="12" cy="13" r="4" strokeWidth="2" />
            </svg>
            <p className={styles.uploadText}>레시피 이미지를 업로드하세요</p>
            <p className={styles.uploadSubText}>스크린샷, 사진 등 모든 형태의 이미지</p>
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.fileInput}
            disabled={isAnalyzing}
          />
        </div>

        {isAnalyzing && (
          <div className={styles.analyzingOverlay}>
            <div className={styles.spinner}>
              <svg viewBox="0 0 50 50" className={styles.cookingIcon}>
                <path
                  d="M25 5 L25 15 M25 35 L25 45 M10 10 L15 15 M35 15 L40 10 M10 40 L15 35 M35 35 L40 40 M5 25 L15 25 M35 25 L45 25"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <p className={styles.analyzingText}>{TOAST_MESSAGES.RECIPE_ANALYZING_IN_PROGRESS}</p>
          </div>
        )}

        <div className={styles.usageSection}>
          <h2 className={styles.usageTitle}>사용 방법</h2>
          <div className={styles.usageSteps}>
            <div className={styles.usageStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>이미지 업로드</h3>
                <p className={styles.stepDescription}>
                  웹사이트 스크린샷, 요리책 사진 등 레시피가 포함된 이미지를 업로드하세요
                </p>
              </div>
            </div>

            <div className={styles.usageStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>자동 분석</h3>
                <p className={styles.stepDescription}>
                  AI가 이미지에서 레시피명, 재료, 조리법을 자동으로 추출합니다
                </p>
              </div>
            </div>

            <div className={styles.usageStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>레시피북 저장</h3>
                <p className={styles.stepDescription}>
                  분석이 완료되면 자동으로 레시피북에 저장되어 언제든 확인할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
