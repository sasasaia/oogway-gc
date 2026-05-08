import React, { useState, useEffect } from 'react';
import { ImagePlus, Send } from 'lucide-react';

interface Post {
  id: number;
  author: string;
  content: string;
  image?: string;
  createdAt: string;
}

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
        },
        body: JSON.stringify({
          author: 'Current User', // Mocked user context for now
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

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 w-full h-full overflow-y-auto">
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
              <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center font-bold">
                {post.author.charAt(0)}
              </div>
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
  );
};
