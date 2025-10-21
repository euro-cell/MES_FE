import React, { useEffect, useState } from 'react';
import ProjectTable from './ProductionTable';
import ProjectRegister from './ProductionRegister';
import ProjectView from './ProductionView';
import '../../styles/project.css';

interface Project {
  id: number;
  name: string;
  company: string;
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: number;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // ✅ 프로젝트 목록 로드
  useEffect(() => {
    fetch('http://192.168.0.22:8080/project')
      .then(res => res.json())
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  // ✅ 삭제 기능
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`${name} 프로젝트를 삭제하시겠습니까?`)) return;
    await fetch(`http://192.168.0.22:8080/project/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className='project-page'>
      <h1>프로젝트 관리</h1>

      {loading ? (
        <p>📡 로딩 중...</p>
      ) : (
        <ProjectTable
          projects={projects}
          onRegister={project => {
            setSelectedProject(project);
            setShowPlanModal(true);
          }}
          onView={project => {
            setSelectedProject(project);
            setShowViewModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {showPlanModal && selectedProject && (
        <ProjectRegister project={selectedProject} onClose={() => setShowPlanModal(false)} />
      )}

      {showViewModal && selectedProject && (
        <ProjectView project={selectedProject} onClose={() => setShowViewModal(false)} />
      )}
    </div>
  );
}
