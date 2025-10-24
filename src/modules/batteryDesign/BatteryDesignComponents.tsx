import React from 'react';
import type { FieldData, BatteryDesignFormData } from './BatteryDesignTypes';

interface SectionProps {
  formData: BatteryDesignFormData;
  handleChange: (
    section: keyof BatteryDesignFormData | string,
    field: string,
    key: 'value' | 'remark' | 'value1' | 'value2',
    value: string
  ) => void;
}

/* ======================
   🔹 Cathode Section
====================== */
export const CathodeSection: React.FC<SectionProps> = ({ formData, handleChange }) => (
  <>
    {[
      ['active_material_1', 'Active material 1 (%)'],
      ['active_material_2', 'Active material 2 (%)'],
      ['conductor', 'Conductor (%)'],
      ['binder', 'Binder (%)'],
      ['loading_level', 'Loading level (mg/cm²)'],
      ['thickness', 'Thickness (μm)'],
      ['electrode_density', 'Electrode density (g/cc)'],
    ].map(([key, label], i) => (
      <tr key={key}>
        {i === 0 && (
          <td rowSpan={7} className='group-cell'>
            Cathode
          </td>
        )}
        <td colSpan={2}>{label}</td>
        <td>
          <input
            value={formData.cathode[key].value}
            onChange={e => handleChange('cathode', key, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={formData.cathode[key].remark}
            onChange={e => handleChange('cathode', key, 'remark', e.target.value)}
          />
        </td>
      </tr>
    ))}
  </>
);

/* ======================
   🔹 Anode Section
====================== */
export const AnodeSection: React.FC<SectionProps> = ({ formData, handleChange }) => (
  <>
    {[
      ['active_material', 'Active material (%)'],
      ['conductor', 'Conductor (%)'],
      ['binder', 'Binder (%)'],
      ['loading_level', 'Loading level (mg/cm²)'],
      ['thickness', 'Thickness (μm)'],
      ['electrode_density', 'Electrode density (g/cc)'],
    ].map(([key, label], i) => (
      <tr key={key}>
        {i === 0 && (
          <td rowSpan={6} className='group-cell'>
            Anode
          </td>
        )}
        <td colSpan={2}>{label}</td>
        <td>
          <input
            value={formData.anode[key].value}
            onChange={e => handleChange('anode', key, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={formData.anode[key].remark}
            onChange={e => handleChange('anode', key, 'remark', e.target.value)}
          />
        </td>
      </tr>
    ))}
  </>
);

/* ======================
   🔹 Assembly Section
====================== */
export const AssemblySection: React.FC<SectionProps> = ({ formData, handleChange }) => (
  <>
    <tr>
      <td rowSpan={3} className='group-cell'>
        Assembly
      </td>
      <td colSpan={2}>Stack no. (ea)</td>
      <td className='multi-input'>
        <input
          className='small-input'
          value={formData.assembly.stack_no.value1}
          onChange={e => handleChange('assembly', 'stack_no', 'value1', e.target.value)}
        />
        /
        <input
          className='small-input'
          value={formData.assembly.stack_no.value2}
          onChange={e => handleChange('assembly', 'stack_no', 'value2', e.target.value)}
        />
      </td>
      <td>
        <input
          value={formData.assembly.stack_no.remark}
          onChange={e => handleChange('assembly', 'stack_no', 'remark', e.target.value)}
        />
      </td>
    </tr>

    {['separator', 'electrolyte'].map(key => (
      <tr key={key}>
        <td colSpan={2}>{key === 'separator' ? 'Separator (μm)' : 'Electrolyte (g)'}</td>
        <td>
          <input
            value={(formData.assembly[key] as FieldData).value}
            onChange={e => handleChange('assembly', key, 'value', e.target.value)}
          />
        </td>
        <td>
          <input
            value={(formData.assembly[key] as FieldData).remark}
            onChange={e => handleChange('assembly', key, 'remark', e.target.value)}
          />
        </td>
      </tr>
    ))}
  </>
);

/* ======================
   🔹 Cell Section
====================== */
export const CellSection: React.FC<SectionProps> = ({ formData, handleChange }) => (
  <>
    {['np_ratio', 'nominal_capacity', 'weight', 'thickness'].map((key, i) => (
      <tr key={key}>
        {i === 0 && (
          <td rowSpan={6} className='group-cell'>
            Cell
          </td>
        )}
        <td colSpan={2}>
          {{
            np_ratio: 'N/P ratio',
            nominal_capacity: 'Nominal capacity (Ah)',
            weight: 'Weight (g)',
            thickness: 'Thickness (mm)',
          }[key] || key}
        </td>
        <td>
          <input value={formData.cell[key].value} onChange={e => handleChange('cell', key, 'value', e.target.value)} />
        </td>
        <td>
          <input
            value={formData.cell[key].remark}
            onChange={e => handleChange('cell', key, 'remark', e.target.value)}
          />
        </td>
      </tr>
    ))}

    {/* ✅ Energy density */}
    <tr>
      <td rowSpan={2}>Energy density</td>
      <td>Gravimetric (Wh/kg)</td>
      <td>
        <input
          value={formData.cell.energy_density.gravimetric.value}
          onChange={e => handleChange('cell.energy_density', 'gravimetric', 'value', e.target.value)}
        />
      </td>
      <td>
        <input
          value={formData.cell.energy_density.gravimetric.remark}
          onChange={e => handleChange('cell.energy_density', 'gravimetric', 'remark', e.target.value)}
        />
      </td>
    </tr>
    <tr>
      <td>Volumetric (Wh/L)</td>
      <td>
        <input
          value={formData.cell.energy_density.volumetric.value}
          onChange={e => handleChange('cell.energy_density', 'volumetric', 'value', e.target.value)}
        />
      </td>
      <td>
        <input
          value={formData.cell.energy_density.volumetric.remark}
          onChange={e => handleChange('cell.energy_density', 'volumetric', 'remark', e.target.value)}
        />
      </td>
    </tr>
  </>
);
