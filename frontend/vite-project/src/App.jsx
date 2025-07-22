import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useParams, useNavigate } from 'react-router-dom';
import { SparklesText } from "./components/magicui/sparkles-text.jsx";
import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from "./components/magicui/globe.jsx";
import { AnimatedBackground } from "./components/magicui/animated-background.jsx";
import './App.css';
import ChatInput from './Component/ChatInput';
import Navbar from './NavBar';
import VideoCall from './VideoCall';
import Notepad from './Notepad';
import Help from './Help';
import Ws from './ws';

const fetchChatResponse = async (question) => {
  try {
    const response = await fetch('http://localhost:8080/api/qna/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.warn('Response is not valid JSON, treating as plain text:', responseText);
      data = { answer: responseText };
    }

    let answerText = '';
    if (typeof data === 'string') {
      answerText = data;
    } else if (data.answer) {
      answerText = data.answer;
    } else if (data.response) {
      answerText = data.response;
    } else if (data.text) {
      answerText = data.text;
    } else {
      answerText = responseText || 'No answer provided.';
    }

    return {
      candidates: [
        {
          content: {
            parts: [
              {
                text: answerText,
              },
            ],
          },
        },
      ],
      usageMetadata: {
        promptTokenCount: 0,
        candidatesTokenCount: answerText.length,
        totalTokenCount: answerText.length,
      },
    };
  } catch (error) {
    console.error('Fetch error details:', error);
    throw new Error(`Failed to fetch chat response: ${error.message}`);
  }
};

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasChatted, setHasChatted] = useState(false);
  const chatContainerRef = useRef(null);

  const handleQuestionSubmit = async (question) => {
    setLoading(true);
    setError(null);
    setHasChatted(true);

    setMessages((prev) => [...prev, { role: 'user', text: question }]);

    try {
      const apiResponse = await fetchChatResponse(question);

      let answerText = '';
      if (apiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
        answerText = apiResponse.candidates[0].content.parts[0].text;
      } else if (apiResponse.answer) {
        answerText = apiResponse.answer;
      } else {
        answerText = 'No answer provided.';
      }

      setMessages((prev) => [...prev, { role: 'bot', text: answerText }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Error: ' + err.message }]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="chat-page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`landing-header ${hasChatted ? 'chat-active' : ''}`}
      >
        { !hasChatted && (
          <div className="globe-container">
            <Globe />
          </div>
        )}
        {!hasChatted && (
          <header className="ok">
            <SparklesText>Gemini ChatBot</SparklesText>
            <p>Ask me anything and I'll help you find answers</p>
          </header>
        )}
      </motion.div>

      <div className={`container chat-scroll-container ${hasChatted ? 'active' : ''}`} ref={chatContainerRef}>
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message-bubble ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="chat-message-bubble bot">Generating response...</div>}
        </div>
      </div>
      <ChatInput onSubmit={handleQuestionSubmit} disabled={loading} />
    </div>
  );
}

function JoinMeetingRedirect() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (meetingId) {
      localStorage.setItem('pendingMeetingId', meetingId);
      navigate('/videocall');
    }
  }, [meetingId, navigate]);
  return null;
}

function App() {
  const location = useLocation();
  return (
    <div className="App">
      <AnimatedBackground />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatPage />
            </motion.div>
          } />
          <Route path="/videocall" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VideoCall />
            </motion.div>
          } />
          <Route path="/join/:meetingId" element={<JoinMeetingRedirect />} />
          <Route path="/notes" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Notepad />
            </motion.div>
          } />
          <Route path="/help" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Help />
            </motion.div>
          } />
          <Route path='/test' element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Ws />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
