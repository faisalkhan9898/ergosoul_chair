import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';

export const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! Welcome to Ergosoul. I am your premium seating and furniture advisor. How can I guide your comfort today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const newMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulated reply delay
    setTimeout(() => {
      let botResponse = '';
      const cleanText = text.toLowerCase();

      if (cleanText.includes('warranty')) {
        botResponse = 'All Ergosoul Premium products carry an industry-leading 3 to 7 Year Warranty covering mechanical structures, cylinders, and frames.';
      } else if (cleanText.includes('shipping') || cleanText.includes('delivery')) {
        botResponse = 'We offer Free Shipping on all orders above $1000. Typical transit takes 3-5 business days depending on location.';
      } else if (cleanText.includes('gaming')) {
        botResponse = 'Our premier gaming model is the Apex Throne Esports Chair. It features 4D adjustable arms, cooling gel inserts, and a robust steel core.';
      } else if (cleanText.includes('office') || cleanText.includes('lumbar')) {
        botResponse = 'For long workspaces, we highly recommend the AeroFlex Ergonomic Mesh Task Chair which adapts instantly to your lumbar curves.';
      } else if (cleanText.includes('custom')) {
        botResponse = 'Yes, we manufacture bespoke furniture! Reach out to us at team.ergosoul@gmail.com to design tailored upholstery or corporate branding.';
      } else {
        botResponse = 'Thanks for reaching out! A human agent is heading this way, or you can email team.ergosoul@gmail.com for direct support.';
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-full shadow-luxury transition-all duration-300 transform hover:scale-105 active:scale-95 dark:bg-amber-500 dark:hover:bg-amber-600"
        >
          <FaComments className="text-xl" />
          <span className="font-medium text-sm hidden sm:inline">Live Chat</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-luxury flex flex-col border border-gray-100 dark:border-gray-800 transition-all duration-300">
          {/* Header */}
          <div className="p-4 bg-primary text-white rounded-t-2xl flex items-center justify-between dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center font-serif text-lg font-bold text-gray-900">
                E
              </div>
              <div>
                <h4 className="font-semibold text-sm">Ergosoul Lounge Support</h4>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Active Response Team
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors text-white"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none dark:bg-amber-500 dark:text-gray-900'
                      : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-800 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {['Best Office Chair', 'Apex Throne Gaming', 'Custom chair designs', 'Shipping rates'].map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(item)}
                className="text-xs px-3 py-1.5 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full border dark:border-gray-700 shadow-sm transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-2 border rounded-full text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-full transition-colors flex items-center justify-center dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveChat;
