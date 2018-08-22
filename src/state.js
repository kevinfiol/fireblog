import stream from 'mithril/stream';
import merge from 'deepmerge';

const initialState = {
    global: {
        user: null,
        isLoading: false,
        signUpMsg: null,
        signInMsg: null,
        showSignUp: false,
        showSignIn: false 
    }
};

const update = stream();
const model = stream.scan(merge, initialState, update);

export { update, model, initialState };