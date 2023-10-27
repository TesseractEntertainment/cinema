import React from "react";
import { User } from "../util/user";
import { ConnectionFunctions } from "../util/connection";
import socket from "../socket";
import { Dispatcher, DispatcherEvents } from "../util/dispatcher";
import { set } from "mongoose";

function onConnect(userId: string) {
    ConnectionFunctions.createPeerConnection(userId);
}
function onDisconnect(userId: string) {
    ConnectionFunctions.disconnectPeer(userId);
}
function onRequestStream(userId: string) {
    ConnectionFunctions.requestStream(userId);
}
function onStreamTo(userId: string) {
    ConnectionFunctions.streamAudio(userId);
}

export default function UserComp({user, connectionControlls = false}: {user: User, connectionControlls?: boolean}) {
    const [userState, setUser] = React.useState<User>(user);
    // TODO: find better solution
    function setUserStateFromUsers(users: User[]) {
        const user = users.find(user => user.id === userState.id);
        if (user) {
            setUser(user);
        }
    }

    React.useEffect(() => {
        Dispatcher.addListener(DispatcherEvents.SET_USER_STATE, setUserStateFromUsers);
        return () => {
            Dispatcher.removeListener(DispatcherEvents.SET_USER_STATE, setUserStateFromUsers);
        };
    }, [userState.id]);
    return(
        <div key={user.id} className="user-item">
            <span className="user-name">{userState.name}</span>
            {user.id !== socket.id ? 
            <>
                <span className={`connection-state ${userState.connectionState}`}>{userState.connectionState}</span>
                {connectionControlls &&
                (user.connectionState === 'disconnected' ? (
                    <button onClick={() => onConnect(userState.id)}>Connect</button>
                    ) : (
                    <>
                        <button onClick={() => onDisconnect(userState.id)}>Disconnect</button>
                        <button onClick={() => onRequestStream(userState.id)}>Request Stream</button>
                        <button onClick={() => onStreamTo(userState.id)}>Stream To</button>
                    </>
                    )
                )}
                <audio id={`audio-${userState.id}`} controls />
            </> :
            null}
        </div>
    );
}