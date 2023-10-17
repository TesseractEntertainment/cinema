import React from "react";
import { Broadcast } from "../util/broadcast";
import { Dispatcher, DispatcherEvent } from "../util/dispatcher";
import { UserFunctions } from "../util/user";

export default function Broadcasts() {
    const [broadcasts, setBroadcasts] = React.useState<Broadcast[]>([]);
    React.useEffect(() => {
        Dispatcher.addListener(DispatcherEvent.SET_BROADCAST_STATE, setBroadcasts);
        return () => {
            Dispatcher.removeListener(DispatcherEvent.SET_BROADCAST_STATE, setBroadcasts);
        }
    }, []);
    return (
        <>
        <h2>Broadcasts</h2>
        {broadcasts && broadcasts.length > 0 ?
        <ul>
            {broadcasts.map((broadcast) => (
                <li key={broadcast.id}>
                    <h3>{broadcast.name}</h3>
                    <p><strong>Room ID:</strong> {broadcast.id}</p>
                    <p><strong>Broadcasters:</strong> {broadcast.broadcasterIds.map(userId => UserFunctions.getUser(userId)?.name).join(', ')}</p>
                    <p><strong>Listeners:</strong> {broadcast.listenerIds.map(userId => UserFunctions.getUser(userId)?.name).join(', ')}</p>
                </li>
            ))}
        </ul>
        : <p>No Broadcasts</p>}
        </>
    );
}
