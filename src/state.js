import stream from 'mithril/stream';
import merge from 'deepmerge';

const initialState = {
    global: {
        user: null,
        signUpMsg: null,
        signInMsg: null,
        showSignUp: false,
        showSignIn: false 
    }
};

const update = stream();
const model = stream.scan(merge, initialState, update);
update.map(v => console.log(v));

export { update, model, initialState };