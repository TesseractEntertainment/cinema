import { Server, Socket } from 'socket.io';
import { io } from './io';

export class User {
    private _socketId: string 
    private _name: string;

    constructor(socket: Socket, name?: string) {
        this._socketId = socket.id;
        this._name = name ? name : this._socketId;
    }

    get socketId(): string {
        return this._socketId;
    }

    get id(): string {
        return this._socketId;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get socket(): Socket {
        const socket = io.sockets.sockets.get(this._socketId);
        console.log(this._socketId);
        console.log(io.sockets.sockets.keys());
        if (!socket) {
            throw new Error('Socket not found');
        }
        return socket;
    }
}
