import socket from '../socket';
import { SocketEvents } from '../../../frontend/src/common/socketEvents';
import { ConnectionFunctions, PeerConnectionState, emitEvent } from "./connection";
import { Dispatcher, DispatcherEvents } from "./dispatcher";
import { UserDTO } from './DTOs';

var _users: User[] = [];

socket.on('connect', onConnect);
socket.on(SocketEvents.User.USERS, onUsers);
socket.on(SocketEvents.User.CREATED, onUpdate);
socket.on(SocketEvents.User.DELETED, onDelete);
socket.on(SocketEvents.User.UPDATED, onUpdate);

function onConnect() {
  console.log('Connected: requesting users');
    requestUsers();
}

export interface User {
  id: string;
  name: string;
  connectionState: PeerConnectionState;
}

/*
* Sets the users state and dispatches the SET_USER_STATE event
* @param {User[]} users - The new users state
*/
function setUsers(users: User[]) {
  console.log('set users: ', users);
    _users = users;
    Dispatcher.dispatch(DispatcherEvents.SET_USER_STATE, users);
}

/*
* Returns the users
* @returns {User[]} - The users
*/
function getUsers() {
    return _users;
}
function addUser(user: User) {
    setUsers([..._users, user]);
}
function removeUser(userId: string) {
    setUsers(_users.filter((user) => user.id !== userId));
}
function updateUser(userId: string, updatedUser: User) {
    if (hasUser(userId)) {
      setUsers(_users.map((user) => user.id === userId ? updatedUser : user));
    }
    else {
      addUser(updatedUser);
    }
}
export function updateConnectionState(userId: string, connectionState: PeerConnectionState) {
    setUsers(_users.map((user) => user.id === userId ? { ...user, connectionState } : user));
}
async function getUserAsync(userId: string) {
    var user = _users.find((user) => user.id === userId);
    if(user) return user;
    const serverUser: UserDTO = await emitEvent(SocketEvents.User.GET_USER, userId);
    if(!serverUser) throw new Error(`User ${userId} not found`);
    return UserDTO.toUser(serverUser);
}

function hasUser(userId: string) {
    return _users.some((user) => user.id === userId);
}

function requestUsers() {
  emitEvent(SocketEvents.User.REQUEST_USERS);
}

function onUsers(updatedUserDTOs: UserDTO[]) {
  const updatedUsers = UserDTO.toUsers(updatedUserDTOs);
  // close peer connections to users that are no longer in the users list
  var userIds: string[] = [];
  if(updatedUsers.length > 0) {
    userIds = updatedUsers.map((user) => user.id);
  }
  const peerConnections = ConnectionFunctions.getPeerConnections();
  if(peerConnections.size > 0) {
    const disconnectedPeers = Array.from(peerConnections.keys()).filter((userId) => !userIds.includes(userId));
    disconnectedPeers.forEach((userId) => {
      ConnectionFunctions.closePeerConnection(userId);
    }); 
  }

  setUsers(updatedUsers.map((user) => ({
    id: user.id,
    name: user.name, 
    connectionState: peerConnections.has(user.id) ? ConnectionFunctions.connectionStateToPeerConnectionState(peerConnections.get(user.id)!.connectionState) : PeerConnectionState.DISCONNECTED 
  })));
  console.log('updated users: ', updatedUsers);
}

function onUpdate( updatedUserDTO: UserDTO) {
  const updatedUser = UserDTO.toUser(updatedUserDTO);
  const peerConnections = ConnectionFunctions.getPeerConnections();
  updateUser(updatedUser.id, {
    id: updatedUser.id,
    name: updatedUser.name,
    connectionState: peerConnections.has(updatedUser.id) ? ConnectionFunctions.connectionStateToPeerConnectionState(peerConnections.get(updatedUser.id)!.connectionState) : PeerConnectionState.DISCONNECTED 
  });
  console.log('updated user: ', updatedUser);
}

function onDelete(id: string) {
  try {
    getUserAsync(id)
      .then((user) => {
        removeUser(id);
        console.log('deleted user: ', user.name);
      });
  }
  catch (error) {
    console.log(error);
  }
}

export const UserFunctions = { 
  setUsers, 
  getUsers,
  addUser,
  removeUser,
  updateUser,
  updateConnectionState,
  getUserAsync,
  hasUser,
  requestUsers,
};
export const UserEvents = { 
  onDelete,
  onUpdate,
  onUsers,
};