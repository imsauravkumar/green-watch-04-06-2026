import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const Chatbot = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "agriBotWelcome", // Sentinel to trigger translation rendering for welcome message
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const getBotResponse = (userQuery) => {
    const query = userQuery.toLowerCase();

    if (query.includes('rust') || query.includes('yellow rust') || query.includes('blight')) {
      return t('botRustResponse');
    }
    if (query.includes('fertilizer') || query.includes('urea') || query.includes('dap') || query.includes('npk')) {
      return t('botFertResponse');
    }
    if (query.includes('weather') || query.includes('rain') || query.includes('humidity')) {
      return t('botWeatherResponse');
    }
    if (query.includes('price') || query.includes('mandi') || query.includes('sell')) {
      return t('botPriceResponse');
    }
    if (query.includes('soil') || query.includes('loamy') || query.includes('clay') || query.includes('sandy')) {
      return t('botSoilResponse');
    }
    if (query.includes('pest') || query.includes('bug') || query.includes('aphid') || query.includes('armyworm')) {
      return t('botPestResponse');
    }
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return t('botHelloResponse');
    }

    return t('botDefaultResponse');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput('');
    setTyping(true);

    // Simulate thinking state
    setTimeout(() => {
      const botReplyText = getBotResponse(userQuery);
      const botMessage = {
        sender: 'bot',
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className="flex-1 p-6 flex flex-col h-[calc(100vh-4rem)] bg-slate-50 text-left">
      
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
          <MessageSquare className="w-5 h-5 text-emerald-600" /> {t('chatbotTitle')}
        </h1>
        <p className="text-xs text-slate-500">{t('chatbotDesc')}</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden max-w-3xl mx-auto w-full">
        
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xs block">{t('agriExpertBot')}</span>
              <span className="text-[9px] text-emerald-400 font-semibold block leading-none mt-0.5">{t('onlineAssistant')}</span>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" /> {t('support247')}
          </span>
        </div>

        {/* Message Scroll View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            const messageText = msg.text === 'agriBotWelcome' ? t('agriBotWelcome') : msg.text;
            return (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-left'}`}
              >
                {/* Avatar */}
                <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs border ${isBot ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-emerald-600 border-emerald-700 text-white'}`}>
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`p-3 rounded-xl text-xs leading-relaxed font-medium shadow-sm ${isBot ? 'bg-white border border-slate-200 text-slate-800' : 'bg-emerald-600 text-white'}`}>
                    {messageText}
                  </div>
                  <span className={`text-[8px] text-slate-400 block ${isBot ? 'text-left' : 'text-right'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-150 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbotPlaceholder')}
            className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
export default Chatbot;
