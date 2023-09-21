// src/components/LandingPage.js

import React from 'react';

function LandingPage(props) {
    return (
        <div>
            <h1>Welcome to TesseractCinema</h1>
            <button onClick={props.joinBroadcast}>Join Broadcast</button>
        </div>
    );
}

export default LandingPage;
