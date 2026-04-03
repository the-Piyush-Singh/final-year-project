import React, { useEffect, useState } from 'react';
import { get } from '../services/Endpoint';
import { useSelector } from 'react-redux';
import PostCard from '../Components/PostCard';
import LoadingSpinner from '../Components/LoadingSpinner';
import EmptyState from '../Components/EmptyState';
import Footer from '../Components/Footer';
import { FiCompass, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Feed() {
  const [activeTab, setActiveTab] = useState('recommended');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  const tabs = [
    { id: 'recommended', label: 'For You', icon: <FiCompass /> },
    { id: 'following', label: 'Following', icon: <FiUsers /> },
    { id: 'trending', label: 'Trending', icon: <FiTrendingUp /> }
  ];

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        let response;
        switch (activeTab) {
          case 'recommended':
            response = await get('/feed/recommended');
            break;
          case 'following':
            response = await get('/feed/following');
            break;
          case 'trending':
            response = await get('/feed/trending');
            break;
          default:
            response = await get('/feed/recommended');
        }
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error(error);
        // If not logged in for recommended/following, fall back to trending
        if (error.response?.status === 401 && activeTab !== 'trending') {
          try {
            const response = await get('/feed/trending');
            setPosts(response.data.posts || []);
            setActiveTab('trending');
          } catch (e) {
            console.error(e);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [activeTab]);

  const handleLikeUpdate = (postId, liked, likesCount) => {
    setPosts(prev =>
      prev.map(p => {
        if (p._id === postId) {
          const newLikes = liked
            ? [...(p.likes || []), user?._id]
            : (p.likes || []).filter(id => id !== user?._id);
          return { ...p, likes: newLikes };
        }
        return p;
      })
    );
  };

  return (
    <div className="page-container">
      <div className="container-fluid px-4 px-md-5" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div className="mb-4">
          <h1 className="section-title" style={{ fontSize: '2rem' }}>Your Feed</h1>
          <p className="section-subtitle">Discover content curated just for you</p>
        </div>

        {/* Tabs */}
        <div className="feed-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`feed-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading feed..." />
        ) : posts.length === 0 ? (
          <EmptyState
            title={activeTab === 'following' ? 'No posts from people you follow' : 'No posts found'}
            text={activeTab === 'following'
              ? 'Follow some creators to see their posts here!'
              : 'Check back later for new content.'}
            action={
              activeTab === 'following' && (
                <button className="btn-primary-custom" onClick={() => setActiveTab('trending')}>
                  <FiTrendingUp /> Explore Trending
                </button>
              )
            }
          />
        ) : (
          <div className="posts-grid">
            {posts.map((p) => (
              <PostCard key={p._id} postData={p} onLikeUpdate={handleLikeUpdate} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
