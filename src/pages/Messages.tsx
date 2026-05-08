import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon } from 'lucide-react';

export default function Messages({ user }: { user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    // Basic implementation: fetch all users (exclude self handled in API)
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/messages/${selectedUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId: selectedUser.id, content: newMessage })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh chat
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full border border-slate-100 rounded-[2rem] overflow-hidden bg-white max-w-5xl mx-auto -m-2 md:m-0 shadow-sm relative">
      {/* Sidebar: Chat List */}
      <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="font-black text-2xl text-slate-800 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(u => (
            <button 
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`w-full text-left p-4 flex items-center space-x-4 transition-colors border-b border-slate-100/50 ${selectedUser?.id === u.id ? 'bg-violet-50 border-violet-100' : 'hover:bg-slate-100/50'}`}
            >
              <div className="w-12 h-12 rounded-full bg-violet-100 border border-white shadow-sm flex items-center justify-center shrink-0">
                {u.avatarUrl ? <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-6 h-6 text-violet-500" />}
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-800 truncate">{u.firstName} {u.lastName}</div>
                <div className="text-xs font-semibold text-slate-500 truncate">@{u.username}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            <div className="p-5 border-b border-slate-100 flex items-center space-x-4 bg-white z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <button 
                className="md:hidden text-violet-500 font-bold mr-2 p-2 rounded-full hover:bg-violet-50"
                onClick={() => setSelectedUser(null)}
              >
                &larr;
              </button>
              <div className="w-10 h-10 rounded-full bg-violet-100 border border-slate-100 flex items-center justify-center shadow-sm">
                 {selectedUser.avatarUrl ? <img src={selectedUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-5 h-5 text-violet-500" />}
              </div>
              <div>
                <div className="font-bold text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none"></div>
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 mt-[20vh] font-medium text-sm relative z-10">Say hi to start a fun conversation! 🎉</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex relative z-10 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-3xl p-4 px-5 text-sm font-medium shadow-sm ${isMe ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 border-t border-slate-100 bg-white">
              <form onSubmit={sendMessage} className="flex space-x-3">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-full px-6 py-3 text-slate-900 font-medium outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all placeholder:text-slate-400"
                  placeholder="Type a message..."
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:hover:scale-100 text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform transform hover:scale-105 shadow-md shadow-violet-200">
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none"></div>
            <MessageCircleIcon className="w-20 h-20 mb-6 text-slate-200 relative z-10" />
            <p className="font-medium text-lg relative z-10">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}
