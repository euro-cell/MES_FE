import type { MaterialForm } from './MaterialTypes';

export const initialMaterialForm: MaterialForm = {
  cathode: [
    { category: '양극재', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '도전재', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '바인더', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '집전체', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '용매', materialType: '', model: '', company: '', unit: '', quantity: '' },
  ],
  anode: [
    { category: '음극재', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '도전재', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '바인더', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '집전체', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '용매', materialType: '', model: '', company: '', unit: '', quantity: '' },
  ],
  assembly: [
    { category: '분리막', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '리드탭', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '파우치', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '전해액', materialType: '', model: '', company: '', unit: '', quantity: '' },
    { category: '테이프', materialType: '', model: '', company: '', unit: '', quantity: '' },
  ],
};
