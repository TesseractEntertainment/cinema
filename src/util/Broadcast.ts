import { v4 as uuidv4 } from 'uuid';
import { UserFunctions } from './User';
import { io } from './io';
import { SocketEvents } from '../../frontend/src/common/socketEvents';
import { BroadcastDTO } from './DTOs';

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

    isListening(userId: string): boolean {
        return this._listenerIds.includes(userId);
    }

    isBroadcasting(userId: string): boolean {
        return this._broadcasterIds.includes(userId);
    }

    /**
    * Joins the broadcast as a broadcaster
    * @param {string} userId - The user id
    * @throws {Error} - If the user is already broadcasting
    * @throws {Error} - If the user is not found
    */
    joinAsBroadcaster(userId: string) {
        const user = UserFunctions.getUser(userId);
        if (this.isBroadcasting(userId)) {
            throw new Error(`User ${userId} is already broadcasting`);
        }
        if (this.isListening(userId)) {
            throw new Error(`User ${userId} is already listening`);
        }
        user.getSocket().join(this._id);
        this._broadcasterIds.push(userId);
    }

    /**
    * Joins the broadcast as a listener
    * @param {string} userId - The user id
    * @throws {Error} - If the user is already listening
    * @throws {Error} - If the user is not found
    */
    joinAsListener(userId: string) {
        const user = UserFunctions.getUser(userId);
        if (this.isListening(userId)) {
            throw new Error(`User ${userId} is already listening`);
        }
        if (this.isBroadcasting(userId)) {
            throw new Error(`User ${userId} is already broadcasting`);
        }
        user.getSocket().join(this._id);
        this._listenerIds.push(userId);
    }

    /**
    * Leaves the broadcast
    * @param {string} userId - The user id
    * @throws {Error} - If the user is not in the broadcast
    * @throws {Error} - If the user is not found
    */
    leave(userId: string) {
        const user = UserFunctions.getUser(userId);
        try {
            user.getSocket().leave(this._id);
        }
        catch (e) {
        }
        if( this._broadcasterIds.includes(userId) ) {
            this._broadcasterIds = this._broadcasterIds.filter(broadcaster => broadcaster !== userId);
            sendBroadcasterLeft(userId, this._id);
        } else if( this._listenerIds.includes(userId) ) {
            this._listenerIds = this._listenerIds.filter(listener => listener !== userId);
            sendListenerLeft(userId, this._id);
        }
        else {
            throw new Error(`User ${userId} is not in broadcast ${this._id}`);
        }
    }

    broadcastMessage(message: string, data: any): void {
        io.to(this._id).emit(message, data);
    }

    broadcastListenerMessage(message: string, data: any): void {
        this._listenerIds.forEach(listener => {
            const user = UserFunctions.getUser(listener);
            user.getSocket().emit(message, data);
        });
    }

    broadcastBroadcasterMessage(message: string, data: any): void {
        this._broadcasterIds.forEach(broadcaster => {
            const user = UserFunctions.getUser(broadcaster);
            user.getSocket().emit(message, data);
        });
    }

    close(): void {
        // TODO
        io.to(this._id).emit('broadcast-closed', this._id);
        this._broadcasterIds.forEach(broadcaster => {
            const user = UserFunctions.getUser(broadcaster);
            user.getSocket().leave(this._id);
        });
        this._listenerIds.forEach(listener => {
            const user = UserFunctions.getUser(listener);
            user.getSocket().leave(this._id);
        });
        this._broadcasterIds = [];
        this._listenerIds = [];
    }
}

// Socket events
function sendBroadcasts() {
    io.emit(SocketEvents.Broadcast.BROADCASTS, BroadcastDTO.fromBroadcastMap(broadcasts));
}

function sendBroadcastsTo(id: string) {
    try {
        UserFunctions.getUser(id).getSocket().emit(SocketEvents.Broadcast.BROADCASTS, BroadcastDTO.fromBroadcastMap(broadcasts));
        console.log('sent broadcasts to ', id);
    }
    catch (e) {
        console.log('error sending broadcasts to ', id);
        console.log(e);
    }    
}

function sendUpdated(broadcast: Broadcast) {
    io.emit(SocketEvents.Broadcast.UPDATED, BroadcastDTO.fromBroadcast(broadcast));
}

function sendCreated(broadcast: Broadcast) {
    io.emit(SocketEvents.Broadcast.CREATED, BroadcastDTO.fromBroadcast(broadcast));
}

function sendTerminated(id: string) {
    io.emit(SocketEvents.Broadcast.TERMINATED, id);
}

function sendListenerJoined(userId: string, broadcastId: string) {
    io.emit(SocketEvents.Broadcast.LISTENER_JOINED, broadcastId, userId);
}

function sendBroadcasterJoined(userId: string, broadcastId: string) {
    io.emit(SocketEvents.Broadcast.BROADCASTER_JOINED, broadcastId, userId);
}

function sendListenerLeft(userId: string, broadcastId: string) {
    io.emit(SocketEvents.Broadcast.LISTENER_LEFT, broadcastId, userId);
}

function sendBroadcasterLeft(userId: string, broadcastId: string) {
    io.emit(SocketEvents.Broadcast.BROADCASTER_LEFT, broadcastId, userId);
}

/**
* Returns a copy of the broadcasts.
* @returns {Map<string, Broadcast>} - The broadcasts (copy)
*/
function getBroadcasts(): Map<string, Broadcast> {
    return new Map(broadcasts);
}

function getBroadcastsDTO(): BroadcastDTO[] {
    return BroadcastDTO.fromBroadcastMap(broadcasts);
}

/**
* Returns a broadcast by id.
* @param {string} id - The id of the broadcast to get.
* @returns Broadcast - The broadcast.
* @throws {Error} - If the broadcast is not found.
*/
function getBroadcast(id: string): Broadcast {
    const broadcast = broadcasts.get(id);
    if (!broadcast) {
        throw new Error('Broadcast not found');
    }
    return broadcast;
}

function getBroadcastDTO(id: string): BroadcastDTO {
    return BroadcastDTO.fromBroadcast(getBroadcast(id));
}

// Use this function to set broadcasts instead of broadcasts.set
function setBroadcast(broadcast: Broadcast) {
    broadcasts.set(broadcast.id, broadcast);
    sendUpdated(broadcast);
}

/**
* Updates a broadcast.
* Does not update id, broadcasters, or listeners.
* @param {Broadcast} updatedBroadcast - The updated broadcast.
*/
function updateBroadcast(updatedBroadcast: Broadcast): boolean {
    const broadcast = getBroadcast(updatedBroadcast.id);
    broadcast.name = updatedBroadcast.name;
    setBroadcast(broadcast);
    return true;
}

function createBroadcast(name?: string): Broadcast{
    const broadcast = new Broadcast(name);
    broadcasts.set(broadcast.id, broadcast);
    sendCreated(broadcast);
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
    sendTerminated(id);
    console.log('broadcast terminated: ', broadcast.name);
    return true;
}

/**
* Joins a broadcast.
* @param {string} userId - The user id.
* @param {string} broadcastId - The broadcast id.
* @param {boolean} [asBroadcaster=false] - Whether the user is a broadcaster.
* @throws {Error} - If the broadcast is not found
* @throws {Error} - If the user is already broadcasting/listening
* @throws {Error} - If the user is not found
*/
function joinBroadcast(userId: string, broadcastId: string, asBroadcaster: boolean = false) {
    const broadcast = getBroadcast(broadcastId);
    if (asBroadcaster) {
        broadcast.joinAsBroadcaster(userId);
        // TODO: move this to the broadcast class
        sendBroadcasterJoined(userId, broadcastId);
    } else {
        broadcast.joinAsListener(userId);
        sendListenerJoined(userId, broadcastId);
    }
    console.log(UserFunctions.getUser(userId)?.name, ' joined broadcast: ', broadcast.name, ' as ', asBroadcaster ? 'broadcaster' : 'listener');
}

function leaveBroadcast(userId: string, broadcastId: string) {
    const broadcast = getBroadcast(broadcastId);
    broadcast.leave(userId);
    console.log(userId, ' left broadcast: ', broadcast.name);
    return true;
}

function leaveBroadcasts(userId: string) {
    broadcasts.forEach((broadcast) => {
        broadcast.leave(userId);
    });
}
    

export const BroadcastFunctions = { 
    getBroadcasts,
    getBroadcastsDTO,
    getBroadcast,
    getBroadcastDTO,
    setBroadcast,
    updateBroadcast,
    createBroadcast,
    terminateBroadcast,
    joinBroadcast,
    leaveBroadcast,
    leaveBroadcasts,
    sendBroadcasts,
    sendBroadcastsTo,
 };

// TODO:
// Error Handling: Consider adding error handling to account for potential issues, such as trying to join a closed broadcast or sending a message to a non-existent room.

// Unique Broadcasters: Ensure that a broadcaster can't join multiple times. You might want to check if a broadcaster's socket ID is already in the broadcasters array before adding it.

// Listener Management: In the joinAsListener method, you're pushing the socket ID to the listeners array. However, in other methods like broadcastListenerMessage, you're treating each listener as a socket object. You might want to store the entire socket object in the listeners array for consistency.

// Room Existence: Before performing operations like broadcasting a message, you might want to check if the room exists.

// Event Names: Consider using constants or an enumeration for event names (like 'broadcast-closed') to avoid potential typos and make the code more maintainable.

// Documentation: Add comments or JSDoc annotations to describe the purpose and usage of each method, especially if other developers will be working with this class.