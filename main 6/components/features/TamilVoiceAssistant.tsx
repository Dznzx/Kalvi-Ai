import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2, Languages, Trash2, AlertTriangle } from 'lucide-react';
import { Language } from '../../types';
import { generateChatResponse } from '../../services/geminiService';

interface TamilVoiceAssistantProps {
  language: Language;
}

interface VoiceTurn {
  role: 'user' | 'model';
  text: string;
}

// Minimal typing shim for the Web Speech API (not in default TS lib)
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const TamilVoiceAssistant: React.FC<TamilVoiceAssistantProps> = ({ language }) => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const t = {
    title: language === 'en' ? 'Tamil Voice Assistant' : 'தமிழ் குரல் உதவியாளர்',
    subtitle: language === 'en' ? 'Ask your career questions out loud, in Tamil' : 'உங்கள் தொழில் கேள்விகளைத் தமிழில் பேசிக் கேளுங்கள்',
    tapToSpeak: language === 'en' ? 'Tap the mic and speak in Tamil' : 'மைக்கை அழுத்தி தமிழில் பேசுங்கள்',
    listening: language === 'en' ? 'Listening...' : 'கேட்டுக்கொண்டிருக்கிறது...',
    thinking: language === 'en' ? 'Thinking...' : 'யோசிக்கிறது...',
    unsupported: language === 'en' ? 'Voice recognition isn\u2019t supported on this browser. Try Chrome on Android/Desktop.' : 'இந்த உலாவியில் குரல் அறிதல் ஆதரவு இல்லை. Chrome (Android/Desktop) பயன்படுத்தவும்.',
    clear: language === 'en' ? 'Clear conversation' : 'உரையாடலை அழி',
    listenReply: language === 'en' ? 'Listen' : 'கேளுங்கள்',
    startPrompt: language === 'en' ? 'Try asking: "பொறியியல் படிக்க என்ன பாடங்கள் தேவை?"' : 'இதைக் கேளுங்கள்: "பொறியியல் படிக்க என்ன பாடங்கள் தேவை?"',
  };

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'ta-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setLiveTranscript(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        handleFinalTranscript(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinalTranscript = async (text: string) => {
    if (!text.trim()) return;
    setLiveTranscript('');
    setTurns(prev => [...prev, { role: 'user', text }]);
    setIsThinking(true);
    try {
      const response = await generateChatResponse(text, [], true);
      setTurns(prev => [...prev, { role: 'model', text: response }]);
      speak(response, -1);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setLiveTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Recognition may already be running; ignore.
      }
    }
  };

  const speak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN';
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
  };

  const clearConversation = () => {
    setTurns([]);
    setLiveTranscript('');
    window.speechSynthesis?.cancel();
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Languages className="text-kalvi-terracotta" size={30} /> {t.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        {turns.length > 0 && (
          <button onClick={clearConversation} className="text-gray-400 hover:text-red-500 transition-colors p-2" title={t.clear}>
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {!supported && (
        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400 p-5 rounded-2xl font-semibold text-sm">
          <AlertTriangle size={20} className="flex-shrink-0" /> {t.unsupported}
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1F2E] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 min-h-[320px] flex flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[420px] pr-1">
          {turns.length === 0 && !liveTranscript && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-gray-400">
              <Mic size={40} className="mb-4 opacity-40" />
              <p className="font-semibold">{t.tapToSpeak}</p>
              <p className="text-xs mt-3 max-w-xs">{t.startPrompt}</p>
            </div>
          )}

          {turns.map((turn, i) => (
            <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${turn.role === 'user' ? 'bg-orange-600 text-white rounded-br-md' : 'bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-100 dark:border-white/5'}`}>
                <p>{turn.text}</p>
                {turn.role === 'model' && (
                  <button onClick={() => speak(turn.text, i)} className="mt-2 flex items-center gap-1.5 text-xs font-black text-indigo-500 dark:text-indigo-400 hover:underline">
                    <Volume2 size={13} className={speakingIndex === i ? 'animate-pulse' : ''} /> {t.listenReply}
                  </button>
                )}
              </div>
            </div>
          ))}

          {liveTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] p-4 rounded-2xl text-sm bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 rounded-br-md italic">
                {liveTranscript}
              </div>
            </div>
          )}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-orange-600" />
                <span className="text-xs font-bold text-gray-500">{t.thinking}</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8 flex flex-col items-center gap-3">
          <button
            onClick={toggleListening}
            disabled={!supported}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 disabled:opacity-30 ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-orange-600 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff size={30} className="text-white" /> : <Mic size={30} className="text-white" />}
          </button>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">{isListening ? t.listening : t.tapToSpeak}</p>
        </div>
      </div>
    </div>
  );
};

export default TamilVoiceAssistant;
