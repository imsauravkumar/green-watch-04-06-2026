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
import { useTranslation } from '../hooks/useTranslation';
import { apiFetch } from '../api';
import communityImg from '../assets/community.png';

export const Community = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
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
      
      {/* Header Banner */}
      <div className="h-28 w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950">
        <img
          src={communityImg}
          alt={t('farmerCommunity')}
          className="w-full h-full object-cover object-top opacity-60 mix-blend-overlay animate-fade-in pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-center p-6 text-white animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div>
              <div className="flex items-center gap-2 text-white">
                <Users className="w-6 h-6 text-emerald-400" />
                <h1 className="text-lg font-bold tracking-tight md:text-xl">{t('farmerCommunity')}</h1>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed md:text-sm">{t('shareTipsDesc')}</p>
            </div>

            {/* Add Post Trigger button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors shadow-sm self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {showAddForm ? t('cancelPost') : t('askQuestionBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* New Post Form Panel */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-xl text-left">
          <h3 className="font-bold text-slate-900 text-sm mb-4">{t('postCommunityForum')}</h3>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('threadTitleLabel')}</label>
              <input
                type="text"
                required
                placeholder={t('rustQuestionPlaceholder')}
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('categoryLabel')}</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="General">{t('generalTipsOption')}</option>
                  <option value="Diseases">{t('cropDiseasesOption')}</option>
                  <option value="Pests">{t('pestsControlsOption')}</option>
                  <option value="Market">{t('marketPricingOption')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('detailedDescLabel')}</label>
              <textarea
                required
                rows={4}
                placeholder={t('communityFormDescPlaceholder')}
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              {t('publishThreadBtn')}
            </button>
          </form>
        </div>
      )}

      {/* Main Forum View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Category Filters list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">{t('categoriesTitle')}</span>
            <div className="space-y-1">
              {['All', 'General', 'Diseases', 'Pests', 'Market'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeCategory === cat ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>{cat === 'All' ? t('allOption') : cat === 'General' ? t('generalOption') : cat === 'Diseases' ? t('diseasesOption') : cat === 'Pests' ? t('pestsOption') : cat === 'Market' ? t('marketOption') : cat}</span>
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
              <span className="text-xs text-slate-400">{t('loadingDiscussion')}</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              {t('noDiscussionCategory')}
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
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {post.category === 'General' ? t('generalOption') : post.category === 'Diseases' ? t('diseasesOption') : post.category === 'Pests' ? t('pestsOption') : post.category === 'Market' ? t('marketOption') : post.category}
                        </span>
                        <span>•</span>
                        <span>
                          {t('postedByLabel')
                            .replace('{author}', post.authorName)
                            .replace('{role}', post.authorRole === 'Farmer' ? t('roleFarmer') : post.authorRole === 'Seller' ? t('roleSeller') : post.authorRole === 'Admin' ? t('admin') : post.authorRole)
                          }
                        </span>
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
                      <span>{post.likes?.length || 0} {t('likesCount')}</span>
                    </button>
                    <div className="flex items-center gap-1.5 font-bold">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>{post.comments?.length || 0} {t('commentsCount')}</span>
                    </div>
                  </div>

                  {/* Comments lists */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                      {post.comments.map((cmt, cIdx) => (
                        <div key={cIdx} className="text-xs text-slate-600 border-b border-slate-200/50 pb-2.5 last:border-0 last:pb-0 space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-400">
                            <span>
                              {cmt.authorName} ({cmt.authorRole === 'Farmer' ? t('roleFarmer') : cmt.authorRole === 'Seller' ? t('roleSeller') : cmt.authorRole === 'Admin' ? t('admin') : cmt.authorRole})
                            </span>
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
                      placeholder={t('writeAdviceReply')}
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
