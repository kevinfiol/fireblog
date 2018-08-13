import stream from 'mithril/stream';
import merge from 'deepmerge';
import Firebase from 'services/Firebase';

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

update.map(v => console.log(v));

const store = {
    global: {
        assignUser(user) {
            return () => update({ 
                global: { user: user } 
            });
        },

        createUser(email, pwd) {
            return () => {
                Firebase.createUser(email, pwd)
                    .then(res => console.log('the response', res))
                    .then(() => {
                        update({
                            global: { user: email }
                        })
                    })
                ;
            };
        }
    },
};

export { model, store };