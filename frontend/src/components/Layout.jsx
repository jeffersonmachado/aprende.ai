import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Layout() {
  const location = useLocation();
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && typeof contentRef.current.scrollTo === 'function') {
      contentRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <div className="app-shell app-shell-game">
      <main ref={contentRef} className="content content-game">
        <Outlet />
      </main>
    </div>
  );
}
