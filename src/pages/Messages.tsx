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
    <div className="flex h-full border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900 max-w-5xl mx-auto -m-2 md:m-0">
      {/* Sidebar: Chat List */}
      <div className={`w-full md:w-80 border-r border-neutral-800 flex flex-col shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-neutral-800">
          <h2 className="font-bold text-lg">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(u => (
            <button 
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`w-full text-left p-4 flex items-center space-x-3 hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 ${selectedUser?.id === u.id ? 'bg-neutral-800/80' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                {u.avatarUrl ? <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-5 h-5 text-neutral-400" />}
              </div>
              <div className="truncate">
                <div className="font-medium truncate">{u.firstName} {u.lastName}</div>
                <div className="text-xs text-neutral-500 truncate">@{u.username}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-neutral-800 flex items-center space-x-3 bg-neutral-950">
              <button 
                className="md:hidden text-emerald-500 font-medium mr-2"
                onClick={() => setSelectedUser(null)}
              >
                &larr;
              </button>
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                 {selectedUser.avatarUrl ? <img src={selectedUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-4 h-4 text-neutral-400" />}
              </div>
              <div>
                <div className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950">
              {messages.length === 0 ? (
                <div className="text-center text-neutral-500 mt-10 text-sm">No messages yet. Say hi!</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-3 px-4 ${isMe ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-neutral-800 text-neutral-100 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-white outline-none focus:border-emerald-500"
                  placeholder="Type a message..."
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 bg-neutral-950">
            <MessageCircleIcon className="w-16 h-16 mb-4 text-neutral-800" />
            <p>Select a conversation to start chatting</p>
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
