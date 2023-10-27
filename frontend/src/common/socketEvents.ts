/* Callbacks are used to pass data from the server to the client
* @callback SocketCallback
* @param {any} data - The data or error
* @param {boolean} success = true - Whether the request was successful
*/

enum Broadcast {
    // Requests
    REQUEST_LISTEN = 'broadcast-request-listen', // (broadcastId: string)
    REQUEST_BROADCAST = 'broadcast-request-broadcast', // (broadcastId: string)
    REQUEST_LEAVE = 'broadcast-request-leave', // (broadcastId: string)
    REQUEST_TERMINATE = 'broadcast-request-terminate', // (broadcastId: string)
    REQUEST_CREATE = 'broadcast-request-create', // (name: string, callback: (id: string, success = true) => void
    REQUEST_UPDATE = 'broadcast-request-update', // (broadcast: Broadcast)
    GET_BROADCASTS = 'broadcast-get-broadcasts', // (callback: (broadcasts: Broadcast[]) => void)
    GET_BROADCAST = 'broadcast-get-broadcast', // (broadcastId: string, callback: (broadcast: Broadcast) => void)
    REQUEST_BROADCASTS = 'broadcast-request-broadcasts', // ()

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
    REQUEST_USERS = 'user-request-users', // ()
    GET_USERS = 'user-get-users', // (callback: (users: User[]) => void)
    GET_USER = 'user-get-user', // (id: string, callback: (user: User) => void)

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
    /**
     * Requests the user to send an audio stream
     * @param {string} userId - The user to request audio from
     */
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

enum Util {
    ERROR = 'util-error', // (error: string)
}

/*
* Collection of socket events
* Client makes I statements (JOIN: "I want to join a broadcast")
* Server makes You statements (JOIN: "You shall join a broadcast")
* or notifications (NEW_BROADCAST: "A new broadcast has been created")
* @enum {string}
*/
export const SocketEvents = { Broadcast, User, Signaling, Util };