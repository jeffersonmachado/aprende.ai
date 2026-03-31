import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/useAuth.js';
import { hasSystemAccess } from '../utils/access.js';

const navGroups = [
  {
    title: 'Experiencia',
    items: [
      { to: '/journey-flow', label: 'Minha Jornada', description: 'Fluxo guiado com 15 etapas da jornada' },
      { to: '/simulation', label: 'Simulacoes', description: 'Cenarios de decisao adaptativos' },
      { to: '/evolution', label: 'Evolucao', description: 'Competencias, progresso e comparativos' },
      { to: '/mentor', label: 'Mentor IA', description: 'Mentoria contextual da decisao atual' }
    ]
  },
  {
    title: 'Estrutura',
    items: [
      { to: '/tracks', label: 'Trilhas', description: 'Arquitetura pedagogica por publico e dificuldade' },
      { to: '/competencies', label: 'Competencias', description: 'Mapa de habilidades e evidencias' },
      { to: '/knowledge', label: 'Conhecimento', description: 'Base de conteudo para reforco e RAG' }
    ]
  },
  {
    title: 'Sistema',
    items: [
      { to: '/system/dashboard', label: 'Dashboard tecnico', description: 'Health, telemetria e operacao' },
      { to: '/integration', label: 'Integracao', description: 'Eventos, source system e direction' },
      { to: '/settings/openai', label: 'Configuracoes IA', description: 'Ajustes de credenciais e provedor' }
    ]
  }
];

function isRouteMatch(pathname, to) {
  if (pathname === to) return true;
  if (to === '/journey-flow' && pathname.startsWith('/journey-flow/')) return true;
  if (to === '/simulation' && pathname.startsWith('/simulation/')) return true;
  if (to === '/system/dashboard' && pathname.startsWith('/system/')) return true;
  return false;
}

export default function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const canSeeSystem = hasSystemAccess(user);

  const visibleNavGroups = useMemo(() => {
    return navGroups.filter((group) => group.title !== 'Sistema' || canSeeSystem);
  }, [canSeeSystem]);

  const navItems = useMemo(() => visibleNavGroups.flatMap((group) => group.items), [visibleNavGroups]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  const activeItem = useMemo(() => {
    return navItems.find((item) => isRouteMatch(location.pathname, item.to)) || navItems[0];
  }, [location.pathname]);

  const activeGroup = useMemo(() => {
    return visibleNavGroups.find((group) => group.items.some((item) => isRouteMatch(location.pathname, item.to)))?.title || 'Experiencia';
  }, [location.pathname, visibleNavGroups]);

  function renderNavigation() {
    return (
      <nav className="nav">
        {visibleNavGroups.map((group) => (
          <section key={group.title} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            {group.items.map((item) => {
              const isActive = isRouteMatch(location.pathname, item.to);
              return (
                <Link key={item.to} className={`nav-link ${isActive ? 'active' : ''}`} to={item.to}>
                  <span>{item.label}</span>
                  <small>{item.description}</small>
                </Link>
              );
            })}
          </section>
        ))}
      </nav>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar desktop-sidebar">
        <div className="brand-block">
          <div className="brand">aprende.AI</div>
          <div className="brand-caption">jornada adaptativa com simulacao, mentoria e evolucao</div>
        </div>

        {renderNavigation()}

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
          <button type="button" className="menu-toggle" onClick={() => setIsDrawerOpen(true)}>Menu</button>
          <div>
            <div className="content-topbar-label">{activeGroup}</div>
            <strong>{activeItem.label}</strong>
          </div>
          <div className="content-topbar-note">{activeItem.description}</div>
        </header>
        <Outlet />
      </main>

      {isDrawerOpen ? <button type="button" className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)} aria-label="Fechar menu" /> : null}
      <aside className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="row-between">
          <strong>Menu</strong>
          <button type="button" className="secondary-button" onClick={() => setIsDrawerOpen(false)}>Fechar</button>
        </div>
        {renderNavigation()}
      </aside>
    </div>
  );
}
