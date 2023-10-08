import React, { useState, useEffect, useRef } from 'react';
import { socket } from './socket';
import { ConnectionState } from './components/ConnectionState';
import { Users } from './components/Users';
import { ConnectionManager } from './components/ConnectionManager';

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [users, setUsers] = useState([]);
  const peerConnections = useRef({}); // [socketId: string]: RTCPeerConnection
  
  function onICECandidate(event) {
    if (event.candidate) {
      console.log('new ICE candidate');
      socket.emit('ice-candidate', event.candidate, event.target.id);
    }
  }

  async function onNegotiationNeeded(event) {
    console.log('negotiation needed for ', event.target.id, '');
    if (peerConnections.current[event.target.id].streamTo && !peerConnections.current[event.target.id].getSenders().length > 0) {
      streamAudio(event.target.id);
    }

    try {
      const offer = await peerConnections.current[event.target.id].createOffer();
      await peerConnections.current[event.target.id].setLocalDescription(offer);
      socket.emit('offer', offer, event.target.id);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }
  
  function onTrack(event) {
    const [stream] = event.streams;
    // Assuming you have an <audio> element in your component to play the audio
    const audioElement = document.querySelector('audio');
    audioElement.srcObject = stream;
    audioElement.play();
  }

  function onICEConnectionStateChange(event) {
    console.log('ICE connection state change:', event.target.iceConnectionState);
    switch (peerConnections.current[event.target.id].iceConnectionState) {
      case "closed":
      case "failed":
        closePeerConnection(event.target.id);
        break;
      default: break;
    }
    setUsers(previous => previous.map((user) => ({
      id: user.id,
      connectionState: user.id === event.target.id ? event.target.iceConnectionState : user.connectionState
    })));
  }

  function onICEGatheringStateChange(event) {
    console.log('ICE gathering state change:', event.target.iceGatheringState);
  }

  function onSignalingStateChange(event) {
    console.log('signaling state change:', event.target.signalingState);
    switch (peerConnections.current[event.target.id].signalingState) {
      case "closed":
        closePeerConnection(event.target.id);
        break;
      default: break;
    }
  }
  
  function createPeerConnection(userId) {
    console.log('creating peer connection with ', userId);
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    const peerConnection = new RTCPeerConnection(configuration);
    // Add extra properties to the peer connection
    peerConnection.id = userId;
    peerConnection.streamTo = false;

    if (peerConnections.current[userId]) {
      closePeerConnection(userId);
    }
    peerConnections.current[userId] = peerConnection;
    
    // Add event handlers to the newly created peer connection
    peerConnection.onicecandidate = onICECandidate;
    peerConnection.onnegotiationneeded = onNegotiationNeeded;
    peerConnection.ontrack = onTrack;
    peerConnection.oniceconnectionstatechange = onICEConnectionStateChange;
    peerConnection.onicegatheringstatechange = onICEGatheringStateChange;
    peerConnection.onsignalingstatechange = onSignalingStateChange;
  }

  function disconnectPeer(userId) {
    console.log('disconnecting from ', userId);
    socket.emit('disconnect-peer', userId);
    closePeerConnection(userId);
  }
  
  function closePeerConnection(userId) {
    const peerConnection = peerConnections.current[userId];
    // const remoteVideo = document.getElementById("received_video");
    // const localVideo = document.getElementById("local_video");
  
    if (peerConnection) {
      peerConnection.onicecandidate = null;
      peerConnection.onnegotiationneeded = null;
      peerConnection.ontrack = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.onicegatheringstatechange = null;
      peerConnection.onsignalingstatechange = null;

      // TODO: close media streams
      // if (remoteVideo.srcObject) {
      //   remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
      // }
      
      // if (localVideo.srcObject) {
        //   localVideo.srcObject.getTracks().forEach((track) => track.stop());
      // }
      stopStream(userId);
      peerConnection.close();
      delete peerConnections.current[userId];
      
      setUsers(previous => previous.map((user) => ({
        id: user.id,
        connectionState: user.id === userId ? 'disconnected' : user.connectionState
      })));
    }
    
    // remoteVideo.removeAttribute("src");
    // remoteVideo.removeAttribute("srcObject");
    // localVideo.removeAttribute("src");
    // remoteVideo.removeAttribute("srcObject");
  }

  function requestStream(userId) {
    console.log('requesting stream from ', userId);
    socket.emit('request-stream', userId);
  }
  
  // TODO
  async function streamAudio(userId) {    
    if(!peerConnections.current[userId]) {
      createPeerConnection(userId);
    }
    try {
      peerConnections.current[userId].streamTo = true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Captured audio stream:', stream);
      stream.getTracks().forEach(track => {
        peerConnections.current[userId].addTrack(track, stream); 
        console.log('Added track:', track)
      });
    }
    catch (error) {
      console.error('Error streaming audio to', userId, error);
      disconnectPeer(userId);
    }
  }

  function stopStream(userId) {
    console.log('stopping stream to ', userId);
    peerConnections.current[userId].getSenders().forEach((sender) => {
      if(sender.track) sender.track.stop();
    });
    peerConnections.current[userId].streamTo = false;
  }
  
  useEffect(() => {
    // Socket event handlers
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      setFooEvents(previous => [...previous, value]);
    }

    function onUpdateUsers(userIds) {
      if(Object.keys(peerConnections.current).length > 0) {
        const disconnectedPeers = Object.keys(peerConnections.current).filter((userId) => !userIds.includes(userId));
        disconnectedPeers.forEach((userId) => {
          closePeerConnection(userId);
        }); 
      }

      setUsers(userIds.map((userId) => ({ 
        id: userId, 
        connectionState: peerConnections.current[userId] ? peerConnections.current[userId].connectionState : 'no connection' 
      }) ));
      console.log('updated users: ', userIds);
    }

    // WebRTC event handlers
    async function onAnswer(answer, userId) {
      console.log('received answer from ', userId);
      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnections.current[userId].setRemoteDescription(remoteDesc);
    }

    async function onOffer(offer, userId) {      
      console.log('received offer from ', userId);
      if(!peerConnections.current[userId]) {
        createPeerConnection(userId);
      }
      const desc = new RTCSessionDescription(offer);
      await peerConnections.current[userId].setRemoteDescription(desc);
      const ans = await peerConnections.current[userId].createAnswer();
      await peerConnections.current[userId].setLocalDescription(ans);
      
      socket.emit('answer', ans, userId);
    }

    async function onIcecandidate(candidate, userId) {
      console.log('received ice candidate from ', userId);
      try {
        await peerConnections.current[userId].addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding received ice candidate', error);
      }
    }
    
    function onDisconnectPeer(userId) {
      console.log('received disconnect-peer from ', userId);
      closePeerConnection(userId);
    }

    function onRequestStream(userId) {
      console.log('received stream request from ', userId, '');
      streamAudio(userId);
    }
  
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);
    socket.on('update-users', onUpdateUsers);

    socket.on('answer', onAnswer);
    socket.on('offer', onOffer);
    socket.on('ice-candidate', onIcecandidate);
    socket.on('disconnect-peer', onDisconnectPeer);
    socket.on('request-stream', onRequestStream);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
      socket.off('update-users', onUpdateUsers);

      socket.off('answer', onAnswer);
      socket.off('offer', onOffer);
      socket.off('ice-candidate', onIcecandidate);
      socket.off('disconnect-peer', onDisconnectPeer);
      socket.off('request-stream', onRequestStream);
    };
  }, []);

  return (
    <div className="App">
      <ConnectionState isConnected={ isConnected } />
      <Users users={users} peerConnections={peerConnections.current} createOffer={requestStream} disconnectPeer={disconnectPeer} streamAudio={streamAudio} stopStream={stopStream} />
      <ConnectionManager />
      <audio controls />
    </div>
  );
}