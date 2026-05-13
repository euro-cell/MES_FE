import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMaterialCategories, getMaterialsByCategory } from '../../../../api/material';
import styles from '../../../../styles/project/spec/bomNew.module.css';

interface Material {
  id: number;
  category: string;
  type: string;
  name: string;
  company: string;
  unit: string;
}

type Classification = 'Cathode' | 'Anode' | "Ass'y";

interface BomRow {
  id: number;
  classification: Classification;
  category: string;
  material: string;     // materialType (자재 종류)
  product: string;      // model (제품명)
  manufacturer: string; // company
  unit: string;
  yieldRate: number | '';   // 수율 (%, 0~100)
  currency: 'KRW' | 'USD' | 'JPY' | 'EUR';
  purchasePrice: number | '';
  tariff: number | '';      // 관세율 (%, 0~100)
  etc: number | '';         // 기타 (%, 0~100)
  netQty: number | '';      // 순소요량
  // lossRatio: 총소요량 보정 계수 (Al-Foil, Pouch 예외)
  lossRatio?: number[];
}

const CLASSIFICATIONS: Classification[] = ['Cathode', 'Anode', "Ass'y"];
const CURRENCIES: BomRow['currency'][] = ['KRW', 'USD', 'JPY', 'EUR'];

let nextId = 100;
const newRow = (cls: Classification): BomRow => ({
  id: nextId++,
  classification: cls,
  category: '', material: '', product: '', manufacturer: '', unit: '',
  yieldRate: 90, currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '',
});

const INITIAL_ROWS: BomRow[] = [
  { id: 1,  classification: 'Cathode', category: '양극재', material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 2,  classification: 'Cathode', category: '도전재', material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 3,  classification: 'Cathode', category: '바인더', material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 4,  classification: 'Cathode', category: '집전체', material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 5,  classification: 'Cathode', category: '용매',   material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 6,  classification: 'Anode',   category: '음극재', material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 7,  classification: 'Anode',   category: '도전재', material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 8,  classification: 'Anode',   category: '바인더', material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 9,  classification: 'Anode',   category: '집전체', material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 10, classification: 'Anode',   category: '용매',   material: '', product: '', manufacturer: '', unit: '', yieldRate: 90,   currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 11, classification: "Ass'y",   category: '분리막', material: '', product: '', manufacturer: '', unit: '', yieldRate: 83.3, currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 12, classification: "Ass'y",   category: '리드탭', material: '', product: '', manufacturer: '', unit: '', yieldRate: 83.3, currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 13, classification: "Ass'y",   category: '파우치', material: '', product: '', manufacturer: '', unit: '', yieldRate: 83.3, currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
  { id: 14, classification: "Ass'y",   category: '전해액', material: '', product: '', manufacturer: '', unit: '', yieldRate: 83.3, currency: 'KRW', purchasePrice: '', tariff: 0, etc: 10, netQty: '' },
];

const INITIAL_FIRST_IDS = new Set(INITIAL_ROWS.map(r => r.id));

// ── 계산 헬퍼 ──────────────────────────────────────────────

function calcUnitPriceKrw(row: BomRow, usdRate: number, jpyRate: number, eurRate: number): number {
  const p = Number(row.purchasePrice) || 0;
  const t = (Number(row.tariff) || 0) / 100;
  const e = (Number(row.etc) || 0) / 100;
  let base = p;
  if (row.currency === 'USD') base = p * usdRate;
  if (row.currency === 'JPY') base = p * jpyRate;
  if (row.currency === 'EUR') base = p * eurRate;
  return base * (1 + t) * (1 + e);
}

// TOTAL 수율 = Anode소계수율 × Ass'y소계수율  (내부는 0~1 단위로 변환)
function calcTotalYield(rows: BomRow[]): number {
  const anodeRows = rows.filter(r => r.classification === 'Anode');
  const assyRows  = rows.filter(r => r.classification === "Ass'y");
  const anodeAvg  = anodeRows.length ? anodeRows.reduce((s, r) => s + (Number(r.yieldRate) || 0), 0) / anodeRows.length / 100 : 1;
  const assyAvg   = assyRows.length  ? assyRows.reduce((s, r)  => s + (Number(r.yieldRate) || 0), 0) / assyRows.length  / 100 : 1;
  return anodeAvg * assyAvg;
}

function calcTotalQty(row: BomRow, totalYield: number, assyAvgYield: number): number {
  const net = Number(row.netQty) || 0;
  if (!net) return 0;

  const lr = row.lossRatio ?? [];
  const isAssy = row.classification === "Ass'y";

  // Pouch(Ass'y) 예외: M / assyAvgYield × lossRatio[0]
  if (isAssy && row.material === 'Pouch') {
    return assyAvgYield ? net / assyAvgYield * (lr[0] ?? 1) : 0;
  }

  // Ass'y 전체: M / assyAvgYield
  if (isAssy) {
    return assyAvgYield ? net / assyAvgYield : 0;
  }

  // Al-Foil(Cathode/Anode) 예외: M / totalYield × lossRatio[0] × lossRatio[1]
  if (row.material === 'Collector' && lr.length >= 2) {
    return totalYield ? net / totalYield * lr[0] * lr[1] : 0;
  }

  // Cathode / Anode 일반: M / totalYield
  return totalYield ? net / totalYield : 0;
}

function calcUnitCost(row: BomRow, usdRate: number, jpyRate: number, eurRate: number, totalYield: number, assyAvgYield: number): number {
  const unitPrice = calcUnitPriceKrw(row, usdRate, jpyRate, eurRate);
  const totalQty  = calcTotalQty(row, totalYield, assyAvgYield);
  return unitPrice * totalQty;
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ── 툴팁 맵 ────────────────────────────────────────────────
function getTooltip(row: BomRow, col: 'netQty' | 'totalQty' | 'tariff' | 'etc'): string | undefined {
  if (col === 'totalQty') {
    if (row.material === 'Collector' && row.classification === 'Cathode') return '로스반영 / 미코팅부, 타발, 테스트 (1200m 투입, 1000m 생산결과)';
    if (row.material === 'Collector' && row.classification === 'Anode')   return '로스반영 / 미코팅부, 타발, 테스트 (1200m 투입, 1000m 생산결과)';
    if (row.material === 'Pouch')                                          return '상하 Folding / 설계 폭: (185+7.5)×2 / 자재 폭: 400mm';
  }
  if (col === 'netQty'  && row.material === 'Conductor' && row.classification === 'Anode' && row.product.includes('MWCNT')) return 'CNT 5% solution';
  if (col === 'tariff'  && row.material === 'NCM811')                     return '4/1부터 증치세 13% 감면 중단';
  return undefined;
}

// ── 컴포넌트 ───────────────────────────────────────────────

export default function BomNew() {
  const navigate = useNavigate();
  const { id: _id } = useParams<{ id: string }>();
  const [rows, setRows]       = useState<BomRow[]>(INITIAL_ROWS);
  const [usdRate, setUsdRate] = useState<number | ''>(1480.6);
  const [jpyRate, setJpyRate] = useState<number | ''>(9.52);
  const [eurRate, setEurRate] = useState<number | ''>('');
  const [categories, setCategories]     = useState<string[]>([]);
  const [materialsMap, setMaterialsMap] = useState<Record<number, Material[]>>({});

  const usd = Number(usdRate) || 0;
  const jpy = Number(jpyRate) || 0;
  const eur = Number(eurRate) || 0;

  useEffect(() => {
    getMaterialCategories().then(setCategories).catch(console.error);

    INITIAL_ROWS.forEach(async r => {
      if (!r.category) return;
      try {
        const data = await getMaterialsByCategory(r.category);
        setMaterialsMap(prev => ({ ...prev, [r.id]: data }));
      } catch (e) {
        console.error(e);
      }
    });
  }, []);

  const loadMaterials = async (rowId: number, category: string) => {
    try {
      const data = await getMaterialsByCategory(category);
      setMaterialsMap(prev => ({ ...prev, [rowId]: data }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategoryChange = (rowId: number, category: string) => {
    setRows(prev => prev.map(r =>
      r.id === rowId ? { ...r, category, material: '', product: '', manufacturer: '', unit: '' } : r
    ));
    if (category) loadMaterials(rowId, category);
  };

  const handleMaterialTypeChange = (rowId: number, material: string) => {
    setRows(prev => prev.map(r =>
      r.id === rowId ? { ...r, material, product: '', manufacturer: r.manufacturer, unit: r.unit } : r
    ));
  };

  const handleModelChange = (rowId: number, product: string) => {
    const mats = materialsMap[rowId] || [];
    const target = mats.find(m => m.name === product);
    setRows(prev => prev.map(r =>
      r.id === rowId
        ? {
            ...r,
            product,
            manufacturer: target ? target.company : r.manufacturer,
            unit: target ? target.unit : r.unit,
          }
        : r
    ));
  };

  // 소계 수율 = 그룹 평균
  const groupAvgYield = (cls: Classification) => {
    const g = rows.filter(r => r.classification === cls);
    return g.length ? g.reduce((s, r) => s + (Number(r.yieldRate) || 0), 0) / g.length / 100 : 0;
  };

  const totalYield    = calcTotalYield(rows);
  const assyAvgYield  = groupAvgYield("Ass'y");

  // 그룹별 단위가격 합 (소계 O열)
  const groupUnitCostSum = (cls: Classification) =>
    rows.filter(r => r.classification === cls)
        .reduce((s, r) => s + calcUnitCost(r, usd, jpy, eur, totalYield, assyAvgYield), 0);

  const totalUnitCost = CLASSIFICATIONS.reduce((s, c) => s + groupUnitCostSum(c), 0);

  const handleChange = (id: number, field: keyof BomRow, value: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const numFields: (keyof BomRow)[] = ['yieldRate', 'purchasePrice', 'tariff', 'etc', 'netQty'];
      if (numFields.includes(field)) {
        return { ...r, [field]: value === '' ? '' : Number(value) };
      }
      return { ...r, [field]: value };
    }));
  };

  const handleAddRow = (cls: Classification) => {
    const r = newRow(cls);
    setRows(prev => {
      const indices = prev.map((row, i) => (row.classification === cls ? i : -1));
      const last = Math.max(...indices);
      const copy = [...prev];
      copy.splice(last + 1, 0, r);
      return copy;
    });
  };

  const handleRemoveRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id));

  const handleSubmit = () => alert('준비 중입니다.');

  const grouped = CLASSIFICATIONS.map(cls => ({ cls, group: rows.filter(r => r.classification === cls) }));

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← 목록으로</button>
      <h2 className={styles.title}>셀당 소요량 등록</h2>

      <div className={styles.ratesRow}>
        <div className={styles.rateBox + ' ' + styles.rateUsd}>
          <label>USD</label>
          <input type='number' value={usdRate} onChange={e => setUsdRate(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className={styles.rateBox + ' ' + styles.rateJpy}>
          <label>JPY</label>
          <input type='number' value={jpyRate} onChange={e => setJpyRate(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className={styles.rateBox + ' ' + styles.rateEur}>
          <label>EUR</label>
          <input type='number' value={eurRate} onChange={e => setEurRate(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colClass} />
            <col className={styles.colCat} />
            <col className={styles.colMat} />
            <col className={styles.colProduct} />
            <col className={styles.colMaker} />
            <col className={styles.colUnit} />
            <col className={styles.colYield} />
            <col className={styles.colCurrency} />
            <col className={styles.colPrice} />
            <col className={styles.colTariff} />
            <col className={styles.colEtc} />
            <col className={styles.colUnitKrw} />
            <col className={styles.colNetQty} />
            <col className={styles.colTotalQty} />
            <col className={styles.colUnitCost} />
            <col className={styles.colComp} />
            <col className={styles.colUsdPrice} />
            <col className={styles.colUsdUnit} />
            <col className={styles.colMatCost} />
            <col className={styles.colAction} />
          </colgroup>
          <thead>
            <tr>
              <th colSpan={6}>원재료</th>
              <th rowSpan={2}>수율(%)</th>
              <th colSpan={5}>단가 산출</th>
              <th colSpan={2}>소요량 산출</th>
              <th colSpan={2}>가격(₩)</th>
              <th colSpan={2} className={styles.usdHeader}>USD</th>
              <th rowSpan={2}>정미재료비</th>
              <th rowSpan={2}></th>
            </tr>
            <tr>
              <th>구분</th>
              <th>분류</th>
              <th>Material</th>
              <th>Product</th>
              <th>제조사</th>
              <th>단위</th>
              <th>Current</th>
              <th>구매가격</th>
              <th>관세</th>
              <th title='기타 부대비용 / VAT 별도 시 기입'>기타</th>
              <th>단가(₩)</th>
              <th>순소요량</th>
              <th>총소요량</th>
              <th>단위가격</th>
              <th>구성비(%)</th>
              <th className={styles.usdHeader}>price</th>
              <th className={styles.usdHeader}>Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ cls, group }) => (
              <>
                {group.map((row, idx) => {
                  const unitPriceKrw = calcUnitPriceKrw(row, usd, jpy, eur);
                  const totalQty     = calcTotalQty(row, totalYield, assyAvgYield);
                  const unitCost     = unitPriceKrw * totalQty;
                  const composition  = totalUnitCost ? unitCost / totalUnitCost : 0;
                  const usdPrice     = usd ? unitPriceKrw / usd : 0;
                  const usdUnitPrice = usd ? unitCost / usd : 0;
                  const materialCost = unitPriceKrw * (Number(row.netQty) || 0);

                  const totalQtyTooltip = getTooltip(row, 'totalQty');
                  const netQtyTooltip   = getTooltip(row, 'netQty');
                  const tariffTooltip   = getTooltip(row, 'tariff');

                  return (
                    <tr key={row.id}>
                      {idx === 0 && (
                        <td rowSpan={group.length} className={styles.classCell}>{cls}</td>
                      )}
                      <td>
                        <select value={row.category} onChange={e => handleCategoryChange(row.id, e.target.value)}>
                          <option value=''>선택</option>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td>
                        <select value={row.material} onChange={e => handleMaterialTypeChange(row.id, e.target.value)}>
                          <option value=''>선택</option>
                          {[...new Set((materialsMap[row.id] || []).map(m => m.type))].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select value={row.product} onChange={e => handleModelChange(row.id, e.target.value)}>
                          <option value=''>선택</option>
                          {[...new Map((materialsMap[row.id] || []).filter(m => m.type === row.material).map(m => [m.name, m])).values()].map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={styles.calcCellCenter}>{row.manufacturer}</td>
                      <td className={styles.calcCellCenter}>{row.unit}</td>
                      <td>
                        <input
                          type='number' step='0.001'
                          value={row.yieldRate === '' ? '' : row.yieldRate}
                          onChange={e => handleChange(row.id, 'yieldRate', e.target.value)}
                        />
                      </td>
                      <td>
                        <select value={row.currency} onChange={e => handleChange(row.id, 'currency', e.target.value as BomRow['currency'])}>
                          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td>
                        <input type='number' value={row.purchasePrice === '' ? '' : row.purchasePrice} onChange={e => handleChange(row.id, 'purchasePrice', e.target.value)} />
                      </td>
                      <td title={tariffTooltip}>
                        <input type='number' step='0.01' value={row.tariff === '' ? '' : row.tariff} onChange={e => handleChange(row.id, 'tariff', e.target.value)} />
                      </td>
                      <td>
                        <input type='number' step='0.01' value={row.etc === '' ? '' : row.etc} onChange={e => handleChange(row.id, 'etc', e.target.value)} />
                      </td>
                      <td className={styles.calcCell}>₩{fmt(unitPriceKrw)}</td>
                      <td title={netQtyTooltip}>
                        <input type='number' step='0.0001' value={row.netQty === '' ? '' : row.netQty} onChange={e => handleChange(row.id, 'netQty', e.target.value)} />
                      </td>
                      <td className={styles.calcCell} title={totalQtyTooltip ?? undefined}>{totalQty.toFixed(4)}</td>
                      <td className={styles.calcCell}>₩{fmt(unitCost)}</td>
                      <td className={styles.calcCell}>{(composition * 100).toFixed(2)}%</td>
                      <td className={styles.calcCell + ' ' + styles.usdCell}>${fmt(usdPrice)}</td>
                      <td className={styles.calcCell + ' ' + styles.usdCell}>${fmt(usdUnitPrice)}</td>
                      <td className={styles.calcCell}>{fmt(materialCost, 0)}</td>
                      <td className={styles.actionCell}>
                        {INITIAL_FIRST_IDS.has(row.id) ? (
                          <button className={styles.addBtn} onClick={() => handleAddRow(cls)}>＋</button>
                        ) : (
                          <button className={styles.deleteBtn} onClick={() => handleRemoveRow(row.id)}>－</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className={styles.subtotalRow}>
                  <td colSpan={6} className={styles.subtotalLabel}>소 계</td>
                  <td>{(groupAvgYield(cls) * 100).toFixed(1)}%</td>
                  <td colSpan={7}></td>
                  <td>₩{fmt(groupUnitCostSum(cls))}</td>
                  <td>{totalUnitCost ? ((groupUnitCostSum(cls) / totalUnitCost) * 100).toFixed(2) : '0.00'}%</td>
                  <td colSpan={2}>${fmt(usd ? groupUnitCostSum(cls) / usd : 0)}</td>
                  <td>
                    {fmt(
                      rows.filter(r => r.classification === cls)
                          .reduce((s, r) => s + calcUnitPriceKrw(r, usd, jpy, eur) * (Number(r.netQty) || 0), 0),
                      0
                    )}
                  </td>
                  <td></td>
                </tr>
              </>
            ))}
            <tr className={styles.totalRow}>
              <td colSpan={6} className={styles.totalLabel}>TOTAL</td>
              <td>{(totalYield * 100).toFixed(1)}%</td>
              <td colSpan={7}></td>
              <td className={styles.totalUnitCost}>₩{fmt(totalUnitCost)}</td>
              <td>100.00%</td>
              <td colSpan={2}>${fmt(usd ? totalUnitCost / usd : 0)}</td>
              <td>
                {fmt(
                  rows.reduce((s, r) => s + calcUnitPriceKrw(r, usd, jpy, eur) * (Number(r.netQty) || 0), 0),
                  0
                )}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.saveWrap}>
        <button className={styles.saveBtn} onClick={handleSubmit}>저장</button>
      </div>
    </div>
  );
}
