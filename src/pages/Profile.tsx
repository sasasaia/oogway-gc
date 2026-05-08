export default function Profile({ user }: { user: any }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Profile settings</h1>
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-neutral-800 rounded-full border-4 border-neutral-950 overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-neutral-600">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : user.firstName[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-neutral-400">@{user.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">First Name</label>
            <input type="text" readOnly className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-neutral-100" value={user.firstName} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Last Name</label>
            <input type="text" readOnly className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-neutral-100" value={user.lastName} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Username</label>
            <input type="text" readOnly className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-neutral-100" value={user.username} />
          </div>
        </div>
      </div>
    </div>
  );
}
