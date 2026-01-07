import type { RackLocation } from './types';
import styles from '../../../../styles/stock/cell/RackStorage.module.css';

interface RackStorageGridProps {
  locations: RackLocation[];
}

const getUsageColor = (usage: number): string => {
  if (usage === 0) return '#e8f5e9'; // 초록 (매우 밝음)
  if (usage <= 30) return '#c8e6c9'; // 초록
  if (usage <= 50) return '#a5d6a7'; // 초록 (중간)
  if (usage <= 70) return '#ffee58'; // 노랑
  if (usage <= 85) return '#ffca28'; // 주황
  if (usage <= 99) return '#ff7043'; // 주황-빨강
  return '#d32f2f'; // 빨강 (100%)
};

const getTextColor = (usage: number): string => {
  return usage > 50 ? '#ffffff' : '#333333';
};

export default function RackStorageGrid({ locations }: RackStorageGridProps) {
  const getLocationByKey = (key: string): RackLocation | undefined => {
    return locations.find(loc => loc.key === key);
  };

  const StorageCell = ({ letter, number }: { letter: string; number: number }) => {
    const locationKey = `${letter}-${number}`;
    const location = getLocationByKey(locationKey);

    if (!location) return null;

    const bgColor = getUsageColor(location.usage);
    const textColor = getTextColor(location.usage);

    return (
      <div
        className={styles.storageCell}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        <div className={styles.cellInfoRow}>
          <span className={styles.cellInfo}>{location.key}</span>
          <span className={styles.cellInfo}>{location.count}/{location.capacity}</span>
          <span className={styles.cellInfo}>{location.usage}%</span>
        </div>
      </div>
    );
  };

  const numbers = [5, 4, 3, 2, 1];

  const GridSection = ({ letters, columns }: { letters: string[]; columns: number }) => (
    <div style={{ width: 'fit-content' }}>
      <div className={styles.gridWrapper} style={{ gridTemplateColumns: `repeat(${columns}, auto)` }}>
        {/* 행들 - 각 행마다 letters 순서로 렌더링 */}
        {numbers.map(num =>
          letters.map(letter => (
            <StorageCell key={`${letter}-${num}`} letter={letter} number={num} />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.gridContainer}>
      <div className={styles.sectionsWrapper}>
        {/* 좌측: A~F */}
        <div className={styles.sectionGroup}>
          <h3 className={styles.sectionTitle}>A~F (96개 용량)</h3>
          <GridSection letters={['A', 'B', 'C']} columns={3} />
          <GridSection letters={['D', 'E', 'F']} columns={3} />
        </div>

        {/* 우측: G~J */}
        <div className={styles.sectionGroup}>
          <h3 className={styles.sectionTitle}>G~J (64개 용량)</h3>
          <GridSection letters={['G', 'H']} columns={2} />
          <GridSection letters={['I', 'J']} columns={2} />
        </div>
      </div>

      {/* 범례 */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>사용률 범례</div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#c8e6c9' }}></div>
            <span>0-30%</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#a5d6a7' }}></div>
            <span>30-50%</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#ffee58' }}></div>
            <span>50-70%</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#ffca28' }}></div>
            <span>70-85%</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#ff7043' }}></div>
            <span>85-99%</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#d32f2f' }}></div>
            <span>100% (가득찼음)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
