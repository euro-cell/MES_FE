import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/iqc/IQCPage.module.css';
import { getIQCProject, getIQCList, createIQC, updateIQC } from '../../../api/quality/IQCService';
import { createIQCMenus } from './menuConfig';
import type { IQCProject, IQCMenuType, IQCItem } from './IQCTypes';
import SummaryTable from './tables/SummaryTable';
import CathodeMaterial1Table from './tables/CathodeMaterial1Table';
import CathodeMaterial2Table from './tables/CathodeMaterial2Table';
import AnodeMaterialTable from './tables/AnodeMaterialTable';
import ConductiveAdditiveTable from './tables/ConductiveAdditiveTable';
import CurrentCollectorTable from './tables/CurrentCollectorTable';
import SeparatorTable from './tables/SeparatorTable';
import ElectrolyteTable from './tables/ElectrolyteTable';
import PouchTable from './tables/PouchTable';
import LeadTabTable from './tables/LeadTabTable';

export default function IQCPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState<IQCProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [iqcItems, setIqcItems] = useState<IQCItem[]>([]);

  const searchParams = new URLSearchParams(location.search);
  const menu = searchParams.get('menu') as IQCMenuType | null;

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      try {
        const found = await getIQCProject(Number(projectId));
        setProject(found);
      } catch (err) {
        console.error('프로젝트 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  useEffect(() => {
    const loadItems = async () => {
      if (!projectId) return;
      try {
        const items = await getIQCList(Number(projectId));
        setIqcItems(items);
      } catch (err) {
        console.error('IQC 목록 조회 실패:', err);
      }
    };
    loadItems();
  }, [projectId]);

  /** category에 해당하는 첫 번째 IQCItem 반환 */
  const getItemByCategory = (category: string): IQCItem | undefined =>
    iqcItems.find((item) => item.category === category);

  /** IQCItem에서 서버 전송용 바디로 변환 */
  const toRequestBody = (data: Partial<IQCItem>) => {
    const { id: _id, isPassed: _isPassed, ...body } = data as IQCItem;

    // results 필드 타입 변환: 빈 문자열→undefined(number), null isPassed→true(기본값)
    const results = body.results?.map((r) => ({
      ...r,
      refLastData: r.refLastData !== '' && r.refLastData !== undefined ? Number(r.refLastData) : undefined,
      sample1: r.sample1 !== '' && r.sample1 !== undefined ? Number(r.sample1) : undefined,
      sample2: r.sample2 !== '' && r.sample2 !== undefined ? Number(r.sample2) : undefined,
      sample3: r.sample3 !== '' && r.sample3 !== undefined ? Number(r.sample3) : undefined,
      isPassed: r.isPassed ?? true,
    }));

    return { ...body, results };
  };

  /** CathodeMaterial1 저장 핸들러 */
  const handleSaveCathodeMaterial1 = async (data: Partial<IQCItem>) => {
    if (!projectId) return;
    try {
      const existing = getItemByCategory('양극재');
      const body = toRequestBody(data);
      let saved: IQCItem;
      if (existing) {
        saved = await updateIQC(existing.id, body);
      } else {
        saved = await createIQC(Number(projectId), {
          ...body,
          category: '양극재',
          type: body.type ?? '',
          name: body.name ?? '',
        });
      }
      setIqcItems((prev) =>
        existing
          ? prev.map((item) => (item.id === existing.id ? saved : item))
          : [...prev, saved]
      );
      alert('저장되었습니다.');
    } catch (err) {
      console.error('양극재1 저장 실패:', err);
      alert('저장에 실패했습니다.');
    }
  };

  if (loading) return <p>데이터를 불러오는 중...</p>;
  if (!project) return <p>프로젝트를 찾을 수 없습니다.</p>;

  const iqcMenus = createIQCMenus(Number(projectId));

  const renderContent = () => {
    if (!menu) {
      return <div className={styles.placeholder}>메뉴를 선택하세요.</div>;
    }

    switch (menu) {
      case 'Summary':
        return <SummaryTable items={iqcItems} />;
      case 'CathodeMaterial1':
        return (
          <CathodeMaterial1Table
            data={getItemByCategory('양극재')}
            productionId={Number(projectId)}
            onSave={handleSaveCathodeMaterial1}
          />
        );
      case 'CathodeMaterial2':
        return (
          <CathodeMaterial2Table
            data={getItemByCategory('양극재2')}
            productionId={Number(projectId)}
            onSave={async (data) => {
              try {
                const { id: _id, isPassed: _isPassed, ...body } = data as IQCItem;
                const results = body.results?.map((r) => ({
                  ...r,
                  refLastData: r.refLastData !== '' && r.refLastData !== undefined ? Number(r.refLastData) : undefined,
                  sample1: r.sample1 !== '' && r.sample1 !== undefined ? Number(r.sample1) : undefined,
                  sample2: r.sample2 !== '' && r.sample2 !== undefined ? Number(r.sample2) : undefined,
                  sample3: r.sample3 !== '' && r.sample3 !== undefined ? Number(r.sample3) : undefined,
                  isPassed: r.isPassed ?? true,
                }));
                const reqBody = { ...body, results };
                const existing = getItemByCategory('양극재2');
                const saved = existing
                  ? await updateIQC(existing.id, reqBody)
                  : await createIQC(Number(projectId), { ...reqBody, category: '양극재2', type: reqBody.type ?? '', name: reqBody.name ?? '' });
                setIqcItems((prev) =>
                  existing ? prev.map((item) => (item.id === existing.id ? saved : item)) : [...prev, saved]
                );
                alert('저장되었습니다.');
              } catch {
                alert('저장에 실패했습니다.');
              }
            }}
          />
        );
      case 'AnodeMaterial':
        return (
          <AnodeMaterialTable
            data={getItemByCategory('음극재')}
            productionId={Number(projectId)}
            onSave={async (data) => {
              try {
                const existing = getItemByCategory('음극재');
                const body = toRequestBody(data);
                const saved = existing
                  ? await updateIQC(existing.id, body)
                  : await createIQC(Number(projectId), { ...body, category: '음극재', type: body.type ?? '', name: body.name ?? '' });
                setIqcItems((prev) =>
                  existing ? prev.map((item) => (item.id === existing.id ? saved : item)) : [...prev, saved]
                );
                alert('저장되었습니다.');
              } catch {
                alert('저장에 실패했습니다.');
              }
            }}
          />
        );
      case 'ConductiveAdditive':
        return (
          <ConductiveAdditiveTable
            data={getItemByCategory('도전재')}
            productionId={Number(projectId)}
            onSave={async (data) => {
              try {
                const existing = getItemByCategory('도전재');
                const body = toRequestBody(data);
                const saved = existing
                  ? await updateIQC(existing.id, body)
                  : await createIQC(Number(projectId), { ...body, category: '도전재', type: body.type ?? '', name: body.name ?? '' });
                setIqcItems((prev) =>
                  existing ? prev.map((item) => (item.id === existing.id ? saved : item)) : [...prev, saved]
                );
                alert('저장되었습니다.');
              } catch {
                alert('저장에 실패했습니다.');
              }
            }}
          />
        );
      case 'CurrentCollector':
        return (
          <CurrentCollectorTable
            data={getItemByCategory('집전체')}
            productionId={Number(projectId)}
            onSave={async (data) => {
              try {
                const existing = getItemByCategory('집전체');
                const body = toRequestBody(data);
                const saved = existing
                  ? await updateIQC(existing.id, body)
                  : await createIQC(Number(projectId), { ...body, category: '집전체', type: body.type ?? '', name: body.name ?? '' });
                setIqcItems((prev) =>
                  existing ? prev.map((item) => (item.id === existing.id ? saved : item)) : [...prev, saved]
                );
                alert('저장되었습니다.');
              } catch {
                alert('저장에 실패했습니다.');
              }
            }}
          />
        );
      case 'Separator':
        return (
          <SeparatorTable
            data={getItemByCategory('분리막')}
            productionId={Number(projectId)}
            onSave={async (data) => {
              try {
                const existing = getItemByCategory('분리막');
                const body = toRequestBody(data);
                const saved = existing
                  ? await updateIQC(existing.id, body)
                  : await createIQC(Number(projectId), { ...body, category: '분리막', type: body.type ?? '', name: body.name ?? '' });
                setIqcItems((prev) =>
                  existing ? prev.map((item) => (item.id === existing.id ? saved : item)) : [...prev, saved]
                );
                alert('저장되었습니다.');
              } catch {
                alert('저장에 실패했습니다.');
              }
            }}
          />
        );
      case 'Electrolyte':
        return (
          <ElectrolyteTable
            data={getItemByCategory('전해액')}
            productionId={Number(projectId)}
            onSave={async (data) => {
              try {
                const existing = getItemByCategory('전해액');
                const body = toRequestBody(data);
                const saved = existing
                  ? await updateIQC(existing.id, body)
                  : await createIQC(Number(projectId), { ...body, category: '전해액', type: body.type ?? '', name: body.name ?? '' });
                setIqcItems((prev) =>
                  existing ? prev.map((item) => (item.id === existing.id ? saved : item)) : [...prev, saved]
                );
                alert('저장되었습니다.');
              } catch {
                alert('저장에 실패했습니다.');
              }
            }}
          />
        );
      case 'Pouch':
        return (
          <PouchTable
            data={getItemByCategory('파우치')}
            productionId={Number(projectId)}
            onSave={async (data) => {
              try {
                const existing = getItemByCategory('파우치');
                const body = toRequestBody(data);
                const saved = existing
                  ? await updateIQC(existing.id, body)
                  : await createIQC(Number(projectId), { ...body, category: '파우치', type: body.type ?? '', name: body.name ?? '' });
                setIqcItems((prev) =>
                  existing ? prev.map((item) => (item.id === existing.id ? saved : item)) : [...prev, saved]
                );
                alert('저장되었습니다.');
              } catch {
                alert('저장에 실패했습니다.');
              }
            }}
          />
        );
      case 'LeadTab':
        return (
          <LeadTabTable
            data={getItemByCategory('리드탭')}
            productionId={Number(projectId)}
            onSave={async (data) => {
              try {
                const existing = getItemByCategory('리드탭');
                const body = toRequestBody(data);
                const saved = existing
                  ? await updateIQC(existing.id, body)
                  : await createIQC(Number(projectId), { ...body, category: '리드탭', type: body.type ?? '', name: body.name ?? '' });
                setIqcItems((prev) =>
                  existing ? prev.map((item) => (item.id === existing.id ? saved : item)) : [...prev, saved]
                );
                alert('저장되었습니다.');
              } catch {
                alert('저장에 실패했습니다.');
              }
            }}
          />
        );
      default:
        return <div className={styles.placeholder}>메뉴를 선택하세요.</div>;
    }
  };

  return (
    <div>
      <div className={styles.projectHeader}>
        <h2>프로젝트: {project.name}</h2>
        <button className={styles.backButton} onClick={() => navigate('/quality/iqc')}>
          ← 프로젝트 목록으로
        </button>
      </div>

      <SubmenuBar menus={iqcMenus} />

      <div className={styles.content} style={menu === 'Summary' ? { padding: 0, boxShadow: 'none' } : undefined}>
        {renderContent()}
      </div>
    </div>
  );
}
