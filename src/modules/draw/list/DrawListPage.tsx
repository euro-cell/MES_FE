import { useLocation } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/lqc/LQCPage.module.css';

const FACTORY_MENUS = [{ title: '오산 공장', path: '/draw/list?factory=osan' }];

export default function DrawListPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const factory = searchParams.get('factory');

  return (
    <div>
      <SubmenuBar menus={FACTORY_MENUS} />

      <div className={styles.content}>
        {!factory ? (
          <div className={styles.placeholder}>메뉴를 선택하세요.</div>
        ) : factory === 'osan' ? (
          <div>
            <h3>오산 공장 도면</h3>
            <p>1층, 2층 도면이 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className={styles.placeholder}>알 수 없는 메뉴입니다.</div>
        )}
      </div>
    </div>
  );
}
