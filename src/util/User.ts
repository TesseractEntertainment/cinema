import { Server, Socket } from 'socket.io';
import { io } from './io';
import { SocketEvents } from './socketEvents';
import { BroadcastFunctions } from './Broadcast';

const users: Map<string, User> = new Map();

export class User {
    private _socketId: string 
    private _name: string;

    constructor(socketId: string, name?: string) {
        this._socketId = socketId;
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

    getSocket(): Socket | undefined {
        const socket = io.sockets.sockets.get(this._socketId);
        console.log(this._socketId);
        console.log(io.sockets.sockets.keys());
        if (!socket) {
            return undefined;
        }
        return socket;
    }
}

function sendUpdatedUsers() {
    io.emit(SocketEvents.User.USERS, Array.from(users.values()));
}

function sendUpdatedUsersTo(id: string) {
    getUser(id)?.getSocket()?.emit(SocketEvents.User.USERS, Array.from(users.values()));
}

function sendUpdatedUser(user: User) {
    io.emit(SocketEvents.User.UPDATED, user);
}

function sendCreatedUser(user: User) {
    io.emit(SocketEvents.User.CREATED, user);
}

// function sendAddedUser(user: User) {
//     io.emit(SocketEvents.ADD_USER, user);
// }

function sendDeletedUser(id: string) {
    io.emit(SocketEvents.User.DELETED, id);
}

// function sendRemovedUser(id: string) {
//     io.emit(SocketEvents.REMOVE_USER, id);
// }

function getUsers(): Map<string, User> {
    return new Map(users);
}

function getUser(id: string): User | undefined {
    return users.get(id);
}

function setUser(user: User) {
    users.set(user.id, user);
    sendUpdatedUser(user);
}

/* 
* Updates a user
* Does not update socketId
* @param {User} updatedUser - The updated user
*/
function updateUser(userId: string, name: string): boolean{
    const user = users.get(userId);
    if (!user) {
        return false;
    }
    user.name = name;
    sendUpdatedUser(user);
    return true;
}

function createUser(socketId: string, name?: string) {
    const user = new User(socketId, name);
    users.set(socketId, user);
    sendCreatedUser(user);
    console.log('a user was created: ', user.name);
    return user;
}

// TODO: safe users to database
// function addUser(socket: Socket, name?: string) {
//     const user = new User(socket, name);
//     users.set(socket.id, user);
//     sendAddedUser(user);
//     console.log('a user was added: ', user.name);
//     return user;
// }

// function removeUser(id: string): boolean {
//     const user = getUser(id);
//     if (!user) {
//         return false;
//     }
//     const socket = user.getSocket();
//     socket.rooms.forEach((room) => {
//         const broadcast = BroadcastFunctions.getBroadcast(room);
//         if (broadcast) {
//             broadcast.leave(id);
//         }
//     });
//     users.delete(user.id);
//     sendRemovedUser(user.id);
//     console.log('user removed: ', user.name);   
//     return true;
// }

function deleteUser(id: string): boolean {
    const user = getUser(id);
    if (!user) {
        return false;
    }
    const socket = user.getSocket();
    if (socket) {
        socket.rooms.forEach((room) => {
            const broadcast = BroadcastFunctions.getBroadcast(room);
            if (broadcast) {
                broadcast.leave(id);
            }
        });
    }
    users.delete(user.id);
    sendDeletedUser(user.id);
    console.log('user deleted: ', user.name);
    return true;
}

export const UserFunctions = { getUsers,
    getUser,
    setUser,
    updateUser,
    createUser,
    deleteUser,
    sendUpdatedUsers,
    sendUpdatedUsersTo,
 };
