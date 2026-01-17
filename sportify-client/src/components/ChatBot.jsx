/**
 * ChatBot Component
 *
 * An AI-powered chatbot interface for the Sportify platform that helps users find games,
 * explain sports rules, suggest strategies, and answer sports-related questions.
 *
 * Features:
 * - Floating chat button with toggle functionality
 * - Real-time message streaming with loading states
 * - Integration with OpenRouter API using Claude 3.5 Sonnet model
 * - Quick action buttons for common queries
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 *
 * @component
 * @example
 * return (
 *   <ChatBot />
 * )
 */

import { useState } from 'react';

const ChatBot = () => {
  /**
   * Controls the visibility of the chat window
   * @type {[boolean, Function]}
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Stores the conversation history between user and AI assistant
   * Each message object contains:
   * - role: 'user' | 'assistant' - Identifies the message sender
   * - content: string - The message text content
   *
   * @type {[Array<{role: string, content: string}>, Function]}
   */
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! I\'m your Sportify assistant. I can help you find games, explain sports rules, suggest strategies, and more! What can I help you with?' }
  ]);

  /**
   * Stores the current user input text before sending
   * @type {[string, Function]}
   */
  const [inputMessage, setInputMessage] = useState('');

  /**
   * Indicates whether the AI is currently processing a request
   * Used to show loading indicator and disable input during API calls
   * @type {[boolean, Function]}
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Sends the user's message to the OpenRouter API and handles the AI response
   *
   * Process:
   * 1. Validates input is not empty
   * 2. Adds user message to conversation history
   * 3. Makes API request to OpenRouter with conversation context
   * 4. Parses and adds AI response to conversation
   * 5. Handles errors with fallback messages
   *
   * API Configuration:
   * - Endpoint: OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
   * - Model: Claude 3.5 Sonnet (anthropic/claude-3.5-sonnet)
   * - Max tokens: 1024
   * - System prompt: Configured for sports assistance with friendly, enthusiastic tone
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const sendMessage = async () => {
    // Validate that the input is not empty or whitespace-only
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to conversation history immediately for responsive UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Make API request to OpenRouter which provides access to Claude 3.5 Sonnet
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // API key stored in environment variable for security
          'Authorization': `Bearer ${import.meta.env.VITE_ANTHROPIC_API_KEY}`,
          // Required by OpenRouter for attribution and monitoring
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Sportify'
        },
        body: JSON.stringify({
          // Specify Claude 3.5 Sonnet model through OpenRouter
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              // System prompt defines the AI's personality and capabilities
              content: 'You are a helpful sports assistant for Sportify, a platform that helps people find sports games and players nearby. Be enthusiastic, friendly, and knowledgeable about sports. Help users find games, explain sports rules, suggest strategies, and answer questions about sports. Keep responses concise but informative.'
            },
            // Include full conversation history (excluding system messages) for context
            ...messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role,
              content: m.content
            })),
            // Add the current user message
            { role: 'user', content: userMessage }
          ],
          // Limit response length to keep conversations concise
          max_tokens: 1024
        })
      });

      const data = await response.json();

      // Extract AI response from OpenRouter's response format
      // Provide fallback message if response structure is unexpected
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || 'Sorry, I encountered an error. Please try again.'
      }]);
    } catch (error) {
      // Log error for debugging while providing user-friendly error message
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.'
      }]);
    } finally {
      // Always reset loading state, even if request fails
      setIsLoading(false);
    }
  };

  /**
   * Handles keyboard events in the text input
   * - Enter: Sends the message (unless Shift is held)
   * - Shift+Enter: Inserts a new line
   *
   * @param {KeyboardEvent} e - The keyboard event object
   * @returns {void}
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent default Enter behavior (new line) and send message instead
      e.preventDefault();
      sendMessage();
    }
    // Shift+Enter allows users to create multi-line messages
  };

  /**
   * Predefined quick action prompts for common user queries
   * Displayed when the conversation is new (only initial greeting exists)
   * @constant {string[]}
   */
  const quickActions = [
    '🏀 Find basketball games near me',
    '⚽ Explain soccer rules',
    '🎾 Tennis tips for beginners',
    '🏐 Best volleyball strategies'
  ];

  return (
    <>
      {/* Floating Chat Toggle Button - Fixed position in bottom-right corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-3xl z-50 hover:scale-110 glow-effect"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window - Conditionally rendered based on isOpen state */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">

          {/* Chat Header - Displays branding and AI identity */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-lg">Sportify AI</h3>
              <p className="text-xs text-purple-100">Your sports companion</p>
            </div>
          </div>

          {/* Messages Container - Scrollable area displaying conversation history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Render all messages with role-based styling */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-slate-800 text-gray-100 border border-purple-500/20'
                  }`}
                >
                  {/* Preserve whitespace and line breaks in messages */}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Loading Indicator - Animated dots shown while waiting for AI response */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-purple-500/20 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    {/* Three bouncing dots with staggered animation timing */}
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions - Only shown at conversation start (when only greeting exists) */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">Quick actions:</p>
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      // Remove emoji prefix and send the prompt
                      setInputMessage(action.substring(2));
                      sendMessage();
                    }}
                    className="w-full text-left text-sm bg-slate-800/50 hover:bg-slate-800 border border-purple-500/20 hover:border-purple-500/40 p-2 rounded-lg transition-colors duration-200"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Section - Text area and send button */}
          <div className="p-4 border-t border-purple-500/20">
            <div className="flex gap-2">
              {/* Multi-line text input with keyboard shortcut support */}
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about sports..."
                className="flex-1 bg-slate-800 border border-purple-500/20 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-purple-500/40 transition-colors"
                rows="2"
                aria-label="Message input"
              />
              {/* Send button - Disabled when input is empty or while loading */}
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 font-semibold transition-all duration-300"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
            {/* Keyboard shortcut hint */}
            <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
