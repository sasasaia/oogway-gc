import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Send, UserPlus, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Home({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [postsRes, usersRes] = await Promise.all([
        fetch('/api/posts', { headers }),
        fetch('/api/users', { headers })
      ]);
      
      if (postsRes.ok) setPosts(await postsRes.json());
      if (usersRes.ok) setSuggestedUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append('content', newPostContent);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setNewPostContent('');
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchData(); // Refresh posts
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFollow = async (userId: number, isFollowing: boolean) => {
    const token = localStorage.getItem('token');
    const method = isFollowing ? 'DELETE' : 'POST';
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuggestedUsers(users => users.map(u => u.id === userId ? { ...u, isFollowing: !isFollowing } : u));
        fetchData(); // Refresh posts to see/hide new ones
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Create Post */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <form onSubmit={handleCreatePost} className="relative z-10">
            <textarea 
              placeholder="What's on your mind today?"
              className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal resize-none outline-none"
              rows={3}
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
            />
            
            {selectedImage && (
              <div className="relative mb-4 mt-2 rounded-2xl overflow-hidden shadow-sm inline-block h-40">
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-md text-slate-800 rounded-full p-1.5 shadow-sm hover:bg-white"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={e => setSelectedImage(e.target.files?.[0] || null)}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-violet-500 bg-violet-50 hover:bg-violet-100 p-2.5 rounded-full transition-colors flex items-center shadow-sm"
                title="Add Media"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                type="submit"
                disabled={!newPostContent.trim() && !selectedImage}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-violet-200 transition-all flex items-center space-x-2"
              >
                <span>Post</span>
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        </div>

        {/* Feed List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-slate-400 py-10 font-medium animate-pulse">Loading amazing posts...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
              <p className="text-slate-800 font-bold text-lg mb-2">It's quiet in here...</p>
              <p className="text-slate-500">Follow users on the right, or create a post to get started!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                     {post.user.avatarUrl ? <img src={post.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="text-violet-600 font-black text-lg">{post.user.firstName[0]}</div>}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{post.user.firstName} {post.user.lastName}</div>
                    <div className="text-sm font-medium text-slate-400">@{post.user.username} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
                
                {post.content && <p className="text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>}
                
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden shadow-sm mt-3 border border-slate-100">
                    <img src={post.imageUrl} alt="Post media" className="w-full max-h-[500px] object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar (Find Users) */}
      <div className="hidden lg:block space-y-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="font-black text-xl text-slate-800 mb-5 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Discover</h2>
          <div className="space-y-4">
            {suggestedUsers.length === 0 ? (
               <p className="text-sm text-slate-400 font-medium">No other users found.</p>
            ) : (
              suggestedUsers.map(u => (
                <div key={u.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0 shadow-sm border border-white">
                      {u.avatarUrl ? <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="text-sm text-violet-600 font-black">{u.firstName[0]}</div>}
                    </div>
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-800 text-sm truncate">{u.firstName} {u.lastName}</div>
                      <div className="text-xs font-semibold text-slate-400 truncate">@{u.username}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFollow(u.id, u.isFollowing)}
                    className={`shrink-0 p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm ${
                      u.isFollowing ? 'bg-slate-200 text-slate-500 hover:bg-slate-300' : 'bg-violet-100 text-violet-600 hover:bg-violet-500 hover:text-white'
                    }`}
                  >
                    {u.isFollowing ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
