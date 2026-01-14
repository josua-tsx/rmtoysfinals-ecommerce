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
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full border-2 border-black transition-all duration-300 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] group"
          aria-label="Open chat"
        >
          <IoChatbubbleEllipsesOutline
            size={28}
            className="group-hover:animate-pulse"
          />
        </button>
      )}

      {/* ================================================================== */}
      {/* CHAT WINDOW */}
      {/* ================================================================== */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90%] md:w-[350px] h-[500px] bg-card border-2 border-black rounded-[15px]  flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          {/* ============================================================ */}
          {/* HEADER */}
          {/* ============================================================ */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 flex justify-between items-center border-b-2 border-black">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <IoChatbubbleEllipsesOutline size={20} />
              </div>
              <div>
                <h3 className="font-black tracking-wide text-md uppercase">
                  Jaloy - RM Toys AI
                </h3>
                <p className="text-[10px] opacity-90 font-medium">
                  Assistant Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/20 p-1.5 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* ============================================================ */}
          {/* MESSAGES AREA */}
          {/* ============================================================ */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-black rounded-tr-none"
                      : "bg-white border border-black rounded-tl-none text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-black p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
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
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about toys..."
                className="flex-1 p-3 pr-12 border-2 border-black rounded-[10px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium placeholder:text-gray-400 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-1.5 rounded-[6px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Send message"
              >
                <IoSend size={16} />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
              Powered by Google Gemini AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
