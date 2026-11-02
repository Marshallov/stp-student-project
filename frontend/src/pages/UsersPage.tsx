import { useEffect, useState, type FormEvent } from 'react';
import { usersApi } from '../api/services';
import { getApiError } from '../api/client';
import { useAuth } from '../providers/auth';
import { EmptyState, Loading } from '../components/Loading';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import type { Role, UserResponse } from '../types';

const roles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'TEACHER'];
export function UsersPage() {
  const { session } = useAuth(); const notify = useToast(); const [users, setUsers] = useState<UserResponse[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState<UserResponse | null>(null); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [selectedRoles, setSelectedRoles] = useState<Role[]>(['TEACHER']); const [pending, setPending] = useState(false);
  const load = async (signal?: AbortSignal) => { setLoading(true); setError(''); try { const data = await usersApi.list(signal); setUsers(data.responses || []); } catch (err) { if ((err as { name?: string }).name !== 'CanceledError') setError(getApiError(err)); } finally { if (!signal?.aborted) setLoading(false); } };
  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, []);
  const open = (user?: UserResponse) => { setEditing(user || null); setEmail(user?.email || ''); setPassword(''); setSelectedRoles(user?.roles || ['TEACHER']); setModal(true); };
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!email || selectedRoles.length === 0 || (!editing && !password)) return; setPending(true); try { const payload = { email, password: password || undefined, roles: selectedRoles }; if (editing) await usersApi.update(editing.id, payload); else await usersApi.create(payload); notify(editing ? 'Пользователь обновлён' : 'Пользователь создан'); setModal(false); await load(); } catch (err) { notify(getApiError(err), 'error'); } finally { setPending(false); } };
  const remove = async (user: UserResponse) => { if (!window.confirm(`Удалить ${user.email}?`)) return; try { await usersApi.remove(user.id); setUsers((current) => current.filter((item) => item.id !== user.id)); notify('Пользователь удалён'); } catch (err) { notify(getApiError(err), 'error'); } };
  return <div className={`page role-theme-${session?.roles.includes('SUPER_ADMIN') ? 'super-admin' : 'admin'}`}>
    <header className="page-header">
      <div><p className="eyebrow">ПРОСТРАНСТВО КОМАНДЫ</p><h1>Здравствуйте, руководитель<span className="brand-period">.</span></h1><p className="page-subtitle">Кто помогает классу двигаться вперёд.</p></div>
      <button className="primary-button" onClick={() => open()}><span className="button-plus">＋</span> Пригласить коллегу</button>
    </header>
    <section className="team-banner">
      <div className="team-banner-copy"><span className="overview-kicker"><i className="status-dot" /> ВАШЕ ПРОСТРАНСТВО</span><h2>Сильная команда.<br />Спокойный учебный год.</h2><p>Настройте доступ для тех, с кем ведёте журнал.</p><div className="team-metrics"><div><strong>{users.length.toString().padStart(2, '0')}</strong><span>участников</span></div><div><strong>{roles.length.toString().padStart(2, '0')}</strong><span>роли доступа</span></div></div></div>
      <div className="team-illustration" aria-hidden="true"><div className="team-sun" /><div className="team-figure figure-one"><span /></div><div className="team-figure figure-two"><span /></div><div className="team-figure figure-three"><span /></div><div className="team-ground" /><span className="team-note">ВМЕСТЕ<br />ЛУЧШЕ</span></div>
    </section>
    <section className="team-section">
      <div className="section-heading"><div><p className="eyebrow">ДОСТУП К ЖУРНАЛУ</p><h2>Наша команда <span className="section-count">{users.length}</span></h2></div><span className="team-section-note">Роли помогают настроить нужный уровень доступа.</span></div>
      {loading ? <Loading /> : error ? <div className="error-state"><p>{error}</p><button className="secondary-button" onClick={() => void load()}>Попробовать снова</button></div> : users.length === 0 ? <EmptyState title="Команда пока не собрана" text="Пригласите первого коллегу в журнал." /> : <div className="team-grid">{users.map((user, index) => <article className="team-card" key={user.id} style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}><div className={`team-card-top team-tint-${index % 4}`}><span className="team-card-number">ЧЕЛОВЕК № {String(user.id).padStart(2, '0')}</span><div className="team-avatar">{user.email[0].toUpperCase()}</div><span className="team-card-star">✳</span></div><div className="team-card-body"><div className="team-person"><h3>{user.email.split('@')[0]}</h3><span>{user.email}</span></div><div className="role-list">{user.roles.map((role) => <span className={`role role-${role.toLowerCase()}`} key={role}>{role === 'SUPER_ADMIN' ? 'Владелец' : role === 'ADMIN' ? 'Администратор' : 'Преподаватель'}</span>)}</div><div className="team-card-actions"><button className="text-button" onClick={() => open(user)}>Изменить доступ <span>↗</span></button><button className="icon-button danger" onClick={() => void remove(user)} aria-label={`Удалить пользователя ${user.email}`}>⌫</button></div></div></article>)}</div>}
    </section>
    {modal && <Modal title={editing ? 'Настройки сотрудника' : 'Новый сотрудник'} onClose={() => setModal(false)}><form className="form-stack" onSubmit={submit}><label>Электронная почта<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>{editing ? 'Новый пароль (необязательно)' : 'Временный пароль'}<input required={!editing} type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label><fieldset><legend>Права доступа</legend><div className="checkbox-grid">{roles.map((role) => <label className="checkbox" key={role}><input type="checkbox" checked={selectedRoles.includes(role)} onChange={(e) => setSelectedRoles(e.target.checked ? [...selectedRoles, role] : selectedRoles.filter((item) => item !== role))} />{role === 'SUPER_ADMIN' ? 'Владелец' : role === 'ADMIN' ? 'Администратор' : 'Преподаватель'}</label>)}</div></fieldset><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Отмена</button><button className="primary-button" disabled={pending}>{pending ? 'Сохраняем...' : 'Сохранить'}</button></div></form></Modal>}
  </div>;
}
