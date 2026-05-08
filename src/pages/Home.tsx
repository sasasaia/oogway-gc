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
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <form onSubmit={handleCreatePost}>
            <textarea 
              placeholder="What's on your mind?"
              className="w-full bg-transparent border-none focus:ring-0 text-neutral-100 placeholder:text-neutral-500 resize-none"
              rows={3}
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
            />
            
            {selectedImage && (
              <div className="relative mb-4 mt-2 rounded-xl overflow-hidden border border-neutral-800 inline-block h-32">
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-neutral-900/80 text-white rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
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
                className="text-neutral-400 hover:text-emerald-400 p-2 rounded-full hover:bg-neutral-800 transition-colors"
                title="Add Media"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                type="submit"
                disabled={!newPostContent.trim() && !selectedImage}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <span>Post</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-neutral-500 py-8">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
              <p className="text-neutral-400 mb-2">No posts yet.</p>
              <p className="text-sm text-neutral-500">Follow users or create a post to get started!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                     {post.user.avatarUrl ? <img src={post.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="text-neutral-400 font-bold">{post.user.firstName[0]}</div>}
                  </div>
                  <div>
                    <div className="font-medium">{post.user.firstName} {post.user.lastName}</div>
                    <div className="text-xs text-neutral-500">@{post.user.username} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
                
                {post.content && <p className="text-neutral-200 mb-4 whitespace-pre-wrap">{post.content}</p>}
                
                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-neutral-800 mt-2">
                    <img src={post.imageUrl} alt="Post media" className="w-full max-h-96 object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar (Find Users) */}
      <div className="hidden lg:block space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <h2 className="font-bold text-lg mb-4">Find Users</h2>
          <div className="space-y-4">
            {suggestedUsers.length === 0 ? (
               <p className="text-sm text-neutral-500">No other users found.</p>
            ) : (
              suggestedUsers.map(u => (
                <div key={u.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                      {u.avatarUrl ? <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="text-xs text-neutral-400 font-bold">{u.firstName[0]}</div>}
                    </div>
                    <div className="truncate pr-2">
                      <div className="font-medium text-sm truncate">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-neutral-500 truncate">@{u.username}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFollow(u.id, u.isFollowing)}
                    className={`shrink-0 p-2 rounded-full transition-colors flex items-center justify-center ${
                      u.isFollowing ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
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
