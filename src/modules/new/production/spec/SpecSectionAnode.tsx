import type { SpecForm } from './SpecTypes';

interface Props {
  form: SpecForm;
  handleChange: (section: string, field: string, index: number, key: string, value: string) => void;
  addRow: (section: string, field: string) => void;
  removeRow: (section: string, field: string, index: number) => void;
  styles: any;
}

export default function SpecSectionAnode({ form, handleChange, addRow, removeRow, styles }: Props) {
  const rowSpan = form.anode.activeMaterial.length + form.anode.conductor.length + form.anode.binder.length + 3;

  return (
    <>
      {form.anode.activeMaterial.map((item, i) => (
        <tr key={`anode-active-${i}`}>
          {i === 0 && (
            <td rowSpan={rowSpan} className={styles.specNewGroupCell}>
              Anode
            </td>
          )}
          <td colSpan={2}>Active material {i + 1} (%)</td>
          <td>
            <input
              value={item.value}
              onChange={e => handleChange('anode', 'activeMaterial', i, 'value', e.target.value)}
            />
          </td>
          <td>
            <div className={styles.inputWithButtons}>
              <input
                value={item.remark}
                onChange={e => handleChange('anode', 'activeMaterial', i, 'remark', e.target.value)}
              />
              <div className={styles.buttonGroup}>
                <button type='button' className={styles.addBtn} onClick={() => addRow('anode', 'activeMaterial')}>
                  +
                </button>
                {i > 0 && (
                  <button
                    type='button'
                    className={styles.removeBtn}
                    onClick={() => removeRow('anode', 'activeMaterial', i)}
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      ))}

      {form.anode.conductor.map((item, i) => (
        <tr key={`anode-conductor-${i}`}>
          <td colSpan={2}>Conductor {i + 1} (%)</td>
          <td>
            <input value={item.value} onChange={e => handleChange('anode', 'conductor', i, 'value', e.target.value)} />
          </td>
          <td>
            <div className={styles.inputWithButtons}>
              <input
                value={item.remark}
                onChange={e => handleChange('anode', 'conductor', i, 'remark', e.target.value)}
              />
              <div className={styles.buttonGroup}>
                <button type='button' className={styles.addBtn} onClick={() => addRow('anode', 'conductor')}>
                  +
                </button>
                {i > 0 && (
                  <button type='button' className={styles.removeBtn} onClick={() => removeRow('anode', 'conductor', i)}>
                    −
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      ))}

      {form.anode.binder.map((item, i) => (
        <tr key={`anode-binder-${i}`}>
          <td colSpan={2}>Binder {i + 1} (%)</td>
          <td>
            <input value={item.value} onChange={e => handleChange('anode', 'binder', i, 'value', e.target.value)} />
          </td>
          <td>
            <div className={styles.inputWithButtons}>
              <input value={item.remark} onChange={e => handleChange('anode', 'binder', i, 'remark', e.target.value)} />
              <div className={styles.buttonGroup}>
                <button type='button' className={styles.addBtn} onClick={() => addRow('anode', 'binder')}>
                  +
                </button>
                {i > 0 && (
                  <button type='button' className={styles.removeBtn} onClick={() => removeRow('anode', 'binder', i)}>
                    −
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      ))}

      {['loadingLevel', 'thickness', 'electrodeDensity'].map(field => (
        <tr key={`anode-${field}`}>
          <td colSpan={2}>
            {field === 'loadingLevel'
              ? 'Loading level (mg/cm²)'
              : field === 'thickness'
              ? 'Thickness (μm)'
              : 'Electrode density (g/cc)'}
          </td>
          <td>
            <input
              value={(form.anode as any)[field].value}
              onChange={e => handleChange('anode', field, 0, 'value', e.target.value)}
            />
          </td>
          <td>
            <input
              value={(form.anode as any)[field].remark}
              onChange={e => handleChange('anode', field, 0, 'remark', e.target.value)}
            />
          </td>
        </tr>
      ))}
    </>
  );
}
