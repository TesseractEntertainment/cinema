import React from "react";
import Broadcasts from "./BroadcastList";

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <Broadcasts />
        </div>
    );
}

export default Sidebar;