import * as inputDevices from './inputDevices';
import {IGamepadSettings} from './inputDevices/gamepad';
import * as AssetManager from './assets';

const inputActions: {[action: string]: Array<(value: number)=>void>} = {};
const fireActions = (action: string, value: number) => {inputActions[action].forEach(fn => fn(value));};

interface IInputMapping {
    gamepad?: string;
    key?: string|number;
    amount: number;
}

interface IInputActionMap {
    gamepadSettings: IGamepadSettings;
    actions: {[action: string]: IInputMapping[]};
}

function setupInputMappings(inputActionMap: IInputActionMap) {
    console.log('mapping ' + JSON.stringify(inputActionMap));

    inputDevices.gamepad.setGamepadSettings(inputActionMap.gamepadSettings);
    for(const action in inputActionMap.actions) {
        if(inputActionMap.actions[action]) {
            for(const mapping of inputActionMap.actions[action]) {
                if(mapping.gamepad) {
                    const gp = inputDevices.gamepad;
                    gp.addTemplateHandler(mapping.gamepad, value => {fireActions(action, mapping.amount * value);});
                } else if(mapping.key) {
                    console.log(`mapping ${mapping.key} with value ${mapping.amount}`);
                    inputDevices.keyboard.onKeyEvent(mapping.key, inputDevices.keyboard.KS_PRESSED, () => {
                        fireActions(action, mapping.amount);
                    });
                }
            }
        }
    }
}

AssetManager.Get('../content/systems/input.toml').then(setupInputMappings);

export function on(actionName: string, handler: (value: number)=>void) {
    if(inputActions[actionName] === undefined) inputActions[actionName] = [];
    return inputActions[actionName].push(handler);
}

export function off(actionName: string, handlerId: number) {
    delete inputActions[actionName][handlerId];
}

export const mouse = inputDevices.mouse;
export const keyboard = inputDevices.keyboard;
export const gamepad = inputDevices.gamepad;
