/**
 * Handles input events from the gamepad,
 *  and sending the connected/disconnected events.
 */

export const gamepads: Gamepad[] = [];

window.addEventListener('gamepadconnected', e => {
    const index = (e as any).gamepad.index;
    const gamepad = navigator.getGamepads()[index];
    gamepads[index] = gamepad;

    console.log("connection event for " + index);
});

window.addEventListener('gamepaddisconnected', e => {
    const index = (e as any).gamepad.index;
    delete gamepads[index];

    console.log("disconnection event for " + index);
});

class GamepadEventSets {
    onPressed: Array<(gamepadId: number, value: number) => void>;

    constructor() {
        this.onPressed = [];
    }
}

declare class GamepadEventMap { [key: string]: GamepadEventSets }

// [TODO] decide if I should mash axis and buttons into the same map
const gamepadButtonEvents: GamepadEventMap = {};
const gamepadAxesEvents: GamepadEventMap = {};
const gamepadConnectedEvents: Array<(gamepadId: number)=>void> = [];
const gamepadDisonnectedEvents: Array<(gamepadId: number)=>void> = [];


function FireGamepadEvents(eventMap: GamepadEventMap,
                           gamepadId: number,
                           button: string | number,
                           value: number) {
    if(eventMap[button]) {
        let eventSet;
        eventSet = eventMap[button].onPressed;
        eventSet.forEach(func => func(gamepadId, value));
    }
}

function tick() {
    requestAnimationFrame(tick);

    // Handle gamepads
    const gpds = navigator.getGamepads();
    for(let i = 0; i < gpds.length; ++i) {
        if(gpds[i]) {
            for(let a = 0; a < gpds[i].axes.length; ++a) {
                FireGamepadEvents(gamepadAxesEvents, i, a, gpds[i].axes[a]);
            }
            for(let b = 0; b < gpds[i].buttons.length; ++b) {
                const button = gpds[i].buttons[b];
                FireGamepadEvents(gamepadButtonEvents, i, b,
                                button.value !== undefined ? button.value : (button.pressed?1:0));
            }
        }
    }
}

tick();

export function onGamepadConnected(handler: (gamepadId: number) => void) {
    return gamepadConnectedEvents.push(handler);
}

export function offGamepadConnected(handlerId: number) {
    delete gamepadConnectedEvents[handlerId];
}

export function onGamepadDisconnected(handler: (gamepadId: number) => void) {
    return gamepadDisonnectedEvents.push(handler);
}

export function offGamepadDisconnected(handlerId: number) {
    delete gamepadDisonnectedEvents[handlerId];
}

// Handle buttons, axes, analog triggers, etc
// maybe can take which gamepadId to listen to, and generate a closure to filter by that id?
// is there a more efficient way to do that than filtering every event? Like storing in a sparse array?
export function onGamepadInputEvent(gamepadId: number, eventType: string | number, handler: (value: number) => void) {
    // parse event type (axes/button)
    if(typeof eventType === "string") {
        // Axis mapping, or string button name to index mapping
        if(eventType.substr(0, 4) === "axis") {
            const axisNum = eventType.slice(4);
            gamepadAxesEvents.onPressed[axisNum].push((gpId: number, value: number)=> {
                if(gpId === gamepadId) handler(value);
            });
        } else {
            // [TODO] Do button to index mapping
        }
    } else {
        // Raw button index mapping
        const buttonId: number = eventType;
        gamepadButtonEvents.onPressed[buttonId].push((gpId: number, value: number)=> {
            if(gpId === gamepadId) handler(value);
        });
    }
}
