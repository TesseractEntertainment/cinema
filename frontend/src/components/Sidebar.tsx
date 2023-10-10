import React from "react";
import { Broadcast } from "../util/interfaces";

interface SidebarProps {
    broadcasts?: Broadcast[];
}

const Sidebar: React.FC<SidebarProps> = ({ broadcasts }) => {
    return (
        <div className="sidebar">
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
        </div>
    );
}

export default Sidebar;