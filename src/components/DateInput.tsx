import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { getYear, getMonth } from 'date-fns';
import { forwardRef } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/DateInput.module.css';

// 한국어 로케일 등록
registerLocale('ko', ko);

interface DateInputProps {
  value: string; // YYYY-MM-DD 형식
  onChange: (value: string) => void;
  className?: string;
}

// 년도 범위 설정 (2022 ~ 2050)
const years = Array.from({ length: 29 }, (_, i) => 2022 + i);
const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

// 커스텀 입력 필드 (자동 포맷팅)
const CustomInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ value, onChange, onClick, ...props }, ref) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const digits = input.replace(/\D/g, '').slice(0, 8);

      let formatted = '';
      if (digits.length <= 4) {
        formatted = digits;
      } else if (digits.length <= 6) {
        formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
      } else {
        formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
      }

      e.target.value = formatted;
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        ref={ref}
        value={value}
        onChange={handleInputChange}
        onClick={onClick}
        {...props}
      />
    );
  }
);
CustomInput.displayName = 'CustomInput';

export default function DateInput({ value, onChange, className }: DateInputProps) {
  // YYYY-MM-DD 문자열을 Date 객체로 변환
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(date.getTime()) ? null : date;
  };

  // Date 객체를 YYYY-MM-DD 문자열로 변환
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (date: Date | null) => {
    onChange(formatDate(date));
  };

  return (
    <DatePicker
      selected={parseDate(value)}
      onChange={handleChange}
      dateFormat='yyyy-MM-dd'
      locale='ko'
      placeholderText='YYYY-MM-DD'
      className={`${styles.datePicker} ${className || ''}`}
      portalId='root'
      customInput={<CustomInput />}
      renderCustomHeader={({ date, changeYear, changeMonth }) => (
        <div className={styles.customHeader}>
          <select
            value={getYear(date)}
            onChange={({ target: { value: y } }) => changeYear(Number(y))}
            className={styles.headerSelect}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
          <select
            value={getMonth(date)}
            onChange={({ target: { value: m } }) => changeMonth(Number(m))}
            className={styles.headerSelect}
          >
            {months.map((month, idx) => (
              <option key={month} value={idx}>
                {month}
              </option>
            ))}
          </select>
        </div>
      )}
    />
  );
}
