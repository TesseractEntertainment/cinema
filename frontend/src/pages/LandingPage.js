import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div>
            <h1>Welcome to TesseractCinema</h1>
            <p>Select an option below:</p>
            <Link to="/broadcaster">
                <button>Broadcast Audio</button>
            </Link>
            <Link to="/listener">
                <button>Listen to Broadcast</button>
            </Link>
        </div>
    );
}

export default LandingPage;
