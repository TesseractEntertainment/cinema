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
function setBroadcasts(broadcasts: Broadcast[]) {
    _broadcasts = broadcasts;
    Dispatcher.dispatch(DispatcherEvent.SET_BROADCAST_STATE, broadcasts);
}

/*
* Returns the broadcasts
* @returns {Broadcast[]} - The broadcasts
*/
function getBroadcasts() {
    return _broadcasts;
}
function addBroadcast(broadcast: Broadcast) {
    setBroadcasts([..._broadcasts, broadcast]);
}
function removeBroadcast(broadcastId: string) {
    setBroadcasts(_broadcasts.filter((broadcast) => broadcast.id !== broadcastId));
}
function updateBroadcast(broadcastId: string, updatedBroadcast: Broadcast) {
    setBroadcasts(_broadcasts.map((broadcast) => broadcast.id === broadcastId ? updatedBroadcast : broadcast));
}
function getBroadcast(broadcastId: string) {
    return _broadcasts.find((broadcast) => broadcast.id === broadcastId);
}
function hasBroadcast(broadcastId: string) {
    return _broadcasts.some((broadcast) => broadcast.id === broadcastId);
}

function onUpdateBroadcasts(updatedBroadcasts: {_id: string; _broadcasterIds: string[], _listenerIds: string[], _name: string; }[]) {
  setBroadcasts(updatedBroadcasts.map((broadcast) => ({
    id: broadcast._id,
    name: broadcast._name,
    broadcasterIds: broadcast._broadcasterIds,
    listenerIds: broadcast._listenerIds
  })));
}

function onUpdateBroadcast(updatedBroadcast: {_id: string; _broadcasterIds: string[], _listenerIds: string[], _name: string; }) {
    updateBroadcast(updatedBroadcast._id, {
        id: updatedBroadcast._id,
        name: updatedBroadcast._name,
        broadcasterIds: updatedBroadcast._broadcasterIds,
        listenerIds: updatedBroadcast._listenerIds
    });
    }

function onJoinBroadcast(broadcastId: string) {
    // TODO
}

function onLeaveBroadcast(broadcastId: string) {
    // TODO
}

function onTerminateBroadcast(broadcastId: string) {
  removeBroadcast(broadcastId);
}

function onCreateBroadcast(broadcast: {_id: string; _broadcasterIds: string[], _listenerIds: string[], _name: string; }) {
  addBroadcast({
    id: broadcast._id,
    name: broadcast._name,
    broadcasterIds: broadcast._broadcasterIds,
    listenerIds: broadcast._listenerIds
  });
}

export const BroadcastFunctions = { 
    setBroadcasts,
    getBroadcasts,
    addBroadcast,
    removeBroadcast,
    updateBroadcast,
    getBroadcast,
    hasBroadcast,
}
export const BroadcastEvents = {
    onUpdateBroadcasts,
    onUpdateBroadcast,
    onJoinBroadcast,
    onLeaveBroadcast,
    onTerminateBroadcast,
    onCreateBroadcast
};