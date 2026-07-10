import styles from '../styles/components/TooltipButton.module.css';

interface TooltipButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  variant?: 'register' | 'view' | 'edit' | 'delete';
  /** 헤더에 놓이는 버튼은 solid, 테이블 행 내부는 기본값(outlined) */
  solid?: boolean;
}

export default function TooltipButton({
  label,
  onClick,
  disabled = false,
  tooltip,
  variant = 'view',
  solid = false,
}: TooltipButtonProps) {
  const variantClass = {
    register: styles.registerBtn,
    view: styles.viewBtn,
    edit: styles.editBtn,
    delete: styles.deleteBtn,
  }[variant];

  const className = `${variantClass} ${solid ? styles.solid : ''} ${disabled ? styles.disabled : ''}`;

  return (
    <div className={styles.tooltipWrapper}>
      <button className={className} onClick={!disabled ? onClick : undefined} disabled={disabled}>
        {label}
      </button>

      {disabled && tooltip && <span className={styles.tooltip}>{tooltip}</span>}
    </div>
  );
}
