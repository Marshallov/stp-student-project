import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../providers/auth';
import { Layout } from '../components/Layout';
import { LoginPage } from '../pages/LoginPage';
import { StudentsPage } from '../pages/StudentsPage';
import { UsersPage } from '../pages/UsersPage';
import type { ReactNode } from 'react';
import type { Role } from '../types';

function Protected({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { session, hasRole } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/" replace />;
  return children;
}
function HomeRedirect() { const { hasRole } = useAuth(); return <Navigate to={hasRole('SUPER_ADMIN') ? '/users' : '/students'} replace />; }
export function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<Protected><Layout /></Protected>}><Route index element={<HomeRedirect />} /><Route path="students" element={<Protected roles={['ADMIN', 'TEACHER']}><StudentsPage /></Protected>} /><Route path="users" element={<Protected roles={['SUPER_ADMIN']}><UsersPage /></Protected>} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
