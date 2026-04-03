import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../services/Endpoint';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/AuthSlice';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setValue({ ...value, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const request = await post('/auth/login', value);
      const response = request.data;
      if (request.status === 200) {
        dispatch(setUser(response.user));
        navigate('/');
        toast.success(response.message);
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email"><FiMail style={{ marginRight: 6 }} />Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="form-input"
              placeholder="name@example.com"
              required
              value={value.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password"><FiLock style={{ marginRight: 6 }} />Password</label>
            <input
              type="password"
              name="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={value.password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="btn-primary-custom"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
