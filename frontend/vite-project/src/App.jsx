import { useState } from 'react';
import './App.css';
import ChatInput from './Component/ChatInput';
import ChatResponse from './Component/ChatResponse';
import Navbar from './NavBar';
import { fetchChatResponse } from './Service/api';

function App() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuestionSubmit = async (question) => {
    setLoading(true);
    setError(null);
    try {
      const apiResponse = await fetchChatResponse(question);
      setResponse(apiResponse);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Navbar />
      <header className="bg-primary text-white text-center py-4">
        <h1>Gemini ChatBot</h1>
      </header>
      <ChatInput onSubmit={handleQuestionSubmit} />
      <ChatResponse response={response} loading={loading} error={error} />
    </div>
  );
}

export default App;
