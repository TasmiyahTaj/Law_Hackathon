import React, { useState } from "react";
import ChatSidebar from "../../components/sidebar";
import DeleteConfirmationModal from "../../components/deleteConfirmation";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export default function Chat() {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [chatToDelete, setChatToDelete] = useState(null); // State to track the chat to be deleted
  const [message, setMessage] = useState(""); // For handling chat input
  const [messages, setMessages] = useState([]); // For displaying sent messages in the chat
  const [isSending, setIsSending] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setIsSending(true);
      // Simulate an async message load, e.g., from an API
      setTimeout(() => setIsSending(false), 2000); // 2 seconds delay for the loading state
    }
  }, [messages]);

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      date: "Today",
      message: "Do I tell my parents about bullying?",
      active: false,
    },
    {
      id: 2,
      date: "Yesterday",
      message: "Where do I report Cyber Bullying?",
      active: false,
    },
    {
      id: 3,
      date: "Yesterday",
      message: "Can I stay anonymous and sue for my rights in legal matters?",
      active: false,
    },
    {
      id: 4,
      date: "Last 30 days",
      message: "Someone stole my belonging from my bag",
      active: false,
    },
    {
      id: 5,
      date: "Last 30 days",
      message: "I lost my money during a trip",
      active: false,
    },
  ]);

  const [commonQuestions, setCommonQuestions] = useState([
    {
      id: 1,
      question: "What can I do about workplace discrimination?",
    },
    {
      id: 2,
      question: "How can I report bullying at school?",
    },
    {
      id: 3,
      question: "What are my rights if I face domestic violence?",
    },
  ]);
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [isListening, setIsListening] = useState(false);

  // Speech recognition setup
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setMessage(transcript);
    setIsListening(false);
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEditChat = () => {
    // If there are messages, update the last chat's date to "Today"
    if (messages.length > 0) {
      setChatHistory((prev) => {
        const updatedHistory = [...prev];
        if (updatedHistory.length > 0) {
          updatedHistory[updatedHistory.length - 1].date = "Today"; // Update the last chat's date
        }
        return updatedHistory;
      });

      // Clear the current messages for a new chat
      setMessages([]); // This will allow a new chat to be initiated without placeholder text
    }
  };
  const base_url = process.env.REACT_APP_SERVER_BASE_URL;

  // Send message functionality
  const handleSendMessage = async (inputMessage) => {
    console.log(message);
    const msgToSend = message || inputMessage;

    if (msgToSend.trim()) {
      const userMessage = {
        role: "user",
        parts: [{ text: msgToSend }],
      };
      setMessages((prev) => [...prev, userMessage]); // Add the new message to the current messages

      // When sending the first message, add it to the sidebar history
      if (messages.length === 0) {
        const firstChat = {
          id: chatHistory.length + 1,
          date: "Today", // Classify it under "Today" once the first message is sent
          message: userMessage.parts[0].text, // Use the actual message sent
          active: false,
        };
        setChatHistory((prev) => [firstChat, ...prev]); // Prepend to chat history
      }

      setMessage(""); // Clear the input field
      setIsSending(true);

      try {
        const response = await fetch(`${base_url}/ask-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.parts[0].text,
            messages: messages,
          }),
        });
        if (response.status === 429) {
          // Too many requests
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              parts: [
                {
                  text: "Too many requests have been made. Please wait and try tomorrow.",
                },
              ],
            },
          ]);
        } else if (!response.ok) {
          // Generic error
          throw new Error("Failed to fetch AI response");
        } else {
          const data = await response.json();
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              parts: [{ text: data.reply }],
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching AI response:", error);
      } finally {
        setIsSending(false); // Re-enable button after response
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleDeleteRequest = (chat) => {
    setChatToDelete(chat); // Set the chat that should be deleted when the modal is confirmed
  };

  const handleDelete = () => {
    setChatHistory((prevHistory) =>
      prevHistory.filter((chat) => chat.id !== chatToDelete.id)
    );
    setChatToDelete(null); // Close the modal
  };

  const handleQuestionClick = (question) => {
    handleSendMessage(question);
  };
  return (
    <div className="bg-[#F5F6FA] h-screen flex flex-col">
      {/* Sidebar and Chat Content */}
      <div className="flex-grow flex">
        {/* Sidebar */}
        {isSidebarVisible ? (
          <div className="w-72 mt-2 overflow-hidden transition-all ease-in-out duration-300 fixed left-0 top-0 bottom-0">
            <ChatSidebar
              chatHistory={chatHistory} // Pass chat history to the sidebar
              onClose={() => setSidebarVisible(false)}
              onDeleteRequest={handleDeleteRequest}
              onEdit={handleEditChat} // Pass the delete request handler
            />
          </div>
        ) : (
          <div className="flex items-start justify-start p-4 w-auto h-full transition-all ease-in-out duration-300">
            <div className="flex space-x-4 bg-white rounded-full shadow-md p-2 fixed top-4 left-4">
              {/* Chat Icon */}
              <button
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300"
                onClick={() => setSidebarVisible(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  />
                </svg>
              </button>

              {/* Edit Icon */}
              <button
                onClick={handleEditChat}
                className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-400 transition-all duration-300"
              >
                <img src="/assets/edit.png" alt="edit" className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Content */}
        <div
          className={`flex-grow flex flex-col justify-between transition-all duration-300 ${
            isSidebarVisible ? "ml-80" : "ml-16"
          }`}
        >
          {/* Top-right with Clear button and Avatar */}
          <div className="flex justify-end p-4">
            <button
              className="text-gray-500 bg-gray-200 rounded-full px-3 py-1 hover:bg-gray-300 mr-2"
              onClick={() => setMessages([])}
            >
              Clear
            </button>
            <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-white">
              T
            </div>
          </div>

          {/* Chat Display Section */}
          <div
            className="flex-grow p-4 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 160px)" }}
          >
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className="mb-4 w-full">
                  {/* Check if it's a user message */}
                  {msg.role === "user" && (
                    <div className="flex justify-end mb-2">
                      <div className="bg-blue-500 text-white py-4 px-6 rounded-lg max-w-md">
                        {msg.parts[0].text}
                      </div>
                    </div>
                  )}

                  {/* Check if it's a model message */}
                  {msg.role === "model" && (
                    <div className="flex justify-start mb-2">
                      <div className="mr-2 flex-shrink-0">
                        {/* Person Icon inside a black circle */}
                        <div className="bg-black rounded-full p-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="white"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      </div>

                      <div className="bg-gray-200 text-black py-4 px-6 rounded-lg w-full">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className="w-full"
                          components={{
                            strong: ({ node, ...props }) => (
                              <span
                                className="font-bold text-gray-800"
                                {...props}
                              />
                            ),
                            h1: ({ node, ...props }) => (
                              <h1
                                className="text-4xl font-extrabold mb-6 mt-8 leading-tight text-gray-900 border-b-2 pb-2"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                className="text-3xl font-semibold mb-4 mt-6 text-gray-800"
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p
                                className={`leading-loose text-lg ${
                                  msg.role === "model"
                                    ? "text-gray-700"
                                    : "text-gray-200"
                                } mb-4`}
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-disc list-inside mb-6 pl-8 text-gray-700"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="mb-2 text-lg" {...props} />
                            ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                className="border-l-4 border-blue-400 bg-blue-50 p-4 italic mb-6 text-gray-600 shadow-sm"
                                {...props}
                              />
                            ),
                            code: ({ node, ...props }) => (
                              <code
                                className="bg-gray-100 text-sm p-1 rounded text-red-600"
                                {...props}
                              />
                            ),
                            a: ({ node, ...props }) => (
                              <a
                                className="text-blue-600 hover:underline font-semibold"
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                className="text-2xl font-bold mb-4 mt-6 text-gray-900"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {msg.parts[0].text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="mt-20">
                <p className="text-black text-3xl font-bold text-center">
                  How can I assist you today?
                </p>
                <div className="mt-10 flex flex-col items-center space-y-4">
                  {commonQuestions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => handleQuestionClick(question.question)}
                      className="bg-white text-blue-700 border border-blue-400 p-3 rounded-full hover:border-blue-600 hover:text-blue-600 transition duration-200"
                    >
                      {question.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loader Section */}
            {isSending && (
              <div className="flex justify-center items-center w-full h-full mt-4">
                {/* Loading Spinner */}
                <svg
                  className="animate-spin h-10 w-10 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          <div className="p-4 flex items-center space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message"
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
              disabled={isSending}
            />
            <button
              onClick={handleMicClick}
              className={`p-2 rounded-full ${
                isListening ? "bg-red-500" : "bg-gray-200"
              }`}
              disabled={isSending}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
              >
                <path d="M12 14a3.5 3.5 0 003.5-3.5V5a3.5 3.5 0 00-7 0v5.5A3.5 3.5 0 0012 14zm7-3.5a.75.75 0 00-1.5 0 5.5 5.5 0 01-11 0 .75.75 0 00-1.5 0A7 7 0 0011.25 16v3h-2.25a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-2.25v-3A7 7 0 0019 10.5z" />
              </svg>
            </button>
            <button
              className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600"
              onClick={handleSendMessage}
              disabled={isSending}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Deletion Confirmation */}
      {chatToDelete && (
        <DeleteConfirmationModal
          title={chatToDelete.message} // Pass the message title to the modal
          onCancel={() => setChatToDelete(null)} // Hide modal on cancel
          onDelete={handleDelete} // Confirm deletion
        />
      )}
    </div>
  );
}
