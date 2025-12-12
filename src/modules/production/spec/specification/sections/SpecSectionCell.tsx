import type { SpecForm } from '../SpecTypes';

interface Props {
  form: SpecForm;
  handleChange: (section: string, field: string, index: number, key: string, value: string) => void;
  styles: any;
}

export default function SpecSectionCell({ form, handleChange, styles }: Props) {
  return (
    <>
      <tr>
        <td rowSpan={6} className={styles.specNewGroupCell}>
          Cell
        </td>
        <td colSpan={2}>N/P ratio</td>
        <td>
          <input
            value={form.cell.npRatio.value}
            onChange={e => handleChange('cell', 'npRatio', 0, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={form.cell.npRatio.remark}
            onChange={e => handleChange('cell', 'npRatio', 0, 'remark', e.target.value)}
          />
        </td>
      </tr>

      <tr>
        <td colSpan={2}>Nominal capacity (Ah)</td>
        <td>
          <input
            value={form.cell.nominalCapacity.value}
            onChange={e => handleChange('cell', 'nominalCapacity', 0, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={form.cell.nominalCapacity.remark}
            onChange={e => handleChange('cell', 'nominalCapacity', 0, 'remark', e.target.value)}
          />
        </td>
      </tr>

      <tr>
        <td colSpan={2}>Weight (g)</td>
        <td>
          <input
            value={form.cell.weight.value}
            onChange={e => handleChange('cell', 'weight', 0, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={form.cell.weight.remark}
            onChange={e => handleChange('cell', 'weight', 0, 'remark', e.target.value)}
          />
        </td>
      </tr>

      <tr>
        <td colSpan={2}>Thickness (mm)</td>
        <td>
          <input
            value={form.cell.thickness.value}
            onChange={e => handleChange('cell', 'thickness', 0, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={form.cell.thickness.remark}
            onChange={e => handleChange('cell', 'thickness', 0, 'remark', e.target.value)}
          />
        </td>
      </tr>

      <tr>
        <td rowSpan={2}>Energy density</td>
        <td>Gravimetric (Wh/kg)</td>
        <td>
          <input
            value={form.cell.energyDensity.gravimetric.value}
            onChange={e => handleChange('cell', 'energyDensity', 0, 'gravimetric.value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={form.cell.energyDensity.gravimetric.remark}
            onChange={e => handleChange('cell', 'energyDensity', 0, 'gravimetric.remark', e.target.value)}
          />
        </td>
      </tr>

      <tr>
        <td>Volumetric (Wh/L)</td>
        <td>
          <input
            value={form.cell.energyDensity.volumetric.value}
            onChange={e => handleChange('cell', 'energyDensity', 0, 'volumetric.value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={form.cell.energyDensity.volumetric.remark}
            onChange={e => handleChange('cell', 'energyDensity', 0, 'volumetric.remark', e.target.value)}
          />
        </td>
      </tr>
    </>
  );
}
