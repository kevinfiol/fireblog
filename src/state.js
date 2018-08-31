import stream from 'mithril/stream';
import merge from 'deepmerge';

const initialState = {
    global: {
        userData: { uid: null, username: null, photoURL: null },
        firebaseUser: null,
        isLoading: false,
        signUpMsg: null,
        signInMsg: null,
        showSignUp: false,
        showSignIn: false 
    },

    profile: {
        user: null,
    }
};

const update = stream();
const model = stream.scan(merge, initialState, update);

export { update, model, initialState };