import {State, IEntity} from 'common/engine/state';
import {Physics} from 'common/system/oimo-physics';
import {WebGL} from 'client/system/webgl';
import {Controller} from 'client/system/controller';
import {Asset} from 'common/engine/asset';

// State starts ticking ASAP
const state = new State({
    controller: new Controller(),
    physics: new Physics(),
    webgl: new WebGL()
});

// Inform state about it
Asset.watch('content/scene/default.toml', (sceneData: IEntity) => {
    // ignore top level components for now
    if(sceneData.has) {
        Object.keys(sceneData.has).forEach(key => {
            state.load(key, sceneData.has[key]);
        });
    }
});
