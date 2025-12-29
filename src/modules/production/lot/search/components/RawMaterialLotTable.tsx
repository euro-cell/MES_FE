import type { RawMaterialLotInfo } from '../LotSearchTypes';
import styles from '../../../../../styles/production/lot/RawMaterialLotTable.module.css';

interface RawMaterialLotTableProps {
  data: RawMaterialLotInfo[];
}

// 원자재 카테고리별 자재 목록 (테이블 구조용)
const MATERIAL_CONFIG: {
  category: 'Cathode' | 'Anode' | "Ass'y";
  materials: string[];
}[] = [
  { category: 'Cathode', materials: ['NCM622', 'LCO', 'Conductor', 'Binder', 'Collector', 'Solvent'] },
  { category: 'Anode', materials: ['LTO', 'Conductor', 'Binder', 'Collector', 'Solvent'] },
  { category: "Ass'y", materials: ['separator', 'Tab', 'Pouch', 'electrolyte', 'PI Tape', 'PP Tape'] },
];

export default function RawMaterialLotTable({ data }: RawMaterialLotTableProps) {
  // data에서 각 원자재의 정보 찾기
  const findMaterial = (category: string, material: string) => {
    return data.find(d => d.category === category && d.material === material);
  };

  return (
    <div className={styles.tableContainer}>
      <h3 className={styles.tableTitle}>원자재 Lot 정보</h3>
      <table className={styles.materialTable}>
        <thead>
          <tr>
            <th>구분</th>
            <th>Material</th>
            <th>Product</th>
            <th>제조사</th>
            <th>Lot</th>
          </tr>
        </thead>
        <tbody>
          {MATERIAL_CONFIG.map(config =>
            config.materials.map((material, materialIndex) => {
              const materialInfo = findMaterial(config.category, material);
              const isFirstInCategory = materialIndex === 0;

              return (
                <tr key={`${config.category}-${material}`}>
                  {isFirstInCategory && (
                    <td rowSpan={config.materials.length} className={styles.categoryCell}>
                      {config.category}
                    </td>
                  )}
                  <td className={styles.materialCell}>{materialInfo?.material || ''}</td>
                  <td className={styles.productCell}>{materialInfo?.product || ''}</td>
                  <td className={styles.manufacturerCell}>{materialInfo?.manufacturer || ''}</td>
                  <td className={styles.lotCell}>{materialInfo?.lot || ''}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
