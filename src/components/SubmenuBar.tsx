import styles from '../styles/components/moduleIndex.module.css';
import { useActiveSubmenu } from '../hooks/useActiveSubmenu';

interface SubmenuBarProps {
  menus: { title: string; path: string; electrode?: 'C' | 'A' }[];
}

export default function SubmenuBar({ menus }: SubmenuBarProps) {
  const { activePath, handleNavigate } = useActiveSubmenu(menus);

  const getButtonClass = (menu: { path: string; electrode?: 'C' | 'A' }) => {
    const isActive = activePath === menu.path;
    const baseClass = styles.submenuButton;

    if (menu.electrode === 'C') {
      return `${baseClass} ${isActive ? styles.activeCathode : styles.cathode}`;
    }
    if (menu.electrode === 'A') {
      return `${baseClass} ${isActive ? styles.activeAnode : styles.anode}`;
    }
    return `${baseClass} ${isActive ? styles.active : ''}`;
  };

  return (
    <div className={styles.submenuBar}>
      {menus.map(menu => (
        <button
          key={menu.path}
          onClick={() => handleNavigate(menu.path)}
          className={getButtonClass(menu)}
        >
          {menu.title}
        </button>
      ))}
    </div>
  );
}
