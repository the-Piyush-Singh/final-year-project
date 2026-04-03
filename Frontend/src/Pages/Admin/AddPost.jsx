import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { post } from '../../services/Endpoint';
import toast from 'react-hot-toast';
import { FiImage, FiSend, FiX } from 'react-icons/fi';

export default function AddPost() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['clean']
    ]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('desc', desc);
      formData.append('content', content);
      formData.append('tags', tags.join(','));
      formData.append('status', 'published');
      if (image) formData.append('postimg', image);

      const response = await post('/blog/create', formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setTitle(''); setDesc(''); setContent('');
        setImage(null); setImagePreview(null); setTags([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700 }}>Add New Post</h2>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {/* Cover Image */}
        <div
          className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
          onClick={() => document.getElementById('admin-cover').click()}
        >
          {imagePreview ? (
            <div style={{ position: 'relative' }}>
              <img src={imagePreview} alt="Cover" />
              <button className="btn-ghost"
                style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', borderRadius: 'var(--radius-full)', color: '#fff', padding: '8px' }}
                onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}>
                <FiX />
              </button>
            </div>
          ) : (
            <><FiImage size={28} color="var(--text-muted)" /><p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '0.875rem' }}>Add cover image</p></>
          )}
        </div>
        <input type="file" id="admin-cover" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files[0]; if (f) { setImage(f); setImagePreview(URL.createObjectURL(f)); } }} />

        <div className="form-group mt-3">
          <input type="text" className="form-input" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ fontSize: '1.2rem', fontWeight: 600 }} />
        </div>

        <div className="form-group">
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Short excerpt</label>
          <textarea className="form-input" rows="2" placeholder="Brief summary..." value={desc} onChange={(e) => setDesc(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div className="form-group">
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tags</label>
          <div className="tag-input-container">
            {tags.map((tag, i) => (
              <span key={i} className="tag-removable">{tag}<button onClick={() => setTags(tags.filter(t => t !== tag))}>×</button></span>
            ))}
            <input type="text" placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} disabled={tags.length >= 5} />
          </div>
        </div>

        <div className="form-group">
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Content</label>
          <div className="quill-editor-wrapper">
            <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} placeholder="Write your post content..." />
          </div>
        </div>

        <button className="btn-primary-custom" onClick={handleSubmit} disabled={loading} style={{ marginTop: '8px' }}>
          <FiSend /> {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </div>
    </div>
  );
}
