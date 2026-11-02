import { useTheme } from '../providers/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'тёмную' : 'светлую';

  return <button
    className="theme-toggle"
    type="button"
    onClick={toggleTheme}
    aria-label={`Включить ${nextTheme} тему`}
    aria-pressed={theme === 'dark'}
    title={`Включить ${nextTheme} тему`}
  >
    <span className="theme-toggle-icon" aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
    <span className="theme-toggle-label">{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span>
  </button>;
}
