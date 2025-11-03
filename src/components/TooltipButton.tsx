import styles from '../styles/TooltipButton.module.css';

interface TooltipButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  variant?: 'register' | 'view' | 'edit' | 'delete';
}

export default function TooltipButton({
  label,
  onClick,
  disabled = false,
  tooltip,
  variant = 'view',
}: TooltipButtonProps) {
  const variantClass = {
    register: styles.registerBtn,
    view: styles.viewBtn,
    edit: styles.editBtn,
    delete: styles.deleteBtn,
  }[variant];

  const className = `${variantClass} ${disabled ? styles.disabled : ''}`;

  return (
    <div className={styles.tooltipWrapper}>
      <button className={className} onClick={!disabled ? onClick : undefined} disabled={disabled}>
        {label}
      </button>

      {disabled && tooltip && <span className={styles.tooltip}>{tooltip}</span>}
    </div>
  );
}
