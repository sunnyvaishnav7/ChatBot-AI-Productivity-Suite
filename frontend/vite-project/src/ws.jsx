import React, { useState, useEffect } from 'react';
import './WeglotLanding.css';

const WeglotLanding = () => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const sequence = [
      // Phase 0: Show IMAGINE text (2 seconds)
      { delay: 0, phase: 0 },
      // Phase 1: Start fading IMAGINE, show world map (1 second)
      { delay: 2000, phase: 1 },
      // Phase 2: Clean world map view (1 second)
      { delay: 3000, phase: 2 },
      // Phase 3: Show final content with text and stats (1 second)
      { delay: 4000, phase: 3 },
    ];

    const timers = sequence.map(({ delay, phase }) => 
      setTimeout(() => setAnimationPhase(phase), delay)
    );

    // Animate percentage counter
    const percentageTimer = setTimeout(() => {
      setAnimatedPercentage(450);
    }, 4500);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      clearTimeout(percentageTimer);
    };
  }, []);

  return (
    <div className="landing-container">
      <header className="header">
        <div className="nav-left">
          <h1 className="logo">
            <span className="logo-main">WEGLOT</span>
            <span className="logo-sub">for webflow</span>
          </h1>
        </div>
        <div className="nav-right">
          <div className="language-selector">EN</div>
          <button className="cta-button">Try Weglot for free</button>
        </div>
      </header>

      <main className="main-content">
        {/* IMAGINE Text Animation */}
        <div className={`imagine-text ${animationPhase >= 1 ? 'fade-out' : ''}`}>
          <span className="imagine-letter i">I</span>
          <span className="imagine-letter m">M</span>
          <span className="imagine-letter a">A</span>
          <span className="imagine-letter g">G</span>
          <span className="imagine-letter i2">I</span>
          <span className="imagine-letter n">N</span>
          <span className="imagine-letter e">E</span>
          <div className="imagine-subtitle">
            a multilingual Webflow site,<br />
            without coding
          </div>
          <div className="scroll-indicator">Scroll!</div>
        </div>

        {/* Final Content */}
        <div className={`final-content ${animationPhase >= 3 ? 'show' : ''}`}>
          <div className="content-left">
            <h2 className="main-headline">
              Webflow broke the code barrier on a global scale
            </h2>
            <p className="main-description">
              Webflow sites in Germany have increased by 450% in the last 2 years
            </p>
          </div>
        </div>

        {/* World Map Container */}
        <div className="content-right">
          <div className="world-map-container">
            <div className={`world-map ${animationPhase >= 1 ? 'show' : ''}`}>
              {/* Statistics - only show in final phase */}
              <div className={`percentage-indicator main-stat ${animationPhase >= 3 ? 'show' : ''}`}>
                <div className="percentage-circle">
                  <span className="percentage-text">{animatedPercentage}%</span>
                </div>
                <div className="percentage-line"></div>
              </div>

              {/* World Map SVG */}
              <svg className="world-svg" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                  </linearGradient>
                </defs>
                
                {/* Detailed World Map */}
                {/* North America */}
                <path d="M50 120 Q80 100 120 110 Q160 120 200 140 Q220 160 200 180 Q180 200 140 190 Q100 180 80 160 Q60 140 50 120" 
                      fill="url(#mapGradient)" 
                      opacity="0.6"/>
                
                {/* South America */}
                <path d="M120 240 Q140 220 160 240 Q180 280 170 320 Q160 360 140 380 Q120 360 110 340 Q100 300 110 280 Q120 260 120 240" 
                      fill="url(#mapGradient)" 
                      opacity="0.6"/>
                
                {/* Europe */}
                <path d="M320 120 Q340 110 360 120 Q380 130 390 150 Q380 170 360 180 Q340 175 320 170 Q300 150 320 120" 
                      fill="url(#mapGradient)" 
                      opacity="0.6"/>
                
                {/* Africa */}
                <path d="M320 180 Q340 170 360 180 Q380 200 390 240 Q385 280 370 320 Q350 340 330 350 Q310 340 300 320 Q290 280 295 240 Q300 200 320 180" 
                      fill="url(#mapGradient)" 
                      opacity="0.6"/>
                
                {/* Asia */}
                <path d="M400 100 Q450 90 500 100 Q550 110 600 130 Q650 150 680 170 Q700 190 690 210 Q670 230 640 240 Q600 250 550 240 Q500 230 450 220 Q400 210 380 190 Q370 170 380 150 Q390 130 400 100" 
                      fill="url(#mapGradient)" 
                      opacity="0.6"/>
                
                {/* Australia */}
                <path d="M580 300 Q620 290 660 300 Q680 320 670 340 Q650 350 620 345 Q590 340 580 320 Q575 310 580 300" 
                      fill="url(#mapGradient)" 
                      opacity="0.6"/>
                
                {/* Connection lines */}
                <path d="M100 150 Q250 100 400 150 Q550 200 650 180" 
                      fill="none" 
                      stroke="rgba(255,255,255,0.2)" 
                      strokeWidth="1" 
                      opacity="0.8"/>
                
                <path d="M150 200 Q300 180 450 200 Q600 220 700 200" 
                      fill="none" 
                      stroke="rgba(255,255,255,0.2)" 
                      strokeWidth="1" 
                      opacity="0.6"/>
              </svg>

              {/* Connection dots at bottom */}
              <div className="connection-dots">
                <div className="dot active"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeglotLanding;