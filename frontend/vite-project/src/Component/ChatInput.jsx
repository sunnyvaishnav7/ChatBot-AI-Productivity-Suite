import { useState, useRef, useEffect } from "react";
import "./ChatInput.css";

const ChatInput = ({ onSubmit, disabled = false, placeholder = "Ask me anything..." }) => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    if (question.trim() && !disabled && !isLoading) {
      setIsLoading(true);
      try {
        await onSubmit(question);
        setQuestion("");
      } catch (error) {
        console.error("Error submitting question:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-focus input when not loading
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  return (
    <div className="chat-input-container">
      <div className="chat-input-form">
        <div className="input-group">
          
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className={`chat-input ${disabled ? 'disabled' : ''}`}
              id="question"
              placeholder={placeholder}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled || isLoading}
              maxLength={500}
            />
            <button
              type="button"
              className={`submit-btn ${(!question.trim() || disabled || isLoading) ? 'disabled' : ''}`}
              disabled={!question.trim() || disabled || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <svg className="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <div className="input-footer">
            <span className="input-hint">Press Enter to send, Shift+Enter for new line</span>
            <div className={`character-count ${question.length > 450 ? 'warning' : ''}`}>
              {question.length}/500
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;