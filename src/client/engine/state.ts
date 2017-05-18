import {Get, On} from './assets';

interface IEntity {
    id: string;
    is?: string;
    has?: {[key: string]: IEntity};
    [key: string]: any;
}

const resolveFile = async (file) => {
    const fileData = await Get(`/${file}`);
    const has = fileData.has || [];

    if(fileData.is) {
        const subData = await resolveFile(fileData.is);
        const subHas = subData.has || [];
        Object.assign(fileData, subData, fileData, { has: has.concat(subHas) });
    }

    return fileData;
};

export type FEntityUpdateHandler = (entity: IEntity) => void;

export class State extends Map<string, IEntity> {
    private handlers: {[key: string]: FEntityUpdateHandler[]} = {};

    off(key: string, fn: FEntityUpdateHandler) {
        const handlers = this.handlers[key] = this.handlers[key] || [];
        const idx = handlers.indexOf(fn);
        if(idx === -1) return false;
        handlers.splice(idx, 1);
        return true;
    }

    on(key: string, fn: FEntityUpdateHandler) {
        const handlers = this.handlers[key] = this.handlers[key] || [];
        handlers.push(fn);
    }

    // Make an entity including its templates
    make(key: string): Promise<IEntity> {
        const e = super.get(key);

        return new Promise(async (resolve, reject) => {
            if(!e) reject(e);

            const data = {};

            if(e.is) {
                Object.assign(data, await resolveFile(e.is));
            }

            if(e.)
        });
    }

    set(key: string, entity: IEntity) {
        // ensure
        entity.id = key;
        super.set(entity.id, entity);

        this.fire(key);
        return this;
    }

    delete(key: IEntity | string) {
        if(typeof key === 'object') {
            key = key.id;
        }
        this.fire(key);
        delete this.handlers[key];
        return super.delete(key);
    }

    toJSON() {
        const result = [];

        this.forEach((e, k) => {
            result.push([k, e]);
        });

        return result;
    }

    private fire(key: string) {
        const handlers = this.handlers[key] || [];
        const val = this.get(key);
        handlers.forEach(fn => fn(val));
    }

}
