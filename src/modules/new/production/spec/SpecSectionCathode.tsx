import type { SpecForm } from './SpecTypes';

interface Props {
  form: SpecForm;
  handleChange: (section: string, field: string, index: number, key: string, value: string) => void;
  addRow: (section: string, field: string) => void;
  removeRow: (section: string, field: string, index: number) => void;
  styles: any;
}

export default function SpecSectionCathode({ form, handleChange, addRow, removeRow, styles }: Props) {
  const rowSpan = form.cathode.activeMaterial.length + form.cathode.conductor.length + form.cathode.binder.length + 3;

  return (
    <>
      {form.cathode.activeMaterial.map((item, i) => (
        <tr key={`cathode-active-${i}`}>
          {i === 0 && (
            <td rowSpan={rowSpan} className={styles.specNewGroupCell}>
              Cathode
            </td>
          )}
          <td colSpan={2}>Active material {i + 1} (%)</td>
          <td>
            <input
              value={item.value}
              onChange={e => handleChange('cathode', 'activeMaterial', i, 'value', e.target.value)}
            />
          </td>
          <td>
            <div className={styles.inputWithButtons}>
              <input
                value={item.remark}
                onChange={e => handleChange('cathode', 'activeMaterial', i, 'remark', e.target.value)}
              />
              <div className={styles.buttonGroup}>
                <button type='button' className={styles.addBtn} onClick={() => addRow('cathode', 'activeMaterial')}>
                  +
                </button>
                {i > 0 && (
                  <button
                    type='button'
                    className={styles.removeBtn}
                    onClick={() => removeRow('cathode', 'activeMaterial', i)}
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      ))}

      {form.cathode.conductor.map((item, i) => (
        <tr key={`cathode-conductor-${i}`}>
          <td colSpan={2}>Conductor {i + 1} (%)</td>
          <td>
            <input
              value={item.value}
              onChange={e => handleChange('cathode', 'conductor', i, 'value', e.target.value)}
            />
          </td>
          <td>
            <div className={styles.inputWithButtons}>
              <input
                value={item.remark}
                onChange={e => handleChange('cathode', 'conductor', i, 'remark', e.target.value)}
              />
              <div className={styles.buttonGroup}>
                <button type='button' className={styles.addBtn} onClick={() => addRow('cathode', 'conductor')}>
                  +
                </button>
                {i > 0 && (
                  <button
                    type='button'
                    className={styles.removeBtn}
                    onClick={() => removeRow('cathode', 'conductor', i)}
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      ))}

      {form.cathode.binder.map((item, i) => (
        <tr key={`cathode-binder-${i}`}>
          <td colSpan={2}>Binder {i + 1} (%)</td>
          <td>
            <input value={item.value} onChange={e => handleChange('cathode', 'binder', i, 'value', e.target.value)} />
          </td>
          <td>
            <div className={styles.inputWithButtons}>
              <input
                value={item.remark}
                onChange={e => handleChange('cathode', 'binder', i, 'remark', e.target.value)}
              />
              <div className={styles.buttonGroup}>
                <button type='button' className={styles.addBtn} onClick={() => addRow('cathode', 'binder')}>
                  +
                </button>
                {i > 0 && (
                  <button type='button' className={styles.removeBtn} onClick={() => removeRow('cathode', 'binder', i)}>
                    −
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      ))}

      {['loadingLevel', 'thickness', 'electrodeDensity'].map(field => (
        <tr key={`cathode-${field}`}>
          <td colSpan={2}>
            {field === 'loadingLevel'
              ? 'Loading level (mg/cm²)'
              : field === 'thickness'
              ? 'Thickness (μm)'
              : 'Electrode density (g/cc)'}
          </td>
          <td>
            <input
              value={(form.cathode as any)[field].value}
              onChange={e => handleChange('cathode', field, 0, 'value', e.target.value)}
            />
          </td>
          <td>
            <input
              value={(form.cathode as any)[field].remark}
              onChange={e => handleChange('cathode', field, 0, 'remark', e.target.value)}
            />
          </td>
        </tr>
      ))}
    </>
  );
}
