import React, { useState, useRef, useEffect } from "react";
import { LuArrowLeft, LuPhone, LuSettings, LuSearch, LuSend, LuPaperclip, LuSmile, LuTrash2, LuCheck, LuMessageSquare } from "react-icons/lu";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";

const Message = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([
    {
      id: 0,
      name: "Yashu Mukhija",
      role: "Electrician Apprentice",
      lastMessage: "Hello",
      timestamp: "Fri",
      avatar: "Y",
      isSelected: true,
      messages: [
        { id: 1, sender: "Yashu Mukhija", content: "Good Morning!", time: "10:30 AM", isIncoming: true },
        { id: 2, sender: "You", content: "Good Morning!", time: "10:30 AM", isIncoming: false },
        { id: 3, sender: "Yashu Mukhija", content: "Hello, I submitted my application for the Electrician Apprentice position", time: "10:30 AM", isIncoming: true },
        { id: 4, sender: "You", content: "Thank you for your application. We will review it and get back to you soon.", time: "10:30 AM", isIncoming: false },
        { id: 5, sender: "Yashu Mukhija", content: "Thank you for considering my application. I look forward to hearing from you.", time: "10:30 AM", isIncoming: true }
      ]
    },
    {
      id: 1,
      name: "Pakhi Parekh",
      role: "Electrician Apprentice",
      lastMessage: "Hello",
      timestamp: "1 Hour Ago",
      avatar: "P",
      isSelected: false,
      messages: [
        { id: 1, sender: "Pakhi Parekh", content: "Hello", time: "1 Hour Ago", isIncoming: true }
      ]
    },
    {
      id: 2,
      name: "Pakhi Parekh",
      role: "Electrician Apprentice",
      lastMessage: "Hello",
      timestamp: "1 Hour Ago",
      avatar: "P",
      isSelected: false,
      messages: [
        { id: 1, sender: "Pakhi Parekh", content: "Hello", time: "1 Hour Ago", isIncoming: true }
      ]
    },
    {
      id: 3,
      name: "Pakhi Parekh",
      role: "Electrician Apprentice",
      lastMessage: "Hello",
      timestamp: "1 Hour Ago",
      avatar: "P",
      isSelected: false,
      messages: [
        { id: 1, sender: "Pakhi Parekh", content: "Hello", time: "1 Hour Ago", isIncoming: true }
      ]
    },
    {
      id: 4,
      name: "Pakhi Parekh",
      role: "Electrician Apprentice",
      lastMessage: "Hello",
      timestamp: "1 Hour Ago",
      avatar: "P",
      isSelected: false,
      messages: [
        { id: 1, sender: "Pakhi Parekh", content: "Hello", time: "1 Hour Ago", isIncoming: true }
      ]
    }
  ]);

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = selectedMessage !== null ? conversations.find(conv => conv.id === selectedMessage) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMessageObj = {
      id: Date.now(),
      sender: "You",
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isIncoming: false
    };

    setConversations(prevConversations => 
      prevConversations.map(conversation => 
        conversation.id === selectedMessage
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessageObj],
              lastMessage: newMessage.trim(),
              timestamp: "Now"
            }
          : conversation
      )
    );

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedMessages([]);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const deleteSelectedMessages = () => {
    if (selectedMessages.length === 0) return;

    setConversations(prevConversations => 
      prevConversations.map(conversation => 
        conversation.id === selectedMessage
          ? {
              ...conversation,
              messages: conversation.messages.filter(msg => !selectedMessages.includes(msg.id))
            }
          : conversation
      )
    );
    
    setSelectedMessages([]);
    setIsSelectMode(false);
  };

  const selectAllMessages = () => {
    const allMessageIds = currentConversation?.messages.map(msg => msg.id) || [];
    setSelectedMessages(allMessageIds);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Sidebar - Message List */}
      <div className="w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-1/2 lg:h-full">
        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedMessage(conversation.id)}
              className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedMessage === conversation.id ? 'bg-[var(--color-primary)18]' : ''
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold truncate text-sm sm:text-base ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{conversation.name}</h3>
                    <span className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{conversation.timestamp}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-primary)] font-medium truncate">{conversation.role}</p>
                  <p className={`text-xs sm:text-sm truncate ${TAILWIND_COLORS.TEXT_MUTED}`}>{conversation.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col h-1/2 lg:h-full">
        {/* Chat Header */}
        {currentConversation && (
          <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                <LuArrowLeft size={16} className="text-gray-600 sm:hidden" />
                <LuArrowLeft size={20} className="text-gray-600 hidden sm:block" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                {currentConversation.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold text-sm sm:text-base truncate ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{currentConversation.name}</h3>
                <p className="text-xs sm:text-sm text-[var(--color-primary)] truncate">{currentConversation.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="p-1.5 sm:p-2 rounded-lg">
                <LuPhone size={16} className="text-gray-600 sm:hidden" />
                <LuPhone size={20} className="text-gray-600 hidden sm:block" />
              </button>
              {!isSelectMode ? (
                <button 
                  onClick={toggleSelectMode}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
                  title="Select Messages"
                >
                  <LuCheck size={16} className="text-gray-600 sm:hidden" />
                  <LuCheck size={20} className="text-gray-600 hidden sm:block" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={selectAllMessages}
                    className="px-2 py-1 text-xs sm:text-sm text-[var(--color-primary)] hover:bg-gray-100 rounded-lg"
                  >
                    All
                  </button>
                  <button 
                    onClick={deleteSelectedMessages}
                    disabled={selectedMessages.length === 0}
                    className={`p-1.5 sm:p-2 rounded-lg ${
                      selectedMessages.length > 0 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    title="Delete Selected"
                  >
                    <LuTrash2 size={16} className="sm:hidden" />
                    <LuTrash2 size={20} className="hidden sm:block" />
                  </button>
                  <button 
                    onClick={toggleSelectMode}
                    className="px-2 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {currentConversation ? (
            <>
              {/* Date Separator */}
              <div className="text-center">
                <span className={`text-sm bg-gray-100 px-3 py-1 rounded-full ${TAILWIND_COLORS.TEXT_MUTED}`}>Today</span>
              </div>

              {/* Messages */}
              {currentConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isIncoming ? 'justify-start' : 'justify-end'} gap-3 ${
                isSelectMode ? 'cursor-pointer' : ''
              }`}
              onClick={() => isSelectMode && toggleMessageSelection(message.id)}
            >
              {message.isIncoming && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                  {currentConversation.avatar}
                </div>
              )}
              <div className={`max-w-[70%] sm:max-w-xs lg:max-w-md ${message.isIncoming ? 'order-2' : 'order-1'} ${
                isSelectMode ? 'flex items-start gap-2' : ''
              }`}>
                {isSelectMode && (
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => toggleMessageSelection(message.id)}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                    />
                  </div>
                )}
                <div>
                  <div
                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl ${
                      message.isIncoming
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-[var(--color-primary)] text-white'
                    } ${
                      isSelectMode && selectedMessages.includes(message.id)
                        ? 'ring-2 ring-[var(--color-primary)] ring-opacity-50'
                        : ''
                    }`}
                  >
                    <p className="text-xs sm:text-sm break-words">{message.content}</p>
                  </div>
                  <p className={`text-xs mt-1 px-2 ${TAILWIND_COLORS.TEXT_MUTED}`}>
                    {message.time}
                  </p>
                </div>
              </div>
              {!message.isIncoming && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0 order-2">
                  Y
                </div>
              )}
            </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LuMessageSquare size={32} className="text-gray-400" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Select a conversation</h3>
                <p className={TAILWIND_COLORS.TEXT_MUTED}>Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        {currentConversation && (
          <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <LuPaperclip size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <LuSmile size={20} />
            </button>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Type something..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-2 rounded-lg ${
                newMessage.trim() 
                  ? 'text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-gray-100' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <LuSend size={20} />
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;