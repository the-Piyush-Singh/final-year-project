import React, { useEffect, useState } from 'react';
import { get } from '../../services/Endpoint';
import { FiUsers, FiFileText, FiMessageCircle, FiTrendingUp } from 'react-icons/fi';

export default function Admin() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const GetData = async () => {
      try {
        const request = await get('/dashboard');
        if (request.status === 200) {
          setPosts(request.data.Posts || []);
          setUsers(request.data.Users || []);
          setComments(request.data.comments || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    GetData();
  }, []);

  const stats = [
    { label: 'Total Users', value: users.length, icon: <FiUsers />, cls: 'users' },
    { label: 'Total Posts', value: posts.length, icon: <FiFileText />, cls: 'posts' },
    { label: 'Total Comments', value: comments.length, icon: <FiMessageCircle />, cls: 'comments' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '1.5rem' }}>
          <FiTrendingUp style={{ marginRight: 8 }} /> Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Overview of your platform</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading stats...</p>
      ) : (
        <div className="row g-4">
          {stats.map((stat) => (
            <div key={stat.label} className="col-md-4">
              <div className="dashboard-stat-card">
                <div className={`stat-icon ${stat.cls}`}>{stat.icon}</div>
                <div className="dashboard-stat-value">{stat.value}</div>
                <div className="dashboard-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Posts */}
      {posts.length > 0 && (
        <div className="mt-5">
          <h3 style={{ color: 'var(--text-heading)', fontWeight: 600, marginBottom: '16px' }}>Recent Posts</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Likes</th>
              </tr>
            </thead>
            <tbody>
              {posts.slice(0, 10).map((post, i) => (
                <tr key={post._id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>{post.title}</td>
                  <td>{post.author?.FullName || 'Unknown'}</td>
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                      background: post.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: post.status === 'published' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.likes?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
