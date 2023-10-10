import { io } from 'socket.io-client';
import { PeerConnection } from './interfaces';
import { updateConnectionState } from './users';
import { Dispatcher, DispatcherEvent } from './dispatcher';

// "undefined" means the URL will be computed from the `window.location` object
const URL: any = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';
/*
* The socket object that is used to connect to the server.
*/
export const socket = io(URL);

var _isConnected: boolean = false;
const _peerConnections: Map<string, PeerConnection> = new Map();

/*
* returns the connection state of the socket
* @returns {boolean} - true if the socket is connected, false otherwise
*/
export function isConnected() {
    return _isConnected;
}

function setConnected(connected: boolean) {
    _isConnected = connected;
    Dispatcher.dispatch(DispatcherEvent.SET_CONNECTION_STATE, connected);
}

/*
* returns the peer connections
* @returns {Map<string, PeerConnection>} - the peer connections
*/
export function getPeerConnections() {
    return _peerConnections;
}

export function onICECandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      console.log('new ICE candidate');
      socket.emit('ice-candidate', event.candidate, (event.target as PeerConnection).id);
    }
  }

export async function onNegotiationNeeded(event: Event) {
    const peerConnection = event.target as PeerConnection;
    console.log('negotiation needed for ', peerConnection.id, '');
    if (!_peerConnections.has(peerConnection.id)) {
      _peerConnections.set(peerConnection.id, peerConnection);
    }
    if (_peerConnections.get(peerConnection.id)!.hasOutgoingAudio && !(_peerConnections.get(peerConnection.id)!.getSenders().length > 0)) {
      streamAudio(peerConnection.id);
    }

    try {
      const offer = await _peerConnections.get(peerConnection.id)!.createOffer();
      await _peerConnections.get(peerConnection.id)!.setLocalDescription(offer);
      socket.emit('offer', offer, peerConnection.id);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }
  
export function onTrack(event: RTCTrackEvent) {
    const [stream] = event.streams;
    // Assuming you have an <audio> element in your component to play the audio
    const audioElement = document.querySelector('audio');
    if (audioElement) { 
      audioElement.srcObject = stream;
      audioElement.play();
    }
  }

export function onICEConnectionStateChange(event: Event) {
    const peerConnection = event.target as PeerConnection;
    console.log('ICE connection state change:', peerConnection.iceConnectionState);    
    if (!_peerConnections.has(peerConnection.id)) {
      _peerConnections.set(peerConnection.id, peerConnection);
    }
    switch (_peerConnections.get(peerConnection.id)!.iceConnectionState) {
      case "closed":
      case "failed":
        closePeerConnection(peerConnection.id);
        break;
      default: break;
    }
    updateConnectionState(peerConnection.id, peerConnection.iceConnectionState);
  }

export function onICEGatheringStateChange(event: Event) {
  console.log('ICE gathering state change.');
}

export function onSignalingStateChange(event: Event) {
  const peerConnection = event.target as PeerConnection;
  console.log('signaling state change:', peerConnection.signalingState);    
  if (!_peerConnections.has(peerConnection.id)) {
    _peerConnections.set(peerConnection.id, peerConnection);
  }
  switch (_peerConnections.get(peerConnection.id)!.signalingState) {
    case "closed":
      closePeerConnection(peerConnection.id);
      break;
    default: break;
  }
}

export function createPeerConnection(userId: string) {
  console.log('creating peer connection with ', userId);
  const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
  const peerConnection = new RTCPeerConnection(configuration) as PeerConnection;
  peerConnection.id = userId;
  peerConnection.hasOutgoingAudio = false;

  if (_peerConnections.has(userId)) {
    closePeerConnection(userId);
  }
  _peerConnections.set(userId, peerConnection);
  
  // Add event handlers to the newly created peer connection
  peerConnection.onicecandidate = onICECandidate;
  peerConnection.onnegotiationneeded = onNegotiationNeeded;
  peerConnection.ontrack = onTrack;
  peerConnection.oniceconnectionstatechange = onICEConnectionStateChange;
  peerConnection.onicegatheringstatechange = onICEGatheringStateChange;
  peerConnection.onsignalingstatechange = onSignalingStateChange;
}

/*
* Disconects from the peer with the given user id
* Sends a disconnect-peer event to the server
* @param {string} userId - the user id
*/
export function disconnectPeer(userId: string) {
  console.log('disconnecting from ', userId);
  socket.emit('disconnect-peer', userId);
  closePeerConnection(userId);
}

/*
* Closes the peer connection with the given user id
* @param {string} userId - the user id
*/
export function closePeerConnection(userId: string) {    
  if (!_peerConnections.has(userId)) {
    console.error('No peer connection to close for', userId);
    return;
  }
  const peerConnection = _peerConnections.get(userId);
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
    _peerConnections.delete(userId);
    
    updateConnectionState(userId, 'disconnected');
  }
  
  // remoteVideo.removeAttribute("src");
  // remoteVideo.removeAttribute("srcObject");
  // localVideo.removeAttribute("src");
  // remoteVideo.removeAttribute("srcObject");
}

export function requestStream(userId: string) {
  console.log('requesting stream from ', userId);
  socket.emit('request-stream', userId);
}

// TODO
export async function streamAudio(userId: string) {
  if(!_peerConnections.has(userId)) {
    createPeerConnection(userId);
  }
  try {
    _peerConnections.get(userId)!.hasOutgoingAudio = true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('Captured audio stream:', stream);
    stream.getTracks().forEach(track => {
      _peerConnections.get(userId)!.addTrack(track, stream); 
      console.log('Added track:', track)
    });
  }
  catch (error) {
    console.error('Error streaming audio to', userId, error);
    disconnectPeer(userId);
  }
}

export function stopStream(userId: string) {
  console.log('stopping stream to ', userId);      
  if (!_peerConnections.has(userId)) {
    console.error('No peer connection to stop stream to for', userId);
    return;
  }
  _peerConnections.get(userId)!.getSenders().forEach((sender) => {
    if(sender.track) sender.track.stop();
  });
  _peerConnections.get(userId)!.hasOutgoingAudio = false;
}

export function onRequestStream(userId: string) {
  console.log('received stream request from ', userId, '');
  streamAudio(userId);
}

export function onDisconnectPeer(userId: string) {
  console.log('received disconnect-peer from ', userId);
  closePeerConnection(userId);
}

// Socket event handlers
export function onConnect() {
  setConnected(true);
}

export function onDisconnect() {
  setConnected(false);
}

// WebRTC event handlers
export async function onAnswer(answer: any, userId: string) {
  console.log('received answer from ', userId);
  const remoteDesc = new RTCSessionDescription(answer);
  if (!_peerConnections.has(userId)) {
    console.error('No peer connection to set remote description for', userId);
    return;
  }
  await _peerConnections.get(userId)!.setRemoteDescription(remoteDesc);
}
export async function onOffer(offer: any, userId: string) {      
  console.log('received offer from ', userId);
  if(!_peerConnections.has(userId)) {
    createPeerConnection(userId);
  }
  const peerConnection = _peerConnections.get(userId);
  const desc = new RTCSessionDescription(offer);
  await peerConnection!.setRemoteDescription(desc);
  const ans = await peerConnection!.createAnswer();
  await peerConnection!.setLocalDescription(ans);
  
  socket.emit('answer', ans, userId);
}
export async function onIcecandidate(candidate: any, userId: string) {
  console.log('received ice candidate from ', userId);
  if(!_peerConnections.has(userId)) {
    console.error('No peer connection to add ice candidate for', userId);
    return;
  }
  const peerConnection = _peerConnections.get(userId);
  try {
    await peerConnection!.addIceCandidate(candidate);
  } catch (error) {
    console.error('Error adding received ice candidate', error);
  }
}