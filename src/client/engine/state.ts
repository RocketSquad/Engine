import {Get, On} from './assets';

interface IEntity {
    id: string;
    is?: string;
    has?: {[key: string]: IEntity};
    [key: string]: any;
}

// Only deep merge has
const resolveFile = async (file) => {
    const fileData = await Get(`/${file}`);
    if(fileData.is) {
        const subData = await resolveFile(fileData.is);
        Object.assign(subData, fileData, {
            has: Object.assign(subData.has, fileData.has)
        });
    }

    return fileData;
};

// Probably needs to be cached so we don't do this all the time
const expandEntity = (e: IEntity) => new Promise(async (resolve, reject) => {
    if(!e) reject(e);

    const data: any = {};

    if(e.is) {
        Object.assign(data, await resolveFile(e.is));
    }

    Object.assign(data, e, {
        has: Object.assign(data.has, e.has)
    });

    // Has haven't had their is expanded
    if(Object.keys(data.has).length > 0) {
        for(const hasKey of Object.keys(data.has)) {
            const hasData = data.has[hasKey];
            data.has[hasKey] = expandEntity(hasData);
        }
    }

    resolve(data);
});

export type FEntityUpdateHandler = (entity: IEntity) => void;

// should be smart enough to do on('key.whatever')
// and wildcards
// should autohandle is updates
// should not handle has updates
// any has should probably be its own State
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
        const entity = super.get(key);

        return expandEntity(entity);
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

        const ret = super.delete(key);

        this.fire(key, true);
        delete this.handlers[key];
        return ret;
    }

    toJSON() {
        const result = [];

        this.forEach((e, k) => {
            result.push([k, e]);
        });

        return result;
    }

    private async fire(key: string, deleted = false) {
        const handlers = this.handlers[key] || [];
        const val = deleted ? undefined : await this.make(key);
        handlers.forEach(fn => fn(val));
    }

}
