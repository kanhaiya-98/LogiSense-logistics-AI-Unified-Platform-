import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useApi';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const chatMutation = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    try {
      const res = await chatMutation.mutateAsync({ message: userMsg, context: { page: window.location.pathname } });
      setMessages(prev => [...prev, { role: 'ai', text: res.reply }]);
    } catch(e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI." }]);
    }
  };

  return (
    <>
      {/* Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary-hover transition-transform hover:scale-105 z-50 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* Window */}
      {isOpen && (
         <div className="fixed bottom-6 right-6 w-[340px] h-[450px] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
           <div className="flex items-center justify-between bg-surface border-b border-border px-4 py-3">
             <div className="font-medium text-[13px] text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                LogiSense AI
             </div>
             <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
               <X className="w-4 h-4" />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-[12px] mt-4">
                   Hi! I'm LogiSense AI. Ask me about your logistics network.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[12px] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                     {m.text}
                   </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                   <div className="bg-muted text-foreground rounded-lg px-3 py-2">
                     <Loader2 className="w-3 h-3 animate-spin"/>
                   </div>
                </div>
              )}
              <div ref={bottomRef} />
           </div>

           <div className="p-3 border-t border-border bg-surface">
             <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
               <input 
                 type="text"
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 placeholder="Type a message..."
                 className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-[12px] focus:outline-none focus:border-primary"
               />
               <button 
                 type="submit"
                 disabled={chatMutation.isPending || !input.trim()}
                 className="bg-primary text-primary-foreground p-1.5 rounded-md hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
               >
                 <Send className="w-4 h-4" />
               </button>
             </form>
           </div>
         </div>
      )}
    </>
  );
}
