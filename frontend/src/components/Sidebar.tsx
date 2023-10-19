import React from "react";
import Broadcasts from "./BroadcastList";

const Sidebar: React.FC = () => {
    return (
        <div className="sb-container">
            <Broadcasts />
        </div>
    );
}

export default Sidebar;