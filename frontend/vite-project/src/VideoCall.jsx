/**
 * VideoCall.jsx - Real WebRTC + WebSocket signaling implementation
 *
 * - Connects to ws://localhost:8080/ws/signaling?meetingId=...
 * - Uses RTCPeerConnection for real video/audio between users
 * - Shows real video tiles for all connected peers
 */
import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';
import { motion, AnimatePresence } from 'framer-motion';

const SIGNALING_URL = 'ws://localhost:8080/ws/signaling';

const VideoCall = () => {
  // Pre-meeting state
  const [meetingStage, setMeetingStage] = useState('pre');
  const [meetingId, setMeetingId] = useState('');
  const [userName, setUserName] = useState('');
  const [preTab, setPreTab] = useState('create');
  const [showSharePopup, setShowSharePopup] = useState(false);

  // On mount, check for pendingMeetingId from /join/:meetingId redirect
  useEffect(() => {
    const pending = localStorage.getItem('pendingMeetingId');
    if (pending) {
      setMeetingId(pending);
      setPreTab('join');
      localStorage.removeItem('pendingMeetingId');
    }
  }, []);

  // WebRTC/Signaling state
  const [peers, setPeers] = useState([]); // [{id, stream, videoRef}]
  const [localStream, setLocalStream] = useState(null);
  const [ws, setWs] = useState(null);
  const peerConnections = useRef({}); // id -> RTCPeerConnection
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const localVideoRef = useRef(null);

  // Create or join meeting
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!userName) return;
    // Generate random meeting ID (could use backend API)
    const id = 'MEET-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setMeetingId(id);
    setShowSharePopup(true);
  };
  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!userName || !meetingId) return;
    setMeetingStage('in');
  };

  // Setup local media and signaling when joining
  useEffect(() => {
    if (meetingStage !== 'in') return;
    let wsConn;
    let cleanup = () => {};
    (async () => {
      // 1. Get local media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // 2. Connect to signaling server
      wsConn = new window.WebSocket(`${SIGNALING_URL}?meetingId=${meetingId}`);
      setWs(wsConn);

      // 3. Handle signaling messages
      wsConn.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'offer') {
          // New peer wants to connect
          const pc = createPeerConnection(msg.from);
          await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          wsConn.send(JSON.stringify({ type: 'answer', to: msg.from, answer }));
        } else if (msg.type === 'answer') {
          // Peer answered our offer
          const pc = peerConnections.current[msg.from];
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
        } else if (msg.type === 'ice') {
          // ICE candidate
          const pc = peerConnections.current[msg.from];
          if (pc && msg.candidate) await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        } else if (msg.type === 'join') {
          // New peer joined, we are initiator
          const pc = createPeerConnection(msg.from);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          wsConn.send(JSON.stringify({ type: 'offer', to: msg.from, offer }));
        }
      };

      // 4. Announce self to others
      wsConn.onopen = () => {
        wsConn.send(JSON.stringify({ type: 'join', name: userName }));
      };

      // 5. Cleanup on unmount
      cleanup = () => {
        wsConn.close();
        Object.values(peerConnections.current).forEach(pc => pc.close());
        stream.getTracks().forEach(t => t.stop());
        setPeers([]);
      };
    })();
    return cleanup;
    // eslint-disable-next-line
  }, [meetingStage]);

  // Create a new RTCPeerConnection for a peer
  function createPeerConnection(peerId) {
    if (peerConnections.current[peerId]) return peerConnections.current[peerId];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate && ws) {
        ws.send(JSON.stringify({ type: 'ice', to: peerId, candidate: e.candidate }));
      }
    };
    // Remote stream
    pc.ontrack = (e) => {
      setPeers(prev => {
        if (prev.find(p => p.id === peerId)) return prev;
        return [...prev, { id: peerId, stream: e.streams[0] }];
      });
    };
    peerConnections.current[peerId] = pc;
    return pc;
  }

  // Toggle video/audio
  useEffect(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => (t.enabled = isVideoOn));
  }, [isVideoOn, localStream]);
  useEffect(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => (t.enabled = isAudioOn));
  }, [isAudioOn, localStream]);

  // UI: Pre-meeting
  if (meetingStage === 'pre') {
    return (
      <div className="pre-meeting-view">
        <div className="pre-tabs">
          <button className={preTab==='create'?'active':''} onClick={()=>setPreTab('create')}>Create Meeting</button>
          <button className={preTab==='join'?'active':''} onClick={()=>setPreTab('join')}>Join Meeting</button>
        </div>
        {preTab === 'create' ? (
          <form className="pre-form" onSubmit={handleCreateMeeting}>
            <label htmlFor="create-username">Your Name
              <input id="create-username" name="username" value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Enter your name" required />
            </label>
            <button type="submit" disabled={!userName}>Create & Get Link</button>
          </form>
        ) : (
          <form className="pre-form" onSubmit={handleJoinMeeting}>
            <label htmlFor="join-meeting-id">Meeting ID
              <input id="join-meeting-id" name="meetingId" value={meetingId} onChange={e=>setMeetingId(e.target.value)} placeholder="Enter meeting ID" required />
            </label>
            <label htmlFor="join-username">Your Name
              <input id="join-username" name="username" value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Enter your name" required />
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

  // UI: In meeting
  return (
    <div className="video-call-app" aria-label="Video Call Application">
      <header className="video-header">
        <div className="meeting-info-header">
          <div className="meeting-title">Meet Call</div>
          <div className="meeting-id">Meeting ID: {meetingId}</div>
        </div>
      </header>
      <main className="video-grid">
        {/* Local video */}
        <div className="tile">
          <video ref={localVideoRef} autoPlay muted playsInline className="video-stream" />
          <div className="label">{userName} (You)</div>
        </div>
        {/* Remote peers */}
        {peers.map(peer => (
          <div className="tile" key={peer.id}>
            <VideoPlayer stream={peer.stream} />
            <div className="label">Peer</div>
          </div>
        ))}
      </main>
      <footer className="control-bar">
        <button onClick={()=>setIsVideoOn(v=>!v)} className={`ctrl ${!isVideoOn?'off':''}`}>{isVideoOn ? 'Cam On' : 'Cam Off'}</button>
        <button onClick={()=>setIsAudioOn(a=>!a)} className={`ctrl ${!isAudioOn?'off':''}`}>{isAudioOn ? 'Mic On' : 'Mic Off'}</button>
      </footer>
    </div>
  );
};

function VideoPlayer({ stream }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={ref} autoPlay playsInline className="video-stream" />;
}

export default VideoCall;