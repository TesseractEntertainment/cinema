// src/components/AudioBroadcast.js

import React from 'react';

function AudioBroadcast(props) {
    return (
        <div>
            <h1>Audio Broadcast</h1>
            <audio controls>
                {/* Your audio stream source here */}
            </audio>
            <button onClick={props.switchToSpatialChat}>Switch to Spatial Chat</button>
        </div>
    );
}

export default AudioBroadcast;
