import React, { useState } from 'react';
import { BookOpen, Camera, Sparkles, MessageCircle } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!question.trim() && !image) return;

    setLoading(true);
    const userMessage = { role: 'user', content: question || 'Explain this image' };
    setConversation(prev => [...prev, userMessage]);

    try {
      const messages = [];
      
      if (image) {
        messages.push({
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: image.split(',')[1]
              }
            },
            {
              type: 'text',
              text: question || 'Explain what you see in this image and help me understand it.'
            }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: question
        });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: messages
        })
      });

      const data = await response.json();
      const aiResponse = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      setConversation(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setQuestion('');
      setImage(null);
    } catch (error) {
      console.error('Error:', error);
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Study Buddy
              </h1>
              <p className="text-sm text-gray-600">Snap, Ask, Learn with AI</p>
            </div>
          </div>
        </div>

        {/* Use Case Info */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-xl p-6 mb-4 text-white">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Hackathon Demo: DroidRun Framework
          </h2>
          <p className="text-sm opacity-90 mb-3">
            <strong>Use Case:</strong> Mobile AI tutor for students
          </p>
          <ul className="text-sm space-y-1 opacity-90">
            <li>📸 Snap photos of homework, diagrams, or notes</li>
            <li>💬 Ask questions about any subject</li>
            <li>🤖 Get instant AI-powered explanations</li>
            <li>📱 Perfect for on-the-go learning</li>
          </ul>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {conversation.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto text-purple-300 mb-4" />
                <p className="text-gray-500">Start learning! Upload an image or ask a question.</p>
              </div>
            ) : (
              conversation.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs md:max-w-md rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            {image && (
              <div className="mb-3 relative inline-block">
                <img src={image} alt="Upload preview" className="h-24 rounded-xl shadow-md" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
                <div className="bg-purple-100 hover:bg-purple-200 p-3 rounded-xl transition-colors">
                  <Camera className="w-5 h-5 text-purple-600" />
                </div>
              </label>

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Ask anything or describe what you need help with..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />

              <button
                onClick={handleSubmit}
                disabled={loading || (!question.trim() && !image)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-4 bg-white rounded-3xl shadow-xl p-4 text-center">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-700">Tech:</strong> DroidRun Framework + Claude Sonnet 4 API + React
          </p>
        </div>
      </div>
    </div>
  );
}
