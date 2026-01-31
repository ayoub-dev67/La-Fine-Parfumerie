'use client';

/**
 * Chatbot - Simple FAQ chatbot with category browsing
 * Floating button that opens a chat interface
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faqCategories, searchFAQ, getPopularQuestions, FAQItem, FAQCategory } from '@/lib/chatbot-faq';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  faqItems?: FAQItem[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: 'Bonjour ! 👋 Je suis l\'assistant de La Fine Parfumerie. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const addBotMessage = useCallback((content: string, faqItems?: FAQItem[]) => {
    setMessages(prev => [...prev, {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      faqItems
    }]);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowCategories(false);
    setSelectedCategory(null);

    // Search FAQ
    setTimeout(() => {
      const results = searchFAQ(inputValue);

      if (results.length > 0) {
        addBotMessage(
          'Voici ce que j\'ai trouvé pour vous :',
          results
        );
      } else {
        addBotMessage(
          'Je n\'ai pas trouvé de réponse exacte à votre question. Vous pouvez parcourir nos catégories ci-dessous ou contacter notre service client à contact@lafineparfumerie.com'
        );
        setShowCategories(true);
      }
    }, 500);
  }, [inputValue, addBotMessage]);

  const handleCategoryClick = (category: FAQCategory) => {
    setSelectedCategory(category);
    setShowCategories(false);
    addBotMessage(`${category.icon} Questions sur ${category.name} :`);
  };

  const handleQuestionClick = (item: FAQItem) => {
    // Add user's question
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: item.question,
      timestamp: new Date()
    }]);

    // Add bot answer
    setTimeout(() => {
      addBotMessage(item.answer);
    }, 300);
  };

  const handleBackToCategories = () => {
    setShowCategories(true);
    setSelectedCategory(null);
  };

  const popularQuestions = getPopularQuestions();

  return (
    <>
      {/* Chat Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isOpen ? 'bg-gray-700' : 'bg-or hover:bg-or/90'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="w-6 h-6 text-noir"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Badge */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-[72px] right-6 z-50 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
        >
          1
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] h-[500px] bg-noir border border-or/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-or/20 to-or/10 border-b border-or/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-or rounded-full flex items-center justify-center">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h3 className="text-creme font-medium">Assistant La Fine Parfumerie</h3>
                  <p className="text-creme/60 text-xs">Réponse instantanée</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-or text-noir rounded-br-md'
                        : 'bg-gray-800 text-creme rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>

                    {/* FAQ Items */}
                    {message.faqItems && message.faqItems.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.faqItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleQuestionClick(item)}
                            className="w-full text-left p-2 bg-noir/50 rounded-lg text-sm hover:bg-noir/70 transition-colors"
                          >
                            <span className="text-or">→</span> {item.question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Categories */}
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-creme/60 text-xs text-center">Choisissez une catégorie</p>
                  <div className="grid grid-cols-2 gap-2">
                    {faqCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryClick(category)}
                        className="p-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <p className="text-creme text-sm mt-1">{category.name}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Selected Category Questions */}
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <button
                    type="button"
                    onClick={handleBackToCategories}
                    className="flex items-center gap-1 text-or text-sm hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux catégories
                  </button>

                  {selectedCategory.questions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleQuestionClick(item)}
                      className="w-full text-left p-3 bg-gray-800 rounded-lg text-sm text-creme hover:bg-gray-700 transition-colors"
                    >
                      {item.question}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Popular Questions (shown initially) */}
              {messages.length === 1 && showCategories && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4"
                >
                  <p className="text-creme/60 text-xs mb-2">Questions populaires</p>
                  <div className="space-y-2">
                    {popularQuestions.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleQuestionClick(item)}
                        className="w-full text-left p-2 bg-or/10 border border-or/20 rounded-lg text-sm text-creme hover:bg-or/20 transition-colors"
                      >
                        {item.question}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-or/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-or/20 rounded-full text-creme text-sm placeholder-creme/40 focus:outline-none focus:border-or/50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 bg-or rounded-full flex items-center justify-center text-noir hover:bg-or/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
