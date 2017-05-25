import {Devices} from './devices';
import {IGamepadSettings} from './devices/gamepad';
import {Asset} from 'common/engine/asset';

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
    Devices.gamepad.setGamepadSettings(inputActionMap.gamepadSettings);
    for(const action in inputActionMap.actions) {
        if(inputActionMap.actions[action]) {
            for(const mapping of inputActionMap.actions[action]) {
                if(mapping.gamepad) {
                    const gp = Devices.gamepad;
                    gp.addTemplateHandler(mapping.gamepad, value => {fireActions(action, mapping.amount * value);});
                } else if(mapping.key) {
                    Devices.keyboard.onKeyEvent(mapping.key, Devices.keyboard.KS_PRESSED, () => {
                        fireActions(action, mapping.amount);
                    });
                }
            }
        }
    }
}

Asset.get('../content/systems/input.toml').then(setupInputMappings);

// Probably dont' want on/off
export const Input = {
    on(actionName: string, handler: (value: number)=>void) {
        if(inputActions[actionName] === undefined) inputActions[actionName] = [];
        return inputActions[actionName].push(handler);
    },
    off(actionName: string, handlerId: number) {
        delete inputActions[actionName][handlerId];
    },
    ...Devices
};
