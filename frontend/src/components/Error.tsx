import React, { useState, useEffect} from 'react';
import '../styles/layout.css';
import { Dispatcher, DispatcherEvents } from '../util/dispatcher';

const ErrorComponent: React.FC = () => {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [duration, setDuration] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        Dispatcher.addListener(DispatcherEvents.SET_ERROR_MESSAGE_STATE, (message: string, duration: number = 5000, show: boolean = true) => {
            setMessage(message);
            setDuration(duration);
            setShow(show);
            setCount(count + 1);
        });
        Dispatcher.addListener(DispatcherEvents.SET_SHOW_ERROR, (show: boolean, duration: number = 5000) => {
            setDuration(duration);
            setShow(show);
        });
        if (duration <= 0) {
            return;
        }
        const timer = setTimeout(() => {
            setShow(false);
            setCount(0);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, show, message, count]);
  return (
    <>
    {show &&
    <div className="error-box">
        <pre style={{display: 'inline'}} className="error-message">{message}</pre>{count > 1 && <span className="error-count">{count}</span>}
        
    </div>}
    </>
  );
};

export default ErrorComponent;
