import { useLocation } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/lqc/LQCPage.module.css';
import PdfViewer from './components/PdfViewer';
import { getDrawingUrl } from './DrawService';

const FACTORY_MENUS = [{ title: '오산 공장', path: '/draw/factory?location=osan' }];

const OSAN_FLOOR_MENUS = [
  { title: '1층', path: '/draw/factory?location=osan&floor=1' },
  { title: '2층', path: '/draw/factory?location=osan&floor=2' },
];

export default function DrawListPage() {
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const location = searchParams.get('location');
  const floor = searchParams.get('floor');

  return (
    <div>
      <SubmenuBar menus={FACTORY_MENUS} />

      <div className={styles.content}>
        {!location ? (
          <div className={styles.placeholder}>메뉴를 선택하세요.</div>
        ) : location === 'osan' ? (
          <div>
            <SubmenuBar menus={OSAN_FLOOR_MENUS} />
            {!floor ? (
              <div className={styles.placeholder}>층을 선택하세요.</div>
            ) : (
              <PdfViewer
                pdfUrl={getDrawingUrl('factory', 'osan', `floor${floor}`)}
                title={`오산 공장 ${floor}층 도면`}
              />
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>알 수 없는 메뉴입니다.</div>
        )}
      </div>
    </div>
  );
}
