import { useState } from 'react';
import styles from '../../../../../styles/production/lot/SearchInput.module.css';

interface SearchInputProps {
  onSearch: (lotNumber: string) => void;
  loading: boolean;
}

export default function SearchInput({ onSearch, loading }: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Lot 번호를 입력하세요"
          className={styles.searchInput}
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className={styles.searchButton}
          disabled={loading || !inputValue.trim()}
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>
    </div>
  );
}
