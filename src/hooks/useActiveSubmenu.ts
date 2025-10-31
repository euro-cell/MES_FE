import { useLocation, useNavigate } from 'react-router-dom';

interface SubmenuItem {
  title: string;
  path: string;
}

export function useActiveSubmenu(subMenus: SubmenuItem[]) {
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = subMenus.find(m => location.pathname === m.path)?.path;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return {
    activePath,
    handleNavigate,
  };
}
