import type { RawMaterialLotInfo } from '../LotSearchTypes';
import styles from '../../../../../styles/production/lot/RawMaterialLotTable.module.css';

interface RawMaterialLotTableProps {
  data: RawMaterialLotInfo[];
}

// 카테고리 정렬 순서
const CATEGORY_ORDER = ['Cathode', 'Anode', "Ass'y"];

export default function RawMaterialLotTable({ data }: RawMaterialLotTableProps) {
  // 데이터를 카테고리별로 그룹화
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, RawMaterialLotInfo[]>);

  // 카테고리 순서대로 정렬
  const sortedCategories = Object.keys(groupedData).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className={styles.tableContainer}>
      <h3 className={styles.tableTitle}>원자재 Lot 정보</h3>
      <table className={styles.materialTable}>
        <thead>
          <tr>
            <th>구분</th>
            <th>Material</th>
            <th>Product</th>
            <th>Spec</th>
            <th>제조사</th>
            <th>Lot</th>
          </tr>
        </thead>
        <tbody>
          {sortedCategories.length > 0 ? (
            sortedCategories.map(category =>
              groupedData[category].map((item, index) => {
                const isFirstInCategory = index === 0;

                return (
                  <tr key={`${category}-${item.material}-${index}`}>
                    {isFirstInCategory && (
                      <td rowSpan={groupedData[category].length} className={styles.categoryCell}>
                        {category}
                      </td>
                    )}
                    <td className={styles.materialCell}>{item.material || ''}</td>
                    <td className={styles.productCell}>{item.product || ''}</td>
                    <td className={styles.specCell}>{item.spec || ''}</td>
                    <td className={styles.manufacturerCell}>{item.manufacturer || ''}</td>
                    <td className={styles.lotCell}>{item.lot || ''}</td>
                  </tr>
                );
              })
            )
          ) : (
            <tr>
              <td colSpan={6} className={styles.emptyCell}>데이터가 없습니다</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
