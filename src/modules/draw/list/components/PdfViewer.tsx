import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from '../../../../styles/draw/PdfViewer.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) {
        setContainerWidth(wrapperRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.4));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !wrapperRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    wrapperRef.current.scrollLeft -= dx;
    wrapperRef.current.scrollTop -= dy;
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={styles.pdfViewer}>
      {title && <h3 className={styles.title}>{title}</h3>}

      <div className={styles.controls}>
        <div className={styles.pageControls}>
          <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
            이전
          </button>
          <span>
            {pageNumber} / {numPages}
          </span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            다음
          </button>
        </div>

        <div className={styles.zoomControls}>
          <button onClick={zoomOut}>-</button>
          <button onClick={resetZoom}>{Math.round(scale * 100)}%</button>
          <button onClick={zoomIn}>+</button>
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
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<p>PDF 로딩 중...</p>}>
          <Page pageNumber={pageNumber} width={containerWidth > 0 ? containerWidth * scale : undefined} />
        </Document>
      </div>
    </div>
  );
}
