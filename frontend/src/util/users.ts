import { closePeerConnection, connectionStateToPeerConnectionState, getPeerConnections } from "./connection";
import { Dispatcher, DispatcherEvent } from "./dispatcher";
import { PeerConnectionState } from "./enums";
import { User } from "./interfaces";

var _users: User[] = [];

/*
* Sets the users state and dispatches the SET_USER_STATE event
* @param {User[]} users - The new users state
*/
export function setUsers(users: User[]) {
    _users = users;
    Dispatcher.dispatch(DispatcherEvent.SET_USER_STATE, users);
}

/*
* Returns the users
* @returns {User[]} - The users
*/
export function getUsers() {
    return _users;
}
export function addUser(user: User) {
    setUsers([..._users, user]);
}
export function removeUser(userId: string) {
    setUsers(_users.filter((user) => user.id !== userId));
}
export function updateUser(userId: string, updatedUser: User) {
    setUsers(_users.map((user) => user.id === userId ? updatedUser : user));
}
export function updateConnectionState(userId: string, connectionState: PeerConnectionState) {
    setUsers(_users.map((user) => user.id === userId ? { ...user, connectionState } : user));
}
export function getUser(userId: string) {
    return _users.find((user) => user.id === userId);
}
export function hasUser(userId: string) {
    return _users.some((user) => user.id === userId);
}

export function onUpdateUsers(updatedUsers: {_socketId: string; _name: string; }[]) {
  var userIds: string[] = [];
  if(updatedUsers.length > 0) {
    userIds = updatedUsers.map((user: { _socketId: string; }) => user._socketId);
  }
  const peerConnections = getPeerConnections();
  if(peerConnections.size > 0) {
    const disconnectedPeers = Array.from(peerConnections.keys()).filter((userId) => !userIds.includes(userId));
    disconnectedPeers.forEach((userId) => {
      closePeerConnection(userId);
    }); 
  }
  setUsers(updatedUsers.map((user) => ({
    id: user._socketId,
    name: user._name, 
    connectionState: peerConnections.has(user._socketId) ? connectionStateToPeerConnectionState(peerConnections.get(user._socketId)!.connectionState) : PeerConnectionState.DISCONNECTED 
  })));
  console.log('updated users: ', updatedUsers);
}