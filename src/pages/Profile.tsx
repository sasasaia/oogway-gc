export default function Profile({ user }: { user: any }) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-10"></div>
        
        <div className="relative mb-6 inline-block">
          <div className="w-32 h-32 mx-auto rounded-full bg-violet-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden text-5xl font-black text-violet-500">
             {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : user.firstName[0]}
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.firstName} {user.lastName}</h1>
        <p className="text-slate-500 font-semibold mt-1 mb-6 text-lg">@{user.username}</p>
        
        <div className="flex justify-center space-x-12 border-t border-slate-100 pt-6 mt-6">
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-black text-slate-800 group-hover:text-violet-600 transition-colors">42</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Posts</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-black text-slate-800 group-hover:text-fuchsia-600 transition-colors">128</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Followers</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-3xl font-black text-slate-800 group-hover:text-violet-600 transition-colors">56</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Following</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center">
          Profile Settings
        </h2>
        
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">First Name</label>
              <input type="text" readOnly className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none transition-all" value={user.firstName} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Last Name</label>
              <input type="text" readOnly className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none transition-all" value={user.lastName} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Username</label>
            <input type="text" readOnly className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none transition-all" value={user.username} />
          </div>
        </div>
      </div>
    </div>
  );
}
