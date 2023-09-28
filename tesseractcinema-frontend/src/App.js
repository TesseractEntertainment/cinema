import React, { useState, useEffect, useRef } from 'react';
import { socket } from './socket';
import { ConnectionState } from './components/ConnectionState';
import { Users } from './components/Users';
import { ConnectionManager } from './components/ConnectionManager';
import { Events } from './components/Events';
import { MyForm } from './components/MyForm';

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const peerConnections = useRef({}); // [socketId: string]: RTCPeerConnection

  async function createOffer(userId) {
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    const peerConnection = new RTCPeerConnection(configuration);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('Captured audio stream:', stream);
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream); 
      console.log('Added track:', track)
    });
    
    peerConnection.onicegatheringstatechange = function(event) {
      console.log(peerConnection.iceGatheringState);
    };
    peerConnection.onicecandidate = function(event) {
      if (event.candidate) {
        console.log('new ICE candidate');
        socket.emit('ice-candidate', event.candidate, userId);
      }
    };
    peerConnection.onconnectionstatechange = function(event) {
      console.log(peerConnection.connectionState);
      setUsers(previous => previous.map((user) => ({
        id: user.id,
        connectionState: user.id === userId ? peerConnection.connectionState : user.connectionState
      })));
      if(peerConnection.connectionState === 'disconnected') {
        delete peerConnections.current[userId];
        console.log('deleted peer connection to ', userId);
      }
    }; 
    peerConnection.onsignalingstatechange = (ev) =>{
      console.log('signal to ' + userId + ' ' + peerConnection.signalingState);
      if(peerConnection.signalingState === 'closed') {
        delete peerConnections.current[userId];
        console.log('deleted peer connection to ', userId);
      }
    };

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      peerConnections.current[userId] = peerConnection;
      console.log('sending offer to ', userId);
      socket.emit('offer', offer, userId);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  function disconnectPeer(userId) {
    console.log('disconnecting from ', userId);
    socket.emit('disconnect-peer', userId);
    peerConnections.current[userId].close();
    delete peerConnections.current[userId];
    
    setUsers(previous => previous.map((user) => ({
      id: user.id,
      connectionState: user.id === userId ? 'disconnected' : user.connectionState
    })));
  }

  useEffect(() => {
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
          peerConnections.current[userId].close() // close connections to users that are no longer connected
          delete peerConnections.current[userId]; // filter out users that are no longer connected
        }); 
      }

      setUsers(userIds.map((userId) => ({ 
        id: userId, 
        connectionState: peerConnections.current[userId] ? peerConnections.current[userId].connectionState : 'no connection' 
      }) ));
      console.log('updated users: ', userIds);
    }

    async function onAnswer(answer, userId) {
      console.log('received answer from ', userId);
      console.log(peerConnections.current);
      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnections.current[userId].setRemoteDescription(remoteDesc);
    }

    async function onOffer(offer, userId) {      
      console.log('received offer from ', userId);
      const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnections.current[userId] = peerConnection;

      peerConnection.onicecandidate = function(event) {
        if (event.candidate) {
          console.log('new ICE candidate');
          socket.emit('ice-candidate', event.candidate, userId);
        }
      };
      peerConnection.onconnectionstatechange = function(event) {
        console.log(peerConnection.connectionState);
        setUsers(previous => previous.map((user) => ({
          id: user.id,
          connectionState: user.id === userId ? peerConnection.connectionState : user.connectionState
        })));
        if(peerConnection.connectionState === 'disconnected') {
          delete peerConnections.current[userId];
          console.log('deleted peer connection to ', userId);
        }
      };
      peerConnection.onsignalingstatechange = function(event) {
        console.log(peerConnection.signalingState);
        if(peerConnection.signalingState === 'closed') {
          delete peerConnections.current[userId];
          console.log('deleted peer connection to ', userId);
        }
      };
      peerConnection.ontrack = function(event) {
        const [stream] = event.streams;
        // Assuming you have an <audio> element in your component to play the audio
        const audioElement = document.querySelector('audio');
        audioElement.srcObject = stream;
        audioElement.play();
      };

      peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answer', answer, userId);
    }

    async function onIcecandidate(candidate, userId) {
      try {
          await peerConnections.current[userId].addIceCandidate(candidate);
          console.log('Received and added ICE candidate:', candidate);
      } catch (e) {
          console.error('Error adding received ice candidate', e);
      }
    }

    function onDisconnectPeer(userId) {
      console.log('received disconnect-peer from ', userId);
      peerConnections.current[userId].close();
      delete peerConnections.current[userId];
      setUsers(previous => previous.map((user) => ({
        id: user.id,
        connectionState: user.id === userId ? 'disconnected' : user.connectionState
      })));
    }
  
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);
    socket.on('update-users', onUpdateUsers);

    socket.on('answer', onAnswer);
    socket.on('offer', onOffer);
    socket.on('ice-candidate', onIcecandidate);
    socket.on('disconnect-peer', onDisconnectPeer);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
      socket.off('update-users', onUpdateUsers);
      
      socket.off('answer', onAnswer);
      socket.off('offer', onOffer);
      socket.off('ice-candidate', onIcecandidate);
    };
  }, []);

  return (
    <div className="App">
      <ConnectionState isConnected={ isConnected } />
      <Users users={users} peerConnections={peerConnections.current} createOffer={createOffer} disconnectPeer={disconnectPeer}/>
      <Events events={ fooEvents } />
      <ConnectionManager />
      <MyForm />
      <audio controls />
    </div>
  );
}