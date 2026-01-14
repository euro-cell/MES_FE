import { useLocation } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/lqc/LQCPage.module.css';

const PRODUCTION_MENUS = [
  { title: '관리 대장', path: '/plant/production?menu=list' },
  { title: '이력 카드', path: '/plant/production?menu=history' },
];

export default function PlantProductionPage() {
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const menu = searchParams.get('menu');

  return (
    <div>
      <SubmenuBar menus={PRODUCTION_MENUS} />

      <div className={styles.content}>
        {!menu ? (
          <div className={styles.placeholder}>메뉴를 선택하세요.</div>
        ) : menu === 'list' ? (
          <div className={styles.placeholder}>관리 대장 - 준비 중입니다.</div>
        ) : menu === 'history' ? (
          <div className={styles.placeholder}>이력 카드 - 준비 중입니다.</div>
        ) : (
          <div className={styles.placeholder}>알 수 없는 메뉴입니다.</div>
        )}
      </div>
    </div>
  );
}
