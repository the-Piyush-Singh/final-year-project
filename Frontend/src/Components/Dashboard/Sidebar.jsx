import React from 'react';
import { FiHome, FiPlusSquare, FiUsers, FiFileText } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  const links = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/dashboard/addpost', icon: <FiPlusSquare />, label: 'Add Post' },
    { to: '/dashboard/users', icon: <FiUsers />, label: 'All Users' },
    { to: '/dashboard/allposts', icon: <FiFileText />, label: 'All Posts' },
  ];

  return (
    <div className="admin-sidebar">
      <nav>
        {links.map(link => (
          <Link key={link.to} className={`nav-link ${isActive(link.to)}`} to={link.to}>
            {link.icon} {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
