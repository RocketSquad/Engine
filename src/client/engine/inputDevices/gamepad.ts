/**
 * Handles input events from the gamepad,
 *  and sending the connected/disconnected events.
 */

const GamepadButtonLookup = {
    0: 'a',
    1: 'b',
    2: 'x',
    3: 'y',
    4: 'l1',
    5: 'r1',
    6: 'l2',
    7: 'r2',
    10: 'l3',
    11: 'r3',
    12: 'dup',
    13: 'ddown',
    14: 'dleft',
    15: 'dright',
};

const rawGamepads: Gamepad[] = [];
const rawGamepadEventers: GamepadEventer[] = [];

window.addEventListener('gamepadconnected', e => {
    const index = (e as any).gamepad.index;
    const gamepad = navigator.getGamepads()[index];
    rawGamepads[index] = gamepad;
    rawGamepadEventers[index] = new GamepadEventer(gamepad);

    console.log("connection event for " + index);
});

window.addEventListener('gamepaddisconnected', e => {
    const index = (e as any).gamepad.index;
    delete rawGamepads[index];
    delete rawGamepadEventers[index];

    console.log("disconnection event for " + index);
});

class GamepadEventSets {
    onPressed: Array<(value: number) => void>;

    constructor() {
        this.onPressed = [];
    }

    copy(source: GamepadEventSets) {
        this.onPressed = [];
        for(const event of source.onPressed) this.onPressed.push(event);
        return this;
    }
}

class GamepadEventMap {
    [key: string]: GamepadEventSets
}

const gamepadConnectedEvents: Array<(gamepad: GamepadEventer)=>void> = [];
const gamepadDisonnectedEvents: Array<(gamepad: GamepadEventer)=>void> = [];

const gamepadEventerTemplate: GamepadEventMap = {};

export class GamepadEventer {
    gamepad: Gamepad;
    gamepadEvents: GamepadEventMap;

    constructor(gamepad: Gamepad) {
        this.gamepadEvents = new GamepadEventMap();
        for(const event in gamepadEventerTemplate) {
            if(gamepadEventerTemplate[event]) {
                this.gamepadEvents[event] = new GamepadEventSets().copy(gamepadEventerTemplate[event]);
            }
        }
    }

    // Handle buttons, axes, analog triggers, etc
    // maybe can take which gamepadId to listen to, and generate a closure to filter by that id?
    // is there a more efficient way to do that than filtering every event? Like storing in a sparse array?
    on(eventType: string | number, handler: (value: number) => void) {
        const lookUp = GamepadButtonLookup[eventType] || (eventType as string).toLowerCase();
        this.gamepadEvents[lookUp].onPressed.push(handler);
    }
}

function FireGamepadEvents(gamepad: GamepadEventer, button: string | number, value: number) {
    const eventMap = gamepad.gamepadEvents;
    if(eventMap[button]) {
        let eventSet;
        eventSet = eventMap[button].onPressed;
        eventSet.forEach(func => func(value));
    }
}

const gamepadEventers: GamepadEventer[] = [];

function tick() {
    requestAnimationFrame(tick);

    // Handle gamepads
    const gpds = navigator.getGamepads();

    for(const gamepadEventer of gamepadEventers) {
        if(gamepadEventer) {
            const gp = gamepadEventer.gamepad;
            for(let a = 0; a < gp.axes.length; ++a) {
                FireGamepadEvents(gamepadEventer, 'axis'+a, gp.axes[a]);
            }
            for(let b = 0; b < gp.buttons.length; ++b) {
                const button = gp.buttons[b];
                FireGamepadEvents(gamepadEventer, b, button.value !== undefined ? button.value : (button.pressed?1:0));
            }
        }
    }
}

tick();

export function onGamepadConnected(handler: (gamepad: GamepadEventer) => void) {
    return gamepadConnectedEvents.push(handler);
}

export function offGamepadConnected(handlerId: number) {
    delete gamepadConnectedEvents[handlerId];
}

export function onGamepadDisconnected(handler: (gamepad: GamepadEventer) => void) {
    return gamepadDisonnectedEvents.push(handler);
}

export function offGamepadDisconnected(handlerId: number) {
    delete gamepadDisonnectedEvents[handlerId];
}
