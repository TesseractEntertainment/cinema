export interface User {
    id: string;
    name: string;
    connectionState: string;
}

export interface PeerConnection extends RTCPeerConnection {
    id: string;
    hasOutgoingAudio: boolean;
}

export interface Broadcast {
    roomId: string;
    broadcasters: User[];
    listeners: User[];
    name: string;
}