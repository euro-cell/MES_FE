import React, { useRef, useState } from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const next = clampScale(scale - e.deltaY * 0.0015 * scale);
    setScale(next);
    if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= MIN_SCALE) return;
    e.preventDefault();
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: offset.x, originY: offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
  };

  const stopDrag = () => {
    dragState.current = null;
  };

  const handleDoubleClick = () => {
    if (scale > MIN_SCALE) {
      setScale(MIN_SCALE);
      setOffset({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <img
        src={src}
        alt={alt}
        className={styles.lightboxImage}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          cursor: scale > MIN_SCALE ? 'grab' : 'zoom-in',
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onDoubleClick={handleDoubleClick}
        draggable={false}
      />
      <button className={styles.lightboxCloseBtn} onClick={onClose}>✕</button>
    </div>
  );
};

export default ImageLightbox;
