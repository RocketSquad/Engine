import * as test from 'tape';
import GridTree from './gridtree';

class Network {
    handlers: any;
    remote: Network;
    MessageType: any;
    constructor() {
        this.handlers = {};
        this.MessageType = {
            TREE: 0
        };
    }

    bind(network:Network) {
        this.remote = network;
    }


    get(msg) {
        Object.keys(this.handlers).forEach(key => {
            this.handlers[key](msg);
        });
    }

    send(msg) {
        this.remote.get(msg);
    }

    addHandler(name, handler) {
        this.handlers[name] = handler;
    }

    removeHandler(name) {
        delete this.handlers[name];
    }
}

test('Grid Tree even works', (t) => {
    t.plan(3);
    const g1 = new GridTree();
    const n1 = new Network();
    const g2 = new GridTree();
    const n2 = new Network();

    n1.bind(n2);
    n2.bind(n1);

    g1.startNetwork(n1);
    g2.startNetwork(n2);

    g1.Add(1, true);
    g1.Sync();

    t.equal(g1.children[1], g2.children[1]);

    g2.Add(2, true);
    g2.Sync();

    t.equal(g1.children[2], g2.children[2]);

    g2.Remove(1);
    g2.Sync();

    t.equal(g1.children[1], g2.children[1]);
});



test('Grid Tree deep nesting', (t) => {
    t.plan(4);

    const data = {
        children: {
            '1': {
                children: {
                    '2': true
                }
            }
        }
    };

    const n1 = new Network();
    const g1 = new GridTree();
    g1.noSync = true;
    g1.FromJSON(data);

    const n2 = new Network();
    const g2 = new GridTree();
    g2.noSync = true;
    g2.FromJSON(data);
    
    t.equal(g1.c[1].c[2], g2.c[1].c[2]);

    n1.bind(n2);
    n2.bind(n1);

    g1.noSync = false;
    g2.noSync = false;
    g1.startNetwork(n1);
    g2.startNetwork(n2);

    g1.c[1].Remove(2);
    g1.Sync();

    t.equal(g1.c[1].c[2], g2.c[1].c[2]);

    g2.c[1].Add(5, true);
    g2.Sync();

    t.equal(g1.c[1].c[5], g2.c[1].c[5]);

    g2.c[1].Add(1, new GridTree());
    g2.c[1].c[1].Add(1, true);
    g2.Sync();

    t.equal(g1.c[1].c[1].c[1], g2.c[1].c[1].c[1], "Adding a new JTree should be ok");
});
