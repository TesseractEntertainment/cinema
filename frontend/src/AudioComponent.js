// src/AudioComponent.js

import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

function AudioComponent() {
    const [audioStream, setAudioStream] = useState(null);
    const audioRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);

    useEffect(() => {
        socketRef.current = io.connect('http://localhost:3001');

        socketRef.current.on('offer', async (offer) => {
            const remoteOffer = new RTCSessionDescription(offer);
            await peerConnectionRef.current.setRemoteDescription(remoteOffer);
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socketRef.current.emit('answer', answer);
        });

        socketRef.current.on('answer', (answer) => {
            const remoteAnswer = new RTCSessionDescription(answer);
            peerConnectionRef.current.setRemoteDescription(remoteAnswer);
        });

        socketRef.current.on('ice-candidate', (iceCandidate) => {
            peerConnectionRef.current.addIceCandidate(iceCandidate);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const startAudioCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);

            peerConnectionRef.current = new RTCPeerConnection();

            stream.getTracks().forEach(track => {
                peerConnectionRef.current.addTrack(track, stream);
            });

            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current.emit('ice-candidate', event.candidate);
                }
            };

            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socketRef.current.emit('offer', offer);
        } catch (error) {
            console.error("Error capturing audio:", error);
        }
    };

    useEffect(() => {
        if (audioStream && audioRef.current) {
            audioRef.current.srcObject = audioStream;
        }
    }, [audioStream]);

    return (
        <div>
            <h2>Audio Component</h2>
            <audio ref={audioRef} controls autoPlay></audio>
            <button onClick={startAudioCapture}>Start Audio Capture</button>
        </div>
    );
}

export default AudioComponent;
