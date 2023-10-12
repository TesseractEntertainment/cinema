import { PeerConnectionState } from "./enums";

export interface User {
    id: string;
    name: string;
    connectionState: PeerConnectionState;
}

export interface PeerConnection extends RTCPeerConnection {
    id: string;
    hasOutgoingAudio: boolean;
    hasIncomingAudio: boolean;
}

export interface Broadcast {
    roomId: string;
    broadcasters: User[];
    listeners: User[];
    name: string;
}