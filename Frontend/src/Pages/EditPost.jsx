import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { get, patch, BaseUrl } from '../services/Endpoint';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Components/LoadingSpinner';
import { FiImage, FiSend, FiSave, FiX } from 'react-icons/fi';

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('published');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ]
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await get(`/blog/post/${postId}`);
        const post = response.data.Post;
        setTitle(post.title || '');
        setDesc(post.desc || '');
        setContent(post.content || '');
        setTags(post.tags || []);
        setStatus(post.status || 'published');
        if (post.image) {
          setImagePreview(post.image.startsWith('http') ? post.image : `${BaseUrl}/images/${post.image}`);
        }
      } catch (error) {
        toast.error('Failed to load post');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (publishStatus) => {
    if (!title.trim()) { toast.error('Please add a title'); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('desc', desc);
      formData.append('content', content);
      formData.append('status', publishStatus);
      formData.append('tags', tags.join(','));
      if (image) formData.append('postimg', image);

      const response = await patch(`/blog/update/${postId}`, formData);
      if (response.data.success) {
        toast.success('Post updated!');
        navigate(`/blog/${postId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading post..." />;

  return (
    <div className="create-post-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700 }}>Edit Post</h2>
        <div className="d-flex gap-2">
          <button className="btn-secondary-custom" onClick={() => handleSubmit('draft')} disabled={saving}>
            <FiSave /> Save Draft
          </button>
          <button className="btn-primary-custom" onClick={() => handleSubmit('published')} disabled={saving}>
            <FiSend /> {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>

      <div className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
        onClick={() => document.getElementById('cover-image-edit').click()}>
        {imagePreview ? (
          <div style={{ position: 'relative' }}>
            <img src={imagePreview} alt="Cover" />
            <button className="btn-ghost"
              style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', borderRadius: 'var(--radius-full)', color: '#fff', padding: '8px' }}
              onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}>
              <FiX />
            </button>
          </div>
        ) : (
          <><FiImage size={32} color="var(--text-muted)" /><p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Click to add a cover image</p></>
        )}
      </div>
      <input type="file" id="cover-image-edit" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

      <div className="create-post-title">
        <input type="text" placeholder="Post title..." value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="form-group">
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Short excerpt</label>
        <textarea className="form-input" rows="2" placeholder="Short summary..." value={desc} onChange={(e) => setDesc(e.target.value)} style={{ resize: 'vertical' }} />
      </div>

      <div className="form-group">
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tags</label>
        <div className="tag-input-container">
          {tags.map((tag, i) => (
            <span key={i} className="tag-removable">{tag}<button onClick={() => removeTag(tag)}>×</button></span>
          ))}
          <input type="text" placeholder={tags.length < 5 ? "Add a tag..." : "Max tags"} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} disabled={tags.length >= 5} />
        </div>
      </div>

      <div className="form-group">
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Content</label>
        <div className="quill-editor-wrapper">
          <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} placeholder="Write your post content..." />
        </div>
      </div>
    </div>
  );
}
