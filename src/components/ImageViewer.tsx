import { useState, useEffect } from 'react';
import styles from '../styles/draw/PdfViewer.module.css';
import { useViewerControls } from '../hooks/useViewerControls';

interface ImageViewerProps {
  imageUrls: string[];
  fileName?: string;
}

function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>이미지 로딩 중...</p>
    </div>
  );
}

// 인접 이미지 prefetch
function usePrefetch(imageUrls: string[], currentPage: number) {
  useEffect(() => {
    const targets = [
      imageUrls[currentPage],     // 다음 페이지
      imageUrls[currentPage - 2], // 이전 페이지
    ].filter((url): url is string => !!url);

    targets.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [imageUrls, currentPage]);
}

export default function ImageViewer({ imageUrls, fileName }: ImageViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedUrl, setDisplayedUrl] = useState(imageUrls[0]);

  const { scale, wrapperRef, zoomIn, zoomOut, resetZoom, isDragging, dragHandlers } = useViewerControls();

  const numPages = imageUrls.length;

  usePrefetch(imageUrls, currentPage);

  // imageUrls 변경 시 초기화
  useEffect(() => {
    setCurrentPage(1);
    resetZoom();
    setIsLoading(true);
    setDisplayedUrl(imageUrls[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrls]);

  const goToPrevPage = () => {
    if (currentPage <= 1) return;
    const next = currentPage - 1;
    setIsLoading(true);
    setCurrentPage(next);
    setDisplayedUrl(imageUrls[next - 1]);
  };

  const goToNextPage = () => {
    if (currentPage >= numPages) return;
    const next = currentPage + 1;
    setIsLoading(true);
    setCurrentPage(next);
    setDisplayedUrl(imageUrls[next - 1]);
  };

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className={styles.pdfViewer}>
        <div className={styles.noFile}>
          {fileName ? `${fileName} (이미지 없음)` : '이미지를 선택해주세요.'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.controls}>
        <div className={styles.pageControls}>
          <button onClick={goToPrevPage} disabled={currentPage <= 1 || isLoading}>이전</button>
          <span>{currentPage} / {numPages}</span>
          <button onClick={goToNextPage} disabled={currentPage >= numPages || isLoading}>다음</button>
        </div>
        <div className={styles.zoomControls}>
          <button onClick={zoomOut} disabled={isLoading}>-</button>
          <button className={styles.zoomReset} onClick={resetZoom} disabled={isLoading} title="배율 초기화">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={zoomIn} disabled={isLoading}>+</button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className={`${styles.documentWrapper} ${isDragging ? styles.dragging : ''}`}
        {...dragHandlers}
      >
        {isLoading && <LoadingSpinner />}
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          visibility: isLoading ? 'hidden' : 'visible',
        }}>
          <img
            key={displayedUrl}
            src={displayedUrl}
            alt={`Page ${currentPage}`}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            style={{ display: 'block', maxWidth: 'none' }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
