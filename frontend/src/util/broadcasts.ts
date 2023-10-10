import { Dispatcher, DispatcherEvent } from "./dispatcher";
import { Broadcast } from "./interfaces";
import {useState} from "react"

var _broadcasts: Broadcast[] = [];

/*
* Sets the broadcasts state and dispatches the SET_BROADCAST_STATE event
* @param {Broadcast[]} broadcasts - The new broadcasts state
*/
export function _setBroadcasts(broadcasts: Broadcast[]) {
    _broadcasts = broadcasts;
    Dispatcher.dispatch(DispatcherEvent.SET_BROADCAST_STATE, broadcasts);
}

/*
* Returns the broadcasts
* @returns {Broadcast[]} - The broadcasts
*/
export function getBroadcasts() {
    return _broadcasts;
}
export function setBroadcasts(broadcasts: Broadcast[]) {
    _setBroadcasts(broadcasts);
}
export function addBroadcast(broadcast: Broadcast) {
    _setBroadcasts([..._broadcasts, broadcast]);
}
export function removeBroadcast(broadcastId: string) {
    _setBroadcasts(_broadcasts.filter((broadcast) => broadcast.roomId !== broadcastId));
}
export function updateBroadcast(broadcastId: string, updatedBroadcast: Broadcast) {
    _setBroadcasts(_broadcasts.map((broadcast) => broadcast.roomId === broadcastId ? updatedBroadcast : broadcast));
}
export function getBroadcast(broadcastId: string) {
    return _broadcasts.find((broadcast) => broadcast.roomId === broadcastId);
}
export function hasBroadcast(broadcastId: string) {
    return _broadcasts.some((broadcast) => broadcast.roomId === broadcastId);
}