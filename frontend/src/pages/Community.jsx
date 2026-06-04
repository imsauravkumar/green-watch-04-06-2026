import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Plus, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { apiFetch } from '../api';

export const Community = () => {
  const { user } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // New Post Form
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [error, setError] = useState(null);

  // Comments state map: { [postId]: commentText }
  const [commentsMap, setCommentsMap] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch('/api/community', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (err) {
      console.error("Error fetching community posts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await apiFetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      });
      
      if (res.ok) {
        setNewPost({ title: '', content: '', category: 'General' });
        setShowAddForm(false);
        fetchPosts();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to publish post');
      }
    } catch (err) {
      setError('Connection failure');
    }
  };

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch(`/api/community/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => {
          if ((p.id || p._id) === postId) {
            return { ...p, likes: data.likes };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Like post error", err);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentContent = commentsMap[postId] || '';
    if (!commentContent.trim()) return;

    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch(`/api/community/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent })
      });

      if (res.ok) {
        // Clear input
        setCommentsMap(prev => ({ ...prev, [postId]: '' }));
        fetchPosts(); // Refresh comments list
      }
    } catch (err) {
      console.error("Error commenting on post", err);
    }
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentsMap(prev => ({ ...prev, [postId]: text }));
  };

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  const myUserId = user?.uid || user?.id || user?._id?.toString();

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <Users className="w-5 h-5 text-emerald-600" /> Farmer Community
          </h1>
          <p className="text-xs text-slate-500">Share tips, ask questions, and consult with experienced agricultural peers</p>
        </div>

        {/* Add Post Trigger button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? "Cancel Post" : "Ask a Question"}
        </button>
      </div>

      {/* New Post Form Panel */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-xl text-left">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Post to Community Forum</h3>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Thread Title *</label>
              <input
                type="text"
                required
                placeholder="E.g. What organic solution works for Yellow Rust in wheat?"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="General">General farming tips</option>
                  <option value="Diseases">Crop Diseases</option>
                  <option value="Pests">Pests & Controls</option>
                  <option value="Market">Market & Pricing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Description *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your soil, crop age, and what remedies you have already tried..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              Publish Thread
            </button>
          </form>
        </div>
      )}

      {/* Main Forum View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Category Filters list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Categories</span>
            <div className="space-y-1">
              {['All', 'General', 'Diseases', 'Pests', 'Market'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeCategory === cat ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>{cat}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Threads list */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="py-20 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-xs text-slate-400">Loading discussion threads...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              No discussions found in this category. Be the first to post!
            </div>
          ) : (
            filteredPosts.map((post) => {
              const hasLiked = post.likes?.includes(myUserId);
              return (
                <div 
                  key={post.id || post._id} 
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-left"
                >
                  {/* Author Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{post.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[9px] text-slate-400 font-bold uppercase">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{post.category}</span>
                        <span>•</span>
                        <span>By {post.authorName} ({post.authorRole})</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>

                  {/* Action buttons */}
                  <div className="flex items-center gap-4 border-t border-b border-slate-50 py-2.5 text-xs text-slate-500">
                    <button
                      onClick={() => handleLikePost(post.id || post._id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${hasLiked ? 'text-emerald-600' : 'hover:text-slate-800'}`}
                    >
                      <ThumbsUp className="w-4 h-4 shrink-0" />
                      <span>{post.likes?.length || 0} Likes</span>
                    </button>
                    <div className="flex items-center gap-1.5 font-bold">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </div>
                  </div>

                  {/* Comments lists */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                      {post.comments.map((cmt, cIdx) => (
                        <div key={cIdx} className="text-xs text-slate-600 border-b border-slate-200/50 pb-2.5 last:border-0 last:pb-0 space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-400">
                            <span>{cmt.authorName} ({cmt.authorRole})</span>
                            <span>{new Date(cmt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <p className="leading-relaxed font-semibold">{cmt.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input form */}
                  <form 
                    onSubmit={(e) => handleAddComment(e, post.id || post._id)}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Write your agricultural advice/reply..."
                      value={commentsMap[post.id || post._id] || ''}
                      onChange={(e) => handleCommentTextChange(post.id || post._id, e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2 border border-slate-250 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-lg transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
export default Community;
