import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ChatInput from './Component/ChatInput';
import Navbar from './NavBar';
import VideoCall from './VideoCall';
import Notepad from './Notepad';
import Help from './Help';

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
    <>
      <br /><br /><br /><br /><br />
      {!hasChatted && (
        <header className="ok">
          <h1>Gemini ChatBot</h1>
          <p>Ask me anything and I'll help you find answers</p>
        </header>
      )}

      <div className="container chat-scroll-container" ref={chatContainerRef}>
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message-bubble ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="chat-message-bubble bot">Generating response...</div>}
        </div>

        <ChatInput onSubmit={handleQuestionSubmit} disabled={loading} />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/videocall" element={<VideoCall />} />
          <Route path="/notes" element={<Notepad />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
