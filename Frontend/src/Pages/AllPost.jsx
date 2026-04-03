import React, { useEffect, useState } from 'react';
import { FiTrash2, FiEdit3 } from 'react-icons/fi';
import { BaseUrl, delet, get } from '../services/Endpoint';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function AllPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await delet(`/blog/delete/${postId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setReload(!reload);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post.');
    }
  };

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await get('/blog/GetPosts', { limit: 100 });
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getPosts();
  }, [reload]);

  if (loading) return <LoadingSpinner text="Loading posts..." />;

  return (
    <div>
      <div className="mb-4">
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700 }}>All Posts</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{posts.length} published posts</p>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Post</th>
              <th>Author</th>
              <th>Tags</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, i) => (
              <tr key={post._id}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    {post.image && (
                      <img src={`${BaseUrl}/images/${post.image}`} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: '6px' }} />
                    )}
                    <Link to={`/blog/${post._id}`} style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title}
                    </Link>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{post.author?.FullName || 'Unknown'}</td>
                <td>
                  <div className="d-flex gap-1 flex-wrap">
                    {post.tags?.slice(0, 2).map((tag, ti) => (
                      <span key={ti} className="tag" style={{ fontSize: '0.65rem' }}>{tag}</span>
                    ))}
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{post.likes?.length || 0}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{post.comments?.length || 0}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Link to={`/edit/${post._id}`}>
                      <button className="btn-ghost" style={{ padding: '6px 10px' }}><FiEdit3 /></button>
                    </Link>
                    <button className="btn-danger-custom" style={{ padding: '6px 10px' }} onClick={() => handleDelete(post._id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
