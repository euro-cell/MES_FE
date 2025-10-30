import { useState } from 'react';
import { ProductionService } from './ProductionService';
import '../../../../styles/material/production.css';

interface Props {
  productionId: number; // 선택된 프로덕트 ID
  onClose: () => void; // 모달 닫기 함수
  onSuccess: () => void; // 등록 성공 시 부모 새로고침 함수
}

export default function ProductionMaterialForm({ productionId, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    classification: 'CATHODE',
    category: '양극재',
    material: '',
    model: '',
    company: '',
    requiredAmount: '',
    unit: '',
  });

  const [loading, setLoading] = useState(false);

  /** 🔹 input/select 값 변경 핸들러 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /** 🔹 등록 버튼 클릭 시 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await ProductionService.addProductionMaterial(productionId, form);
      alert('✅ 자재가 등록되었습니다.');
      onSuccess(); // 부모 컴포넌트(ProductionList) 데이터 새로고침
      onClose(); // 모달 닫기
    } catch (err) {
      console.error('❌ 자재 등록 실패:', err);
      alert('자재 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h3>📦 자재 등록</h3>

        <form onSubmit={handleSubmit} className='material-form'>
          {/* 공정 선택 */}
          <label>
            공정 (classification)
            <select name='classification' value={form.classification} onChange={handleChange}>
              <option value='CATHODE'>양극</option>
              <option value='ANODE'>음극</option>
              <option value='ASSEMBLY'>조립</option>
            </select>
          </label>

          {/* 카테고리 선택 */}
          <label>
            카테고리 (category)
            <select name='category' value={form.category} onChange={handleChange}>
              <option value='각형'>각형</option>
              <option value='도전재'>도전재</option>
              <option value='리드탭'>리드탭</option>
              <option value='바인더'>바인더</option>
              <option value='분리막'>분리막</option>
              <option value='양극재'>양극재</option>
              <option value='용매'>용매</option>
              <option value='원통형'>원통형</option>
              <option value='음극재'>음극재</option>
              <option value='전해액'>전해액</option>
              <option value='집전체'>집전체</option>
              <option value='코인셀부품'>코인셀부품</option>
              <option value='테이프'>테이프</option>
              <option value='파우치'>파우치</option>
            </select>
          </label>

          {/* 자재명 */}
          <label>
            자재명
            <input type='text' name='material' value={form.material} onChange={handleChange} required />
          </label>

          {/* 모델명 */}
          <label>
            모델명
            <input type='text' name='model' value={form.model} onChange={handleChange} />
          </label>

          {/* 회사명 */}
          <label>
            회사명
            <input type='text' name='company' value={form.company} onChange={handleChange} />
          </label>

          {/* 소요량 */}
          <label>
            소요량
            <input
              type='number'
              name='requiredAmount'
              value={form.requiredAmount}
              onChange={handleChange}
              step='0.01'
              min='0'
            />
          </label>

          {/* 단위 */}
          <label>
            단위
            <input type='text' name='unit' value={form.unit} onChange={handleChange} />
          </label>

          {/* 버튼 영역 */}
          <div className='form-buttons'>
            <button type='submit' className='register-btn' disabled={loading}>
              {loading ? '등록 중...' : '등록'}
            </button>
            <button type='button' className='cancel-btn' onClick={onClose}>
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
