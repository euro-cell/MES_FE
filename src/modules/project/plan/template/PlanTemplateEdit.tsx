import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../../../../styles/project/plan/PlanTemplate.module.css';
import type { ProcessTemplateItem } from '../PlanTypes';
import { getTemplate, createTemplate, saveTemplate } from './templateApi';
import { MOCK_TEMPLATES } from './mockTemplates';
import { getErrorMessage } from '../../../../api/errorHandler';

const GROUP_OPTIONS = ['Electrode', 'Cell Assembly', 'Cell Formation'];
const BATTERY_TYPE_OPTIONS = ['파우치형', '원통형'];

interface EditableItem {
  key: string;
  group: string;
  name: string;
  hasTypes: boolean;
}

interface EditRow {
  itemKey: string;
  itemIndex: number;
  group: string;
  name: string;
  type: string | null;
  hasTypes: boolean;
}

let tempKeySeq = 0;
const nextKey = () => `new-${tempKeySeq++}`;

/** 공정 항목을 Anode/Cathode까지 펼친 행 단위로 변환 (rowSpan 렌더링용) */
const toEditRows = (items: EditableItem[]): EditRow[] =>
  items.flatMap((item, itemIndex): EditRow[] => {
    if (!item.hasTypes) {
      return [{ itemKey: item.key, itemIndex, group: item.group, name: item.name, type: null, hasTypes: false }];
    }
    return ['Anode', 'Cathode'].map(type => ({
      itemKey: item.key,
      itemIndex,
      group: item.group,
      name: item.name,
      type,
      hasTypes: true,
    }));
  });

/** rowSpan 계산: group은 연속된 동일 group 구간, name은 같은 itemIndex(같은 공정) 구간으로 병합 */
const getRowSpans = (rows: EditRow[]) => {
  const spans: Record<number, { groupSpan: number; nameSpan: number }> = {};
  let i = 0;
  while (i < rows.length) {
    const group = rows[i].group;
    let groupCount = 0;
    while (i + groupCount < rows.length && rows[i + groupCount].group === group) groupCount++;

    let j = 0;
    while (j < groupCount) {
      const itemIndex = rows[i + j].itemIndex;
      let nameCount = 0;
      while (j + nameCount < groupCount && rows[i + j + nameCount].itemIndex === itemIndex) nameCount++;

      const startIndex = i + j;
      spans[startIndex] = { groupSpan: 0, nameSpan: nameCount };
      if (j === 0) spans[startIndex].groupSpan = groupCount;
      j += nameCount;
    }
    i += groupCount;
  }
  return spans;
};

export default function PlanTemplateEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const templateId = isNew ? null : Number(id);

  const [name, setName] = useState('');
  const [formFactor, setFormFactor] = useState('');
  const [items, setItems] = useState<EditableItem[]>(() =>
    isNew ? GROUP_OPTIONS.map(group => ({ key: nextKey(), group, name: '', hasTypes: false })) : [],
  );
  const [isLoading, setIsLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew || !templateId) return;
    getTemplate(templateId).then(template => {
      if (!template) return;
      setName(template.name);
      setFormFactor(template.formFactor);
      setItems(
        template.items.flatMap((item): EditableItem[] => {
          if (item.types.length === 0) {
            return [{ key: nextKey(), group: item.group, name: item.name, hasTypes: false }];
          }
          return [{ key: nextKey(), group: item.group, name: item.name, hasTypes: true }];
        }),
      );
      setIsLoading(false);
    });
  }, [isNew, templateId]);

  const handleAddRow = (group: string) => {
    setItems(prev => {
      const newItem: EditableItem = { key: nextKey(), group, name: '', hasTypes: false };
      const lastIndexOfGroup = prev.reduce((acc, item, i) => (item.group === group ? i : acc), -1);
      if (lastIndexOfGroup === -1) return [...prev, newItem];
      const next = [...prev];
      next.splice(lastIndexOfGroup + 1, 0, newItem);
      return next;
    });
  };

  const handleRemoveRow = (key: string) => {
    setItems(prev => prev.filter(item => item.key !== key));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    setItems(prev => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleFieldChange = (key: string, field: 'group' | 'name', value: string) => {
    setItems(prev => prev.map(item => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const handleFormFactorChange = (value: string) => {
    setFormFactor(value);
    if (!isNew) return;

    const preset = MOCK_TEMPLATES.find(t => t.formFactor === value);
    if (!preset) return;

    setItems(
      preset.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(item => ({ key: nextKey(), group: item.group, name: item.name, hasTypes: item.types.length > 0 })),
    );
  };

  const handleHasTypesChange = (key: string, hasTypes: boolean) => {
    setItems(prev => prev.map(item => (item.key === key ? { ...item, hasTypes } : item)));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('템플릿명을 입력해주세요.');
      return;
    }
    if (!formFactor.trim()) {
      alert('전지 종류를 선택해주세요.');
      return;
    }
    if (items.length === 0) {
      alert('공정을 1개 이상 추가해주세요.');
      return;
    }
    if (items.some(item => !item.name.trim())) {
      alert('공정명이 비어있는 행이 있습니다.');
      return;
    }

    const payloadItems: Omit<ProcessTemplateItem, 'id'>[] = items.map((item, index) => ({
      group: item.group,
      name: item.name.trim(),
      types: item.hasTypes ? ['Anode', 'Cathode'] : [],
      order: index + 1,
    }));

    try {
      if (isNew) {
        const created = await createTemplate(name.trim(), formFactor.trim());
        await saveTemplate(created.id, { name: name.trim(), formFactor: formFactor.trim(), items: payloadItems });
      } else if (templateId) {
        await saveTemplate(templateId, { name: name.trim(), formFactor: formFactor.trim(), items: payloadItems });
      }
      alert('저장되었습니다.');
      navigate('/project/plan/template');
    } catch (err) {
      console.error(err);
      alert(getErrorMessage(err, '저장 중 오류가 발생했습니다.'));
    }
  };

  if (isLoading) {
    return <div className={styles.page}>불러오는 중...</div>;
  }

  const editRows = toEditRows(items);
  const rowSpans = getRowSpans(editRows);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h3>🧩 {isNew ? '새 템플릿' : '템플릿 편집'}</h3>
        <button className={styles.backBtn} onClick={() => navigate('/project/plan/template')}>
          ← 돌아가기
        </button>
      </div>

      <div className={styles.metaRow}>
        <label>
          템플릿명:
          <input type='text' value={name} onChange={e => setName(e.target.value)} placeholder='예: 파우치형 표준' />
        </label>
        <label>
          전지 종류:
          <select value={formFactor} onChange={e => handleFormFactorChange(e.target.value)}>
            <option value=''>선택</option>
            {BATTERY_TYPE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className={styles.itemTable}>
        <thead>
          <tr>
            <th style={{ width: '18%' }}>Group</th>
            <th style={{ width: '32%' }}>Process</th>
            <th style={{ width: '15%' }}>Type</th>
            <th style={{ width: '10%' }}>구분</th>
            <th style={{ width: '15%' }}>순서</th>
            <th style={{ width: '10%' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {editRows.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.emptyState}>
                공정을 추가해주세요.
              </td>
            </tr>
          ) : (
            editRows.map((row, index) => {
              const span = rowSpans[index] || { groupSpan: 0, nameSpan: 0 };
              const isFirstOfItem = span.nameSpan > 0;
              const isLastItem = row.itemIndex === items.length - 1;

              return (
                <tr key={`${row.itemKey}_${row.type ?? 'single'}`}>
                  {span.groupSpan > 0 && (
                    <td key='group' rowSpan={span.groupSpan}>
                      <select value={row.group} onChange={e => handleFieldChange(row.itemKey, 'group', e.target.value)}>
                        {GROUP_OPTIONS.map(group => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}

                  {isFirstOfItem && (
                    <td key='name' rowSpan={span.nameSpan}>
                      <input
                        key={row.itemKey}
                        type='text'
                        value={row.name}
                        onChange={e => handleFieldChange(row.itemKey, 'name', e.target.value)}
                        placeholder='공정명'
                      />
                    </td>
                  )}

                  <td key='type'>{row.type ?? '-'}</td>

                  {isFirstOfItem && (
                    <td key='hasTypes' rowSpan={span.nameSpan}>
                      <input
                        type='checkbox'
                        checked={row.hasTypes}
                        onChange={e => handleHasTypesChange(row.itemKey, e.target.checked)}
                        title='Anode/Cathode 구분'
                      />
                    </td>
                  )}

                  {isFirstOfItem && (
                    <td key='order' rowSpan={span.nameSpan}>
                      <div className={styles.rowActions}>
                        <button
                          type='button'
                          className={styles.iconBtn}
                          disabled={row.itemIndex === 0}
                          onClick={() => handleMove(row.itemIndex, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type='button'
                          className={styles.iconBtn}
                          disabled={isLastItem}
                          onClick={() => handleMove(row.itemIndex, 1)}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                  )}

                  {isFirstOfItem && (
                    <td key='manage' rowSpan={span.nameSpan}>
                      <div className={styles.rowActions}>
                        <button
                          type='button'
                          className={`${styles.iconBtn} ${styles.danger}`}
                          onClick={() => handleRemoveRow(row.itemKey)}
                        >
                          삭제
                        </button>
                        {span.groupSpan > 0 && (
                          <button
                            type='button'
                            className={`${styles.iconBtn} ${styles.success}`}
                            onClick={() => handleAddRow(row.group)}
                            title={`${row.group} 그룹에 공정 추가`}
                          >
                            + 추가
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className={styles.footerArea}>
        <button className={styles.cancelBtn} onClick={() => navigate('/project/plan/template')}>
          취소
        </button>
        <button className={styles.saveBtn} onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
}
