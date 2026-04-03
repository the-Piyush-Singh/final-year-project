import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BaseUrl, post } from '../services/Endpoint';
import { removeUser } from '../redux/AuthSlice';
import toast from 'react-hot-toast';
import { FiHome, FiCompass, FiPlusCircle, FiMenu, FiX, FiLogOut, FiUser, FiGrid } from 'react-icons/fi';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      const request = await post("/auth/logout");
      if (request.status === 200) {
        navigate('/login');
        dispatch(removeUser());
        toast.success(request.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="posthive-navbar">
      <Link to="/" className="posthive-logo">
        <span>🐝 PostHive</span>
      </Link>

      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      <ul className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
        <li><Link to="/" className={isActive('/')} onClick={() => setMobileOpen(false)}><FiHome /> Home</Link></li>
        {user && (
          <>
            <li><Link to="/feed" className={isActive('/feed')} onClick={() => setMobileOpen(false)}><FiCompass /> Feed</Link></li>
            <li><Link to="/create" className={isActive('/create')} onClick={() => setMobileOpen(false)}><FiPlusCircle /> Write</Link></li>
          </>
        )}
      </ul>

      <div className="nav-actions">
        {!user ? (
          <Link to="/login">
            <button className="btn-primary-custom">Sign In</button>
          </Link>
        ) : (
          <div className="dropdown">
            <div
              className="d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: 'pointer' }}
            >
              {user.profile ? (
                <img
                  className="nav-avatar"
                  src={`${BaseUrl}/images/${user.profile}`}
                  alt="Profile"
                />
              ) : (
                <div className="nav-avatar d-flex align-items-center justify-content-center"
                  style={{ background: 'var(--bg-card)', fontSize: '14px', fontWeight: 600 }}>
                  {user.FullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
              <li className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{user.FullName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </li>
              <li><Link className="dropdown-item" to={`/user/${user._id}`}><FiUser style={{ marginRight: 8 }} /> Profile</Link></li>
              <li><Link className="dropdown-item" to={`/profile/${user._id}`}><FiGrid style={{ marginRight: 8 }} /> Settings</Link></li>
              {user.role === 'admin' && (
                <li><Link className="dropdown-item" to="/dashboard"><FiGrid style={{ marginRight: 8 }} /> Dashboard</Link></li>
              )}
              <li><hr className="dropdown-divider" style={{ borderColor: 'var(--border-color)' }} /></li>
              <li>
                <a className="dropdown-item" onClick={handleLogout} style={{ cursor: 'pointer', color: 'var(--danger)' }}>
                  <FiLogOut style={{ marginRight: 8 }} /> Sign Out
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
