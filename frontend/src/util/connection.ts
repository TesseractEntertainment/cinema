import socket from '../socket';
import { Dispatcher, DispatcherEvents } from './dispatcher';
import { onError } from '../App';
import { updateConnectionState } from './user';
import { SocketEvents } from '../common/socketEvents';
import { sleep } from './functions';

socket.on('connect', onConnect);
socket.on('disconnect', onDisconnect);
socket.connect();

socket.on(SocketEvents.Signaling.DISCONNECTED, onDisconnectPeer);
socket.on(SocketEvents.Signaling.REQUESTED_AUDIO, onRequestStream);
// TODO: implement remaining events
socket.on(SocketEvents.Signaling.ANSWER, onAnswer);
socket.on(SocketEvents.Signaling.OFFER, onOffer);
socket.on(SocketEvents.Signaling.ICE_CANDIDATE, onIcecandidate);
    

function onConnect() {
  console.log('connected to server');
  setConnected(true);
}

function onDisconnect() {
  console.log('disconnected from server');
  setConnected(false);
}

/**
* Emits an event to the server and returns a promise that resolves when the server responds with a success message
* @param {string} event - The event name
* @param {number} timeoutMs - The timeout in milliseconds (0 means no timeout)
* @param {any[]} data - The event data
* @returns {Promise<any>} - A promise that resolves when the server responds with a success message
*/
export function emitEventUnhandled(event: string, timeoutMs: number = 0, ...data: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    socket.timeout(timeoutMs).emit(event, ...data, (err: any, response: any, success: boolean = true) => {
      if (err) {
        reject(err);
      }
      else if (success) {
        resolve(response);
      }
      else {
        reject(response);
      }
    });

    // if (timeoutMs > 0) {
    //   // Timeout logic
    //   setTimeout(() => {
    //       reject("Timeout waiting for acknowledgment");
    //   }, timeoutMs);
    // }
  });
}

export async function emitEvent(event: string, ...data: any[]): Promise<any> {
  try {
    return await emitEventUnhandled(event, 5000, ...data);
  } catch (error) {
    onError(event, error);
  }
}

export async function emitEventWithTimeout(event: string, timeoutMs: number, ...data: any[]): Promise<any> {
  try {
    return await emitEventUnhandled(event, timeoutMs, ...data);
  } catch (error) {
    onError(error);
  }
}


const _peerConnections: Map<string, PeerConnection> = new Map();

export interface PeerConnection extends RTCPeerConnection {
  id: string;
  hasOutgoingAudio: boolean;
  hasIncomingAudio: boolean;
}

/*
* Enum for the different states of a peer connection
* CONNECTED: The peer connection is connected
* DISCONNECTED: The peer connection is disconnected
* CONNECTING: The peer connection is connecting
* FAILED: The peer connection has failed
*/
export enum PeerConnectionState {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  READY = "ready",
  CONNECTING = "connecting",
  FAILED = "failed",
}

/*
* returns the connection state of the socket
* @returns {boolean} - true if the socket is connected, false otherwise
*/
function isConnected() {
    return socket.connected;
}

function setConnected(connected: boolean) {
    Dispatcher.dispatch(DispatcherEvents.SET_CONNECTION_STATE, connected);
}

/*
* returns the peer connections
* @returns {Map<string, PeerConnection>} - the peer connections
*/
function getPeerConnections() {
    return _peerConnections;
}

function onICECandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      console.log('new ICE candidate');
      emitEvent(SocketEvents.Signaling.ICE_CANDIDATE, event.candidate, (event.target as PeerConnection).id);
    }
  }

async function onNegotiationNeeded(event: Event) {
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
      emitEvent(SocketEvents.Signaling.OFFER, offer, peerConnection.id);
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
    updateConnectionState(peerConnection.id, connectionStateToPeerConnectionState(peerConnection.iceConnectionState));
  }

function onICEGatheringStateChange(event: Event) {
  console.log('ICE gathering state change.');
}

function onSignalingStateChange(event: Event) {
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

function createPeerConnection(userId: string) {
  console.log('creating peer connection with ', userId);
  const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
  const peerConnection = new RTCPeerConnection(configuration) as PeerConnection;
  peerConnection.id = userId;
  peerConnection.hasOutgoingAudio = false;
  peerConnection.hasIncomingAudio = false;

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

  updateConnectionState(userId, PeerConnectionState.READY);
}

/*
* Disconects from the peer with the given user id
* Sends a disconnect-peer event to the server
* @param {string} userId - the user id
*/
function disconnectPeer(userId: string) {
  console.log('disconnecting from ', userId);
  closePeerConnection(userId);
  emitEvent(SocketEvents.Signaling.DISCONNECTED, userId);
}

/*
* Closes the peer connection with the given user id
* @param {string} userId - the user id
*/
function closePeerConnection(userId: string) {    
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
    
    updateConnectionState(userId, PeerConnectionState.DISCONNECTED);
  }
  
  // remoteVideo.removeAttribute("src");
  // remoteVideo.removeAttribute("srcObject");
  // localVideo.removeAttribute("src");
  // remoteVideo.removeAttribute("srcObject");
}

function requestStream(userId: string) {
  console.log('requesting stream from ', userId);
  emitEvent(SocketEvents.Signaling.REQUEST_AUDIO, userId);
}

// TODO
async function streamAudio(userId: string) {
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

function stopStream(userId: string) {
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

function onRequestStream(userId: string) {
  console.log('received stream request from ', userId, '');
  streamAudio(userId);
}

function onDisconnectPeer(userId: string) {
  console.log('received disconnect-peer from ', userId);
  closePeerConnection(userId);
}

// WebRTC event handlers
async function onAnswer(answer: any, userId: string) {
  console.log('received answer from ', userId);
  const remoteDesc = new RTCSessionDescription(answer);
  if (!_peerConnections.has(userId)) {
    console.error('No peer connection to set remote description for', userId);
    return;
  }
  await _peerConnections.get(userId)!.setRemoteDescription(remoteDesc);
}

async function onOffer(offer: any, userId: string) {      
  console.log('received offer from ', userId);
  if(!_peerConnections.has(userId)) {
    createPeerConnection(userId);
  }
  const peerConnection = _peerConnections.get(userId);
  const desc = new RTCSessionDescription(offer);
  await peerConnection!.setRemoteDescription(desc);
  const ans = await peerConnection!.createAnswer();
  await peerConnection!.setLocalDescription(ans);
  
  emitEvent(SocketEvents.Signaling.ANSWER, ans, userId);
}

async function onIcecandidate(candidate: any, userId: string) {
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

function connectionStateToPeerConnectionState(connectionState: string) {
  switch (connectionState) {
      case 'completed':
      case 'connected':
          return PeerConnectionState.CONNECTED;
      case 'closed':
      case 'disconnected':
        return PeerConnectionState.DISCONNECTED;
      case 'new':
      case 'checking':
      case 'connecting':
          return PeerConnectionState.CONNECTING;
      case 'failed':
          return PeerConnectionState.FAILED;
      default:
          return PeerConnectionState.DISCONNECTED;
  }
}

export const ConnectionFunctions = { 
  isConnected,
  getPeerConnections,
  createPeerConnection,
  disconnectPeer,
  closePeerConnection,
  requestStream,
  streamAudio,
  stopStream,
  connectionStateToPeerConnectionState,
}; 
export const ConnectionEvents = { 
  onRequestStream,
  onDisconnectPeer,
  onConnect,
  onDisconnect,
  onAnswer,
  onOffer,
  onIcecandidate,
  onICECandidate,
  onNegotiationNeeded,
  onTrack,
  onICEConnectionStateChange,
  onICEGatheringStateChange,
  onSignalingStateChange,
};