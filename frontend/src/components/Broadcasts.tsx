import React from "react";
import { Broadcast } from "../util/interfaces";
import { Dispatcher, DispatcherEvent } from "../util/dispatcher";

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
                <li key={broadcast.roomId}>
                    <h3>{broadcast.name}</h3>
                    <p><strong>Room ID:</strong> {broadcast.roomId}</p>
                    <p><strong>Broadcasters:</strong> {broadcast.broadcasters.map(user => user.name).join(', ')}</p>
                    <p><strong>Listeners:</strong> {broadcast.listeners.map(user => user.name).join(', ')}</p>
                </li>
            ))}
        </ul>
        : <p>No Broadcasts</p>}
        </>
    );
}
