import stream from 'mithril/stream';
// import merge from 'deepmerge';

const initialState = {
    global: {
        userData: null,
        firebaseUser: null,
        isLoading: false,
        signUpMsg: null,
        signInMsg: null,
        showSignUp: false,
        showSignIn: false,
        queue: []
    },

    profile: {
        user: null,
    }
};

const update = stream();
const model = stream.scan((x, f) => f(x), initialState, update);
// const model = stream.scan(merge, initialState, update);

export { update, model, initialState };