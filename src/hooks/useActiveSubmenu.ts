import { useLocation, useNavigate } from 'react-router-dom';

interface SubmenuItem {
  title: string;
  path: string;
}

export function useActiveSubmenu(subMenus: SubmenuItem[]) {
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = subMenus.find(m => {
    if (m.path.includes('?')) {
      const [menuPathname, menuQuery] = m.path.split('?');
      const menuParams = new URLSearchParams(menuQuery);
      const currentParams = new URLSearchParams(location.search);

      if (location.pathname === menuPathname || location.pathname.startsWith(menuPathname + '/')) {
        let allMatch = true;
        menuParams.forEach((value, key) => {
          if (currentParams.get(key) !== value) {
            allMatch = false;
          }
        });
        return allMatch;
      }
      return false;
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
