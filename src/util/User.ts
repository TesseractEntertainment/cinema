import { Server, Socket } from 'socket.io';
import { io } from './io';
import { SocketEvents } from '../../frontend/src/common/socketEvents';
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

    getSocket(): Socket {
        const socket = io.sockets.sockets.get(this._socketId);
        if (!socket) {
            throw new Error(`Socket ${this._socketId} not found`);
        }
        return socket;
    }
}

function sendUsers() {
    io.emit(SocketEvents.User.USERS, Array.from(users.values()));
}

function sendUsersTo(id: string) {
    try {
        getUser(id).getSocket().emit(SocketEvents.User.USERS, Array.from(users.values()));
        console.log('sent users to: ', getUser(id).name);
    }
    catch (error) {
        console.log(error);
    }
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

/**
* Gets a user
* @param {string} id - The user id
* @returns {User} - The user
* @throws {Error} - If the user was not found
*/
function getUser(id: string): User {
    const user = users.get(id);
    if (!user) {
        throw new Error(`User ${id} not found`);
    }
    return user;
}

function setUser(user: User) {
    users.set(user.id, user);
    sendUpdatedUser(user);
}

function cleanup(id: string) {
    try {
        BroadcastFunctions.leaveBroadcasts(id);
    }
    catch (error) {
        console.log(error);
    }
}

/* 
* Updates a user
* Does not update socketId
* @param {User} updatedUser - The updated user
*/
function updateUser(userId: string, name: string) {
    const user = getUser(userId);
    user.name = name;
    sendUpdatedUser(user);
}

function createUser(socketId: string, name?: string): User {
    if (users.has(socketId)) {
        throw new Error(`User ${socketId} already exists`);
    } 
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

function deleteUser(id: string) {
    cleanup(id);
    const user = getUser(id);
    users.delete(user.id);
    sendDeletedUser(user.id);
    console.log('user deleted: ', user.name);
    return true;
}

export const UserFunctions = { 
    getUsers,
    getUser,
    setUser,
    updateUser,
    createUser,
    deleteUser,
    sendUsers,
    sendUsersTo,
 };
