import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';

export const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your Green Watch Agricultural Expert Bot. How can I help you today? You can ask me questions about crop diseases, fertilizers, weather warnings, or marketplace tips.",
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
      return "Yellow Rust or Blight are serious fungal threats. Organic control: Spray neem oil or copper carbonate sprays immediately. Ensure fields have proper drainage. Chemical control: Apply Propiconazole 25% EC or Mancozeb 75% WP. Remove highly damaged leaves to stop spore splash.";
    }
    if (query.includes('fertilizer') || query.includes('urea') || query.includes('dap') || query.includes('npk')) {
      return "Fertilizer schedules depend heavily on soil NPK levels. Basal dressings (applied during sowing) should contain DAP and MOP. Top dressings (applied during crown root irrigation or tillering) should be split doses of Nitrogen (Urea). For micronutrient deficiencies, spray soluble NPK 19-19-19 mixtures.";
    }
    if (query.includes('weather') || query.includes('rain') || query.includes('humidity')) {
      return "You can check your local 7-day weather predictions on the 'Weather Forecast' page. If rain is expected, delay fertilizer sprays and pesticide dusting by 48 hours to prevent wash-off.";
    }
    if (query.includes('price') || query.includes('mandi') || query.includes('sell')) {
      return "Daily crop prices are tracked on the 'Market Prices' page. Mustard is currently experiencing high demand in Jaipur APMC (+2.1%). It is recommended to sell ready stocks soon.";
    }
    if (query.includes('soil') || query.includes('loamy') || query.includes('clay') || query.includes('sandy')) {
      return "Different crops prefer different soil properties. Clay soils hold water and suit Paddy/Rice. Loamy soils balance sand/clay and suit Wheat and Mustard. Sandy soils drain fast and suit root vegetables. You can test your parameters in the 'Crop Recommendation' dashboard.";
    }
    if (query.includes('pest') || query.includes('bug') || query.includes('aphid') || query.includes('armyworm')) {
      return "Pests can destroy whole yields. For Aphids, release ladybug beetles or spray insecticidal potassium soaps. For Fall Armyworms in corn, apply Spinetoram SC formulations inside leaf whorls. Check out the 'Pest Control' directory for more details.";
    }
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return "Hello! I am online and ready to assist you. Ask me any agriculture, crop, or pest related queries.";
    }

    return "That is an interesting question! Based on agronomic practices, I recommend ensuring your soil has balanced organic compost, tracking daily temperatures, and keeping an eye on leaf colors. For specialized issues, you can post a query on our 'Community Forum' to ask fellow farmers or local experts!";
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
          <MessageSquare className="w-5 h-5 text-emerald-600" /> Agricultural Expert Chatbot
        </h1>
        <p className="text-xs text-slate-500">24/7 AI-powered agrarian assistant to guide crop diagnostics and treatments</p>
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
              <span className="font-bold text-xs block">Agri-Expert Bot</span>
              <span className="text-[9px] text-emerald-400 font-semibold block leading-none mt-0.5">Online • AI Assistant</span>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" /> 24/7 Support
          </span>
        </div>

        {/* Message Scroll View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
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
                    {msg.text}
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
            placeholder="Type your farming concern (e.g. wheat rust treatment, soil recommendations)..."
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
