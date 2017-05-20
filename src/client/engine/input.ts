import * as inputDevices from './inputDevices';
import * as AssetManager from './assets';

const inputAction: {[action: string]: Array<(value: number)=>void>} = {};
const fireActions = (action: string, value: number) => {inputAction[action].forEach(fn => fn(value));};

interface IInputMapping {
    gamepad?: string|number;
    key?: string|number;
    value: number;
}

interface IInputActionMap {
    [action: string]: IInputMapping;
}

function setupInputMappings(inputActions: IInputActionMap) {
    for(const action in inputActions) {
        if(inputActions[action]) {
            const mapping: IInputMapping = inputActions[action];
            if(mapping.gamepad) {
                // inputDevices.gamepad. SHIT how do I handle this?? whiteboard time
            } else if(mapping.key) {
                inputDevices.keyboard.onKeyEvent(mapping.key, inputDevices.keyboard.KS_PRESSED, () => {
                    fireActions(action, mapping.value);
                });
            }
        }
    }
}

export const mouse = inputDevices.mouse;
export const keyboard = inputDevices.keyboard;
export const gamepad = inputDevices.gamepad;
