import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

async function getAudioStream() {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
}

function AudioBroadcast(props) {
    const peerConnection = useRef(new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }));
    const socket = useRef(io('http://localhost:3001')); // Connect to your signaling server

    useEffect(() => {
        
        const currentSocket = socket.current;
        const currentPeerConnection = peerConnection.current; 
        
        currentSocket.connect();

        // Handle ICE Candidate events
        currentPeerConnection.onicecandidate = function(event) {
            if (event.candidate) {
                // Send the ICE Candidate to the signaling server
                console.log('Sent ICE candidate:', event.candidate);
                currentSocket.emit('ice-candidate', event.candidate, (response) => {
                    console.log('Server response:', response);
                });
            }
        };
 
        // When receiving an offer
        currentSocket.on('offer', async (offer) => {
            console.log('offer received');
            const remoteOffer = new RTCSessionDescription(offer);
            await currentPeerConnection.setRemoteDescription(remoteOffer);
            console.log('Received and set answer:', remoteOffer);
            const answer = await currentPeerConnection.createAnswer();
            await currentPeerConnection.setLocalDescription(answer);
            currentSocket.emit('answer', answer);
        });

        // When receiving an answer
        currentSocket.on('answer', async (answer) => {
            console.log('answer received');
            const remoteAnswer = new RTCSessionDescription(answer);
            await currentPeerConnection.setRemoteDescription(remoteAnswer);
        });

        // When receiving an ICE candidate
        currentSocket.on('ice-candidate', async (iceCandidate) => {
            try {
                await currentPeerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
                console.log('Received and added ICE candidate:', iceCandidate);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        });

        currentPeerConnection.ontrack = (event) => {
            console.log('ontrack');
            const [stream] = event.streams;
            // Assuming you have an <audio> element in your component to play the audio
            const audioElement = document.querySelector('audio');
            audioElement.srcObject = stream;
            audioElement.play();
        };

        currentPeerConnection.onerror = (error) => {
            console.error("PeerConnection Error:", error);
        };
        
        currentPeerConnection.onconnectionstatechange = (event) => {
            console.log('Connection state changed:', peerConnection.current.connectionState);
        };

        return () => {
            currentSocket.disconnect();
        };
    }, []);

    async function startBroadcasting() {
        try {
            const stream = await getAudioStream();
            console.log('Captured audio stream:', stream);
            stream.getTracks().forEach(track => {peerConnection.current.addTrack(track, stream); console.log('Added track:', track)});
            
            // Create an offer
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            
            // Send the offer to the signaling server
            socket.current.emit('offer', peerConnection.current.localDescription);
            console.log('Sent offer:', peerConnection.current.localDescription);
        } catch (error) {
            console.warn("Error starting broadcast: ");
            console.error(error);
        }
    }       

    return (
        <div>
            <h1>Audio Broadcast</h1>
            <audio controls />
            <button onClick={startBroadcasting}>Start Broadcasting</button>
            <button onClick={props.switchToSpatialChat}>Switch to Spatial Chat</button>
        </div>
    );
}

export default AudioBroadcast;
