import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/Feedback';
import { LogOut, Menu, Plus, X } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const navCls = ({ isActive }) =>
  cn('rounded-md px-3 py-2 text-sm transition-colors duration-150', isActive ? 'bg-surface-2 font-medium text-fg' : 'text-muted hover:text-fg');

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  // The menu is "open for this path": navigating anywhere closes it without an effect.
  const [openPath, setOpenPath] = useState(null);
  const open = openPath === location.pathname;
  const setOpen = (value) => setOpenPath((cur) => ((typeof value === 'function' ? value(cur === location.pathname) : value) ? location.pathname : null));

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpenPath(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-sm supports-backdrop-filter:bg-bg/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Logo to={user ? '/dashboard' : '/'} />

        {user && (
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink to="/dashboard" className={navCls}>
              Dashboard
            </NavLink>
            <NavLink to="/settings" className={navCls}>
              Settings
            </NavLink>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <>
              {/* Wrapper hides these on mobile; Button itself always sets display:inline-flex */}
              <div className="hidden items-center gap-1.5 md:flex">
                <Button to="/setup" size="sm">
                  <Plus className="size-4" /> New interview
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" /> Log out
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button to="/signup" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>

      {user && open && (
        <div id="mobile-menu" className="animate-rise border-t border-line bg-bg px-4 pt-2 pb-4 md:hidden">
          <p className="truncate px-3 pt-2 pb-3 text-xs text-subtle">Signed in as {user.email}</p>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            <NavLink to="/dashboard" className={navCls}>
              Dashboard
            </NavLink>
            <NavLink to="/settings" className={navCls}>
              Settings
            </NavLink>
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button to="/setup">
              <Plus className="size-4" /> New interview
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {/* Keeps the navbar on screen while a page chunk loads */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
