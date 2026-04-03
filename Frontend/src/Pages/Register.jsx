import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../services/Endpoint';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiCamera } from 'react-icons/fi';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState({
    fullName: '',
    email: '',
    password: '',
    image: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setValue({ ...value, image: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('FullName', value.fullName);
    formData.append('email', value.email);
    formData.append('password', value.password);
    if (value.image) formData.append('profile', value.image);

    try {
      const response = await post('/auth/register', formData);
      const data = response.data;
      if (data.success) {
        navigate('/login');
        toast.success(data.message);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h2>🐝 Post<span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hive</span></h2>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join PostHive and start sharing your stories</p>

        <form onSubmit={handleSubmit}>
          <div className="avatar-upload">
            <label htmlFor="avatar-input" className="avatar-upload-preview">
              {value.image ? (
                <img src={URL.createObjectURL(value.image)} alt="Avatar" />
              ) : (
                <FiCamera size={24} color="var(--text-muted)" />
              )}
            </label>
            <input
              type="file"
              id="avatar-input"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Upload photo</span>
          </div>

          <div className="form-group">
            <label htmlFor="fullName"><FiUser style={{ marginRight: 6 }} />Full Name</label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              placeholder="John Doe"
              required
              value={value.fullName}
              onChange={(e) => setValue({ ...value, fullName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email"><FiMail style={{ marginRight: 6 }} />Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="name@example.com"
              required
              value={value.email}
              onChange={(e) => setValue({ ...value, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password"><FiLock style={{ marginRight: 6 }} />Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={value.password}
              onChange={(e) => setValue({ ...value, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="btn-primary-custom"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
