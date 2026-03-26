import { useState, useCallback, useEffect } from 'react';
import styles from '../../../../styles/quality/oqc/OQCTable.module.css';
import SpecEditModal from '../../lqc/components/common/SpecEditModal';
import { getOQCSpec, saveOQCSpec } from '../../../../api/quality/OQCService';

// ── Types ─────────────────────────────────────────────────────────────────────

type LotRow = [
  string | null, string | null, string | null, string | null, string | null,
  string | null, string | null, string | null, string | null, string | null
];

interface AppearanceInspectionItem {
  itemName: string;
  description: string;
  spec: '부' | '≤4' | '≤10';
  count: number | null;
  type: 'qualitative' | 'quantitative';
  lotNumbers: LotRow[];
  result: 'PASS' | 'FAIL' | null;
}

interface AppearanceInspectionSheet {
  title: string;
  items: AppearanceInspectionItem[];
  remark: string[];
}

// ── Spec ──────────────────────────────────────────────────────────────────────

interface SpecValue {
  min?: number;
  max?: number;
  unit: string;
}

const SPEC_FIELDS = [
  { key: '돌출', label: '돌출', type: 'max-only' as const, unit: '' },
  { key: '긁힘', label: '긁힘', type: 'max-only' as const, unit: '' },
  { key: '찍힘', label: '찍힘', type: 'max-only' as const, unit: '' },
];

const DEFAULT_SPECS: Record<string, SpecValue> = {};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isPassing(spec: SpecValue | string, count: number): boolean {
  if (typeof spec === 'string') {
    if (spec === '부') return count === 0;
    return count <= parseInt(spec.replace('≤', ''));
  }
  if (spec.max !== undefined) return count <= spec.max;
  return true;
}

function specLabel(itemName: string, specs: Record<string, SpecValue>): string {
  if (itemName === '가스' || itemName === '크랙') return '부';
  const s = specs[itemName];
  if (!s || s.max === undefined) return '미설정';
  return `≤${s.max}`;
}

function countLotNumbers(lotNumbers: LotRow[]): number {
  return lotNumbers.reduce(
    (total, row) => total + row.filter((v) => v !== null && v !== '').length,
    0
  );
}

// ── Initial Data ──────────────────────────────────────────────────────────────

const INITIAL_DATA: AppearanceInspectionSheet = {
  title: '● 외관 검사',
  items: [
    {
      itemName: '가스',
      description: '발생 여부 육안검사',
      spec: '부',
      count: 0,
      type: 'qualitative',
      lotNumbers: [
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      result: 'PASS',
    },
    {
      itemName: '돌출',
      description: '직경≤2mm',
      spec: '≤4',
      count: 16,
      type: 'quantitative',
      lotNumbers: [
        ['O1DH050858', 'O1DH050859', 'O1DH050861', 'O1DH050864', 'O1DH050865', 'O1DH050866', 'O1DH060931', 'O1DH060933', 'O1DH060946', 'O1DH060956'],
        ['O1DH060958', 'O1DH060963', 'O1DH060965', 'O1DH060966', 'O1DH060970', 'O1DH060975', null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      result: 'FAIL',
    },
    {
      itemName: '긁힘',
      description: '폭≤0.5mm, 길이≥5mm',
      spec: '≤10',
      count: 0,
      type: 'quantitative',
      lotNumbers: [
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      result: 'PASS',
    },
    {
      itemName: '찍힘',
      description: '직경≤2mm',
      spec: '≤10',
      count: 1,
      type: 'quantitative',
      lotNumbers: [
        ['O1DF130021', null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      result: 'PASS',
    },
    {
      itemName: '크랙',
      description: '발생 여부 육안검사',
      spec: '부',
      count: 694,
      type: 'qualitative',
      lotNumbers: [
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      result: 'FAIL',
    },
  ],
  remark: [
    '돌출은 Degas 공정중에서 생성; 특채 활용',
    '찍힘은 cell 이송중 발생; NCR 처리',
  ],
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AppearanceTableProps {
  projectId: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppearanceTable({ projectId }: AppearanceTableProps) {
  const [sheet, setSheet] = useState<AppearanceInspectionSheet>(INITIAL_DATA);
  const [specs, setSpecs] = useState<Record<string, SpecValue>>(DEFAULT_SPECS);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const data = await getOQCSpec(projectId, 'APPEARANCE');
        if (data.length > 0) setSpecs(data[0].specs);
      } catch {
        // fallback to defaults
      }
    };
    loadSpecs();
  }, [projectId]);

  const handleLotChange = useCallback(
    (itemIdx: number, rowIdx: number, colIdx: number, value: string) => {
      setSheet((prev) => {
        const newItems = prev.items.map((item, i) => {
          if (i !== itemIdx) return item;
          const newLotNumbers = item.lotNumbers.map((row, ri) => {
            if (ri !== rowIdx) return row;
            const newRow = [...row] as LotRow;
            newRow[colIdx] = value === '' ? null : value;
            return newRow;
          });
          const newCount =
            item.type === 'quantitative'
              ? countLotNumbers(newLotNumbers)
              : item.count;
          const newResult: 'PASS' | 'FAIL' | null =
            newCount !== null
              ? isPassing(item.spec, newCount)
                ? 'PASS'
                : 'FAIL'
              : null;
          return { ...item, lotNumbers: newLotNumbers, count: newCount, result: newResult };
        });
        return { ...prev, items: newItems };
      });
    },
    []
  );

  const handleCountChange = useCallback((itemIdx: number, value: string) => {
    setSheet((prev) => {
      const newItems = prev.items.map((item, i) => {
        if (i !== itemIdx) return item;
        const newCount = value === '' ? null : parseInt(value, 10);
        const newResult: 'PASS' | 'FAIL' | null =
          newCount !== null
            ? isPassing(item.spec, newCount)
              ? 'PASS'
              : 'FAIL'
            : null;
        return { ...item, count: newCount, result: newResult };
      });
      return { ...prev, items: newItems };
    });
  }, []);

  const handleSaveSpec = useCallback(async (newSpecs: Record<string, SpecValue>) => {
    try {
      await saveOQCSpec(projectId, 'APPEARANCE', 'APPEARANCE', newSpecs);
      setSpecs(newSpecs);
    } catch (err) {
      console.error('Failed to save spec:', err);
    }
  }, [projectId]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>{sheet.title}</h3>
          <button className={styles.specButton} onClick={() => setIsSpecModalOpen(true)}>
            규격 설정
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.lqcTable}>
            <thead>
              <tr>
                <th rowSpan={2} >항목</th>
                <th rowSpan={2} >내용</th>
                <th rowSpan={2} >규격</th>
                <th rowSpan={2} >수량</th>
                <th colSpan={10} >Lot no.</th>
              </tr>
              <tr>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i} className={styles.lotIndexCell}>
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.items.map((item, itemIdx) =>
                item.lotNumbers.map((lotRow, rowIdx) => (
                  <tr key={`${itemIdx}-${rowIdx}`}>
                    {rowIdx === 0 && (
                      <>
                        <td rowSpan={3} className={styles.itemNameCell}>
                          {item.itemName}
                        </td>
                        <td rowSpan={3} className={styles.descCell}>
                          {item.description}
                        </td>
                        <td rowSpan={3} className={styles.specCell}>
                          {specLabel(item.itemName, specs)}
                        </td>
                        <td rowSpan={3} className={styles.countCell}>
                          {item.type === 'qualitative' && item.itemName === '크랙' ? (
                            <input
                              type="number"
                              className={styles.countInput}
                              value={item.count ?? ''}
                              onChange={(e) => handleCountChange(itemIdx, e.target.value)}
                            />
                          ) : (
                            <span
                              className={
                                item.result === 'FAIL' ? styles.countFail : styles.countPass
                              }
                            >
                              {item.count ?? 0}
                            </span>
                          )}
                        </td>
                      </>
                    )}
                    {lotRow.map((val, colIdx) => (
                      <td key={colIdx} className={styles.lotCellInput}>
                        <input
                          type="text"
                          className={styles.lotInput}
                          value={val ?? ''}
                          onChange={(e) =>
                            handleLotChange(itemIdx, rowIdx, colIdx, e.target.value)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Remark 블록 */}
        <div className={styles.remarkBlock}>
          <div className={styles.remarkHeader}>■ Remark</div>
          {sheet.remark.map((line, i) => (
            <div key={i} className={styles.remarkLine}>
              {' -. '}{line}
            </div>
          ))}
        </div>
      </div>

      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="외관 검사"
        specs={specs}
        specFields={SPEC_FIELDS}
      />
    </>
  );
}
