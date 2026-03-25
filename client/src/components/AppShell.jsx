import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Log in' },
  { to: '/signup', label: 'Sign up' }
]

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/interview/new', label: 'New Interview' }
]

export const AppShell = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth()
  const links = isAuthenticated ? privateLinks : publicLinks

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link className="brand" to={isAuthenticated ? '/dashboard' : '/'}>
          <span className="brand-mark">A</span>
          <span>
            <strong>Axis Interview Lab</strong>
            <small>Role-focused AI mock interviews</small>
          </span>
        </Link>

        <nav className="topnav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-chip">
                <span>{user?.name}</span>
                <small>{user?.email}</small>
              </div>
              <button className="ghost-button" type="button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <Link className="primary-button small" to="/signup">
              Start Practice
            </Link>
          )}
        </div>
      </header>

      <main className="page-shell">{children}</main>
    </div>
  )
}

