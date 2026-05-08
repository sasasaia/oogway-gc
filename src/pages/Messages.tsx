import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { useAuth } from '../AuthContext';

export const Messages: React.FC = () => {
  const { user, token } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchFriends = async () => {
    try {
      if (!token) return;
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) setFriends(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (friendId: number) => {
    try {
      if (!token) return;
      const res = await fetch(`/api/messages/${friendId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [token]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.Id);
      const interval = setInterval(() => fetchMessages(selectedFriend.Id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedFriend, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedFriend.Id,
          content: newMessage
        })
      });
      setNewMessage('');
      fetchMessages(selectedFriend.Id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar for Friend list */}
      <div className="w-80 border-r border-[#0000001a] dark:border-[#ffffff1a] flex flex-col">
        <div className="p-4 border-b border-[#0000001a] dark:border-[#ffffff1a]">
          <h2 className="font-bold text-xl">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="p-4 text-center opacity-60">No friends yet...</div>
          ) : friends.map((friend) => (
            <div 
              key={friend.Id} 
              onClick={() => setSelectedFriend(friend)}
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-[#0000000a] dark:border-[#ffffff0a] ${selectedFriend?.Id === friend.Id ? 'bg-black/5 dark:bg-white/10' : ''}`}
            >
              <div className="flex items-center gap-3">
                {friend.Avatar ? (
                  <img src={friend.Avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
                    {friend.Username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium">{friend.Username}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/5 dark:bg-white/5">
        {!selectedFriend ? (
          <div className="flex-1 flex items-center justify-center opacity-60">
            Select a friend to start chatting
          </div>
        ) : (
          <>
            <div className="h-16 px-6 border-b border-[#0000001a] dark:border-[#ffffff1a] bg-[var(--color-card-bg)] flex items-center shadow-sm z-10 shrink-0">
              <span className="font-semibold text-lg">{selectedFriend.Username}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {messages.map((msg, i) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={i} className={`flex w-full justify-${isMine ? 'end' : 'start'}`}>
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className={`p-3 px-4 rounded-2xl shadow-sm border border-[#0000001a] dark:border-[#ffffff1a] ${isMine ? 'bg-[var(--color-primary)] text-white rounded-br-sm' : 'bg-[var(--color-card-bg)] rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] opacity-50 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-[var(--color-card-bg)] border-t border-[#0000001a] dark:border-[#ffffff1a]">
              <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-full border border-[#0000001a] dark:border-[#ffffff1a]">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent px-4 py-2 outline-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()} className="p-2 mr-1 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
