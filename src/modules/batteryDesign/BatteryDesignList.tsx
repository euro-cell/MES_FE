import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/batteryDesign/list.css';
import BatteryDesignForm from './BatteryDesignForm';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Project {
  id: number;
  name: string;
}

export default function BatteryDesignList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // ✅ 등록폼 표시 여부 상태

  /** ✅ 프로젝트 리스트 불러오기 */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
      setProjects(res.data);
    } catch (err) {
      console.error('프로젝트 목록 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 삭제 버튼 클릭 시 */
  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${API_BASE}/production/${id}`, { withCredentials: true });
      alert('삭제되었습니다.');
      fetchProjects(); // 리스트 갱신
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  /** ✅ 등록 버튼 클릭 시 */
  const handleRegisterClick = () => {
    setShowForm(true);
  };

  /** ✅ 등록 폼 닫기 (뒤로가기) */
  const handleBackToList = () => {
    setShowForm(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <p>로딩 중...</p>;

  // ✅ 등록 화면일 때
  if (showForm) {
    return (
      <div className='battery-design-form-container'>
        <button className='back-btn' onClick={handleBackToList}>
          ← 목록으로
        </button>
        <BatteryDesignForm />
      </div>
    );
  }

  // ✅ 기본 리스트 화면
  return (
    <div className='battery-design-list'>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>프로젝트명</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td className='actions'>
                  <button className='view-btn'>조회</button>
                  <button className='register-btn' onClick={handleRegisterClick}>
                    등록
                  </button>
                  <button className='delete-btn' onClick={() => handleDelete(p.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>등록된 프로젝트가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
