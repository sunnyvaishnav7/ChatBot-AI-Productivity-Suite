import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';

const initialFakeParticipants = [
  { id: 2, name: 'Alice', isVideoOn: true, isMicOn: true, handRaised: false, connection: 'green' },
  { id: 3, name: 'Bob', isVideoOn: false, isMicOn: false, handRaised: false, connection: 'yellow' },
  { id: 4, name: 'Charlie', isVideoOn: true, isMicOn: false, handRaised: false, connection: 'red' },
];

const VideoCall = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [meetingId] = useState('MEET-123-456');
  const [userName] = useState('You');
  const [participants, setParticipants] = useState(initialFakeParticipants);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [subtitles, setSubtitles] = useState('');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [userHandRaised, setUserHandRaised] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState('none'); // 'none', 'blur', 'image'
  const [connection, setConnection] = useState('green');

  const videoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const canvasRef = useRef(null);

  // Webcam stream and background blur demo
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert('Camera or mic access denied.');
      }
    };
    getMedia();
    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (screenStream) screenStream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, []);

  // Background blur demo (CSS filter)
  useEffect(() => {
    if (backgroundMode === 'blur' && videoRef.current) {
      videoRef.current.style.filter = 'blur(8px)';
    } else if (backgroundMode === 'image' && videoRef.current) {
      videoRef.current.style.background = 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=600&q=80) center/cover';
      videoRef.current.style.filter = 'none';
    } else if (videoRef.current) {
      videoRef.current.style.filter = 'none';
      videoRef.current.style.background = '#23232b';
    }
  }, [backgroundMode]);

  // Toggle video
  const handleToggleVideo = () => {
    setIsVideoOn(v => !v);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
  };

  // Toggle audio
  const handleToggleAudio = () => {
    setIsAudioOn(a => !a);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioOn;
      });
    }
  };

  // Screen share
  const handleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } catch (err) {}
    } else {
      stopScreenShare();
    }
  };
  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  };

  // Recording
  const handleRecord = () => {
    if (!isRecording && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const recorder = new window.MediaRecorder(stream, { mimeType: 'video/webm' });
      setRecordedChunks([]);
      recorder.ondataavailable = e => {
        if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
      };
      recorder.onstop = () => {
        setMediaRecorder(null);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } else if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  const handleDownloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'recording.webm';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Subtitles (mock: random text every 2s if enabled)
  useEffect(() => {
    if (!showSubtitles) return;
    const phrases = [
      'Welcome to the meeting!',
      'Let’s discuss the agenda.',
      'Can you hear me?',
      'I agree with that point.',
      'Let’s take a short break.',
      'Any questions?',
      'Thank you for joining.'
    ];
    let interval;
    if (showSubtitles) {
      interval = setInterval(() => {
        setSubtitles(phrases[Math.floor(Math.random() * phrases.length)]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [showSubtitles]);

  // Remove participant
  const handleRemoveParticipant = id => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  // Mute all
  const handleMuteAll = () => {
    setParticipants(prev => prev.map(p => ({ ...p, isMicOn: false })));
  };

  // Lock room
  const handleLockRoom = () => setIsRoomLocked(l => !l);

  // Raise hand
  const handleRaiseHand = (id = 'self') => {
    if (id === 'self') setUserHandRaised(r => !r);
    else setParticipants(prev => prev.map(p => p.id === id ? { ...p, handRaised: !p.handRaised } : p));
  };

  // Change connection quality (simulate)
  const handleChangeConnection = (id, quality) => {
    if (id === 'self') setConnection(quality);
    else setParticipants(prev => prev.map(p => p.id === id ? { ...p, connection: quality } : p));
  };

  // Helper for status icon
  const StatusIcon = ({ type, on }) => {
    if (type === 'video') return on ? <CameraIconSmall /> : <CameraOffIconSmall />;
    if (type === 'mic') return on ? <MicIconSmall /> : <MicOffIconSmall />;
    return null;
  };
  const ConnectionIcon = ({ quality }) => {
    const color = quality === 'green' ? '#7ee787' : quality === 'yellow' ? '#ffe066' : '#ff5c5c';
    return <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: color, marginRight: 4, border: '1.5px solid #23232b' }} title={`Connection: ${quality}`}></span>;
  };

  // FIX: Add the missing handleEndCall function
  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    window.location.reload();
  };

  // FIX: Add the missing handleToggleSettings function
  const handleToggleSettings = () => setShowSettings(s => !s);

  return (
    <div className="video-call-app fade-in">
      {/* Header */}
      <div className="video-header">
        <div className="meeting-info-header">
          <div className="meeting-title">Meet Call</div>
          <div className="meeting-id">Meeting ID: {meetingId}</div>
        </div>
        <div className="participants-count">
          <UsersIcon />
          <span>{1 + participants.length} participants</span>
          <button className={`lock-btn${isRoomLocked ? ' locked' : ''}`} onClick={handleLockRoom} title={isRoomLocked ? 'Unlock Room' : 'Lock Room'}>
            {isRoomLocked ? <LockIcon /> : <UnlockIcon />}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="video-grid">
        {/* Your video */}
        <div className="video-container">
          {isVideoOn ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="video-stream"
              style={{ background: '#23232b' }}
            />
          ) : (
            <div className="video-placeholder">{userName.charAt(0).toUpperCase()}</div>
          )}
          <div className="video-overlay">
            <div className="participant-name">{userName} (You)</div>
            <div className="status-icons">
              <ConnectionIcon quality={connection} />
              <StatusIcon type="video" on={isVideoOn} />
              <StatusIcon type="mic" on={isAudioOn} />
              {userHandRaised && <HandIcon />}
              {isScreenSharing && <ScreenShareIcon />}
            </div>
            <button className="hand-btn" onClick={() => handleRaiseHand('self')} title={userHandRaised ? 'Lower hand' : 'Raise hand'}>
              <HandIcon />
            </button>
            <div className="background-controls">
              <label>Background: </label>
              <select value={backgroundMode} onChange={e => setBackgroundMode(e.target.value)}>
                <option value="none">None</option>
                <option value="blur">Blur</option>
                <option value="image">Image</option>
              </select>
            </div>
          </div>
          {showSubtitles && <div className="subtitles-bar">{subtitles}</div>}
        </div>
        {/* Fake remote participants */}
        {participants.map(p => (
          <div className="video-container" key={p.id}>
            {p.isVideoOn ? (
              <div className="video-placeholder">{p.name.charAt(0).toUpperCase()}</div>
            ) : (
              <div className="video-placeholder">{p.name.charAt(0).toUpperCase()}</div>
            )}
            <div className="video-overlay">
              <div className="participant-name">{p.name}</div>
              <div className="status-icons">
                <ConnectionIcon quality={p.connection} />
                <StatusIcon type="video" on={p.isVideoOn} />
                <StatusIcon type="mic" on={p.isMicOn} />
                {p.handRaised && <HandIcon />}
              </div>
              <button className="hand-btn" onClick={() => handleRaiseHand(p.id)} title={p.handRaised ? 'Lower hand' : 'Raise hand'}>
                <HandIcon />
              </button>
              <button className="remove-btn" onClick={() => handleRemoveParticipant(p.id)} title="Remove participant">×</button>
              <div className="connection-controls">
                <label>Conn:</label>
                <select value={p.connection} onChange={e => handleChangeConnection(p.id, e.target.value)}>
                  <option value="green">Good</option>
                  <option value="yellow">Fair</option>
                  <option value="red">Poor</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="control-bar">
        <button
          onClick={handleToggleVideo}
          className={`control-btn video-btn ${!isVideoOn ? 'off' : ''}`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? <CameraIcon /> : <CameraOffIcon />}
        </button>
        <button
          onClick={handleToggleAudio}
          className={`control-btn audio-btn ${!isAudioOn ? 'off' : ''}`}
          title={isAudioOn ? 'Mute mic' : 'Unmute mic'}
        >
          {isAudioOn ? <MicIcon /> : <MicOffIcon />}
        </button>
        <button
          className={`control-btn screen-btn ${isScreenSharing ? 'on' : ''}`}
          title={isScreenSharing ? 'Stop sharing' : 'Screen share'}
          onClick={handleScreenShare}
        >
          <MonitorIcon />
        </button>
        <button
          className={`control-btn record-btn ${isRecording ? 'on' : ''}`}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
          onClick={handleRecord}
        >
          <RecordIcon />
        </button>
        {recordedChunks.length > 0 && !isRecording && (
          <button className="control-btn download-btn" onClick={handleDownloadRecording} title="Download Recording">
            <DownloadIcon />
          </button>
        )}
        <button
          className="control-btn subtitle-btn"
          title={showSubtitles ? 'Hide Subtitles' : 'Show Subtitles'}
          onClick={() => setShowSubtitles(s => !s)}
        >
          <SubtitleIcon />
        </button>
        <button
          className="control-btn muteall-btn"
          title="Mute All"
          onClick={handleMuteAll}
        >
          <MuteAllIcon />
        </button>
        <button
          onClick={handleToggleSettings}
          className="control-btn settings-btn"
          title="Settings"
        >
          <SettingsIcon />
        </button>
        <button
          onClick={handleEndCall}
          className="control-btn end-btn"
          title="End call"
        >
          <PhoneOffIcon />
        </button>
      </div>

      {/* Settings Panel */}
      <div className={`settings-panel ${showSettings ? 'open' : ''}`}>
        <div className="settings-header">
          <h3 className="settings-title">Settings</h3>
          <button onClick={handleToggleSettings} className="close-settings">×</button>
        </div>
        <div className="settings-section">
          <h3>Audio & Video</h3>
          <div className="settings-option">
            <span>Camera</span>
            <div 
              className={`toggle-switch ${isVideoOn ? 'active' : ''}`}
              onClick={handleToggleVideo}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          <div className="settings-option">
            <span>Microphone</span>
            <div 
              className={`toggle-switch ${isAudioOn ? 'active' : ''}`}
              onClick={handleToggleAudio}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>
        <div className="settings-section">
          <h3>Meeting Info</h3>
          <div className="settings-option">
            <span>Meeting ID</span>
            <span className="meeting-value">{meetingId}</span>
          </div>
          <div className="settings-option">
            <span>Participants</span>
            <span>{1 + participants.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon components (same as before, or use your existing ones)
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m23 7-7 5 7 5V7z"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const CameraOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06-3.06-3.06"/>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
    <line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const MonitorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
// Small status icons
const CameraIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m23 7-7 5 7 5V7z"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const CameraOffIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06-3.06-3.06"/>
  </svg>
);
const MicIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MicOffIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const ScreenShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <path d="M8 21h8m-4-4v4"/>
  </svg>
);
const HandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 11V5a2 2 0 0 1 4 0v6"/>
    <path d="M11 10V3a2 2 0 0 1 4 0v7"/>
    <path d="M17 11v-1a2 2 0 0 1 4 0v2a7 7 0 0 1-7 7H7a5 5 0 0 1-5-5v-2a2 2 0 0 1 2-2h3"/>
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const UnlockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
);
const RecordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" fill="#ff5c5c" stroke="#ff5c5c"/></svg>
);
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const SubtitleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
);
const MuteAllIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 9v6a3 3 0 0 0 6 0V9"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);

export default VideoCall;