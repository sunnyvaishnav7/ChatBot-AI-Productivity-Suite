import React from 'react';
import './Help.css';

const Help = () => {
  return (
    <div className="help-container">
      <h1>Help & User Guide</h1>
      <section className="help-section">
        <h2>About This Application</h2>
        <p>
          <strong>ChatBot AI & Productivity Suite</strong> is your all-in-one assistant for chatting with AI, taking and organizing meeting notes, and simulating video calls—all in a beautiful, modern dark theme inspired by Google Meet and ChatGPT.
        </p>
      </section>
      <section className="help-section">
        <h2>Key Features</h2>
        <ul>
          <li><strong>AI Chat:</strong> Ask questions and get instant, intelligent answers powered by a backend AI API. The chat interface is fast, responsive, and supports keyboard shortcuts (Enter to send, Shift+Enter for new line).</li>
          <li><strong>Meeting Notes:</strong> Create, edit, and organize notes for your meetings. Features include auto spellcheck, auto-correct for common typos, image uploads, search, export, and print. Notes are saved locally in your browser for privacy.</li>
          <li><strong>Video Call (UI Demo):</strong> Experience a Google Meet-inspired video call interface. Features include participant grid, video/mic toggles, screen sharing, chat, hand raise, meeting lock, recording (UI), and more. (No real video/audio calls, UI demo only.)</li>
          <li><strong>Modern UI & Animations:</strong> Enjoy a visually appealing, fully responsive design with animated backgrounds, a 3D globe on the landing page, and sparkling animated headings.</li>
          <li><strong>Navigation:</strong> Use the top navigation bar to switch between Chat, Meeting Notes, Video Call, and Help sections. The app is fully responsive and works great on desktop and mobile.</li>
        </ul>
      </section>
      <section className="help-section">
        <h2>How to Use</h2>
        <ol>
          <li><strong>Chat:</strong> Click the <em>Chat</em> tab, type your question, and press Enter. The AI will respond instantly. Use Shift+Enter for a new line.</li>
          <li><strong>Meeting Notes:</strong> Click the <em>Notes</em> tab to open the notepad. Create new notes, search, upload images, and export or print your notes. All notes are private and stored in your browser.</li>
          <li><strong>Video Call:</strong> Click the <em>Video Call</em> tab to see the video call UI. You can simulate joining/creating meetings, manage participants, chat, and try out all the controls. (No real calls, UI demo only.)</li>
          <li><strong>Help:</strong> You’re here! Use this page for guidance and info about all features.</li>
        </ol>
      </section>
      <section className="help-section">
        <h2>FAQ</h2>
        <ul>
          <li><strong>Are my notes and chat history saved?</strong> Notes are saved locally in your browser. Chat history is not persisted after refresh for privacy.</li>
          <li><strong>Is the video call real?</strong> No, it’s a UI demo for design and prototyping purposes only. No real video/audio is transmitted.</li>
          <li><strong>Can I use this on mobile?</strong> Yes! The app is fully responsive and works great on all devices.</li>
          <li><strong>How do I report bugs or give feedback?</strong> Please contact the developer or open an issue on the project repository.</li>
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