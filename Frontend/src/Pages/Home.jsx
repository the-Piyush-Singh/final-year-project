import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../services/Endpoint';
import { useSelector } from 'react-redux';
import PostCard from '../Components/PostCard';
import LoadingSpinner from '../Components/LoadingSpinner';
import EmptyState from '../Components/EmptyState';
import Footer from '../Components/Footer';
import { FiArrowRight, FiTrendingUp, FiEdit3 } from 'react-icons/fi';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, trendingRes] = await Promise.all([
          get('/blog/GetPosts', { limit: 6 }),
          get('/feed/trending', { limit: 3 })
        ]);
        setPosts(postsRes.data.posts || []);
        setTrending(trendingRes.data.posts || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLikeUpdate = (postId, liked, likesCount) => {
    const updatePosts = (list) =>
      list.map(p => {
        if (p._id === postId) {
          const newLikes = liked
            ? [...(p.likes || []), user?._id]
            : (p.likes || []).filter(id => id !== user?._id);
          return { ...p, likes: newLikes };
        }
        return p;
      });
    setPosts(prev => updatePosts(prev));
    setTrending(prev => updatePosts(prev));
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-badge">🐝 Welcome to PostHive</div>
        <h1>
          Where Ideas<br />
          Come <span className="accent">Alive</span>
        </h1>
        <p>
          Discover stories, thinking, and expertise from writers on any topic.
          Share your voice with the world.
        </p>
        <div className="hero-actions">
          {!user ? (
            <>
              <Link to="/register"><button className="btn-primary-custom">Get Started <FiArrowRight /></button></Link>
              <Link to="/login"><button className="btn-secondary-custom">Sign In</button></Link>
            </>
          ) : (
            <>
              <Link to="/create"><button className="btn-primary-custom"><FiEdit3 /> Write a Post</button></Link>
              <Link to="/feed"><button className="btn-secondary-custom">Explore Feed <FiArrowRight /></button></Link>
            </>
          )}
        </div>
      </div>

      {/* Trending Section */}
      {trending.length > 0 && (
        <div className="container-fluid px-4 px-md-5" style={{ marginTop: '60px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title"><FiTrendingUp style={{ marginRight: 8 }} /> Trending</h2>
              <p className="section-subtitle">Most popular posts this week</p>
            </div>
          </div>
          <div className="posts-grid">
            {trending.map((p) => (
              <PostCard key={p._id} postData={p} onLikeUpdate={handleLikeUpdate} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts Section */}
      <div className="container-fluid px-4 px-md-5" style={{ marginTop: '60px', marginBottom: '60px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Recent Posts</h2>
            <p className="section-subtitle">Fresh stories from the community</p>
          </div>
          <Link to="/feed" className="btn-ghost">
            View All <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading posts..." />
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            text="Be the first to share your story!"
            action={user && <Link to="/create"><button className="btn-primary-custom">Write a Post</button></Link>}
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
