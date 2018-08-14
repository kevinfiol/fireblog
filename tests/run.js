import o from 'mithril/ospec';
import stream from 'mithril/stream';
import merge from 'deepmerge';
import Global from '../src/mutators/Global';
import Firebase from '../src/services/Firebase';

o.spec('Global Mutators: ', () => {
    const initialState = {
        global: { user: null }
    };

    const update = stream();
    const model = stream.scan(merge, initialState, update);
    const mutators = Global(update);

    o('Global.assignUser', () => {
        mutators.assignUser('kevin')();
        o( model().global.user ).equals('kevin');
    });
});

o.run();