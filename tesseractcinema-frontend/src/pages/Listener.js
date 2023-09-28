import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

function Listener() {
    const peerConnection = useRef(new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }));
    const socket = useRef(io('http://localhost:3001'));

    console.log("Component rendered");
    
    const [broadcasters, setBroadcasters] = useState([]);

    useEffect(() => {
        socket.current.on('update-broadcast-list', (updatedBroadcasters) => {
            setBroadcasters(updatedBroadcasters);
            console.log("Broadcasters updated: ", updatedBroadcasters);
        });

        socket.current.on('offer', async (offer, broadcasterId) => {
            const remoteOffer = new RTCSessionDescription(offer);
            await peerConnection.current.setRemoteDescription(remoteOffer);
            
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            
            socket.current.emit('answer', answer, broadcasterId);
        });

        socket.current.on('ice-candidate', async (iceCandidate) => {
            try {
                while(peerConnection.current.remoteDescription === null) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(iceCandidate));
                console.log('Received and added ICE candidate:', iceCandidate);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        });
        peerConnection.current.onicecandidate = function(event) {
            if (event.candidate) {
                socket.current.emit('ice-candidate', event.candidate);
            }
        };        

        peerConnection.current.ontrack = (event) => {
            const [stream] = event.streams;
            const audioElement = document.querySelector('audio');
            audioElement.srcObject = stream;
            audioElement.play();
        };

        return () => {
            // if (peerConnection.current) {
            //     peerConnection.current.close();
            // }
            // if (socket.current) {
            //     socket.current.disconnect(true);
            //     console.log("Disconnected!");
            // }
        };
    }, []);

    const joinBroadcast = (broadcasterId) => {
        // Notify the server that you want to join a specific broadcast
        socket.current.emit('join-broadcast', broadcasterId);
    };

    return (
        <div>
            <h1>Listener</h1>
            <ul>
                {broadcasters.map(broadcasterId => (
                    <li key={broadcasterId}>
                        {broadcasterId} 
                        <button onClick={() => joinBroadcast(broadcasterId)}>Join</button>
                    </li>
                ))}
            </ul>
            <audio controls />
        </div>
    );
}

export default Listener;
