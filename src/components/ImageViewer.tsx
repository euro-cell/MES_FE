import { useState, useRef } from 'react';
import styles from '../styles/draw/PdfViewer.module.css';

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

export default function ImageViewer({ imageUrls, fileName }: ImageViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const numPages = imageUrls.length;

  const goToPrevPage = () => {
    setIsLoading(true);
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setIsLoading(true);
    setCurrentPage(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !wrapperRef.current) return;
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    wrapperRef.current.scrollLeft -= dx;
    wrapperRef.current.scrollTop -= dy;
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
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

  const currentImageUrl = imageUrls[currentPage - 1];

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.controls}>
        <div className={styles.pageControls}>
          <button onClick={goToPrevPage} disabled={currentPage <= 1 || isLoading}>
            이전
          </button>
          <span>
            {currentPage} / {numPages}
          </span>
          <button onClick={goToNextPage} disabled={currentPage >= numPages || isLoading}>
            다음
          </button>
        </div>
        <div className={styles.zoomControls}>
          <button onClick={zoomOut} disabled={isLoading}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={isLoading}>+</button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className={`${styles.documentWrapper} ${isDragging ? styles.dragging : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoading && <LoadingSpinner />}
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          visibility: isLoading ? 'hidden' : 'visible'
        }}>
          <img
            src={currentImageUrl}
            alt={`Page ${currentPage}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: 'block', maxWidth: 'none' }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
