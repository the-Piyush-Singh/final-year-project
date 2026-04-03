import React, { useEffect, useState } from 'react';
import { get } from '../services/Endpoint';
import PostCard from './PostCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function LatestPost() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const request = await get('/blog/GetPosts', { limit: 6 });
        setBlogs(request.data.posts || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!blogs.length) return (
    <EmptyState title="No posts yet" text="Be the first to share your story!" />
  );

  return (
    <div className="posts-grid">
      {blogs.map((post) => (
        <PostCard key={post._id} postData={post} />
      ))}
    </div>
  );
}
