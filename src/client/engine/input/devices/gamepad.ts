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
    8: 'select',
    9: 'start',
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

export interface IGamepadSettings {
    deadZone?: number;
}

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

const gamepadSettings: IGamepadSettings = {
    deadZone: 0,
};

const gamepadConnectedEvents: Array<(gamepad: GamepadEventer)=>void> = [];
const gamepadDisonnectedEvents: Array<(gamepad: GamepadEventer)=>void> = [];

const gamepadEventerTemplate: GamepadEventMap = {};

export class GamepadEventer {
    gamepad: Gamepad;
    gamepadEvents: GamepadEventMap;

    constructor(gamepad: Gamepad) {
        this.gamepad = gamepad;
        this.gamepadEvents = new GamepadEventMap();
        for(const event in gamepadEventerTemplate) {
            if(gamepadEventerTemplate[event]) {
                console.log('added input mapping for ' + event);
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

function tick() {
    requestAnimationFrame(tick);

    // Handle gamepads
    const gpds = navigator.getGamepads();

    for(let i = 0; i < gpds.length; ++i) {
        const gamepadEventer = rawGamepadEventers[i];
        if(gamepadEventer) {
            const gp = gamepadEventer.gamepad;
            for(let a = 0; a < gp.axes.length; ++a) {
                if(Math.abs(gp.axes[a]) > gamepadSettings.deadZone) {
                    FireGamepadEvents(gamepadEventer, 'axis'+a, gp.axes[a]);
                }
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

export function addTemplateHandler(event: string, handler: (value: number) => void) {
    if(gamepadEventerTemplate[event] === undefined) gamepadEventerTemplate[event] = new GamepadEventSets();
    gamepadEventerTemplate[event].onPressed.push(handler);
}

export function setGamepadSettings(settings: IGamepadSettings) {
    for(const prop in settings) if(settings[prop]) gamepadSettings[prop] = settings[prop];
}