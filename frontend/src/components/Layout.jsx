import { Link, Outlet, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', description: 'Visão geral do produto' },
  { to: '/tracks', label: 'Trilhas', description: 'Catálogo inicial de aprendizagem' },
  { to: '/competencies', label: 'Competências', description: 'Mapa de habilidades' },
  { to: '/knowledge', label: 'Conhecimento', description: 'Base para RAG' },
  { to: '/integration', label: 'Integração', description: 'Eventos prontos para o r-agent2' }
];

export default function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const activeItem = useMemo(() => {
    return navItems.find((item) => item.to === location.pathname) || navItems[0];
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand">aprende.AI</div>
          <div className="brand-caption">v2.1 · separado e pronto para integrar</div>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} className={`nav-link ${isActive ? 'active' : ''}`} to={item.to}>
                <span>{item.label}</span>
                <small>{item.description}</small>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <strong>{user?.name || 'Usuário'}</strong>
            <div>{user?.email || ''}</div>
          </div>
          <button className="secondary-button" onClick={logout}>Sair</button>
        </div>
      </aside>

      <main className="content">
        <header className="content-topbar">
          <div>
            <div className="content-topbar-label">Módulo atual</div>
            <strong>{activeItem.label}</strong>
          </div>
          <div className="content-topbar-note">Mesmo padrão técnico do r-agent2, com domínio educacional isolado.</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
