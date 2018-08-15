import stream from 'mithril/stream';
import Global from 'mutators/Global';
import merge from 'deepmerge';

const initialState = {
    global: { user: null, signUpMsg: null, showSignUp: false },
};

const update = stream();
const model = stream.scan(merge, initialState, update);
const mutators = { global: Global(update) };

update.map(v => console.log('update: ', v));

export { model, mutators };