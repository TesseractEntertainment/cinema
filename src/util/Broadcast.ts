import { v4 as uuidv4 } from 'uuid';
import { UserFunctions } from './user';
import { io } from './io';
import { SocketEvents } from './socketEvents';

const broadcasts: Map<string, Broadcast> = new Map();

export class Broadcast {
    private _id: string;
    private _broadcasterIds: string[];
    private _listenerIds: string[];
    private _name: string;

    constructor(name?: string) {
        this._id = uuidv4();
        this._broadcasterIds = [];
        this._listenerIds = [];
        this._name = name ? name : this._id;
    }

    get id(): string {
        return this._id;
    }

    get broadcasters(): string[] {
        return this._broadcasterIds;
    }

    get listeners(): string[] {
        return this._listenerIds;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    joinAsBroadcaster(userId: string): boolean {
        this._broadcasterIds.push(userId);
        const user = UserFunctions.getUser(userId);
        if (!user) {
            return false;
        }
        user.getSocket()?.join(this._id);
        return true;
    }

    joinAsListener(userId: string): boolean {
        this._listenerIds.push(userId);
        const user = UserFunctions.getUser(userId);
        if (!user) {
            return false;
        }
        user.getSocket()?.join(this._id);
        return true;
    }

    leave(userId: string): boolean {
        const user = UserFunctions.getUser(userId);
        if (!user) {
            return false;
        }
        user.getSocket()?.leave(this._id);
        if( this._broadcasterIds.includes(userId) ) {
            this._broadcasterIds = this._broadcasterIds.filter(broadcaster => broadcaster !== userId);
        } else if( this._listenerIds.includes(userId) ) {
            this._listenerIds = this._listenerIds.filter(listener => listener !== userId);
        }
        else {
            return false;
        }
        return true;
    }

    broadcastMessage(message: string, data: any): void {
        io.to(this._id).emit(message, data);
    }

    broadcastListenerMessage(message: string, data: any): void {
        this._listenerIds.forEach(listener => {
            const user = UserFunctions.getUser(listener);
            if (user) {
                user.getSocket()?.emit(message, data);
            }
        });
    }

    broadcastBroadcasterMessage(message: string, data: any): void {
        this._broadcasterIds.forEach(broadcaster => {
            const user = UserFunctions.getUser(broadcaster);
            if (user) {
                user.getSocket()?.emit(message, data);
            }
        });
    }

    close(): void {
        io.to(this._id).emit('broadcast-closed', this._id);
        this._broadcasterIds.forEach(broadcaster => {
            const user = UserFunctions.getUser(broadcaster);
            if (user) {
                user.getSocket()?.leave(this._id);
            }
        });
        this._listenerIds.forEach(listener => {
            const user = UserFunctions.getUser(listener);
            if (user) {
                user.getSocket()?.leave(this._id);
            }
        });
        this._broadcasterIds = [];
        this._listenerIds = [];
    }
}

// Socket events
function sendUpdatedBroadcasts() {
    io.emit(SocketEvents.UPDATE_BROADCASTS, Array.from(broadcasts.values()));
}

function sendUpdatedBroadcastsTo(id: string) {
    UserFunctions.getUser(id)?.getSocket()?.emit(SocketEvents.UPDATE_BROADCASTS, Array.from(broadcasts.values()));
}

function sendUpdatedBroadcast(broadcast: Broadcast) {
    io.emit(SocketEvents.UPDATE_BROADCAST, broadcast);
}

function sendCreatedBroadcast(broadcast: Broadcast) {
    io.emit(SocketEvents.CREATE_BROADCAST, broadcast);
}

function sendTerminatedBroadcast(id: string) {
    io.emit(SocketEvents.TERMINATE_BROADCAST, id);
}

function sendJoinedBroadcast(userId: string, broadcastId: string, isBroadcaster = false) {
    io.to(userId).emit(SocketEvents.JOIN_BROADCAST, broadcastId, isBroadcaster);
}

function sendLeftBroadcast(userId: string, broadcastId: string) {
    io.to(userId).emit(SocketEvents.LEAVE_BROADCAST, broadcastId);
}

/*
* Returns a copy of the broadcasts
* @returns {Map<string, Broadcast>} - The broadcasts (copy)
*/
function getBroadcasts() {
    return new Map(broadcasts);
}

/*
* Returns a broadcast by id
* @param {string} id - The id of the broadcast to get
* @returns {Broadcast|undefined} - The broadcast
*/
function getBroadcast(id: string) {
    return broadcasts.get(id);
}

// Use this function to set broadcasts instead of broadcasts.set
function setBroadcast(broadcast: Broadcast) {
    broadcasts.set(broadcast.id, broadcast);
    sendUpdatedBroadcast(broadcast);
}

/* 
* Updates a broadcast
* Does not update id, broadcasters, or listeners
* @param {Broadcast} updatedBroadcast - The updated broadcast
*/
function updateBroadcast(updatedBroadcast: Broadcast): boolean {
    const broadcast = getBroadcast(updatedBroadcast.id);
    if (!broadcast) {
        return false;
    }
    broadcast.name = updatedBroadcast.name;
    setBroadcast(broadcast);
    return true;
}

function createBroadcast(name?: string): Broadcast{
    const broadcast = new Broadcast(name);
    broadcasts.set(broadcast.id, broadcast);
    sendCreatedBroadcast(broadcast);
    console.log('broadcast created: ', broadcast.name);
    return broadcast;
}

function terminateBroadcast(id: string): boolean {
    const broadcast = broadcasts.get(id);
    if (!broadcast) {
        return false;
    }
    broadcast.close();
    broadcasts.delete(id);
    sendTerminatedBroadcast(id);
    console.log('broadcast terminated: ', broadcast.name);
    return true;
}

function joinBroadcast(userId: string, broadcastId: string, isBroadcaster = false): boolean {
    const broadcast = getBroadcast(broadcastId);
    if (!broadcast) {
        return false; 
    }
    if (isBroadcaster) {
        broadcast.joinAsBroadcaster(userId);
    } else {
        broadcast.joinAsListener(userId);
    }
    sendJoinedBroadcast(userId, broadcastId, isBroadcaster);
    console.log(UserFunctions.getUser(userId)?.name, ' joined broadcast: ', broadcast.name, ' as ', isBroadcaster ? 'broadcaster' : 'listener');
    return true;
}

function leaveBroadcast(userId: string, broadcastId: string): boolean {
    const broadcast = getBroadcast(broadcastId);
    if (!broadcast) {
        return false;
    }
    if(!broadcast.leave(userId)) {
        return false;
    };
    sendLeftBroadcast(userId, broadcastId);
    console.log(userId, ' left broadcast: ', broadcast.name);
    return true;
}

export const BroadcastFunctions = { getBroadcasts,
    getBroadcast,
    setBroadcast,
    updateBroadcast,
    createBroadcast,
    terminateBroadcast,
    joinBroadcast,
    leaveBroadcast,
    sendUpdatedBroadcasts,
    sendUpdatedBroadcastsTo,
 };

// TODO:
// Error Handling: Consider adding error handling to account for potential issues, such as trying to join a closed broadcast or sending a message to a non-existent room.

// Unique Broadcasters: Ensure that a broadcaster can't join multiple times. You might want to check if a broadcaster's socket ID is already in the broadcasters array before adding it.

// Listener Management: In the joinAsListener method, you're pushing the socket ID to the listeners array. However, in other methods like broadcastListenerMessage, you're treating each listener as a socket object. You might want to store the entire socket object in the listeners array for consistency.

// Room Existence: Before performing operations like broadcasting a message, you might want to check if the room exists.

// Event Names: Consider using constants or an enumeration for event names (like 'broadcast-closed') to avoid potential typos and make the code more maintainable.

// Documentation: Add comments or JSDoc annotations to describe the purpose and usage of each method, especially if other developers will be working with this class.