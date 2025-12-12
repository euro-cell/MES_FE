import type { SpecForm } from '../SpecTypes';

interface Props {
  form: SpecForm;
  handleChange: (section: string, field: string, index: number, key: string, value: string) => void;
  styles: any;
}

export default function SpecSectionAssembly({ form, handleChange, styles }: Props) {
  return (
    <>
      <tr>
        <td rowSpan={3} className={styles.specNewGroupCell}>
          Assembly
        </td>
        <td colSpan={2}>Stack no. (ea)</td>
        <td>
          <div className={styles.stackInputGroup}>
            <input
              value={form.assembly.stackNo.value1}
              onChange={e => handleChange('assembly', 'stackNo', 0, 'value1', e.target.value)}
            />
            /
            <input
              value={form.assembly.stackNo.value2}
              onChange={e => handleChange('assembly', 'stackNo', 0, 'value2', e.target.value)}
            />
          </div>
        </td>
        <td>
          <input
            value={form.assembly.stackNo.remark}
            onChange={e => handleChange('assembly', 'stackNo', 0, 'remark', e.target.value)}
          />
        </td>
      </tr>

      <tr>
        <td colSpan={2}>Separator (μm)</td>
        <td>
          <input
            value={form.assembly.separator.value}
            onChange={e => handleChange('assembly', 'separator', 0, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={form.assembly.separator.remark}
            onChange={e => handleChange('assembly', 'separator', 0, 'remark', e.target.value)}
          />
        </td>
      </tr>

      <tr>
        <td colSpan={2}>Electrolyte (g)</td>
        <td>
          <input
            value={form.assembly.electrolyte.value}
            onChange={e => handleChange('assembly', 'electrolyte', 0, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={form.assembly.electrolyte.remark}
            onChange={e => handleChange('assembly', 'electrolyte', 0, 'remark', e.target.value)}
          />
        </td>
      </tr>
    </>
  );
}
