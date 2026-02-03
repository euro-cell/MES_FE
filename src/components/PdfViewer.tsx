import { useState, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styles from '../styles/draw/PdfViewer.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// PDF.js 옵션 설정 (캐싱 및 성능 최적화)
const options = {
  cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

interface PdfViewerProps {
  fileUrl?: string;
  fileName?: string;
}

// 로딩 스피너 컴포넌트
function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>PDF 로딩 중...</p>
    </div>
  );
}

export default function PdfViewer({ fileUrl, fileName }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isLoading = isDocumentLoading || isPageLoading;

  // fileUrl이 변경될 때마다 로딩 상태 초기화
  const memoizedFile = useMemo(() => {
    setIsDocumentLoading(true);
    setIsPageLoading(true);
    setPageNumber(1);
    return fileUrl;
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsDocumentLoading(false);
  };

  const onDocumentLoadError = () => {
    setIsDocumentLoading(false);
    setIsPageLoading(false);
  };

  const onPageRenderSuccess = () => {
    setIsPageLoading(false);
  };

  const goToPrevPage = () => {
    setIsPageLoading(true);
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setIsPageLoading(true);
    setPageNumber(prev => Math.min(prev + 1, numPages));
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

  if (!fileUrl) {
    return (
      <div className={styles.pdfViewer}>
        <div className={styles.noFile}>
          {fileName ? `${fileName} (파일 없음)` : 'PDF 파일을 선택해주세요.'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.controls}>
        <div className={styles.pageControls}>
          <button onClick={goToPrevPage} disabled={pageNumber <= 1 || isLoading}>
            이전
          </button>
          <span>
            {isLoading ? '-' : pageNumber} / {isLoading ? '-' : numPages}
          </span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages || isLoading}>
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
        <Document
          file={memoizedFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          options={options}
        >
          <div style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            visibility: isLoading ? 'hidden' : 'visible'
          }}>
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onRenderSuccess={onPageRenderSuccess}
            />
          </div>
        </Document>
      </div>
    </div>
  );
}
