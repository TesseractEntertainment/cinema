import socket from "../socket";
import { Dispatcher, DispatcherEvents } from "./dispatcher";
import { emitEvent } from "./connection";
import { SocketEvents } from '../common/socketEvents';
import { BroadcastDTO } from "./DTOs";

var _broadcasts: Broadcast[] = [];

socket.on('connect', onConnect);
socket.on(SocketEvents.Broadcast.LISTENER_JOINED, onListenerJoin);
socket.on(SocketEvents.Broadcast.BROADCASTER_JOINED, onBroadcasterJoin);
socket.on(SocketEvents.Broadcast.LISTENER_LEFT, onListenerLeave);
socket.on(SocketEvents.Broadcast.BROADCASTER_LEFT, onBroadcasterLeave);
socket.on(SocketEvents.Broadcast.CREATED, onCreate);
socket.on(SocketEvents.Broadcast.TERMINATED, onTerminate);
socket.on(SocketEvents.Broadcast.UPDATED, onUpdate);
socket.on(SocketEvents.Broadcast.BROADCASTS, onBroadcasts);


function onConnect() {
    console.log('Connected: requesting broadcasts');
    requestBroadcasts();
}

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
    Dispatcher.dispatch(DispatcherEvents.SET_BROADCASTS_STATE, broadcasts);
}
function _addBroadcast(broadcast: Broadcast) {
    _setBroadcasts([..._broadcasts, broadcast]);
}
function _removeBroadcast(broadcastId: string) {
    _setBroadcasts(_broadcasts.filter((broadcast) => broadcast.id !== broadcastId));
    Dispatcher.dispatch(DispatcherEvents.SET_BROADCAST_STATE + broadcastId, undefined);
}
function _updateBroadcast(broadcastId: string, updatedBroadcast: Broadcast) {
    Dispatcher.dispatch(DispatcherEvents.SET_BROADCAST_STATE + broadcastId, updatedBroadcast);
    _setBroadcasts(_broadcasts.map((broadcast) => broadcast.id === broadcastId ? updatedBroadcast : broadcast));
}

/*
* Returns the broadcasts
* @returns {Broadcast[]} - The broadcasts
*/
function getBroadcasts() {
    return _broadcasts;
}

/**
* Returns a broadcast. If it's not cached, requests the server to get the broadcast.
* @param {string} broadcastId - The broadcast id
* @returns {Promise<Broadcast>} - The broadcast
* @throws {Error} - If the broadcast was not found
*/
async function getBroadcastAsync(broadcastId: string): Promise<Broadcast> {
    var broadcast = _broadcasts.find((broadcast) => broadcast.id === broadcastId);
    if(broadcast) return broadcast;
    const serverBroadcast: BroadcastDTO = await emitEvent(SocketEvents.Broadcast.GET_BROADCAST, broadcastId);
    if(!serverBroadcast) throw new Error(`Broadcast ${broadcastId} not found`);
    return BroadcastDTO.toBroadcast(serverBroadcast);
}
function hasBroadcast(broadcastId: string): boolean {
    const broadcast = _broadcasts.find((broadcast) => broadcast.id === broadcastId);
    if(broadcast) return true;
    // TODO: check if the server has the broadcast
    return false;
}

/*
* Requests the server to create a broadcast
* @param {string} name - The broadcast name
* @returns {Promise<string>} - The broadcast id
*/
async function create(name: string): Promise<string> {
    return emitEvent(SocketEvents.Broadcast.REQUEST_CREATE, name);
}
        
function terminate(broadcastId: string) {
    emitEvent(SocketEvents.Broadcast.REQUEST_TERMINATE, broadcastId);
}
function listen(broadcastId: string) {
    emitEvent(SocketEvents.Broadcast.REQUEST_LISTEN, broadcastId);
}
function broadcast(broadcastId: string) {
    emitEvent(SocketEvents.Broadcast.REQUEST_BROADCAST, broadcastId);
}
function leave(broadcastId: string) {
    emitEvent(SocketEvents.Broadcast.REQUEST_LEAVE, broadcastId);
}
function requestBroadcasts() {
    emitEvent(SocketEvents.Broadcast.REQUEST_BROADCASTS);
}

function onBroadcasts(updatedBroadcastDTOs: BroadcastDTO[]) {
    const updatedBroadcasts = BroadcastDTO.toBroadcasts(updatedBroadcastDTOs);
    console.log('broadcasts recieved: ', updatedBroadcasts);
    _setBroadcasts(updatedBroadcasts);
}

function onUpdate(updatedBroadcastDTO: BroadcastDTO) {
    const updatedBroadcast = BroadcastDTO.toBroadcast(updatedBroadcastDTO);
    console.log('broadcast updated: ', updatedBroadcast);
    _updateBroadcast(updatedBroadcast.id, updatedBroadcast);
}

function onListenerJoin(broadcastId: string, userId: string) {
    getBroadcastAsync(broadcastId).then((broadcast) => {
        _updateBroadcast(broadcastId, {
            ...broadcast,
            listenerIds: [...broadcast.listenerIds, userId]
        });
    });
}
function onBroadcasterJoin(broadcastId: string, userId: string) {
    getBroadcastAsync(broadcastId).then((broadcast) => {
        _updateBroadcast(broadcastId, {
            ...broadcast,
            broadcasterIds: [...broadcast.broadcasterIds, userId]
        });
    });
}
function onListenerLeave(broadcastId: string, userId: string) {
    console.log('listener left: ', userId);
    getBroadcastAsync(broadcastId).then((broadcast) => {
        _updateBroadcast(broadcastId, {
            ...broadcast,
            listenerIds: broadcast.listenerIds.filter((id) => id !== userId)
        });
    });
}
function onBroadcasterLeave(broadcastId: string, userId: string) {
    getBroadcastAsync(broadcastId).then((broadcast) => {
        _updateBroadcast(broadcastId, {
            ...broadcast,
            broadcasterIds: broadcast.broadcasterIds.filter((id) => id !== userId)
        });
    });
}

function onTerminate(broadcastId: string) {
  _removeBroadcast(broadcastId);
}

function onCreate(broadcastDTO: BroadcastDTO) {
    const broadcast = BroadcastDTO.toBroadcast(broadcastDTO);
    console.log('broadcast created: ', broadcast.name);
    _addBroadcast({
    id: broadcast.id,
    name: broadcast.name,
    broadcasterIds: broadcast.broadcasterIds,
    listenerIds: broadcast.listenerIds
  });
}

export const BroadcastFunctions = { 
    getBroadcasts,
    getBroadcastAsync,
    hasBroadcast,
    create,
    terminate,
    listen,
    broadcast,
    leave,
    requestBroadcasts,
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