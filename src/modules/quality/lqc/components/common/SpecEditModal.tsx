import { useState, useEffect } from 'react';
import styles from '../../../../../styles/quality/lqc/SpecEditModal.module.css';

interface SpecValue {
  target?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit: string;
}

interface SpecEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (specs: Record<string, SpecValue>) => void;
  title: string;
  specs: Record<string, SpecValue>;
  specFields: {
    key: string;
    label: string;
    type: 'target-tolerance' | 'max-only' | 'min-only' | 'range';
    unit: string;
  }[];
}

export default function SpecEditModal({ isOpen, onClose, onSave, title, specs, specFields }: SpecEditModalProps) {
  const [editedSpecs, setEditedSpecs] = useState<Record<string, SpecValue>>(specs);

  useEffect(() => {
    setEditedSpecs(specs);
  }, [specs]);

  if (!isOpen) return null;

  const handleFieldChange = (key: string, field: keyof SpecValue, value: string) => {
    setEditedSpecs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value === '' ? undefined : Number(value),
      },
    }));
  };

  const handleSave = () => {
    onSave(editedSpecs);
    onClose();
  };

  const renderSpecInput = (specField: typeof specFields[0]) => {
    const spec = editedSpecs[specField.key] || { unit: specField.unit };

    switch (specField.type) {
      case 'target-tolerance':
        return (
          <div className={styles.inputGroup}>
            <div className={styles.inputRow}>
              <label>목표값:</label>
              <input
                type="number"
                step="any"
                value={spec.target ?? ''}
                onChange={e => handleFieldChange(specField.key, 'target', e.target.value)}
              />
            </div>
            <div className={styles.inputRow}>
              <label>오차범위 (±):</label>
              <input
                type="number"
                step="any"
                value={spec.tolerance ?? ''}
                onChange={e => handleFieldChange(specField.key, 'tolerance', e.target.value)}
              />
            </div>
            <div className={styles.preview}>
              표시: {spec.target ?? '-'}±{spec.tolerance ?? '-'} {specField.unit}
            </div>
          </div>
        );

      case 'max-only':
        return (
          <div className={styles.inputGroup}>
            <div className={styles.inputRow}>
              <label>최대값:</label>
              <input
                type="number"
                step="any"
                value={spec.max ?? ''}
                onChange={e => handleFieldChange(specField.key, 'max', e.target.value)}
              />
            </div>
            <div className={styles.preview}>
              표시: ≤{spec.max ?? '-'} {specField.unit}
            </div>
          </div>
        );

      case 'min-only':
        return (
          <div className={styles.inputGroup}>
            <div className={styles.inputRow}>
              <label>최소값:</label>
              <input
                type="number"
                step="any"
                value={spec.min ?? ''}
                onChange={e => handleFieldChange(specField.key, 'min', e.target.value)}
              />
            </div>
            <div className={styles.preview}>
              표시: ≥{spec.min ?? '-'} {specField.unit}
            </div>
          </div>
        );

      case 'range':
        return (
          <div className={styles.inputGroup}>
            <div className={styles.inputRow}>
              <label>최소값:</label>
              <input
                type="number"
                step="any"
                value={spec.min ?? ''}
                onChange={e => handleFieldChange(specField.key, 'min', e.target.value)}
              />
            </div>
            <div className={styles.inputRow}>
              <label>최대값:</label>
              <input
                type="number"
                step="any"
                value={spec.max ?? ''}
                onChange={e => handleFieldChange(specField.key, 'max', e.target.value)}
              />
            </div>
            <div className={styles.preview}>
              표시: {spec.min ?? '-'} ~ {spec.max ?? '-'} {specField.unit}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title} 규격 설정</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {specFields.map(field => (
            <div key={field.key} className={styles.specItem}>
              <h4>
                {field.label} ({field.unit})
              </h4>
              {renderSpecInput(field)}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
