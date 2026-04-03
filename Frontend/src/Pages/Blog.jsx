import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BaseUrl, get, post, delet } from '../services/Endpoint';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Components/LoadingSpinner';
import { FiHeart, FiMessageCircle, FiShare2, FiTrash2, FiClock, FiArrowLeft, FiPlayCircle, FiPauseCircle, FiEye, FiBookmark, FiTwitter } from 'react-icons/fi';
import { FaHeart, FaBookmark, FaTwitter } from 'react-icons/fa';

export default function Blog() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [singlePost, setSinglePost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Highlight menu state
  const [highlightMenu, setHighlightMenu] = useState({ visible: false, x: 0, y: 0, text: '' });
  const contentRef = useRef(null);

  const fetchPost = async () => {
    try {
      const request = await get(`/blog/post/${postId}`);
      setSinglePost(request.data.Post);
      if (user && user.savedPosts && user.savedPosts.includes(postId)) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    // Stop speech synthesis when navigating away
    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };
  }, [postId, user]);

  // Handle Highlight-to-Share
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection.isCollapsed && selection.toString().trim().length > 0 && contentRef.current && contentRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setHighlightMenu({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY - 40,
          text: selection.toString().trim()
        });
      } else {
        setHighlightMenu({ visible: false, x: 0, y: 0, text: '' });
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleHighlightShare = () => {
    const tweetText = encodeURIComponent(`"${highlightMenu.text}" — Read more at ${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    setHighlightMenu({ visible: false, x: 0, y: 0, text: '' });
  };


  const isLiked = user && singlePost?.likes?.includes(user._id);

  const handleLike = async () => {
    if (!user) { toast.error('Please login to like posts'); return; }
    try {
      const response = await post(`/blog/like/${postId}`);
      if (response.data.success) {
        setSinglePost(prev => ({
          ...prev,
          likes: response.data.liked
            ? [...(prev.likes || []), user._id]
            : (prev.likes || []).filter(id => id !== user._id)
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleSave = async () => {
    if (!user) { toast.error('Please login to bookmark posts'); return; }
    try {
      const response = await post(`/blog/save/${postId}`);
      if (response.data.success) {
        setIsSaved(response.data.saved);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to bookmark post');
    }
  };

  const toggleListen = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-Speech is not supported in your browser.');
      return;
    }
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textToRead = singlePost.content ? singlePost.content.replace(/<[^>]+>/g, '') : singlePost.desc;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const onSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to comment'); return; }
    if (!comment.trim()) return;
    setCommentLoading(true);
    try {
      const request = await post('/comment/addcomment', { comment, postId });
      if (request.data.success) {
        toast.success('Comment added');
        setComment('');
        fetchPost();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const response = await delet(`/comment/delete/${commentId}`);
      if (response.data.success) {
        toast.success('Comment deleted');
        fetchPost();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleFollow = async (authorId) => {
    if (!user) { toast.error('Please login to follow'); return; }
    try {
      const isFollowing = singlePost.author.followers?.includes(user._id);
      if (isFollowing) {
        await delet(`/users/${authorId}/follow`);
        toast.success('Unfollowed');
      } else {
        await post(`/users/${authorId}/follow`);
        toast.success('Following!');
      }
      fetchPost();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const calculateReadTime = (htmlContent) => {
    const text = htmlContent ? htmlContent.replace(/<[^>]+>/g, '') : '';
    const wordCount = text.split(/\s+/).length;
    const time = Math.ceil(wordCount / 200); // 200 words per minute average
    return time || 1;
  };

  if (loading) return <LoadingSpinner text="Loading post..." />;
  if (!singlePost) return <div className="post-detail"><h2 style={{ color: 'var(--text-primary)' }}>Post not found</h2></div>;

  const isFollowing = user && singlePost.author?.followers?.includes(user._id);
  const isOwnPost = user && singlePost.author?._id === user._id;

  return (
    <div className="post-detail">
      {/* Back button */}
      <button className="btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        <FiArrowLeft /> Back
      </button>

      {/* Header */}
      <div className="post-detail-header">
        {singlePost.tags && singlePost.tags.length > 0 && (
          <div className="post-detail-tags">
            {singlePost.tags.map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
        )}
        <h1 className="post-detail-title">{singlePost.title}</h1>

        <div className="post-detail-meta">
          <div className="post-detail-author">
            {singlePost.author?.profile && (
              <Link to={`/user/${singlePost.author._id}`}>
                <img
                  src={`${BaseUrl}/images/${singlePost.author.profile}`}
                  alt={singlePost.author.FullName}
                  className="post-detail-author-avatar"
                />
              </Link>
            )}
            <div className="post-detail-author-info">
              <Link to={`/user/${singlePost.author?._id}`} className="post-detail-author-name">
                {singlePost.author?.FullName || 'Unknown'}
              </Link>
              <div className="post-detail-date" style={{ display: 'flex', gap: '15px' }}>
                <span>
                  <FiClock style={{ marginRight: 4, fontSize: '12px' }} />
                  {formatDate(singlePost.createdAt)}
                </span>
                <span>
                  <FiEye style={{ marginRight: 4, fontSize: '12px' }} />
                  {singlePost.views || 0} Views
                </span>
                <span>
                  <FiClock style={{ marginRight: 4, fontSize: '12px' }} />
                  {calculateReadTime(singlePost.content || singlePost.desc)} min read
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Audio Article Button */}
            <button className="btn-secondary-custom" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={toggleListen}>
              {isPlaying ? <FiPauseCircle size={16} /> : <FiPlayCircle size={16} />}
              {isPlaying ? 'Stop Listening' : 'Listen'}
            </button>
            {user && !isOwnPost && singlePost.author && (
              <button
                className={isFollowing ? 'btn-secondary-custom' : 'btn-primary-custom'}
                style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                onClick={() => handleFollow(singlePost.author._id)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image */}
      {singlePost.image && (
        <img
          src={singlePost.image.startsWith('http') ? singlePost.image : `${BaseUrl}/images/${singlePost.image}`}
          alt={singlePost.title}
          className="post-detail-image"
        />
      )}

      {/* Highlight to Share Menu */}
      {highlightMenu.visible && (
        <div 
          className="highlight-menu"
          style={{ position: 'absolute', top: highlightMenu.y, left: highlightMenu.x, transform: 'translateX(-50%)', background: '#000', color: '#fff', padding: '6px 12px', borderRadius: '20px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
          onClick={handleHighlightShare}
        >
          <FaTwitter color="#1DA1F2" /> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Share Quote</span>
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="post-detail-content-wrapper" style={{ position: 'relative' }}>
          {singlePost.content ? (
            <div className="post-detail-content" dangerouslySetInnerHTML={{ __html: singlePost.content }} />
          ) : (
            <div className="post-detail-content">
              <p>{singlePost.desc}</p>
            </div>
          )}
      </div>

      {/* Actions */}
      <div className="post-detail-actions" style={{ position: 'relative' }}>
        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          {isLiked ? <FaHeart /> : <FiHeart />}
          <span>{singlePost.likes?.length || 0} {singlePost.likes?.length === 1 ? 'Like' : 'Likes'}</span>
        </button>
        <button className="action-btn">
          <FiMessageCircle />
          <span>{singlePost.comments?.length || 0} Comments</span>
        </button>
        <button className="action-btn" onClick={handleShare}>
          <FiShare2 />
          <span>Share</span>
        </button>
        
        {/* Bookmark Action */}
        <button className={`action-btn bookmark-btn ${isSaved ? 'saved' : ''}`} onClick={handleSave} style={{ marginLeft: 'auto' }}>
          {isSaved ? <FaBookmark color="var(--accent-primary)" /> : <FiBookmark />}
          <span style={{ color: isSaved ? 'var(--accent-primary)' : 'inherit' }}>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comments */}
      <div className="comments-section">
        <h3 className="comments-title">Comments ({singlePost.comments?.length || 0})</h3>

        {user && (
          <form className="comment-form" onSubmit={onSubmitComment}>
            <textarea
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn-primary-custom"
              style={{ marginTop: '12px' }}
              disabled={commentLoading}
            >
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        {!user && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Sign in</Link> to leave a comment
          </div>
        )}

        {singlePost.comments && singlePost.comments.map((c) => (
          <div className="comment-item" key={c._id}>
            {c.userId?.profile && (
              <Link to={`/user/${c.userId._id}`}>
                <img
                  src={`${BaseUrl}/images/${c.userId.profile}`}
                  alt={c.userId.FullName}
                  className="comment-avatar"
                />
              </Link>
            )}
            <div className="comment-content">
              <div>
                <Link to={`/user/${c.userId?._id}`} className="comment-author">{c.userId?.FullName || 'Unknown'}</Link>
                <span className="comment-date">{formatDate(c.createdAt)}</span>
              </div>
              <p className="comment-text">{c.comment}</p>
            </div>
            {(user && (user._id === c.userId?._id || user.role === 'admin')) && (
              <button className="comment-delete" onClick={() => handleDeleteComment(c._id)} title="Delete comment">
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
