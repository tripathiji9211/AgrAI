import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Volume2, Mic, MicOff } from 'lucide-react';

const GeminiAdvisor = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Hello! I am your AgrAI assistant powered by Gemini. Ask me about crop diseases, yield optimization, or weather impacts on your farm. You can tap the microphone to use voice!' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      // You can bind to a language prop if you add a global context later.
      recognitionRef.current.lang = 'en-IN'; // Mock 'hi-IN' can be switched

      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send the voice query to our specialized endpoint
        await sendVoiceQuery(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const sendVoiceQuery = async (transcript) => {
    const newUserMsg = { id: Date.now(), role: 'user', text: transcript };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    
    const typingId = Date.now() + 1;
    setMessages((prev) => [...prev, { id: typingId, role: 'ai', text: 'Processing voice intent...', isTyping: true }]);

    try {
      const response = await fetch('http://localhost:5000/api/voice/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, languageCode: recognitionRef.current?.lang || 'en' }),
      });
      const data = await response.json();
      setMessages((prev) => prev.map(msg => 
        msg.id === typingId ? { ...msg, text: data.response || data.error, isTyping: false } : msg
      ));
    } catch (err) {
      setMessages((prev) => prev.map(msg => 
        msg.id === typingId ? { ...msg, text: "Failed mapping voice intent.", isTyping: false } : msg
      ));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userText = input;
    const newUserMsg = { id: Date.now(), role: 'user', text: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    
    const typingId = Date.now() + 1;
    setMessages((prev) => [...prev, { 
      id: typingId, 
      role: 'ai', 
      text: 'I am analyzing your query against our agronomical database...',
      isTyping: true 
    }]);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      
      setMessages((prev) => prev.map(msg => 
        msg.id === typingId ? { ...msg, text: data.response || data.error, isTyping: false } : msg
      ));
    } catch (error) {
      setMessages((prev) => prev.map(msg => 
        msg.id === typingId ? { ...msg, text: "Error communicating with server.", isTyping: false } : msg
      ));
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Attempt to pick an appropriate voice (can be enhanced to use specific language selectors later)
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) || voices[0];
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] max-h-[900px] flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Sparkles className="text-emerald-400" />
          Generative Advisor
        </h1>
        <p className="text-slate-400 mt-1">Farm intelligence powered by Google Gemini API.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 glass-card flex flex-col overflow-hidden border border-slate-700/50"
      >
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user' 
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' 
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm backdrop-blur-md ${
                msg.role === 'user'
                  ? 'bg-sky-900/40 border border-sky-700/30'
                  : 'bg-slate-800/60 border border-slate-700/50'
              }`}>
                <p className={`text-sm ${msg.isTyping ? 'animate-pulse text-emerald-400' : 'text-slate-200'}`}>
                  {msg.text}
                </p>
                {msg.role === 'ai' && !msg.isTyping && (
                  <button 
                    onClick={() => handleSpeak(msg.text)}
                    className="mt-2 text-slate-400 hover:text-emerald-400 transition-colors p-1"
                    title="Read Aloud"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask about NPK ratios, crop rotation, or pest control..."}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-4 pl-6 pr-24 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
            />
            <div className="absolute right-2 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListen}
                className={`p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button 
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed"
              >
                <Send size={20} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
              </button>
            </div>
          </form>
          <div className="text-center mt-3 text-xs text-slate-500">
            AgrAI advisor may generate inaccurate agronomy data. Please verify with certified agronomists.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GeminiAdvisor;
