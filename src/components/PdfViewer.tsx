import { useState, useMemo, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styles from '../styles/draw/PdfViewer.module.css';
import { useViewerControls } from '../hooks/useViewerControls';

// Worker를 로컬 번들로 로드 (CDN 의존 제거)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: new URL('pdfjs-dist/cmaps/', import.meta.url).toString(),
  cMapPacked: true,
  standardFontDataUrl: new URL('pdfjs-dist/standard_fonts/', import.meta.url).toString(),
};

interface PdfViewerProps {
  fileUrl?: string;
  fileName?: string;
}

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
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  const { scale, wrapperRef, zoomIn, zoomOut, resetZoom, isDragging, dragHandlers } = useViewerControls();

  const isLoading = isDocumentLoading || isPageLoading;

  // 컨테이너 너비 감지 (ResizeObserver)
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width && width > 0) setContainerWidth(width);
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [wrapperRef]);

  // fileUrl 변경 시 상태 초기화
  const memoizedFile = useMemo(() => {
    setIsDocumentLoading(true);
    setIsPageLoading(true);
    setPageNumber(1);
    resetZoom();
    return fileUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsDocumentLoading(false);
  };

  const onDocumentLoadError = () => {
    setIsDocumentLoading(false);
    setIsPageLoading(false);
  };

  const goToPrevPage = () => {
    if (pageNumber <= 1) return;
    setIsPageLoading(true);
    setPageNumber(prev => prev - 1);
  };

  const goToNextPage = () => {
    if (pageNumber >= numPages) return;
    setIsPageLoading(true);
    setPageNumber(prev => prev + 1);
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

  const pageWidth = containerWidth - 32;

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.controls}>
        <div className={styles.pageControls}>
          <button onClick={goToPrevPage} disabled={pageNumber <= 1 || isLoading}>이전</button>
          <span>{isLoading ? '-' : pageNumber} / {isLoading ? '-' : numPages}</span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages || isLoading}>다음</button>
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
        <Document
          file={memoizedFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          options={options}
        >
          {/* 현재 페이지 */}
          <div style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            visibility: isLoading ? 'hidden' : 'visible',
          }}>
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onRenderSuccess={() => setIsPageLoading(false)}
            />
          </div>

          {/* 다음 페이지 프리렌더 (숨김) */}
          {!isDocumentLoading && pageNumber < numPages && (
            <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', top: 0, left: 0 }}>
              <Page
                pageNumber={pageNumber + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          )}
        </Document>
      </div>
    </div>
  );
}
