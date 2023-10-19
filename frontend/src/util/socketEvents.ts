enum Broadcast {
    REQUEST_LISTEN = 'broadcast-request-listen', // (broadcastId: string)
    REQUEST_BROADCAST = 'broadcast-request-broadcast', // (broadcastId: string)
    REQUEST_LEAVE = 'broadcast-request-leave', // (broadcastId: string)
    REQUEST_TERMINATE = 'broadcast-request-terminate', // (broadcastId: string)
    REQUEST_CREATE = 'broadcast-request-create', // (name: string, callback: (id: string, success = true) => void
    REQUEST_UPDATE = 'broadcast-request-update', // (broadcast: Broadcast)

    // Notifications
    LISTENER_JOINED = 'broadcast-listener-joined', // (broadcastId: string, userId: string)
    BROADCASTER_JOINED = 'broadcast-broadcaster-joined', // (broadcastId: string, userId: string)
    LISTENER_LEFT = 'broadcast-listener-left', // (broadcastId: string, userId: string)
    BROADCASTER_LEFT = 'broadcast-broadcaster-left', // (broadcastId: string, userId: string)
    TERMINATED = 'broadcast-terminated', // (broadcastId: string)
    CREATED = 'broadcast-created', // (broadcast: Broadcast)
    UPDATED = 'broadcast-updated', // (broadcast: Broadcast)
    BROADCASTS = 'broadcast-broadcasts', // (broadcasts: Broadcast[])
    // Commands
    LISTEN = 'broadcast-listen', // (broadcastId: string)
    BROADCAST = 'broadcast-broadcast', // (broadcastId: string)
    LEAVE = 'broadcast-leave', // (broadcastId: string)
}

enum User {
    REQUEST_CREATE = 'user-request-create', // (name: string)
    REQUEST_UPDATE = 'user-request-update', // (user: User)
    REQUEST_DELETE = 'user-request-delete', // (id: string)

    // Notifications
    CREATED = 'user-created', // (user: User)
    UPDATED = 'user-updated', // (user: User)
    DELETED = 'user-deleted', // (id: string)
    USERS = 'user-users', // (users: User[])
}

enum Signaling {
    OFFER = 'signaling-offer', // (offer: RTCSessionDescriptionInit, userId: string)
    ANSWER = 'signaling-answer', // (answer: RTCSessionDescriptionInit, userId: string)
    ICE_CANDIDATE = 'signaling-ice-candidate', // (iceCandidate: RTCIceCandidate, userId: string)

    REQUEST_AUDIO = 'signaling-request-audio', // (userId: string)
    REQUEST_STOP_AUDIO = 'signaling-request-stop-audio', // (userId: string)    
    DISCONNECTED = 'signaling-disconnected', // (userId: string)

    // Notifications
    REQUESTED_AUDIO = 'signaling-requested-audio', // (userId: string)
    REQUESTED_STOP_AUDIO = 'signaling-requested-stop-audio', // (userId: string)
    // DISCONNECTED = 'signaling-disconnected', // (userId: string)

    // Commands
    DISCONNECT = 'signaling-disconnect', // (userId: string)
    CONNECT = 'signaling-connect', // (userId: string)
    //REQUEST_STREAM = 'signaling-request-stream', // (userId: string)
    OFFER_AUDIO = 'signaling-offer-audio', // (userId: string)
    STOP_AUDIO = 'signaling-stop-audio', // (userId: string)
}   

/*
* Collection of socket events
* Client makes I statements (JOIN: "I want to join a broadcast")
* Server makes You statements (JOIN: "You shall join a broadcast")
* or notifications (NEW_BROADCAST: "A new broadcast has been created")
* @enum {string}
*/
export const SocketEvents = { Broadcast, User, Signaling };