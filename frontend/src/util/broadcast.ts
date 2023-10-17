import { Dispatcher, DispatcherEvent } from "./dispatcher";

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
    _setBroadcasts(_broadcasts.filter((broadcast) => broadcast.id !== broadcastId));
}
export function updateBroadcast(broadcastId: string, updatedBroadcast: Broadcast) {
    _setBroadcasts(_broadcasts.map((broadcast) => broadcast.id === broadcastId ? updatedBroadcast : broadcast));
}
export function getBroadcast(broadcastId: string) {
    return _broadcasts.find((broadcast) => broadcast.id === broadcastId);
}
export function hasBroadcast(broadcastId: string) {
    return _broadcasts.some((broadcast) => broadcast.id === broadcastId);
}

export function onUpdateBroadcasts(updatedBroadcasts: {_id: string; _broadcasterIds: string[], _listenerIds: string[], _name: string; }[]) {
  setBroadcasts(updatedBroadcasts.map((broadcast) => ({
    id: broadcast._id,
    name: broadcast._name,
    broadcasterIds: broadcast._broadcasterIds,
    listenerIds: broadcast._listenerIds
  })));
}