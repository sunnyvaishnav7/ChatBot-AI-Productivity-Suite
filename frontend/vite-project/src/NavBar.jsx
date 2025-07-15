import React, { useState } from 'react';
import { MessageCircle, Settings, User, Menu, X, Bot, History, HelpCircle } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <div className="logo-icon">
            <Bot className="bot-icon" />
          </div>
          <span className="logo-text">ChatBot AI</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          <div className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => handleTabClick('chat')}
            >
              <MessageCircle className="nav-icon" />
              <span>Chat</span>
            </button>
          </div>
          
          <div className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => handleTabClick('history')}
            >
              <History className="nav-icon" />
              <span>History</span>
            </button>
          </div>
          
          <div className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => handleTabClick('help')}
            >
              <HelpCircle className="nav-icon" />
              <span>Help</span>
            </button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          <button className="action-btn settings-btn">
            <Settings className="action-icon" />
          </button>
          
          <button className="action-btn profile-btn">
            <User className="action-icon" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu">
          <button 
            className={`mobile-nav-link ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => handleTabClick('chat')}
          >
            <MessageCircle className="mobile-nav-icon" />
            <span>Chat</span>
          </button>
          
          <button 
            className={`mobile-nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabClick('history')}
          >
            <History className="mobile-nav-icon" />
            <span>History</span>
          </button>
          
          <button 
            className={`mobile-nav-link ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => handleTabClick('help')}
          >
            <HelpCircle className="mobile-nav-icon" />
            <span>Help</span>
          </button>
          
          <div className="mobile-menu-divider"></div>
          
          <button className="mobile-nav-link">
            <Settings className="mobile-nav-icon" />
            <span>Settings</span>
          </button>
          
          <button className="mobile-nav-link">
            <User className="mobile-nav-icon" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;