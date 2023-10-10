import React, { useState, useEffect, useRef } from 'react';
import { socket } from './socket';
import { ConnectionState } from './components/ConnectionState';
import { Users } from './components/Users';
import { ConnectionManager } from './components/ConnectionManager';
import { User, PeerConnection } from './util/Interfaces';


export default function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [users, setUsers] = useState<User[]>([]);
  const peerConnections = useRef<{ [id: string]: PeerConnection }>({});

  
  function onICECandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      console.log('new ICE candidate');
      socket.emit('ice-candidate', event.candidate, (event.target as PeerConnection).id);
    }
  }

  async function onNegotiationNeeded(event: Event) {
    const peerConnection = event.target as PeerConnection;
    console.log('negotiation needed for ', peerConnection.id, '');
    if (peerConnections.current[peerConnection.id].hasOutgoingAudio && !(peerConnections.current[peerConnection.id].getSenders().length > 0)) {
      streamAudio(peerConnection.id);
    }

    try {
      const offer = await peerConnections.current[peerConnection.id].createOffer();
      await peerConnections.current[peerConnection.id].setLocalDescription(offer);
      socket.emit('offer', offer, peerConnection.id);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }
  
  function onTrack(event: RTCTrackEvent) {
    const [stream] = event.streams;
    // Assuming you have an <audio> element in your component to play the audio
    const audioElement = document.querySelector('audio');
    if (audioElement) { 
      audioElement.srcObject = stream;
      audioElement.play();
    }
  }

  function onICEConnectionStateChange(event: Event) {
    const peerConnection = event.target as PeerConnection;
    console.log('ICE connection state change:', peerConnection.iceConnectionState);
    switch (peerConnections.current[peerConnection.id].iceConnectionState) {
      case "closed":
      case "failed":
        closePeerConnection(peerConnection.id);
        break;
      default: break;
    }
    setUsers(previous => previous.map((user) => {
      if (user.id === peerConnection.id) {
        user.connectionState = peerConnection.iceConnectionState;
      }
      return user;
    }));
  }

  function onICEGatheringStateChange(event: Event) {
    console.log('ICE gathering state change.');
  }

  function onSignalingStateChange(event: Event) {
    const peerConnection = event.target as PeerConnection;
    console.log('signaling state change:', peerConnection.signalingState);
    switch (peerConnections.current[peerConnection.id].signalingState) {
      case "closed":
        closePeerConnection(peerConnection.id);
        break;
      default: break;
    }
  }
  
  function createPeerConnection(userId: string) {
    console.log('creating peer connection with ', userId);
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    const peerConnection = new RTCPeerConnection(configuration) as PeerConnection;
    peerConnection.id = userId;
    peerConnection.hasOutgoingAudio = false;

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

  function disconnectPeer(userId: string) {
    console.log('disconnecting from ', userId);
    socket.emit('disconnect-peer', userId);
    closePeerConnection(userId);
  }
  
  function closePeerConnection(userId: string) {
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
      
      
      setUsers(previous => previous.map((user) => {
        if (user.id === userId) {
          user.connectionState = 'disconnected';
        }
        return user;
      }));
    }
    
    // remoteVideo.removeAttribute("src");
    // remoteVideo.removeAttribute("srcObject");
    // localVideo.removeAttribute("src");
    // remoteVideo.removeAttribute("srcObject");
  }

  function requestStream(userId: string) {
    console.log('requesting stream from ', userId);
    socket.emit('request-stream', userId);
  }
  
  // TODO
  async function streamAudio(userId: string) {    
    if(!peerConnections.current[userId]) {
      createPeerConnection(userId);
    }
    try {
      peerConnections.current[userId].hasOutgoingAudio = true;
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

  function stopStream(userId: string) {
    console.log('stopping stream to ', userId);
    peerConnections.current[userId].getSenders().forEach((sender) => {
      if(sender.track) sender.track.stop();
    });
    peerConnections.current[userId].hasOutgoingAudio = false;
  }
  
  useEffect(() => {
    function onUpdateUsers(updatedUsers: {_socketId: string; _name: string; }[]) {
      var userIds: string[] = [];
      if(updatedUsers.length > 0) {
        userIds = updatedUsers.map((user: { _socketId: string; }) => user._socketId);
      }
      if(Object.keys(peerConnections.current).length > 0) {
        const disconnectedPeers = Object.keys(peerConnections.current).filter((userId) => !userIds.includes(userId));
        disconnectedPeers.forEach((userId) => {
          closePeerConnection(userId);
        }); 
      }

      setUsers(updatedUsers.map((user) => ({ 
        id: user._socketId,
        name: user._name, 
        connectionState: peerConnections.current[user._socketId] ? peerConnections.current[user._socketId].connectionState : 'no connection' 
      })));
      console.log('updated users: ', updatedUsers);
    }

    function onRequestStream(userId: string) {
      console.log('received stream request from ', userId, '');
      streamAudio(userId);
    }

    function onDisconnectPeer(userId: string) {
      console.log('received disconnect-peer from ', userId);
      closePeerConnection(userId);
    }
    
    // Socket event handlers
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }
    // WebRTC event handlers
    async function onAnswer(answer: any, userId: string) {
      console.log('received answer from ', userId);
      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnections.current[userId].setRemoteDescription(remoteDesc);
    }
    async function onOffer(offer: any, userId: string) {      
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
    async function onIcecandidate(candidate: any, userId: string) {
      console.log('received ice candidate from ', userId);
      try {
        await peerConnections.current[userId].addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding received ice candidate', error);
      }
    }

    socket.on('update-users', onUpdateUsers);
    socket.on('disconnect-peer', onDisconnectPeer);
    socket.on('request-stream', onRequestStream);
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('answer', onAnswer);
    socket.on('offer', onOffer);
    socket.on('ice-candidate', onIcecandidate);

    return () => {
      socket.off('update-users', onUpdateUsers);
      socket.off('disconnect-peer', onDisconnectPeer);
      socket.off('request-stream', onRequestStream);
      
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('answer', onAnswer);
      socket.off('offer', onOffer);
      socket.off('ice-candidate', onIcecandidate);
    };
  }, []);

  return (
    <div className="App">
      <ConnectionState isConnected={ isConnected } />
      <ConnectionManager />
      <Users users={users} peerConnections={peerConnections.current} createOffer={requestStream} disconnectPeer={disconnectPeer} streamAudio={streamAudio} stopStream={stopStream} />
      <audio controls />
    </div>
  );
}