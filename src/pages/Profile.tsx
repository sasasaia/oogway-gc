import React, { useState, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../AuthContext';

export const Profile: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.username || 'Current User',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    avatar: user?.avatar || null as string | null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.username,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || null
      });
    }
  }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData({ ...profileData, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          avatar: profileData.avatar
        }),
      });
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-3xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      
      <div className="bg-[var(--color-card-bg)] rounded-3xl shadow-sm border border-[#0000001a] dark:border-[#ffffff1a] p-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <label className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-base-bg)] shadow-xl block">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-4xl">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
            <span className="text-sm text-[var(--color-primary)] font-semibold">Change Avatar</span>
          </div>
          
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-sm font-semibold opacity-80 mb-1.5 ml-1">Display Name (Read Only)</label>
              <input 
                type="text" 
                readOnly
                value={profileData.name}
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors opacity-70"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold opacity-80 mb-1.5 ml-1">Bio</label>
              <textarea 
                value={profileData.bio}
                onChange={e => setProfileData({...profileData, bio: e.target.value})}
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors resize-none h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold opacity-80 mb-1.5 ml-1">Location</label>
                <input 
                  type="text" 
                  value={profileData.location}
                  onChange={e => setProfileData({...profileData, location: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold opacity-80 mb-1.5 ml-1">Website</label>
                <input 
                  type="text" 
                  value={profileData.website}
                  onChange={e => setProfileData({...profileData, website: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#0000001a] dark:border-[#ffffff1a] pt-6 flex justify-end">
          <button 
            disabled={loading}
            onClick={handleSave}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
