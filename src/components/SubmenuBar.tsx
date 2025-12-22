import styles from '../styles/moduleIndex.module.css';
import { useActiveSubmenu } from '../hooks/useActiveSubmenu';

interface SubmenuBarProps {
  menus: { title: string; path: string }[];
}

export default function SubmenuBar({ menus }: SubmenuBarProps) {
  const { activePath, handleNavigate } = useActiveSubmenu(menus);

  return (
    <div className={styles.submenuBar}>
      {menus.map(menu => (
        <button
          key={menu.path}
          onClick={() => handleNavigate(menu.path)}
          className={`${styles.submenuButton} ${activePath === menu.path ? styles.active : ''}`}
        >
          {menu.title}
        </button>
      ))}
    </div>
  );
}
