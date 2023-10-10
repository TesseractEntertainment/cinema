import { v4 as uuidv4 } from 'uuid';
import { User } from './User';
import { io } from './io';

export class Broadcast {
    private _roomId: string;
    private _broadcasters: User[];
    private _listeners: User[];
    private _name: string;

    constructor(name?: string) {
        this._roomId = uuidv4();
        this._broadcasters = [];
        this._listeners = [];
        this._name = name ? name : this._roomId;
    }

    get roomId(): string {
        return this._roomId;
    }

    get broadcasters(): User[] {
        return this._broadcasters;
    }

    get listeners(): User[] {
        return this._listeners;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }


    joinAsBroadcaster(user: User): void {
        this._broadcasters.push(user);
        user.socket.join(this._roomId);
    }

    joinAsListener(user: User): void {
        this._listeners.push(user);
        user.socket.join(this._roomId);
    }

    leave(user: User): void {
        user.socket.leave(this._roomId);
        this._broadcasters = this._broadcasters.filter(broadcaster => broadcaster !== user);
        this._listeners = this._listeners.filter(listener => listener !== user);
    }

    broadcastMessage(message: string, data: any): void {
        io.to(this._roomId).emit(message, data);
    }

    broadcastListenerMessage(message: string, data: any): void {
        this._listeners.forEach(listener => {
            listener.socket.emit(message, data);
        });
    }

    broadcastBroadcasterMessage(message: string, data: any): void {
        this._broadcasters.forEach(broadcaster => {
            broadcaster.socket.emit(message, data);
        });
    }

    close(): void {
        io.to(this._roomId).emit('broadcast-closed', this._roomId);
        this._broadcasters.forEach(broadcaster => {
            broadcaster.socket.leave(this._roomId);
        });
        this._listeners.forEach(listener => {
            listener.socket.leave(this._roomId);
        });
        this._broadcasters = [];
        this._listeners = [];
    }
}


// TODO:
// Error Handling: Consider adding error handling to account for potential issues, such as trying to join a closed broadcast or sending a message to a non-existent room.

// Unique Broadcasters: Ensure that a broadcaster can't join multiple times. You might want to check if a broadcaster's socket ID is already in the broadcasters array before adding it.

// Listener Management: In the joinAsListener method, you're pushing the socket ID to the listeners array. However, in other methods like broadcastListenerMessage, you're treating each listener as a socket object. You might want to store the entire socket object in the listeners array for consistency.

// Room Existence: Before performing operations like broadcasting a message, you might want to check if the room exists.

// Event Names: Consider using constants or an enumeration for event names (like 'broadcast-closed') to avoid potential typos and make the code more maintainable.

// Documentation: Add comments or JSDoc annotations to describe the purpose and usage of each method, especially if other developers will be working with this class.