import { io } from "socket.io-client";
import { Dispatcher, DispatcherEvent } from "./dispatcher";
import { socket } from "./connection";
import { SocketEvents } from "./socketEvents";

var _broadcasts: Broadcast[] = [];

export interface Broadcast {
    id: string;
    broadcasterIds: string[];
    listenerIds: string[];
    name: string;
}    

/*
* Sets the broadcasts state and dispatches the SET_BROADCAST_STATE event
* @param {Broadcast[]} broadcasts - The new broadcasts state
*/
function _setBroadcasts(broadcasts: Broadcast[]) {
    _broadcasts = broadcasts;
    Dispatcher.dispatch(DispatcherEvent.SET_BROADCAST_STATE, broadcasts);
}
function _addBroadcast(broadcast: Broadcast) {
    _setBroadcasts([..._broadcasts, broadcast]);
}
function _removeBroadcast(broadcastId: string) {
    _setBroadcasts(_broadcasts.filter((broadcast) => broadcast.id !== broadcastId));
}
function _updateBroadcast(broadcastId: string, updatedBroadcast: Broadcast) {
    _setBroadcasts(_broadcasts.map((broadcast) => broadcast.id === broadcastId ? updatedBroadcast : broadcast));
}

/*
* Returns the broadcasts
* @returns {Broadcast[]} - The broadcasts
*/
function getBroadcasts() {
    return _broadcasts;
}
function getBroadcast(broadcastId: string) {
    return _broadcasts.find((broadcast) => broadcast.id === broadcastId);
}
function hasBroadcast(broadcastId: string) {
    return _broadcasts.some((broadcast) => broadcast.id === broadcastId);
}
// TODO: return new broadcast id
function create(name: string) {
    socket.emit(SocketEvents.Broadcast.REQUEST_CREATE, name);
}
function terminate(broadcastId: string) {
    socket.emit(SocketEvents.Broadcast.REQUEST_TERMINATE, broadcastId);
}
function listen(broadcastId: string) {
    socket.emit(SocketEvents.Broadcast.REQUEST_LISTEN, broadcastId);
}
function broadcast(broadcastId: string) {
    socket.emit(SocketEvents.Broadcast.REQUEST_BROADCAST, broadcastId);
}
function leave(broadcastId: string) {
    socket.emit(SocketEvents.Broadcast.REQUEST_LEAVE, broadcastId);
}


function onBroadcasts(updatedBroadcasts: {_id: string; _broadcasterIds: string[], _listenerIds: string[], _name: string; }[]) {
  _setBroadcasts(updatedBroadcasts.map((broadcast) => ({
    id: broadcast._id,
    name: broadcast._name,
    broadcasterIds: broadcast._broadcasterIds,
    listenerIds: broadcast._listenerIds
  })));
}

function onUpdate(updatedBroadcast: {_id: string; _broadcasterIds: string[], _listenerIds: string[], _name: string; }) {
    _updateBroadcast(updatedBroadcast._id, {
        id: updatedBroadcast._id,
        name: updatedBroadcast._name,
        broadcasterIds: updatedBroadcast._broadcasterIds,
        listenerIds: updatedBroadcast._listenerIds
    });
}

function onListenerJoin(broadcastId: string, userId: string) {
    // TODO
}
function onBroadcasterJoin(broadcastId: string, userId: string) {
    // TODO
}
function onListenerLeave(broadcastId: string, userId: string) {
    // TODO
}
function onBroadcasterLeave(broadcastId: string, userId: string) {
    // TODO
}

function onTerminate(broadcastId: string) {
  _removeBroadcast(broadcastId);
}

function onCreate(broadcast: {_id: string; _broadcasterIds: string[], _listenerIds: string[], _name: string; }) {
  console.log('broadcast created: ', broadcast._name);
    _addBroadcast({
    id: broadcast._id,
    name: broadcast._name,
    broadcasterIds: broadcast._broadcasterIds,
    listenerIds: broadcast._listenerIds
  });
}

export const BroadcastFunctions = { 
    getBroadcasts,
    getBroadcast,
    hasBroadcast,
    create,
    terminate,
    listen,
    broadcast,
    leave,
}
export const BroadcastEvents = {
    onBroadcasts,
    onUpdate,
    onListenerJoin,
    onBroadcasterJoin,
    onListenerLeave,
    onBroadcasterLeave,
    onTerminate,
    onCreate
};