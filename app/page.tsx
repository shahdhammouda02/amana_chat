'use client';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // تأكد أن المفتاح موجود
    if (!process.env.NEXT_PUBLIC_ABLY_API_KEY) {
      console.error('Ably API key is missing');
      return;
    }

    // Initialize Ably
    const Ably = require('ably');
    const ably = new Ably.Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY
    });
    
    const channel = ably.channels.get('chat-room');

    // Listen for messages
    channel.subscribe('message', (message: any) => {
      setMessages(prev => [...prev, message.data]);
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message immediately
    const userMessage = {
      user: 'You',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Get AI response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      
      // Add AI response
      const aiMessage = {
        user: 'AI',
        text: data.response,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error:', error);
    }

    setInputMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>
      
      {/* Messages */}
      <div className="h-96 border rounded-lg p-4 mb-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center">No messages yet. Start chatting!</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`mb-3 ${msg.user === 'You' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-xs lg:max-w-md p-3 rounded-lg ${
                msg.user === 'You' ? 'bg-blue-500 text-white' : 'bg-white border'
              }`}>
                <div className="font-bold text-sm">{msg.user}</div>
                <div className="mt-1">{msg.text}</div>
                <div className="text-xs opacity-70 mt-1">{msg.timestamp}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}