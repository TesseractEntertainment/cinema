export enum SocketEvents {
    // INCOMING/OUTGOING
    // Signaling
    OFFER = 'offer', // (offer: RTCSessionDescriptionInit, userId: string)
    ANSWER = 'answer', // (answer: RTCSessionDescriptionInit, userId: string)
    ICE_CANDIDATE = 'ice-candidate', // (iceCandidate: RTCIceCandidate, userId: string)
    DISCONNECT_PEER = 'disconnect-peer', // (userId: string)
    // AudioStream
    REQUEST_STREAM = 'request-stream', // (userId: string)
    END_STREAM = 'end-stream', // (userId: string)
    // Broadcast
    JOIN_BROADCAST = 'join-broadcast', // (broadcastId: string)
    LEAVE_BROADCAST = 'leave-broadcast', // (broadcastId: string)
    TERMINATE_BROADCAST = 'terminate-broadcast', // (broadcastId: string)
    CREATE_BROADCAST = 'create-broadcast', // (broadcast: Broadcast)
    UPDATE_BROADCAST = 'update-broadcast', // (broadcast: Broadcast)
    //User
    UPDATE_USER = 'update-user', //(user: User)
    CREATE_USER = 'create-user', //(user: User)
    DELETE_USER = 'delete-user', //(id: string)
    ADD_USER = 'add-user', //(user: User)
    REMOVE_USER = 'remove-user', //(id: string)
    
    // INCOMING
    
    // OUTGOING
    // User
    UPDATE_USERS = 'update-users', // (users: User[])
    // Broadcast
    UPDATE_BROADCASTS = 'update-broadcasts', // (broadcasts: Broadcast[])
}