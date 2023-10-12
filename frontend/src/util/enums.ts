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