import '../styles/moduleIndex.css';
import { useActiveSubmenu } from '../hooks/useActiveSubmenu';

interface SubmenuBarProps {
  menus: { title: string; path: string }[];
}

export default function SubmenuBar({ menus }: SubmenuBarProps) {
  const { activePath, handleNavigate } = useActiveSubmenu(menus);

  return (
    <div className='submenu-bar'>
      {menus.map(menu => (
        <button
          key={menu.path}
          onClick={() => handleNavigate(menu.path)}
          className={`submenu-button ${activePath === menu.path ? 'active' : ''}`}
        >
          {menu.title}
        </button>
      ))}
    </div>
  );
}
