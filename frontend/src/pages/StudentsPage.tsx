import { useEffect, useState, type FormEvent } from 'react';
import { studentsApi } from '../api/services';
import { getApiError } from '../api/client';
import { useAuth } from '../providers/auth';
import { ClassroomArt } from '../components/ClassroomArt';
import { EmptyState, Loading } from '../components/Loading';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import type { StudentFullResponse, StudentResponse } from '../types';

const emptyForm = { name: '', surname: '', phone_number: '', email: '' };
export function StudentsPage() {
  const { hasRole } = useAuth(); const canEdit = hasRole('ADMIN'); const isTeacher = !canEdit && hasRole('TEACHER'); const notify = useToast();
  const [students, setStudents] = useState<StudentResponse[]>([]); const [loading, setLoading] = useState(true); const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState<StudentFullResponse | null>(null);
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | null>(null); const [form, setForm] = useState(emptyForm); const [pending, setPending] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false); const [profileError, setProfileError] = useState(''); const [profileId, setProfileId] = useState<number | null>(null);
  const load = async (signal?: AbortSignal) => { setLoading(true); setLoadError(''); try { const data = await studentsApi.list(signal); setStudents(data.response || []); } catch (err) { if ((err as { name?: string }).name !== 'CanceledError') setLoadError(getApiError(err)); } finally { if (!signal?.aborted) setLoading(false); } };
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, []);
  const visible = students.filter((s) => `${s.name} ${s.surname}`.toLowerCase().includes(query.toLowerCase()));
  const openView = async (id: number) => {
    setProfileId(id);
    setSelected(null);
    setProfileError('');
    setProfileLoading(true);
    setModal('view');
    try { setSelected(await studentsApi.get(id)); }
    catch (err) { const message = getApiError(err); setProfileError(message); notify(message, 'error'); }
    finally { setProfileLoading(false); }
  };
  const openEdit = async (id: number) => {
    try {
      const student = await studentsApi.get(id);
      setSelected(student);
      setForm({ name: student.name, surname: student.surname, phone_number: student.phoneNumber || '', email: student.email || '' });
      setModal('edit');
    } catch (err) { notify(getApiError(err), 'error'); }
  };
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!form.name || !form.surname || !form.email) return; setPending(true); try { if (modal === 'create') { await studentsApi.create(form); notify('Студент добавлен'); } else if (selected) { await studentsApi.update(selected.id, { email: form.email, phoneNumber: form.phone_number }); notify('Данные обновлены'); } setModal(null); await load(); } catch (err) { notify(getApiError(err), 'error'); } finally { setPending(false); } };
  const remove = async (student: StudentResponse) => { if (!window.confirm(`Удалить ${student.name} ${student.surname}?`)) return; try { await studentsApi.remove(student.id); setStudents((current) => current.filter((s) => s.id !== student.id)); notify('Студент удалён'); } catch (err) { notify(getApiError(err), 'error'); } };
  const showCreate = () => { setForm(emptyForm); setSelected(null); setModal('create'); };
  const profileRole = isTeacher ? 'teacher' : 'admin';
  return <div className={`page role-theme-${profileRole}`}>
    <header className="page-header">
      <div><p className="eyebrow">{isTeacher ? 'ВАШ КЛАСС · УЧЕБНЫЙ ЖУРНАЛ' : 'УПРАВЛЕНИЕ КЛАССОМ · УЧЕБНЫЙ ЖУРНАЛ'}</p><h1>{isTeacher ? 'Рады видеть, учитель' : 'Добро пожаловать, администратор'}<span className="brand-period">.</span></h1><p className="page-subtitle">{isTeacher ? 'Ваши ученики и их контакты — всегда под рукой.' : 'Обновляйте список класса и помогайте ему расти.'}</p></div>
      {canEdit && <button className="primary-button" onClick={showCreate}><span className="button-plus">＋</span> Добавить ученика</button>}
    </header>
    <section className="class-overview">
      <div className="overview-copy"><span className="overview-kicker"><i className="status-dot" /> ТВОЙ ЖУРНАЛ</span><h2>Маленькие шаги.<br />Большие открытия.</h2><p>Здесь собраны ученики и всё, что помогает классу расти.</p><div className="overview-bottom"><strong>{students.length.toString().padStart(2, '0')}<small> учеников</small></strong><span>Список обновляется автоматически</span></div></div>
      <div className="overview-art"><ClassroomArt /><span className="art-note">КЛАСС<br />НАЧИНАЕТСЯ<br />С ЛЮБОПЫТСТВА</span></div>
      <div className="overview-side"><span className="side-index">01</span><span className="side-label">РАЗДЕЛ</span><strong>Мой<br />класс</strong><span className="side-arrow">↘</span></div>
    </section>
    <section className="student-section">
      <div className="section-heading"><div><p className="eyebrow">ЗНАКОМСТВО</p><h2>Твой класс <span className="section-count">{students.length}</span></h2></div><label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти ученика..." /></label></div>
      {loading ? <Loading /> : loadError ? <div className="error-state"><p>{loadError}</p><button className="secondary-button" onClick={() => void load()}>Попробовать снова</button></div> : visible.length === 0 ? <EmptyState title={query ? 'Ничего не найдено' : 'В журнале пока пусто'} text={query ? 'Попробуйте изменить запрос.' : 'Добавьте первого ученика, чтобы начать.'} /> : <div className="student-grid">{visible.map((student, index) => <article className="student-card" key={student.id} style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}>
        <div className={`student-card-art student-art-${index % 4}`}><span className="student-number">№ {String(student.id).padStart(2, '0')}</span><div className="student-initials">{student.name[0]}{student.surname[0]}</div><span className="student-spark">✳</span></div>
        <div className="student-card-body"><div><span className="student-label">УЧЕНИК</span><h3>{student.name}<br />{student.surname}</h3></div><div className="student-card-actions"><button className="text-button" onClick={() => void openView(student.id)}>Карточка <span>↗</span></button>{canEdit && <><button className="icon-button" onClick={() => void openEdit(student.id)} aria-label={`Редактировать ${student.name} ${student.surname}`}>✎</button><button className="icon-button danger" onClick={() => void remove(student)} aria-label={`Удалить ${student.name} ${student.surname}`}>⌫</button></>}</div></div>
      </article>)}</div>}
    </section>
    {modal && <Modal className={modal === 'view' ? 'student-profile-modal' : ''} title={modal === 'create' ? 'Новый ученик' : modal === 'edit' ? 'Редактировать карточку' : 'Профиль ученика'} onClose={() => setModal(null)}>
      {modal === 'view' ? profileLoading ? <Loading label="Открываем карточку..." /> : profileError ? <div className="error-state"><p>{profileError}</p><button className="secondary-button" onClick={() => profileId !== null && void openView(profileId)}>Загрузить ещё раз</button></div> : selected && <div className="student-profile">
        <div className={`student-profile-art student-art-${selected.id % 4}`}><span className="student-profile-number">УЧЕНИК · № {String(selected.id).padStart(2, '0')}</span><ClassroomArt /><span className="student-profile-initials">{selected.name[0]}{selected.surname[0]}</span></div>
        <div className="student-profile-content"><p className="eyebrow">ЛИЧНАЯ КАРТОЧКА</p><h3>{selected.name} {selected.surname}</h3><div className="student-details"><div className="student-detail"><span>ЭЛЕКТРОННАЯ ПОЧТА</span><strong>{selected.email || 'Не указана'}</strong></div><div className="student-detail"><span>ТЕЛЕФОН</span><strong>{selected.phoneNumber || 'Не указан'}</strong></div></div><div className="student-profile-actions"><button className="secondary-button" onClick={() => setModal(null)}>Закрыть</button>{canEdit && <button className="primary-button" onClick={() => { setForm({ name: selected.name, surname: selected.surname, phone_number: selected.phoneNumber || '', email: selected.email || '' }); setModal('edit'); }}>Редактировать карточку</button>}</div></div>
      </div> : <form className="form-stack" onSubmit={submit}>{modal === 'create' && <><label>Имя<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Фамилия<input required value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} /></label></>}<label>Электронная почта<input required={!(!canEdit && modal === 'edit')} readOnly={!canEdit && modal === 'edit'} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Телефон<input readOnly={!canEdit && modal === 'edit'} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></label>{(canEdit || modal === 'create') && <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Отмена</button><button className="primary-button" disabled={pending}>{pending ? 'Сохраняем...' : 'Сохранить'}</button></div>}</form>}
    </Modal>}
  </div>;
}
