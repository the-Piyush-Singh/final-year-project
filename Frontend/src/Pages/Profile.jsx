import React, { useEffect, useState } from 'react';
import { FaUser, FaLock, FaCamera } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { BaseUrl, patch } from '../services/Endpoint';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { setUser } from '../redux/AuthSlice';

export default function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      setName(user.FullName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('FullName', name);
    formData.append('bio', bio);
    formData.append('oldpassword', oldPassword);
    formData.append('newpassword', newPassword);
    if (profileImage) formData.append('profile', profileImage);

    try {
      const response = await patch(`auth/profile/${userId}`, formData);
      const data = response.data;
      if (response.status === 200) {
        toast.success(data.message);
        dispatch(setUser(data.user));
        setOldPassword('');
        setNewPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title"><FiEdit3 style={{ marginRight: 8 }} />Edit Profile</h1>
      <form className="profile-form" onSubmit={handleUpdateProfile}>
        <div className="profile-image-section">
          <label htmlFor="profileImage" className="profile-image-label">
            {profileImage ? (
              <img src={URL.createObjectURL(profileImage)} alt="Avatar" className="profile-image" />
            ) : (
              <div className="profile-placeholder">
                {user?.profile ? (
                  <img src={`${BaseUrl}/images/${user.profile}`} alt="Avatar" className="profile-image" />
                ) : (
                  <FaUser className="profile-icon" />
                )}
              </div>
            )}
            <FaCamera className="profile-camera-icon" />
          </label>
          <input type="file" id="profileImage" accept="image/*" onChange={handleImageChange} className="profile-image-input" />
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="profile-input" />
        </div>

        <div className="input-group">
          <FiEdit3 className="input-icon" />
          <textarea
            placeholder="Write a short bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="profile-input"
            rows="3"
            maxLength={300}
            style={{ paddingTop: '12px', resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input type="password" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="profile-input" />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="profile-input" />
        </div>

        <button type="submit" className="profile-button" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
