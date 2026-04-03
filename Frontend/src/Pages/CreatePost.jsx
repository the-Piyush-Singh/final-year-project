import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { post } from '../services/Endpoint';
import toast from 'react-hot-toast';
import { FiImage, FiSend, FiSave, FiX, FiMic, FiMicOff } from 'react-icons/fi';

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('published');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Speech Recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  const toggleListen = () => {
    if (!recognition) {
      toast.error('Voice dictation is not supported by your browser.');
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setDesc(prev => prev + (prev ? ' ' : '') + text);
        setIsListening(false);
      };

      recognition.onerror = () => {
        toast.error('Microphone error or no speech detected');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  };

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
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('desc', desc);
      formData.append('content', content);
      formData.append('status', publishStatus);
      formData.append('tags', tags.join(','));
      if (image) formData.append('postimg', image);

      const response = await post('/blog/create', formData);
      if (response.data.success) {
        toast.success(publishStatus === 'published' ? 'Post published!' : 'Draft saved!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700 }}>Create Post</h2>
        <div className="d-flex gap-2">
          <button
            className="btn-secondary-custom"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
          >
            <FiSave /> Save Draft
          </button>
          <button
            className="btn-primary-custom"
            onClick={() => handleSubmit('published')}
            disabled={loading}
          >
            <FiSend /> {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div
        className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
        onClick={() => document.getElementById('cover-image').click()}
      >
        {imagePreview ? (
          <div style={{ position: 'relative' }}>
            <img src={imagePreview} alt="Cover" />
            <button
              className="btn-ghost"
              style={{
                position: 'absolute', top: 10, right: 10,
                background: 'rgba(0,0,0,0.6)', borderRadius: 'var(--radius-full)',
                color: '#fff', padding: '8px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
                setImagePreview(null);
              }}
            >
              <FiX />
            </button>
          </div>
        ) : (
          <>
            <FiImage size={32} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.9rem' }}>
              Click to add a cover image
            </p>
          </>
        )}
      </div>
      <input
        type="file"
        id="cover-image"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      {/* Title */}
      <div className="create-post-title">
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Excerpt */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Short excerpt (shown on cards)</label>
            <button 
                className="btn-ghost" 
                onClick={toggleListen}
                title="Dictate description"
                style={{ 
                    padding: '4px 8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    color: isListening ? '#f43f5e' : 'var(--text-muted)' 
                }}
            >
                {isListening ? (
                    <>
                        <span className="pulse-mic" style={{ width: 8, height: 8, background: '#f43f5e', borderRadius: '50%', display: 'inline-block' }}></span>
                        Listening...
                    </>
                ) : (
                    <><FiMic /> Dictate</>
                )}
            </button>
        </div>
        <textarea
          className="form-input"
          rows="2"
          placeholder="Write a short summary of your post..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Tags */}
      <div className="form-group">
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tags (press Enter to add, max 5)</label>
        <div className="tag-input-container">
          {tags.map((tag, i) => (
            <span key={i} className="tag-removable">
              {tag}
              <button onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
          <input
            type="text"
            placeholder={tags.length < 5 ? "Add a tag..." : "Max tags reached"}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            disabled={tags.length >= 5}
          />
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="form-group">
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Content</label>
        <div className="quill-editor-wrapper">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="Write your post content here..."
          />
        </div>
      </div>
    </div>
  );
}
