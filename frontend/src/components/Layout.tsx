import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/auth';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  const { session, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate('/login'); };
  return <div className="app-shell">
    <header className="topbar">
      <NavLink to="/" className="brand"><span className="brand-mark">П</span><span className="brand-name">ПАРТА<span className="brand-period">.</span></span></NavLink>
      <nav className="nav" aria-label="Основная навигация">
        {hasRole('ADMIN', 'TEACHER') && <NavLink to="/students" className="nav-link"><span className="nav-symbol">▦</span>Ученики</NavLink>}
        {hasRole('SUPER_ADMIN') && <NavLink to="/users" className="nav-link"><span className="nav-symbol">◉</span>Команда</NavLink>}
      </nav>
      <div className="topbar-user">
        <div className="user-card"><div className="avatar">{session?.email[0].toUpperCase()}</div><div><strong>{session?.email}</strong><small>{session?.roles.join(' · ')}</small></div></div>
        <ThemeToggle />
        <button className="logout-button" onClick={signOut} aria-label="Выйти из аккаунта"><span>Выйти</span><span className="logout-symbol">↗</span></button>
      </div>
    </header>
    <main className="main-content"><Outlet /></main>
  </div>;
}
