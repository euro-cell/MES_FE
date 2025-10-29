import { useState } from 'react';
import '../../styles/batteryDesign/form.css';
import { batteryDesignService } from './BatteryDesignService';
import type { BatteryDesignFormData } from './BatteryDesignTypes';
import { CathodeSection, AnodeSection, AssemblySection, CellSection } from './BatteryDesignComponents';

export default function BatteryDesignForm({ productionId }: { productionId: number }) {
  const [formData, setFormData] = useState<BatteryDesignFormData>({
    cathode: {
      activeMaterial1: { value: '', remark: '' },
      activeMaterial2: { value: '', remark: '' },
      conductor: { value: '', remark: '' },
      binder: { value: '', remark: '' },
      loadingLevel: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      electrodeDensity: { value: '', remark: '' },
    },
    anode: {
      activeMaterial: { value: '', remark: '' },
      conductor: { value: '', remark: '' },
      binder: { value: '', remark: '' },
      loadingLevel: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      electrodeDensity: { value: '', remark: '' },
    },
    assembly: {
      stackNo: { value1: '', value2: '', remark: '' },
      separator: { value: '', remark: '' },
      electrolyte: { value: '', remark: '' },
    },
    cell: {
      npRatio: { value: '', remark: '' },
      nominalCapacity: { value: '', remark: '' },
      weight: { value: '', remark: '' },
      thickness: { value: '', remark: '' },
      energyDensity: {
        gravimetric: { value: '', remark: '' },
        volumetric: { value: '', remark: '' },
      },
    },
  });

  const handleChange = (
    section: keyof BatteryDesignFormData | string,
    field: string,
    key: 'value' | 'remark' | 'value1' | 'value2',
    value: string
  ) => {
    setFormData(prev => {
      const updated: BatteryDesignFormData = structuredClone(prev);
      if (section.includes('.')) {
        const [parent, child] = section.split('.') as [keyof BatteryDesignFormData, string];
        (updated[parent] as any)[child][field][key] = value;
      } else {
        (updated[section as keyof BatteryDesignFormData] as any)[field][key] = value;
      }
      return updated;
    });
  };

  /** ✅ 숫자 변환 */
  const convertValuesToNumbers = (data: any): any => {
    if (Array.isArray(data)) return data.map(convertValuesToNumbers);
    if (data && typeof data === 'object') {
      const result: any = {};
      for (const [key, val] of Object.entries(data)) {
        if (val && typeof val === 'object' && 'value' in val) {
          result[key] = {
            ...val,
            value: val.value === '' || isNaN(Number(val.value)) ? 0 : Number(val.value),
          };
        } else {
          result[key] = convertValuesToNumbers(val);
        }
      }
      return result;
    }
    return data;
  };

  const handleSubmit = async () => {
    try {
      const converted = convertValuesToNumbers(formData);
      console.log('📦 전송 데이터:', converted);

      // ✅ productionId를 URL 파람으로 보냄
      await batteryDesignService.saveDesign(productionId, converted);
      alert('✅ 전지 설계가 저장되었습니다.');
    } catch (err) {
      console.error(err);
      alert('❌ 저장 실패');
    }
  };

  return (
    <div className='battery-design-form'>
      <h2>전지 설계 입력</h2>

      <table className='design-table'>
        <thead>
          <tr>
            <th colSpan={3}>Classification</th>
            <th>Value</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          <CathodeSection formData={formData} handleChange={handleChange} />
          <AnodeSection formData={formData} handleChange={handleChange} />
          <AssemblySection formData={formData} handleChange={handleChange} />
          <CellSection formData={formData} handleChange={handleChange} />
        </tbody>
      </table>

      <div className='button-wrap'>
        <button className='save-btn' onClick={handleSubmit}>
          저장
        </button>
      </div>
    </div>
  );
}
