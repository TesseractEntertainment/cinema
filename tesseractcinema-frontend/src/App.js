// src/App.js

import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AudioBroadcast from './components/AudioBroadcast';
import SpatialAudioChat from './components/SpatialAudioChat';

function App() {
    const [page, setPage] = useState('landing');

    return (
        <div>
            {page === 'landing' && <LandingPage joinBroadcast={() => setPage('broadcast')} />}
            {page === 'broadcast' && <AudioBroadcast switchToSpatialChat={() => setPage('spatialChat')} />}
            {page === 'spatialChat' && <SpatialAudioChat />}
        </div>
    );
}

export default App;
