import React from 'react';

export default function Footer() {
  return (
    <footer className="posthive-footer">
      <div className="footer-content">
        <div>
          <div className="footer-brand">
            🐝 Post<span>Hive</span>
          </div>
          <p className="footer-text" style={{ marginTop: '8px' }}>
            A modern blogging platform for creators.
          </p>
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/feed">Feed</a>
          <a href="/create">Write</a>
        </div>
        <p className="footer-text">
          © {new Date().getFullYear()} PostHive. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
