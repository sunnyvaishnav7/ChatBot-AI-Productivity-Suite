import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';
import { motion, AnimatePresence } from 'framer-motion';

const initialFakeParticipants = [
  { id: 2, name: 'Alice', isVideoOn: true, isMicOn: true, handRaised: false, connection: 'green' },
  { id: 3, name: 'Bob',   isVideoOn: false, isMicOn: false, handRaised: false, connection: 'yellow' },
  { id: 4, name: 'Charlie', isVideoOn: true, isMicOn: false, handRaised: false, connection: 'red' },
];

const VideoCall = () => {
  // Pre-meeting state (must be at the top)
  const [meetingStage, setMeetingStage] = useState('pre'); // 'pre' | 'in'
  const [meetingId, setMeetingId] = useState('');
  const [userName, setUserName] = useState('');
  const [preTab, setPreTab] = useState('create'); // 'create' | 'join'
  const [showSharePopup, setShowSharePopup] = useState(false);

  /* ---------- core states ---------- */
  const [isVideoOn, setIsVideoOn]           = useState(true);
  const [isAudioOn, setIsAudioOn]           = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings]     = useState(false);
  const [participants, setParticipants]     = useState(initialFakeParticipants);
  const [isRoomLocked, setIsRoomLocked]     = useState(false);
  const [isRecording, setIsRecording]       = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder]   = useState(null);
  const [subtitles, setSubtitles]           = useState('');
  const [showSubtitles, setShowSubtitles]   = useState(true);
  const [userHandRaised, setUserHandRaised] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState('none'); // none | blur | image
  const [connection, setConnection]         = useState('green');
  const [hasLeftMeeting, setHasLeftMeeting] = useState(false);

  /* ---------- enhancement states ---------- */
  const [chatMessages, setChatMessages]     = useState([]);
  const [chatInput, setChatInput]           = useState('');
  const [showChat, setShowChat]             = useState(false);
  const [showParticipantList, setShowParticipantList] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm]   = useState(false);
  const [isEditingName, setIsEditingName]   = useState(false);
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [viewMode, setViewMode]             = useState('grid');   // grid | list
  const chatPanelRef                        = useRef(null);

  /* ---------- media refs ---------- */
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const [localStream, setLocalStream]   = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  /* ---------- media acquisition ---------- */
  useEffect(() => {
    if (meetingStage !== 'in') return;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        alert('Camera / mic access denied.');
      }
    })();
    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      screenStream?.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line
  }, [meetingStage]);

  /* ---------- background blur / image ---------- */
  useEffect(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    v.style.filter = backgroundMode === 'blur' ? 'blur(8px)' : 'none';
    v.style.background =
      backgroundMode === 'image'
        ? 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=600&q=80) center/cover'
        : '#23232b';
  }, [backgroundMode]);

  /* ---------- toggles ---------- */
  const handleToggleVideo = () => {
    setIsVideoOn(p => !p);
    localStream?.getVideoTracks().forEach(t => (t.enabled = !isVideoOn));
  };
  const handleToggleAudio = () => {
    setIsAudioOn(p => !p);
    localStream?.getAudioTracks().forEach(t => (t.enabled = !isAudioOn));
  };

  /* ---------- screen share ---------- */
  const handleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(s);
        setIsScreenSharing(true);
        if (videoRef.current) videoRef.current.srcObject = s;
        s.getVideoTracks()[0].onended = stopScreenShare;
      } catch {}
    } else stopScreenShare();
  };
  const stopScreenShare = () => {
    screenStream?.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    setIsScreenSharing(false);
    if (videoRef.current && localStream) videoRef.current.srcObject = localStream;
  };

  /* ---------- recording ---------- */
  const handleRecord = () => {
    if (!isRecording && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
      setRecordedChunks([]);
      rec.ondataavailable = e => e.data.size && setRecordedChunks(c => [...c, e.data]);
      rec.onstop = () => setMediaRecorder(null);
      rec.start();
      setMediaRecorder(rec);
      setIsRecording(true);
    } else if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  const handleDownloadRecording = () => {
    if (!recordedChunks.length) return;
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'recording.webm';
    a.click(); URL.revokeObjectURL(url);
  };

  /* ---------- mock subtitles ---------- */
  useEffect(() => {
    if (!showSubtitles) return;
    const phrases = ['Welcome!', 'Let’s discuss…', 'Can you hear me?', 'Any questions?', 'Thank you!'];
    const id = setInterval(() => setSubtitles(phrases[Math.floor(Math.random()*phrases.length)]), 2500);
    return () => clearInterval(id);
  }, [showSubtitles]);

  /* ---------- participant helpers ---------- */
  const handleRemoveParticipant = id =>
    setParticipants(p => p.filter(x => x.id !== id));
  const handleMuteAll = () =>
    setParticipants(p => p.map(x => ({ ...x, isMicOn: false })));
  const handleLockRoom = () => setIsRoomLocked(l => !l);
  const handleRaiseHand = (id='self') => {
    id === 'self'
      ? setUserHandRaised(h => !h)
      : setParticipants(p => p.map(x => x.id===id ? {...x, handRaised:!x.handRaised} : x));
  };
  const handleChangeConnection = (id, q) => {
    id === 'self' ? setConnection(q) :
    setParticipants(p => p.map(x => x.id===id ? {...x, connection:q} : x));
  };

  /* ---------- chat ---------- */
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(m => [...m, { sender: displayName, text: chatInput }]);
    setChatInput('');
  };

  /* ---------- invite / leave ---------- */
  const handleCopyInvite = () => {
    const link = `${window.location.origin}/join/${meetingId}`;
    navigator.clipboard.writeText(link);
    alert('Meeting link copied!');
  };
  const handleEndCallClick = () => setShowEndCallConfirm(true);
  const handleCancelEndCall = () => setShowEndCallConfirm(false);
  const handleConfirmEndCall = () => {
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    // window.location.reload();
    setHasLeftMeeting(true);
  };

  /* ---------- name editing ---------- */
  const handleNameSave = () => setIsEditingName(false);
  const handleSendSubtitle = () => {
    if (customSubtitle.trim()) { setSubtitles(customSubtitle); setCustomSubtitle(''); }
  };

  /* ---------- count for grid columns ---------- */
  const userCount = 1 + participants.length;
  useEffect(() => {
    document.documentElement.style.setProperty('--user-count', userCount);
  }, [userCount]);

  /* ---------- icon components ---------- */
  const CameraIcon      = () => <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m23 7-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
  const CameraOffIcon   = () => <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06-3.06-3.06"/></svg>;
  const MicIcon         = () => <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
  const MicOffIcon      = () => <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
  const MonitorIcon     = () => <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
  const PhoneOffIcon    = () => <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>;
  const UsersIcon       = () => <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  const SettingsIcon    = () => <svg width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
  const HandIcon        = () => <svg width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 11V5a2 2 0 0 1 4 0v6"/><path d="M11 10V3a2 2 0 0 1 4 0v7"/><path d="M17 11v-1a2 2 0 0 1 4 0v2a7 7 0 0 1-7 7H7a5 5 0 0 1-5-5v-2a2 2 0 0 1 2-2h3"/></svg>;
  const LockIcon        = () => <svg width="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
  const UnlockIcon      = () => <svg width="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="17" x2="12" y2="17"/></svg>;

  /* ---------- render ---------- */
  // Helper to generate a random meeting ID
  function generateMeetingId() {
    return 'MEET-' + Math.random().toString(36).substr(2, 3).toUpperCase() + '-' + Math.random().toString(36).substr(2, 3).toUpperCase();
  }

  // Replace create/join logic with backend API calls
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!userName) return;
    try {
      const res = await fetch('http://localhost:8080/api/meetings?name=' + encodeURIComponent(userName), {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to create meeting');
      const data = await res.json();
      setMeetingId(data.id);
      setShowSharePopup(true);
    } catch (err) {
      alert('Error creating meeting: ' + err.message);
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!userName || !meetingId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/meetings/${meetingId}/join?name=${encodeURIComponent(userName)}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Invalid meeting ID or error joining meeting');
      setMeetingStage('in');
    } catch (err) {
      alert(err.message);
    }
  };

  // Pre-meeting screen
  if (meetingStage === 'pre') {
    return (
      <div className="pre-meeting-view">
        <div className="pre-tabs">
          <button className={preTab==='create'?'active':''} onClick={()=>setPreTab('create')}>Create Meeting</button>
          <button className={preTab==='join'?'active':''} onClick={()=>setPreTab('join')}>Join Meeting</button>
        </div>
        {preTab === 'create' ? (
          <form className="pre-form" onSubmit={handleCreateMeeting}>
            <label>Your Name
              <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Enter your name" required />
            </label>
            <button type="submit" disabled={!userName}>Create & Get Link</button>
          </form>
        ) : (
          <form className="pre-form" onSubmit={handleJoinMeeting}>
            <label>Meeting ID
              <input value={meetingId} onChange={e=>setMeetingId(e.target.value)} placeholder="Enter meeting ID" required />
            </label>
            <label>Your Name
              <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Enter your name" required />
            </label>
            <button type="submit" disabled={!userName || !meetingId}>Join Meeting</button>
          </form>
        )}
        {/* Share Link Popup for Create Meeting */}
        <AnimatePresence>
        {showSharePopup && (
          <motion.div
            className="share-link-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <div className="share-link-modal-content">
              <div className="meeting-link-label">Share this meeting link:</div>
              <div className="meeting-link-row">
                <span className="meeting-link">{window.location.origin + '/join/' + meetingId}</span>
                <button className="copy-link-btn" onClick={() => {navigator.clipboard.writeText(window.location.origin + '/join/' + meetingId);}}>Copy Link</button>
              </div>
              <div className="meeting-id-row">
                <span className="meeting-id-label">Meeting ID:</span>
                <span className="meeting-id-value">{meetingId}</span>
                <button className="copy-link-btn" onClick={() => {navigator.clipboard.writeText(meetingId);}}>Copy Meeting ID</button>
              </div>
              <button className="continue-btn" onClick={()=>{setShowSharePopup(false); setMeetingStage('in');}}>Continue to Meeting</button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  }

  if (hasLeftMeeting) {
    return (
      <div className="leave-meeting-view">
        <motion.div
          className="thankyou-anim"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <h1>Thank you for joining the meeting!</h1>
        </motion.div>
        <div className="new-meeting-section">
          <button className="create-meeting-btn" onClick={()=>window.location.reload()}>Create New Meeting</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-call-app ${viewMode}`} aria-label="Video Call Application">
      {/* Header */}
      <header className="video-header">
        <div className="meeting-info-header">
          <div className="meeting-title">Meet Call</div>
          <div className="meeting-id">Meeting ID: {meetingId}</div>
          <button className="copy-btn" onClick={handleCopyInvite}>Copy Invite</button>
        </div>
        <div className="participants-count">
          <UsersIcon />
          <span>{userCount} participants</span>
          <button className={`lock-btn ${isRoomLocked?'locked':''}`} onClick={handleLockRoom} title={isRoomLocked?'Unlock':'Lock'}>
            {isRoomLocked?<LockIcon/>:<UnlockIcon/>}
          </button>
          <button className="control-btn" onClick={()=>setShowParticipantList(s=>!s)} title="Participants">👥</button>
          <button className="control-btn" onClick={()=>setShowChat(s=>!s)} title="Chat">💬</button>
          <button className="control-btn" onClick={()=>setShowSettings(s=>!s)} title="Settings"><SettingsIcon/></button>
        </div>
      </header>

      {/* Participant list */}
      {showParticipantList && (
        <aside className="side-panel left">
          <h3>Participants <button onClick={()=>setShowParticipantList(false)}>×</button></h3>
          <ul>
            <li>{userName} (You) <ConnectionIcon q={connection}/></li>
            {participants.map(p=><li key={p.id}>{p.name} <ConnectionIcon q={p.connection}/></li>)}
          </ul>
        </aside>
      )}

      {/* Video area */}
      <main className={`video-grid ${viewMode}`}>
        {/* own tile */}
        <div className={`tile ${userHandRaised?'hand':''}`}>
          {isVideoOn
            ? <video ref={videoRef} autoPlay muted playsInline className="video-stream"/>
            : <div className="placeholder">{userName[0]}</div>}
          <div className="label">{userName} (You)</div>
          <div className="badges">
            <StatusIcon type="video" on={isVideoOn}/>
            <StatusIcon type="mic"  on={isAudioOn}/>
            {userHandRaised && <HandIcon/>}
          </div>
        </div>

        {/* remote tiles */}
        {participants.map((p,i)=>(
          <div key={p.id} className={`tile ${p.handRaised?'hand':''} ${i===0?'active':''}`}>
            {p.isVideoOn
              ? <video autoPlay playsInline className="video-stream" src={null} /* TODO stream */ />
              : <div className="placeholder">{p.name[0]}</div>}
            <div className="label">{p.name}</div>
            <div className="badges">
              <StatusIcon type="video" on={p.isVideoOn}/>
              <StatusIcon type="mic"  on={p.isMicOn}/>
              {p.handRaised && <HandIcon/>}
              <button className="remove-btn" onClick={()=>handleRemoveParticipant(p.id)}>×</button>
            </div>
          </div>
        ))}
      </main>

      {/* Subtitles */}
      {showSubtitles && subtitles && <div className="subtitles">{subtitles}</div>}

      {/* Controls */}
      <footer className="control-bar">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => console.log('hover started!')}
          onClick={handleToggleVideo}
          className={`ctrl ${!isVideoOn?'off':''}`}
          title="Cam"
        ><CameraIcon/></motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => console.log('hover started!')}
          onClick={handleToggleAudio}
          className={`ctrl ${!isAudioOn?'off':''}`}
          title="Mic"
        ><MicIcon/></motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => console.log('hover started!')}
          onClick={handleScreenShare}
          className={`ctrl ${isScreenSharing?'on':''}`}
          title="Share"
        ><MonitorIcon/></motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => console.log('hover started!')}
          onClick={handleRecord}
          className={`ctrl ${isRecording?'rec':''}`}
          title="Record"
        ><RecordIcon/></motion.button>
        {recordedChunks.length>0 && <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => console.log('hover started!')}
          onClick={handleDownloadRecording}
          title="Download"
        ><DownloadIcon/></motion.button>}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => console.log('hover started!')}
          onClick={handleEndCallClick}
          className="ctrl end"
          title="Leave"
        ><PhoneOffIcon/></motion.button>
      </footer>

      {/* Chat panel */}
      {showChat && (
        <aside className="side-panel right" ref={chatPanelRef}>
          <h3>Chat <button onClick={()=>setShowChat(false)}>×</button></h3>
          <div className="chat-msgs">
            {chatMessages.map((m,i)=><div key={i}><b>{m.sender}:</b> {m.text}</div>)}
          </div>
          <div className="chat-input">
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSendMessage()} placeholder="Message…"/>
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </aside>
      )}

      {/* Settings */}
      {showSettings && (
        <aside className="side-panel right">
          <h3>Settings <button onClick={()=>setShowSettings(false)}>×</button></h3>
          <label><input type="checkbox" checked={isVideoOn} onChange={handleToggleVideo}/> Camera</label>
          <label><input type="checkbox" checked={isAudioOn} onChange={handleToggleAudio}/> Mic</label>
          <label>Background:
            <select value={backgroundMode} onChange={e=>setBackgroundMode(e.target.value)}>
              <option value="none">None</option>
              <option value="blur">Blur</option>
              <option value="image">Image</option>
            </select>
          </label>
          <label>Display name:
            {isEditingName
              ? <><input value={userName} onChange={e=>setUserName(e.target.value)} onBlur={handleNameSave}/></>
              : <span onClick={()=>setIsEditingName(true)}>{userName}</span>}
          </label>
          <button onClick={handleMuteAll}>Mute All</button>
        </aside>
      )}

      {/* End call dialog */}
      {showEndCallConfirm && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="confirm-box">
            <h3>Leave meeting?</h3>
            <button onClick={handleCancelEndCall}>Cancel</button>
            <button onClick={handleConfirmEndCall} className="leave">Leave</button>
          </div>
        </div>
      )}
    </div>
  );

  /* ---------- small helpers ---------- */
  function StatusIcon({type, on}) {
    return type==='video'
      ? (on ? <CameraIcon/> : <CameraOffIcon/>)
      : (on ? <MicIcon/> : <MicOffIcon/>);
  }
  function ConnectionIcon({q}) {
    const color = q==='green'?'#7ee787':q==='yellow'?'#ffe066':'#ff5c5c';
    return <span className="dot" style={{background:color}} title={q}/>;
  }
};

/* ---------- extra mini icons ---------- */
const RecordIcon   = () => <svg width="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#ff5c5c"/></svg>;
const DownloadIcon = () => <svg width="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

export default VideoCall;