import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get, post as postReq, delet, BaseUrl } from '../services/Endpoint';
import { useSelector } from 'react-redux';
import PostCard from '../Components/PostCard';
import LoadingSpinner from '../Components/LoadingSpinner';
import EmptyState from '../Components/EmptyState';
import toast from 'react-hot-toast';
import { FiCalendar, FiEdit3 } from 'react-icons/fi';

export default function UserProfile() {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'saved'
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);

  const fetchProfile = async () => {
    try {
      const response = await get(`/users/${userId}/profile`);
      setProfileUser(response.data.user);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [userId]);

  const isFollowing = currentUser && profileUser?.followers?.includes(currentUser._id);
  const isOwnProfile = currentUser && currentUser._id === userId;

  const fetchSavedPosts = async () => {
    if (!isOwnProfile && currentUser?.role !== 'admin') return;
    setSavedLoading(true);
    try {
      const response = await get(`/users/${userId}/saved-posts`);
      if (response.data.success) {
        setSavedPosts(response.data.savedPosts || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load saved posts');
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedPosts();
    }
  }, [activeTab, userId, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser) { toast.error('Please login'); return; }
    try {
      if (isFollowing) {
        await delet(`/users/${userId}/follow`);
        toast.success('Unfollowed');
      } else {
        await postReq(`/users/${userId}/follow`);
        toast.success('Following!');
      }
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleLikeUpdate = (postId, liked) => {
    setPosts(prev =>
      prev.map(p => {
        if (p._id === postId) {
          const newLikes = liked
            ? [...(p.likes || []), currentUser?._id]
            : (p.likes || []).filter(id => id !== currentUser?._id);
          return { ...p, likes: newLikes };
        }
        return p;
      })
    );
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!profileUser) return <EmptyState title="User not found" />;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="page-container">
      <div className="container-fluid px-4 px-md-5" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        {/* Profile Header */}
        <div className="profile-header">
          {profileUser.profile ? (
            <img
              src={`${BaseUrl}/images/${profileUser.profile}`}
              alt={profileUser.FullName}
              className="profile-avatar-large"
            />
          ) : (
            <div className="profile-avatar-large d-flex align-items-center justify-content-center"
              style={{ background: 'var(--bg-input)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {profileUser.FullName?.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="profile-name">{profileUser.FullName}</h2>
          {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value">{profileUser.postCount || 0}</div>
              <div className="profile-stat-label">Posts</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{profileUser.followersCount || 0}</div>
              <div className="profile-stat-label">Followers</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{profileUser.followingCount || 0}</div>
              <div className="profile-stat-label">Following</div>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-2">
            {isOwnProfile ? (
              <Link to={`/profile/${userId}`}>
                <button className="btn-secondary-custom"><FiEdit3 /> Edit Profile</button>
              </Link>
            ) : currentUser ? (
              <button
                className={isFollowing ? 'btn-secondary-custom' : 'btn-primary-custom'}
                onClick={handleFollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            ) : null}
          </div>

          <div style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <FiCalendar style={{ marginRight: 4 }} /> Joined {formatDate(profileUser.createdAt)}
          </div>
        </div>

        {/* Tabs */}
        {(isOwnProfile || currentUser?.role === 'admin') && (
            <div className="profile-tabs" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '30px' }}>
                <button 
                    className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                    style={{ background: 'none', border: 'none', padding: '10px 0', color: activeTab === 'posts' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'posts' ? 600 : 400, borderBottom: activeTab === 'posts' ? '2px solid var(--accent-primary)' : '2px solid transparent', transition: 'all 0.3s ease' }}
                >
                    Published
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                    style={{ background: 'none', border: 'none', padding: '10px 0', color: activeTab === 'saved' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'saved' ? 600 : 400, borderBottom: activeTab === 'saved' ? '2px solid var(--accent-primary)' : '2px solid transparent', transition: 'all 0.3s ease' }}
                >
                    Saved Bookmarks
                </button>
            </div>
        )}

        {/* User's Posts */}
        {activeTab === 'posts' || !isOwnProfile ? (
            <>
                <div className="section-header">
                <h2 className="section-title">Posts</h2>
                </div>

                {posts.length === 0 ? (
                <EmptyState title="No posts yet" text={isOwnProfile ? "Start writing your first post!" : "This user hasn't published any posts yet."} />
                ) : (
                <div className="posts-grid">
                    {posts.map(p => (
                    <PostCard key={p._id} postData={p} onLikeUpdate={handleLikeUpdate} />
                    ))}
                </div>
                )}
            </>
        ) : (
            <>
                <div className="section-header">
                <h2 className="section-title">Bookmarked Posts</h2>
                </div>

                {savedLoading ? (
                    <LoadingSpinner text="Loading saved posts..." />
                ) : savedPosts.length === 0 ? (
                    <EmptyState title="No saved posts" text="You haven't bookmarked any posts yet." />
                ) : (
                <div className="posts-grid">
                    {savedPosts.map(p => (
                    <PostCard key={p._id} postData={p} />
                    ))}
                </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}
