"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assets_1 = require("./assets");
// should be smart enough to do on('key.whatever')
// and wildcards
// should autohandle is updates
// should not handle has updates
// any has should probably be its own State
class State {
    constructor() {
        this.handlers = {};
        this.map = new Map();
    }
    off(key, fn) {
        const handlers = this.handlers[key] = this.handlers[key] || [];
        const idx = handlers.indexOf(fn);
        if (idx === -1)
            return false;
        handlers.splice(idx, 1);
        return true;
    }
    // needs to handle the IS chain
    on(key, fn) {
        const handlers = this.handlers[key] = this.handlers[key] || [];
        handlers.push(fn);
    }
    async watch(key, fn) {
        this.on(key, fn);
        fn(await this.get(key));
    }
    get(key) {
        return this.expandEntity(this.map.get(key));
    }
    // Make an entity including its templates
    raw(key) {
        return this.map.get(key);
    }
    async set(key, entity) {
        // ensure
        entity.id = key;
        this.map.set(entity.id, entity);
        const exEntity = await this.get(entity.id);
        if (exEntity.has && Object.keys(exEntity.has).length > 0) {
            Object.keys(exEntity.has).forEach(hasKey => {
                // ensure key set
                this.set(`${key}.${hasKey}`, exEntity.has[hasKey]);
            });
        }
        if (entity.is) {
            assets_1.On(entity.is, async () => {
                console.log('Template update', entity.is);
                this.fire(key);
            });
        }
        this.fire(key);
        return exEntity;
    }
    delete(key) {
        if (typeof key === 'object') {
            key = key.id;
        }
        const data = this.raw(key);
        if (data && data.has && Object.keys(data.has).length > 0) {
            Object.keys(data.has).forEach(hasKey => this.delete(`${key}.${hasKey}`));
        }
        const ret = this.map.delete(key);
        this.fire(key, true);
        delete this.handlers[key];
        return ret;
    }
    toJSON() {
        const result = [];
        this.map.forEach((e, k) => {
            result.push([k, e]);
        });
        return result;
    }
    async fire(key, deleted = false) {
        const handlers = this.handlers[key] || [];
        const val = deleted ? undefined : await this.get(key);
        console.log('firing', key);
        handlers.forEach(fn => fn(val));
    }
    // Probably needs to be cached so we don't do this all the time
    expandEntity(e, expand = false) {
        return new Promise(async (resolve, reject) => {
            if (!e)
                reject(e);
            const data = { has: {} };
            if (e.is) {
                // Get handles resolving is's
                Object.assign(data, await assets_1.Get(e.is), { is: undefined });
            }
            Object.assign(data, e, {
                has: Object.assign(data.has, e.has)
            });
            resolve(data);
        });
    }
}
exports.State = State;
