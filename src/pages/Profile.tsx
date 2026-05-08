import React, { useState } from 'react';
import { Camera } from 'lucide-react';

export const Profile: React.FC = () => {
  const [user, setUser] = useState({
    name: 'Current User',
    bio: 'Just setting up my Orb.',
    location: 'Internet',
    website: 'https://orb.social'
  });

  return (
    <div className="p-8 w-full max-w-3xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      
      <div className="bg-[var(--color-card-bg)] rounded-3xl shadow-sm border border-[#0000001a] dark:border-[#ffffff1a] p-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-base-bg)] shadow-xl">
              <div className="w-full h-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-4xl">
                {user.name.charAt(0)}
              </div>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <button className="text-sm text-[var(--color-primary)] font-semibold">Change Avatar</button>
          </div>
          
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-sm font-semibold opacity-80 mb-1.5 ml-1">Display Name</label>
              <input 
                type="text" 
                value={user.name}
                onChange={e => setUser({...user, name: e.target.value})}
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold opacity-80 mb-1.5 ml-1">Bio</label>
              <textarea 
                value={user.bio}
                onChange={e => setUser({...user, bio: e.target.value})}
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors resize-none h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold opacity-80 mb-1.5 ml-1">Location</label>
                <input 
                  type="text" 
                  value={user.location}
                  onChange={e => setUser({...user, location: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold opacity-80 mb-1.5 ml-1">Website</label>
                <input 
                  type="text" 
                  value={user.website}
                  onChange={e => setUser({...user, website: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#0000001a] dark:border-[#ffffff1a] pt-6 flex justify-end">
          <button className="bg-[var(--color-primary)] text-white font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
