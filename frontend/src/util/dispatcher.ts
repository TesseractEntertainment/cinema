
interface Dispatcher {
    addListener(event: string, callback: Function): void;
    removeListener(event: string, callback: Function): void;
    dispatch(event: string, details: any): void;
    withTimeout(onSuccess: Function, onTimeout: Function, timeout: number): Function;
}

/*
* The events that can be dispatched
* @enum {string}
* you can add more events here
* or you can use strings directly in the code
*/
export enum DispatcherEvent {
    SET_USER_STATE = 'set-user-state',
    SET_CONNECTION_STATE = 'set-connection-state',
    SET_BROADCAST_STATE = 'set-broadcast-state'
}

const events: Map<string, Function[]> = new Map();

/*
* Adds a listener to an event
* @param {string} event - The event name
* @param {Function} callback - The callback function
*/
function addListener (event: string, callback: Function) {
    // Check if the callback is not a function
    if (typeof callback !== 'function') {
        console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
        return false;
    }    // Check if the event is not a string
    if (typeof event !== 'string') {
        console.error(`The event name must be a string, the given type is ${typeof event}`);
        return false;
    }
        
    // Create the event if not exists
    if (!events.has(event)) {
        events.set(event, []);
    }
        
    events.get(event)!.push(callback);
}

/*
* Removes a listener from an event
* @param {string} event - The event name
* @param {Function} callback - The callback function
*/
function removeListener (event: string, callback: Function) {
    // Check if this event not exists
    if (!events.has(event)) {
        console.error(`This event: ${event} does not exist`);
        return false;
    }
        
    events.set(event, events.get(event)!.filter(listener => {
        return listener.toString() !== callback.toString(); 
    }));
}

/*
* Dispatches an event
* @param {string} event - The event name
* @param {any} details - The event details
*/
function dispatch (event: string, details: any) {
    // Check if this event not exists
    if (!events.has(event)) {
        console.error(`This event: ${event} does not exist`);
        return false;
    }   events.get(event)!.forEach((listener) => {
        listener(details);
    });
    console.log(`Dispatched event: ${event}`);
    console.log(details);
}

// TODO:?
const withTimeout = (onSuccess: Function, onTimeout: Function, timeout: number) => {
    let called = false;
  
    const timer = setTimeout(() => {
      if (called) return;
      called = true;
      onTimeout();
    }, timeout);
  
    return (...args: any[]) => {
      if (called) return;
      called = true;
      clearTimeout(timer);
      onSuccess.apply(this, args);
    }
  }

/*
* A simple event dispatcher
*/
export const Dispatcher: Dispatcher = {
    addListener,
    removeListener,
    dispatch,
    withTimeout,
};
