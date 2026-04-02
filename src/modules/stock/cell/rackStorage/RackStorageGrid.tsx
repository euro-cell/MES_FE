import type { RackLocation } from './types';
import type { LegendRange } from './index';
import styles from '../../../../styles/stock/cell/RackStorage.module.css';

interface RackStorageGridProps {
  locations: RackLocation[];
  hoveredLegend: LegendRange | null;
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

const getLegendRangeForUsage = (usage: number): LegendRange => {
  if (usage <= 30) return 'range0';
  if (usage <= 50) return 'range30';
  if (usage <= 70) return 'range50';
  if (usage <= 85) return 'range70';
  if (usage <= 99) return 'range85';
  return 'range100';
};

const getTextColor = (): string => {
  return '#333333';
};

export default function RackStorageGrid({ locations, hoveredLegend }: RackStorageGridProps) {
  const getLocationByKey = (key: string): RackLocation | undefined => {
    return locations.find(loc => loc.key === key);
  };

  const StorageCell = ({ letter, number }: { letter: string; number: number }) => {
    const locationKey = `${letter}-${number}`;
    const location = getLocationByKey(locationKey);

    if (!location) return null;

    const bgColor = getUsageColor(location.usage);
    const textColor = getTextColor();
    const dimmed = hoveredLegend !== null && getLegendRangeForUsage(location.usage) !== hoveredLegend;

    return (
      <div
        className={styles.storageCell}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          opacity: dimmed ? 0.2 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        <div className={styles.cellContent}>
          <span className={styles.cellInfo}>{location.key}</span>
          <span className={styles.cellInfo}>
            {location.count}/{location.capacity}
          </span>
          <span className={styles.cellInfo}>{location.usage}%</span>
        </div>
      </div>
    );
  };

  const numbers = [5, 4, 3, 2, 1];

  const GridSection = ({ letters }: { letters: string[] }) => (
    <div style={{ width: 'fit-content' }}>
      <div className={styles.gridWrapper} style={{ gridTemplateColumns: `repeat(${letters.length}, auto)` }}>
        {/* 숫자별로 행 구성, 각 행은 문자 순서대로 */}
        {numbers.map(num =>
          letters.map(letter => <StorageCell key={`${letter}-${num}`} letter={letter} number={num} />)
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.gridContainer}>
      <div className={styles.sectionsWrapper}>
        {/* 좌측: A~F, G~J 콘텐츠 */}
        <div className={styles.contentWrapper}>
          {/* A~F */}
          <div className={styles.sectionGroup}>
            <div className={styles.gridSectionsRow}>
              <GridSection letters={['A', 'B', 'C']} />
              <GridSection letters={['D', 'E', 'F']} />
            </div>
          </div>

          {/* G~J */}
          <div className={styles.sectionGroup}>
            <div className={styles.gridSectionsRow}>
              <GridSection letters={['G', 'H']} />
              <GridSection letters={['I', 'J']} />
            </div>
          </div>
        </div>

        {/* 우측 문 배치 */}
        <div className={styles.doorsWrapper}>
          <div className={styles.door}>
            <span className={styles.doorLabel}>문</span>
          </div>
          <div className={styles.door}>
            <span className={styles.doorLabel}>문</span>
          </div>
        </div>
      </div>

      {/* 바닥 표시 */}
      <div className={styles.floorBar}>테이블</div>

    </div>
  );
}
