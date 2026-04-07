import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/cn';

function isItemActive(pathname, href) {
  if (pathname === href) return true;
  if (href === '/campaign' && /^\/(campaign|journey)(\/|$)/.test(pathname)) return true;
  return pathname.startsWith(`${href}/`);
}

export const Navigation = ({ items = [], groups = [], className, variant = 'default', ...props }) => {
  const location = useLocation();
  const resolvedGroups = groups.length ? groups : [{ title: '', items }];

  return (
    <nav className={cn('space-y-4', className)} {...props}>
      {resolvedGroups.map((group) => (
        <section key={group.title || 'default'} className="space-y-2">
          {group.title ? <div className="nav-group-title">{group.title}</div> : null}
          <div className={cn('space-y-2', variant === 'campaign' && 'nav-group-cluster')}>
            {(group.items || []).map((item) => {
              const href = item.href || item.to;
              const isActive = isItemActive(location.pathname, href);
              const Icon = item.icon;

              return (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    'nav-link nav-link-shell group',
                    isActive && 'active',
                    variant === 'campaign' && 'nav-link-campaign'
                  )}
                >
                  <div className="nav-link-main">
                    {Icon ? (
                      <span className={cn('nav-link-icon', isActive && 'nav-link-icon-active')}>
                        <Icon className="h-4 w-4" />
                      </span>
                    ) : null}
                    <div className="nav-link-copy">
                      <span>{item.label}</span>
                      {item.description ? <small>{item.description}</small> : null}
                    </div>
                  </div>
                  {item.badge ? <span className="nav-link-badge">{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
};

Navigation.displayName = 'Navigation';

export default Navigation;
