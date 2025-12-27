import { useState, useRef, useEffect } from "react";
import { IoChatbubbleEllipsesOutline, IoClose, IoSend } from "react-icons/io5";
import axiosInstance from "../lib/axios";

/**
 * =============================================================================
 * CHAT WIDGET COMPONENT
 * =============================================================================
 * A floating chat bubble that allows customers to chat with the AI assistant.
 *
 * HOW IT WORKS:
 * 1. User clicks the floating bubble to open the chat window.
 * 2. User types a message and clicks send.
 * 3. We send the message + conversation history to the backend.
 * 4. Backend calls Gemini API and returns the AI's response.
 * 5. We display the response and update the history.
 */
export default function ChatWidget() {
  // State for controlling the chat window visibility
  const [isOpen, setIsOpen] = useState(false);

  // State for the message input field
  const [inputMessage, setInputMessage] = useState("");

  // State for loading indicator while waiting for AI response
  const [isLoading, setIsLoading] = useState(false);

  // State for the chat messages (what's displayed in the UI)
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! 👋 I'm RM Toys Assistant. How can I help you today?",
    },
  ]);

  // State for the conversation history (sent to the API)
  // This is in Gemini's expected format
  const [history, setHistory] = useState([]);

  // Ref to scroll to bottom of messages
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    // Don't send empty messages
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage(""); // Clear input immediately

    // Add user message to UI
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await axiosInstance.post("/chatbot/chat", {
        message: userMessage,
        history: history,
      });

      if (response.data.success) {
        // Add AI response to UI
        setMessages((prev) => [
          ...prev,
          { role: "model", text: response.data.reply },
        ]);
        // Update history for next message
        setHistory(response.data.updatedHistory);
      } else {
        // Handle error
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: response.data.message || "Sorry, something went wrong.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text:
            error.response?.data?.message ||
            "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Enter key press to send message
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ================================================================== */}
      {/* FLOATING CHAT BUTTON */}
      {/* ================================================================== */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary text-card p-4 rounded-full border-2 border-black transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          aria-label="Open chat"
        >
          <IoChatbubbleEllipsesOutline size={28} />
        </button>
      )}

      {/* ================================================================== */}
      {/* CHAT WINDOW */}
      {/* ================================================================== */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90%] h-[500px] bg-card border-2 border-black rounded-[10px] shadow-2xl flex flex-col overflow-hidden">
          {/* ============================================================ */}
          {/* HEADER */}
          {/* ============================================================ */}
          <div className="bg-primary text-card p-4 flex justify-between items-center border-b-2 border-black">
            <div className="flex items-center gap-2">
              <IoChatbubbleEllipsesOutline size={24} />
              <div>
                <h3 className="font-bold text-lg">RM Toys Assistant</h3>
                <p className="text-xs opacity-80">
                  Ask me anything about the shop!
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/20 p-1 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* ============================================================ */}
          {/* MESSAGES AREA */}
          {/* ============================================================ */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-[10px] ${
                    msg.role === "user"
                      ? "bg-primary text-card border-2 border-black"
                      : "bg-white border-2 border-black"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-black p-3 rounded-[10px]">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* ============================================================ */}
          {/* INPUT AREA */}
          {/* ============================================================ */}
          <div className="p-3 border-t-2 border-black bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border-2 border-black rounded-[5px] focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-primary text-card p-2 rounded-[5px] border-2 border-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                aria-label="Send message"
              >
                <IoSend size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
