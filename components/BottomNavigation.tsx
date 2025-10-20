'use client';

import { usePathname, useRouter } from 'next/navigation';
import styles from './BottomNavigation.module.css';
import { NAV_ITEMS } from '@/constants';
import { NavRoute } from '@/types';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (route: NavRoute) => {
    if (route === '/add') {
      // TODO: 레시피 이미지 업로드 기능 구현
      console.log('레시피 추가 기능');
    } else {
      router.push(route);
    }
  };

  const isActive = (route: NavRoute) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  };

  const isRecipeBookPage = pathname.startsWith('/recipe-book');

  return (
    <>
      <nav className={styles.bottomNav}>
        <button
          className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
          onClick={() => handleNavigate('/')}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" />
            <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" />
          </svg>
          <span className={styles.label}>홈</span>
        </button>

        <button
          className={`${styles.navItem} ${isActive('/fridge') ? styles.active : ''}`}
          onClick={() => handleNavigate('/fridge')}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
            <line x1="5" y1="10" x2="19" y2="10" strokeWidth="2" />
            <line x1="9" y1="6" x2="9" y2="8" strokeWidth="2" />
            <line x1="9" y1="14" x2="9" y2="16" strokeWidth="2" />
          </svg>
          <span className={styles.label}>{NAV_ITEMS.FRIDGE.label}</span>
        </button>

        <button
          className={`${styles.navItem} ${isActive('/recipe-book') ? styles.active : ''}`}
          onClick={() => handleNavigate('/recipe-book')}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2" />
          </svg>
          <span className={styles.label}>{NAV_ITEMS.RECIPE_BOOK.label}</span>
        </button>

        <button
          className={`${styles.navItem} ${isActive('/shopping') ? styles.active : ''}`}
          onClick={() => handleNavigate('/shopping')}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeWidth="2" />
            <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
            <path d="M16 10a4 4 0 0 1-8 0" strokeWidth="2" />
          </svg>
          <span className={styles.label}>{NAV_ITEMS.SHOPPING.label}</span>
        </button>
      </nav>

      {isRecipeBookPage && (
        <button className={styles.floatingAddButton} onClick={() => handleNavigate('/add')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.floatingIcon}>
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" />
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" />
          </svg>
        </button>
      )}
    </>
  );
}
