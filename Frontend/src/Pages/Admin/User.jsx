import React, { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { BaseUrl, delet, get } from '../../services/Endpoint';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../Components/LoadingSpinner';

export default function User() {
  const [Users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete their posts and comments.')) return;
    try {
      const response = await delet(`/dashboard/delete/${userId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setReload(!reload);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  useEffect(() => {
    const getuser = async () => {
      try {
        const response = await get('/dashboard/users');
        setUsers(response.data.Users || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getuser();
  }, [reload]);

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <div>
      <div className="mb-4">
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700 }}>All Users</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{Users.length} registered users</p>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Users.map((user, index) => (
              <tr key={user._id}>
                <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    {user.profile ? (
                      <img src={`${BaseUrl}/images/${user.profile}`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {user.FullName?.charAt(0)}
                      </div>
                    )}
                    <span>{user.FullName}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                <td>
                  <span style={{
                    padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                    background: user.role === 'admin' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                    color: user.role === 'admin' ? 'var(--warning)' : 'var(--info)'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td>
                  {user.role !== 'admin' && (
                    <button className="btn-danger-custom" onClick={() => handleDelete(user._id)}>
                      <FiTrash2 /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
