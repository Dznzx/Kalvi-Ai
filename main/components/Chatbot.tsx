
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Globe } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { Language } from '../types';
import { KalviLogo } from './KalviLogo';

interface ChatbotProps {
  appLanguage: Language; 
}

const Chatbot: React.FC<ChatbotProps> = ({ appLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatLanguage, setChatLanguage] = useState<'en' | 'ta' | null>(null);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, chatLanguage]);

  const handleLanguageSelect = (lang: 'en' | 'ta') => {
    setChatLanguage(lang);
    const greeting = lang === 'ta' 
      ? "வணக்கம்! நான் Kalvi.AI உதவியாளர். பள்ளி சேர்க்கை, கட்டணம் அல்லது பாடத்திட்டம் பற்றி என்னிடம் கேட்கலாம்." 
      : "Hello! I'm the Kalvi.AI assistant. Ask me about school onboarding, pricing, or our curriculum.";
    
    setMessages([{ role: 'model', content: greeting }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatLanguage) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await generateChatResponse(userMsg, messages, chatLanguage === 'ta');
    
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-80 sm:w-96 mb-4 overflow-hidden flex flex-col h-[500px] animate-fade-in-up">
          {/* Header updated to Terracotta with Logo */}
          <div className="bg-kalvi-terracotta p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                    {/* Passing color="white" to ensure SVG strokes use white where currentColor is used */}
                    <KalviLogo className="h-8" showText={false} color="white" />
                </div>
                <div>
                    <h3 className="font-heading font-bold text-lg leading-tight">Kalvi.AI</h3>
                    <p className="text-[10px] font-medium opacity-90 uppercase tracking-wider">AI Assistant</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {!chatLanguage ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                 <div className="text-center">
                    <Globe className="w-12 h-12 text-kalvi-terracotta mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Choose your language / மொழியைத் தேர்ந்தெடுக்கவும்</p>
                 </div>
                 <div className="flex flex-col gap-3 w-full px-8">
                    <button 
                      onClick={() => handleLanguageSelect('ta')}
                      className="w-full bg-white border-2 border-kalvi-coffee text-kalvi-coffee hover:bg-kalvi-coffee hover:text-white font-bold py-3 rounded-xl transition shadow-sm"
                    >
                      தமிழ் (Tamil)
                    </button>
                    <button 
                      onClick={() => handleLanguageSelect('en')}
                      className="w-full bg-white border-2 border-kalvi-terracotta text-kalvi-terracotta hover:bg-kalvi-terracotta hover:text-white font-bold py-3 rounded-xl transition shadow-sm"
                    >
                      English
                    </button>
                 </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.role === 'user' 
                        ? 'bg-kalvi-terracotta text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 rounded-bl-none shadow-sm flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-kalvi-terracotta" />
                      <span className="text-xs text-gray-500">{chatLanguage === 'ta' ? 'யோசிக்கிறது...' : 'Thinking...'}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {chatLanguage && (
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={chatLanguage === 'ta' ? "இங்கே தட்டச்சு செய்யவும்..." : "Type here..."}
                className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta/50 shadow-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-kalvi-terracotta text-white p-2 rounded-full hover:bg-[#A04731] transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Button updated to Terracotta with lighter shadow opacity (0.15) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-kalvi-terracotta hover:bg-[#A04731] text-white p-4 rounded-full shadow-[0_8px_24px_rgba(198,86,59,0.15)] transition-all duration-300 hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default Chatbot;
