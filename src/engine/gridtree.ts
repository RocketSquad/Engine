import { JoshuaTree } from './joshuatree';
import * as uuid from 'uuid';

interface TreeUpdate {
    add: boolean;
    location: number[];
    payload?: any;
}

interface Remote {
    send(msgs: any);
}

export default class GridTree extends JoshuaTree {
    id: string;
    messages: TreeUpdate[];
    parent: GridTree;
    net: any;
    noSync: boolean;

    constructor() {
        super();

        if(!this.parent) {
            this.messages = [];
        }
    }
    
    get c() {
        return this.children;
    }

    startNetwork(network: any) {
        this.net = network;
        this.id = uuid.v4();
        this.net.addHandler(this.id, (msg) => {
            if(msg.type === this.net.MessageType.TREE) {
                msg.payload.forEach((msg: TreeUpdate) => {
                    this.onMessage(msg);
                })
            }
        });
    }

    stopNetwork() {
        this.net.removeHandler(this.id);
    }

    onMessage(msg: TreeUpdate) {
        const loc = msg.location.shift();
        
        if(msg.location.length > 0) {
            this.children[loc].onMessage(msg);
        } 
        else {
            if(msg.add) {
                const child = msg.payload.children ? new GridTree().FromJSON(msg.payload, GridTree) : msg.payload;
                super.Add(loc, child);
            } else {
                super.Remove(loc);
            }
        }
    }

    AddMessage(msg: TreeUpdate) {
        if(this.noSync) {
            return;
        }

        if(this.parent) {
            msg.location.unshift(this.key);
            this.parent.AddMessage(msg);
        }
        else {
            this.messages.push(msg);
        }
    }

    Remove(key: number): boolean {
        this.AddMessage({
            add: false,
            location: [key]
        });

        return super.Remove(key);
    }

    Add(key: number, child: JoshuaTree | any, force?: boolean): boolean {
        this.AddMessage({
            add: true,
            location: [key],
            payload: child
        });

        return super.Add(key, child, force);
    }

    FromJSON(json: any, treeClass: any = GridTree): JoshuaTree {
        return super.FromJSON(json, treeClass);
    }

    Sync() {
        if(!this.parent && this.net) {
            this.net.send({
                type: this.net.MessageType.TREE,
                payload: this.messages
            });

            this.messages = [];
        }
    }
}