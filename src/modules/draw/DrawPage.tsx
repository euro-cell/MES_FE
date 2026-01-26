import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from '../../styles/draw/Drawing.module.css';
import { getDrawings, deleteDrawing } from './DrawService';
import type { DrawingListItem, DrawingCategory } from './DrawTypes';
import TooltipButton from '../../components/TooltipButton';
import DrawingRegisterModal from './DrawingRegisterModal';
import DrawingEditModal from './DrawingEditModal';

export default function DrawPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category') as DrawingCategory | null;

  const [drawings, setDrawings] = useState<DrawingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // 등록 모달 관련 state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [addModeCategory, setAddModeCategory] = useState<DrawingCategory>('공장');
  const [addModeProjectName, setAddModeProjectName] = useState('');

  // 수정 모달 관련 state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DrawingListItem | null>(null);

  // 프로젝트명(중분류) 기준으로 그룹핑
  const groupedDrawings = useMemo(() => {
    const groups: Record<string, DrawingListItem[]> = {};
    if (!Array.isArray(drawings)) return groups;
    drawings.forEach(d => {
      if (!groups[d.projectName]) {
        groups[d.projectName] = [];
      }
      groups[d.projectName].push(d);
    });
    return groups;
  }, [drawings]);

  // 데이터 로드 후 모든 그룹 펼침 상태로 초기화
  useEffect(() => {
    setExpandedGroups(new Set(Object.keys(groupedDrawings)));
  }, [groupedDrawings]);

  const toggleGroup = (projectName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(projectName)) {
        next.delete(projectName);
      } else {
        next.add(projectName);
      }
      return next;
    });
  };

  const loadDrawings = async () => {
    try {
      setLoading(true);
      const params = category ? { category } : undefined;
      const data = await getDrawings(params);
      setDrawings(Array.isArray(data) ? data : []);
      setError(false);
    } catch (err) {
      console.error('도면 목록 조회 실패:', err);
      setError(true);
      setDrawings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrawings();
  }, [category]);

  // 등록 모달 열기
  const handleOpenRegisterModal = (addMode = false, projectName = '', itemCategory: DrawingCategory = '공장') => {
    setIsAddMode(addMode);
    setAddModeCategory(itemCategory);
    setAddModeProjectName(projectName);
    setShowRegisterModal(true);
  };

  // 수정 모달 열기
  const handleOpenEditModal = (item: DrawingListItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  // 삭제 처리
  const handleDelete = async (item: DrawingListItem) => {
    if (!window.confirm(`"${item.drawingNumber}" 도면을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await deleteDrawing(item.id);
      toast.success('도면이 삭제되었습니다.');
      loadDrawings();
    } catch (err) {
      console.error('도면 삭제 실패:', err);
      toast.error('도면 삭제에 실패했습니다.');
    }
  };

  return (
    <div className={styles.ledgerPage}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={() => handleOpenRegisterModal()}>
          + 도면 등록
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : error ? (
        <div className={styles.error}>데이터를 불러오는데 실패했습니다.</div>
      ) : (
        <table className={styles.ledgerTable}>
          <thead>
            <tr>
              <th style={{ width: '50px' }}></th>
              <th>등록일자</th>
              <th>프로젝트명 (공장명/제품명/설비명)</th>
              <th>도면번호</th>
              <th>버전</th>
              <th>도면 내용</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedDrawings).length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  등록된 도면이 없습니다.
                </td>
              </tr>
            ) : (
              Object.entries(groupedDrawings).map(([projectName, items]) => (
                <React.Fragment key={projectName}>
                  {/* 그룹 헤더 */}
                  <tr className={styles.groupHeader} onClick={() => toggleGroup(projectName)}>
                    <td>{expandedGroups.has(projectName) ? '▼' : '▶'}</td>
                    <td></td>
                    <td className={styles.projectName}>{projectName}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      {!expandedGroups.has(projectName) ? (
                        <span className={styles.itemCount}>({items.length})</span>
                      ) : (
                        <div onClick={e => e.stopPropagation()}>
                          <TooltipButton
                            label='추가'
                            variant='register'
                            onClick={() => handleOpenRegisterModal(true, projectName, items[0].category)}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                  {/* 그룹 아이템 */}
                  {expandedGroups.has(projectName) &&
                    items.map((item, idx) => (
                      <tr key={item.id} className={styles.groupItem}>
                        <td>{idx + 1}</td>
                        <td>{item.latestRegistrationDate}</td>
                        <td>{item.division || '-'}</td>
                        <td>{item.drawingNumber}</td>
                        <td>v{Number(item.currentVersion).toFixed(1)}</td>
                        <td>{item.description || '-'}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <TooltipButton label='조회' variant='view' onClick={() => navigate(`/draw/detail/${item.id}`)} />
                            <TooltipButton label='수정' variant='edit' onClick={() => handleOpenEditModal(item)} />
                            <TooltipButton label='삭제' variant='delete' onClick={() => handleDelete(item)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* 등록 모달 */}
      <DrawingRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={loadDrawings}
        isAddMode={isAddMode}
        defaultCategory={addModeCategory}
        defaultProjectName={addModeProjectName}
      />

      {/* 수정 모달 */}
      <DrawingEditModal
        isOpen={showEditModal}
        item={editingItem}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSuccess={loadDrawings}
      />
    </div>
  );
}
