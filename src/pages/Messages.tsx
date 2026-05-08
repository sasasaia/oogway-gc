import React from 'react';
import { Send, User } from 'lucide-react';

export const Messages: React.FC = () => {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar for Friend list */}
      <div className="w-80 border-r border-[#0000001a] dark:border-[#ffffff1a] flex flex-col">
        <div className="p-4 border-b border-[#0000001a] dark:border-[#ffffff1a]">
          <h2 className="font-bold text-xl">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-[#0000000a] dark:border-[#ffffff0a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Friend {i}</div>
                  <div className="text-sm opacity-60">Hey, what's up?</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/5 dark:bg-white/5">
        <div className="h-16 px-6 border-b border-[#0000001a] dark:border-[#ffffff1a] bg-[var(--color-card-bg)] flex items-center shadow-sm z-10 shrink-0">
          <span className="font-semibold text-lg">Friend 1</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
          <div className="flex w-full justify-start">
            <div className="max-w-[70%] bg-[var(--color-card-bg)] p-3 px-4 rounded-2xl rounded-tl-sm shadow-sm border border-[#0000001a] dark:border-[#ffffff1a]">
              Hey, what's up? Are you going to the event later?
            </div>
          </div>
          <div className="flex w-full justify-end">
            <div className="max-w-[70%] bg-[var(--color-primary)] text-white p-3 px-4 rounded-2xl rounded-tr-sm shadow-sm">
              Yeah, I will be there!
            </div>
          </div>
        </div>

        <div className="p-4 bg-[var(--color-card-bg)] border-t border-[#0000001a] dark:border-[#ffffff1a]">
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-full border border-[#0000001a] dark:border-[#ffffff1a]">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent px-4 py-2 outline-none"
            />
            <button className="p-2 mr-1 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
