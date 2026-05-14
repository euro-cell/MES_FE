import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectBom } from '../../../../api/project/bom';
import type { BomTemplateDetail } from '../../../../api/project/bom';
import styles from '../../../../styles/project/spec/bomNew.module.css';

type Classification = 'Cathode' | 'Anode' | "Ass'y";
const CLASSIFICATIONS: Classification[] = ['Cathode', 'Anode', "Ass'y"];

function calcUnitPriceKrw(
  currency: string, purchasePrice: number | null,
  tariff: number | null, etc: number | null,
  usd: number, jpy: number, eur: number,
): number {
  const p = purchasePrice ?? 0;
  const t = (tariff ?? 0) / 100;
  const e = (etc ?? 0) / 100;
  let base = p;
  if (currency === 'USD') base = p * usd;
  if (currency === 'JPY') base = p * jpy;
  if (currency === 'EUR') base = p * eur;
  return base * (1 + t) * (1 + e);
}

function calcTotalYield(rows: BomTemplateDetail['rows']): number {
  const anodeRows = rows.filter(r => r.classification === 'Anode');
  const assyRows  = rows.filter(r => r.classification === "Ass'y");
  const anodeAvg  = anodeRows.length ? anodeRows.reduce((s, r) => s + (r.yieldRate ?? 0), 0) / anodeRows.length / 100 : 1;
  const assyAvg   = assyRows.length  ? assyRows.reduce((s, r)  => s + (r.yieldRate ?? 0), 0) / assyRows.length  / 100 : 1;
  return anodeAvg * assyAvg;
}

function calcTotalQty(row: BomTemplateDetail['rows'][0], totalYield: number, assyAvgYield: number): number {
  const net = row.netQty ?? 0;
  if (!net) return 0;
  const isAssy = row.classification === "Ass'y";
  if (isAssy) return assyAvgYield ? net / assyAvgYield : 0;
  return totalYield ? net / totalYield : 0;
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function groupAvgYield(rows: BomTemplateDetail['rows'], cls: string): number {
  const g = rows.filter(r => r.classification === cls);
  return g.length ? g.reduce((s, r) => s + (r.yieldRate ?? 0), 0) / g.length / 100 : 0;
}

export default function BomView() {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const [bom, setBom] = useState<BomTemplateDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    getProjectBom(Number(projectId))
      .then(setBom)
      .catch(() => setError(true));
  }, [projectId]);

  if (error) return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← 목록으로</button>
      <p style={{ color: '#ef4444', marginTop: 16 }}>등록된 셀당 소요량이 없습니다.</p>
    </div>
  );

  if (!bom) return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← 목록으로</button>
      <p style={{ marginTop: 16 }}>불러오는 중...</p>
    </div>
  );

  const usd = bom.usdRate ?? 0;
  const jpy = bom.jpyRate ?? 0;
  const eur = bom.eurRate ?? 0;

  const totalYield   = calcTotalYield(bom.rows);
  const assyAvg      = groupAvgYield(bom.rows, "Ass'y");

  const unitCostOf = (row: BomTemplateDetail['rows'][0]) => {
    const up = calcUnitPriceKrw(row.currency, row.purchasePrice, row.tariff, row.etc, usd, jpy, eur);
    const tq = calcTotalQty(row, totalYield, assyAvg);
    return up * tq;
  };

  const totalUnitCost = bom.rows.reduce((s, r) => s + unitCostOf(r), 0);

  const groupUnitCostSum = (cls: string) =>
    bom.rows.filter(r => r.classification === cls).reduce((s, r) => s + unitCostOf(r), 0);

  const grouped = CLASSIFICATIONS.map(cls => ({
    cls,
    group: bom.rows.filter(r => r.classification === cls),
  }));

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← 목록으로</button>
      <h2 className={styles.title}>셀당 소요량 조회</h2>

      <div className={styles.nameRow}>
        <span className={styles.nameLabel}>BOM 이름</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{bom.name}</span>
      </div>

      <div className={styles.ratesRow}>
        <div className={`${styles.rateBox} ${styles.rateUsd}`}>
          <label>USD</label>
          <span style={{ fontSize: 13 }}>{usd || '-'}</span>
        </div>
        <div className={`${styles.rateBox} ${styles.rateJpy}`}>
          <label>JPY</label>
          <span style={{ fontSize: 13 }}>{jpy || '-'}</span>
        </div>
        <div className={`${styles.rateBox} ${styles.rateEur}`}>
          <label>EUR</label>
          <span style={{ fontSize: 13 }}>{eur || '-'}</span>
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
              <th>기타</th>
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
                  const unitPriceKrw = calcUnitPriceKrw(row.currency, row.purchasePrice, row.tariff, row.etc, usd, jpy, eur);
                  const totalQty     = calcTotalQty(row, totalYield, assyAvg);
                  const unitCost     = unitPriceKrw * totalQty;
                  const composition  = totalUnitCost ? unitCost / totalUnitCost : 0;
                  const usdPrice     = usd ? unitPriceKrw / usd : 0;
                  const usdUnitPrice = usd ? unitCost / usd : 0;
                  const materialCost = unitPriceKrw * (row.netQty ?? 0);

                  return (
                    <tr key={row.id}>
                      {idx === 0 && (
                        <td rowSpan={group.length} className={styles.classCell}>{cls}</td>
                      )}
                      <td className={styles.calcCellCenter}>{row.materialType ?? ''}</td>
                      <td className={styles.calcCellCenter}>{row.materialType ?? ''}</td>
                      <td className={styles.calcCellCenter}>{row.product ?? ''}</td>
                      <td className={styles.calcCellCenter}>{row.manufacturer ?? ''}</td>
                      <td className={styles.calcCellCenter}>{row.unit ?? ''}</td>
                      <td className={styles.calcCell}>{row.yieldRate ?? '-'}</td>
                      <td className={styles.calcCellCenter}>{row.currency}</td>
                      <td className={styles.calcCell}>{row.purchasePrice ?? '-'}</td>
                      <td className={styles.calcCell}>{row.tariff ?? '-'}</td>
                      <td className={styles.calcCell}>{row.etc ?? '-'}</td>
                      <td className={styles.calcCell}>₩{fmt(unitPriceKrw)}</td>
                      <td className={styles.calcCell}>{row.netQty ?? '-'}</td>
                      <td className={styles.calcCell}>{totalQty.toFixed(4)}</td>
                      <td className={styles.calcCell}>₩{fmt(unitCost)}</td>
                      <td className={styles.calcCell}>{(composition * 100).toFixed(2)}%</td>
                      <td className={`${styles.calcCell} ${styles.usdCell}`}>${fmt(usdPrice)}</td>
                      <td className={`${styles.calcCell} ${styles.usdCell}`}>${fmt(usdUnitPrice)}</td>
                      <td className={styles.calcCell}>{fmt(materialCost, 0)}</td>
                    </tr>
                  );
                })}
                <tr className={styles.subtotalRow}>
                  <td colSpan={6} className={styles.subtotalLabel}>소 계</td>
                  <td>{(groupAvgYield(bom.rows, cls) * 100).toFixed(1)}%</td>
                  <td colSpan={7}></td>
                  <td>₩{fmt(groupUnitCostSum(cls))}</td>
                  <td>{totalUnitCost ? ((groupUnitCostSum(cls) / totalUnitCost) * 100).toFixed(2) : '0.00'}%</td>
                  <td colSpan={2}>${fmt(usd ? groupUnitCostSum(cls) / usd : 0)}</td>
                  <td>
                    {fmt(
                      bom.rows.filter(r => r.classification === cls)
                        .reduce((s, r) => s + calcUnitPriceKrw(r.currency, r.purchasePrice, r.tariff, r.etc, usd, jpy, eur) * (r.netQty ?? 0), 0),
                      0
                    )}
                  </td>
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
                  bom.rows.reduce((s, r) => s + calcUnitPriceKrw(r.currency, r.purchasePrice, r.tariff, r.etc, usd, jpy, eur) * (r.netQty ?? 0), 0),
                  0
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
