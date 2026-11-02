import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/auth';
import { getApiError } from '../api/client';
import { LoginArtCarousel } from '../components/LoginArtCarousel';
import { ThemeToggle } from '../components/ThemeToggle';
import { useToast } from '../components/Toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const notify = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (!email || !password) { setError('Введите email и пароль.'); return; }
    setPending(true);
    try { await login({ email, password }); notify('Добро пожаловать!'); navigate('/'); }
    catch (err) { const message = getApiError(err); setError(message); notify(message, 'error'); }
    finally { setPending(false); }
  };
  return <div className="login-page">
    <header className="login-topbar">
      <div className="login-brand"><span className="brand-mark">П</span><span className="brand-name">ПАРТА<span className="brand-period">.</span></span></div>
      <div className="login-top-actions"><span className="login-top-note"><i className="status-dot" /> Пространство для учебных команд</span><ThemeToggle /></div>
    </header>
    <main className="login-main">
      <section className="login-copy">
        <div className="login-intro"><p className="eyebrow">Ваш класс. Ваш ритм.</p><h1>Хороший день<br />начинается здесь.</h1><p>Войдите в журнал, чтобы быть на одной странице с учениками и коллегами.</p></div>
        <form onSubmit={submit} className="form-stack login-form">
          <label>Электронная почта<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label>
          <label>Пароль<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button wide" disabled={pending}>{pending ? 'Проверяем...' : 'Войти в журнал'} <span>↗</span></button>
        </form>
        <p className="login-hint">Уже есть аккаунт? Используйте рабочую почту.</p>
      </section>
      <LoginArtCarousel />
    </main>
    <footer className="login-footer"><span>ПАРТА <span className="brand-period">·</span> УЧЕБНЫЙ ЖУРНАЛ</span><span>Учиться вместе — проще.</span></footer>
  </div>;
}
