import React from "react";
import { Link } from 'react-router-dom';
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
        <div className="broadcast-list-container">
        <h2>Broadcasts</h2>
        <div className="broadcast-list">
            {broadcasts && broadcasts.length > 0 ?
            <ul className="broadcast-list-items">
                {broadcasts.map((broadcast) => (
                    <Link to={`/broadcast/${broadcast.id}`} key={broadcast.id}>
                        <li key={broadcast.id}>
                            <h3>{broadcast.name}</h3>
                            <p><strong>Room ID:</strong> {broadcast.id}</p>
                            <p><strong>Broadcasters:</strong> {broadcast.broadcasterIds.map(userId => UserFunctions.getUser(userId)?.name).join(', ')}</p>
                            <p><strong>Listeners:</strong> {broadcast.listenerIds.map(userId => UserFunctions.getUser(userId)?.name).join(', ')}</p>
                        </li>
                    </Link>
                ))}
            </ul>
            : <p>No Broadcasts</p>}
            <Link to="/create-broadcast"><button>Create New Broadcast</button></Link>
        </div>
        </div>
    );
}
