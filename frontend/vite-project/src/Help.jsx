import React from 'react';
import './Help.css';

const Help = () => {
  return (
    <div className="help-container">
      <h1>Help & Guidelines</h1>
      <section className="help-section">
        <h2>About This App</h2>
        <p>
          <strong>AI Chatbot & Productivity App</strong> is your all-in-one assistant for chatting with AI, taking notes, and simulating video calls—all in a sleek, modern dark theme inspired by ChatGPT and Google Meet.
        </p>
      </section>
      <section className="help-section">
        <h2>Features</h2>
        <ul>
          <li><strong>AI Chat:</strong> Ask questions and get instant answers powered by Google Gemini API.</li>
          <li><strong>Notepad:</strong> Take notes, organize your thoughts, and enjoy a fast, smooth writing experience.</li>
          <li><strong>Video Call (UI Demo):</strong> Experience a Google Meet-inspired video call interface (UI only, no real calls).</li>
          <li><strong>Modern Dark Theme:</strong> Consistent, visually appealing design across all pages.</li>
        </ul>
      </section>
      <section className="help-section">
        <h2>How to Use</h2>
        <ol>
          <li><strong>Chat:</strong> Click the <em>Chat</em> tab, type your question, and press Enter. The AI will respond in the chat area.</li>
          <li><strong>Notes:</strong> Click the <em>Notes</em> tab to open the notepad. Your notes are saved locally for your session.</li>
          <li><strong>Video Call:</strong> Click the <em>Video Call</em> tab to see the video call UI. (Webcam preview only, no real calls.)</li>
          <li><strong>Help:</strong> You’re here! Use this page for guidance and info.</li>
        </ol>
      </section>
      <section className="help-section">
        <h2>FAQ</h2>
        <ul>
          <li><strong>Is my data saved?</strong> Notes are saved locally in your browser for your session. Chat history is not persisted after refresh.</li>
          <li><strong>Is the video call real?</strong> No, it’s a UI demo for design and prototyping purposes only.</li>
          <li><strong>Who can use this app?</strong> Anyone looking for a simple, modern AI assistant and productivity tool.</li>
        </ul>
      </section>
      <section className="help-section">
        <h2>Contact & Feedback</h2>
        <p>
          For feedback or support, please contact the developer or open an issue on the project repository.
        </p>
      </section>
    </div>
  );
};

export default Help; 