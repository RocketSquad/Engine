/**
 * Handle input events from the keyboard,
 *  specifically key trigger/press/release events.
 *  Also expose raw input array for convenience.
 */

// Key state enum
export const KS_TRIGGERED = 0;
export const KS_PRESSED = 1;
export const KS_RELEASED = 2;

const KeyLookUp = {
    13: 'enter',
    8: 'backspace',
    9: 'tab',
    17: 'ctrl',
    18: 'alt',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space'
};

export const rawKeys: {[key: string]: boolean} = {};

class EventSets {
    onPressed: Array<() => void>;
    onTriggered: Array<() => void>;
    onReleased: Array<() => void>;

    allSets: Array<Array<() => void>>;

    constructor() {
        this.onTriggered = [];
        this.onPressed = [];
        this.onReleased = [];

        this.allSets = [this.onTriggered, this.onPressed, this.onReleased];
    }
}

const keyEvents: { [key: string]: EventSets } = {};

function fireKeyEvents(key: string | number, keyState: number) {
    if(keyEvents[key]) {
        keyEvents[key].allSets[keyState].forEach(func => func());
    }
}

export function onKeyEvent(key: string | number, keyState: number, fn: () => void) {
    // [TODO] figure out how to assert that keyState is valid KS_ enum
    return keyEvents[key].allSets[keyState].push(fn);
}

export function offKeyEvent(key: string | number, keyState: number, handlerId: number) {
    delete keyEvents[key].allSets[keyState][handlerId];
}

function tick() {
    requestAnimationFrame(tick);

    // Handle continuous key firing
    for(const key in rawKeys) {
        if(rawKeys[key]) {
            fireKeyEvents(key, KS_PRESSED);
        }
    }
}
tick();

window.addEventListener('blur', (e) => {
    Object.keys(rawKeys).forEach( (k) => {
        rawKeys[k] = false;
    });
});

document.addEventListener('keyup', (e) => {
    const lookUp = KeyLookUp[e.keyCode] || e.key.toLowerCase();

    rawKeys[e.keyCode] = false;
    rawKeys[lookUp] = false;
    fireKeyEvents(e.keyCode, KS_RELEASED);
    fireKeyEvents(lookUp, KS_RELEASED);
});

document.addEventListener('keydown', (e) => {
    const lookUp = KeyLookUp[e.keyCode] || e.key.toLowerCase();

    rawKeys[e.keyCode] = true;
    rawKeys[lookUp] = true;
    fireKeyEvents(e.keyCode, KS_TRIGGERED);
    fireKeyEvents(lookUp, KS_TRIGGERED);
});
