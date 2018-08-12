import stream from 'mithril/stream';
import merge from 'deepmerge';
// import Firebase from 'services/Firebase';

const initialState = {
    global: {
        user: null,
    },

    Index: {
        count: 100
    },

    Profiles: {
        count: 200
    }
};

const update = stream();
const model = stream.scan(merge, initialState, update);

const store = {
    global: {
        assignUser(user) {
            return () => update({ 
                global: { user: user } 
            });
        }
    },
};

export { model, store };