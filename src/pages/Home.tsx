import React, { useState, useEffect } from 'react';
import { ImagePlus, Send, UserPlus } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface Post {
  id: number;
  userId: number;
  author: string;
  avatar?: string;
  content: string;
  image?: string;
  createdAt: string;
}

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const { token, user } = useAuth();

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const res = await fetch('/api/users/suggested', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) setSuggestedUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts();
      fetchSuggestedUsers();
    }
  }, [token]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!newPost.trim() && !imageBase64) return;
    setLoading(true);
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPost,
          image: imageBase64,
        }),
      });
      setNewPost('');
      setImageBase64(null);
      await fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetId: number) => {
    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: targetId })
      });
      const data = await res.json();
      if (data.success) {
        setSuggestedUsers(prev => prev.filter(u => u.id !== targetId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full h-full overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Feed Column */}
        <div className="flex-1 max-w-2xl">
          {/* Create Post */}
          <div className="bg-[var(--color-card-bg)] rounded-2xl shadow-sm border border-[#0000001a] dark:border-[#ffffff1a] p-4 mb-8">
            <textarea
              placeholder="What's on your mind?"
              className="w-full bg-transparent resize-none border-none outline-none text-lg min-h-[80px]"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            {imageBase64 && (
              <div className="relative mb-4 rounded-xl overflow-hidden">
                <img src={imageBase64} alt="Upload preview" className="w-full object-cover max-h-96" />
                <button 
                  onClick={() => setImageBase64(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  &times;
                </button>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-[#0000001a] dark:border-[#ffffff1a]">
              <label className="cursor-pointer flex items-center gap-2 text-[var(--color-primary)] hover:opacity-80 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <ImagePlus className="w-5 h-5" />
                <span className="font-medium text-sm">Add Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <button 
                disabled={loading || (!newPost.trim() && !imageBase64)}
                onClick={handlePost}
                className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-full font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-[var(--color-card-bg)] rounded-2xl shadow-sm border border-[#0000001a] dark:border-[#ffffff1a] p-4 overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  {post.avatar ? (
                    <img src={post.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center font-bold">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{post.author}</p>
                    <p className="text-xs opacity-60">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {post.content && <p className="mb-4 whitespace-pre-wrap">{post.content}</p>}
                {post.image && (
                  <div className="mt-3 -mx-4 -mb-4">
                    <img src={post.image} alt="Post attachment" className="w-full object-cover" />
                  </div>
                )}
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center opacity-60 mt-12 py-12">
                No posts yet. Be the first to share something!
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-[var(--color-card-bg)] rounded-2xl shadow-sm border border-[#0000001a] dark:border-[#ffffff1a] p-5">
            <h3 className="font-bold text-lg mb-4">Find Friends</h3>
            
            {suggestedUsers.length === 0 ? (
              <p className="text-sm opacity-60">No suggestions right now.</p>
            ) : (
              <div className="space-y-4">
                {suggestedUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center font-bold">
                          {(u.firstName || u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-tight max-w-[120px] truncate">
                          {u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.username}
                        </span>
                        <span className="text-xs opacity-60 max-w-[120px] truncate">@{u.username}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollow(u.id)}
                      className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 p-2 rounded-full transition-colors flex-shrink-0"
                      title="Follow"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
