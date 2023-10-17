import { ConnectionFunctions, PeerConnectionState } from "./connection";
import { Dispatcher, DispatcherEvent } from "./dispatcher";

var _users: User[] = [];

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
    Dispatcher.dispatch(DispatcherEvent.SET_USER_STATE, users);
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
function getUser(userId: string) {
    return _users.find((user) => user.id === userId);
}
function hasUser(userId: string) {
    return _users.some((user) => user.id === userId);
}

function onUpdateUsers(updatedUsers: {_socketId: string; _name: string; }[]) {
  var userIds: string[] = [];
  if(updatedUsers.length > 0) {
    userIds = updatedUsers.map((user: { _socketId: string; }) => user._socketId);
  }
  const peerConnections = ConnectionFunctions.getPeerConnections();
  if(peerConnections.size > 0) {
    const disconnectedPeers = Array.from(peerConnections.keys()).filter((userId) => !userIds.includes(userId));
    disconnectedPeers.forEach((userId) => {
      ConnectionFunctions.closePeerConnection(userId);
    }); 
  }
  setUsers(updatedUsers.map((user) => ({
    id: user._socketId,
    name: user._name, 
    connectionState: peerConnections.has(user._socketId) ? ConnectionFunctions.connectionStateToPeerConnectionState(peerConnections.get(user._socketId)!.connectionState) : PeerConnectionState.DISCONNECTED 
  })));
  console.log('updated users: ', updatedUsers);
}

function onUpdateUser( updatedUser: { _socketId: string; _name: string; }) {
  const peerConnections = ConnectionFunctions.getPeerConnections();
  updateUser(updatedUser._socketId, {
    id: updatedUser._socketId,
    name: updatedUser._name,
    connectionState: peerConnections.has(updatedUser._socketId) ? ConnectionFunctions.connectionStateToPeerConnectionState(peerConnections.get(updatedUser._socketId)!.connectionState) : PeerConnectionState.DISCONNECTED 
  });
  console.log('updated user: ', updatedUser);
}

function onDeleteUser(id: string) {
  const user = getUser(id);
  removeUser(id);
  console.log('deleted user: ', user?.name);
}

export const UserFunctions = { setUsers, getUsers, addUser, removeUser, updateUser, updateConnectionState, getUser, hasUser };
export const UserEvents = { onDeleteUser,
  onUpdateUser,
  onUpdateUsers,
};