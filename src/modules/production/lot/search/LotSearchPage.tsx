import { useState } from 'react';
import SearchInput from './components/SearchInput';
import ProcessLotTable from './components/ProcessLotTable';
import RawMaterialLotTable from './components/RawMaterialLotTable';
import { searchLot } from './LotSearchService';
import type { LotSearchResult } from './LotSearchTypes';
import styles from '../../../../styles/production/lot/LotSearchPage.module.css';

export default function LotSearchPage() {
  const [searchResult, setSearchResult] = useState<LotSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (lotNumber: string) => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const result = await searchLot(lotNumber);
      if (result) {
        setSearchResult(result);
      } else {
        setError('해당 Lot 번호를 찾을 수 없습니다.');
        setSearchResult(null);
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <SearchInput onSearch={handleSearch} loading={loading} />

      {error && <div className={styles.errorMessage}>{error}</div>}

      {searched && !error && searchResult && (
        <div className={styles.resultsContainer}>
          <ProcessLotTable data={searchResult.processLots} />
          <RawMaterialLotTable data={searchResult.rawMaterialLots} />
        </div>
      )}

      {!searched && (
        <div className={styles.guideMessage}>
          <p>Lot 번호를 입력하여 검색하세요.</p>
        </div>
      )}
    </div>
  );
}
