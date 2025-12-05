import { useLocation, useNavigate } from 'react-router-dom';

interface SubmenuItem {
  title: string;
  path: string;
}

export function useActiveSubmenu(subMenus: SubmenuItem[]) {
  const location = useLocation();
  const navigate = useNavigate();

  const fullPath = location.pathname + location.search;
  const activePath = subMenus.find(m => {
    if (m.path.includes('?')) {
      return fullPath === m.path;
    }
    return location.pathname === m.path || location.pathname.startsWith(m.path + '/');
  })?.path;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return {
    activePath,
    handleNavigate,
  };
}
