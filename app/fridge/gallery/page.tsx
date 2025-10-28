'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import BottomNavigation from '@/components/BottomNavigation';

// Mock 데이터 - 실제로는 서버에서 가져온 이미지 목록
const MOCK_RECEIPT_IMAGES = [
  {
    id: '1',
    url: '/mock-receipt-1.jpg',
    uploadedAt: new Date('2024-12-25'),
  },
  {
    id: '2',
    url: '/mock-receipt-2.jpg',
    uploadedAt: new Date('2024-12-24'),
  },
  {
    id: '3',
    url: '/mock-receipt-3.jpg',
    uploadedAt: new Date('2024-12-23'),
  },
];

interface ReceiptImageGalleryProps {}

export default function ReceiptImageGallery(props: ReceiptImageGalleryProps) {
  const router = useRouter();
  const [receiptImages, setReceiptImages] = useState(MOCK_RECEIPT_IMAGES);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);

      // API 호출
      const response = await fetch('/api/analyze-purchase', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이미지 분석에 실패했습니다.');
      }

      if (data.success) {
        // 이미지를 갤러리에 추가 (실제로는 서버에 저장)
        const newImage = {
          id: Date.now().toString(),
          url: URL.createObjectURL(file),
          uploadedAt: new Date(),
        };
        setReceiptImages([newImage, ...receiptImages]);
        alert('구매 내역이 업로드되고 냉장고에 재료가 추가되었습니다!');
        setShowUploadModal(false);
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

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.backIcon}>
              <polyline points="15 18 9 12 15 6" strokeWidth="2" />
            </svg>
          </button>
          <h1 className={styles.title}>구매 내역</h1>
          <button className={styles.uploadButton} onClick={() => setShowUploadModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.uploadIcon}>
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className={styles.gallery}>
          {receiptImages.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>업로드된 구매 내역이 없습니다</p>
              <button className={styles.emptyButton} onClick={() => setShowUploadModal(true)}>
                첫 구매 내역 업로드하기
              </button>
            </div>
          ) : (
            receiptImages.map((image) => (
              <div key={image.id} className={styles.imageCard} onClick={() => setSelectedImage(image.url)}>
                <div className={styles.imagePlaceholder}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.placeholderIcon}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <polyline points="21 15 16 10 5 21" strokeWidth="2" />
                  </svg>
                </div>
                <p className={styles.imageDate}>
                  {image.uploadedAt.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </main>

      {showUploadModal && (
        <>
          <div className={styles.dimmed} onClick={() => !isAnalyzing && setShowUploadModal(false)} />
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.uploadAreaIcon}>
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
                <button className={styles.cancelButton} onClick={() => setShowUploadModal(false)}>
                  취소
                </button>
              </>
            )}
          </div>
        </>
      )}

      {selectedImage && (
        <>
          <div className={styles.dimmed} onClick={() => setSelectedImage(null)} />
          <div className={styles.imageModal}>
            <button className={styles.closeButton} onClick={() => setSelectedImage(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.closeIcon}>
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
              </svg>
            </button>
            <div className={styles.imageModalContent}>
              <div className={styles.largeImagePlaceholder}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.largePlaceholderIcon}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <polyline points="21 15 16 10 5 21" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNavigation />
    </div>
  );
}
