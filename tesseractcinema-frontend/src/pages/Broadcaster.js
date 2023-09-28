import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

async function getAudioStream() {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
}

function Broadcaster() {
    const peerConnection = useRef(new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }));
    const socket = useRef(io('http://localhost:3001'));

    useEffect(() => {
        peerConnection.current.onicecandidate = function(event) {
            if (event.candidate) {
                socket.current.emit('ice-candidate', event.candidate);
            }
        };
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

        socket.current.on('answer', async (answer) => {
            const remoteAnswer = new RTCSessionDescription(answer);
            await peerConnection.current.setRemoteDescription(remoteAnswer);
        });
        
        socket.current.on('new-listener', async (listenerId) => {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            
            socket.current.emit('offer', offer, listenerId);
        });
        
        return () => {
            // if (peerConnection.current) {
            //     peerConnection.current.close();
            // }
            // if (socket.current) {
            //     socket.current.disconnect(true);
            // }
        };
    }, []);
    async function startBroadcasting() {
        try {
            const stream = await getAudioStream();
            stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
            socket.current.emit('start-broadcast');
        } catch (error) {
            console.error("Error starting Broadcast: ", error);
        }
    }

    

    return (
        <div>
            <h1>Broadcaster</h1>
            <button onClick={startBroadcasting}>Start Broadcasting</button>
        </div>
    );
}

export default Broadcaster;
