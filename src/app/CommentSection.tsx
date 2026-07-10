'use client';

import { useState, useEffect } from 'react';
import { postComment } from './actions';
import { playElectricSparkSound, playNavClickSound } from '@/lib/sfx';

interface Comment {
  id: string;
  nickname: string;
  text: string;
  createdAt: string;
}

export default function CommentSection({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [nickname, setNickname] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Initialize and run rate limit cooldown
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lastTime = localStorage.getItem('last-comment-time');
    if (lastTime) {
      const diff = Math.ceil((15000 - (Date.now() - parseInt(lastTime, 10))) / 1000);
      if (diff > 0) {
        setCooldown(diff);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !text.trim()) {
      alert('Nickname and message cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const res = await postComment(nickname, text);
      if (res.success) {
        playNavClickSound();
        if (typeof window !== 'undefined') {
          localStorage.setItem('last-comment-time', Date.now().toString());
        }
        setCooldown(15);
        
        // Optimistically add the new comment to the list
        const newComment: Comment = {
          id: Math.random().toString(),
          nickname: nickname.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;'),
          text: text.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;'),
          createdAt: new Date().toISOString()
        };
        setComments(prev => [newComment, ...prev]);
        setText('');
      } else {
        playElectricSparkSound();
        alert(res.error || 'Failed to post comment.');
      }
    } catch (err: any) {
      playElectricSparkSound();
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return 'UNKNOWN DATE';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
      {/* Left side: Terminal input box */}
      <div className="lg:col-span-5 glass-panel p-5 relative glow-hover hover:border-secondary/40 transition-all duration-300">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40"></div>

        <div className="mb-4 pb-2 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="font-technical-sm text-technical-sm text-secondary tracking-widest uppercase">
            TERMINAL // WRITE_COMMENTS
          </div>
          <span className="material-symbols-outlined text-[14px] text-secondary animate-pulse">terminal</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
              <label htmlFor="nickname">NICKNAME_ID</label>
              <span>{nickname.length} / 8</span>
            </div>
            <input 
              id="nickname"
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value.substring(0, 8))}
              placeholder="e.g. Anon"
              className="w-full bg-surface-container/50 border border-outline-variant/50 rounded text-technical-sm text-primary p-2.5 focus:outline-none focus:border-secondary transition-all uppercase placeholder-outline-variant/40"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
              <label htmlFor="message">COMMENT_TEXT</label>
              <span>{text.length} / 500</span>
            </div>
            <textarea 
              id="message"
              value={text}
              onChange={(e) => setText(e.target.value.substring(0, 500))}
              placeholder="Leave your message on the network..."
              rows={4}
              className="w-full bg-surface-container/50 border border-outline-variant/50 rounded text-technical-sm text-primary p-2.5 focus:outline-none focus:border-secondary transition-all resize-none placeholder-outline-variant/40"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || cooldown > 0}
            className="w-full font-technical-sm text-technical-sm text-surface bg-secondary py-3 rounded hover:shadow-[0_0_15px_rgba(176,198,255,0.5)] transition-all font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>COMMITTING...</span>
            ) : cooldown > 0 ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>RATE_LIMIT: WAIT {cooldown}S</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>COMMIT_MESSAGE</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right side: Comments Stream feed */}
      <div className="lg:col-span-7 glass-panel p-5 relative overflow-hidden h-[380px] flex flex-col hover:border-secondary/40 transition-all duration-300">
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/40"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/40"></div>

        <div className="mb-4 pb-2 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="font-technical-sm text-technical-sm text-secondary tracking-widest uppercase">
            FEED // LOG_STREAM
          </div>
          <span className="font-technical-sm text-[10px] text-outline-variant uppercase">
            RETENTION: 90_DAYS
          </span>
        </div>

        <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {comments.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-on-surface-variant font-technical-sm text-xs italic">
              NO INCOMING MESSAGE LOGS DETECTED ON PORT 80.
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className="border border-outline-variant/15 bg-surface-container/10 px-3 py-2 rounded hover:border-secondary/20 transition-all duration-200 flex justify-between items-center gap-4 text-xs font-technical-sm"
              >
                <div className="flex-1 min-w-0 truncate text-left">
                  <strong className="text-primary uppercase tracking-wider font-bold">
                    {comment.nickname}
                  </strong>
                  <span className="text-outline-variant mx-2">-</span>
                  <span className="text-on-surface-variant">
                    {comment.text}
                  </span>
                </div>
                <span className="text-[9px] text-outline-variant whitespace-nowrap flex-shrink-0">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
